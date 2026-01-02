// Script om automatisch de mappenstructuur aan te maken in Supabase Storage
// - Leest alle questionIds uit suggestedQuestions.ts
// - Maakt voor elke questionId de mapstructuur aan: preprompts/{questionId}/nl/
// - Dit maakt het makkelijker om daarna audio bestanden te uploaden

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { QUESTION_POOL_RAW } from '../src/config/suggestedQuestions';

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

const SUPABASE_URL = requireEnv('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = requireEnv('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Create folder structure in Supabase Storage
// Supabase Storage doesn't have explicit folders, but we can create empty files
// or just ensure the path exists by trying to list it
async function createFolderStructure(questionId: string) {
  const folderPath = `preprompts/${questionId}/nl`;
  
  console.log(`📁 Creating folder structure for: ${questionId}`);
  
  try {
    // Try to list the folder - if it doesn't exist, we'll get an error
    // But we can create a placeholder file to ensure the folder exists
    const placeholderPath = `${folderPath}/.keep`;
    
    // Create a small placeholder file to ensure the folder structure exists
    const { error: uploadError } = await supabase.storage
      .from('audio')
      .upload(placeholderPath, new Blob([''], { type: 'text/plain' }), {
        upsert: true,
      });
    
    if (uploadError) {
      // If upload fails, try to list to see if folder already exists
      const { error: listError } = await supabase.storage
        .from('audio')
        .list(folderPath);
      
      if (listError) {
        console.error(`  ❌ Failed to create folder: ${listError.message}`);
        return { success: false, error: listError.message };
      } else {
        console.log(`  ✅ Folder already exists`);
        return { success: true, alreadyExists: true };
      }
    }
    
    console.log(`  ✅ Created folder structure: ${folderPath}`);
    return { success: true };
  } catch (error: any) {
    console.error(`  ❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Main function
async function main() {
  // Check if a specific question ID was provided as command line argument
  const questionIdArg = process.argv[2];
  
  if (questionIdArg) {
    // Process only the specified question
    console.log(`📁 Creating folder structure for single question: ${questionIdArg}\n`);
    
    // Verify the question exists
    const question = QUESTION_POOL_RAW.find((q) => q.id === questionIdArg);
    if (!question) {
      console.error(`❌ Question with id "${questionIdArg}" not found!`);
      console.log(`\nAvailable question IDs:`);
      QUESTION_POOL_RAW.forEach((q) => console.log(`  - ${q.id}`));
      process.exit(1);
    }
    
    const result = await createFolderStructure(questionIdArg);
    if (result.success) {
      console.log(`\n✨ Done!`);
      console.log(`\n📌 Next steps:`);
      console.log(`  1. Upload audio files to: audio/preprompts/${questionIdArg}/nl/burst-{index}.mp3`);
      console.log(`  2. Run: npm run update-audio-urls`);
    } else {
      console.error(`\n❌ Failed to create folder structure`);
      process.exit(1);
    }
  } else {
    // Process all questions
    console.log('📁 Starting folder structure creation in Supabase Storage...\n');
    console.log(`Found ${QUESTION_POOL_RAW.length} questions to process\n`);
    console.log(`💡 Tip: To create folder for a single question, run:`);
    console.log(`   npm run create-storage-folders <questionId>`);
    console.log(`   Example: npm run create-storage-folders taiwan-domestic-matter\n`);

    let created = 0;
    let alreadyExists = 0;
    let errors = 0;

    for (const question of QUESTION_POOL_RAW) {
      try {
        const result = await createFolderStructure(question.id);
        if (result.success) {
          if (result.alreadyExists) {
            alreadyExists++;
          } else {
            created++;
          }
        } else {
          errors++;
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error: any) {
        console.error(`  ❌ Error processing ${question.id}:`, error.message);
        errors++;
      }
    }

    console.log(`\n\n📊 Summary:`);
    console.log(`  ✅ Created: ${created}`);
    console.log(`  ⏭️  Already exists: ${alreadyExists}`);
    console.log(`  ❌ Errors: ${errors}`);
    console.log(`\n✨ Done!`);
    console.log(`\n📌 Next steps:`);
    console.log(`  1. Upload audio files to: audio/preprompts/{questionId}/nl/burst-{index}.mp3`);
    console.log(`  2. Run: npm run update-audio-urls`);
    console.log(`\n💡 Tip: You can now upload audio files directly to the created folders in Supabase Storage dashboard`);
  }
}

main().catch(console.error);

