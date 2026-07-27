import fs from 'fs';
const env = fs.readFileSync('.env', 'utf8');
const url = env.match(/PUBLIC_SUPABASE_URL=(.*)/)[1].trim().replace(/"/g, '').replace(/'/g, '');
const key = env.match(/PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim().replace(/"/g, '').replace(/'/g, '');
fetch(url + '/rest/v1/custom_profile_photos', {
  headers: { 'apikey': key, 'Authorization': 'Bearer ' + key }
}).then(res => res.json()).then(data => console.log(JSON.stringify(data, null, 2))).catch(err => console.error(err.message));
