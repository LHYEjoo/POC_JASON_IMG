// Script to generate audio files for all preprompts and store them in Supabase
// - Reads preprompts from suggestedQuestions.ts
// - Generates TTS audio for each burst using ElevenLabs
// - Uploads audio files to Supabase Storage
// - Updates preprompts in Supabase database with audio URLs

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { QUESTION_POOL_RAW, type Language } from '../src/config/suggestedQuestions';
import fs from 'node:fs';
import path from 'node:path';

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

const ELEVENLABS_API_KEY = requireEnv('ELEVENLABS_API_KEY');
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'UgBBYS2sOqTuMpoF3BR0';
const SUPABASE_URL = requireEnv('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = requireEnv('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

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
    .from('audio') // You may need to create this bucket in Supabase
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

// Process a single preprompt question
async function processPreprompt(questionId: string, language: Language, preprompts: any) {
  console.log(`\n📝 Processing: ${questionId} (${language})`);
  
  if (!preprompts || !preprompts.bursts || preprompts.bursts.length === 0) {
    console.log(`  ⚠️  No bursts found, skipping`);
    return;
  }

  const bursts = preprompts.bursts;
  console.log(`  Found ${bursts.length} bursts`);

  // Generate audio for each burst
  const burstsWithAudio = [];
  for (let i = 0; i < bursts.length; i++) {
    const burst = bursts[i];
    console.log(`  🔊 Generating audio for burst ${i + 1}/${bursts.length}...`);
    
    try {
      // Generate TTS
      const audioBuffer = await generateTTS(burst.text);
      
      // Upload to Supabase Storage
      const audioUrl = await uploadAudioToStorage(questionId, language, i, audioBuffer);
      
      burstsWithAudio.push({
        text: burst.text,
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
        text: burst.text,
        audioUrl: undefined, // Will be generated on-the-fly if missing
        index: i,
      });
    }
  }

  // Update or insert preprompt in Supabase database
  const prepromptData = {
    question_id: questionId,
    language: language,
    bursts: burstsWithAudio,
    image_url: preprompts.imageUrl || null,
    citations: preprompts.citations || null,
    full_text: bursts.map((b: any) => b.text).join(' '),
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
}

// Main function
async function main() {
  console.log('🎙️  Starting preprompt audio generation...\n');
  console.log(`Found ${QUESTION_POOL_RAW.length} questions to process\n`);

  let processed = 0;
  let skipped = 0;
  let errors = 0;

  for (const question of QUESTION_POOL_RAW) {
    if (!question.preprompts) {
      skipped++;
      continue;
    }

    // Process each language
    for (const [lang, preprompts] of Object.entries(question.preprompts)) {
      try {
        await processPreprompt(question.id, lang as Language, preprompts);
        processed++;
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
}

main().catch(console.error);

