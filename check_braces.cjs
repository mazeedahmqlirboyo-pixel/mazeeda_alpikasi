const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'routes', 'zakat-faraidh', '+page.svelte');
let page = fs.readFileSync(pagePath, 'utf8');

const scriptContent = page.substring(0, page.indexOf('</script>'));

let braces = 0;
for (let i = 0; i < scriptContent.length; i++) {
  if (scriptContent[i] === '{') braces++;
  if (scriptContent[i] === '}') braces--;
}

console.log('Brace count difference:', braces);
