<script lang="ts">
  import { fade, fly, slide } from 'svelte/transition';
  import Button from '$lib/components/ui/button.svelte';
  import Input from '$lib/components/ui/input.svelte';
  import { supabase } from '$lib/supabase';
  import { authStore, loginAsStudent, loginAsAdmin, logout } from '$lib/auth';
  import { User, Hash, LogOut, ArrowRight, ShieldCheck, UserCheck } from 'lucide-svelte';

  // State management
  let nis = '';
  let namaAyah = '';
  let loading = false;
  let message = { type: '', content: '' }; // { type: 'success' | 'error', content: string }
  let focusedInput = '';

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
        // Santri / Alumni Login
        const { data, error } = await supabase
          .from('allowed_alumni')
          .select('*')
          .eq('nis', inputNIS);

        if (error) throw error;
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
            .from('allowed_alumni')
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

<!-- Menggunakan fixed inset-0 untuk menutupi seluruh layar tanpa terpengaruh padding dari +layout.svelte -->
<div class="fixed inset-0 z-50 flex bg-white font-sans text-slate-800 overflow-hidden">
  
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

  <!-- Sisi Kanan: Form Login (Glassmorphism di Mobile, Solid di Desktop) -->
  <div class="w-full lg:w-1/2 relative flex items-center justify-center p-6 sm:p-12">
    <!-- Background dinamis untuk Mobile (Tertutup form glassmorphism) -->
    <div class="absolute inset-0 lg:hidden z-0">
      <div class="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50"></div>
      <!-- Blob dekoratif di pojok -->
      <div class="absolute top-0 left-0 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div class="absolute top-0 right-0 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div class="absolute -bottom-8 left-20 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
    </div>

    <div class="relative z-10 w-full max-w-md">
      {#if $authStore.user}
        <!-- Tampilan Jika Sudah Login -->
        <div class="bg-white/80 lg:bg-white backdrop-blur-xl border border-white/40 lg:border-slate-100 shadow-2xl rounded-3xl p-8 text-center" in:fly={{ y: 20, duration: 600 }}>
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
        <div class="bg-white/70 lg:bg-white backdrop-blur-xl border border-white/50 lg:border-transparent shadow-[0_8px_30px_rgb(0,0,0,0.04)] lg:shadow-none rounded-3xl p-8 sm:p-10" in:fly={{ y: 20, duration: 600 }}>
          
          <!-- Header Mobile Only -->
          <div class="lg:hidden flex flex-col items-center mb-8">
            <div class="w-16 h-16 bg-gradient-to-br from-primary to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 mb-4">
              <span class="text-white font-black text-3xl">M</span>
            </div>
            <h2 class="text-2xl font-bold text-slate-800">Masuk Akun</h2>
            <p class="text-sm text-slate-500 font-medium text-center mt-1">Silakan masuk menggunakan data terdaftar</p>
          </div>

          <!-- Header Desktop Only -->
          <div class="hidden lg:block mb-10">
            <h2 class="text-3xl font-extrabold text-slate-800 tracking-tight">Selamat Datang 👋</h2>
            <p class="text-slate-500 font-medium mt-2">Silakan isi data login Anda untuk melanjutkan.</p>
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
            <div class="space-y-1.5 relative group">
              <label for="nis" class="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Nomor Induk / Email</label>
              <div class="relative overflow-hidden rounded-xl transition-all duration-300 {focusedInput === 'nis' ? 'ring-2 ring-primary ring-offset-1' : 'border border-slate-200'}">
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
            <div class="space-y-1.5 relative group">
              <label for="namaAyah" class="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Nama Ayah / Password</label>
              <div class="relative overflow-hidden rounded-xl transition-all duration-300 {focusedInput === 'namaAyah' ? 'ring-2 ring-primary ring-offset-1' : 'border border-slate-200'}">
                <div class="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center bg-slate-50 border-r border-slate-100 text-slate-400">
                  <User class="w-5 h-5 {focusedInput === 'namaAyah' ? 'text-primary' : ''} transition-colors" />
                </div>
                <input 
                  id="namaAyah" 
                  type="text" 
                  class="w-full bg-white pl-16 pr-4 py-3.5 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-300 focus:bg-slate-50/50 transition-colors"
                  placeholder="Nama lengkap ayah kandung" 
                  bind:value={namaAyah} 
                  on:focus={() => focusedInput = 'namaAyah'}
                  on:blur={() => focusedInput = ''}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <!-- Submit Button -->
            <Button 
              type="submit" 
              class="w-full py-6 mt-4 text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all rounded-xl relative overflow-hidden group" 
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
          </form>

          <div class="mt-8 pt-6 border-t border-slate-100/80 text-center">
            <p class="text-xs text-slate-400 font-medium">
              Mengalami kendala saat masuk? <br class="lg:hidden" />
              <a href="#" class="text-primary font-bold hover:underline">Hubungi ADMIN MAZEEDA</a>
            </p>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
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
