const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'routes', 'zakat-faraidh', '+page.svelte');
let s = fs.readFileSync(file, 'utf8');

// 1. Add state and array for currency dropdown
const zakatItemsRegex = /(const zakatItems = \[[\s\S]*?\];)/;
const replacementVariables = `$1

  let isCurrencyDropdownOpen = false;
  const currencyItems = [
    { value: "IDR", label: "IDR (Rp)", icon: "🇮🇩" },
    { value: "USD", label: "USD ($)", icon: "🇺🇸" },
    { value: "SAR", label: "SAR (ر.س)", icon: "🇸🇦" },
    { value: "CNY", label: "CNY (¥)", icon: "🇨🇳" },
    { value: "JPY", label: "JPY (¥)", icon: "🇯🇵" },
    { value: "KRW", label: "KRW (₩)", icon: "🇰🇷" },
  ];`;

s = s.replace(zakatItemsRegex, replacementVariables);

// 2. Replace HTML for Currency Selector
const oldSelectorRegex = /<!-- Currency Selector -->[\s\S]*?(?=<\/div>\s*\{\/if\}\s*<!-- Harga Acuan Customizer)/;

const newSelectorHTML = `<!-- Currency Selector -->
    <div class="relative w-full sm:w-56 space-y-1.5">
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none flex items-center gap-1">
        <span>{$t('zakat.pilih_mata_uang') || 'Pilih Mata Uang'}</span>
        <span class="text-slate-350 dark:text-slate-600 text-[8px] animate-pulse">▼</span>
      </label>
      
      <button
        type="button"
        on:click={() => (isCurrencyDropdownOpen = !isCurrencyDropdownOpen)}
        class="w-full flex items-center justify-between px-4 h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-slate-350 dark:hover:border-slate-600 hover:bg-slate-50/30 dark:hover:bg-slate-800 text-sm font-bold text-slate-700 dark:text-slate-200 rounded-xl focus:outline-none transition-all cursor-pointer shadow-soft-xs"
      >
        <div class="flex items-center gap-2.5">
          <span class="text-base shrink-0">
            {currencyItems.find(item => item.value === selectedCurrency)?.icon || '💱'}
          </span>
          <span class="truncate">
            {currencyItems.find(item => item.value === selectedCurrency)?.label || 'IDR (Rp)'}
          </span>
        </div>
        <div class="text-emerald-500 transition-transform duration-200 shrink-0 {isCurrencyDropdownOpen ? 'rotate-180' : ''}">
          <ChevronDown class="h-4.5 w-4.5" />
        </div>
      </button>
      <p class="text-[10px] text-slate-400/80 dark:text-slate-500/80 text-center font-medium leading-none pt-1">
        *{$t('zakat.ketuk_tombol_mata_uang') || 'Ketuk tombol di atas untuk memilih atau mengubah jenis mata uang'}
      </p>

      {#if isCurrencyDropdownOpen}
        <!-- Backdrop -->
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="fixed inset-0 z-10" on:click={() => (isCurrencyDropdownOpen = false)}></div>

        <!-- Dropdown Menu List -->
        <div
          in:slide={{ duration: 150 }}
          out:slide={{ duration: 100 }}
          class="absolute left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 rounded-xl shadow-lg z-20 max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800"
        >
          {#each currencyItems as item}
            <button
              type="button"
              on:click={() => {
                selectedCurrency = item.value;
                isCurrencyDropdownOpen = false;
              }}
              class="w-full flex items-center gap-3 px-4 py-3 text-xs sm:text-sm font-bold text-left transition-colors cursor-pointer
                     {selectedCurrency === item.value 
                ? 'bg-emerald-50/50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' 
                : 'text-slate-650 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}"
            >
              <span class="text-base">{item.icon}</span>
              <span class="flex-1">{item.label}</span>
              {#if selectedCurrency === item.value}
                <span class="text-emerald-500">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </span>
              {/if}
            </button>
          {/each}
        </div>
      {/if}
    </div>
    
    </div>
  {/if}
`;

s = s.replace(oldSelectorRegex, newSelectorHTML);

fs.writeFileSync(file, s, 'utf8');
console.log('Currency Selector updated to custom dropdown.');
