const fs = require('fs');
const file = 'src/routes/zakat-faraidh/+page.svelte';
let s = fs.readFileSync(file, 'utf8');

// A function to add a dark class only if it's not already there
function injectDark(str, lightCls, darkCls) {
  // Regex to find lightCls that is not followed immediately by darkCls
  // This is a bit tricky with plain strings, so we'll just replace the light class
  // with (light + dark), then clean up any (light + dark + dark) duplicates.
  let replaced = str.split(lightCls).join(`${lightCls} ${darkCls}`);
  // Clean up duplicates just in case
  replaced = replaced.split(`${lightCls} ${darkCls} ${darkCls}`).join(`${lightCls} ${darkCls}`);
  // Also clean up if there was already a different dark class, e.g. dark:bg-slate-900? 
  // We just assume the developer missed them entirely in this file.
  return replaced;
}

// 1. Zakat Penghasilan Dropdown (bg-white border border-slate-200 text-slate-700)
// 2. Harga Emas input (bg-white border border-slate-200 text-slate-700)
// 3. Gaji Pokok inputs (bg-slate-50/50 border border-slate-200 text-slate-700 focus:bg-white)
// 4. Rekomendasi box (bg-white border border-emerald-100)

s = injectDark(s, 'bg-white', 'dark:bg-slate-800');
s = injectDark(s, 'bg-slate-50/50', 'dark:bg-slate-900/50');
s = injectDark(s, 'bg-slate-50', 'dark:bg-slate-900/50'); // for any hover:bg-slate-50
s = injectDark(s, 'border-slate-200', 'dark:border-slate-700');
s = injectDark(s, 'text-slate-700', 'dark:text-slate-200');
s = injectDark(s, 'focus:bg-white', 'dark:focus:bg-slate-800');
s = injectDark(s, 'border-emerald-100', 'dark:border-emerald-500/20');
s = injectDark(s, 'border-emerald-250/20', 'dark:border-emerald-500/20');
s = injectDark(s, 'hover:bg-emerald-100/60', 'dark:hover:bg-emerald-500/20');
s = injectDark(s, 'text-emerald-700', 'dark:text-emerald-400');
s = injectDark(s, 'text-emerald-750', 'dark:text-emerald-300');

// Clean up weird artifacts like `hover:bg-slate-50 dark:bg-slate-900/50/50 dark:bg-slate-900/50`
s = s.replace(/dark:bg-slate-900\/50\/50/g, 'dark:bg-slate-900/50');
s = s.replace(/dark:bg-slate-900\/50 dark:bg-slate-900\/50/g, 'dark:bg-slate-900/50');
s = s.replace(/dark:bg-slate-800 dark:bg-slate-800/g, 'dark:bg-slate-800');
s = s.replace(/dark:border-slate-700 dark:border-slate-700/g, 'dark:border-slate-700');
s = s.replace(/dark:text-slate-200 dark:text-slate-200/g, 'dark:text-slate-200');

fs.writeFileSync(file, s);
console.log('Dark mode classes injected!');
