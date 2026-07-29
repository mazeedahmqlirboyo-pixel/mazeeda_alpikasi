import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.PUBLIC_SUPABASE_ANON_KEY);
async function test() {
  const { data, error } = await supabase.from('app_notifications').insert([{
    target_user: 'ADMIN MAZEEDA',
    title: 'Test',
    message: 'Test message',
    type: 'info',
    icon: 'MessageCircle',
    is_active: true
  }]);
  console.log('Error:', error);
  console.log('Data:', data);
}
test();
