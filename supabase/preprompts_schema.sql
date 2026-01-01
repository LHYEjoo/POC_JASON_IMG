-- Schema for preprompted answers to suggested questions
-- This stores pre-generated text bursts and their audio URLs

create table if not exists suggested_questions_preprompts (
  id uuid primary key default gen_random_uuid(),
  question_id text not null,              -- Matches id from suggestedQuestions.ts
  language text not null check (language in ('nl', 'en')),
  
  -- Bursts: array of {text, audioUrl, index}
  bursts jsonb not null default '[]'::jsonb,
  
  -- Optional metadata
  image_url text,
  citations text,
  full_text text,                          -- Full answer text for validation
  
  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Unique constraint: one preprompt per question_id + language
  unique(question_id, language)
);

-- Index for fast lookups
create index if not exists idx_preprompts_question_lang 
  on suggested_questions_preprompts(question_id, language);

-- Function to update updated_at timestamp
create or replace function update_preprompt_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to auto-update updated_at
create trigger trigger_update_preprompt_timestamp
  before update on suggested_questions_preprompts
  for each row
  execute function update_preprompt_timestamp();

-- Enable RLS (Row Level Security)
alter table suggested_questions_preprompts enable row level security;

-- Policy: allow all operations (adjust based on your needs)
create policy "Allow all operations on preprompts" 
  on suggested_questions_preprompts
  for all using (true);





