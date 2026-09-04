const fs = require('fs');
const file = 'src/routes/kiblat/+page.svelte';
let s = fs.readFileSync(file, 'utf8');

const reps = [
  [`bg-white/70 border border-slate-200/50 rounded-2xl p-4 flex gap-3.5 items-center hover:border-slate-300/80 transition-all duration-300 shadow-soft-xs`, `bg-white/70 dark:bg-slate-800/70 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-4 flex gap-3.5 items-center hover:border-slate-300/80 dark:hover:border-slate-600/80 transition-all duration-300 shadow-soft-xs dark:shadow-none`],
  [`<h4 class="text-xs font-bold text-slate-800">{item.title}</h4>`, `<h4 class="text-xs font-bold text-slate-800 dark:text-slate-100">{item.title}</h4>`]
];

for (const [from, to] of reps) {
  if (s.includes(from)) {
    s = s.replace(from, to);
  } else {
    console.log("NOT FOUND: ", from);
  }
}

fs.writeFileSync(file, s);
console.log("Step cards dark mode patched successfully!");
