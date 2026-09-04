const fs = require('fs');
const file = 'src/routes/zakat-faraidh/+page.svelte';
let s = fs.readFileSync(file, 'utf8');

// Replacements map
const keysMap = {
  "Total Saldo Simpanan / Tabungan (Telah Mengendap 1 Tahun/Haul)": "total_saldo_simpanan_haul",
  "Nisab Tabungan (85 gram Emas)": "nisab_tabungan_emas",
  "Manual": "manual"
};

for (const [text, key] of Object.entries(keysMap)) {
  const safeText = text.replace(/[.*+?^$\/()|[\]\\]/g, '\\$&'); // escape regex
  const regex = new RegExp(`>\\s*${safeText}\\s*<`, 'g');
  s = s.replace(regex, `>{$t('zakat.${key}') || '${text}'}<`);
}

// Multiline explanation
const multilineExplanationRegex = />\s*Saldo tabungan Anda belum mencapai nishab tahunan\. Anda disarankan\s*mengeluarkan sedekah sukarela\.\s*</g;
s = s.replace(multilineExplanationRegex, `>{$t('zakat.info_sedekah_tabungan') || 'Saldo tabungan Anda belum mencapai nishab tahunan. Anda disarankan mengeluarkan sedekah sukarela.'}<`);

fs.writeFileSync(file, s);
console.log('Template tags injected for Tabungan and Manual text.');

// Update locales
const path = require('path');
const localesDir = path.join('src', 'lib', 'i18n');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const translations = {
  total_saldo_simpanan_haul: { id: "Total Saldo Simpanan / Tabungan (Telah Mengendap 1 Tahun/Haul)", en: "Total Savings Balance (Deposited for 1 Year/Haul)", ar: "إجمالي رصيد المدخرات (مودع لمدة عام/حول)", zh: "总储蓄余额（已存满一年/Haul）", ja: "総貯蓄残高 (1年間/ハウル預け入れ)", ko: "총 저축 잔액 (1년/하울 동안 예치됨)" },
  nisab_tabungan_emas: { id: "Nisab Tabungan (85 gram Emas)", en: "Savings Nisab (85 grams Gold)", ar: "نصاب المدخرات (85 جرام ذهب)", zh: "储蓄起征点（85克黄金）", ja: "貯蓄のニサーブ (85グラムの金)", ko: "저축 니삽 (금 85그램)" },
  manual: { id: "Manual", en: "Manual", ar: "يدوي", zh: "手动", ja: "手動", ko: "수동" },
  info_sedekah_tabungan: { id: "Saldo tabungan Anda belum mencapai nishab tahunan. Anda disarankan mengeluarkan sedekah sukarela.", en: "Your savings balance has not reached the annual nisab. You are recommended to give voluntary charity (sedekah).", ar: "لم يصل رصيد مدخراتك إلى النصاب السنوي. يوصى بإخراج صدقة تطوعية.", zh: "您的储蓄余额尚未达到年度起征点。建议您进行自愿捐赠（Sedekah）。", ja: "貯蓄残高が年間のニサーブに達していません。任意の寄付（サダカ）を行うことが推奨されます。", ko: "저축 잔액이 연간 니삽에 도달하지 않았습니다. 자발적인 기부(사다카)를 권장합니다." }
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

console.log('JSON locales updated for Tabungan and Manual.');
