const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'routes', 'zakat-faraidh', '+page.svelte');
let s = fs.readFileSync(file, 'utf8');

// 1. Update currencyItems
const oldCurrencyItemsRegex = /const currencyItems = \[[\s\S]*?\];/;
const newCurrencyItems = `const currencyItems = [
    { value: "IDR", label: "Rupiah Indonesia (IDR)", icon: "🇮🇩" },
    { value: "USD", label: "Dolar Amerika (USD)", icon: "🇺🇸" },
    { value: "SAR", label: "Riyal Arab Saudi (SAR)", icon: "🇸🇦" },
    { value: "CNY", label: "Yuan Tiongkok (CNY)", icon: "🇨🇳" },
    { value: "JPY", label: "Yen Jepang (JPY)", icon: "🇯🇵" },
    { value: "KRW", label: "Won Korea Selatan (KRW)", icon: "🇰🇷" },
  ];`;

s = s.replace(oldCurrencyItemsRegex, newCurrencyItems);

// 2. Fix translation fallback
// old: *{$t('zakat.ketuk_tombol_mata_uang') || 'Ketuk tombol di atas untuk memilih atau mengubah jenis mata uang'}
// new: *{$t('zakat.ketuk_tombol_mata_uang') === 'zakat.ketuk_tombol_mata_uang' ? 'Ketuk tombol di atas untuk memilih atau mengubah jenis mata uang' : $t('zakat.ketuk_tombol_mata_uang')}
const oldFallback = `*{$t('zakat.ketuk_tombol_mata_uang') || 'Ketuk tombol di atas untuk memilih atau mengubah jenis mata uang'}`;
const newFallback = `*{$t('zakat.ketuk_tombol_mata_uang') === 'zakat.ketuk_tombol_mata_uang' || !$t('zakat.ketuk_tombol_mata_uang') ? 'Ketuk tombol di atas untuk memilih atau mengubah jenis mata uang' : $t('zakat.ketuk_tombol_mata_uang')}`;

s = s.replace(oldFallback, newFallback);

// Update default label shown in button just in case
s = s.replace(
  /\|\| 'IDR \(Rp\)'/g,
  "|| 'Rupiah Indonesia (IDR)'"
);

fs.writeFileSync(file, s, 'utf8');
console.log('Currency detailed details updated.');
