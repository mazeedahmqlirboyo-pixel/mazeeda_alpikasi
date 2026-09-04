const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/routes/kalender/+page.svelte');
let content = fs.readFileSync(pagePath, 'utf8');

const replacementStr = `      for (let hm of hMonths) {
        const hmClean = hm.replace(/'/g, "");
        const tClean = t.replace(/'/g, "");
        if (hmClean.length > 3 && tClean.includes(hmClean)) return true;
        if (hm === "dzulhijjah" && t.includes("zulhijah")) return true;
        if (hm === "muharram" && t.includes("muharam")) return true;
      }`;

content = content.replace(/for \(let hm of hMonths\) \{[\s\S]*?if \(hm === "muharram"[^\n]*\n\s*\}/, replacementStr);

fs.writeFileSync(pagePath, content, 'utf8');
console.log("Fixed the Hijri apostrophe bug via regex!");
