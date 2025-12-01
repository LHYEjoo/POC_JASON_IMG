// src/lib/supabase.ts
// Supabase client configuration

import { createClient } from '@supabase/supabase-js';

// Use Vite environment variables (client/browser code) with Next.js-style fallbacks
const env: any = import.meta.env;
const url = env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const anon = env.VITE_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;


if (!url || !anon) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY (or NEXT_PUBLIC_ equivalents)');
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(url, anon);
 
