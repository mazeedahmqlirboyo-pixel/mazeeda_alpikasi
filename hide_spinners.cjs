const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src', 'app.postcss');
const css = `

/* Hide number input spinners globally */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield;
}
`;

fs.appendFileSync(cssPath, css, 'utf8');
console.log('Appended to app.postcss');
