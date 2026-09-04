const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/routes/zakat-faraidh/+page.svelte');
let content = fs.readFileSync(pagePath, 'utf8');

// Use a regular expression that is immune to whitespace/newline differences
const regex = /<input\s+id="wasiatPewaris"\s+type="text"\s+value=\{wasiatPewarisDisp\}\s*<\/p>\s*\{\/if\}\s*<\/div>/;

const replacement = `<input
                id="wasiatPewaris"
                type="text"
                value={wasiatPewarisDisp}
                on:input={(e) =>
                  handleNumericInput(e, (v) => {
                    wasiatPewaris = v;
                    wasiatPewarisDisp = v ? v.toLocaleString("id-ID") : "";
                  })}
                placeholder="0"
                class="pl-8 pr-2 h-10 w-full bg-slate-50 dark:bg-slate-800/50 dark:bg-slate-900 border border-slate-200 text-xs font-bold text-slate-700 dark:text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white"
              />
            </div>
            {#if wasiatPewaris > 0}
              <p
                in:slide={{ duration: 150 }}
                class="text-[9px] text-emerald-600 font-black tracking-normal capitalize mt-1 leading-tight"
              >
                {terbilang(wasiatPewaris)}
              </p>
            {/if}
          </div>`;

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(pagePath, content, 'utf8');
    console.log("Successfully fixed the mangled input tag.");
} else {
    console.log("Regex did not match. The file might already be fixed or mangled differently.");
}
