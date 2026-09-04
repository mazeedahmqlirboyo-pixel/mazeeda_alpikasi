const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/routes/zakat-faraidh/+page.svelte');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Repair mangled wasiatPewaris input
const mangledInput = `              <input
                id="wasiatPewaris"
                type="text"
                value={wasiatPewarisDisp}
              </p>`;
const correctInput = `              <input
                id="wasiatPewaris"
                type="text"
                value={wasiatPewarisDisp}
                on:input={(e) =>
                  handleNumericInput(e, (v) => {
                    wasiatPewaris = v;
                    wasiatPewarisDisp = v ? v.toLocaleString("id-ID") : "";
                  })}
                placeholder="0"
                class="pl-8 pr-2 h-10 w-full bg-slate-50 dark:bg-slate-800/50 dark:bg-slate-900 border border-slate-200 text-xs font-bold text-slate-700 dark:text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white"
              />
            </div>
            {#if wasiatPewaris > 0}
              <p
                in:slide={{ duration: 150 }}
                class="text-[9px] text-emerald-600 font-black tracking-normal capitalize mt-1 leading-tight"
              >
                {terbilang(wasiatPewaris)}
              </p>`;

if (content.includes(mangledInput)) {
    content = content.replace(mangledInput, correctInput);
    console.log("Successfully repaired wasiatPewaris input.");
} else {
    console.log("Could not find mangled wasiatPewaris input.");
}

// 2. Fix Peringatan Syariah warning box background
const warningBgOld = 'class="bg-rose-50 border border-rose-200/50 p-3 rounded-xl flex items-start gap-2.5"';
const warningBgNew = 'class="bg-rose-50 dark:bg-rose-900/20 border border-rose-200/50 dark:border-rose-900/50 p-3 rounded-xl flex items-start gap-2.5"';
if (content.includes(warningBgOld)) {
    content = content.replace(warningBgOld, warningBgNew);
    console.log("Successfully fixed Peringatan Syariah bg.");
}

// 3. Fix Peringatan Syariah text
const warningTextOld = 'class="text-[10px] text-rose-700 leading-normal font-semibold"';
const warningTextNew = 'class="text-[10px] text-rose-700 dark:text-rose-400 leading-normal font-semibold"';
if (content.includes(warningTextOld)) {
    content = content.replace(warningTextOld, warningTextNew);
    console.log("Successfully fixed Peringatan Syariah text.");
}

// 4. Fix Law Notes spacing
const lawNotesOld = 'class="bg-indigo-50/50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl p-4 text-[10px] text-slate-500 dark:text-slate-400 dark:text-slate-500 space-y-1.5 leading-relaxed font-normal"';
const lawNotesNew = 'class="mt-6 bg-indigo-50/50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl p-4 text-[10px] text-slate-500 dark:text-slate-400 space-y-1.5 leading-relaxed font-normal"';
if (content.includes(lawNotesOld)) {
    content = content.replace(lawNotesOld, lawNotesNew);
    console.log("Successfully fixed Law Notes spacing.");
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("Done!");
