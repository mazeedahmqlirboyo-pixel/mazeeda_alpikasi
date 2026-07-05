<script lang="ts">
  import { onMount, tick, onDestroy } from 'svelte';
  import { fade, slide, fly } from 'svelte/transition';
  import PageHeader from '$lib/components/ui/PageHeader.svelte';
  import { Send, Bot, User, Loader2, Sparkles, AlertCircle, Trash2, StopCircle } from 'lucide-svelte';
  import { authStore } from '$lib/auth';

  interface Message {
    id: string;
    role: 'user' | 'model';
    content: string;
  }

  let messages: Message[] = [];
  let currentMessage = '';
  let isLoading = false;
  let chatContainer: HTMLElement;
  let inputElement: HTMLTextAreaElement;
  let abortController: AbortController | null = null;
  let isStreaming = false;
  let showClearModal = false;

  onMount(() => {
    // Muat riwayat chat dari localStorage jika ada
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('mazeeda_ai_history');
      if (stored) {
        try {
          messages = JSON.parse(stored);
          scrollToBottom();
        } catch (e) {
          console.error('Failed to parse chat history');
        }
      }
      
      // Pesan pembuka jika kosong
      if (messages.length === 0) {
        messages = [{
          id: Date.now().toString(),
          role: 'model',
          content: `Assalamu'alaikum Kak! 👋 Saya **MAZEEDA AI**, asisten cerdas yang siap menemani hari-harimu.\n\nMau nanya seputar aplikasi, ngobrol santai, atau butuh teman curhat? Ketik aja di bawah ya! Satset saya jawab. 😊`
        }];
      }
    }
  });

  // Simpan ke localstorage setiap kali messages berubah
  $: if (typeof window !== 'undefined' && messages.length > 0) {
    localStorage.setItem('mazeeda_ai_history', JSON.stringify(messages));
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
    messages = [{
      id: Date.now().toString(),
      role: 'model',
      content: `Assalamu'alaikum Kak! 👋 Saya MAZEEDA AI. Riwayat obrolan kita sudah dibersihkan ya.`
    }];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mazeeda_ai_history');
    }
    showClearModal = false;
  }

  function formatText(text: string) {
    if (!text) return '';
    // Basic Markdown support (bold)
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
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

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messages.slice(0, -1) }), // kirim tanpa modelMsg kosong
        signal: abortController.signal
      });

      if (!response.ok) {
        let errMsg = 'Terjadi kesalahan jaringan.';
        try { const errObj = await response.json(); errMsg = errObj.error || errMsg; } catch(e) {}
        throw new Error(errMsg);
      }

      if (!response.body) throw new Error("No response body");
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        // Update pesan terakhir (pesan model) dengan chunk baru
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

<div class="flex flex-col h-[100dvh] bg-slate-50 relative overflow-hidden">
  
  <!-- Header -->
  <PageHeader title="MAZEEDA AI" backTo="/">
    <div slot="right">
      <button 
        on:click={() => showClearModal = true}
        class="p-2 text-slate-400 hover:text-rose-500 rounded-full hover:bg-rose-50 transition-colors"
        title="Bersihkan riwayat obrolan"
      >
        <Trash2 class="h-5 w-5" />
      </button>
    </div>
  </PageHeader>

  <!-- Background Decoration (Premium Animated Glass) -->
  <div class="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-slate-50/50">
    <div class="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-gradient-to-br from-blue-300/20 to-indigo-400/20 rounded-full blur-[80px] animate-pulse" style="animation-duration: 8s;"></div>
    <div class="absolute bottom-[-10%] left-[-10%] w-[35rem] h-[35rem] bg-gradient-to-tr from-cyan-300/20 to-blue-400/20 rounded-full blur-[80px] animate-pulse" style="animation-duration: 10s; animation-delay: 2s;"></div>
    <div class="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
  </div>

  <!-- Chat History Container -->
  <main 
    class="flex-1 overflow-y-auto px-4 py-6 scroll-smooth relative z-10"
    bind:this={chatContainer}
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
          class="shrink-0 h-12 w-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-md border border-white/20
            {currentMessage.trim() && !isLoading
              ? 'bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white scale-100 hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/30 active:scale-95'
              : 'bg-slate-200 text-slate-400 scale-95 cursor-not-allowed'}"
        >
          {#if isLoading && !isStreaming}
            <Loader2 class="h-5 w-5 animate-spin" />
          {:else}
            <Send class="h-5 w-5 translate-x-0.5" />
          {/if}
        </button>
      {/if}

    </div>
    
    <!-- Footer watermark -->
    <div class="text-center mt-2.5 mb-1 hidden md:block">
      <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Didukung oleh Google Gemini AI</span>
    </div>
  </div>

</div>

<!-- Clear History Modal -->
{#if showClearModal}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" transition:fade={{ duration: 200 }}>
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
          Ya, Hapus Semua
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

<style>
  /* Safe area padding for mobile devices (iOS notch/home indicator) */
  .pb-safe {
    padding-bottom: max(0.75rem, env(safe-area-inset-bottom, 0.75rem));
  }
</style>
