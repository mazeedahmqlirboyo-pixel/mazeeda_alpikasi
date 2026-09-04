const fs = require('fs');
const path = require('path');

// 1. JSON Patch
const localesPath = path.join(__dirname, 'src/lib/i18n');
const files = ['id.json', 'en.json', 'ar.json', 'ja.json', 'ko.json', 'zh.json'];

const homepageTranslations = {
  'id.json': {
    "mading_terkini": "Mading Terkini",
    "semua_mading": "Semua Mading",
    "memori_terkini": "Memori Terkini",
    "semua_galeri": "Semua Galeri",
    "informasi": "Informasi",
    "diposting_oleh": "Diposting oleh:",
    "selengkapnya": "Selengkapnya",
    "diunggah_pada": "Diunggah pada:",
    "memori_desc": "Bagian dari lembar sejarah dan kenangan manis perjalanan kebersamaan MAZEEDA Squad...",
    "galeri_kenangan": "Galeri Kenangan"
  },
  'en.json': {
    "mading_terkini": "Latest Board",
    "semua_mading": "All Boards",
    "memori_terkini": "Recent Memories",
    "semua_galeri": "All Galleries",
    "informasi": "Information",
    "diposting_oleh": "Posted by:",
    "selengkapnya": "Read more",
    "diunggah_pada": "Uploaded on:",
    "memori_desc": "A part of the historical page and sweet memories of MAZEEDA Squad's togetherness journey...",
    "galeri_kenangan": "Memory Gallery"
  },
  'ar.json': {
    "mading_terkini": "أحدث لوحة",
    "semua_mading": "كل اللوحات",
    "memori_terkini": "أحدث الذكريات",
    "semua_galeri": "كل المعارض",
    "informasi": "معلومات",
    "diposting_oleh": "نشر بواسطة:",
    "selengkapnya": "اقرأ المزيد",
    "diunggah_pada": "تم الرفع في:",
    "memori_desc": "جزء من الصفحة التاريخية والذكريات الجميلة لرحلة فريق MAZEEDA...",
    "galeri_kenangan": "معرض الذكريات"
  },
  'ja.json': {
    "mading_terkini": "最新の掲示板",
    "semua_mading": "すべての掲示板",
    "memori_terkini": "最近の思い出",
    "semua_galeri": "すべてのギャラリー",
    "informasi": "情報",
    "diposting_oleh": "投稿者:",
    "selengkapnya": "続きを読む",
    "diunggah_pada": "アップロード日:",
    "memori_desc": "MAZEEDA Squad の素晴らしい旅と思い出の一部...",
    "galeri_kenangan": "思い出ギャラリー"
  },
  'ko.json': {
    "mading_terkini": "최신 게시판",
    "semua_mading": "모든 게시판",
    "memori_terkini": "최근 추억",
    "semua_galeri": "모든 갤러리",
    "informasi": "정보",
    "diposting_oleh": "작성자:",
    "selengkapnya": "자세히 보기",
    "diunggah_pada": "업로드 날짜:",
    "memori_desc": "MAZEEDA Squad의 소중한 추억과 여정의 일부...",
    "galeri_kenangan": "추억 갤러리"
  },
  'zh.json': {
    "mading_terkini": "最新公告板",
    "semua_mading": "所有公告板",
    "memori_terkini": "近期回忆",
    "semua_galeri": "所有图库",
    "informasi": "信息",
    "diposting_oleh": "发布者:",
    "selengkapnya": "阅读更多",
    "diunggah_pada": "上传日期:",
    "memori_desc": "MAZEEDA Squad 旅程中美好回忆的一部分...",
    "galeri_kenangan": "回忆图库"
  }
};

files.forEach(file => {
  const filePath = path.join(localesPath, file);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!data.mading) {
      data.mading = {};
    }
    data.mading = { ...data.mading, ...homepageTranslations[file] };
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  }
});
console.log('Homepage translations patched into JSONs.');

// 2. Svelte Patch
const sveltePath = path.join(__dirname, 'src/routes/+page.svelte');
let content = fs.readFileSync(sveltePath, 'utf8');

// Ensure displayNumber is added
if (!content.includes('function displayNumber(')) {
  content = content.replace(
    '</script>',
    `  function displayNumber(num: number | undefined | null, currentLocale: string | null = null) {
    const n = Number(num || 0);
    if (isNaN(n)) return '0';
    if (currentLocale === 'ar') return n.toLocaleString('ar-EG');
    return String(n);
  }
</script>`
  );
}

// Replace recentMemory.likes
content = content.replace(/{recentMemory\.likes}/g, '{displayNumber(recentMemory.likes, $locale)}');

fs.writeFileSync(sveltePath, content, 'utf8');
console.log('Homepage svelte patched.');
