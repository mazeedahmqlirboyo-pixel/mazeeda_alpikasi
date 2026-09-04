const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'routes', 'zakat-faraidh', '+page.svelte');
let page = fs.readFileSync(pagePath, 'utf8');

// 1. Fix the stringified translation tags in the JS block
page = page.replace(/"\{\$t\('([^']+)'\) \|\| '([^']+)'\}"/g, "$t('$1') || '$2'");

// Also fix `Ayah Kandung` that was double-wrapped: "{$t('faraidh.ayah_kandung') || 'Ayah Kandung'}"
// Wait, my regex catches exactly that. What if it had single quotes?
page = page.replace(/'\{\$t\('([^']+)'\) \|\| '([^']+)'\}'/g, "$t('$1') || '$2'");

// And backticks?
// `Anak Pr ke-${i}` is fine as is, but if there was `{$t...}` inside backticks:
page = page.replace(/`\{\$t\('([^']+)'\) \|\| '([^']+)'\}`/g, "$t('$1') || '$2'");

// 2. Fix the Results Card CSS
// Find: <div class="p-4 bg-white border-2 border-slate-100 hover:border-slate-200
page = page.replace(/class="p-4 bg-white border-2 border-slate-100 hover:border-slate-200/g, 'class="p-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600');

// 3. Fix the Catatan Hukum card CSS
// Find: class="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4
page = page.replace(/class="bg-indigo-50\/50 border border-indigo-100 rounded-2xl p-4/g, 'class="bg-indigo-50/50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl p-4');

// 4. Fix Catatan Hukum header
// Find: class="font-bold text-indigo-700 uppercase tracking-wider block"
page = page.replace(/class="font-bold text-indigo-700 uppercase tracking-wider block"/g, 'class="font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider block"');

// 5. Fix Fraction pill in result cards
// <span class="text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full
page = page.replace(/class="text-\[9px\] font-black text-emerald-700 bg-emerald-50 border border-emerald-200/g, 'class="text-[9px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800');

fs.writeFileSync(pagePath, page, 'utf8');
console.log('Fixed Faraidh results JS and CSS');
