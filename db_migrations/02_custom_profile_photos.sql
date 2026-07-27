-- db_migrations/02_custom_profile_photos.sql

-- Buat tabel untuk menyimpan foto custom dari user
CREATE TABLE IF NOT EXISTS public.custom_profile_photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_name TEXT NOT NULL,
    photo_url TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexing untuk pencarian cepat berdasarkan user_name dan status
CREATE INDEX IF NOT EXISTS idx_custom_profile_photos_user_name ON public.custom_profile_photos(user_name);
CREATE INDEX IF NOT EXISTS idx_custom_profile_photos_status ON public.custom_profile_photos(status);

-- Aktifkan RLS (Row Level Security)
ALTER TABLE public.custom_profile_photos ENABLE ROW LEVEL SECURITY;

-- Buat policy agar anon (semua user di aplikasi ini karena tidak pakai auth bawaan supabase) bisa SELECT, INSERT, dan UPDATE
CREATE POLICY "Allow anon read" ON public.custom_profile_photos FOR SELECT USING (true);
CREATE POLICY "Allow anon insert" ON public.custom_profile_photos FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update" ON public.custom_profile_photos FOR UPDATE USING (true);

-- Set Permissions
GRANT ALL ON TABLE public.custom_profile_photos TO anon;
GRANT ALL ON TABLE public.custom_profile_photos TO authenticated;

-- Buat fungsi/trigger otomatis update `updated_at` (Opsional)
-- CREATE OR REPLACE FUNCTION update_updated_at_column()
-- RETURNS TRIGGER AS $$
-- BEGIN
--    NEW.updated_at = NOW();
--    RETURN NEW;
-- END;
-- $$ language 'plpgsql';

-- CREATE TRIGGER update_custom_profile_photos_updated_at
-- BEFORE UPDATE ON public.custom_profile_photos
-- FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
