const fs = require('fs');
const path = require('path');

const tsFiles = ['en.json', 'ar.json', 'ko.json', 'ja.json', 'zh.json', 'id.json'];
const translations = {
  en: {
    target: "Target",
    bebas: "Free",
    total_keseluruhan: "GRAND TOTAL",
    reset: "RESET",
    reset_title: "Reset Count?",
    reset_desc: "This will clear your current count and grand total. Are you sure?",
    batal: "Cancel",
    ya_reset: "Yes, Reset",
    set_target: "Set Target",
    enter_number: "Enter number...",
    simpan: "Save"
  },
  ar: {
    target: "الهدف",
    bebas: "حر",
    total_keseluruhan: "المجموع الكلي",
    reset: "إعادة ضبط",
    reset_title: "إعادة ضبط العد؟",
    reset_desc: "سيؤدي هذا إلى مسح العدد الحالي والمجموع الكلي. هل أنت متأكد؟",
    batal: "إلغاء",
    ya_reset: "نعم، إعادة ضبط",
    set_target: "تعيين الهدف",
    enter_number: "أدخل الرقم...",
    simpan: "حفظ"
  },
  ko: {
    target: "목표",
    bebas: "자유",
    total_keseluruhan: "총합계",
    reset: "초기화",
    reset_title: "카운트를 초기화하시겠습니까?",
    reset_desc: "현재 카운트와 총합계가 지워집니다. 계속하시겠습니까?",
    batal: "취소",
    ya_reset: "네, 초기화합니다",
    set_target: "목표 설정",
    enter_number: "숫자 입력...",
    simpan: "저장"
  },
  ja: {
    target: "目標",
    bebas: "自由",
    total_keseluruhan: "総合計",
    reset: "リセット",
    reset_title: "カウントをリセットしますか？",
    reset_desc: "現在のカウントと総合計がクリアされます。よろしいですか？",
    batal: "キャンセル",
    ya_reset: "はい、リセットします",
    set_target: "目標設定",
    enter_number: "数字を入力...",
    simpan: "保存"
  },
  zh: {
    target: "目标",
    bebas: "自由",
    total_keseluruhan: "总计",
    reset: "重置",
    reset_title: "重置计数？",
    reset_desc: "这将清除当前计数和总计。确定吗？",
    batal: "取消",
    ya_reset: "是，重置",
    set_target: "设定目标",
    enter_number: "输入数字...",
    simpan: "保存"
  },
  id: {
    target: "Target",
    bebas: "Bebas",
    total_keseluruhan: "TOTAL KESELURUHAN",
    reset: "RESET",
    reset_title: "Reset Hitungan?",
    reset_desc: "Ini akan menghapus angka hitungan saat ini dan total hitungan keseluruhan. Anda yakin?",
    batal: "Batal",
    ya_reset: "Ya, Reset",
    set_target: "Set Target",
    enter_number: "Masukkan angka...",
    simpan: "Simpan"
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
      if (!data.tasbih) {
        data.tasbih = translations[lang];
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`Updated tasbih in ${file}`);
      }
    } catch (e) {
      console.log(`Error reading ${file}`);
    }
  }
});

// 2. Patch +page.svelte
const pagePath = path.join(__dirname, 'src/routes/tasbih/+page.svelte');
let page = fs.readFileSync(pagePath, 'utf8');

// Add imports
if (!page.includes("import { locale, t } from '$lib/i18n';")) {
  page = page.replace(
    "import { Haptics, ImpactStyle } from '@capacitor/haptics';",
    "import { Haptics, ImpactStyle } from '@capacitor/haptics';\n  import { locale, t } from '$lib/i18n';"
  );
}

// Add formatNumberDisplay
if (!page.includes("$: formatNumberDisplay = (num)")) {
  page = page.replace(
    "let mode: 'target' | 'free' = 'target'; ",
    "let mode: 'target' | 'free' = 'target';\n\n  $: formatNumberDisplay = (num: number) => {\n    if ($locale === 'ar') {\n      const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];\n      return num.toString().replace(/[0-9]/g, w => arabicNumbers[parseInt(w)]);\n    }\n    return num.toString();\n  };"
  );
}

// Replace Strings
page = page.replace(/Target \{customTarget\}/g, "{$t('tasbih.target') || 'Target'} {formatNumberDisplay(customTarget)}");
page = page.replace(/Bebas/g, "{$t('tasbih.bebas') || 'Bebas'}");
page = page.replace(/Total Keseluruhan/g, "{$t('tasbih.total_keseluruhan') || 'TOTAL KESELURUHAN'}");
page = page.replace(/RESET/g, "{$t('tasbih.reset') || 'RESET'}");
page = page.replace(/Reset Hitungan\?/g, "{$t('tasbih.reset_title') || 'Reset Hitungan?'}");
page = page.replace(/Ini akan menghapus angka hitungan saat ini dan total hitungan keseluruhan\. Anda yakin\?/g, "{$t('tasbih.reset_desc') || 'Ini akan menghapus angka hitungan saat ini dan total hitungan keseluruhan. Anda yakin?'}");
page = page.replace(/>Batal</g, ">{$t('tasbih.batal') || 'Batal'}<");
page = page.replace(/>Ya, Reset</g, ">{$t('tasbih.ya_reset') || 'Ya, Reset'}<");
page = page.replace(/Set Target/g, "{$t('tasbih.set_target') || 'Set Target'}");
page = page.replace(/placeholder="Masukkan angka..."/g, "placeholder={$t('tasbih.enter_number') || 'Masukkan angka...'}");
page = page.replace(/>Simpan</g, ">{$t('tasbih.simpan') || 'Simpan'}<");

// Replace numbers
// main count: {count}
page = page.replace(/\{count\}/g, "{formatNumberDisplay(count)}");
// total count: {totalCount}
page = page.replace(/\{totalCount\}/g, "{formatNumberDisplay(totalCount)}");
// tempTargetInput (value binding) should probably stay raw for input, but it's an input type="number" so we leave it alone.
// We only format display numbers.

fs.writeFileSync(pagePath, page, 'utf8');
console.log("Patched tasbih/+page.svelte successfully");
