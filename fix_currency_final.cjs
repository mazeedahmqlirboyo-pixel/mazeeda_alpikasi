const fs = require('fs');
const path = require('path');

// 1. Fix the Svelte UI
const pagePath = path.join(__dirname, 'src', 'routes', 'zakat-faraidh', '+page.svelte');
let page = fs.readFileSync(pagePath, 'utf8');

// Increase width of the dropdown from sm:w-56 to sm:w-64
page = page.replace(
  /<div class="relative w-full sm:w-56 space-y-1.5">/g,
  '<div class="relative w-full sm:w-64 space-y-1.5">'
);

// Add min-w-0 to the flex container so truncate works properly
page = page.replace(
  /<div class="flex items-center gap-2.5">\s*<span class="text-base shrink-0">/g,
  '<div class="flex items-center gap-2.5 min-w-0 pr-2">\n          <span class="text-base shrink-0">'
);

// Fix the fallback in the button since we are injecting translations now
const oldFallback = `*{$t('zakat.ketuk_tombol_mata_uang') === 'zakat.ketuk_tombol_mata_uang' || !$t('zakat.ketuk_tombol_mata_uang') ? 'Ketuk tombol di atas untuk memilih atau mengubah jenis mata uang' : $t('zakat.ketuk_tombol_mata_uang')}`;
const newFallback = `*{$t('zakat.ketuk_tombol_mata_uang')}`;
page = page.replace(oldFallback, newFallback);
page = page.replace(
  /\*\{\$t\('zakat\.ketuk_tombol_mata_uang'\) \|\| 'Ketuk tombol di atas untuk memilih atau mengubah jenis mata uang'\}/g,
  newFallback
); // Just in case the old fallback is still there

fs.writeFileSync(pagePath, page, 'utf8');


// 2. Inject translations
const i18nDir = path.join(__dirname, 'src', 'lib', 'i18n');
const translations = {
  'id.json': '"ketuk_tombol_mata_uang": "Ketuk tombol di atas untuk memilih atau mengubah jenis mata uang",',
  'en.json': '"ketuk_tombol_mata_uang": "Tap the button above to select or change the currency type",',
  'ar.json': '"ketuk_tombol_mata_uang": "اضغط على الزر أعلاه لتحديد أو تغيير نوع العملة",',
  'zh.json': '"ketuk_tombol_mata_uang": "点击上面的按钮选择或更改货币类型",',
  'ja.json': '"ketuk_tombol_mata_uang": "上のボタンをタップして通貨の種類を選択または変更します",',
  'ko.json': '"ketuk_tombol_mata_uang": "위의 버튼을 눌러 통화 유형을 선택하거나 변경하세요",'
};

for (const [file, translationLine] of Object.entries(translations)) {
  const filePath = path.join(i18nDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    // Inject right after pilih_mata_uang
    const regex = /("pilih_mata_uang":\s*".*?",)/;
    if (regex.test(content)) {
      content = content.replace(regex, `$1\n    ${translationLine}`);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${file}`);
    } else {
      console.log(`Could not find pilih_mata_uang in ${file}`);
    }
  }
}

console.log('UI and translations fixed.');
