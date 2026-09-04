const fs = require('fs');
const path = require('path');

const tsFiles = ['en.json', 'ar.json', 'ko.json', 'ja.json', 'zh.json', 'id.json'];
const translations = {
  en: {
    title: "Al-Qur'an",
    select_surah: "Select Surah",
    quran_karim: "The Noble Qur'an",
    surah_list: "Surah List",
    close: "Close",
    search_placeholder: "Search surah name or number...",
    clear: "Clear",
    surah: "Surah",
    ayat: "Verses",
    play_surah: "Play Surah",
    show_info: "Show Surah Info",
    hide_info: "Hide Surah Info",
    mode_ayat: "Verse Mode",
    mode_mushaf: "Mushaf Mode",
    qori: "Reciter",
    size: "Size",
    translation: "Translation",
    latin: "Latin",
    tafsir: "Tafsir",
    bismillah_meaning: "In the name of Allah, the Entirely Merciful, the Especially Merciful",
    try_again: "Try Again",
    play: "Play",
    pause: "Pause"
  },
  ar: {
    title: "القرآن الكريم",
    select_surah: "اختر سورة",
    quran_karim: "القرآن الكريم",
    surah_list: "قائمة السور",
    close: "إغلاق",
    search_placeholder: "ابحث عن اسم السورة أو رقمها...",
    clear: "مسح",
    surah: "سورة",
    ayat: "آيات",
    play_surah: "تشغيل السورة",
    show_info: "عرض معلومات السورة",
    hide_info: "إخفاء معلومات السورة",
    mode_ayat: "وضع الآيات",
    mode_mushaf: "وضع المصحف",
    qori: "القارئ",
    size: "الحجم",
    translation: "الترجمة",
    latin: "اللاتينية",
    tafsir: "التفسير",
    bismillah_meaning: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    try_again: "حاول مرة أخرى",
    play: "تشغيل",
    pause: "إيقاف مؤقت"
  },
  ko: {
    title: "꾸란",
    select_surah: "수라 선택",
    quran_karim: "고귀한 꾸란",
    surah_list: "수라 목록",
    close: "닫기",
    search_placeholder: "수라 이름 또는 번호 검색...",
    clear: "지우기",
    surah: "수라",
    ayat: "구절",
    play_surah: "수라 재생",
    show_info: "수라 정보 보기",
    hide_info: "수라 정보 숨기기",
    mode_ayat: "구절 모드",
    mode_mushaf: "무샤프 모드",
    qori: "낭송자",
    size: "크기",
    translation: "번역",
    latin: "라틴어",
    tafsir: "타프시르",
    bismillah_meaning: "가장 자비로우시고 가장 자애로우신 알라의 이름으로",
    try_again: "다시 시도",
    play: "재생",
    pause: "일시 정지"
  },
  ja: {
    title: "コーラン",
    select_surah: "スーラを選択",
    quran_karim: "高貴なコーラン",
    surah_list: "スーラ一覧",
    close: "閉じる",
    search_placeholder: "スーラの名前や番号を検索...",
    clear: "クリア",
    surah: "スーラ",
    ayat: "節",
    play_surah: "スーラを再生",
    show_info: "スーラの情報を表示",
    hide_info: "スーラの情報を隠す",
    mode_ayat: "節モード",
    mode_mushaf: "ムスハフモード",
    qori: "朗読者",
    size: "サイズ",
    translation: "翻訳",
    latin: "ラテン語",
    tafsir: "タフスィール",
    bismillah_meaning: "慈悲深く慈愛あまねきアッラーの御名において",
    try_again: "再試行",
    play: "再生",
    pause: "一時停止"
  },
  zh: {
    title: "古兰经",
    select_surah: "选择苏拉",
    quran_karim: "高贵的古兰经",
    surah_list: "苏拉列表",
    close: "关闭",
    search_placeholder: "搜索苏拉名称或编号...",
    clear: "清除",
    surah: "苏拉",
    ayat: "节",
    play_surah: "播放苏拉",
    show_info: "显示苏拉信息",
    hide_info: "隐藏苏拉信息",
    mode_ayat: "节模式",
    mode_mushaf: "穆斯哈夫模式",
    qori: "诵读者",
    size: "大小",
    translation: "翻译",
    latin: "拉丁文",
    tafsir: "塔夫西尔",
    bismillah_meaning: "奉至仁至慈的安拉之名",
    try_again: "重试",
    play: "播放",
    pause: "暂停"
  },
  id: {
    title: "Al-Qur'an",
    select_surah: "Pilih Surah",
    quran_karim: "Al-Qur'anul Karim",
    surah_list: "Daftar Surah",
    close: "Tutup",
    search_placeholder: "Cari Surah atau nomor...",
    clear: "Bersihkan",
    surah: "Surah",
    ayat: "Ayat",
    play_surah: "Putar Surah",
    show_info: "Lihat Informasi Surah",
    hide_info: "Sembunyikan Informasi Surah",
    mode_ayat: "Mode Ayat",
    mode_mushaf: "Mode Mushaf",
    qori: "Qori'",
    size: "Ukuran",
    translation: "Terjemah",
    latin: "Latin",
    tafsir: "Tafsir",
    bismillah_meaning: "Dengan nama Allah Yang Maha Pengasih, Maha Penyayang",
    try_again: "Coba Lagi",
    play: "Putar",
    pause: "Jeda"
  }
};

const localesDir = path.join(__dirname, 'src/lib/i18n');

// 1. Update i18n JSON files
tsFiles.forEach(file => {
  const lang = file.split('.')[0];
  const filePath = path.join(localesDir, file);
  if (fs.existsSync(filePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (!data.quran) {
        data.quran = translations[lang];
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      }
    } catch (e) {
      console.log(`Error reading ${file}`);
    }
  }
});

// 2. Patch +page.svelte
const pagePath = path.join(__dirname, 'src/routes/quran/+page.svelte');
let page = fs.readFileSync(pagePath, 'utf8');

// Add import if missing (Checking carefully based on previous failures)
if (!page.includes("import { t, locale } from 'svelte-i18n';")) {
  page = page.replace(
    "import { onMount, tick } from 'svelte';",
    "import { t, locale } from 'svelte-i18n';\n  import { onMount, tick } from 'svelte';"
  );
  if (!page.includes("import { t, locale } from 'svelte-i18n';")) {
    page = page.replace(
      "import { onMount, tick, onDestroy } from 'svelte';",
      "import { t, locale } from 'svelte-i18n';\n  import { onMount, tick, onDestroy } from 'svelte';"
    );
  }
}

// Replace texts in UI
page = page.replace(/title="Al-Qur'an"/g, "title={$t('quran.title') || \"Al-Qur'an\"}");
page = page.replace(/>\s*Pilih Surah\s*</g, ">{$t('quran.select_surah') || 'Pilih Surah'}<");
page = page.replace(/>\s*Al-Qur'anul Karim\s*</g, ">{$t('quran.quran_karim') || \"Al-Qur'anul Karim\"}<");
page = page.replace(/>\s*Daftar Surah\s*</g, ">{$t('quran.surah_list') || 'Daftar Surah'}<");
page = page.replace(/>\s*Tutup\s*</g, ">{$t('quran.close') || 'Tutup'}<");

// Placeholders
page = page.replace(/placeholder="Cari nama surah atau nomor\.\.\."/g, "placeholder={$t('quran.search_placeholder') || 'Cari Surah atau nomor...'}");
page = page.replace(/placeholder="Cari Surah atau nomor\.\.\."/g, "placeholder={$t('quran.search_placeholder') || 'Cari Surah atau nomor...'}");

page = page.replace(/>\s*Bersihkan\s*</g, ">{$t('quran.clear') || 'Bersihkan'}<");

page = page.replace(/>Surah \{selectedSurahSummary\.namaLatin\}</g, ">{$t('quran.surah') || 'Surah'} {selectedSurahSummary.namaLatin}<");
page = page.replace(/\{surahList\.length\} Surah/g, "{surahList.length} {$t('quran.surah') || 'Surah'}");
page = page.replace(/\{surah\.jumlahAyat\} Ayat/g, "{surah.jumlahAyat} {$t('quran.ayat') || 'Ayat'}");
page = page.replace(/\{selectedSurahSummary\.jumlahAyat\} Ayat/g, "{selectedSurahSummary.jumlahAyat} {$t('quran.ayat') || 'Ayat'}");

page = page.replace(/>\s*Putar Surah\s*</g, ">{$t('quran.play_surah') || 'Putar Surah'}<");
page = page.replace(/\{showSurahDesc \? 'Sembunyikan Informasi Surah' : 'Lihat Informasi Surah'\}/g, "{showSurahDesc ? ($t('quran.hide_info') || 'Sembunyikan Informasi Surah') : ($t('quran.show_info') || 'Lihat Informasi Surah')}");

page = page.replace(/>\s*Mode Ayat\s*</g, ">{$t('quran.mode_ayat') || 'Mode Ayat'}<");
page = page.replace(/>\s*Mode Mushaf\s*</g, ">{$t('quran.mode_mushaf') || 'Mode Mushaf'}<");
page = page.replace(/>Qori'</g, ">{$t('quran.qori') || \"Qori'\"}<");
page = page.replace(/>Ukuran</g, ">{$t('quran.size') || 'Ukuran'}<");

page = page.replace(/>\s*Terjemah\s*</g, ">{$t('quran.translation') || 'Terjemah'}<");
page = page.replace(/>\s*Latin\s*</g, ">{$t('quran.latin') || 'Latin'}<");
page = page.replace(/>\s*Tafsir\s*</g, ">{$t('quran.tafsir') || 'Tafsir'}<");

page = page.replace(/>\s*Dengan nama Allah Yang Maha Pengasih, Maha Penyayang\s*</g, ">{$t('quran.bismillah_meaning') || 'Dengan nama Allah Yang Maha Pengasih, Maha Penyayang'}<");
page = page.replace(/>\s*Coba Lagi\s*</g, ">{$t('quran.try_again') || 'Coba Lagi'}<");

// Also there might be "Putar" / "Jeda" inside verse controls but those might be tricky. We can try:
page = page.replace(/>\s*Putar\s*</g, ">{$t('quran.play') || 'Putar'}<");
page = page.replace(/>\s*Jeda\s*</g, ">{$t('quran.pause') || 'Jeda'}<");


fs.writeFileSync(pagePath, page, 'utf8');
console.log("Patched Quran page with i18n!");
