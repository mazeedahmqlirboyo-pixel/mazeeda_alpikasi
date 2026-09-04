const fs = require('fs');
const file = 'src/routes/zakat-faraidh/+page.svelte';
let s = fs.readFileSync(file, 'utf8');

s = s.replace(
  /<span>Isi Data Aset Tambak \(Perikanan\)<\/span>/g,
  `<span>{$t('zakat.isi_data_tambak') || 'Isi Data Aset Tambak (Perikanan)'}</span>`
);
s = s.replace(
  />Uang Kas Tambak \/ Saldo Bank Usaha Tambak \(Rupiah\)</g,
  `>{$t('zakat.kas_tambak') || 'Uang Kas Tambak / Saldo Bank Usaha Tambak (Rupiah)'}<`
);

fs.writeFileSync(file, s);
console.log('Template tags injected for missing Tambak strings.');

// Locales
const path = require('path');
const localesDir = path.join('src', 'lib', 'i18n');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const translations = {
  isi_data_tambak: {
    id: "Isi Data Aset Tambak (Perikanan)",
    en: "Fill Fishery Asset Data",
    ar: "إدخال بيانات أصول المزارع السمكية",
    zh: "填写渔业资产数据",
    ja: "養殖場の資産データを入力",
    ko: "양식장 자산 데이터 입력"
  },
  kas_tambak: {
    id: "Uang Kas Tambak / Saldo Bank Usaha Tambak (Rupiah)",
    en: "Fishery Cash / Business Bank Balance (Rupiah)",
    ar: "نقد المزارع السمكية / رصيد البنك للأعمال (روبية)",
    zh: "渔业现金 / 业务银行余额（印尼盾）",
    ja: "養殖場の現金 / 事業用銀行残高 (ルピア)",
    ko: "양식장 현금 / 사업용 은행 잔액 (루피아)"
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

console.log('JSON locales updated for Tambak.');
