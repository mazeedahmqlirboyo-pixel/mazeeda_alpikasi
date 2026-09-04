const fs = require('fs');
const path = require('path');

const i18nDir = path.join(__dirname, 'src', 'lib', 'i18n');
const files = ['id.json', 'en.json', 'ar.json', 'zh.json', 'ja.json', 'ko.json'];

for (const file of files) {
  const filePath = path.join(i18nDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace the literal "\n" sequence with a real newline ONLY in the area we injected it
    // Wait, let's just use string replace on the specific bad pattern.
    // The bad pattern is: }",\n    "type_
    // Actually, because it's invalid JSON, let's just globally replace literal \n followed by 4 spaces.
    content = content.replace(/\\n    "/g, '\n    "');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Repaired ${file}`);
  }
}
