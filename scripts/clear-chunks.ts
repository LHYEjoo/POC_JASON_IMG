// Clear existing chunks and documents from Supabase
// This script deletes all chunks and documents for the current project

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

const SUPABASE_URL = requireEnv('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
const PROJECT_ID = process.env.PROJECT_ID || null;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function clearChunks() {
  console.log('[clear] Starting to clear chunks and documents...');
  
  try {
    // First, get count of chunks to delete
    let chunksCount = 0;
    let docsCount = 0;
    
    if (PROJECT_ID) {
      console.log(`[clear] Counting chunks for project: ${PROJECT_ID}`);
      const { count: chunksCountResult } = await supabase
        .from('chunks')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', PROJECT_ID);
      chunksCount = chunksCountResult || 0;
      
      const { count: docsCountResult } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', PROJECT_ID);
      docsCount = docsCountResult || 0;
      
      console.log(`[clear] Found ${chunksCount} chunks and ${docsCount} documents to delete`);
      
      // Delete chunks first (they reference documents)
      if (chunksCount > 0) {
        console.log(`[clear] Deleting chunks...`);
        const { error: chunksError } = await supabase
          .from('chunks')
          .delete()
          .eq('project_id', PROJECT_ID);
        
        if (chunksError) throw chunksError;
        console.log(`[clear] Deleted ${chunksCount} chunks`);
      }
      
      // Then delete documents
      if (docsCount > 0) {
        console.log(`[clear] Deleting documents...`);
        const { error: docsError } = await supabase
          .from('documents')
          .delete()
          .eq('project_id', PROJECT_ID);
        
        if (docsError) throw docsError;
        console.log(`[clear] Deleted ${docsCount} documents`);
      }
    } else {
      console.log('[clear] WARNING: No PROJECT_ID set, deleting ALL chunks and documents!');
      
      const { count: chunksCountResult } = await supabase
        .from('chunks')
        .select('*', { count: 'exact', head: true });
      chunksCount = chunksCountResult || 0;
      
      const { count: docsCountResult } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true });
      docsCount = docsCountResult || 0;
      
      console.log(`[clear] Found ${chunksCount} chunks and ${docsCount} documents to delete`);
      
      // Delete all chunks (using a condition that matches all rows)
      if (chunksCount > 0) {
        const { error: chunksError } = await supabase
          .from('chunks')
          .delete()
          .gte('created_at', '1970-01-01'); // Matches all rows (created_at is always >= 1970)
        
        if (chunksError) throw chunksError;
        console.log(`[clear] Deleted ${chunksCount} chunks`);
      }
      
      // Delete all documents
      if (docsCount > 0) {
        const { error: docsError } = await supabase
          .from('documents')
          .delete()
          .gte('created_at', '1970-01-01'); // Matches all rows
        
        if (docsError) throw docsError;
        console.log(`[clear] Deleted ${docsCount} documents`);
      }
    }
    
    console.log('[clear] Done! All chunks and documents cleared.');
  } catch (err: any) {
    console.error('[clear] Error:', err?.message || err);
    throw err;
  }
}

clearChunks().catch(err => {
  console.error('[clear] Fatal error:', err?.message || err);
  process.exit(1);
});

