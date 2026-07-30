<script lang="ts">
  import '../app.postcss';
  import { page } from '$app/stores';
  import { fade, slide, fly, scale } from 'svelte/transition';
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
    Save,
    ExternalLink,
    Info,
    FileText,
    Ban,
    Edit,
    ChevronLeft,
    Camera,
    CheckCircle2,
    AlertCircle,
    X,
    Clock,
    MessageSquare,
    ShieldAlert
  } from 'lucide-svelte';
  import Card from '$lib/components/ui/card.svelte';
  import { isAudioPlayingGlobal } from '$lib/audioStore';
  import { supabase, uploadCustomProfilePhoto } from '$lib/supabase';
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

  const adminSubmenus = [
    { name: 'Khasanah Lirboyo', path: '/admin/khasanah', icon: BookOpen },
    { name: 'Kelola Squad', path: '/admin?tab=members', icon: Users },
    { name: 'Kelola Asatidzah', path: '/admin?tab=asatidzah', icon: Users },
    { name: 'Persetujuan Foto', path: '/admin?tab=persetujuan_foto', icon: CheckCircle2 },
    { name: 'Nilai Akademik', path: '/admin?tab=nilai', icon: Award },
    { name: 'Kelola Kepengurusan', path: '/admin?tab=kepengurusan', icon: Award },
    { name: 'Kelola Sangu', path: '/admin?tab=sangu', icon: BookOpen },
    { name: 'Pengumuman Mading', path: '/admin?tab=mading', icon: Megaphone },
    { name: 'Dinding Aspirasi', path: '/admin?tab=stickynotes', icon: FileText },
    { name: 'Kelola Timeline', path: '/admin?tab=timeline', icon: Image },
    { name: 'Notifikasi', path: '/admin?tab=notifikasi', icon: Bell },
    { name: 'Banner Slide', path: '/admin?tab=carousel', icon: Image },
    { name: 'Galeri Kenangan', path: '/admin?tab=gallery_coverflow', icon: Image },
    { name: 'Momen Spesial', path: '/admin?tab=gallery_landscape', icon: Image },
    { name: 'Wajah MAZEEDA', path: '/admin?tab=gallery_marquee', icon: Image },
    { name: 'Kotak Saran', path: '/admin?tab=feedbacks', icon: FileText },
    { name: 'Manajemen Komentar', path: '/admin?tab=comments', icon: MessageSquare },
    { name: 'Laporan Pengguna', path: '/admin?tab=user_reports', icon: ShieldAlert }
  ];

  // Helper to check if a navigation item is active
  $: currentPath = $page.url.pathname;
  $: isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    if (path === '/admin') return currentPath.startsWith('/admin');
    return currentPath.startsWith(path);
  };

  $: isActiveQuery = (pathWithQuery: string) => {
    const [path, query] = pathWithQuery.split('?');
    if (currentPath !== path) return false;
    if (!query) return true;
    
    const targetTab = new URLSearchParams(query).get('tab');
    const currentTab = $page.url.searchParams.get('tab') || 'members';
    return targetTab === currentTab;
  };

  // Do not show full layouts (sidebar / bottom-nav) on the Auth page
  $: isAuthPage = currentPath === '/auth';
  $: isFullscreenPage = currentPath.startsWith('/perjalanan');
  
  let isAdminMenuExpanded = false;
  
  // Navigation Icon Click Animation Logic
  let activeNavAnim = '';
  function triggerNavAnim(name: string) {
    activeNavAnim = name;
    setTimeout(() => {
      if (activeNavAnim === name) activeNavAnim = '';
    }, 600); // Wait for the animation to finish
  }
  
  import { onMount, onDestroy, tick } from 'svelte';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { authStore, initAuth, logout, activeProfileStore, deactivatedAlertStore } from '$lib/auth';

  $: userRole = $authStore.user?.role || '';

  // Global scroll to top on path or parameter navigation
  async function resetScrollToTop() {
    await tick();
    if (browser) {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      const mainEl = document.querySelector('main');
      if (mainEl) {
        mainEl.scrollTop = 0;
      }
    }
  }

  onMount(() => {
    if (browser) {
      if (window.innerWidth < 768) {
        showBottomNav = true;
      }
    }
    initAuth();
    
    // Auto-expand admin menu if starting on admin page
    if (currentPath.startsWith('/admin')) {
      isAdminMenuExpanded = true;
    }
  });

  $: if (browser && (currentPath || $page.url.searchParams)) {
    resetScrollToTop();
  }

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
      let { data, error } = await supabase
        .from('allowed_alumni')
        .select('foto_url')
        .eq('nis', currentUser.nis)
        .maybeSingle();
        
      if (!data) {
        const asatidzahRes = await supabase
          .from('asatidzah')
          .select('foto_url')
          .eq('nis', currentUser.nis)
          .maybeSingle();
        data = asatidzahRes.data;
      }

      if (data && data.foto_url) {
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
      // Menggunakan lh3.googleusercontent.com karena drive.google.com/thumbnail mulai sering diblokir (403)
      return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
    return cleaned;
  }

  // Splash Screen State
  let showSplash = true;
  let splashMounted = false;
  let splashProgress = 0;

  // Profile Overlay State & Helpers
  let showMyProfile = false;
  let myProfileData: any = null;
  let isLoadingProfile = false;
  let customPhotos: any[] = [];
  let allProfilePhotos: {url: string, type: string, status: string}[] = [];
  let currentPhotoIndex = 0;
  let isUploadingPhoto = false;
  let fileInputRef: HTMLInputElement;

  let rlsDebug = 'wait';
  
  onMount(() => {
    fetch('/api/test-rls')
      .then(r => r.json())
      .then(d => {
        rlsDebug = d.anon_result?.error ? 'err' : (d.anon_result?.data ? 'ok' : 'null');
      })
      .catch(e => {
        rlsDebug = 'catch';
      });
  });

  async function fetchCustomPhotosForProfile(name: string) {
    if (!name) return;
    try {
      const { data, error } = await supabase
        .from('custom_profile_photos')
        .select('*')
        .eq('user_name', name);
      if (error) {
        console.error('Error fetching custom photos:', error);
        triggerAlert('Gagal memuat foto tambahan: ' + error.message, 'error');
        throw error;
      }
      
      const isOwnOrAdmin = $authStore.user?.role === 'admin' || $authStore.user?.name === name || ($authStore.user?.nis && $authStore.user?.nis === myProfileData?.nis);
      const visiblePhotos = data.filter(p => p.status?.toLowerCase() === 'approved' || (isOwnOrAdmin && p.status?.toLowerCase() === 'pending'));
      
      customPhotos = visiblePhotos;
      
      // Preserve only the first photo (which is the default drive photo) if it exists
      const basePhoto = allProfilePhotos.length > 0 && allProfilePhotos[0].type !== 'custom' 
        ? [allProfilePhotos[0]] 
        : [];
        
      allProfilePhotos = [
        ...basePhoto,
        ...visiblePhotos.map(p => ({ url: p.photo_url, type: 'custom', status: p.status }))
      ];
    } catch (e) {
      console.error(e);
    }
  }

  // Photo Carousel Logic
  function nextPhoto(e: Event) {
    e.stopPropagation();
    if (allProfilePhotos.length > 1) {
      currentPhotoIndex = (currentPhotoIndex + 1) % allProfilePhotos.length;
    }
  }

  function prevPhoto(e: Event) {
    e.stopPropagation();
    if (allProfilePhotos.length > 1) {
      currentPhotoIndex = (currentPhotoIndex - 1 + allProfilePhotos.length) % allProfilePhotos.length;
    }
  }

  let showToast = false;
  let toastMessage = '';
  let toastType = 'success';
  function showNotification(msg: string, type: 'success' | 'error' = 'success') {
    toastMessage = msg;
    toastType = type;
    showToast = true;
  }

  // Photo Upload Logic
  async function handlePhotoUpload(e: Event) {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file || !myProfileData) return;
    
    target.value = '';
    isUploadingPhoto = true;
    try {
      const url = await uploadCustomProfilePhoto(file, myProfileData.nama_lengkap);
      const newPhoto = { url, type: 'custom', status: 'pending' };
      customPhotos = [...customPhotos, newPhoto];
      allProfilePhotos = [...allProfilePhotos, newPhoto];
      currentPhotoIndex = allProfilePhotos.length - 1;
      showNotification('Foto berhasil diunggah dan sedang menunggu persetujuan Admin (1x24 jam).', 'success');
    } catch (err: any) {
      showNotification(`Gagal mengunggah foto: ${err.message}`, 'error');
    } finally {
      isUploadingPhoto = false;
    }
  }

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

  import { setBadgeCount, clearBadge } from '$lib/badge';

  // ── Notifikasi (App Notifications) ──
  let notifications: any[] = [];
  let showNotifPanel = false;
  let readNotifIds: string[] = [];
  let notifChannel: any;

  $: unreadCount = notifications.filter(n => {
    if (!n.is_active) return false;
    if (readNotifIds.includes(String(n.id))) return false;
    if (n.target_user) {
      const targetUser = n.target_user.trim().toLowerCase();
      const myName = ($authStore.user?.name || '').trim().toLowerCase();
      const myRole = $authStore.user?.role || '';
      
      if (targetUser === 'admin_role') {
        if (myRole !== 'admin') return false;
      } else if (targetUser !== myName) {
        return false;
      }
    }
    return true;
  }).length;

  // Update App Icon Badge whenever unreadCount changes
  $: if (browser && typeof unreadCount !== 'undefined') {
    if (unreadCount > 0) {
      setBadgeCount(unreadCount);
    } else {
      clearBadge();
    }
  }

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
    splashMounted = true;
    
    // Simulate randomized loading progress
    setTimeout(() => { splashProgress = Math.floor(Math.random() * 15) + 15; }, 2100);
    setTimeout(() => { splashProgress = Math.floor(Math.random() * 20) + 40; }, 3200);
    setTimeout(() => { splashProgress = Math.floor(Math.random() * 15) + 70; }, 4500);
    setTimeout(() => { splashProgress = 100; }, 5500);

    setTimeout(() => {
      showSplash = false;
    }, 6000);

    initAuth();
    if (browser) {
      // Validate if logged-in member still exists in the database
      const u = $authStore.user;
      if (u && u.role === 'member' && u.nis) {
        supabase.from('allowed_alumni').select('id').eq('nis', u.nis).maybeSingle().then(async ({ data, error }) => {
          if (!data) {
            const { data: asatidzahData } = await supabase.from('asatidzah').select('id').eq('nis', u.nis).maybeSingle();
            if (!asatidzahData) {
              console.warn('User no longer exists in database. Forcing logout.');
              logout();
            }
          }
        });
      }

      window.addEventListener('touchstart', onTouchStart, { passive: true });
      window.addEventListener('touchmove', onTouchMove, { passive: true });
      window.addEventListener('touchend', onTouchEnd);

      // Capacitor Native Back Button Handling
      import('@capacitor/app').then(({ App }) => {
        App.addListener('backButton', ({ canGoBack }) => {
          const path = window.location.pathname;
          // Return to previous page if not on home or auth
          if (path !== '/' && path !== '/auth') {
            window.history.back();
          } else {
            // Exit app only if on root/home or auth page
            App.exitApp();
          }
        });
      }).catch(() => {
        // Ignore if not running in Capacitor environment
      });

      // Register Service Worker with Auto-Update logic (ONLY IN PRODUCTION WEB, NOT IN CAPACITOR)
      if ('serviceWorker' in navigator) {
        const isCapacitor = typeof window !== 'undefined' && (window as any).Capacitor;
        // @ts-ignore
        if (import.meta.env.DEV || isCapacitor) {
          navigator.serviceWorker.getRegistrations().then(registrations => {
            for (let registration of registrations) {
              registration.unregister().then((success) => {
                if (success) console.log('Successfully unregistered service worker for Capacitor/Dev mode');
              });
            }
          });
          if (typeof caches !== 'undefined') {
            caches.keys().then((names) => {
              for (let name of names) {
                caches.delete(name);
              }
            });
          }
        } else {
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
        
        // Listen for updates from the notifikasi page
        window.addEventListener('mazeeda_read_notifs_updated', () => {
          const updated = localStorage.getItem('mazeeda_read_notifs');
          if (updated) readNotifIds = JSON.parse(updated);
        });
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
      let { data, error } = await supabase
        .from('allowed_alumni')
        .select('*')
        .eq('nis', $authStore.user.nis)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        const asatidzahRes = await supabase
          .from('asatidzah')
          .select('*')
          .eq('nis', $authStore.user.nis)
          .maybeSingle();
        if (asatidzahRes.error) throw asatidzahRes.error;
        data = asatidzahRes.data;
      }

      if (data) {
        myProfileData = data;
      } else {
        let { data: nameData, error: nameError } = await supabase
          .from('allowed_alumni')
          .select('*')
          .eq('nama_lengkap', $authStore.user.name)
          .maybeSingle();
          
        if (!nameData) {
          const asatidzahNameRes = await supabase
            .from('asatidzah')
            .select('*')
            .eq('nama_lengkap', $authStore.user.name)
            .maybeSingle();
          nameData = asatidzahNameRes.data;
        }

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

  $: if (showMyProfile && myProfileData) {
    customPhotos = [];
    currentPhotoIndex = 0;
    allProfilePhotos = [];
    if (myProfileData.foto_url) {
      allProfilePhotos.push({ url: myProfileData.foto_url, type: 'admin', status: 'approved' });
    }
    if (myProfileData.nama_lengkap) {
      fetchCustomPhotosForProfile(myProfileData.nama_lengkap);
    }
  }

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

      if (!data) {
        let asatidzahQuery = supabase.from('asatidzah').select('*');
        if (/^\d+$/.test(nameOrNis)) {
          asatidzahQuery = asatidzahQuery.eq('nis', nameOrNis);
        } else {
          asatidzahQuery = asatidzahQuery.ilike('nama_lengkap', nameOrNis);
        }
        const asatidzahRes = await asatidzahQuery.maybeSingle();
        data = asatidzahRes.data;
        error = asatidzahRes.error;
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
  let windowScrollY = 0;
  let mainScrollY = 0;
  $: scrollY = windowScrollY || mainScrollY;
  $: isScrolled = scrollY > 20;
</script>

<svelte:window on:keydown={handleKeydown} bind:scrollY={windowScrollY} />

{#if showSplash}
  <!-- Premium White Splash Screen -->
  <div class="fixed inset-0 z-[999999] bg-slate-50 flex flex-col items-center justify-center overflow-hidden" out:fade={{ duration: 800 }}>
    {#if splashMounted}
      <!-- Background Decorative Elements -->
      <div class="absolute inset-0 z-0 opacity-40">
        <div class="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" in:fade={{ duration: 1500 }}></div>
        <div class="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" in:fade={{ duration: 1500 }}></div>
      </div>

      <!-- Animated Splash Mascot -->
      <div class="relative z-10 flex flex-col items-center">
        
        <!-- The Peacock (Splash Version) -->
        <div class="relative w-40 h-40 mb-8" in:fly={{ y: 50, duration: 1000, delay: 300 }}>
          <!-- Tail Feathers -->
          <div class="absolute inset-x-0 bottom-4 h-40 flex justify-center items-end z-0">
            <div in:fly={{ y: 80, duration: 800, delay: 1000 }} class="absolute bottom-0"><div class="w-10 h-24 bg-emerald-500 rounded-full border-2 border-emerald-600 flex justify-center pt-2 shadow-lg" style="transform: rotate(-75deg); transform-origin: bottom center;"><div class="w-4 h-5 bg-blue-600 rounded-full border-2 border-yellow-400 shadow-inner"></div></div></div>
            
            <div in:fly={{ y: 80, duration: 800, delay: 850 }} class="absolute bottom-0"><div class="w-10 h-32 bg-emerald-500 rounded-full border-2 border-emerald-600 flex justify-center pt-2 shadow-lg" style="transform: rotate(-45deg); transform-origin: bottom center;"><div class="w-5 h-6 bg-blue-600 rounded-full border-2 border-yellow-400 shadow-inner"></div></div></div>
            
            <div in:fly={{ y: 80, duration: 800, delay: 700 }} class="absolute bottom-0"><div class="w-10 h-40 bg-emerald-500 rounded-full border-2 border-emerald-600 flex justify-center pt-2 shadow-lg" style="transform: rotate(-15deg); transform-origin: bottom center;"><div class="w-5 h-6 bg-blue-600 rounded-full border-2 border-yellow-400 shadow-inner"></div></div></div>
            
            <div in:fly={{ y: 80, duration: 800, delay: 700 }} class="absolute bottom-0"><div class="w-10 h-40 bg-emerald-500 rounded-full border-2 border-emerald-600 flex justify-center pt-2 shadow-lg" style="transform: rotate(15deg); transform-origin: bottom center;"><div class="w-5 h-6 bg-blue-600 rounded-full border-2 border-yellow-400 shadow-inner"></div></div></div>
            
            <div in:fly={{ y: 80, duration: 800, delay: 850 }} class="absolute bottom-0"><div class="w-10 h-32 bg-emerald-500 rounded-full border-2 border-emerald-600 flex justify-center pt-2 shadow-lg" style="transform: rotate(45deg); transform-origin: bottom center;"><div class="w-5 h-6 bg-blue-600 rounded-full border-2 border-yellow-400 shadow-inner"></div></div></div>
            
            <div in:fly={{ y: 80, duration: 800, delay: 1000 }} class="absolute bottom-0"><div class="w-10 h-24 bg-emerald-500 rounded-full border-2 border-emerald-600 flex justify-center pt-2 shadow-lg" style="transform: rotate(75deg); transform-origin: bottom center;"><div class="w-4 h-5 bg-blue-600 rounded-full border-2 border-yellow-400 shadow-inner"></div></div></div>
          </div>

          <!-- Body -->
          <div class="absolute bottom-0 left-1/2 -ml-9 w-18 h-32 bg-blue-600 rounded-t-full rounded-b-[30px] shadow-[inset_0_-10px_0_rgba(0,0,0,0.2)] z-10" style="width: 72px;">
            
            <!-- Crest -->
            <div class="absolute -top-6 left-1/2 -translate-x-1/2 flex space-x-1.5" in:scale={{ duration: 500, delay: 1200, start: 0 }}>
              <div class="w-1 h-5 bg-slate-800 rotate-[-25deg] origin-bottom relative"><div class="absolute -top-2 -left-1 w-3 h-3 bg-blue-400 rounded-full shadow-sm"></div></div>
              <div class="w-1 h-6 bg-slate-800 relative"><div class="absolute -top-2 -left-1 w-3 h-3 bg-blue-400 rounded-full shadow-sm"></div></div>
              <div class="w-1 h-5 bg-slate-800 rotate-[25deg] origin-bottom relative"><div class="absolute -top-2 -left-1 w-3 h-3 bg-blue-400 rounded-full shadow-sm"></div></div>
            </div>

            <!-- Eyes -->
            <div class="absolute top-6 left-1/2 -translate-x-1/2 w-12 h-5 flex justify-between px-1 z-10">
              <!-- Normal Open Eyes -->
              <div class="relative w-4 h-5 bg-white rounded-full overflow-hidden shadow-inner" in:scale={{ duration: 400, delay: 1300 }}>
                <div class="absolute top-1 left-1 w-2.5 h-2.5 bg-slate-900 rounded-full"></div>
              </div>
              <div class="relative w-4 h-5 bg-white rounded-full overflow-hidden shadow-inner" in:scale={{ duration: 400, delay: 1300 }}>
                <div class="absolute top-1 right-1 w-2.5 h-2.5 bg-slate-900 rounded-full"></div>
              </div>
            </div>

            <!-- Smiling Cheeks -->
            <div class="absolute top-9 left-2 w-3 h-1.5 bg-rose-400 rounded-full opacity-60 z-10" in:scale={{ duration: 300, delay: 1400 }}></div>
            <div class="absolute top-9 right-2 w-3 h-1.5 bg-rose-400 rounded-full opacity-60 z-10" in:scale={{ duration: 300, delay: 1400 }}></div>

            <!-- Beak -->
            <div class="absolute top-12 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-yellow-400 z-20" in:scale={{ duration: 400, delay: 1400 }}></div>

            <!-- Wings -->
            <div class="absolute bottom-4 -left-3 w-8 h-14 bg-blue-500 rounded-full origin-top rotate-[20deg] shadow-[inset_-2px_0_10px_rgba(0,0,0,0.1)] z-20 animate-wave-left" in:fly={{ x: 20, duration: 600, delay: 1000 }}></div>
            <div class="absolute bottom-4 -right-3 w-8 h-14 bg-blue-500 rounded-full origin-top rotate-[-20deg] shadow-[inset_2px_0_10px_rgba(0,0,0,0.1)] z-20 animate-wave-right" in:fly={{ x: -20, duration: 600, delay: 1000 }}></div>
          </div>
        </div>
        
        <!-- Typography -->
        <div class="mt-4 flex flex-col items-center">
          <h1 class="text-4xl font-extrabold tracking-[0.3em] text-slate-800 ml-[0.3em]" in:fly={{ y: 20, duration: 800, delay: 1500 }}>MAZEEDA</h1>
          <p class="text-slate-500 font-medium tracking-widest text-xs mt-2 ml-[0.1em]" in:fade={{ duration: 800, delay: 1700 }}>Eratkan Sanad, Sebarkan Manfaat!</p>
        </div>
      </div>
      
      <!-- Modern Progress Bar -->
      <div class="absolute bottom-20 w-48 h-1 bg-slate-200 rounded-full overflow-hidden" in:fade={{ delay: 2000 }}>
        <div class="h-full bg-primary rounded-full transition-all duration-700 ease-out" style="width: {splashProgress}%;"></div>
      </div>
    {/if}
  </div>
{/if}

<!-- ===== PHOTO LIGHTBOX MODAL ===== -->
{#if showLightbox}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div 
    class="fixed inset-0 z-[99999] flex items-center justify-center p-4"
    style="background: rgba(0,0,0,0.85); backdrop-filter: blur(8px);"
    on:click={closeLightbox}
    transition:fade={{ duration: 200 }}
  >
    <!-- Foto Besar -->
    <div 
      class="relative max-w-sm w-full mx-auto"
      on:click|stopPropagation
      style="animation: lightboxZoomIn 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;"
    >
      {#if showMyProfile && allProfilePhotos.length > 1 && allProfilePhotos.some(p => p.url === lightboxUrl || convertDriveUrl(p.url) === lightboxUrl)}
        <button type="button" on:click={(e) => { prevPhoto(e); lightboxUrl = convertDriveUrl(allProfilePhotos[currentPhotoIndex].url); }} class="absolute left-2 md:-left-12 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-colors z-[101]">
          <ChevronLeft class="h-6 w-6 md:h-8 md:w-8" />
        </button>
        <button type="button" on:click={(e) => { nextPhoto(e); lightboxUrl = convertDriveUrl(allProfilePhotos[currentPhotoIndex].url); }} class="absolute right-2 md:-right-12 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-colors z-[101]">
          <ChevronRight class="h-6 w-6 md:h-8 md:w-8" />
        </button>
      {/if}

      <img referrerpolicy="no-referrer" 
        src={lightboxUrl} 
        alt="Foto Profil"
        class="w-full rounded-3xl shadow-2xl object-cover border-2 border-white/20 {showMyProfile && allProfilePhotos[currentPhotoIndex]?.status === 'pending' && allProfilePhotos[currentPhotoIndex]?.url === lightboxUrl ? 'opacity-70 blur-[2px]' : ''}"
        style="max-height: 80vh; object-fit: contain;"
        on:error={(e) => { closeLightbox(); }}
      />
    </div>
  </div>
{/if}

<style>
  :global(.animate-jump-spin) {
    animation: jump-spin 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  @keyframes jump-spin {
    0% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-12px) rotate(180deg) scale(1.1); }
    100% { transform: translateY(0) rotate(360deg) scale(1); }
  }

  @keyframes lightboxZoomIn {
    from { opacity: 0; transform: scale(0.7); }
    to   { opacity: 1; transform: scale(1); }
  }

  /* Animasi Progress Bar Splash Screen */
  @keyframes progress {
    0% { width: 0%; opacity: 1; }
    50% { width: 70%; opacity: 1; }
    100% { width: 100%; opacity: 0; }
  }
  .animate-progress {
    animation: progress 3.8s ease-in-out 2s both;
  }

  /* Animasi Sayap Dadah Dadah */
  @keyframes wave-left {
    0%, 100% { transform: rotate(20deg); }
    50% { transform: rotate(70deg); }
  }
  @keyframes wave-right {
    0%, 100% { transform: rotate(-20deg); }
    50% { transform: rotate(-70deg); }
  }
  .animate-wave-left {
    animation: wave-left 0.8s ease-in-out infinite;
    animation-delay: 1.6s;
  }
  .animate-wave-right {
    animation: wave-right 0.8s ease-in-out infinite;
    animation-delay: 1.6s;
  }
</style>

<!-- ===== NOTIFICATION MODAL ===== -->
{#if showToast}
  <div class="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
    <div class="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-sm w-full border border-slate-100 animate-in zoom-in-95 duration-300 relative flex flex-col items-center text-center p-6 sm:p-8 space-y-4">
      <div class="w-20 h-20 rounded-full flex items-center justify-center {toastType === 'success' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}">
        {#if toastType === 'success'}
          <CheckCircle2 class="h-10 w-10" />
        {:else}
          <AlertCircle class="h-10 w-10" />
        {/if}
      </div>
      
      <div class="space-y-2">
        <h2 class="text-xl sm:text-2xl font-black {toastType === 'success' ? 'text-emerald-700' : 'text-rose-700'} tracking-tight">
          {toastType === 'success' ? 'Berhasil!' : 'Oops, Gagal!'}
        </h2>
        <p class="text-sm font-medium text-slate-500 leading-relaxed">
          {toastMessage}
        </p>
      </div>

      <button 
        on:click={() => showToast = false}
        class="mt-4 w-full {toastType === 'success' ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800' : 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800'} text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md active:scale-[0.98]"
      >
        Oke, Mengerti
      </button>
    </div>
  </div>
{/if}

<!-- FULL SCREEN LOADING UNTUK UPLOAD -->
{#if isUploadingPhoto}
  <div class="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300 p-4">
    <div class="bg-white p-6 rounded-3xl shadow-2xl flex flex-col items-center gap-4 animate-bounce-slow">
      <div class="h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      <div class="text-center">
        <p class="font-black text-slate-800 text-lg">Mengunggah Foto...</p>
        <p class="text-xs text-slate-500 font-medium">Mohon tunggu sebentar, sedang diproses.</p>
      </div>
    </div>
  </div>
{/if}

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

<div class="min-h-screen flex flex-col bg-white text-slate-800 w-full overflow-x-hidden">
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
        <div in:fly={{ y: 20, duration: 400, delay: 200 }} out:fade={{ duration: 150 }} class="w-full max-w-md">
          <slot />
        </div>
      {/key}
    </main>
  {:else if isFullscreenPage}
    <!-- Full-screen layout without standard navigation bars -->
    <main class="w-full min-h-screen p-0 m-0 bg-[#060a12] overflow-x-hidden">
      {#key currentPath}
        <div in:fly={{ y: 20, duration: 400, delay: 200 }} out:fade={{ duration: 150 }} class="w-full h-full">
          <slot />
        </div>
      {/key}
    </main>
  {:else}
    <!-- App layout for general modules -->
    
    <!-- Top Header for Branding & Mobile Settings (Static, non-floating) -->
    <div class="relative w-full shrink-0 bg-white border-b border-slate-200/50">
      <header class="w-full mx-auto flex items-center justify-between h-[68px] px-4 md:px-8">
        <a href="/" class="flex items-center space-x-3 group" on:click={handleNavClick}>
        <img referrerpolicy="no-referrer" 
          src="/logo.png" 
          alt="MAZEEDA Logo" 
          class="h-9 w-9 object-cover rounded-xl shadow-soft-sm group-hover:scale-105 transition-transform" 
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
              <a
                href="/notifikasi"
                class="relative h-9 w-9 rounded-full flex items-center justify-center border transition-all duration-200 shadow-soft-sm hover:scale-105 {currentPath === '/notifikasi' ? 'bg-primary text-white border-primary' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-primary'}"
                title="Pusat Notifikasi"
                style="min-height: 36px; min-width: 36px;"
              >
                <Bell class="h-4.5 w-4.5" />
                {#if unreadCount > 0}
                  <span class="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center shadow-sm">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                {/if}
              </a>
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
                  <img referrerpolicy="no-referrer" 
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
  </div>

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
              <button
                on:click={() => isAdminMenuExpanded = !isAdminMenuExpanded}
                class="w-full flex items-center justify-between px-4 py-3 mt-1.5 rounded-xl text-sm font-semibold transition-all duration-200
                  {isAdminMenuExpanded 
                    ? 'bg-primary text-white shadow-soft-sm' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-primary'}"
              >
                <div class="flex items-center space-x-3.5">
                  <ShieldCheck class="h-5 w-5" />
                  <span>Admin Panel</span>
                </div>
                <ChevronRight class="h-4 w-4 {isAdminMenuExpanded ? 'rotate-90 opacity-100' : 'opacity-60'} transition-transform duration-200" />
              </button>

              {#if isAdminMenuExpanded}
                <div class="mt-2 space-y-1" transition:slide={{duration: 200}}>
                  {#each adminSubmenus as sub}
                    <a
                      href={sub.path}
                      on:click={handleNavClick}
                      class="flex items-center space-x-3.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200
                        {isActiveQuery(sub.path)
                          ? 'bg-blue-50 text-blue-600 font-bold'
                          : 'text-slate-500 hover:bg-slate-50 hover:text-primary'}"
                    >
                      <svelte:component this={sub.icon} class="h-4 w-4" />
                      <span>{sub.name}</span>
                    </a>
                  {/each}
                </div>
              {/if}
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
                  <img referrerpolicy="no-referrer" 
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

      <main on:scroll={(e) => mainScrollY = e.currentTarget.scrollTop} class="flex-1 bg-white p-2 sm:p-4 md:p-8 {$page.url.searchParams.has('detail') ? 'pb-8' : 'pb-24'} md:pb-8 overflow-y-auto overflow-x-hidden relative" id="main-scroll-container">
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
                  class="inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100/50 text-slate-500 hover:text-primary transition-colors -ml-2"
                >
                  <ArrowLeft class="w-5 h-5" />
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
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <div class="space-y-1">
                          <label class="text-xs font-bold text-slate-500 block">Cita-cita</label>
                          <input type="text" placeholder="Cita-cita" class="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 focus:outline-none focus:border-indigo-400 focus:bg-white" bind:value={adminEditForm.cita_cita} />
                        </div>
                        <div class="space-y-1">
                          <label class="text-xs font-bold text-slate-500 block">Makanan Kesukaan</label>
                          <input type="text" placeholder="Makanan favorit" class="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 focus:outline-none focus:border-indigo-400 focus:bg-white" bind:value={adminEditForm.makanan_kesukaan} />
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
              <Card noPadding class="overflow-hidden border-slate-200/80 shadow-soft-sm">
                <!-- Profile Header Banner -->
                <div class="h-32 sm:h-40 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative overflow-hidden">
                  <!-- Decorative subtle background shapes -->
                  <div class="absolute inset-0 opacity-20 overflow-hidden">
                    <div class="absolute -top-10 -left-10 w-44 h-44 rounded-full bg-white blur-xl"></div>
                    <div class="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-white blur-2xl"></div>
                    <div class="absolute top-1/2 left-1/3 w-32 h-32 rounded-full bg-white blur-xl animate-pulse" style="animation-duration: 6s;"></div>
                  </div>
                  <!-- Soft Gradient Fade to White -->
                  <div class="absolute bottom-[-1px] left-0 right-0 h-16 sm:h-24 bg-gradient-to-t from-white to-transparent z-0"></div>
                </div>

                <!-- Content wrapper with negative margin to overlap avatar with banner -->
                <div class="p-4 sm:p-6 md:p-8 space-y-8 -mt-16 sm:-mt-20 relative z-10">
                  
                  <!-- Top Section: Avatar & Primary Info -->
                  <div class="flex flex-col sm:flex-row items-center sm:items-end gap-5 pb-6 border-b border-slate-100">
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <div class="flex flex-col items-center gap-2">
                      <div 
                        class="relative group/avatar h-28 w-28 rounded-3xl bg-white p-0.5 border-2 border-white flex items-center justify-center text-primary font-bold text-3xl shrink-0 overflow-hidden shadow-md transition-all duration-300 {allProfilePhotos.length > 0 ? 'cursor-zoom-in hover:scale-105 hover:shadow-lg' : ''}"
                        on:click={() => { if (allProfilePhotos.length > 0) openLightbox(convertDriveUrl(allProfilePhotos[currentPhotoIndex].url)) }}
                      >
                        <div class="w-full h-full rounded-2xl overflow-hidden bg-indigo-50/50 border border-indigo-100 flex items-center justify-center relative group/inner">
                          {#if allProfilePhotos.length > 0}
                            <img referrerpolicy="no-referrer" 
                              src={convertDriveUrl(allProfilePhotos[currentPhotoIndex].url)} 
                              alt={myProfileData.nama_lengkap} 
                              class="h-full w-full object-cover transition-opacity duration-300 {allProfilePhotos[currentPhotoIndex].status === 'pending' ? 'opacity-70 blur-[1px]' : ''}" 
                              on:error={(e) => {
                                // Remove the failed photo from the array
                                allProfilePhotos = allProfilePhotos.filter((_, i) => i !== currentPhotoIndex);
                                if (currentPhotoIndex >= allProfilePhotos.length) {
                                  currentPhotoIndex = Math.max(0, allProfilePhotos.length - 1);
                                }
                              }} 
                            />
                            
                            {#if allProfilePhotos[currentPhotoIndex].status === 'pending'}
                              <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex flex-col items-center justify-center pointer-events-none z-20">
                                <div class="bg-amber-500/95 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5 border border-amber-400">
                                  <Clock class="h-3 w-3 animate-pulse" />
                                  <span>Verifikasi Admin</span>
                                </div>
                              </div>
                            {/if}

                            {#if allProfilePhotos.length > 1}
                              <button type="button" on:click={(e) => { e.stopPropagation(); prevPhoto(e); }} class="absolute left-1 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 opacity-100 transition-opacity z-[100] shadow-md">
                                <ChevronLeft class="h-4 w-4" />
                              </button>
                              <button type="button" on:click={(e) => { e.stopPropagation(); nextPhoto(e); }} class="absolute right-1 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 opacity-100 transition-opacity z-[100] shadow-md">
                                <ChevronRight class="h-4 w-4" />
                              </button>
                              <div class="absolute top-1 right-1 flex space-x-0.5 bg-black/20 rounded-full px-1 py-0.5 z-10">
                                {#each allProfilePhotos as _, i}
                                  <div class="h-1 w-1 rounded-full {i === currentPhotoIndex ? 'bg-white' : 'bg-white/40'}"></div>
                                {/each}
                              </div>
                            {/if}

                            <div class="absolute inset-0 bg-black/20 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity duration-300 pointer-events-none">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white drop-shadow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M11 8v6M8 11h6"/></svg>
                            </div>
                          {:else}
                            {getInitials(myProfileData.nama_lengkap)}
                          {/if}
                        </div>
                      </div>


                    </div>
                    
                    <div class="text-center sm:text-left space-y-2 min-w-0 flex-1 pb-1">
                      <h2 class="text-2xl md:text-3xl font-black text-slate-800 tracking-tight leading-tight py-1 truncate">
                        {myProfileData.nama_lengkap} 
                        <span class="text-[8px] opacity-10">[{allProfilePhotos?.length || 0}:{customPhotos?.length || 0}:{myProfileData.foto_url ? 1 : 0}:{rlsDebug}]</span>
                      </h2>
                      {#if myProfileData.nama_panggilan}
                        <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs font-bold">
                          <span class="px-2.5 py-1 bg-slate-100 rounded-full text-slate-600 border border-slate-200/50">{myProfileData.nama_panggilan}</span>
                        </div>
                      {/if}
                    </div>
                  </div>

                  <!-- Details Segmented Grid -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    <!-- Section 1: Data Pribadi -->
                    <div class="space-y-4">
                      <h4 class="text-sm font-black text-slate-800 tracking-tight flex items-center gap-2.5">
                        <div class="p-1.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                          <User class="h-4 w-4" />
                        </div>
                        <span>Data Pribadi</span>
                      </h4>
                      
                      <div class="bg-slate-50/50 rounded-2xl p-4 border border-slate-200/60 space-y-3 text-xs font-semibold text-slate-600">
                        <div class="flex justify-between items-center py-1.5 border-b border-slate-100">
                          <span class="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Tempat Lahir</span>
                          <strong class="text-slate-800">{capitalizeEachWord(myProfileData.tempat_lahir)}</strong>
                        </div>
                        <div class="flex justify-between items-center py-1.5 border-b border-slate-100">
                          <span class="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Tanggal Lahir</span>
                          <strong class="text-slate-800">{myProfileData.tahun_lahir || '-'}</strong>
                        </div>
                        <div class="flex justify-between items-center py-1.5 border-b border-slate-100">
                          <span class="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Golongan Darah</span>
                          <strong class="text-slate-800">{myProfileData.golongan_darah || '-'}</strong>
                        </div>
                        <div class="flex justify-between items-center py-1.5 border-b border-slate-100">
                          <span class="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Daerah</span>
                          <strong class="text-slate-800 font-bold">{capitalizeEachWord(myProfileData.daerah_santri) || '-'}</strong>
                        </div>
                        <div class="flex flex-col gap-1 py-1.5 border-b border-slate-100">
                          <span class="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Tempat Tinggal</span>
                          <strong class="text-slate-800 font-medium leading-relaxed text-justify">{capitalizeEachWord(myProfileData.alamat_ktp)}</strong>
                        </div>
                        <div class="flex flex-col gap-1 py-1.5">
                          <span class="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Rute Lengkap Perjalanan</span>
                          <strong class="text-slate-800 font-medium leading-relaxed text-justify">{myProfileData.rute_lengkap || '-'}</strong>
                        </div>
                      </div>
                    </div>

                    <!-- Section 2: Pondok & Kependidikan -->
                    <div class="space-y-4">
                      <h4 class="text-sm font-black text-slate-800 tracking-tight flex items-center gap-2.5">
                        <div class="p-1.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                          <Award class="h-4 w-4" />
                        </div>
                        <span>Pondok & Kependidikan</span>
                      </h4>
                      
                      <div class="bg-slate-50/50 rounded-2xl p-4 border border-slate-200/60 space-y-3 text-xs font-semibold text-slate-600">
                        <div class="flex justify-between items-center py-1.5 border-b border-slate-100">
                          <span class="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Alamat Domisili</span>
                          <strong class="text-slate-800">{myProfileData.alamat_domisili || '-'}</strong>
                        </div>
                        <div class="flex justify-between items-center py-1.5 border-b border-slate-100">
                          <span class="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Tahun Masuk</span>
                          <strong class="text-slate-800">{myProfileData.tahun_masuk || '-'}</strong>
                        </div>
                        <div class="flex justify-between items-center py-1.5 border-b border-slate-100">
                          <span class="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Kamar</span>
                          <strong class="text-slate-800">{myProfileData.kamar_santri || '-'}</strong>
                        </div>
                        <div class="flex justify-between items-center py-1.5 border-b border-slate-100">
                          <span class="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Status Tahfidz</span>
                          <strong class="text-slate-800 font-bold">{capitalizeEachWord(myProfileData.tahfidz_santri) || '-'}</strong>
                        </div>
                        <div class="flex flex-col gap-1 py-1.5 border-b border-slate-100">
                          <span class="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Riwayat Pendidikan</span>
                          <strong class="text-slate-800 font-medium">{myProfileData.riwayat_pendidikan || '-'}</strong>
                        </div>
                        <div class="flex flex-col gap-1 py-1.5">
                          <span class="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Alamat Pendidikan</span>
                          <strong class="text-slate-800 font-medium leading-relaxed text-justify">{capitalizeEachWord(myProfileData.alamat_riwayatpendidikan)}</strong>
                        </div>
                      </div>
                    </div>

                    <!-- Section 3: Kontak & Media Sosial -->
                    <div class="space-y-4">
                      <h4 class="text-sm font-black text-slate-800 tracking-tight flex items-center gap-2.5">
                        <div class="p-1.5 bg-sky-50 text-sky-600 rounded-xl border border-sky-100">
                          <Globe class="h-4 w-4" />
                        </div>
                        <span>Kontak & Sosial Media</span>
                      </h4>
                      
                      <div class="bg-slate-50/50 rounded-2xl p-4 border border-slate-200/60 space-y-3 text-xs font-semibold text-slate-600">
                        <div class="flex justify-between items-center py-1.5 border-b border-slate-100">
                          <span class="text-slate-400 font-bold uppercase tracking-wider text-[10px]">WhatsApp</span>
                          {#if myProfileData.no_whatsapp}
                            <a href={getWhatsAppLink(myProfileData.no_whatsapp)} target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-bold inline-flex items-center gap-1">
                              <span>{formatWhatsApp(myProfileData.no_whatsapp)}</span>
                              <ExternalLink class="h-3 w-3" />
                            </a>
                          {:else}
                            <strong class="text-slate-400 font-bold">-</strong>
                          {/if}
                        </div>
                        <div class="flex justify-between items-center py-1.5 border-b border-slate-100">
                          <span class="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Email</span>
                          {#if myProfileData.email}
                            <a href="https://mail.google.com/mail/?view=cm&fs=1&to={myProfileData.email}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-bold inline-flex items-center gap-1 text-right" style="max-width: 70%;" title={myProfileData.email}>
                              <span class="break-all">{myProfileData.email}</span>
                              <ExternalLink class="h-3 w-3 shrink-0" />
                            </a>
                          {:else}
                            <strong class="text-slate-400 font-bold">-</strong>
                          {/if}
                        </div>
                        <div class="flex justify-between items-center py-1.5 border-b border-slate-100">
                          <span class="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Instagram</span>
                          {#if myProfileData.media_social}
                            <a href={getInstagramLink(myProfileData.media_social)} target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-bold inline-flex items-center gap-1">
                              <span>{myProfileData.media_social.toLowerCase()}</span>
                              <ExternalLink class="h-3 w-3" />
                            </a>
                          {:else}
                            <strong class="text-slate-400 font-bold">-</strong>
                          {/if}
                        </div>
                        <div class="flex justify-between items-center py-1.5 border-b border-slate-100">
                          <span class="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Tiktok</span>
                          {#if myProfileData.tiktok_akun}
                            <a href={getTiktokLink(myProfileData.tiktok_akun)} target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-bold inline-flex items-center gap-1">
                              <span>{myProfileData.tiktok_akun}</span>
                              <ExternalLink class="h-3 w-3" />
                            </a>
                          {:else}
                            <strong class="text-slate-400 font-bold">-</strong>
                          {/if}
                        </div>
                        <div class="flex justify-between items-center py-1.5">
                          <span class="text-slate-400 font-bold uppercase tracking-wider text-[10px]">X / Twitter</span>
                          {#if myProfileData.xtwitter_akun}
                            <a href={getXTwitterLink(myProfileData.xtwitter_akun)} target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-bold inline-flex items-center gap-1">
                              <span>{myProfileData.xtwitter_akun}</span>
                              <ExternalLink class="h-3 w-3" />
                            </a>
                          {:else}
                            <strong class="text-slate-400 font-bold">-</strong>
                          {/if}
                        </div>
                      </div>
                    </div>

                    <!-- Section 4: Minat & Keterampilan -->
                    <div class="space-y-4">
                      <h4 class="text-sm font-black text-slate-800 tracking-tight flex items-center gap-2.5">
                        <div class="p-1.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
                          <Music class="h-4 w-4" />
                        </div>
                        <span>Minat & Keterampilan</span>
                      </h4>
                      
                      <div class="bg-slate-50/50 rounded-2xl p-4 border border-slate-200/60 space-y-3 text-xs font-semibold text-slate-600">
                        <div class="flex flex-col gap-1 py-1.5 border-b border-slate-100">
                          <span class="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Hobi</span>
                          <strong class="text-slate-800 font-medium leading-relaxed text-justify">{myProfileData.hobi || '-'}</strong>
                        </div>
                        <div class="flex flex-col gap-1 py-1.5 border-b border-slate-100">
                          <span class="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Keterampilan Khusus</span>
                          <strong class="text-slate-800 font-medium leading-relaxed text-justify">{myProfileData.keterampilan_khusus || '-'}</strong>
                        </div>
                        <div class="flex flex-col gap-1 py-1.5 border-b border-slate-100">
                          <span class="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Cita-cita</span>
                          {#if myProfileData.cita_cita}
                            <a href="https://www.google.com/search?q={encodeURIComponent(myProfileData.cita_cita)}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-bold inline-flex items-center gap-1 mt-0.5 w-fit" title="Cari di Google">
                              <span>{myProfileData.cita_cita}</span>
                              <ExternalLink class="h-3 w-3 shrink-0" />
                            </a>
                          {:else}
                            <strong class="text-slate-800 font-medium leading-relaxed text-justify">-</strong>
                          {/if}
                        </div>
                        <div class="flex flex-col gap-1 py-1.5 border-b border-slate-100">
                          <span class="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Makanan Kesukaan</span>
                          {#if myProfileData.makanan_kesukaan}
                            <a href="https://www.google.com/search?q={encodeURIComponent(myProfileData.makanan_kesukaan)}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-bold inline-flex items-center gap-1 mt-0.5 w-fit" title="Cari di Google">
                              <span>{myProfileData.makanan_kesukaan}</span>
                              <ExternalLink class="h-3 w-3 shrink-0" />
                            </a>
                          {:else}
                            <strong class="text-slate-800 font-medium leading-relaxed text-justify">-</strong>
                          {/if}
                        </div>
                        <div class="flex flex-col gap-1 py-1.5">
                          <span class="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Musik Kesukaan</span>
                          {#if myProfileData.music && myProfileData.music.startsWith('http')}
                            <a href={myProfileData.music} target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-bold break-all inline-flex items-center gap-1 mt-0.5 w-fit">
                              <span>Klik Disini!</span>
                              <ExternalLink class="h-3 w-3 shrink-0" />
                            </a>
                          {:else if myProfileData.music}
                            <a href="https://www.youtube.com/results?search_query={encodeURIComponent(myProfileData.music)}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-bold inline-flex items-center gap-1 mt-0.5 w-fit" title="Cari di YouTube">
                              <span>{myProfileData.music}</span>
                              <ExternalLink class="h-3 w-3 shrink-0" />
                            </a>
                          {:else}
                            <strong class="text-slate-800 font-medium leading-relaxed">-</strong>
                          {/if}
                          
                          {#if getYouTubeId(myProfileData.music)}
                            <div class="mt-4 relative group">
                              <!-- Glowing Background -->
                              <div class="absolute -inset-1.5 bg-gradient-to-r from-teal-400 via-blue-500 to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-60 transition duration-500"></div>
                              
                              <div class="relative bg-slate-900 rounded-2xl p-1.5 shadow-xl ring-1 ring-white/10">
                                <!-- macOS Style Top Bar -->
                                <div class="flex items-center justify-between px-3 py-2 border-b border-white/10 mb-1.5">
                                  <div class="flex gap-1.5">
                                    <div class="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm"></div>
                                    <div class="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm"></div>
                                    <div class="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm"></div>
                                  </div>
                                  <div class="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                                    <Music class="w-3 h-3 text-teal-400 animate-pulse" />
                                    <p class="text-[9px] font-bold text-slate-300 tracking-widest uppercase">Now Playing</p>
                                  </div>
                                </div>
                                
                                <!-- Video Container -->
                                <div class="rounded-xl overflow-hidden aspect-video bg-black relative">
                                  <div class="absolute inset-0 bg-slate-800 animate-pulse flex items-center justify-center">
                                     <Music class="w-8 h-8 text-slate-700" />
                                  </div>
                                  <iframe 
                                    class="w-full h-full relative z-10"
                                    src="https://www.youtube-nocookie.com/embed/{getYouTubeId(myProfileData.music)}" 
                                    title="YouTube video player" 
                                    frameborder="0" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                                    allowfullscreen
                                  ></iframe>
                                </div>
                              </div>
                            </div>
                          {/if}
                        </div>
                      </div>
                    </div>

                  </div>

                  <!-- Full width quotes and memories section -->
                  <div class="space-y-4 pt-2">
                    <h4 class="text-sm font-black text-slate-800 tracking-tight flex items-center gap-2.5">
                      <div class="p-1.5 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
                        <Heart class="h-4 w-4" />
                      </div>
                      <span>Kesan, Pesan & Kutipan Kenangan</span>
                    </h4>
                    
                    <div class="bg-blue-50/20 border border-blue-100/60 rounded-3xl p-4 sm:p-6 space-y-6 relative overflow-hidden">
                      <div class="absolute -top-3 -left-1 text-[120px] font-serif font-black text-blue-500/10 select-none pointer-events-none leading-none">“</div>
                      <div class="absolute -bottom-16 -right-1 text-[120px] font-serif font-black text-blue-500/10 select-none pointer-events-none leading-none">”</div>

                      {#if myProfileData.kutipan_kenangan}
                        <div class="text-center italic py-4 border-b border-slate-200/40 relative z-10">
                          <p class="text-base sm:text-lg font-extrabold text-primary tracking-tight leading-relaxed">"{myProfileData.kutipan_kenangan}"</p>
                          <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mt-2">— Kutipan Memori —</span>
                        </div>
                      {/if}
                      
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold relative z-10">
                        <div class="space-y-2">
                          <span class="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Kesan</span>
                          <p class="text-slate-700 font-normal leading-relaxed bg-white border border-slate-200/60 p-4 rounded-2xl min-h-[80px] shadow-soft-sm hover:border-blue-200/50 transition-all duration-300">
                            {myProfileData.kesan || '-'}
                          </p>
                        </div>
                        <div class="space-y-2">
                          <span class="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Pesan</span>
                          <p class="text-slate-700 font-normal leading-relaxed bg-white border border-slate-200/60 p-4 rounded-2xl min-h-[80px] shadow-soft-sm hover:border-blue-200/50 transition-all duration-300">
                            {myProfileData.pesan || '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
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
                      <span>Logout</span>
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
                        <h3 class="text-lg font-black text-slate-800">Logout?</h3>
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
            <div in:fly={{ y: 20, duration: 400, delay: 150 }} out:fade={{ duration: 150 }} class="mx-auto max-w-7xl xl:max-w-[1400px] w-full">
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
          class="md:hidden fixed bottom-4 left-4 right-4 z-50 bg-white/90 backdrop-blur-xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.08)] px-2 flex justify-between items-center h-16 rounded-2xl"
          transition:slide={{ duration: 200 }}
        >
          {#each navItems as item}
            <a
              href={item.path}
              id="mobile-nav-{item.name.toLowerCase().replace(/[^a-z]/g, '')}"
              on:click={() => { resetAutoHide(); handleNavClick(); triggerNavAnim(item.name); }}
              class="flex flex-col items-center justify-center flex-1 h-12 transition-all duration-300 relative
                {isActive(item.path) ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}"
              style="min-width: 44px; min-height: 48px;"
            >
              <div class="relative flex items-center justify-center {isActive(item.path) ? 'scale-110' : ''} transition-transform duration-300 {activeNavAnim === item.name ? 'animate-jump-spin text-primary drop-shadow-md' : ''}">
                <svelte:component this={item.icon} class="h-6 w-6 relative z-10" />
                {#if isActive(item.path)}
                  <div class="absolute inset-0 bg-primary/10 w-10 h-10 -left-2 -top-2 rounded-full blur-sm"></div>
                {/if}
              </div>
            </a>
          {/each}
          
          {#if userRole === 'admin'}
            <a
              href="/admin"
              id="mobile-nav-admin"
              on:click={() => { resetAutoHide(); handleNavClick(); triggerNavAnim('admin'); }}
              class="flex flex-col items-center justify-center flex-1 h-12 transition-all duration-300 relative
                {isActive('/admin') ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}"
              style="min-width: 44px; min-height: 48px;"
            >
              <div class="relative flex items-center justify-center {isActive('/admin') ? 'scale-110' : ''} transition-transform duration-300 {activeNavAnim === 'admin' ? 'animate-jump-spin text-primary drop-shadow-md' : ''}">
                <ShieldCheck class="h-6 w-6 relative z-10" />
                {#if isActive('/admin')}
                  <div class="absolute inset-0 bg-primary/10 w-10 h-10 -left-2 -top-2 rounded-full blur-sm"></div>
                {/if}
              </div>
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

  <!-- DEACTIVATED ACCOUNT MODAL -->
  {#if $deactivatedAlertStore}
    <div class="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div class="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-sm w-full border border-slate-100 animate-in zoom-in-95 duration-300 relative">
        <!-- Decorative Top Border -->
        <div class="h-2 w-full bg-gradient-to-r from-rose-500 to-red-600"></div>
        
        <div class="p-6 sm:p-8 flex flex-col items-center text-center space-y-4">
          <!-- Icon -->
          <div class="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center shrink-0 mb-2 relative">
            <div class="absolute inset-0 bg-rose-100/50 rounded-full animate-ping" style="animation-duration: 3s;"></div>
            <Ban class="w-10 h-10 text-rose-600 relative z-10" />
          </div>

          <!-- Content -->
          <div class="space-y-2">
            <h2 class="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Akun Dinonaktifkan</h2>
            <p class="text-sm font-medium text-slate-500 leading-relaxed">
              Sesi Anda telah dihentikan karena akun Anda dinonaktifkan oleh <span class="font-bold text-slate-700">Admin MAZEEDA</span>.
            </p>
            <p class="text-[11px] text-slate-400 font-bold uppercase tracking-wider pt-2">Silakan hubungi pengurus jika ini adalah kesalahan.</p>
          </div>

          <!-- Action -->
          <div class="pt-4 w-full">
            <button
              type="button"
              on:click={() => {
                $deactivatedAlertStore = false;
                logout();
              }}
              class="w-full h-12 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
            >
              Mengerti & Keluar
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}

</div>
