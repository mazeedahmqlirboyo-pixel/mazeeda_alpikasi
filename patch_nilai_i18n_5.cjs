const fs = require('fs');
const path = require('path');

const sveltePath = path.join(__dirname, 'src/routes/nilai/+page.svelte');
let lines = fs.readFileSync(sveltePath, 'utf8').split(/\r?\n/);

// Fix convertDriveUrl
const convertIndex = lines.findIndex(line => line.includes('function convertDriveUrl(url: string) {'));
if (convertIndex !== -1) {
  lines.splice(convertIndex, 11,
    `  function convertDriveUrl(url: string) {`,
    `    if (!url) return '';`,
    `    let cleaned = url.trim();`,
    `    if (cleaned.includes('lh3.googleusercontent.com/u/0/d/')) {`,
    `      const match = cleaned.match(/\\/d\\/([a-zA-Z0-9_-]+)/);`,
    `      if (match && match[1]) return \`https://drive.google.com/thumbnail?id=\${match[1]}&sz=w1000\`;`,
    `    }`,
    `    const match = cleaned.match(/\\/file\\/d\\/([a-zA-Z0-9_-]+)/) ||`,
    `                  cleaned.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||`,
    `                  cleaned.match(/lh3\\.googleusercontent\\.com\\/d\\/([a-zA-Z0-9_-]+)/);`,
    `    if (match && match[1]) return \`https://drive.google.com/thumbnail?id=\${match[1]}&sz=w1000\`;`,
    `    return cleaned;`,
    `  }`
  );
}

// Fix displayNilai
const displayIndex = lines.findIndex(line => line.includes('function displayNilai(nilai: any) {'));
if (displayIndex !== -1) {
  lines.splice(displayIndex, 5,
    `  function displayNilai(nilai: any, currentLocale: string | null = null) {`,
    `    const n = parseFloat(nilai);`,
    `    if (isNaN(n)) return nilai ?? '-';`,
    `    const num = n < 0 ? 0 : n;`,
    `    if (currentLocale === 'ar') return Number(num).toLocaleString('ar-EG');`,
    `    return String(num);`,
    `  }`
  );
}

fs.writeFileSync(sveltePath, lines.join('\n'), 'utf8');
console.log('Nilai patch 5 complete.');
