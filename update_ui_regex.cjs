const fs = require('fs');
const file = 'src/routes/zakat-faraidh/+page.svelte';
let s = fs.readFileSync(file, 'utf8');

const regex = /<!-- svelte-ignore a11y-label-has-associated-control -->\s*<label\s*class="flex items-center space-x-2\.5 cursor-pointer select-none"\s*>\s*<input\s*type="checkbox"\s*bind:checked={potongKebutuhan}\s*class="[^"]+"\s*\/>\s*<span class="text-xs font-bold text-slate-600 dark:text-slate-200"\s*>\{\$t\('zakat\.kurangi_kebutuhan'\) \|\| 'Kurangi Kebutuhan Pokok Bulanan'\}<\/span\s*>\s*<\/label>\s*\{#if potongKebutuhan\}\s*<div in:slide=\{\{\s*duration:\s*150\s*\}\}\s*class="space-y-1\.5 pl-7">/g;

const replacement = `          <label class="relative inline-flex items-center cursor-pointer select-none">
            <input type="checkbox" bind:checked={potongKebutuhan} class="sr-only peer">
            <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
            <span class="ml-3 text-xs font-bold text-slate-600 dark:text-slate-200">
              {$t('zakat.kurangi_kebutuhan') || 'Kurangi Kebutuhan Pokok Bulanan'}
            </span>
          </label>

          {#if potongKebutuhan}
            <div in:slide={{ duration: 150 }} class="space-y-1.5">`;

if (regex.test(s)) {
    s = s.replace(regex, replacement);
    fs.writeFileSync(file, s);
    console.log('UI updated successfully via regex');
} else {
    console.log('Regex did not match!');
}
