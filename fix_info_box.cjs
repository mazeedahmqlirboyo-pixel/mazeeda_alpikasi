const fs = require('fs');
const path = require('path');

// 1. Fix the Svelte UI Dark Mode and Bindings
const pagePath = path.join(__dirname, 'src', 'routes', 'zakat-faraidh', '+page.svelte');
let page = fs.readFileSync(pagePath, 'utf8');

// Replace the specific info box div
const oldInfoBoxHTML = `<div
            in:slide={{ duration: 200 }}
            out:slide={{ duration: 150 }}
            class="bg-emerald-50/40 border border-emerald-100/50 rounded-xl p-3.5 text-xs text-slate-650 space-y-3 leading-relaxed text-justify"
          >
            <div>
              <h4
                class="font-bold text-slate-800 dark:text-slate-100 uppercase text-[10px] mb-1 tracking-wider"
              >
                Ketentuan Utama
              </h4>
              <ul class="list-disc pl-4.5 space-y-1">
                <li>
                  <strong>{$t('zakat.nisab_batas_minimum') || 'Nisab (Batas Minimum):'}</strong> Setara dengan nilai 85
                  gram emas per tahun (atau 1/12 dari 85 gram emas per bulannya).
                </li>
                <li>
                  <strong>{$t('zakat.kadar_zakat') || 'Kadar Zakat:'}</strong> 2,5% dari total pendapatan bersih.
                </li>
                <li>
                  <strong>{$t('zakat.waktu_pembayaran') || 'Waktu Pembayaran:'}</strong> Bisa ditunaikan setiap bulan
                  saat menerima gaji/penghasilan atau secara tahunan.
                </li>
              </ul>
            </div>
            <div class="border-t border-emerald-100/30 pt-2.5">
              <h4
                class="font-bold text-slate-800 dark:text-slate-100 uppercase text-[10px] mb-1 tracking-wider"
              >
                Cara Menghitung (3 Langkah Mudah)
              </h4>
              <ul class="list-decimal pl-4.5 space-y-1">
                <li>
                  <strong>{$t('zakat.hitung_total_pendapatan') || 'Hitung Total Pendapatan:'}</strong> Jumlahkan gaji bulanan
                  dan bonus/pendapatan lain.
                </li>
                <li>
                  <strong>{$t('zakat.kurangi_pengeluaran_pokok') || 'Kurangi Pengeluaran Pokok (Opsional):'}</strong> Sebagian
                  ulama memperbolehkan mengurangkan kebutuhan pokok (sandang, pangan,
                  papan, hutang jatuh tempo) terlebih dahulu.
                </li>
                <li>
                  <strong>{$t('zakat.hitung_zakatnya') || 'Hitung Zakatnya:'}</strong> Jika sisa pendapatan bulanan
                  mencapai nisab bulanan, kalikan sisa tersebut dengan 2,5%.
                </li>
              </ul>
            </div>
            <div class="border-t border-emerald-100/30 pt-2.5">
              <span
                class="font-bold text-slate-800 dark:text-slate-100 uppercase text-[10px] block mb-1 tracking-wider"
                >{$t('zakat.rumus') || 'Rumus:'}</span
              >
              <div
                class="bg-white border border-emerald-100 rounded-xl p-2.5 text-center font-black text-emerald-700 font-mono text-xs"
              >
                Zakat Penghasilan = Pendapatan Kena Zakat &times; 2,5%
              </div>
            </div>
            <p
              class="text-[10px] text-slate-400 dark:text-slate-500 mt-1 border-t border-emerald-100/30 pt-1.5 italic"
            >
              (Sumber: Al Qur'an Surah Al Baqarah ayat 267, Peraturan Menteri
              Agama Nomor 31 Tahun 2019, Fatwa MUI Nomor 3 Tahun 2003, dan
              pendapat Shaikh Yusuf Qardawi).
            </p>
          </div>`;

const newInfoBoxHTML = `<div
            in:slide={{ duration: 200 }}
            out:slide={{ duration: 150 }}
            class="bg-emerald-50/40 dark:bg-slate-800/50 border border-emerald-100/50 dark:border-emerald-900/30 rounded-xl p-3.5 text-xs text-slate-650 dark:text-slate-300 space-y-3 leading-relaxed text-justify"
          >
            <div>
              <h4
                class="font-bold text-slate-800 dark:text-slate-100 uppercase text-[10px] mb-1 tracking-wider"
              >
                {$t('zakat.ketentuan_utama') || 'Ketentuan Utama'}
              </h4>
              <ul class="list-disc pl-4.5 space-y-1">
                <li>
                  <strong>{$t('zakat.nisab_batas_minimum') || 'Nisab (Batas Minimum):'}</strong> {$t('zakat.penjelasan_nisab_penghasilan') || 'Setara dengan nilai 85 gram emas per tahun (atau 1/12 dari 85 gram emas per bulannya).'}
                </li>
                <li>
                  <strong>{$t('zakat.kadar_zakat') || 'Kadar Zakat:'}</strong> {$t('zakat.penjelasan_kadar_penghasilan') || '2,5% dari total pendapatan bersih.'}
                </li>
                <li>
                  <strong>{$t('zakat.waktu_pembayaran') || 'Waktu Pembayaran:'}</strong> {$t('zakat.penjelasan_waktu_penghasilan') || 'Bisa ditunaikan setiap bulan saat menerima gaji/penghasilan atau secara tahunan.'}
                </li>
              </ul>
            </div>
            <div class="border-t border-emerald-100/30 dark:border-slate-700/50 pt-2.5">
              <h4
                class="font-bold text-slate-800 dark:text-slate-100 uppercase text-[10px] mb-1 tracking-wider"
              >
                {$t('zakat.cara_menghitung') || 'Cara Menghitung (3 Langkah Mudah)'}
              </h4>
              <ul class="list-decimal pl-4.5 space-y-1">
                <li>
                  <strong>{$t('zakat.hitung_total_pendapatan') || 'Hitung Total Pendapatan:'}</strong> {$t('zakat.penjelasan_hitung_total') || 'Jumlahkan gaji bulanan dan bonus/pendapatan lain.'}
                </li>
                <li>
                  <strong>{$t('zakat.kurangi_pengeluaran_pokok') || 'Kurangi Pengeluaran Pokok (Opsional):'}</strong> {$t('zakat.penjelasan_kurangi_pokok') || 'Sebagian ulama memperbolehkan mengurangkan kebutuhan pokok (sandang, pangan, papan, hutang jatuh tempo) terlebih dahulu.'}
                </li>
                <li>
                  <strong>{$t('zakat.hitung_zakatnya') || 'Hitung Zakatnya:'}</strong> {$t('zakat.penjelasan_hitung_zakatnya') || 'Jika sisa pendapatan bulanan mencapai nisab bulanan, kalikan sisa tersebut dengan 2,5%.'}
                </li>
              </ul>
            </div>
            <div class="border-t border-emerald-100/30 dark:border-slate-700/50 pt-2.5">
              <span
                class="font-bold text-slate-800 dark:text-slate-100 uppercase text-[10px] block mb-1 tracking-wider"
                >{$t('zakat.rumus') || 'Rumus:'}</span
              >
              <div
                class="bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-700 rounded-xl p-2.5 text-center font-black text-emerald-700 dark:text-emerald-400 font-mono text-xs shadow-inner"
              >
                Zakat Penghasilan = Pendapatan Kena Zakat &times; 2,5%
              </div>
            </div>
            <p
              class="text-[10px] text-slate-400 dark:text-slate-500 mt-1 border-t border-emerald-100/30 dark:border-slate-700/50 pt-1.5 italic"
            >
              {$t('zakat.sumber_penghasilan') || '(Sumber: Al Qur\\'an Surah Al Baqarah ayat 267, Peraturan Menteri Agama Nomor 31 Tahun 2019, Fatwa MUI Nomor 3 Tahun 2003, dan pendapat Shaikh Yusuf Qardawi).'}
            </p>
          </div>`;

page = page.replace(oldInfoBoxHTML, newInfoBoxHTML);
fs.writeFileSync(pagePath, page, 'utf8');


// 2. Inject translations
const i18nDir = path.join(__dirname, 'src', 'lib', 'i18n');

const idKeys = [
  `"ketentuan_utama": "Ketentuan Utama",`,
  `"penjelasan_nisab_penghasilan": "Setara dengan nilai 85 gram emas per tahun (atau 1/12 dari 85 gram emas per bulannya).",`,
  `"penjelasan_kadar_penghasilan": "2,5% dari total pendapatan bersih.",`,
  `"penjelasan_waktu_penghasilan": "Bisa ditunaikan setiap bulan saat menerima gaji/penghasilan atau secara tahunan.",`,
  `"cara_menghitung": "Cara Menghitung (3 Langkah Mudah)",`,
  `"penjelasan_hitung_total": "Jumlahkan gaji bulanan dan bonus/pendapatan lain.",`,
  `"penjelasan_kurangi_pokok": "Sebagian ulama memperbolehkan mengurangkan kebutuhan pokok (sandang, pangan, papan, hutang jatuh tempo) terlebih dahulu.",`,
  `"penjelasan_hitung_zakatnya": "Jika sisa pendapatan bulanan mencapai nisab bulanan, kalikan sisa tersebut dengan 2,5%.",`,
  `"sumber_penghasilan": "(Sumber: Al Qur'an Surah Al Baqarah ayat 267, Peraturan Menteri Agama Nomor 31 Tahun 2019, Fatwa MUI Nomor 3 Tahun 2003, dan pendapat Shaikh Yusuf Qardawi).",`
];

const enKeys = [
  `"ketentuan_utama": "Main Provisions",`,
  `"penjelasan_nisab_penghasilan": "Equivalent to the value of 85 grams of gold per year (or 1/12 of 85 grams of gold per month).",`,
  `"penjelasan_kadar_penghasilan": "2.5% of total net income.",`,
  `"penjelasan_waktu_penghasilan": "Can be paid monthly upon receiving salary/income or annually.",`,
  `"cara_menghitung": "How to Calculate (3 Easy Steps)",`,
  `"penjelasan_hitung_total": "Add up monthly salary and other bonuses/income.",`,
  `"penjelasan_kurangi_pokok": "Some scholars allow deducting basic needs (clothing, food, shelter, due debts) first.",`,
  `"penjelasan_hitung_zakatnya": "If the remaining monthly income reaches the monthly nisab, multiply the remainder by 2.5%.",`,
  `"sumber_penghasilan": "(Source: Al Qur'an Surah Al Baqarah verse 267, Minister of Religion Regulation No. 31 of 2019, MUI Fatwa No. 3 of 2003, and the opinion of Shaikh Yusuf Qardawi).",`
];

const arKeys = [
  `"ketentuan_utama": "الأحكام الرئيسية",`,
  `"penjelasan_nisab_penghasilan": "يعادل قيمة 85 جرامًا من الذهب سنويًا (أو 1/12 من 85 جرامًا من الذهب شهريًا).",`,
  `"penjelasan_kadar_penghasilan": "2.5% من إجمالي الدخل الصافي.",`,
  `"penjelasan_waktu_penghasilan": "يمكن دفعها شهريًا عند استلام الراتب/الدخل أو سنويًا.",`,
  `"cara_menghitung": "كيفية الحساب (3 خطوات سهلة)",`,
  `"penjelasan_hitung_total": "اجمع الراتب الشهري والمكافآت/الدخل الآخر.",`,
  `"penjelasan_kurangi_pokok": "يسمح بعض العلماء بخصم الاحتياجات الأساسية (الملبس، المأكل، المسكن، الديون المستحقة) أولاً.",`,
  `"penjelasan_hitung_zakatnya": "إذا وصل الدخل الشهري المتبقي إلى النصاب الشهري، اضرب الباقي في 2.5%.",`,
  `"sumber_penghasilan": "(المصدر: القرآن الكريم سورة البقرة الآية 267، لائحة وزير الشؤون الدينية رقم 31 لسنة 2019، فتوى مجلس علماء إندونيسيا رقم 3 لسنة 2003، ورأي الشيخ يوسف القرضاوي).",`
];

const zhKeys = [
  `"ketentuan_utama": "主要规定",`,
  `"penjelasan_nisab_penghasilan": "相当于每年 85 克黄金的价值（或每月 85 克黄金的 1/12）。",`,
  `"penjelasan_kadar_penghasilan": "净总收入的 2.5%。",`,
  `"penjelasan_waktu_penghasilan": "可以在每月收到工资/收入时或每年支付。",`,
  `"cara_menghitung": "如何计算（3 个简单步骤）",`,
  `"penjelasan_hitung_total": "将月薪和其他奖金/收入相加。",`,
  `"penjelasan_kurangi_pokok": "一些学者允许先扣除基本需求（衣、食、住、到期债务）。",`,
  `"penjelasan_hitung_zakatnya": "如果剩余的月收入达到每月的起征点（Nisab），将剩余部分乘以 2.5%。",`,
  `"sumber_penghasilan": "（来源：《古兰经》黄牛章第267节，2019年第31号宗教部长条例，2003年第3号印尼乌理玛委员会教令，以及谢赫·尤素福·卡拉达维的意见）。",`
];

const jaKeys = [
  `"ketentuan_utama": "主な規定",`,
  `"penjelasan_nisab_penghasilan": "年間85グラムの金の価値に相当（または月間85グラムの金の1/12）。",`,
  `"penjelasan_kadar_penghasilan": "純総収入の2.5％。",`,
  `"penjelasan_waktu_penghasilan": "給与/収入を受け取った月に毎月、または毎年支払うことができます。",`,
  `"cara_menghitung": "計算方法（3つの簡単なステップ）",`,
  `"penjelasan_hitung_total": "月給とその他のボーナス/収入を合計します。",`,
  `"penjelasan_kurangi_pokok": "一部の学者は、最初に基本要件（衣食住、期限の到来した借金）を差し引くことを許可しています。",`,
  `"penjelasan_hitung_zakatnya": "残りの月収が月間のニサーブに達した場合は、残りの金額に2.5％を掛けます。",`,
  `"sumber_penghasilan": "（出典：コーラン雌牛章267節、2019年宗教大臣規則第31号、2003年インドネシア・ウラマー評議会ファトワ第3号、およびシャイフ・ユスフ・アル＝カラダウィの見解）。",`
];

const koKeys = [
  `"ketentuan_utama": "주요 규정",`,
  `"penjelasan_nisab_penghasilan": "연간 85g의 금 가치와 동일(또는 월간 85g 금의 1/12).",`,
  `"penjelasan_kadar_penghasilan": "총 순이익의 2.5%.",`,
  `"penjelasan_waktu_penghasilan": "급여/소득을 받을 때 매월 또는 매년 지불할 수 있습니다.",`,
  `"cara_menghitung": "계산 방법 (3가지 쉬운 단계)",`,
  `"penjelasan_hitung_total": "월급과 기타 보너스/소득을 합산합니다.",`,
  `"penjelasan_kurangi_pokok": "일부 학자들은 기본 요구 사항(의식주, 기한이 된 빚)을 먼저 공제하는 것을 허용합니다.",`,
  `"penjelasan_hitung_zakatnya": "남은 월 소득이 월간 니삽에 도달하면 남은 금액에 2.5%를 곱합니다.",`,
  `"sumber_penghasilan": "(출처: 꾸란 알 바카라 267절, 2019년 종교부 장관 규정 제31호, 2003년 인도네시아 울라마 협의회 파트와 제3호, 셰이크 유수프 알 카라다위의 견해).",`
];

const locales = {
  'id.json': idKeys,
  'en.json': enKeys,
  'ar.json': arKeys,
  'zh.json': zhKeys,
  'ja.json': jaKeys,
  'ko.json': koKeys
};

for (const [file, keysArray] of Object.entries(locales)) {
  const filePath = path.join(i18nDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    const regex = /("pilih_mata_uang":\s*".*?",)/;
    if (regex.test(content)) {
      const injectionStr = keysArray.map(k => `    ${k}`).join('\\n');
      content = content.replace(regex, `$1\\n${injectionStr}`);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Injected keys into ${file}`);
    }
  }
}

console.log('Done!');
