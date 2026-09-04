const fs = require('fs');
const path = require('path');

const sveltePath = path.join(__dirname, 'src/routes/squad/+page.svelte');
if (fs.existsSync(sveltePath)) {
  let lines = fs.readFileSync(sveltePath, 'utf8').split(/\r?\n/);
  const convertIndex = lines.findIndex(line => line.includes('function convertDriveUrl(url: string) {'));
  if (convertIndex !== -1) {
    lines.splice(convertIndex, 14,
      `  function convertDriveUrl(url: string) {`,
      `    if (!url) return "";`,
      `    let cleaned = url.trim();`,
      `    if (cleaned.includes("lh3.googleusercontent.com/u/0/d/")) {`,
      `      const match = cleaned.match(/\\/d\\/([a-zA-Z0-9_-]+)/);`,
      `      if (match && match[1]) return \`https://drive.google.com/thumbnail?id=\${match[1]}&sz=w1000\`;`,
      `    }`,
      `    const match = cleaned.match(/\\/file\\/d\\/([a-zA-Z0-9_-]+)/) || `,
      `                  cleaned.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||`,
      `                  cleaned.match(/lh3\\.googleusercontent\\.com\\/d\\/([a-zA-Z0-9_-]+)/);`,
      `    if (match && match[1]) {`,
      `      return \`https://drive.google.com/thumbnail?id=\${match[1]}&sz=w1000\`;`,
      `    }`,
      `    return cleaned;`,
      `  }`
    );
    fs.writeFileSync(sveltePath, lines.join('\n'), 'utf8');
    console.log('Squad photos patched.');
  }
}
