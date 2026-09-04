const fs = require('fs');
const path = require('path');

const localesDir = path.join('src', 'lib', 'i18n');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const translations = {
  aset_maal_kekayaan: { id: "ASET MAAL (KEKAYAAN)", en: "MAAL ASSETS (WEALTH)", ar: "أصول المال (الثروة)", zh: "天课资产（财富）", ja: "マール資産 (富)", ko: "마알 자산 (부)" },
  emas_logam_mulia_gram: { id: "Emas / Logam Mulia (gram)", en: "Gold / Precious Metals (gram)", ar: "الذهب / المعادن الثمينة (جرام)", zh: "黄金/贵金属（克）", ja: "金 / 貴金属 (グラム)", ko: "금 / 귀금속 (그램)" },
  perak_gram: { id: "Perak (gram)", en: "Silver (gram)", ar: "الفضة (جرام)", zh: "白银（克）", ja: "銀 (グラム)", ko: "은 (그램)" },
  estimasi_nilai: { id: "Estimasi Nilai:", en: "Estimated Value:", ar: "القيمة المقدرة:", zh: "估计价值：", ja: "推定価値：", ko: "예상 가치:" },
  piutang_lancar: { id: "Piutang Lancar (Uang dipinjamkan yang pasti tertagih)", en: "Current Receivables (Lent money definitely collectible)", ar: "الذمم المدينة المتداولة (أموال مقرضة محصلة بالتأكيد)", zh: "流动应收账款（肯定可收回的借出款项）", ja: "流動債権 (確実に回収可能な貸付金)", ko: "유동 수취 채권 (확실히 회수 가능한 대여금)" },
  kewajiban_hutang_jatuh_tempo: { id: "Kewajiban / Hutang Jatuh Tempo (Dapat dikurangi)", en: "Liabilities / Maturing Debt (Deductible)", ar: "الالتزامات / الديون المستحقة (قابلة للخصم)", zh: "负债/到期债务（可扣除）", ja: "負債 / 満期負債 (控除可能)", ko: "부채 / 만기 부채 (공제 가능)" },
  deductions_hutang: { id: "Deductions (Hutang)", en: "Deductions (Debt)", ar: "الخصومات (الديون)", zh: "扣除额（债务）", ja: "控除額 (負債)", ko: "공제 (부채)" },
  harta_bersih_terkena_haul: { id: "Harta Bersih (Terkena Haul)", en: "Net Wealth (Subject to Haul)", ar: "الثروة الصافية (تخضع للحول)", zh: "净财富（受满一年的限制）", ja: "純資産 (ハウル対象)", ko: "순 자산 (하울 대상)" },
  nisab_zakat_maal_tahunan: { id: "Nisab Zakat Maal Tahunan (85g Emas)", en: "Annual Maal Zakat Nisab (85g Gold)", ar: "نصاب زكاة المال السنوي (85 جرام ذهب)", zh: "年度天课起征点（85克黄金）", ja: "年間マールザカートのニサーブ (85g 金)", ko: "연간 마알 자카트 니삽 (85g 금)" },
  gram_satuan: { id: "gram", en: "gram", ar: "جرام", zh: "克", ja: "グラム", ko: "그램" },
  nisab_batas_minimum: { id: "Nisab (Batas Minimum):", en: "Nisab (Minimum Limit):", ar: "النصاب (الحد الأدنى):", zh: "起征点（最低限额）：", ja: "ニサーブ (最低限度):", ko: "니삽 (최소 한도):" },
  kadar_zakat: { id: "Kadar Zakat:", en: "Zakat Rate:", ar: "نسبة الزكاة:", zh: "天课费率：", ja: "ザカート率：", ko: "자카트 비율:" },
  waktu_pembayaran: { id: "Waktu Pembayaran:", en: "Payment Time:", ar: "وقت الدفع:", zh: "付款时间：", ja: "支払い時期：", ko: "납부 시기:" },
  hitung_total_pendapatan: { id: "Hitung Total Pendapatan:", en: "Calculate Total Income:", ar: "حساب إجمالي الدخل:", zh: "计算总收入：", ja: "総収入を計算：", ko: "총 소득 계산:" },
  kurangi_pengeluaran_pokok: { id: "Kurangi Pengeluaran Pokok (Opsional):", en: "Deduct Basic Expenses (Optional):", ar: "خصم النفقات الأساسية (اختياري):", zh: "扣除基本费用（可选）：", ja: "基本経費を差し引く (任意)：", ko: "기본 생활비 공제 (선택 사항):" },
  hitung_zakatnya: { id: "Hitung Zakatnya:", en: "Calculate the Zakat:", ar: "احسب الزكاة:", zh: "计算天课：", ja: "ザカートを計算：", ko: "자카트 계산:" },
  rumus: { id: "Rumus:", en: "Formula:", ar: "المعادلة:", zh: "公式：", ja: "計算式：", ko: "공식:" },
  pengeluaran_pokok_detail: { id: "Pengeluaran pokok sandang, pangan, papan, & hutang mendesak", en: "Basic expenses for clothing, food, shelter, & urgent debt", ar: "النفقات الأساسية للملابس والطعام والمأوى والديون العاجلة", zh: "衣食住及紧急债务的基本开支", ja: "衣食住の基本経費および緊急の負債", ko: "의식주 및 긴급 부채에 대한 기본 비용" },
  pengurangan_kebutuhan: { id: "Pengurangan Kebutuhan", en: "Needs Deduction", ar: "خصم الاحتياجات", zh: "需求扣除", ja: "必要経費の控除", ko: "필요 경비 공제" },
  pendapatan_kena_zakat: { id: "Pendapatan Kena Zakat", en: "Zakat-Eligible Income", ar: "الدخل الخاضع للزكاة", zh: "符合天课条件的收入", ja: "ザカート対象収入", ko: "자카트 대상 소득" },
  haul_waktu: { id: "Haul (Waktu):", en: "Haul (Time):", ar: "الحول (الوقت):", zh: "Haul (时间)：", ja: "ハウル (期間):", ko: "하울 (기간):" }
};

for (const f of files) {
  const lang = f.split('.')[0];
  const p = path.join(localesDir, f);
  let data = JSON.parse(fs.readFileSync(p, 'utf8'));
  
  data.zakat = data.zakat || {};
  for (const [key, tmap] of Object.entries(translations)) {
    if (tmap[lang]) {
      data.zakat[key] = tmap[lang];
    } else if (lang === 'en') {
      data.zakat[key] = tmap.en;
    }
  }
  
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
}

console.log('Language JSONs updated with Maal keys!');
