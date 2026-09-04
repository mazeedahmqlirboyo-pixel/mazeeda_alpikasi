import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.resolve(__dirname, '../src/routes/+page.svelte');

let content = fs.readFileSync(filePath, 'utf8');

// Replace all mix-blend-multiply with mix-blend-multiply dark:mix-blend-normal
// but only if dark:mix-blend-normal is not already there.
content = content.replace(/\bmix-blend-multiply\b(?!\s*dark:mix-blend-normal)/g, 'mix-blend-multiply dark:mix-blend-normal');

// Wait, the regex `(?!\s*dark:mix-blend-normal)` ensures we don't duplicate it.

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed blend modes!');
