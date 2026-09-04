const fs = require('fs');
const path = require('path');

const tsFiles = ['en.json', 'ar.json', 'ko.json', 'ja.json', 'zh.json', 'id.json'];
const t = {
  en: { 
    amount_label: "Amount", 
    category_label: "Category", 
    date_label: "Date", 
    note_label: "Short Note", 
    save_changes: "Save Changes", 
    save_transaction: "Save Transaction",
    edit_transaction: "Edit Transaction",
    add_transaction: "Add Transaction",
    note_placeholder: "e.g., Buy lunch"
  },
  ar: { 
    amount_label: "المبلغ", 
    category_label: "الفئة", 
    date_label: "التاريخ", 
    note_label: "ملاحظة قصيرة", 
    save_changes: "حفظ التغييرات", 
    save_transaction: "حفظ المعاملة",
    edit_transaction: "تعديل المعاملة",
    add_transaction: "إضافة معاملة",
    note_placeholder: "مثال: شراء غداء"
  },
  ko: { 
    amount_label: "금액", 
    category_label: "카테고리", 
    date_label: "날짜", 
    note_label: "간단한 메모", 
    save_changes: "변경 사항 저장", 
    save_transaction: "거래 저장",
    edit_transaction: "거래 수정",
    add_transaction: "거래 추가",
    note_placeholder: "예: 점심 식사"
  },
  ja: { 
    amount_label: "金額", 
    category_label: "カテゴリー", 
    date_label: "日付", 
    note_label: "短いメモ", 
    save_changes: "変更を保存", 
    save_transaction: "取引を保存",
    edit_transaction: "取引を編集",
    add_transaction: "取引を追加",
    note_placeholder: "例：昼食を買う"
  },
  zh: { 
    amount_label: "金额", 
    category_label: "类别", 
    date_label: "日期", 
    note_label: "简短备注", 
    save_changes: "保存更改", 
    save_transaction: "保存交易",
    edit_transaction: "编辑交易",
    add_transaction: "添加交易",
    note_placeholder: "例如：买午餐"
  },
  id: { 
    amount_label: "Nominal (Rp)", 
    category_label: "Kategori", 
    date_label: "Tanggal", 
    note_label: "Keterangan Singkat", 
    save_changes: "Simpan Perubahan", 
    save_transaction: "Simpan Transaksi",
    edit_transaction: "Edit Transaksi",
    add_transaction: "Tambah Transaksi",
    note_placeholder: "Contoh: Beli nasi goreng"
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
        Object.assign(data.keuangan, t[lang]);
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

page = page.replace(
  /\n(\s*)Riwayat Transaksi\n/g,
  "\n$1{$t('keuangan.transaction_history') || 'Riwayat Transaksi'}\n"
);
page = page.replace(
  / \/> Tambah Data/g,
  " /> {$t('keuangan.add_data') || 'Tambah Data'}"
);
page = page.replace(
  /\n(\s*)Mulai catat sekarang\n/g,
  "\n$1{$t('keuangan.start_record') || 'Mulai catat sekarang'}\n"
);
page = page.replace(
  /\n(\s*)Pengeluaran\n(\s*)<\/button>/g,
  "\n$1{$t('keuangan.expense') || 'Pengeluaran'}\n$2</button>"
);
page = page.replace(
  /\n(\s*)Pemasukan\n(\s*)<\/button>/g,
  "\n$1{$t('keuangan.income') || 'Pemasukan'}\n$2</button>"
);
page = page.replace(
  />Nominal \(Rp\)</g,
  ">{$t('keuangan.amount_label') || 'Nominal (Rp)'}<"
);
page = page.replace(
  />Kategori</g,
  ">{$t('keuangan.category_label') || 'Kategori'}<"
);
page = page.replace(
  />Tanggal</g,
  ">{$t('keuangan.date_label') || 'Tanggal'}<"
);
page = page.replace(
  />Keterangan Singkat</g,
  ">{$t('keuangan.note_label') || 'Keterangan Singkat'}<"
);
page = page.replace(
  /\{isEditing \? 'Simpan Perubahan' : 'Simpan Transaksi'\}/g,
  "{isEditing ? ($t('keuangan.save_changes') || 'Simpan Perubahan') : ($t('keuangan.save_transaction') || 'Simpan Transaksi')}"
);
page = page.replace(
  /\{isEditing \? 'Edit Transaksi' : 'Tambah Transaksi'\}/g,
  "{isEditing ? ($t('keuangan.edit_transaction') || 'Edit Transaksi') : ($t('keuangan.add_transaction') || 'Tambah Transaksi')}"
);
page = page.replace(
  /placeholder="Contoh: Beli nasi goreng"/g,
  "placeholder={$t('keuangan.note_placeholder') || 'Contoh: Beli nasi goreng'}"
);

fs.writeFileSync(pagePath, page, 'utf8');
console.log("Patched ALL remaining untranslated texts!");
