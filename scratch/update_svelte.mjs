import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.resolve(__dirname, '../src/routes/+page.svelte');

let content = fs.readFileSync(filePath, 'utf8');

const imagesToReplace = [
    "kiblat_bg.png",
    "zakat_bg.png",
    "faraidh_bg.png",
    "kalender_bg.png",
    "tasbih_icon.png",
    "cashflow_icon.png",
    "kas_angkatan_icon.jpg",
    "quiz_icon.png",
    "kepengurusan_bg.png",
    "journey_compass.png"
];

for (const name of imagesToReplace) {
    const ext = name.substring(name.lastIndexOf('.'));
    const base = name.substring(0, name.lastIndexOf('.'));
    const darkName = base + "_dark" + ".png"; // it's always .png now
    
    // Regex to match the img tag containing this src
    // <img src="/images/kiblat_bg.png" alt="..." class="..." />
    // We want to replace it with TWO img tags.
    const regex = new RegExp(`<img[^>]*src="/images/${name}"[^>]*>`, 'g');
    
    content = content.replace(regex, (match) => {
        // Find the class attribute
        const classMatch = match.match(/class="([^"]*)"/);
        if (!classMatch) return match; // fallback
        
        let originalClass = classMatch[1];
        
        // Remove dark:mix-blend-normal from original class if it exists
        originalClass = originalClass.replace(/\bdark:mix-blend-normal\b/g, '').trim();
        
        // Remove dark:shadow-none if it exists (since we will handle it separately)
        let lightClass = originalClass + " dark:hidden";
        let darkClass = originalClass.replace(/\bmix-blend-multiply\b/g, '') + " hidden dark:block";
        
        // Create the two img tags
        let lightImg = match.replace(classMatch[0], `class="${lightClass}"`);
        let darkImg = match.replace(`src="/images/${name}"`, `src="/images/${darkName}"`).replace(classMatch[0], `class="${darkClass}"`);
        
        return `${lightImg}\n              ${darkImg}`;
    });
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("Updated +page.svelte to use dual images!");
