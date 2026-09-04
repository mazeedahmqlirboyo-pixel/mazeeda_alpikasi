const fs = require('fs');
const path = require('path');

// 1. Update Svelte component
const pagePath = path.join(__dirname, 'src', 'routes', 'zakat-faraidh', '+page.svelte');
let page = fs.readFileSync(pagePath, 'utf8');

// Replace the hardcoded formula text in the Zakat Penghasilan block
const oldFormula = /Zakat Penghasilan = Pendapatan Kena Zakat &times; 2,5%/;
const newFormula = `{@html $t('zakat.rumus_penghasilan_isi') || 'Zakat Penghasilan = Pendapatan Kena Zakat &times; 2,5%'}`;
page = page.replace(oldFormula, newFormula);

fs.writeFileSync(pagePath, page, 'utf8');


// 2. Inject translations safely
const i18nDir = path.join(__dirname, 'src', 'lib', 'i18n');

const locales = {
  'id.json': `"rumus_penghasilan_isi": "Zakat Penghasilan = Pendapatan Kena Zakat &times; 2,5%",`,
  'en.json': `"rumus_penghasilan_isi": "Income Zakat = Taxable Income &times; 2.5%",`,
  'ar.json': `"rumus_penghasilan_isi": "زكاة الدخل = الدخل الخاضع للزكاة &times; 2.5%",`,
  'zh.json': `"rumus_penghasilan_isi": "收入天课 = 课税收入 &times; 2.5%",`,
  'ja.json': `"rumus_penghasilan_isi": "収入のザカート = 課税所得 &times; 2.5%",`,
  'ko.json': `"rumus_penghasilan_isi": "소득 자카트 = 과세 소득 &times; 2.5%",`
};

for (const [file, keyStr] of Object.entries(locales)) {
  const filePath = path.join(i18nDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    // Inject right after "pilih_mata_uang" to avoid any parsing issues with double \n again
    const regex = /("pilih_mata_uang":\s*".*?",)/;
    if (regex.test(content)) {
      content = content.replace(regex, `$1\n    ${keyStr}`);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Injected into ${file}`);
    } else {
      console.log(`Could not find anchor in ${file}`);
    }
  }
}

console.log('Formula fixed.');
