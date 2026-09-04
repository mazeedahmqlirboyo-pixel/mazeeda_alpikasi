const fs = require('fs');
const path = require('path');

const tsFiles = ['en.json', 'ar.json', 'ko.json', 'ja.json', 'zh.json', 'id.json'];
const extraTranslations = {
  en: { target_number: "TARGET NUMBER", save_target: "Save Target", atur_target: "Set Target" },
  ar: { target_number: "رقم الهدف", save_target: "حفظ الهدف", atur_target: "تعيين الهدف" },
  ko: { target_number: "목표 숫자", save_target: "목표 저장", atur_target: "목표 설정" },
  ja: { target_number: "目標の数", save_target: "目標を保存", atur_target: "目標設定" },
  zh: { target_number: "目标数字", save_target: "保存目标", atur_target: "设定目标" },
  id: { target_number: "ANGKA TARGET", save_target: "Simpan Target", atur_target: "Atur Target" }
};

const localesDir = path.join(__dirname, 'src/lib/i18n');

tsFiles.forEach(file => {
  const lang = file.split('.')[0];
  const filePath = path.join(localesDir, file);
  if (fs.existsSync(filePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (data.tasbih) {
        data.tasbih.target_number = extraTranslations[lang].target_number;
        data.tasbih.save_target = extraTranslations[lang].save_target;
        data.tasbih.atur_target = extraTranslations[lang].atur_target;
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      }
    } catch (e) {
      console.log(`Error reading ${file}`);
    }
  }
});

const pagePath = path.join(__dirname, 'src/routes/tasbih/+page.svelte');
let page = fs.readFileSync(pagePath, 'utf8');

// 1. Remove font-mono to fix the slashed zero
page = page.replace(/font-mono/g, "");

// 2. Replace untranslated texts
// "Target / {customTarget}"
page = page.replace(
  /Target \/ \{customTarget\}/g,
  "{$t('tasbih.target') || 'Target'} / {formatNumberDisplay(customTarget)}"
);

// "> Atur Target"
page = page.replace(
  /> Atur Target/g,
  "> {$t('tasbih.atur_target') || 'Atur Target'}"
);

// ">Angka Target<"
page = page.replace(
  />Angka Target</g,
  ">{$t('tasbih.target_number') || 'Angka Target'}<"
);

// "> Simpan Target<"
page = page.replace(
  /> Simpan Target/g,
  "> {$t('tasbih.save_target') || 'Simpan Target'}"
);

fs.writeFileSync(pagePath, page, 'utf8');
console.log("Patched untranslated texts and font-mono!");
