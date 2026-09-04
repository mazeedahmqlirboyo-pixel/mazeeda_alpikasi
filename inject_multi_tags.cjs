const fs = require('fs');
const file = 'src/routes/zakat-faraidh/+page.svelte';
let s = fs.readFileSync(file, 'utf8');

// Reksadana
const keysReksadana = {
  "Nilai Investasi Reksadana Saat Ini (Rupiah)": "nilai_investasi_reksadana",
  "Nisab Reksa Dana (85 gram Emas)": "nisab_reksadana_emas"
};
for (const [text, key] of Object.entries(keysReksadana)) {
  const safeText = text.replace(/[.*+?^$\/()|[\]\\]/g, '\\$&');
  s = s.replace(new RegExp(`>\\s*${safeText}\\s*<`, 'g'), `>{$t('zakat.${key}') || '${text}'}<`);
}
s = s.replace(
  /Aset reksa dana Anda masih di bawah nishab tahunan\. Anda\s*disarankan mengeluarkan sedekah sukarela\./g,
  `{$t('zakat.info_sedekah_reksadana') || 'Aset reksa dana Anda masih di bawah nishab tahunan. Anda disarankan mengeluarkan sedekah sukarela.'}`
);

// Tambak
const keysTambak = {
  "Total Penjualan Hasil Keuntungan Panen Tambak (Rupiah)": "penjualan_panen_tambak",
  "Biaya Operasional (Pakan, Bibit, Perawatan, Upah) (Rupiah)": "biaya_operasional_tambak",
  "Hutang Jatuh Tempo Usaha Tambak (Rupiah)": "hutang_jatuh_tempo_tambak",
  "Nisab Tambak (85 gram Emas)": "nisab_tambak_emas"
};
for (const [text, key] of Object.entries(keysTambak)) {
  const safeText = text.replace(/[.*+?^$\/()|[\]\\]/g, '\\$&');
  s = s.replace(new RegExp(`>\\s*${safeText}\\s*<`, 'g'), `>{$t('zakat.${key}') || '${text}'}<`);
}
s = s.replace(
  /Aset tambak bersih Anda masih di bawah nishab tahunan\. Anda\s*disarankan mengeluarkan sedekah sukarela\./g,
  `{$t('zakat.info_sedekah_tambak') || 'Aset tambak bersih Anda masih di bawah nishab tahunan. Anda disarankan mengeluarkan sedekah sukarela.'}`
);

// Peternakan
const keysPeternakan = {
  "Jenis Hewan Ternak (dengan Batas Nisab)": "jenis_hewan_ternak_batas",
  "🐐 Kambing": "🐐 {$t('zakat.kambing') || 'Kambing'}",
  "🐑 Domba": "🐑 {$t('zakat.domba') || 'Domba'}",
  "🐂 Sapi": "🐂 {$t('zakat.sapi') || 'Sapi'}",
  "🐃 Kerbau": "🐃 {$t('zakat.kerbau') || 'Kerbau'}",
  "(Nisab: 40)": "{$t('zakat.nisab_40') || '(Nisab: 40)'}",
  "(Nisab: 30)": "{$t('zakat.nisab_30') || '(Nisab: 30)'}",
  "Jumlah Ternak yang Dimiliki (Ekor)": "jumlah_ternak_dimiliki",
  "Estimasi Harga Rata-rata per Ekor (Rupiah) - jika diuangkan": "estimasi_harga_per_ekor",
  "Zakat Wajib (Hewan)": "zakat_wajib_hewan",
  "Mencapai Nisab (Wajib Zakat)": "mencapai_nisab_wajib_zakat",
  "Estimasi Nilai Zakat (Dalam Rupiah)": "estimasi_nilai_zakat_rupiah",
  "Rekomendasi Infaq / Sedekah": "rekomendasi_infaq_sedekah_caps"
};
for (const [text, key] of Object.entries(keysPeternakan)) {
  if (text.includes('Kambing') || text.includes('Domba') || text.includes('Sapi') || text.includes('Kerbau') || text.includes('Nisab:')) {
    // Replace exact text wrapped in span tags for the buttons
    const safeText = text.replace(/[.*+?^$\/()|[\]\\]/g, '\\$&');
    s = s.replace(new RegExp(`>\\s*${safeText}\\s*<`, 'g'), `>${key}<`);
  } else {
    const safeText = text.replace(/[.*+?^$\/()|[\]\\]/g, '\\$&');
    s = s.replace(new RegExp(`>\\s*${safeText}\\s*<`, 'g'), `>{$t('zakat.${key}') || '${text}'}<`);
  }
}

s = s.replace(
  /Tidak ada kewajiban zakat ternak karena jumlah di bawah batas minimum \(nisab\)\./g,
  `{$t('zakat.info_tidak_wajib_ternak') || 'Tidak ada kewajiban zakat ternak karena jumlah di bawah batas minimum (nisab).'}`
);
s = s.replace(
  /Jumlah ternak Anda \(\{formatNumberStr\(jumlahTernak \|\| 0, \$locale\)\} ekor\) belum mencapai nisab\s*minimum \(\{jenisTernak === "kambing" \? "40" : "30"\} ekor\)\./g,
  `{$t('zakat.info_ternak_belum_nishab1') || 'Jumlah ternak Anda ('}{formatNumberStr(jumlahTernak || 0, $locale)} {$t('zakat.ekor') || 'ekor'}{$t('zakat.info_ternak_belum_nishab2') || ') belum mencapai nisab minimum ('}{formatNumberStr(jenisTernak === "kambing" || jenisTernak === "domba" ? 40 : 30, $locale)} {$t('zakat.ekor') || 'ekor'}).`
);

// Replace trailing 'ekor'
s = s.replace(/>ekor<\/span>/g, `>{$t('zakat.ekor') || 'ekor'}</span>`);
s = s.replace(/\} ekor<\/span>/g, `} {$t('zakat.ekor') || 'ekor'}</span>`);
s = s.replace(/"40" : "30"\} ekor<\/span>/g, `40 : 30, $locale)} {$t('zakat.ekor') || 'ekor'}</span>`);
s = s.replace(/"40" : "30"\} ekor\)/g, `40 : 30, $locale)} {$t('zakat.ekor') || 'ekor'})`);
s = s.replace(/\} ekor<\/p>/g, `} {$t('zakat.ekor') || 'ekor'}</p>`);
s = s.replace(/ekor zakat/g, `{$t('zakat.ekor') || 'ekor'} {$t('zakat.zakat') || 'zakat'}`);
s = s.replace(/\/ ekor =/g, `/ {$t('zakat.ekor') || 'ekor'} =`);
// Oh wait, in template it is: `(Nisab: {(jenisTernak === "kambing" || jenisTernak === "domba") ? "40" : "30"} ekor)`
// Let's replace the whole string for Nisab detail (line 4187)
s = s.replace(
  /\(Nisab: \{\(jenisTernak === "kambing" \|\| jenisTernak === "domba"\) \? "40" : "30"\} ekor\)/g,
  `(Nisab: {formatNumberStr((jenisTernak === "kambing" || jenisTernak === "domba") ? 40 : 30, $locale)} {$t('zakat.ekor') || 'ekor'})`
);
// And in the result table:
s = s.replace(
  /\{\(jenisTernak === "kambing" \|\| jenisTernak === "domba"\) \? "40" : "30"\} ekor<\/span>/g,
  `{formatNumberStr((jenisTernak === "kambing" || jenisTernak === "domba") ? 40 : 30, $locale)} {$t('zakat.ekor') || 'ekor'}</span>`
);
// Make sure line 4234 doesn't get messed up. It is handled by the big regex above.

fs.writeFileSync(file, s);
console.log('Template tags injected for Reksadana, Tambak, Peternakan text.');

// Locales
const path = require('path');
const localesDir = path.join('src', 'lib', 'i18n');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const translations = {
  // Reksadana
  nilai_investasi_reksadana: { id: "Nilai Investasi Reksadana Saat Ini (Rupiah)", en: "Current Mutual Fund Investment Value (Rupiah)", ar: "قيمة استثمار صندوق الاستثمار الحالية (روبية)", zh: "当前共同基金投资价值（印尼盾）", ja: "現在の投資信託投資額 (ルピア)", ko: "현재 뮤추얼 펀드 투자 가치 (루피아)" },
  nisab_reksadana_emas: { id: "Nisab Reksa Dana (85 gram Emas)", en: "Mutual Fund Nisab (85 grams Gold)", ar: "نصاب صندوق الاستثمار (85 جرام ذهب)", zh: "共同基金起征点（85克黄金）", ja: "投資信託のニサーブ (85グラムの金)", ko: "뮤추얼 펀드 니삽 (금 85그램)" },
  info_sedekah_reksadana: { id: "Aset reksa dana Anda masih di bawah nishab tahunan. Anda disarankan mengeluarkan sedekah sukarela.", en: "Your mutual fund assets are still below the annual nisab. You are recommended to give voluntary charity.", ar: "أصول صندوق الاستثمار الخاصة بك لا تزال أقل من النصاب السنوي. يوصى بإخراج صدقة تطوعية.", zh: "您的共同基金资产仍低于年度起征点。建议您进行自愿捐赠。", ja: "投資信託資産はまだ年間のニサーブを下回っています。任意の寄付（サダカ）が推奨されます。", ko: "귀하의 뮤추얼 펀드 자산은 아직 연간 니삽 미만입니다. 자발적인 기부를 권장합니다." },

  // Tambak
  penjualan_panen_tambak: { id: "Total Penjualan Hasil Keuntungan Panen Tambak (Rupiah)", en: "Total Sales of Fishery Harvest Profit (Rupiah)", ar: "إجمالي مبيعات أرباح حصاد المزارع السمكية (روبية)", zh: "渔业收获利润总销售额（印尼盾）", ja: "養殖場の収穫利益の総売上 (ルピア)", ko: "양식장 수확 이익의 총 매출 (루피아)" },
  biaya_operasional_tambak: { id: "Biaya Operasional (Pakan, Bibit, Perawatan, Upah) (Rupiah)", en: "Operational Costs (Feed, Seeds, Maintenance, Wages) (Rupiah)", ar: "تكاليف التشغيل (العلف، البذور، الصيانة، الأجور) (روبية)", zh: "运营成本（饲料、种苗、维护、工资）（印尼盾）", ja: "運営コスト (飼料、種苗、メンテナンス、賃金) (ルピア)", ko: "운영 비용 (사료, 종자, 유지보수, 임금) (루피아)" },
  hutang_jatuh_tempo_tambak: { id: "Hutang Jatuh Tempo Usaha Tambak (Rupiah)", en: "Due Debt for Fishery Business (Rupiah)", ar: "الديون المستحقة لأعمال المزارع السمكية (روبية)", zh: "渔业业务到期债务（印尼盾）", ja: "養殖事業の支払期日到来債務 (ルピア)", ko: "양식 사업의 만기 부채 (루피아)" },
  nisab_tambak_emas: { id: "Nisab Tambak (85 gram Emas)", en: "Fishery Nisab (85 grams Gold)", ar: "نصاب المزارع السمكية (85 جرام ذهب)", zh: "渔业起征点（85克黄金）", ja: "養殖場のニサーブ (85グラムの金)", ko: "양식장 니삽 (금 85그램)" },
  info_sedekah_tambak: { id: "Aset tambak bersih Anda masih di bawah nishab tahunan. Anda disarankan mengeluarkan sedekah sukarela.", en: "Your net fishery assets are still below the annual nisab. You are recommended to give voluntary charity.", ar: "أصول مزارعك السمكية الصافية لا تزال أقل من النصاب السنوي. يوصى بإخراج صدقة تطوعية.", zh: "您的净渔业资产仍低于年度起征点。建议您进行自愿捐赠。", ja: "養殖場の純資産はまだ年間のニサーブを下回っています。任意の寄付（サダカ）が推奨されます。", ko: "귀하의 순 양식장 자산은 아직 연간 니삽 미만입니다. 자발적인 기부를 권장합니다." },

  // Peternakan
  jenis_hewan_ternak_batas: { id: "Jenis Hewan Ternak (dengan Batas Nisab)", en: "Livestock Type (with Nisab Limit)", ar: "نوع الماشية (مع حد النصاب)", zh: "牲畜类型（含起征点限制）", ja: "家畜の種類 (ニサーブ限度付き)", ko: "가축 종류 (니삽 한도 포함)" },
  kambing: { id: "Kambing", en: "Goat", ar: "ماعز", zh: "山羊", ja: "ヤギ", ko: "염소" },
  domba: { id: "Domba", en: "Sheep", ar: "ضأن", zh: "绵羊", ja: "羊", ko: "양" },
  sapi: { id: "Sapi", en: "Cow", ar: "بقر", zh: "牛", ja: "牛", ko: "소" },
  kerbau: { id: "Kerbau", en: "Buffalo", ar: "جاموس", zh: "水牛", ja: "水牛", ko: "물소" },
  nisab_40: { id: "(Nisab: 40)", en: "(Nisab: 40)", ar: "(النصاب: 40)", zh: "(起征点: 40)", ja: "(ニサーブ: 40)", ko: "(니삽: 40)" },
  nisab_30: { id: "(Nisab: 30)", en: "(Nisab: 30)", ar: "(النصاب: 30)", zh: "(起征点: 30)", ja: "(ニサーブ: 30)", ko: "(니삽: 30)" },
  jumlah_ternak_dimiliki: { id: "Jumlah Ternak yang Dimiliki (Ekor)", en: "Number of Livestock Owned (Head)", ar: "عدد الماشية المملوكة (رأس)", zh: "拥有的牲畜数量（头）", ja: "所有家畜数 (頭)", ko: "소유한 가축 수 (마리)" },
  estimasi_harga_per_ekor: { id: "Estimasi Harga Rata-rata per Ekor (Rupiah) - jika diuangkan", en: "Estimated Average Price per Head (Rupiah) - if monetized", ar: "متوسط السعر التقديري لكل رأس (روبية) - إذا تم تسييلها", zh: "每头估计平均价格（印尼盾）- 若折现", ja: "1頭あたりの推定平均価格 (ルピア) - 換金する場合", ko: "마리당 예상 평균 가격 (루피아) - 현금화 시" },
  zakat_wajib_hewan: { id: "Zakat Wajib (Hewan)", en: "Mandatory Zakat (Animal)", ar: "الزكاة الواجبة (حيوان)", zh: "必须缴纳的天课（动物）", ja: "必須のザカート (動物)", ko: "의무 자카트 (동물)" },
  mencapai_nisab_wajib_zakat: { id: "Mencapai Nisab (Wajib Zakat)", en: "Reached Nisab (Mandatory Zakat)", ar: "بلغ النصاب (زكاة واجبة)", zh: "达到起征点（必须缴纳天课）", ja: "ニサーブ達成 (ザカート義務)", ko: "니삽 도달 (자카트 의무)" },
  estimasi_nilai_zakat_rupiah: { id: "Estimasi Nilai Zakat (Dalam Rupiah)", en: "Estimated Zakat Value (In Rupiah)", ar: "القيمة التقديرية للزكاة (بالروبية)", zh: "估计天课价值（印尼盾）", ja: "推定ザカート額 (ルピア)", ko: "예상 자카트 가치 (루피아)" },
  rekomendasi_infaq_sedekah_caps: { id: "Rekomendasi Infaq / Sedekah", en: "Infaq / Charity Recommendation", ar: "توصية الإنفاق / الصدقة", zh: "推荐Infaq / Sedekah", ja: "推奨されるインファク / サダカ", ko: "인파크 / 사다카 권장" },
  ekor: { id: "ekor", en: "head", ar: "رأس", zh: "头", ja: "頭", ko: "마리" },
  info_tidak_wajib_ternak: { id: "Tidak ada kewajiban zakat ternak karena jumlah di bawah batas minimum (nisab).", en: "There is no livestock zakat obligation because the number is below the minimum limit (nisab).", ar: "لا توجد زكاة على الماشية لأن العدد أقل من الحد الأدنى (النصاب).", zh: "由于数量低于最低限额（起征点），因此无需缴纳牲畜天课。", ja: "数が最低限度（ニサーブ）を下回っているため、家畜のザカート義務はありません。", ko: "가축 수가 최소 한도(니삽) 미만이므로 가축 자카트 의무가 없습니다." },
  info_ternak_belum_nishab1: { id: "Jumlah ternak Anda (", en: "Your number of livestock (", ar: "عدد الماشية الخاص بك (", zh: "您的牲畜数量（", ja: "あなたの家畜の数 (", ko: "귀하의 가축 수 (" },
  info_ternak_belum_nishab2: { id: ") belum mencapai nisab minimum (", en: ") has not reached the minimum nisab (", ar: ") لم يصل إلى الحد الأدنى للنصاب (", zh: "）尚未达到最低起征点（", ja: ") は最低ニサーブに達していません (", ko: ")가 아직 최소 니삽에 도달하지 않았습니다 (" }
};

const idArabic = ["٠","١","٢","٣","٤","٥","٦","٧","٨","٩"];
function convertNumbersToArabic(obj) {
  for (let key in obj) {
    if (typeof obj[key] === 'string') {
      obj[key] = obj[key].replace(/[0-9]/g, w => idArabic[w]);
    } else if (typeof obj[key] === 'object') {
      convertNumbersToArabic(obj[key]);
    }
  }
}

for (const f of files) {
  const lang = f.split('.')[0];
  const p = path.join(localesDir, f);
  let data = JSON.parse(fs.readFileSync(p, 'utf8'));
  
  data.zakat = data.zakat || {};
  let newMap = {};
  for (const [key, tmap] of Object.entries(translations)) {
    if (tmap[lang]) {
      newMap[key] = tmap[lang];
    } else if (lang === 'en') {
      newMap[key] = tmap.en;
    }
  }

  if (lang === 'ar') {
    convertNumbersToArabic(newMap);
  }

  data.zakat = { ...data.zakat, ...newMap };
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
}

console.log('JSON locales updated for Reksadana, Tambak, Peternakan.');
