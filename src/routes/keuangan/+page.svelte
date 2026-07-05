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
    PiggyBank, Briefcase, Undo, FileText
  } from 'lucide-svelte';
  import flatpickr from 'flatpickr';
  import 'flatpickr/dist/flatpickr.css';

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
  interface Transaction {
    id: string;
    type: 'income' | 'expense';
    amount: number;
    category: string;
    note: string;
    date: string;
  }

  let transactions: Transaction[] = [];
  let isLoaded = false;

  // Derived stats
  $: totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  $: totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  $: currentBalance = totalIncome - totalExpense;

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
    'Tabungan (Savings)': PiggyBank,
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
        transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }
    } catch (e) {
      console.error("Failed to load finance data", e);
    }
    isLoaded = true;
  }

  function saveData() {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(transactions));
    } catch (e) {
      console.error("Failed to save finance data", e);
    }
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
    if (confirm('Yakin ingin menghapus catatan ini?')) {
      transactions = transactions.filter(t => t.id !== id);
      saveData();
    }
  }

  function formatIDR(amount: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
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
  <header class="bg-white sticky top-0 z-30 shadow-sm">
    <div class="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <a href="/" class="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors">
          <ArrowLeft class="w-5 h-5" />
        </a>
        <h1 class="font-bold text-slate-800 flex items-center gap-2">
          <span class="p-1.5 rounded-lg bg-blue-100 text-blue-600">
            <Wallet class="w-4 h-4" />
          </span>
          Cash Flow
        </h1>
      </div>
    </div>
  </header>

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
          <h2 class="text-3xl sm:text-4xl font-black tracking-tight">{formatIDR(currentBalance)}</h2>
        </div>

        <div class="grid grid-cols-2 gap-4 mt-8 relative z-10">
          <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100/50">
            <div class="flex items-center gap-2 mb-1">
              <div class="p-1 rounded-full bg-emerald-50 text-emerald-500">
                <ArrowDownCircle class="w-4 h-4" />
              </div>
              <p class="text-slate-500 text-xs font-bold">Pemasukan</p>
            </div>
            <p class="font-black text-emerald-600 text-base">{formatIDR(totalIncome)}</p>
          </div>
          <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100/50">
            <div class="flex items-center gap-2 mb-1">
              <div class="p-1 rounded-full bg-rose-50 text-rose-500">
                <ArrowUpCircle class="w-4 h-4" />
              </div>
              <p class="text-slate-500 text-xs font-bold">Pengeluaran</p>
            </div>
            <p class="font-black text-rose-600 text-base">{formatIDR(totalExpense)}</p>
          </div>
        </div>
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

        {#if transactions.length === 0}
          <div class="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-sm flex flex-col items-center justify-center space-y-3">
            <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-2">
              <Wallet class="w-8 h-8" />
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
            {#each transactions as t (t.id)}
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
                <div class="flex items-center gap-2 pl-3 shrink-0 pr-2 sm:pr-0">
                  <span class="font-bold text-[15px] whitespace-nowrap {t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}">
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
    class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm p-0 sm:p-4"
    transition:fade={{ duration: 200 }}
    on:click={closeModal}
  >
    <div 
      class="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
      on:click|stopPropagation
      transition:slide={{ duration: 300, axis: 'y' }}
    >
      <div class="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
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
      
      <form on:submit={handleSave} class="flex-1 overflow-y-auto p-5 space-y-5">
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
              <select 
                id="category"
                bind:value={formData.category}
                class="w-full px-4 py-3 pr-10 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all appearance-none"
              >
                {#each categories[formData.type] as cat}
                  <option value={cat}>{cat}</option>
                {/each}
              </select>
              <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown class="w-5 h-5" />
              </div>
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

        <div class="pt-4 border-t border-slate-100">
          <button 
            type="submit" 
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            <Save class="w-4 h-4" />
            {isEditing ? 'Simpan Perubahan' : 'Simpan Transaksi'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
