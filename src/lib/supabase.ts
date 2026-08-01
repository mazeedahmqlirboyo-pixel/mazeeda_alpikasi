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

// Client-side image resizer for compression before upload
export const resizeImage = (file: File, maxWidth = 1200, maxHeight = 1200): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (blob) {
              const newFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(newFile);
            } else {
              reject(new Error('Canvas to Blob failed'));
            }
          }, 'image/jpeg', 0.8);
        } else {
          reject(new Error('Canvas context is null'));
        }
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

// Helper to upload custom profile photos with max 2MB size limit and resizing
export const uploadCustomProfilePhoto = async (file: File, userName: string) => {
  // Compress image
  let finalFile = file;
  try {
    finalFile = await resizeImage(file);
  } catch (err) {
    console.error('Image resize failed:', err);
  }

  // 2MB check
  if (finalFile.size > 2 * 1024 * 1024) {
    throw new Error('Ukuran file maksimal 2MB setelah dikompresi.');
  }

  const fileExt = 'jpg';
  const randomName = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const fileName = `${randomName}.${fileExt}`;
  const filePath = `custom_profiles/${fileName}`;
  
  const { data, error } = await supabase.storage
    .from('memories')
    .upload(filePath, finalFile);
    
  if (error) throw error;
  
  const { data: urlData } = supabase.storage
    .from('memories')
    .getPublicUrl(filePath);
    
  // Insert to custom_profile_photos table
  const { data: dbData, error: dbError } = await supabase.from('custom_profile_photos').insert([{
    user_name: userName,
    photo_url: urlData.publicUrl,
    status: 'pending'
  }]).select().single();

  if (dbError) throw dbError;

  // Notifikasi Admin
  try {
    await supabase.from('app_notifications').insert([{
      type: 'system',
      title: 'Foto Profil Baru',
      message: `${userName} mengunggah foto profil tambahan. Silakan periksa di panel admin untuk persetujuan.`,
      icon: 'Image',
      is_read: false
    }]);
  } catch (notifErr) {
    console.error('Failed to send admin notification:', notifErr);
  }

  return { url: urlData.publicUrl, id: dbData.id };
};

