<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { supabase } from '$lib/supabase';
  import Card from '$lib/components/ui/card.svelte';
  import Input from '$lib/components/ui/input.svelte';
  import Tabs from '$lib/components/ui/tabs.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import { 
    Search, Mail, Phone, MapPin, Plus, ArrowLeft, Filter,
    BookOpen, Heart, Music, Award, User, Globe, Route, Home, ChevronRight,
    ExternalLink
  } from 'lucide-svelte';

  // State
  let searchQuery = '';
  let activeCategory = 'semua'; // 'semua' | 'alumni' | 'alumnus' | 'mustahiq' | 'mustahiqoh'
  let activeDaerah = 'semua'; // 'semua' = all regions
  let showFilter = false;
  let members: any[] = [];
  let isLoading = true;

  // Selected member for inline detailed view (replaces popup)
  let selectedMember: any = null;
  let failedImages = new Set();
  
  // State for image lightbox/modal
  let isImageLarge = false;
  
  // Category configuration
  const categories = [
    { label: 'Semua', value: 'semua' },
    { label: 'Alumni', value: 'alumni' },
    { label: 'Alumnus', value: 'alumnus' },
    { label: 'Mustahiq', value: 'mustahiq' },
    { label: 'Mustahiqoh', value: 'mustahiqoh' }
  ];

  // Unique daerah list from loaded members
  $: uniqueDaerah = ['semua', ...new Set(
    members
      .map((m: any) => (m.daerah_santri || '').trim().toUpperCase())
      .filter(Boolean)
  )].sort((a, b) => a === 'semua' ? -1 : b === 'semua' ? 1 : a.localeCompare(b));

  // Active filter count badge
  $: activeFilterCount = (activeCategory !== 'semua' ? 1 : 0) + (activeDaerah !== 'semua' ? 1 : 0);

  // Mock fallbacks if Supabase table is empty
  const mockFallback = [
    { id: 1, nama_lengkap: 'A\'ISYAH NUR ARLYANA', kategori_mazeeda: 'alumni', email: 'nama.kamu@email.com', no_whatsapp: '89507436989', alamat_domisili: 'HMQ', tahun_masuk: '2022', nama_panggilan: 'Kapten', tempat_lahir: 'JAKARTA', tahun_lahir: '22 September 2010', golongan_darah: '1', alamat_ktp: 'DUSUN III Rt-015 Rw-008, KALIWEDI KIDUL, KALIWEDI, CIREBON, JAWA BARAT.', riwayat_pendidikan: 'SDN SIMPANG', keterampilan_khusus: 'Graphic Design, Copywriting, & Public Speaking', kutipan_kenangan: 'Masa perjuangan tak akan terlupakan', music: 'Shalawat Merdu', hobi: 'Membaca Tafsir', kesan: 'Sangat berkesan belajar di pondok', pesan: 'Tetap jaga ukhuwah islamiyah', daerah_santri: 'EROPA', tiktok_akun: 'a_tiktok', facebook_akun: 'a.fb', xtwitter_akun: 'a_tw', rute_lengkap: 'Dari stasiun mana saja, silakan naik KRL Commuter Line arah Bekasi/Cikarang dan turun di Stasiun Klender. Setelah keluar stasiun, Anda bisa melanjutkan perjalanan menggunakan transportasi online (Grab/Gojek) dengan tujuan ke [Nama Jalan/Perumahan Kamu]. Estimasi waktu perjalanan dari stasiun sekitar 10–15 menit tergantung kondisi lalu lintas', kamar_santri: 'Faza 02', tahfidz_santri: 'BIN NADZRI' }
  ];

  // Fetch data onMount
  onMount(async () => {
    try {
      isLoading = true;
      const { data, error } = await supabase
        .from('allowed_alumni')
        .select('*');
        
      if (error) throw error;
      
      members = data || [];
    } catch (err) {
      console.error('Failed to fetch from allowed_alumni:', err);
      members = [];
    } finally {
      isLoading = false;
    }
  });

  // Filtering Logic
  $: filteredMembers = members.filter((member: any) => {
    const name = member.nama_lengkap || '';
    const email = member.email || '';
    const address = member.alamat_domisili || '';
    const category = member.kategori_mazeeda || '';
    const daerah = (member.daerah_santri || '').trim().toUpperCase();

    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          address.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeCategory === 'semua' || category.toLowerCase() === activeCategory.toLowerCase();
    const matchesDaerah = activeDaerah === 'semua' || daerah === activeDaerah;

    return matchesSearch && matchesCategory && matchesDaerah;
  });

  // Open details inline
  async function openDetails(member: any) {
    selectedMember = member;
    await tick();
    
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
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800`;
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
</script>

{#if selectedMember}
  <!-- INLINE PROFILE DETAIL VIEW (Replaces full screen popup) -->
  <div class="space-y-6 animate-in fade-in duration-300">
    <!-- Back Button Header -->
    <div class="flex items-center justify-between pb-2 border-b border-slate-100">
      <button 
        on:click={() => { selectedMember = null; isImageLarge = false; }}
        class="inline-flex items-center space-x-2 text-slate-500 hover:text-primary transition-colors text-sm font-bold py-2"
        style="min-height: 48px;"
      >
        <ArrowLeft class="h-4.5 w-4.5" />
        <span>Kembali ke Direktori</span>
      </button>
      
      <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">MAZEEDA SQUAD PROFILE</span>
    </div>    <Card noPadding class="overflow-hidden border-slate-200/80 shadow-soft-sm">
      <!-- Profile Header Banner -->
      {@const accent = getAccent(selectedMember.nama_lengkap)}
      <div class="h-32 sm:h-40 w-full bg-gradient-to-r {accent.gradient} relative overflow-hidden">
        <!-- Decorative subtle background shapes -->
        <div class="absolute inset-0 opacity-20 overflow-hidden">
          <div class="absolute -top-10 -left-10 w-44 h-44 rounded-full bg-white blur-xl"></div>
          <div class="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-white blur-2xl"></div>
          <div class="absolute top-1/2 left-1/3 w-32 h-32 rounded-full bg-pink-300 blur-xl animate-pulse" style="animation-duration: 6s;"></div>
        </div>
      </div>

      <!-- Content wrapper with negative margin to overlap avatar with banner -->
      <div class="p-4 sm:p-6 md:p-8 space-y-8 -mt-16 sm:-mt-20 relative z-10">
        
        <!-- Top Section: Avatar & Primary Info (Without NIS & Nama Panggilan) -->
        <div class="flex flex-col sm:flex-row items-center sm:items-end gap-5 pb-6 border-b border-slate-100">
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div 
            class="relative group/avatar h-28 w-28 rounded-3xl bg-white p-0.5 border-2 border-white flex items-center justify-center text-primary font-bold text-3xl shrink-0 overflow-hidden shadow-md transition-all duration-300 {selectedMember.foto_url ? 'cursor-zoom-in hover:scale-105 hover:shadow-lg' : ''}"
            on:click={() => { if (selectedMember.foto_url) isImageLarge = true; }}
          >
            <div class="w-full h-full rounded-2xl overflow-hidden bg-blue-50/50 border border-slate-100 flex items-center justify-center relative">
              <!-- Render EITHER photo OR initials, never both side-by-side -->
              {#if selectedMember.foto_url && !failedImages.has(selectedMember.id)}
                <img 
                  src={convertDriveUrl(selectedMember.foto_url)} 
                  alt={selectedMember.nama_lengkap} 
                  class="h-full w-full object-cover" 
                  on:error={() => { failedImages.add(selectedMember.id); failedImages = failedImages; }} 
                />
                <div 
                  class="absolute inset-0 bg-black/20 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity duration-300 pointer-events-none"
                >
                  <Search class="h-5 w-5 text-white drop-shadow" />
                </div>
              {:else}
                {getInitials(selectedMember.nama_lengkap)}
              {/if}
            </div>
          </div>
          
          <div class="text-center sm:text-left space-y-2 min-w-0 flex-1 pb-1">
            <h2 class="text-2xl md:text-3xl font-black text-slate-800 tracking-tight leading-tight py-1 truncate">{selectedMember.nama_lengkap}</h2>
            {#if selectedMember.nama_panggilan}
              <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs font-bold">
                <span class="px-2.5 py-1 bg-slate-100 rounded-full text-slate-600 border border-slate-200/50">{selectedMember.nama_panggilan}</span>
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
                <strong class="text-slate-800">{capitalizeEachWord(selectedMember.tempat_lahir)}</strong>
              </div>
              <div class="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span class="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Tanggal Lahir</span>
                <strong class="text-slate-800">{selectedMember.tahun_lahir || '-'}</strong>
              </div>
              <div class="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span class="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Golongan Darah</span>
                <strong class="text-slate-800">{selectedMember.golongan_darah || '-'}</strong>
              </div>
              <div class="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span class="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Daerah</span>
                <strong class="text-slate-800 font-bold">{capitalizeEachWord(selectedMember.daerah_santri) || '-'}</strong>
              </div>
              <div class="flex flex-col gap-1 py-1.5 border-b border-slate-100">
                <span class="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Tempat Tinggal</span>
                <strong class="text-slate-800 font-medium leading-relaxed">{capitalizeEachWord(selectedMember.alamat_ktp)}</strong>
              </div>
              <div class="flex flex-col gap-1 py-1.5">
                <span class="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Rute Lengkap Perjalanan</span>
                <strong class="text-slate-800 font-medium leading-relaxed">{selectedMember.rute_lengkap || '-'}</strong>
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
                <strong class="text-slate-800">{selectedMember.alamat_domisili || '-'}</strong>
              </div>
              <div class="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span class="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Tahun Masuk</span>
                <strong class="text-slate-800">{selectedMember.tahun_masuk || '-'}</strong>
              </div>
              <div class="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span class="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Kamar</span>
                <strong class="text-slate-800">{selectedMember.kamar_santri || '-'}</strong>
              </div>
              <div class="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span class="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Status Tahfidz</span>
                <strong class="text-slate-800 font-bold">{capitalizeEachWord(selectedMember.tahfidz_santri) || '-'}</strong>
              </div>
              <div class="flex flex-col gap-1 py-1.5 border-b border-slate-100">
                <span class="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Riwayat Pendidikan</span>
                <strong class="text-slate-800 font-medium">{selectedMember.riwayat_pendidikan || '-'}</strong>
              </div>
              <div class="flex flex-col gap-1 py-1.5">
                <span class="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Alamat Pendidikan</span>
                <strong class="text-slate-800 font-medium leading-relaxed">{capitalizeEachWord(selectedMember.alamat_riwayatpendidikan)}</strong>
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
                {#if selectedMember.no_whatsapp}
                  <a href={getWhatsAppLink(selectedMember.no_whatsapp)} target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-bold inline-flex items-center gap-1">
                    <span>{formatWhatsApp(selectedMember.no_whatsapp)}</span>
                    <ExternalLink class="h-3 w-3" />
                  </a>
                {:else}
                  <strong class="text-slate-400 font-bold">-</strong>
                {/if}
              </div>
              <div class="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span class="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Email</span>
                {#if selectedMember.email}
                  <a href="https://mail.google.com/mail/?view=cm&fs=1&to={selectedMember.email}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-bold truncate max-w-[180px] inline-flex items-center gap-1" title={selectedMember.email}>
                    <span class="truncate">{selectedMember.email}</span>
                    <ExternalLink class="h-3 w-3 shrink-0" />
                  </a>
                {:else}
                  <strong class="text-slate-400 font-bold">-</strong>
                {/if}
              </div>
              <div class="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span class="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Instagram</span>
                {#if selectedMember.media_social}
                  <a href={getInstagramLink(selectedMember.media_social)} target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-bold inline-flex items-center gap-1">
                    <span>{selectedMember.media_social.toLowerCase()}</span>
                    <ExternalLink class="h-3 w-3" />
                  </a>
                {:else}
                  <strong class="text-slate-400 font-bold">-</strong>
                {/if}
              </div>
              <div class="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span class="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Tiktok</span>
                {#if selectedMember.tiktok_akun}
                  <a href={getTiktokLink(selectedMember.tiktok_akun)} target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-bold inline-flex items-center gap-1">
                    <span>{selectedMember.tiktok_akun}</span>
                    <ExternalLink class="h-3 w-3" />
                  </a>
                {:else}
                  <strong class="text-slate-400 font-bold">-</strong>
                {/if}
              </div>
              <div class="flex justify-between items-center py-1.5">
                <span class="text-slate-400 font-bold uppercase tracking-wider text-[10px]">X / Twitter</span>
                {#if selectedMember.xtwitter_akun}
                  <a href={getXTwitterLink(selectedMember.xtwitter_akun)} target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-bold inline-flex items-center gap-1">
                    <span>{selectedMember.xtwitter_akun}</span>
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
                <strong class="text-slate-800 font-medium leading-relaxed">{selectedMember.hobi || '-'}</strong>
              </div>
              <div class="flex flex-col gap-1 py-1.5 border-b border-slate-100">
                <span class="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Keterampilan Khusus</span>
                <strong class="text-slate-800 font-medium leading-relaxed">{selectedMember.keterampilan_khusus || '-'}</strong>
              </div>
              <div class="flex flex-col gap-1 py-1.5">
                <span class="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Musik Kesukaan</span>
                {#if selectedMember.music && selectedMember.music.startsWith('http')}
                  <a href={selectedMember.music} target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-bold break-all inline-block mt-0.5">Klik Disini!</a>
                {:else}
                  <strong class="text-slate-800 font-medium leading-relaxed">{selectedMember.music || '-'}</strong>
                {/if}
                
                {#if getYouTubeId(selectedMember.music)}
                  <div class="mt-3 rounded-2xl overflow-hidden aspect-video border border-slate-200/80 shadow-soft-sm hover:shadow-soft-md transition-all duration-300">
                    <iframe 
                      class="w-full h-full animate-in fade-in"
                      src="https://www.youtube.com/embed/{getYouTubeId(selectedMember.music)}" 
                      title="YouTube video player" 
                      frameborder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                      allowfullscreen
                    ></iframe>
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
            <!-- Big stylized quote decoration -->
            <div class="absolute -top-3 -left-1 text-[120px] font-serif font-black text-blue-500/10 select-none pointer-events-none leading-none">“</div>
            <div class="absolute -bottom-16 -right-1 text-[120px] font-serif font-black text-blue-500/10 select-none pointer-events-none leading-none">”</div>
  
            {#if selectedMember.kutipan_kenangan}
              <div class="text-center italic py-4 border-b border-slate-200/40 relative z-10">
                <p class="text-base sm:text-lg font-extrabold text-primary tracking-tight leading-relaxed">"{selectedMember.kutipan_kenangan}"</p>
                <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mt-2">— Kutipan Memori</span>
              </div>
            {/if}
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold relative z-10">
              <div class="space-y-2">
                <span class="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Kesan</span>
                <p class="text-slate-700 font-normal leading-relaxed bg-white border border-slate-200/60 p-4 rounded-2xl min-h-[80px] shadow-soft-sm hover:border-blue-200/50 transition-all duration-300">
                  {selectedMember.kesan || '-'}
                </p>
              </div>
              <div class="space-y-2">
                <span class="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Pesan</span>
                <p class="text-slate-700 font-normal leading-relaxed bg-white border border-slate-200/60 p-4 rounded-2xl min-h-[80px] shadow-soft-sm hover:border-blue-200/50 transition-all duration-300">
                  {selectedMember.pesan || '-'}
                </p>
              </div>
            </div>
          </div>
        </div>
  
      </div>
    </Card>
  </div>
{:else}
  <!-- SQUAD DIRECTORY GRID LIST VIEW -->
  <div class="space-y-6">



    <!-- Search and Filter Row -->
    <div class="space-y-0">
      <!-- Search Bar + Filter Dropdown Wrapper -->
      <div class="flex items-center space-x-2 relative">
        <div class="relative flex-1">
          <Search class="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
          <Input 
            type="text" 
            placeholder="Cari berdasarkan nama atau domisili..." 
            class="pl-12 w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white transition-colors duration-200 border-slate-200/80 rounded-xl"
            bind:value={searchQuery}
          />
        </div>

        <!-- Filter trigger button -->
        <div class="relative">
          <button
            type="button"
            class="relative p-3 rounded-xl border transition-all duration-200 {showFilter ? 'bg-primary text-white border-primary shadow-soft-sm' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600'}"
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

            <div class="absolute right-0 top-[calc(100%+8px)] z-20 w-64 bg-white border border-slate-200/80 rounded-2xl shadow-lg overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-1 duration-150 origin-top-right">
              
              <!-- Kategori section -->
              <div class="px-3 pt-3 pb-2">
                <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Kategori</p>
                <div class="flex flex-wrap gap-1">
                  {#each categories as cat}
                    <button
                      type="button"
                      on:click={() => activeCategory = cat.value}
                      class="px-2.5 py-1 text-[10px] font-bold rounded-full transition-all duration-150
                        {activeCategory === cat.value
                          ? 'bg-primary text-white'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}"
                    >{cat.label}</button>
                  {/each}
                </div>
              </div>

              <div class="mx-3 border-t border-slate-100"></div>

              <!-- Daerah Santri section -->
              <div class="px-3 pt-2 pb-2">
                <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Daerah Santri</p>
                <div class="flex flex-wrap gap-1 max-h-28 overflow-y-auto">
                  {#each uniqueDaerah as d}
                    <button
                      type="button"
                      on:click={() => activeDaerah = d}
                      class="px-2.5 py-1 text-[10px] font-bold rounded-full transition-all duration-150
                        {activeDaerah === d
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}"
                    >{d === 'semua' ? 'Semua' : d}</button>
                  {/each}
                </div>
              </div>

              <!-- Footer: Reset -->
              {#if activeFilterCount > 0}
                <div class="border-t border-slate-100 px-3 py-2">
                  <button
                    type="button"
                    on:click={() => { activeCategory = 'semua'; activeDaerah = 'semua'; }}
                    class="text-[10px] font-bold text-rose-400 hover:text-rose-600 transition-colors"
                  >✕ Reset semua filter</button>
                </div>
              {/if}
            </div>
          {/if}
        </div>
      </div>
    </div>


    <!-- Directory Grid -->
    {#if isLoading}
      <div class="py-24 text-center space-y-4">
        <div class="animate-spin h-8 w-8 border-3 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p class="text-xs font-semibold text-slate-500">Menyinkronkan data alumni...</p>
      </div>
    {:else}
      {#if filteredMembers.length > 0}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {#each filteredMembers as member (member.id || member.nama_lengkap)}
            {@const accent = getAccent(member.nama_lengkap)}
            <Card 
              class="group flex flex-col justify-between hover:scale-[1.01] hover:shadow-soft-md transition-all duration-300 cursor-pointer h-full" 
              on:click={() => openDetails(member)}
            >
              <div class="flex items-center space-x-3 min-w-0">
                <!-- Avatar with accent ring + dot -->
                <div class="relative shrink-0">
                  {#if member.foto_url && !failedImages.has(member.id)}
                    <img 
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
                    <h3 class="font-extrabold text-slate-800 text-sm md:text-base truncate group-hover:text-primary transition-colors">
                      {member.nama_lengkap}
                    </h3>
                    <span class="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200/50 px-2.5 py-0.5 rounded-full truncate max-w-[120px]" title={member.alamat_domisili}>
                      {member.alamat_domisili || '-'}
                    </span>
                  </div>
                  
                  <!-- Display nickname | region -->
                  <p class="text-xs text-slate-400 font-medium truncate mt-1">
                    {member.nama_panggilan || '-'}{member.daerah_santri ? ' | ' + capitalizeEachWord(member.daerah_santri) : ''}
                  </p>
                </div>
              </div>
            </Card>
          {/each}
        </div>
      {:else}
        <div class="py-16 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <div class="max-w-xs mx-auto space-y-2">
            <p class="text-sm font-bold text-slate-600">Tidak ada anggota ditemukan</p>
            <p class="text-xs text-slate-400">Silakan ganti kata kunci pencarian Anda atau periksa filter kategori yang aktif.</p>
          </div>
        </div>
      {/if}
    {/if}
  </div>
{/if}

{#if isImageLarge && selectedMember && selectedMember.foto_url}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <div 
    class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md transition-all duration-300 cursor-zoom-out animate-in fade-in"
    on:click={() => isImageLarge = false}
  >
    <div class="relative max-w-3xl w-full flex flex-col items-center justify-center">
      <div class="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl bg-slate-900/40">
        <img 
          src={convertDriveUrl(selectedMember.foto_url)} 
          alt={selectedMember.nama_lengkap} 
          class="max-h-[75vh] md:max-h-[80vh] w-auto max-w-full object-contain select-none animate-in zoom-in-95 duration-300"
        />
        
        <!-- Info caption at the bottom of the photo -->
        <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-4 pt-12 text-white">
          <p class="font-black text-lg text-center leading-tight tracking-tight drop-shadow-md">{selectedMember.nama_lengkap}</p>
          {#if selectedMember.nama_panggilan}
            <p class="text-xs font-semibold text-slate-300 text-center mt-1 drop-shadow-md">{selectedMember.nama_panggilan}</p>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}
