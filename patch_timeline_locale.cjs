const fs = require('fs');
const path = require('path');

const sveltePath = path.join(__dirname, 'src/routes/timeline/+page.svelte');
let content = fs.readFileSync(sveltePath, 'utf8');

// 1. Add imports if they don't exist
if (!content.includes('import { t, locale } from \'svelte-i18n\'')) {
  content = content.replace(
    '<script lang="ts">',
    `<script lang="ts">
  import { t, locale } from 'svelte-i18n';
  import { get } from 'svelte/store';`
  );
}

// 2. Add displayNumber safely
if (!content.includes('function displayNumber(')) {
  content = content.replace(
    '  interface MemoryItem {',
    `  function displayNumber(num: number | undefined | null, currentLocale: string | null = null) {
    const n = Number(num || 0);
    if (isNaN(n)) return '0';
    if (currentLocale === 'ar') return n.toLocaleString('ar-EG');
    return String(n);
  }

  interface MemoryItem {`
  );
}

// 3. Apply the replacements for likes, comments, etc.
content = content.replace(/{memory\.likes_count}/g, '{displayNumber(memory.likes_count, $locale)}');
content = content.replace(/{memory\.comments_count}/g, '{displayNumber(memory.comments_count, $locale)}');
content = content.replace(/{memory\.shares_count \|\| 0}/g, '{displayNumber(memory.shares_count || 0, $locale)}');
content = content.replace(/{memory\.saves_count \|\| 0}/g, '{displayNumber(memory.saves_count || 0, $locale)}');
content = content.replace(/{memory\.downloads_count \|\| 0}/g, '{displayNumber(memory.downloads_count || 0, $locale)}');
content = content.replace(/{selectedMemory\.comments_count}/g, '{displayNumber(selectedMemory.comments_count, $locale)}');

fs.writeFileSync(sveltePath, content, 'utf8');
console.log('Timeline locale and numbers patched successfully.');
