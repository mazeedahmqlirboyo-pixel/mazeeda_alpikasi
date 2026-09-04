<script lang="ts">
  import { t, locale } from 'svelte-i18n';
  import { onMount, tick } from 'svelte';
  import { supabase } from '$lib/supabase';
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  import Card from '$lib/components/ui/card.svelte';
  import Input from '$lib/components/ui/input.svelte';
  import Tabs from '$lib/components/ui/tabs.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import { 
    Search, Mail, Phone, MapPin, Plus, ArrowLeft, Filter,
    BookOpen, Heart, Music, Award, User, Globe, Route, Home, ChevronRight, ChevronLeft,
    ExternalLink,
    MoreVertical,
    Share2,
    UserPlus,
    Clock
  } from 'lucide-svelte';
  import PageHeader from '$lib/components/ui/PageHeader.svelte';
  import { profileThemes } from '$lib/profileThemes';
  import { authStore } from '$lib/auth';

  // State
  let searchQuery = '';
  let daerahSearch = '';
  let activeCategory = 'semua'; // 'semua' | 'alumni' | 'alumnus' | 'mustahiq' | 'mustahiqoh'
  let activeDaerah = 'semua'; // 'semua' = all regions
  let showFilter = false;
  let members: any[] = [];
  let isLoading = false;
  let showCopyToast = false;

  // Warning modal state
  let showDeactivatedWarningFor: any = null;

  // Selected member for inline detailed view (replaces popup)
  let selectedMember: any = null;
  let showAsatidzahMenu = false;
  let failedImages = new Set();
  
  // State for image lightbox/modal
  let isImageLarge = false;
  
  // Custom Profile Photos State
  let customPhotos: any[] = [];
  let allProfilePhotos: {url: string, type: string, status: string}[] = [];
  let currentPhotoIndex = 0;

  // Profile Theme State
  let currentProfileTheme = profileThemes[0];
  
  async function fetchProfileTheme(name: string) {
    if (!name) return;
    try {
      const { data, error } = await supabase
        .from('profile_themes')
        .select('theme_id')
        .eq('user_name', name)
        .maybeSingle();
        
      if (data && data.theme_id) {
        const found = profileThemes.find(t => t.id === data.theme_id);
        if (found) {
           currentProfileTheme = found;
           return;
        }
      }
      currentProfileTheme = profileThemes[0];
    } catch (e) {
      console.error('Error fetching profile theme:', e);
      currentProfileTheme = profileThemes[0];
    }
  }

  $: if (selectedMember && selectedMember.nama_lengkap) {
    fetchProfileTheme(selectedMember.nama_lengkap);
  }

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

  
  // Category configuration
  let categories = [
    { label: ($t('asatidzah.all') || 'Semua'), value: 'semua' },
    { label: 'Pengajar', value: 'pengajar' },
    { label: 'Musyrif', value: 'musyrif' },
    { label: 'Musyrifah', value: 'musyrifah' },
    { label: 'Staf / Karyawan', value: 'staf' }
  ];

  // Unique daerah list from loaded members
  let uniqueDaerah = ['semua'];
  


  function downloadVCard(member: any) {
    if (!member) return;
    const phone = member.no_whatsapp ? member.no_whatsapp.replace(/[^0-9+]/g, '') : '';
    const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${member.nama_lengkap}\nTEL;TYPE=CELL:${phone}\nEND:VCARD`;
    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${member.nama_lengkap.replace(/\s+/g, '_')}_Mazeeda.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  onMount(async () => {
    try {
      // Load unique categories and regions directly from the database
      const { data, error } = await supabase
        .from('asatidzah')
        .select('kategori_mazeeda, daerah_santri');
        
      if (!error && data) {
        // Extract unique categories
        const uniqueCats = [...new Set(data.map(item => (item.kategori_mazeeda || '').trim().toLowerCase()).filter(Boolean))].sort();
        if (uniqueCats.length > 0) {
          categories = [
            { label: ($t('asatidzah.all') || 'Semua'), value: 'semua' },
            ...uniqueCats.map(cat => ({ 
              label: cat.charAt(0).toUpperCase() + cat.slice(1), 
              value: cat 
            }))
          ];
        }

        // Extract unique regions
        const uniqueRegions = [...new Set(data.map(item => (item.daerah_santri || '').trim().toUpperCase()).filter(Boolean))].sort();
        if (uniqueRegions.length > 0) {
          uniqueDaerah = ['semua', ...uniqueRegions];
        }
      }
      
      const shareName = $page.url.searchParams.get('name');
      if (shareName) {
        const { data: memberData } = await supabase.from('asatidzah').select('*').ilike('nama_lengkap', shareName).maybeSingle();
        if (memberData) {
          openDetails(memberData);
        } else { directLinkFailed = true; }
      } else {
        directLinkFailed = true;
      }
    } catch (err) {
      console.error('Failed to fetch filters:', err);
    }
  });

  // Active filter count badge
  $: activeFilterCount = (activeCategory !== 'semua' ? 1 : 0) + (activeDaerah !== 'semua' ? 1 : 0);

  // Mock fallbacks if Supabase table is empty
  const mockFallback = [
    { id: 1, nama_lengkap: 'USTADZ MAZEEDA', kategori_mazeeda: 'pengajar', email: 'pengajar@email.com', no_whatsapp: '8950000000', alamat_domisili: 'Ponpes', tahun_masuk: '2020', nama_panggilan: 'Ustadz', tempat_lahir: 'CIREBON', tahun_lahir: '22 September 1990', golongan_darah: 'O', alamat_ktp: 'KALIWEDI', riwayat_pendidikan: 'S1', keterampilan_khusus: 'Pendidikan', kutipan_kenangan: 'Menjadi teladan', music: '', hobi: 'Membaca', kesan: 'Luar biasa', pesan: 'Istiqomah', daerah_santri: 'LOKAL', tiktok_akun: '', facebook_akun: '', xtwitter_akun: '', rute_lengkap: '', kamar_santri: '', tahfidz_santri: '' }
  ];

  let searchTimeout: ReturnType<typeof setTimeout>;
  
  // Reactive trigger for server-side search
  $: {
    if (searchQuery.trim().length >= 2 || activeCategory !== 'semua' || activeDaerah !== 'semua') {
      isLoading = true;
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        performSearch();
      }, 1000);
    } else {
      members = [];
      isLoading = false;
    }
  }

  async function performSearch() {
    isLoading = true;
    try {
      let query = supabase.from('asatidzah').select('*').limit(50);
      
      if (searchQuery.trim()) {
        const sq = `%${searchQuery.trim()}%`;
        query = query.or(`nama_lengkap.ilike.${sq},alamat_domisili.ilike.${sq},email.ilike.${sq}`);
      }
      
      if (activeCategory !== 'semua') {
        query = query.eq('kategori_mazeeda', activeCategory.toLowerCase());
      }
      
      if (activeDaerah !== 'semua') {
        query = query.ilike('daerah_santri', `%${activeDaerah}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      members = data || [];
    } catch (err) {
      console.error('Failed to search asatidzah:', err);
      members = [];
    } finally {
      isLoading = false;
    }
  }

  // Since we fetch filtered data from server, filteredMembers is just members
  $: filteredMembers = members;

  function closeProfile() {
    selectedMember = null;
    isImageLarge = false;
    currentPhotoIndex = 0;
    
    // Remove query param from URL without reloading
    if (browser) {
      const url = new URL(window.location.href);
      url.searchParams.delete('name');
      window.history.replaceState({}, '', url);
    }
  }

  // Open details inline
  async function openDetails(member: any) {
    selectedMember = member;
    customPhotos = [];
    currentPhotoIndex = 0;
    
    // Default admin photo (only if it hasn't previously failed)
    allProfilePhotos = [];
    if (member.foto_url && !failedImages.has(member.id)) {
      allProfilePhotos.push({ url: member.foto_url, type: 'admin', status: 'approved' });
    }

    await tick();
    
    // Fetch custom photos asynchronously without blocking UI render
    supabase
      .from('custom_profile_photos')
      .select('*')
      .eq('user_name', member.nama_lengkap)
      .then(({ data, error }) => {
        if (error) {
          console.error('Error fetching custom photos:', error);
        }
        if (data && data.length > 0) {
          const isOwnOrAdmin = $authStore.user?.role === 'admin' || $authStore.user?.name === member.nama_lengkap;
          
          // Filter out pending photos for public, keep for owner/admin
          const visiblePhotos = data.filter((p: any) => p.status?.toLowerCase() === 'approved' || (isOwnOrAdmin && p.status?.toLowerCase() === 'pending'));
          
          customPhotos = visiblePhotos;
          
          // Safely preserve the original drive photo, avoiding async race conditions
          const basePhoto = member.foto_url && !failedImages.has(member.id) 
            ? [{ url: member.foto_url, type: 'admin', status: 'approved' }] 
            : [];
            
          allProfilePhotos = [
            ...basePhoto,
            ...visiblePhotos.map((p: any) => ({ url: p.photo_url, type: 'custom', status: p.status }))
          ];
        }
      });
    
    const scrollToTop = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      const mainEl = document.querySelector('main');
      if (mainEl) {
        mainEl.scrollTop = 0;
      }
    };

    // Scroll seketika
    scrollToTop();

    // Ulangi scroll di beberapa frame berikutnya untuk menimpa autofocus browser/iframe
    requestAnimationFrame(scrollToTop);
    setTimeout(scrollToTop, 50);
    setTimeout(scrollToTop, 150);
    setTimeout(scrollToTop, 300);
  }

  function handleCardClick(member: any) {
    if (member.is_active === false) {
      showDeactivatedWarningFor = member;
    } else {
      openDetails(member);
    }
  }

  function confirmViewDeactivated() {
    if (showDeactivatedWarningFor) {
      openDetails(showDeactivatedWarningFor);
      showDeactivatedWarningFor = null;
    }
  }

  // Generate Initials
  function getInitials(name: string) {
    if (!name) return 'M';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  // Generate a consistent random accent color from name
  const accentPalette = [
    { border: 'border-l-violet-400',  avatar: 'bg-violet-50 border-violet-200 text-violet-600',  ring: 'ring-violet-300',  dot: 'bg-violet-400', gradient: 'from-violet-500 via-indigo-500 to-purple-600' },
    { border: 'border-l-sky-400',     avatar: 'bg-sky-50 border-sky-200 text-sky-600',            ring: 'ring-sky-300',     dot: 'bg-sky-400', gradient: 'from-sky-400 via-blue-500 to-indigo-600' },
    { border: 'border-l-emerald-400', avatar: 'bg-emerald-50 border-emerald-200 text-emerald-600',ring: 'ring-emerald-300', dot: 'bg-emerald-400', gradient: 'from-emerald-400 via-teal-500 to-cyan-600' },
    { border: 'border-l-rose-400',    avatar: 'bg-rose-50 border-rose-200 text-rose-600',         ring: 'ring-rose-300',    dot: 'bg-rose-400', gradient: 'from-rose-400 via-pink-500 to-red-500' },
    { border: 'border-l-amber-400',   avatar: 'bg-amber-50 border-amber-200 text-amber-600',      ring: 'ring-amber-300',   dot: 'bg-amber-400', gradient: 'from-amber-400 via-orange-400 to-yellow-500' },
    { border: 'border-l-teal-400',    avatar: 'bg-teal-50 border-teal-200 text-teal-600',         ring: 'ring-teal-300',    dot: 'bg-teal-400', gradient: 'from-teal-400 via-emerald-500 to-green-500' },
    { border: 'border-l-pink-400',    avatar: 'bg-pink-50 border-pink-200 text-pink-600',         ring: 'ring-pink-300',    dot: 'bg-pink-400', gradient: 'from-pink-400 via-rose-500 to-purple-500' },
    { border: 'border-l-indigo-400',  avatar: 'bg-indigo-50 border-indigo-200 text-indigo-600',   ring: 'ring-indigo-300',  dot: 'bg-indigo-400', gradient: 'from-indigo-500 via-purple-500 to-pink-500' },
    { border: 'border-l-orange-400',  avatar: 'bg-orange-50 border-orange-200 text-orange-600',   ring: 'ring-orange-300',  dot: 'bg-orange-400', gradient: 'from-orange-400 via-amber-500 to-red-500' },
    { border: 'border-l-cyan-400',    avatar: 'bg-cyan-50 border-cyan-200 text-cyan-600',         ring: 'ring-cyan-300',    dot: 'bg-cyan-400', gradient: 'from-cyan-400 via-sky-500 to-blue-500' },
  ];

  function getAccent(name: string) {
    if (!name) return accentPalette[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return accentPalette[Math.abs(hash) % accentPalette.length];
  }

  // Capitalize each word
  function capitalizeEachWord(str: string) {
    if (!str) return '-';
    return str
      .toLowerCase()
      .split(' ')
      .map(word => {
        // preserve @ handles at the start
        if (word.startsWith('@')) {
          return '@' + word.slice(1).charAt(0).toUpperCase() + word.slice(2);
        }
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
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
      return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
    return cleaned;
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
  $: isDirectLinkLoading = browser && ($page.url.searchParams.has('name')) && !selectedMember && !directLinkFailed;
  let directLinkFailed = false;
</script>

{#if selectedMember}
  <!-- INLINE PROFILE DETAIL VIEW (Replaces full screen popup) -->
  <div class="space-y-6 animate-in fade-in duration-300">
    <!-- Back Button Header -->
    <div class="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 relative">
      <button 
        on:click={() => { selectedMember = null; isImageLarge = false; }}
        class="inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
      >
        <ArrowLeft class="w-5 h-5" />
      </button>
      
      <span class="absolute left-1/2 -translate-x-1/2 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider whitespace-nowrap">PROFIL GURU</span>
      
      <!-- 3-dots Menu -->
      <div class="relative">
        <button on:click={() => showAsatidzahMenu = !showAsatidzahMenu} class="inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-500 dark:text-slate-400 transition-colors">
          <MoreVertical class="w-5 h-5" />
        </button>
        {#if showAsatidzahMenu}
          <!-- Invisible overlay to close dropdown -->
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div class="fixed inset-0 z-20" on:click={() => showAsatidzahMenu = false}></div>
          <div class="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800 overflow-hidden z-30 animate-in fade-in slide-in-from-top-2 py-1">
            <button
              on:click={() => { 
                showAsatidzahMenu = false;
                const url = `${window.location.origin}/asatidzah?id=${selectedMember.id}`;
                navigator.clipboard.writeText(url).then(() => { showCopyToast = true; setTimeout(() => showCopyToast = false, 2500); });
              }}
              class="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:bg-slate-800 flex items-center gap-2.5 transition-colors border-b border-slate-50"
            >
              <Share2 class="w-4 h-4 text-indigo-500" /> Bagikan Profil
            </button>
            {#if selectedMember.no_whatsapp}
              <a
                href={getWhatsAppLink(selectedMember.no_whatsapp)} 
                target="_blank" rel="noopener noreferrer"
                on:click={() => showAsatidzahMenu = false}
                class="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 flex items-center gap-2.5 transition-colors border-b border-slate-50"
              >
                <Phone class="w-4 h-4 text-emerald-500" /> Kirim WhatsApp
              </a>
              <button
                on:click={() => { showAsatidzahMenu = false; downloadVCard(selectedMember); }} 
                class="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:bg-slate-800 flex items-center gap-2.5 transition-colors"
              >
                <UserPlus class="w-4 h-4 text-blue-500" /> Simpan Kontak
              </button>
            {/if}
          </div>
        {/if}
      </div>
    </div>
    
    <Card noPadding class="overflow-hidden border-slate-200 dark:border-slate-700/80 shadow-soft-sm">
      <!-- Profile Header Banner -->
      {@const accent = getAccent(selectedMember.nama_lengkap)}
      <div class="h-32 sm:h-40 w-full relative overflow-hidden transition-all duration-500 rounded-b-3xl shadow-sm {currentProfileTheme.class}" style={currentProfileTheme.style || ''}>
        <!-- Pattern overlay for default gradient themes to keep texture -->
        {#if !currentProfileTheme.style}
          <div class="absolute inset-0 opacity-20 mix-blend-overlay" style="background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"></div>
        {/if}
      </div>

      <!-- Content wrapper with negative margin to overlap avatar with banner -->
      <div class="p-4 sm:p-6 md:p-8 space-y-8 -mt-16 sm:-mt-20 relative z-10">
        
        <!-- Top Section: Avatar & Primary Info (Without NIS & Nama Panggilan) -->
        <div class="flex flex-col sm:flex-row items-center sm:items-end gap-5 pb-6 border-b border-slate-100 dark:border-slate-800">
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div 
            class="relative group/avatar h-28 w-28 rounded-3xl bg-white dark:bg-slate-800 p-1 ring-4 ring-white dark:ring-slate-800 flex items-center justify-center text-primary font-bold text-3xl shrink-0 overflow-hidden shadow-lg transition-all duration-300 {allProfilePhotos.length > 0 ? 'cursor-zoom-in hover:scale-105 hover:shadow-xl' : ''}"
            on:click={() => { if (allProfilePhotos.length > 0) isImageLarge = true; }}
          >
            <div class="w-full h-full rounded-2xl overflow-hidden bg-blue-50/50 dark:bg-slate-800 flex items-center justify-center relative group/inner">
              <!-- Render EITHER photo OR initials, never both side-by-side -->
              {#if allProfilePhotos.length > 0}
                <img referrerpolicy="no-referrer" 
                  src={convertDriveUrl(allProfilePhotos[currentPhotoIndex].url)} 
                  alt={selectedMember.nama_lengkap} 
                  class="h-full w-full object-cover transition-opacity duration-300 {allProfilePhotos[currentPhotoIndex].status === 'pending' ? 'opacity-70 blur-[1px]' : ''}" 
                  on:error={() => { failedImages.add(selectedMember.id); failedImages = failedImages; }} 
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
                  <button type="button" on:click={prevPhoto} class="absolute left-1 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 opacity-100 transition-opacity z-[100] shadow-md dark:shadow-none">
                    <ChevronLeft class="h-4 w-4" />
                  </button>
                  <button type="button" on:click={nextPhoto} class="absolute right-1 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 opacity-100 transition-opacity z-[100] shadow-md dark:shadow-none">
                    <ChevronRight class="h-4 w-4" />
                  </button>
                  
                  <!-- Indicators -->
                  <div class="absolute top-1 right-1 flex space-x-0.5 bg-black/20 rounded-full px-1 py-0.5 z-10">
                    {#each allProfilePhotos as _, i}
                      <div class="h-1 w-1 rounded-full {i === currentPhotoIndex ? 'bg-white dark:bg-slate-900' : 'bg-white dark:bg-slate-900/40'}"></div>
                    {/each}
                  </div>
                {/if}

                <div class="absolute inset-0 bg-black/20 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity duration-300 pointer-events-none z-10">
                  <Search class="h-5 w-5 text-white drop-shadow" />
                </div>
              {:else}
                {getInitials(selectedMember.nama_lengkap)}
              {/if}
            </div>
          </div>
          
          <div class="text-center sm:text-left space-y-2 min-w-0 flex-1 pb-1">
            <h2 class="text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-tight py-1 truncate">{selectedMember.nama_lengkap}</h2>
            {#if selectedMember.nama_panggilan}
              <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs font-bold">
                <span class="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/50">{selectedMember.nama_panggilan}</span>
              </div>
            {/if}
          </div>
        </div>
  
        <!-- Details Segmented Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <!-- Section 1: Data Pribadi -->
          <div class="space-y-4">
            <h4 class="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
              <img src="/database.png" alt="Data Pribadi Icon" class="h-5 w-5 object-contain drop-shadow-sm" />
              <span>Data Pribadi</span>
            </h4>
            
            <div class="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 space-y-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <div class="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span class="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">Tempat Lahir</span>
                <strong class="text-slate-800 dark:text-slate-100">{capitalizeEachWord(selectedMember.tempat_lahir)}</strong>
              </div>
              <div class="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span class="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">Tanggal Lahir</span>
                <strong class="text-slate-800 dark:text-slate-100">{selectedMember.tahun_lahir || '-'}</strong>
              </div>
              <div class="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span class="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">Golongan Darah</span>
                <strong class="text-slate-800 dark:text-slate-100">{selectedMember.golongan_darah || '-'}</strong>
              </div>
              <div class="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span class="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">Daerah</span>
                <strong class="text-slate-800 dark:text-slate-100 font-bold">{capitalizeEachWord(selectedMember.daerah_santri) || '-'}</strong>
              </div>
              <div class="flex flex-col gap-1 py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span class="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">Tempat Tinggal</span>
                <strong class="text-slate-800 dark:text-slate-100 font-medium leading-relaxed text-justify">{capitalizeEachWord(selectedMember.alamat_ktp)}</strong>
              </div>
              <div class="flex flex-col gap-1 py-1.5">
                <span class="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">Rute Lengkap Perjalanan</span>
                <strong class="text-slate-800 dark:text-slate-100 font-medium leading-relaxed text-justify">{selectedMember.rute_lengkap || '-'}</strong>
              </div>
            </div>
          </div>
  
          <!-- Section 2: Pondok & Kependidikan -->
          <div class="space-y-4">
            <h4 class="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
              <img src="/education.png" alt="Pondok Pendidikan Icon" class="h-6 w-6 object-contain drop-shadow-sm" />
              <span>Pondok & Kependidikan</span>
            </h4>
            
            <div class="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 space-y-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <div class="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span class="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">Alamat Domisili</span>
                <strong class="text-slate-800 dark:text-slate-100">{selectedMember.alamat_domisili || '-'}</strong>
              </div>
              <div class="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span class="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">Tahun Masuk</span>
                <strong class="text-slate-800 dark:text-slate-100">{selectedMember.tahun_masuk || '-'}</strong>
              </div>
              <div class="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span class="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">Kamar</span>
                <strong class="text-slate-800 dark:text-slate-100">{selectedMember.kamar_santri || '-'}</strong>
              </div>
              <div class="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span class="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">Status Tahfidz</span>
                <strong class="text-slate-800 dark:text-slate-100 font-bold">{capitalizeEachWord(selectedMember.tahfidz_santri) || '-'}</strong>
              </div>
              <div class="flex flex-col gap-1 py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span class="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">Riwayat Pendidikan</span>
                <strong class="text-slate-800 dark:text-slate-100 font-medium">{selectedMember.riwayat_pendidikan || '-'}</strong>
              </div>
              <div class="flex flex-col gap-1 py-1.5">
                <span class="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">Alamat Pendidikan</span>
                <strong class="text-slate-800 dark:text-slate-100 font-medium leading-relaxed text-justify">{capitalizeEachWord(selectedMember.alamat_riwayatpendidikan)}</strong>
              </div>
            </div>
          </div>
  
          <!-- Section 3: Kontak & Media Sosial -->
          <div class="space-y-4">
            <h4 class="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
              <img src="/online.png" alt="Kontak Sosial Media Icon" class="h-6 w-6 object-contain drop-shadow-sm" />
              <span>Kontak & Sosial Media</span>
            </h4>
            
            <div class="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 space-y-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <div class="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span class="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">WhatsApp</span>
                {#if selectedMember.no_whatsapp}
                  <a href={getWhatsAppLink(selectedMember.no_whatsapp)} target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-bold inline-flex items-center gap-1">
                    <span>{formatWhatsApp(selectedMember.no_whatsapp)}</span>
                    <ExternalLink class="h-3 w-3" />
                  </a>
                {:else}
                  <strong class="text-slate-400 dark:text-slate-500 font-bold">-</strong>
                {/if}
              </div>
              <div class="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span class="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">Email</span>
                {#if selectedMember.email}
                  <a href="https://mail.google.com/mail/?view=cm&fs=1&to={selectedMember.email}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-bold truncate max-w-[180px] inline-flex items-center gap-1" title={selectedMember.email}>
                    <span class="truncate">{selectedMember.email}</span>
                    <ExternalLink class="h-3 w-3 shrink-0" />
                  </a>
                {:else}
                  <strong class="text-slate-400 dark:text-slate-500 font-bold">-</strong>
                {/if}
              </div>
              <div class="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span class="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">Instagram</span>
                {#if selectedMember.media_social}
                  <a href={getInstagramLink(selectedMember.media_social)} target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-bold inline-flex items-center gap-1">
                    <span>{selectedMember.media_social.toLowerCase()}</span>
                    <ExternalLink class="h-3 w-3" />
                  </a>
                {:else}
                  <strong class="text-slate-400 dark:text-slate-500 font-bold">-</strong>
                {/if}
              </div>
              <div class="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span class="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">Tiktok</span>
                {#if selectedMember.tiktok_akun}
                  <a href={getTiktokLink(selectedMember.tiktok_akun)} target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-bold inline-flex items-center gap-1">
                    <span>{selectedMember.tiktok_akun}</span>
                    <ExternalLink class="h-3 w-3" />
                  </a>
                {:else}
                  <strong class="text-slate-400 dark:text-slate-500 font-bold">-</strong>
                {/if}
              </div>
              <div class="flex justify-between items-center py-1.5">
                <span class="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">X / Twitter</span>
                {#if selectedMember.xtwitter_akun}
                  <a href={getXTwitterLink(selectedMember.xtwitter_akun)} target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-bold inline-flex items-center gap-1">
                    <span>{selectedMember.xtwitter_akun}</span>
                    <ExternalLink class="h-3 w-3" />
                  </a>
                {:else}
                  <strong class="text-slate-400 dark:text-slate-500 font-bold">-</strong>
                {/if}
              </div>
            </div>
          </div>
  
          <!-- Section 4: Minat & Keterampilan -->
          <div class="space-y-4">
            <h4 class="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
              <img src="/music.png" alt="Minat Keterampilan Icon" class="h-7 w-7 object-contain drop-shadow-sm" />
              <span>Minat & Keterampilan</span>
            </h4>
            
            <div class="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 space-y-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <div class="flex flex-col gap-1 py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span class="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">Hobi</span>
                <strong class="text-slate-800 dark:text-slate-100 font-medium leading-relaxed text-justify">{selectedMember.hobi || '-'}</strong>
              </div>
              <div class="flex flex-col gap-1 py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span class="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">Keterampilan Khusus</span>
                <strong class="text-slate-800 dark:text-slate-100 font-medium leading-relaxed text-justify">{selectedMember.keterampilan_khusus || '-'}</strong>
              </div>
              <div class="flex flex-col gap-1 py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span class="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">Cita-cita</span>
                {#if selectedMember.cita_cita}
                  <a href="https://www.google.com/search?q={encodeURIComponent(selectedMember.cita_cita)}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-bold inline-flex items-center gap-1 mt-0.5 w-fit" title="Cari di Google">
                    <span>{selectedMember.cita_cita}</span>
                    <ExternalLink class="h-3 w-3 shrink-0" />
                  </a>
                {:else}
                  <strong class="text-slate-800 dark:text-slate-100 font-medium leading-relaxed text-justify">-</strong>
                {/if}
              </div>
              <div class="flex flex-col gap-1 py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span class="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">Makanan Kesukaan</span>
                {#if selectedMember.makanan_kesukaan}
                  <a href="https://www.google.com/search?q={encodeURIComponent(selectedMember.makanan_kesukaan)}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-bold inline-flex items-center gap-1 mt-0.5 w-fit" title="Cari di Google">
                    <span>{selectedMember.makanan_kesukaan}</span>
                    <ExternalLink class="h-3 w-3 shrink-0" />
                  </a>
                {:else}
                  <strong class="text-slate-800 dark:text-slate-100 font-medium leading-relaxed text-justify">-</strong>
                {/if}
              </div>
              <div class="flex flex-col gap-1 py-1.5">
                <span class="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">Musik Kesukaan</span>
                {#if selectedMember.music && selectedMember.music.startsWith('http')}
                  <a href={selectedMember.music} target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-bold break-all inline-flex items-center gap-1 mt-0.5 w-fit">
                    <span>Klik Disini!</span>
                    <ExternalLink class="h-3 w-3 shrink-0" />
                  </a>
                {:else if selectedMember.music}
                  <a href="https://www.youtube.com/results?search_query={encodeURIComponent(selectedMember.music)}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-bold inline-flex items-center gap-1 mt-0.5 w-fit" title="Cari di YouTube">
                    <span>{selectedMember.music}</span>
                    <ExternalLink class="h-3 w-3 shrink-0" />
                  </a>
                {:else}
                  <strong class="text-slate-800 dark:text-slate-100 font-medium leading-relaxed">-</strong>
                {/if}
                
                {#if getYouTubeId(selectedMember.music)}
                  <div class="mt-4 relative group">
                    <!-- Glowing Background -->
                    <div class="absolute -inset-1.5 bg-gradient-to-r from-teal-400 via-blue-500 to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-60 transition duration-500"></div>
                    
                    <div class="relative bg-slate-900 rounded-2xl p-1.5 shadow-xl ring-1 ring-white/10">
                      <!-- macOS Style Top Bar -->
                      <div class="flex items-center justify-between px-3 py-2 border-b border-white/10 mb-1.5">
                        <div class="flex gap-1.5">
                          <div class="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm dark:shadow-none"></div>
                          <div class="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm dark:shadow-none"></div>
                          <div class="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm dark:shadow-none"></div>
                        </div>
                        <div class="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                          <Music class="w-3 h-3 text-teal-400 animate-pulse" />
                          <p class="text-[9px] font-bold text-slate-300 tracking-widest uppercase">Now Playing</p>
                        </div>
                      </div>
                      
                      <!-- Video Container -->
                      <div class="rounded-xl overflow-hidden aspect-video bg-black relative">
                        <!-- Loading placeholder behind video -->
                        <div class="absolute inset-0 bg-slate-800 animate-pulse flex items-center justify-center">
                           <Music class="w-8 h-8 text-slate-700 dark:text-slate-200" />
                        </div>
                        <iframe 
                          class="w-full h-full relative z-10"
                          src="https://www.youtube-nocookie.com/embed/{getYouTubeId(selectedMember.music)}" 
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
          <h4 class="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
            <img src="/love.png" alt="Kesan Pesan Icon" class="h-7 w-7 object-contain drop-shadow-sm" />
            <span>Kesan, Pesan & Kutipan Kenangan</span>
          </h4>
          
          <div class="bg-blue-50/50 dark:bg-slate-800/50 border border-blue-100/60 dark:border-slate-700/50 rounded-3xl p-4 sm:p-6 space-y-6 relative overflow-hidden">
            <!-- Big stylized quote decoration -->
            <div class="absolute -top-3 -left-1 text-[120px] font-serif font-black text-blue-500/10 dark:text-blue-400/5 select-none pointer-events-none leading-none">“</div>
            <div class="absolute -bottom-16 -right-1 text-[120px] font-serif font-black text-blue-500/10 dark:text-blue-400/5 select-none pointer-events-none leading-none">”</div>
  
            {#if selectedMember.kutipan_kenangan}
              <div class="text-center italic py-4 border-b border-slate-200 dark:border-slate-700/40 relative z-10">
                <p class="text-base sm:text-lg font-extrabold text-primary dark:text-blue-400 tracking-tight leading-relaxed">"{selectedMember.kutipan_kenangan}"</p>
                <span class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mt-2">— Kutipan Memori —</span>
              </div>
            {/if}
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold relative z-10">
              <div class="space-y-2">
                <span class="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">Kesan</span>
                <p class="text-slate-700 dark:text-slate-200 font-normal leading-relaxed text-justify bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/60 p-4 rounded-2xl min-h-[80px] shadow-soft-sm hover:border-blue-200/50 dark:hover:border-blue-500/30 transition-all duration-300">
                  {selectedMember.kesan || '-'}
                </p>
              </div>
              <div class="space-y-2">
                <span class="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">Pesan</span>
                <p class="text-slate-700 dark:text-slate-200 font-normal leading-relaxed text-justify bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/60 p-4 rounded-2xl min-h-[80px] shadow-soft-sm hover:border-blue-200/50 dark:hover:border-blue-500/30 transition-all duration-300">
                  {selectedMember.pesan || '-'}
                </p>
              </div>
            </div>
          </div>
        </div>
  
      </div>
    </Card>
  </div>
{:else if isDirectLinkLoading}
  <div class="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
    <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
    <span class="text-xs font-bold text-slate-400 tracking-widest uppercase">Mencari Profil...</span>
  </div>
{:else}
  <!-- ASATIDZAH DIRECTORY GRID LIST VIEW -->
  <div class="space-y-6">
    <PageHeader title={$t('asatidzah.title') || 'Guruku'} backTo="/" />

    <!-- Search and Filter Row -->
    <div class="space-y-0">
      <!-- Search Bar + Filter Dropdown Wrapper -->
      <div class="flex items-center space-x-2 relative">
        <div class="relative flex-1">
          <Search class="absolute left-4 top-3.5 h-5 w-5 text-slate-400 dark:text-slate-500" />
          <Input 
            type="text" 
            placeholder={$t('asatidzah.search_placeholder') || 'Cari berdasarkan nama atau domisili...'} 
            class="pl-12 w-full text-slate-900 dark:!text-white bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-50 dark:bg-slate-800 focus:bg-white dark:bg-slate-900 transition-colors duration-200 border-slate-200 dark:border-slate-700/80 rounded-xl"
            bind:value={searchQuery}
          />
        </div>

        <!-- Filter trigger button -->
        <div class="relative">
          <button
            type="button"
            class="relative p-3 rounded-xl border transition-all duration-200 {showFilter ? 'bg-primary text-white border-primary shadow-soft-sm' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}"
            on:click={() => showFilter = !showFilter}
          >
            <Filter class="h-5 w-5" />
            {#if activeFilterCount > 0}
              <span class="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">{activeFilterCount}</span>
            {/if}
          </button>

          <!-- Floating Dropdown -->
          {#if showFilter}
            <!-- Backdrop to close on outside click -->
            <button
              type="button"
              class="fixed inset-0 z-10 cursor-default bg-transparent"
              on:click={() => showFilter = false}
              aria-label="Tutup filter"
            ></button>

            <div class="absolute right-0 top-[calc(100%+8px)] z-20 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-lg overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-1 duration-150 origin-top-right">
              
              <!-- Kategori section -->
              <div class="px-3 pt-3 pb-2">
                <p class="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">{$t('asatidzah.category_label') || 'Kategori'}</p>
                <div class="flex flex-wrap gap-1">
                  {#each categories as cat}
                    <button
                      type="button"
                      on:click={() => activeCategory = cat.value}
                      class="px-2.5 py-1 text-[10px] font-bold rounded-full transition-all duration-150
                        {activeCategory === cat.value
                          ? 'bg-primary text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:bg-slate-700'}"
                    >{cat.value === 'semua' ? ($t('asatidzah.all') || 'Semua') : cat.label}</button>
                  {/each}
                </div>
              </div>

              <div class="mx-3 border-t border-slate-100 dark:border-slate-800"></div>

              <!-- Daerah Santri section -->
              <div class="px-3 pt-2 pb-2">
                <p class="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">{$t('asatidzah.region_label') || 'Daerah Santri'}</p>
                <div class="mb-2">
                  <input type="text" placeholder={$t('asatidzah.search_region') || 'Cari daerah...'} bind:value={daerahSearch} class="w-full text-slate-900 dark:!text-white text-[11px] px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-primary focus:bg-white dark:bg-slate-900 transition-colors" />
                </div>
                <div class="flex flex-wrap gap-1 max-h-40 overflow-y-auto pr-1">
                  {#each uniqueDaerah.filter(d => d.toLowerCase().includes((daerahSearch || '').toLowerCase())) as d}
                    <button
                      type="button"
                      on:click={() => activeDaerah = d}
                      class="px-2.5 py-1 text-[10px] font-bold rounded-full transition-all duration-150
                        {activeDaerah === d
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:bg-slate-700'}"
                    >{d === 'semua' ? ($t('asatidzah.all') || 'Semua') : d}</button>
                  {/each}
                  {#if uniqueDaerah.filter(d => d.toLowerCase().includes((daerahSearch || '').toLowerCase())).length === 0}
                    <p class="text-[10px] text-slate-400 dark:text-slate-500 italic py-1 px-1">{$t('asatidzah.region_not_found') || 'Daerah tidak ditemukan'}</p>
                  {/if}
                </div>
              </div>

              <!-- Footer: Reset -->
              {#if activeFilterCount > 0}
                <div class="border-t border-slate-100 dark:border-slate-800 px-3 py-2">
                  <button
                    type="button"
                    on:click={() => { activeCategory = 'semua'; activeDaerah = 'semua'; }}
                    class="text-[10px] font-bold text-rose-400 hover:text-rose-600 transition-colors"
                  >{$t('asatidzah.reset_filter') || '✕ Reset semua filter'}</button>
                </div>
              {/if}
            </div>
          {/if}
        </div>
      </div>
    </div>


    <!-- Directory Grid -->
    {#if isLoading}
      {#if searchQuery.trim().length > 0 || activeCategory !== 'semua' || activeDaerah !== 'semua'}
        <div class="py-24 text-center space-y-4">
          <img src="/loading-paperplane.svg" alt="Mencari..." class="h-48 w-48 mx-auto animate-pulse opacity-90" />
          <p class="text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest">{$t('asatidzah.loading') || 'Mencari Data...'}</p>
        </div>
      {:else}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {#each [
          { name: 'w-1/2', loc: 'w-[40%]', meta: 'w-[60%]', delay: '0ms' },
          { name: 'w-2/3', loc: 'w-[30%]', meta: 'w-[75%]', delay: '150ms' },
          { name: 'w-3/4', loc: 'w-[50%]', meta: 'w-[40%]', delay: '300ms' },
          { name: 'w-1/2', loc: 'w-[65%]', meta: 'w-[35%]', delay: '450ms' },
          { name: 'w-5/6', loc: 'w-[45%]', meta: 'w-[55%]', delay: '600ms' },
          { name: 'w-2/3', loc: 'w-[35%]', meta: 'w-[70%]', delay: '750ms' },
          { name: 'w-3/4', loc: 'w-[55%]', meta: 'w-[45%]', delay: '900ms' },
          { name: 'w-1/2', loc: 'w-[70%]', meta: 'w-[50%]', delay: '1050ms' }
        ] as skeleton}
          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-4 sm:p-5 h-[90px] animate-pulse flex flex-col justify-center" style="animation-delay: {skeleton.delay};">
            <div class="flex items-center space-x-3 min-w-0">
              <div class="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0 relative overflow-hidden">
                <div class="absolute inset-0 bg-blue-500/20 rounded-full w-full h-full"></div>
              </div>
              <div class="flex-1 min-w-0 space-y-2.5">
                <div class="flex items-center justify-between gap-2">
                  <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded-full w-full overflow-hidden">
                    <div class="h-full bg-blue-500 rounded-full {skeleton.name}"></div>
                  </div>
                  <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded-full w-full overflow-hidden">
                    <div class="h-full bg-blue-400 rounded-full {skeleton.meta}"></div>
                  </div>
                </div>
                <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded-full w-full overflow-hidden">
                  <div class="h-full bg-blue-300 rounded-full {skeleton.loc}"></div>
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>
      {/if}
    {:else}
      {#if filteredMembers.length > 0}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {#each filteredMembers as member (member.id || member.nama_lengkap)}
            {@const accent = getAccent(member.nama_lengkap)}
            <Card 
              class="group flex flex-col justify-between hover:scale-[1.01] hover:shadow-soft-md transition-all duration-300 cursor-pointer h-full {member.is_active === false ? '!border-rose-400 !bg-rose-100 shadow-sm dark:shadow-none shadow-rose-200/50' : ''}" 
              on:click={() => handleCardClick(member)}
            >
              <div class="flex items-center space-x-3 min-w-0">
                <!-- Avatar with accent ring + dot -->
                <div class="relative shrink-0">
                  {#if member.foto_url && !failedImages.has(member.id)}
                    <img referrerpolicy="no-referrer" 
                      src={convertDriveUrl(member.foto_url)} 
                      alt={member.nama_lengkap}
                      class="h-10 w-10 rounded-full object-cover shadow-soft-sm ring-2 {accent.ring}"
                      on:error={() => { failedImages.add(member.id); failedImages = failedImages; }}
                    />
                  {:else}
                    <div class="h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs shadow-soft-sm ring-2 {accent.avatar} {accent.ring}">
                      {getInitials(member.nama_lengkap)}
                    </div>
                  {/if}
                  <!-- Accent dot -->
                  <span class="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white {accent.dot}"></span>
                </div>
                
                <div class="flex-1 min-w-0 leading-tight">
                  <div class="flex items-center justify-between gap-2">
                    <h3 class="font-extrabold text-slate-800 dark:text-slate-100 text-sm md:text-base truncate group-hover:text-primary transition-colors">
                      {member.nama_lengkap}
                    </h3>
                    <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 px-2.5 py-0.5 rounded-full truncate max-w-[120px]" title={member.alamat_domisili}>
                      {member.alamat_domisili || '-'}
                    </span>
                  </div>
                  
                  <!-- Display nickname | region -->
                  <p class="text-xs text-slate-400 dark:text-slate-500 font-medium truncate mt-1">
                    {member.nama_panggilan || '-'}{member.daerah_santri ? ' | ' + capitalizeEachWord(member.daerah_santri) : ''}
                  </p>
                </div>
              </div>
            </Card>
          {/each}
        </div>
      {:else}
        <div class="py-16 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
          <div class="max-w-xs mx-auto space-y-2">
            {#if searchQuery.trim().length < 2 && activeCategory === 'semua' && activeDaerah === 'semua'}
              <div class="flex justify-center mb-6">
                <img src="/images/islamic-business-woman.svg" alt={$t('asatidzah.start_search') || 'Mulai Pencarian'} class="h-40 w-auto object-contain drop-shadow-sm dark:shadow-none" />
              </div>
              <p class="text-sm font-bold text-slate-600 dark:text-slate-300">{$t('asatidzah.start_search') || 'Mulai Pencarian'}</p>
              <p class="text-xs text-slate-400 dark:text-slate-500">{$t('asatidzah.start_search_desc') || 'Ketik minimal 2 huruf nama atau domisili untuk mulai mencari data.'}</p>
            {:else}
              <div class="flex justify-center mb-6">
                <img src="/search.svg" alt="Tidak Ditemukan" class="h-40 w-auto object-contain drop-shadow-sm dark:shadow-none opacity-80 hover:opacity-100 transition-opacity" />
              </div>
              <p class="text-sm font-bold text-slate-600 dark:text-slate-300">{$t('asatidzah.no_data') || 'Tidak ada asatidzah ditemukan'}</p>
              <p class="text-xs text-slate-400 dark:text-slate-500">{$t('asatidzah.change_keyword') || 'Silakan ganti kata kunci pencarian Anda atau periksa filter yang aktif.'}</p>
            {/if}
          </div>
        </div>
      {/if}
    {/if}
  </div>
{/if}

{#if isImageLarge && selectedMember && allProfilePhotos.length > 0}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <div 
    class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md transition-all duration-300 cursor-zoom-out animate-in fade-in"
    on:click={() => isImageLarge = false}
  >
    <div class="relative max-w-3xl w-full flex flex-col items-center justify-center">
      {#if allProfilePhotos.length > 1}
        <!-- Navigation Buttons -->
        <button type="button" on:click={prevPhoto} class="absolute left-0 md:-left-12 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-900/10 hover:bg-white dark:bg-slate-900/20 text-white rounded-full p-3 backdrop-blur-md transition-all z-10 cursor-pointer">
          <ChevronLeft class="h-6 w-6" />
        </button>
        <button type="button" on:click={nextPhoto} class="absolute right-0 md:-right-12 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-900/10 hover:bg-white dark:bg-slate-900/20 text-white rounded-full p-3 backdrop-blur-md transition-all z-10 cursor-pointer">
          <ChevronRight class="h-6 w-6" />
        </button>
      {/if}

      <div class="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl bg-slate-900/40" on:click={(e) => e.stopPropagation()}>
        <img referrerpolicy="no-referrer" 
          src={convertDriveUrl(allProfilePhotos[currentPhotoIndex].url)} 
          alt={selectedMember.nama_lengkap} 
          class="max-h-[75vh] md:max-h-[80vh] w-auto max-w-full object-contain select-none animate-in zoom-in-95 duration-300 {allProfilePhotos[currentPhotoIndex].status === 'pending' ? 'opacity-50 blur-sm grayscale-[50%]' : ''}"
        />
        
        {#if allProfilePhotos[currentPhotoIndex].status === 'pending'}
          <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
            <div class="bg-amber-500/95 backdrop-blur-md text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 border border-amber-400">
              <Clock class="h-5 w-5 animate-pulse" />
              <span>Menunggu Verifikasi Admin</span>
            </div>
            <p class="text-white/80 font-medium text-xs mt-3 bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm">Foto ini belum dapat dilihat oleh publik</p>
          </div>
        {/if}

        <!-- Info caption at the bottom of the photo -->
        <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-4 pt-12 text-white">
          <p class="font-black text-lg text-center leading-tight tracking-tight drop-shadow-md dark:shadow-none">{selectedMember.nama_lengkap}</p>
          {#if selectedMember.nama_panggilan}
            <p class="text-xs font-semibold text-slate-300 text-center mt-1 drop-shadow-md dark:shadow-none">{selectedMember.nama_panggilan}</p>
          {/if}
          
          {#if allProfilePhotos.length > 1}
            <!-- Dots Indicator in Lightbox -->
            <div class="flex items-center justify-center gap-2 mt-4">
              {#each allProfilePhotos as _, i}
                <div class="w-2 h-2 rounded-full transition-all duration-300 {i === currentPhotoIndex ? 'bg-white dark:bg-slate-900 scale-125' : 'bg-white dark:bg-slate-900/30'}"></div>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- DEACTIVATED WARNING MODAL -->
{#if showDeactivatedWarningFor}
  <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
    <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden max-w-sm w-full border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-300 relative">
      <div class="h-2 w-full bg-gradient-to-r from-rose-500 to-red-600"></div>
      
      <div class="p-6 sm:p-8 flex flex-col items-center text-center space-y-4">
        <div class="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center shrink-0 mb-1">
          <span class="text-3xl">⚠️</span>
        </div>

        <div class="space-y-2">
          <h2 class="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Akun Dinonaktifkan</h2>
          <p class="text-sm font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 leading-relaxed">
            Akun milik <span class="font-bold text-slate-700 dark:text-slate-200">{showDeactivatedWarningFor.nama_lengkap}</span> saat ini sedang dinonaktifkan oleh Admin.
          </p>
          <p class="text-xs text-slate-400 dark:text-slate-500 font-medium">Anda masih bisa melihat data profilnya.</p>
        </div>

        <div class="pt-4 w-full flex flex-col gap-2">
          <button
            type="button"
            on:click={confirmViewDeactivated}
            class="w-full h-11 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold rounded-xl shadow-md dark:shadow-none hover:shadow-lg transition-all duration-200 active:scale-95"
          >
            Oke, Lihat Profil
          </button>
          <button
            type="button"
            on:click={() => showDeactivatedWarningFor = null}
            class="w-full h-11 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl transition-all duration-200"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- CUSTOM TOAST NOTIFICATION -->
{#if showCopyToast}
  <div class="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] animate-in slide-in-from-top-4 fade-in duration-300">
    <div class="bg-slate-800 text-white px-5 py-3 rounded-2xl shadow-xl shadow-slate-900/10 flex items-center gap-3 border border-slate-700/50">
      <div class="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
        <CheckCircle2 class="w-5 h-5" />
      </div>
      <p class="text-sm font-bold tracking-wide">Tautan profil disalin!</p>
    </div>
  </div>
{/if}
