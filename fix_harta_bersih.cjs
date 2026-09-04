const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/routes/zakat-faraidh/+page.svelte');
let content = fs.readFileSync(pagePath, 'utf8');

// Match the existing span
const regex = /<span\s+class="bg-indigo-50 text-indigo-700 border border-indigo-100 font-black text-\[9px\] px-2 py-0\.5 rounded-full uppercase tracking-wider"\s*>Harta Bersih:\s*\{formatCurrency\(netEstate\)\}<\/span\s*>/;

const replacement = `<span
              class="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/50 font-black text-[9px] px-3 py-1 rounded-2xl uppercase tracking-wider text-center leading-tight flex flex-col gap-0.5"
            >
              <span class="opacity-80">{$t('zakat.harta_bersih') || 'Harta Bersih'}:</span>
              <span class="text-[10px]">{formatCurrency(netEstate)}</span>
            </span>`;

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(pagePath, content, 'utf8');
    console.log("Successfully fixed Harta Bersih layout.");
} else {
    console.log("Regex did not match.");
}
