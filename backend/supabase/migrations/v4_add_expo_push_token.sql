ALTER TABLE users ADD COLUMN IF NOT EXISTS expo_push_token TEXT;

-- Enable Realtime on alerts table
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
