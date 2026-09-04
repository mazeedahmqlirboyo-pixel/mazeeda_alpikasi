const { execSync } = require('child_process');

const scripts = [
  'inject_zakat_tags.cjs',
  'inject_zakat_tags_v2.cjs',
  'inject_zakat_tags_v3.cjs',
  'inject_zakat_tags_v4.cjs',
  'inject_all_zakat_tags.cjs',
  'inject_maal_tags.cjs',
  'inject_maal_fixes_2.cjs',
  'inject_fitrah_tags.cjs',
  'inject_tabungan_tags.cjs',
  'inject_emas_tags.cjs',
  'inject_perak_tags.cjs',
  'inject_pertanian_tags.cjs',
  'inject_pertanian_fixes.cjs',
  'inject_perdagangan_tags.cjs',
  'inject_saham_tags.cjs',
  'inject_multi_tags.cjs',
  'inject_final_tags.cjs',
  'inject_tambak_missing.cjs',
  'inject_properti_missing.cjs',
  'inject_tambang_missing.cjs',
  'inject_penghasilan_missing.cjs',
  'inject_hewan_missing.cjs',
  'inject_klik_disini.cjs'
];

for (const script of scripts) {
  try {
    console.log(`Running ${script}...`);
    execSync(`node ${script}`, { stdio: 'inherit' });
  } catch (err) {
    console.error(`Error running ${script}`);
  }
}

console.log('All locale tags injected!');
