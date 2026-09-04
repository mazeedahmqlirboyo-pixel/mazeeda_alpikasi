const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/routes/kalender/+page.svelte');
let content = fs.readFileSync(pagePath, 'utf8');

content = content.replace(
  '<span class="mr-2">{currentDate.getFullYear()}</span>',
  '<span class="mr-2">{formatNumberDisplay(currentDate.getFullYear())}</span>'
);

content = content.replace(
  '>\n                        {yr}\n                      </button>',
  '>\n                        {formatNumberDisplay(yr)}\n                      </button>'
);

fs.writeFileSync(pagePath, content, 'utf8');
console.log("Year dropdown numbers formatted!");
