-- Enables vector support and defines tables for documents, chunks, and search logs.
-- Includes a match_chunks RPC for efficient vector search with optional project filtering.

-- 1) Vector extension (idempotent)
create extension if not exists vector;

-- 2) Documents table (high-level metadata)
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  source_id text,                 -- Source path/url/id
  title text,
  project_id text,                -- For future per-project filtering
  tags text[] default '{}',       -- Optional tags
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- 3) Chunks table (content pieces with embeddings)
--    1536 matches text-embedding-3-small
create table if not exists chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) on delete cascade,
  content text not null,
  project_id text,                -- Denormalized for faster filtering
  metadata jsonb default '{}'::jsonb,
  embedding vector(1536),
  created_at timestamptz default now()
);

-- 4) ANN index for fast vector similarity (HNSW + cosine)
create index if not exists chunks_embedding_hnsw
on chunks using hnsw (embedding vector_cosine_ops);

-- 5) Optional: Full-text index for future hybrid search
alter table chunks add column if not exists fts tsvector
  generated always as (to_tsvector('english', content)) stored;
create index if not exists chunks_fts_idx on chunks using gin (fts);

-- 6) Search logs for traceability and evaluation
create table if not exists search_logs (
  id uuid primary key default gen_random_uuid(),
  query text not null,
  top_k int,
  model text,
  tokens_used int,
  project_id text,
  results jsonb,                  -- [{chunk_id, document_id, score, title, source_id}]
  error text,
  created_at timestamptz default now()
);

-- 7) RPC function: vector search with optional project filter and min similarity
--    Usage via supabase.rpc('match_chunks', { query_embedding, match_count, project_id, min_similarity })
create or replace function match_chunks(
  query_embedding vector(1536),
  match_count int default 8,
  p_project_id text default null,
  min_similarity float default 0.0
)
returns table (
  chunk_id uuid,
  document_id uuid,
  content text,
  title text,
  source_id text,
  score float
) language sql stable as $$
  with ranked as (
    select
      c.id as chunk_id,
      c.document_id,
      c.content,
      d.title,
      d.source_id,
      1 - (c.embedding <=> query_embedding) as score
    from chunks c
    join documents d on d.id = c.document_id
    where c.embedding is not null
      and (p_project_id is null or c.project_id = p_project_id)
    order by c.embedding <=> query_embedding
    limit match_count
  )
  select * from ranked where score >= min_similarity;
$$;


