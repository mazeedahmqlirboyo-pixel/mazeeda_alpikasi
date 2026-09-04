const fs = require('fs');
const filePath = 'src/routes/+page.svelte';
let s = fs.readFileSync(filePath, 'utf8');

const replacements = [
  // Heading
  [/Ikhtisar MAZEEDA\s*<\/h2>/, `{$t('ikhtisar.title') || 'Ikhtisar MAZEEDA'}\n    </h2>`],
  
  // Guruku
  [/name: "Guruku",/, `name: {$t('ikhtisar.guruku_title') || 'Guruku'},`],
  [/value: asatidzahCount,/, `value: asatidzahCount.replace('Pengajar', $t('ikhtisar.pengajar') || 'Pengajar'),`],
  [/description: "Mustahiq \| Mustahiqoh \| Munawwib \| Munawibah",/, `description: {$t('ikhtisar.guruku_desc') || 'Mustahiq | Mustahiqoh | Munawwib | Munawibah'},`],
  
  // Squad
  [/name: "Mazeeda Squad",/, `name: {$t('ikhtisar.squad_title') || 'Mazeeda Squad'},`],
  [/value: membersCount,/, `value: membersCount.replace('Anggota', $t('ikhtisar.anggota') || 'Anggota'),`],
  [/description: "Alumni \| Alumnus",/, `description: {$t('ikhtisar.squad_desc') || 'Alumni | Alumnus'},`],
  
  // Timeline
  [/name: "Time Line",/, `name: {$t('ikhtisar.timeline_title') || 'Time Line'},`],
  [/value: madingCount,/, `value: madingCount.replace('Momen', $t('ikhtisar.momen') || 'Momen'),`],
  [/description: "Foto kenangan \| album memori",/, `description: {$t('ikhtisar.timeline_desc') || 'Foto kenangan | album memori'},`],
  
  // Sangu
  [/name: "Sangu \| Wirid",/, `name: {$t('ikhtisar.sangu_title') || 'Sangu | Wirid'},`],
  [/value: sanguCount,/, `value: sanguCount.replace('Berkas', $t('ikhtisar.berkas') || 'Berkas'),`],
  [/description: "Koleksi doa \| sholawat \| nadzom",/, `description: {$t('ikhtisar.sangu_desc') || 'Koleksi doa | sholawat | nadzom'},`],
  
  // Quran
  [/name: "Al-Qur'an Progress",/, `name: {$t('ikhtisar.quran_title') || "Al-Qur'an Progress"},`],
  [/description: quranDescription,/, `description: quranDescription.replace('Ayat - Terakhir Dibaca', $t('ikhtisar.quran_ayat') || 'Ayat - Terakhir Dibaca').replace('Surah Terakhir', $t('ikhtisar.quran_surah') || 'Surah Terakhir').replace('Surah Pertama', $t('ikhtisar.quran_surah') || 'Surah Pertama'),`],
  
  // AI
  [/name: "MAZEEDA AI",/, `name: {$t('ikhtisar.ai_title') || 'MAZEEDA AI'},`],
  [/value: "Tanya AI",/, `value: {$t('ikhtisar.ai_tanya') || 'Tanya AI'},`],
  [/description: "Teman curhat & asisten cerdas",/, `description: {$t('ikhtisar.ai_desc') || 'Teman curhat & asisten cerdas'},`],
  
  // Akademik
  [/name: "Riwayat Akademik",/, `name: {$t('ikhtisar.akademik_title') || 'Riwayat Akademik'},`],
  [/value: "Daftar Nilai",/, `value: {$t('ikhtisar.akademik_nilai') || 'Daftar Nilai'},`],
  [/description: "Cari \| lihat daftar nilai siswi",/, `description: {$t('ikhtisar.akademik_desc') || 'Cari | lihat daftar nilai siswi'},`],
  
  // Jejak MAZEEDA (bottom part)
  [/>\s*Jejak MAZEEDA\s*<\/p>/, `>\n                {$t('ikhtisar.jejak_title') || 'Jejak MAZEEDA'}\n              </p>`],
  [/>\s*Perjalanan Kami\s*<\/h3>/, `>\n                {$t('ikhtisar.jejak_perjalanan') || 'Perjalanan Kami'}\n              </h3>`],
  [/>\s*2023 - 2032 · Eksplorasi Kenangan\s*<\/p>/, `>\n                {$t('ikhtisar.jejak_desc') || '2023 - 2032 · Eksplorasi Kenangan'}\n              </p>`]
];

for (const [regex, replace] of replacements) {
  if (regex.test(s)) {
    s = s.replace(regex, replace);
  } else {
    console.log("NOT FOUND REGEX: ", regex);
  }
}

fs.writeFileSync(filePath, s);
console.log("Done patching page.svelte for ikhtisar");
