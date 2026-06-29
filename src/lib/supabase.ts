import { createClient } from '@supabase/supabase-js';

// Environment variables configuration for Supabase integration.
// Fallback defaults are provided for building/running the UI skeleton even without config.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://avvitujfdhjqzcuhfpex.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2dml0dWpmZGhqcXpjdWhmcGV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNTAxMzAsImV4cCI6MjA4NDcyNjEzMH0.FZfYw1Z8yNskYp5uRSlnXaMcRHH5ATlFXWitUwHU7wI';


export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Realtime subscriptions helper for Mading (announcement board)
export const subscribeToMading = (callback: (payload: any) => void) => {
  return supabase
    .channel('mading-realtime-channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'mading' },
      (payload) => callback(payload)
    )
    .subscribe();
};

// Storage helper for Timeline memory photos
export const uploadMemoryPhoto = async (file: File, folderName: string = 'timeline') => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${folderName}/${fileName}`;
  
  const { data, error } = await supabase.storage
    .from('memories')
    .upload(filePath, file);
    
  if (error) throw error;
  
  const { data: urlData } = supabase.storage
    .from('memories')
    .getPublicUrl(filePath);
    
  return urlData.publicUrl;
};

// Storage helper for Profile photos (Batch Upload)
export const uploadProfilePhoto = async (file: File) => {
  const fileExt = file.name.split('.').pop();
  const randomName = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const fileName = `${randomName}.${fileExt}`;
  const filePath = `profiles/${fileName}`;
  
  const { data, error } = await supabase.storage
    .from('memories')
    .upload(filePath, file);
    
  if (error) throw error;
  
  const { data: urlData } = supabase.storage
    .from('memories')
    .getPublicUrl(filePath);
    
  return urlData.publicUrl;
};
