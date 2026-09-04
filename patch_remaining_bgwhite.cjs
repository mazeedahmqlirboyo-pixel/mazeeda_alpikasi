const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'routes', 'zakat-faraidh', '+page.svelte');
let page = fs.readFileSync(pagePath, 'utf8');

// Replace all bg-white in the Advanced Faraidh Mode
// Specifically the counter blocks for Cucu, Saudara, Keponakan, Paman, Sepupu
// They look like: class="... p-2.5 rounded-xl border-2 bg-white transition-colors ..."
// or they are dynamically assigning 'border-sky-300 bg-sky-50/20' vs 'border-slate-100'

page = page.replace(/bg-white transition-colors/g, "bg-white dark:bg-slate-800 transition-colors");
page = page.replace(/'border-slate-100'/g, "'border-slate-100 dark:border-slate-700'");
page = page.replace(/'border-sky-300 bg-sky-50\/20'/g, "'border-sky-300 dark:border-sky-700 bg-sky-50/20 dark:bg-sky-900/30'");
page = page.replace(/'border-rose-300 bg-rose-50\/20'/g, "'border-rose-300 dark:border-rose-700 bg-rose-50/20 dark:bg-rose-900/30'");
page = page.replace(/'border-emerald-300 bg-emerald-50\/20'/g, "'border-emerald-300 dark:border-emerald-700 bg-emerald-50/20 dark:bg-emerald-900/30'");
page = page.replace(/'border-amber-300 bg-amber-50\/20'/g, "'border-amber-300 dark:border-amber-700 bg-amber-50/20 dark:bg-amber-900/30'");

// Also for the counters: <span class="w-6 text-center text-sm font-black text-slate-700 dark:text-slate-200">
// There are plus/minus buttons: <button ... class="h-7 w-7 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 dark:text-slate-300 ...">
page = page.replace(/class="h-7 w-7 bg-white hover:bg-slate-100 border border-slate-200/g, 'class="h-7 w-7 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600');

fs.writeFileSync(pagePath, page, 'utf8');
console.log('Fixed remaining bg-white and border classes');
