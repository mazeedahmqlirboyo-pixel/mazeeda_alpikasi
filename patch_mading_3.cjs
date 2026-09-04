const fs = require('fs');
const path = require('path');

// 1. JSON Patch
const localesPath = path.join(__dirname, 'src/lib/i18n');
const files = ['id.json', 'en.json', 'ar.json', 'ja.json', 'ko.json', 'zh.json'];

const additionalTranslations = {
  'id.json': { "filter_category": "KATEGORI", "filter_all": "Semua" },
  'en.json': { "filter_category": "CATEGORY", "filter_all": "All" },
  'ar.json': { "filter_category": "فئة", "filter_all": "الكل" },
  'ja.json': { "filter_category": "カテゴリー", "filter_all": "すべて" },
  'ko.json': { "filter_category": "카테고리", "filter_all": "모두" },
  'zh.json': { "filter_category": "类别", "filter_all": "全部" }
};

files.forEach(file => {
  const filePath = path.join(localesPath, file);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (data.mading) {
      data.mading = { ...data.mading, ...additionalTranslations[file] };
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    }
  }
});

// 2. Svelte Patch
const sveltePath = path.join(__dirname, 'src/routes/mading/+page.svelte');
let content = fs.readFileSync(sveltePath, 'utf8');

if (!content.includes('function displayNumber(')) {
  content = content.replace(
    '  // ==================== INITIALIZATION ====================',
    `  function displayNumber(num: number | undefined | null, currentLocale: string | null = null) {
    const n = Number(num || 0);
    if (isNaN(n)) return '0';
    if (currentLocale === 'ar') return n.toLocaleString('ar-EG');
    return String(n);
  }

  // ==================== INITIALIZATION ====================`
  );
}

// Replace numbers
content = content.replace(/{post\.likes}/g, '{displayNumber(post.likes, $locale)}');
content = content.replace(/{post\.comments\.length}/g, '{displayNumber(post.comments.length, $locale)}');
content = content.replace(/{note\.likes \|\| 0}/g, '{displayNumber(note.likes || 0, $locale)}');
content = content.replace(/{selectedAnnouncementForComments\.comments\.length}/g, '{displayNumber(selectedAnnouncementForComments.comments.length, $locale)}');
content = content.replace(/{selectedNoteForComments\.comments\.length}/g, '{displayNumber(selectedNoteForComments.comments.length, $locale)}');

// Fix text
content = content.replace(/Kategori\s*<\/span>/, '{$t("mading.filter_category") || "Kategori"}</span>');
content = content.replace(/>Semua<\/button>/, '>{$t("mading.filter_all") || "Semua"}</button>');

fs.writeFileSync(sveltePath, content, 'utf8');
console.log('Mading 3 patched.');
