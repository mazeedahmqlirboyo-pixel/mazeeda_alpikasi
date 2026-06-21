const https = require('https');

const url = "https://avvitujfdhjqzcuhfpex.supabase.co/rest/v1/allowed_alumni?select=nama_lengkap,foto_url";
const headers = {
    "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2dml0dWpmZGhqcXpjdWhmcGV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNTAxMzAsImV4cCI6MjA4NDcyNjEzMH0.FZfYw1Z8yNskYp5uRSlnXaMcRHH5ATlFXWitUwHU7wI",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2dml0dWpmZGhqcXpjdWhmcGV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNTAxMzAsImV4cCI6MjA4NDcyNjEzMH0.FZfYw1Z8yNskYp5uRSlnXaMcRHH5ATlFXWitUwHU7wI"
};

const req = https.get(url, { headers }, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const list = JSON.parse(data);
            console.log(`Found ${list.length} alumni rows:`);
            list.forEach(item => {
                console.log(`- ${item.nama_lengkap}: "${item.foto_url}"`);
            });
        } catch (e) {
            console.error("Error parsing response:", e);
            console.log("Raw response:", data);
        }
    });
});

req.on('error', (e) => {
    console.error("HTTP Request Error:", e);
});
