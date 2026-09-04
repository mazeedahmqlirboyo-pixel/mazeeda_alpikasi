import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.resolve(__dirname, '../src/routes/+page.svelte');

let content = fs.readFileSync(filePath, 'utf8');

// Target string to replace
const oldClasses = 'class="w-full h-full object-contain hidden dark:block dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] dark:brightness-125"';

// New classes: using invert + hue-rotate-180 to turn dark blue into bright light blue!
// Also adding a soft blue drop-shadow for extra glow.
const newClasses = 'class="w-full h-full object-contain hidden dark:block dark:invert dark:hue-rotate-180 dark:brightness-125 dark:contrast-125 dark:drop-shadow-[0_0_10px_rgba(125,211,252,0.4)]"';

content = content.replace(oldClasses, newClasses);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Updated Kepengurusan logo with invert and hue-rotate!");
