const fs = require('fs');
const path = require('path');

const tsFiles = ['en.json', 'ar.json', 'ko.json', 'ja.json', 'zh.json', 'id.json'];
const extraTranslations = {
  en: { delete_transaction: "Delete Transaction", delete_transaction_confirm: "Are you sure you want to delete this record?" },
  ar: { delete_transaction: "حذف المعاملة", delete_transaction_confirm: "هل أنت متأكد أنك تريد حذف هذا السجل؟" },
  ko: { delete_transaction: "거래 삭제", delete_transaction_confirm: "이 기록을 삭제하시겠습니까?" },
  ja: { delete_transaction: "取引を削除", delete_transaction_confirm: "この記録を削除してもよろしいですか？" },
  zh: { delete_transaction: "删除交易", delete_transaction_confirm: "您确定要删除此记录吗？" },
  id: { delete_transaction: "Hapus Transaksi", delete_transaction_confirm: "Yakin ingin menghapus catatan ini?" }
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
        data.keuangan.delete_transaction = extraTranslations[lang].delete_transaction;
        data.keuangan.delete_transaction_confirm = extraTranslations[lang].delete_transaction_confirm;
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

// Patch "Judul Catatan (Contoh: Uang Naila)"
page = page.replace(
  />Judul Catatan \(Contoh: Uang Naila\)</g,
  ">{$t('keuangan.book_title_label') || 'JUDUL CATATAN (CONTOH: UANG NAILA)'}<"
);

// Patch "Simpan Buku" with newlines/spaces
page = page.replace(
  /\n(\s*)Simpan Buku\n/g,
  "\n$1{$t('keuangan.save_book') || 'Simpan Buku'}\n"
);

// Patch openConfirm for "Hapus Buku Catatan"
page = page.replace(
  /openConfirm\('Hapus Buku Catatan', 'Yakin ingin menghapus buku ini beserta seluruh transaksinya\?',/g,
  "openConfirm($t('keuangan.delete_book') || 'Hapus Buku Catatan', $t('keuangan.delete_book_confirm') || 'Yakin ingin menghapus buku ini beserta seluruh transaksinya?',"
);

// Patch openConfirm for "Hapus Transaksi"
page = page.replace(
  /openConfirm\('Hapus Transaksi', 'Yakin ingin menghapus catatan ini\?',/g,
  "openConfirm($t('keuangan.delete_transaction') || 'Hapus Transaksi', $t('keuangan.delete_transaction_confirm') || 'Yakin ingin menghapus catatan ini?',"
);

fs.writeFileSync(pagePath, page, 'utf8');
console.log("Patched untranslated text in modals!");
