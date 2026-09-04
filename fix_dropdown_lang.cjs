const fs = require('fs');
const path = require('path');

// 1. Update Svelte component
const pagePath = path.join(__dirname, 'src', 'routes', 'zakat-faraidh', '+page.svelte');
let page = fs.readFileSync(pagePath, 'utf8');

// Replace zakatItems
const oldZakatItemsRegex = /const zakatItems = \[\s*\{ label: "Zakat Penghasilan"[\s\S]*?\];/;
const newZakatItems = `$: zakatItems = [
    { label: $t('zakat.type_penghasilan') || "Zakat Penghasilan", value: "penghasilan", icon: "💰" },
    { label: $t('zakat.type_maal') || "Zakat Maal (Harta)", value: "maal", icon: "💎" },
    { label: $t('zakat.type_fitrah') || "Zakat Fitrah", value: "fitrah", icon: "🌾" },
    { label: $t('zakat.type_tabungan') || "Zakat Tabungan", value: "tabungan", icon: "🏦" },
    { label: $t('zakat.type_emas') || "Zakat Emas", value: "emas", icon: "🥇" },
    { label: $t('zakat.type_perak') || "Zakat Perak", value: "perak", icon: "🥈" },
    { label: $t('zakat.type_pertanian') || "Zakat Pertanian", value: "pertanian", icon: "🌱" },
    { label: $t('zakat.type_perdagangan') || "Zakat Perdagangan", value: "perniagaan", icon: "🏪" },
    { label: $t('zakat.type_saham') || "Zakat Saham", value: "saham", icon: "📈" },
    { label: $t('zakat.type_reksadana') || "Zakat Reksadana", value: "reksadana", icon: "📊" },
    { label: $t('zakat.type_peternakan') || "Zakat Peternakan", value: "peternakan", icon: "🐄" },
    { label: $t('zakat.type_tambak') || "Zakat Tambak", value: "tambak", icon: "🐟" },
    { label: $t('zakat.type_perusahaan') || "Zakat Perusahaan", value: "perusahaan", icon: "🏢" },
    { label: $t('zakat.type_properti') || "Zakat Properti", value: "properti_sewa", icon: "🏘️" },
    { label: $t('zakat.type_pertambangan') || "Zakat Pertambangan", value: "pertambangan", icon: "⛏️" },
  ];`;
page = page.replace(oldZakatItemsRegex, newZakatItems);

// Replace currencyItems
const oldCurrencyItemsRegex = /const currencyItems = \[\s*\{ value: "IDR"[\s\S]*?\];/;
const newCurrencyItems = `$: currencyItems = [
    { value: "IDR", label: $t('zakat.curr_idr') || "Rupiah Indonesia (IDR)", icon: "🇮🇩" },
    { value: "USD", label: $t('zakat.curr_usd') || "Dolar Amerika (USD)", icon: "🇺🇸" },
    { value: "SAR", label: $t('zakat.curr_sar') || "Riyal Arab Saudi (SAR)", icon: "🇸🇦" },
    { value: "CNY", label: $t('zakat.curr_cny') || "Yuan Tiongkok (CNY)", icon: "🇨🇳" },
    { value: "JPY", label: $t('zakat.curr_jpy') || "Yen Jepang (JPY)", icon: "🇯🇵" },
    { value: "KRW", label: $t('zakat.curr_krw') || "Won Korea Selatan (KRW)", icon: "🇰🇷" },
  ];`;
page = page.replace(oldCurrencyItemsRegex, newCurrencyItems);

fs.writeFileSync(pagePath, page, 'utf8');


// 2. Inject translations
const i18nDir = path.join(__dirname, 'src', 'lib', 'i18n');

const idKeys = [
  `"type_penghasilan": "Zakat Penghasilan",`,
  `"type_maal": "Zakat Maal (Harta)",`,
  `"type_fitrah": "Zakat Fitrah",`,
  `"type_tabungan": "Zakat Tabungan",`,
  `"type_emas": "Zakat Emas",`,
  `"type_perak": "Zakat Perak",`,
  `"type_pertanian": "Zakat Pertanian",`,
  `"type_perdagangan": "Zakat Perdagangan",`,
  `"type_saham": "Zakat Saham",`,
  `"type_reksadana": "Zakat Reksadana",`,
  `"type_peternakan": "Zakat Peternakan",`,
  `"type_tambak": "Zakat Tambak",`,
  `"type_perusahaan": "Zakat Perusahaan",`,
  `"type_properti": "Zakat Properti",`,
  `"type_pertambangan": "Zakat Pertambangan",`,
  `"curr_idr": "Rupiah Indonesia (IDR)",`,
  `"curr_usd": "Dolar Amerika (USD)",`,
  `"curr_sar": "Riyal Arab Saudi (SAR)",`,
  `"curr_cny": "Yuan Tiongkok (CNY)",`,
  `"curr_jpy": "Yen Jepang (JPY)",`,
  `"curr_krw": "Won Korea Selatan (KRW)",`
];

const enKeys = [
  `"type_penghasilan": "Income Zakat",`,
  `"type_maal": "Maal (Wealth) Zakat",`,
  `"type_fitrah": "Fitrah Zakat",`,
  `"type_tabungan": "Savings Zakat",`,
  `"type_emas": "Gold Zakat",`,
  `"type_perak": "Silver Zakat",`,
  `"type_pertanian": "Agriculture Zakat",`,
  `"type_perdagangan": "Trading Zakat",`,
  `"type_saham": "Stock Zakat",`,
  `"type_reksadana": "Mutual Fund Zakat",`,
  `"type_peternakan": "Livestock Zakat",`,
  `"type_tambak": "Aquaculture Zakat",`,
  `"type_perusahaan": "Corporate Zakat",`,
  `"type_properti": "Property Zakat",`,
  `"type_pertambangan": "Mining Zakat",`,
  `"curr_idr": "Indonesian Rupiah (IDR)",`,
  `"curr_usd": "US Dollar (USD)",`,
  `"curr_sar": "Saudi Riyal (SAR)",`,
  `"curr_cny": "Chinese Yuan (CNY)",`,
  `"curr_jpy": "Japanese Yen (JPY)",`,
  `"curr_krw": "South Korean Won (KRW)",`
];

const arKeys = [
  `"type_penghasilan": "زكاة الدخل",`,
  `"type_maal": "زكاة المال",`,
  `"type_fitrah": "زكاة الفطر",`,
  `"type_tabungan": "زكاة المدخرات",`,
  `"type_emas": "زكاة الذهب",`,
  `"type_perak": "زكاة الفضة",`,
  `"type_pertanian": "زكاة الزروع",`,
  `"type_perdagangan": "زكاة التجارة",`,
  `"type_saham": "زكاة الأسهم",`,
  `"type_reksadana": "زكاة صناديق الاستثمار",`,
  `"type_peternakan": "زكاة الأنعام",`,
  `"type_tambak": "زكاة المزارع السمكية",`,
  `"type_perusahaan": "زكاة الشركات",`,
  `"type_properti": "زكاة العقارات",`,
  `"type_pertambangan": "زكاة المعادن",`,
  `"curr_idr": "روبية إندونيسية (IDR)",`,
  `"curr_usd": "دولار أمريكي (USD)",`,
  `"curr_sar": "ريال سعودي (SAR)",`,
  `"curr_cny": "يوان صيني (CNY)",`,
  `"curr_jpy": "ين ياباني (JPY)",`,
  `"curr_krw": "وون كوري جنوبي (KRW)",`
];

const zhKeys = [
  `"type_penghasilan": "收入天课",`,
  `"type_maal": "财产天课",`,
  `"type_fitrah": "开斋天课",`,
  `"type_tabungan": "储蓄天课",`,
  `"type_emas": "黄金天课",`,
  `"type_perak": "白银天课",`,
  `"type_pertanian": "农业天课",`,
  `"type_perdagangan": "贸易天课",`,
  `"type_saham": "股票天课",`,
  `"type_reksadana": "共同基金天课",`,
  `"type_peternakan": "畜牧业天课",`,
  `"type_tambak": "水产养殖天课",`,
  `"type_perusahaan": "企业天课",`,
  `"type_properti": "房地产天课",`,
  `"type_pertambangan": "采矿业天课",`,
  `"curr_idr": "印尼盾 (IDR)",`,
  `"curr_usd": "美元 (USD)",`,
  `"curr_sar": "沙特里亚尔 (SAR)",`,
  `"curr_cny": "人民币 (CNY)",`,
  `"curr_jpy": "日元 (JPY)",`,
  `"curr_krw": "韩元 (KRW)",`
];

const jaKeys = [
  `"type_penghasilan": "収入のザカート",`,
  `"type_maal": "財産のザカート",`,
  `"type_fitrah": "喜捨のザカート",`,
  `"type_tabungan": "貯蓄のザカート",`,
  `"type_emas": "金のザカート",`,
  `"type_perak": "銀のザカート",`,
  `"type_pertanian": "農業のザカート",`,
  `"type_perdagangan": "商業のザカート",`,
  `"type_saham": "株式のザカート",`,
  `"type_reksadana": "投資信託のザカート",`,
  `"type_peternakan": "家畜のザカート",`,
  `"type_tambak": "養殖業のザカート",`,
  `"type_perusahaan": "企業のザカート",`,
  `"type_properti": "不動産のザカート",`,
  `"type_pertambangan": "鉱業のザカート",`,
  `"curr_idr": "インドネシアルピア (IDR)",`,
  `"curr_usd": "アメリカドル (USD)",`,
  `"curr_sar": "サウジアラビアリヤル (SAR)",`,
  `"curr_cny": "中国人民元 (CNY)",`,
  `"curr_jpy": "日本円 (JPY)",`,
  `"curr_krw": "韓国ウォン (KRW)",`
];

const koKeys = [
  `"type_penghasilan": "소득 자카트",`,
  `"type_maal": "재산 자카트",`,
  `"type_fitrah": "피트라 자카트",`,
  `"type_tabungan": "저축 자카트",`,
  `"type_emas": "금 자카트",`,
  `"type_perak": "은 자카트",`,
  `"type_pertanian": "농업 자카트",`,
  `"type_perdagangan": "상업 자카트",`,
  `"type_saham": "주식 자카트",`,
  `"type_reksadana": "뮤추얼 펀드 자카트",`,
  `"type_peternakan": "가축 자카트",`,
  `"type_tambak": "양식업 자카트",`,
  `"type_perusahaan": "기업 자카트",`,
  `"type_properti": "부동산 자카트",`,
  `"type_pertambangan": "광업 자카트",`,
  `"curr_idr": "인도네시아 루피아 (IDR)",`,
  `"curr_usd": "미국 달러 (USD)",`,
  `"curr_sar": "사우디아라비아 리얄 (SAR)",`,
  `"curr_cny": "중국 위안 (CNY)",`,
  `"curr_jpy": "일본 엔 (JPY)",`,
  `"curr_krw": "한국 원 (KRW)",`
];

const locales = {
  'id.json': idKeys,
  'en.json': enKeys,
  'ar.json': arKeys,
  'zh.json': zhKeys,
  'ja.json': jaKeys,
  'ko.json': koKeys
};

for (const [file, keysArray] of Object.entries(locales)) {
  const filePath = path.join(i18nDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    const regex = /("pilih_mata_uang":\s*".*?",)/;
    if (regex.test(content)) {
      const injectionStr = keysArray.map(k => `    ${k}`).join('\\n');
      content = content.replace(regex, `$1\\n${injectionStr}`);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Injected keys into ${file}`);
    } else {
      console.log(`Could not find pilih_mata_uang in ${file}`);
    }
  }
}

console.log('Dropdown translations fixed.');
