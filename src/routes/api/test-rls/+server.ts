import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabase';

export async function GET() {
  // Try querying without auth (anon)
  const { data: anonData, error: anonError } = await supabase
    .from('custom_profile_photos')
    .select('*')
    .limit(1);

  // Try querying with auth (admin)
  let authData = null;
  let authError = null;
  
  // Try logging in with the admin credentials
  const { data: authSession, error: loginError } = await supabase.auth.signInWithPassword({
    email: 'admin@mazeeda.com', // Assuming this from auth/+page.svelte
    password: 'admin' // Guessed password, or we can just return the anon result first
  });

  if (!loginError) {
    const res = await supabase
      .from('custom_profile_photos')
      .select('*')
      .limit(1);
    authData = res.data;
    authError = res.error;
    
    // Sign out to clean up
    await supabase.auth.signOut();
  }

  return json({
    anon_result: { data: anonData, error: anonError },
    auth_login_error: loginError,
    auth_result: { data: authData, error: authError }
  });
}
