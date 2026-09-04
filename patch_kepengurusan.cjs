const fs = require('fs');
const path = require('path');

const tsFiles = ['en.json', 'ar.json', 'ko.json', 'ja.json', 'zh.json', 'id.json'];
const translations = {
  en: {
    title: "Board of Management",
    dashboard: "Dashboard",
    search_placeholder: "Search board members or roles...",
    filter_tooltip: "Filter Academic Year",
    select_period: "SELECT PERIOD",
    academic_year_short: "A.Y",
    members: "Members",
    other_divisions: "Other Divisions",
    core_board: "Core Daily Board",
    no_data: "No board members found",
    change_keyword: "Please change your search keywords.",
    no_data_for_year: "No board member data for A.Y.",
    profile_not_found: "Detailed profile not found in alumni database."
  },
  ar: {
    title: "الإدارة",
    dashboard: "لوحة القيادة",
    search_placeholder: "ابحث عن عضو أو منصب...",
    filter_tooltip: "تصفية العام الدراسي",
    select_period: "اختر الفترة",
    academic_year_short: "ع.د",
    members: "أعضاء",
    other_divisions: "أقسام أخرى",
    core_board: "الهيئة الإدارية الأساسية",
    no_data: "لم يتم العثور على أعضاء إدارة",
    change_keyword: "يرجى تغيير كلمات البحث الخاصة بك.",
    no_data_for_year: "لا توجد بيانات إدارة للعام الدراسي",
    profile_not_found: "لم يتم العثور على ملف التعريف التفصيلي في قاعدة بيانات الخريجين."
  },
  ko: {
    title: "임원진",
    dashboard: "대시보드",
    search_placeholder: "임원 또는 직책 검색...",
    filter_tooltip: "학년도 필터링",
    select_period: "기간 선택",
    academic_year_short: "학년도",
    members: "명",
    other_divisions: "기타 부서",
    core_board: "핵심 임원진",
    no_data: "임원을 찾을 수 없습니다",
    change_keyword: "검색어를 변경해 주세요.",
    no_data_for_year: "학년도 임원 데이터가 없습니다",
    profile_not_found: "동문 데이터베이스에서 세부 프로필을 찾을 수 없습니다."
  },
  ja: {
    title: "役員",
    dashboard: "ダッシュボード",
    search_placeholder: "役員または役職を検索...",
    filter_tooltip: "学年度を絞り込む",
    select_period: "期間を選択",
    academic_year_short: "年度",
    members: "名",
    other_divisions: "その他の部門",
    core_board: "主要役員",
    no_data: "役員が見つかりません",
    change_keyword: "検索キーワードを変更してください。",
    no_data_for_year: "年度の役員データはありません",
    profile_not_found: "同窓生データベースに詳細プロフィールが見つかりません。"
  },
  zh: {
    title: "管理委员会",
    dashboard: "仪表板",
    search_placeholder: "搜索成员或职位...",
    filter_tooltip: "过滤学年",
    select_period: "选择时期",
    academic_year_short: "学年",
    members: "名成员",
    other_divisions: "其他部门",
    core_board: "核心理事会",
    no_data: "未找到管理人员",
    change_keyword: "请更改您的搜索关键字。",
    no_data_for_year: "没有该学年的管理人员数据",
    profile_not_found: "在校友数据库中未找到详细个人资料。"
  },
  id: {
    title: "Kepengurusan",
    dashboard: "Dashboard",
    search_placeholder: "Cari pengurus atau jabatan...",
    filter_tooltip: "Filter Tahun Ajaran",
    select_period: "PILIH PERIODE",
    academic_year_short: "T.A",
    members: "Anggota",
    other_divisions: "Divisi Lainnya",
    core_board: "Pengurus Harian Inti",
    no_data: "Tidak ada pengurus ditemukan",
    change_keyword: "Silakan ganti kata kunci pencarian Anda.",
    no_data_for_year: "Belum ada data pengurus untuk T.A",
    profile_not_found: "Profil detail tidak ditemukan di database alumni."
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
      if (!data.kepengurusan) {
        data.kepengurusan = translations[lang];
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      }
    } catch (e) {
      console.log(`Error reading ${file}`);
    }
  }
});

// 2. Patch +page.svelte
const pagePath = path.join(__dirname, 'src/routes/kepengurusan/+page.svelte');
let page = fs.readFileSync(pagePath, 'utf8');

// Add import
if (!page.includes("import { t, locale } from 'svelte-i18n';")) {
  page = page.replace(
    "import { fade } from 'svelte/transition';",
    "import { t, locale } from 'svelte-i18n';\n  import { fade } from 'svelte/transition';"
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
if (!page.includes("formatNumberDisplay =")) {
  page = page.replace(
    "  let dropdownContainer: HTMLDivElement;",
    funcCode + "\n  let dropdownContainer: HTMLDivElement;"
  );
}

// Replace texts
page = page.replace(/title="Kepengurusan"/g, "title={$t('kepengurusan.title') || 'Kepengurusan'}");
page = page.replace(/backText="Dashboard"/g, "backText={$t('kepengurusan.dashboard') || 'Dashboard'}");
page = page.replace(/placeholder="Cari pengurus atau jabatan\.\.\."/g, "placeholder={$t('kepengurusan.search_placeholder') || 'Cari pengurus atau jabatan...'}");
page = page.replace(/title="Filter Tahun Ajaran"/g, "title={$t('kepengurusan.filter_tooltip') || 'Filter Tahun Ajaran'}");
page = page.replace(/\n(\s*)PILIH PERIODE\n(\s*)/g, "\n$1{$t('kepengurusan.select_period') || 'PILIH PERIODE'}\n$2");
page = page.replace(/<span>T\.A \{year\}<\/span>/g, "<span>{$t('kepengurusan.academic_year_short') || 'T.A'} {formatNumberDisplay(year)}</span>");
page = page.replace(/\{members\.length\} Anggota/g, "{formatNumberDisplay(members.length.toString())} {$t('kepengurusan.members') || 'Anggota'}");
page = page.replace(/'Divisi Lainnya'/g, "($t('kepengurusan.other_divisions') || 'Divisi Lainnya')");
page = page.replace(/<span>Pengurus Harian Inti<\/span>/g, "<span>{$t('kepengurusan.core_board') || 'Pengurus Harian Inti'}</span>");
page = page.replace(/>Tidak ada pengurus ditemukan</g, ">{$t('kepengurusan.no_data') || 'Tidak ada pengurus ditemukan'}<");
page = page.replace(/'Silakan ganti kata kunci pencarian Anda\.'/g, "($t('kepengurusan.change_keyword') || 'Silakan ganti kata kunci pencarian Anda.')");
page = page.replace(/`Belum ada data pengurus untuk T\.A \$\{activeYear\}\.`/g, "`\\$\\{$t('kepengurusan.no_data_for_year') || 'Belum ada data pengurus untuk T.A'\\} \\$\\{formatNumberDisplay(activeYear)\\}`");
page = page.replace(/alert\('Profil detail tidak ditemukan di database alumni\.'\);/g, "alert($t('kepengurusan.profile_not_found') || 'Profil detail tidak ditemukan di database alumni.');");

fs.writeFileSync(pagePath, page, 'utf8');
console.log("Patched Kepengurusan page with i18n!");
