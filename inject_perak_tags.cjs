const fs = require('fs');
const file = 'src/routes/zakat-faraidh/+page.svelte';
let s = fs.readFileSync(file, 'utf8');

const keysMap = {
  "Berat Perak yang Disimpan / Investasi (gram)": "berat_perak_simpanan_investasi",
  "Harga Perak per gram (Rupiah)": "harga_perak_per_gram_label"
};

for (const [text, key] of Object.entries(keysMap)) {
  const safeText = text.replace(/[.*+?^$\/()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`>\\s*${safeText}\\s*<`, 'g');
  s = s.replace(regex, `>{$t('zakat.${key}') || '${text}'}<`);
}

// Multiline info 1
const infoPerak1 = />\s*Perak wajib dikeluarkan zakatnya jika total beratnya mencapai batas\s*nishab \*\*595 gram\*\*\.\s*</g;
s = s.replace(infoPerak1, `>{$t('zakat.info_perak_wajib') || 'Perak wajib dikeluarkan zakatnya jika total beratnya mencapai batas nishab **595 gram**.'}<`);

// Multiline info 2 (with variable)
const infoPerak2 = /Berat perak simpanan Anda \(\{beratPerak \|\| 0\} gram\) masih di bawah batas\s*nishab \(595 gram\)\./g;
s = s.replace(infoPerak2, `{$t('zakat.info_perak_belum_nishab1') || 'Berat perak simpanan Anda ('}{beratPerak || 0} {$t('zakat.info_perak_belum_nishab2') || 'gram) masih di bawah batas nishab (595 gram).'}`);

// Also fix ">595 gram<"
s = s.replace(/>595 gram</g, `>595 {$t('zakat.gram_satuan') || 'gram'}<`);

fs.writeFileSync(file, s);
console.log('Template tags injected for Zakat Perak text.');

// Locales
const path = require('path');
const localesDir = path.join('src', 'lib', 'i18n');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const translations = {
  berat_perak_simpanan_investasi: { id: "Berat Perak yang Disimpan / Investasi (gram)", en: "Weight of Saved / Invested Silver (grams)", ar: "وزن الفضة المدخرة / المستثمرة (جرام)", zh: "储存/投资的白银重量（克）", ja: "保管・投資用銀の重量 (グラム)", ko: "보관/투자용 은의 무게 (그램)" },
  harga_perak_per_gram_label: { id: "Harga Perak per gram (Rupiah)", en: "Silver Price per gram (Rupiah)", ar: "سعر الفضة لكل جرام (روبية)", zh: "每克白银价格（印尼盾）", ja: "1グラムあたりの銀価格 (ルピア)", ko: "그램당 은 가격 (루피아)" },
  info_perak_wajib: { id: "Perak wajib dikeluarkan zakatnya jika total beratnya mencapai batas nishab **595 gram**.", en: "Zakat on silver is mandatory if the total weight reaches the nisab limit of **595 grams**.", ar: "تجب الزكاة في الفضة إذا بلغ وزنها الإجمالي حد النصاب **595 جرامًا**.", zh: "如果总重量达到 **595 克** 的起征点，则必须缴纳白银天课。", ja: "総重量がニサーブの限度である **595 グラム** に達した場合、銀のザカートは義務付けられます。", ko: "총 무게가 니삽 한도인 **595그램**에 도달하면 은에 대한 자카트가 의무적입니다." },
  info_perak_belum_nishab1: { id: "Berat perak simpanan Anda (", en: "Your saved silver weight (", ar: "وزن الفضة المدخرة الخاص بك (", zh: "您的储存白银重量（", ja: "あなたの保管している銀の重量 (", ko: "귀하가 보관 중인 은의 무게 (" },
  info_perak_belum_nishab2: { id: "gram) masih di bawah batas nishab (595 gram).", en: "grams) is still below the nisab limit (595 grams).", ar: "جرام) لا يزال أقل من حد النصاب (595 جرام).", zh: "克）仍低于起征点（595克）。", ja: "グラム) はまだニサーブの限度 (595グラム) を下回っています。", ko: "그램)은 아직 니삽 한도(595그램) 미만입니다." }
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

console.log('JSON locales updated for Zakat Perak.');
