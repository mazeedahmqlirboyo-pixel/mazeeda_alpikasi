import { supabase } from '$lib/supabase';
import { error } from '@sveltejs/kit';

export const prerender = false;

export const load = async ({ params }: { params: { slug: string } }) => {
  const { data: kyai, error: err } = await supabase
    .from('khasanah_mozaik')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (err || !kyai) {
    console.error("Error fetching mozaik detail:", err);
    throw error(404, 'Data tidak ditemukan');
  }

  return {
    kyai
  };
};
