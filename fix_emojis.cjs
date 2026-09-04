const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'routes', 'zakat-faraidh', '+page.svelte');
let s = fs.readFileSync(file, 'utf8');

const regex = /const zakatItems = \[[\s\S]*?\];/;
const replacement = `const zakatItems = [
    { label: "Zakat Penghasilan", value: "penghasilan", icon: "💰" },
    { label: "Zakat Maal (Harta)", value: "maal", icon: "💎" },
    { label: "Zakat Fitrah", value: "fitrah", icon: "🌾" },
    { label: "Zakat Tabungan", value: "tabungan", icon: "🏦" },
    { label: "Zakat Emas", value: "emas", icon: "🥇" },
    { label: "Zakat Perak", value: "perak", icon: "🥈" },
    { label: "Zakat Pertanian", value: "pertanian", icon: "🌱" },
    { label: "Zakat Perdagangan", value: "perniagaan", icon: "🏪" },
    { label: "Zakat Saham", value: "saham", icon: "📈" },
    { label: "Zakat Reksadana", value: "reksadana", icon: "📊" },
    { label: "Zakat Peternakan", value: "peternakan", icon: "🐄" },
    { label: "Zakat Tambak", value: "tambak", icon: "🐟" },
    { label: "Zakat Perusahaan", value: "perusahaan", icon: "🏢" },
    { label: "Zakat Properti", value: "properti_sewa", icon: "🏘️" },
    { label: "Zakat Pertambangan", value: "pertambangan", icon: "⛏️" },
  ];`;

if (regex.test(s)) {
  s = s.replace(regex, replacement);
  fs.writeFileSync(file, s, 'utf8');
  console.log('Emojis fixed.');
} else {
  console.log('Could not find zakatItems block.');
}
