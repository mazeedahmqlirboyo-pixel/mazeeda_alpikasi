import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.resolve(__dirname, '../src/routes/+page.svelte');

let content = fs.readFileSync(filePath, 'utf8');

const emojiBlock = `<div class="text-8xl scale-125 translate-x-2 translate-y-2 opacity-30 drop-shadow-md dark:shadow-none">
            🕌
          </div>`;

// We will replace it with a container matching the style of the other cards, 
// using absolute positioning so it sits in the bottom right corner.
// We can use the same style as other cards like:
// <div class="absolute -right-4 -bottom-4 w-40 h-40 opacity-90 pointer-events-none group-hover:scale-110 transition-transform duration-500">
const replacement = `<div class="absolute -right-4 -bottom-4 w-44 h-44 opacity-90 pointer-events-none group-hover:scale-110 transition-transform duration-500">
            <img src="/images/khasanah_bg.png" alt="Khasanah Lirboyo" class="w-full h-full object-contain dark:hidden mix-blend-multiply" style="mask-image: radial-gradient(circle at center, black 30%, transparent 65%); -webkit-mask-image: radial-gradient(circle at center, black 30%, transparent 65%);" />
            <img src="/images/khasanah_bg_dark.png" alt="Khasanah Lirboyo" class="w-full h-full object-contain hidden dark:block" />
          </div>`;

content = content.replace(emojiBlock, replacement);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Updated Khasanah card to use the dual images!");
