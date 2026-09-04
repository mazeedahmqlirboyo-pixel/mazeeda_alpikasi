const fs = require('fs');
const path = require('path');

const tsFiles = ['en.json', 'ar.json', 'ko.json', 'ja.json', 'zh.json', 'id.json'];
const translations = {
  en: {
    title: "Class Treasury",
    hero_title: "Class Mutual Cooperation",
    hero_desc: "Channel your class treasury contribution to support various programs, activities, and mutual benefits.",
    transparency_title: "Fund Transparency",
    transparency_desc: "All incoming funds will be transparently recorded by the treasurer and fully allocated for mutual benefit.",
    payment_methods: "Payment Methods",
    account_name_label: "Account Name",
    treasurer: "Class Treasurer",
    account_number_label: "Account Number",
    copy_number: "Copy Number",
    copy_success: "Successfully copied to clipboard!",
    footer_note: "Please add a unique code or confirm to the treasurer after transferring for easier tracking."
  },
  ar: {
    title: "خزينة الدفعة",
    hero_title: "التعاون المشترك للدفعة",
    hero_desc: "وجه مساهمتك في خزينة الدفعة لدعم البرامج والأنشطة والمنافع المشتركة المختلفة.",
    transparency_title: "شفافية الأموال",
    transparency_desc: "سيتم تسجيل جميع الأموال الواردة بشفافية من قبل أمين الصندوق وتخصيصها بالكامل للمنفعة المشتركة.",
    payment_methods: "طرق الدفع",
    account_name_label: "اسم الحساب",
    treasurer: "أمين صندوق الدفعة",
    account_number_label: "رقم الحساب",
    copy_number: "نسخ الرقم",
    copy_success: "تم النسخ إلى الحافظة بنجاح!",
    footer_note: "يرجى إضافة رمز فريد أو التأكيد لأمين الصندوق بعد التحويل لتسهيل عملية التسجيل."
  },
  ko: {
    title: "학급 회비",
    hero_title: "학급 상호 협력",
    hero_desc: "다양한 프로그램, 활동 및 상호 이익을 지원하기 위해 학급 회비를 기부하세요.",
    transparency_title: "자금 투명성",
    transparency_desc: "들어오는 모든 자금은 회계가 투명하게 기록하며 공동의 이익을 위해 전액 할당됩니다.",
    payment_methods: "결제 방법",
    account_name_label: "예금주",
    treasurer: "학급 회계",
    account_number_label: "계좌 번호",
    copy_number: "번호 복사",
    copy_success: "클립보드에 복사되었습니다!",
    footer_note: "기록을 쉽게 하려면 이체 후 고유 코드를 추가하거나 회계에게 확인해 주세요."
  },
  ja: {
    title: "クラス会計",
    hero_title: "クラスの相互協力",
    hero_desc: "様々なプログラム、活動、相互の利益を支援するために、クラス会計への貢献をお願いします。",
    transparency_title: "資金の透明性",
    transparency_desc: "入金されたすべての資金は会計係によって透明に記録され、共同の利益のために全額割り当てられます。",
    payment_methods: "支払い方法",
    account_name_label: "口座名義",
    treasurer: "クラス会計",
    account_number_label: "口座番号",
    copy_number: "番号をコピー",
    copy_success: "クリップボードにコピーしました！",
    footer_note: "記録を容易にするため、送金後に固有のコードを追加するか、会計係に確認をお願いします。"
  },
  zh: {
    title: "班级金库",
    hero_title: "班级互助合作",
    hero_desc: "贡献您的班级金库以支持各种项目、活动和共同利益。",
    transparency_title: "资金透明度",
    transparency_desc: "所有收入资金将由财务透明记录，并完全用于共同利益。",
    payment_methods: "付款方式",
    account_name_label: "账户名称",
    treasurer: "班级财务",
    account_number_label: "账号",
    copy_number: "复制号码",
    copy_success: "成功复制到剪贴板！",
    footer_note: "请在转账后添加唯一代码或向财务确认，以便于记录。"
  },
  id: {
    title: "Kas Angkatan",
    hero_title: "Gotong Royong Angkatan",
    hero_desc: "Salurkan kontribusi Kas Angkatan Anda untuk mendukung berbagai program, kegiatan, dan kemaslahatan bersama.",
    transparency_title: "Transparansi Dana",
    transparency_desc: "Seluruh dana yang masuk akan dicatat secara transparan oleh bendahara dan dialokasikan sepenuhnya untuk kepentingan bersama.",
    payment_methods: "Metode Penyaluran Kas",
    account_name_label: "Atas Nama",
    treasurer: "Bendahara Angkatan",
    account_number_label: "Nomor Rekening / Akun",
    copy_number: "Salin Nomor",
    copy_success: "Berhasil disalin ke clipboard!",
    footer_note: "Mohon tambahkan kode unik atau konfirmasi ke bendahara setelah melakukan transfer agar pendataan lebih mudah."
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
      if (!data.kas) {
        data.kas = translations[lang];
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      }
    } catch (e) {
      console.log(`Error reading ${file}`);
    }
  }
});

// 2. Patch +page.svelte
const pagePath = path.join(__dirname, 'src/routes/kas-angkatan/+page.svelte');
let page = fs.readFileSync(pagePath, 'utf8');

// Add import
if (!page.includes("import { t, locale } from 'svelte-i18n';")) {
  page = page.replace(
    "import { fade, fly, scale } from \"svelte/transition\";",
    "import { t, locale } from 'svelte-i18n';\n  import { fade, fly, scale } from \"svelte/transition\";"
  );
}

// Add formatNumberDisplay function
const funcCode = `
  $: formatNumberDisplay = (numStr: string) => {
    if ($locale === 'ar') {
      const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
      return numStr.replace(/[0-9]/g, w => arabicNumbers[parseInt(w)]);
    }
    return numStr;
  };
`;
page = page.replace(
  "  const paymentMethods =",
  funcCode + "\n  const paymentMethods ="
);

// Replace texts
page = page.replace(/title="Kas Angkatan"/g, "title={$t('kas.title') || 'Kas Angkatan'}");
page = page.replace(/>Kas Angkatan - MAZEEDA</g, ">{$t('kas.title') || 'Kas Angkatan'} - MAZEEDA<");
page = page.replace(/>Gotong Royong Angkatan</g, ">{$t('kas.hero_title') || 'Gotong Royong Angkatan'}<");
page = page.replace(/\n(\s*)Salurkan kontribusi Kas Angkatan Anda untuk mendukung berbagai program, kegiatan, dan kemaslahatan bersama.\n(\s*)/g, "\n$1{$t('kas.hero_desc') || 'Salurkan kontribusi Kas Angkatan Anda untuk mendukung berbagai program, kegiatan, dan kemaslahatan bersama.'}\n$2");
page = page.replace(/>Transparansi Dana</g, ">{$t('kas.transparency_title') || 'Transparansi Dana'}<");
page = page.replace(/\n(\s*)Seluruh dana yang masuk akan dicatat secara transparan oleh bendahara dan dialokasikan sepenuhnya untuk kepentingan bersama.\n(\s*)/g, "\n$1{$t('kas.transparency_desc') || 'Seluruh dana yang masuk akan dicatat secara transparan oleh bendahara dan dialokasikan sepenuhnya untuk kepentingan bersama.'}\n$2");
page = page.replace(/\n(\s*)Metode Penyaluran Kas\n(\s*)/g, "\n$1{$t('kas.payment_methods') || 'Metode Penyaluran Kas'}\n$2");
page = page.replace(/>Atas Nama</g, ">{$t('kas.account_name_label') || 'Atas Nama'}<");

// Handle 'Bendahara Angkatan' in the array map
// We will replace it inside the HTML interpolation instead: {method.accountName}
// Wait, better to replace {method.accountName} with:
// {method.accountName === 'Bendahara Angkatan' ? ($t('kas.treasurer') || 'Bendahara Angkatan') : method.accountName}
page = page.replace(
  />\{method\.accountName\}</g,
  ">{method.accountName === 'Bendahara Angkatan' ? ($t('kas.treasurer') || 'Bendahara Angkatan') : method.accountName}<"
);

page = page.replace(/>Nomor Rekening \/ Akun</g, ">{$t('kas.account_number_label') || 'Nomor Rekening / Akun'}<");
page = page.replace(/title="Salin Nomor"/g, "title={$t('kas.copy_number') || 'Salin Nomor'}");
page = page.replace(/\n(\s*)Berhasil disalin ke clipboard!\n(\s*)/g, "\n$1{$t('kas.copy_success') || 'Berhasil disalin ke clipboard!'}\n$2");
page = page.replace(/\n(\s*)Mohon tambahkan kode unik atau konfirmasi ke bendahara setelah melakukan transfer agar pendataan lebih mudah.\n(\s*)/g, "\n$1{$t('kas.footer_note') || 'Mohon tambahkan kode unik atau konfirmasi ke bendahara setelah melakukan transfer agar pendataan lebih mudah.'}\n$2");

// Fix number formatting and remove font-mono
page = page.replace(/font-mono/g, ""); // Remove font-mono from all
page = page.replace(/>\{method\.accountNumber\}</g, ">{formatNumberDisplay(method.accountNumber)}<");

fs.writeFileSync(pagePath, page, 'utf8');
console.log("Patched Kas Angkatan page with i18n!");
