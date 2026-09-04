const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/routes/zakat-faraidh/+page.svelte');
let content = fs.readFileSync(pagePath, 'utf8');

// The block to replace
const target = `<p>
                Perhitungan ini berdasarkan kesepakatan jumhur ulama Sunni.
                Urutan prioritas kewajiban sebelum harta waris dibagi adalah:
              </p>
              <ul class="list-decimal list-inside pl-1 space-y-0.5 font-medium">
                <li>Melunasi biaya pengurusan jenazah (tajhiz).</li>
                <li>
                  Melunasi hutang piutang pewaris, baik kepada manusia maupun
                  kepada Allah (zakat, nazar).
                </li>
                <li>
                  Menunaikan wasiat pewaris (maksimal 1/3 dari sisa harta
                  bersih).
                </li>
              </ul>
              <p class="text-[9px] text-slate-400 dark:text-slate-500 italic">
                Disarankan untuk melakukan konsultasi lanjut dengan Ustadz /
                Pengadilan Agama setempat untuk detail kasus waris yang rumit.
              </p>`;

// We will use a more robust regex to find this block and replace it
const regex = /<p>\s*Perhitungan ini berdasarkan kesepakatan jumhur ulama Sunni.\s*Urutan prioritas kewajiban sebelum harta waris dibagi adalah:\s*<\/p>\s*<ul class="list-decimal list-inside pl-1 space-y-0\.5 font-medium">\s*<li>Melunasi biaya pengurusan jenazah \(tajhiz\)\.<\/li>\s*<li>\s*Melunasi hutang piutang pewaris, baik kepada manusia maupun\s*kepada Allah \(zakat, nazar\)\.\s*<\/li>\s*<li>\s*Menunaikan wasiat pewaris \(maksimal 1\/3 dari sisa harta\s*bersih\)\.\s*<\/li>\s*<\/ul>\s*<p class="text-\[9px\] text-slate-400 dark:text-slate-500 italic">\s*Disarankan untuk melakukan konsultasi lanjut dengan Ustadz \/\s*Pengadilan Agama setempat untuk detail kasus waris yang rumit\.\s*<\/p>/;

const replacement = `<p>
                {$t('faraidh.law_notes.intro') || 'Perhitungan ini berdasarkan kesepakatan jumhur ulama Sunni. Urutan prioritas kewajiban sebelum harta waris dibagi adalah:'}
              </p>
              <ul class="list-decimal list-inside pl-1 space-y-0.5 font-medium">
                <li>{$t('faraidh.law_notes.list_1') || 'Melunasi biaya pengurusan jenazah (tajhiz).'}</li>
                <li>
                  {$t('faraidh.law_notes.list_2') || 'Melunasi hutang piutang pewaris, baik kepada manusia maupun kepada Allah (zakat, nazar).'}
                </li>
                <li>
                  {$t('faraidh.law_notes.list_3') || 'Menunaikan wasiat pewaris (maksimal 1/3 dari sisa harta bersih).'}
                </li>
              </ul>
              <p class="text-[9px] text-slate-400 dark:text-slate-500 italic">
                {$t('faraidh.law_notes.disclaimer') || 'Disarankan untuk melakukan konsultasi lanjut dengan Ustadz / Pengadilan Agama setempat untuk detail kasus waris yang rumit.'}
              </p>`;

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(pagePath, content, 'utf8');
    console.log("Successfully replaced Faraidh Law Notes with i18n keys.");
} else {
    console.log("Regex did not match.");
}
