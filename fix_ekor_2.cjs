const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'routes', 'zakat-faraidh', '+page.svelte');
let page = fs.readFileSync(pagePath, 'utf8');

// The closing tag might have a newline before the >, so we match up to </span
page = page.replace(
  />ekor<\/span/g,
  ">{$t('zakat.ekor') || 'ekor'}</span"
);

page = page.replace(
  />\{jumlahTernak \|\| 0\} ekor<\/span/g,
  ">{jumlahTernak || 0} {$t('zakat.ekor') || 'ekor'}</span"
);

page = page.replace(
  />\{\(jenisTernak === "kambing" \|\| jenisTernak === "domba"\) \? "40" : "30"\} ekor<\/span/g,
  ">{(jenisTernak === \"kambing\" || jenisTernak === \"domba\") ? \"40\" : \"30\"} {$t('zakat.ekor') || 'ekor'}</span"
);

fs.writeFileSync(pagePath, page, 'utf8');

console.log('Ekor replacements completed.');
