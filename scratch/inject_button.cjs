const fs = require('fs');
const file = 'src/routes/kalender/+page.svelte';
let content = fs.readFileSync(file, 'utf8');

const oldStr = '            {/each}\r\n          </div>\r\n      </div>';
const oldStr2 = '            {/each}\n          </div>\n      </div>';
const oldStr3 = '            {/each}\r\n          </div>\r\n        </div>';
const oldStr4 = '            {/each}\n          </div>\n        </div>';

// Just replace the end of the each loop robustly:
content = content.replace(
  /\{\/each\}\s*<\/div>\s*<\/div>/,
  \{/each}
          </div>
          {#if currentMonthPeringatan.length > 6}
            <div class="mt-6 flex justify-center pb-2">
              <button
                on:click={() => showAllPeringatan = !showAllPeringatan}
                class="px-6 py-2.5 text-sm font-bold text-green-700 dark:text-emerald-400 bg-green-50 dark:bg-slate-800 hover:bg-green-100 dark:hover:bg-slate-700/80 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-200 dark:focus:ring-emerald-900 shadow-sm dark:shadow-none"
              >
                {showAllPeringatan ? "Sembunyikan" : \\\Tampilkan Semua (\)\\\}
              </button>
            </div>
          {/if}
        </div>\
);

fs.writeFileSync(file, content, 'utf8');
console.log('Button injected successfully.');
