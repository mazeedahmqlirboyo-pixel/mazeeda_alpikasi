const fs = require('fs');
const path = require('path');

const tsFiles = ['en.json', 'ar.json', 'ko.json', 'ja.json', 'zh.json', 'id.json'];
const translations = {
  en: {
    title: "Mazeeda Squad",
    search_placeholder: "Search by name or domicile...",
    category_label: "CATEGORY",
    all: "All",
    region_label: "STUDENT REGION",
    search_region: "Search region...",
    region_not_found: "Region not found",
    reset_filter: "✕ Reset all filters",
    loading: "SEARCHING DATA...",
    start_search: "Start Search",
    start_search_desc: "Type at least 2 letters of name or domicile to start searching data.",
    no_data: "No data found",
    change_keyword: "Please change your search keywords or check active filters."
  },
  ar: {
    title: "فرقة مزيدة",
    search_placeholder: "ابحث بالاسم أو السكن...",
    category_label: "الفئة",
    all: "الكل",
    region_label: "منطقة الطالب",
    search_region: "البحث عن منطقة...",
    region_not_found: "المنطقة غير موجودة",
    reset_filter: "✕ إعادة ضبط جميع الفلاتر",
    loading: "جاري البحث عن البيانات...",
    start_search: "بدء البحث",
    start_search_desc: "اكتب حرفين على الأقل من الاسم أو السكن لبدء البحث عن البيانات.",
    no_data: "لم يتم العثور على بيانات",
    change_keyword: "يرجى تغيير كلمات البحث الخاصة بك أو التحقق من الفلاتر النشطة."
  },
  ko: {
    title: "마지다 스쿼드",
    search_placeholder: "이름 또는 거주지로 검색...",
    category_label: "카테고리",
    all: "전체",
    region_label: "학생 지역",
    search_region: "지역 검색...",
    region_not_found: "지역을 찾을 수 없음",
    reset_filter: "✕ 모든 필터 재설정",
    loading: "데이터 검색 중...",
    start_search: "검색 시작",
    start_search_desc: "이름이나 거주지를 최소 2자 이상 입력하여 데이터 검색을 시작하세요.",
    no_data: "데이터를 찾을 수 없습니다",
    change_keyword: "검색어를 변경하거나 활성 필터를 확인하세요."
  },
  ja: {
    title: "マジーダスクワッド",
    search_placeholder: "名前や居住地で検索...",
    category_label: "カテゴリー",
    all: "すべて",
    region_label: "生徒の地域",
    search_region: "地域を検索...",
    region_not_found: "地域が見つかりません",
    reset_filter: "✕ すべてのフィルターをリセット",
    loading: "データを検索中...",
    start_search: "検索開始",
    start_search_desc: "データ検索を開始するには、名前または居住地を2文字以上入力してください。",
    no_data: "データが見つかりません",
    change_keyword: "検索キーワードを変更するか、アクティブなフィルターを確認してください。"
  },
  zh: {
    title: "Mazeeda 小队",
    search_placeholder: "按姓名或住所搜索...",
    category_label: "类别",
    all: "全部",
    region_label: "学生地区",
    search_region: "搜索地区...",
    region_not_found: "未找到地区",
    reset_filter: "✕ 重置所有过滤器",
    loading: "正在搜索数据...",
    start_search: "开始搜索",
    start_search_desc: "输入至少2个字母的姓名或住所即可开始搜索数据。",
    no_data: "未找到数据",
    change_keyword: "请更改您的搜索关键字或检查活动过滤器。"
  },
  id: {
    title: "Mazeeda Squad",
    search_placeholder: "Cari berdasarkan nama atau domisili...",
    category_label: "KATEGORI",
    all: "Semua",
    region_label: "DAERAH SANTRI",
    search_region: "Cari daerah...",
    region_not_found: "Daerah tidak ditemukan",
    reset_filter: "✕ Reset semua filter",
    loading: "Mencari Data...",
    start_search: "Mulai Pencarian",
    start_search_desc: "Ketik minimal 2 huruf nama atau domisili untuk mulai mencari data.",
    no_data: "Tidak ada data ditemukan",
    change_keyword: "Silakan ganti kata kunci pencarian Anda atau periksa filter yang aktif."
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
      if (!data.squad) {
        data.squad = translations[lang];
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      }
    } catch (e) {
      console.log(`Error reading ${file}`);
    }
  }
});

// 2. Patch +page.svelte
const pagePath = path.join(__dirname, 'src/routes/squad/+page.svelte');
let page = fs.readFileSync(pagePath, 'utf8');

// Add import
if (!page.includes("import { t, locale } from 'svelte-i18n';")) {
  page = page.replace(
    "import { onMount, tick, onDestroy } from 'svelte';",
    "import { t, locale } from 'svelte-i18n';\n  import { onMount, tick, onDestroy } from 'svelte';"
  );
}

// Replace texts
page = page.replace(/title="Mazeeda Squad"/g, "title={$t('squad.title') || 'Mazeeda Squad'}");
page = page.replace(/placeholder="Cari berdasarkan nama atau domisili\.\.\."/g, "placeholder={$t('squad.search_placeholder') || 'Cari berdasarkan nama atau domisili...'}");
page = page.replace(
  /<p class="text-\[9px\] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1\.5">Kategori<\/p>/g,
  `<p class="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">{$t('squad.category_label') || 'Kategori'}</p>`
);
page = page.replace(
  /<p class="text-\[9px\] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1\.5">Daerah Santri<\/p>/g,
  `<p class="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">{$t('squad.region_label') || 'Daerah Santri'}</p>`
);
page = page.replace(
  />\{cat\.label\}<\/button>/g,
  `>{cat.value === 'semua' ? ($t('squad.all') || 'Semua') : cat.label}</button>`
);
page = page.replace(/placeholder="Cari daerah\.\.\."/g, "placeholder={$t('squad.search_region') || 'Cari daerah...'}");
page = page.replace(/>Daerah tidak ditemukan</g, ">{$t('squad.region_not_found') || 'Daerah tidak ditemukan'}<");
page = page.replace(/>✕ Reset semua filter</g, ">{$t('squad.reset_filter') || '✕ Reset semua filter'}<");
page = page.replace(/>Mencari Data\.\.\.</g, ">{$t('squad.loading') || 'Mencari Data...'}<");
page = page.replace(/alt="Mulai Pencarian"/g, "alt={$t('squad.start_search') || 'Mulai Pencarian'}");
page = page.replace(/>Mulai Pencarian</g, ">{$t('squad.start_search') || 'Mulai Pencarian'}<");
page = page.replace(/>Ketik minimal 2 huruf nama atau domisili untuk mulai mencari data\.</g, ">{$t('squad.start_search_desc') || 'Ketik minimal 2 huruf nama atau domisili untuk mulai mencari data.'}<");
page = page.replace(/>Tidak ada squad ditemukan</g, ">{$t('squad.no_data') || 'Tidak ada squad ditemukan'}<");
page = page.replace(/>Silakan ganti kata kunci pencarian Anda atau periksa filter yang aktif\.</g, ">{$t('squad.change_keyword') || 'Silakan ganti kata kunci pencarian Anda atau periksa filter yang aktif.'}<");
page = page.replace(/>Mencari\.\.\.</g, ">{$t('squad.loading') || 'Mencari...'}<"); // just in case

// Also handle >Semua< in region dropdown
page = page.replace(
  />\{d === 'semua' \? 'Semua' : d\}<\/button>/g,
  `>{d === 'semua' ? ($t('squad.all') || 'Semua') : d}</button>`
);

fs.writeFileSync(pagePath, page, 'utf8');
console.log("Patched Squad page with i18n!");
