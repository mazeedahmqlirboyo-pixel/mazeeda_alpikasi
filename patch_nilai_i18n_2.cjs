const fs = require('fs');
const path = require('path');

const localesPath = path.join(__dirname, 'src/lib/i18n');
const files = ['id.json', 'en.json', 'ar.json', 'ja.json', 'ko.json', 'zh.json'];

const additionalTranslations = {
  'id.json': {
    "searching": "Mencari data...",
    "empty_not_found": "Tidak ditemukan santri dengan nama",
    "students_found": "santri ditemukan"
  },
  'en.json': {
    "searching": "Searching data...",
    "empty_not_found": "No student found with name",
    "students_found": "students found"
  },
  'ar.json': {
    "searching": "جاري البحث...",
    "empty_not_found": "لم يتم العثور على طالب باسم",
    "students_found": "طالب تم العثور عليهم"
  },
  'ja.json': {
    "searching": "データを検索中...",
    "empty_not_found": "名前が一致する生徒は見つかりません",
    "students_found": "人の生徒が見つかりました"
  },
  'ko.json': {
    "searching": "데이터 검색 중...",
    "empty_not_found": "이름과 일치하는 학생을 찾을 수 없습니다:",
    "students_found": "명의 학생을 찾았습니다"
  },
  'zh.json': {
    "searching": "正在搜索数据...",
    "empty_not_found": "未找到名为以下的学生",
    "students_found": "名学生被找到"
  }
};

files.forEach(file => {
  const filePath = path.join(localesPath, file);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (data.nilai) {
      data.nilai = { ...data.nilai, ...additionalTranslations[file] };
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    }
  }
});

// Now patch the +page.svelte file
const sveltePath = path.join(__dirname, 'src/routes/nilai/+page.svelte');
let content = fs.readFileSync(sveltePath, 'utf8');

content = content.replace(
  'Mencari data...',
  '{$t("nilai.searching") || "Mencari data..."}'
);

content = content.replace(
  'Tidak ditemukan santri dengan nama',
  '{$t("nilai.empty_not_found") || "Tidak ditemukan santri dengan nama"}'
);

content = content.replace(
  '{searchResults.length} santri ditemukan',
  '{searchResults.length} {$t("nilai.students_found") || "santri ditemukan"}'
);

fs.writeFileSync(sveltePath, content, 'utf8');
console.log('Nilai patch 2 complete.');
