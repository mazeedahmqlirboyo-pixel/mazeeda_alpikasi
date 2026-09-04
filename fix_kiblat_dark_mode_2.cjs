const fs = require('fs');
const file = 'src/routes/kiblat/+page.svelte';
let s = fs.readFileSync(file, 'utf8');

const reps = [
  // Compass widget card
  [`bg-white/90 border-slate-200/60 backdrop-blur-md flex flex-col items-center py-8 relative overflow-hidden shadow-lg p-4`, `bg-white/90 dark:bg-slate-900/90 border-slate-200/60 dark:border-slate-700/60 backdrop-blur-md flex flex-col items-center py-8 relative overflow-hidden shadow-lg dark:shadow-none p-4`],
  
  // Compass container
  [`bg-slate-50/50 border border-slate-200/80 shadow-md flex items-center justify-center cursor-grab select-none z-10 transition-all duration-300`, `bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 shadow-md dark:shadow-none flex items-center justify-center cursor-grab select-none z-10 transition-all duration-300`],
  
  // Hover compass container
  [`hover:border-slate-300'}`, `hover:border-slate-300 dark:hover:border-slate-600'}`],
  
  // Fix Insecure context warning
  [`bg-rose-50/80 border-rose-250/30 p-4.5`, `bg-rose-50/80 dark:bg-rose-950/30 border-rose-250/30 dark:border-rose-900/50 p-4.5`]
];

for (const [from, to] of reps) {
  if (s.includes(from)) {
    s = s.replace(from, to);
  } else {
    console.log("NOT FOUND: ", from);
  }
}

fs.writeFileSync(file, s);
console.log("Remaining dark mode classes patched successfully!");
