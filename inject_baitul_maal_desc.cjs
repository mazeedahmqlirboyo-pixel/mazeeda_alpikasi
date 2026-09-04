const fs = require('fs');
const path = require('path');

const translations = {
    id: "Sisa warisan diserahkan ke Baitul Maal karena tidak ada sisa asabah yang mencukupi syarat (tidak ada ahli waris asabah).",
    en: "The remaining inheritance is handed over to Baitul Maal because there are no eligible Asabah heirs.",
    ar: "يُسلم باقي التركة إلى بيت المال لعدم وجود ورثة عصبة مستحقين.",
    zh: "剩余遗产将上交至 Baitul Maal（国库），因为没有符合条件的 Asabah 继承人。",
    ja: "条件を満たすアサバの相続人がいないため、残りの遺産はバイトゥル・マール (国庫) に引き渡されます。",
    ko: "자격을 갖춘 아사바 상속인이 없기 때문에 남은 유산은 바이트 알말(국고)로 넘어갑니다."
};

const langs = Object.keys(translations);
langs.forEach(lang => {
    const jsonPath = path.join(__dirname, `src/lib/i18n/${lang}.json`);
    let data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    if (!data.faraidh) data.faraidh = {};
    if (!data.faraidh.results) data.faraidh.results = {};
    
    data.faraidh.results.baitul_maal_desc = translations[lang];
    
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
});

console.log("Injected Baitul Maal desc to i18n");
