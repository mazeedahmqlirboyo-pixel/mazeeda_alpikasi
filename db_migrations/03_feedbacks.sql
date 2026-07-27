-- Create feedbacks table
CREATE TABLE IF NOT EXISTS public.feedbacks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_name TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

-- Policies
-- Anyone authenticated can insert a feedback
CREATE POLICY "Authenticated users can insert feedbacks" ON public.feedbacks
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Only admin can view and update/delete feedbacks
-- For simplicity, we allow all authenticated users to insert, but only admin can read/update/delete.
-- Note: Replace 'admin@mazeeda.com' with the actual admin email if different.
CREATE POLICY "Admins can view all feedbacks" ON public.feedbacks
    FOR SELECT
    TO authenticated
    USING (auth.jwt() ->> 'email' = 'admin@mazeeda.com');

CREATE POLICY "Admins can update feedbacks" ON public.feedbacks
    FOR UPDATE
    TO authenticated
    USING (auth.jwt() ->> 'email' = 'admin@mazeeda.com');

CREATE POLICY "Admins can delete feedbacks" ON public.feedbacks
    FOR DELETE
    TO authenticated
    USING (auth.jwt() ->> 'email' = 'admin@mazeeda.com');
