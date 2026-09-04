const fs = require('fs');
const file = 'src/routes/zakat-faraidh/+page.svelte';
let s = fs.readFileSync(file, 'utf8');

const target1 = `      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none flex items-center gap-1">
        <span>{$t('zakat.pilih_jenis_zakat') || 'Pilih Jenis Zakat'}</span>
        <span class="text-slate-350 text-[8px] animate-pulse">▼</span>
      </label>
      `;

const target2 = `
      <p class="text-[10px] text-slate-400 dark:text-slate-500/80 text-center font-medium leading-none pt-1">
        *{$t('zakat.ketuk_tombol') || 'Ketuk tombol di atas untuk memilih atau mengubah jenis zakat yang ingin dihitung'}
      </p>`;

s = s.replace(target1, '');
s = s.replace(target2, '');

fs.writeFileSync(file, s);
console.log("Unwanted texts removed successfully!");
