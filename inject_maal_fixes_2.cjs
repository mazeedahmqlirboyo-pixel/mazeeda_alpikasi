const fs = require('fs');
const file = 'src/routes/zakat-faraidh/+page.svelte';
let s = fs.readFileSync(file, 'utf8');

// 1. Fix "Aset Maal (Kekayaan)"
s = s.replace(/>Aset Maal \(Kekayaan\)</g, `>{$t('zakat.aset_maal_kekayaan') || 'Aset Maal (Kekayaan)'}<`);

// 2. Fix "Nisab 595g perak."
s = s.replace(/Nisab 595g perak\./g, `{$t('zakat.nisab_595g_perak') || 'Nisab 595g perak.'}`);

// 3. Fix the white text on light background in dark mode for MANUAL badges
s = s.replace(/class="bg-slate-100 text-slate-500 dark:text-slate-300 text-\[8px\] font-bold/g, 'class="bg-slate-100 dark:bg-slate-700/60 text-slate-500 dark:text-slate-300 text-[8px] font-bold');

fs.writeFileSync(file, s);
console.log('Missed patches applied.');

// 4. Update the JSON files for "Nisab 595g perak."
const path = require('path');
const localesDir = path.join('src', 'lib', 'i18n');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));
const translations = {
  nisab_595g_perak: { id: "Nisab 595g perak.", en: "Nisab 595g silver.", ar: "نصاب 595 جرام فضة.", zh: "起征点595克白银。", ja: "ニサーブ 595g 銀。", ko: "니삽 595g 은." }
};

for (const f of files) {
  const lang = f.split('.')[0];
  const p = path.join(localesDir, f);
  let data = JSON.parse(fs.readFileSync(p, 'utf8'));
  
  data.zakat = data.zakat || {};
  for (const [key, tmap] of Object.entries(translations)) {
    if (tmap[lang]) {
      data.zakat[key] = tmap[lang];
    } else if (lang === 'en') {
      data.zakat[key] = tmap.en;
    }
  }
  
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
}
console.log('JSON locales updated.');
