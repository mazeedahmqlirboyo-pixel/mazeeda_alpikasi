import { supabase } from '$lib/supabase';
import { error } from '@sveltejs/kit';

export const load = async () => {
  const { data: sambutan, error: err } = await supabase
    .from('khasanah_sambutan')
    .select('*')
    .order('id', { ascending: true });

  if (err) {
    console.error("Error fetching sambutan:", err);
    throw error(500, 'Gagal memuat data dari database');
  }

  return {
    sambutan: sambutan || []
  };
};
