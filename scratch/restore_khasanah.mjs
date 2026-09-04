import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.resolve(__dirname, '../src/routes/+page.svelte');

let content = fs.readFileSync(filePath, 'utf8');

// The block has been severely mangled. We need to find the remaining text and reconstruct it.
// The remaining text after the mess is:
//           <p
//             class="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 leading-relaxed font-normal max-w-xl"
//           >
//             Selami nilai-nilai sejarah, filosofi, dan profil lengkap Pondok Pesantren Lirboyo beserta pesan-pesan Masyayikh.

const target = `<section class="space-y-4">
          <p
            class="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 leading-relaxed font-normal max-w-xl"
          >`;

// Let's just find the section tag before it and replace the whole chunk.
// Wait, looking at the diff, it replaced from line 2063 down to 2073 with literally NOTHING.
// Let's use a regex to replace the messed up block.

// I will look for the line above the mess:
// <!-- ==================== KHASANAH LIRBOYO BANNER ==================== -->
// and the line below the mess:
// Selami nilai-nilai sejarah, filosofi, dan profil lengkap Pondok Pesantren Lirboyo beserta pesan-pesan Masyayikh.

const reconstructedBlock = `<!-- ==================== KHASANAH LIRBOYO BANNER ==================== -->
  <section class="space-y-4">
    <h2 class="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">
      Khasanah Lirboyo
    </h2>
    <a
      href="/khasanah"
      class="group block transition-all hover:-translate-y-1.5 duration-300"
    >
      <div
        class="relative overflow-hidden rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50/40 via-white to-white dark:from-slate-800 dark:via-slate-800/95 dark:to-slate-900 dark:border-slate-700 hover:border-teal-300 hover:shadow-soft-md text-slate-800 dark:text-slate-100 p-5 h-44 flex flex-col justify-between transition-all duration-300"
      >
        <!-- Dekorasi Background -->
        <div class="absolute -right-4 -bottom-4 w-52 h-52 opacity-90 pointer-events-none group-hover:scale-110 transition-transform duration-500">
            <img src="/images/khasanah_bg.png" alt="Khasanah Lirboyo" class="w-full h-full object-contain dark:hidden mix-blend-multiply" style="mask-image: radial-gradient(circle at center, black 30%, transparent 65%); -webkit-mask-image: radial-gradient(circle at center, black 30%, transparent 65%);" />
            <img src="/images/khasanah_bg_dark.png" alt="Khasanah Lirboyo" class="w-full h-full object-contain hidden dark:block" />
        </div>
        <div class="space-y-1.5 z-10">
          <span
            class="inline-flex items-center space-x-1.5 bg-teal-50 border border-teal-100 dark:bg-slate-800 dark:border-slate-700 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-teal-700 leading-none"
          >
            📖 Profil & Sejarah
          </span>
          <h3 class="text-lg font-extrabold tracking-tight mt-1 text-slate-800 dark:text-slate-100">
            Jejak Lirboyo & Mozaik Murobbi
          </h3>
          <p
            class="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 leading-relaxed font-normal max-w-xl"
          >
            Selami nilai-nilai sejarah, filosofi, dan profil lengkap Pondok Pesantren Lirboyo beserta pesan-pesan Masyayikh.`;

const regex = /<!-- ==================== KHASANAH LIRBOYO BANNER ====================[^]*Selami nilai-nilai sejarah, filosofi, dan profil lengkap Pondok Pesantren Lirboyo beserta pesan-pesan Masyayikh\./;

content = content.replace(regex, reconstructedBlock);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Restored Khasanah block!");
