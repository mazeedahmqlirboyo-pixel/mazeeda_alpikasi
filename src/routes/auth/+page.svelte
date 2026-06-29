<script lang="ts">
  import { fade, fly, slide, scale } from 'svelte/transition';
  import { onMount } from 'svelte';
  import Button from '$lib/components/ui/button.svelte';
  import Input from '$lib/components/ui/input.svelte';
  import { supabase } from '$lib/supabase';
  import { authStore, loginAsStudent, loginAsAdmin, logout } from '$lib/auth';
  import { User, Hash, LogOut, ArrowRight, ShieldCheck, UserCheck, Instagram, Youtube, Rss, MessageCircle, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-svelte';

  // State management
  let nis = '';
  let namaAyah = '';
  let loading = false;
  let message = { type: '', content: '' }; // { type: 'success' | 'error', content: string }
  let focusedInput = '';
  let showPassword = false;
  let showSplash = true;

  onMount(() => {
    setTimeout(() => {
      showSplash = false;
    }, 2000); // Tampilkan splash screen selama 2 detik
  });

  // Form methods
  async function handleAuthSubmit() {
    loading = true;
    message = { type: '', content: '' };

    try {
      const inputNIS = nis.trim();
      const inputNamaAyah = namaAyah.trim();

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

        message = { type: 'success', content: `Selamat datang kembali, ${match.nama_lengkap}!` };
        window.location.href = '/';
      }
    } catch (err: any) {
      message = { type: 'error', content: err.message || 'Terjadi kesalahan sistem' };
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
</script>

{#if showSplash}
  <!-- Splash Screen -->
  <div class="fixed inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-center" out:fade={{ duration: 600 }}>
    <!-- Beautiful Glowing Logo -->
    <div class="relative flex items-center justify-center w-32 h-32 mb-6" in:scale={{ duration: 800, start: 0.5, delay: 100 }}>
      <!-- Glow effect -->
      <div class="absolute inset-0 bg-primary/40 rounded-[2rem] blur-2xl animate-pulse"></div>
      <!-- Logo box -->
      <div class="relative w-full h-full bg-gradient-to-br from-indigo-500 via-primary to-purple-600 rounded-[2rem] flex items-center justify-center shadow-2xl border border-white/20 overflow-hidden">
        <!-- Inner glass shine -->
        <div class="absolute top-0 left-0 w-full h-1/2 bg-white/20 rounded-t-[2rem]"></div>
        <span class="text-6xl font-black text-white drop-shadow-lg tracking-tighter">M</span>
      </div>
    </div>
    
    <!-- Brand Text -->
    <div in:fly={{ y: 20, duration: 600, delay: 400 }}>
      <h1 class="text-4xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-100 drop-shadow-lg">MAZEEDA</h1>
    </div>
    
    <!-- Loading Dots -->
    <div class="absolute bottom-16 flex space-x-2" in:fade={{ delay: 700 }}>
      <div class="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce"></div>
      <div class="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce" style="animation-delay: 0.15s"></div>
      <div class="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce" style="animation-delay: 0.3s"></div>
    </div>
  </div>
{:else}
<!-- Menggunakan fixed inset-0 untuk menutupi seluruh layar tanpa terpengaruh padding dari +layout.svelte -->
<div class="fixed inset-0 z-50 flex bg-white font-sans text-slate-800 overflow-y-auto lg:overflow-hidden hide-scrollbar" in:fade={{ duration: 500 }}>
  
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
      <div class="inline-flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl mb-8">
        <span class="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">M</span>
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
  <div class="w-full lg:w-1/2 relative flex items-center justify-center p-6 sm:p-12 min-h-[700px] lg:min-h-full overflow-y-auto lg:overflow-visible bg-white hide-scrollbar">
    
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
            <div class="relative w-32 h-32 mb-6">
              <!-- Tail Fan Background -->
              <div class="absolute inset-x-0 bottom-2 h-32 flex justify-center items-end z-0 transition-transform duration-700 {focusedInput === 'namaAyah' && !showPassword ? 'scale-110' : 'scale-100'}">
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
                  <div class="relative w-3.5 h-4 bg-white rounded-full overflow-hidden shadow-inner">
                    <div class="absolute w-2 h-2 bg-slate-900 rounded-full transition-all duration-300 
                      {focusedInput === 'nis' ? 'top-2 left-1' : (focusedInput === 'namaAyah' ? 'top-0.5 left-1' : 'top-1 left-1')}"></div>
                  </div>
                  <!-- Right Eye -->
                  <div class="relative w-3.5 h-4 bg-white rounded-full overflow-hidden shadow-inner">
                    <div class="absolute w-2 h-2 bg-slate-900 rounded-full transition-all duration-300 
                      {focusedInput === 'nis' ? 'top-2 right-1' : (focusedInput === 'namaAyah' ? 'top-0.5 right-1' : 'top-1 right-1')}"></div>
                  </div>
                </div>
              </div>

              <!-- Wings (Covering Eyes) -->
              <!-- Left Wing -->
              <div class="absolute bottom-0 left-1/2 w-7 h-12 bg-blue-500 rounded-full shadow-[inset_-2px_0_10px_rgba(0,0,0,0.1)] transition-all duration-500 z-20 origin-bottom 
                {focusedInput === 'namaAyah' 
                  ? (showPassword ? 'ml-[-40px] mb-8 rotate-[-70deg]' : 'ml-[-15px] mb-14 rotate-[45deg]') 
                  : 'ml-[-35px] mb-2 -rotate-12'}">
              </div>
              
              <!-- Right Wing -->
              <div class="absolute bottom-0 right-1/2 w-7 h-12 bg-blue-500 rounded-full shadow-[inset_2px_0_10px_rgba(0,0,0,0.1)] transition-all duration-500 z-20 origin-bottom 
                {focusedInput === 'namaAyah' 
                  ? 'mr-[-15px] mb-14 rotate-[-45deg]' 
                  : 'mr-[-35px] mb-2 rotate-12'}">
              </div>
            </div>

            <h2 class="text-2xl lg:text-3xl font-extrabold text-slate-800 tracking-tight">Masuk Akun</h2>
            <p class="text-sm lg:text-base text-slate-500 font-medium mt-1 lg:mt-2">Silakan isi data login Anda untuk melanjutkan.</p>
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
            <div class="space-y-1.5 relative group" in:fly|global={{ y: 10, duration: 400, delay: 150 }}>
              <label for="nis" class="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">NIS</label>
              <div class="relative overflow-hidden rounded-xl transition-all duration-300 {focusedInput === 'nis' ? 'ring-2 ring-primary ring-offset-1 -translate-y-1 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)]' : 'border border-slate-200 hover:border-slate-300'}">
                <div class="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center bg-slate-50 border-r border-slate-100 text-slate-400">
                  <Hash class="w-5 h-5 {focusedInput === 'nis' ? 'text-primary' : ''} transition-colors" />
                </div>
                <input 
                  id="nis" 
                  type="text" 
                  class="w-full bg-white pl-16 pr-4 py-3.5 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-300 focus:bg-slate-50/50 transition-colors"
                  placeholder="Contoh: 220412" 
                  bind:value={nis} 
                  on:focus={() => focusedInput = 'nis'}
                  on:blur={() => focusedInput = ''}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <!-- Input Nama Ayah -->
            <div class="space-y-1.5 relative group" in:fly|global={{ y: 10, duration: 400, delay: 250 }}>
              <label for="namaAyah" class="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">NAMA AYAH</label>
              <div class="relative overflow-hidden rounded-xl transition-all duration-300 {focusedInput === 'namaAyah' ? 'ring-2 ring-primary ring-offset-1 -translate-y-1 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)]' : 'border border-slate-200 hover:border-slate-300'}">
                <div class="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center bg-slate-50 border-r border-slate-100 text-slate-400">
                  <User class="w-5 h-5 {focusedInput === 'namaAyah' ? 'text-primary' : ''} transition-colors" />
                </div>
                <input 
                  id="namaAyah" 
                  type={showPassword ? "text" : "password"} 
                  class="w-full bg-white pl-16 pr-12 py-3.5 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-300 focus:bg-slate-50/50 transition-colors"
                  placeholder="Nama lengkap ayah kandung" 
                  value={namaAyah} 
                  on:input={(e) => namaAyah = e.currentTarget.value.toUpperCase()}
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

            <!-- Submit Button -->
            <div in:fly|global={{ y: 10, duration: 400, delay: 350 }}>
              <Button 
                type="submit" 
                class="w-full py-6 mt-4 text-base font-bold shadow-[0_8px_30px_rgb(79,70,229,0.2)] hover:shadow-[0_8px_30px_rgb(79,70,229,0.4)] hover:-translate-y-1 active:scale-95 transition-all duration-300 rounded-xl relative overflow-hidden group before:absolute before:inset-0 before:bg-white/20 before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700" 
                disabled={loading}
              >
              {#if loading}
                <span class="animate-pulse flex items-center justify-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memverifikasi...
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

          <!-- Bantuan Login -->
          <div class="mt-8 pt-6 border-t border-slate-100/80 text-center" in:fly|global={{ y: 10, duration: 400, delay: 450 }}>
            <p class="text-xs text-slate-400 font-medium">
              Mengalami masalah login? <br class="lg:hidden" />
              <a href="https://wa.me/6281234567890" target="_blank" class="text-primary font-bold hover:underline">Hubungi ADMIN MAZEEDA</a>
            </p>
          </div>

          <!-- Footer (Play Store & Social Media) -->
          <div class="mt-8 pt-8 border-t border-slate-100/80 text-center space-y-6" in:fly|global={{ y: 10, duration: 400, delay: 550 }}>
            <!-- Google Play -->
            <a href="https://play.google.com/store/apps/details?id=com.mazeeda.app" target="_blank" class="inline-block transition-transform hover:scale-105">
              <img src="/google-play-badge.png" alt="Get it on Google Play" class="h-11 w-auto mx-auto" />
            </a>
            
            <!-- Copyright -->
            <p class="text-[11px] font-bold text-slate-500 tracking-wide">© 2026 MAZEEDA | MA HMQ LIRBOYO</p>
            
            <!-- Social Icons -->
            <div class="flex items-center justify-center gap-3">
              <!-- WhatsApp -->
              <a href="https://wa.me/6281234567890" target="_blank" class="w-10 h-10 flex items-center justify-center hover:scale-110 transition-transform">
                <img src="/whatsapp.png" alt="WhatsApp" class="w-full h-full object-contain" />
              </a>
              <!-- Instagram -->
              <a href="https://instagram.com/mazeeda" target="_blank" class="w-10 h-10 flex items-center justify-center hover:scale-110 transition-transform">
                <img src="/instagram.png" alt="Instagram" class="w-full h-full object-contain" />
              </a>
              <!-- X / Twitter -->
              <a href="https://twitter.com/mazeeda" target="_blank" class="w-10 h-10 flex items-center justify-center hover:scale-110 transition-transform">
                <img src="/twitter.png" alt="Twitter" class="w-full h-full object-contain" />
              </a>
              <!-- TikTok -->
              <a href="https://tiktok.com/@mazeeda" target="_blank" class="w-10 h-10 flex items-center justify-center hover:scale-110 transition-transform">
                <img src="/tiktok.png" alt="TikTok" class="w-full h-full object-contain" />
              </a>
              <!-- YouTube -->
              <a href="https://youtube.com/c/mazeeda" target="_blank" class="w-10 h-10 flex items-center justify-center hover:scale-110 transition-transform">
                <img src="/youtube.png" alt="YouTube" class="w-full h-full object-contain" />
              </a>
              <!-- RSS/Website -->
              <a href="https://mazeeda.com" target="_blank" class="w-10 h-10 flex items-center justify-center hover:scale-110 transition-transform">
                <img src="/rss.png" alt="Website" class="w-full h-full object-contain" />
              </a>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>
{/if}

<style>
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
</style>
