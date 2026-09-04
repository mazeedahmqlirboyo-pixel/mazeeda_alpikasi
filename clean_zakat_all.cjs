const fs = require('fs');
const file = 'src/routes/zakat-faraidh/+page.svelte';
let s = fs.readFileSync(file, 'utf8');

s = s.replace(/\{\$t\('zakat\.([a-zA-Z0-9_]+)'\) \|\| '([^']+)'\}/g, (match, key, fallback) => fallback);
s = s.replace(/ZAKAT\.[A-Z_]+/g, (match) => {
  // If there are any literal caps left, just log them
  console.log("Found literal cap:", match);
  return match;
});

fs.writeFileSync(file, s);
console.log('Replaced all missing zakat translations with fallback strings!');
