const fs = require('fs');
const file = 'src/routes/kalender/+page.svelte';
let content = fs.readFileSync(file, 'utf8');

// 1. Fix gradients (Header, Hari Penting, Astrologi)
content = content.replace(
  'class="bg-gradient-to-r from-green-50/50 via-teal-50/20 to-white border border-green-100/50 shadow-sm dark:shadow-none relative rounded-2xl"',
  'class="bg-gradient-to-r from-green-50/50 via-teal-50/20 to-white dark:from-slate-800 dark:via-slate-800/60 dark:to-slate-900 border border-green-100/50 dark:border-slate-700/80 shadow-sm dark:shadow-none relative rounded-2xl"'
);
content = content.replace(
  'class="mt-10 bg-gradient-to-br from-white via-green-50/20 to-white rounded-3xl border border-green-100/50 shadow-soft-lg overflow-hidden relative"',
  'class="mt-10 bg-gradient-to-br from-white via-green-50/20 to-white dark:from-slate-900 dark:via-slate-800/80 dark:to-slate-900 rounded-3xl border border-green-100/50 dark:border-slate-700/80 shadow-soft-lg overflow-hidden relative"'
);
content = content.replace(
  'class="mt-10 bg-gradient-to-br from-indigo-50/50 via-white to-sky-50/30 rounded-3xl border border-indigo-100/50 shadow-soft-lg p-6 sm:p-8 relative overflow-hidden"',
  'class="mt-10 bg-gradient-to-br from-indigo-50/50 via-white to-sky-50/30 dark:from-slate-900 dark:via-slate-800/80 dark:to-slate-900 rounded-3xl border border-indigo-100/50 dark:border-slate-700/80 shadow-soft-lg p-6 sm:p-8 relative overflow-hidden"'
);

// 2. Fix icon gradients
content = content.replace(
  'class="inline-flex items-center justify-center p-3 bg-gradient-to-br from-green-100 to-green-50 rounded-2xl mb-4 shadow-sm dark:shadow-none border border-green-100/50"',
  'class="inline-flex items-center justify-center p-3 bg-gradient-to-br from-green-100 to-green-50 dark:from-slate-800 dark:to-slate-800 rounded-2xl mb-4 shadow-sm dark:shadow-none border border-green-100/50 dark:border-slate-700"'
);
content = content.replace(
  'class="inline-flex items-center justify-center p-3 bg-gradient-to-br from-green-100 to-emerald-50 rounded-2xl mb-4 shadow-sm dark:shadow-none border border-green-100/50"',
  'class="inline-flex items-center justify-center p-3 bg-gradient-to-br from-green-100 to-emerald-50 dark:from-slate-800 dark:to-slate-800 rounded-2xl mb-4 shadow-sm dark:shadow-none border border-green-100/50 dark:border-slate-700"'
);

// 3. Fix image source
content = content.replace(
  'src="/images/kalender_bg.png"',
  'src="/images/kalender_premium.png"'
);
content = content.replace(
  'class="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-white dark:bg-slate-900 shadow-soft-sm flex items-center justify-center border border-green-100/60 shrink-0 relative overflow-hidden group"',
  'class="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-white dark:bg-slate-900 shadow-soft-sm flex items-center justify-center border border-green-100/60 dark:border-slate-700/80 shrink-0 relative overflow-hidden group"'
);

// 4. Fix Hijri month calculation
content = content.replace(
  'const mm = date.getMonth();',
  'const mm = date.getMonth() + 1;'
);

// 5. Fix Dropdown states
content = content.replace(
  /hover:bg-green-50 transition-colors focus:outline-none \{showMonthDropdown\s*\?\s*'bg-green-50'\s*:\s*''\}/g,
  "hover:bg-green-50 dark:hover:bg-slate-800/80 transition-colors focus:outline-none {showMonthDropdown ? 'bg-green-50 dark:bg-slate-800/80' : ''}"
);
content = content.replace(
  /hover:bg-green-50 transition-colors focus:outline-none \{showYearDropdown\s*\?\s*'bg-green-50'\s*:\s*''\}/g,
  "hover:bg-green-50 dark:hover:bg-slate-800/80 transition-colors focus:outline-none {showYearDropdown ? 'bg-green-50 dark:bg-slate-800/80' : ''}"
);
content = content.replace(
  /\?\s*'bg-green-50 text-green-700'/g,
  "? 'bg-green-50 dark:bg-emerald-900/40 text-green-700 dark:text-emerald-400'"
);
content = content.replace(
  /hover:bg-green-50 hover:text-green-700 rounded-xl transition-all active:scale-95 mx-1 focus:outline-none focus:ring-2 focus:ring-green-100/g,
  "hover:bg-green-50 dark:hover:bg-slate-800 hover:text-green-700 dark:hover:text-emerald-400 rounded-xl transition-all active:scale-95 mx-1 focus:outline-none focus:ring-2 focus:ring-green-100 dark:focus:ring-emerald-900"
);

// 6. Fix filterPeringatan Syawal bug
content = content.replace(
  'const hMonths = dominantHijriMonth.toLowerCase().split(/[ -]+/);\n      for (let hm of hMonths) {\n        if (hm.length > 3 && t.includes(hm)) return true;\n        if (hm === "dzulhijjah" && t.includes("zulhijah")) return true;\n        if (hm === "muharram" && t.includes("muharam")) return true;\n      }',
  `const hMonths = dominantHijriMonth.toLowerCase().split(" - ").map(s => s.trim());
      for (let hm of hMonths) {
        const hmClean = hm.replace(/['\`]/g, "");
        const tClean = t.replace(/['\`]/g, "");
        
        // Exact match word boundary for Hijri month
        const rx = new RegExp("\\\\b" + hmClean + "\\\\b", "i");
        if (rx.test(tClean)) return true;
        
        if (hmClean === "dzulhijjah" && /\\\\bzulhijah\\\\b/i.test(tClean)) return true;
        if (hmClean === "muharram" && /\\\\bmuharam\\\\b/i.test(tClean)) return true;
      }`
);

// 7. Implement Toggle
content = content.replace(
  'let currentMonthPeringatan: any[] = [];',
  'let currentMonthPeringatan: any[] = [];\n  let showAllPeringatan = false;'
);

content = content.replace(
  '{#each currentMonthPeringatan as p}',
  '{#each (showAllPeringatan ? currentMonthPeringatan : currentMonthPeringatan.slice(0, 6)) as p}'
);

content = content.replace(
  '            {/each}\n          </div>\n        </div>',
  `            {/each}
          </div>
          {#if currentMonthPeringatan.length > 6}
            <div class="mt-6 flex justify-center pb-2">
              <button
                on:click={() => showAllPeringatan = !showAllPeringatan}
                class="px-6 py-2.5 text-sm font-bold text-green-700 dark:text-emerald-400 bg-green-50 dark:bg-slate-800 hover:bg-green-100 dark:hover:bg-slate-700/80 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-200 dark:focus:ring-emerald-900 shadow-sm dark:shadow-none"
              >
                {showAllPeringatan ? "Sembunyikan" : \`Tampilkan Semua (\${currentMonthPeringatan.length})\`}
              </button>
            </div>
          {/if}
        </div>`
);

content = content.replace(
  /showMonthDropdown = false;/g,
  'showMonthDropdown = false;\n      showAllPeringatan = false;'
);
content = content.replace(
  /showYearDropdown = false;/g,
  'showYearDropdown = false;\n      showAllPeringatan = false;'
);
content = content.replace(
  /currentDate = new Date\(\);\n    generateCalendar\(\);/g,
  'currentDate = new Date();\n    generateCalendar();\n    showAllPeringatan = false;'
);
content = content.replace(
  /function prevMonth\(\) \{[\s\S]*?generateCalendar\(\);\n  \}/g,
  `function prevMonth() {
    currentDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1,
    );
    generateCalendar();
    showAllPeringatan = false;
  }`
);
content = content.replace(
  /function nextMonth\(\) \{[\s\S]*?generateCalendar\(\);\n  \}/g,
  `function nextMonth() {
    currentDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      1,
    );
    generateCalendar();
    showAllPeringatan = false;
  }`
);

fs.writeFileSync(file, content, 'utf8');
console.log('All changes applied.');
