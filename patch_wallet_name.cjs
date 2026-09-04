const fs = require('fs');
const path = require('path');

const tsFiles = ['en.json', 'ar.json', 'ko.json', 'ja.json', 'zh.json', 'id.json'];
const defaultWalletTrans = {
  en: "Personal Money",
  ar: "أموال شخصية",
  ko: "개인 돈",
  ja: "個人のお金",
  zh: "个人资金",
  id: "Uang Pribadi"
};

const localesDir = path.join(__dirname, 'src/lib/i18n');

// 1. Update i18n JSON files
tsFiles.forEach(file => {
  const lang = file.split('.')[0];
  const filePath = path.join(localesDir, file);
  if (fs.existsSync(filePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (data.keuangan) {
        data.keuangan.default_wallet = defaultWalletTrans[lang];
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      }
    } catch (e) {
      console.log(`Error reading ${file}`);
    }
  }
});

// 2. Patch +page.svelte
const pagePath = path.join(__dirname, 'src/routes/keuangan/+page.svelte');
let page = fs.readFileSync(pagePath, 'utf8');

// Replace {wallets.find(w => w.id === activeWalletId)?.name}
page = page.replace(
  /{wallets\.find\(w => w\.id === activeWalletId\)\?\.name}/g,
  "{wallets.find(w => w.id === activeWalletId)?.id === 'default' ? ($t('keuangan.default_wallet') || 'Uang Pribadi') : wallets.find(w => w.id === activeWalletId)?.name}"
);

// Replace {w.name}
page = page.replace(
  /<span class="truncate">{w\.name}<\/span>/g,
  "<span class=\"truncate\">{w.id === 'default' ? ($t('keuangan.default_wallet') || 'Uang Pribadi') : w.name}</span>"
);

fs.writeFileSync(pagePath, page, 'utf8');
console.log("Patched wallet default names!");
