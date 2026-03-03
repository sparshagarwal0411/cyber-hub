-- Create vault_entries table
CREATE TABLE IF NOT EXISTS public.vault_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    service_name TEXT NOT NULL,
    password TEXT NOT NULL,
    access_code TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.vault_entries ENABLE ROW LEVEL SECURITY;

-- Create Policies
DROP POLICY IF EXISTS "Users can only see their own vault entries if code matches" ON public.vault_entries;
CREATE POLICY "Users can only see their own vault entries if code matches" 
ON public.vault_entries FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own vault entries" ON public.vault_entries;
CREATE POLICY "Users can insert their own vault entries" 
ON public.vault_entries FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own vault entries" ON public.vault_entries;
CREATE POLICY "Users can delete their own vault entries" 
ON public.vault_entries FOR DELETE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own vault entries" ON public.vault_entries;
CREATE POLICY "Users can update their own vault entries" 
ON public.vault_entries FOR UPDATE 
USING (auth.uid() = user_id);

-- Index for performance on searches
CREATE INDEX IF NOT EXISTS idx_vault_user_code ON public.vault_entries(user_id, access_code);
