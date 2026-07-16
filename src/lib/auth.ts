import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { supabase } from './supabase';

export interface UserSession {
  role: 'admin' | 'member';
  name: string;
  email: string;
  nis?: string;
  nama_ayah?: string;
  foto_url?: string;
  tahun_lahir?: string;
}

export interface AuthState {
  loading: boolean;
  user: UserSession | null;
}

export const authStore = writable<AuthState>({ loading: true, user: null });
export const activeProfileStore = writable<{ type: 'admin' | 'member'; nameOrNis: string } | null>(null);

// Helper: load saved admin profile (name + foto) from localStorage
function loadSavedAdminProfile(): { name: string; foto_url: string } {
  const defaultFoto = 'https://drive.google.com/file/d/1f332yzKnUHuix7YeAvCgMZm4y2v30CwF/view?usp=drive_link';
  if (!browser) return { name: 'ADMIN MAZEEDA', foto_url: defaultFoto };
  try {
    const savedProfile = localStorage.getItem('mazeeda_admin_profile');
    if (savedProfile) {
      const p = JSON.parse(savedProfile);
      return {
        name: p.nama_lengkap === 'Admin MAZEEDA' ? 'ADMIN MAZEEDA' : (p.nama_lengkap || 'ADMIN MAZEEDA'),
        foto_url: p.foto_url || defaultFoto
      };
    }
  } catch (_) {}
  return { name: 'ADMIN MAZEEDA', foto_url: defaultFoto };
}

export function initAuth() {
  if (!browser) return;

  const stored = localStorage.getItem('mazeeda_logged_user');
  if (stored) {
    try {
      const user = JSON.parse(stored);
      authStore.set({ loading: false, user });

      // Async check for account deactivation (if member)
      if (user.role === 'member' && user.nis) {
        const checkBanStatus = async () => {
          let { data } = await supabase.from('allowed_alumni').select('is_active').eq('nis', user.nis).maybeSingle();
          if (!data) {
            const asat = await supabase.from('asatidzah').select('is_active').eq('nis', user.nis).maybeSingle();
            data = asat.data;
          }
          if (data && data.is_active === false) {
            alert('Sesi Anda telah dihentikan karena akun Anda dinonaktifkan oleh Admin MAZEEDA.');
            logout();
          }
        };
        checkBanStatus();
      }
    } catch (e) {
      localStorage.removeItem('mazeeda_logged_user');
      authStore.set({ loading: false, user: null });
    }
  } else {
    authStore.set({ loading: false, user: null });
  }

  // Monitor Supabase auth changes to sync Admin login state
  supabase.auth.onAuthStateChange((event, session) => {
    if (session?.user) {
      const email = session.user.email || '';
      if (email === 'admin@mazeeda.com') {
        // Load saved profile so custom name/foto are never overwritten by token refresh
        const saved = loadSavedAdminProfile();
        const adminSession: UserSession = {
          role: 'admin',
          name: saved.name,
          email: 'admin@mazeeda.com',
          foto_url: saved.foto_url
        };
        localStorage.setItem('mazeeda_logged_user', JSON.stringify(adminSession));
        authStore.set({ loading: false, user: adminSession });
      }
    } else {
      const currentStored = localStorage.getItem('mazeeda_logged_user');
      if (currentStored) {
        try {
          const parsed = JSON.parse(currentStored);
          if (parsed.role === 'admin') {
            localStorage.removeItem('mazeeda_logged_user');
            authStore.set({ loading: false, user: null });
          }
        } catch (e) {}
      }
    }
  });
}

export function loginAsStudent(studentData: { name: string; email?: string; nis: string; nama_ayah: string; foto_url?: string; tahun_lahir?: string }) {
  if (!browser) return;
  const session: UserSession = {
    role: 'member',
    name: studentData.name,
    email: studentData.email || '',
    nis: studentData.nis,
    nama_ayah: studentData.nama_ayah,
    foto_url: studentData.foto_url,
    tahun_lahir: studentData.tahun_lahir
  };
  localStorage.setItem('mazeeda_logged_user', JSON.stringify(session));
  authStore.set({ loading: false, user: session });
}

export function loginAsAdmin() {
  if (!browser) return;
  // Load saved admin profile so name/foto are preserved on login
  const saved = loadSavedAdminProfile();
  const session: UserSession = {
    role: 'admin',
    name: saved.name,
    email: 'admin@mazeeda.com',
    foto_url: saved.foto_url
  };
  localStorage.setItem('mazeeda_logged_user', JSON.stringify(session));
  authStore.set({ loading: false, user: session });
}

export async function logout() {
  if (!browser) return;
  await supabase.auth.signOut();
  localStorage.removeItem('mazeeda_logged_user');
  authStore.set({ loading: false, user: null });
  window.location.href = '/auth';
}
