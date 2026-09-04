const fs = require('fs');
const file = 'src/routes/zakat-faraidh/+page.svelte';
let s = fs.readFileSync(file, 'utf8');

function injectDark(str, lightCls, darkCls) {
  let replaced = str.split(lightCls).join(`${lightCls} ${darkCls}`);
  replaced = replaced.split(`${lightCls} ${darkCls} ${darkCls}`).join(`${lightCls} ${darkCls}`);
  return replaced;
}

// Fix "Harga Emas Acuan" and any other very dark text
s = injectDark(s, 'text-slate-800', 'dark:text-slate-200');
s = injectDark(s, 'text-slate-900', 'dark:text-slate-100');
s = injectDark(s, 'text-slate-650', 'dark:text-slate-200');

// Fix the active dropdown item
// From: 'bg-emerald-50/50 text-emerald-600'
// To:   'bg-emerald-50/50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
s = s.replace(
  /'bg-emerald-50\/50 text-emerald-600'/g,
  "'bg-emerald-50/50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'"
);

// Clean up
s = s.replace(/dark:text-slate-200 dark:text-slate-200/g, 'dark:text-slate-200');
s = s.replace(/dark:text-slate-100 dark:text-slate-100/g, 'dark:text-slate-100');

fs.writeFileSync(file, s);
console.log('Final dark mode polish applied!');
