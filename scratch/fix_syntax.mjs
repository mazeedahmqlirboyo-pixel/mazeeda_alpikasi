import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.resolve(__dirname, '../src/routes/+page.svelte');

let content = fs.readFileSync(filePath, 'utf8');

// Replace `/ style="..."` with `style="..." /`
content = content.replace(/\/\s*style="mask-image:/g, 'style="mask-image:');

// wait, if I just remove the '/', I need to put it at the end.
// But the line ends with `>`, so it becomes `style="...">`. That is valid HTML (img tags don't STRICTLY need to be self-closing with /> in HTML5, but Svelte prefers it).
// To be safe, let's fix it to `style="..." />`

// Because the original string ends with `/ style="..."`, and the tag ends with `>`, it became `... / style="...">`
// Let's replace `/ style="mask-image: ([^"]+)"` with `style="mask-image: $1" /`
content = content.replace(/\/\s*style="mask-image:([^"]+)"/g, 'style="mask-image:$1" /');

fs.writeFileSync(filePath, content, 'utf8');
console.log("Fixed syntax error in +page.svelte!");
