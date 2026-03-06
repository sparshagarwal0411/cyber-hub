-- Create deep_drops table for secure communication
CREATE TABLE IF NOT EXISTS public.deep_drops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL, -- This will store encrypted data
    expires_at TIMESTAMPTZ NOT NULL,
    burned BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.deep_drops ENABLE ROW LEVEL SECURITY;

-- Create Policies
-- Users can only see their own drops by default (for listing if we add that later)
DROP POLICY IF EXISTS "Users can view their own drops" ON public.deep_drops;
CREATE POLICY "Users can view their own drops" 
ON public.deep_drops FOR SELECT 
USING (auth.uid() = user_id);

-- Anyone with the ID can read/select a drop (needed for sharing links)
-- BUT: the application logic (service) will mark it as burned immediately.
DROP POLICY IF EXISTS "Anyone with link can view drop" ON public.deep_drops;
CREATE POLICY "Anyone with link can view drop" 
ON public.deep_drops FOR SELECT 
USING (true);

-- Users can insert their own drops
DROP POLICY IF EXISTS "Users can insert their own drops" ON public.deep_drops;
CREATE POLICY "Users can insert their own drops" 
ON public.deep_drops FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Anyone can update a drop to 'burned' (needed for the first person who reads it)
DROP POLICY IF EXISTS "Anyone can burn a drop" ON public.deep_drops;
CREATE POLICY "Anyone can burn a drop" 
ON public.deep_drops FOR UPDATE 
USING (true);

-- Index for expiry cleanup
CREATE INDEX IF NOT EXISTS idx_deep_drops_expiry ON public.deep_drops(expires_at);
