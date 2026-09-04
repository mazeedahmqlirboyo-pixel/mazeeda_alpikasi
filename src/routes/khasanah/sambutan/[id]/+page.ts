import { supabase } from '$lib/supabase';
import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
  const { id } = params;

  const { data: item, error: err } = await supabase
    .from('khasanah_sambutan')
    .select('*')
    .eq('id', id)
    .single();

  if (err || !item) {
    console.error("Error fetching sambutan detail:", err);
    throw error(404, 'Data tidak ditemukan');
  }

  return {
    item
  };
};
