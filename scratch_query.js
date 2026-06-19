import { createClient } from "@supabase/supabase-js";

const supabaseUrl = 'https://avvitujfdhjqzcuhfpex.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2dml0dWpmZGhqcXpjdWhmcGV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNTAxMzAsImV4cCI6MjA4NDcyNjEzMH0.FZfYw1Z8yNskYp5uRSlnXaMcRHH5ATlFXWitUwHU7wI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("Checking allowed_alumni columns...");
    const { data, error } = await supabase.from("allowed_alumni").select("*").limit(1);
    if (error) {
        console.error("Error fetching allowed_alumni:", error);
    } else if (data && data.length > 0) {
        console.log("Columns:", Object.keys(data[0]));
        console.log("Sample Data:", data[0]);
    } else {
        console.log("No records found in allowed_alumni.");
    }
}

run();
