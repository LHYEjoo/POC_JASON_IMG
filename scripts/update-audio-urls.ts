// Script to update audio URLs in database after manual upload to Supabase Storage
// - Scans Supabase Storage bucket 'audio'
// - Finds all files matching pattern: preprompts/{questionId}/nl/burst-*.mp3
// - Updates database records with public URLs
// - Maps files to correct question_id and burst index

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

const SUPABASE_URL = requireEnv('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = requireEnv('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Extract questionId and burst index from file path
// Example: preprompts/taiwan-domestic-matter/nl/burst-0.mp3
function parseFilePath(path: string): { questionId: string; burstIndex: number } | null {
  const match = path.match(/^preprompts\/([^/]+)\/nl\/burst-(\d+)\.mp3$/);
  if (!match) return null;
  
  return {
    questionId: match[1],
    burstIndex: parseInt(match[2], 10),
  };
}

// Get public URL for a file in Storage
function getPublicUrl(filePath: string): string {
  const { data } = supabase.storage
    .from('audio')
    .getPublicUrl(filePath);
  return data.publicUrl;
}

// Main function
async function main() {
  console.log('🔍 Scanning Supabase Storage for audio files...\n');

  try {
    // List all files in the preprompts folder
    const { data: files, error: listError } = await supabase.storage
      .from('audio')
      .list('preprompts', {
        limit: 1000,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
      });

    if (listError) {
      throw new Error(`Failed to list files: ${listError.message}`);
    }

    if (!files || files.length === 0) {
      console.log('⚠️  No files found in audio/preprompts/');
      console.log('\n📌 Make sure you have uploaded audio files to:');
      console.log('   audio/preprompts/{questionId}/nl/burst-{index}.mp3');
      return;
    }

    console.log(`Found ${files.length} items in preprompts folder\n`);

    // Recursively get all files (including subdirectories)
    const allFiles: string[] = [];
    
    async function listRecursive(folder: string) {
      const { data: items, error } = await supabase.storage
        .from('audio')
        .list(folder, {
          limit: 1000,
          offset: 0,
        });

      if (error) {
        console.warn(`⚠️  Error listing ${folder}:`, error.message);
        return;
      }

      if (!items) return;

      for (const item of items) {
        const fullPath = folder ? `${folder}/${item.name}` : item.name;
        
        if (item.id === null) {
          // It's a folder, recurse
          await listRecursive(fullPath);
        } else {
          // It's a file
          if (item.name.endsWith('.mp3')) {
            allFiles.push(fullPath);
          }
        }
      }
    }

    await listRecursive('preprompts');
    
    console.log(`Found ${allFiles.length} MP3 files total\n`);

    // Group files by questionId
    const filesByQuestion: Record<string, Array<{ path: string; burstIndex: number }>> = {};

    for (const filePath of allFiles) {
      const parsed = parseFilePath(filePath);
      if (!parsed) {
        console.warn(`⚠️  Skipping file with unexpected path: ${filePath}`);
        continue;
      }

      if (!filesByQuestion[parsed.questionId]) {
        filesByQuestion[parsed.questionId] = [];
      }

      filesByQuestion[parsed.questionId].push({
        path: filePath,
        burstIndex: parsed.burstIndex,
      });
    }

    console.log(`Found audio files for ${Object.keys(filesByQuestion).length} questions\n`);

    // Update database for each question
    let updated = 0;
    let errors = 0;

    for (const [questionId, fileList] of Object.entries(filesByQuestion)) {
      console.log(`\n📝 Updating: ${questionId}`);
      console.log(`  Found ${fileList.length} audio files`);

      try {
        // Get current preprompts from database
        const { data: existing, error: fetchError } = await supabase
          .from('suggested_questions_preprompts')
          .select('*')
          .eq('question_id', questionId)
          .eq('language', 'nl')
          .single();

        if (fetchError || !existing) {
          console.error(`  ❌ No database record found for ${questionId}`);
          errors++;
          continue;
        }

        // Update bursts with audio URLs
        const updatedBursts = existing.bursts.map((burst: any) => {
          // Find matching audio file
          const matchingFile = fileList.find(f => f.burstIndex === burst.index);
          
          if (matchingFile) {
            const audioUrl = getPublicUrl(matchingFile.path);
            console.log(`  ✅ Burst ${burst.index}: ${audioUrl.slice(0, 60)}...`);
            return {
              ...burst,
              audioUrl: audioUrl,
            };
          } else {
            console.warn(`  ⚠️  No audio file found for burst ${burst.index}`);
            return burst; // Keep existing (might be null)
          }
        });

        // Update database
        const { error: updateError } = await supabase
          .from('suggested_questions_preprompts')
          .update({
            bursts: updatedBursts,
          })
          .eq('question_id', questionId)
          .eq('language', 'nl');

        if (updateError) {
          console.error(`  ❌ Failed to update:`, updateError.message);
          errors++;
        } else {
          console.log(`  ✅ Updated database`);
          updated++;
        }
      } catch (error: any) {
        console.error(`  ❌ Error processing ${questionId}:`, error.message);
        errors++;
      }
    }

    console.log(`\n\n📊 Summary:`);
    console.log(`  ✅ Updated: ${updated}`);
    console.log(`  ❌ Errors: ${errors}`);
    console.log(`\n✨ Done!`);
  } catch (error: any) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);

