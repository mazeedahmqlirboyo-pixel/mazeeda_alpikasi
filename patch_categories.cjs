const fs = require('fs');
const path = require('path');

const tsFiles = ['en.json', 'ar.json', 'ko.json', 'ja.json', 'zh.json', 'id.json'];
const categoryTranslations = {
  en: { 
    cat_savings: "Savings", cat_salary: "Salary", cat_refund: "Refund", cat_investment: "Investment", cat_gift: "Gift",
    cat_transfer: "Transfer", cat_shopping: "Shopping", cat_bills: "Bills", cat_topup: "e-Wallet Top Up"
  },
  ar: { 
    cat_savings: "مدخرات", cat_salary: "راتب", cat_refund: "استرداد الأموال", cat_investment: "استثمار", cat_gift: "هدية",
    cat_transfer: "تحويل مصرفي", cat_shopping: "تسوق", cat_bills: "فواتير", cat_topup: "شحن المحفظة الإلكترونية"
  },
  ko: { 
    cat_savings: "저축", cat_salary: "급여", cat_refund: "환불", cat_investment: "투자", cat_gift: "선물",
    cat_transfer: "계좌 이체", cat_shopping: "쇼핑", cat_bills: "청구서", cat_topup: "전자 지갑 충전"
  },
  ja: { 
    cat_savings: "貯金", cat_salary: "給与", cat_refund: "返金", cat_investment: "投資", cat_gift: "ギフト",
    cat_transfer: "口座振込", cat_shopping: "買い物", cat_bills: "請求書", cat_topup: "電子マネーチャージ"
  },
  zh: { 
    cat_savings: "储蓄", cat_salary: "薪水", cat_refund: "退款", cat_investment: "投资", cat_gift: "礼物",
    cat_transfer: "转账", cat_shopping: "购物", cat_bills: "账单", cat_topup: "电子钱包充值"
  },
  id: { 
    cat_savings: "Tabungan", cat_salary: "Gaji", cat_refund: "Pengembalian Dana", cat_investment: "Investasi", cat_gift: "Hadiah",
    cat_transfer: "Transfer Rekening", cat_shopping: "Belanja", cat_bills: "Tagihan", cat_topup: "Top Up e-Wallet"
  }
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
        Object.assign(data.keuangan, categoryTranslations[lang]);
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

// Insert getCategoryTranslation function
const funcCode = `
  $: getCategoryTranslation = (cat: string) => {
    const map: Record<string, string> = {
      'Tabungan (Savings)': $t('keuangan.cat_savings') || 'Tabungan',
      'Gaji (Salary)': $t('keuangan.cat_salary') || 'Gaji',
      'Pengembalian Dana (Refund)': $t('keuangan.cat_refund') || 'Pengembalian Dana',
      'Investasi (Investment)': $t('keuangan.cat_investment') || 'Investasi',
      'Hadiah (Gift)': $t('keuangan.cat_gift') || 'Hadiah',
      'Transfer Rekening (Transfer)': $t('keuangan.cat_transfer') || 'Transfer Rekening',
      'Belanja (Shopping)': $t('keuangan.cat_shopping') || 'Belanja',
      'Tagihan (Bills)': $t('keuangan.cat_bills') || 'Tagihan',
      'Top Up e-Wallet': $t('keuangan.cat_topup') || 'Top Up e-Wallet'
    };
    return map[cat] || cat;
  };
`;
page = page.replace("  function formatIDR(amount: number) {", funcCode + "\n  function formatIDR(amount: number) {");

// Replace {cat} in dropdown loop
page = page.replace(
  /\n(\s*)\{cat\}\n/g,
  "\n$1{getCategoryTranslation(cat)}\n"
);

// Replace {formData.category} in dropdown selected value
page = page.replace(
  /<span class="truncate">\{formData\.category\}<\/span>/g,
  "<span class=\"truncate\">{getCategoryTranslation(formData.category)}</span>"
);

// Replace {t.category} in transaction list
page = page.replace(
  />\{t\.category\}<\/p>/g,
  ">{getCategoryTranslation(t.category)}</p>"
);

fs.writeFileSync(pagePath, page, 'utf8');
console.log("Patched categories!");
