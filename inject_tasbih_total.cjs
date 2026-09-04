const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/routes/tasbih/+page.svelte');
let page = fs.readFileSync(pagePath, 'utf8');

// Replace {totalCount.toLocaleString()}
page = page.replace(
  /\{totalCount\.toLocaleString\(\)\}/g,
  "{formatNumberDisplay(totalCount)}"
);

// Update formatNumberDisplay to handle formatting
page = page.replace(
  "return num.toString().replace(/[0-9]/g, w => arabicNumbers[parseInt(w)]);",
  "return num.toLocaleString('id-ID').replace(/[0-9]/g, w => arabicNumbers[parseInt(w)]);"
);
page = page.replace(
  "return num.toString();",
  "return num.toLocaleString('id-ID');"
);

fs.writeFileSync(pagePath, page, 'utf8');
console.log("Patched totalCount and formatNumberDisplay!");
