const fs = require('fs');
const file = 'src/routes/kiblat/+page.svelte';
let s = fs.readFileSync(file, 'utf8');

// 1. Add translation logic to the top of the file
if (!s.includes('import { t, locale } from "svelte-i18n";')) {
  s = s.replace(/<script lang="ts">/, `<script lang="ts">\n  import { t, locale } from "svelte-i18n";`);
}

// Fix formatting function
if (!s.includes('formatNumberStr')) {
  s = s.replace(/import \{ t, locale \} from "svelte-i18n";/, `import { t, locale } from "svelte-i18n";\n\n  function formatNumberStr(num, loc) {\n    if (typeof num === "undefined" || num === null) return num;\n    if (loc === "ar") {\n      const idArabic = ["٠","١","٢","٣","٤","٥","٦","٧","٨","٩"];\n      return num.toString().replace(/[0-9]/g, w => idArabic[w]);\n    }\n    return num.toLocaleString(loc === "id" ? "id-ID" : loc);\n  }`);
}

// 2. Add locationSource 'searching' and displayCityName
s = s.replace(/let locationSource: 'gps' \| 'city' \| 'default' = 'default';/, `let locationSource: 'gps' | 'city' | 'default' | 'searching' = 'searching';`);
s = s.replace(/let cityName = 'Mencari lokasi\.\.\.';/, `let cityName = 'Mencari lokasi...';\n  $: displayCityName = locationSource === 'gps' ? $t('kiblat.lokasi_saya_gps') || 'Lokasi Saya (GPS)' : locationSource === 'default' ? $t('kiblat.jakarta_default') || 'Jakarta (Default)' : locationSource === 'searching' ? $t('kiblat.mencari_lokasi') || 'Mencari lokasi...' : cityName;`);

// 3. Fix locationSource in requestLocation and selectDefaultCity
s = s.replace(/cityName = 'Lokasi Saya \(GPS\)';/, `cityName = 'Lokasi Saya (GPS)';\n          locationSource = 'gps';`);
s = s.replace(/cityName = 'Jakarta \(Default\)';/, `cityName = 'Jakarta (Default)';\n    locationSource = 'default';`);

// 4. Update HTML badge
s = s.replace(/<span>\{cityName\}<\/span>/, `<span>{displayCityName}</span>`);

// Update HTML badge colors
s = s.replace(/text-emerald-300 shadow-soft-xs/g, `text-emerald-700 dark:text-emerald-300 shadow-soft-xs`);
s = s.replace(/text-emerald-400 shrink-0/g, `text-emerald-600 dark:text-emerald-400 shrink-0`);

// 5. Update Kiblat steps array with translations
s = s.replace(
  /{ step: '1', title: 'Posisikan HP Mendatar', desc: 'Taruh ponsel Anda mendatar sejajar dengan dada untuk hasil sensor magnetometer yang maksimal\.' },/g,
  `{ step: '1', title: $t('kiblat.posisikan_hp') || 'Posisikan HP Mendatar', desc: $t('kiblat.posisikan_hp_desc') || 'Taruh ponsel Anda mendatar sejajar dengan dada untuk hasil sensor magnetometer yang maksimal.' },`
);
s = s.replace(
  /{ step: '2', title: 'Jauhi Gangguan Elektromagnetik', desc: 'Hindari meletakkan HP di dekat benda logam, magnet, speaker besar, atau laptop karena dapat mengacaukan sensor\.' },/g,
  `{ step: '2', title: $t('kiblat.jauhi_gangguan') || 'Jauhi Gangguan Elektromagnetik', desc: $t('kiblat.jauhi_gangguan_desc') || 'Hindari meletakkan HP di dekat benda logam, magnet, speaker besar, atau laptop karena dapat mengacaukan sensor.' },`
);
s = s.replace(
  /{ step: '3', title: 'Sesuaikan Dial Manual', desc: 'Jika sensor HP Anda mati\/tidak didukung, geser dial kompas di layar secara manual memakai jari Anda\.' },/g,
  `{ step: '3', title: $t('kiblat.sesuaikan_dial') || 'Sesuaikan Dial Manual', desc: $t('kiblat.sesuaikan_dial_desc') || 'Jika sensor HP Anda mati/tidak didukung, geser dial kompas di layar secara manual memakai jari Anda.' },`
);
s = s.replace(
  /{ step: '4', title: 'Hadapkan Ujung Atas HP', desc: 'Putar badan Anda sampai jarum Kaaba selaras dengan garis penunjuk merah di atas \(Glow Hijau menyala\)\.' }/g,
  `{ step: '4', title: $t('kiblat.hadapkan_ujung') || 'Hadapkan Ujung Atas HP', desc: $t('kiblat.hadapkan_ujung_desc') || 'Putar badan Anda sampai jarum Kaaba selaras dengan garis penunjuk merah di atas (Glow Hijau menyala).' }`
);

// Write changes
fs.writeFileSync(file, s);
console.log("Kiblat patched successfully!");
