const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'routes', 'zakat-faraidh', '+page.svelte');
let s = fs.readFileSync(file, 'utf8');

console.log('Initial size:', s.length);

if (!s.includes('let selectedCurrency = "IDR";')) {
  s = s.replace(
    /import \{ t, locale \} from "svelte-i18n";/,
    `import { t, locale } from "svelte-i18n";\n  import n2words from "n2words";\n  let selectedCurrency = "IDR";`
  );
}
console.log('After step 1:', s.length);

if (!s.includes('function formatCurrency(num: number')) {
  s = s.replace(/function formatRupiah\(.*?\).*?\{[\s\S]*?return.*?\}/m, "function formatCurrency(num: number) { return 'tmp'; }");
}
console.log('After step 2:', s.length);

if (!s.includes('function terbilang(')) {
  s = s.replace(/function terbilang\(.*?\).*?\{[\s\S]*?\}/m, "function terbilang() { return 'tmp'; }");
}
console.log('After step 3:', s.length);

s = s.replace(/formatRupiah/g, 'formatCurrency');
console.log('After step 4:', s.length);

const dynamicCurrSymbol = `>{selectedCurrency === 'IDR' ? 'Rp' : (selectedCurrency === 'USD' ? '$' : (selectedCurrency === 'SAR' ? 'ر.س' : (selectedCurrency === 'CNY' ? '¥' : (selectedCurrency === 'JPY' ? '¥' : '₩'))))}</span`;
s = s.replace(/>\s*Rp\s*<\/span/g, dynamicCurrSymbol);
console.log('After step 5:', s.length);

s = s.replace(/Rp\s*\{formatCurrency/g, 'XXX');
console.log('After step 6:', s.length);

s = s.replace(/\(Rupiah\)/g, `({selectedCurrency})`);
console.log('After step 7:', s.length);

s = s.replace(/(<div class="text-3xl font-black text-emerald-600 dark:text-emerald-400">\s*\{formatCurrency\(jumlahZakatPenghasilan, \$locale\)\}\s*<\/div>)/, '$1\nXXX');
console.log('After step 8:', s.length);

