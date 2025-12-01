// Ingestion scaffold:
// - Reads seed markdown/text files (./seed/*.md, *.txt) when available
// - Chunks content into ~300-token pieces with slight overlap
// - Embeds with OpenAI (server-side) and upserts into Supabase (documents + chunks)
// - Safe to run repeatedly; uses source_id as an idempotent key

import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

const OPENAI_API_KEY = requireEnv('OPENAI_API_KEY');
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'text-embedding-3-small';
const SUPABASE_URL = requireEnv('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
const PROJECT_ID = process.env.PROJECT_ID || null;

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

type SeedDoc = { sourceId: string; title: string; content: string };

function readSeed(): SeedDoc[] {
  const seedDir = path.resolve(process.cwd(), 'seed');
  if (!fs.existsSync(seedDir)) {
    console.log('[ingest] No seed directory found; create ./seed to add content.');
    return [];
  }
  const files = fs.readdirSync(seedDir).filter(f => f.endsWith('.md') || f.endsWith('.txt'));
  const docs: SeedDoc[] = [];
  for (const file of files) {
    const full = path.join(seedDir, file);
    const text = fs.readFileSync(full, 'utf8');
    docs.push({
      sourceId: full,
      title: path.basename(file),
      content: text,
    });
  }
  return docs;
}

function roughTokenCount(s: string): number {
  // Approximate tokens as 4 chars/token (rough heuristic)
  return Math.ceil(s.length / 4);
}

function chunkText(text: string, targetTokens = 200, overlapTokens = 60): string[] {
  const sentences = text.split(/(?<=[\.\?\!])\s+/);
  const chunks: string[] = [];
  let current: string[] = [];
  let currentTokens = 0;
  for (const s of sentences) {
    const t = roughTokenCount(s);
    if (currentTokens + t > targetTokens && current.length > 0) {
      chunks.push(current.join(' ').trim());
      // Start new chunk with some overlap
      const overlapText = current.join(' ');
      const overlap = overlapText.split(' ').slice(-Math.max(1, Math.floor(overlapTokens / 1.33))).join(' ');
      current = overlap ? [overlap, s] : [s];
      currentTokens = roughTokenCount(current.join(' '));
    } else {
      current.push(s);
      currentTokens += t;
    }
  }
  if (current.length) chunks.push(current.join(' ').trim());
  return chunks.filter(c => c.length > 0);
}

async function ensureDocument(sourceId: string, title: string) {
  const { data: existing, error: selectErr } = await supabase
    .from('documents')
    .select('id')
    .eq('source_id', sourceId)
    .maybeSingle();
  if (selectErr) throw selectErr;
  if (existing?.id) return existing.id as string;
  const { data, error } = await supabase
    .from('documents')
    .insert({ source_id: sourceId, title, project_id: PROJECT_ID })
    .select('id')
    .single();
  if (error) throw error;
  return data.id as string;
}

async function upsertChunk(documentId: string, content: string) {
  const emb = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: content,
  });
  const embedding = emb.data[0].embedding as number[];
  const { error } = await supabase.from('chunks').insert({
    document_id: documentId,
    project_id: PROJECT_ID,
    content,
    embedding,
  });
  if (error) throw error;
}

async function main() {
  console.log('[ingest] starting');
  const seed = readSeed();
  if (seed.length === 0) {
    console.log('[ingest] nothing to ingest. Add files to ./seed.');
    return;
  }
  for (const doc of seed) {
    console.log(`[ingest] ${doc.title}`);
    const docId = await ensureDocument(doc.sourceId, doc.title);
    const pieces = chunkText(doc.content);
    console.log(`[ingest] chunks=${pieces.length}`);
    for (const p of pieces) {
      await upsertChunk(docId, p);
    }
  }
  console.log('[ingest] done');
}

main().catch(err => {
  console.error('[ingest] error:', err?.message || err);
  process.exit(1);
});


