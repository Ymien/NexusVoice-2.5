-- Create chat_history table
CREATE TABLE IF NOT EXISTS public.chat_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    message_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only insert their own messages" 
ON public.chat_history FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only view their own messages" 
ON public.chat_history FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own messages" 
ON public.chat_history FOR DELETE 
USING (auth.uid() = user_id);
