-- ==============================================================================
-- SETUP GALLERIES TABLES (Coverflow, Landscape, Marquee)
-- Execute this script in your Supabase SQL Editor
-- ==============================================================================

-- 1. Create table for Galeri Kenangan (Coverflow)
CREATE TABLE IF NOT EXISTS public.gallery_coverflow (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create table for Momen Spesial (Landscape)
CREATE TABLE IF NOT EXISTS public.gallery_landscape (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create table for Wajah-wajah MAZEEDA Squad (Marquee Avatars)
CREATE TABLE IF NOT EXISTS public.gallery_marquee (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.gallery_coverflow ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_landscape ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_marquee ENABLE ROW LEVEL SECURITY;

-- Allow public read access (Anonymous)
CREATE POLICY "Allow public read access for gallery_coverflow" ON public.gallery_coverflow FOR SELECT USING (true);
CREATE POLICY "Allow public read access for gallery_landscape" ON public.gallery_landscape FOR SELECT USING (true);
CREATE POLICY "Allow public read access for gallery_marquee" ON public.gallery_marquee FOR SELECT USING (true);

-- Allow authenticated/admin full access (Insert, Update, Delete)
CREATE POLICY "Allow admin full access for gallery_coverflow" ON public.gallery_coverflow FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin full access for gallery_landscape" ON public.gallery_landscape FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin full access for gallery_marquee" ON public.gallery_marquee FOR ALL USING (auth.role() = 'authenticated');

-- ==============================================================================
-- SEED DATA
-- ==============================================================================

-- Seed data for Galeri Kenangan (Coverflow)
INSERT INTO public.gallery_coverflow (image_url) VALUES 
('https://picsum.photos/seed/mazeeda1/400/600'),
('https://picsum.photos/seed/mazeeda2/400/600'),
('https://picsum.photos/seed/mazeeda3/400/600'),
('https://picsum.photos/seed/mazeeda4/400/600'),
('https://picsum.photos/seed/mazeeda5/400/600'),
('https://picsum.photos/seed/mazeeda6/400/600'),
('https://picsum.photos/seed/mazeeda7/400/600');

-- Seed data for Momen Spesial (Landscape)
INSERT INTO public.gallery_landscape (image_url) VALUES 
('https://picsum.photos/seed/land1/800/450'),
('https://picsum.photos/seed/land2/800/450'),
('https://picsum.photos/seed/land3/800/450'),
('https://picsum.photos/seed/land4/800/450'),
('https://picsum.photos/seed/land5/800/450');

-- Seed data for Wajah-wajah MAZEEDA Squad (Marquee)
INSERT INTO public.gallery_marquee (image_url) VALUES 
('https://i.pravatar.cc/150?img=1'),
('https://i.pravatar.cc/150?img=2'),
('https://i.pravatar.cc/150?img=3'),
('https://i.pravatar.cc/150?img=4'),
('https://i.pravatar.cc/150?img=5'),
('https://i.pravatar.cc/150?img=6'),
('https://i.pravatar.cc/150?img=7'),
('https://i.pravatar.cc/150?img=8'),
('https://i.pravatar.cc/150?img=9'),
('https://i.pravatar.cc/150?img=10'),
('https://i.pravatar.cc/150?img=11'),
('https://i.pravatar.cc/150?img=12'),
('https://i.pravatar.cc/150?img=13'),
('https://i.pravatar.cc/150?img=14'),
('https://i.pravatar.cc/150?img=15'),
('https://i.pravatar.cc/150?img=16'),
('https://i.pravatar.cc/150?img=17'),
('https://i.pravatar.cc/150?img=18'),
('https://i.pravatar.cc/150?img=19'),
('https://i.pravatar.cc/150?img=20');
