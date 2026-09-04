const fs = require('fs');
const file = 'src/routes/zakat-faraidh/+page.svelte';
let s = fs.readFileSync(file, 'utf8');

// Replacements map
const keysMap = {
  "Jumlah Anggota Keluarga (Jiwa)": "jumlah_anggota_keluarga_jiwa",
  "Harga Beras per kg di Wilayah Anda (Rupiah)": "harga_beras_per_kg_wilayah_anda",
  "Total Zakat (Beras)": "total_zakat_beras",
  "Atau Jika Berupa Uang": "atau_jika_berupa_uang"
};

for (const [text, key] of Object.entries(keysMap)) {
  const safeText = text.replace(/[.*+?^$\/()|[\]\\]/g, '\\$&'); // escape regex
  const regex = new RegExp(`>\\s*${safeText}\\s*<`, 'g');
  s = s.replace(regex, `>{$t('zakat.${key}') || '${text}'}<`);
}

// Fitrah multiline explanation
const multilineExplanationRegex = />\s*Masing-masing jiwa wajib mengeluarkan 2,5 kg beras \(makanan pokok\)\s*atau uang senilai dengannya\.\s*</g;
s = s.replace(multilineExplanationRegex, `>{$t('zakat.info_kewajiban_fitrah') || 'Masing-masing jiwa wajib mengeluarkan 2,5 kg beras (makanan pokok) atau uang senilai dengannya.'}<`);

// {jumlahJiwa} Orang
s = s.replace(/\{jumlahJiwa\} Orang/g, `{jumlahJiwa} {$t('zakat.orang_satuan') || 'Orang'}`);

// 2.5 kg Beras
s = s.replace(/>2\.5 kg Beras</g, `>2.5 kg {$t('zakat.beras') || 'Beras'}<`);

// Terbilang:
s = s.replace(/🗣️ Terbilang:/g, `🗣️ {$t('zakat.terbilang') || 'Terbilang:'}`);

fs.writeFileSync(file, s);
console.log('Template tags injected for Fitrah text.');

// Now update locales
const path = require('path');
const localesDir = path.join('src', 'lib', 'i18n');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const translations = {
  jumlah_anggota_keluarga_jiwa: { id: "Jumlah Anggota Keluarga (Jiwa)", en: "Number of Family Members (People)", ar: "عدد أفراد الأسرة (الأشخاص)", zh: "家庭成员数量（人）", ja: "家族の人数 (人)", ko: "가족 수 (명)" },
  harga_beras_per_kg_wilayah_anda: { id: "Harga Beras per kg di Wilayah Anda (Rupiah)", en: "Rice Price per kg in Your Area (Rupiah)", ar: "سعر الأرز للكيلوجرام في منطقتك (روبية)", zh: "您所在地区的大米每公斤价格（印尼盾）", ja: "あなたの地域の米1kgあたりの価格 (ルピア)", ko: "귀하 지역의 kg당 쌀 가격 (루피아)" },
  total_zakat_beras: { id: "Total Zakat (Beras)", en: "Total Zakat (Rice)", ar: "إجمالي الزكاة (أرز)", zh: "天课总额（大米）", ja: "ザカート総額 (米)", ko: "총 자카트 (쌀)" },
  atau_jika_berupa_uang: { id: "Atau Jika Berupa Uang", en: "Or If in the Form of Money", ar: "أو إذا كان في شكل أموال", zh: "或者如果是货币形式", ja: "または金銭の場合", ko: "또는 돈의 형태일 경우" },
  info_kewajiban_fitrah: { id: "Masing-masing jiwa wajib mengeluarkan 2,5 kg beras (makanan pokok) atau uang senilai dengannya.", en: "Each person is obligated to give 2.5 kg of rice (staple food) or its equivalent in money.", ar: "يجب على كل فرد إخراج 2.5 كجم من الأرز (الطعام الأساسي) أو ما يعادله من المال.", zh: "每人必须捐出2.5公斤大米（主食）或等值的金钱。", ja: "各人は2.5 kgの米（主食）またはそれと同等の金銭を出す義務があります。", ko: "각 사람은 2.5kg의 쌀(주식) 또는 그에 상응하는 돈을 내야 할 의무가 있습니다." },
  orang_satuan: { id: "Orang", en: "Person", ar: "شخص", zh: "人", ja: "人", ko: "명" },
  terbilang: { id: "Terbilang:", en: "Spelled out:", ar: "مكتوب:", zh: "大写：", ja: "読み上げ:", ko: "금액(문자):" }
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

console.log('JSON locales updated for Fitrah.');
