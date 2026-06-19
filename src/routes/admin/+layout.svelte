<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';
  import Card from '$lib/components/ui/card.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import { ShieldAlert, ArrowLeft, LogIn, Lock } from 'lucide-svelte';

  let isLoading = true;
  let isAuthorized = false;

  onMount(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      isAuthorized = user?.email === 'admin@mazeeda.com';
    } catch (err) {
      isAuthorized = false;
    } finally {
      isLoading = false;
    }
  });
</script>

{#if isLoading}
  <div class="py-24 text-center space-y-4">
    <div class="animate-spin h-8 w-8 border-3 border-primary border-t-transparent rounded-full mx-auto"></div>
    <p class="text-sm font-semibold text-slate-500">Memeriksa hak akses administrator...</p>
  </div>
{:else}
  {#if isAuthorized}
    <slot />
  {:else}
    <!-- Unauthorized Access View -->
    <div class="py-12 max-w-md mx-auto">
      <Card class="p-6 text-center space-y-6">
        <div class="h-14 w-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mx-auto">
          <ShieldAlert class="h-8 w-8" />
        </div>
        
        <div class="space-y-2">
          <h2 class="text-xl font-bold text-slate-800">Akses Terbatas</h2>
          <p class="text-xs text-slate-500 leading-relaxed font-normal">
            Halaman ini hanya dapat diakses oleh akun dengan peran administrator MAZEEDA. Akun Anda saat ini tidak memiliki wewenang untuk melihat modul ini.
          </p>
        </div>
        
        <div class="flex flex-col gap-2.5 pt-2">
          <a href="/auth">
            <Button class="w-full flex items-center justify-center space-x-2">
              <LogIn class="h-4.5 w-4.5" />
              <span>Masuk sebagai Admin</span>
            </Button>
          </a>
          
          <a href="/">
            <Button variant="outline" class="w-full flex items-center justify-center space-x-2">
              <ArrowLeft class="h-4.5 w-4.5" />
              <span>Kembali ke Beranda</span>
            </Button>
          </a>
        </div>
      </Card>
    </div>
  {/if}
{/if}
