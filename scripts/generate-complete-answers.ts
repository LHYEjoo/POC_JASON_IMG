// Script to pregenerate complete AI answers for all suggested questions
// - For each question, runs RAG pipeline (search → AI answer)
// - Splits answer into bursts
// - Generates TTS audio for each burst
// - Uploads audio files to Supabase Storage
// - Stores complete preprompts in Supabase database

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { QUESTION_POOL_RAW, type Language } from '../src/config/suggestedQuestions';
import { getPreprompt } from '../src/config/prompt';

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

const OPENAI_API_KEY = requireEnv('OPENAI_API_KEY');
const ELEVENLABS_API_KEY = requireEnv('ELEVENLABS_API_KEY');
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'UgBBYS2sOqTuMpoF3BR0';
const SUPABASE_URL = requireEnv('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
const PROJECT_ID = process.env.PROJECT_ID || null;
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'text-embedding-3-small';

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Split text into bursts (similar to splitIntoBursts in DigitalShadow.tsx)
function splitIntoBursts(text: string, maxBursts: number = 3): string[] {
  // Remove trailing periods for SMS-style
  let cleaned = text.replace(/\.+$/g, '');
  
  // Split by sentence boundaries (period, exclamation, question mark)
  const sentences = cleaned.split(/([.!?]+[\s\n]+)/).filter(s => s.trim().length > 0);
  
  if (sentences.length === 0) return [cleaned];
  
  // Group sentences into bursts
  const bursts: string[] = [];
  const sentencesPerBurst = Math.ceil(sentences.length / maxBursts);
  
  for (let i = 0; i < sentences.length; i += sentencesPerBurst) {
    const burst = sentences.slice(i, i + sentencesPerBurst).join('').trim();
    if (burst.length > 0) {
      bursts.push(burst);
    }
  }
  
  return bursts.length > 0 ? bursts : [cleaned];
}

// Build RAG prompt (similar to buildHenryRAGPrompt)
function buildHenryRAGPrompt(question: string, chunks: Array<{ content: string }>, lang: Language) {
  const preprompt = getPreprompt(lang);
  
  const rules = lang === 'nl' ? `
═══════════════════════════════════════════════════════════════
REGELS VOOR HET BEANTWOORDEN VAN VRAGEN
═══════════════════════════════════════════════════════════════

1. Je bent Henry, een Hongkongse vluchteling die in 2019 naar Taiwan is gevlucht na de protesten.
2. Je spreekt kort, direct en persoonlijk - zoals je normaal zou sms'en.
3. Maximum 3-4 zinnen per antwoord.
4. Geen punten aan het einde van zinnen (zoals normaal sms-gedrag).
5. Gebruik de bronnen hieronder om je antwoord te informeren, maar blijf authentiek en persoonlijk.
6. Als de bronnen niet relevant zijn, zeg dat je het niet zeker weet of niet de juiste persoon bent om dat te beantwoorden.
` : `
═══════════════════════════════════════════════════════════════
RULES FOR ANSWERING QUESTIONS
═══════════════════════════════════════════════════════════════

1. You are Henry, a Hong Kong refugee who fled to Taiwan in 2019 after the protests.
2. You speak briefly, directly and personally - like you would normally text.
3. Maximum 3-4 sentences per answer.
4. No periods at the end of sentences (like normal texting behavior).
5. Use the sources below to inform your answer, but stay authentic and personal.
6. If the sources are not relevant, say you're not sure or not the right person to answer that.
`;

  const sourcesText = chunks.length > 0
    ? chunks.map((chunk, i) => `[${i + 1}] ${chunk.content}`).join('\n\n')
    : lang === 'nl' ? 'Geen relevante bronnen gevonden.' : 'No relevant sources found.';

  const sys = `${preprompt}\n\n${rules}`;
  
  const user = lang === 'nl'
    ? `Vraag: ${question}\n\nBronnen:\n${sourcesText}\n\nBeantwoord de vraag op basis van de bronnen hierboven.`
    : `Question: ${question}\n\nSources:\n${sourcesText}\n\nAnswer the question based on the sources above.`;

  return [
    { role: 'system' as const, content: sys },
    { role: 'user' as const, content: user },
  ];
}

// Search for relevant chunks
async function searchChunks(query: string, topK: number = 8): Promise<Array<{ content: string }>> {
  // Embed the query
  const embResp = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: query,
  });
  const queryEmbedding = embResp.data[0].embedding;

  // Call Supabase RPC to match chunks
  const { data, error } = await supabase.rpc('match_chunks', {
    query_embedding: queryEmbedding,
    match_count: topK,
    p_project_id: PROJECT_ID,
    min_similarity: 0,
  });

  if (error) {
    console.warn(`  ⚠️  Search error: ${error.message}`);
    return [];
  }

  return (data || []).map((r: any) => ({
    content: r.content as string,
  }));
}

// Generate AI answer using RAG
async function generateAnswer(question: string, lang: Language): Promise<string> {
  console.log(`  🔍 Searching for relevant chunks...`);
  const chunks = await searchChunks(question, 8);
  console.log(`  📚 Found ${chunks.length} relevant chunks`);

  console.log(`  🤖 Generating AI answer...`);
  const messages = buildHenryRAGPrompt(question, chunks, lang);
  
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    temperature: 0,
  });

  const answer = completion.choices?.[0]?.message?.content ?? '';
  return answer;
}

// Generate TTS audio for a text string
async function generateTTS(text: string): Promise<Buffer> {
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}/stream`, {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: text.trim(),
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        speed: 1.05,
        stability: 0.7,
        similarity_boost: 0.65,
        style: 0.23,
        use_speaker_boost: false,
      },
    }),
  });

  if (!response.ok || !response.body) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`TTS failed: ${response.status} ${errorText.slice(0, 200)}`);
  }

  // Read the stream into a buffer
  const chunks: Uint8Array[] = [];
  const reader = response.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }

  return Buffer.concat(chunks.map((u) => Buffer.from(u)));
}

// Upload audio file to Supabase Storage
async function uploadAudioToStorage(
  questionId: string,
  language: Language,
  burstIndex: number,
  audioBuffer: Buffer
): Promise<string> {
  const fileName = `preprompts/${questionId}/${language}/burst-${burstIndex}.mp3`;
  
  const { data, error } = await supabase.storage
    .from('audio') // Storage bucket name - create this in Supabase Storage
    .upload(fileName, audioBuffer, {
      contentType: 'audio/mpeg',
      upsert: true, // Overwrite if exists
    });

  if (error) {
    throw new Error(`Failed to upload audio: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('audio')
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

// Process a single question
async function processQuestion(questionId: string, questionText: string, lang: Language) {
  console.log(`\n📝 Processing: ${questionId} (${lang})`);
  console.log(`  Question: ${questionText.slice(0, 80)}...`);

  try {
    // Generate complete answer using RAG
    const fullAnswer = await generateAnswer(questionText, lang);
    console.log(`  ✅ Generated answer: ${fullAnswer.slice(0, 80)}...`);

    // Split into bursts
    const bursts = splitIntoBursts(fullAnswer, 3);
    console.log(`  📦 Split into ${bursts.length} bursts`);

    // Generate audio for each burst
    const burstsWithAudio = [];
    for (let i = 0; i < bursts.length; i++) {
      const burstText = bursts[i];
      console.log(`  🔊 Generating audio for burst ${i + 1}/${bursts.length}...`);
      
      try {
        // Generate TTS
        const audioBuffer = await generateTTS(burstText);
        
        // Upload to Supabase Storage
        const audioUrl = await uploadAudioToStorage(questionId, lang, i, audioBuffer);
        
        burstsWithAudio.push({
          text: burstText,
          audioUrl: audioUrl,
          index: i,
        });
        
        console.log(`  ✅ Burst ${i + 1} done: ${audioUrl.slice(0, 60)}...`);
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error: any) {
        console.error(`  ❌ Failed to generate audio for burst ${i + 1}:`, error.message);
        // Continue with other bursts even if one fails
        burstsWithAudio.push({
          text: burstText,
          audioUrl: undefined, // Will be generated on-the-fly if missing
          index: i,
        });
      }
    }

    // Save to Supabase database
    const prepromptData = {
      question_id: questionId,
      language: lang,
      bursts: burstsWithAudio,
      image_url: null, // Can be added later if needed
      citations: null, // Can be added later if needed
      full_text: fullAnswer,
    };

    const { error: dbError } = await supabase
      .from('suggested_questions_preprompts')
      .upsert(prepromptData, {
        onConflict: 'question_id,language',
      });

    if (dbError) {
      console.error(`  ❌ Failed to save to database:`, dbError.message);
      throw dbError;
    }

    console.log(`  ✅ Saved to database`);
    return { success: true };
  } catch (error: any) {
    console.error(`  ❌ Error:`, error.message);
    return { success: false, error: error.message };
  }
}

// Main function
async function main() {
  console.log('🎙️  Starting complete answer generation for all suggested questions...\n');
  console.log(`Found ${QUESTION_POOL_RAW.length} questions to process\n`);

  let processed = 0;
  let skipped = 0;
  let errors = 0;

  for (const question of QUESTION_POOL_RAW) {
    // Process each language
    for (const [lang, questionText] of Object.entries(question.text)) {
      try {
        const result = await processQuestion(question.id, questionText, lang as Language);
        if (result.success) {
          processed++;
        } else {
          errors++;
        }
      } catch (error: any) {
        console.error(`\n❌ Error processing ${question.id} (${lang}):`, error.message);
        errors++;
      }
    }
  }

  console.log(`\n\n📊 Summary:`);
  console.log(`  ✅ Processed: ${processed}`);
  console.log(`  ⏭️  Skipped: ${skipped}`);
  console.log(`  ❌ Errors: ${errors}`);
  console.log(`\n✨ Done!`);
  console.log(`\n📌 Next steps:`);
  console.log(`  1. Verify audio files in Supabase Storage (bucket: 'audio')`);
  console.log(`  2. Check preprompts in Supabase database (table: 'suggested_questions_preprompts')`);
  console.log(`  3. Test by clicking a suggested question in the app`);
}

main().catch(console.error);

