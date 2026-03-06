-- Create scans table
CREATE TABLE IF NOT EXISTS public.scans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('URL', 'PDF', 'Visual', 'AI')),
    target TEXT NOT NULL,
    risk TEXT NOT NULL,
    result_details TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create user_stats table
CREATE TABLE IF NOT EXISTS public.user_stats (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    total_scans INTEGER DEFAULT 0 NOT NULL,
    pdf_scans INTEGER DEFAULT 0 NOT NULL,
    url_scans INTEGER DEFAULT 0 NOT NULL,
    visual_scans INTEGER DEFAULT 0 NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Create Policies
DROP POLICY IF EXISTS "Users can view their own scans" ON public.scans;
CREATE POLICY "Users can view their own scans" 
ON public.scans FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own scans" ON public.scans;
CREATE POLICY "Users can insert their own scans" 
ON public.scans FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own stats" ON public.user_stats;
CREATE POLICY "Users can view their own stats" 
ON public.user_stats FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own stats" ON public.user_stats;
CREATE POLICY "Users can update their own stats" 
ON public.user_stats FOR ALL 
USING (auth.uid() = user_id);

-- Create trigger to initialize user_stats on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_stats (user_id)
    VALUES (new.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to increment stats
CREATE OR REPLACE FUNCTION public.increment_scan_stats(u_id UUID, s_type TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.user_stats 
    SET 
        total_scans = total_scans + 1,
        pdf_scans = CASE WHEN s_type = 'PDF' THEN pdf_scans + 1 ELSE pdf_scans END,
        url_scans = CASE WHEN s_type = 'URL' THEN url_scans + 1 ELSE url_scans END,
        visual_scans = CASE WHEN s_type = 'Visual' THEN visual_scans + 1 ELSE visual_scans END,
        updated_at = now()
    WHERE user_id = u_id;
    
    -- If no row exists, create one (safety)
    IF NOT FOUND THEN
        INSERT INTO public.user_stats (user_id, total_scans, pdf_scans, url_scans, visual_scans)
        VALUES (
            u_id, 
            1, 
            CASE WHEN s_type = 'PDF' THEN 1 ELSE 0 END,
            CASE WHEN s_type = 'URL' THEN 1 ELSE 0 END,
            CASE WHEN s_type = 'Visual' THEN 1 ELSE 0 END
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
