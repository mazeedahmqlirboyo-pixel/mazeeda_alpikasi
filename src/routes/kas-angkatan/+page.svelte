<script lang="ts">
  import { t, locale } from 'svelte-i18n';
  import { fade, fly, scale } from "svelte/transition";
  import PageHeader from "$lib/components/ui/PageHeader.svelte";
  import { Wallet, Copy, CheckCircle2, ShieldCheck } from "lucide-svelte";
  
  let copiedId: string | null = null;
  
  function copyToClipboard(text: string, id: string) {
    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
      copiedId = id;
      setTimeout(() => {
        copiedId = null;
      }, 2000);
    }
  }


  $: formatNumberDisplay = (numStr: string) => {
    if ($locale === 'ar') {
      const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
      return numStr.replace(/[0-9]/g, w => arabicNumbers[parseInt(w)]);
    }
    return numStr;
  };

  const paymentMethods = [
    {
      id: 'bca',
      name: 'Bank BCA',
      accountNumber: '1234567890',
      accountName: 'Bendahara Angkatan',
      logo: '/images/bca_logo.png', // We can fallback to an icon if logo doesn't exist
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800'
    },
    {
      id: 'dana',
      name: 'DANA / GoPay / OVO',
      accountNumber: '081234567890',
      accountName: 'Bendahara Angkatan',
      logo: '/images/dana_logo.png',
      bgColor: 'bg-sky-50',
      borderColor: 'border-sky-200',
      textColor: 'text-sky-800'
    }
  ];
</script>

<svelte:head>
  <title>{$t('kas.title') || 'Kas Angkatan'} - MAZEEDA</title>
</svelte:head>

<div class="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24 font-sans" in:fade={{ duration: 200 }}>
  <PageHeader title={$t('kas.title') || 'Kas Angkatan'} backTo="/" />

  <main class="max-w-2xl mx-auto px-4 py-8 space-y-8">
    <!-- Hero Section -->
    <div class="text-center space-y-4 mb-8" in:fly={{ y: 20, duration: 400 }}>
      <div class="flex justify-center mb-4 relative">
        <img src="/images/money.svg" alt="Uang Kas" class="w-32 h-32 object-contain relative z-10 drop-shadow-sm dark:shadow-none hover:scale-105 transition-transform duration-300" />
      </div>
      <h2 class="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">{$t('kas.hero_title') || 'Gotong Royong Angkatan'}</h2>
      <p class="text-slate-500 dark:text-slate-400 dark:text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
        {$t('kas.hero_desc') || 'Salurkan kontribusi Kas Angkatan Anda untuk mendukung berbagai program, kegiatan, dan kemaslahatan bersama.'}
      </p>
    </div>

    <!-- Trust Badge -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex items-start gap-4 shadow-sm dark:shadow-none" in:fly={{ y: 20, duration: 400, delay: 100 }}>
      <div class="bg-indigo-50 p-2 rounded-xl shrink-0">
        <ShieldCheck class="w-6 h-6 text-indigo-600" />
      </div>
      <div>
        <h4 class="font-bold text-slate-800 dark:text-slate-100 text-sm">{$t('kas.transparency_title') || 'Transparansi Dana'}</h4>
        <p class="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
          {$t('kas.transparency_desc') || 'Seluruh dana yang masuk akan dicatat secara transparan oleh bendahara dan dialokasikan sepenuhnya untuk kepentingan bersama.'}
        </p>
      </div>
    </div>

    <!-- Payment Methods -->
    <div class="space-y-4" in:fly={{ y: 20, duration: 400, delay: 200 }}>
      <h3 class="font-black text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2 px-2">
        <Wallet class="w-5 h-5 text-indigo-600" />
        {$t('kas.payment_methods') || 'Metode Penyaluran Kas'}
      </h3>

      <div class="grid grid-cols-1 gap-4">
        {#each paymentMethods as method}
          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 hover:shadow-md dark:shadow-none transition-shadow relative overflow-hidden group">
            <div class="hidden absolute right-0 top-0 w-32 h-32 {method.bgColor} rounded-full blur-3xl -mr-16 -mt-16 opacity-50 pointer-events-none"></div>
            
            <div class="flex items-center justify-between mb-4 relative z-10">
              <span class="font-bold text-slate-700 dark:text-slate-200 text-sm">{method.name}</span>
            </div>
            
            <div class="space-y-1 relative z-10">
              <p class="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">{$t('kas.account_name_label') || 'Atas Nama'}</p>
              <p class="font-bold text-slate-800 dark:text-slate-100">{method.accountName === 'Bendahara Angkatan' ? ($t('kas.treasurer') || 'Bendahara Angkatan') : method.accountName}</p>
            </div>

            <div class="mt-4 flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-800 relative z-10 group-hover:border-slate-200 dark:border-slate-700 transition-colors">
              <div class="space-y-1">
                <p class="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">{$t('kas.account_number_label') || 'Nomor Rekening / Akun'}</p>
                <p class="font-black text-xl text-slate-800 dark:text-slate-100 tracking-wider ">{formatNumberDisplay(method.accountNumber)}</p>
              </div>
              
              <button 
                on:click={() => copyToClipboard(method.accountNumber, method.id)}
                class="w-10 h-10 shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all active:scale-95 shadow-sm dark:shadow-none"
                title={$t('kas.copy_number') || 'Salin Nomor'}
              >
                {#if copiedId === method.id}
                  <span in:scale><CheckCircle2 class="w-5 h-5 text-emerald-500" /></span>
                {:else}
                  <span in:scale><Copy class="w-5 h-5" /></span>
                {/if}
              </button>
            </div>
            
            {#if copiedId === method.id}
              <p class="text-xs text-emerald-600 font-bold text-center mt-3 animate-pulse" in:fade>
                {$t('kas.copy_success') || 'Berhasil disalin ke clipboard!'}
              </p>
            {/if}
          </div>
        {/each}
      </div>
    </div>

    <!-- Info Footer -->
    <div class="text-center pt-8" in:fly={{ y: 20, duration: 400, delay: 300 }}>
      <p class="text-xs text-slate-400 dark:text-slate-500">
        {$t('kas.footer_note') || 'Mohon tambahkan kode unik atau konfirmasi ke bendahara setelah melakukan transfer agar pendataan lebih mudah.'}
      </p>
    </div>
  </main>
</div>
