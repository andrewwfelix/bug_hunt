-- Create the logs table for storing game session data
CREATE TABLE IF NOT EXISTS logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    prompt TEXT NOT NULL,
    response TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries by session_id
CREATE INDEX IF NOT EXISTS idx_logs_session_id ON logs(session_id);

-- Create index for timestamp-based queries
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for API access)
CREATE POLICY "Allow all operations" ON logs
    FOR ALL USING (true);

-- Create a view for session summaries
CREATE OR REPLACE VIEW session_summaries AS
SELECT 
    session_id,
    COUNT(*) as interaction_count,
    MIN(created_at) as session_start,
    MAX(created_at) as session_end,
    AVG(LENGTH(prompt)) as avg_prompt_length,
    AVG(LENGTH(response)) as avg_response_length
FROM logs
GROUP BY session_id;

-- Create a function to get recent sessions
CREATE OR REPLACE FUNCTION get_recent_sessions(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    session_id TEXT,
    interaction_count BIGINT,
    session_start TIMESTAMP WITH TIME ZONE,
    session_end TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.session_id,
        s.interaction_count,
        s.session_start,
        s.session_end
    FROM session_summaries s
    ORDER BY s.session_end DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql; 