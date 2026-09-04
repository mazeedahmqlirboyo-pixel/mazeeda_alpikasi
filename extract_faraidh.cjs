const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'routes', 'zakat-faraidh', '+page.svelte');
const page = fs.readFileSync(pagePath, 'utf8');

const startStr = '{#if activeTab === "faraidh"}';
const startIndex = page.indexOf(startStr);
const endIndex = page.indexOf('</main>', startIndex);

fs.writeFileSync(path.join(__dirname, 'scratch', 'faraidh_section.txt'), page.substring(startIndex, endIndex), 'utf8');
console.log('Extracted to scratch/faraidh_section.txt');
