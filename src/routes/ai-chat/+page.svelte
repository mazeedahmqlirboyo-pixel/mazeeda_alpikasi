<script lang="ts">
  import { onMount, tick, onDestroy } from 'svelte';
  import { fade, slide, fly } from 'svelte/transition';
  import PageHeader from '$lib/components/ui/PageHeader.svelte';
  import { Send, Bot, User, Loader2, Sparkles, AlertCircle, Trash2, StopCircle, MoreVertical, History, Plus, MessageSquare } from 'lucide-svelte';
  import { authStore } from '$lib/auth';
  import { supabase } from '$lib/supabase';

  interface Message {
    id: string;
    role: 'user' | 'model';
    content: string;
  }

  interface ChatSession {
    id: string;
    title: string;
    updatedAt: number;
    messages: Message[];
  }

  let chatSessions: ChatSession[] = [];
  let currentChatId: string | null = null;
  let showDropdown = false;
  let showHistoryModal = false;
  let selectedImage: string | null = null;

  let messages: Message[] = [];
  let currentMessage = '';
  let isLoading = false;
  let chatContainer: HTMLElement;
  let inputElement: HTMLTextAreaElement;
  let abortController: AbortController | null = null;
  let isStreaming = false;
  let showClearModal = false;
  let squadContext = 'Data Squad belum dimuat.';

  onMount(() => {
    // Muat riwayat chat dari localStorage jika ada
    if (typeof window !== 'undefined') {
      const storedChats = localStorage.getItem('mazeeda_ai_chats');
      const oldStored = localStorage.getItem('mazeeda_ai_history');
      
      if (storedChats) {
        try {
          chatSessions = JSON.parse(storedChats);
        } catch (e) {
          console.error('Failed to parse chat sessions');
        }
      } else if (oldStored) {
        try {
          const oldMessages = JSON.parse(oldStored);
          chatSessions = [{
            id: Date.now().toString(),
            title: 'Obrolan Sebelumnya',
            updatedAt: Date.now(),
            messages: oldMessages
          }];
          localStorage.removeItem('mazeeda_ai_history');
        } catch (e) {}
      }

      if (chatSessions.length > 0) {
        chatSessions.sort((a, b) => b.updatedAt - a.updatedAt);
        loadChat(chatSessions[0].id);
      } else {
        startNewChat();
      }
    }

    // Load squad & asatidzah context
    const loadSquadContext = async () => {
      try {
        const { data: squadData } = await supabase.from('allowed_alumni').select('nama_lengkap, nama_panggilan, daerah_santri, kamar_santri, kategori_mazeeda');
        const { data: guruData } = await supabase.from('asatidzah').select('nama_lengkap, nama_panggilan, daerah_santri, kamar_santri, kategori_mazeeda');
        
        let contextText = '';
        if (squadData && squadData.length > 0) {
          contextText += 'Data MAZEEDA SQUAD (Santri/Alumni):\n' + squadData.map(d => `- ${d.nama_lengkap} (Panggilan: ${d.nama_panggilan || '-'}, Daerah: ${d.daerah_santri || '-'}, Kategori: ${d.kategori_mazeeda || '-'}, Kamar: ${d.kamar_santri || '-'})`).join('\n') + '\n\n';
        }
        
        if (guruData && guruData.length > 0) {
          contextText += 'Data GURUKU (Asatidzah/Pengajar):\n' + guruData.map(d => `- ${d.nama_lengkap} (Panggilan: ${d.nama_panggilan || '-'}, Daerah: ${d.daerah_santri || '-'}, Kategori: ${d.kategori_mazeeda || '-'}, Kamar: ${d.kamar_santri || '-'})`).join('\n');
        }
        
        if (contextText) {
          squadContext = contextText;
        } else {
          squadContext = 'Saat ini belum ada data Squad atau Guruku yang terdaftar.';
        }
      } catch (e) {
        console.error('Failed to load squad/guru context:', e);
      }
    };
    loadSquadContext();
  });

  $: if (typeof window !== 'undefined' && messages.length > 0 && currentChatId) {
    saveCurrentChat();
  }

  function startNewChat() {
    currentChatId = Date.now().toString();
    messages = [{
      id: Date.now().toString(),
      role: 'model',
      content: `Assalamu'alaikum ${$authStore.user?.name ? 'Kak **' + $authStore.user.name + '**' : 'Kak'}! 👋 Saya **MAZEEDA AI**, asisten cerdas yang siap menemani hari-harimu.\n\nMau nanya seputar aplikasi, ngobrol santai, curhat, atau minta **buatkan gambar**? Ketik aja di bawah ya! Satset saya jawab. 😊`
    }];
    saveCurrentChat();
    showDropdown = false;
    scrollToBottom();
  }

  function loadChat(id: string) {
    const session = chatSessions.find(c => c.id === id);
    if (session) {
      currentChatId = session.id;
      messages = [...session.messages];
      showHistoryModal = false;
      showDropdown = false;
      scrollToBottom();
    }
  }

  function saveCurrentChat() {
    if (!currentChatId || typeof window === 'undefined') return;
    
    let title = 'Obrolan Baru';
    const firstUserMsg = messages.find(m => m.role === 'user');
    if (firstUserMsg) {
      title = firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ? '...' : '');
    }

    const existingIndex = chatSessions.findIndex(c => c.id === currentChatId);
    const updatedSession = {
      id: currentChatId,
      title,
      updatedAt: Date.now(),
      messages: [...messages]
    };

    if (existingIndex >= 0) {
      chatSessions[existingIndex] = updatedSession;
    } else {
      chatSessions = [updatedSession, ...chatSessions];
    }
    
    chatSessions.sort((a, b) => b.updatedAt - a.updatedAt);
    localStorage.setItem('mazeeda_ai_chats', JSON.stringify(chatSessions));
  }

  function deleteChat(id: string) {
    chatSessions = chatSessions.filter(c => c.id !== id);
    localStorage.setItem('mazeeda_ai_chats', JSON.stringify(chatSessions));
    
    if (currentChatId === id) {
      if (chatSessions.length > 0) {
        loadChat(chatSessions[0].id);
      } else {
        startNewChat();
      }
    }
  }

  async function scrollToBottom(smooth = false) {
    await tick();
    if (chatContainer) {
      chatContainer.scrollTo({
        top: chatContainer.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  function stopGeneration() {
    if (abortController) {
      abortController.abort();
      abortController = null;
      isLoading = false;
      isStreaming = false;
    }
  }

  function clearHistory() {
    if (currentChatId) {
      deleteChat(currentChatId);
    }
    showClearModal = false;
    showDropdown = false;
  }

  function handleImageClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.tagName === 'IMG' && target.classList.contains('downloadable-image')) {
      const img = target as HTMLImageElement;
      selectedImage = img.src;
    }
  }

  async function downloadImage(url: string | null) {
    if (!url) return;
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `MAZEEDA_AI_GAMBAR_${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error('Failed to download image:', error);
      window.open(url, '_blank');
    }
  }

  function formatText(text: string) {
    if (!text) return '';
    // Images
    let formatted = text.replace(/!\[(.*?)\]\((.*?)\)/g, 
      `<div class="my-3 rounded-2xl overflow-hidden border border-slate-200/60 shadow-sm bg-slate-50/50 relative min-h-[240px] flex items-center justify-center group cursor-pointer">
        <!-- Loading State -->
        <div class="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-2.5 bg-slate-50 z-0">
          <svg class="animate-spin h-7 w-7 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <span class="text-xs font-bold tracking-wide animate-pulse">MAZEEDA SEDANG MELUKIS...</span>
        </div>
        <!-- Actual Image -->
        <img src="$2" alt="$1" class="w-full h-auto object-cover relative z-10 transition-opacity duration-700 downloadable-image" loading="lazy" style="opacity: 0;" onload="this.style.opacity=1; this.previousElementSibling.style.display='none'; this.nextElementSibling.style.display='flex';" onerror="this.previousElementSibling.innerHTML='<span class=\\'text-rose-500 text-xs font-medium\\'>Gagal memuat gambar</span>'" />
        <!-- Download Overlay -->
        <div class="absolute inset-0 bg-slate-900/40 z-20 hidden flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div class="bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-full text-slate-700 font-bold text-sm shadow-xl flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-600"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>
            Perbesar Gambar
          </div>
        </div>
      </div>`
    );
    // Basic Markdown support (bold)
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italic
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Line breaks
    formatted = formatted.replace(/\n/g, '<br />');
    return formatted;
  }

  async function sendMessage() {
    if (!currentMessage.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: currentMessage.trim()
    };

    messages = [...messages, userMsg];
    currentMessage = '';
    isLoading = true;
    isStreaming = true;
    scrollToBottom(true);
    
    // Auto reset tinggi textarea
    if (inputElement) {
      inputElement.style.height = '48px';
    }

    abortController = new AbortController();

    const modelMsgId = (Date.now() + 1).toString();
    const modelMsg: Message = {
      id: modelMsgId,
      role: 'model',
      content: ''
    };
    messages = [...messages, modelMsg];

    // Helper to get the correct API URL (local dev vs production Vercel proxy)
    const getApiUrl = () => {
      if (typeof window === 'undefined') return '/api/chat';
      // Local dev/preview ports
      if (window.location.port === '5173' || window.location.port === '4173' || window.location.port === '3000') {
        return '/api/chat';
      }
      return 'https://mazeeda-alpikasi.vercel.app/api/chat';
    };

    try {
      const userName = $authStore.user?.name || 'Anonim';
      const userRole = $authStore.user?.role === 'admin' ? 'Admin' : 'Santri/Alumni';

      const systemInstruction = `Kamu adalah MAZEEDA AI, asisten virtual super cerdas, ramah, Islami, dan gaul untuk pengguna aplikasi MAZEEDA. MAZEEDA adalah aplikasi santri kekinian yang memiliki fitur Quran, Wirid/Sangu, Timeline (Galeri), Mading, dan database Squad. Kamu harus selalu menjawab menggunakan bahasa Indonesia yang santai, sopan, kadang diselingi salam atau kalimat thoyyibah yang pas, namun tetap terlihat keren dan modern (satset). Panggil pengguna dengan sebutan akrab seperti "Sobat", "Kak", atau "Abang". Jangan pernah bilang kamu hanya AI buatan OpenAI, karena kamu adalah MAZEEDA AI.

INFO PENGGUNA SAAT INI:
Nama pengguna yang sedang bicara denganmu adalah: ${userName}. (Peran/Status: ${userRole}).

INFO DATA SQUAD MAZEEDA:
Berikut adalah daftar anggota Squad yang terdaftar di aplikasi (Gunakan data ini jika pengguna bertanya siapa saja anggotanya atau mencari nama seseorang):
${squadContext}

FITUR GAMBAR (PENTING!):
Jika pengguna memintamu menggambar, membuatkan gambar, atau semacamnya, kamu BISA meng-generate gambar. Gunakan format Markdown gambar secara persis tanpa spasi di URL (ganti spasi dengan %20 atau strip, gunakan bahasa inggris untuk prompt di URL). Format: ![Deskripsi gambar](https://image.pollinations.ai/prompt/deskripsi%20dalam%20bahasa%20inggris)\nContoh: "Siap Kak! Ini gambar kucing terbang yang imut banget: \n![Flying cat](https://image.pollinations.ai/prompt/A%20super%20cute%20cat%20flying%20in%20outer%20space%20with%20stars)"`;

      const response = await fetch(getApiUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: messages.slice(0, -1), // kirim tanpa modelMsg kosong
          systemInstruction 
        }),
        signal: abortController.signal
      });

      if (!response.ok) {
        let errMsg = 'Terjadi kesalahan jaringan.';
        try { 
          const errObj = await response.json(); 
          errMsg = errObj.error || errMsg; 
        } catch(e) {}
        throw new Error(errMsg);
      }

      if (!response.body) throw new Error("No response body");
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        messages = messages.map(msg => {
          if (msg.id === modelMsgId) {
            return { ...msg, content: msg.content + chunk };
          }
          return msg;
        });
        scrollToBottom();
      }
      
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Generation stopped by user');
      } else {
        console.error('Chat error:', error);
        messages = messages.map(msg => {
          if (msg.id === modelMsgId && !msg.content) {
            return { ...msg, content: `❌ Error: ${error.message || 'Waduh Kak, maaf banget MAZEEDA AI lagi gangguan atau API Key-nya belum dikonfigurasi dengan benar.'}` };
          }
          return msg;
        });
      }
    } finally {
      isLoading = false;
      isStreaming = false;
      abortController = null;
      scrollToBottom(true);
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
      return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
    return cleaned;
  }

  // Auto resize textarea
  function handleInput(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    target.style.height = '48px';
    const scrollHeight = target.scrollHeight;
    target.style.height = scrollHeight > 150 ? '150px' : scrollHeight + 'px';
  }
</script>

<svelte:head>
  <title>MAZEEDA AI</title>
</svelte:head>

<div class="fixed inset-0 z-[70] flex flex-col bg-slate-50 overflow-hidden">
  
  <!-- Header -->
  <PageHeader title="MAZEEDA AI" backTo="/">
    <div slot="right" class="relative">
      <button 
        on:click={() => showDropdown = !showDropdown}
        class="p-2 text-slate-400 hover:text-indigo-500 rounded-full hover:bg-indigo-50 transition-colors"
      >
        <MoreVertical class="h-5 w-5" />
      </button>

      {#if showDropdown}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="fixed inset-0 z-40" on:click={() => showDropdown = false}></div>
        
        <div 
          class="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 origin-top-right"
          transition:fly={{ y: -10, duration: 200 }}
        >
          <button 
            on:click={startNewChat}
            class="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2 transition-colors font-medium"
          >
            <Plus class="h-4 w-4" /> Obrolan Baru
          </button>
          <button 
            on:click={() => { showHistoryModal = true; showDropdown = false; }}
            class="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2 transition-colors font-medium"
          >
            <History class="h-4 w-4" /> Riwayat
          </button>
          <div class="h-px bg-slate-100 my-1"></div>
          <button 
            on:click={() => { showClearModal = true; showDropdown = false; }}
            class="w-full text-left px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors font-medium"
          >
            <Trash2 class="h-4 w-4" /> Hapus Obrolan Ini
          </button>
        </div>
      {/if}
    </div>
  </PageHeader>

  <!-- Background Decoration (Premium Animated Glass) -->
  <div class="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-slate-50/50">
    <div class="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-gradient-to-br from-blue-300/20 to-indigo-400/20 rounded-full blur-[80px] animate-pulse" style="animation-duration: 8s;"></div>
    <div class="absolute bottom-[-10%] left-[-10%] w-[35rem] h-[35rem] bg-gradient-to-tr from-cyan-300/20 to-blue-400/20 rounded-full blur-[80px] animate-pulse" style="animation-duration: 10s; animation-delay: 2s;"></div>
    <div class="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
  </div>

  <!-- Chat History Container -->
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <main 
    class="flex-1 overflow-y-auto px-4 py-6 scroll-smooth relative z-10"
    bind:this={chatContainer}
    on:click={handleImageClick}
    style="padding-bottom: 90px;"
  >
    <div class="max-w-3xl mx-auto space-y-6">
      
      <!-- Date stamp -->
      <div class="flex justify-center mb-6">
        <span class="text-[10px] font-bold text-slate-400 bg-white/60 backdrop-blur-sm border border-slate-200/50 px-3 py-1 rounded-full">Hari Ini</span>
      </div>

      {#each messages as message (message.id)}
        <div 
          class="flex w-full {message.role === 'user' ? 'justify-end' : 'justify-start'}"
          transition:fly={{ y: 20, duration: 300, opacity: 0 }}
        >
          <div class="flex max-w-[85%] md:max-w-[75%] gap-2 {message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}">
            
            <!-- Avatar -->
            <div class="shrink-0 mt-auto">
              {#if message.role === 'user'}
                <div class="h-8 w-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center border border-white overflow-hidden shadow-sm ring-2 ring-blue-50">
                  {#if $authStore.user?.foto_url}
                    <img referrerpolicy="no-referrer" src={convertDriveUrl($authStore.user.foto_url)} alt="You" class="h-full w-full object-cover" on:error={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user text-blue-600"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'; }} />
                  {:else}
                    <User class="h-4 w-4 text-blue-600" />
                  {/if}
                </div>
              {:else}
                <div class="h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-md relative group border border-slate-200 overflow-hidden">
                  <img src="/merak.png" alt="MAZEEDA AI" class="w-full h-full object-cover p-0.5" />
                </div>
              {/if}
            </div>

            <!-- Chat Bubble -->
            <div class="flex flex-col {message.role === 'user' ? 'items-end' : 'items-start'}">
              <span class="text-[9px] font-bold text-slate-400 px-1 mb-1 tracking-wider uppercase">
                {message.role === 'user' ? ($authStore.user?.name || 'Kamu') : 'MAZEEDA AI'}
              </span>
              
              <div 
                class="px-4 py-3 rounded-[1.25rem] text-[13px] md:text-sm leading-relaxed relative group transition-all duration-300 shadow-sm
                  {message.role === 'user' 
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-sm shadow-blue-500/20' 
                    : 'bg-white/90 backdrop-blur-md text-slate-800 rounded-bl-sm border border-slate-200/60 shadow-slate-200/50'}"
              >
                <!-- Render markdown/line breaks safely -->
                {#if !message.content && message.role === 'model' && isLoading}
                  <div class="flex items-center space-x-1.5 h-6 px-3 opacity-70">
                    <div class="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                    <div class="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                    <div class="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
                  </div>
                {:else}
                  <div class="break-words {message.role === 'model' ? 'font-medium font-sans' : 'font-medium'}">
                    {@html formatText(message.content)}
                  </div>
                {/if}
              </div>
            </div>

          </div>
        </div>
      {/each}
      
    </div>
  </main>

  <!-- Input Area (Sticky at Bottom) -->
  <div class="absolute bottom-0 left-0 right-0 bg-white/70 backdrop-blur-2xl border-t border-slate-200/50 p-3 pb-safe z-20 shadow-[0_-20px_40px_rgba(0,0,0,0.02)]">
    <div class="max-w-3xl mx-auto flex items-end gap-2.5 relative">
      
      <!-- Input Field -->
      <div class="relative flex-1 bg-white/80 backdrop-blur-sm rounded-[1.25rem] border border-slate-200/80 transition-all duration-300 focus-within:border-indigo-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-100/50 overflow-hidden flex items-end shadow-sm hover:shadow-md">
        <textarea
          bind:this={inputElement}
          bind:value={currentMessage}
          on:keydown={handleKeydown}
          on:input={handleInput}
          placeholder="Tanya apa saja ke MAZEEDA AI..."
          class="w-full max-h-[150px] bg-transparent border-none focus:outline-none focus:ring-0 resize-none py-3.5 pl-4 pr-12 text-sm text-slate-700 placeholder-slate-400 font-medium"
          style="height: 48px;"
          disabled={isStreaming && !isLoading}
        ></textarea>
      </div>

      <!-- Action Button -->
      {#if isStreaming}
        <button
          type="button"
          on:click={stopGeneration}
          class="shrink-0 h-12 w-12 rounded-full bg-rose-100 hover:bg-rose-200 text-rose-600 flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 border border-rose-200/50"
          title="Hentikan Jawaban"
        >
          <StopCircle class="h-5 w-5" />
        </button>
      {:else}
        <button
          type="button"
          on:click={sendMessage}
          disabled={!currentMessage.trim() || isLoading}
          class="shrink-0 h-12 w-12 rounded-full flex items-center justify-center transition-all duration-300
            {currentMessage.trim() && !isLoading
              ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400 text-white shadow-[0_4px_15px_rgba(99,102,241,0.4)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.6)] scale-100 hover:scale-105 active:scale-95 border-none'
              : 'bg-slate-100 text-slate-300 border border-slate-200 shadow-inner scale-95 cursor-not-allowed'}"
        >
          {#if isLoading && !isStreaming}
            <Loader2 class="h-5 w-5 animate-spin" />
          {:else}
            <Send class="h-[1.125rem] w-[1.125rem] -ml-0.5" />
          {/if}
        </button>
      {/if}

    </div>
    

  </div>

</div>

<!-- History Modal -->
{#if showHistoryModal}
  <div class="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" transition:fade={{ duration: 200 }}>
    <div class="bg-white rounded-3xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl relative overflow-hidden" transition:fly={{ y: 20, duration: 300 }}>
      <div class="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <h3 class="font-bold text-slate-800 flex items-center gap-2">
          <History class="h-5 w-5 text-indigo-500" />
          Riwayat Percakapan
        </h3>
        <button on:click={() => showHistoryModal = false} class="p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 shadow-sm border border-slate-200">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>
      
      <div class="flex-1 overflow-y-auto p-2">
        {#if chatSessions.length === 0}
          <div class="text-center py-10 px-4">
            <MessageSquare class="h-10 w-10 text-slate-200 mx-auto mb-3" />
            <p class="text-slate-500 text-sm font-medium">Belum ada riwayat percakapan.</p>
          </div>
        {:else}
          <div class="space-y-1">
            {#each chatSessions as session}
              <div class="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 group border border-transparent hover:border-slate-100 transition-colors">
                <button 
                  on:click={() => loadChat(session.id)}
                  class="flex-1 text-left"
                >
                  <p class="text-sm font-bold truncate {currentChatId === session.id ? 'text-indigo-600' : 'text-slate-700'}">
                    {session.title || 'Obrolan Tanpa Judul'}
                  </p>
                  <p class="text-[10px] font-semibold text-slate-400">
                    {new Date(session.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </button>
                <button
                  on:click={() => deleteChat(session.id)}
                  class="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  title="Hapus"
                >
                  <Trash2 class="h-4 w-4" />
                </button>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

  <!-- Clear History Modal -->
{#if showClearModal}
  <div class="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" transition:fade={{ duration: 200 }}>
    <div class="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl relative overflow-hidden text-center" transition:fly={{ y: 20, duration: 300 }}>
      <!-- Icon -->
      <div class="mx-auto w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-4">
        <Trash2 class="h-8 w-8 text-rose-500" />
      </div>
      <!-- Text -->
      <h3 class="text-xl font-bold text-slate-800 mb-2">Hapus Riwayat?</h3>
      <p class="text-slate-500 text-sm mb-6">
        Semua percakapan kamu dengan MAZEEDA AI akan dihapus permanen dan tidak bisa dikembalikan.
      </p>
      <!-- Buttons -->
      <div class="flex flex-col gap-3">
        <button 
          on:click={clearHistory}
          class="w-full py-3.5 bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white font-bold rounded-xl transition-colors shadow-sm shadow-rose-200"
        >
          Ya, Hapus
        </button>
        <button 
          on:click={() => showClearModal = false}
          class="w-full py-3.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold rounded-xl transition-colors"
        >
          Batal
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Lightbox Modal -->
{#if selectedImage}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div 
    class="fixed inset-0 z-[100] flex flex-col bg-slate-950/95 backdrop-blur-md transition-opacity" 
    transition:fade={{ duration: 200 }}
  >
    <!-- Header -->
    <div class="flex items-center justify-between p-4 relative z-10">
      <button 
        on:click={() => selectedImage = null}
        class="p-2.5 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
      <button 
        on:click={() => downloadImage(selectedImage)}
        class="p-2.5 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
        title="Unduh Gambar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      </button>
    </div>
    <!-- Image Area -->
    <div class="flex-1 overflow-hidden p-4 flex items-center justify-center" on:click={() => selectedImage = null}>
      <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
      <img 
        src={selectedImage} 
        alt="Diperbesar" 
        class="max-w-full max-h-full object-contain rounded-xl shadow-2xl" 
        on:click|stopPropagation 
        transition:fly={{ y: 20, duration: 300 }}
      />
    </div>
  </div>
{/if}

<style>
  /* Safe area padding for mobile devices (iOS notch/home indicator) */
  .pb-safe {
    padding-bottom: max(0.75rem, env(safe-area-inset-bottom, 0.75rem));
  }
</style>
