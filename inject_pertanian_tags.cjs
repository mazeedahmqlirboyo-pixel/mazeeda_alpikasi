const fs = require('fs');
const file = 'src/routes/zakat-faraidh/+page.svelte';
let s = fs.readFileSync(file, 'utf8');

const keysMap = {
  "Total Berat Hasil Panen (kg Gabah / Beras / Makanan Pokok)": "total_berat_panen",
  "Harga Jual Beras / Hasil Panen per kg (Rupiah)": "harga_jual_panen",
  "Pompa / Air Berbayar / Irigasi Buatan (Tarif 5%)": "metode_pompa",
  "Alami / Air Hujan / Sungai (Bebas Biaya - Tarif 10%)": "metode_alami",
  "653 kg Beras": "653_kg_beras",
  "(Nisab: 653 kg beras)": "nisab_653_kg_beras",
  "Alami / Tadah Hujan (Tarif 10%)": "metode_alami_detail",
  "Buatan / Pompa Berbayar (Tarif 5%)": "metode_pompa_detail",
  "Wajib Zakat (Panen >= 653 kg)": "wajib_zakat_653",
  "Kadar Zakat (kg):": "kadar_zakat_kg",
  "Tidak ada kewajiban zakat hasil pertanian karena total hasil panen di bawah batas minimum (nisab).": "info_tidak_wajib_panen",
  "🔬 Detail Perhitungan:": "detail_perhitungan"
};

for (const [text, key] of Object.entries(keysMap)) {
  const safeText = text.replace(/[.*+?^$\/()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`>\\s*${safeText}\\s*<`, 'g');
  s = s.replace(regex, `>{$t('zakat.${key}') || '${text}'}<`);
}

// Inline replacements where it's not wrapped directly by > <
s = s.replace(/\(Nisab: 653 kg beras\)/g, `{$t('zakat.nisab_653_kg_beras') || '(Nisab: 653 kg beras)'}`);
s = s.replace(/'Alami \/ Tadah Hujan \(Tarif 10%\)'/g, `($t('zakat.metode_alami_detail') || 'Alami / Tadah Hujan (Tarif 10%)')`);
s = s.replace(/'Buatan \/ Pompa Berbayar \(Tarif 5%\)'/g, `($t('zakat.metode_pompa_detail') || 'Buatan / Pompa Berbayar (Tarif 5%)')`);
s = s.replace(/>Wajib Zakat \(Panen >= 653 kg\)</g, `>{$t('zakat.wajib_zakat_653') || 'Wajib Zakat (Panen >= 653 kg)'}<`);
s = s.replace(/>Kadar Zakat \(kg\):</g, `>{$t('zakat.kadar_zakat_kg') || 'Kadar Zakat (kg):'}<`);


// Multiline info 1
const infoPanen1 = />\s*Nishab zakat pertanian adalah 5 wasaq \(setara \*\*653 kg beras\*\* \/\s*\*\*1323 kg gabah kering giling\*\*\)\.\s*</g;
s = s.replace(infoPanen1, `>{$t('zakat.info_nishab_pertanian') || 'Nishab zakat pertanian adalah 5 wasaq (setara **653 kg beras** / **1323 kg gabah kering giling**).'}<`);

// Multiline info 2 (with variable)
const infoPanen2 = /Hasil panen Anda \(\{formatNumberStr\(hasilPanen \|\| 0, \$locale\)\} kg\) masih di bawah batas nishab\s*\(653 kg beras\)\./g;
s = s.replace(infoPanen2, `{$t('zakat.info_panen_belum_nishab1') || 'Hasil panen Anda ('}{formatNumberStr(hasilPanen || 0, $locale)} {$t('zakat.info_panen_belum_nishab2') || 'kg) masih di bawah batas nishab (653 kg beras).'}`);
// But actually we need to make sure we match the string correctly. Earlier I replaced {hasilPanen || 0} with {formatNumberStr(hasilPanen || 0, $locale)}
// Let's use a simpler regex
const infoPanen2_alt = /Hasil panen Anda \([^)]+\) masih di bawah batas nishab\s*\(653 kg beras\)\./g;
s = s.replace(infoPanen2_alt, `{$t('zakat.info_panen_belum_nishab1') || 'Hasil panen Anda ('}{formatNumberStr(hasilPanen || 0, $locale)} {$t('zakat.info_panen_belum_nishab2') || 'kg) masih di bawah batas nishab (653 kg beras).'}`);

fs.writeFileSync(file, s);
console.log('Template tags injected for Zakat Pertanian text.');

// Locales
const path = require('path');
const localesDir = path.join('src', 'lib', 'i18n');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const translations = {
  total_berat_panen: { id: "Total Berat Hasil Panen (kg Gabah / Beras / Makanan Pokok)", en: "Total Harvest Weight (kg Grain / Rice / Staple Food)", ar: "إجمالي وزن المحصول (كجم حبوب / أرز / غذاء أساسي)", zh: "总收获重量（公斤 谷物/大米/主食）", ja: "総収穫重量 (kg 穀物/米/主食)", ko: "총 수확 중량 (kg 곡물/쌀/주식)" },
  harga_jual_panen: { id: "Harga Jual Beras / Hasil Panen per kg (Rupiah)", en: "Selling Price of Rice / Harvest per kg (Rupiah)", ar: "سعر بيع الأرز / المحصول لكل كجم (روبية)", zh: "每公斤大米/农作物的销售价格（印尼盾）", ja: "米・農作物の1kgあたりの販売価格 (ルピア)", ko: "kg당 쌀/수확물의 판매 가격 (루피아)" },
  metode_pompa: { id: "Pompa / Air Berbayar / Irigasi Buatan (Tarif 5%)", en: "Pump / Paid Water / Artificial Irrigation (5% Rate)", ar: "مضخة / مياه مدفوعة / ري صناعي (نسبة 5%)", zh: "水泵/付费水/人工灌溉（5%税率）", ja: "ポンプ / 有料水 / 人工灌漑 (5% レート)", ko: "펌프 / 유료수 / 인공 관개 (5% 비율)" },
  metode_alami: { id: "Alami / Air Hujan / Sungai (Bebas Biaya - Tarif 10%)", en: "Natural / Rainwater / River (Free - 10% Rate)", ar: "طبيعي / مياه الأمطار / الأنهار (مجاني - نسبة 10%)", zh: "自然/雨水/河流（免费 - 10%税率）", ja: "自然 / 雨水 / 河川 (無料 - 10% レート)", ko: "자연수 / 빗물 / 강 (무료 - 10% 비율)" },
  "653_kg_beras": { id: "653 kg Beras", en: "653 kg Rice", ar: "653 كجم أرز", zh: "653公斤大米", ja: "653 kg 米", ko: "653kg 쌀" },
  nisab_653_kg_beras: { id: "(Nisab: 653 kg beras)", en: "(Nisab: 653 kg rice)", ar: "(النصاب: 653 كجم أرز)", zh: "(起征点: 653公斤大米)", ja: "(ニサーブ: 653 kg 米)", ko: "(니삽: 653kg 쌀)" },
  metode_alami_detail: { id: "Alami / Tadah Hujan (Tarif 10%)", en: "Natural / Rainfed (10% Rate)", ar: "طبيعي / بعلي (نسبة 10%)", zh: "自然/雨养（10%税率）", ja: "自然 / 天水 (10% レート)", ko: "자연수 / 천수답 (10% 비율)" },
  metode_pompa_detail: { id: "Buatan / Pompa Berbayar (Tarif 5%)", en: "Artificial / Paid Pump (5% Rate)", ar: "صناعي / مضخة مدفوعة (نسبة 5%)", zh: "人工/付费水泵（5%税率）", ja: "人工 / 有料ポンプ (5% レート)", ko: "인공 / 유료 펌프 (5% 비율)" },
  wajib_zakat_653: { id: "Wajib Zakat (Panen >= 653 kg)", en: "Zakat Mandatory (Harvest >= 653 kg)", ar: "تجب الزكاة (المحصول >= 653 كجم)", zh: "必须缴纳天课（收获 >= 653公斤）", ja: "ザカート義務 (収穫 >= 653 kg)", ko: "자카트 의무 (수확 >= 653kg)" },
  kadar_zakat_kg: { id: "Kadar Zakat (kg):", en: "Zakat Rate (kg):", ar: "نسبة الزكاة (كجم):", zh: "天课费率 (公斤):", ja: "ザカート率 (kg):", ko: "자카트 비율 (kg):" },
  info_tidak_wajib_panen: { id: "Tidak ada kewajiban zakat hasil pertanian karena total hasil panen di bawah batas minimum (nisab).", en: "There is no zakat obligation for agricultural products because the total harvest is below the minimum limit (nisab).", ar: "لا توجد زكاة على المنتجات الزراعية لأن إجمالي المحصول أقل من الحد الأدنى (النصاب).", zh: "由于总收获量低于最低限额（起征点），因此无需缴纳农业天课。", ja: "総収穫量が最低限度（ニサーブ）を下回っているため、農作物のザカート義務はありません。", ko: "총 수확량이 최소 한도(니삽) 미만이므로 농산물 자카트 의무가 없습니다." },
  detail_perhitungan: { id: "🔬 Detail Perhitungan:", en: "🔬 Calculation Detail:", ar: "🔬 تفاصيل الحساب:", zh: "🔬 计算明细：", ja: "🔬 計算詳細:", ko: "🔬 계산 상세:" },
  info_nishab_pertanian: { id: "Nishab zakat pertanian adalah 5 wasaq (setara **653 kg beras** / **1323 kg gabah kering giling**).", en: "The nisab for agricultural zakat is 5 wasaq (equivalent to **653 kg of rice** / **1323 kg of milled dry unhusked rice**).", ar: "نصاب زكاة الزروع هو 5 أوسق (يعادل **653 كجم من الأرز** / **1323 كجم من الأرز غير المقشر الجاف المطحون**).", zh: "农业天课的起征点为 5 wasaq（相当于 **653 公斤大米** / **1323 公斤碾干的稻谷**）。", ja: "農業ザカートのニサーブは5ワサク（**653kgの米** / **1323kgの乾燥籾**に相当）です。", ko: "농업 자카트의 니삽은 5와사크(**쌀 653kg** / **도정된 건조 벼 1323kg**에 해당)입니다." },
  info_panen_belum_nishab1: { id: "Hasil panen Anda (", en: "Your harvest (", ar: "محصولك (", zh: "您的收获量（", ja: "あなたの収穫量 (", ko: "귀하의 수확량 (" },
  info_panen_belum_nishab2: { id: "kg) masih di bawah batas nishab (653 kg beras).", en: "kg) is still below the nisab limit (653 kg rice).", ar: "كجم) لا يزال أقل من حد النصاب (653 كجم أرز).", zh: "公斤）仍低于起征点（653公斤大米）。", ja: "kg) はまだニサーブの限度 (653 kg 米) を下回っています。", ko: "kg)은 아직 니삽 한도(653kg 쌀) 미만입니다." }
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

console.log('JSON locales updated for Zakat Pertanian.');
