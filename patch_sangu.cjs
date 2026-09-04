const fs = require('fs');
const path = require('path');

const tsFiles = ['en.json', 'ar.json', 'ko.json', 'ja.json', 'zh.json', 'id.json'];
const translations = {
  en: {
    title: "Sangu | Wirid",
    search_placeholder: "Search sholawat, nadzom, or prayers...",
    category_label: "CATEGORY",
    category_label_normal: "Category",
    all: "All",
    no_category: "No categories yet",
    no_data: "No reading files found matching this search or category.",
    font_size: "Font size:",
    latin: "Latin",
    translation: "Translation"
  },
  ar: {
    title: "زاد | ورد",
    search_placeholder: "ابحث عن صلوات، نظم، أو أدعية...",
    category_label: "الفئة",
    category_label_normal: "الفئة",
    all: "الكل",
    no_category: "لا توجد فئات بعد",
    no_data: "لم يتم العثور على ملفات قراءة تطابق هذا البحث أو الفئة.",
    font_size: "الخط:",
    latin: "اللاتينية",
    translation: "الترجمة"
  },
  ko: {
    title: "상구 | 위리드",
    search_placeholder: "숄라왓, 나좀, 또는 기도문 검색...",
    category_label: "카테고리",
    category_label_normal: "카테고리",
    all: "전체",
    no_category: "아직 카테고리가 없습니다",
    no_data: "검색 또는 카테고리와 일치하는 읽기 파일을 찾을 수 없습니다.",
    font_size: "글꼴 크기:",
    latin: "라틴어",
    translation: "번역"
  },
  ja: {
    title: "サング | ウィリド",
    search_placeholder: "ショラワット、ナゾム、または祈りの検索...",
    category_label: "カテゴリー",
    category_label_normal: "カテゴリー",
    all: "すべて",
    no_category: "カテゴリーはまだありません",
    no_data: "検索やカテゴリーに一致する読み取りファイルが見つかりません。",
    font_size: "フォントサイズ:",
    latin: "ラテン語",
    translation: "翻訳"
  },
  zh: {
    title: "Sangu | Wirid",
    search_placeholder: "搜索 sholawat、nadzom 或祈祷文...",
    category_label: "类别",
    category_label_normal: "类别",
    all: "全部",
    no_category: "暂无分类",
    no_data: "未找到与此搜索或类别匹配的阅读文件。",
    font_size: "字体大小:",
    latin: "拉丁文",
    translation: "翻译"
  },
  id: {
    title: "Sangu | Wirid",
    search_placeholder: "Cari sholawat, nadzom, atau berkas doa...",
    category_label: "KATEGORI",
    category_label_normal: "Kategori",
    all: "Semua",
    no_category: "Belum ada kategori",
    no_data: "Tidak ditemukan berkas bacaan yang cocok untuk pencarian atau kategori ini.",
    font_size: "Huruf:",
    latin: "Latin",
    translation: "Terjemah"
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
      if (!data.sangu) {
        data.sangu = translations[lang];
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      }
    } catch (e) {
      console.log(`Error reading ${file}`);
    }
  }
});

// 2. Patch +page.svelte
const pagePath = path.join(__dirname, 'src/routes/sangu/+page.svelte');
let page = fs.readFileSync(pagePath, 'utf8');

// Add import if missing
if (!page.includes("import { t, locale } from 'svelte-i18n';")) {
  page = page.replace(
    "import { onMount, tick } from 'svelte';",
    "import { t, locale } from 'svelte-i18n';\n  import { onMount, tick } from 'svelte';"
  );
}

// Ensure the regex accurately replaces static texts
page = page.replace(/title="Sangu \| Wirid"/g, "title={$t('sangu.title') || 'Sangu | Wirid'}");
page = page.replace(/placeholder="Cari sholawat, nadzom, atau berkas doa\.\.\."/g, "placeholder={$t('sangu.search_placeholder') || 'Cari sholawat, nadzom, atau berkas doa...'}");
page = page.replace(/>\s*Kategori\s*</g, ">{$t('sangu.category_label') || 'KATEGORI'}<"); // dropdown header
page = page.replace(/>Kategori: /g, ">{$t('sangu.category_label_normal') || 'Kategori'}: "); // detail view
page = page.replace(/>Semua<\/button/g, ">{$t('sangu.all') || 'Semua'}</button");
page = page.replace(/>Belum ada kategori<\/span/g, ">{$t('sangu.no_category') || 'Belum ada kategori'}</span");
page = page.replace(/>\s*Tidak ditemukan berkas bacaan yang cocok untuk pencarian atau kategori ini\.\s*</g, ">\n                {$t('sangu.no_data') || 'Tidak ditemukan berkas bacaan yang cocok untuk pencarian atau kategori ini.'}\n              <");
page = page.replace(/>Huruf:</g, ">{$t('sangu.font_size') || 'Huruf:'}<");
page = page.replace(/>Latin</g, ">{$t('sangu.latin') || 'Latin'}<");
page = page.replace(/>Terjemah</g, ">{$t('sangu.translation') || 'Terjemah'}<");

fs.writeFileSync(pagePath, page, 'utf8');
console.log("Patched Sangu page with i18n!");
