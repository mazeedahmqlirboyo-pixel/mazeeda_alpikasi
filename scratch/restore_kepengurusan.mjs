import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.resolve(__dirname, '../src/routes/+page.svelte');

let content = fs.readFileSync(filePath, 'utf8');

// The block that was destroyed:
//           <img
//             src="/images/kepengurusan_bg.png"
//             alt="Kepengurusan"
//             class="w-full h-full object-contain dark:hidden"
//           style="mask-image: radial-gradient(circle at center, black 30%, transparent 65%); -webkit-mask-image: radial-gradient(circle at center, black 30%, transparent 65%);">
//               <img
//             src="/images/kepengurusan_bg_dark.png"
//             alt="Kepengurusan"
//             class="w-full h-full object-contain hidden dark:block"
//           />
//         </div>
//         <div class="space-y-1.5 z-10">
//           <span
//             class="inline-flex items-center space-x-1.5 bg-blue-50 border border-blue-100 dark:bg-slate-800 dark:border-slate-700 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-blue-600 leading-none"

const reconstructedBlock = `        <div class="absolute -right-4 -bottom-4 w-40 h-40 opacity-90 pointer-events-none group-hover:scale-110 transition-transform duration-500 mix-blend-multiply dark:mix-blend-normal">
          <img
            src="/images/kepengurusan_bg.png"
            alt="Kepengurusan"
            class="w-full h-full object-contain dark:hidden"
            style="mask-image: radial-gradient(circle at center, black 30%, transparent 65%); -webkit-mask-image: radial-gradient(circle at center, black 30%, transparent 65%);" />
          <img
            src="/images/kepengurusan_bg_dark.png"
            alt="Kepengurusan"
            class="w-full h-full object-contain hidden dark:block dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] dark:brightness-125"
          />
        </div>
        <div class="space-y-1.5 z-10">
          <span
            class="inline-flex items-center space-x-1.5 bg-blue-50 border border-blue-100 dark:bg-slate-800 dark:border-slate-700 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-blue-600 leading-none"
          >
            👥 Kepengurusan Santri
          </span>`;

// Find where it was mangled:
//         <div
//           class="absolute -right-4 -bottom-4 w-40 h-40 opacity-90 pointer-events-none group-hover:scale-110 transition-transform duration-500 mix-blend-multiply dark:mix-blend-normal"
//           
//         >
//           >
//             👥 Kepengurusan Santri
//           </span>

const regex = /<div\s+class="absolute -right-4 -bottom-4 w-40 h-40 opacity-90 pointer-events-none group-hover:scale-110 transition-transform duration-500 mix-blend-multiply dark:mix-blend-normal"\s*>\s*>\s*👥 Kepengurusan Santri\s*<\/span>/m;

content = content.replace(regex, reconstructedBlock);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Restored Kepengurusan block with new drop-shadow!");
