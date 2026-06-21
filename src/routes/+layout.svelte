<script lang="ts">
  import '../app.postcss';
  import { page } from '$app/stores';
  import { fade, slide } from 'svelte/transition';
  import { 
    LayoutDashboard, 
    Users, 
    Megaphone, 
    BookOpen, 
    Sparkles, 
    Image, 
    ShieldCheck, 
    LogIn,
    LogOut,
    UserCheck,
    ChevronRight,
    ArrowLeft,
    User,
    Award,
    Globe,
    Music,
    Heart,
    Bell,
    Edit,
    Save,
    ExternalLink
  } from 'lucide-svelte';
  import Card from '$lib/components/ui/card.svelte';
  import { isAudioPlayingGlobal } from '$lib/audioStore';
  import { supabase } from '$lib/supabase';
  import { deferredPrompt, showInstallBtn } from '$lib/pwaStore';

  // Define navigation configuration
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Squad', path: '/squad', icon: Users },
    { name: 'Mading', path: '/mading', icon: Megaphone },
    { name: 'Al-Qur\'an', path: '/quran', icon: BookOpen },
    { name: 'Sangu', path: '/sangu', icon: Sparkles },
    { name: 'Timeline', path: '/timeline', icon: Image }
  ];

  // Helper to check if a navigation item is active
  $: currentPath = $page.url.pathname;
  $: isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  // Do not show full layouts (sidebar / bottom-nav) on the Auth page
  $: isAuthPage = currentPath === '/auth';
  
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { authStore, initAuth, logout, activeProfileStore } from '$lib/auth';

  $: userRole = $authStore.user?.role || '';




  // Client-side routing redirects based on auth store
  $: if (browser && !$authStore.loading) {
    if (!$authStore.user && !isAuthPage) {
      goto('/auth');
    } else if ($authStore.user && isAuthPage) {
      goto('/');
    } else if ($authStore.user && $authStore.user.role !== 'admin' && currentPath.startsWith('/admin')) {
      goto('/');
    }
  }

  function handleLogout() {
    showLogoutModal = true;
  }

  async function confirmLogout() {
    showLogoutModal = false;
    await logout();
  }

  // Sync profile photo for users who logged in before the update
  $: if (browser && $authStore.user && $authStore.user.role === 'member' && !$authStore.user.foto_url) {
    syncProfilePhoto();
  }

  async function syncProfilePhoto() {
    const currentUser = $authStore.user;
    if (!currentUser || currentUser.foto_url) return;
    
    try {
      const { data, error } = await supabase
        .from('allowed_alumni')
        .select('foto_url')
        .eq('nis', currentUser.nis)
        .maybeSingle();
        
      if (!error && data && data.foto_url) {
        const updated = { ...currentUser, foto_url: data.foto_url };
        localStorage.setItem('mazeeda_logged_user', JSON.stringify(updated));
        authStore.update(state => ({ ...state, user: updated }));
      }
    } catch (e) {
      console.error('Failed to sync profile photo:', e);
    }
  }

  // Convert Google Drive share link to direct image link
  function convertDriveUrl(url: string) {
    if (!url) return "";
    let cleaned = url.trim();
    if (cleaned.includes("lh3.googleusercontent.com/u/0/d/")) {
      return cleaned.replace("lh3.googleusercontent.com/u/0/d/", "lh3.googleusercontent.com/d/");
    }
    const match = cleaned.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || 
                  cleaned.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800`;
    }
    return cleaned;
  }

  // Profile Overlay State & Helpers
  let showMyProfile = false;
  let myProfileData: any = null;
  let isLoadingProfile = false;

  // Logout Confirmation Modal State
  let showLogoutModal = false;

  // Lightbox State (untuk zoom foto profil)
  let showLightbox = false;
  let lightboxUrl = '';
  function openLightbox(url: string) {
    lightboxUrl = url;
    showLightbox = true;
  }
  function closeLightbox() {
    showLightbox = false;
    lightboxUrl = '';
  }
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      if (showLightbox) closeLightbox();
      if (showLogoutModal) showLogoutModal = false;
    }
  }

  // Admin Profile Edit State
  let isEditingAdminProfile = false;
  let adminEditForm: any = {};

  const DEFAULT_ADMIN_PROFILE = {
    nama_lengkap: 'ADMIN MAZEEDA',
    nama_panggilan: 'Admin',
    email: 'admin@mazeeda.com',
    foto_url: 'https://drive.google.com/file/d/1f332yzKnUHuix7YeAvCgMZm4y2v30CwF/view?usp=drive_link',
    no_whatsapp: '',
    media_social: '',
    tiktok_akun: '',
    xtwitter_akun: '',
    facebook_akun: '',
    alamat_domisili: '',
    alamat_ktp: '',
    rute_lengkap: '',
    hobi: '',
    keterampilan_khusus: '',
    music: '',
    kutipan_kenangan: '',
    kesan: '',
    pesan: '',
    tempat_lahir: '',
    tahun_lahir: '',
    golongan_darah: 'O',
    tahun_masuk: '',
    kamar_santri: '',
    tahfidz_santri: '',
    riwayat_pendidikan: '',
    alamat_riwayatpendidikan: ''
  };

  // Load profil admin dari localStorage (fallback/cache)
  function loadAdminProfileFromCache() {
    if (!browser) return DEFAULT_ADMIN_PROFILE;
    try {
      const saved = localStorage.getItem('mazeeda_admin_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.foto_url) {
          parsed.foto_url = DEFAULT_ADMIN_PROFILE.foto_url;
        }
        return { ...DEFAULT_ADMIN_PROFILE, ...parsed };
      }
    } catch (_) {}
    return { ...DEFAULT_ADMIN_PROFILE };
  }

  // Load profil admin dari Supabase (source of truth untuk semua user)
  async function fetchAdminProfileFromDB(): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('admin_profile')
        .select('*')
        .eq('id', 1)
        .maybeSingle();
      if (!error && data) {
        if (!data.foto_url) {
          data.foto_url = DEFAULT_ADMIN_PROFILE.foto_url;
        }
        // Simpan ke cache localStorage juga
        if (browser) localStorage.setItem('mazeeda_admin_profile', JSON.stringify(data));
        return { ...DEFAULT_ADMIN_PROFILE, ...data };
      }
    } catch (_) {}
    // Fallback ke cache localStorage
    return loadAdminProfileFromCache();
  }

  async function saveAdminProfile() {
    if (!browser) return;

    // 1. Simpan ke Supabase (agar semua user bisa lihat)
    try {
      const { error } = await supabase
        .from('admin_profile')
        .upsert({ id: 1, ...adminEditForm, updated_at: new Date().toISOString() }, { onConflict: 'id' });
      if (error) {
        console.error('Gagal simpan profil admin ke Supabase:', error.message);
      }
    } catch (e) {
      console.error('Error saat upsert admin profile:', e);
    }

    // 2. Simpan ke localStorage sebagai cache
    localStorage.setItem('mazeeda_admin_profile', JSON.stringify(adminEditForm));
    myProfileData = { ...adminEditForm };

    // 3. Sync name, foto_url, email ke authStore agar header & sidebar langsung update
    authStore.update(state => ({
      ...state,
      user: state.user ? {
        ...state.user,
        name: adminEditForm.nama_lengkap || state.user.name,
        foto_url: adminEditForm.foto_url || '',
        email: adminEditForm.email || state.user.email
      } : state.user
    }));

    // 4. Update localStorage sesi admin agar tetap sinkron setelah refresh
    const storedUser = localStorage.getItem('mazeeda_logged_user');
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        localStorage.setItem('mazeeda_logged_user', JSON.stringify({
          ...u,
          name: adminEditForm.nama_lengkap || u.name,
          foto_url: adminEditForm.foto_url || '',
          email: adminEditForm.email || u.email
        }));
      } catch (_) {}
    }
    isEditingAdminProfile = false;
  }


  function startEditAdminProfile() {
    adminEditForm = { ...myProfileData };
    isEditingAdminProfile = true;
  }

  // Buka profil Admin secara publik (untuk semua user — fetch dari Supabase)
  async function openAdminPublicProfile() {
    showMyProfile = true;
    isEditingAdminProfile = false;
    isLoadingProfile = true;
    myProfileData = loadAdminProfileFromCache(); // tampilkan cache dulu saat loading
    myProfileData = await fetchAdminProfileFromDB();
    isLoadingProfile = false;
  }

  // ── Notifikasi (App Notifications) ──
  let notifications: any[] = [];
  let showNotifPanel = false;
  let readNotifIds: string[] = [];
  let notifChannel: any;

  $: unreadCount = notifications.filter(n => n.is_active && !readNotifIds.includes(String(n.id))).length;

  async function fetchNotifications() {
    try {
      const { data, error } = await supabase
        .from('app_notifications')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (!error && data) notifications = data;
    } catch (_) {}
  }

  function openNotifPanel() {
    showNotifPanel = !showNotifPanel;
    if (showNotifPanel) {
      // tandai semua yang tampil sebagai sudah dibaca
      const newRead = [...new Set([...readNotifIds, ...notifications.map(n => String(n.id))])];
      readNotifIds = newRead;
      if (browser) localStorage.setItem('mazeeda_read_notifs', JSON.stringify(newRead));
    }
  }

  function getNotifStyle(type: string) {
    switch (type) {
      case 'success': return { bg: 'bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500', text: 'text-emerald-700' };
      case 'warning': return { bg: 'bg-amber-50 border-amber-200', dot: 'bg-amber-500', text: 'text-amber-700' };
      case 'urgent':  return { bg: 'bg-rose-50 border-rose-200',   dot: 'bg-rose-500',   text: 'text-rose-700' };
      default:        return { bg: 'bg-blue-50 border-blue-200',    dot: 'bg-blue-500',   text: 'text-blue-700' };
    }
  }

  // Bottom nav — hidden by default, muncul saat klik tombol Menu, auto-hide 3 detik
  let showBottomNav = false;
  let autoHideTimer: ReturnType<typeof setTimeout> | null = null;

  // ── Swipe-to-Back (Android style) — kedua sisi ──
  let swipeStartX = 0;
  let swipeStartY = 0;
  let swipeDelta = 0;          // seberapa jauh sudah di-drag (px)
  let isSwiping = false;       // apakah sedang swipe back aktif
  let swipeSide: 'left' | 'right' = 'left'; // sisi mana yang mulai
  const EDGE_ZONE = 40;        // zona tepi (px dari kiri/kanan)
  const TRIGGER_DIST = 80;     // jarak minimum untuk trigger back

  function onTouchStart(e: TouchEvent) {
    const t = e.touches[0];
    const screenW = window.innerWidth;
    if (t.clientX <= EDGE_ZONE) {
      // Mulai dari tepi KIRI → swipe ke kanan
      swipeStartX = t.clientX;
      swipeStartY = t.clientY;
      swipeDelta = 0;
      isSwiping = true;
      swipeSide = 'left';
    } else if (t.clientX >= screenW - EDGE_ZONE) {
      // Mulai dari tepi KANAN → swipe ke kiri
      swipeStartX = t.clientX;
      swipeStartY = t.clientY;
      swipeDelta = 0;
      isSwiping = true;
      swipeSide = 'right';
    }
  }

  function onTouchMove(e: TouchEvent) {
    if (!isSwiping) return;
    const t = e.touches[0];
    const rawDx = t.clientX - swipeStartX;
    const dy = Math.abs(t.clientY - swipeStartY);
    // Hitung dx sesuai arah yang diharapkan
    const dx = swipeSide === 'left' ? rawDx : -rawDx;
    // Batalkan kalau lebih banyak vertikal
    if (dy > Math.abs(rawDx)) { isSwiping = false; swipeDelta = 0; return; }
    if (dx > 0) {
      swipeDelta = Math.min(dx, 140);
    } else {
      swipeDelta = 0;
    }
  }

  function onTouchEnd() {
    if (isSwiping && swipeDelta >= TRIGGER_DIST) {
      history.back();
    }
    isSwiping = false;
    swipeDelta = 0;
  }

  onMount(() => {
    initAuth();
    if (browser) {
      // Validate if logged-in member still exists in the database
      const u = $authStore.user;
      if (u && u.role === 'member' && u.nis) {
        supabase.from('allowed_alumni').select('id').eq('nis', u.nis).maybeSingle().then(({ data, error }) => {
          if (!data || error) {
            console.warn('User no longer exists in database. Forcing logout.');
            logout();
          }
        });
      }

      window.addEventListener('touchstart', onTouchStart, { passive: true });
      window.addEventListener('touchmove', onTouchMove, { passive: true });
      window.addEventListener('touchend', onTouchEnd);

      // Register Service Worker with Auto-Update logic
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
          .then((reg) => {
            console.log('Service Worker Registered with scope:', reg.scope);
            
            // Listen for updates to the Service Worker
            reg.addEventListener('updatefound', () => {
              const newWorker = reg.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log('New version detected! Reloading to apply updates...');
                    window.location.reload();
                  }
                });
              }
            });
          })
          .catch((err) => console.error('Service worker registration failed:', err));
      }

      // Listen for PWA installation prompt
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt.set(e);
        showInstallBtn.set(true);
        console.log('beforeinstallprompt event fired');
      });

      // Listen for PWA installed event
      window.addEventListener('appinstalled', () => {
        deferredPrompt.set(null);
        showInstallBtn.set(false);
        console.log('App successfully installed!');
      });

      // Load read notif ids from localStorage
      try {
        const saved = localStorage.getItem('mazeeda_read_notifs');
        if (saved) readNotifIds = JSON.parse(saved);
      } catch (_) {}

      // Fetch and cache the admin profile from Supabase so it's available globally on mount
      fetchAdminProfileFromDB().then((profile) => {
        if (profile) {
          myProfileData = profile;
          // If the logged in user is admin, sync to authStore so they have the loaded profile picture
          if ($authStore.user?.role === 'admin') {
            authStore.update(state => state.user ? {
              ...state,
              user: {
                ...state.user,
                name: profile.nama_lengkap || state.user.name,
                foto_url: profile.foto_url || state.user.foto_url
              }
            } : state);
          }
        }
      });
    }
    fetchNotifications();

    // Realtime: dengarkan perubahan app_notifications
    notifChannel = supabase
      .channel('app_notifications_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_notifications' }, () => {
        fetchNotifications();
      })
      .subscribe();
  });

  onDestroy(() => {
    if (browser) {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    }
    if (notifChannel) supabase.removeChannel(notifChannel);
  });

  function showNavMenu() {
    showBottomNav = true;
    if (autoHideTimer) clearTimeout(autoHideTimer);
    autoHideTimer = setTimeout(() => {
      showBottomNav = false;
    }, 3000);
  }

  // Reset timer setiap kali user masih berinteraksi dengan nav
  function resetAutoHide() {
    if (!showBottomNav) return;
    if (autoHideTimer) clearTimeout(autoHideTimer);
    autoHideTimer = setTimeout(() => {
      showBottomNav = false;
    }, 3000);
  }

  // Generate Initials
  function getInitials(name: string) {
    if (!name) return 'M';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  // Capitalize each word
  function capitalizeEachWord(str: string) {
    if (!str) return '-';
    return str
      .toLowerCase()
      .split(' ')
      .map(word => {
        if (word.startsWith('@')) {
          return '@' + word.slice(1).charAt(0).toUpperCase() + word.slice(2);
        }
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
  }

  // Format WhatsApp numbers to start with 0
  function formatWhatsApp(phone: string) {
    if (!phone) return '-';
    let cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('62')) {
      cleaned = '0' + cleaned.slice(2);
    } else if (cleaned.startsWith('8')) {
      cleaned = '0' + cleaned;
    }
    return cleaned;
  }

  // Get correct link for wa.me API (must start with 62 instead of 0)
  function getWhatsAppLink(phone: string) {
    if (!phone) return '#';
    let cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.slice(1);
    }
    return 'https://wa.me/' + cleaned;
  }

  // Link helper functions for social media handles
  function getInstagramLink(ig: string) {
    if (!ig) return '#';
    let handle = ig.trim();
    if (handle.startsWith('http')) return handle;
    if (handle.startsWith('@')) {
      handle = handle.slice(1);
    }
    return `https://instagram.com/${handle}`;
  }

  function getTiktokLink(tiktok: string) {
    if (!tiktok) return '#';
    let handle = tiktok.trim();
    if (handle.startsWith('http')) return handle;
    if (handle.startsWith('@')) {
      handle = handle.slice(1);
    }
    return `https://tiktok.com/@${handle}`;
  }

  function getFacebookLink(fb: string) {
    if (!fb) return '#';
    let handle = fb.trim();
    if (handle.startsWith('http')) return handle;
    return `https://facebook.com/${handle}`;
  }

  function getXTwitterLink(xtwitter: string) {
    if (!xtwitter) return '#';
    let handle = xtwitter.trim();
    if (handle.startsWith('http')) return handle;
    if (handle.startsWith('@')) {
      handle = handle.slice(1);
    }
    return `https://x.com/${handle}`;
  }

  function getYouTubeId(url: string) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.trim().match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  async function openMyProfile() {
    if (!$authStore.user) return;
    showMyProfile = true;
    isEditingAdminProfile = false;
    
    if ($authStore.user.role === 'admin') {
      isLoadingProfile = true;
      myProfileData = loadAdminProfileFromCache();
      myProfileData = await fetchAdminProfileFromDB();
      isLoadingProfile = false;
      return;
    }

    try {
      isLoadingProfile = true;
      const { data, error } = await supabase
        .from('allowed_alumni')
        .select('*')
        .eq('nis', $authStore.user.nis)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        myProfileData = data;
      } else {
        const { data: nameData, error: nameError } = await supabase
          .from('allowed_alumni')
          .select('*')
          .eq('nama_lengkap', $authStore.user.name)
          .maybeSingle();
        if (nameError) throw nameError;
        myProfileData = nameData || $authStore.user;
      }
    } catch (err) {
      console.error('Failed to fetch full profile:', err);
      myProfileData = $authStore.user;
    } finally {
      isLoadingProfile = false;
    }
  }

  // Reactive: Check if the viewed profile belongs to the currently logged in user
  $: isOwnProfile = $authStore.user && myProfileData && (
    ($authStore.user.role === 'admin' && myProfileData.role === 'admin') || 
    (myProfileData.nis === $authStore.user.nis)
  );

  // Close profile on route changes
  $: if (currentPath) {
    showMyProfile = false;
    isEditingAdminProfile = false;
  }

  function handleNavClick() {
    showMyProfile = false;
    isEditingAdminProfile = false;
  }

  // Reactive listener to open other alumni/admin profiles when clicked
  $: if (browser && $activeProfileStore) {
    const trigger = $activeProfileStore;
    activeProfileStore.set(null); // Reset store
    openPublicProfile(trigger.type, trigger.nameOrNis);
  }

  async function openPublicProfile(type: 'admin' | 'member', nameOrNis: string) {
    showMyProfile = true;
    isEditingAdminProfile = false;
    isLoadingProfile = true;

    if (type === 'admin') {
      myProfileData = await fetchAdminProfileFromDB();
      isLoadingProfile = false;
      return;
    }

    try {
      let query = supabase.from('allowed_alumni').select('*');
      if (/^\d+$/.test(nameOrNis)) {
        query = query.eq('nis', nameOrNis);
      } else {
        query = query.ilike('nama_lengkap', nameOrNis);
      }
      let { data, error } = await query.maybeSingle();
      if (error || !data) {
        // Fallback: search case-insensitive name if NIS search failed or vice-versa
        const { data: fallbackData } = await supabase
          .from('allowed_alumni')
          .select('*')
          .ilike('nama_lengkap', nameOrNis)
          .maybeSingle();
        data = fallbackData;
      }

      if (data) {
        myProfileData = data;
      } else {
        myProfileData = {
          nama_lengkap: nameOrNis,
          nama_panggilan: nameOrNis.split(' ')[0],
          status: 'Alumni',
          category: 'Siswa'
        };
      }
    } catch (err) {
      console.error('Failed to fetch public profile:', err);
      myProfileData = {
        nama_lengkap: nameOrNis,
        nama_panggilan: nameOrNis.split(' ')[0],
        status: 'Alumni',
        category: 'Siswa'
      };
    } finally {
      isLoadingProfile = false;
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- ===== PHOTO LIGHTBOX MODAL ===== -->
{#if showLightbox}
  <div 
    class="fixed inset-0 z-[99999] flex items-center justify-center p-4"
    style="background: rgba(0,0,0,0.85); backdrop-filter: blur(8px);"
    on:click={closeLightbox}
    transition:fade={{ duration: 200 }}
  >
    <!-- Close Button -->
    <button
      type="button"
      on:click|stopPropagation={closeLightbox}
      class="absolute top-4 right-4 z-10 h-10 w-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors"
      title="Tutup (Esc)"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
    </button>

    <!-- Foto Besar -->
    <div 
      class="max-w-sm w-full mx-auto"
      on:click|stopPropagation
      style="animation: lightboxZoomIn 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;"
    >
      <img 
        src={lightboxUrl} 
        alt="Foto Profil"
        class="w-full rounded-3xl shadow-2xl object-cover border-2 border-white/20"
        style="max-height: 80vh; object-fit: contain;"
        on:error={(e) => { closeLightbox(); }}
      />
      <p class="text-center text-white/60 text-xs font-semibold mt-3">Tekan Esc atau klik di luar untuk menutup</p>
    </div>
  </div>
{/if}

<style>
  @keyframes lightboxZoomIn {
    from { opacity: 0; transform: scale(0.7); }
    to   { opacity: 1; transform: scale(1); }
  }
</style>

<!-- Swipe-to-Back Visual Indicator -->
{#if isSwiping && swipeDelta > 8}
  <!-- Indikator dari KIRI -->
  {#if swipeSide === 'left'}
    <div
      class="fixed left-0 top-1/2 z-[9999] flex items-center pointer-events-none"
      style="transform: translateY(-50%) translateX({swipeDelta - 48}px); opacity: {Math.min(swipeDelta / TRIGGER_DIST, 1)};"
    >
      <div class="h-12 w-12 rounded-full bg-slate-800/80 backdrop-blur-sm flex items-center justify-center shadow-xl ml-2"
        style="transform: scale({0.7 + (swipeDelta / TRIGGER_DIST) * 0.3});"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
      </div>
      {#if swipeDelta >= TRIGGER_DIST}
        <span class="ml-2 text-[10px] font-black text-slate-800 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow border border-slate-200">Lepaskan</span>
      {/if}
    </div>
  <!-- Indikator dari KANAN -->
  {:else}
    <div
      class="fixed right-0 top-1/2 z-[9999] flex flex-row-reverse items-center pointer-events-none"
      style="transform: translateY(-50%) translateX({-(swipeDelta - 48)}px); opacity: {Math.min(swipeDelta / TRIGGER_DIST, 1)};"
    >
      <div class="h-12 w-12 rounded-full bg-slate-800/80 backdrop-blur-sm flex items-center justify-center shadow-xl mr-2"
        style="transform: scale({0.7 + (swipeDelta / TRIGGER_DIST) * 0.3});"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </div>
      {#if swipeDelta >= TRIGGER_DIST}
        <span class="mr-2 text-[10px] font-black text-slate-800 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow border border-slate-200">Lepaskan</span>
      {/if}
    </div>
  {/if}
{/if}

<div class="min-h-screen flex flex-col bg-white text-slate-800">
  {#if $authStore.loading}
    <!-- Loading Screen while verifying session -->
    <main class="flex-1 flex flex-col items-center justify-center p-4 bg-slate-50 min-h-screen">
      <div class="flex flex-col items-center space-y-3">
        <div class="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
        <p class="text-xs font-semibold text-slate-400">Memuat Sesi...</p>
      </div>
    </main>
  {:else if isAuthPage}
    <!-- Full-screen layout for Auth page without standard navigation bars -->
    <main class="flex-1 flex items-center justify-center p-4 bg-slate-50">
      {#key currentPath}
        <div in:fade={{ duration: 250, delay: 100 }} out:fade={{ duration: 150 }} class="w-full max-w-md">
          <slot />
        </div>
      {/key}
    </main>
  {:else}
    <!-- App layout for general modules -->
    
    <!-- Top Header for Branding & Mobile Settings -->
    <header class="sticky top-0 z-40 w-full bg-white/85 backdrop-blur-md border-b border-border/50 h-16 px-4 flex items-center justify-between md:px-8">
      <a href="/" class="flex items-center space-x-3 group" on:click={handleNavClick}>
        <img 
          src="/logo.png" 
          alt="MAZEEDA Logo" 
          class="h-9 w-9 object-contain rounded-xl shadow-soft-sm group-hover:scale-105 transition-transform" 
          on:error={(e) => { e.currentTarget.style.display = 'none'; }} 
        />
        <span class="font-bold text-xl tracking-tight text-slate-800">MAZEEDA</span>
      </a>
      
      <div class="flex items-center space-x-3">
        {#if userRole === 'admin'}
          <a 
            href="/admin" 
            class="hidden md:flex items-center space-x-2 text-xs font-semibold px-3 py-1.5 rounded-lg border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
            on:click={handleNavClick}
          >
            <ShieldCheck class="h-4.5 w-4.5" />
            <span>Admin Panel</span>
          </a>
        {/if}
        
        {#if $authStore.user}
          <div class="flex items-center space-x-2">
            <!-- 🔔 Notification Bell Button -->
            <div class="relative">
              <button
                on:click={openNotifPanel}
                class="relative h-9 w-9 rounded-full flex items-center justify-center border transition-all duration-200
                  {showNotifPanel ? 'bg-primary text-white border-primary' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-primary'}
                  shadow-soft-sm cursor-pointer"
                title="Notifikasi"
                style="min-height: 36px; min-width: 36px;"
              >
                <Bell class="h-4.5 w-4.5" />
                {#if unreadCount > 0}
                  <span class="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center shadow">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                {/if}
              </button>

              <!-- Notification Dropdown Panel -->
              {#if showNotifPanel}
                <!-- Backdrop -->
                <button
                  type="button"
                  class="fixed inset-0 z-40 cursor-default bg-transparent"
                  on:click={() => showNotifPanel = false}
                  aria-label="Tutup notifikasi"
                ></button>

                <div
                  class="absolute right-0 top-[calc(100%+10px)] z-50 w-80 bg-white border border-slate-200/80 rounded-2xl shadow-xl overflow-hidden"
                  transition:fade={{ duration: 150 }}
                >
                  <!-- Header -->
                  <div class="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                      <Bell class="h-4 w-4 text-primary" />
                      <span class="text-sm font-black text-slate-800">Notifikasi</span>
                    </div>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{notifications.length} pesan</span>
                  </div>

                  <!-- List -->
                  <div class="max-h-80 overflow-y-auto divide-y divide-slate-50">
                    {#if notifications.length === 0}
                      <div class="py-10 text-center">
                        <Bell class="h-8 w-8 text-slate-200 mx-auto mb-2" />
                        <p class="text-xs text-slate-400 font-semibold">Belum ada notifikasi</p>
                      </div>
                    {:else}
                      {#each notifications as notif (notif.id)}
                        {@const style = getNotifStyle(notif.type)}
                        <div class="px-4 py-3 hover:bg-slate-50/80 transition-colors {style.bg} border-l-4">
                          <div class="flex items-start gap-2.5">
                            <span class="mt-1.5 h-2 w-2 rounded-full shrink-0 {style.dot}"></span>
                            <div class="flex-1 min-w-0">
                              <p class="text-xs font-black text-slate-800 leading-snug">{notif.title}</p>
                              {#if notif.message}
                                <p class="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{notif.message}</p>
                              {/if}
                              <p class="text-[10px] {style.text} font-bold mt-1 uppercase tracking-wide">{notif.type}</p>
                            </div>
                          </div>
                        </div>
                      {/each}
                    {/if}
                  </div>

                  <!-- Footer -->
                  <div class="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50">
                    <p class="text-[10px] text-slate-400 font-semibold text-center">
                      Notifikasi dari 
                      <button 
                        type="button"
                        on:click={() => { showNotifPanel = false; openAdminPublicProfile(); }}
                        class="font-black text-primary hover:text-primary-hover transition-colors underline underline-offset-2 cursor-pointer"
                      >ADMIN MAZEEDA</button>
                    </p>
                  </div>
                </div>
              {/if}
            </div>

            <!-- Profile Avatar Button -->
            <button 
              on:click={openMyProfile}
              class="h-9 w-9 rounded-full overflow-hidden bg-blue-50 border border-blue-100 flex items-center justify-center text-primary font-bold text-sm shrink-0 shadow-soft-sm hover:scale-105 hover:border-primary transition-all duration-200 cursor-pointer"
              title="Lihat Profil Saya"
              style="min-height: 36px; min-width: 36px;"
            >
              {#key $authStore.user.foto_url}
                {#if $authStore.user.foto_url}
                  <img 
                    src={convertDriveUrl($authStore.user.foto_url)} 
                    alt={$authStore.user.name} 
                    class="h-full w-full object-cover" 
                    on:error={(e) => { 
                      e.currentTarget.style.display = 'none';
                      authStore.update(s => s.user ? { ...s, user: { ...s.user, foto_url: '' } } : s);
                    }} 
                  />
                {:else}
                  {$authStore.user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                {/if}
              {/key}
            </button>
          </div>
        {:else}
          <a 
            href="/auth" 
            class="flex items-center space-x-2 text-sm text-slate-500 hover:text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100"
            title="Log In"
            style="min-height: 48px;"
          >
            <LogIn class="h-5 w-5" />
            <span class="hidden sm:inline text-xs font-medium">Log In</span>
          </a>
        {/if}
      </div>
    </header>

    <div class="flex-1 flex">
      <!-- Desktop Sidebar Layout (Hidden on Mobile) -->
      <aside class="hidden md:flex flex-col w-64 border-r border-border/50 bg-slate-50/50 p-4 shrink-0 min-h-[calc(100vh-4rem)]">
        <nav class="flex-1 space-y-1.5">
          {#each navItems as item}
            <a
              href={item.path}
              on:click={handleNavClick}
              class="flex items-center space-x-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200
                {isActive(item.path) 
                  ? 'bg-primary text-white shadow-soft-sm hover:bg-primary-hover' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-primary'}"
            >
              <svelte:component this={item.icon} class="h-5 w-5" />
              <span>{item.name}</span>
            </a>
          {/each}
          
          {#if userRole === 'admin'}
            <div class="pt-4 mt-4 border-t border-border/50">
              <span class="px-4 text-[10px] font-bold tracking-wider text-slate-400 uppercase">Management</span>
              <a
                href="/admin"
                on:click={handleNavClick}
                class="flex items-center justify-between px-4 py-3 mt-1.5 rounded-xl text-sm font-semibold transition-all duration-200
                  {isActive('/admin') 
                    ? 'bg-primary text-white shadow-soft-sm hover:bg-primary-hover' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-primary'}"
              >
                <div class="flex items-center space-x-3.5">
                  <ShieldCheck class="h-5 w-5" />
                  <span>Admin Panel</span>
                </div>
                <ChevronRight class="h-4 w-4 opacity-60" />
              </a>
            </div>
          {/if}
        </nav>
        
        {#if $authStore.user}
          <button 
            on:click={openMyProfile}
            class="pt-4 border-t border-border/50 flex items-center space-x-3 w-full text-left hover:bg-slate-100/50 p-2 rounded-xl transition-colors cursor-pointer"
          >
            <div class="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-primary font-bold shrink-0 overflow-hidden shadow-soft-sm">
              {#key $authStore.user.foto_url}
                {#if $authStore.user.foto_url}
                  <img 
                    src={convertDriveUrl($authStore.user.foto_url)} 
                    alt={$authStore.user.name} 
                    class="h-full w-full object-cover" 
                    on:error={(e) => { 
                      e.currentTarget.style.display = 'none';
                      authStore.update(s => s.user ? { ...s, user: { ...s.user, foto_url: '' } } : s);
                    }} 
                  />
                {:else}
                  {$authStore.user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                {/if}
              {/key}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold text-slate-700 truncate">{$authStore.user.name}</p>
              <p class="text-xs text-slate-400 truncate">
                {$authStore.user.role === 'admin' ? 'ADMIN MAZEEDA' : `NIS: ${$authStore.user.nis || '-'}`}
              </p>
            </div>
          </button>
        {/if}
      </aside>

      <main class="flex-1 bg-white p-2 sm:p-4 md:p-8 {$page.url.searchParams.has('detail') ? 'pb-8' : 'pb-24'} md:pb-8 overflow-y-auto relative">
        {#if showMyProfile}
          {#if isLoadingProfile}
          <div class="py-24 text-center space-y-4">
              <div class="animate-spin h-8 w-8 border-3 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p class="text-xs font-semibold text-slate-500">Memuat profil pribadi Anda...</p>
            </div>
          {:else if myProfileData}
            <!-- MY DETAILED PROFILE VIEW -->
            <div class="space-y-6" transition:fade={{ duration: 150 }}>
              <!-- Back Button Header -->
              <div class="flex items-center justify-between pb-2 border-b border-slate-100">
                <button 
                  on:click={() => { showMyProfile = false; isEditingAdminProfile = false; }}
                  class="inline-flex items-center space-x-2 text-slate-500 hover:text-primary transition-colors text-sm font-bold py-2"
                  style="min-height: 48px;"
                >
                  <ArrowLeft class="h-4.5 w-4.5" />
                  <span>Kembali ke Halaman Sebelumnya</span>
                </button>
                
                <div class="flex items-center gap-2">
                  {#if userRole === 'admin' && isOwnProfile && !isEditingAdminProfile}
                    <button
                      on:click={startEditAdminProfile}
                      class="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Edit class="h-3.5 w-3.5" />
                      Edit Profil Admin
                    </button>
                  {/if}
                  <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{isOwnProfile ? 'PROFIL SAYA' : 'PROFIL ANGGOTA'}</span>
                </div>
              </div>

              <!-- ADMIN EDIT FORM (shown when editing) -->
              {#if isEditingAdminProfile}
                <div class="space-y-4 animate-in fade-in duration-200">
                  <div class="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
                    <p class="text-xs font-black text-indigo-700 flex items-center gap-1.5">
                      <Edit class="h-3.5 w-3.5" />
                      Mode Edit Profil Admin — Perubahan disimpan di perangkat ini
                    </p>
                  </div>
                  <Card noPadding class="p-4 sm:p-6 space-y-5">
                    <!-- Foto Profil -->
                    <div class="space-y-1.5">
                      <label class="text-xs font-bold text-slate-500 block">Foto Profil (URL Link Gambar / Google Drive)</label>
                      <input
                        type="text"
                        placeholder="Paste link foto (Google Drive / URL langsung)"
                        class="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 focus:outline-none focus:border-indigo-400 focus:bg-white"
                        bind:value={adminEditForm.foto_url}
                      />
                      {#if adminEditForm.foto_url}
                        <div class="flex items-center gap-3 mt-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
                          <img
                            src={convertDriveUrl(adminEditForm.foto_url)}
                            alt="Preview foto"
                            class="h-14 w-14 rounded-xl object-cover border border-slate-200"
                            on:error={(e) => { e.currentTarget.style.opacity = '0.3'; }}
                          />
                          <p class="text-xs text-slate-500 font-medium">Preview foto profil</p>
                        </div>
                      {/if}
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div class="space-y-1">
                        <label class="text-xs font-bold text-slate-500 block">Nama Lengkap</label>
                        <input type="text" placeholder="Nama lengkap" class="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 focus:outline-none focus:border-indigo-400 focus:bg-white" bind:value={adminEditForm.nama_lengkap} />
                      </div>
                      <div class="space-y-1">
                        <label class="text-xs font-bold text-slate-500 block">Nama Panggilan</label>
                        <input type="text" placeholder="Nama panggilan" class="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 focus:outline-none focus:border-indigo-400 focus:bg-white" bind:value={adminEditForm.nama_panggilan} />
                      </div>
                    </div>

                    <!-- Section: Data Pribadi -->
                    <div class="pt-2 border-t border-slate-100">
                      <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">👤 Data Pribadi</p>
                      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div class="space-y-1">
                          <label class="text-xs font-bold text-slate-500 block">Tempat Lahir</label>
                          <input type="text" placeholder="Kota kelahiran" class="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 focus:outline-none focus:border-indigo-400 focus:bg-white" bind:value={adminEditForm.tempat_lahir} />
                        </div>
                        <div class="space-y-1">
                          <label class="text-xs font-bold text-slate-500 block">Tahun / Tanggal Lahir</label>
                          <input type="text" placeholder="e.g. 22 September 2000" class="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 focus:outline-none focus:border-indigo-400 focus:bg-white" bind:value={adminEditForm.tahun_lahir} />
                        </div>
                        <div class="space-y-1">
                          <label class="text-xs font-bold text-slate-500 block">Golongan Darah</label>
                          <select class="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 focus:outline-none focus:border-indigo-400 focus:bg-white" bind:value={adminEditForm.golongan_darah}>
                            <option value="O">Golongan O</option>
                            <option value="A">Golongan A</option>
                            <option value="B">Golongan B</option>
                            <option value="AB">Golongan AB</option>
                          </select>
                        </div>
                      </div>
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <div class="space-y-1">
                          <label class="text-xs font-bold text-slate-500 block">Alamat Tempat Tinggal (KTP)</label>
                          <input type="text" placeholder="Alamat sesuai KTP" class="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 focus:outline-none focus:border-indigo-400 focus:bg-white" bind:value={adminEditForm.alamat_ktp} />
                        </div>
                        <div class="space-y-1">
                          <label class="text-xs font-bold text-slate-500 block">Rute Lengkap Pulang / Perjalanan</label>
                          <input type="text" placeholder="e.g. Lembang - Subang - Sumedang" class="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 focus:outline-none focus:border-indigo-400 focus:bg-white" bind:value={adminEditForm.rute_lengkap} />
                        </div>
                      </div>
                    </div>

                    <!-- Section: Pondok & Kependidikan -->
                    <div class="pt-2 border-t border-slate-100">
                      <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">🏫 Pondok & Kependidikan</p>
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div class="space-y-1">
                          <label class="text-xs font-bold text-slate-500 block">Alamat Domisili Sekarang</label>
                          <input type="text" placeholder="Kota domisili saat ini" class="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 focus:outline-none focus:border-indigo-400 focus:bg-white" bind:value={adminEditForm.alamat_domisili} />
                        </div>
                        <div class="space-y-1">
                          <label class="text-xs font-bold text-slate-500 block">Tahun Masuk Pondok</label>
                          <input type="text" placeholder="e.g. 2016" class="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 focus:outline-none focus:border-indigo-400 focus:bg-white" bind:value={adminEditForm.tahun_masuk} />
                        </div>
                      </div>
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <div class="space-y-1">
                          <label class="text-xs font-bold text-slate-500 block">Kamar Santri</label>
                          <input type="text" placeholder="e.g. Aisyah 02" class="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 focus:outline-none focus:border-indigo-400 focus:bg-white" bind:value={adminEditForm.kamar_santri} />
                        </div>
                        <div class="space-y-1">
                          <label class="text-xs font-bold text-slate-500 block">Status Tahfidz / Hafalan</label>
                          <input type="text" placeholder="e.g. 5 Juz" class="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 focus:outline-none focus:border-indigo-400 focus:bg-white" bind:value={adminEditForm.tahfidz_santri} />
                        </div>
                      </div>
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <div class="space-y-1">
                          <label class="text-xs font-bold text-slate-500 block">Riwayat Pendidikan Terakhir</label>
                          <input type="text" placeholder="e.g. S1 Teknik Informatika" class="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 focus:outline-none focus:border-indigo-400 focus:bg-white" bind:value={adminEditForm.riwayat_pendidikan} />
                        </div>
                        <div class="space-y-1">
                          <label class="text-xs font-bold text-slate-500 block">Alamat Pendidikan</label>
                          <input type="text" placeholder="Kota / kampus" class="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 focus:outline-none focus:border-indigo-400 focus:bg-white" bind:value={adminEditForm.alamat_riwayatpendidikan} />
                        </div>
                      </div>
                    </div>

                    <!-- Section: Kontak & Sosial Media -->
                    <div class="pt-2 border-t border-slate-100">
                      <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">🌐 Kontak & Sosial Media</p>
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div class="space-y-1">
                          <label class="text-xs font-bold text-slate-500 block">No. WhatsApp</label>
                          <input type="text" placeholder="08xxx" class="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 focus:outline-none focus:border-indigo-400 focus:bg-white" bind:value={adminEditForm.no_whatsapp} />
                        </div>
                        <div class="space-y-1">
                          <label class="text-xs font-bold text-slate-500 block">Email</label>
                          <input type="email" placeholder="email@domain.com" class="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 focus:outline-none focus:border-indigo-400 focus:bg-white" bind:value={adminEditForm.email} />
                        </div>
                      </div>
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <div class="space-y-1">
                          <label class="text-xs font-bold text-slate-500 block">Username Instagram</label>
                          <input type="text" placeholder="@username" class="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 focus:outline-none focus:border-indigo-400 focus:bg-white" bind:value={adminEditForm.media_social} />
                        </div>
                        <div class="space-y-1">
                          <label class="text-xs font-bold text-slate-500 block">Akun TikTok</label>
                          <input type="text" placeholder="@username_tiktok" class="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 focus:outline-none focus:border-indigo-400 focus:bg-white" bind:value={adminEditForm.tiktok_akun} />
                        </div>
                      </div>
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <div class="space-y-1">
                          <label class="text-xs font-bold text-slate-500 block">Akun X / Twitter</label>
                          <input type="text" placeholder="@username_x" class="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 focus:outline-none focus:border-indigo-400 focus:bg-white" bind:value={adminEditForm.xtwitter_akun} />
                        </div>
                        <div class="space-y-1">
                          <label class="text-xs font-bold text-slate-500 block">Akun Facebook</label>
                          <input type="text" placeholder="facebook.com/nama" class="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 focus:outline-none focus:border-indigo-400 focus:bg-white" bind:value={adminEditForm.facebook_akun} />
                        </div>
                      </div>
                    </div>

                    <!-- Section: Minat & Keterampilan -->
                    <div class="pt-2 border-t border-slate-100">
                      <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">🎵 Minat & Keterampilan</p>
                      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div class="space-y-1">
                          <label class="text-xs font-bold text-slate-500 block">Hobi</label>
                          <input type="text" placeholder="Hobi" class="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 focus:outline-none focus:border-indigo-400 focus:bg-white" bind:value={adminEditForm.hobi} />
                        </div>
                        <div class="space-y-1">
                          <label class="text-xs font-bold text-slate-500 block">Keterampilan Khusus</label>
                          <input type="text" placeholder="Keahlian / skill" class="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 focus:outline-none focus:border-indigo-400 focus:bg-white" bind:value={adminEditForm.keterampilan_khusus} />
                        </div>
                        <div class="space-y-1">
                          <label class="text-xs font-bold text-slate-500 block">Musik Kesukaan</label>
                          <input type="text" placeholder="Musik favorit" class="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 focus:outline-none focus:border-indigo-400 focus:bg-white" bind:value={adminEditForm.music} />
                        </div>
                      </div>
                    </div>

                    <!-- Section: Kesan, Pesan & Kutipan -->
                    <div class="pt-2 border-t border-slate-100">
                      <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">💬 Kesan, Pesan & Kutipan</p>
                      <div class="space-y-1 mb-4">
                        <label class="text-xs font-bold text-slate-500 block">Kutipan / Quote Kenangan Favorit</label>
                        <input type="text" placeholder="Kutipan memori / kata bijak" class="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 focus:outline-none focus:border-indigo-400 focus:bg-white" bind:value={adminEditForm.kutipan_kenangan} />
                      </div>
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div class="space-y-1">
                          <label class="text-xs font-bold text-slate-500 block">Kesan</label>
                          <textarea rows="3" placeholder="Kesan selama mengabdi..." class="flex w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:outline-none focus:border-indigo-400 focus:bg-white" bind:value={adminEditForm.kesan}></textarea>
                        </div>
                        <div class="space-y-1">
                          <label class="text-xs font-bold text-slate-500 block">Pesan</label>
                          <textarea rows="3" placeholder="Pesan untuk anggota..." class="flex w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:outline-none focus:border-indigo-400 focus:bg-white" bind:value={adminEditForm.pesan}></textarea>
                        </div>
                      </div>
                    </div>

                    <!-- Save / Cancel Buttons -->
                    <div class="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        on:click={() => isEditingAdminProfile = false}
                        class="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        on:click={saveAdminProfile}
                        class="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Save class="h-4 w-4" />
                        <span>Simpan Perubahan</span>
                      </button>
                    </div>
                  </Card>
                </div>
              {/if}

              <!-- Details Card Container -->
              <Card noPadding class="p-3 sm:p-6 md:p-8 space-y-6">
                
                <!-- Top Section: Avatar & Primary Info -->
                <div class="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-slate-100">
                  <!-- Foto profil: klik untuk perbesar -->
                  <div class="relative group shrink-0">
                    <div 
                      class="h-24 w-24 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center text-primary font-bold text-3xl overflow-hidden shadow-soft-sm {myProfileData.foto_url ? 'cursor-zoom-in hover:scale-105 transition-transform duration-200' : ''}"
                      on:click={() => myProfileData.foto_url && openLightbox(convertDriveUrl(myProfileData.foto_url))}
                      title={myProfileData.foto_url ? 'Klik untuk perbesar foto' : ''}
                    >
                      {#if myProfileData.foto_url}
                        <img 
                          src={convertDriveUrl(myProfileData.foto_url)} 
                          alt={myProfileData.nama_lengkap} 
                          class="h-full w-full object-cover" 
                          on:error={(e) => { e.currentTarget.style.display = 'none'; myProfileData.foto_url = null; }} 
                        />
                      {:else}
                        {getInitials(myProfileData.nama_lengkap)}
                      {/if}
                    </div>
                    {#if myProfileData.foto_url}
                      <div class="absolute inset-0 rounded-3xl bg-black/0 group-hover:bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white drop-shadow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M11 8v6M8 11h6"/></svg>
                      </div>
                    {/if}
                  </div>
                  
                  <div class="text-center sm:text-left space-y-2 min-w-0">
                    <h2 class="text-2xl md:text-3xl font-black text-slate-800 tracking-tight leading-none truncate">{myProfileData.nama_lengkap}</h2>
                    {#if myProfileData.nama_panggilan}
                      <p class="text-sm text-slate-500 font-semibold">{myProfileData.nama_panggilan}{myProfileData.daerah_santri ? ' | ' + capitalizeEachWord(myProfileData.daerah_santri) : ''}</p>
                    {/if}
                  </div>
                </div>

                <!-- Details Segmented Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <!-- Section 1: Data Pribadi -->
                  <div class="space-y-4">
                    <h4 class="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <User class="h-4 w-4 text-slate-400" />
                      <span>Data Pribadi</span>
                    </h4>
                    
                    <div class="bg-slate-50 rounded-2xl p-3 sm:p-4 border border-slate-100 space-y-2.5 text-xs font-semibold text-slate-600">
                      <p class="flex justify-between"><span>Tempat Lahir:</span> <strong class="text-slate-800">{capitalizeEachWord(myProfileData.tempat_lahir)}</strong></p>
                      <p class="flex justify-between border-t border-slate-200/50 pt-2 mt-2"><span>Tahun/Tanggal Lahir:</span> <strong class="text-slate-800">{myProfileData.tahun_lahir || '-'}</strong></p>
                      <p class="flex justify-between border-t border-slate-200/50 pt-2 mt-2"><span>Golongan Darah:</span> <strong class="text-slate-800">{myProfileData.golongan_darah || '-'}</strong></p>
                      <p class="flex flex-col gap-1 border-t border-slate-200/50 pt-2 mt-2">
                        <span>Tempat Tinggal:</span> 
                        <strong class="text-slate-800 font-normal leading-relaxed">{capitalizeEachWord(myProfileData.alamat_ktp)}</strong>
                      </p>
                      <p class="flex flex-col gap-1 border-t border-slate-200/50 pt-2 mt-2">
                        <span>Rute Lengkap Pulang/Perjalanan:</span> 
                        <strong class="text-slate-800 font-normal leading-relaxed">{myProfileData.rute_lengkap || '-'}</strong>
                      </p>
                    </div>
                  </div>

                  <!-- Section 2: Pondok & Kependidikan -->
                  <div class="space-y-4">
                    <h4 class="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Award class="h-4 w-4 text-slate-400" />
                      <span>Pondok & Kependidikan</span>
                    </h4>
                    
                    <div class="bg-slate-50 rounded-2xl p-3 sm:p-4 border border-slate-100 space-y-2.5 text-xs font-semibold text-slate-600">
                      <p class="flex justify-between items-start gap-4">
                        <span>Alamat Domisili:</span> 
                        <strong class="text-slate-800 text-right">{myProfileData.alamat_domisili || '-'}</strong>
                      </p>
                      <p class="flex justify-between border-t border-slate-200/50 pt-2 mt-2"><span>Tahun Masuk:</span> <strong class="text-slate-800">{myProfileData.tahun_masuk || '-'}</strong></p>
                      <p class="flex justify-between border-t border-slate-200/50 pt-2 mt-2"><span>Kamar:</span> <strong class="text-slate-800">{myProfileData.kamar_santri || '-'}</strong></p>
                      <p class="flex justify-between border-t border-slate-200/50 pt-2 mt-2"><span>Status Tahfidz:</span> <strong class="text-slate-800 text-emerald-600">{capitalizeEachWord(myProfileData.tahfidz_santri)}</strong></p>
                      <p class="flex justify-between items-start gap-4 border-t border-slate-200/50 pt-2 mt-2">
                        <span>Riwayat Pendidikan:</span> 
                        <strong class="text-slate-800 text-right">{myProfileData.riwayat_pendidikan || '-'}</strong>
                      </p>
                      <p class="flex justify-between items-start gap-4 border-t border-slate-200/50 pt-2 mt-2">
                        <span>Alamat Pendidikan:</span> 
                        <strong class="text-slate-800 text-right">{capitalizeEachWord(myProfileData.alamat_riwayatpendidikan)}</strong>
                      </p>
                    </div>
                  </div>

                  <!-- Section 3: Kontak & Media Sosial -->
                  <div class="space-y-4">
                    <h4 class="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Globe class="h-4 w-4 text-slate-400" />
                      <span>Kontak & Sosial Media</span>
                    </h4>
                    
                    <div class="bg-slate-50 rounded-2xl p-3 sm:p-4 border border-slate-100 space-y-2.5 text-xs font-semibold text-slate-600">
                      <p class="flex justify-between">
                        <span>WhatsApp:</span>
                        {#if myProfileData.no_whatsapp}
                          <a href={getWhatsAppLink(myProfileData.no_whatsapp)} target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-bold inline-flex items-center gap-1">
                            <span>{formatWhatsApp(myProfileData.no_whatsapp)}</span>
                            <ExternalLink class="h-3 w-3" />
                          </a>
                        {:else}
                          <strong class="text-slate-800 font-bold">-</strong>
                        {/if}
                      </p>
                      <p class="flex justify-between border-t border-slate-200/50 pt-2 mt-2">
                        <span>Email:</span>
                        {#if myProfileData.email}
                          <a href="https://mail.google.com/mail/?view=cm&fs=1&to={myProfileData.email}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-bold inline-flex items-center gap-1 max-w-[180px]">
                            <span class="truncate">{myProfileData.email}</span>
                            <ExternalLink class="h-3 w-3 shrink-0" />
                          </a>
                        {:else}
                          <strong class="text-slate-800 font-bold">-</strong>
                        {/if}
                      </p>
                      <p class="flex justify-between border-t border-slate-200/50 pt-2 mt-2">
                        <span>Instagram:</span>
                        {#if myProfileData.media_social}
                          <a href={getInstagramLink(myProfileData.media_social)} target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-bold inline-flex items-center gap-1">
                            <span>{myProfileData.media_social.toLowerCase()}</span>
                            <ExternalLink class="h-3 w-3" />
                          </a>
                        {:else}
                          <strong class="text-slate-800 font-bold">-</strong>
                        {/if}
                      </p>
                      <p class="flex justify-between border-t border-slate-200/50 pt-2 mt-2">
                        <span>Tiktok:</span>
                        {#if myProfileData.tiktok_akun}
                          <a href={getTiktokLink(myProfileData.tiktok_akun)} target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-bold inline-flex items-center gap-1">
                            <span>{myProfileData.tiktok_akun}</span>
                            <ExternalLink class="h-3 w-3" />
                          </a>
                        {:else}
                          <strong class="text-slate-800 font-bold">-</strong>
                        {/if}
                      </p>
                      <p class="flex justify-between border-t border-slate-200/50 pt-2 mt-2">
                        <span>X / Twitter:</span>
                        {#if myProfileData.xtwitter_akun}
                          <a href={getXTwitterLink(myProfileData.xtwitter_akun)} target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-bold inline-flex items-center gap-1">
                            <span>{myProfileData.xtwitter_akun}</span>
                            <ExternalLink class="h-3 w-3" />
                          </a>
                        {:else}
                          <strong class="text-slate-800 font-bold">-</strong>
                        {/if}
                      </p>
                    </div>
                  </div>

                  <!-- Section 4: Minat & Bakat -->
                  <div class="space-y-4">
                    <h4 class="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Music class="h-4 w-4 text-slate-400" />
                      <span>Minat & Keterampilan</span>
                    </h4>
                    
                    <div class="bg-slate-50 rounded-2xl p-3 sm:p-4 border border-slate-100 space-y-2.5 text-xs font-semibold text-slate-600">
                      <p class="flex flex-col gap-1">
                        <span>Hobi:</span> 
                        <strong class="text-slate-800 font-normal leading-relaxed">{myProfileData.hobi || '-'}</strong>
                      </p>
                      <p class="flex flex-col gap-1 border-t border-slate-200/50 pt-2 mt-2">
                        <span>Keterampilan Khusus:</span> 
                        <strong class="text-slate-800 font-normal leading-relaxed">{myProfileData.keterampilan_khusus || '-'}</strong>
                      </p>
                      <p class="flex flex-col gap-1 border-t border-slate-200/50 pt-2 mt-2">
                        <span>Musik Kesukaan:</span> 
                        {#if myProfileData.music && myProfileData.music.startsWith('http')}
                          <a href={myProfileData.music} target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-bold break-all">Klik Disini!</a>
                        {:else}
                          <strong class="text-slate-800 font-normal leading-relaxed">{myProfileData.music || '-'}</strong>
                        {/if}
                        
                        {#if getYouTubeId(myProfileData.music)}
                          <div class="mt-2 rounded-xl overflow-hidden aspect-video border border-slate-200 shadow-soft-sm">
                            <iframe 
                              class="w-full h-full"
                              src="https://www.youtube.com/embed/{getYouTubeId(myProfileData.music)}" 
                              title="YouTube video player" 
                              frameborder="0" 
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                              allowfullscreen
                            ></iframe>
                          </div>
                        {/if}
                      </p>
                    </div>
                  </div>

                </div>

                <!-- Kesan & Pesan -->
                <div class="space-y-4 pt-2">
                  <h4 class="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Heart class="h-4 w-4 text-slate-400" />
                    <span>Kesan, Pesan & Kutipan Kenangan</span>
                  </h4>
                  
                  <Card noPadding class="bg-blue-50/20 border-blue-100 p-3 sm:p-5 space-y-4">
                    {#if myProfileData.kutipan_kenangan}
                      <div class="text-center italic py-2 border-b border-slate-100/50">
                        <p class="text-sm font-semibold text-primary">"{myProfileData.kutipan_kenangan}"</p>
                        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-1.5">— Kutipan Memori</span>
                      </div>
                    {/if}
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                      <div class="space-y-1">
                        <span class="text-slate-400">Kesan:</span>
                        <p class="text-slate-700 font-normal leading-relaxed bg-white border border-slate-200/50 p-3 rounded-xl min-h-[60px]">
                          {myProfileData.kesan || '-'}
                        </p>
                      </div>
                      <div class="space-y-1">
                        <span class="text-slate-400">Pesan:</span>
                        <p class="text-slate-700 font-normal leading-relaxed bg-white border border-slate-200/50 p-3 rounded-xl min-h-[60px]">
                          {myProfileData.pesan || '-'}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>

                <!-- LOGOUT BUTTON AT THE VERY BOTTOM -->
                {#if isOwnProfile}
                  <div class="pt-6 border-t border-slate-100 flex justify-end">
                    <button 
                      on:click={handleLogout}
                      class="flex items-center justify-center space-x-2 text-sm text-white bg-rose-600 hover:bg-rose-700 transition-colors px-6 py-3 rounded-xl shadow-soft-sm font-bold w-full sm:w-auto cursor-pointer"
                      style="min-height: 48px;"
                    >
                      <LogOut class="h-5 w-5" />
                      <span>Keluar dari Akun (Log Out)</span>
                    </button>
                  </div>
                {/if}

                <!-- Logout Confirmation Modal -->
                {#if showLogoutModal}
                  <div class="fixed inset-0 z-[9999] flex items-center justify-center p-4" transition:fade={{ duration: 150 }}>
                    <!-- Backdrop -->
                    <button
                      type="button"
                      class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm cursor-default"
                      on:click={() => showLogoutModal = false}
                      aria-label="Tutup"
                    ></button>

                    <!-- Modal Card -->
                    <div class="relative bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-sm p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
                      <!-- Icon -->
                      <div class="flex items-center justify-center">
                        <div class="h-14 w-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center shadow-inner">
                          <LogOut class="h-7 w-7 text-rose-500" />
                        </div>
                      </div>

                      <!-- Text -->
                      <div class="text-center space-y-1.5">
                        <h3 class="text-lg font-black text-slate-800">Keluar dari Akun?</h3>
                        <p class="text-sm text-slate-500 leading-relaxed">Apakah Anda yakin ingin keluar dari sesi ini?</p>
                      </div>

                      <!-- Actions -->
                      <div class="flex flex-col sm:flex-row gap-2 pt-1">
                        <button
                          type="button"
                          on:click={() => showLogoutModal = false}
                          class="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          on:click={confirmLogout}
                          class="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors flex items-center justify-center space-x-2"
                        >
                          <LogOut class="h-4 w-4" />
                          <span>Ya, Keluar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                {/if}

              </Card>
            </div>
          {/if}
        {:else}
          {#key currentPath}
            <div in:fade={{ duration: 200, delay: 100 }} out:fade={{ duration: 100 }} class="mx-auto max-w-7xl xl:max-w-[1400px] w-full">
              <slot />
            </div>
          {/key}
        {/if}
      </main>
    </div>

    <!-- Mobile Bottom Navigation Bar (Hidden on Desktop) -->
    <!-- 48px touch target sizes are strictly maintained -->
    {#if !$page.url.searchParams.has('detail') && !$isAudioPlayingGlobal}

      <!-- The actual bottom nav - muncul saat klik tombol Menu -->
      {#if showBottomNav}
        <nav
          id="mobile-bottom-nav"
          class="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-border/60 shadow-lg px-2 flex justify-around items-center h-14 pb-safe"
          transition:slide={{ duration: 200 }}
        >
          {#each navItems as item}
            <a
              href={item.path}
              id="mobile-nav-{item.name.toLowerCase().replace(/[^a-z]/g, '')}"
              on:click={() => { resetAutoHide(); handleNavClick(); }}
              class="flex items-center justify-center flex-1 h-12 transition-all duration-200
                {isActive(item.path) ? 'text-primary scale-110' : 'text-slate-500'}"
              style="min-width: 48px; min-height: 48px;"
            >
              <svelte:component this={item.icon} class="h-6 w-6 transition-transform" />
            </a>
          {/each}
          
          {#if userRole === 'admin'}
            <a
              href="/admin"
              id="mobile-nav-admin"
              on:click={() => { resetAutoHide(); handleNavClick(); }}
              class="flex items-center justify-center flex-1 h-12 transition-all duration-200
                {isActive('/admin') ? 'text-primary scale-110' : 'text-slate-500'}"
              style="min-width: 48px; min-height: 48px;"
            >
              <ShieldCheck class="h-6 w-6 transition-transform" />
            </a>
          {/if}
        </nav>
      {/if}

      <!-- Floating pill button — hanya tampil saat navigasi tidak muncul -->
      {#if !showBottomNav}
        <button
          id="mobile-menu-pill"
          on:click={showNavMenu}
          class="md:hidden fixed bottom-2 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-1.5 px-4 py-1.5 rounded-full
                 bg-white/90 backdrop-blur-md border border-slate-200 shadow-lg
                 text-[11px] font-bold text-slate-500 hover:text-primary hover:border-primary/40
                 transition-all duration-200 active:scale-95 select-none"
          aria-label="Tampilkan navigasi"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
          Menu
        </button>
      {/if}

    {/if}
  {/if}
</div>
