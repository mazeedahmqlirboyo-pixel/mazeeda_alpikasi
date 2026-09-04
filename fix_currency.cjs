const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'routes', 'zakat-faraidh', '+page.svelte');
let page = fs.readFileSync(pagePath, 'utf8');

// 1. Add exchange rate logic
const exchangeRateLogic = `
  const defaultPrices = {
    IDR: { emas: 2710000, perak: 15000, beras: 15000, ternak: 3000000 },
    USD: { emas: 85, perak: 1, beras: 1, ternak: 195 },
    SAR: { emas: 318, perak: 3.75, beras: 3.75, ternak: 730 },
    CNY: { emas: 600, perak: 7.2, beras: 7.2, ternak: 1400 },
    JPY: { emas: 12500, perak: 150, beras: 150, ternak: 29000 },
    KRW: { emas: 115000, perak: 1350, beras: 1350, ternak: 260000 }
  };

  $: {
    if (selectedCurrency) {
      const defaults = defaultPrices[selectedCurrency] || defaultPrices.IDR;
      // Update values only if they match previous defaults (optional) or just force update
      // To avoid resetting user inputs every re-render, we only trigger this when selectedCurrency actually changes
      // Since this block is reactive to selectedCurrency, it will run. 
      // But we should probably just force update the benchmark prices since it's a new currency.
      hargaEmas = defaults.emas;
      hargaPerak = defaults.perak;
      hargaBeras = defaults.beras;
      hargaTernak = defaults.ternak;
      
      // We also update display variables which are bound to inputs in some places
      if (typeof hargaBerasDisp !== 'undefined') hargaBerasDisp = defaults.beras.toLocaleString('id-ID');
      if (typeof hargaPerakDisp !== 'undefined') hargaPerakDisp = defaults.perak.toLocaleString('id-ID');
      if (typeof hargaTernakDisp !== 'undefined') hargaTernakDisp = defaults.ternak.toLocaleString('id-ID');
    }
  }
`;

// Insert after 'let selectedCurrency = "IDR";'
if (!page.includes('const defaultPrices = {') && page.includes('let selectedCurrency = "IDR";')) {
  page = page.replace('let selectedCurrency = "IDR";', 'let selectedCurrency = "IDR";\n' + exchangeRateLogic);
}

// 2. Hide terbilang for non-IDR/non-ID
page = page.replace(
  /🗣️ \{\$t\('zakat\.terbilang'\) \|\| 'Terbilang:'\}/g,
  "{$locale === 'id' && selectedCurrency === 'IDR' ? '🗣️ ' + ($t('zakat.terbilang') || 'Terbilang:') : ''}"
);

// Also modify the terbilang function to return empty if not ID/IDR
// Look for `function terbilang(nilai: number): string {`
if (page.includes('function terbilang(nilai: number): string {')) {
  if (!page.includes("if ($locale !== 'id' || selectedCurrency !== 'IDR') return '';")) {
    page = page.replace(
      'function terbilang(nilai: number): string {',
      "function terbilang(nilai: number): string {\n    if ($locale !== 'id' || selectedCurrency !== 'IDR') return '';"
    );
  }
}

fs.writeFileSync(pagePath, page, 'utf8');
console.log('Currency exchange logic and terbilang visibility fixed.');
