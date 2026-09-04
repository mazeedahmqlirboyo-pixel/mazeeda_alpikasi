const fs = require('fs');
const path = require('path');

const localesPath = path.join(__dirname, 'src/lib/i18n');
const files = ['id.json', 'en.json', 'ar.json', 'ja.json', 'ko.json', 'zh.json'];

const nilaiTranslations = {
  'id.json': {
    "page_title": "Nilai Akademik",
    "search_placeholder": "Ketik nama santri...",
    "empty_title": "Cari nama santri di atas",
    "empty_desc": "Minimal 2 karakter untuk memulai pencarian",
    "legend_good": "≥ 8 Baik",
    "legend_fair": "≥ 6.5 Cukup",
    "legend_poor": "< 6.5 Kurang"
  },
  'en.json': {
    "page_title": "Academic Grades",
    "search_placeholder": "Type student name...",
    "empty_title": "Search for a student above",
    "empty_desc": "Minimum 2 characters to start searching",
    "legend_good": "≥ 8 Good",
    "legend_fair": "≥ 6.5 Fair",
    "legend_poor": "< 6.5 Poor"
  },
  'ar.json': {
    "page_title": "الدرجات الأكاديمية",
    "search_placeholder": "اكتب اسم الطالب...",
    "empty_title": "ابحث عن طالب أعلاه",
    "empty_desc": "على الأقل حرفين لبدء البحث",
    "legend_good": "≥ ٨ جيد",
    "legend_fair": "≥ ٦.٥ مقبول",
    "legend_poor": "< ٦.٥ ضعيف"
  },
  'ja.json': {
    "page_title": "学業成績",
    "search_placeholder": "生徒名を入力...",
    "empty_title": "上で生徒を検索してください",
    "empty_desc": "検索を開始するには最低2文字入力してください",
    "legend_good": "≥ 8 良い",
    "legend_fair": "≥ 6.5 普通",
    "legend_poor": "< 6.5 悪い"
  },
  'ko.json': {
    "page_title": "학업 성적",
    "search_placeholder": "학생 이름 입력...",
    "empty_title": "위에서 학생을 검색하세요",
    "empty_desc": "검색을 시작하려면 최소 2자를 입력하세요",
    "legend_good": "≥ 8 우수",
    "legend_fair": "≥ 6.5 보통",
    "legend_poor": "< 6.5 미흡"
  },
  'zh.json': {
    "page_title": "学业成绩",
    "search_placeholder": "输入学生姓名...",
    "empty_title": "在上面搜索学生",
    "empty_desc": "至少输入2个字符以开始搜索",
    "legend_good": "≥ 8 优秀",
    "legend_fair": "≥ 6.5 及格",
    "legend_poor": "< 6.5 差"
  }
};

files.forEach(file => {
  const filePath = path.join(localesPath, file);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    data.nilai = nilaiTranslations[file];
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  }
});

// Now patch the +page.svelte file
const sveltePath = path.join(__dirname, 'src/routes/nilai/+page.svelte');
let content = fs.readFileSync(sveltePath, 'utf8');

if (!content.includes("import { t, locale } from 'svelte-i18n';")) {
  content = content.replace(
    "import { supabase } from '$lib/supabase';", 
    "import { supabase } from '$lib/supabase';\n  import { t, locale } from 'svelte-i18n';"
  );
}

// Update PageHeader
content = content.replace(
  '<PageHeader title="Nilai Akademik" backTo="/" />',
  '<PageHeader title={$t("nilai.page_title") || "Nilai Akademik"} backTo="/" />'
);

// Update placeholder
content = content.replace(
  'placeholder="Ketik nama santri..."',
  'placeholder={$t("nilai.search_placeholder") || "Ketik nama santri..."}'
);

// Update empty state text
content = content.replace(
  'Cari nama santri di atas',
  '{$t("nilai.empty_title") || "Cari nama santri di atas"}'
);
content = content.replace(
  'Minimal 2 karakter untuk memulai pencarian',
  '{$t("nilai.empty_desc") || "Minimal 2 karakter untuk memulai pencarian"}'
);

// Update legends
content = content.replace(
  '≥ 8 Baik',
  '{$t("nilai.legend_good") || "≥ 8 Baik"}'
);
content = content.replace(
  '≥ 6.5 Cukup',
  '{$t("nilai.legend_fair") || "≥ 6.5 Cukup"}'
);
content = content.replace(
  '&lt; 6.5 Kurang',
  '{$t("nilai.legend_poor") || "&lt; 6.5 Kurang"}'
);

// Update displayNilai function
const oldDisplayNilai = `  function displayNilai(nilai: any) {
    const n = parseFloat(nilai);
    if (isNaN(n)) return nilai ?? '-';
    return n < 0 ? '0' : String(nilai);
  }`;
const newDisplayNilai = `  function displayNilai(nilai: any, currentLocale: string | null = null) {
    const n = parseFloat(nilai);
    if (isNaN(n)) return nilai ?? '-';
    const num = n < 0 ? 0 : n;
    if (currentLocale === 'ar') return Number(num).toLocaleString('ar-EG');
    return String(num);
  }`;
content = content.replace(oldDisplayNilai, newDisplayNilai);

// Update displayNilai calls
content = content.replace(/{displayNilai\(row\.nilai\)}/g, '{displayNilai(row.nilai, $locale)}');

fs.writeFileSync(sveltePath, content, 'utf8');
console.log('Nilai patch complete.');
