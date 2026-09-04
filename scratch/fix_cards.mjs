import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.resolve(__dirname, '../src/routes/+page.svelte');

let content = fs.readFileSync(filePath, 'utf8');
const originalContent = content;

// Fix via-white to-white gradient backgrounds
// Replace "via-white to-white hover:" with "via-white to-white dark:from-slate-800 dark:via-slate-800/95 dark:to-slate-900 dark:border-slate-700 hover:"
content = content.replace(/via-white to-white hover:/g, 'via-white to-white dark:from-slate-800 dark:via-slate-800/95 dark:to-slate-900 dark:border-slate-700 hover:');

// Fix mix-blend-multiply on decoration images so they don't disappear in dark mode
// Replace "mix-blend-multiply\"" with "mix-blend-multiply dark:mix-blend-normal dark:opacity-[0.2]\""
content = content.replace(/mix-blend-multiply"/g, 'mix-blend-multiply dark:mix-blend-normal dark:opacity-[0.2]"');

// Also check the "Kuis" mini tag background which has "bg-fuchsia-50". We can just fix any badge like "bg-indigo-50", "bg-emerald-50", etc to add dark:bg-slate-800 dark:border-slate-700
content = content.replace(/\bbg-([a-z]+)-50 border border-\1-100\b/g, 'bg-$1-50 border border-$1-100 dark:bg-slate-800 dark:border-slate-700');


if (content !== originalContent) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed card styles in +page.svelte!');
} else {
  console.log('No changes were made.');
}
