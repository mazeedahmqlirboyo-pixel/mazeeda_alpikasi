const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/routes/kalender/+page.svelte');
let content = fs.readFileSync(pagePath, 'utf8');

// 1. Header Gradient
content = content.replace(
  'class="bg-gradient-to-r from-green-50/50 via-teal-50/20 to-white border border-green-100/50 dark:border-slate-700/80 shadow-sm relative rounded-2xl"',
  'class="bg-gradient-to-r from-green-50/50 via-teal-50/20 to-white dark:from-slate-900 dark:via-slate-800/80 dark:to-slate-900 border border-green-100/50 dark:border-slate-700/80 shadow-sm relative rounded-2xl"'
);

// 2. Cek Astrologi Button
content = content.replace(
  'class="w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 px-4 py-2 sm:py-2.5 text-sm sm:text-sm font-bold text-indigo-600 bg-indigo-50/80 hover:bg-indigo-100 hover:text-indigo-700 rounded-xl transition-all active:scale-95 focus:outline-none shadow-sm border border-indigo-100/50 dark:border-slate-700/80"',
  'class="w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 px-4 py-2 sm:py-2.5 text-sm sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-slate-700 hover:text-indigo-700 dark:hover:text-indigo-300 rounded-xl transition-all active:scale-95 focus:outline-none shadow-sm border border-indigo-100/50 dark:border-slate-700/80"'
);

fs.writeFileSync(pagePath, content, 'utf8');
console.log("Header dark mode fixed!");
