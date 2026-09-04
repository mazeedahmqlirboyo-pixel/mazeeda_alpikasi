<script lang="ts">
  export let params: any = undefined;
  import { t, locale } from 'svelte-i18n';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { fade, slide } from 'svelte/transition';
  import Card from '$lib/components/ui/card.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import Input from '$lib/components/ui/input.svelte';
  import RichTextEditor from '$lib/components/RichTextEditor.svelte';
  import { supabase } from '$lib/supabase';
  import { authStore } from '$lib/auth';
  import { 
    Sparkles, Search, Copy, Check, ChevronLeft, Plus, Trash2, 
    ArrowLeft, AlertCircle, Settings, BookOpen, Layers, Book, Edit, Loader2, Filter,
    Save, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX
  } from "lucide-svelte";
  import PageHeader from '$lib/components/ui/PageHeader.svelte';

  interface BacaanItem {
    id: string;
    title: string;
    category: string;
    content: string;
    created_at: string;
  }

  // State
  let listItems: BacaanItem[] = [];
  let selectedCategory = 'all';
  let searchQuery = '';
  let activeTab: 'baca' | 'tambah' = 'baca';
  let isLoading = true;
  let showFilter = false;

  // Selected Sangu for detailed view
  let selectedItem: BacaanItem | null = null;

  // Form states for creating/editing Sangu
  let newTitle = '';
  let newCategory = 'sholawat';
  let newCustomCategory = '';
  let newContent = '';
  let editingId: string | null = null;

  // Auth/Role states
  $: userRole = $authStore.user?.role || '';
  $: isAdmin = userRole === 'admin';

  // Preferences (Reader Controls)
  let arabicFontSize = 26; // in px
  let showTranslation = true;
  let showLatin = true;

  // Feedback notifications
  let copiedItemSuccess = false;
  let notificationMessage: string | null = null;
  let isErrorNotification = false;

  let readerContainer: HTMLDivElement;

  // Walk text nodes of the element and safely remove the first '@' symbol
  function stripLeadingAtSymbol(element: HTMLElement) {
    const walk = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);
    let node;
    while (node = walk.nextNode()) {
      if (node.nodeValue && node.nodeValue.trim().startsWith('@')) {
        const idx = node.nodeValue.indexOf('@');
        node.nodeValue = node.nodeValue.substring(0, idx) + node.nodeValue.substring(idx + 1);
        break;
      }
    }
  }

  // Walk text nodes of the element and safely remove the first '+' symbol
  function stripLeadingPlusSymbol(element: HTMLElement) {
    const walk = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);
    let node;
    while (node = walk.nextNode()) {
      if (node.nodeValue && node.nodeValue.trim().startsWith('+')) {
        const idx = node.nodeValue.indexOf('+');
        node.nodeValue = node.nodeValue.substring(0, idx) + node.nodeValue.substring(idx + 1);
        break;
      }
    }
  }

  function replaceNadzomHash(element: HTMLElement) {
    const separatorHtml = '<span class="sangu-nadzom-separator">✦</span>';
    if (element.innerHTML.includes('#')) {
      element.innerHTML = element.innerHTML.replace('#', separatorHtml);
    }
  }

  function applyRichStyles() {
    if (!readerContainer) return;
    
    // Normalize: Wrap raw text/inline nodes at the root of readerContainer in <div> elements
    const childNodes = Array.from(readerContainer.childNodes);
    let currentWrapper: HTMLDivElement | null = null;
    
    childNodes.forEach(node => {
      const isBlock = node.nodeType === Node.ELEMENT_NODE && 
        ['DIV', 'P', 'LI', 'BLOCKQUOTE', 'H1', 'H2', 'H3', 'UL', 'OL'].includes((node as HTMLElement).tagName);
        
      if (isBlock) {
        currentWrapper = null;
      } else {
        if (node.nodeType === Node.TEXT_NODE && !node.nodeValue?.trim()) {
          if (currentWrapper) {
            currentWrapper.appendChild(node);
          }
          return;
        }
        
        if (!currentWrapper) {
          currentWrapper = document.createElement('div');
          readerContainer.insertBefore(currentWrapper, node);
        }
        currentWrapper.appendChild(node);
      }
    });
    
    // Find all blocks (p, div, li, blockquote, h1, h2)
    const blocks = readerContainer.querySelectorAll('p, div, li, blockquote, h1, h2');
    
    blocks.forEach(block => {
      const htmlBlock = block as HTMLElement;
      
      // Skip wrapping block containers that hold other paragraph tags to style text elements directly
      const hasBlockChildren = htmlBlock.querySelector('p, div, li, blockquote, h1, h2') !== null;
      if (hasBlockChildren) return;
      
      const text = htmlBlock.textContent || '';
      const cleanText = text.trim();
      if (!cleanText) return;
      
      const isTranslation = cleanText.startsWith('@') || htmlBlock.classList.contains('sangu-translation');
      const isNadzom = cleanText.includes('#') || htmlBlock.classList.contains('sangu-nadzom') || htmlBlock.querySelector('.sangu-nadzom-separator') !== null;
      const isHeading = cleanText.startsWith('+') || htmlBlock.classList.contains('sangu-heading');
      
      // Clean up previous classes if any
      htmlBlock.classList.remove('sangu-arabic', 'sangu-latin', 'sangu-translation', 'sangu-nadzom', 'sangu-heading');
      
      if (isHeading) {
        htmlBlock.classList.add('sangu-heading');
        if (cleanText.startsWith('+')) {
          stripLeadingPlusSymbol(htmlBlock);
        }
      }

      if (isTranslation) {
        htmlBlock.classList.add('sangu-translation');
        if (cleanText.startsWith('@')) {
          stripLeadingAtSymbol(htmlBlock);
        }
      } else {
        // Strip leading non-alphabetic/non-arabic characters to check the starting letter type
        const letterText = cleanText.replace(/^[^a-zA-Z\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+/, '');
        const startsWithArabic = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(letterText);
        
        if (startsWithArabic) {
          htmlBlock.classList.add('sangu-arabic');
        } else {
          // Exclude headings from getting .sangu-latin to prevent font-size override
          if (!['H1', 'H2', 'H3'].includes(htmlBlock.tagName)) {
            htmlBlock.classList.add('sangu-latin');
          }
        }
      }

      // Handle Kalam Nadzom styling
      if (isNadzom) {
        htmlBlock.classList.add('sangu-nadzom');
        replaceNadzomHash(htmlBlock);
      }
    });
  }

  // Reactively execute style processing
  let stylesApplied = false;
  $: if (selectedItem || readerContainer) {
    stylesApplied = false;
    setTimeout(() => {
      applyRichStyles();
      stylesApplied = true;
    }, 10); // Reduced delay for faster rendering
  }

  async function loadBacaan() {
    try {
      isLoading = true;
      const { data, error } = await supabase
        .from('bacaan')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      listItems = data || [];
    } catch (err: any) {
      console.error('Failed to load Sangu items:', err);
      triggerNotification('Gagal memuat data dari database.', true);
    } finally {
      isLoading = false;
    }
  }

  onMount(() => {
    loadBacaan();

    // Load preferences
    if (typeof window !== 'undefined') {
      const storedSize = localStorage.getItem('sangu_fontSize');
      if (storedSize) arabicFontSize = parseInt(storedSize, 10);

      const storedShowTranslation = localStorage.getItem('sangu_showTranslation');
      if (storedShowTranslation !== null) showTranslation = storedShowTranslation === 'true';

      const storedShowLatin = localStorage.getItem('sangu_showLatin');
      if (storedShowLatin !== null) showLatin = storedShowLatin === 'true';
    }
  });

  $: if (typeof window !== 'undefined') {
    localStorage.setItem('sangu_fontSize', arabicFontSize.toString());
    localStorage.setItem('sangu_showTranslation', showTranslation.toString());
    localStorage.setItem('sangu_showLatin', showLatin.toString());
  }

  // Selected Sangu detail tracking from URL search parameters
  function openDetail(item: BacaanItem) {
    const url = new URL($page.url);
    url.searchParams.set('detail', item.id);
    goto(url.toString(), { noScroll: true });
  }

  function closeDetail() {
    const url = new URL($page.url);
    url.searchParams.delete('detail');
    goto(url.toString(), { noScroll: true });
  }

  $: {
    const detailId = $page.url.searchParams.get('detail');
    if (detailId && listItems.length > 0) {
      const found = listItems.find(item => item.id === detailId);
      selectedItem = found || null;
    } else {
      selectedItem = null;
    }
  }

  $: {
    const tabParam = $page.url.searchParams.get('tab');
    if (tabParam === 'tambah' && isAdmin) {
      activeTab = 'tambah';
    } else if (editingId) {
      activeTab = 'tambah';
    } else {
      activeTab = 'baca';
    }
  }

  // Dynamic categories list from loaded items
  $: dynamicCategories = [
    ...new Set(listItems.map(item => item.category).filter(Boolean))
  ].sort() as string[];

  $: activeFilterCount = selectedCategory !== 'all' ? 1 : 0;

  // Filter items based on search and selected category
  $: filteredItems = listItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Category labels helper
  function getCategoryLabel(category: string) {
    if (!category) return 'Lainnya';
    switch (category.toLowerCase()) {
      case 'sholawat': return 'Sholawat';
      case 'jausyan': return 'Jausyan';
      case 'nadzom': return 'Nadzom';
      case 'doa': return 'Doa & Hizib';
      case 'others': return 'Lainnya';
      default: return category.charAt(0).toUpperCase() + category.slice(1);
    }
  }

  // Set category color classes
  function getCategoryBadgeClass(category: string) {
    if (!category) return 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-100 dark:border-slate-800';
    switch (category.toLowerCase()) {
      case 'sholawat': return 'bg-teal-50 text-teal-700 border-teal-100';
      case 'jausyan': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'nadzom': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'doa': return 'bg-purple-50 text-purple-700 border-purple-100';
      default: return 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-100 dark:border-slate-800';
    }
  }

  // Strip HTML tags helper for preview snippet
  function stripHtml(html: string) {
    if (!html) return '';
    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Notifications handler
  function triggerNotification(message: string, isError = false) {
    notificationMessage = message;
    isErrorNotification = isError;
    setTimeout(() => {
      notificationMessage = null;
    }, 3000);
  }

  // Copy whole Sangu content (stripping HTML tags for clean pasting)
  async function copyWholeItem(item: BacaanItem) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = item.content;
    const plainText = `${item.title.toUpperCase()}\n\n${tempDiv.textContent || tempDiv.innerText || ''}`;

    try {
      await navigator.clipboard.writeText(plainText.trim());
      copiedItemSuccess = true;
      setTimeout(() => { copiedItemSuccess = false; }, 2500);
    } catch (err) {
      console.error(err);
      triggerNotification('Gagal menyalin konten.', true);
    }
  }

  // Edit action
  function startEdit(item: BacaanItem) {
    editingId = item.id;
    newTitle = item.title;
    newCategory = item.category || 'others';
    newCustomCategory = '';
    newContent = item.content;
    activeTab = 'tambah';
    closeDetail();
  }

  function cancelEdit() {
    editingId = null;
    newTitle = '';
    newCategory = 'sholawat';
    newCustomCategory = '';
    newContent = '';
    activeTab = 'baca';
    
    // Also remove ?tab=tambah from URL if present
    const url = new URL($page.url);
    if (url.searchParams.has('tab')) {
      url.searchParams.delete('tab');
      goto(url.toString(), { noScroll: true, replaceState: true });
    }
  }

  // Create/Update Sangu Item
  async function handleSaveSangu() {
    if (!isAdmin) {
      triggerNotification('Akses ditolak. Anda bukan administrator.', true);
      return;
    }
    if (!newTitle.trim()) {
      triggerNotification('Judul Sangu tidak boleh kosong.', true);
      return;
    }
    if (!newContent.trim() || newContent === '<br>' || newContent === '<div><br></div>') {
      triggerNotification('Konten Sangu tidak boleh kosong.', true);
      return;
    }

    const categoryToSave = newCategory === 'new' ? newCustomCategory.trim().toLowerCase() : newCategory;
    if (newCategory === 'new' && !categoryToSave) {
      triggerNotification('Nama kategori baru wajib diisi!', true);
      return;
    }

    try {
      if (editingId) {
        // Edit Mode
        const { error } = await supabase
          .from('bacaan')
          .update({
            title: newTitle.trim(),
            category: categoryToSave,
            content: newContent
          })
          .eq('id', editingId);

        if (error) throw error;
        triggerNotification('Sangu berhasil diperbarui!');
      } else {
        // Insert Mode
        const { error } = await supabase
          .from('bacaan')
          .insert([{
            title: newTitle.trim(),
            category: categoryToSave,
            content: newContent
          }]);

        if (error) throw error;
        triggerNotification('Sangu baru berhasil disimpan!');
      }

      await loadBacaan();
      
      // Reset Form and redirect
      editingId = null;
      newTitle = '';
      newCategory = 'sholawat';
      newCustomCategory = '';
      newContent = '';
      activeTab = 'baca';

    } catch (err: any) {
      console.error(err);
      triggerNotification('Gagal menyimpan Sangu: ' + err.message, true);
    }
  }

  // Delete Sangu item
  async function handleDeleteSangu(id: string, e: Event) {
    e.stopPropagation();
    if (!isAdmin) {
      triggerNotification('Akses ditolak. Anda bukan administrator.', true);
      return;
    }
    if (!confirm('Apakah Anda yakin ingin menghapus catatan Sangu ini?')) return;

    try {
      const { error } = await supabase
        .from('bacaan')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      triggerNotification('Catatan Sangu berhasil dihapus.');
      await loadBacaan();
      
      if (selectedItem && selectedItem.id === id) {
        closeDetail();
      }
    } catch (err: any) {
      console.error(err);
      triggerNotification('Gagal menghapus Sangu: ' + err.message, true);
    }
  }
</script>

<!-- Notification Toast -->
{#if notificationMessage}
  <div 
    transition:fade={{ duration: 150 }} 
    class="fixed top-20 right-4 z-50 flex items-center p-4 rounded-xl border text-xs font-semibold shadow-xl space-x-2.5 animate-in slide-in-from-top-4 duration-300
      {isErrorNotification ? 'bg-red-50 border-red-200 text-red-800' : 'bg-teal-50 border-teal-200 text-teal-800'}"
  >
    <AlertCircle class="h-4.5 w-4.5" />
    <span>{notificationMessage}</span>
  </div>
{/if}

<div class="space-y-6 pb-20 lg:pb-8 relative min-h-[calc(100vh-10rem)]">

  {#if activeTab === 'baca'}
    {#if !selectedItem}
  <!-- DIRECTORY GRID LIST VIEW -->
  <div class="space-y-6">
    <PageHeader title={$t('sangu.title') || 'Sangu | Wirid'} backTo="/" />

    <!-- Search and Categories Header -->
        <div class="flex items-center space-x-2 relative">
          <!-- Search bar -->
          <div class="relative flex-1">
            <Search class="absolute left-4 top-3.5 h-5 w-5 text-slate-400 dark:text-slate-500" />
            <input 
              type="text" 
              placeholder={$t('sangu.search_placeholder') || 'Cari sholawat, nadzom, atau berkas doa...'} 
              class="flex h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-50 dark:bg-slate-800 focus:bg-white dark:bg-slate-900 transition-colors duration-200 pl-11 pr-3 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-teal-500"
              bind:value={searchQuery}
            />
          </div>

          <!-- Filter trigger button -->
          <div class="relative">
            <button
              type="button"
              class="relative p-3 rounded-xl border transition-all duration-200 {showFilter
                ? 'bg-teal-600 text-white border-teal-600 shadow-soft-sm'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}"
              on:click={() => (showFilter = !showFilter)}
              style="min-height: 44px; min-width: 44px; display: flex; align-items: center; justify-content: center;"
            >
              <Filter class="h-5 w-5" />
              {#if activeFilterCount > 0}
                <span
                  class="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center"
                  >{activeFilterCount}</span
                >
              {/if}
            </button>

            <!-- Floating Dropdown -->
            {#if showFilter}
              <!-- Backdrop -->
              <button
                type="button"
                class="fixed inset-0 z-10 cursor-default bg-transparent"
                on:click={() => (showFilter = false)}
                aria-label="Tutup filter"
              ></button>

              <div
                class="absolute right-0 top-[calc(100%+8px)] z-20 w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-lg overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-1 duration-150 origin-top-right"
              >
                <!-- Kategori -->
                <div class="px-3 pt-3 pb-2">
                  <p
                    class="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5"
                  >{$t('sangu.category_label') || 'KATEGORI'}</p>
                  <div class="flex flex-wrap gap-1">
                    <!-- Semua -->
                    <button
                      type="button"
                      on:click={() => { selectedCategory = 'all'; showFilter = false; }}
                      class="px-2.5 py-1 text-[10px] font-bold rounded-full transition-all duration-150
                        {selectedCategory === 'all'
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:bg-slate-700'}"
                      >{$t('sangu.all') || 'Semua'}</button
                    >

                    {#if dynamicCategories.length > 0}
                      {#each dynamicCategories as cat}
                        <button
                          type="button"
                          on:click={() => { selectedCategory = cat; showFilter = false; }}
                          class="px-2.5 py-1 text-[10px] font-bold rounded-full transition-all duration-150
                            {selectedCategory === cat
                            ? 'bg-teal-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:bg-slate-700'}"
                          >{getCategoryLabel(cat)}</button
                        >
                      {/each}
                    {:else}
                      <span class="text-[10px] text-slate-400 dark:text-slate-500 italic"
                        >{$t('sangu.no_category') || 'Belum ada kategori'}</span
                      >
                    {/if}
                  </div>
                </div>

                <!-- Reset -->
                {#if activeFilterCount > 0}
                  <div class="border-t border-slate-100 dark:border-slate-800 px-3 py-2">
                    <button
                      type="button"
                      on:click={() => {
                        selectedCategory = 'all';
                        showFilter = false;
                      }}
                      class="text-[10px] font-bold text-rose-500 hover:text-rose-700 transition-colors"
                      >✕ Reset filter</button
                    >
                  </div>
                {/if}
              </div>
            {/if}
          </div>
        </div>

        <!-- Cards Grid / Loading States -->
        {#if isLoading}
          <!-- Skeleton loading states -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            {#each Array(4) as _}
              <div class="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl animate-pulse space-y-4">
                <div class="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/4"></div>
                <div class="space-y-2">
                  <div class="h-5 bg-slate-100 dark:bg-slate-800 rounded w-3/4"></div>
                  <div class="h-4 bg-slate-100 dark:bg-slate-800 rounded w-5/6"></div>
                </div>
                <div class="h-8 bg-slate-100 dark:bg-slate-800 rounded w-full"></div>
              </div>
            {/each}
          </div>
        {:else if filteredItems.length > 0}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            {#each filteredItems as item (item.id)}
              <!-- svelte-ignore a11y-click-events-have-key-events -->
              <!-- svelte-ignore a11y-no-static-element-interactions -->
              <div 
                on:click={() => openDetail(item)}
                class="group p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 hover:border-teal-200 hover:shadow-soft-md rounded-2xl transition-premium cursor-pointer relative"
              >
                <div class="space-y-2.5">
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider {getCategoryBadgeClass(item.category)}">
                      {getCategoryLabel(item.category)}
                    </span>
                  </div>

                  <!-- Title -->
                  <div>
                    <h3 class="font-extrabold text-base text-slate-800 dark:text-slate-100 group-hover:text-teal-700 transition-colors leading-tight">
                      {item.title.toUpperCase()}
                    </h3>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <!-- Empty state -->
          <div class="py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl bg-slate-50 dark:bg-slate-800/20 max-w-lg mx-auto">
            <div class="flex justify-center mb-6">
              <img src="/search.svg" alt="Tidak Ditemukan" class="h-40 w-auto object-contain drop-shadow-sm dark:shadow-none opacity-80 hover:opacity-100 transition-opacity" />
            </div>
            <h3 class="text-sm font-extrabold text-slate-600 dark:text-slate-300 mt-3">Tidak Ada Teks Sangu</h3>
            <p class="text-xs text-slate-400 dark:text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
                {$t('sangu.no_data') || 'Tidak ditemukan berkas bacaan yang cocok untuk pencarian atau kategori ini.'}
              </p>
          </div>
        {/if}

      </div>
    {:else}
      <!-- DETAILED READER VIEW (Aesthetic overlay canvas) -->
      <div class="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
        
        <!-- Top Toolbar Sticky controls -->
        <Card noPadding class="p-3 sm:p-4 border-slate-200 dark:border-slate-700/50 shadow-soft-sm bg-white dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-20 flex flex-col gap-3">
          <!-- Top Row: Back button + Title & Category -->
          <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/70 pb-2">
            <button 
              on:click={closeDetail}
              class="inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
            >
              <ArrowLeft class="w-5 h-5" />
            </button>

            <div class="text-right leading-tight ml-4 min-w-0 flex-1">
              <h2 class="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight break-words whitespace-normal">{selectedItem.title}</h2>
              <span class="text-[8px] sm:text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mt-0.5">
                Kategori: {getCategoryLabel(selectedItem.category)}
              </span>
            </div>
          </div>

          <!-- Bottom Row: Controls settings (Size, Copy whole, Admin Edit) -->
          <div class="flex flex-wrap items-center gap-2 md:gap-3 justify-between md:justify-start">
            <div class="flex flex-wrap items-center gap-2">
              <!-- Arabic font size slider -->
              <div class="flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 px-2 py-1 rounded-lg shrink-0">
                <Settings class="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                <span class="text-[9px] font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500">{$t('sangu.font_size') || 'Huruf:'}</span>
                <input 
                  type="range" 
                  min="20" 
                  max="44" 
                  class="accent-teal-600 w-16 sm:w-20 cursor-pointer h-1 bg-slate-200 dark:bg-slate-700 rounded-lg"
                  bind:value={arabicFontSize}
                />
                <span class="text-[9px] font-black text-slate-600 dark:text-slate-300 w-6 text-right">{arabicFontSize}px</span>
              </div>

              <!-- Visibility toggles for Terjemah and Latin -->
              <div class="flex items-center space-x-4 text-[9px] font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 px-3 py-1.5 rounded-lg shrink-0">
                <label class="relative inline-flex items-center cursor-pointer select-none group">
                  <input type="checkbox" bind:checked={showLatin} class="sr-only peer" />
                  <div class="w-7 h-4 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-3 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-slate-900 after:border-slate-300 dark:border-slate-600 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-teal-600 group-hover:after:bg-slate-50 dark:bg-slate-800"></div>
                  <span class="ml-2 group-hover:text-slate-700 dark:text-slate-200 transition-colors">{$t('sangu.latin') || 'Latin'}</span>
                </label>

                <label class="relative inline-flex items-center cursor-pointer select-none group">
                  <input type="checkbox" bind:checked={showTranslation} class="sr-only peer" />
                  <div class="w-7 h-4 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-3 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-slate-900 after:border-slate-300 dark:border-slate-600 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-teal-600 group-hover:after:bg-slate-50 dark:bg-slate-800"></div>
                  <span class="ml-2 group-hover:text-slate-700 dark:text-slate-200 transition-colors">{$t('sangu.translation') || 'Terjemah'}</span>
                </label>
              </div>
            </div>

          </div>
        </Card>

        <!-- Unified Paper-like Reader Canvas -->
        <Card noPadding class="border-slate-200 dark:border-slate-700/60 shadow-soft-sm bg-[#FCFBF7] dark:bg-slate-900 text-slate-800 dark:text-slate-100 relative select-none">
          <!-- Spiritual backdrop pattern -->
          <div class="absolute inset-0 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.02] pointer-events-none"></div>
          
          <!-- Traditional double border frame -->
          <div class="border-4 border-double border-teal-800/10 p-3.5 sm:p-8 md:p-10 m-2 sm:m-4 md:m-6 rounded-2xl relative">
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div 
              bind:this={readerContainer} 
              class="sangu-reader-content select-none font-sans leading-relaxed transition-opacity duration-300" 
              class:hide-latin={!showLatin}
              class:hide-translation={!showTranslation}
              class:opacity-0={!stylesApplied}
              style="font-size: {arabicFontSize}px; -webkit-touch-callout: none; -webkit-user-select: none;"
              on:contextmenu|preventDefault
            >
              {@html selectedItem.content}
            </div>
          </div>
        </Card>

      </div>
    {/if}
  {/if}

  {#if activeTab === 'tambah' && isAdmin}
    <!-- TAB TAMBAH/EDIT: Create/Update Sangu Form -->
    <div class="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-300">
      
      <form on:submit|preventDefault={handleSaveSangu} class="space-y-4">
        <!-- Sticky Action Bar for Form -->
        <Card noPadding class="p-3 sm:p-4 border-slate-200 dark:border-slate-700/50 shadow-soft-sm bg-white dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between gap-4">
          <!-- Title and Icon -->
          <h2 class="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
            {#if editingId}
              <Edit class="h-4.5 w-4.5 text-teal-600 shrink-0" />
              <span class="truncate max-w-[150px] sm:max-w-xs">Edit Catatan Sangu</span>
            {:else}
              <Plus class="h-4.5 w-4.5 text-teal-600 shrink-0" />
              <span class="truncate max-w-[150px] sm:max-w-xs">Buat Sangu Baru</span>
            {/if}
          </h2>

          <!-- Action buttons on the right -->
          <div class="flex items-center space-x-2 shrink-0">
            <button 
              type="button" 
              on:click={cancelEdit} 
              class="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 transition-premium cursor-pointer"
              style="min-height: 36px;"
            >
              Batal
            </button>
            
            <button 
              type="submit"
              class="inline-flex items-center space-x-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-soft-sm transition-premium cursor-pointer"
              style="min-height: 36px;"
            >
              <Check class="h-3.5 w-3.5" />
              <span>Simpan Sangu</span>
            </button>
          </div>
        </Card>

        <Card class="p-6 space-y-4">
          <!-- Title -->
          <div class="space-y-1.5">
            <label for="title" class="text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500">Judul Sangu / Wirid <span class="text-red-500">*</span></label>
            <Input 
              id="title" 
              type="text" 
              placeholder="e.g. Sholawat Ibrahimiyah, Doa Tolak Bala" 
              bind:value={newTitle}
              required 
            />
          </div>

          <!-- Category dropdown -->
          <div class="space-y-1.5">
            <label for="category" class="text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500">{$t('sangu.category_label') || 'KATEGORI'}<span class="text-red-500">*</span></label>
            <select
              id="category"
              class="flex h-12 w-full rounded-xl border border-border bg-white dark:bg-slate-900 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:border-teal-500 focus:outline-none"
              bind:value={newCategory}
            >
              {#each Array.from(new Set(['sholawat', 'jausyan', 'nadzom', 'doa', 'others', ...dynamicCategories])) as cat}
                <option value={cat}>{getCategoryLabel(cat)}</option>
              {/each}
              <option value="new">+ Tambah Kategori Baru...</option>
            </select>
          </div>

          {#if newCategory === 'new'}
            <div class="space-y-1.5" transition:slide>
              <label for="newCustomCategory" class="text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500">Nama Kategori Baru <span class="text-red-500">*</span></label>
              <Input
                id="newCustomCategory"
                type="text"
                placeholder="e.g. Istighosah, Hizib"
                bind:value={newCustomCategory}
                required
              />
            </div>
          {/if}

          <!-- Rich Text Content Editor -->
          <div class="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">
            <div class="flex flex-col space-y-1 mb-2">
              <label for="rich-editor" class="text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500">Isi Konten Sangu <span class="text-red-500">*</span></label>
              <p class="text-[10px] text-slate-400 dark:text-slate-500">
                Gunakan editor di bawah untuk menulis konten Sangu. Blok teks Arab dan klik <strong>Format Arab</strong> dan <strong>RTL</strong> untuk meratakan dan menampilkan font Arab Mushaf secara optimal.
              </p>
            </div>
            
            <RichTextEditor 
              bind:value={newContent} 
              placeholder="Masukkan wirid, sholawat, bacaan Arab, beserta transliterasi Latin dan terjemahannya di sini..."
            />
          </div>
        </Card>
      </form>
    </div>
  {/if}

</div>

<style>
  /* Premium styles for content rendered inside the Sangu Reader Double Border Frame */
  .sangu-reader-content :global(p),
  .sangu-reader-content :global(div),
  .sangu-reader-content :global(li) {
    margin-bottom: 0.85rem;
    line-height: 1.8;
  }

  .sangu-reader-content :global(.sangu-heading) {
    text-align: center !important;
    text-align-last: center !important;
    font-weight: 800 !important;
    color: #1e293b !important;
    display: block !important;
    margin-top: 1.5rem !important;
    margin-bottom: 1.5rem !important;
  }
  :global(.dark) .sangu-reader-content :global(.sangu-heading) {
    color: #f1f5f9 !important;
  }
  
  .sangu-reader-content :global(.sangu-latin.sangu-heading) {
    font-size: 0.7em !important;
    text-transform: uppercase !important;
    letter-spacing: 0.05em !important;
  }

  .sangu-reader-content :global(.sangu-arabic.sangu-heading) {
    font-size: 1.1em !important;
    text-align: center !important;
    text-align-last: center !important;
  }
  
  .sangu-reader-content :global(.sangu-arabic):not(.sangu-heading) {
    font-family: 'Amiri Quran', 'Scheherazade New', 'Amiri', 'Traditional Arabic', serif !important;
    direction: rtl !important;
    text-align: justify !important;
    text-align-last: right !important;
    line-height: 2.3 !important;
    display: block !important;
    margin-top: 1rem !important;
    margin-bottom: 1.25rem !important;
  }
  
  .sangu-reader-content :global(.sangu-latin):not(h1):not(h2):not(.sangu-heading),
  .sangu-reader-content :global(.sangu-translation):not(h1):not(h2):not(.sangu-heading) {
    font-family: 'Outfit', 'Inter', sans-serif !important;
    font-size: 0.58em !important;
    font-weight: 500 !important;
    line-height: 1.65 !important;
    direction: ltr !important;
    text-align: justify !important;
    text-align-last: left !important;
    display: block !important;
    margin-top: 0.5rem !important;
    margin-bottom: 0.75rem !important;
  }

  .sangu-reader-content :global(.sangu-latin):not(h1):not(h2):not(.sangu-heading) {
    color: #334155 !important;
  }
  :global(.dark) .sangu-reader-content :global(.sangu-latin):not(h1):not(h2):not(.sangu-heading) {
    color: #e2e8f0 !important;
  }

  .sangu-reader-content :global(.sangu-translation):not(h1):not(h2):not(.sangu-heading) {
    color: #2563eb !important;
  }
  :global(.dark) .sangu-reader-content :global(.sangu-translation):not(h1):not(h2):not(.sangu-heading) {
    color: #93c5fd !important;
  }

  .sangu-reader-content :global(.sangu-nadzom),
  .sangu-reader-content :global(.sangu-translation.sangu-nadzom),
  .sangu-reader-content :global(.sangu-latin.sangu-nadzom) {
    text-align: center !important;
    text-align-last: center !important;
  }
  
  .sangu-reader-content :global(.sangu-nadzom-separator) {
    color: #d97706 !important; /* Premium Amber gold color */
    font-weight: bold !important;
    font-size: 0.85em !important;
    margin: 0 0.85rem !important;
    user-select: none !important;
    display: inline-block !important;
    transform: translateY(-1px);
  }

  .sangu-reader-content.hide-latin :global(.sangu-latin),
  .sangu-reader-content.hide-latin :global(.sangu-latin):not(h1):not(h2):not(.sangu-heading) {
    display: none !important;
  }

  .sangu-reader-content.hide-translation :global(.sangu-translation),
  .sangu-reader-content.hide-translation :global(.sangu-translation):not(h1):not(h2):not(.sangu-heading) {
    display: none !important;
  }
  
  .sangu-reader-content :global(ul) {
    list-style-type: disc;
    padding-left: 1.5rem;
    margin-top: 0.5rem;
    margin-bottom: 1rem;
  }
  .sangu-reader-content :global(ol) {
    list-style-type: decimal;
    padding-left: 1.5rem;
    margin-top: 0.5rem;
    margin-bottom: 1rem;
  }
  .sangu-reader-content :global(h1) {
    font-size: 1.5em;
    font-weight: 800;
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
    color: #1E293B;
  }
  :global(.dark) .sangu-reader-content :global(h1) {
    color: #f1f5f9;
  }
  .sangu-reader-content :global(h2) {
    font-size: 1.25em;
    font-weight: 700;
    margin-top: 1.25rem;
    margin-bottom: 0.75rem;
    color: #1E293B;
  }
  :global(.dark) .sangu-reader-content :global(h2) {
    color: #f1f5f9;
  }
  .sangu-reader-content :global(blockquote) {
    border-left: 4px solid #0d9488;
    background-color: rgba(13, 148, 136, 0.05);
    padding: 0.75rem 1rem;
    border-radius: 8px;
    margin-top: 1rem;
    margin-bottom: 1rem;
    font-style: italic;
    color: #0f766e;
  }
  /* Handle global links */
  .sangu-reader-content :global(a) {
    color: #2563eb;
    text-decoration: underline;
  }
</style>
