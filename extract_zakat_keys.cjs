const fs = require('fs');

const content = fs.readFileSync('src/routes/zakat-faraidh/+page.svelte', 'utf8');
const regex = /\{\$t\('zakat\.([a-zA-Z0-9_]+)'\)/g;
const keys = new Set();
let match;
while ((match = regex.exec(content)) !== null) {
  keys.add(match[1]);
}
console.log(Array.from(keys));
