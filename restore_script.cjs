const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'routes', 'zakat-faraidh', '+page.svelte');
let s = fs.readFileSync(file, 'utf8');

const regex = /    <\/div>\s*\{\/if\}\s*class="grid grid-cols-1 \{activeTab === 'maal'/;

const replacement = `    </div>
  {/if}

  <!-- Harga Acuan Customizer (Emas & Perak) -->
  {#if activeTab === "penghasilan" || activeTab === "maal" || activeTab === "tabungan" || activeTab === "emas" || activeTab === "perak" || activeTab === "perniagaan" || activeTab === "saham" || activeTab === "reksadana" || activeTab === "tambak" || activeTab === "perusahaan" || activeTab === "properti_sewa" || activeTab === "pertambangan"}
    <Card class="bg-emerald-50/30 dark:bg-slate-800/50 border-emerald-250/20 dark:border-emerald-900/30 p-4">
      <div
        class="grid grid-cols-1 {activeTab === 'maal'`;

if (regex.test(s)) {
  s = s.replace(regex, replacement);
  fs.writeFileSync(file, s, 'utf8');
  console.log('Restored Harga Acuan block successfully.');
} else {
  console.log('Could not find the damaged block to restore.');
}
