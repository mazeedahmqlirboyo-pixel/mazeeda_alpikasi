<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';
  import { fade, fly, slide } from 'svelte/transition';
  import { Bell, Search, Filter, ShieldCheck, CheckCircle2, AlertCircle, Info, CalendarClock, ChevronLeft } from 'lucide-svelte';
  import Card from '$lib/components/ui/card.svelte';
  import { browser } from '$app/environment';
  
  let notifications: any[] = [];
  let loading = true;
  let readNotifIds: string[] = [];
  let searchQuery = '';
  let activeFilter = 'Semua';
  const filters = ['Semua', 'Info', 'Penting', 'Sukses'];

  onMount(() => {
    if (browser) {
      const saved = localStorage.getItem('mazeeda_read_notifs');
      if (saved) readNotifIds = JSON.parse(saved);
      // Mark all currently fetched as read as well when opening this page
    }
    
    fetchNotifications();

    const channelName = `notifikasi_page_realtime_${Math.random().toString(36).slice(2)}`;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_notifications' }, () => {
        fetchNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  });

  async function fetchNotifications() {
    loading = true;
    try {
      const { data, error } = await supabase
        .from('app_notifications')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
        
      if (!error && data) {
        notifications = data;
        // Removed automatic mark-as-read. User will use the button.
      } else if (error) {
        console.error("Supabase Error:", error);
      }
    } catch (err) {
      console.error("Fetch Exception:", err);
    } finally {
      loading = false;
    }
  }

  function getNotifStyle(type: string) {
    switch (type) {
      case 'success': return { bg: 'bg-emerald-50 border-emerald-200', icon: CheckCircle2, text: 'text-emerald-700', fill: 'bg-emerald-500', label: 'Sukses' };
      case 'warning': return { bg: 'bg-amber-50 border-amber-200', icon: AlertCircle, text: 'text-amber-700', fill: 'bg-amber-500', label: 'Peringatan' };
      case 'urgent':  return { bg: 'bg-rose-50 border-rose-200', icon: AlertCircle, text: 'text-rose-700', fill: 'bg-rose-500', label: 'Penting' };
      default:        return { bg: 'bg-blue-50 border-blue-200', icon: Info, text: 'text-blue-700', fill: 'bg-blue-500', label: 'Info' };
    }
  }

  function formatDate(isoStr: string) {
    if (!isoStr) return '-';
    const date = new Date(isoStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }).format(date) + ' WIB';
  }

  $: filteredNotifications = notifications.filter(n => {
    // Filter by type
    if (activeFilter === 'Info' && n.type !== 'info') return false;
    if (activeFilter === 'Penting' && n.type !== 'urgent' && n.type !== 'warning') return false;
    if (activeFilter === 'Sukses' && n.type !== 'success') return false;
    
    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const title = n.title?.toLowerCase() || '';
      const message = n.message?.toLowerCase() || '';
      if (!title.includes(q) && !message.includes(q)) return false;
    }
    return true;
  });

  function markAllAsRead() {
    if (browser && notifications.length > 0) {
      const newRead = [...new Set([...readNotifIds, ...notifications.map(n => String(n.id))])];
      readNotifIds = newRead;
      localStorage.setItem('mazeeda_read_notifs', JSON.stringify(newRead));
      window.dispatchEvent(new Event('mazeeda_read_notifs_updated'));
    }
  }

  function markAsRead(id: string) {
    if (browser && !readNotifIds.includes(String(id))) {
      const newRead = [...readNotifIds, String(id)];
      readNotifIds = newRead;
      localStorage.setItem('mazeeda_read_notifs', JSON.stringify(newRead));
      window.dispatchEvent(new Event('mazeeda_read_notifs_updated'));
    }
  }

</script>

<svelte:head>
  <title>Notifikasi - MAZEEDA</title>
</svelte:head>

<div class="max-w-2xl mx-auto space-y-4 -mt-2 md:-mt-6 pb-12 px-2 sm:px-0">
  


  <!-- Minimalist Search & Filter -->
  <div class="flex items-center gap-3 bg-white border border-slate-200/80 rounded-2xl p-2 shadow-soft-sm focus-within:border-primary/50 transition-colors">
    <div class="flex-1 flex items-center gap-2.5 px-3">
      <Search class="h-4.5 w-4.5 text-slate-400 shrink-0" />
      <input 
        type="text" 
        bind:value={searchQuery}
        placeholder="Cari pesan..." 
        class="w-full bg-transparent border-none outline-none text-sm font-semibold text-slate-700 placeholder:text-slate-400 py-1"
      />
    </div>
    <div class="h-5 w-[1px] bg-slate-200 shrink-0"></div>
    <div class="relative px-3 shrink-0 flex items-center justify-center cursor-pointer">
      <select bind:value={activeFilter} class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" title="Filter Notifikasi">
        {#each filters as filter}
          <option value={filter}>{filter}</option>
        {/each}
      </select>
      <Filter class="h-4.5 w-4.5 {activeFilter !== 'Semua' ? 'text-primary' : 'text-slate-400'} transition-colors" />
    </div>
  </div>

  <!-- Notification List -->
  <div class="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
    {#if loading}
      <div class="py-16 flex flex-col items-center justify-center space-y-3">
        <div class="h-8 w-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        <p class="text-xs font-bold text-slate-400 animate-pulse">Memuat...</p>
      </div>
    {:else if filteredNotifications.length === 0}
      <div class="py-16 flex flex-col items-center justify-center text-center">
        <Bell class="h-8 w-8 text-slate-200 mb-3" />
        <h3 class="text-sm font-bold text-slate-700">Semua Terbaca</h3>
        <p class="text-xs text-slate-500 font-medium mt-1">Tidak ada notifikasi untuk ditampilkan.</p>
      </div>
    {:else}
      <div class="divide-y divide-slate-100/80">
        {#each filteredNotifications as notif, i (notif.id)}
          {@const style = getNotifStyle(notif.type)}
          {@const isRead = readNotifIds.includes(String(notif.id))}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div 
            in:fly={{ y: 10, duration: 200, delay: i * 30 }} 
            class="p-4 sm:p-5 flex gap-3.5 bg-white hover:bg-slate-50/50 transition-colors"
          >
            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-start gap-2 mb-1">
                <h3 class="text-sm font-bold {isRead ? 'text-slate-500' : 'text-slate-800'} leading-tight">{notif.title}</h3>
                <span class="text-[10px] text-slate-400 font-semibold whitespace-nowrap shrink-0 pt-0.5">
                  {formatDate(notif.created_at)}
                </span>
              </div>
              
              {#if notif.message}
                <p class="text-[13px] {isRead ? 'text-slate-400 font-medium' : 'text-slate-600 font-semibold'} leading-relaxed text-justify mt-1">
                  {notif.message}
                </p>
              {/if}

              <!-- Status Action -->
              <div class="mt-3 flex justify-between items-center">
                
                <!-- Category Label -->
                <div class="flex items-center gap-1.5 {style.bg} {style.text} px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider">
                  <svelte:component this={style.icon} class="h-3 w-3" />
                  {style.label}
                </div>

                <!-- Read Status / Button -->
                <div>
                  {#if !isRead}
                    <button 
                      on:click={() => markAsRead(notif.id)}
                      class="text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md transition-colors border border-blue-100/50 flex items-center gap-1.5"
                    >
                      Tandai dibaca
                    </button>
                  {:else}
                    <span class="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                      <CheckCircle2 class="h-3.5 w-3.5" /> Sudah dibaca
                    </span>
                  {/if}
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
