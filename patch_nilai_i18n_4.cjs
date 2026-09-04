const fs = require('fs');
const path = require('path');

const sveltePath = path.join(__dirname, 'src/routes/nilai/+page.svelte');
let content = fs.readFileSync(sveltePath, 'utf8');

// Replace displayNilai
const oldDisplayNilai = `  function displayNilai(nilai: any) {
    const n = parseFloat(nilai);
    if (isNaN(n)) return nilai ?? '-';
    return n < 0 ? '0' : String(nilai);
  }`;
const newDisplayNilai = `  function displayNilai(nilai: any, currentLocale: string | null = null) {
    const n = parseFloat(nilai);
    if (isNaN(n)) return nilai ?? '-';
    const num = n < 0 ? 0 : n;
    if (currentLocale === 'ar') return Number(num).toLocaleString('ar-EG');
    return String(num);
  }`;

content = content.replace(oldDisplayNilai.replace(/\r\n/g, '\n'), newDisplayNilai);
content = content.replace(oldDisplayNilai, newDisplayNilai);

// Replace convertDriveUrl
const oldUrl = `  function convertDriveUrl(url: string) {
    if (!url) return '';
    let cleaned = url.trim();
    if (cleaned.includes('lh3.googleusercontent.com/u/0/d/')) {
      return cleaned.replace('lh3.googleusercontent.com/u/0/d/', 'lh3.googleusercontent.com/d/');
    }
    const match = cleaned.match(/\\/file\\/d\\/([a-zA-Z0-9_-]+)/) ||
                  cleaned.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) return \`https://lh3.googleusercontent.com/d/\${match[1]}\`;
    return cleaned;
  }`;
const newUrl = `  function convertDriveUrl(url: string) {
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
  }`;

content = content.replace(oldUrl.replace(/\r\n/g, '\n'), newUrl);
content = content.replace(oldUrl, newUrl);

fs.writeFileSync(sveltePath, content, 'utf8');
console.log('Nilai patch 4 complete.');
