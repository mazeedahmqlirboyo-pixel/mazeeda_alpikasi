const fs = require('fs');
const file = 'src/routes/zakat-faraidh/+page.svelte';
let s = fs.readFileSync(file, 'utf8');

// 1. Add n2words import and selectedCurrency state
s = s.replace(
  /import \{ t, locale \} from "svelte-i18n";/,
  `import { t, locale } from "svelte-i18n";\n  import n2words from "n2words";\n  let selectedCurrency = "IDR";`
);

// 2. Replace formatRupiah definition with formatCurrency
const oldFormat = /function formatRupiah\(num: number, loc: string = 'id', \$locale\): string \{[\s\S]*?return "Rp " \+ valStr;\s*\}/m;
const newFormat = `function formatCurrency(num: number, loc: string = 'id'): string {
    let style = new Intl.NumberFormat(loc === 'ar' ? 'ar-SA' : (loc === 'id' ? 'id-ID' : loc), { style: 'currency', currency: selectedCurrency, maximumFractionDigits: 0 }).format(Math.round(num));
    if (loc === "ar") {
      const idArabic = ["٠","١","٢","٣","٤","٥","٦","٧","٨","٩"];
      style = style.replace(/[0-9]/g, w => idArabic[w]);
    }
    return style;
  }`;
s = s.replace(oldFormat, newFormat);

// 3. Replace terbilang definition with dynamic version
const oldTerbilang = /\/\/ Indonesian Terbilang \(number to words helper\)[\s\S]*?return hasil \? hasil \+ " Rupiah" : "";\s*\}/m;
const newTerbilang = `// Multi-language Terbilang (number to words helper)
  function terbilang(nilai: number): string {
    const langCode = $locale || 'id';
    if (nilai === 0) return langCode === 'id' ? "Nol" : "Zero";
    let n2lang = 'en';
    if (langCode === 'id') n2lang = 'id';
    else if (langCode === 'ar') n2lang = 'ar';
    else if (langCode === 'zh') n2lang = 'zh';
    else if (langCode === 'ko') n2lang = 'ko';
    else if (langCode === 'ja') n2lang = 'ja';
    
    let words = "";
    try {
      words = n2words(nilai, { lang: n2lang });
    } catch(e) {
      words = n2words(nilai, { lang: 'en' });
    }
    
    // Capitalize first letter of each word (simplified)
    words = words.replace(/(^\\w|\\s\\w)/g, m => m.toUpperCase());

    const currencyKey = 'currency_' + selectedCurrency.toLowerCase();
    const currStr = $t('zakat.' + currencyKey) || selectedCurrency;
    return \`\${words} \${currStr}\`;
  }`;
s = s.replace(oldTerbilang, newTerbilang);

// 4. Replace formatRupiah calls with formatCurrency calls globally
s = s.replace(/formatRupiah/g, 'formatCurrency');
// formatRupiah had 3 params sometimes: `formatRupiah(val, $locale)`. We changed it to `formatCurrency(val, $locale)`.
// Wait, the original call was formatRupiah(value, $locale) or formatRupiah(value)

// 5. Replace hardcoded "Rp" labels in inputs.
// Find instances like: >Rp</span
// and replace with: >{selectedCurrency === 'IDR' ? 'Rp' : (selectedCurrency === 'USD' ? '$' : (selectedCurrency === 'SAR' ? 'ر.س' : (selectedCurrency === 'CNY' ? '¥' : (selectedCurrency === 'JPY' ? '¥' : '₩'))))}</span
const dynamicCurrSymbol = `>{selectedCurrency === 'IDR' ? 'Rp' : (selectedCurrency === 'USD' ? '$' : (selectedCurrency === 'SAR' ? 'ر.س' : (selectedCurrency === 'CNY' ? '¥' : (selectedCurrency === 'JPY' ? '¥' : '₩'))))}</span`;
s = s.replace(/>Rp<\/span/g, dynamicCurrSymbol);

// Also replace (Rupiah) with (Mata Uang) in labels
s = s.replace(/\(Rupiah\)/g, `({selectedCurrency})`);

// 6. Insert Currency Selector UI right before <Tabs bind:active={calculatorType}
const currencySelectorUI = `
  <!-- Currency Selector -->
  <div class="px-4 md:px-8 mb-4 max-w-4xl mx-auto flex justify-end">
    <div class="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
      <Coins class="w-4 h-4 text-emerald-600" />
      <span class="text-xs font-bold text-slate-500 dark:text-slate-400">{$t('zakat.pilih_mata_uang') || 'Pilih Mata Uang'}:</span>
      <select bind:value={selectedCurrency} class="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer">
        <option value="IDR">{$t('zakat.currency_idr') || 'Rupiah'}</option>
        <option value="USD">{$t('zakat.currency_usd') || 'Dolar AS'}</option>
        <option value="SAR">{$t('zakat.currency_sar') || 'Riyal Saudi'}</option>
        <option value="CNY">{$t('zakat.currency_cny') || 'Yuan'}</option>
        <option value="JPY">{$t('zakat.currency_jpy') || 'Yen'}</option>
        <option value="KRW">{$t('zakat.currency_krw') || 'Won'}</option>
      </select>
    </div>
  </div>

  <Tabs bind:active={calculatorType}`;

s = s.replace(/<Tabs bind:active=\{calculatorType\}/, currencySelectorUI);

fs.writeFileSync(file, s);
console.log('Successfully refactored +page.svelte for Multi-Currency and Multi-Language Terbilang');
