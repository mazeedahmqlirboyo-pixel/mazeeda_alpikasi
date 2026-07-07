import { supabase } from '$lib/supabase';
import { error } from '@sveltejs/kit';

export const load = async () => {
  const { data: units, error: err } = await supabase
    .from('khasanah_units')
    .select('slug, name, type, image_url, short_desc')
    .order('id', { ascending: true });

  if (err) {
    console.error("Error fetching units:", err);
    throw error(500, 'Gagal memuat data dari database');
  }

  return {
    units: units || []
  };
};
