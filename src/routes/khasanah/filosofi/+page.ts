import { supabase } from '$lib/supabase';
import { error } from '@sveltejs/kit';

export const load = async () => {
  const { data: filosofi, error: err } = await supabase
    .from('khasanah_filosofi')
    .select('slug, title, image_url, description')
    .order('id', { ascending: true });

  if (err) {
    console.error("Error fetching filosofi:", err);
    throw error(500, 'Gagal memuat data dari database');
  }

  return {
    filosofi: filosofi || []
  };
};
