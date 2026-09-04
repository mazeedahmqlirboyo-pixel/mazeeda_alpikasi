const fs = require('fs');

const filePath = 'src/routes/+page.svelte';
let s = fs.readFileSync(filePath, 'utf8');

const regexReplacements = [
  // Uji Pengetahuanmu
  [/Uji Pengetahuanmu\s*<\/h2>/, `{$t('extra_features.quiz_section') || 'Uji Pengetahuanmu'}\n    </h2>`],
  [/🎉 Mini Game Baru!/, `{$t('extra_features.quiz_badge') || '🎉 Mini Game Baru!'}`],
  [/>\s*Kuis Cerdas Cermat Islami\s*<\/h3>/, `>\n            {$t('extra_features.quiz_title') || 'Kuis Cerdas Cermat Islami'}\n          </h3>`],
  [/Uji seberapa jauh pengetahuan agamamu! Ada pertanyaan seputar Fiqih, Nahwu, dan Sejarah\./, `{$t('extra_features.quiz_desc') || 'Uji seberapa jauh pengetahuan agamamu! Ada pertanyaan seputar Fiqih, Nahwu, dan Sejarah.'}`],

  // Khasanah Lirboyo
  [/Khasanah Lirboyo\s*<\/h2>/, `{$t('extra_features.khasanah_section') || 'Khasanah Lirboyo'}\n    </h2>`],
  [/📖 Profil & Sejarah/, `{$t('extra_features.khasanah_badge') || '📖 Profil & Sejarah'}`],
  [/>\s*Jejak Lirboyo & Mozaik Murobbi\s*<\/h3>/, `>\n            {$t('extra_features.khasanah_title') || 'Jejak Lirboyo & Mozaik Murobbi'}\n          </h3>`],
  [/Selami nilai-nilai sejarah, filosofi, dan profil lengkap Pondok Pesantren Lirboyo beserta pesan-pesan Masyayikh\./, `{$t('extra_features.khasanah_desc') || 'Selami nilai-nilai sejarah, filosofi, dan profil lengkap Pondok Pesantren Lirboyo beserta pesan-pesan Masyayikh.'}`],

  // Kepengurusan
  [/Kepengurusan\s*<\/h2>/, `{$t('extra_features.pengurus_section') || 'Kepengurusan'}\n    </h2>`],
  [/👥 Kepengurusan Santri/, `{$t('extra_features.pengurus_badge') || '👥 Kepengurusan Santri'}`],
  [/>\s*Kenangan Kepengurusan Santri\s*<\/h3>/, `>\n            {$t('extra_features.pengurus_title') || 'Kenangan Kepengurusan Santri'}\n          </h3>`],
  [/Jelajahi rekam jejak kepengurusan siswi yang pernah menjabat pada\s*periode tahun ajaran 2026 - 2032\./, `{$t('extra_features.pengurus_desc') || 'Jelajahi rekam jejak kepengurusan siswi yang pernah menjabat pada periode tahun ajaran 2026 - 2032.'}`]
];

for (const [regex, replace] of regexReplacements) {
  if (regex.test(s)) {
    s = s.replace(regex, replace);
  } else {
    console.log("NOT FOUND REGEX: ", regex);
  }
}

fs.writeFileSync(filePath, s);
console.log("Done patching page.svelte with extra features");
