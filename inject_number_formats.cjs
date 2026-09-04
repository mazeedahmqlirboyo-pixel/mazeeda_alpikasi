const fs = require('fs');
const file = 'src/routes/zakat-faraidh/+page.svelte';
let s = fs.readFileSync(file, 'utf8');

// Replace standard variables
const varsToWrap = [
  'jumlahJiwa',
  'totalZakatBerasFitrah',
  'beratEmasSimpan \\|\\| 0',
  'beratEmasPakai \\|\\| 0',
  'beratPerak \\|\\| 0',
  'hasilPanen \\|\\| 0',
  'jumlahTernak \\|\\| 0',
  'persenKepemilikan',
  'jumlahZakatPertanianKg\\.toFixed\\(1\\)'
];

for (const v of varsToWrap) {
  const regex = new RegExp(`\\{${v}\\}`, 'g');
  const safeVar = v.replace(/\\/g, '');
  s = s.replace(regex, `{formatNumberStr(${safeVar}, $locale)}`);
}

// Special case: the minus and plus buttons for Faraidh arrays
// {sonsCount}, {daughtersCount}, {cucuLakiCount}, {cucuPerempuanCount}, etc
// Actually, they are just single numbers. Let's wrap them too where they are rendered.
const faraidhVars = [
  'sonsCount', 'daughtersCount', 'cucuLakiCount', 'cucuPerempuanCount',
  'saudaraKandungLakiCount', 'saudaraKandungPerempuanCount',
  'saudaraSebapakLakiCount', 'saudaraSebapakPerempuanCount',
  'saudaraSeibuLakiCount', 'saudaraSeibuPerempuanCount',
  'pamanKandungCount', 'pamanSebapakCount',
  'anakPamanKandungCount', 'anakPamanSebapakCount'
];

for (const v of faraidhVars) {
  const regex = new RegExp(`>\\{${v}\\}<`, 'g'); // Only where it's rendered as text
  s = s.replace(regex, `>{formatNumberStr(${v}, $locale)}<`);
}

fs.writeFileSync(file, s);
console.log('Template tags for number formatting injected.');
