/*
  # Create messages table for real-time chat

  1. New Tables
    - `messages`
      - `id` (bigint, primary key)
      - `content` (text, encrypted message content)
      - `user_email` (text, sender's email)
      - `created_at` (timestamptz, auto-generated)

  2. Security
    - Enable RLS on `messages` table
    - Add policies for:
      - Authenticated users can insert messages
      - All users can read messages
*/

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  content text NOT NULL,
  user_email text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting messages (authenticated users only)
CREATE POLICY "Users can insert messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policy for reading messages (all users)
CREATE POLICY "Anyone can read messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (true);

-- Add table to existing realtime publication if not already added
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND schemaname = 'public'
    AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  END IF;
END
$$;