-- Supabase database schema for conversation storage
-- Run this in your Supabase SQL editor

-- Create conversations table
CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id TEXT,
  ip_address TEXT,
  user_agent TEXT
);

-- Create messages table
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'ai')),
  text TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('final', 'stream')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX idx_conversations_last_updated ON conversations(last_updated DESC);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_timestamp ON messages(timestamp);

-- Create a function to update last_updated when messages are added
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations 
  SET last_updated = NOW() 
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update last_updated
CREATE TRIGGER trigger_update_conversation_timestamp
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- Enable Row Level Security (RLS)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your needs)
-- For now, allow all operations (you can restrict this later)
CREATE POLICY "Allow all operations on conversations" ON conversations
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on messages" ON messages
  FOR ALL USING (true);

-- Create a view for conversation summaries
CREATE VIEW conversation_summaries AS
SELECT 
  c.id,
  c.title,
  c.created_at,
  c.last_updated,
  COUNT(m.id) as message_count,
  (
    SELECT m2.text 
    FROM messages m2 
    WHERE m2.conversation_id = c.id 
      AND m2.role = 'user' 
    ORDER BY m2.timestamp ASC 
    LIMIT 1
  ) as first_question
FROM conversations c
LEFT JOIN messages m ON c.id = m.conversation_id
GROUP BY c.id, c.title, c.created_at, c.last_updated
ORDER BY c.last_updated DESC;
