const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'routes', 'zakat-faraidh', '+page.svelte');
const page = fs.readFileSync(pagePath, 'utf8');

const scriptContent = page.substring(0, page.indexOf('</script>'));
const lines = scriptContent.split('\n');

let balance = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (let j = 0; j < line.length; j++) {
    if (line[j] === '{') balance++;
    if (line[j] === '}') balance--;
  }
}

console.log('Total balance:', balance);

if (balance > 0) {
  // It means an opening brace { was never closed.
  // We can track the stack of opening braces.
  let stack = [];
  balance = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (let j = 0; j < line.length; j++) {
      if (line[j] === '{') {
        stack.push(i + 1); // store line number
      }
      if (line[j] === '}') {
        stack.pop();
      }
    }
  }
  console.log('Unclosed braces at lines:', stack);
}
