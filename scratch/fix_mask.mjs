import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.resolve(__dirname, '../src/routes/+page.svelte');

let content = fs.readFileSync(filePath, 'utf8');

// The mask style string:
const maskStyle = 'style="mask-image: radial-gradient(circle at center, black 30%, transparent 65%); -webkit-mask-image: radial-gradient(circle at center, black 30%, transparent 65%);"';

// Regex to find the div that wraps the dual images and has the mask style
// We want to remove the mask from the div, and apply it to the dark:hidden img.

// Because the HTML spans multiple lines, we'll replace the style in the div, 
// and then add it to the light images.
content = content.replace(/style="mask-image: radial-gradient\([^)]+\); -webkit-mask-image: radial-gradient\([^)]+\);"/g, '');

// Now we need to add the mask to the light images.
// Light images are identified by class="... dark:hidden"
// We'll just insert the style into the light img tags.
content = content.replace(/(<img[^>]+class="[^"]*dark:hidden[^"]*"[^>]*)/g, '$1 ' + maskStyle);

// Wait, the Zakat and Kiblat images etc.
// Let's also check if there are other images like `journey_compass.png` that we messed up.
// Earlier we updated ALL images.

fs.writeFileSync(filePath, content, 'utf8');
console.log("Moved mask from wrapper div to light mode images!");
