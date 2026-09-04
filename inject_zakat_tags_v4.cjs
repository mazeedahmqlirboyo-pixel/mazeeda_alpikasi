const fs = require('fs');
const file = 'src/routes/zakat-faraidh/+page.svelte';
let s = fs.readFileSync(file, 'utf8');

const reps = [
  // Rekomendasi Sedekah
  [`Rekomendasi Sedekah / Infaq`, `{$t('zakat.rekomendasi_sedekah_infaq') || 'Rekomendasi Sedekah / Infaq'}`],
  
  // Rekomendasi Sedekah: (with colon)
  // Wait, let's just make sure we don't accidentally double-inject if it's already injected.
  
  // Pendapatan Anda berada di bawah nisab...
  [`Pendapatan Anda berada di bawah nisab. Mengeluarkan infaq {formatNumberStr(2.5, $locale)}%`, `{$t('zakat.pendapatan_bawah_nisab') || 'Pendapatan Anda berada di bawah nisab. Mengeluarkan infaq'} {formatNumberStr(2.5, $locale)}%`],
  [`bersifat anjuran sukarela demi keberkahan harta.`, `{$t('zakat.anjuran_sukarela_keberkahan') || 'bersifat anjuran sukarela demi keberkahan harta.'}`],
  
  // Harta bersih Anda berada di bawah nisab tahunan...
  [`Harta bersih Anda berada di bawah nisab tahunan. Anda disarankan`, `{$t('zakat.harta_bawah_nisab') || 'Harta bersih Anda berada di bawah nisab tahunan. Anda disarankan'}`],
  [`mengeluarkan infaq/sedekah sukarela untuk mensucikan rezeki.`, `{$t('zakat.infaq_mensucikan_rezeki') || 'mengeluarkan infaq/sedekah sukarela untuk mensucikan rezeki.'}`]
];

for (const [from, to] of reps) {
  if (s.includes(from)) {
    s = s.split(from).join(to);
  } else {
    console.log("NOT FOUND:", from);
  }
}

// Write the missing translations into the locales JSON files
const path = require('path');
const localesDir = path.join('src', 'lib', 'i18n');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const missingTranslations = {
  en: {
    rekomendasi_sedekah_infaq: "Recommended Charity / Infaq",
    pendapatan_bawah_nisab: "Your income is below the nisab. Paying infaq",
    anjuran_sukarela_keberkahan: "is highly recommended for the blessing of your wealth.",
    harta_bawah_nisab: "Your net wealth is below the annual nisab. You are advised to",
    infaq_mensucikan_rezeki: "give voluntary charity to purify your wealth."
  },
  id: {
    rekomendasi_sedekah_infaq: "Rekomendasi Sedekah / Infaq",
    pendapatan_bawah_nisab: "Pendapatan Anda berada di bawah nisab. Mengeluarkan infaq",
    anjuran_sukarela_keberkahan: "bersifat anjuran sukarela demi keberkahan harta.",
    harta_bawah_nisab: "Harta bersih Anda berada di bawah nisab tahunan. Anda disarankan",
    infaq_mensucikan_rezeki: "mengeluarkan infaq/sedekah sukarela untuk mensucikan rezeki."
  },
  ar: {
    rekomendasi_sedekah_infaq: "صدقة / إنفاق مقترح",
    pendapatan_bawah_nisab: "دخلك أقل من النصاب. دفع إنفاق",
    anjuran_sukarela_keberkahan: "موصى به بشدة لبركة أموالك.",
    harta_bawah_nisab: "صافي ثروتك أقل من النصاب السنوي. يُنصح بـ",
    infaq_mensucikan_rezeki: "إخراج صدقة تطوعية لتطهير رزقك."
  },
  zh: {
    rekomendasi_sedekah_infaq: "推荐施舍 / 捐赠 (Infaq)",
    pendapatan_bawah_nisab: "您的收入低于起征点。支付",
    anjuran_sukarela_keberkahan: "的捐赠是自愿推荐的，为了财富的祝福。",
    harta_bawah_nisab: "您的净财富低于年度起征点。建议您",
    infaq_mensucikan_rezeki: "进行自愿施舍以净化您的财富。"
  },
  ja: {
    rekomendasi_sedekah_infaq: "推奨される喜捨 / インファーク",
    pendapatan_bawah_nisab: "あなたの収入はニサーブを下回っています。",
    anjuran_sukarela_keberkahan: "のインファークは富の祝福のために推奨されます。",
    harta_bawah_nisab: "あなたの純資産は年間ニサーブを下回っています。",
    infaq_mensucikan_rezeki: "富を浄化するために自発的な喜捨をお勧めします。"
  },
  ko: {
    rekomendasi_sedekah_infaq: "권장되는 자선 / 인팍 (Infaq)",
    pendapatan_bawah_nisab: "귀하의 소득은 니삽 미만입니다. 인팍을 지불하는 것은",
    anjuran_sukarela_keberkahan: "재산의 축복을 위해 권장되는 자발적 행위입니다.",
    harta_bawah_nisab: "귀하의 순자산은 연간 니삽 미만입니다.",
    infaq_mensucikan_rezeki: "재산을 정화하기 위해 자발적인 자선을 베푸는 것이 좋습니다."
  }
};

for (const f of files) {
  const lang = f.split('.')[0];
  const p = path.join(localesDir, f);
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  
  if (missingTranslations[lang]) {
    data.zakat = { ...(data.zakat || {}), ...missingTranslations[lang] };
    fs.writeFileSync(p, JSON.stringify(data, null, 2));
  }
}

fs.writeFileSync(file, s);
console.log('Final missing tags injected!');
