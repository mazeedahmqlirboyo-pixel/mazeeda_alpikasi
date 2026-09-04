const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/routes/kalender/+page.svelte');
let content = fs.readFileSync(pagePath, 'utf8');

const regex = /document\.body\.style\.overflow = "";\r?\n\s*}\r?\n\r?\n\s*dd - 32075;/;

const restoredStr = `document.body.style.overflow = "";
  }

  function getHijriInfo(date: Date) {
    // Kuwaiti Algorithm for Hijri date calculation
    // This is much more reliable across different Android WebViews 
    // compared to Intl.DateTimeFormat with u-ca-islamic which sometimes returns Masehi months.
    const wd = date.getDay();
    const dd = date.getDate();
    const mm = date.getMonth() + 1; // FIX: Kuwaiti algorithm expects 1-12
    const yy = date.getFullYear();
    const mpart = (mm - 11) / 12;
    let jd = Math.floor((1461 * (yy + 4800 + Math.floor(mpart))) / 4) +
             Math.floor((367 * (mm - 2 - 12 * Math.floor(mpart))) / 12) -
             Math.floor((3 * Math.floor((yy + 4900 + Math.floor(mpart)) / 100)) / 4) +
             dd - 32075;`;

if (regex.test(content)) {
    content = content.replace(regex, restoredStr);
    fs.writeFileSync(pagePath, content, 'utf8');
    console.log("Fixed the broken getHijriInfo function via regex!");
} else {
    console.log("Could not find the broken string using regex.");
}
