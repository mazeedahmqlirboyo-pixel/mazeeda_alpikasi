import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://avvitujfdhjqzcuhfpex.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2dml0dWpmZGhqcXpjdWhmcGV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNTAxMzAsImV4cCI6MjA4NDcyNjEzMH0.FZfYw1Z8yNskYp5uRSlnXaMcRHH5ATlFXWitUwHU7wI';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDelete() {
  // First get a comment to delete
  const { data: comments, error: err1 } = await supabase.from('mading_comments').select('*').limit(1);
  if (err1) {
    console.error('Error fetching:', err1);
    return;
  }
  if (!comments || comments.length === 0) {
    console.log('No comments to delete');
    return;
  }
  
  const idToDelete = comments[0].id;
  console.log('Trying to delete ID:', idToDelete);
  
  // Try to delete it
  const { data, error, count } = await supabase.from('mading_comments').delete({ count: 'exact' }).eq('id', idToDelete);
  console.log('Delete result:');
  console.log('Data:', data);
  console.log('Error:', error);
  console.log('Count:', count);
}

testDelete();
