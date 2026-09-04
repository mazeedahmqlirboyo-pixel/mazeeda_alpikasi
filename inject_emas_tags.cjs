const fs = require('fs');
const file = 'src/routes/zakat-faraidh/+page.svelte';
let s = fs.readFileSync(file, 'utf8');

const keysMap = {
  "Berat Emas yang Disimpan / Investasi (gram)": "berat_emas_simpanan_investasi",
  "Berat Emas Perhiasan yang Rutin Dipakai (gram)": "berat_emas_perhiasan_rutin"
};

for (const [text, key] of Object.entries(keysMap)) {
  const safeText = text.replace(/[.*+?^$\/()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`>\\s*${safeText}\\s*<`, 'g');
  s = s.replace(regex, `>{$t('zakat.${key}') || '${text}'}<`);
}

// Multiline info 1
const infoEmas1 = />\s*Emas batangan, koin emas, atau perhiasan yang disimpan dan jarang\s*dipakai \(wajib zakat jika >= 85 gram\)\.\s*</g;
s = s.replace(infoEmas1, `>{$t('zakat.info_emas_simpanan') || 'Emas batangan, koin emas, atau perhiasan yang disimpan dan jarang dipakai (wajib zakat jika >= 85 gram).'}<`);

// Multiline info 2
const infoEmas2 = />\s*Emas yang digunakan sebagai perhiasan sehari-hari \(tidak wajib zakat\s*menurut mayoritas ulama jika dalam batas wajar\)\.\s*</g;
s = s.replace(infoEmas2, `>{$t('zakat.info_emas_perhiasan') || 'Emas yang digunakan sebagai perhiasan sehari-hari (tidak wajib zakat menurut mayoritas ulama jika dalam batas wajar).'}<`);

// Multiline info 3 (with variable)
const infoEmas3 = /Berat emas simpanan Anda \(\{beratEmasSimpan \|\| 0\} gram\) masih di bawah\s*batas nishab \(85 gram\)\./g;
s = s.replace(infoEmas3, `{$t('zakat.info_emas_belum_nishab1') || 'Berat emas simpanan Anda ('}{beratEmasSimpan || 0} {$t('zakat.info_emas_belum_nishab2') || 'gram) masih di bawah batas nishab (85 gram).'}`);

// Also fix "0 gram" and "85 gram" in the results table:
// The UI shows "0 gram" and "85 gram" which comes from {zakatEmasResult.emasWajibZakat} gram and 85 gram.
// Let's replace "gram" in these spans as well, just in case they were missed.
s = s.replace(/\} gram</g, `} {$t('zakat.gram_satuan') || 'gram'}<`);
s = s.replace(/>85 gram</g, `>85 {$t('zakat.gram_satuan') || 'gram'}<`);

fs.writeFileSync(file, s);
console.log('Template tags injected for Zakat Emas text.');

// Locales
const path = require('path');
const localesDir = path.join('src', 'lib', 'i18n');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const translations = {
  berat_emas_simpanan_investasi: { id: "Berat Emas yang Disimpan / Investasi (gram)", en: "Weight of Saved / Invested Gold (grams)", ar: "وزن الذهب المدخر / المستثمر (جرام)", zh: "储存/投资的黄金重量（克）", ja: "保管・投資用金の重量 (グラム)", ko: "보관/투자용 금의 무게 (그램)" },
  berat_emas_perhiasan_rutin: { id: "Berat Emas Perhiasan yang Rutin Dipakai (gram)", en: "Weight of Regularly Worn Gold Jewelry (grams)", ar: "وزن مجوهرات الذهب المستخدمة بانتظام (جرام)", zh: "经常佩戴的黄金首饰重量（克）", ja: "日常的に身につける金製装飾品の重量 (グラム)", ko: "일상적으로 착용하는 금 장신구의 무게 (그램)" },
  info_emas_simpanan: { id: "Emas batangan, koin emas, atau perhiasan yang disimpan dan jarang dipakai (wajib zakat jika >= 85 gram).", en: "Gold bullion, gold coins, or rarely worn saved jewelry (zakat is mandatory if >= 85 grams).", ar: "سبائك الذهب، أو العملات الذهبية، أو المجوهرات المدخرة التي نادراً ما تلبس (الزكاة واجبة إذا >= 85 جرام).", zh: "金条、金币或很少佩戴的储存首饰（如果>=85克则必须缴纳天课）。", ja: "金地金、金貨、または滅多に使用しない保管用装飾品（85グラム以上でザカート義務）。", ko: "금괴, 금화 또는 거의 착용하지 않고 보관 중인 장신구 (85g 이상이면 자카트 의무)." },
  info_emas_perhiasan: { id: "Emas yang digunakan sebagai perhiasan sehari-hari (tidak wajib zakat menurut mayoritas ulama jika dalam batas wajar).", en: "Gold used as everyday jewelry (not mandatory for zakat according to majority of scholars if within reasonable limits).", ar: "الذهب المستخدم كحلي يومي (لا تجب فيه الزكاة عند جمهور العلماء إذا كان ضمن الحدود المعقولة).", zh: "作为日常首饰使用的黄金（根据多数学者的观点，在合理范围内无需缴纳天课）。", ja: "日常の装飾品として使用される金（適正範囲内であれば大多数の学者によりザカートの義務なし）。", ko: "일상적인 장신구로 사용되는 금 (합리적인 한도 내라면 대다수 학자에 따라 자카트 의무 없음)." },
  info_emas_belum_nishab1: { id: "Berat emas simpanan Anda (", en: "Your saved gold weight (", ar: "وزن الذهب المدخر الخاص بك (", zh: "您的储存黄金重量（", ja: "あなたの保管している金の重量 (", ko: "귀하가 보관 중인 금의 무게 (" },
  info_emas_belum_nishab2: { id: "gram) masih di bawah batas nishab (85 gram).", en: "grams) is still below the nisab limit (85 grams).", ar: "جرام) لا يزال أقل من حد النصاب (85 جرام).", zh: "克）仍低于起征点（85克）。", ja: "グラム) はまだニサーブの限度 (85グラム) を下回っています。", ko: "그램)은 아직 니삽 한도(85그램) 미만입니다." }
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

console.log('JSON locales updated for Zakat Emas.');
