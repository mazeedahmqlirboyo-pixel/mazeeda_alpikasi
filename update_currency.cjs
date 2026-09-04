const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'routes', 'zakat-faraidh', '+page.svelte');
let s = fs.readFileSync(file, 'utf8');

// Replace formatCurrency
const formatCurrencyRegex = /function formatCurrency\(num: number\): string \{[\s\S]*?\}/;
const newFormatCurrency = `
  import n2words from "n2words";
  let selectedCurrency = "IDR";

  function formatNumberStr(val: string | number): string {
    if (!val) return "";
    return val.toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g, ".");
  }

  function formatCurrency(num: number): string {
    if (selectedCurrency === 'USD') return "$ " + Math.round(num).toLocaleString("en-US");
    if (selectedCurrency === 'SAR') return "ر.س " + Math.round(num).toLocaleString("ar-SA");
    if (selectedCurrency === 'CNY') return "¥ " + Math.round(num).toLocaleString("zh-CN");
    if (selectedCurrency === 'JPY') return "¥ " + Math.round(num).toLocaleString("ja-JP");
    if (selectedCurrency === 'KRW') return "₩ " + Math.round(num).toLocaleString("ko-KR");
    return "Rp " + Math.round(num).toLocaleString("id-ID");
  }
`;
s = s.replace(formatCurrencyRegex, newFormatCurrency);

// Replace terbilang
const terbilangRegex = /\/\/ Indonesian Terbilang \(number to words helper\)[\s\S]*?return konversi\(utama\) \+ " Triliun " \+ konversi\(sisa\);\n\s+\}\n\s+\}\n\s+return konversi\(Math\.floor\(nilai\)\)\.trim\(\) \+ " Rupiah";\n\s+\}/;

const newTerbilang = `
  // Multi-language Terbilang (number to words helper)
  function terbilang(nilai: number | string): string {
    if (!nilai) return "";
    const n = typeof nilai === 'string' ? parseFloat(nilai) : nilai;
    if (isNaN(n) || n === 0) return "Nol";
    
    try {
      if (selectedCurrency === 'IDR') return n2words(n, { lang: 'id' }) + " Rupiah";
      if (selectedCurrency === 'USD') return n2words(n, { lang: 'en' }) + " Dollars";
      if (selectedCurrency === 'SAR') return n2words(n, { lang: 'ar' }) + " Riyal";
      if (selectedCurrency === 'CNY') return n2words(n, { lang: 'zh' }) + " Yuan";
      if (selectedCurrency === 'JPY') return n2words(n, { lang: 'ja' }) + " Yen";
      if (selectedCurrency === 'KRW') return n2words(n, { lang: 'ko' }) + " Won";
    } catch(e) {}
    
    return n.toString();
  }
`;
if(terbilangRegex.test(s)) {
    s = s.replace(terbilangRegex, newTerbilang);
    console.log("Replaced terbilang successfully.");
} else {
    console.log("Could not find terbilang regex match. Replacing function by name...");
    // Fallback: replace just the function signature and hope it matches
    const terbilangFallbackRegex = /function terbilang\(nilai: number\): string \{[\s\S]*?return konversi\(Math\.floor\(nilai\)\)\.trim\(\) \+ " Rupiah";\n  \}/;
    s = s.replace(terbilangFallbackRegex, newTerbilang);
}

fs.writeFileSync(file, s, 'utf8');
console.log("Done.");
