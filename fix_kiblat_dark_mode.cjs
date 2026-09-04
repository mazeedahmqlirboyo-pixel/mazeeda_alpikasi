const fs = require('fs');
const file = 'src/routes/kiblat/+page.svelte';
let s = fs.readFileSync(file, 'utf8');

const reps = [
  // Compass widget border and background
  [`bg-white border-slate-200 backdrop-blur-md`, `bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-700/60 backdrop-blur-md`],
  
  // Arahkan ponsel badge
  [`bg-slate-100 border border-slate-200 text-slate-500 font-bold`, `bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold`],
  [`text-[10px] text-slate-500 font-bold mt-1.5`, `text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-1.5`],
  
  // Compass circle background
  [`bg-slate-50 border border-slate-200 shadow-md`, `bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 shadow-md dark:shadow-none`],
  [`hover:border-slate-300"`, `hover:border-slate-300 dark:border-slate-600"`],
  
  // Hadap Ponsel / Arah Ka'bah boxes
  [`bg-slate-50 border border-slate-100 rounded-2xl`, `bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl`],
  [`text-slate-400 block uppercase`, `text-slate-400 dark:text-slate-500 block uppercase`],
  [`text-slate-800 block mt-1.5`, `text-slate-800 dark:text-slate-100 block mt-1.5`],
  
  // Center Compass icon
  [`bg-slate-100 border border-slate-200/50 flex items-center justify-center shadow-soft-xs text-slate-400`, `bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-center shadow-soft-xs text-slate-400 dark:text-slate-500`],
  
  // Manual City Selector text
  [`border-slate-100 mt-6 pt-5`, `border-slate-100 dark:border-slate-800 mt-6 pt-5`],
  [`text-slate-700 uppercase tracking-wider`, `text-slate-700 dark:text-slate-200 uppercase tracking-wider`],
  [`text-slate-400 font-normal`, `text-slate-400 dark:text-slate-500 font-normal`],
  [`border-slate-200 text-slate-600 hover:text-primary hover:border-primary/20 hover:bg-slate-50 font-extrabold`, `border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-primary hover:border-primary/20 hover:bg-slate-50 dark:hover:bg-slate-800 font-extrabold`],
  
  // iOS Permission Card
  [`bg-amber-50/80 border-amber-200/50 p-4.5`, `bg-amber-50/80 dark:bg-amber-950/30 border-amber-200/50 dark:border-amber-900/50 p-4.5`],
  [`text-slate-800 uppercase`, `text-slate-800 dark:text-slate-100 uppercase`],
  
  // Insecure Context Warning
  [`bg-rose-50/80 border-rose-250/30 p-4.5`, `bg-rose-50/80 dark:bg-rose-950/30 border-rose-200/50 dark:border-rose-900/50 p-4.5`],
  [`text-slate-800 uppercase tracking-wider text-rose-700`, `text-slate-800 dark:text-slate-100 uppercase tracking-wider text-rose-700 dark:text-rose-400`],
  
  // Steps description
  [`text-[10px] text-slate-500 leading-relaxed font-normal`, `text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal`]
];

for (const [from, to] of reps) {
  if (s.includes(from)) {
    s = s.replace(new RegExp(from.replace(/[.*+?^$\{}()|[\]\\]/g, '\\$&'), 'g'), to);
  } else {
    console.log("NOT FOUND: ", from);
  }
}

fs.writeFileSync(file, s);
console.log("Dark mode classes patched successfully!");
