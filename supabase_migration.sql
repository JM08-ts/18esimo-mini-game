-- ============================================================
-- 18esimo Mini Game - Supabase Database & Storage Migration
-- Esegui questo script nell'editor SQL di Supabase
-- ============================================================

-- 1. Tabella players
CREATE TABLE IF NOT EXISTS public.players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    total_points INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Tabella submissions
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
    player_name TEXT NOT NULL,
    task_id INTEGER NOT NULL,
    task_title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    points INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Indici per prestazioni e classifiche ultra veloci
CREATE INDEX IF NOT EXISTS idx_players_points ON public.players (total_points DESC, completed_at ASC NULLS LAST, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_submissions_player_task ON public.submissions (player_id, task_id);
CREATE INDEX IF NOT EXISTS idx_submissions_created_desc ON public.submissions (created_at DESC);

-- 4. Disabilita RLS per accesso immediato senza registrazione
ALTER TABLE public.players DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions DISABLE ROW LEVEL SECURITY;

-- 5. Abilita Supabase Realtime su entrambe le tabelle
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'players'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.players;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'submissions'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.submissions;
    END IF;
END $$;

-- 6. Storage bucket 'party-photos' (pubblico)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'party-photos',
    'party-photos',
    true,
    52428800,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif']
)
ON CONFLICT (id) DO UPDATE SET 
    public = true,
    file_size_limit = 52428800;

-- 7. Policy storage.objects aperte a tutti (anon e authenticated)
DROP POLICY IF EXISTS "Public access party-photos SELECT" ON storage.objects;
CREATE POLICY "Public access party-photos SELECT" ON storage.objects
FOR SELECT USING (bucket_id = 'party-photos');

DROP POLICY IF EXISTS "Public access party-photos INSERT" ON storage.objects;
CREATE POLICY "Public access party-photos INSERT" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'party-photos');

DROP POLICY IF EXISTS "Public access party-photos UPDATE" ON storage.objects;
CREATE POLICY "Public access party-photos UPDATE" ON storage.objects
FOR UPDATE USING (bucket_id = 'party-photos');

DROP POLICY IF EXISTS "Public access party-photos DELETE" ON storage.objects;
CREATE POLICY "Public access party-photos DELETE" ON storage.objects
FOR DELETE USING (bucket_id = 'party-photos');
