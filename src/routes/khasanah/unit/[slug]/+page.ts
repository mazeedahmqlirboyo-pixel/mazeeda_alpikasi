import { supabase } from '$lib/supabase';
import { error } from '@sveltejs/kit';

export const prerender = false;

export const load = async ({ params }: { params: { slug: string } }) => {
  const { data: unit, error: err } = await supabase
    .from('khasanah_units')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (err || !unit) {
    console.error("Error fetching unit detail:", err);
    throw error(404, 'Data tidak ditemukan');
  }

  return {
    unit
  };
};
