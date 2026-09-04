const fs = require('fs');
const path = require('path');
const localesDir = path.join('src', 'lib', 'i18n');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const translations = {
  dalam_kg: {
    id: "(Dalam Kg)",
    en: "(In Kg)",
    ar: "(بالكيلوجرام)",
    zh: "(公斤)",
    ja: "(キログラム単位)",
    ko: "(kg 단위)"
  },
  atau_jika_diuangkan: {
    id: "Atau Jika Diuangkan",
    en: "Or if Cashed",
    ar: "أو إذا تم تحويلها إلى نقد",
    zh: "或者如果兑换成现金",
    ja: "または現金化した場合",
    ko: "또는 현금화할 경우"
  }
};

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

  data.zakat = { ...data.zakat, ...newMap };
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
}

console.log('JSON locales updated for Zakat Pertanian.');
