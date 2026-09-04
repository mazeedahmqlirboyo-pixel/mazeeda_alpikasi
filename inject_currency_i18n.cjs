const fs = require('fs');
const path = require('path');

const localesDir = path.join('src', 'lib', 'i18n');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const translations = {
  pilih_mata_uang: {
    id: "Pilih Mata Uang",
    en: "Select Currency",
    ar: "اختر العملة",
    zh: "选择货币",
    ja: "通貨を選択",
    ko: "통화 선택"
  },
  currency_idr: {
    id: "Rupiah",
    en: "Rupiah",
    ar: "روبية",
    zh: "印尼盾",
    ja: "ルピア",
    ko: "루피아"
  },
  currency_usd: {
    id: "Dolar AS",
    en: "US Dollar",
    ar: "دولار أمريكي",
    zh: "美元",
    ja: "米ドル",
    ko: "미국 달러"
  },
  currency_sar: {
    id: "Riyal Saudi",
    en: "Saudi Riyal",
    ar: "ريال سعودي",
    zh: "沙特里亚尔",
    ja: "サウジリヤル",
    ko: "사우디 리얄"
  },
  currency_cny: {
    id: "Yuan",
    en: "Yuan",
    ar: "يوان",
    zh: "元",
    ja: "元",
    ko: "위안"
  },
  currency_jpy: {
    id: "Yen",
    en: "Yen",
    ar: "ين",
    zh: "日元",
    ja: "円",
    ko: "엔"
  },
  currency_krw: {
    id: "Won",
    en: "Won",
    ar: "وون",
    zh: "韩元",
    ja: "ウォン",
    ko: "원"
  }
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

console.log('Currency translations injected into all i18n JSON files.');
