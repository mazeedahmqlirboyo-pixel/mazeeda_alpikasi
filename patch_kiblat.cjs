const fs = require('fs');
const file = 'src/routes/kiblat/+page.svelte';
let s = fs.readFileSync(file, 'utf8');

// 1. Fix the array in the HTML for steps (remove backticks and string interpolation brackets)
s = s.replace(/`\{\$t\('kiblat\.posisikan_hp'\)\s*\|\|\s*'([^']+)'\}`/g, `$t('kiblat.posisikan_hp') || '$1'`);
s = s.replace(/`\{\$t\('kiblat\.posisikan_hp_desc'\)\s*\|\|\s*'([^']+)'\}`/g, `$t('kiblat.posisikan_hp_desc') || '$1'`);

s = s.replace(/`\{\$t\('kiblat\.jauhi_gangguan'\)\s*\|\|\s*'([^']+)'\}`/g, `$t('kiblat.jauhi_gangguan') || '$1'`);
s = s.replace(/`\{\$t\('kiblat\.jauhi_gangguan_desc'\)\s*\|\|\s*'([^']+)'\}`/g, `$t('kiblat.jauhi_gangguan_desc') || '$1'`);

s = s.replace(/`\{\$t\('kiblat\.sesuaikan_dial'\)\s*\|\|\s*'([^']+)'\}`/g, `$t('kiblat.sesuaikan_dial') || '$1'`);
s = s.replace(/`\{\$t\('kiblat\.sesuaikan_dial_desc'\)\s*\|\|\s*'([^']+)'\}`/g, `$t('kiblat.sesuaikan_dial_desc') || '$1'`);

s = s.replace(/`\{\$t\('kiblat\.hadapkan_ujung'\)\s*\|\|\s*'([^']+)'\}`/g, `$t('kiblat.hadapkan_ujung') || '$1'`);
s = s.replace(/`\{\$t\('kiblat\.hadapkan_ujung_desc'\)\s*\|\|\s*'([^']+)'\}`/g, `$t('kiblat.hadapkan_ujung_desc') || '$1'`);


// 2. Fix locationSource typing and add displayCityName
s = s.replace(/let locationSource: 'gps' \| 'city' \| 'default' = 'default';/, `let locationSource: 'gps' | 'city' | 'default' | 'searching' = 'searching';`);
s = s.replace(/let cityName = `\{\$t\('kiblat\.mencari_lokasi'\) \|\| 'Mencari lokasi\.\.\.'\}`;/, `let cityName = 'Mencari lokasi...';`);

// In requestLocation and selectDefaultCity, replace the string interpolations with just simple strings since displayCityName will handle translation
s = s.replace(/cityName = `\{\$t\('kiblat\.lokasi_saya_gps'\) \|\| 'Lokasi Saya \(GPS\)'\}`;/, `cityName = 'Lokasi Saya (GPS)';`);
s = s.replace(/cityName = `\{\$t\('kiblat\.jakarta_default'\) \|\| 'Jakarta \(Default\)'\}`;/, `cityName = 'Jakarta (Default)';`);

// Inject displayCityName reactive statement
const reactiveStmt = `\n  $: displayCityName = locationSource === 'gps'\n    ? $t('kiblat.lokasi_saya_gps') || 'Lokasi Saya (GPS)'\n    : locationSource === 'default'\n      ? $t('kiblat.jakarta_default') || 'Jakarta (Default)'\n      : locationSource === 'searching'\n        ? $t('kiblat.mencari_lokasi') || 'Mencari lokasi...'\n        : cityName;\n`;

s = s.replace(/(let cityName = 'Mencari lokasi\.\.\.';\n\s*let locationSource: 'gps' \| 'city' \| 'default' \| 'searching' = 'searching';)/, `$1\n${reactiveStmt}`);


// 3. Fix the HTML rendering of cityName to displayCityName
s = s.replace(/<span>\{cityName\}<\/span>/, `<span>{displayCityName}</span>`);


// 4. Fix color of the badge
// Original: text-emerald-300
// New: text-emerald-700 dark:text-emerald-300
s = s.replace(/text-emerald-300 shadow-soft-xs/g, `text-emerald-700 dark:text-emerald-300 shadow-soft-xs`);

// Fix pin color
// Original: text-emerald-400
// New: text-emerald-600 dark:text-emerald-400
s = s.replace(/text-emerald-400 shrink-0/g, `text-emerald-600 dark:text-emerald-400 shrink-0`);


fs.writeFileSync(file, s);
console.log("Done patching kiblat page");
