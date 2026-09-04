const fs = require('fs');
const file = 'src/routes/zakat-faraidh/+page.svelte';
let s = fs.readFileSync(file, 'utf8');

s = s.replace(
  /Zakat Maal yang Wajib Dikeluarkan \(\{formatNumberStr\(2\.5, \$locale\)\}%\)/g,
  `{$t('zakat.zakat_maal_wajib') || 'Zakat Maal yang Wajib Dikeluarkan'} ({formatNumberStr(2.5, $locale)}%)`
);

s = s.replace(
  /Harta bersih Anda telah melebihi nisab tahunan\. Wajib dikeluarkan\s*zakat sebesar \{formatNumberStr\(2\.5, \$locale\)\}% jika kepemilikan aset telah mencapai haul \(1\s*tahun hijriah\)\./g,
  `{$t('zakat.info_wajib_zakat_maal_p1') || 'Harta bersih Anda telah melebihi nisab tahunan. Wajib dikeluarkan zakat sebesar'} {formatNumberStr(2.5, $locale)}% {$t('zakat.info_wajib_zakat_maal_p2') || 'jika kepemilikan aset telah mencapai haul (1 tahun hijriah).'}`
);

fs.writeFileSync(file, s);
console.log('Template tags injected for missing Zakat Maal strings.');

// Locales
const path = require('path');
const localesDir = path.join('src', 'lib', 'i18n');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const translations = {
  zakat_maal_wajib: {
    id: "Zakat Maal yang Wajib Dikeluarkan",
    en: "Mandatory Zakat Maal to be Paid",
    ar: "زكاة المال الواجب إخراجها",
    zh: "应缴纳的财产天课（Zakat Maal）",
    ja: "支払うべき必須のザカート・マール",
    ko: "지불해야 할 필수 자카트 말"
  },
  info_wajib_zakat_maal_p1: {
    id: "Harta bersih Anda telah melebihi nisab tahunan. Wajib dikeluarkan zakat sebesar",
    en: "Your net wealth has exceeded the annual nisab. It is mandatory to pay zakat of",
    ar: "لقد تجاوزت ثروتك الصافية النصاب السنوي. يجب إخراج زكاة بنسبة",
    zh: "您的净资产已超过年度起征点。必须缴纳天课",
    ja: "あなたの純資産は年間のニサーブを超えました。支払うべき必須のザカートは",
    ko: "귀하의 순자산이 연간 니삽을 초과했습니다. 지불해야 할 필수 자카트는"
  },
  info_wajib_zakat_maal_p2: {
    id: "jika kepemilikan aset telah mencapai haul (1 tahun hijriah).",
    en: "if the asset ownership has reached haul (1 Hijri year).",
    ar: "إذا بلغ ملكية الأصول الحول (سنة هجرية واحدة).",
    zh: "（如果资产所有权已达到满一年（伊斯兰历一年））。",
    ja: "（資産の所有がハウル（ヒジュラ暦で1年）に達している場合）。",
    ko: "(자산 소유권이 하울(히즈라 달력으로 1년)에 도달한 경우)."
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

console.log('JSON locales updated for Zakat Maal.');
