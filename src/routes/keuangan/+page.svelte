<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, slide, scale } from 'svelte/transition';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/auth';
  import { 
    Wallet, ArrowUpCircle, ArrowDownCircle, Plus, 
    Trash2, Pencil, ArrowLeft, History, Search, 
    X, AlertCircle, Save, ChevronDown, Calendar,
    ArrowRightLeft, ShoppingCart, Receipt, Smartphone, TrendingUp,
    Landmark, Briefcase, Undo, FileText
  } from 'lucide-svelte';
  import flatpickr from 'flatpickr';
  import 'flatpickr/dist/flatpickr.css';
  import PageHeader from '$lib/components/ui/PageHeader.svelte';

  function datepicker(node: HTMLElement) {
    const fp = flatpickr(node, {
      dateFormat: "Y-m-d",
      altInput: true,
      altFormat: "d/m/Y",
      disableMobile: true
    });
    return {
      destroy() {
        fp.destroy();
      }
    };
  }

  // State Management
  interface Wallet {
    id: string;
    name: string;
  }

  interface Transaction {
    id: string;
    walletId: string;
    type: 'income' | 'expense';
    amount: number;
    category: string;
    note: string;
    date: string;
  }

  let wallets: Wallet[] = [{ id: 'default', name: 'Uang Pribadi' }];
  let activeWalletId = 'default';

  let transactions: Transaction[] = [];
  let isLoaded = false;

  // Derived stats
  $: activeTransactions = transactions.filter(t => t.walletId === activeWalletId || (!t.walletId && activeWalletId === 'default'));
  $: totalIncome = activeTransactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  $: totalExpense = activeTransactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  $: currentBalance = totalIncome - totalExpense;

  // Wallet Modal State
  let showWalletModal = false;
  let newWalletName = '';

  // Dropdown states
  let showWalletDropdown = false;
  let showCategoryDropdown = false;

  // Confirm Modal state
  let confirmDialog = {
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    onCancel: () => {}
  };

  function openConfirm(title: string, message: string, onConfirm: () => void) {
    confirmDialog = {
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        confirmDialog.isOpen = false;
      },
      onCancel: () => {
        confirmDialog.isOpen = false;
      }
    };
  }

  // Form State
  let showModal = false;
  let isEditing = false;
  let editingId: string | null = null;
  let displayAmount = '';
  
  let formData = {
    type: 'expense' as 'income' | 'expense',
    amount: '',
    category: 'Transfer Rekening (Transfer)',
    note: '',
    date: new Date().toISOString().split('T')[0]
  };

  const categories = {
    expense: ['Transfer Rekening (Transfer)', 'Belanja (Shopping)', 'Tagihan (Bills)', 'Top Up e-Wallet', 'Investasi (Investment)'],
    income: [
      'Tabungan (Savings)',
      'Gaji (Salary)',
      'Pengembalian Dana (Refund)'
    ]
  };

  const categoryIcons: Record<string, any> = {
    'Transfer Rekening (Transfer)': ArrowRightLeft,
    'Belanja (Shopping)': ShoppingCart,
    'Tagihan (Bills)': Receipt,
    'Top Up e-Wallet': Smartphone,
    'Investasi (Investment)': TrendingUp,
    'Tabungan (Savings)': Landmark,
    'Gaji (Salary)': Briefcase,
    'Pengembalian Dana (Refund)': Undo
  };

  // Lifecycle
  onMount(() => {
    if (!$authStore.user) {
      goto('/login');
      return;
    }
    loadData();
  });

  // Local Storage Logic
  function getStorageKey() {
    return `mazeeda_finance_${$authStore.user?.email || 'default'}`;
  }

  function loadData() {
    try {
      const data = localStorage.getItem(getStorageKey());
      if (data) {
        transactions = JSON.parse(data);
        // Migrate old data
        transactions = transactions.map(t => ({
          ...t,
          walletId: t.walletId || 'default'
        }));
        transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }

      const walletsData = localStorage.getItem(getStorageKey() + '_wallets');
      if (walletsData) {
        wallets = JSON.parse(walletsData);
      } else {
        wallets = [{ id: 'default', name: 'Uang Pribadi' }];
      }
    } catch (e) {
      console.error("Failed to load finance data", e);
    }
    isLoaded = true;
  }

  function saveData() {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(transactions));
      localStorage.setItem(getStorageKey() + '_wallets', JSON.stringify(wallets));
    } catch (e) {
      console.error("Failed to save finance data", e);
    }
  }

  function openWalletModal() {
    newWalletName = '';
    showWalletModal = true;
  }

  function saveWallet(e: Event) {
    e.preventDefault();
    if (!newWalletName.trim()) return;
    
    const newWallet: Wallet = {
      id: crypto.randomUUID(),
      name: newWalletName.trim()
    };
    wallets = [...wallets, newWallet];
    activeWalletId = newWallet.id;
    saveData();
    showWalletModal = false;
  }

  function deleteWallet(id: string) {
    openConfirm('Hapus Buku Catatan', 'Yakin ingin menghapus buku ini beserta seluruh transaksinya?', () => {
      wallets = wallets.filter(w => w.id !== id);
      transactions = transactions.filter(t => t.walletId !== id);
      
      // Jika semua buku terhapus, buat ulang satu buku default kosong
      if (wallets.length === 0) {
        wallets = [{ id: 'default', name: 'Uang Pribadi' }];
      }
      
      activeWalletId = wallets[0].id;
      saveData();
    });
  }

  // Handlers
  function openModal(transaction?: Transaction) {
    if (transaction) {
      isEditing = true;
      editingId = transaction.id;
      formData = {
        type: transaction.type,
        amount: transaction.amount.toString(),
        category: transaction.category,
        note: transaction.note,
        date: transaction.date
      };
      displayAmount = formatInputNumber(transaction.amount.toString());
    } else {
      isEditing = false;
      editingId = null;
      formData = {
        type: 'expense',
        amount: '',
        category: 'Transfer Rekening (Transfer)',
        note: '',
        date: new Date().toISOString().split('T')[0]
      };
      displayAmount = '';
    }
    showModal = true;
  }

  function closeModal() {
    showModal = false;
  }

  function handleTypeChange(newType: 'income' | 'expense') {
    formData.type = newType;
    formData.category = categories[newType][0];
  }

  function formatInputNumber(value: string) {
    if (!value) return '';
    return Number(value).toLocaleString('id-ID');
  }

  function handleAmountInput(e: Event) {
    const input = (e.target as HTMLInputElement).value;
    const rawValue = input.replace(/\D/g, '');
    formData.amount = rawValue;
    displayAmount = formatInputNumber(rawValue);
  }

  function handleSave(e: Event) {
    e.preventDefault();
    if (!formData.amount || isNaN(Number(formData.amount))) return;

    const amountNum = Number(formData.amount);
    if (amountNum <= 0) return;

    if (isEditing && editingId) {
      const index = transactions.findIndex(t => t.id === editingId);
      if (index !== -1) {
        transactions[index] = {
          ...transactions[index],
          type: formData.type,
          amount: amountNum,
          category: formData.category,
          note: formData.note,
          date: formData.date
        };
      }
    } else {
      const newTransaction: Transaction = {
        id: crypto.randomUUID(),
        walletId: activeWalletId,
        type: formData.type,
        amount: amountNum,
        category: formData.category,
        note: formData.note,
        date: formData.date
      };
      transactions = [newTransaction, ...transactions];
    }
    
    transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    saveData();
    closeModal();
  }

  function handleDelete(id: string, e: Event) {
    e.stopPropagation();
    openConfirm('Hapus Transaksi', 'Yakin ingin menghapus catatan ini?', () => {
      transactions = transactions.filter(t => t.id !== id);
      saveData();
      closeModal();
    });
  }

  function formatIDR(amount: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  }

  function formatCompactIDR(amount: number) {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      notation: 'compact', 
      maximumFractionDigits: 1 
    }).format(amount);
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  }
</script>

<svelte:head>
  <title>Cash Flow | MAZEEDA</title>
</svelte:head>

<div class="min-h-screen bg-slate-50 pb-20">
  <!-- Header -->
  <PageHeader title="Manajemen Uang" backText="Dashboard" />

  <main class="max-w-4xl mx-auto px-4 py-6 space-y-6">
    {#if !isLoaded}
      <div class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    {:else}
      <!-- Balance Card -->
      <div class="bg-primary rounded-3xl p-6 text-white shadow-lg shadow-primary/30 relative overflow-hidden">
        <!-- Decoration -->
        <div class="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div class="absolute -left-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none"></div>
        
        <div class="relative z-10 space-y-1">
          <p class="text-white/80 text-sm font-medium">Sisa Saldo Anda</p>
          <h2 class="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight break-all">{formatIDR(currentBalance)}</h2>
        </div>

        <div class="grid grid-cols-2 gap-4 mt-8 relative z-10">
          <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100/50">
            <div class="flex items-center gap-2 mb-1">
              <div class="p-1 rounded-full bg-emerald-50 text-emerald-500">
                <ArrowDownCircle class="w-4 h-4" />
              </div>
              <p class="text-slate-500 text-xs font-bold">Pemasukan</p>
            </div>
            <p class="font-black text-emerald-600 text-base break-all">{formatIDR(totalIncome)}</p>
          </div>
          <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100/50">
            <div class="flex items-center gap-2 mb-1">
              <div class="p-1 rounded-full bg-rose-50 text-rose-500">
                <ArrowUpCircle class="w-4 h-4" />
              </div>
              <p class="text-slate-500 text-xs font-bold">Pengeluaran</p>
            </div>
            <p class="font-black text-rose-600 text-base break-all">{formatIDR(totalExpense)}</p>
          </div>
        </div>
      </div>

      <!-- Book/Wallet Selector -->
      <div class="flex items-center gap-3">
        <div class="relative flex-1">
          <button 
            on:click={() => showWalletDropdown = !showWalletDropdown}
            class="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 font-bold text-slate-800 shadow-sm outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between text-lg"
          >
            <span class="truncate">{wallets.find(w => w.id === activeWalletId)?.name}</span>
            <ChevronDown class="w-5 h-5 text-slate-400 transition-transform {showWalletDropdown ? 'rotate-180' : ''} shrink-0" />
          </button>
          
          {#if showWalletDropdown}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div class="fixed inset-0 z-40" on:click={() => showWalletDropdown = false}></div>
            <div 
              class="absolute z-50 mt-2 w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
              transition:slide={{ duration: 200 }}
            >
              <div class="max-h-60 overflow-y-auto py-2">
                {#each wallets as w}
                  <button 
                    class="w-full px-4 py-3 text-left font-bold transition-colors hover:bg-slate-50 flex items-center justify-between {activeWalletId === w.id ? 'text-blue-600 bg-blue-50/50' : 'text-slate-700'}"
                    on:click={() => { activeWalletId = w.id; showWalletDropdown = false; }}
                  >
                    <span class="truncate">{w.name}</span>
                    {#if activeWalletId === w.id}
                      <div class="w-2 h-2 rounded-full bg-blue-600 shrink-0"></div>
                    {/if}
                  </button>
                {/each}
              </div>
            </div>
          {/if}
        </div>
        <button 
          on:click={openWalletModal} 
          class="bg-blue-50 text-blue-600 p-3 rounded-2xl hover:bg-blue-100 transition-colors shadow-sm flex items-center justify-center shrink-0"
          aria-label="Tambah Buku"
        >
          <Plus class="w-6 h-6" />
        </button>
        <button 
          on:click={() => deleteWallet(activeWalletId)} 
          class="bg-rose-50 text-rose-500 p-3 rounded-2xl hover:bg-rose-100 transition-colors shadow-sm flex items-center justify-center shrink-0"
          aria-label="Hapus Buku"
        >
          <Trash2 class="w-6 h-6" />
        </button>
      </div>

      <!-- Quick Actions & History -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="font-bold text-slate-800 flex items-center gap-2">
            <History class="w-4 h-4 text-slate-400" />
            Riwayat Transaksi
          </h3>
          <button 
            on:click={() => openModal()}
            class="bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Plus class="w-3.5 h-3.5" /> Tambah Data
          </button>
        </div>

        {#if activeTransactions.length === 0}
          <div class="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-sm flex flex-col items-center justify-center space-y-3">
            <div class="w-32 h-32 flex items-center justify-center mb-2">
              <img src="/images/wallet-animation.svg" alt="Belum ada catatan" class="w-full h-full object-contain" />
            </div>
            <p class="text-slate-500 text-sm font-medium">Belum ada catatan keuangan.</p>
            <button 
              on:click={() => openModal()}
              class="text-blue-600 font-bold text-sm hover:underline"
            >
              Mulai catat sekarang
            </button>
          </div>
        {:else}
          <div class="space-y-3">
            {#each activeTransactions as t (t.id)}
              <!-- svelte-ignore a11y-click-events-have-key-events -->
              <!-- svelte-ignore a11y-no-static-element-interactions -->
              <div 
                class="py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between group"
                on:click={() => openModal(t)}
                transition:slide|local
              >
                <div class="flex-1 min-w-0 flex items-center gap-4 px-2 sm:px-0">
                  <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-white {t.type === 'income' ? 'bg-[#298EEA]' : 'bg-rose-500'}">
                    <svelte:component this={categoryIcons[t.category] || FileText} class="w-6 h-6" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="font-bold text-slate-800 text-[15px] truncate mb-0.5">{t.note || t.category}</h4>
                    <p class="text-[11px] text-slate-400 font-medium truncate">{formatDate(t.date)}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2 pl-3 shrink-0 pr-2 sm:pr-0 text-right">
                  <span class="font-bold text-[15px] break-all {t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}">
                    {t.type === 'income' ? '+ ' : '- '}{formatIDR(t.amount).replace('Rp', '').trim()}
                  </span>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  </main>
</div>

<!-- Modal Form -->
{#if showModal}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div 
    class="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm p-0 sm:p-4"
    transition:fade={{ duration: 200 }}
    on:click={closeModal}
  >
    <div 
      class="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[95dvh] overflow-y-auto"
      on:click|stopPropagation
      transition:slide={{ duration: 300, axis: 'y' }}
    >
      <div class="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50 shrink-0 rounded-t-3xl">
        <h3 class="font-bold text-slate-800">{isEditing ? 'Edit Transaksi' : 'Tambah Transaksi'}</h3>
        <div class="flex items-center gap-2">
          {#if isEditing && editingId}
            <button on:click={(e) => handleDelete(editingId, e)} class="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors" aria-label="Hapus">
              <Trash2 class="w-5 h-5" />
            </button>
          {/if}
          <button on:click={closeModal} class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors" aria-label="Tutup">
            <X class="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <form id="form-keuangan" on:submit={handleSave} class="p-5 space-y-5">
        <!-- Type Selector -->
        <div class="flex bg-slate-100 p-1 rounded-xl">
          <button 
            type="button"
            class="flex-1 py-2 text-sm font-bold rounded-lg transition-colors {formData.type === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}"
            on:click={() => handleTypeChange('expense')}
          >
            Pengeluaran
          </button>
          <button 
            type="button"
            class="flex-1 py-2 text-sm font-bold rounded-lg transition-colors {formData.type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}"
            on:click={() => handleTypeChange('income')}
          >
            Pemasukan
          </button>
        </div>

        <div class="space-y-4">
          <!-- Nominal -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider" for="amount">Nominal (Rp)</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
              <input 
                id="amount"
                type="text" 
                inputmode="numeric"
                pattern="[0-9.]*"
                value={displayAmount} 
                on:input={handleAmountInput}
                placeholder="0"
                required
                class="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>
          </div>

          <!-- Kategori -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider" for="category">Kategori</label>
            <div class="relative">
              <button 
                type="button"
                on:click={() => showCategoryDropdown = !showCategoryDropdown}
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all flex items-center justify-between"
              >
                <span class="truncate">{formData.category}</span>
                <ChevronDown class="w-5 h-5 text-slate-400 transition-transform {showCategoryDropdown ? 'rotate-180' : ''} shrink-0" />
              </button>
              
              {#if showCategoryDropdown}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <div class="fixed inset-0 z-40" on:click={() => showCategoryDropdown = false}></div>
                <div 
                  class="absolute z-50 mt-2 w-full bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden"
                  transition:slide={{ duration: 200 }}
                >
                  <div class="max-h-48 overflow-y-auto py-2">
                    {#each categories[formData.type] as cat}
                      <button 
                        type="button"
                        class="w-full px-4 py-3 text-left font-medium transition-colors hover:bg-slate-50 {formData.category === cat ? 'text-blue-600 bg-blue-50/50' : 'text-slate-700'}"
                        on:click={() => { formData.category = cat; showCategoryDropdown = false; }}
                      >
                        {cat}
                      </button>
                    {/each}
                  </div>
                </div>
              {/if}
            </div>
          </div>

          <!-- Tanggal -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider" for="date">Tanggal</label>
            <div class="relative">
              <input 
                id="date"
                type="text" 
                use:datepicker
                bind:value={formData.date}
                required
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
              <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <Calendar class="w-5 h-5" />
              </div>
            </div>
          </div>

          <!-- Keterangan -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider" for="note">Keterangan Singkat</label>
            <input 
              id="note"
              type="text" 
              bind:value={formData.note}
              placeholder="Contoh: Beli nasi goreng"
              class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            />
          </div>
        </div>

      </form>
      <div class="p-5 border-t border-slate-100 bg-white shrink-0" style="padding-bottom: max(1.25rem, env(safe-area-inset-bottom, 1.25rem));">
        <button 
          type="submit" 
          form="form-keuangan"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
        >
          <Save class="w-4 h-4" />
          {isEditing ? 'Simpan Perubahan' : 'Simpan Transaksi'}
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Modal Tambah Buku/Dompet -->
{#if showWalletModal}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div 
    class="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm p-0 sm:p-4"
    transition:fade={{ duration: 200 }}
    on:click={() => showWalletModal = false}
  >
    <div 
      class="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col"
      on:click|stopPropagation
      transition:slide={{ duration: 300, axis: 'y' }}
    >
      <div class="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50 rounded-t-3xl">
        <h3 class="font-bold text-slate-800">Tambah Buku Catatan Baru</h3>
        <button on:click={() => showWalletModal = false} class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
          <X class="w-5 h-5" />
        </button>
      </div>
      
      <form on:submit={saveWallet} class="p-5 space-y-5">
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-slate-500 uppercase tracking-wider" for="walletName">Judul Catatan (Contoh: Uang Naila)</label>
          <input 
            id="walletName"
            type="text" 
            bind:value={newWalletName}
            placeholder="Masukkan judul..."
            required
            class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
          />
        </div>
        <button 
          type="submit" 
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
        >
          <Save class="w-4 h-4" />
          Simpan Buku
        </button>
      </form>
    </div>
  </div>
{/if}

<!-- Custom Confirm Modal -->
{#if confirmDialog.isOpen}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div 
    class="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
    transition:fade={{ duration: 200 }}
    on:click={confirmDialog.onCancel}
  >
    <div 
      class="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 space-y-4 text-center"
      on:click|stopPropagation
      transition:scale={{ duration: 200, start: 0.95 }}
    >
      <div class="mx-auto w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-2">
        <AlertCircle class="w-6 h-6" />
      </div>
      <h3 class="font-black text-slate-800 text-lg">{confirmDialog.title}</h3>
      <p class="text-slate-500 text-sm font-medium">{confirmDialog.message}</p>
      
      <div class="grid grid-cols-2 gap-3 pt-2">
        <button 
          on:click={confirmDialog.onCancel}
          class="px-4 py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          Batal
        </button>
        <button 
          on:click={confirmDialog.onConfirm}
          class="px-4 py-3 rounded-xl font-bold text-white bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/20 transition-colors"
        >
          Ya, Hapus
        </button>
      </div>
    </div>
  </div>
{/if}
