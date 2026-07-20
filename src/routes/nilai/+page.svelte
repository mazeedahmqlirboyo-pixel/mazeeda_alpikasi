<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { supabase } from '$lib/supabase';
  import Card from '$lib/components/ui/card.svelte';
  import PageHeader from '$lib/components/ui/PageHeader.svelte';
  import ImageLightbox from '$lib/components/ImageLightbox.svelte';
  import { slide } from 'svelte/transition';
  import { Search, Award, ChevronRight, ArrowLeft, BookOpen, GraduationCap, X, ChevronDown } from 'lucide-svelte';

  // Search state
  let searchQuery = '';
  let searchResults: any[] = [];
  let isSearching = false;
  let searchTimeout: any;
  let hasSearched = false;
  let failedImages = new Set<string>();

  onMount(async () => {
    // Check if there's a specific NIS in the URL
    const nis = $page.url.searchParams.get('nis');
    if (nis) {
      const { data } = await supabase
        .from('allowed_alumni')
        .select('id, nama_lengkap, nis, foto_url, daerah_santri')
        .eq('nis', nis)
        .single();
      
      if (data) {
        selectStudent(data);
      }
    } else {
      // Check if there's a search query in the URL
      const q = $page.url.searchParams.get('q');
      if (q) {
        searchQuery = q;
      }
    }
  });

  // Action to force play when element is added to DOM
  function autoPlayLottie(node: any) {
    const playAnim = () => {
      if (node && typeof node.play === 'function') {
        node.play();
      } else {
        setTimeout(playAnim, 100);
      }
    };
    playAnim();
    return { destroy() {} };
  }

  // Selected student state
  let selectedStudent: any = null;
  let nilaiTamrinData: any[] = [];
  let nilaiUjianData: any[] = [];
  let isLoadingNilai = false;
  let selectedFailedImg = false;

  let showLightbox = false;
  let lightboxImageUrl = '';

  function openLightbox(url: string) {
    if (!url) return;
    lightboxImageUrl = convertDriveUrl(url);
    showLightbox = true;
  }

  // Urutkan nilai sesuai urutan (berdasarkan kolom urutan di database)
  function sortByMapel(data: any[]) {
    const hasValidUrutan = data.some(d => d.urutan !== undefined && d.urutan < 999);
    if (hasValidUrutan) {
      return [...data].sort((a, b) => {
        const ua = a.urutan !== undefined ? a.urutan : 999;
        const ub = b.urutan !== undefined ? b.urutan : 999;
        if (ua !== ub) return ua - ub;
        return (a.id || 0) - (b.id || 0);
      });
    }

    return data;
  }

  function convertDriveUrl(url: string) {
    if (!url) return '';
    let cleaned = url.trim();
    if (cleaned.includes('lh3.googleusercontent.com/u/0/d/')) {
      return cleaned.replace('lh3.googleusercontent.com/u/0/d/', 'lh3.googleusercontent.com/d/');
    }
    const match = cleaned.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
                  cleaned.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) return `https://lh3.googleusercontent.com/d/${match[1]}`;
    return cleaned;
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

  // Urutkan group: Qobla Maulud dulu, Ba'da Maulud belakangan
  function sortedEntries(groups: Record<string, any[]>) {
    return Object.entries(groups).sort(([a], [b]) => {
      const periodeRank = (key: string) => {
        const k = key.toLowerCase();
        if (k.includes('qobla')) return 0;
        if (k.includes("ba'da") || k.includes('bada')) return 1;
        return 2;
      };
      return periodeRank(a) - periodeRank(b);
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

  function getInitials(name: string) {
    if (!name) return '?';
    return name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
  }

  // Consistent accent color (same as squad page logic)
  const accentPalette = [
    { gradient: 'from-violet-500 via-indigo-500 to-purple-600', bg: 'bg-violet-100 text-violet-700' },
    { gradient: 'from-sky-400 via-blue-500 to-indigo-600', bg: 'bg-sky-100 text-sky-700' },
    { gradient: 'from-emerald-400 via-teal-500 to-cyan-600', bg: 'bg-emerald-100 text-emerald-700' },
    { gradient: 'from-rose-400 via-pink-500 to-red-500', bg: 'bg-rose-100 text-rose-700' },
    { gradient: 'from-amber-400 via-orange-400 to-yellow-500', bg: 'bg-amber-100 text-amber-700' },
    { gradient: 'from-teal-400 via-emerald-500 to-green-500', bg: 'bg-teal-100 text-teal-700' },
    { gradient: 'from-pink-400 via-rose-500 to-purple-500', bg: 'bg-pink-100 text-pink-700' },
    { gradient: 'from-indigo-500 via-purple-500 to-pink-500', bg: 'bg-indigo-100 text-indigo-700' },
    { gradient: 'from-orange-400 via-amber-500 to-red-500', bg: 'bg-orange-100 text-orange-700' },
    { gradient: 'from-cyan-400 via-sky-500 to-blue-500', bg: 'bg-cyan-100 text-cyan-700' }
  ];

  function getAccent(name: string) {
    if (!name) return accentPalette[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return accentPalette[Math.abs(hash) % accentPalette.length];
  }

  // Search students
  async function performSearch() {
    const q = searchQuery.trim();
    if (q.length < 2) { searchResults = []; hasSearched = false; return; }
    isSearching = true;
    hasSearched = true;
    try {
      const { data, error } = await supabase
        .from('allowed_alumni')
        .select('id, nama_lengkap, nis, foto_url, daerah_santri')
        .ilike('nama_lengkap', `%${q}%`)
        .order('nama_lengkap')
        .limit(20);
      if (!error && data) searchResults = data;
    } catch (err) {
      console.error(err);
    } finally {
      isSearching = false;
    }
  }

  $: {
    clearTimeout(searchTimeout);
    if (searchQuery.trim().length >= 2) {
      searchTimeout = setTimeout(performSearch, 500);
    } else {
      searchResults = [];
      hasSearched = false;
    }
  }

  // Fetch grades for selected student
  async function selectStudent(student: any) {
    selectedStudent = student;
    selectedFailedImg = false;
    nilaiTamrinData = [];
    nilaiUjianData = [];
    isLoadingNilai = true;
    
    try {
      // Try fetching bagian from a dedicated 'siswi' table silently just in case they added it there
      const { data: bagianData } = await supabase.from('siswi').select('bagian').eq('nis', student.nis).limit(1);
      if (bagianData && bagianData.length > 0 && bagianData[0].bagian) {
        selectedStudent.bagian = bagianData[0].bagian;
      }
    } catch(e) {}

    try {
      const [tamrinRes, ujianRes] = await Promise.all([
        supabase.from('nilai_tamrin').select('*').eq('nis', student.nis).eq('kategori', 'Tamrin').order('tahun_ajaran').order('periode').order('created_at', { ascending: true }),
        supabase.from('nilai_tamrin').select('*').eq('nis', student.nis).eq('kategori', 'Ujian').order('tahun_ajaran').order('periode').order('created_at', { ascending: true })
      ]);
      if (tamrinRes.data) nilaiTamrinData = sortByMapel(tamrinRes.data);
      if (ujianRes.data) nilaiUjianData = sortByMapel(ujianRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      isLoadingNilai = false;
    }
  }

  function backToSearch() {
    selectedStudent = null;
    nilaiTamrinData = [];
    nilaiUjianData = [];
  }

  function getAvgNilai(data: any[]) {
    const nums = data.map(d => parseFloat(d.nilai)).filter(n => !isNaN(n));
    if (nums.length === 0) return null;
    return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1);
  }

  $: avgTamrin = getAvgNilai(nilaiTamrinData);
  $: avgUjian = getAvgNilai(nilaiUjianData);
</script>

<svelte:head>
  <title>Nilai Akademik – MAZEEDA</title>
  <meta name="description" content="Lihat transkrip nilai akademik santri MAZEEDA – Nilai Tamrin dan Nilai Ujian Semester." />
</svelte:head>

<div class="space-y-6 pb-12">
  {#if selectedStudent}
    <!-- ===================== DETAIL NILAI VIEW ===================== -->
    {@const accent = getAccent(selectedStudent.nama_lengkap)}
    <div class="space-y-2">
      <!-- Back header -->
      <button
        on:click={backToSearch}
        class="flex items-center justify-center w-10 h-10 rounded-full text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
      >
        <ArrowLeft class="h-5 w-5" />
      </button>

      <!-- Student profile header -->
      <div class="bg-white border border-slate-200 rounded-2xl shadow-soft-sm p-5 text-left focus:outline-none">
        <div class="flex items-center gap-4">
          <!-- Profile photo same as squad -->
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div 
            class="h-16 w-16 rounded-2xl bg-gradient-to-br {accent.gradient} flex items-center justify-center text-white font-black text-xl shrink-0 shadow-md overflow-hidden {selectedStudent.foto_url && !selectedFailedImg ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}"
            on:click={() => selectedStudent.foto_url && !selectedFailedImg && openLightbox(selectedStudent.foto_url)}
          >
            {#if selectedStudent.foto_url && !selectedFailedImg}
              <img
                src={convertDriveUrl(selectedStudent.foto_url)}
                alt={selectedStudent.nama_lengkap}
                class="w-full h-full object-cover"
                on:error={() => { selectedFailedImg = true; }}
              />
            {:else}
              {getInitials(selectedStudent.nama_lengkap)}
            {/if}
          </div>
          <div class="flex-1 min-w-0">
            <h2 class="text-xl font-black text-slate-800 tracking-tight">{selectedStudent.nama_lengkap}</h2>
            {#if selectedStudent.nis}
              <div class="mt-1 w-full">
                <div class="text-[9px] sm:text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 inline-block max-w-full break-words leading-tight shadow-sm">
                  NIS: {selectedStudent.nis}
                  {#if getKelasByTahunAjaran(selectedYear)}
                    <span class="text-blue-300 mx-1.5 font-normal inline-block">|</span> {getKelasByTahunAjaran(selectedYear)}
                  {/if}
                  {#if selectedStudent.bagian}
                    <span class="text-blue-300 mx-1.5 font-normal inline-block">|</span> {selectedStudent.bagian}
                  {/if}
                </div>
              </div>
            {/if}
          </div>
        </div>

        {#if availableYears.length > 0}
          <div class="mt-6 border-t border-slate-100 pt-5">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Tahun Ajaran</p>
            <div class="relative">
              <button 
                on:click={() => isYearDropdownOpen = !isYearDropdownOpen}
                class="w-full sm:w-64 flex items-center justify-between px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-700 hover:border-blue-300 hover:bg-blue-50 transition-all shadow-sm"
              >
                <span>{selectedYear || 'Pilih Tahun Ajaran'}</span>
                <ChevronDown class="h-4 w-4 text-slate-400 transition-transform {isYearDropdownOpen ? 'rotate-180' : ''}" />
              </button>
              {#if isYearDropdownOpen}
                <div 
                  transition:slide={{ duration: 200 }}
                  class="absolute top-full left-0 mt-2 w-full sm:w-64 bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-200/50 overflow-hidden z-10"
                >
                  <div class="max-h-60 overflow-y-auto py-1">
                    {#each availableYears as year}
                      <button 
                        on:click={() => { selectedYear = year; isYearDropdownOpen = false; }}
                        class="w-full text-left px-4 py-2 text-sm font-bold transition-colors {selectedYear === year ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}"
                      >
                        {year}
                      </button>
                    {/each}
                  </div>
                </div>
              {/if}
            </div>
          </div>
        {/if}
      </div>

      {#if isLoadingNilai}
        <Card class="p-12">
          <div class="flex flex-col items-center gap-3 text-slate-400">
            <div class="h-8 w-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <p class="text-sm font-semibold">Mengambil data nilai...</p>
          </div>
        </Card>
      {:else if nilaiTamrinData.length === 0 && nilaiUjianData.length === 0}
        <Card class="p-12">
          <div class="flex flex-col items-center gap-3 text-slate-400">
            <div class="p-4 bg-slate-100 rounded-2xl">
              <BookOpen class="h-8 w-8" />
            </div>
            <p class="text-sm font-semibold">Belum ada data nilai untuk santri ini.</p>
            <p class="text-xs text-center">Data nilai dapat diupload melalui Panel Admin → Nilai Akademik.</p>
          </div>
        </Card>
      {:else}
        <!-- NILAI TAMRIN -->
        {#if currentTamrinData.length > 0}
          <div class="space-y-3">
            <button 
              on:click={() => isTamrinOpen = !isTamrinOpen}
              class="w-full flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-blue-200 transition-colors"
            >
              <div class="flex items-center gap-3">
                <div class="p-2.5 bg-blue-50 rounded-xl border border-blue-100">
                  <BookOpen class="h-5 w-5 text-blue-600" />
                </div>
                <h3 class="text-base font-black text-slate-800 tracking-tight">Nilai Tamrin</h3>
              </div>
              <ChevronDown class="h-5 w-5 text-slate-400 transition-transform {isTamrinOpen ? 'rotate-180' : ''}" />
            </button>
            
            {#if isTamrinOpen}
              <div transition:slide={{ duration: 200 }} class="space-y-3 pt-1">
                {#each sortedEntries(tamrinGroups) as [groupKey, groupItems]}
                  <Card class="overflow-hidden">
                    <div class="px-4 py-2.5 bg-gradient-to-r from-blue-50 to-sky-50 border-b border-blue-100">
                      <p class="text-[10px] font-black text-blue-700 uppercase tracking-widest">{groupKey}</p>
                    </div>
                    <div class="p-3 grid grid-cols-1 gap-1.5">
                      {#each groupItems as row}
                        <div class="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 hover:bg-blue-50/40 transition-colors">
                          <span class="text-xs font-semibold text-slate-700 flex-1 mr-2">{row.mata_pelajaran || '-'}</span>
                          <div class="flex items-center gap-2 shrink-0">
                            {#if row.catatan && row.catatan !== '-' && row.catatan !== ''}
                              <span class="text-[10px] text-slate-400 font-medium italic">{row.catatan}</span>
                            {/if}
                            <span class="inline-block min-w-[36px] text-center px-2 py-0.5 rounded-full font-black text-white text-xs {getNilaiColor(row.nilai)}">
                              {displayNilai(row.nilai)}
                            </span>
                          </div>
                        </div>
                      {/each}
                    </div>
                  </Card>
                {/each}
              </div>
            {/if}
          </div>
        {/if}

        <!-- NILAI UJIAN SEMESTER -->
        {#if currentUjianData.length > 0}
          <div class="space-y-3">
            <button 
              on:click={() => isUjianOpen = !isUjianOpen}
              class="w-full flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-indigo-200 transition-colors"
            >
              <div class="flex items-center gap-3">
                <div class="p-2.5 bg-indigo-50 rounded-xl border border-indigo-100">
                  <GraduationCap class="h-5 w-5 text-indigo-600" />
                </div>
                <h3 class="text-base font-black text-slate-800 tracking-tight">Nilai Ujian Semester</h3>
              </div>
              <ChevronDown class="h-5 w-5 text-slate-400 transition-transform {isUjianOpen ? 'rotate-180' : ''}" />
            </button>
            
            {#if isUjianOpen}
              <div transition:slide={{ duration: 200 }} class="space-y-3 pt-1">
                {#each sortedEntries(ujianGroups) as [groupKey, groupItems]}
                  <Card class="overflow-hidden">
                    <div class="px-4 py-2.5 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
                      <p class="text-[10px] font-black text-indigo-700 uppercase tracking-widest">{groupKey}</p>
                    </div>
                    <div class="p-3 grid grid-cols-1 gap-1.5">
                      {#each groupItems as row}
                        <div class="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 hover:bg-indigo-50/40 transition-colors">
                          <span class="text-xs font-semibold text-slate-700 flex-1 mr-2">{row.mata_pelajaran || '-'}</span>
                          <div class="flex items-center gap-2 shrink-0">
                            {#if row.catatan && row.catatan !== '-' && row.catatan !== ''}
                              <span class="text-[10px] text-slate-400 font-medium italic">{row.catatan}</span>
                            {/if}
                            <span class="inline-block min-w-[36px] text-center px-2 py-0.5 rounded-full font-black text-white text-xs {getNilaiColor(row.nilai)}">
                              {displayNilai(row.nilai)}
                            </span>
                          </div>
                        </div>
                      {/each}
                    </div>
                  </Card>
                {/each}
              </div>
            {/if}
          </div>
        {/if}
      {/if}
    </div>

  {:else}
    <!-- ===================== SEARCH VIEW ===================== -->
    <PageHeader title="Nilai Akademik" backTo="/" />

    <!-- Search Bar Only -->
    <div class="relative mt-2">
      <Search class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
      <input
        type="text"
        placeholder="Ketik nama santri..."
        bind:value={searchQuery}
        class="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 text-sm font-semibold focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm transition-all"
      />
      {#if searchQuery}
        <button on:click={() => { searchQuery = ''; searchResults = []; hasSearched = false; }} class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-slate-100 p-1 rounded-full transition-colors">
          <X class="h-3.5 w-3.5" />
        </button>
      {/if}
    </div>

    <!-- Results -->
    {#if isSearching}
      <div class="flex items-center justify-center py-10 gap-3 text-slate-400">
        <div class="h-5 w-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        <span class="text-sm font-semibold">Mencari...</span>
      </div>

    {:else if hasSearched && searchResults.length === 0}
      <Card class="p-10 text-center">
        <div class="flex flex-col items-center gap-3 text-slate-400">
          <div class="p-4 bg-slate-100 rounded-2xl"><Search class="h-7 w-7" /></div>
          <p class="text-sm font-semibold">Tidak ditemukan santri dengan nama "<strong class="text-slate-600">{searchQuery}</strong>"</p>
        </div>
      </Card>

    {:else if searchResults.length > 0}
      <div class="space-y-1.5 mt-3">
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-2">{searchResults.length} santri ditemukan</p>
        {#each searchResults as student}
          {@const accent = getAccent(student.nama_lengkap)}
          <button type="button" on:click={() => selectStudent(student)} class="w-full text-left group">
            <div class="bg-white rounded-xl border border-slate-100 p-3.5 hover:border-blue-300 hover:shadow-sm transition-all duration-200 cursor-pointer">
              <div class="flex items-center gap-3.5">
                <!-- Photo avatar slightly bigger -->
                <div class="h-10 w-10 rounded-xl bg-gradient-to-br {accent.gradient} flex items-center justify-center text-white font-black text-xs shrink-0 shadow-sm overflow-hidden">
                  {#if student.foto_url && !failedImages.has(student.id)}
                    <img
                      src={convertDriveUrl(student.foto_url)}
                      alt={student.nama_lengkap}
                      class="w-full h-full object-cover"
                      on:error={() => { failedImages.add(student.id); failedImages = failedImages; }}
                    />
                  {:else}
                    {getInitials(student.nama_lengkap)}
                  {/if}
                </div>
                <div class="flex-1 min-w-0 flex flex-col justify-center">
                  <p class="text-sm font-bold text-slate-800 truncate group-hover:text-blue-700 transition-colors">{student.nama_lengkap}</p>
                  {#if student.nis}
                    <span class="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 mt-1 inline-block w-max">NIS: {student.nis}</span>
                  {/if}
                </div>
                <ChevronRight class="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors shrink-0" />
              </div>
            </div>
          </button>
        {/each}
      </div>

    {:else}
      <Card class="p-10 text-center">
        <div class="flex flex-col items-center gap-3 text-slate-400">
          <img
            src="/images/online-learning-platform.svg"
            alt="Pencarian Nilai"
            style="width: 200px; height: 200px; object-fit: contain;"
          />
          <div class="space-y-1">
            <p class="text-sm font-bold text-slate-600">Cari nama santri di atas</p>
            <p class="text-xs">Minimal 2 karakter untuk memulai pencarian</p>
          </div>
          <div class="flex items-center justify-center gap-6 mt-6">
            <div class="flex flex-col items-center gap-1.5">
              <div class="w-3.5 h-3.5 rounded-full bg-emerald-500"></div>
              <p class="text-[10px] font-bold text-slate-500">≥ 8 Baik</p>
            </div>
            <div class="flex flex-col items-center gap-1.5">
              <div class="w-3.5 h-3.5 rounded-full bg-amber-500"></div>
              <p class="text-[10px] font-bold text-slate-500">≥ 6.5 Cukup</p>
            </div>
            <div class="flex flex-col items-center gap-1.5">
              <div class="w-3.5 h-3.5 rounded-full bg-rose-500"></div>
              <p class="text-[10px] font-bold text-slate-500">&lt; 6.5 Kurang</p>
            </div>
          </div>
        </div>
      </Card>
    {/if}
  {/if}
</div>

<ImageLightbox bind:show={showLightbox} imageUrl={lightboxImageUrl} on:close={() => showLightbox = false} />
