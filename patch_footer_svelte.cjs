const fs = require('fs');
const file = 'src/routes/+page.svelte';
let s = fs.readFileSync(file, 'utf8');

const replacements = [
  // Momen Spesial
  // Let's replace the whole parent div structure to add the required margin
  [
    /<div class="mt-2 border-t border-slate-100 dark:border-slate-800 pt-4">\s*<div class="flex items-center justify-center mb-0">\s*<h3 class="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Momen Spesial<\/h3>\s*<\/div>/g,
    `<div class="mt-6 border-t border-slate-100 dark:border-slate-800 pt-6">
      <div class="flex items-center justify-center mb-4">
        <h3 class="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{$t('footer.momen_spesial') || 'Momen Spesial'}</h3>
      </div>`
  ],
  // Wajah-wajah
  [/Wajah-wajah MAZEEDA Squad\s*<\/h3>/g, `{$t('footer.wajah_squad') || 'Wajah-wajah MAZEEDA Squad'}</h3>`],
  // Copyright
  [/© 2026 MAZEEDA \| MA HMQ LIRBOYO/g, `{$t('footer.copyright') || 'Hak Cipta ©'} {formatNumberStr('2026', $locale)} MAZEEDA | MA HMQ LIRBOYO`],
  // Links
  [/> Tentang Aplikasi\s*<\/a>/g, `> {$t('footer.tentang_aplikasi') || 'Tentang Aplikasi'}</a>`],
  [/> Kebijakan Privasi\s*<\/a>/g, `> {$t('footer.kebijakan_privasi') || 'Kebijakan Privasi'}</a>`],
  [/> Syarat & Ketentuan\s*<\/a>/g, `> {$t('footer.syarat_ketentuan') || 'Syarat & Ketentuan'}</a>`],
  [/\/> Kirim Masukan\s*<\/button>/g, `/> {$t('footer.kirim_masukan') || 'Kirim Masukan'}</button>`],
  [/>\s*Kirim Masukan\s*<\/button>/g, `>\n                {$t('footer.kirim_masukan') || 'Kirim Masukan'}\n              </button>`]
];

for (const [regex, replace] of replacements) {
  s = s.replace(regex, replace);
}

fs.writeFileSync(file, s);
console.log("Done patching footer");
