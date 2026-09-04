const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'routes', 'zakat-faraidh', '+page.svelte');
let page = fs.readFileSync(pagePath, 'utf8');

// 1. Replace "Ekor" in Javascript function hitungZakatPeternakan
page = page.replace(/1 Ekor /g, "1 ${$t('zakat.ekor_kapital') || 'Ekor'} ");
page = page.replace(/2 Ekor /g, "2 ${$t('zakat.ekor_kapital') || 'Ekor'} ");
page = page.replace(/3 Ekor /g, "3 ${$t('zakat.ekor_kapital') || 'Ekor'} ");
page = page.replace(/4 Ekor /g, "4 ${$t('zakat.ekor_kapital') || 'Ekor'} ");
page = page.replace(/\${total} Ekor /g, "${total} ${$t('zakat.ekor_kapital') || 'Ekor'} ");
page = page.replace(/\${tabiCount} Ekor /g, "${tabiCount} ${$t('zakat.ekor_kapital') || 'Ekor'} ");
page = page.replace(/\${musinnahCount} Ekor /g, "${musinnahCount} ${$t('zakat.ekor_kapital') || 'Ekor'} ");

// Also replace the kelipatan text:
page = page.replace(
  /\(setiap kelipatan 100 ekor bertambah 1 ekor\)/g,
  "${$t('zakat.kelipatan_100_ekor') || '(setiap kelipatan 100 ekor bertambah 1 ekor)'}"
);

// 2. Replace hardcoded "ekor" in HTML template
page = page.replace(
  />ekor<\/span>/g,
  ">{$t('zakat.ekor') || 'ekor'}</span>"
);

page = page.replace(
  />\{jumlahTernak \|\| 0\} ekor<\/span>/g,
  ">{jumlahTernak || 0} {$t('zakat.ekor') || 'ekor'}</span>"
);

page = page.replace(
  />\{\(jenisTernak === "kambing" \|\| jenisTernak === "domba"\) \? "40" : "30"\} ekor<\/span>/g,
  ">{(jenisTernak === \"kambing\" || jenisTernak === \"domba\") ? \"40\" : \"30\"} {$t('zakat.ekor') || 'ekor'}</span>"
);

// 3. Replace the Estimasi Harga text
// Original: Estimasi Harga Rata-rata per Ekor ({selectedCurrency}) - jika diuangkan
page = page.replace(
  /Estimasi Harga Rata-rata per Ekor \(\{selectedCurrency\}\) - jika diuangkan/g,
  "{$t('zakat.estimasi_harga_per_ekor_prefix') || 'Estimasi Harga Rata-rata per Ekor'} ({selectedCurrency}) - {$t('zakat.jika_diuangkan') || 'jika diuangkan'}"
);

// 4. Replace the "belum mencapai nisab" text
page = page.replace(
  /Jumlah ternak Anda \(\{jumlahTernak \|\| 0\} ekor\) belum mencapai nisab/g,
  "{$t('zakat.jumlah_ternak_belum_nisab') || 'Jumlah ternak Anda'} ({jumlahTernak || 0} {$t('zakat.ekor') || 'ekor'}) {$t('zakat.belum_mencapai_nisab_minimum') || 'belum mencapai nisab'}"
);

fs.writeFileSync(pagePath, page, 'utf8');

// Inject the new translation keys safely
const i18nDir = path.join(__dirname, 'src', 'lib', 'i18n');
const locales = {
  'id.json': `"estimasi_harga_per_ekor_prefix": "Estimasi Harga Rata-rata per Ekor",\n    "jika_diuangkan": "jika diuangkan",\n    "jumlah_ternak_belum_nisab": "Jumlah ternak Anda",\n    "belum_mencapai_nisab_minimum": "belum mencapai nisab minimum",`,
  'en.json': `"estimasi_harga_per_ekor_prefix": "Estimated Average Price per Head",\n    "jika_diuangkan": "if monetized",\n    "jumlah_ternak_belum_nisab": "Your livestock count",\n    "belum_mencapai_nisab_minimum": "has not reached the minimum nisab",`,
  'ar.json': `"estimasi_harga_per_ekor_prefix": "متوسط السعر التقديري لكل رأس",\n    "jika_diuangkan": "إذا تم تسييلها",\n    "jumlah_ternak_belum_nisab": "عدد الماشية لديك",\n    "belum_mencapai_nisab_minimum": "لم يصل إلى الحد الأدنى للنصاب",`,
  'zh.json': `"estimasi_harga_per_ekor_prefix": "每头牲畜的估计平均价格",\n    "jika_diuangkan": "如果变现",\n    "jumlah_ternak_belum_nisab": "您的牲畜数量",\n    "belum_mencapai_nisab_minimum": "尚未达到最低起征点 (Nisab)",`,
  'ja.json': `"estimasi_harga_per_ekor_prefix": "1頭あたりの推定平均価格",\n    "jika_diuangkan": "現金化する場合",\n    "jumlah_ternak_belum_nisab": "あなたの家畜の数",\n    "belum_mencapai_nisab_minimum": "は最低ニサーブに達していません",`,
  'ko.json': `"estimasi_harga_per_ekor_prefix": "마리당 예상 평균 가격",\n    "jika_diuangkan": "현금화할 경우",\n    "jumlah_ternak_belum_nisab": "가축 수",\n    "belum_mencapai_nisab_minimum": "최소 니삽에 도달하지 않았습니다",`
};

for (const [file, keyStr] of Object.entries(locales)) {
  const filePath = path.join(i18nDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    const regex = /("pilih_mata_uang":\s*".*?",)/;
    if (regex.test(content)) {
      content = content.replace(regex, `$1\n    ${keyStr}`);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Injected into ${file}`);
    }
  }
}

console.log('Ekor translations fixed.');
