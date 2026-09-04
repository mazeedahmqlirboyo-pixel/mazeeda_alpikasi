const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'routes', 'zakat-faraidh', '+page.svelte');
let s = fs.readFileSync(file, 'utf8');

const missingCode = `
  import n2words from "n2words";
  let selectedCurrency = "IDR";

  // Faraidh formatting variables
  let hutangPewarisDisp = "";
  let biayaJenazahDisp = "";
  let wasiatPewarisDisp = "";

  function handleNumericInput(e: Event, callback: (v: number) => void) {
    const target = e.target as HTMLInputElement;
    const val = target.value.replace(/[^0-9]/g, '');
    callback(val ? parseInt(val, 10) : 0);
  }

  function terbilang(num: number | string): string {
    if (!num) return "";
    const n = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(n)) return "";
    try {
      if (selectedCurrency === 'IDR') return n2words(n, { lang: 'id' }) + " rupiah";
      if (selectedCurrency === 'USD') return n2words(n, { lang: 'en' }) + " dollars";
      if (selectedCurrency === 'SAR') return n2words(n, { lang: 'ar' }) + " riyal";
    } catch(e) {}
    return n.toString();
  }
`;

if (!s.includes('let selectedCurrency = "IDR";')) {
    s = s.replace(/import \{ t, locale \} from "svelte-i18n";/, match => `${match}\n${missingCode}`);
    fs.writeFileSync(file, s);
    console.log('Injected missing variables');
} else {
    console.log('Variables already exist');
}
