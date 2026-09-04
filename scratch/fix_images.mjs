import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.resolve(__dirname, '../src/routes/+page.svelte');

let content = fs.readFileSync(filePath, 'utf8');
const originalContent = content;

// First, remove the accidental `dark:opacity-[0.2]` from all places (except Makkah bg which is fine)
// Let's specifically target the card images.
content = content.replace(/dark:mix-blend-normal dark:opacity-\[0\.2\]/g, 'dark:mix-blend-normal');

// Now, for any other `mix-blend-multiply` that doesn't have `dark:mix-blend-normal`, add it.
content = content.replace(/\bmix-blend-multiply(?! dark:mix-blend-)/g, 'mix-blend-multiply dark:mix-blend-normal');

// Wait, the Makkah bg was: opacity-[0.35] dark:opacity-[0.2] ... mix-blend-multiply dark:mix-blend-normal.
// The regex `dark:mix-blend-normal dark:opacity-\[0\.2\]` might not have matched Makkah because they were separated. That's good.

if (content !== originalContent) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed image blend modes in +page.svelte!');
} else {
  console.log('No changes were made.');
}
