<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { supabase } from '$lib/supabase';
  import { activeProfileStore } from '$lib/auth';
  import Card from '$lib/components/ui/card.svelte';
  import { 
    Search, Award, Shield, ArrowRight, UserCheck, Calendar,
    BookOpen, Heart, CalendarRange, Filter
  } from 'lucide-svelte';
  import PageHeader from '$lib/components/ui/PageHeader.svelte';

  // State
  let searchQuery = '';
  let activeYear = '2026-2027';
  let boardMembers: any[] = [];
  let alumniDataMap: Record<string, any> = {}; // To fetch photos and other profile details
  let isLoading = true;
  
  let dropdownContainer: HTMLDivElement;
  let showYearDropdown = false;

  // Lightbox State
  let showLightbox = false;
  let lightboxUrl = '';

  function openLightbox(url: string, e: MouseEvent) {
    e.stopPropagation();
    if (url) {
      lightboxUrl = convertDriveUrl(url);
      showLightbox = true;
    }
  }

  function closeLightbox() {
    showLightbox = false;
  }

  function toggleDropdown(e: MouseEvent) {
    e.stopPropagation();
    showYearDropdown = !showYearDropdown;
  }

  function closeDropdown(e: MouseEvent) {
    if (showYearDropdown && dropdownContainer && !dropdownContainer.contains(e.target as Node)) {
      showYearDropdown = false;
    }
  }

  const academicYears = [
    '2026-2027',
    '2027-2028',
    '2028-2029',
    '2029-2030',
    '2030-2031',
    '2031-2032'
  ];

  // Accent Colors matching Squad page
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

  function getInitials(name: string) {
    if (!name) return 'M';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  // Fetch data
  async function fetchData() {
    try {
      isLoading = true;
      
      // 1. Fetch board members history
      const { data: boardData, error: boardError } = await supabase
        .from('kepengurusan_history')
        .select('*');
        
      if (boardError) {
        console.warn('Failed to query kepengurusan_history (may not exist yet).');
        boardMembers = [];
      } else {
        boardMembers = boardData || [];
      }

      // 2. Fetch allowed_alumni to map photos
      const { data: alumniData } = await supabase
        .from('allowed_alumni')
        .select('nama_lengkap, foto_url');
        
      if (alumniData) {
        const tempMap: Record<string, any> = {};
        alumniData.forEach(item => {
          tempMap[item.nama_lengkap.trim().toLowerCase()] = item;
        });
        alumniDataMap = tempMap;
      }
    } catch (err) {
      console.error('Fetch error:', err);
      boardMembers = [];
    } finally {
      isLoading = false;
    }
  }

  onMount(() => {
    fetchData();
  });

  // Open profile details in sidebar drawer using the global auth/activeProfileStore
  function viewProfile(name: string) {
    activeProfileStore.set({ type: 'member', nameOrNis: name });
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

  // Filtered members for the currently selected year and search query
  $: yearMembers = boardMembers.filter(m => {
    const dbYear = (m.tahun_ajaran || '').replace(/\//g, '-');
    const selectedYear = activeYear.replace(/\//g, '-');
    return dbYear === selectedYear;
  });

  $: filteredMembers = yearMembers.filter(member => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (member.nama_lengkap || '').toLowerCase().includes(q) ||
      (member.jabatan || '').toLowerCase().includes(q) ||
      (member.divisi || '').toLowerCase().includes(q)
    );
  });

  // Group by Division (except Pengurus Harian which goes to the top)
  $: bphMembers = filteredMembers.filter(m => 
    m.divisi.toLowerCase() === 'pengurus harian' || 
    m.divisi.toLowerCase() === 'bph' ||
    m.divisi.toLowerCase() === 'inti'
  );

  $: divisionGroups = filteredMembers.reduce((groups: Record<string, any[]>, m) => {
    const divLower = m.divisi.toLowerCase();
    if (divLower !== 'pengurus harian' && divLower !== 'bph' && divLower !== 'inti') {
      const key = m.divisi || 'Divisi Lainnya';
      if (!groups[key]) groups[key] = [];
      groups[key].push(m);
    }
    return groups;
  }, {});

  $: hasAnyData = filteredMembers.length > 0;
</script>

<svelte:window on:click={closeDropdown} />

<PageHeader title="Kepengurusan" backText="Dashboard" />

<div class="space-y-8 animate-in fade-in duration-300 pt-4 pb-8 px-4">

  <!-- Search & Year Picker -->
  <div class="relative w-full" bind:this={dropdownContainer}>
    <div class="relative flex items-center w-full bg-slate-50/50 border border-slate-200/80 rounded-2xl shadow-soft-sm focus-within:bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-300 h-12 overflow-hidden">
      <!-- Search Icon -->
      <Search class="h-4.5 w-4.5 text-slate-400 ml-4 shrink-0 pointer-events-none" />
      
      <!-- Search Input -->
      <input
        type="text"
        placeholder="Cari pengurus atau jabatan..."
        class="flex-1 h-full bg-transparent pl-3 pr-2 text-xs md:text-sm text-slate-700 placeholder-slate-400 focus:outline-none"
        bind:value={searchQuery}
      />

      <!-- Divider line -->
      <div class="w-px h-6 bg-slate-200 shrink-0"></div>

      <!-- Filter Icon Button Trigger -->
      <div class="shrink-0 flex items-center px-2 h-full">
        <button
          type="button"
          on:click={toggleDropdown}
          class="h-8.5 w-8.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition-all duration-200 shrink-0 outline-none cursor-pointer"
          title="Filter Tahun Ajaran"
        >
          <Filter class="h-4.5 w-4.5" />
        </button>
      </div>
    </div>

    <!-- Dropdown Selector Floating Menu -->
    {#if showYearDropdown}
      <div 
        transition:fade={{ duration: 150 }}
        class="absolute right-0 top-full mt-2 w-32 bg-white border border-slate-200/80 rounded-2xl shadow-lg py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-200"
      >
        <div class="px-3 py-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
          PILIH PERIODE
        </div>
        <div class="max-h-60 overflow-y-auto scrollbar-thin">
          {#each academicYears as year}
            <button
              type="button"
              on:click={() => { activeYear = year; showYearDropdown = false; searchQuery = ''; }}
              class="w-full px-3 py-2 text-left text-xs transition-colors flex items-center justify-between cursor-pointer
                {activeYear === year 
                  ? 'bg-slate-50/80 text-primary font-bold' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/40 font-medium'}"
            >
              <span>T.A {year}</span>
            </button>
          {/each}
        </div>
      </div>
    {/if}
  </div>

  <!-- Dashboard Content -->
  {#if isLoading}
    <div class="py-24 text-center space-y-4">
      <img src="/images/loading.svg" alt="Loading..." class="h-16 w-16 mx-auto animate-spin opacity-80" style="animation-duration: 2s;" />
      <p class="text-xs font-bold text-slate-500 uppercase tracking-widest">Menyinkronkan data...</p>
    </div>
  {:else if !hasAnyData}
    <div class="py-16 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 mt-6">
      <div class="flex justify-center mb-6">
        <img src="/images/empty-content.svg" alt="Tidak Ditemukan" class="h-40 w-auto object-contain drop-shadow-sm opacity-80 hover:opacity-100 transition-opacity" />
      </div>
      <p class="text-sm font-bold text-slate-600">Tidak ada pengurus ditemukan</p>
      <p class="text-xs text-slate-400 mt-1">{searchQuery ? 'Silakan ganti kata kunci pencarian Anda.' : `Belum ada data pengurus untuk T.A ${activeYear}.`}</p>
    </div>
  {:else}
    <div class="space-y-12">
      
      <!-- Tier 1: Pengurus Harian (BPH) -->
      {#if bphMembers.length > 0}
        <div class="space-y-4 text-center">
          <h2 class="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
            <UserCheck class="h-4.5 w-4.5 text-indigo-500" />
            <span>Pengurus Harian Inti</span>
          </h2>
          
          <div class="flex flex-wrap justify-center gap-6 max-w-5xl mx-auto pt-2">
            {#each bphMembers as member (member.id || member.nama_lengkap)}
              {@const accent = getAccent(member.nama_lengkap)}
              {@const alumniProfile = alumniDataMap[member.nama_lengkap.trim().toLowerCase()]}
              {@const profilePhoto = member.foto_custom_url || (alumniProfile && alumniProfile.foto_url)}
              
              <!-- Core card -->
              <!-- svelte-ignore a11y-click-events-have-key-events -->
              <!-- svelte-ignore a11y-no-static-element-interactions -->
              <div 
                on:click={() => viewProfile(member.nama_lengkap)}
                class="w-full sm:w-64 bg-white border border-slate-100 hover:border-slate-200 rounded-3xl p-5 text-center transition-all duration-300 hover:scale-[1.02] hover:shadow-soft-md cursor-pointer border-t-4 {accent.border} flex flex-col items-center space-y-4"
              >
                <!-- Photo/Avatar -->
                <div class="relative shrink-0">
                  {#if profilePhoto}
                    <img referrerpolicy="no-referrer" 
                      src={convertDriveUrl(profilePhoto)} 
                      alt={member.nama_lengkap} 
                      on:click={(e) => openLightbox(profilePhoto, e)}
                      class="h-16 w-16 rounded-full object-cover shadow-soft-sm ring-2 {accent.ring} hover:scale-110 transition-transform cursor-pointer"
                    />
                  {:else}
                    <div class="h-16 w-16 rounded-full flex items-center justify-center font-bold text-lg shadow-soft-sm ring-2 {accent.avatar} {accent.ring}">
                      {getInitials(member.nama_lengkap)}
                    </div>
                  {/if}
                  <span class="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white {accent.dot}"></span>
                </div>

                <div class="space-y-1.5 leading-tight w-full">
                  <h3 class="font-extrabold text-slate-800 text-sm md:text-base line-clamp-1 group-hover:text-primary transition-colors">
                    {member.nama_lengkap}
                  </h3>
                  <p class="text-xs text-primary font-black uppercase tracking-wider">{member.jabatan}</p>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Tier 2: Divisi / Bagian -->
      {#if Object.keys(divisionGroups).length > 0}
        <div class="space-y-8 pt-4 border-t border-slate-100">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
            {#each Object.entries(divisionGroups) as [division, members]}
              <Card noPadding class="overflow-hidden border-slate-200/60 shadow-soft-sm">
                <!-- Group Header -->
                <div class="px-5 py-3 bg-slate-50/95 border-b border-slate-100 flex items-center justify-between">
                  <span class="text-xs font-black text-slate-700 uppercase tracking-wide">{division}</span>
                  <span class="text-[9px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">{members.length} Anggota</span>
                </div>

                <!-- Group List -->
                <div class="divide-y divide-slate-50">
                  {#each members as member}
                    {@const accent = getAccent(member.nama_lengkap)}
                    {@const alumniProfile = alumniDataMap[member.nama_lengkap.trim().toLowerCase()]}
                    {@const profilePhoto = member.foto_custom_url || (alumniProfile && alumniProfile.foto_url)}
                    
                    <!-- Member Row -->
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <div 
                      on:click={() => viewProfile(member.nama_lengkap)}
                      class="px-5 py-3 flex items-center justify-between hover:bg-slate-50/50 transition-colors cursor-pointer group"
                    >
                      <div class="flex items-center space-x-3.5 min-w-0">
                        {#if profilePhoto}
                          <img referrerpolicy="no-referrer" 
                            src={convertDriveUrl(profilePhoto)} 
                            alt={member.nama_lengkap} 
                            on:click={(e) => openLightbox(profilePhoto, e)}
                            class="h-10 w-10 rounded-full object-cover shadow-soft-sm ring-1 {accent.ring} shrink-0 hover:scale-110 transition-transform cursor-pointer"
                          />
                        {:else}
                          <div class="h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs shadow-soft-sm ring-1 {accent.avatar} {accent.ring} shrink-0">
                            {getInitials(member.nama_lengkap)}
                          </div>
                        {/if}
                        <div class="min-w-0 leading-tight">
                          <p class="font-extrabold text-slate-700 text-xs truncate group-hover:text-slate-900 transition-colors">{member.nama_lengkap}</p>
                          <span class="inline-block px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-wider mt-1.5">
                            {member.jabatan}
                          </span>
                        </div>
                      </div>

                      <ArrowRight class="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0 ml-2" />
                    </div>
                  {/each}
                </div>
              </Card>
            {/each}
          </div>
        </div>
      {/if}

    </div>
  {/if}

</div>

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
      title="Tutup"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
    </button>

    <!-- Foto Besar -->
    <div 
      class="max-w-sm w-full mx-auto"
      on:click|stopPropagation
      style="animation: lightboxZoomIn 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;"
    >
      <img referrerpolicy="no-referrer" 
        src={lightboxUrl} 
        alt="Foto Profil"
        class="w-full rounded-3xl shadow-2xl object-cover border-2 border-white/20"
        style="max-height: 80vh; object-fit: contain;"
        on:error={(e) => { closeLightbox(); }}
      />
      <p class="text-center text-white/60 text-xs font-semibold mt-3">Klik di luar untuk menutup</p>
    </div>
  </div>
{/if}

<style>
  @keyframes lightboxZoomIn {
    from { opacity: 0; transform: scale(0.7); }
    to   { opacity: 1; transform: scale(1); }
  }
</style>
