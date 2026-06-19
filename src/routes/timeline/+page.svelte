<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { fade } from 'svelte/transition';
  import Card from '$lib/components/ui/card.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import { supabase } from '$lib/supabase';
  import { authStore, activeProfileStore } from '$lib/auth';
  import { 
    Image as ImageIcon, MapPin, Calendar, Heart, MessageCircle, CloudUpload, Sparkles, X, Trash2, Pencil 
  } from 'lucide-svelte';

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

  // Auth / Admin check
  $: userRole = $authStore.user?.role || '';
  $: isAdmin = userRole === 'admin';
  $: currentUserName = $authStore.user?.name || '';

  // Lightbox Modal States
  let selectedMemory: MemoryItem | null = null;
  let activeComments: any[] = [];
  let isLoadingComments = false;
  let newCommentText = '';
  let guestName = '';
  let isSubmittingComment = false;

  // Edit comment state (admin)
  let editingCommentId: string | null = null;
  let editingCommentText = '';

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

  function closeLightbox() {
    selectedMemory = null;
    activeComments = [];
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('hide-mobile-nav');
    }
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

    try {
      isSubmittingComment = true;
      const { error } = await supabase
        .from('memory_comments')
        .insert([{
          memory_id: memoryId,
          user_name: commenterName,
          comment_text: newCommentText.trim(),
          user_foto: $authStore.user?.foto_url || ''
        }]);

      if (error) throw error;
      
      newCommentText = '';
      await loadComments(memoryId);
      
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
    if (!confirm('Apakah Anda yakin ingin menghapus komentar ini?')) return;
    
    try {
      const { error } = await supabase
        .from('memory_comments')
        .delete()
        .eq('id', commentId);
        
      if (error) throw error;
      
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
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  }

  // ─── Edit Comment (Admin) ────────────────────────────────────────────────
  async function saveEditComment() {
    if (!editingCommentText.trim() || !editingCommentId) return;
    const newText = editingCommentText.trim();
    try {
      const { error } = await supabase
        .from('memory_comments')
        .update({ comment_text: newText })
        .eq('id', editingCommentId);
      if (error) throw error;

      activeComments = activeComments.map(c =>
        c.id === editingCommentId ? { ...c, comment_text: newText } : c
      );
      editingCommentId = null;
      editingCommentText = '';
    } catch (err) {
      console.error('Error editing comment:', err);
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
</script>

<div class="space-y-6 pb-12">

  <!-- Main Timeline Grid / Loading State -->
  {#if isLoading}
    <div class="py-24 text-center space-y-3">
      <div class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
      <p class="text-sm font-semibold text-slate-400">Memuat galeri kenangan...</p>
    </div>
  {:else if memories.length > 0}
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each memories as memory (memory.id)}
        <!-- Card -->
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div 
          on:click={() => openLightbox(memory)}
          class="group bg-white border border-slate-200/60 hover:border-primary/20 hover:shadow-soft-md rounded-2xl overflow-hidden transition-premium flex flex-col h-full cursor-pointer relative"
        >
          <!-- Image Area -->
          <div class="h-56 w-full relative overflow-hidden bg-slate-950 flex items-center justify-center">
            <!-- Blurred background image to fill different aspect ratios smoothly -->
            <img 
              src={memory.image_url} 
              alt="" 
              class="absolute inset-0 w-full h-full object-cover blur-lg opacity-40 scale-110 pointer-events-none" 
            />
            <!-- Clean foreground image shown in full scale without cropping -->
            <img 
              src={memory.image_url} 
              alt={memory.title} 
              class="relative z-10 max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-[1.02]" 
            />
            
            <!-- Category Badge -->
            <div class="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-sm border border-slate-200/40 rounded-lg px-2.5 py-0.5 shadow-soft-sm">
              <span class="text-[10px] font-bold text-primary tracking-wide uppercase">{memory.category}</span>
            </div>
          </div>

          <!-- Card Info Body -->
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
            <div class="flex items-center justify-between border-t border-slate-100 pt-3">
              <button 
                on:click|stopPropagation={() => toggleLike(memory)}
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
                on:click|stopPropagation={() => openLightbox(memory)}
                class="inline-flex items-center justify-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-primary transition-colors py-2 px-3 rounded-lg hover:bg-blue-50 border border-transparent hover:border-blue-100/30"
                style="min-height: 40px;"
              >
                <MessageCircle class="h-4.5 w-4.5 text-slate-400" />
                <span>{memory.comments_count}</span>
              </button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <div class="py-24 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/20 max-w-lg mx-auto">
      <ImageIcon class="h-10 w-10 text-slate-300 mx-auto animate-pulse" />
      <h3 class="text-sm font-extrabold text-slate-600 mt-3">Belum Ada Foto Kenangan</h3>
      <p class="text-xs text-slate-400 max-w-xs mx-auto mt-1 leading-relaxed">
        Belum ada dokumentasi momen yang diunggah.
      </p>
      {#if isAdmin}
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
  {/if}
</div>

<!-- LIGHTBOX MODAL WITH COMMENTS -->
{#if selectedMemory}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div 
    transition:fade={{ duration: 150 }} 
    class="fixed inset-0 bg-slate-900/95 backdrop-blur-md z-50 flex items-center justify-center p-0 md:p-4 overflow-hidden"
    on:click={closeLightbox}
  >
    <!-- Modal container -->
    <div 
      class="bg-slate-950 md:bg-white w-full h-full md:h-[75vh] md:max-h-[85vh] md:max-w-5xl md:rounded-3xl overflow-hidden flex flex-col md:grid md:grid-cols-12 shadow-2xl relative"
      style="padding-top: env(safe-area-inset-top, 0px); padding-bottom: env(safe-area-inset-bottom, 0px);"
      on:click|stopPropagation
    >
      <!-- Close button -->
      <button 
        on:click={closeLightbox}
        class="absolute top-4 right-4 bg-slate-900/60 hover:bg-slate-900 text-white rounded-full p-2 z-30 transition-colors shadow-soft-md"
        style="min-height: 40px; min-width: 40px; margin-top: env(safe-area-inset-top, 0px);"
      >
        <X class="h-5 w-5" />
      </button>

      <!-- Left: Image Area (7 cols on desktop, fixed height on mobile) -->
      <div class="md:col-span-7 bg-slate-950 flex items-center justify-center relative h-60 sm:h-72 md:h-full p-2 overflow-hidden shrink-0">
        <!-- Blurred background image inside lightbox for premium visual cohesion -->
        <img 
          src={selectedMemory.image_url} 
          alt="" 
          class="absolute inset-0 w-full h-full object-cover blur-2xl opacity-35 scale-110 pointer-events-none" 
        />
        <img 
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
            {:else if activeComments.length > 0}
              {#each activeComments as comment}
                {@const isAdminComment = comment.user_name && (comment.user_name.toUpperCase() === (adminName || 'ADMIN MAZEEDA').toUpperCase() || comment.user_name.toUpperCase() === 'ADMIN MAZEEDA' || comment.user_name.toUpperCase() === 'ADMIN')}
                {@const avatarUrl = resolveCommentAvatar(comment)}
                {@const isEditing = editingCommentId === comment.id}
                <div class="flex items-start space-x-3 bg-white p-3 rounded-xl border border-slate-200/40 shadow-soft-sm relative
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
                      <img src={avatarUrl} alt={comment.user_name} class="h-full w-full object-cover"
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
                        <!-- Admin Action Buttons -->
                        {#if isAdmin}
                          <button
                            on:click={() => { editingCommentId = comment.id; editingCommentText = comment.comment_text; }}
                            class="p-1 rounded-md text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 transition-all opacity-0 group-hover/tc:opacity-100"
                            title="Edit komentar">
                            <Pencil class="h-3 w-3" />
                          </button>
                          <button 
                            on:click={() => deleteComment(comment.id, selectedMemory.id)}
                            class="p-1 rounded-md text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover/tc:opacity-100"
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
                      <p class="text-xs text-slate-500 font-normal mt-1 leading-relaxed break-words">{comment.comment_text}</p>
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
          <form on:submit|preventDefault={() => submitComment(selectedMemory.id)} class="space-y-2.5">
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
                    <img src={myAvatar} alt="Saya" class="h-full w-full object-cover" on:error={(e) => { e.currentTarget.style.display='none'; }} />
                  {:else}
                    {getInitials($authStore.user.name)}
                  {/if}
                </div>
              {/if}
              <input 
                type="text" 
                placeholder="Tulis komentar berharga Anda..." 
                class="flex-1 h-10 border border-slate-200 rounded-xl text-xs px-3 bg-slate-50 text-slate-700 outline-none focus:border-primary focus:bg-white"
                bind:value={newCommentText}
                required
              />
              <Button type="submit" disabled={isSubmittingComment} class="h-10 px-4 font-bold text-xs shrink-0">
                Kirim
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
{/if}
