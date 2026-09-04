const fs = require('fs');
const path = require('path');

// 1. Update the Svelte template
const file = 'src/routes/zakat-faraidh/+page.svelte';
let s = fs.readFileSync(file, 'utf8');

s = s.replace(/>Klik Disini<\/a/g, `>{$t('zakat.klik_disini') || 'Klik Disini'}</a`);
fs.writeFileSync(file, s);
console.log('Template updated!');

// 2. Update the locales
const localesDir = path.join('src', 'lib', 'i18n');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const translations = {
  en: "Click Here",
  id: "Klik Disini",
  ar: "اضغط هنا",
  zh: "点击这里",
  ja: "ここをクリック",
  ko: "여기를 클릭하세요"
};

for (const f of files) {
  const lang = f.split('.')[0];
  const p = path.join(localesDir, f);
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  
  if (translations[lang]) {
    data.zakat = data.zakat || {};
    data.zakat.klik_disini = translations[lang];
    fs.writeFileSync(p, JSON.stringify(data, null, 2));
    console.log(`Updated locale: ${lang}`);
  }
}
