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
    ExternalLink, ChevronDown, GraduationCap
  } from 'lucide-svelte';
  import { slide } from 'svelte/transition';
  import PageHeader from '$lib/components/ui/PageHeader.svelte';

  // State
  let searchQuery = '';
  let daerahSearch = '';
  let activeCategory = 'semua'; // 'semua' | 'alumni' | 'alumnus' | 'mustahiq' | 'mustahiqoh'
  let activeDaerah = 'semua'; // 'semua' = all regions
  let showFilter = false;
  let members: any[] = [];
  let isLoading = false;

  // Warning modal state
  let showDeactivatedWarningFor: any = null;

  // Selected member for inline detailed view (replaces popup)
  let selectedMember: any = null;
  let failedImages = new Set();
  
  // State for image lightbox/modal
  let isImageLarge = false;

  // --- Nilai Akademik State ---
  let showNilaiModal = false;
  let isLoadingNilai = false;
  let nilaiTamrinData: any[] = [];
  let nilaiUjianData: any[] = [];

  // Urutkan nilai sesuai urutan (berdasarkan kolom urutan di database)
  function sortByMapel(data: any[]) {
    const hasValidUrutan = data.some(d => d.urutan !== undefined && d.urutan < 999);
    if (hasValidUrutan) {
      return [...data].sort((a, b) => {
        const ua = a.urutan !== undefined ? a.urutan : 999;
        const ub = b.urutan !== undefined ? b.urutan : 999;
        if (ua !== ub) return ua - ub;
        return 0;
      });
    }
    return data;
  }

  // Tampilkan -1 sebagai 0
  function displayNilai(nilai: any) {
    const n = parseFloat(nilai);
    if (isNaN(n)) return nilai ?? '-';
    return n < 0 ? '0' : String(nilai);
  }

  // New color logic for 0-10 scale
  function getNilaiColor(nilai: any) {
    const n = parseFloat(nilai);
    if (isNaN(n) || n < 0) return 'bg-rose-500';
    if (n >= 8) return 'bg-emerald-500';
    if (n >= 6.5) return 'bg-amber-500';
    return 'bg-rose-500';
  }

  async function fetchNilaiForMember(nis: string) {
    if (!nis) return;
    isLoadingNilai = true;
    nilaiTamrinData = [];
    nilaiUjianData = [];
    
    try {
      const { data: bagianData } = await supabase.from('siswi').select('bagian').eq('nis', nis).limit(1);
      if (bagianData && bagianData.length > 0 && bagianData[0].bagian) {
        selectedMember.bagian = bagianData[0].bagian;
      }
    } catch(e) {}

    try {
      const [tamrinRes, ujianRes] = await Promise.all([
        supabase.from('nilai_tamrin').select('*').eq('nis', nis).eq('kategori', 'Tamrin').order('tahun_ajaran').order('periode').order('created_at', { ascending: true }),
        supabase.from('nilai_tamrin').select('*').eq('nis', nis).eq('kategori', 'Ujian').order('tahun_ajaran').order('periode').order('created_at', { ascending: true })
      ]);
      if (tamrinRes.data) nilaiTamrinData = sortByMapel(tamrinRes.data);
      if (ujianRes.data) nilaiUjianData = sortByMapel(ujianRes.data);
    } catch (err) {
      console.error('Gagal mengambil data nilai:', err);
    } finally {
      isLoadingNilai = false;
    }
  }

  let selectedYear = '';

  function groupByPeriode(data: any[]) {
    return data.reduce((acc: Record<string, any[]>, item: any) => {
      const key = item.periode || '-';
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  }

  // Qobla Maulud dulu, Ba'da belakangan
  function sortedEntries(groups: Record<string, any[]>) {
    return Object.entries(groups).sort(([a], [b]) => {
      const rank = (key: string) => {
        const k = key.toLowerCase();
        if (k.includes('qobla')) return 0;
        if (k.includes("ba'da") || k.includes('bada')) return 1;
        return 2;
      };
      return rank(a) - rank(b);
    });
  }

  $: availableYears = [...new Set([...nilaiTamrinData, ...nilaiUjianData].map(d => d.tahun_ajaran || '-'))].sort((a, b) => b.localeCompare(a));
  
  $: if (availableYears.length > 0 && !availableYears.includes(selectedYear)) {
       selectedYear = availableYears[0];
  }

  $: currentTamrinData = nilaiTamrinData.filter(d => (d.tahun_ajaran || '-') === selectedYear);
  $: currentUjianData = nilaiUjianData.filter(d => (d.tahun_ajaran || '-') === selectedYear);

  $: tamrinGroups = groupByPeriode(currentTamrinData);
  $: ujianGroups = groupByPeriode(currentUjianData);
  
  let isYearDropdownOpen = false;
  let isTamrinOpen = false;
  let isUjianOpen = false;

  function getKelasByTahunAjaran(tahun: string) {
    if (!tahun) return '';
    const startYear = parseInt(tahun.split('-')[0]);
    if (isNaN(startYear)) return '';

    const diff = startYear - 2026;
    switch (diff) {
      case -4: return 'III IBTIDAIYAH';
      case -3: return 'IV IBTIDAIYAH';
      case -2: return 'V IBTIDAIYAH';
      case -1: return 'VI IBTIDAIYAH';
      case 0: return 'I TSANAWIYAH';
      case 1: return 'II TSANAWIYAH';
      case 2: return 'III TSANAWIYAH';
      case 3: return 'I ALIYAH';
      case 4: return 'II ALIYAH';
      case 5: return 'III ALIYAH';
      default: return '';
    }
  }

  // Category configuration
  let categories = [
    { label: 'Semua', value: 'semua' },
    { label: 'Alumni', value: 'alumni' },
    { label: 'Alumnus', value: 'alumnus' },
    { label: 'Mustahiq', value: 'mustahiq' },
    { label: 'Mustahiqoh', value: 'mustahiqoh' }
  ];

  // Unique daerah list from loaded members
  let uniqueDaerah = ['semua'];
  
  onMount(async () => {
    try {
      // Load unique categories and regions directly from the database
      const { data, error } = await supabase
        .from('allowed_alumni')
        .select('kategori_mazeeda, daerah_santri');
        
      if (!error && data) {
        // Extract unique categories
        const uniqueCats = [...new Set(data.map(item => (item.kategori_mazeeda || '').trim().toLowerCase()).filter(Boolean))].sort();
        if (uniqueCats.length > 0) {
          categories = [
            { label: 'Semua', value: 'semua' },
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
    } catch (err) {
      console.error('Failed to fetch filters:', err);
    }
  });

  // Active filter count badge
  $: activeFilterCount = (activeCategory !== 'semua' ? 1 : 0) + (activeDaerah !== 'semua' ? 1 : 0);

  // Mock fallbacks if Supabase table is empty
  const mockFallback = [
    { id: 1, nama_lengkap: 'A\'ISYAH NUR ARLYANA', kategori_mazeeda: 'alumni', email: 'nama.kamu@email.com', no_whatsapp: '89507436989', alamat_domisili: 'HMQ', tahun_masuk: '2022', nama_panggilan: 'Kapten', tempat_lahir: 'JAKARTA', tahun_lahir: '22 September 2010', golongan_darah: '1', alamat_ktp: 'DUSUN III Rt-015 Rw-008, KALIWEDI KIDUL, KALIWEDI, CIREBON, JAWA BARAT.', riwayat_pendidikan: 'SDN SIMPANG', keterampilan_khusus: 'Graphic Design, Copywriting, & Public Speaking', kutipan_kenangan: 'Masa perjuangan tak akan terlupakan', music: 'Shalawat Merdu', hobi: 'Membaca Tafsir', kesan: 'Sangat berkesan belajar di pondok', pesan: 'Tetap jaga ukhuwah islamiyah', daerah_santri: 'EROPA', tiktok_akun: 'a_tiktok', facebook_akun: 'a.fb', xtwitter_akun: 'a_tw', rute_lengkap: 'Dari stasiun mana saja, silakan naik KRL Commuter Line arah Bekasi/Cikarang dan turun di Stasiun Klender. Setelah keluar stasiun, Anda bisa melanjutkan perjalanan menggunakan transportasi online (Grab/Gojek) dengan tujuan ke [Nama Jalan/Perumahan Kamu]. Estimasi waktu perjalanan dari stasiun sekitar 10–15 menit tergantung kondisi lalu lintas', kamar_santri: 'Faza 02', tahfidz_santri: 'BIN NADZRI' }
  ];

  let searchTimeout: ReturnType<typeof setTimeout>;
  
  // Reactive trigger for server-side search
  $: {
    if (searchQuery.trim().length >= 2 || activeCategory !== 'semua' || activeDaerah !== 'semua') {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        performSearch();
      }, 600);
    } else {
      members = [];
      isLoading = false;
    }
  }

  async function performSearch() {
    isLoading = true;
    try {
      let query = supabase.from('allowed_alumni').select('*').limit(50);
      
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
      console.error('Failed to search allowed_alumni:', err);
      members = [];
    } finally {
      isLoading = false;
    }
  }

  // Since we fetch filtered data from server, filteredMembers is just members
  $: filteredMembers = members;

  // Open details inline
  async function openDetails(member: any) {
    selectedMember = member;
    showNilaiModal = false;
    nilaiTamrinData = [];
    nilaiUjianData = [];
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
</script>

{#if selectedMember}
  <!-- INLINE PROFILE DETAIL VIEW (Replaces full screen popup) -->
  <div class="space-y-6 animate-in fade-in duration-300">
    <!-- Back Button Header -->
    <div class="flex items-center justify-between pb-2 border-b border-slate-100">
      <button 
        on:click={() => { selectedMember = null; isImageLarge = false; }}
        class="inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100/50 text-slate-500 hover:text-primary transition-colors -ml-2"
      >
        <ArrowLeft class="w-5 h-5" />
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
          <div class="absolute top-1/2 left-1/3 w-32 h-32 rounded-full bg-white blur-xl animate-pulse" style="animation-duration: 6s;"></div>
        </div>
        <!-- Soft Gradient Fade to White -->
        <div class="absolute bottom-[-1px] left-0 right-0 h-16 sm:h-24 bg-gradient-to-t from-white to-transparent z-0"></div>
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
                <img referrerpolicy="no-referrer" 
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
                <strong class="text-slate-800 font-medium leading-relaxed text-justify">{capitalizeEachWord(selectedMember.alamat_ktp)}</strong>
              </div>
              <div class="flex flex-col gap-1 py-1.5">
                <span class="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Rute Lengkap Perjalanan</span>
                <strong class="text-slate-800 font-medium leading-relaxed text-justify">{selectedMember.rute_lengkap || '-'}</strong>
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
                <strong class="text-slate-800 font-medium leading-relaxed text-justify">{capitalizeEachWord(selectedMember.alamat_riwayatpendidikan)}</strong>
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
                <strong class="text-slate-800 font-medium leading-relaxed text-justify">{selectedMember.hobi || '-'}</strong>
              </div>
              <div class="flex flex-col gap-1 py-1.5 border-b border-slate-100">
                <span class="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Keterampilan Khusus</span>
                <strong class="text-slate-800 font-medium leading-relaxed text-justify">{selectedMember.keterampilan_khusus || '-'}</strong>
              </div>
              <div class="flex flex-col gap-1 py-1.5 border-b border-slate-100">
                <span class="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Cita-cita</span>
                {#if selectedMember.cita_cita}
                  <a href="https://www.google.com/search?q={encodeURIComponent(selectedMember.cita_cita)}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-bold inline-flex items-center gap-1 mt-0.5 w-fit" title="Cari di Google">
                    <span>{selectedMember.cita_cita}</span>
                    <ExternalLink class="h-3 w-3 shrink-0" />
                  </a>
                {:else}
                  <strong class="text-slate-800 font-medium leading-relaxed text-justify">-</strong>
                {/if}
              </div>
              <div class="flex flex-col gap-1 py-1.5 border-b border-slate-100">
                <span class="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Makanan Kesukaan</span>
                {#if selectedMember.makanan_kesukaan}
                  <a href="https://www.google.com/search?q={encodeURIComponent(selectedMember.makanan_kesukaan)}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-bold inline-flex items-center gap-1 mt-0.5 w-fit" title="Cari di Google">
                    <span>{selectedMember.makanan_kesukaan}</span>
                    <ExternalLink class="h-3 w-3 shrink-0" />
                  </a>
                {:else}
                  <strong class="text-slate-800 font-medium leading-relaxed text-justify">-</strong>
                {/if}
              </div>
              <div class="flex flex-col gap-1 py-1.5">
                <span class="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Musik Kesukaan</span>
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
                  <strong class="text-slate-800 font-medium leading-relaxed">-</strong>
                {/if}
                
                {#if getYouTubeId(selectedMember.music)}
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
                        <!-- Loading placeholder behind video -->
                        <div class="absolute inset-0 bg-slate-800 animate-pulse flex items-center justify-center">
                           <Music class="w-8 h-8 text-slate-700" />
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
                <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mt-2">— Kutipan Memori —</span>
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

        <!-- ======= NILAI AKADEMIK SECTION ======= -->
        <div class="space-y-4 pt-2">
          <a
            href="/nilai?nis={selectedMember.nis}"
            class="w-full flex items-center justify-between px-5 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-2xl shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 hover:from-teal-600 hover:to-emerald-600 transition-all duration-300 font-bold"
          >
            <span class="flex items-center gap-2 text-sm">
              <Award class="h-5 w-5" />
              📊 Lihat Transkrip Nilai Akademik
            </span>
            <span class="text-xs font-bold opacity-80 flex items-center gap-1">
              Buka <ExternalLink class="h-3 w-3" />
            </span>
          </a>
        </div>
  
      </div>
    </Card>
  </div>
{:else}
  <!-- SQUAD DIRECTORY GRID LIST VIEW -->
  <div class="space-y-6">
    <PageHeader title="Mazeeda Squad" backTo="/" />

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

            <div class="absolute right-0 top-[calc(100%+8px)] z-20 w-80 bg-white border border-slate-200/80 rounded-2xl shadow-lg overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-1 duration-150 origin-top-right">
              
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
                <div class="mb-2">
                  <input type="text" placeholder="Cari daerah..." bind:value={daerahSearch} class="w-full text-[11px] px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:bg-white transition-colors" />
                </div>
                <div class="flex flex-wrap gap-1 max-h-40 overflow-y-auto pr-1">
                  {#each uniqueDaerah.filter(d => d.toLowerCase().includes((daerahSearch || '').toLowerCase())) as d}
                    <button
                      type="button"
                      on:click={() => activeDaerah = d}
                      class="px-2.5 py-1 text-[10px] font-bold rounded-full transition-all duration-150
                        {activeDaerah === d
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}"
                    >{d === 'semua' ? 'Semua' : d}</button>
                  {/each}
                  {#if uniqueDaerah.filter(d => d.toLowerCase().includes((daerahSearch || '').toLowerCase())).length === 0}
                    <p class="text-[10px] text-slate-400 italic py-1 px-1">Daerah tidak ditemukan</p>
                  {/if}
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
          <div class="bg-white border border-slate-200/60 rounded-2xl p-4 sm:p-5 h-[90px] animate-pulse flex flex-col justify-center" style="animation-delay: {skeleton.delay};">
            <div class="flex items-center space-x-3 min-w-0">
              <div class="h-10 w-10 rounded-full bg-slate-200 shrink-0 relative overflow-hidden">
                <div class="absolute inset-0 bg-blue-500/20 rounded-full w-full h-full"></div>
              </div>
              <div class="flex-1 min-w-0 space-y-2.5">
                <div class="flex items-center justify-between gap-2">
                  <div class="h-4 bg-slate-200 rounded-full w-full overflow-hidden">
                    <div class="h-full bg-blue-500 rounded-full {skeleton.name}"></div>
                  </div>
                  <div class="h-4 bg-slate-200 rounded-full w-full overflow-hidden">
                    <div class="h-full bg-blue-400 rounded-full {skeleton.meta}"></div>
                  </div>
                </div>
                <div class="h-3 bg-slate-200 rounded-full w-full overflow-hidden">
                  <div class="h-full bg-blue-300 rounded-full {skeleton.loc}"></div>
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      {#if filteredMembers.length > 0}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {#each filteredMembers as member (member.id || member.nama_lengkap)}
            {@const accent = getAccent(member.nama_lengkap)}
            <Card 
              class="group flex flex-col justify-between hover:scale-[1.01] hover:shadow-soft-md transition-all duration-300 cursor-pointer h-full {member.is_active === false ? '!border-rose-400 !bg-rose-100 shadow-sm shadow-rose-200/50' : ''}" 
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
            {#if searchQuery.trim().length < 2 && activeCategory === 'semua' && activeDaerah === 'semua'}
              <div class="flex justify-center mb-6">
                <img src="/images/islamic-squad.svg" alt="Mulai Pencarian" class="h-40 w-auto object-contain drop-shadow-sm" />
              </div>
              <p class="text-sm font-bold text-slate-600">Mulai Pencarian</p>
              <p class="text-xs text-slate-400">Ketik minimal 2 huruf nama atau domisili untuk mulai mencari data.</p>
            {:else}
              <p class="text-sm font-bold text-slate-600">Tidak ada anggota ditemukan</p>
              <p class="text-xs text-slate-400">Silakan ganti kata kunci pencarian Anda atau periksa filter kategori yang aktif.</p>
            {/if}
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
        <img referrerpolicy="no-referrer" 
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

<!-- DEACTIVATED WARNING MODAL -->
{#if showDeactivatedWarningFor}
  <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
    <div class="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-sm w-full border border-slate-100 animate-in zoom-in-95 duration-300 relative">
      <div class="h-2 w-full bg-gradient-to-r from-rose-500 to-red-600"></div>
      
      <div class="p-6 sm:p-8 flex flex-col items-center text-center space-y-4">
        <div class="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center shrink-0 mb-1">
          <span class="text-3xl">⚠️</span>
        </div>

        <div class="space-y-2">
          <h2 class="text-lg sm:text-xl font-black text-slate-800 tracking-tight">Akun Dinonaktifkan</h2>
          <p class="text-sm font-medium text-slate-500 leading-relaxed">
            Akun milik <span class="font-bold text-slate-700">{showDeactivatedWarningFor.nama_lengkap}</span> saat ini sedang dinonaktifkan oleh Admin.
          </p>
          <p class="text-xs text-slate-400 font-medium">Anda masih bisa melihat data profilnya.</p>
        </div>

        <div class="pt-4 w-full flex flex-col gap-2">
          <button
            type="button"
            on:click={confirmViewDeactivated}
            class="w-full h-11 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
          >
            Oke, Lihat Profil
          </button>
          <button
            type="button"
            on:click={() => showDeactivatedWarningFor = null}
            class="w-full h-11 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all duration-200"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}
