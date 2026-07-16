<script lang="ts">
  import { onMount } from 'svelte';
  import PageHeader from '$lib/components/ui/PageHeader.svelte';
  import { ShieldCheck, Loader2 } from 'lucide-svelte';
  import { supabase } from '$lib/supabase';
  import { defaultPrivacyPolicy } from '$lib/data/defaultLegal';

  let content = '';
  let isLoading = true;

  onMount(async () => {
    try {
      const { data, error } = await supabase
        .from('legal_documents')
        .select('content')
        .eq('id', 'privacy_policy')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        content = data.content;
      } else {
        // Seed default content if table is empty for this id
        content = defaultPrivacyPolicy;
        await supabase.from('legal_documents').insert({
          id: 'privacy_policy',
          content: defaultPrivacyPolicy
        });
      }
    } catch (err) {
      console.error('Error fetching privacy policy:', err);
      // Fallback to default if table doesn't exist or other error
      content = defaultPrivacyPolicy;
    } finally {
      isLoading = false;
    }
  });
</script>

<svelte:head>
  <title>Kebijakan Privasi - MAZEEDA</title>
</svelte:head>

<div class="min-h-[100dvh] bg-slate-50 flex flex-col pb-safe">
  <PageHeader title="Kebijakan Privasi" backTo="/" />

  <main class="flex-1 overflow-y-auto px-4 py-8">
    <div class="max-w-3xl mx-auto space-y-8">
      
      <!-- Hero Header -->
      <div class="text-center space-y-4 mb-8">
        <div class="mx-auto w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
          <ShieldCheck class="w-10 h-10 text-white" />
        </div>
        <h1 class="text-2xl md:text-4xl font-black text-slate-800 tracking-tight">Kebijakan Privasi</h1>
        <p class="text-slate-500 font-medium text-sm">
          Terakhir diperbarui: <span class="text-slate-700 font-bold">{new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </p>
        <p class="max-w-lg mx-auto text-slate-500 text-sm leading-relaxed mt-4">
          Keamanan dan privasi data Anda adalah prioritas utama kami. Berikut adalah penjelasan mengenai bagaimana kami mengelola informasi di aplikasi MAZEEDA.
        </p>
      </div>

      <!-- Content Box -->
      <div class="bg-white rounded-[2rem] p-6 md:p-10 shadow-sm border border-slate-100 min-h-[300px] flex flex-col">
        {#if isLoading}
          <div class="flex flex-col items-center justify-center flex-1 text-slate-400 space-y-3">
            <Loader2 class="w-8 h-8 animate-spin text-blue-500" />
            <p class="text-sm font-medium animate-pulse">Memuat kebijakan...</p>
          </div>
        {:else}
          <div class="space-y-0">
            {@html content}
          </div>
        {/if}
      </div>
      
      <!-- Footer Note -->
      <div class="text-center pt-4 pb-8">
        <p class="text-xs font-semibold text-slate-400">© {new Date().getFullYear()} MAZEEDA Community. Hak Cipta Dilindungi.</p>
      </div>

    </div>
  </main>
</div>

<style>
  .pb-safe {
    padding-bottom: max(1rem, env(safe-area-inset-bottom, 1rem));
  }
</style>
