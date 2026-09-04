const fs = require('fs');
const file = 'src/routes/zakat-faraidh/+page.svelte';
let s = fs.readFileSync(file, 'utf8');

const keysMap = {
  "Isi Aset Perniagaan (Usaha Dagang)": "isi_aset_perniagaan",
  "Modal Usaha / Stok Barang / Bahan Baku / Aset Lancar (Rupiah)": "modal_usaha_stok",
  "Keuntungan Bersih Usaha (Rupiah)": "keuntungan_bersih_usaha",
  "Piutang Lancar Usaha / Tagihan yang Pasti Terbayar (Rupiah)": "piutang_lancar_usaha",
  "Hutang Dagang / Hutang Jatuh Tempo Terkait Usaha (Rupiah)": "hutang_dagang_jatuh_tempo",
  "Nisab Perdagangan (85 gram Emas)": "nisab_perdagangan_emas"
};

for (const [text, key] of Object.entries(keysMap)) {
  const safeText = text.replace(/[.*+?^$\/()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`>\\s*${safeText}\\s*<`, 'g');
  s = s.replace(regex, `>{$t('zakat.${key}') || '${text}'}<`);
}

// Inline calculation detail replacements
s = s.replace(/Modal Usaha \(/g, `{$t('zakat.modal_usaha_label') || 'Modal Usaha'} (`);
s = s.replace(/\) \+ Keuntungan \(/g, `) + {$t('zakat.keuntungan_label') || 'Keuntungan'} (`);
s = s.replace(/\) \+ Piutang \(/g, `) + {$t('zakat.piutang_label') || 'Piutang'} (`);
s = s.replace(/>Batas Nisab \(85g Emas\):</g, `>{$t('zakat.batas_nisab_85g_emas') || 'Batas Nisab (85g Emas):'}<`);
s = s.replace(/Mencapai Nisab \(Wajib Zakat \{formatNumberStr\(2\.5, \$locale\)\}\%\)/g, `{$t('zakat.mencapai_nisab_wajib1') || 'Mencapai Nisab (Wajib Zakat '}{formatNumberStr(2.5, $locale)}%)`);
s = s.replace(/>Rekomendasi Sedekah:</g, `>{$t('zakat.rekomendasi_sedekah_label') || 'Rekomendasi Sedekah:'}<`);

// Multiline info
const infoAset = /Aset bersih perdagangan Anda masih di bawah nishab tahunan\. Anda\s*disarankan mengeluarkan sedekah sukarela\./g;
s = s.replace(infoAset, `{$t('zakat.info_sedekah_perdagangan') || 'Aset bersih perdagangan Anda masih di bawah nishab tahunan. Anda disarankan mengeluarkan sedekah sukarela.'}`);

fs.writeFileSync(file, s);
console.log('Template tags injected for Zakat Perdagangan text.');

// Locales
const path = require('path');
const localesDir = path.join('src', 'lib', 'i18n');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const translations = {
  isi_aset_perniagaan: { id: "Isi Aset Perniagaan (Usaha Dagang)", en: "Fill Business Assets (Trading Business)", ar: "املأ أصول التجارة (عمل تجاري)", zh: "填写商业资产（贸易业务）", ja: "事業資産の入力 (取引事業)", ko: "사업 자산 입력 (무역 사업)" },
  modal_usaha_stok: { id: "Modal Usaha / Stok Barang / Bahan Baku / Aset Lancar (Rupiah)", en: "Business Capital / Inventory / Raw Materials / Current Assets (Rupiah)", ar: "رأس مال العمل / المخزون / المواد الخام / الأصول المتداولة (روبية)", zh: "营运资金/库存/原材料/流动资产（印尼盾）", ja: "事業資本 / 在庫 / 原材料 / 流動資産 (ルピア)", ko: "사업 자본 / 재고 / 원자재 / 유동 자산 (루피아)" },
  keuntungan_bersih_usaha: { id: "Keuntungan Bersih Usaha (Rupiah)", en: "Net Business Profit (Rupiah)", ar: "صافي ربح العمل (روبية)", zh: "企业净利润（印尼盾）", ja: "事業純利益 (ルピア)", ko: "순 사업 이익 (루피아)" },
  piutang_lancar_usaha: { id: "Piutang Lancar Usaha / Tagihan yang Pasti Terbayar (Rupiah)", en: "Current Business Receivables / Guaranteed Receivables (Rupiah)", ar: "ذمم العمل المتداولة / الذمم المضمونة الدفع (روبية)", zh: "流动商业应收账款/有保障应收账款（印尼盾）", ja: "流動事業売掛金 / 確実な売掛金 (ルピア)", ko: "유동 사업 매출채권 / 보장된 매출채권 (루피아)" },
  hutang_dagang_jatuh_tempo: { id: "Hutang Dagang / Hutang Jatuh Tempo Terkait Usaha (Rupiah)", en: "Trade Payables / Due Business-Related Debts (Rupiah)", ar: "الذمم الدائنة التجارية / الديون المستحقة المتعلقة بالعمل (روبية)", zh: "应付贸易账款/与业务相关的到期债务（印尼盾）", ja: "買掛金 / 事業関連の支払期日到来債務 (ルピア)", ko: "매입채무 / 사업 관련 만기 부채 (루피아)" },
  nisab_perdagangan_emas: { id: "Nisab Perdagangan (85 gram Emas)", en: "Trade Nisab (85 grams Gold)", ar: "نصاب التجارة (85 جرام ذهب)", zh: "贸易起征点（85克黄金）", ja: "取引のニサーブ (85グラムの金)", ko: "무역 니삽 (금 85그램)" },
  modal_usaha_label: { id: "Modal Usaha", en: "Business Capital", ar: "رأس مال العمل", zh: "营运资金", ja: "事業資本", ko: "사업 자본" },
  keuntungan_label: { id: "Keuntungan", en: "Profit", ar: "الربح", zh: "利润", ja: "利益", ko: "이익" },
  piutang_label: { id: "Piutang", en: "Receivables", ar: "الذمم المدينة", zh: "应收账款", ja: "売掛金", ko: "매출채권" },
  batas_nisab_85g_emas: { id: "Batas Nisab (85g Emas):", en: "Nisab Limit (85g Gold):", ar: "حد النصاب (85 جم ذهب):", zh: "起征点限制（85克黄金）：", ja: "ニサーブ限度 (金85g):", ko: "니삽 한도 (금 85g):" },
  mencapai_nisab_wajib1: { id: "Mencapai Nisab (Wajib Zakat ", en: "Reached Nisab (Mandatory Zakat ", ar: "بلغ النصاب (زكاة واجبة ", zh: "达到起征点（必须缴纳天课 ", ja: "ニサーブ達成 (ザカート義務 ", ko: "니삽 도달 (자카트 의무 " },
  rekomendasi_sedekah_label: { id: "Rekomendasi Sedekah:", en: "Recommended Charity:", ar: "الصدقة الموصى بها:", zh: "推荐捐赠：", ja: "推奨される寄付:", ko: "권장 기부:" },
  info_sedekah_perdagangan: { id: "Aset bersih perdagangan Anda masih di bawah nishab tahunan. Anda disarankan mengeluarkan sedekah sukarela.", en: "Your net trade assets are still below the annual nisab. You are recommended to give voluntary charity (sedekah).", ar: "أصولك التجارية الصافية لا تزال أقل من النصاب السنوي. يوصى بإخراج صدقة تطوعية.", zh: "您的净贸易资产仍低于年度起征点。建议您进行自愿捐赠（Sedekah）。", ja: "あなたの純取引資産はまだ年間のニサーブを下回っています。任意の寄付（サダカ）を行うことが推奨されます。", ko: "귀하의 순 무역 자산은 아직 연간 니삽 미만입니다. 자발적인 기부(사다카)를 권장합니다." }
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

console.log('JSON locales updated for Zakat Perdagangan.');
