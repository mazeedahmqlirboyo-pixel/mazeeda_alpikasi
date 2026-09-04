const fs = require('fs');
const file = 'src/routes/zakat-faraidh/+page.svelte';
let s = fs.readFileSync(file, 'utf8');

s = s.replace(
  /\} \/ bln<\/span>/g,
  `} {$t('zakat.per_bln') || '/ bln'}</span>`
);

s = s.replace(
  /"Keluarkanlah zakat dari sebagian harta mereka guna membersihkan\s*dan menyucikan mereka\." \(QS\. At-Taubah: 103\)/g,
  `{$t('zakat.quote_at_taubah_103') || '"Keluarkanlah zakat dari sebagian harta mereka guna membersihkan dan menyucikan mereka." (QS. At-Taubah: 103)'}`
);

fs.writeFileSync(file, s);
console.log('Template tags injected for missing Penghasilan strings.');

// Locales
const path = require('path');
const localesDir = path.join('src', 'lib', 'i18n');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const translations = {
  quote_at_taubah_103: {
    id: "\"Keluarkanlah zakat dari sebagian harta mereka guna membersihkan dan menyucikan mereka.\" (QS. At-Taubah: 103)",
    en: "\"Take, [O, Muhammad], from their wealth a charity by which you purify them and cause them increase.\" (QS. At-Tawbah: 103)",
    ar: "\"خُذْ مِنْ أَمْوَالِهِمْ صَدَقَةً تُطَهِّرُهُمْ وَتُزَكِّيهِمْ بِهَا\" (سورة التوبة: ١٠٣)",
    zh: "“你应该从他们的财产中征收天课，借此使他们纯洁，并使他们的高尚。”（《古兰经》第九章，忏悔，第103节）",
    ja: "「彼らの財産から喜捨を取り、それによって彼らを清め、浄化しなさい。」（クルアーン 懺悔章103節）",
    ko: "\"그들의 재산에서 자선을 취하여 그들을 정화하고 깨끗하게 하라.\" (꾸란 앗-타우바: 103)"
  }
};

const idArabic = ["٠","١","٢","٣","٤","٥","٦","٧","٨","٩"];
function convertNumbersToArabic(obj) {
  for (let key in obj) {
    if (typeof obj[key] === 'string') {
      obj[key] = obj[key].replace(/[0-9]/g, w => idArabic[w]);
    } else if (typeof obj[key] === 'object') {
      convertNumbersToArabic(obj[key]);
    }
  }
}

for (const f of files) {
  const lang = f.split('.')[0];
  const p = path.join(localesDir, f);
  let data = JSON.parse(fs.readFileSync(p, 'utf8'));
  
  data.zakat = data.zakat || {};
  let newMap = {};
  for (const [key, tmap] of Object.entries(translations)) {
    if (tmap[lang]) {
      newMap[key] = tmap[lang];
    } else if (lang === 'en') {
      newMap[key] = tmap.en;
    }
  }

  if (lang === 'ar') {
    convertNumbersToArabic(newMap);
  }

  data.zakat = { ...data.zakat, ...newMap };
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
}

console.log('JSON locales updated for Penghasilan.');
