import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://avvitujfdhjqzcuhfpex.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2dml0dWpmZGhqcXpjdWhmcGV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNTAxMzAsImV4cCI6MjA4NDcyNjEzMH0.FZfYw1Z8yNskYp5uRSlnXaMcRHH5ATlFXWitUwHU7wI';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testUpdate() {
  const { data: comments, error: err1 } = await supabase.from('mading_comments').select('*').limit(1);
  if (err1) {
    console.error('Error fetching:', err1);
    return;
  }
  if (!comments || comments.length === 0) {
    console.log('No comments to update');
    return;
  }
  
  const idToUpdate = comments[0].id;
  const originalText = comments[0].text;
  console.log('Trying to update ID:', idToUpdate);
  
  const { data, error, count } = await supabase.from('mading_comments').update({ text: originalText + ' (edited)' }, { count: 'exact' }).eq('id', idToUpdate);
  console.log('Update result:');
  console.log('Data:', data);
  console.log('Error:', error);
  console.log('Count:', count);
}

testUpdate();
