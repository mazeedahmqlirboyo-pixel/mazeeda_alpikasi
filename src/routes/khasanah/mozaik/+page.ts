import { supabase } from '$lib/supabase';
import { error } from '@sveltejs/kit';

export const load = async () => {
  const { data: mozaik, error: err } = await supabase
    .from('khasanah_mozaik')
    .select('slug, name, title, image_url, short_desc')
    .order('id', { ascending: true });

  if (err) {
    console.error("Error fetching mozaik:", err);
    throw error(500, 'Gagal memuat data dari database');
  }

  return {
    mozaik: mozaik || []
  };
};
