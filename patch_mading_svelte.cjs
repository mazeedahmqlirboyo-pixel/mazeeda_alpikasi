const fs = require('fs');
const path = require('path');

const sveltePath = path.join(__dirname, 'src/routes/mading/+page.svelte');
let content = fs.readFileSync(sveltePath, 'utf8');

// Imports
if (!content.includes("import { t, locale } from 'svelte-i18n';")) {
  content = content.replace(
    "import { supabase } from '$lib/supabase';", 
    "import { supabase } from '$lib/supabase';\n  import { t, locale } from 'svelte-i18n';\n  import { get } from 'svelte/store';"
  );
}

// Simple strings
content = content.replace(/title="Mading MAZEEDA"/g, 'title={$t("mading.page_title") || "Mading MAZEEDA"}');
content = content.replace(/> Papan Pengumuman<\/span>/g, '>{$t("mading.tab_announcement") || "Papan Pengumuman"}</span>');
content = content.replace(/> Dinding Aspirasi<\/span>/g, '>{$t("mading.tab_aspiration") || "Dinding Aspirasi"}</span>');
content = content.replace(/placeholder="Cari pengumuman..."/g, 'placeholder={$t("mading.search_announcement_placeholder") || "Cari pengumuman..."}');
content = content.replace(/placeholder="Cari aspirasi..."/g, 'placeholder={$t("mading.search_aspiration_placeholder") || "Cari aspirasi..."}');
content = content.replace(/>Baca Selengkapnya<\/span>/g, '>{$t("mading.read_more") || "Baca Selengkapnya"}</span>');
content = content.replace(/>Baca Selengkapnya \&rarr;<\/span>/g, '>{$t("mading.read_more") || "Baca Selengkapnya"} &rarr;</span>');
content = content.replace(/>Kategori<\/span>/g, '>{$t("mading.category_label") || "Kategori"}</span>');
content = content.replace(/>Belum ada kategori<\/span>/g, '>{$t("mading.no_category") || "Belum ada kategori"}</span>');
content = content.replace(/>Tidak ada pengumuman ditemukan<\/p>/g, '>{$t("mading.empty_announcement") || "Tidak ada pengumuman ditemukan"}</p>');
content = content.replace(/>Dinding Aspirasi Kosong<\/p>/g, '>{$t("mading.empty_aspiration") || "Dinding Aspirasi Kosong"}</p>');

// Date formatting replacements
content = content.replace(/"Hari ini"/g, 'get(t)("mading.today") || "Hari ini"');
content = content.replace(/"Baru saja"/g, 'get(t)("mading.just_now") || "Baru saja"');

// Locale dates: 'id-ID' or "id-ID"
content = content.replace(/\("id-ID",/g, '(get(locale) || "id-ID",');
content = content.replace(/\('id-ID',/g, '(get(locale) || "id-ID",');

fs.writeFileSync(sveltePath, content, 'utf8');
console.log('Mading svelte patched.');
