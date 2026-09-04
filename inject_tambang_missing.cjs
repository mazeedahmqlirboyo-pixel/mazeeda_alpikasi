const fs = require('fs');
const file = 'src/routes/zakat-faraidh/+page.svelte';
let s = fs.readFileSync(file, 'utf8');

s = s.replace(
  />Total Nilai Pasar Hasil Tambang yang Diperoleh \(Rupiah\)</g,
  `>{$t('zakat.nilai_tambang_input') || 'Total Nilai Pasar Hasil Tambang yang Diperoleh (Rupiah)'}<`
);

s = s.replace(
  />Biaya Eksploitasi \/ Operasional Tambang \(Rupiah\)</g,
  `>{$t('zakat.biaya_eksploitasi_input') || 'Biaya Eksploitasi / Operasional Tambang (Rupiah)'}<`
);

s = s.replace(
  />Nisab Pertambangan \(85 gram Emas\)</g,
  `>{$t('zakat.nisab_pertambangan') || 'Nisab Pertambangan (85 gram Emas)'}<`
);

s = s.replace(
  /Hasil tambang bersih Anda masih di bawah nishab\. Anda disarankan\s*mengeluarkan sedekah sukarela\./g,
  `{$t('zakat.info_sedekah_tambang') || 'Hasil tambang bersih Anda masih di bawah nishab. Anda disarankan mengeluarkan sedekah sukarela.'}`
);

fs.writeFileSync(file, s);
console.log('Template tags injected for missing Tambang strings.');

// Locales
const path = require('path');
const localesDir = path.join('src', 'lib', 'i18n');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const translations = {
  nilai_tambang_input: {
    id: "Total Nilai Pasar Hasil Tambang yang Diperoleh (Rupiah)",
    en: "Total Market Value of Mined Products Obtained (Rupiah)",
    ar: "إجمالي القيمة السوقية لمحصول التعدين الذي تم الحصول عليه (روبية)",
    zh: "获得的采矿产品总市场价值（印尼盾）",
    ja: "取得した採掘物の市場価値総額 (ルピア)",
    ko: "획득한 채굴 산물의 총 시장 가치 (루피아)"
  },
  biaya_eksploitasi_input: {
    id: "Biaya Eksploitasi / Operasional Tambang (Rupiah)",
    en: "Mining Exploitation / Operational Costs (Rupiah)",
    ar: "تكلفة الاستغلال / التشغيل للتعدين (روبية)",
    zh: "采矿开采 / 运营成本（印尼盾）",
    ja: "採掘の探査 / 運営コスト (ルピア)",
    ko: "채굴 탐사 / 운영 비용 (루피아)"
  },
  nisab_pertambangan: {
    id: "Nisab Pertambangan (85 gram Emas)",
    en: "Mining Nisab (85 grams Gold)",
    ar: "نصاب التعدين (85 جرام ذهب)",
    zh: "采矿天课起征点（85克黄金）",
    ja: "採掘のニサーブ (85グラムの金)",
    ko: "채굴 니삽 (금 85그램)"
  },
  info_sedekah_tambang: {
    id: "Hasil tambang bersih Anda masih di bawah nishab. Anda disarankan mengeluarkan sedekah sukarela.",
    en: "Your net mining yield is still below the nisab. You are recommended to give voluntary charity.",
    ar: "صافي محصول التعدين الخاص بك لا يزال أقل من النصاب. يوصى بإخراج صدقة تطوعية.",
    zh: "您的净采矿产量仍低于起征点。建议您进行自愿捐赠。",
    ja: "あなたの純採掘量はまだニサーブを下回っています。任意の寄付（サダカ）が推奨されます。",
    ko: "귀하의 순 채굴량은 아직 니삽 미만입니다. 자발적인 기부를 권장합니다."
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

console.log('JSON locales updated for Tambang.');
