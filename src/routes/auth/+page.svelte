<script lang="ts">
  import Card from '$lib/components/ui/card.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import Input from '$lib/components/ui/input.svelte';
  import { supabase } from '$lib/supabase';
  import { authStore, loginAsStudent, loginAsAdmin, logout } from '$lib/auth';
  import { User, Hash } from 'lucide-svelte';

  // State management
  let nis = '';
  let namaAyah = '';
  let loading = false;
  let message = { type: '', content: '' }; // { type: 'success' | 'error', content: string }

  // Form methods
  async function handleAuthSubmit() {
    loading = true;
    message = { type: '', content: '' };

    try {
      const inputNIS = nis.trim();
      const inputNamaAyah = namaAyah.trim();

      if (!inputNIS || !inputNamaAyah) {
        throw new Error('Nomor Induk Santri (NIS) / Email dan Nama Ayah Kandung / Password wajib diisi!');
      }

      if (inputNIS === 'admin@mazeeda.com') {
        // Admin Login using email 'admin@mazeeda.com' and password entered in the 'namaAyah' field
        const { error } = await supabase.auth.signInWithPassword({
          email: 'admin@mazeeda.com',
          password: inputNamaAyah
        });

        if (error) throw error;

        // Authenticate admin session
        loginAsAdmin();

        message = { 
          type: 'success', 
          content: 'Login admin berhasil!' 
        };
        
        window.location.href = '/';
      } else {
        // Santri / Alumni Passwordless Login via NIS and Father's Name
        const { data, error } = await supabase
          .from('allowed_alumni')
          .select('*')
          .eq('nis', inputNIS);

        if (error) throw error;

        if (!data || data.length === 0) {
          throw new Error('Nomor Induk Santri (NIS) tidak ditemukan!');
        }

        // Case-insensitive comparison for father's name
        const match = data.find(
          (m: any) => m.nama_ayah?.toLowerCase().trim() === inputNamaAyah.toLowerCase()
        );

        if (!match) {
          throw new Error('Nama ayah kandung salah!');
        }

        // Update login status in Supabase database (with silent catch if tables/policies aren't migrated yet)
        try {
          await supabase
            .from('allowed_alumni')
            .update({
              has_logged_in: true,
              last_login: new Date().toISOString()
            })
            .eq('id', match.id);
        } catch (dbErr) {
          console.warn('Gagal mencatat status login di database:', dbErr);
        }

        // Authenticate student session
        loginAsStudent({
          name: match.nama_lengkap,
          email: match.email,
          nis: match.nis,
          nama_ayah: match.nama_ayah,
          foto_url: match.foto_url
        });

        message = { 
          type: 'success', 
          content: `Selamat datang kembali, ${match.nama_lengkap}!` 
        };
        
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

<div class="space-y-6">
  {#if $authStore.user}
    <!-- Screen displayed if user is already logged in -->
    <div class="flex flex-col items-center text-center space-y-2 mb-2">
      <div class="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-soft-sm">
        <span class="text-white font-black text-2xl">M</span>
      </div>
      <h1 class="text-2xl font-bold tracking-tight text-slate-800">Sesi Aktif MAZEEDA</h1>
      <p class="text-xs text-slate-400 font-medium">Anda saat ini sedang masuk ke dalam sistem.</p>
    </div>

    <Card class="p-6 text-center space-y-5">
      <div class="py-4">
        <div class="h-16 w-16 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-primary font-bold text-2xl mx-auto mb-3 shadow-soft-sm">
          {$authStore.user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
        </div>
        <h3 class="text-lg font-bold text-slate-800">{$authStore.user.name}</h3>
        <p class="text-xs text-slate-400 font-semibold mt-1">
          {$authStore.user.role === 'admin' ? 'Administrator' : `NIS: ${$authStore.user.nis || '-'}`}
        </p>
      </div>

      <div class="space-y-2">
        <a href="/" class="block">
          <Button class="w-full">Masuk ke Dashboard</Button>
        </a>
        <Button 
          variant="outline" 
          class="w-full text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-100" 
          on:click={handleLogout}
          disabled={loading}
        >
          {#if loading}
            <span>Memproses...</span>
          {:else}
            <span>Keluar Akun (Log Out)</span>
          {/if}
        </Button>
      </div>
    </Card>
  {:else}
    <!-- Login Screen -->
    <div class="flex flex-col items-center text-center space-y-2 mb-2">
      <div class="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-soft-sm">
        <span class="text-white font-black text-2xl">M</span>
      </div>
      <h1 class="text-2xl font-bold tracking-tight text-slate-800">Portal Keanggotaan MAZEEDA</h1>
      <p class="text-xs text-slate-400 font-medium">Silakan masuk menggunakan akun terdaftar Anda</p>
    </div>

    <Card class="p-6">
      <!-- Status Message Alert Box -->
      {#if message.content}
        <div 
          class="p-4 rounded-xl border text-xs font-semibold leading-relaxed mb-5
            {message.type === 'success' 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
              : 'bg-rose-50 text-rose-700 border-rose-100'}"
        >
          {message.content}
        </div>
      {/if}

      <!-- Auth Input Form -->
      <form on:submit|preventDefault={handleAuthSubmit} class="space-y-4">
        <div class="space-y-1.5">
          <label for="nis" class="text-xs font-bold text-slate-500">Nomor Induk Santri (NIS)</label>
          <div class="relative">
            <Hash class="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
            <Input 
              id="nis" 
              type="text" 
              placeholder="Masukkan NIS (contoh: 220412)" 
              class="pl-12" 
              bind:value={nis} 
              disabled={loading}
              required
            />
          </div>
        </div>

        <div class="space-y-1.5">
          <label for="namaAyah" class="text-xs font-bold text-slate-500">Nama Ayah Kandung</label>
          <div class="relative">
            <User class="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
            <Input 
              id="namaAyah" 
              type="text" 
              placeholder="Nama ayah kandung" 
              class="pl-12" 
              bind:value={namaAyah} 
              disabled={loading}
              required
            />
          </div>
        </div>

        <!-- Submit button -->
        <Button 
          type="submit" 
          class="w-full flex items-center justify-center space-x-2 shadow-soft-sm mt-6" 
          disabled={loading}
        >
          {#if loading}
            <span class="animate-pulse">Memverifikasi...</span>
          {:else}
            <span>Masuk Akun</span>
          {/if}
        </Button>
      </form>

      <div class="w-full text-center py-4">
        <p class="text-xs text-slate-400 font-semibold leading-relaxed">
          Kendala login? Hubungi ADMIN MAZEEDA di grup WhatsApp.
        </p>
      </div>
    </Card>
  {/if}
</div>
