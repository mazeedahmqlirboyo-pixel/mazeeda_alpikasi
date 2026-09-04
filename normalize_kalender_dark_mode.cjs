const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/routes/kalender/+page.svelte');
let content = fs.readFileSync(pagePath, 'utf8');

const replacements = [
  { regex: /bg-white(?!\/| dark:)/g, replacement: "bg-white dark:bg-slate-900" },
  { regex: /bg-slate-50(?!\/| dark:)/g, replacement: "bg-slate-50 dark:bg-slate-900/50" },
  { regex: /bg-slate-100(?!\/| dark:)/g, replacement: "bg-slate-100 dark:bg-slate-800" },
  { regex: /bg-slate-200(?!\/| dark:)/g, replacement: "bg-slate-200 dark:bg-slate-700" },
  { regex: /text-slate-800(?!\/| dark:)/g, replacement: "text-slate-800 dark:text-slate-100" },
  { regex: /text-slate-700(?!\/| dark:)/g, replacement: "text-slate-700 dark:text-slate-200" },
  { regex: /text-slate-600(?!\/| dark:)/g, replacement: "text-slate-600 dark:text-slate-300" },
  { regex: /text-slate-500(?!\/| dark:)/g, replacement: "text-slate-500 dark:text-slate-400" },
  { regex: /border-slate-100(?!\/| dark:)/g, replacement: "border-slate-100 dark:border-slate-800" },
  { regex: /border-slate-200(?!\/| dark:)/g, replacement: "border-slate-200 dark:border-slate-700" },
  { regex: /shadow-soft-sm(?!\/| dark:)/g, replacement: "shadow-soft-sm dark:shadow-none" },
  { regex: /shadow-soft-md(?!\/| dark:)/g, replacement: "shadow-soft-md dark:shadow-none" },
  { regex: /shadow-soft-lg(?!\/| dark:)/g, replacement: "shadow-soft-lg dark:shadow-none" },
  { regex: /shadow-md(?!\/| dark:)/g, replacement: "shadow-md dark:shadow-none" },
  { regex: /shadow-lg(?!\/| dark:)/g, replacement: "shadow-lg dark:shadow-none" },
  { regex: /shadow-xl(?!\/| dark:)/g, replacement: "shadow-xl dark:shadow-none" },
  { regex: /bg-white\/80(?!\/| dark:)/g, replacement: "bg-white/80 dark:bg-slate-900/80" },
  { regex: /bg-white\/90(?!\/| dark:)/g, replacement: "bg-white/90 dark:bg-slate-900/90" },
  // Specific sections handling
  { regex: /bg-gradient-to-br from-white via-green-50\/20 to-white/g, replacement: "bg-gradient-to-br from-white via-green-50/20 to-white dark:from-slate-900 dark:via-slate-800/80 dark:to-slate-900" },
  { regex: /border-green-100\/50/g, replacement: "border-green-100/50 dark:border-slate-700/80" },
  { regex: /bg-gradient-to-br from-indigo-50\/50 via-white to-sky-50\/30/g, replacement: "bg-gradient-to-br from-indigo-50/50 via-white to-sky-50/30 dark:from-slate-900 dark:via-slate-800/80 dark:to-slate-900" },
  { regex: /border-indigo-100\/50/g, replacement: "border-indigo-100/50 dark:border-slate-700/80" },
  { regex: /bg-gradient-to-br from-green-100 to-green-50/g, replacement: "bg-gradient-to-br from-green-100 to-green-50 dark:from-slate-800 dark:to-slate-800" },
  { regex: /bg-gradient-to-br from-green-100 to-emerald-50/g, replacement: "bg-gradient-to-br from-green-100 to-emerald-50 dark:from-slate-800 dark:to-slate-800" },
  { regex: /bg-green-50/g, replacement: "bg-green-50 dark:bg-slate-800" },
  { regex: /hover:bg-green-100/g, replacement: "hover:bg-green-100 dark:hover:bg-slate-700" },
  { regex: /text-green-700/g, replacement: "text-green-700 dark:text-green-400" },
];

replacements.forEach(({ regex, replacement }) => {
  content = content.replace(regex, replacement);
});

fs.writeFileSync(pagePath, content, 'utf8');
console.log("Kalender dark mode normalized!");
