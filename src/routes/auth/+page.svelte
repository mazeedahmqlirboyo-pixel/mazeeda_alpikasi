<script lang="ts">
  import { fade, fly, slide, scale } from 'svelte/transition';
  import { onMount } from 'svelte';
  import Button from '$lib/components/ui/button.svelte';
  import Input from '$lib/components/ui/input.svelte';
  import { supabase } from '$lib/supabase';
  import { authStore, loginAsStudent, loginAsAdmin, logout } from '$lib/auth';
  import { User, Hash, LogOut, ArrowRight, ShieldCheck, UserCheck, Instagram, Youtube, Rss, MessageCircle, AlertCircle, CheckCircle2, Eye, EyeOff, Search, X } from 'lucide-svelte';

  // State management
  let nis = '';
  let namaAyah = '';
  let loading = false;
  let message = { type: '', content: '' }; // { type: 'success' | 'error', content: string }
  let focusedInput = '';
  let showPassword = false;
  let rememberMe = true;

  // Lupa NIS State
  let showLupaNisModal = false;
  let searchNamaLengkap = '';
  let searchTempatLahir = '';
  let isSearchingNis = false;
  let searchNisMessage = { type: '', content: '' };

  // Guest Feedback State
  let showGuestFeedbackModal = false;
  let guestFeedbackName = '';
  let guestFeedbackMessage = '';
  let isSubmittingGuestFeedback = false;
  let guestFeedbackSuccess = false;
  let guestFeedbackError = '';

  async function submitGuestFeedback() {
    if (!guestFeedbackName.trim() || !guestFeedbackMessage.trim()) return;
    
    isSubmittingGuestFeedback = true;
    guestFeedbackError = '';
    
    try {
      const userName = guestFeedbackName.trim() + " (Tamu)";
      const message = guestFeedbackMessage.trim();
      
      const { error } = await supabase.from('feedbacks').insert([{
        user_name: userName,
        message: message,
        user_id: null
      }]);
      
      if (error) throw error;
      
      // Notify Admin
      await supabase.from('app_notifications').insert([{
        target_user: 'admin_role',
        title: 'Saran Baru (Tamu)',
        message: `Ada saran baru dari ${userName}. Cek di Kotak Saran!`,
        type: 'info',
        is_active: true
      }]);
      
      guestFeedbackSuccess = true;
      guestFeedbackName = '';
      guestFeedbackMessage = '';
      setTimeout(() => {
        showGuestFeedbackModal = false;
        guestFeedbackSuccess = false;
      }, 2500);
    } catch (err) {
      console.error("Gagal mengirim saran:", err);
      guestFeedbackError = "Gagal mengirim masukan. Pastikan koneksi internet Anda stabil.";
    } finally {
      isSubmittingGuestFeedback = false;
    }
  }

  onMount(() => {
    const savedNis = localStorage.getItem('mazeeda_remembered_nis');
    if (savedNis) {
      nis = savedNis;
      rememberMe = true;
    }
  });

  // Mascot Interactive State
  let peacockState = 'idle'; // 'idle', 'angry', 'laughing', 'sad', 'loading'
  let mouseX = 0;
  let mouseY = 0;

  function handleMouseMove(event: MouseEvent | TouchEvent) {
    if (peacockState !== 'idle' || focusedInput) return;
    const clientX = 'touches' in event ? event.touches[0].clientX : (event as MouseEvent).clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : (event as MouseEvent).clientY;
    
    // Normalize to -1 to 1 based on screen size
    mouseX = (clientX / window.innerWidth) * 2 - 1;
    mouseY = (clientY / window.innerHeight) * 2 - 1;
  }

  // Form methods
  async function handleAuthSubmit() {
    loading = true;
    peacockState = 'loading';
    message = { type: '', content: '' };

    // Paksa delay 3 detik agar animasi loading terlihat (meskipun aslinya cepat)
    await new Promise(resolve => setTimeout(resolve, 3000));

    try {
      const inputNIS = nis.trim();
      const inputNamaAyah = namaAyah.trim().toUpperCase();

      if (!inputNIS || !inputNamaAyah) {
        throw new Error('Semua kolom wajib diisi dengan benar!');
      }

      if (inputNIS === 'admin@mazeeda.com') {
        // Admin Login
        const { error } = await supabase.auth.signInWithPassword({
          email: 'admin@mazeeda.com',
          password: inputNamaAyah
        });

        if (error) throw error;

        loginAsAdmin();
        
        if (rememberMe) {
          localStorage.setItem('mazeeda_remembered_nis', inputNIS);
        } else {
          localStorage.removeItem('mazeeda_remembered_nis');
        }

        message = { type: 'success', content: 'Login admin berhasil!' };
        window.location.href = '/';
      } else {
        if (inputNIS.length !== 6) {
          throw new Error('NIS harus terdiri dari tepat 6 digit angka!');
        }

        // Santri / Alumni Login - check allowed_alumni first
        let { data, error } = await supabase
          .from('allowed_alumni')
          .select('*')
          .eq('nis', inputNIS);

        let tableName = 'allowed_alumni';

        if (error) throw error;
        
        // If not found in squad, check asatidzah
        if (!data || data.length === 0) {
          const asatidzahRes = await supabase
            .from('asatidzah')
            .select('*')
            .eq('nis', inputNIS);
            
          if (asatidzahRes.error) throw asatidzahRes.error;
          data = asatidzahRes.data;
          tableName = 'asatidzah';
        }

        if (!data || data.length === 0) {
          throw new Error('Nomor Induk Santri (NIS) tidak ditemukan!');
        }

        const match = data.find(
          (m: any) => m.nama_ayah?.toLowerCase().trim() === inputNamaAyah.toLowerCase()
        );

        if (!match) {
          throw new Error('Nama ayah kandung tidak sesuai!');
        }

        if (match.is_active === false) {
          throw new Error('Akun Anda telah dinonaktifkan oleh Admin MAZEEDA. Silakan hubungi pengurus jika ini adalah kesalahan.');
        }

        // Update login status
        try {
          await supabase
            .from(tableName)
            .update({
              has_logged_in: true,
              last_login: new Date().toISOString()
            })
            .eq('id', match.id);
        } catch (dbErr) {
          console.warn('Gagal mencatat status login:', dbErr);
        }

        loginAsStudent({
          name: match.nama_lengkap,
          email: match.email,
          nis: match.nis,
          nama_ayah: match.nama_ayah,
          foto_url: match.foto_url,
          tahun_lahir: match.tahun_lahir
        });

        if (rememberMe) {
          localStorage.setItem('mazeeda_remembered_nis', inputNIS);
        } else {
          localStorage.removeItem('mazeeda_remembered_nis');
        }

        peacockState = 'laughing';
        message = { type: 'success', content: `Selamat datang kembali, ${match.nama_lengkap}!` };
        window.location.href = '/';
      }
    } catch (err: any) {
      peacockState = 'sad';
      setTimeout(() => peacockState = 'idle', 3000);
      
      let errorMsg = err.message || 'Terjadi kesalahan sistem';
      
      // Translasi pesan error bahasa Inggris (khususnya dari Supabase untuk Admin) ke Bahasa Indonesia
      if (errorMsg.toLowerCase().includes('invalid login credentials')) {
        errorMsg = 'Kredensial login tidak valid. Pastikan password Anda benar.';
      } else if (errorMsg.toLowerCase().includes('failed to fetch')) {
        errorMsg = 'Gagal memuat. Silakan periksa koneksi internet Anda.';
      } else if (errorMsg.toLowerCase().includes('user not found')) {
        errorMsg = 'Akun Admin tidak ditemukan.';
      }

      message = { type: 'error', content: errorMsg };
    } finally {
      loading = false;
    }
  }

  async function handleLogout() {
    loading = true;
    try {
      await logout();
    } catch (err: any) {
      message = { type: 'error', content: 'Gagal keluar: ' + err.message };
      loading = false;
    }
  }

  async function handleCariNIS() {
    isSearchingNis = true;
    searchNisMessage = { type: '', content: '' };
    
    try {
      if (!searchNamaLengkap || searchNamaLengkap.trim().length < 3 || !searchTempatLahir) {
        throw new Error('Nama Lengkap (min. 3 huruf) dan Tempat Lahir wajib diisi!');
      }

      // Search in allowed_alumni
      let { data, error } = await supabase
        .from('allowed_alumni')
        .select('nis, nama_lengkap, tempat_lahir')
        .ilike('nama_lengkap', `%${searchNamaLengkap.trim()}%`)
        .ilike('tempat_lahir', `%${searchTempatLahir.trim()}%`);

      if (error) throw error;

      if (!data || data.length === 0) {
        // Search in asatidzah
        const asatidzahRes = await supabase
          .from('asatidzah')
          .select('nis, nama_lengkap, tempat_lahir')
          .ilike('nama_lengkap', `%${searchNamaLengkap.trim()}%`)
          .ilike('tempat_lahir', `%${searchTempatLahir.trim()}%`);
          
        if (asatidzahRes.error) throw asatidzahRes.error;
        data = asatidzahRes.data;
      }

      if (!data || data.length === 0) {
        throw new Error('Data tidak ditemukan. Pastikan ketikan sudah sesuai data sekolah/pondok atau hubungi Admin.');
      }

      const foundNis = data[0].nis;
      
      // Auto-fill and close
      nis = foundNis;
      showLupaNisModal = false;
      searchNamaLengkap = '';
      searchTempatLahir = '';
      
      // Give feedback and focus on password
      message = { type: 'success', content: `NIS ditemukan dan otomatis terisi! Silakan masukkan Nama Ayah untuk login.` };
      
      setTimeout(() => {
         const psw = document.getElementById('namaAyah');
         if (psw) psw.focus();
      }, 100);
      
    } catch (err: any) {
      searchNisMessage = { type: 'error', content: err.message || 'Terjadi kesalahan sistem.' };
    } finally {
      isSearchingNis = false;
    }
  }
</script>

<!-- Menggunakan fixed inset-0 untuk menutupi seluruh layar tanpa terpengaruh padding dari +layout.svelte -->
<div class="fixed inset-0 z-50 flex bg-white font-sans text-slate-800 overflow-y-auto lg:overflow-hidden hide-scrollbar" in:fade={{ duration: 500 }} on:mousemove={handleMouseMove} on:touchmove={handleMouseMove}>
  
  <!-- Sisi Kiri: Visual / Branding (Desktop Only) -->
  <div class="hidden lg:flex lg:w-1/2 relative bg-slate-900 items-center justify-center overflow-hidden">
    <!-- Background Image / Gradient Layer -->
    <div class="absolute inset-0 z-0">
      <div class="absolute inset-0 bg-gradient-to-br from-indigo-600 via-primary to-purple-800 opacity-90"></div>
      <div class="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
    </div>
    
    <!-- Ornamen Lingkaran -->
    <div class="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
    <div class="absolute bottom-10 right-10 w-72 h-72 bg-indigo-400/20 rounded-full blur-2xl"></div>

    <div class="relative z-10 text-center text-white px-12" in:fade={{ delay: 200, duration: 800 }}>
      <div class="inline-flex items-center justify-center w-24 h-24 rounded-2xl shadow-xl shadow-indigo-900/20 mb-8 overflow-hidden bg-white border border-white/20">
        <img src="/logo.png" alt="MAZEEDA Logo" class="w-full h-full object-cover" />
      </div>
      <h1 class="text-4xl xl:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
        Selamat Datang di <br/> 
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-100">Portal MAZEEDA</span>
      </h1>
      <p class="text-lg xl:text-xl text-indigo-100/80 font-medium max-w-md mx-auto leading-relaxed">
        Aplikasi Manajemen & Informasi Komunitas berbasis modern untuk menjalin silaturahmi yang lebih erat.
      </p>
    </div>
  </div>

  <!-- Sisi Kanan: Form Login (Full Putih di Mobile, Solid di Desktop) -->
  <div class="w-full lg:w-1/2 relative flex items-center justify-center p-6 sm:p-12 min-h-[700px] lg:min-h-0 lg:h-full overflow-y-auto bg-white hide-scrollbar">
    
    <div class="relative z-10 w-full max-w-md my-auto py-8">
      {#if $authStore.user}
        <!-- Tampilan Jika Sudah Login -->
        <div class="bg-white lg:border-slate-100 lg:shadow-2xl rounded-3xl p-4 sm:p-8 text-center" in:fly={{ y: 20, duration: 600 }}>
          <div class="inline-flex items-center justify-center w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full mb-6 ring-4 ring-white shadow-inner">
            <UserCheck class="w-10 h-10" />
          </div>
          <h2 class="text-2xl font-bold text-slate-800 mb-2">Sesi Masih Aktif</h2>
          <p class="text-sm text-slate-500 mb-6 font-medium">Anda sudah login sebagai <strong>{$authStore.user.name}</strong></p>

          <div class="space-y-3">
            <a href="/" class="block">
              <Button class="w-full py-6 text-base font-semibold shadow-md hover:shadow-lg transition-all rounded-xl">
                Masuk ke Dashboard
              </Button>
            </a>
            <Button 
              variant="outline" 
              class="w-full py-6 text-rose-600 hover:bg-rose-50 border-rose-200 rounded-xl font-medium" 
              on:click={handleLogout}
              disabled={loading}
            >
              <LogOut class="w-4 h-4 mr-2" />
              {loading ? 'Memproses...' : 'Keluar Akun'}
            </Button>
          </div>
        </div>
      {:else}
        <!-- Tampilan Form Login -->
        <div class="bg-white rounded-3xl p-2 sm:p-10" in:fly={{ y: 20, duration: 600 }}>
          
          <!-- Animated Mascot & Header -->
          <div class="flex flex-col items-center text-center mb-8 lg:mb-10">
            
            <!-- CSS Animated Peacock Mascot (Interactive) -->
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div class="relative w-32 h-32 mb-6 cursor-pointer" on:click={() => { peacockState = 'angry'; setTimeout(() => peacockState = 'idle', 2000); }}>
              <!-- Tail Fan Background -->
              <div class="absolute inset-x-0 bottom-2 h-32 flex justify-center items-end z-0 transition-transform duration-700 {focusedInput === 'namaAyah' && !showPassword ? 'scale-110' : 'scale-100'} {peacockState === 'loading' ? 'animate-pulse scale-105' : ''}">
                <!-- Far Left -->
                <div class="absolute bottom-0 w-8 h-20 bg-emerald-500 rounded-full origin-bottom rotate-[-70deg] border-2 border-emerald-600 flex justify-center pt-1"><div class="w-3.5 h-4 bg-blue-600 rounded-full border-2 border-yellow-400"></div></div>
                <!-- Mid Left -->
                <div class="absolute bottom-0 w-8 h-28 bg-emerald-500 rounded-full origin-bottom rotate-[-42deg] border-2 border-emerald-600 flex justify-center pt-1.5"><div class="w-4 h-5 bg-blue-600 rounded-full border-2 border-yellow-400"></div></div>
                <!-- Center Left -->
                <div class="absolute bottom-0 w-8 h-32 bg-emerald-500 rounded-full origin-bottom rotate-[-14deg] border-2 border-emerald-600 flex justify-center pt-1.5"><div class="w-4 h-5 bg-blue-600 rounded-full border-2 border-yellow-400"></div></div>
                <!-- Center Right -->
                <div class="absolute bottom-0 w-8 h-32 bg-emerald-500 rounded-full origin-bottom rotate-[14deg] border-2 border-emerald-600 flex justify-center pt-1.5"><div class="w-4 h-5 bg-blue-600 rounded-full border-2 border-yellow-400"></div></div>
                <!-- Mid Right -->
                <div class="absolute bottom-0 w-8 h-28 bg-emerald-500 rounded-full origin-bottom rotate-[42deg] border-2 border-emerald-600 flex justify-center pt-1.5"><div class="w-4 h-5 bg-blue-600 rounded-full border-2 border-yellow-400"></div></div>
                <!-- Far Right -->
                <div class="absolute bottom-0 w-8 h-20 bg-emerald-500 rounded-full origin-bottom rotate-[70deg] border-2 border-emerald-600 flex justify-center pt-1"><div class="w-3.5 h-4 bg-blue-600 rounded-full border-2 border-yellow-400"></div></div>
              </div>

              <!-- Body & Head -->
              <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-24 bg-blue-600 rounded-t-full rounded-b-[24px] shadow-[inset_0_-8px_0_rgba(0,0,0,0.2)] z-10 transition-transform duration-300 {focusedInput === 'nis' ? 'translate-y-2' : ''}">
                
                <!-- Crown (Crest) -->
                <div class="absolute -top-5 left-1/2 -translate-x-1/2 flex space-x-1">
                  <div class="w-0.5 h-4 bg-slate-800 rotate-[-25deg] origin-bottom relative"><div class="absolute -top-1.5 -left-1 w-2.5 h-2.5 bg-blue-400 rounded-full"></div></div>
                  <div class="w-0.5 h-5 bg-slate-800 relative"><div class="absolute -top-1.5 -left-1 w-2.5 h-2.5 bg-blue-400 rounded-full"></div></div>
                  <div class="w-0.5 h-4 bg-slate-800 rotate-[25deg] origin-bottom relative"><div class="absolute -top-1.5 -left-1 w-2.5 h-2.5 bg-blue-400 rounded-full"></div></div>
                </div>

                <!-- Beak -->
                <div class="absolute top-10 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-yellow-400 z-20"></div>

                <!-- Eyes Container -->
                <div class="absolute top-5 left-1/2 -translate-x-1/2 w-10 h-4 flex justify-between px-0.5 z-10">
                  <!-- Left Eye -->
                  <div class="relative w-3.5 h-4 shadow-inner transition-all duration-300 {peacockState === 'angry' ? 'bg-yellow-300 scale-125 rounded-full overflow-hidden' : (peacockState === 'sad' ? 'bg-sky-100 scale-110 rounded-full overflow-hidden' : (peacockState === 'laughing' ? 'bg-transparent h-2 mt-1.5 border-t-[3px] border-slate-900 rounded-t-full shadow-none' : 'bg-white rounded-full overflow-hidden'))}">
                    {#if peacockState !== 'laughing'}
                      <div class="absolute w-2 h-2 rounded-full transition-all duration-100 {peacockState === 'angry' ? 'bg-rose-600 top-1 left-0.5 w-2.5 h-2.5' : (peacockState === 'sad' ? 'bg-slate-900 top-2 left-0.5 w-2 h-2' : (peacockState === 'loading' ? 'animate-spin border-[2px] border-slate-900 border-t-transparent bg-transparent w-3 h-3 top-0.5 left-[1px]' : 'bg-slate-900'))} 
                        {peacockState === 'idle' && focusedInput === 'nis' ? 'top-2 left-1' : (peacockState === 'idle' && focusedInput === 'namaAyah' ? 'top-0.5 left-1' : (peacockState === 'idle' ? 'top-1 left-1' : ''))}"
                        style={peacockState === 'idle' && !focusedInput ? `transform: translate(${mouseX * 6}px, ${mouseY * 4}px)` : ''}>
                      </div>
                    {/if}
                    <!-- Angry Eyebrow -->
                    {#if peacockState === 'angry'}
                      <div class="absolute -top-1 left-0 w-full h-2 bg-slate-900 rotate-[25deg] scale-150"></div>
                    {/if}
                    <!-- Sad Eyebrow -->
                    {#if peacockState === 'sad'}
                      <div class="absolute -top-1 left-0 w-full h-2 bg-slate-900 rotate-[-25deg] scale-150"></div>
                    {/if}
                  </div>
                  <!-- Right Eye -->
                  <div class="relative w-3.5 h-4 shadow-inner transition-all duration-300 {peacockState === 'angry' ? 'bg-yellow-300 scale-125 rounded-full overflow-hidden' : (peacockState === 'sad' ? 'bg-sky-100 scale-110 rounded-full overflow-hidden' : (peacockState === 'laughing' ? 'bg-transparent h-2 mt-1.5 border-t-[3px] border-slate-900 rounded-t-full shadow-none' : 'bg-white rounded-full overflow-hidden'))}">
                    {#if peacockState !== 'laughing'}
                      <div class="absolute w-2 h-2 rounded-full transition-all duration-100 {peacockState === 'angry' ? 'bg-rose-600 top-1 right-0.5 w-2.5 h-2.5' : (peacockState === 'sad' ? 'bg-slate-900 top-2 right-0.5 w-2 h-2' : (peacockState === 'loading' ? 'animate-spin border-[2px] border-slate-900 border-t-transparent bg-transparent w-3 h-3 top-0.5 right-[1px]' : 'bg-slate-900'))} 
                        {peacockState === 'idle' && focusedInput === 'nis' ? 'top-2 right-1' : (peacockState === 'idle' && focusedInput === 'namaAyah' ? 'top-0.5 right-1' : (peacockState === 'idle' ? 'top-1 right-1' : ''))}"
                        style={peacockState === 'idle' && !focusedInput ? `transform: translate(${mouseX * 6}px, ${mouseY * 4}px)` : ''}>
                      </div>
                    {/if}
                    <!-- Angry Eyebrow -->
                    {#if peacockState === 'angry'}
                      <div class="absolute -top-1 right-0 w-full h-2 bg-slate-900 rotate-[-25deg] scale-150"></div>
                    {/if}
                    <!-- Sad Eyebrow -->
                    {#if peacockState === 'sad'}
                      <div class="absolute -top-1 right-0 w-full h-2 bg-slate-900 rotate-[25deg] scale-150"></div>
                    {/if}
                  </div>
                </div>
                
                <!-- Laughing & Sad Tears -->
                {#if peacockState === 'laughing'}
                  <div class="absolute top-8 left-1 w-2 h-2.5 bg-blue-300 animate-bounce" style="border-radius: 0 50% 50% 50%; transform: rotate(45deg);"></div>
                  <div class="absolute top-8 right-1 w-2 h-2.5 bg-blue-300 animate-bounce" style="animation-delay: 0.1s; border-radius: 0 50% 50% 50%; transform: rotate(45deg);"></div>
                  <div class="absolute top-5 left-0 w-1.5 h-1.5 bg-sky-200 rounded-full animate-ping"></div>
                  <div class="absolute top-5 right-0 w-1.5 h-1.5 bg-sky-200 rounded-full animate-ping" style="animation-delay: 0.2s"></div>
                {/if}
                {#if peacockState === 'sad'}
                  <div class="absolute top-7 left-1.5 w-1.5 h-2.5 bg-blue-300 rounded-full animate-pulse" style="border-radius: 0 50% 50% 50%; transform: rotate(45deg);"></div>
                  <div class="absolute top-7 right-1.5 w-1.5 h-2.5 bg-blue-300 rounded-full animate-pulse" style="animation-delay: 0.5s; border-radius: 0 50% 50% 50%; transform: rotate(45deg);"></div>
                {/if}
              </div>

              <!-- Wings (Covering Eyes) -->
              <!-- Left Wing -->
              <div class="absolute bottom-0 left-1/2 w-7 h-12 bg-blue-500 rounded-full shadow-[inset_-2px_0_10px_rgba(0,0,0,0.1)] transition-all duration-500 z-20 origin-bottom 
                {focusedInput === 'namaAyah' 
                  ? (showPassword ? 'ml-[-40px] mb-8 rotate-[-70deg]' : 'ml-[-28px] mb-12 rotate-[30deg]') 
                  : 'ml-[-35px] mb-2 -rotate-12'} {peacockState === 'laughing' ? 'ml-[-40px] mb-4 -rotate-[30deg] animate-pulse' : ''} {peacockState === 'angry' ? 'bg-rose-700 ml-[-45px] mb-6 -rotate-45 scale-110' : ''} {peacockState === 'sad' ? 'ml-[-38px] mb-1 -rotate-[5deg] scale-95' : ''} {peacockState === 'loading' ? 'ml-[-40px] mb-6 -rotate-[50deg] animate-pulse' : ''}">
              </div>
              
              <!-- Right Wing -->
              <div class="absolute bottom-0 right-1/2 w-7 h-12 bg-blue-500 rounded-full shadow-[inset_2px_0_10px_rgba(0,0,0,0.1)] transition-all duration-500 z-20 origin-bottom 
                {focusedInput === 'namaAyah' 
                  ? (showPassword ? 'mr-[-40px] mb-8 rotate-[70deg]' : 'mr-[-28px] mb-12 rotate-[-30deg]') 
                  : 'mr-[-35px] mb-2 rotate-12'} {peacockState === 'laughing' ? 'mr-[-40px] mb-4 rotate-[30deg] animate-pulse' : ''} {peacockState === 'angry' ? 'bg-rose-700 mr-[-45px] mb-6 rotate-45 scale-110' : ''} {peacockState === 'sad' ? 'mr-[-38px] mb-1 rotate-[5deg] scale-95' : ''} {peacockState === 'loading' ? 'mr-[-40px] mb-6 rotate-[50deg] animate-pulse' : ''}">
              </div>
            </div>

            <div class="mt-4 mb-6 flex flex-col items-center">
              <h1 class="text-3xl lg:text-4xl font-extrabold tracking-[0.3em] text-slate-800 ml-[0.3em]">MAZEEDA</h1>
            </div>

            <h2 class="text-xl lg:text-2xl font-bold text-slate-800 tracking-tight">Masuk Akun</h2>
            <p class="text-sm text-slate-500 font-medium mt-1">Silakan isi data login Anda untuk melanjutkan.</p>
          </div>

          <!-- Alert Pesan -->
          {#if message.content}
            <div class="flex items-start p-4 mb-6 rounded-2xl text-sm font-semibold {message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}" in:slide>
              {#if message.type === 'success'}
                <CheckCircle2 class="w-5 h-5 mr-3 shrink-0" />
              {:else}
                <AlertCircle class="w-5 h-5 mr-3 shrink-0" />
              {/if}
              <span>{message.content}</span>
            </div>
          {/if}

          <!-- Form Element -->
          <form on:submit|preventDefault={handleAuthSubmit} class="space-y-5">
            
            <!-- Input NIS -->
            <div class="relative group" in:fly|global={{ y: 10, duration: 400, delay: 150 }}>
              <div class="relative overflow-hidden rounded-xl transition-all duration-300 {focusedInput === 'nis' ? 'ring-2 ring-primary ring-offset-1 -translate-y-1 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)]' : 'border border-slate-200 hover:border-slate-300'}">
                <div class="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center bg-slate-50 border-r border-slate-100 text-slate-400">
                  <Hash class="w-5 h-5 {focusedInput === 'nis' ? 'text-primary' : ''} transition-colors" />
                </div>
                <input 
                  id="nis" 
                  type="text" 
                  class="w-full bg-white pl-16 pr-4 py-3.5 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400 focus:bg-slate-50/50 transition-colors"
                  placeholder="NIS: 220412" 
                  bind:value={nis} 
                  on:focus={() => focusedInput = 'nis'}
                  on:blur={() => focusedInput = ''}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <!-- Input Nama Ayah -->
            <div class="relative group mt-5" in:fly|global={{ y: 10, duration: 400, delay: 250 }}>
              <div class="relative overflow-hidden rounded-xl transition-all duration-300 {focusedInput === 'namaAyah' ? 'ring-2 ring-primary ring-offset-1 -translate-y-1 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)]' : 'border border-slate-200 hover:border-slate-300'}">
                <div class="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center bg-slate-50 border-r border-slate-100 text-slate-400">
                  <User class="w-5 h-5 {focusedInput === 'namaAyah' ? 'text-primary' : ''} transition-colors" />
                </div>
                <input 
                  id="namaAyah" 
                  type={showPassword ? "text" : "password"} 
                  class="w-full bg-white pl-16 pr-12 py-3.5 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-300 focus:bg-slate-50/50 transition-colors uppercase"
                  placeholder="Nama ayah sesuai KK" 
                  value={namaAyah} 
                  on:input={(e) => namaAyah = e.currentTarget.value}
                  on:focus={() => focusedInput = 'namaAyah'}
                  on:blur={() => focusedInput = ''}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  class="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center text-slate-400 hover:text-primary transition-colors focus:outline-none"
                  on:click={() => showPassword = !showPassword}
                  tabindex="-1"
                >
                  {#if showPassword}
                    <EyeOff class="w-5 h-5" />
                  {:else}
                    <Eye class="w-5 h-5" />
                  {/if}
                </button>
              </div>
            </div>

            <!-- Checkbox Remember Me -->
            <label class="flex items-center mt-3 ml-1 cursor-pointer group/checkbox" in:fly|global={{ y: 10, duration: 400, delay: 300 }}>
              <div class="relative flex items-center justify-center">
                <input 
                  type="checkbox" 
                  class="sr-only"
                  bind:checked={rememberMe}
                  disabled={loading}
                />
                <div class="w-5 h-5 border-2 rounded-md transition-all duration-300 flex items-center justify-center shadow-sm {rememberMe ? 'bg-primary border-primary' : 'bg-white border-slate-300 group-hover/checkbox:border-primary'}">
                  {#if rememberMe}
                    <svg class="w-3.5 h-3.5 text-white" in:scale={{duration: 200, start: 0.5}} out:scale={{duration: 200, start: 0.5}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  {/if}
                </div>
              </div>
              <span class="ml-3 text-sm font-semibold text-slate-500 select-none group-hover/checkbox:text-slate-800 transition-colors">
                Ingat NIS saya
              </span>
            </label>

            <!-- Submit Button -->
            <div in:fly|global={{ y: 10, duration: 400, delay: 350 }}>
              <Button 
                type="submit" 
                class="w-full py-6 mt-4 text-base font-bold shadow-[0_8px_30px_rgb(79,70,229,0.2)] hover:shadow-[0_8px_30px_rgb(79,70,229,0.4)] hover:-translate-y-1 active:scale-95 transition-all duration-300 rounded-xl relative overflow-hidden group before:absolute before:inset-0 before:bg-white/20 before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700" 
                disabled={loading}
              >
              {#if loading}
                <span class="flex items-center justify-center w-full relative">
                  <div class="relative flex items-center justify-center mr-3 z-10 animate-rocket-shake">
                    <svg class="w-6 h-6 text-white transform rotate-45" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
                      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
                      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5-4 5-4l.29.35"></path>
                      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 4-5 4-5l-.35-.29"></path>
                    </svg>
                  </div>
                  <span class="font-bold tracking-widest text-white z-10 animate-pulse">MELUNCUR...</span>
                  <div class="absolute inset-0 pointer-events-none opacity-20 flex items-center overflow-hidden">
                    <div class="h-0.5 bg-white w-4 rounded-full absolute animate-cloud-1 right-0 top-1/4"></div>
                    <div class="h-0.5 bg-white w-8 rounded-full absolute animate-cloud-2 right-0 bottom-1/4"></div>
                    <div class="h-0.5 bg-white w-2 rounded-full absolute animate-cloud-3 right-0 top-1/2"></div>
                  </div>
                </span>
              {:else}
                <span class="flex items-center justify-center">
                  Masuk Sekarang
                  <ArrowRight class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              {/if}
              </Button>
            </div>
          </form>

          <!-- Bantuan Login & Lupa NIS -->
          <div class="mt-8 pt-6 border-t border-slate-100/80 text-center" in:fly|global={{ y: 10, duration: 400, delay: 450 }}>
            <p class="text-sm font-semibold text-slate-600 mb-4">
              Lupa atau tidak tahu NIS Anda? <br />
              <button type="button" class="text-primary font-bold hover:underline mt-1.5 inline-flex items-center" on:click={() => showLupaNisModal = true}>
                <Search class="w-4 h-4 mr-1.5" /> Cari NIS Saya di Sini
              </button>
            </p>
            <p class="text-xs text-slate-400 font-medium pt-3 border-t border-slate-50/50">
              Mengalami masalah lain? <br class="lg:hidden" />
              <a href="https://wa.me/6285111653232" target="_blank" class="text-slate-500 font-bold hover:text-primary transition-colors">Hubungi ADMIN</a>
              <span class="mx-2 text-slate-300">•</span>
              <button type="button" class="text-slate-500 font-bold hover:text-primary transition-colors" on:click={() => showGuestFeedbackModal = true}>Kotak Saran</button>
            </p>
          </div>

          <!-- Footer (Play Store & Social Media) -->
          <div class="mt-8 pt-8 border-t border-slate-100/80 text-center space-y-6" in:fly|global={{ y: 10, duration: 400, delay: 550 }}>
            <!-- Google Play -->
            <a href="https://play.google.com/store/apps/details?id=com.miHoYo.GenshinImpact" target="_blank" class="inline-block transition-transform hover:scale-105">
              <img src="/google-play-badge.png" alt="Get it on Google Play" class="h-11 w-auto mx-auto" />
            </a>
            
            <!-- Copyright -->
            <p class="text-[11px] font-bold text-slate-500 tracking-wide">© 2026 MAZEEDA | MA HMQ LIRBOYO</p>
            
            <!-- Social Icons -->
            <div class="flex items-center justify-center gap-3">
              <!-- WhatsApp -->
              <a href="https://wa.me/6285111653232" target="_blank" rel="noopener noreferrer" class="h-9 w-9 flex items-center justify-center transition-all hover:scale-110 active:scale-95 duration-200" title="WhatsApp MAZEEDA">
                <img src="/whatsapp.png" alt="WhatsApp" class="h-full w-full object-contain scale-[0.88] filter drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.12)]" />
              </a>
              <!-- Instagram -->
              <a href="https://instagram.com/mazeedahmqlirboyo" target="_blank" rel="noopener noreferrer" class="h-9 w-9 flex items-center justify-center transition-all hover:scale-110 active:scale-95 duration-200" title="Instagram MAZEEDA">
                <img src="/instagram.png" alt="Instagram" class="h-full w-full object-contain scale-[0.98] filter drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.12)]" />
              </a>
              <!-- X / Twitter -->
              <a href="https://x.com/MAZEEDA_HMQ_LBY" target="_blank" rel="noopener noreferrer" class="h-9 w-9 flex items-center justify-center transition-all hover:scale-110 active:scale-95 duration-200" title="Twitter MAZEEDA">
                <img src="/twitter.png" alt="Twitter" class="h-full w-full object-contain scale-[0.87] filter drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.12)]" />
              </a>
              <!-- TikTok -->
              <a href="https://tiktok.com/@mazeedahmqlirboyo" target="_blank" rel="noopener noreferrer" class="h-9 w-9 flex items-center justify-center transition-all hover:scale-110 active:scale-95 duration-200" title="TikTok MAZEEDA">
                <img src="/tiktok.png" alt="TikTok" class="h-full w-full object-contain scale-[0.87] filter drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.12)]" />
              </a>
              <!-- YouTube -->
              <a href="https://www.youtube.com/@HaloMazeeda" target="_blank" rel="noopener noreferrer" class="h-9 w-9 flex items-center justify-center transition-all hover:scale-110 active:scale-95 duration-200" title="YouTube MAZEEDA">
                <img src="/youtube.png" alt="YouTube" class="h-full w-full object-contain scale-[0.90] filter drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.12)]" />
              </a>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>

  <!-- Modal Lupa NIS -->
  {#if showLupaNisModal}
    <div class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" transition:fade={{ duration: 200 }}>
      <div class="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100" transition:scale={{ duration: 300, start: 0.95 }}>
        <div class="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 class="text-lg font-bold text-slate-800 flex items-center">
            <Search class="w-5 h-5 mr-2 text-primary" />
            Cari NIS Saya
          </h3>
          <button class="text-slate-400 hover:text-rose-500 transition-colors p-1 rounded-full hover:bg-rose-50" on:click={() => showLupaNisModal = false}>
            <X class="w-5 h-5" />
          </button>
        </div>
        <div class="p-6">
          {#if searchNisMessage.content}
            <div class="flex items-start p-3.5 mb-5 rounded-xl text-sm font-semibold {searchNisMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}" in:slide>
              <AlertCircle class="w-5 h-5 mr-2.5 shrink-0" />
              <span>{searchNisMessage.content}</span>
            </div>
          {/if}

          <form on:submit|preventDefault={handleCariNIS} class="space-y-4">
            <div class="space-y-1.5">
              <label class="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">NAMA LENGKAP</label>
              <Input bind:value={searchNamaLengkap} placeholder="CONTOH: SITI AISYAH" required disabled={isSearchingNis} class="py-3 uppercase" />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">TEMPAT LAHIR</label>
              <Input bind:value={searchTempatLahir} placeholder="CONTOH: KEDIRI" required disabled={isSearchingNis} class="py-3 uppercase" />
            </div>
            <Button type="submit" class="w-full py-6 mt-4 text-base font-bold shadow-md hover:shadow-lg transition-all rounded-xl" disabled={isSearchingNis}>
              {isSearchingNis ? 'Mencari Data...' : 'Cari NIS Sekarang'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  /* Hide default browser password reveal icon (e.g. in Microsoft Edge) */
  input::-ms-reveal,
  input::-ms-clear {
    display: none;
  }

  /* Menyembunyikan scrollbar tapi tetap bisa discroll */
  .hide-scrollbar {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none; /* Chrome, Safari and Opera */
  }

  /* Animasi Blob Background */
  @keyframes blob {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  .animate-blob {
    animation: blob 7s infinite;
  }
  .animation-delay-2000 {
    animation-delay: 2s;
  }
  .animation-delay-4000 {
    animation-delay: 4s;
  }

  /* Rocket Animations */
  .animate-rocket-shake {
    animation: rocketShake 0.4s infinite alternate ease-in-out;
  }
  @keyframes rocketShake {
    0% { transform: translateY(0px) rotate(0deg); }
    100% { transform: translateY(-2px) rotate(2deg); }
  }

  .animate-cloud-1 {
    animation: cloudPassBy 0.8s linear infinite;
  }
  .animate-cloud-2 {
    animation: cloudPassBy 1.2s linear infinite 0.4s;
    opacity: 0;
  }
  .animate-cloud-3 {
    animation: cloudPassBy 0.6s linear infinite 0.2s;
    opacity: 0;
  }
  @keyframes cloudPassBy {
    0% { transform: translateX(50px); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { transform: translateX(-300px); opacity: 0; }
  }
</style>

<!-- Modal Kotak Saran (Guest) -->
{#if showGuestFeedbackModal}
  <div 
    class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm"
    transition:fade={{ duration: 200 }}
    on:click={() => showGuestFeedbackModal = false}
  >
    <div 
      class="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      transition:scale={{ duration: 200, start: 0.95 }}
      on:click|stopPropagation
    >
      {#if !guestFeedbackSuccess}
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
            <MessageCircle class="w-5 h-5 text-primary" /> Kotak Saran
          </h3>
          <button 
            on:click={() => showGuestFeedbackModal = false}
            class="p-2 -mr-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors focus:outline-none"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
      {/if}

      <div class="p-6">
        {#if guestFeedbackSuccess}
          <div class="text-center py-8" in:fade={{ duration: 200 }}>
            <img src="/Success.svg" alt="Berhasil" class="w-48 h-48 mx-auto mb-4 object-contain scale-110" />
            <h4 class="text-xl font-bold text-slate-800 mb-2">Terima Kasih!</h4>
            <p class="text-sm text-slate-500">Saran dan masukan Anda telah terkirim dan akan sangat membantu kami mengembangkan aplikasi MAZEEDA.</p>
          </div>
        {:else}
          <div class="space-y-4">
            <p class="text-xs text-slate-500 leading-relaxed mb-4">Punya ide fitur baru, menemukan bug, atau sekadar memberi kritik dan saran? Tulis di sini.</p>
            
            {#if guestFeedbackError}
              <div class="bg-rose-50/50 border border-rose-100 rounded-xl p-3 flex items-start gap-3 text-rose-600" in:fade={{duration: 200}}>
                <AlertCircle class="w-5 h-5 shrink-0 mt-0.5" />
                <p class="text-xs font-semibold leading-relaxed">{guestFeedbackError}</p>
              </div>
            {/if}

            <div>
              <label for="guestName" class="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Nama Anda</label>
              <input 
                id="guestName" 
                type="text"
                placeholder="Masukkan nama lengkap" 
                class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:outline-none focus:border-primary focus:bg-white transition-colors"
                bind:value={guestFeedbackName}
                on:input={() => guestFeedbackError = ""}
              />
            </div>

            <div>
              <label for="guestFeedback" class="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Pesan Anda</label>
              <textarea 
                id="guestFeedback" 
                rows="4" 
                placeholder="Tuliskan saran Anda secara detail..." 
                class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:outline-none focus:border-primary focus:bg-white resize-none transition-colors"
                bind:value={guestFeedbackMessage}
                on:input={() => guestFeedbackError = ""}
              ></textarea>
            </div>

            <Button 
              on:click={submitGuestFeedback} 
              disabled={isSubmittingGuestFeedback || !guestFeedbackName.trim() || !guestFeedbackMessage.trim()}
              class="w-full py-2.5 font-bold bg-primary hover:bg-primary/90 text-white rounded-xl shadow-soft-sm disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-4"
            >
              {#if isSubmittingGuestFeedback}
                <div class="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Mengirim...
              {:else}
                Kirim Masukan
              {/if}
            </Button>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}
