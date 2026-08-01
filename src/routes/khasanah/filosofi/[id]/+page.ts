import { supabase } from '$lib/supabase';
import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
  const { data: filosofi, error: err } = await supabase
    .from('khasanah_filosofi')
    .select('*')
    .eq('slug', params.id)
    .single();

  if (err || !filosofi) {
    console.error("Error fetching filosofi detail:", err);
    throw error(404, 'Logo tidak ditemukan');
  }

  return {
    filosofi
  };
};
