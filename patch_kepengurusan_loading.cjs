const fs = require('fs');
const path = require('path');

const tsFiles = ['en.json', 'ar.json', 'ko.json', 'ja.json', 'zh.json', 'id.json'];
const translations = {
  en: { loading: "Loading Board Data..." },
  ar: { loading: "جاري تحميل بيانات الإدارة..." },
  ko: { loading: "임원 데이터 불러오는 중..." },
  ja: { loading: "役員データを読み込み中..." },
  zh: { loading: "正在加载管理人员数据..." },
  id: { loading: "Memuat Data Kepengurusan..." }
};

const localesDir = path.join(__dirname, 'src/lib/i18n');

tsFiles.forEach(file => {
  const lang = file.split('.')[0];
  const filePath = path.join(localesDir, file);
  if (fs.existsSync(filePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (data.kepengurusan) {
        Object.assign(data.kepengurusan, translations[lang]);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      }
    } catch (e) {
      console.log(`Error reading ${file}`);
    }
  }
});

console.log("Added loading translation to JSON files!");
