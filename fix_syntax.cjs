const fs = require('fs');
const file = 'src/routes/zakat-faraidh/+page.svelte';
let s = fs.readFileSync(file, 'utf8');

s = s.replace(
  /'\(\{\$t\('zakat\.nisab'\) \|\| 'Nisab'\}\: 653 kg beras\)'/g,
  "'(Nisab: 653 kg beras)'"
);

s = s.replace(
  /'\(\{\$t\('zakat\.nisab'\) \|\| 'Nisab'\}\: 40\)'/g,
  "'(Nisab: 40)'"
);

s = s.replace(
  /'\(\{\$t\('zakat\.nisab'\) \|\| 'Nisab'\}\: 30\)'/g,
  "'(Nisab: 30)'"
);

fs.writeFileSync(file, s);
console.log('Fixed syntax errors caused by global replacement of Nisab');
