const fs = require('fs');
const file = 'src/routes/zakat-faraidh/+page.svelte';
let s = fs.readFileSync(file, 'utf8');

const keysMap = {
  "Nilai Portofolio Saham Saat Ini / Nilai Pasar Saham (Rupiah)": "nilai_portofolio_saham",
  "Dividen yang Diterima (Rupiah)": "dividen_diterima",
  "Hutang Lancar untuk Pembelian Saham / Margin Debt (Rupiah)": "hutang_margin_saham",
  "Nisab Saham (85 gram Emas)": "nisab_saham_emas"
};

for (const [text, key] of Object.entries(keysMap)) {
  const safeText = text.replace(/[.*+?^$\/()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`>\\s*${safeText}\\s*<`, 'g');
  s = s.replace(regex, `>{$t('zakat.${key}') || '${text}'}<`);
}

// Multiline info
const infoAset = /Aset saham bersih Anda masih di bawah nishab tahunan\. Anda\s*disarankan mengeluarkan sedekah sukarela\./g;
s = s.replace(infoAset, `{$t('zakat.info_sedekah_saham') || 'Aset saham bersih Anda masih di bawah nishab tahunan. Anda disarankan mengeluarkan sedekah sukarela.'}`);

fs.writeFileSync(file, s);
console.log('Template tags injected for Zakat Saham text.');

// Locales
const path = require('path');
const localesDir = path.join('src', 'lib', 'i18n');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const translations = {
  nilai_portofolio_saham: { id: "Nilai Portofolio Saham Saat Ini / Nilai Pasar Saham (Rupiah)", en: "Current Stock Portfolio Value / Stock Market Value (Rupiah)", ar: "قيمة محفظة الأسهم الحالية / القيمة السوقية للأسهم (روبية)", zh: "当前股票投资组合价值/股票市值（印尼盾）", ja: "現在の株式ポートフォリオの価値 / 株式の時価 (ルピア)", ko: "현재 주식 포트폴리오 가치 / 주식 시장 가치 (루피아)" },
  dividen_diterima: { id: "Dividen yang Diterima (Rupiah)", en: "Dividends Received (Rupiah)", ar: "الأرباح المستلمة (روبية)", zh: "收到的股息（印尼盾）", ja: "受け取った配当金 (ルピア)", ko: "수령한 배당금 (루피아)" },
  hutang_margin_saham: { id: "Hutang Lancar untuk Pembelian Saham / Margin Debt (Rupiah)", en: "Current Debt for Stock Purchase / Margin Debt (Rupiah)", ar: "الديون المتداولة لشراء الأسهم / ديون الهامش (روبية)", zh: "购买股票的流动债务/保证金债务（印尼盾）", ja: "株式購入のための流動負債 / 信用取引債務 (ルピア)", ko: "주식 구매를 위한 유동 부채 / 마진 부채 (루피아)" },
  nisab_saham_emas: { id: "Nisab Saham (85 gram Emas)", en: "Stock Nisab (85 grams Gold)", ar: "نصاب الأسهم (85 جرام ذهب)", zh: "股票起征点（85克黄金）", ja: "株式のニサーブ (85グラムの金)", ko: "주식 니삽 (금 85그램)" },
  info_sedekah_saham: { id: "Aset saham bersih Anda masih di bawah nishab tahunan. Anda disarankan mengeluarkan sedekah sukarela.", en: "Your net stock assets are still below the annual nisab. You are recommended to give voluntary charity (sedekah).", ar: "أصول أسهمك الصافية لا تزال أقل من النصاب السنوي. يوصى بإخراج صدقة تطوعية.", zh: "您的净股票资产仍低于年度起征点。建议您进行自愿捐赠（Sedekah）。", ja: "あなたの純株式資産はまだ年間のニサーブを下回っています。任意の寄付（サダカ）を行うことが推奨されます。", ko: "귀하의 순 주식 자산은 아직 연간 니삽 미만입니다. 자발적인 기부(사다카)를 권장합니다." }
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

console.log('JSON locales updated for Zakat Saham.');
