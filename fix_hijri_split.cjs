const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/routes/kalender/+page.svelte');
let content = fs.readFileSync(pagePath, 'utf8');

const targetStr = `const hMonths = dominantHijriMonth.toLowerCase().split(/[ -]+/);`;
const replacementStr = `const hMonths = dominantHijriMonth.toLowerCase().split(' - ');`;

if (content.includes(targetStr)) {
    content = content.replace(targetStr, replacementStr);
    fs.writeFileSync(pagePath, content, 'utf8');
    console.log("Fixed the Hijri month split bug!");
} else {
    console.log("Could not find the target string.");
}
