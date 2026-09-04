const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'routes', 'zakat-faraidh', '+page.svelte');
let s = fs.readFileSync(file, 'utf8');

const missingCode = `
  // Missing variables from Peternakan and Rikaz
  let jumlahTernak = 0;
  let jumlahTernakDisp = "";
  let hargaTernak = 0;
  let hargaTernakDisp = "";
  let jenisTernak = "kambing";
  let hartaKotor = 0;
  let hartaKotorDisp = "";
`;

if (!s.includes('let jumlahTernak = 0;')) {
    s = s.replace(/import \{ t, locale \} from "svelte-i18n";/, match => `${match}\n${missingCode}`);
    fs.writeFileSync(file, s);
    console.log('Injected missing variables 2');
} else {
    console.log('Variables already exist');
}
