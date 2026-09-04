const fs = require('fs');
const path = require('path');

const localesPath = path.join(__dirname, 'src/lib/i18n');
const files = ['id.json', 'en.json', 'ar.json', 'ja.json', 'ko.json', 'zh.json'];

const madingTranslations = {
  'id.json': {
    "page_title": "Mading MAZEEDA",
    "tab_announcement": "Papan Pengumuman",
    "tab_aspiration": "Dinding Aspirasi",
    "search_announcement_placeholder": "Cari pengumuman...",
    "search_aspiration_placeholder": "Cari aspirasi...",
    "read_more": "Baca Selengkapnya",
    "category_label": "Kategori",
    "no_category": "Belum ada kategori",
    "empty_announcement": "Tidak ada pengumuman ditemukan",
    "empty_aspiration": "Dinding Aspirasi Kosong",
    "today": "Hari ini",
    "just_now": "Baru saja"
  },
  'en.json': {
    "page_title": "Mazeeda Board",
    "tab_announcement": "Announcement Board",
    "tab_aspiration": "Aspiration Wall",
    "search_announcement_placeholder": "Search announcements...",
    "search_aspiration_placeholder": "Search aspirations...",
    "read_more": "Read More",
    "category_label": "Category",
    "no_category": "No category yet",
    "empty_announcement": "No announcements found",
    "empty_aspiration": "Aspiration Wall is empty",
    "today": "Today",
    "just_now": "Just now"
  },
  'ar.json': {
    "page_title": "لوحة مزيدة",
    "tab_announcement": "لوحة الإعلانات",
    "tab_aspiration": "جدار التطلعات",
    "search_announcement_placeholder": "البحث في الإعلانات...",
    "search_aspiration_placeholder": "البحث في التطلعات...",
    "read_more": "اقرأ المزيد",
    "category_label": "فئة",
    "no_category": "لا توجد فئة بعد",
    "empty_announcement": "لم يتم العثور على إعلانات",
    "empty_aspiration": "جدار التطلعات فارغ",
    "today": "اليوم",
    "just_now": "الآن فقط"
  },
  'ja.json': {
    "page_title": "Mazeeda 掲示板",
    "tab_announcement": "掲示板",
    "tab_aspiration": "希望の壁",
    "search_announcement_placeholder": "お知らせを検索...",
    "search_aspiration_placeholder": "希望を検索...",
    "read_more": "続きを読む",
    "category_label": "カテゴリー",
    "no_category": "カテゴリーはまだありません",
    "empty_announcement": "お知らせが見つかりません",
    "empty_aspiration": "希望の壁は空です",
    "today": "今日",
    "just_now": "たった今"
  },
  'ko.json': {
    "page_title": "Mazeeda 게시판",
    "tab_announcement": "공지사항 게시판",
    "tab_aspiration": "열망의 벽",
    "search_announcement_placeholder": "공지사항 검색...",
    "search_aspiration_placeholder": "열망 검색...",
    "read_more": "자세히 보기",
    "category_label": "카테고리",
    "no_category": "아직 카테고리가 없습니다",
    "empty_announcement": "공지사항을 찾을 수 없습니다",
    "empty_aspiration": "열망의 벽이 비어 있습니다",
    "today": "오늘",
    "just_now": "방금 전"
  },
  'zh.json': {
    "page_title": "Mazeeda 留言板",
    "tab_announcement": "公告栏",
    "tab_aspiration": "愿望墙",
    "search_announcement_placeholder": "搜索公告...",
    "search_aspiration_placeholder": "搜索愿望...",
    "read_more": "阅读更多",
    "category_label": "类别",
    "no_category": "暂无类别",
    "empty_announcement": "未找到公告",
    "empty_aspiration": "愿望墙是空的",
    "today": "今天",
    "just_now": "刚刚"
  }
};

files.forEach(file => {
  const filePath = path.join(localesPath, file);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    data.mading = madingTranslations[file];
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  }
});
console.log('Mading JSONs patched.');
