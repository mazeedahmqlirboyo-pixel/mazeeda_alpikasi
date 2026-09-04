const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'routes', 'zakat-faraidh', '+page.svelte');
let page = fs.readFileSync(pagePath, 'utf8');

// 1. Remove the visibility restriction (restore 🗣️)
page = page.replace(
  /\{\$locale === 'id' && selectedCurrency === 'IDR' \? '🗣️ ' \+ \(\$t\('zakat\.terbilang'\) \|\| 'Terbilang:'\) : ''\}/g,
  "🗣️ {$t('zakat.terbilang') || 'Terbilang:'}"
);

// 2. Add import for n2words
if (!page.includes("import n2words from 'n2words';")) {
  page = page.replace(
    '<script lang="ts">',
    `<script lang="ts">\n  import n2words from 'n2words';`
  );
}

// 3. Update the terbilang function
const oldTerbilangRegex = /function terbilang\(nilai: number\): string \{[\s\S]*?(?=function formatNumberStr)/;
const newTerbilang = `function terbilang(nilai: number): string {
    if (!nilai) return "Nol";

    // Use our custom Indonesian logic if IDR and locale is id
    if (selectedCurrency === 'IDR' && $locale === 'id') {
      const bil = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
      const divide = (num: number): string => {
        if (num < 12) return " " + bil[num];
        if (num < 20) return divide(num - 10) + " Belas";
        if (num < 100) return divide(Math.floor(num / 10)) + " Puluh" + divide(num % 10);
        if (num < 200) return " Seratus" + divide(num - 100);
        if (num < 1000) return divide(Math.floor(num / 100)) + " Ratus" + divide(num % 100);
        if (num < 2000) return " Seribu" + divide(num - 1000);
        if (num < 1000000) return divide(Math.floor(num / 1000)) + " Ribu" + divide(num % 1000);
        if (num < 1000000000) return divide(Math.floor(num / 1000000)) + " Juta" + divide(num % 1000000);
        if (num < 1000000000000) return divide(Math.floor(num / 1000000000)) + " Milyar" + divide(num % 1000000000);
        if (num < 1000000000000000) return divide(Math.floor(num / 1000000000000)) + " Triliun" + divide(num % 1000000000000);
        return "";
      };
      let hasil = divide(nilai).trim();
      return hasil.charAt(0).toUpperCase() + hasil.slice(1) + " Rupiah";
    }

    // For other languages, use n2words
    try {
      let langCode = 'en';
      if ($locale === 'ar') langCode = 'ar';
      if ($locale === 'zh') langCode = 'zh';
      if ($locale === 'ja') langCode = 'ja';
      if ($locale === 'ko') langCode = 'ko';

      let suffix = "";
      if (selectedCurrency === 'USD') suffix = " Dollars";
      if (selectedCurrency === 'SAR') suffix = " ريال";
      if (selectedCurrency === 'CNY') suffix = " 元";
      if (selectedCurrency === 'JPY') suffix = " 円";
      if (selectedCurrency === 'KRW') suffix = " 원";
      if (selectedCurrency === 'IDR') suffix = " Rupiah";

      let words = n2words(nilai, { lang: langCode });
      return words + suffix;
    } catch (e) {
      // Fallback to English if language is missing in n2words
      try {
        return n2words(nilai, { lang: 'en' }) + " (EN)";
      } catch (e2) {
        return "";
      }
    }
  }

  `;

page = page.replace(oldTerbilangRegex, newTerbilang);

fs.writeFileSync(pagePath, page, 'utf8');
console.log('n2words integrated successfully.');
