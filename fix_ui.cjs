const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'routes', 'zakat-faraidh', '+page.svelte');
let s = fs.readFileSync(file, 'utf8');

// 1. Add Currency Selector next to Zakat Type Selector
// Around line 952:
/*
  {#if calculatorType === "zakat"}
    <!-- Zakat Type Selector Dropdown -->
    <div class="relative space-y-1.5">
*/
const zakatSelectorRegex = /\{#if calculatorType === "zakat"\}\s*<!-- Zakat Type Selector Dropdown -->\s*<div class="relative space-y-1\.5">/;

const zakatSelectorReplacement = `{#if calculatorType === "zakat"}
    <div class="flex flex-col sm:flex-row gap-4">
    <!-- Zakat Type Selector Dropdown -->
    <div class="relative flex-1 space-y-1.5">`;

s = s.replace(zakatSelectorRegex, zakatSelectorReplacement);

// Now we need to close the div for Zakat Type Selector and add the Currency Selector
const dropdownEndRegex = /<\/div>\s*\{\/if\}\s*<\/div>\s*\{\/if\}/;

const dropdownEndReplacement = `    </div>
      {/if}
    </div>
    
    <!-- Currency Selector -->
    <div class="relative w-full sm:w-48 space-y-1.5">
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none flex items-center gap-1">
        <span>{$t('zakat.mata_uang') || 'Mata Uang'}</span>
      </label>
      <select
        bind:value={selectedCurrency}
        class="w-full px-4 h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-slate-350 dark:hover:border-slate-600 text-sm font-bold text-slate-700 dark:text-slate-200 rounded-xl focus:outline-none transition-all cursor-pointer shadow-soft-xs appearance-none"
      >
        <option value="IDR">IDR (Rp)</option>
        <option value="USD">USD ($)</option>
        <option value="SAR">SAR (ر.س)</option>
        <option value="CNY">CNY (¥)</option>
        <option value="JPY">JPY (¥)</option>
        <option value="KRW">KRW (₩)</option>
      </select>
      <div class="pointer-events-none absolute inset-y-0 right-0 top-[18px] flex items-center px-4 text-emerald-500">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </div>
    </div>
    
    </div>
  {/if}`;

s = s.replace(dropdownEndRegex, dropdownEndReplacement);


// 2. Fix dark mode styling for the Header Button (bg-white -> bg-white dark:bg-slate-900)
// <button type="button" on:click={() => (isDropdownOpen = !isDropdownOpen)} class="w-full flex items-center justify-between px-4 h-12 bg-white border border-slate-200 hover:border-slate-350 hover:bg-slate-50/30 text-sm font-bold text-slate-700 rounded-xl focus:outline-none transition-all cursor-pointer shadow-soft-xs">
s = s.replace(
  /class="w-full flex items-center justify-between px-4 h-12 bg-white border border-slate-200 hover:border-slate-350 hover:bg-slate-50\/30 text-sm font-bold text-slate-700 rounded-xl focus:outline-none transition-all cursor-pointer shadow-soft-xs"/g,
  'class="w-full flex items-center justify-between px-4 h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-slate-350 dark:hover:border-slate-600 hover:bg-slate-50/30 dark:hover:bg-slate-800 text-sm font-bold text-slate-700 dark:text-slate-200 rounded-xl focus:outline-none transition-all cursor-pointer shadow-soft-xs"'
);

// Dropdown Menu List dark mode
s = s.replace(
  /class="absolute left-0 right-0 mt-1\.5 bg-white border border-slate-200\/80 rounded-xl shadow-lg z-20 max-h-80 overflow-y-auto divide-y divide-slate-100"/g,
  'class="absolute left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 rounded-xl shadow-lg z-20 max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800"'
);

// Fix Card component `bg-emerald-50/30` -> `bg-emerald-50/30 dark:bg-slate-900/50`
s = s.replace(
  /class="bg-emerald-50\/30 border-emerald-250\/20 p-4"/g,
  'class="bg-emerald-50/30 dark:bg-slate-800/50 border-emerald-250/20 dark:border-emerald-900/30 p-4"'
);

// Fix Card component `<Card>` to `<Card class="dark:bg-slate-900 dark:border-slate-800">`
s = s.replace(/<Card>/g, '<Card class="dark:bg-slate-900 dark:border-slate-800">');

// Fix text colors in cards: text-slate-800 -> text-slate-800 dark:text-slate-100
s = s.replace(/text-slate-800(?! dark:)/g, 'text-slate-800 dark:text-slate-100');
s = s.replace(/text-slate-700(?! dark:)/g, 'text-slate-700 dark:text-slate-200');
s = s.replace(/text-slate-600(?! dark:)/g, 'text-slate-600 dark:text-slate-300');
s = s.replace(/text-slate-500(?! dark:)/g, 'text-slate-500 dark:text-slate-400');
s = s.replace(/text-slate-400(?! dark:)/g, 'text-slate-400 dark:text-slate-500');

// Fix input dark mode
// `bg-white dark:bg-slate-900 text-slate-800 dark:text-white border-slate-200 dark:border-slate-700 focus:border-emerald-500`
// The inputs in the screenshot look completely grey. Let's force proper classes on them.
s = s.replace(
  /class="([^"]*w-full[^"]*px-10[^"]*bg-slate-50\/50[^"]*)"/g,
  function(match, p1) {
    let classes = p1;
    classes = classes.replace('bg-slate-50/50', 'bg-slate-50/50 dark:bg-slate-900');
    classes = classes.replace('border-slate-200', 'border-slate-200 dark:border-slate-700');
    return `class="${classes}"`;
  }
);

// Fix Result Box dark mode
// `bg-emerald-50/50` -> `bg-emerald-50/50 dark:bg-emerald-950/20`
s = s.replace(/bg-emerald-50\/50/g, 'bg-emerald-50/50 dark:bg-emerald-950/30');

// Fix generic `bg-white` -> `bg-white dark:bg-slate-900`
// Let's manually replace some known ones instead of all to avoid breaking specific designs
s = s.replace(/bg-slate-50\/50/g, 'bg-slate-50/50 dark:bg-slate-900');
s = s.replace(/bg-slate-50/g, 'bg-slate-50 dark:bg-slate-800');

// Additional UI fix: In the screenshot, the "Rp" prefix in the input box is still Rp even though selectedCurrency might be different.
// Wait, the grep search showed that the previous agent already replaced Rp with `{selectedCurrency === 'IDR' ? 'Rp' : ...}` in the inputs.
// If it's still Rp in the screenshot, it's because selectedCurrency was hardcoded to "IDR" in the script and the user couldn't change it!
// Now that we added the selector, it will change dynamically!

// Let's write the file back
fs.writeFileSync(file, s, 'utf8');
console.log('UI updated for currency selector and dark mode.');
