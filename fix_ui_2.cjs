const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'routes', 'zakat-faraidh', '+page.svelte');
let s = fs.readFileSync(file, 'utf8');

// 1. Fix "Belum Wajib Zakat" badges
// Original: class="bg-slate-200 text-slate-500 dark:text-slate-400 dark:text-slate-500 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider"
// We want: class="bg-slate-200 dark:bg-slate-700/50 text-slate-500 dark:text-slate-300 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider"
s = s.replace(
  /class="bg-slate-200 text-slate-500([^"]*) font-black text-\[9px\]/g,
  'class="bg-slate-200 dark:bg-slate-700/50 text-slate-500 dark:text-slate-300 font-black text-[9px]'
);

// Catch any other bg-slate-200 on badges just in case
s = s.replace(/class="bg-slate-200 text-slate-500 dark:text-slate-400 font-black text-\[9px\]/g, 'class="bg-slate-200 dark:bg-slate-700/50 text-slate-500 dark:text-slate-300 font-black text-[9px]');


// 2. Fix Harga Emas Acuan input and refresh button
// The input has: class="pl-9 pr-3 py-2 w-full bg-white border border-slate-200 text-xs font-bold text-slate-700 dark:text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-soft-xs"
s = s.replace(
  /class="pl-9 pr-3 py-2 w-full bg-white border border-slate-200 text-xs font-bold text-slate-700/g,
  'class="pl-9 pr-3 py-2 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700'
);

// The refresh button has: class="p-2.5 hover:bg-emerald-100/60 rounded-xl text-emerald-700 transition-colors border border-emerald-250/20 bg-white cursor-pointer shadow-soft-xs flex items-center justify-center shrink-0"
s = s.replace(
  /class="p-2\.5 hover:bg-emerald-100\/60 rounded-xl text-emerald-700 transition-colors border border-emerald-250\/20 bg-white cursor-pointer shadow-soft-xs/g,
  'class="p-2.5 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/30 rounded-xl text-emerald-700 dark:text-emerald-500 transition-colors border border-emerald-250/20 dark:border-emerald-900/50 bg-white dark:bg-slate-900 cursor-pointer shadow-soft-xs'
);

fs.writeFileSync(file, s, 'utf8');
console.log('UI fixed for gold input and badges.');
