const fs = require('fs');
const file = 'src/routes/zakat-faraidh/+page.svelte';
let s = fs.readFileSync(file, 'utf8');

// Peternakan
s = s.replace(
  />ekor<\/span>/g,
  `>{$t('zakat.ekor') || 'ekor'}</span>`
);
s = s.replace(
  /\} ekor<\/span>/g,
  `} {$t('zakat.ekor') || 'ekor'}</span>`
);
s = s.replace(
  /<span class="capitalize">\{jenisTernak\}<\/span>/g,
  `<span class="capitalize">{$t('zakat.' + jenisTernak) || jenisTernak}</span>`
);

// Tambak
const keysTambak = {
  "Biaya &amp; Hutang": "biaya_dan_hutang",
  "Hasil Panen": "hasil_panen_label",
  "Uang Kas": "uang_kas_label",
  "Biaya Operasional": "biaya_operasional_label",
  "Hutang Jatuh Tempo": "hutang_jatuh_tempo_label"
};
// for Tambak detail calculation replacements
s = s.replace(/Hasil Panen \(/g, `{$t('zakat.hasil_panen_label') || 'Hasil Panen'} (`);
s = s.replace(/\) \+ Uang Kas \(/g, `) + {$t('zakat.uang_kas_label') || 'Uang Kas'} (`);
s = s.replace(/Biaya Operasional \(/g, `{$t('zakat.biaya_operasional_label') || 'Biaya Operasional'} (`);
s = s.replace(/\) \+ Hutang Jatuh Tempo \(/g, `) + {$t('zakat.hutang_jatuh_tempo_label') || 'Hutang Jatuh Tempo'} (`);
s = s.replace(/>Biaya &amp; Hutang</g, `>{$t('zakat.biaya_dan_hutang') || 'Biaya &amp; Hutang'}<`);

// Perusahaan
const keysPerusahaan = {
  "Aset Lancar Perusahaan (Kas, Bank, Stok Dagangan, Piutang) (Rupiah)": "aset_lancar_perusahaan",
  "Memiliki Hutang (Rupiah)": "memiliki_hutang",
  "Persentase Kepemilikan Saham Anda (%)": "persentase_kepemilikan",
  "Aset Bersih Perusahaan (Total)": "aset_bersih_perusahaan_total",
  "Nisab Zakat Perusahaan (85 gram Emas)": "nisab_perusahaan_emas",
  "Bersih Perusahaan (Total):": "bersih_perusahaan_total",
  "Aset Lancar": "aset_lancar_label",
  "Hutang Lancar": "hutang_lancar_label",
  "Porsi Kepemilikan Anda": "porsi_kepemilikan_label"
};
for (const [text, key] of Object.entries(keysPerusahaan)) {
  const safeText = text.replace(/[.*+?^$\/()|[\]\\]/g, '\\$&');
  // Handle both >Text< and <strong>Text</strong>
  s = s.replace(new RegExp(`>\\s*${safeText}\\s*<`, 'g'), `>{$t('zakat.${key}') || '${text}'}<`);
}
s = s.replace(
  /Aset Lancar \(/g,
  `{$t('zakat.aset_lancar_label') || 'Aset Lancar'} (`
);
s = s.replace(
  /\) - Hutang Lancar \(/g,
  `) - {$t('zakat.hutang_lancar_label') || 'Hutang Lancar'} (`
);
s = s.replace(
  />Porsi Kepemilikan Anda \(\{formatNumberStr\(persenKepemilikan, \$locale\)\}%\)</g,
  `>{$t('zakat.porsi_kepemilikan1') || 'Porsi Kepemilikan Anda ('}{formatNumberStr(persenKepemilikan, $locale)}%)<`
);
s = s.replace(
  /<strong>Porsi Kepemilikan Anda \(\{formatNumberStr\(persenKepemilikan, \$locale\)\}%\):<\/strong>/g,
  `<strong>{$t('zakat.porsi_kepemilikan_label') || 'Porsi Kepemilikan Anda'} ({formatNumberStr(persenKepemilikan, $locale)}%):</strong>`
);
s = s.replace(
  /Porsi kekayaan bersih Anda di perusahaan masih di bawah nishab\s*tahunan\. Anda disarankan mengeluarkan sedekah sukarela\./g,
  `{$t('zakat.info_sedekah_perusahaan') || 'Porsi kekayaan bersih Anda di perusahaan masih di bawah nishab tahunan. Anda disarankan mengeluarkan sedekah sukarela.'}`
);

// Replace all Zakat yang Wajib Dikeluarkan
s = s.replace(
  /Zakat yang Wajib Dikeluarkan \(\{formatNumberStr\(2\.5, \$locale\)\}%\)/g,
  `{$t('zakat.zakat_wajib_dikeluarkan1') || 'Zakat yang Wajib Dikeluarkan ('}{formatNumberStr(2.5, $locale)}%)`
);

fs.writeFileSync(file, s);
console.log('Template tags injected for final text.');

// Locales
const path = require('path');
const localesDir = path.join('src', 'lib', 'i18n');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const translations = {
  // Tambak
  biaya_dan_hutang: { id: "Biaya & Hutang", en: "Costs & Debts", ar: "التكاليف والديون", zh: "费用与债务", ja: "費用と負債", ko: "비용 및 부채" },
  hasil_panen_label: { id: "Hasil Panen", en: "Harvest", ar: "الحصاد", zh: "收获", ja: "収穫", ko: "수확" },
  uang_kas_label: { id: "Uang Kas", en: "Cash", ar: "النقد", zh: "现金", ja: "現金", ko: "현금" },
  biaya_operasional_label: { id: "Biaya Operasional", en: "Operational Costs", ar: "تكاليف التشغيل", zh: "运营成本", ja: "運営コスト", ko: "운영 비용" },
  hutang_jatuh_tempo_label: { id: "Hutang Jatuh Tempo", en: "Due Debt", ar: "الديون المستحقة", zh: "到期债务", ja: "支払期日到来債務", ko: "만기 부채" },
  
  // Perusahaan
  aset_lancar_perusahaan: { id: "Aset Lancar Perusahaan (Kas, Bank, Stok Dagangan, Piutang) (Rupiah)", en: "Company Current Assets (Cash, Bank, Trade Stock, Receivables) (Rupiah)", ar: "الأصول المتداولة للشركة (نقد، بنك، مخزون تجاري، ذمم مدينة) (روبية)", zh: "公司流动资产（现金、银行、贸易库存、应收账款）（印尼盾）", ja: "会社の流動資産 (現金、銀行、取引在庫、売掛金) (ルピア)", ko: "회사 유동 자산 (현금, 은행, 거래 재고, 미수금) (루피아)" },
  memiliki_hutang: { id: "Memiliki Hutang (Rupiah)", en: "Has Debt (Rupiah)", ar: "لديه ديون (روبية)", zh: "有债务（印尼盾）", ja: "負債あり (ルピア)", ko: "부채 있음 (루피아)" },
  persentase_kepemilikan: { id: "Persentase Kepemilikan Saham Anda (%)", en: "Your Share Ownership Percentage (%)", ar: "نسبة ملكية أسهمك (%)", zh: "您的股份所有权百分比（%）", ja: "あなたの株式所有割合 (%)", ko: "귀하의 주식 소유 비율 (%)" },
  aset_bersih_perusahaan_total: { id: "Aset Bersih Perusahaan (Total)", en: "Total Net Assets of Company", ar: "إجمالي صافي أصول الشركة", zh: "公司净资产总额", ja: "会社の純資産総額", ko: "회사의 총 순자산" },
  porsi_kepemilikan1: { id: "Porsi Kepemilikan Anda (", en: "Your Ownership Portion (", ar: "حصة ملكيتك (", zh: "您的所有权份额（", ja: "あなたの所有割合 (", ko: "귀하의 소유 부분 (" },
  nisab_perusahaan_emas: { id: "Nisab Zakat Perusahaan (85 gram Emas)", en: "Company Zakat Nisab (85 grams Gold)", ar: "نصاب زكاة الشركة (85 جرام ذهب)", zh: "公司天课起征点（85克黄金）", ja: "会社のザカートのニサーブ (85グラムの金)", ko: "회사 자카트 니삽 (금 85그램)" },
  bersih_perusahaan_total: { id: "Bersih Perusahaan (Total):", en: "Net Company (Total):", ar: "صافي الشركة (الإجمالي):", zh: "净公司（总计）：", ja: "純企業 (合計):", ko: "순 회사 (총계):" },
  aset_lancar_label: { id: "Aset Lancar", en: "Current Assets", ar: "الأصول المتداولة", zh: "流动资产", ja: "流動資産", ko: "유동 자산" },
  hutang_lancar_label: { id: "Hutang Lancar", en: "Current Liabilities", ar: "الخصوم المتداولة", zh: "流动负债", ja: "流動負債", ko: "유동 부채" },
  porsi_kepemilikan_label: { id: "Porsi Kepemilikan Anda", en: "Your Ownership Portion", ar: "حصة ملكيتك", zh: "您的所有权份额", ja: "あなたの所有割合", ko: "귀하의 소유 부분" },
  info_sedekah_perusahaan: { id: "Porsi kekayaan bersih Anda di perusahaan masih di bawah nishab tahunan. Anda disarankan mengeluarkan sedekah sukarela.", en: "Your net wealth portion in the company is still below the annual nisab. You are recommended to give voluntary charity.", ar: "حصة صافي ثروتك في الشركة لا تزال أقل من النصاب السنوي. يوصى بإخراج صدقة تطوعية.", zh: "您在公司中的净财富份额仍低于年度起征点。建议您进行自愿捐赠。", ja: "会社におけるあなたの純資産の割合は、まだ年間のニサーブを下回っています。任意の寄付（サダカ）が推奨されます。", ko: "회사 내 귀하의 순자산 부분은 아직 연간 니삽 미만입니다. 자발적인 기부를 권장합니다." },
  
  // Zakat Wajib
  zakat_wajib_dikeluarkan1: { id: "Zakat yang Wajib Dikeluarkan (", en: "Mandatory Zakat to be Paid (", ar: "الزكاة الواجب إخراجها (", zh: "必须缴纳的天课（", ja: "支払うべき必須のザカート (", ko: "납부해야 할 의무 자카트 (" }
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

console.log('JSON locales updated for final fixes.');
