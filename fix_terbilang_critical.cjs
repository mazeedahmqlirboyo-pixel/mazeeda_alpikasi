const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'routes', 'zakat-faraidh', '+page.svelte');
let page = fs.readFileSync(pagePath, 'utf8');

const replacement = `function terbilang(nilai: number): string {
    if (!nilai) return "";

    // Use custom Indonesian logic if IDR and locale is id
    if (selectedCurrency === 'IDR' && $locale === 'id') {
      if (nilai === 0) return "Nol Rupiah";
      const bil = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
      const konversi = (n: number): string => {
        if (n < 12) return bil[n];
        if (n < 20) return bil[n - 10] + " Belas";
        if (n < 100) return bil[Math.floor(n / 10)] + " Puluh " + (bil[n % 10] ? bil[n % 10] : "");
        if (n < 200) return "Seratus " + konversi(n - 100);
        if (n < 1000) return bil[Math.floor(n / 100)] + " Ratus " + konversi(n % 100);
        if (n < 2000) return "Seribu " + konversi(n - 1000);
        if (n < 1000000) return konversi(Math.floor(n / 1000)) + " Ribu " + konversi(n % 1000);
        if (n < 1000000000) return konversi(Math.floor(n / 1000000)) + " Juta " + konversi(n % 1000000);
        if (n < 1000000000000) return konversi(Math.floor(n / 1000000000)) + " Miliar " + konversi(n % 1000000000);
        if (n < 1000000000000000) return konversi(Math.floor(n / 1000000000000)) + " Triliun " + konversi(n % 1000000000000);
        return "";
      };
      const hasil = konversi(nilai).replace(/\\s+/g, " ").trim();
      return hasil ? hasil + " Rupiah" : "";
    }

    // For other languages, use n2words
    try {
      let suffix = "";
      if (selectedCurrency === 'USD') suffix = " Dollars";
      if (selectedCurrency === 'SAR') suffix = " ريال";
      if (selectedCurrency === 'CNY') suffix = " 元";
      if (selectedCurrency === 'JPY') suffix = " 円";
      if (selectedCurrency === 'KRW') suffix = " 원";
      if (selectedCurrency === 'IDR') suffix = " Rupiah";

      let words = "";
      if ($locale === 'en') words = n2wordsEN(nilai);
      else if ($locale === 'ar') words = n2wordsAR(nilai);
      else if ($locale === 'zh') words = n2wordsZH(nilai);
      else if ($locale === 'ja') words = n2wordsJA(nilai);
      else if ($locale === 'ko') words = n2wordsKO(nilai);
      else words = n2wordsEN(nilai); // fallback to EN for missing locales

      return words + suffix;
    } catch (e) {
      return "";
    }
  }`;

page = page.replace("function terbilang(nilai: number): string {", replacement + '\n');

fs.writeFileSync(pagePath, page, 'utf8');
console.log('terbilang syntax fixed');
