const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/routes/quran/+page.svelte');
let page = fs.readFileSync(pagePath, 'utf8');

// 1. Hide Global Tafsir Toggle
const globalToggleOriginal = `                <label class="flex items-center space-x-1.5 cursor-pointer hover:text-blue-700 select-none group">
                  <div class="relative">
                    <input type="checkbox" bind:checked={showTafsir} class="sr-only peer" />
                    <div class="w-7 h-4 bg-slate-200 dark:bg-slate-700 peer-checked:bg-blue-500 rounded-full transition-colors duration-200"></div>
                    <div class="absolute top-0.5 left-0.5 w-3 h-3 bg-white dark:bg-slate-900 rounded-full shadow transition-transform duration-200 peer-checked:translate-x-3"></div>
                  </div>
                  <span class="peer-checked:text-blue-700 group-hover:text-blue-600 transition-colors">{$t('quran.tafsir') || 'Tafsir'}</span>
                </label>`;

const globalToggleHidden = `                {#if $locale === 'id'}
                <label class="flex items-center space-x-1.5 cursor-pointer hover:text-blue-700 select-none group">
                  <div class="relative">
                    <input type="checkbox" bind:checked={showTafsir} class="sr-only peer" />
                    <div class="w-7 h-4 bg-slate-200 dark:bg-slate-700 peer-checked:bg-blue-500 rounded-full transition-colors duration-200"></div>
                    <div class="absolute top-0.5 left-0.5 w-3 h-3 bg-white dark:bg-slate-900 rounded-full shadow transition-transform duration-200 peer-checked:translate-x-3"></div>
                  </div>
                  <span class="peer-checked:text-blue-700 group-hover:text-blue-600 transition-colors">{$t('quran.tafsir') || 'Tafsir'}</span>
                </label>
                {/if}`;

if (page.includes(globalToggleOriginal) && !page.includes("{#if $locale === 'id'}\n                <label class=\"flex items-center space-x-1.5 cursor-pointer hover:text-blue-700 select-none group\">")) {
    page = page.replace(globalToggleOriginal, globalToggleHidden);
}

// 2. Hide Per Verse Tafsir Toggle
const verseToggleOriginal = `                      <!-- Tafsir toggle -->
                      <button
                        on:click={() => toggleTafsirPerVerse(verse.nomorAyat)}
                        class="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-premium border border-transparent
                          {expandedTafsirs[verse.nomorAyat] ? 'bg-amber-50 text-amber-700' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-800'}"
                      >
                        <BookOpen class="h-3 w-3" />
                        <span>{$t('quran.tafsir') || 'Tafsir'}</span>
                        <ChevronDown class="h-3.5 w-3.5 transform transition-transform duration-200 {expandedTafsirs[verse.nomorAyat] ? 'rotate-180' : ''}" />
                      </button>`;

const verseToggleHidden = `                      <!-- Tafsir toggle -->
                      {#if $locale === 'id'}
                      <button
                        on:click={() => toggleTafsirPerVerse(verse.nomorAyat)}
                        class="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-premium border border-transparent
                          {expandedTafsirs[verse.nomorAyat] ? 'bg-amber-50 text-amber-700' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-800'}"
                      >
                        <BookOpen class="h-3 w-3" />
                        <span>{$t('quran.tafsir') || 'Tafsir'}</span>
                        <ChevronDown class="h-3.5 w-3.5 transform transition-transform duration-200 {expandedTafsirs[verse.nomorAyat] ? 'rotate-180' : ''}" />
                      </button>
                      {/if}`;

if (page.includes(verseToggleOriginal) && !page.includes("{#if $locale === 'id'}\n                      <button\n                        on:click={() => toggleTafsirPerVerse")) {
    page = page.replace(verseToggleOriginal, verseToggleHidden);
}

// Also hide expanded tafsir rendering if locale is not 'id' just to be safe
page = page.replace(
  "{#if expandedTafsirs[verse.nomorAyat] && verse.tafsir}",
  "{#if $locale === 'id' && expandedTafsirs[verse.nomorAyat] && verse.tafsir}"
);

page = page.replace(
  "{#if showTafsir && !expandedTafsirs[verse.nomorAyat] && verse.tafsir}",
  "{#if $locale === 'id' && showTafsir && !expandedTafsirs[verse.nomorAyat] && verse.tafsir}"
);

page = page.replace(
  "{#if showTafsir && activeMushafVerse.tafsir}",
  "{#if $locale === 'id' && showTafsir && activeMushafVerse.tafsir}"
);

fs.writeFileSync(pagePath, page, 'utf8');
console.log("Patched Quran page to hide Tafsir for foreign languages!");
