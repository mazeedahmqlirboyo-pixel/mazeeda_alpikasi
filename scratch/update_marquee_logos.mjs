import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.resolve(__dirname, '../src/routes/+page.svelte');

let content = fs.readFileSync(filePath, 'utf8');

const logos = [
    'logo_emabror.png',
    'logo_alimaf.png',
    'logo_rayhar.png',
    'logo_wepose.png'
];

for (const logo of logos) {
    // We want to add `dark:invert` if it's not already there.
    // The class string is `class="absolute inset-0 w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal scale-[1.8] hover:scale-[2]"`
    // Let's just find `dark:mix-blend-normal` and replace it with `dark:mix-blend-normal dark:invert`
    
    // To be safe and only target these logos, we find the img tag first.
    const regex = new RegExp(`(<img[^>]+src="/images/${logo}"[^>]+class="[^"]*)(dark:mix-blend-normal)([^"]*")`, 'g');
    content = content.replace(regex, '$1$2 dark:invert$3');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("Added dark:invert to all marquee logos!");
