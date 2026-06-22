import { createClient } from "@supabase/supabase-js";

const supabaseUrl = 'https://avvitujfdhjqzcuhfpex.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2dml0dWpmZGhqcXpjdWhmcGV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNTAxMzAsImV4cCI6MjA4NDcyNjEzMH0.FZfYw1Z8yNskYp5uRSlnXaMcRHH5ATlFXWitUwHU7wI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("Fetching some allowed_alumni...");
    const { data, error } = await supabase.from("allowed_alumni").select("nama_lengkap, nis, nama_ayah").limit(5);
    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Allowed Alumni for Login:", JSON.stringify(data, null, 2));
    }
}

run();
