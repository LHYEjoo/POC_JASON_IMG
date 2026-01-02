// Script to migrate preprompts from suggestedQuestions.ts to Supabase database
// - Reads all questions from suggestedQuestions.ts
// - Extracts both Dutch (nl) and English (en) preprompts
// - Inserts into Supabase suggested_questions_preprompts table
// - For Dutch: sets audioUrl to null initially (will be updated after manual upload)
// - For English: sets audioUrl to null (always generates TTS on-the-fly)

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { QUESTION_POOL_RAW, Language } from '../src/config/suggestedQuestions';

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

const SUPABASE_URL = requireEnv('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = requireEnv('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Process a single question's preprompts for a specific language
async function migrateQuestion(questionId: string, preprompts: any, language: Language) {
  if (!preprompts || !preprompts.bursts || preprompts.bursts.length === 0) {
    console.log(`  ⚠️  No bursts found, skipping`);
    return { success: false, reason: 'no_bursts' };
  }

  const bursts = preprompts.bursts;
  console.log(`  Found ${bursts.length} bursts for ${language}`);

  // Convert to database format (with null audioUrl)
  // Dutch: will be updated after manual upload
  // English: always null (always generates TTS on-the-fly)
  const burstsForDb = bursts.map((burst: any, index: number) => ({
    text: burst.text,
    audioUrl: null, // Dutch: updated after upload, English: always null
    index: index,
  }));

  // Prepare data for database
  const prepromptData = {
    question_id: questionId,
    language: language,
    bursts: burstsForDb,
    image_url: preprompts.imageUrl || null,
    citations: preprompts.citations || null,
    full_text: bursts.map((b: any) => b.text).join(' '),
  };

  // Insert or update (upsert)
  const { error: dbError } = await supabase
    .from('suggested_questions_preprompts')
    .upsert(prepromptData, {
      onConflict: 'question_id,language',
    });

  if (dbError) {
    console.error(`  ❌ Failed to save to database:`, dbError.message);
    return { success: false, error: dbError.message };
  }

  const audioNote = language === 'nl' 
    ? 'audio URLs will be null until uploaded' 
    : 'audio URLs always null (TTS on-the-fly)';
  console.log(`  ✅ Saved to database (${bursts.length} bursts, ${audioNote})`);
  return { success: true };
}

// Main function
async function main() {
  console.log('📦 Starting preprompts migration to Supabase...\n');
  console.log(`Found ${QUESTION_POOL_RAW.length} questions to process\n`);

  let processed = 0;
  let skipped = 0;
  let errors = 0;

  for (const question of QUESTION_POOL_RAW) {
    console.log(`\n📝 Processing: ${question.id}`);
    
    if (!question.preprompts) {
      console.log(`  ⏭️  No preprompts defined, skipping`);
      skipped++;
      continue;
    }

    // Process both Dutch (nl) and English (en) preprompts
    for (const [lang, preprompts] of Object.entries(question.preprompts)) {
      if (!preprompts) {
        console.log(`  ⏭️  No ${lang} preprompts, skipping`);
        continue;
      }

      try {
        const result = await migrateQuestion(question.id, preprompts, lang as Language);
        if (result.success) {
          processed++;
        } else {
          errors++;
        }
      } catch (error: any) {
        console.error(`  ❌ Error processing ${lang}:`, error.message);
        errors++;
      }
    }
  }

  console.log(`\n\n📊 Summary:`);
  console.log(`  ✅ Processed: ${processed}`);
  console.log(`  ⏭️  Skipped: ${skipped}`);
  console.log(`  ❌ Errors: ${errors}`);
  console.log(`\n✨ Migration complete!`);
  console.log(`\n📌 Next steps:`);
  console.log(`  1. Upload audio files to Supabase Storage: audio/preprompts/{questionId}/nl/burst-{index}.mp3`);
  console.log(`  2. Run: npm run update-audio-urls`);
}

main().catch(console.error);

