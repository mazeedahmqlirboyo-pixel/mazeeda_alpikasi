const fs = require('fs');
const file = 'src/routes/zakat-faraidh/+page.svelte';
let s = fs.readFileSync(file, 'utf8');

s = s.replace(
  />Total Pendapatan Sewa Diterima \(Rupiah \/ Tahunan\)</g,
  `>{$t('zakat.pendapatan_sewa_input') || 'Total Pendapatan Sewa Diterima (Rupiah / Tahunan)'}<`
);

s = s.replace(
  />Biaya Perawatan \/ Renovasi \/ Pajak Properti \(Rupiah \/ Tahunan\)</g,
  `>{$t('zakat.biaya_perawatan_input') || 'Biaya Perawatan / Renovasi / Pajak Properti (Rupiah / Tahunan)'}<`
);

s = s.replace(
  />Nisab Sewa Properti \(85 gram Emas\)</g,
  `>{$t('zakat.nisab_sewa_properti') || 'Nisab Sewa Properti (85 gram Emas)'}<`
);

s = s.replace(
  /Pendapatan sewa bersih properti Anda belum mencapai nishab\s*tahunan\. Anda disarankan mengeluarkan sedekah sukarela\./g,
  `{$t('zakat.info_sedekah_properti') || 'Pendapatan sewa bersih properti Anda belum mencapai nishab tahunan. Anda disarankan mengeluarkan sedekah sukarela.'}`
);

fs.writeFileSync(file, s);
console.log('Template tags injected for missing Properti strings.');

// Locales
const path = require('path');
const localesDir = path.join('src', 'lib', 'i18n');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const translations = {
  pendapatan_sewa_input: {
    id: "Total Pendapatan Sewa Diterima (Rupiah / Tahunan)",
    en: "Total Rental Income Received (Rupiah / Annual)",
    ar: "إجمالي إيرادات الإيجار المستلمة (روبية / سنوي)",
    zh: "收到的租金总收入（印尼盾 / 年度）",
    ja: "受領した賃貸収入総額 (ルピア / 年間)",
    ko: "수령한 임대 수익 총액 (루피아 / 연간)"
  },
  biaya_perawatan_input: {
    id: "Biaya Perawatan / Renovasi / Pajak Properti (Rupiah / Tahunan)",
    en: "Maintenance / Renovation / Property Tax Costs (Rupiah / Annual)",
    ar: "تكاليف الصيانة / التجديد / ضريبة العقار (روبية / سنوي)",
    zh: "维护 / 翻新 / 房产税成本（印尼盾 / 年度）",
    ja: "維持費 / 改修費 / 固定資産税 (ルピア / 年間)",
    ko: "유지 보수 / 개조 / 재산세 비용 (루피아 / 연간)"
  },
  nisab_sewa_properti: {
    id: "Nisab Sewa Properti (85 gram Emas)",
    en: "Property Rent Nisab (85 grams Gold)",
    ar: "نصاب إيجار العقارات (85 جرام ذهب)",
    zh: "房产租金天课起征点（85克黄金）",
    ja: "不動産賃貸のニサーブ (85グラムの金)",
    ko: "부동산 임대 니삽 (금 85그램)"
  },
  info_sedekah_properti: {
    id: "Pendapatan sewa bersih properti Anda belum mencapai nishab tahunan. Anda disarankan mengeluarkan sedekah sukarela.",
    en: "Your net property rental income has not reached the annual nisab. You are recommended to give voluntary charity.",
    ar: "صافي إيرادات إيجار العقار الخاص بك لم يبلغ النصاب السنوي. يوصى بإخراج صدقة تطوعية.",
    zh: "您的净房产租金收入尚未达到年度起征点。建议您进行自愿捐赠。",
    ja: "あなたの純不動産賃貸収入は、まだ年間のニサーブに達していません。任意の寄付（サダカ）が推奨されます。",
    ko: "귀하의 순 부동산 임대 수익은 아직 연간 니삽에 도달하지 않았습니다. 자발적인 기부를 권장합니다."
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

console.log('JSON locales updated for Properti.');
