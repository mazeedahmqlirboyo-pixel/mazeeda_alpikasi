const fs = require('fs');
const path = require('path');

const sveltePath = path.join(__dirname, 'src/routes/nilai/+page.svelte');
let content = fs.readFileSync(sveltePath, 'utf8');

// Replace displayNilai
content = content.replace(
  /function displayNilai\(nilai: any\) \{\s*const n = parseFloat\(nilai\);\s*if \(isNaN\(n\)\) return nilai \?\? '-';\s*return n < 0 \? '0' : String\(nilai\);\s*\}/,
  `function displayNilai(nilai: any, currentLocale: string | null = null) {
    const n = parseFloat(nilai);
    if (isNaN(n)) return nilai ?? '-';
    const num = n < 0 ? 0 : n;
    if (currentLocale === 'ar') return Number(num).toLocaleString('ar-EG');
    return String(num);
  }`
);

// Replace convertDriveUrl
content = content.replace(
  /function convertDriveUrl\(url: string\) \{\s*if \(!url\) return '';\s*let cleaned = url\.trim\(\);\s*if \(cleaned\.includes\('lh3\.googleusercontent\.com\/u\/0\/d\/'\)\) \{\s*return cleaned\.replace\('lh3\.googleusercontent\.com\/u\/0\/d\/', 'lh3\.googleusercontent\.com\/d\/'\);\s*\}\s*const match = cleaned\.match\(\/\\\/file\\\/d\\\/\\(\[a-zA-Z0-9_-\]\\+\\\)\/\) \|\|\s*cleaned\.match\(\/\[\?&\]id=\\(\[a-zA-Z0-9_-\]\\+\\\)\/\);\s*if \(match && match\[1\]\) return `https:\/\/lh3\.googleusercontent\.com\/d\/\$\{match\[1\]\}`;\s*return cleaned;\s*\}/,
  `function convertDriveUrl(url: string) {
    if (!url) return '';
    let cleaned = url.trim();
    if (cleaned.includes('lh3.googleusercontent.com/u/0/d/')) {
      const match = cleaned.match(/\\/d\\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) return \`https://drive.google.com/thumbnail?id=\${match[1]}&sz=w1000\`;
    }
    const match = cleaned.match(/\\/file\\/d\\/([a-zA-Z0-9_-]+)/) ||
                  cleaned.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
                  cleaned.match(/lh3\\.googleusercontent\\.com\\/d\\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) return \`https://drive.google.com/thumbnail?id=\${match[1]}&sz=w1000\`;
    return cleaned;
  }`
);

fs.writeFileSync(sveltePath, content, 'utf8');
console.log('Nilai patch 3 complete.');
