// Serverless vector retrieval endpoint.
// - Embeds the query (server-side) using OpenAI
// - Calls Supabase RPC match_chunks to retrieve top-K
// - Logs each request to search_logs with tokens used and results
// - Returns hits with a `sources` array for transparency

import 'dotenv/config';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

type SearchRequest = {
  q: string;
  topK?: number;
  projectId?: string | null;
  minSimilarity?: number; // 0..1
};

type ApiResponse =
  | { ok: true; query: string; topK: number; tokensUsed?: number; sources: Array<{ chunkId: string; documentId: string; title: string | null; sourceId: string | null; score: number }>; chunks: Array<{ content: string; chunkId: string; documentId: string; score: number }>; }
  | { ok: false; error: string };

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing environment variable: ${name}`);
  return v;
}

const OPENAI_API_KEY = requireEnv('OPENAI_API_KEY');
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'text-embedding-3-small';
const SUPABASE_URL = requireEnv('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = requireEnv('SUPABASE_SERVICE_ROLE_KEY');

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed' } satisfies ApiResponse);
    return;
  }

  const start = Date.now();
  let tokensUsed: number | undefined = undefined;
  let body: SearchRequest;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  } catch {
    res.status(400).json({ ok: false, error: 'Invalid JSON body' } satisfies ApiResponse);
    return;
  }

  const query = (body.q || '').toString().trim();
  const topK = Math.max(1, Math.min(20, Number(body.topK ?? 8)));
  const minSimilarity = Math.max(0, Math.min(1, Number(body.minSimilarity ?? 0)));
  const projectId = body.projectId ? String(body.projectId) : null;

  if (!query) {
    res.status(400).json({ ok: false, error: 'Missing query "q"' } satisfies ApiResponse);
    return;
  }

  try {
    // 1) Embed the query (server-side)
    const embResp = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: query,
    });
    const queryEmbedding = embResp.data[0].embedding;
    tokensUsed = (embResp as any).usage?.total_tokens ?? (embResp as any).usage?.prompt_tokens;

    // 2) Call RPC to match top-K chunks
    const { data, error } = await supabase.rpc('match_chunks', {
      query_embedding: queryEmbedding,
      match_count: topK,
      p_project_id: projectId,
      min_similarity: minSimilarity,
    });
    if (error) throw error;

    // 3) Shape response and sources
    const sources = (data || []).map((r: any) => ({
      chunkId: r.chunk_id as string,
      documentId: r.document_id as string,
      title: r.title as string | null,
      sourceId: r.source_id as string | null,
      score: r.score as number,
    }));
    const chunks = (data || []).map((r: any) => ({
      content: r.content as string,
      chunkId: r.chunk_id as string,
      documentId: r.document_id as string,
      score: r.score as number,
    }));

    // 4) Structured logging (traceability)
    try {
      const resultsForLog = sources.map((s: { chunkId: string; documentId: string; title: string | null; sourceId: string | null; score: number }) => ({
        chunk_id: s.chunkId,
        document_id: s.documentId,
        score: s.score,
        title: s.title,
        source_id: s.sourceId,
      }));
      await supabase.from('search_logs').insert({
        query,
        top_k: topK,
        model: EMBEDDING_MODEL,
        tokens_used: tokensUsed ?? null,
        project_id: projectId,
        results: resultsForLog,
      } as any);
    } catch (logErr: any) {
      // Keep failures non-fatal but visible in logs
      console.error('[api/search] log insert failed:', logErr?.message || logErr);
    }

    res.status(200).json({
      ok: true,
      query,
      topK,
      tokensUsed,
      sources,
      chunks,
    } satisfies ApiResponse);
  } catch (err: any) {
    const message = err?.message || 'Unknown error';
    console.error('[api/search] error:', message);
    // Log the error
    try {
      await supabase.from('search_logs').insert({
        query,
        top_k: topK,
        model: EMBEDDING_MODEL,
        tokens_used: tokensUsed ?? null,
        project_id: projectId,
        results: [],
        error: message,
      } as any);
    } catch {}
    res.status(500).json({ ok: false, error: message } satisfies ApiResponse);
  } finally {
    const elapsed = Date.now() - start;
    console.log(`[api/search] "${query}" topK=${topK} ms=${elapsed}`);
  }
}


