import { createClient } from "@supabase/supabase-js";

const supabaseUrl = 'https://avvitujfdhjqzcuhfpex.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2dml0dWpmZGhqcXpjdWhmcGV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNTAxMzAsImV4cCI6MjA4NDcyNjEzMH0.FZfYw1Z8yNskYp5uRSlnXaMcRHH5ATlFXWitUwHU7wI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("Checking admin_profile...");
    const { data, error } = await supabase.from("admin_profile").select("*");
    if (error) {
        console.error("Error fetching admin_profile:", error);
    } else {
        console.log("Admin Profile Rows:", data);
    }
}

run();
