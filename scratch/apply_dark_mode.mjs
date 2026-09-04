import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '../src');

const replacements = [
  { regex: /\bbg-white\b(?! dark:bg-slate-900)/g, replace: 'bg-white dark:bg-slate-900' },
  { regex: /\bbg-slate-50\b(?! dark:bg-slate-800)/g, replace: 'bg-slate-50 dark:bg-slate-800' },
  { regex: /\bbg-slate-100\b(?! dark:bg-slate-800)/g, replace: 'bg-slate-100 dark:bg-slate-800' },
  { regex: /\bbg-slate-200\b(?! dark:bg-slate-700)/g, replace: 'bg-slate-200 dark:bg-slate-700' },
  { regex: /\btext-slate-900\b(?! dark:text-white)/g, replace: 'text-slate-900 dark:text-white' },
  { regex: /\btext-slate-800\b(?! dark:text-slate-100)/g, replace: 'text-slate-800 dark:text-slate-100' },
  { regex: /\btext-slate-700\b(?! dark:text-slate-200)/g, replace: 'text-slate-700 dark:text-slate-200' },
  { regex: /\btext-slate-600\b(?! dark:text-slate-300)/g, replace: 'text-slate-600 dark:text-slate-300' },
  { regex: /\btext-slate-500\b(?! dark:text-slate-400)/g, replace: 'text-slate-500 dark:text-slate-400' },
  { regex: /\btext-slate-400\b(?! dark:text-slate-500)/g, replace: 'text-slate-400 dark:text-slate-500' },
  { regex: /\bborder-slate-100\b(?! dark:border-slate-800)/g, replace: 'border-slate-100 dark:border-slate-800' },
  { regex: /\bborder-slate-200\b(?! dark:border-slate-700)/g, replace: 'border-slate-200 dark:border-slate-700' },
  { regex: /\bborder-slate-300\b(?! dark:border-slate-600)/g, replace: 'border-slate-300 dark:border-slate-600' },
  { regex: /\bshadow-sm\b(?! dark:shadow-none)/g, replace: 'shadow-sm dark:shadow-none' },
  { regex: /\bshadow-md\b(?! dark:shadow-none)/g, replace: 'shadow-md dark:shadow-none' },
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  for (const { regex, replace } of replacements) {
    content = content.replace(regex, replace);
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.svelte')) {
      processFile(fullPath);
    }
  }
}

console.log('Starting dark mode injection...');
processDirectory(rootDir);
console.log('Done!');
