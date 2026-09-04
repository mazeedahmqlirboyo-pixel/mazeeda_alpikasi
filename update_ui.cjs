const fs = require('fs');
const file = 'src/routes/zakat-faraidh/+page.svelte';
let s = fs.readFileSync(file, 'utf8');

const target = `          <!-- svelte-ignore a11y-label-has-associated-control -->
          <label
            class="flex items-center space-x-2.5 cursor-pointer select-none"
          >
            <input
              type="checkbox"
              bind:checked={potongKebutuhan}
              class="h-4.5 w-4.5 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary/20"
            />
            <span class="text-xs font-bold text-slate-600 dark:text-slate-200"
              >{$t('zakat.kurangi_kebutuhan') || 'Kurangi Kebutuhan Pokok Bulanan'}</span
            >
          </label>

          {#if potongKebutuhan}
            <div in:slide={{ duration: 150 }} class="space-y-1.5 pl-7">`;

const replacement = `          <label class="relative inline-flex items-center cursor-pointer select-none">
            <input type="checkbox" bind:checked={potongKebutuhan} class="sr-only peer">
            <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
            <span class="ml-3 text-xs font-bold text-slate-600 dark:text-slate-200">
              {$t('zakat.kurangi_kebutuhan') || 'Kurangi Kebutuhan Pokok Bulanan'}
            </span>
          </label>

          {#if potongKebutuhan}
            <div in:slide={{ duration: 150 }} class="space-y-1.5">`;

s = s.replace(target, replacement);

fs.writeFileSync(file, s);
console.log('UI updated');
