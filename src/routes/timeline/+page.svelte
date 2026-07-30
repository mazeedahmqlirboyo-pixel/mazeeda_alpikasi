<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { fade } from 'svelte/transition';
  import Card from '$lib/components/ui/card.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import { supabase } from '$lib/supabase';
  import { authStore, activeProfileStore } from '$lib/auth';
  import { 
    Image as ImageIcon, MapPin, Calendar, Heart, MessageCircle, CloudUpload, Sparkles, X, Trash2, Pencil, AlertCircle, CheckCircle, LayoutGrid, Grid3X3, Filter, Flag
  } from 'lucide-svelte';
  import PageHeader from '$lib/components/ui/PageHeader.svelte';

  interface MemoryItem {
    id: string;
    title: string;
    location: string;
    date: string;
    category: string;
    image_url: string;
    created_at: string;
    likes_count: number;
    comments_count: number;
    has_liked?: boolean;
    likes?: string[];
  }

  // State
  let memories: MemoryItem[] = [];
  let isLoading = true;
  let guestId = '';
  let viewMode: 'medium' | 'small' = 'medium';
  let selectedCategory = 'Semua';
  let showFilterDropdown = false;
  
  $: availableCategories = ['Semua', ...new Set(memories.map(m => m.category).filter(Boolean))];
  $: filteredMemories = selectedCategory === 'Semua' 
    ? memories 
    : memories.filter(m => m.category === selectedCategory);

  // Auth / Admin check
  $: userRole = $authStore.user?.role || '';
  $: isAdmin = userRole === 'admin';
  $: currentUserName = $authStore.user?.name || '';

  // Lightbox Modal States
  let selectedMemory: MemoryItem | null = null;
  let activeComments: any[] = [];

  $: sortedActiveComments = (() => {
    const isMe = (name) => name === $authStore.user?.name;
    const topLevel = [];
    const replies = {};
    for (const c of activeComments) {
      if (c.parent_id) {
        if (!replies[c.parent_id]) replies[c.parent_id] = [];
        replies[c.parent_id].push(c);
      } else {
        topLevel.push(c);
      }
    }
    topLevel.sort((a, b) => {
      const meA = isMe(a.user_name);
      const meB = isMe(b.user_name);
      if (meA && !meB) return -1;
      if (!meA && meB) return 1;
      return 0;
    });
    const result = [];
    for (const parent of topLevel) {
      result.push(parent);
      if (replies[parent.id]) result.push(...replies[parent.id]);
    }
    const allInResult = new Set(result.map(c => c.id));
    for (const c of activeComments) {
      if (!allInResult.has(c.id)) result.push(c);
    }
    return result;
  })();
  let isLoadingComments = false;
  let newCommentText = '';
  let guestName = '';
  let isSubmittingComment = false;

  // Edit comment state (admin)
  let editingCommentId: string | null = null;
  let editingCommentText = '';

  // Reply state
  let replyingToCommentId: string | null = null;
  let replyingToCommentAuthor: string = "";
  
  // UI States for Toast & Modal
  let alertMessage = "";
  let alertType: 'success' | 'error' = 'success';
  let showConfirmModal = false;
  let confirmConfig = { title: '', message: '', onConfirm: () => {} };

  function triggerAlert(msg: string, type: 'success' | 'error' = 'success') {
    alertMessage = msg;
    alertType = type;
    setTimeout(() => {
      alertMessage = "";
    }, 3500);
  }

  function runWithConfirmation(title: string, message: string, onConfirm: () => Promise<void> | void) {
    confirmConfig = { title, message, onConfirm };
    showConfirmModal = true;
  }

  let adminName = 'ADMIN MAZEEDA';
  let adminFotoUrl = 'https://drive.google.com/file/d/1f332yzKnUHuix7YeAvCgMZm4y2v30CwF/view?usp=drive_link';

  async function fetchAdminPhoto() {
    try {
      const { data, error } = await supabase
        .from('admin_profile')
        .select('nama_lengkap, foto_url')
        .eq('id', 1)
        .maybeSingle();
      if (!error && data) {
        if (data.nama_lengkap) adminName = data.nama_lengkap;
        if (data.foto_url) adminFotoUrl = data.foto_url;
      }
    } catch (_) {}
  }

  async function loadMemories() {
    try {
      isLoading = true;
      
      // Fetch memories along with count of likes and comments
      const { data, error } = await supabase
        .from('memories')
        .select('*, memory_likes(user_name), memory_comments(id)')
        .order('date', { ascending: false });

      if (error) throw error;

      const userNameToMatch = currentUserName || guestId;

      memories = (data || []).map((m: any) => {
        const userLikes = m.memory_likes || [];
        const commentsList = m.memory_comments || [];
        return {
          ...m,
          likes_count: userLikes.length,
          comments_count: commentsList.length,
          has_liked: userLikes.some((l: any) => l.user_name === userNameToMatch),
          likes: userLikes.map((l: any) => l.user_name)
        };
      });
    } catch (err) {
      console.error('Failed to load memories:', err);
    } finally {
      isLoading = false;
    }
  }

  let realtimeChannel: any;

  // Mention system
  let allUsers: { name: string, avatar: string }[] = [];
  let allUserNames: string[] = [];
  let isClosingLightbox = false;

  $: if (!isClosingLightbox && $page.url.searchParams.get('memory') && memories.length > 0 && !selectedMemory) {
    const memId = $page.url.searchParams.get('memory');
    const mem = memories.find(m => m.id == memId);
    if (mem) {
      openLightbox(mem);
    }
  }
  let showMentionDropdown = false;
  let mentionSearchTerm = '';
  let filteredUsers: { name: string, avatar: string }[] = [];
  let inputElement: HTMLInputElement;

  async function fetchAllUsers() {
    try {
      const { data: alumni } = await supabase.from('allowed_alumni').select('nama_lengkap, foto_url');
      const { data: asatidzah } = await supabase.from('asatidzah').select('nama_lengkap, foto_url');
      const usersMap = new Map<string, string>();
      const defaultAvatar = 'https://drive.google.com/file/d/1f332yzKnUHuix7YeAvCgMZm4y2v30CwF/view?usp=drive_link';
      
      if (alumni) alumni.forEach(u => {
        if (u.nama_lengkap) usersMap.set(u.nama_lengkap, u.foto_url || defaultAvatar);
      });
      if (asatidzah) asatidzah.forEach(u => {
        if (u.nama_lengkap) usersMap.set(u.nama_lengkap, u.foto_url || defaultAvatar);
      });
      
      allUsers = Array.from(usersMap, ([name, avatar]) => ({ name, avatar }));
      allUserNames = Array.from(usersMap.keys());
    } catch (e) {
      console.error('Failed to fetch user names:', e);
    }
  }

  function handleCommentInput(e: any) {
    const val = e.target.value;
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursorPosition);
    
    // Check if typing @something (allow spaces up to 50 chars)
    const match = textBeforeCursor.match(/(?:^|\s)@([^@]{0,50})$/);
    if (match) {
      showMentionDropdown = true;
      mentionSearchTerm = match[1].toLowerCase();
      filteredUsers = allUsers.filter(u => u.name.toLowerCase().includes(mentionSearchTerm)).slice(0, 5); // Max 5 suggestions
    } else {
      showMentionDropdown = false;
    }
  }

  function insertMention(name: string) {
    if (!inputElement) return;
    const val = newCommentText;
    const cursorPosition = inputElement.selectionStart || 0;
    const textBeforeCursor = val.slice(0, cursorPosition);
    
    const match = textBeforeCursor.match(/(?:^|\s)@([^@]{0,50})$/);
    if (match) {
      const replaceLen = match[1].length + 1; // +1 for the '@'
      const prefix = textBeforeCursor.slice(0, -replaceLen);
      // Determine if prefix needs space
      const space = prefix.length > 0 && !prefix.endsWith(' ') ? ' ' : '';
      newCommentText = prefix + space + '@' + name + ' ' + val.slice(cursorPosition);
      
      showMentionDropdown = false;
      
      // Keep focus (needs small delay to apply value first)
      setTimeout(() => {
        if (inputElement) {
          inputElement.focus();
          const newPos = (prefix + space + '@' + name + ' ').length;
          inputElement.setSelectionRange(newPos, newPos);
        }
      }, 10);
    }
  }

  function formatMentions(text: string): string {
    if (!text) return '';
    // Escape HTML tags first to prevent XSS
    let formattedText = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    
    allUserNames.forEach(name => {
      const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(^|\\s)@(${escapedName})(?=\\s|[.,!?]|$)`, 'gi');
      formattedText = formattedText.replace(regex, `$1<button type="button" class="mention-btn text-indigo-600 font-bold bg-indigo-50 px-1 rounded hover:underline cursor-pointer" data-name="$2">@$2</button>`);
    });
    return formattedText;
  }

  function handleDelegatedMentionClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    const btn = target.closest('.mention-btn') as HTMLElement;
    if (btn && btn.dataset.name) {
      const name = btn.dataset.name;
      const currentAdminName = (adminName || 'ADMIN MAZEEDA').toUpperCase();
      const role = (name.toUpperCase() === currentAdminName || name.toUpperCase() === 'ADMIN MAZEEDA' || name.toUpperCase() === 'ADMIN') ? 'admin' : 'member';
      handleOpenProfile(role, name);
    }
  }

  async function notifyMentions(text: string, title: string, path: string) {
    if (!text) return;
    for (const name of allUserNames) {
      const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(^|\\s)@(${escapedName})(?=\\s|[.,!?]|$)`, 'i');
      if (regex.test(text)) {
        const sender = $authStore.user?.role === 'admin' ? (adminName || 'ADMIN MAZEEDA') : ($authStore.user?.name || guestName || 'Seseorang');
        if (name !== sender) {
          const { error } = await supabase.from('app_notifications').insert([{
            title: title,
            message: `${sender} menyebut anda di sebuah komentar: @${name} "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"|LINK:${path}`,
            type: 'info',
            is_active: true,
            target_user: name
          }]);
          if (error) console.error('Gagal mengirim notif mention timeline:', error);
        }
      }
    }
  }

  onMount(() => {
    // Initialize guest identity
    if (typeof window !== 'undefined') {
      let storedId = localStorage.getItem('mazeeda_guest_id');
      if (!storedId) {
        storedId = 'Tamu_' + Math.random().toString(36).substring(2, 8).toUpperCase();
        localStorage.setItem('mazeeda_guest_id', storedId);
      }
      guestId = storedId;
    }

    loadMemories();
    fetchAdminPhoto();
    fetchAllUsers();

    // Setup Realtime Comments
    const uniqueSuffix = Date.now();
    realtimeChannel = supabase
      .channel(`timeline_comments_${uniqueSuffix}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "memory_comments" },
        (payload) => {
          if (selectedMemory && selectedMemory.id === payload.new.memory_id) {
            if (!activeComments.some(c => c.id === payload.new.id)) {
              activeComments = [...activeComments, payload.new];
            }
          }
          // Update count in memories list
          memories = memories.map(m => {
            if (m.id === payload.new.memory_id) {
              return { ...m, comments_count: (m.comments_count || 0) + 1 };
            }
            return m;
          });
        }
      )
      .subscribe();
  });

  onDestroy(() => {
    if (realtimeChannel) supabase.removeChannel(realtimeChannel);
  });

  // Handle Liking / Unliking
  async function toggleLike(memory: MemoryItem) {
    const userName = currentUserName || guestId || 'Tamu';
    
    try {
      if (memory.has_liked) {
        // Unlike
        const { error } = await supabase
          .from('memory_likes')
          .delete()
          .eq('memory_id', memory.id)
          .eq('user_name', userName);
          
        if (error) throw error;
        
        memories = memories.map(m => {
          if (m.id === memory.id) {
            return {
              ...m,
              likes_count: Math.max(0, m.likes_count - 1),
              has_liked: false
            };
          }
          return m;
        });

        // Sync with Lightbox state if open
        if (selectedMemory && selectedMemory.id === memory.id) {
          selectedMemory = {
            ...selectedMemory,
            likes_count: Math.max(0, selectedMemory.likes_count - 1),
            has_liked: false
          };
        }
      } else {
        // Like
        const { error } = await supabase
          .from('memory_likes')
          .insert([{
            memory_id: memory.id,
            user_name: userName
          }]);
          
        if (error) throw error;
        
        memories = memories.map(m => {
          if (m.id === memory.id) {
            return {
              ...m,
              likes_count: m.likes_count + 1,
              has_liked: true
            };
          }
          return m;
        });

        // Sync with Lightbox state if open
        if (selectedMemory && selectedMemory.id === memory.id) {
          selectedMemory = {
            ...selectedMemory,
            likes_count: selectedMemory.likes_count + 1,
            has_liked: true
          };
        }
      }
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  }

  // Lightbox & Comments Logic
  async function openLightbox(memory: MemoryItem) {
    selectedMemory = memory;
    activeComments = [];
    newCommentText = '';
    guestName = '';
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('hide-mobile-nav');
    }
    await loadComments(memory.id);
  }

  async function closeLightbox() {
    isClosingLightbox = true;
    selectedMemory = null;
    activeComments = [];
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('hide-mobile-nav');
    }
    
    // Remove query param so Svelte's reactivity doesn't instantly reopen it
    if ($page && $page.url) {
      const url = new URL($page.url);
      if (url.searchParams.has('memory')) {
        url.searchParams.delete('memory');
        await goto(url.pathname + url.search, { replaceState: true, noScroll: true, keepFocus: true });
      }
    }
    
    isClosingLightbox = false;
  }

  onDestroy(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('hide-mobile-nav');
    }
  });

  async function loadComments(memoryId: string) {
    try {
      isLoadingComments = true;
      const { data, error } = await supabase
        .from('memory_comments')
        .select('*')
        .eq('memory_id', memoryId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      activeComments = data || [];
    } catch (err) {
      console.error('Error loading comments:', err);
    } finally {
      isLoadingComments = false;
    }
  }

  async function submitComment(memoryId: string) {
    const commenterName = currentUserName || guestName.trim() || 'Tamu';
    if (!newCommentText.trim()) return;

    const parentId = replyingToCommentId;
    const targetAuthor = replyingToCommentAuthor;

    try {
      isSubmittingComment = true;
      const { data, error } = await supabase
        .from('memory_comments')
        .insert([{
          memory_id: memoryId,
          user_name: commenterName,
          comment_text: newCommentText.trim(),
          user_foto: $authStore.user?.foto_url || '',
          parent_id: parentId || null
        }])
        .select();

      if (error) throw error;
      
      // Update local comments immediately
      if (data && data.length > 0) {
        if (!activeComments.some(c => c.id === data[0].id)) {
          activeComments = [...activeComments, data[0]];
        }
      }
      
      // Notify mentions
      await notifyMentions(newCommentText.trim(), "Ada yang Mention Anda di Timeline!", `/timeline?memory=${memoryId}`);
      
      // Kirim notifikasi jika ini balasan ke orang lain
      if (parentId && targetAuthor && targetAuthor !== commenterName) {
        try {
          await supabase.from("app_notifications").insert([{
            title: `Balasan Baru dari ${commenterName}`,
            message: `${commenterName} membalas komentar anda: @${targetAuthor} "${newCommentText.substring(0, 50)}${newCommentText.length > 50 ? '...' : ''}"|LINK:/timeline?memory=${memoryId}`,
            type: 'info',
            target_user: targetAuthor,
            is_active: true
          }]);
        } catch (err) {
          console.error("Gagal kirim notif:", err);
        }
      }
      
      newCommentText = '';
      replyingToCommentId = null;
      replyingToCommentAuthor = "";
      
      // Update comment count locally
      memories = memories.map(m => {
        if (m.id === memoryId) {
          return { ...m, comments_count: m.comments_count + 1 };
        }
        return m;
      });

      if (selectedMemory) {
        selectedMemory = {
          ...selectedMemory,
          comments_count: selectedMemory.comments_count + 1
        };
      }
    } catch (err) {
      console.error('Error submitting comment:', err);
    } finally {
      isSubmittingComment = false;
    }
  }

  async function deleteComment(commentId: string, memoryId: string) {
    runWithConfirmation('Hapus Komentar', 'Apakah Anda yakin ingin menghapus komentar ini? Tindakan ini tidak dapat dibatalkan.', async () => {
      try {
        const { error, count } = await supabase
          .from('memory_comments')
          .delete({ count: 'exact' })
          .eq('id', commentId);
          
        if (error) throw error;
        if (count === 0) throw new Error('Akses ditolak oleh database (RLS). Silakan izinkan akses Hapus di dashboard Supabase Anda.');
        
        await loadComments(memoryId);
        
        memories = memories.map(m => {
          if (m.id === memoryId) {
            return { ...m, comments_count: Math.max(0, m.comments_count - 1) };
          }
          return m;
        });

        if (selectedMemory) {
          selectedMemory = {
            ...selectedMemory,
            comments_count: Math.max(0, selectedMemory.comments_count - 1)
          };
        }
        triggerAlert('Komentar berhasil dihapus.');
      } catch (err: any) {
        console.error('Error deleting comment:', err);
        triggerAlert(err.message || 'Terjadi kesalahan sistem.', 'error');
      } finally {
        showConfirmModal = false;
      }
    });
  }

  // ─── Edit Comment (Admin) ────────────────────────────────────────────────
  async function saveEditComment() {
    if (!editingCommentText.trim() || !editingCommentId) return;
    const newText = editingCommentText.trim();
    try {
      const { error, count } = await supabase
        .from('memory_comments')
        .update({ comment_text: newText }, { count: 'exact' })
        .eq('id', editingCommentId);
      if (error) throw error;
      if (count === 0) throw new Error('Akses ditolak oleh database (RLS). Silakan izinkan akses Edit di dashboard Supabase Anda.');

      activeComments = activeComments.map(c =>
        c.id === editingCommentId ? { ...c, comment_text: newText } : c
      );
      editingCommentId = null;
      editingCommentText = '';
      triggerAlert('Komentar berhasil diperbarui.');
    } catch (err: any) {
      console.error('Error editing comment:', err);
      triggerAlert(err.message || 'Terjadi kesalahan sistem.', 'error');
    }
  }
  // Helper: convert Google Drive share URL → direct embeddable link
  function convertDriveUrl(url: string): string {
    if (!url) return '';
    const cleaned = url.trim();
    if (cleaned.includes('lh3.googleusercontent.com/u/0/d/')) {
      return cleaned.replace('lh3.googleusercontent.com/u/0/d/', 'lh3.googleusercontent.com/d/');
    }
    const match = cleaned.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
                  cleaned.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
    return cleaned;
  }

  // Helper: resolve correct avatar URL for a comment.
  // Admin photo is always read live from authStore so it stays in sync.
  function resolveCommentAvatar(comment: any): string {
    const name = (comment.user_name || '').toUpperCase();
    const currentAdminName = (adminName || 'ADMIN MAZEEDA').toUpperCase();
    if (name === currentAdminName || name === 'ADMIN MAZEEDA' || name === 'ADMIN') {
      if ($authStore.user?.role === 'admin') {
        return convertDriveUrl($authStore.user.foto_url || adminFotoUrl);
      }
      return convertDriveUrl(adminFotoUrl);
    }
    return convertDriveUrl(comment.user_foto || '');
  }

  // Helper: get initials from display name
  function getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
  }

  function handleOpenProfile(role: 'admin' | 'member', name: string) {
    if (!name || name === 'Anonim' || name === 'Tamu' || name.startsWith('Tamu_')) return;
    activeProfileStore.set({ type: role, nameOrNis: name });
  }
  // --- REPORT USER ---
  let showReportModal = false;
  let reportReason = '';
  let reportingUserName = '';
  let isSubmittingReport = false;
  let reportOtherReason = '';

  function openReportModal(userName: string) {
    reportingUserName = userName;
    reportReason = '';
    reportOtherReason = '';
    showReportModal = true;
  }

  async function submitReport() {
    const finalReason = reportReason === 'Lainnya' ? reportOtherReason : reportReason;
    if (!finalReason.trim()) {
      showToastNotification('Pilih atau masukkan alasan pelaporan.', 'error');
      return;
    }
    isSubmittingReport = true;
    try {
      const reporterName = $authStore.user?.name || 'Anonim';
      const { error } = await supabase.from('user_reports').insert([{
        reporter_name: reporterName,
        reported_name: reportingUserName,
        reason: finalReason.trim()
      }]);
      if (error) throw error;
      showToastNotification('Laporan berhasil dikirim ke Admin.', 'success');
      showReportModal = false;
      reportingUserName = '';
    } catch (e) {
      showToastNotification('Gagal mengirim laporan.', 'error');
    } finally {
      isSubmittingReport = false;
    }
  }
</script>

<div class="space-y-6 pb-12">
  <PageHeader title="Timeline" backTo="/">
    <svelte:fragment slot="right">
      <div class="flex items-center bg-white/60 backdrop-blur-sm rounded-lg border border-slate-200 p-1 shadow-sm mr-2 sm:mr-0 gap-0.5">
        <button on:click={() => viewMode = 'medium'} class="p-1.5 rounded-md transition-colors {viewMode === 'medium' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}" title="Tampilan Sedang"><LayoutGrid class="w-3.5 h-3.5 sm:w-4 sm:h-4"/></button>
        <button on:click={() => viewMode = 'small'} class="p-1.5 rounded-md transition-colors {viewMode === 'small' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}" title="Tampilan Kecil"><Grid3X3 class="w-3.5 h-3.5 sm:w-4 sm:h-4"/></button>
        <div class="w-[1px] h-4 bg-slate-200 mx-1"></div>
        <div class="relative">
          <button 
            on:click={() => showFilterDropdown = !showFilterDropdown}
            class="p-1.5 rounded-md transition-colors {selectedCategory !== 'Semua' ? 'bg-primary/10 text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}" 
            title="Filter Kategori"
          >
            <Filter class="w-3.5 h-3.5 sm:w-4 sm:h-4"/>
          </button>
          
          {#if showFilterDropdown}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div class="fixed inset-0 z-40" on:click={() => showFilterDropdown = false}></div>
            <div 
              transition:fade={{duration: 150}}
              class="absolute right-0 top-full mt-2 w-64 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-slate-200/60 z-50 overflow-hidden py-1.5 flex flex-col"
            >
              <div class="px-3 py-1.5 mb-1 border-b border-slate-100">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Filter Kategori</span>
              </div>
              <div class="max-h-64 overflow-y-auto">
                {#each availableCategories as cat}
                  <button 
                    class="w-full text-left px-3 py-2 text-xs font-semibold transition-colors flex flex-row items-center justify-between gap-2 {selectedCategory === cat ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}"
                    on:click={() => { selectedCategory = cat; showFilterDropdown = false; }}
                  >
                    <span class="break-words leading-relaxed flex-1">{cat}</span>
                    {#if selectedCategory === cat}
                      <CheckCircle class="w-4 h-4 text-primary shrink-0" />
                    {/if}
                  </button>
                {/each}
              </div>
            </div>
          {/if}
        </div>
      </div>
    </svelte:fragment>
  </PageHeader>

  <!-- Alert / Toast Banner (Floating Toast) -->
  {#if alertMessage}
    <div
      transition:fade={{ duration: 150 }}
      class="fixed top-20 right-4 flex items-center p-4 rounded-xl border text-xs font-semibold shadow-xl space-x-2.5 animate-in slide-in-from-top-4 duration-300 max-w-sm
        {alertType === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}"
      style="z-index: 999999;"
    >
      {#if alertType === 'error'}
        <AlertCircle class="h-4 w-4 shrink-0 text-rose-600" />
      {:else}
        <CheckCircle class="h-4 w-4 shrink-0 text-emerald-600" />
      {/if}
      <span class="leading-relaxed">{alertMessage}</span>
    </div>
  {/if}

  <!-- Main Timeline Grid / Loading State -->
  {#if isLoading}
    <div class="py-24 text-center space-y-4">
      <img src="/loading.svg" alt="Loading..." class="h-16 w-16 mx-auto opacity-80" />
      <p class="text-sm font-bold text-slate-500 tracking-wide">Memuat galeri kenangan...</p>
    </div>
  {:else if filteredMemories.length === 0}
    <div class="py-24 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/20 max-w-lg mx-auto">
      <ImageIcon class="h-10 w-10 text-slate-300 mx-auto {selectedCategory === 'Semua' ? 'animate-pulse' : ''}" />
      <h3 class="text-sm font-extrabold text-slate-600 mt-3">
        {selectedCategory !== 'Semua' ? 'Tidak Ada Foto' : 'Belum Ada Foto Kenangan'}
      </h3>
      <p class="text-xs text-slate-400 max-w-xs mx-auto mt-1 leading-relaxed">
        {selectedCategory !== 'Semua' 
          ? `Belum ada foto dalam kategori ${selectedCategory}.` 
          : 'Belum ada dokumentasi momen yang diunggah.'}
      </p>
      {#if isAdmin && selectedCategory === 'Semua'}
        <a href="/admin">
          <button
            type="button"
            class="mt-4 inline-flex items-center space-x-1.5 bg-primary hover:bg-primary/90 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-soft-sm transition-premium"
            style="min-height: 38px;"
          >
            <CloudUpload class="h-4.5 w-4.5" />
            <span>Unggah Foto Pertama</span>
          </button>
        </a>
      {/if}
    </div>
  {:else}
    <div class="px-4 sm:px-6 {viewMode === 'small' ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'}">
      {#each filteredMemories as memory (memory.id)}
        <!-- Card -->
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div 
          on:click={() => openLightbox(memory)}
          class="group bg-white border border-slate-200/60 hover:border-primary/20 hover:shadow-soft-md {viewMode === 'small' ? 'rounded-xl' : 'rounded-2xl'} overflow-hidden transition-premium flex flex-col h-full cursor-pointer relative"
        >
          <!-- Image Area -->
          <div class="w-full relative overflow-hidden bg-slate-950 flex items-center justify-center {viewMode === 'small' ? 'h-32 sm:h-40' : 'h-56'}">
            <!-- Blurred background image to fill different aspect ratios smoothly -->
            <img referrerpolicy="no-referrer" 
              src={memory.image_url} 
              alt="" 
              class="absolute inset-0 w-full h-full object-cover blur-lg opacity-40 scale-110 pointer-events-none" 
            />
            <!-- Clean foreground image shown in full scale without cropping -->
            <img referrerpolicy="no-referrer" 
              src={memory.image_url} 
              alt={memory.title} 
              class="relative z-10 max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-[1.02]" 
            />
            
            <!-- Category Badge -->
            {#if viewMode !== 'small'}
              <div class="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-sm border border-slate-200/40 rounded-lg px-2.5 py-0.5 shadow-soft-sm">
                <span class="text-[10px] font-bold text-primary tracking-wide uppercase">{memory.category}</span>
              </div>
            {/if}
          </div>

          <!-- Card Info Body -->
          {#if viewMode === 'small'}
             <div class="p-3">
               <h3 class="font-extrabold text-slate-800 text-[11px] truncate leading-snug group-hover:text-primary transition-colors">
                 {memory.title}
               </h3>
               <div class="flex items-center space-x-3 mt-1.5 text-[10px] text-slate-400 font-bold">
                  <button type="button" on:click|preventDefault|stopPropagation={() => toggleLike(memory)} class="relative z-20 flex items-center space-x-1 hover:text-rose-500 transition-colors {memory.has_liked ? 'text-rose-500' : ''}">
                    <Heart class="w-3 h-3 {memory.has_liked ? 'fill-current' : ''}"/> 
                    <span>{memory.likes_count}</span>
                  </button>
                  <button type="button" on:click|preventDefault|stopPropagation={() => openLightbox(memory)} class="relative z-20 flex items-center space-x-1 hover:text-primary transition-colors">
                    <MessageCircle class="w-3 h-3"/> 
                    <span>{memory.comments_count}</span>
                  </button>
               </div>
             </div>
          {:else}
            <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div class="space-y-2.5">
              <!-- Location & Date Row -->
              <div class="flex items-center justify-between text-[11px] font-bold text-slate-400">
                <div class="flex items-center space-x-1 min-w-0 flex-1 mr-2">
                  <MapPin class="h-3.5 w-3.5 text-primary/70 shrink-0" />
                  <span class="truncate">{memory.location}</span>
                </div>
                <div class="flex items-center space-x-1 shrink-0">
                  <Calendar class="h-3.5 w-3.5 text-slate-400" />
                  <span>{new Date(memory.date).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}</span>
                </div>
              </div>
              
              <!-- Title -->
              <h3 class="font-extrabold text-slate-800 text-base leading-snug group-hover:text-primary transition-colors line-clamp-2">
                {memory.title}
              </h3>
              
              <!-- Description -->
              {#if memory.description}
                <p class="text-xs text-slate-500 font-normal line-clamp-2 leading-relaxed bg-slate-50/60 p-2.5 rounded-xl border border-slate-100">
                  {memory.description}
                </p>
              {/if}
            </div>

            <!-- Actions Row -->
            <div class="flex items-center justify-between border-t border-slate-100 pt-3 relative z-20">
              <button 
                type="button"
                on:click|preventDefault|stopPropagation={() => toggleLike(memory)}
                class="inline-flex items-center justify-center space-x-1.5 text-xs font-bold transition-colors py-2 px-3 rounded-lg border border-transparent
                  {memory.has_liked 
                    ? 'text-rose-600 bg-rose-50 border-rose-100/40 hover:bg-rose-100/50' 
                    : 'text-slate-500 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-100/30'}"
                style="min-height: 40px;"
              >
                <Heart class="h-4.5 w-4.5 {memory.has_liked ? 'fill-current text-rose-500' : 'text-slate-400'}" />
                <span>{memory.likes_count}</span>
              </button>

              <button 
                type="button"
                on:click|preventDefault|stopPropagation={() => openLightbox(memory)}
                class="inline-flex items-center justify-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-primary transition-colors py-2 px-3 rounded-lg hover:bg-blue-50 border border-transparent hover:border-blue-100/30"
                style="min-height: 40px;"
              >
                <MessageCircle class="h-4.5 w-4.5 text-slate-400" />
                <span>{memory.comments_count}</span>
              </button>
            </div>
          </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

<!-- LIGHTBOX MODAL WITH COMMENTS -->
{#if selectedMemory}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div 
    transition:fade={{ duration: 150 }} 
    class="fixed inset-0 bg-slate-900/95 backdrop-blur-md z-[99999] flex items-center justify-center p-0 md:p-4 overflow-hidden"
    on:click={closeLightbox}
  >
    <!-- Modal container -->
    <div 
      class="bg-slate-950 md:bg-white w-full h-full md:h-[75vh] md:max-h-[85vh] md:max-w-5xl md:rounded-3xl overflow-hidden flex flex-col md:grid md:grid-cols-12 shadow-2xl relative"
      style="padding-top: env(safe-area-inset-top, 0px); padding-bottom: env(safe-area-inset-bottom, 0px);"
      on:click|stopPropagation
    >
      <!-- Left: Image Area (7 cols on desktop, fixed height on mobile) -->
      <div class="md:col-span-7 bg-slate-950 flex items-center justify-center relative h-60 sm:h-72 md:h-full p-2 overflow-hidden shrink-0">
        <!-- Blurred background image inside lightbox for premium visual cohesion -->
        <img referrerpolicy="no-referrer" 
          src={selectedMemory.image_url} 
          alt="" 
          class="absolute inset-0 w-full h-full object-cover blur-2xl opacity-35 scale-110 pointer-events-none" 
        />
        <img referrerpolicy="no-referrer" 
          src={selectedMemory.image_url} 
          alt={selectedMemory.title} 
          class="relative z-10 max-w-full max-h-full object-contain"
        />
        <div class="absolute bottom-4 left-4 z-20 bg-black/60 backdrop-blur-sm rounded-lg px-2.5 py-1 text-white text-xs border border-white/10">
          <span class="font-bold uppercase tracking-wider text-teal-400">{selectedMemory.category}</span>
        </div>
      </div>

      <!-- Right: Details & Comments (5 cols on desktop, fills remaining height on mobile) -->
      <div class="md:col-span-5 flex flex-col flex-1 overflow-hidden bg-slate-50 border-t md:border-t-0 md:border-l border-slate-200/60">
        <!-- Scrollable Details & Comments Wrapper -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          <!-- Header (Title & Location & Description) -->
          <div class="space-y-2.5 pb-4 border-b border-slate-200/60 bg-white -mx-4 -mt-4 p-4 sm:-mx-5 sm:-mt-5 sm:p-5">
            <h3 class="font-extrabold text-slate-800 text-base md:text-lg leading-tight">{selectedMemory.title}</h3>
            <div class="flex items-center space-x-2 text-slate-400 text-xs font-semibold">
              <MapPin class="h-3.5 w-3.5 text-slate-400" />
              <span class="truncate">{selectedMemory.location}</span>
            </div>
            <div class="flex items-center space-x-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-1 pb-1">
              <Calendar class="h-3.5 w-3.5" />
              <span>{new Date(selectedMemory.date).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</span>
            </div>
            
            {#if selectedMemory.description}
              <div class="text-xs text-slate-600 font-medium leading-relaxed mt-3 break-words bg-slate-50 p-3 rounded-2xl border border-slate-150 max-h-40 overflow-y-auto">
                {selectedMemory.description}
              </div>
            {/if}
          </div>

          <!-- Comments Area -->
          <div class="space-y-3 pt-2">
            <h4 class="text-xs font-black text-slate-400 uppercase tracking-widest">Komentar ({selectedMemory.comments_count})</h4>
            
            {#if isLoadingComments}
              <div class="py-8 text-center">
                <div class="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                <p class="text-[10px] text-slate-400 font-semibold mt-2">Memuat komentar...</p>
              </div>
            {:else if sortedActiveComments.length > 0}
              {#each sortedActiveComments as comment}
                {@const isAdminComment = comment.user_name && (comment.user_name.toUpperCase() === (adminName || 'ADMIN MAZEEDA').toUpperCase() || comment.user_name.toUpperCase() === 'ADMIN MAZEEDA' || comment.user_name.toUpperCase() === 'ADMIN')}
                {@const avatarUrl = resolveCommentAvatar(comment)}
                {@const isEditing = editingCommentId === comment.id}
                <div class="flex items-start space-x-3 bg-white p-3 rounded-xl border border-slate-200/40 shadow-soft-sm relative {comment.parent_id ? 'ml-8 border-l-4 border-l-indigo-300' : ''}
                  {isAdmin ? 'group/tc' : ''}
                  {isAdminComment ? 'border-indigo-100/50 bg-gradient-to-r from-indigo-50/30 to-white' : ''}">
                  <!-- User Avatar -->
                  <button
                    type="button"
                    on:click={() => handleOpenProfile(isAdminComment ? 'admin' : 'member', comment.user_name)}
                    class="h-8 w-8 rounded-full flex items-center justify-center text-xs shrink-0 overflow-hidden uppercase cursor-pointer hover:scale-105 transition-transform
                    {isAdminComment 
                      ? 'bg-gradient-to-br from-primary to-indigo-600 text-white shadow-soft-sm' 
                      : 'bg-primary/10 text-primary border border-primary/20 font-black'}"
                  >
                    {#if avatarUrl}
                      <img referrerpolicy="no-referrer" src={avatarUrl} alt={comment.user_name} class="h-full w-full object-cover"
                        on:error={(e) => { e.currentTarget.style.display = 'none'; }} />
                    {:else}
                      {getInitials(comment.user_name)}
                    {/if}
                  </button>
                  <div class="leading-tight flex-1 min-w-0">
                    <div class="flex items-center justify-between gap-2">
                      <div class="flex items-center gap-1.5 min-w-0">
                        <button
                          type="button"
                          on:click={() => handleOpenProfile(isAdminComment ? 'admin' : 'member', comment.user_name)}
                          class="text-xs font-extrabold truncate hover:underline text-left cursor-pointer bg-transparent p-0 border-none outline-none
                            {isAdminComment ? 'text-indigo-700' : 'text-slate-700'}"
                        >
                          {isAdminComment ? (adminName || 'ADMIN MAZEEDA') : comment.user_name}
                        </button>
                        {#if isAdminComment}
                          <span class="px-1.5 py-0.5 bg-indigo-100 text-indigo-600 rounded-full text-[8px] font-black border border-indigo-200 shrink-0">ADMIN</span>
                        {/if}
                      </div>
                      <div class="flex items-center gap-1 shrink-0">
                        <span class="text-[9px] text-slate-400 font-bold">
                          {new Date(comment.created_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'})}
                        </span>
                        <!-- Actions -->
                        <button type="button" on:click|preventDefault|stopPropagation={() => { replyingToCommentId = comment.id; replyingToCommentAuthor = comment.user_name; }}
                          class="text-[9px] font-bold text-slate-400 hover:text-indigo-600 transition-colors ml-2 cursor-pointer">
                          Balas
                        </button>
                        <button type="button" on:click|preventDefault|stopPropagation={() => openReportModal(comment.user_name)}
                          class="text-[9px] font-bold text-slate-400 hover:text-rose-600 transition-colors ml-2 cursor-pointer flex items-center gap-0.5">
                          <Flag class="w-2.5 h-2.5" /> Lapor
                        </button>
                        <!-- Admin/Author Action Buttons -->
                        {#if isAdmin || comment.user_name === $authStore.user?.name}
                          <button
                            type="button"
                            on:click|preventDefault|stopPropagation={() => { editingCommentId = comment.id; editingCommentText = comment.comment_text; }}
                            class="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer"
                            title="Edit komentar">
                            <Pencil class="h-3.5 w-3.5" />
                          </button>
                          <button 
                            type="button"
                            on:click|preventDefault|stopPropagation={() => deleteComment(comment.id, selectedMemory.id)}
                            class="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                            title="Hapus Komentar">
                            <Trash2 class="h-3.5 w-3.5" />
                          </button>
                        {/if}
                      </div>
                    </div>
                    <!-- Text or Edit Input -->
                    {#if isEditing}
                      <div class="flex gap-2 items-center mt-1.5">
                        <input
                          type="text"
                          class="flex-1 h-8 text-xs border border-indigo-200 rounded-xl px-2.5 bg-indigo-50/40 text-slate-700 outline-none focus:border-indigo-400"
                          bind:value={editingCommentText}
                          on:keydown={(e) => { if (e.key === 'Enter') saveEditComment(); if (e.key === 'Escape') { editingCommentId = null; } }}
                          autofocus
                        />
                        <button on:click={saveEditComment}
                          class="h-8 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black rounded-xl transition-colors">
                          Simpan
                        </button>
                        <button on:click={() => { editingCommentId = null; }}
                          class="h-8 w-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl transition-colors">
                          <X class="h-3.5 w-3.5" />
                        </button>
                      </div>
                    {:else}
                      <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                      <!-- svelte-ignore a11y-click-events-have-key-events -->
                      <p class="text-xs text-slate-500 font-normal mt-1 leading-relaxed break-words" on:click={handleDelegatedMentionClick}>{@html formatMentions(comment.comment_text)}</p>
                    {/if}
                  </div>
                </div>
              {/each}
            {:else}
              <div class="py-8 text-center border-2 border-dashed border-slate-200/60 rounded-2xl bg-white">
                <MessageCircle class="h-7 w-7 text-slate-300 mx-auto mb-1 animate-pulse" />
                <p class="text-xs font-bold text-slate-500">Belum Ada Komentar</p>
                <p class="text-[9px] text-slate-400 mt-0.5">Jadilah yang pertama menulis tanggapan!</p>
              </div>
            {/if}
          </div>
        </div>

        <!-- Add Comment Input Form (Pinned at bottom, accounting for phone home indicator) -->
        <div class="p-4 bg-white border-t border-slate-200/60 shrink-0" style="padding-bottom: max(16px, env(safe-area-inset-bottom, 16px));">
          {#if replyingToCommentId}
            <div class="flex items-center justify-between bg-indigo-50/50 px-3 py-2 rounded-t-xl border border-indigo-100 border-b-0 -mb-2 relative z-0">
              <span class="text-[10px] font-bold text-indigo-700">Membalas @{replyingToCommentAuthor}</span>
              <button on:click={() => { replyingToCommentId = null; replyingToCommentAuthor = ''; }} class="text-indigo-400 hover:text-rose-500 cursor-pointer">
                <X class="h-3.5 w-3.5" />
              </button>
            </div>
          {/if}
          <form on:submit|preventDefault={() => submitComment(selectedMemory.id)} class="space-y-2.5 relative z-10 bg-white {replyingToCommentId ? 'pt-2' : ''}">
            <!-- Guest Name Input if not logged in -->
            {#if !$authStore.user}
              <div class="flex items-center space-x-2">
                <span class="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide shrink-0">Nama Anda:</span>
                <input 
                  type="text" 
                  placeholder="e.g. Ahmad" 
                  class="flex-1 h-7 border border-slate-200 rounded-lg text-xs px-2.5 bg-slate-50 text-slate-700 outline-none focus:border-primary focus:bg-white"
                  bind:value={guestName}
                  required
                />
              </div>
            {/if}
            <div class="flex items-center space-x-2">
              <!-- Current user avatar in input form -->
              {#if $authStore.user}
                {@const myAvatar = $authStore.user.role === 'admin' ? convertDriveUrl($authStore.user.foto_url || adminFotoUrl) : convertDriveUrl($authStore.user.foto_url || '')}
                <div class="h-8 w-8 rounded-full shrink-0 overflow-hidden flex items-center justify-center text-[10px] font-black
                  {$authStore.user.role === 'admin' ? 'bg-gradient-to-br from-primary to-indigo-600 text-white' : 'bg-primary/10 text-primary border border-primary/20'}">
                  {#if myAvatar}
                    <img referrerpolicy="no-referrer" src={myAvatar} alt="Saya" class="h-full w-full object-cover" on:error={(e) => { e.currentTarget.style.display='none'; }} />
                  {:else}
                    {getInitials($authStore.user.name)}
                  {/if}
                </div>
              {/if}
              <div class="flex-1 relative">
                {#if showMentionDropdown && filteredUsers.length > 0}
                  <div class="absolute bottom-full left-0 mb-2 w-full max-h-48 overflow-y-auto bg-white border border-slate-200 shadow-xl rounded-xl z-[1000] py-1">
                    {#each filteredUsers as user}
                      <button 
                        type="button" 
                        class="flex w-full items-center gap-2 px-3 py-2 hover:bg-indigo-50 border-b border-slate-100 last:border-b-0 transition-colors cursor-pointer"
                        on:click={() => insertMention(user.name)}
                      >
                        {#if user.avatar}
                          <div class="w-6 h-6 rounded-full shrink-0 relative overflow-hidden bg-slate-200">
                            <div class="absolute inset-0 flex items-center justify-center text-slate-600 font-bold text-[8px]">
                              {getInitials(user.name)}
                            </div>
                            <img src={convertDriveUrl(user.avatar)} alt={user.name} class="absolute inset-0 w-full h-full object-cover" on:error={(e) => { e.currentTarget.style.display='none'; }} />
                          </div>
                        {:else}
                          <div class="w-6 h-6 rounded-full flex items-center justify-center bg-slate-200 text-slate-600 font-bold text-[8px] shrink-0">
                            {getInitials(user.name)}
                          </div>
                        {/if}
                        <span class="text-[11px] font-bold text-slate-700 truncate">{user.name}</span>
                      </button>
                    {/each}
                  </div>
                {/if}
                <input 
                  type="text" 
                  placeholder={replyingToCommentId ? `Balas komentar...` : "Tulis komentar berharga Anda..."} 
                  class="w-full h-10 border border-slate-200 rounded-xl text-xs px-3 bg-slate-50 text-slate-700 outline-none focus:border-primary focus:bg-white"
                  bind:value={newCommentText}
                  bind:this={inputElement}
                  on:input={handleCommentInput}
                  required
                />
              </div>
              <Button type="submit" disabled={isSubmittingComment} class="h-10 px-4 font-bold text-xs shrink-0">
                Kirim
              </Button>
            </div>
          </form>
        </div>
      </div>

      <!-- Close button -->
      <button 
        type="button"
        on:click={(e) => { e.stopPropagation(); closeLightbox(); }}
        class="absolute top-4 right-4 bg-slate-900/60 hover:bg-slate-900 text-white rounded-full p-2 z-[9999] transition-colors shadow-soft-md flex items-center justify-center cursor-pointer pointer-events-auto"
        style="min-height: 40px; min-width: 40px; margin-top: env(safe-area-inset-top, 0px);"
      >
        <X class="h-5 w-5 pointer-events-none" />
      </button>
    </div>
  </div>
{/if}

<!-- ==================== CONFIRMATION MODAL ==================== -->
{#if showConfirmModal}
  <div class="fixed inset-0 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" style="z-index: 999999;">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
      <div class="p-5 border-b border-slate-100 flex items-center gap-3">
        <div class="h-10 w-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
          <AlertCircle class="h-5 w-5 text-rose-500" />
        </div>
        <div>
          <h3 class="text-sm font-bold text-slate-800">{confirmConfig.title}</h3>
          <p class="text-xs text-slate-500 mt-0.5 leading-relaxed">{confirmConfig.message}</p>
        </div>
      </div>
      <div class="p-4 bg-slate-50/50 flex gap-3">
        <button type="button" class="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold h-10 transition-colors" on:click={() => showConfirmModal = false}>
          Batal
        </button>
        <button type="button" class="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold h-10 shadow-soft-sm transition-colors" on:click={confirmConfig.onConfirm}>
          Ya, Hapus
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- MODAL LAPORKAN PENGGUNA -->
{#if showReportModal && reportingUserName}
  <div class="fixed inset-0 z-[999999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" style="z-index: 9999999;">
    <div class="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
      <div class="p-5 border-b border-slate-100 flex items-center justify-between bg-rose-50/50">
        <h3 class="font-black text-slate-800 text-lg flex items-center gap-2">
          <Flag class="w-5 h-5 text-rose-500" /> Laporkan Pengguna
        </h3>
        <button on:click={() => showReportModal = false} class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
          <X class="w-5 h-5" />
        </button>
      </div>
      
      <div class="p-6 space-y-5">
        <div>
          <p class="text-sm font-medium text-slate-500 mb-1">Pengguna yang dilaporkan:</p>
          <div class="font-bold text-slate-800 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl">
            {reportingUserName}
          </div>
        </div>
        
        <div>
          <p class="text-sm font-bold text-slate-700 mb-3">Pilih Alasan Pelaporan <span class="text-rose-500">*</span></p>
          <div class="grid grid-cols-1 gap-2.5">
            {#each ['Spam atau Iklan', 'Konten Tidak Pantas', 'Ujaran Kebencian', 'Penipuan', 'Lainnya'] as reason}
              <label class="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all {reportReason === reason ? 'border-rose-500 bg-rose-50 shadow-sm' : 'border-slate-200 hover:border-rose-300 hover:bg-slate-50'}">
                <input type="radio" name="reportReason" value={reason} bind:group={reportReason} class="w-4 h-4 text-rose-600 focus:ring-rose-500 border-slate-300" />
                <span class="text-sm font-medium {reportReason === reason ? 'text-rose-700' : 'text-slate-700'}">{reason}</span>
              </label>
            {/each}
          </div>
        </div>
        
        {#if reportReason === 'Lainnya'}
          <div class="animate-in slide-in-from-top-2 duration-300">
            <p class="text-sm font-bold text-slate-700 mb-2">Jelaskan Alasan Anda <span class="text-rose-500">*</span></p>
            <textarea
              bind:value={reportOtherReason}
              rows="3"
              class="w-full rounded-xl border-slate-200 shadow-sm focus:border-rose-500 focus:ring-rose-500 text-sm p-3 resize-none bg-slate-50 focus:bg-white transition-colors"
              placeholder="Tuliskan detail pelanggaran di sini..."
            ></textarea>
          </div>
        {/if}
      </div>
      
      <div class="p-5 border-t border-slate-100 bg-slate-50/50 flex gap-3 justify-end">
        <button 
          on:click={() => showReportModal = false}
          class="px-5 py-2.5 text-slate-600 font-bold text-sm hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors"
          disabled={isSubmittingReport}
        >
          Batal
        </button>
        <button 
          on:click={submitReport}
          disabled={isSubmittingReport || !reportReason || (reportReason === 'Lainnya' && !reportOtherReason.trim())}
          class="px-5 py-2.5 bg-rose-600 text-white font-bold text-sm hover:bg-rose-700 rounded-xl transition-all shadow-md shadow-rose-200 disabled:opacity-50 flex items-center gap-2"
        >
          {#if isSubmittingReport}
            <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Mengirim...
          {:else}
            Kirim Laporan
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}
