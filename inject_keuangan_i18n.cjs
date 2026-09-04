const fs = require('fs');
const path = require('path');

const tsFiles = ['en.json', 'ar.json', 'ko.json', 'ja.json', 'zh.json', 'id.json'];
const translations = {
  en: {
    title: "Money Management",
    balance: "Your Balance",
    income: "Income",
    expense: "Expense",
    transaction_history: "Transaction History",
    add_data: "Add Data",
    no_record: "No financial records yet.",
    start_record: "Start recording now",
    add_book: "Add New Notebook",
    book_title_label: "NOTEBOOK TITLE (EX: NAILA'S MONEY)",
    book_title_placeholder: "Enter title...",
    save_book: "Save Notebook",
    delete_book: "Delete Notebook",
    delete_book_confirm: "Are you sure you want to delete this notebook and all its transactions?",
    cancel: "Cancel",
    yes_delete: "Yes, Delete"
  },
  ar: {
    title: "إدارة الأموال",
    balance: "رصيدك المتبقي",
    income: "الدخل",
    expense: "المصروفات",
    transaction_history: "سجل المعاملات",
    add_data: "إضافة بيانات",
    no_record: "لا توجد سجلات مالية بعد.",
    start_record: "ابدأ التسجيل الآن",
    add_book: "إضافة دفتر ملاحظات جديد",
    book_title_label: "عنوان الدفتر (مثال: أموال نائلة)",
    book_title_placeholder: "أدخل العنوان...",
    save_book: "حفظ الدفتر",
    delete_book: "حذف الدفتر",
    delete_book_confirm: "هل أنت متأكد أنك تريد حذف هذا الدفتر وجميع معاملاته؟",
    cancel: "إلغاء",
    yes_delete: "نعم، احذف"
  },
  ko: {
    title: "자금 관리",
    balance: "잔액",
    income: "수입",
    expense: "지출",
    transaction_history: "거래 내역",
    add_data: "데이터 추가",
    no_record: "아직 재무 기록이 없습니다.",
    start_record: "지금 기록 시작",
    add_book: "새 노트북 추가",
    book_title_label: "노트북 제목 (예: 나일라의 돈)",
    book_title_placeholder: "제목 입력...",
    save_book: "노트북 저장",
    delete_book: "노트북 삭제",
    delete_book_confirm: "이 노트북과 모든 거래를 삭제하시겠습니까?",
    cancel: "취소",
    yes_delete: "예, 삭제합니다"
  },
  ja: {
    title: "資金管理",
    balance: "残高",
    income: "収入",
    expense: "支出",
    transaction_history: "取引履歴",
    add_data: "データを追加",
    no_record: "まだ財務記録はありません。",
    start_record: "今すぐ記録を開始",
    add_book: "新しいノートを追加",
    book_title_label: "ノートのタイトル（例：ナイラのお金）",
    book_title_placeholder: "タイトルを入力...",
    save_book: "ノートを保存",
    delete_book: "ノートを削除",
    delete_book_confirm: "このノートとすべての取引を削除してもよろしいですか？",
    cancel: "キャンセル",
    yes_delete: "はい、削除します"
  },
  zh: {
    title: "资金管理",
    balance: "您的余额",
    income: "收入",
    expense: "支出",
    transaction_history: "交易记录",
    add_data: "添加数据",
    no_record: "暂无财务记录。",
    start_record: "立即开始记录",
    add_book: "添加新账本",
    book_title_label: "账本标题（例如：Naila的钱）",
    book_title_placeholder: "输入标题...",
    save_book: "保存账本",
    delete_book: "删除账本",
    delete_book_confirm: "您确定要删除此账本及其所有交易吗？",
    cancel: "取消",
    yes_delete: "是，删除"
  },
  id: {
    title: "Manajemen Uang",
    balance: "Sisa Saldo Anda",
    income: "Pemasukan",
    expense: "Pengeluaran",
    transaction_history: "Riwayat Transaksi",
    add_data: "Tambah Data",
    no_record: "Belum ada catatan keuangan.",
    start_record: "Mulai catat sekarang",
    add_book: "Tambah Buku Catatan Baru",
    book_title_label: "JUDUL CATATAN (CONTOH: UANG NAILA)",
    book_title_placeholder: "Masukkan judul...",
    save_book: "Simpan Buku",
    delete_book: "Hapus Buku Catatan",
    delete_book_confirm: "Yakin ingin menghapus buku ini beserta seluruh transaksinya?",
    cancel: "Batal",
    yes_delete: "Ya, Hapus"
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
      if (!data.keuangan) {
        data.keuangan = translations[lang];
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`Updated keuangan in ${file}`);
      }
    } catch (e) {
      console.log(`Error reading ${file}`);
    }
  }
});

// 2. Patch +page.svelte
const pagePath = path.join(__dirname, 'src/routes/keuangan/+page.svelte');
let page = fs.readFileSync(pagePath, 'utf8');

// Add imports
if (!page.includes("import { t, locale } from 'svelte-i18n';")) {
  page = page.replace(
    "import { onMount, onDestroy } from 'svelte';",
    "import { onMount, onDestroy } from 'svelte';\n  import { t, locale } from 'svelte-i18n';"
  );
}

// Convert formatIDR to reactive + apply Arabic numbers
const newFormatIDR = `
  $: formatIDR = (amount: number) => {
    let str = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
    if ($locale === 'ar') {
      const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
      str = str.replace(/[0-9]/g, w => arabicNumbers[parseInt(w)]);
    }
    return str;
  };

  $: formatCompactIDR = (amount: number) => {
    let str = new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      notation: 'compact', 
      maximumFractionDigits: 1 
    }).format(amount);
    if ($locale === 'ar') {
      const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
      str = str.replace(/[0-9]/g, w => arabicNumbers[parseInt(w)]);
    }
    return str;
  };
`;

// Remove old formatIDR and formatCompactIDR
page = page.replace(/function formatIDR[\s\S]*?maximumFractionDigits: 1 \n    }\)\.format\(amount\);\n  \}/m, newFormatIDR);

// Simple String Replacements
page = page.replace(/>Manajemen Uang</g, ">{$t('keuangan.title') || 'Manajemen Uang'}<");
page = page.replace(/title="Manajemen Uang"/g, 'title={$t(\'keuangan.title\') || \'Manajemen Uang\'}');
page = page.replace(/>Sisa Saldo Anda</g, ">{$t('keuangan.balance') || 'Sisa Saldo Anda'}<");
page = page.replace(/>Pemasukan</g, ">{$t('keuangan.income') || 'Pemasukan'}<");
page = page.replace(/>Pengeluaran</g, ">{$t('keuangan.expense') || 'Pengeluaran'}<");
page = page.replace(/>Riwayat Transaksi</g, ">{$t('keuangan.transaction_history') || 'Riwayat Transaksi'}<");
page = page.replace(/>Tambah Data</g, ">{$t('keuangan.add_data') || 'Tambah Data'}<");
page = page.replace(/>Belum ada catatan keuangan\.</g, ">{$t('keuangan.no_record') || 'Belum ada catatan keuangan.'}<");
page = page.replace(/>Mulai catat sekarang</g, ">{$t('keuangan.start_record') || 'Mulai catat sekarang'}<");
page = page.replace(/>Tambah Buku Catatan Baru</g, ">{$t('keuangan.add_book') || 'Tambah Buku Catatan Baru'}<");
page = page.replace(/>JUDUL CATATAN \(CONTOH: UANG NAILA\)</g, ">{$t('keuangan.book_title_label') || 'JUDUL CATATAN (CONTOH: UANG NAILA)'}<");
page = page.replace(/placeholder="Masukkan judul\.\.\."/g, "placeholder={$t('keuangan.book_title_placeholder') || 'Masukkan judul...'}");
page = page.replace(/>Simpan Buku</g, ">{$t('keuangan.save_book') || 'Simpan Buku'}<");
page = page.replace(/>Hapus Buku Catatan</g, ">{$t('keuangan.delete_book') || 'Hapus Buku Catatan'}<");
page = page.replace(/>Yakin ingin menghapus buku ini beserta seluruh transaksinya\?</g, ">{$t('keuangan.delete_book_confirm') || 'Yakin ingin menghapus buku ini beserta seluruh transaksinya?'}<");
page = page.replace(/\n(\s*)Batal\n\s*/g, "\n$1{$t('keuangan.cancel') || 'Batal'}\n$1");
page = page.replace(/\n(\s*)Ya, Hapus\n\s*/g, "\n$1{$t('keuangan.yes_delete') || 'Ya, Hapus'}\n$1");

fs.writeFileSync(pagePath, page, 'utf8');
console.log("Patched keuangan/+page.svelte successfully");
