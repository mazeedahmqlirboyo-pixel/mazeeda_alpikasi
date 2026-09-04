const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'routes', 'zakat-faraidh', '+page.svelte');
let page = fs.readFileSync(pagePath, 'utf8');

// 1. Fix dark mode classes on toggle buttons (Kakek, Nenek, Saudara, etc.)
page = page.replace(/bg-white border-slate-100 hover:border-slate-200/g, "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600");
page = page.replace(/bg-indigo-50 border-indigo-400/g, "bg-indigo-50 dark:bg-indigo-900/40 border-indigo-400 dark:border-indigo-500");
page = page.replace(/'text-indigo-800'/g, "'text-indigo-800 dark:text-indigo-300'");

// Fix unselected text color to be a bit brighter in dark mode
page = page.replace(/text-slate-600 dark:text-slate-300/g, "text-slate-600 dark:text-slate-200");

// Fix the "Tutup Lanjutan" button styling
page = page.replace(/'bg-slate-700 hover:bg-slate-800' : 'bg-blue-600 hover:bg-blue-700'/g, "'bg-slate-700 dark:bg-slate-600 hover:bg-slate-800 dark:hover:bg-slate-500' : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'");

// 2. Inject Arabic Numeral Support (formatNumberStr) for counter spans
// Look for >{variableCount}</span>
const counterVars = ['istriCount', 'sonsCount', 'daughtersCount', 'cucuLakiCount', 'cucuPerempuanCount', 'saudaraKandungLakiCount', 'saudaraKandungPerempuanCount'];
for (const v of counterVars) {
  const regex = new RegExp(`>\\{${v}\\}<\\/span>`, 'g');
  page = page.replace(regex, `>{formatNumberStr(${v}, $locale)}</span>`);
}

// 3. Inject i18n labels
const labels = {
  "Total Harta Peninggalan \\(Harta Kotor\\)": "{$t('faraidh.total_harta') || 'Total Harta Peninggalan (Harta Kotor)'}",
  "Hubungan Suami \\/ Istri \\(Pasangan\\)": "{$t('faraidh.hubungan_suami_istri') || 'Hubungan Suami / Istri (Pasangan)'}",
  "Orang Tua Kandung": "{$t('faraidh.orang_tua_kandung') || 'Orang Tua Kandung'}",
  "Ayah Kandung": "{$t('faraidh.ayah_kandung') || 'Ayah Kandung'}",
  "Ibu Kandung": "{$t('faraidh.ibu_kandung') || 'Ibu Kandung'}",
  "Pewaris meninggal saat ia masih hidup": "{$t('faraidh.masih_hidup') || 'Pewaris meninggal saat ia masih hidup'}",
  "Pewaris meninggal saat masih hidup": "{$t('faraidh.masih_hidup') || 'Pewaris meninggal saat masih hidup'}",
  "Anak Laki-laki": "{$t('faraidh.anak_laki_laki') || 'Anak Laki-laki'}",
  "Anak Perempuan": "{$t('faraidh.anak_perempuan') || 'Anak Perempuan'}",
  "Kakek \\& Nenek": "{$t('faraidh.kakek_nenek') || 'Kakek & Nenek'}",
  "Kakek \\(dari Ayah\\)": "{$t('faraidh.kakek_ayah') || 'Kakek (dari Ayah)'}",
  "Nenek \\(dari Ayah\\)": "{$t('faraidh.nenek_ayah') || 'Nenek (dari Ayah)'}",
  "Nenek \\(dari Ibu\\)": "{$t('faraidh.nenek_ibu') || 'Nenek (dari Ibu)'}",
  "Cucu \\(dari anak laki-laki\\)": "{$t('faraidh.cucu') || 'Cucu (dari anak laki-laki)'}",
  "Cucu Laki-laki": "{$t('faraidh.cucu_laki_laki') || 'Cucu Laki-laki'}",
  "Cucu Perempuan": "{$t('faraidh.cucu_perempuan') || 'Cucu Perempuan'}",
  "Saudara\\/i \\(Kandung \\/ Sebapak \\/ Seibu\\)": "{$t('faraidh.saudara') || 'Saudara/i (Kandung / Sebapak / Seibu)'}",
  "Kandung Lk": "{$t('faraidh.saudara_kandung_lk') || 'Kandung Lk'}",
  "Kandung Pr": "{$t('faraidh.saudara_kandung_pr') || 'Kandung Pr'}",
  "Sebapak Lk": "{$t('faraidh.saudara_sebapak_lk') || 'Sebapak Lk'}",
  "Sebapak Pr": "{$t('faraidh.saudara_sebapak_pr') || 'Sebapak Pr'}",
  "Seibu Lk": "{$t('faraidh.saudara_seibu_lk') || 'Seibu Lk'}",
  "Seibu Pr": "{$t('faraidh.saudara_seibu_pr') || 'Seibu Pr'}",
  "Keponakan \\(dari saudara laki-laki\\)": "{$t('faraidh.keponakan') || 'Keponakan (dari Sdr Lk)'}",
  "Dari Sdr Kandung": "{$t('faraidh.keponakan_kandung') || 'Dari Sdr Kandung'}",
  "Dari Sdr Sebapak": "{$t('faraidh.keponakan_sebapak') || 'Dari Sdr Sebapak'}",
  "Paman \\(Saudara laki-laki Ayah\\)": "{$t('faraidh.paman') || 'Paman (Sdr Lk Ayah)'}",
  "Paman Kandung": "{$t('faraidh.paman_kandung') || 'Paman Kandung'}",
  "Paman Sebapak": "{$t('faraidh.paman_sebapak') || 'Paman Sebapak'}",
  "Sepupu \\(Anak laki-laki Paman\\)": "{$t('faraidh.sepupu') || 'Sepupu (Anak Lk Paman)'}",
  "Sepupu Kandung": "{$t('faraidh.sepupu_kandung') || 'Sepupu Kandung'}",
  "Sepupu Sebapak": "{$t('faraidh.sepupu_sebapak') || 'Sepupu Sebapak'}",
  "Jumlah Istri": "{$t('faraidh.jumlah_istri') || 'Jumlah Istri'}",
  ">Suami<": ">{$t('faraidh.suami') || 'Suami'}<",
  ">Istri<": ">{$t('faraidh.istri') || 'Istri'}<",
  "Tinggalkan Suami": "{$t('faraidh.tinggalkan_suami') || 'Tinggalkan Suami'}",
  "Tinggalkan Istri": "{$t('faraidh.tinggalkan_istri') || 'Tinggalkan Istri'}"
};

for (const [key, val] of Object.entries(labels)) {
  const regex = new RegExp(key, 'g');
  page = page.replace(regex, val);
}

// Special case for buttons
page = page.replace(/{isAdvancedFaraidh \? 'Tutup Lanjutan' : '✨ Mode Lanjutan'}/g, "{isAdvancedFaraidh ? ($t('faraidh.tutup_lanjutan') || 'Tutup Lanjutan') : ($t('faraidh.mode_lanjutan') || '✨ Mode Lanjutan')}");

fs.writeFileSync(pagePath, page, 'utf8');
console.log('Svelte Faraidh UI patched');

// 4. Update the i18n locales
const localesDir = path.join(__dirname, 'src', 'lib', 'i18n', 'locales');
const dictionaries = {
  'id': {
    "total_harta": "Total Harta Peninggalan (Harta Kotor)",
    "hubungan_suami_istri": "Hubungan Suami / Istri (Pasangan)",
    "orang_tua_kandung": "Orang Tua Kandung",
    "ayah_kandung": "Ayah Kandung",
    "ibu_kandung": "Ibu Kandung",
    "masih_hidup": "Pewaris meninggal saat masih hidup",
    "anak_laki_laki": "Anak Laki-laki",
    "anak_perempuan": "Anak Perempuan",
    "kakek_nenek": "Kakek & Nenek",
    "kakek_ayah": "Kakek (dari Ayah)",
    "nenek_ayah": "Nenek (dari Ayah)",
    "nenek_ibu": "Nenek (dari Ibu)",
    "cucu": "Cucu (dari anak laki-laki)",
    "cucu_laki_laki": "Cucu Laki-laki",
    "cucu_perempuan": "Cucu Perempuan",
    "saudara": "Saudara/i (Kandung / Sebapak / Seibu)",
    "saudara_kandung_lk": "Kandung Lk",
    "saudara_kandung_pr": "Kandung Pr",
    "saudara_sebapak_lk": "Sebapak Lk",
    "saudara_sebapak_pr": "Sebapak Pr",
    "saudara_seibu_lk": "Seibu Lk",
    "saudara_seibu_pr": "Seibu Pr",
    "keponakan": "Keponakan (dari Sdr Lk)",
    "keponakan_kandung": "Dari Sdr Kandung",
    "keponakan_sebapak": "Dari Sdr Sebapak",
    "paman": "Paman (Sdr Lk Ayah)",
    "paman_kandung": "Paman Kandung",
    "paman_sebapak": "Paman Sebapak",
    "sepupu": "Sepupu (Anak Lk Paman)",
    "sepupu_kandung": "Sepupu Kandung",
    "sepupu_sebapak": "Sepupu Sebapak",
    "tinggalkan": "Tinggalkan",
    "suami": "Suami",
    "istri": "Istri",
    "tinggalkan_suami": "Tinggalkan Suami",
    "tinggalkan_istri": "Tinggalkan Istri",
    "tutup_lanjutan": "Tutup Lanjutan",
    "mode_lanjutan": "✨ Mode Lanjutan",
    "jumlah_istri": "Jumlah Istri"
  },
  'en': {
    "total_harta": "Total Gross Estate (Left Behind)",
    "hubungan_suami_istri": "Spousal Relationship",
    "orang_tua_kandung": "Biological Parents",
    "ayah_kandung": "Biological Father",
    "ibu_kandung": "Biological Mother",
    "masih_hidup": "Alive when deceased passed away",
    "anak_laki_laki": "Son(s)",
    "anak_perempuan": "Daughter(s)",
    "kakek_nenek": "Grandparents",
    "kakek_ayah": "Grandfather (Paternal)",
    "nenek_ayah": "Grandmother (Paternal)",
    "nenek_ibu": "Grandmother (Maternal)",
    "cucu": "Grandchildren (from son)",
    "cucu_laki_laki": "Grandson",
    "cucu_perempuan": "Granddaughter",
    "saudara": "Siblings (Full / Paternal / Maternal)",
    "saudara_kandung_lk": "Full Bro",
    "saudara_kandung_pr": "Full Sis",
    "saudara_sebapak_lk": "Pat. Bro",
    "saudara_sebapak_pr": "Pat. Sis",
    "saudara_seibu_lk": "Mat. Bro",
    "saudara_seibu_pr": "Mat. Sis",
    "keponakan": "Nephews (from brother)",
    "keponakan_kandung": "From Full Bro",
    "keponakan_sebapak": "From Pat. Bro",
    "paman": "Uncle (Father's Brother)",
    "paman_kandung": "Full Uncle",
    "paman_sebapak": "Paternal Uncle",
    "sepupu": "Cousin (Uncle's Son)",
    "sepupu_kandung": "Full Cousin",
    "sepupu_sebapak": "Paternal Cousin",
    "tinggalkan": "Leaves",
    "suami": "Husband",
    "istri": "Wife",
    "tinggalkan_suami": "Leaves Husband",
    "tinggalkan_istri": "Leaves Wife",
    "tutup_lanjutan": "Close Advanced",
    "mode_lanjutan": "✨ Advanced Mode",
    "jumlah_istri": "Number of Wives"
  },
  'ar': {
    "total_harta": "إجمالي التركة (الصافية)",
    "hubungan_suami_istri": "علاقة الزوجين",
    "orang_tua_kandung": "الوالدان البيولوجيان",
    "ayah_kandung": "الأب",
    "ibu_kandung": "الأم",
    "masih_hidup": "على قيد الحياة عند الوفاة",
    "anak_laki_laki": "الابن",
    "anak_perempuan": "البنت",
    "kakek_nenek": "الأجداد",
    "kakek_ayah": "الجد (لأب)",
    "nenek_ayah": "الجدة (لأب)",
    "nenek_ibu": "الجدة (لأم)",
    "cucu": "الأحفاد (من الابن)",
    "cucu_laki_laki": "ابن الابن",
    "cucu_perempuan": "بنت الابن",
    "saudara": "الإخوة والأخوات (أشقاء / لأب / لأم)",
    "saudara_kandung_lk": "أخ شقيق",
    "saudara_kandung_pr": "أخت شقيقة",
    "saudara_sebapak_lk": "أخ لأب",
    "saudara_sebapak_pr": "أخت لأب",
    "saudara_seibu_lk": "أخ لأم",
    "saudara_seibu_pr": "أخت لأم",
    "keponakan": "أبناء الأخ",
    "keponakan_kandung": "من أخ شقيق",
    "keponakan_sebapak": "من أخ لأب",
    "paman": "العم (أخو الأب)",
    "paman_kandung": "عم شقيق",
    "paman_sebapak": "عم لأب",
    "sepupu": "ابن العم",
    "sepupu_kandung": "ابن عم شقيق",
    "sepupu_sebapak": "ابن عم لأب",
    "tinggalkan": "ترك",
    "suami": "الزوج",
    "istri": "الزوجة",
    "tinggalkan_suami": "ترك زوجاً",
    "tinggalkan_istri": "ترك زوجة",
    "tutup_lanjutan": "إغلاق متقدم",
    "mode_lanjutan": "✨ الوضع المتقدم",
    "jumlah_istri": "عدد الزوجات"
  },
  'zh': {
    "total_harta": "总遗产",
    "hubungan_suami_istri": "配偶关系",
    "orang_tua_kandung": "亲生父母",
    "ayah_kandung": "父亲",
    "ibu_kandung": "母亲",
    "masih_hidup": "去世时仍健在",
    "anak_laki_laki": "儿子",
    "anak_perempuan": "女儿",
    "kakek_nenek": "祖父母",
    "kakek_ayah": "祖父（父亲的父亲）",
    "nenek_ayah": "祖母（父亲的母亲）",
    "nenek_ibu": "外祖母（母亲的母亲）",
    "cucu": "孙辈（儿子的孩子）",
    "cucu_laki_laki": "孙子",
    "cucu_perempuan": "孙女",
    "saudara": "兄弟姐妹",
    "saudara_kandung_lk": "全血缘兄弟",
    "saudara_kandung_pr": "全血缘姐妹",
    "saudara_sebapak_lk": "同父异母兄弟",
    "saudara_sebapak_pr": "同父异母姐妹",
    "saudara_seibu_lk": "同母异父兄弟",
    "saudara_seibu_pr": "同母异父姐妹",
    "keponakan": "侄子",
    "keponakan_kandung": "全血缘兄弟的儿子",
    "keponakan_sebapak": "同父兄弟的儿子",
    "paman": "叔父/伯父",
    "paman_kandung": "全血缘叔伯",
    "paman_sebapak": "同父叔伯",
    "sepupu": "堂兄弟",
    "sepupu_kandung": "全血缘堂兄弟",
    "sepupu_sebapak": "同父堂兄弟",
    "tinggalkan": "留下",
    "suami": "丈夫",
    "istri": "妻子",
    "tinggalkan_suami": "留下丈夫",
    "tinggalkan_istri": "留下妻子",
    "tutup_lanjutan": "关闭高级模式",
    "mode_lanjutan": "✨ 高级模式",
    "jumlah_istri": "妻子数量"
  },
  'ja': {
    "total_harta": "総遺産",
    "hubungan_suami_istri": "配偶者の関係",
    "orang_tua_kandung": "実の親",
    "ayah_kandung": "実の父",
    "ibu_kandung": "実の母",
    "masih_hidup": "死亡時に生存していた",
    "anak_laki_laki": "息子",
    "anak_perempuan": "娘",
    "kakek_nenek": "祖父母",
    "kakek_ayah": "祖父（父方）",
    "nenek_ayah": "祖母（父方）",
    "nenek_ibu": "祖母（母方）",
    "cucu": "孫（息子の子供）",
    "cucu_laki_laki": "孫息子",
    "cucu_perempuan": "孫娘",
    "saudara": "兄弟姉妹",
    "saudara_kandung_lk": "実の兄弟",
    "saudara_kandung_pr": "実の姉妹",
    "saudara_sebapak_lk": "異母兄弟",
    "saudara_sebapak_pr": "異母姉妹",
    "saudara_seibu_lk": "異父兄弟",
    "saudara_seibu_pr": "異父姉妹",
    "keponakan": "甥",
    "keponakan_kandung": "実の兄弟の息子",
    "keponakan_sebapak": "異母兄弟の息子",
    "paman": "叔父/伯父",
    "paman_kandung": "実の叔父/伯父",
    "paman_sebapak": "父方の叔父/伯父",
    "sepupu": "いとこ",
    "sepupu_kandung": "実のいとこ",
    "sepupu_sebapak": "父方のいとこ",
    "tinggalkan": "残す",
    "suami": "夫",
    "istri": "妻",
    "tinggalkan_suami": "夫を残す",
    "tinggalkan_istri": "妻を残す",
    "tutup_lanjutan": "詳細モードを閉じる",
    "mode_lanjutan": "✨ 詳細モード",
    "jumlah_istri": "妻の数"
  },
  'ko': {
    "total_harta": "총 유산",
    "hubungan_suami_istri": "배우자 관계",
    "orang_tua_kandung": "친부모",
    "ayah_kandung": "친아버지",
    "ibu_kandung": "친어머니",
    "masih_hidup": "사망 당시 생존",
    "anak_laki_laki": "아들",
    "anak_perempuan": "딸",
    "kakek_nenek": "조부모",
    "kakek_ayah": "할아버지 (친가)",
    "nenek_ayah": "할머니 (친가)",
    "nenek_ibu": "할머니 (외가)",
    "cucu": "손주 (아들의 자녀)",
    "cucu_laki_laki": "손자",
    "cucu_perempuan": "손녀",
    "saudara": "형제자매",
    "saudara_kandung_lk": "친형제",
    "saudara_kandung_pr": "친자매",
    "saudara_sebapak_lk": "이복형제",
    "saudara_sebapak_pr": "이복자매",
    "saudara_seibu_lk": "이부형제",
    "saudara_seibu_pr": "이부자매",
    "keponakan": "조카 (형제의 아들)",
    "keponakan_kandung": "친형제의 아들",
    "keponakan_sebapak": "이복형제의 아들",
    "paman": "삼촌 (아버지의 형제)",
    "paman_kandung": "친삼촌",
    "paman_sebapak": "이복삼촌",
    "sepupu": "사촌",
    "sepupu_kandung": "친사촌",
    "sepupu_sebapak": "이복사촌",
    "tinggalkan": "남기다",
    "suami": "남편",
    "istri": "아내",
    "tinggalkan_suami": "남편을 남김",
    "tinggalkan_istri": "아내를 남김",
    "tutup_lanjutan": "고급 모드 닫기",
    "mode_lanjutan": "✨ 고급 모드",
    "jumlah_istri": "아내의 수"
  }
};

const supportedLocales = ['id', 'en', 'ar', 'zh', 'ja', 'ko'];
supportedLocales.forEach(loc => {
  const file = path.join(localesDir, `${loc}.json`);
  if (fs.existsSync(file)) {
    let data = JSON.parse(fs.readFileSync(file, 'utf8'));
    data.faraidh = dictionaries[loc];
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Updated ${loc}.json`);
  }
});
