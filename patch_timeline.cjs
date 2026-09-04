const fs = require('fs');
const path = require('path');

const tsFiles = ['en.json', 'ar.json', 'ko.json', 'ja.json', 'zh.json', 'id.json'];
const translations = {
  en: {
    title: "Timeline",
    filter_category: "Filter Category",
    all: "All",
    no_photo: "No Photos",
    no_memory: "No Memory Photos Yet",
    no_photo_in_cat: "No photos in category",
    no_doc: "No moment documentation uploaded yet.",
    no_comment: "No Comments Yet"
  },
  ar: {
    title: "الجدول الزمني",
    filter_category: "تصفية الفئة",
    all: "الكل",
    no_photo: "لا توجد صور",
    no_memory: "لا توجد صور للذكريات بعد",
    no_photo_in_cat: "لا توجد صور في الفئة",
    no_doc: "لم يتم تحميل أي توثيق للحظات بعد.",
    no_comment: "لا توجد تعليقات بعد"
  },
  ko: {
    title: "타임라인",
    filter_category: "카테고리 필터",
    all: "전체",
    no_photo: "사진 없음",
    no_memory: "아직 추억 사진이 없습니다",
    no_photo_in_cat: "해당 카테고리에 사진이 없습니다",
    no_doc: "아직 업로드된 순간 기록이 없습니다.",
    no_comment: "아직 댓글이 없습니다"
  },
  ja: {
    title: "タイムライン",
    filter_category: "カテゴリーフィルター",
    all: "すべて",
    no_photo: "写真なし",
    no_memory: "思い出の写真はまだありません",
    no_photo_in_cat: "このカテゴリーには写真がありません",
    no_doc: "アップロードされた瞬間の記録はまだありません。",
    no_comment: "コメントはまだありません"
  },
  zh: {
    title: "时间线",
    filter_category: "过滤类别",
    all: "全部",
    no_photo: "无照片",
    no_memory: "暂无记忆照片",
    no_photo_in_cat: "此类别中没有照片",
    no_doc: "尚未上传任何时刻记录。",
    no_comment: "暂无评论"
  },
  id: {
    title: "Timeline",
    filter_category: "Filter Kategori",
    all: "Semua",
    no_photo: "Tidak Ada Foto",
    no_memory: "Belum Ada Foto Kenangan",
    no_photo_in_cat: "Belum ada foto dalam kategori",
    no_doc: "Belum ada dokumentasi momen yang diunggah.",
    no_comment: "Belum Ada Komentar"
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
      if (!data.timeline) {
        data.timeline = translations[lang];
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      }
    } catch (e) {
      console.log(`Error reading ${file}`);
    }
  }
});

// 2. Patch +page.svelte
const pagePath = path.join(__dirname, 'src/routes/timeline/+page.svelte');
let page = fs.readFileSync(pagePath, 'utf8');

// Add import if missing
if (!page.includes("import { t, locale } from 'svelte-i18n';")) {
  page = page.replace(
    "import { onMount, onDestroy } from 'svelte';",
    "import { t, locale } from 'svelte-i18n';\n  import { onMount, onDestroy } from 'svelte';"
  );
}

// Ensure the regex accurately replaces Timeline static texts
page = page.replace(/title="Timeline"/g, "title={$t('timeline.title') || 'Timeline'}");
page = page.replace(/title="Filter Kategori"/g, "title={$t('timeline.filter_category') || 'Filter Kategori'}");
page = page.replace(/>Filter Kategori</g, ">{$t('timeline.filter_category') || 'Filter Kategori'}<");

// Replace {cat === 'Semua' ? 'Semua' : cat} or {cat} with translations if it's 'Semua'
// First check if there is {cat === 'Semua' ? 'Semua' : cat}
if (page.includes("{cat === 'Semua' ? 'Semua' : cat}")) {
  page = page.replace(
    /\{cat === 'Semua' \? 'Semua' : cat\}/g,
    "{cat === 'Semua' ? ($t('timeline.all') || 'Semua') : cat}"
  );
} else {
  // Maybe it's just {cat}
  page = page.replace(
    />\{cat\}<\/button>/g,
    ">{cat === 'Semua' ? ($t('timeline.all') || 'Semua') : cat}</button>"
  );
  // Let's also check for `{cat}` with whitespaces
  page = page.replace(
    />\s*\{cat\}\s*</g,
    ">{cat === 'Semua' ? ($t('timeline.all') || 'Semua') : cat}<"
  );
}

// Texts for no data
page = page.replace(
  /'Tidak Ada Foto' : 'Belum Ada Foto Kenangan'/g,
  "($t('timeline.no_photo') || 'Tidak Ada Foto') : ($t('timeline.no_memory') || 'Belum Ada Foto Kenangan')"
);
page = page.replace(
  /`Belum ada foto dalam kategori \$\{selectedCategory\}\.`/g,
  "`\\$\\{$t('timeline.no_photo_in_cat') || 'Belum ada foto dalam kategori'\\} \\$\\{selectedCategory\\}.`"
);
page = page.replace(
  /'Belum ada dokumentasi momen yang diunggah\.'/g,
  "($t('timeline.no_doc') || 'Belum ada dokumentasi momen yang diunggah.')"
);
page = page.replace(
  />Belum Ada Komentar</g,
  ">{$t('timeline.no_comment') || 'Belum Ada Komentar'}<"
);

fs.writeFileSync(pagePath, page, 'utf8');
console.log("Patched Timeline page with i18n!");
