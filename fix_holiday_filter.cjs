const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/routes/kalender/+page.svelte');
let content = fs.readFileSync(pagePath, 'utf8');

const targetStr = `const m1 = masehiMonthName.toLowerCase();`;
const replacementStr = `const idMasehiMonths = ["januari", "februari", "maret", "april", "mei", "juni", "juli", "agustus", "september", "oktober", "november", "desember"];
      const m1 = idMasehiMonths[currentDate.getMonth()];`;

if (content.includes(targetStr)) {
    content = content.replace(targetStr, replacementStr);
    fs.writeFileSync(pagePath, content, 'utf8');
    console.log("Fixed the holiday filtering bug!");
} else {
    console.log("Could not find the target string.");
}
