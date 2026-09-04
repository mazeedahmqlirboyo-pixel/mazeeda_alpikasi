const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/routes/zakat-faraidh/+page.svelte');
let content = fs.readFileSync(pagePath, 'utf8');

// 1. Inject the formatNumberDisplay function right after formatCurrency
const formatNumberDisplayFunc = `
  $: formatNumberDisplay = (num) => {
    let str = (num ?? "").toString();
    if ($locale === 'ar') {
      const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
      return str.replace(/[0-9]/g, function (w) {
        return arabicNumbers[+w];
      });
    }
    return str;
  };
`;

if (!content.includes('formatNumberDisplay =')) {
    content = content.replace(/function formatCurrency\(num: number\): string \{([\s\S]*?)\}/, (match) => {
        return `function formatCurrency(num: number): string {${match.substring(45, match.length - 1)}
    // Convert to Arabic numerals if locale is Arabic
    if ($locale === 'ar') {
      const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
      return result.replace(/[0-9]/g, w => arabicNumbers[+w]);
    }
    return result;
  }
${formatNumberDisplayFunc}`;
    });
}

// 2. Modify formatCurrency directly inside the replace (above). 
// Oh wait, my regex replaces the inside. Let's do it carefully.
content = content.replace(/function formatCurrency\(num: number\): string \{[\s\S]*?return "Rp " \+ Math\.round\(num\)\.toLocaleString\("id-ID"\);\s*\}/, (match) => {
    return match.replace(/return "Rp " \+ Math\.round\(num\)\.toLocaleString\("id-ID"\);/, 
`let result = "Rp " + Math.round(num).toLocaleString("id-ID");
    if ($locale === 'ar') {
      const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
      return result.replace(/[0-9]/g, w => arabicNumbers[+w]);
    }
    return result;`);
});

// Wait, the previous replace was a bit dirty. Let's just do a clean replace for formatCurrency.
content = fs.readFileSync(pagePath, 'utf8'); // reload
content = content.replace(/function formatCurrency\(num: number\): string \{[\s\S]*?return "Rp " \+ Math\.round\(num\)\.toLocaleString\("id-ID"\);\s*\}/, 
`$: formatNumberDisplay = (num) => {
    let str = (num ?? "").toString();
    if ($locale === 'ar') {
      const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
      return str.replace(/[0-9]/g, function (w) {
        return arabicNumbers[+w];
      });
    }
    return str;
  };

  $: formatCurrency = (num: number): string => {
    let result = "";
    if (selectedCurrency === 'USD') result = "$ " + Math.round(num).toLocaleString("en-US");
    else if (selectedCurrency === 'SAR') result = "ر.س " + Math.round(num).toLocaleString("ar-SA");
    else if (selectedCurrency === 'CNY') result = "¥ " + Math.round(num).toLocaleString("zh-CN");
    else if (selectedCurrency === 'JPY') result = "¥ " + Math.round(num).toLocaleString("ja-JP");
    else if (selectedCurrency === 'KRW') result = "₩ " + Math.round(num).toLocaleString("ko-KR");
    else result = "Rp " + Math.round(num).toLocaleString("id-ID");

    if ($locale === 'ar') {
      const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
      result = result.replace(/[0-9]/g, w => arabicNumbers[+w]);
    }
    return result;
  }`);

// Also fix any lingering formatCurrency calls that expect it to not be reactive? No, changing from function to reactive variable is fine, but in Svelte, you can just call formatCurrency(val) inside the template. But wait! formatCurrency is used outside the template too? (e.g. in pushResult?)
// Oh! pushResult uses formatCurrency? No, pushResult stores 'amount' as a number, and it is formatted in the template! 
// Let's verify. Yes: {formatCurrency(heir.amount)}

// 3. Replace {count} in the wife buttons
content = content.replace(/\{count\}/g, "{formatNumberDisplay(count)}");

// 4. Replace fractions and percentages in Faraidh results
// {heir.fractionStr} ({heir.percentage.toFixed(1)}%) -> {formatNumberDisplay(heir.fractionStr)} ({formatNumberDisplay(heir.percentage.toFixed(1))}%)
content = content.replace(/\{heir\.fractionStr\}\s*\(\s*\{heir\.percentage\.toFixed\(1\)\}\s*%\s*\)/g, "{formatNumberDisplay(heir.fractionStr)} ({formatNumberDisplay(heir.percentage.toFixed(1))}%)");

// 5. Replace inputs with the overlay trick
const inputRegex = /<input\s+type="number"\s+bind:value=\{([a-zA-Z0-9_]+)\}([^>]*?)class="([^"]*?text-slate-700 dark:text-slate-200[^"]*?)"([^>]*?)>/g;
content = content.replace(inputRegex, (match, p1, p2, p3, p4) => {
    return `<div class="relative flex items-center justify-center w-full h-full">
                {#if $locale === 'ar'}
                  <span class="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-700 dark:text-slate-200 pointer-events-none bg-transparent">{formatNumberDisplay(${p1})}</span>
                {/if}
                <input type="number" bind:value={${p1}}${p2}class="${p3} { $locale === 'ar' ? 'text-transparent dark:text-transparent selection:bg-transparent' : '' }"${p4}>
              </div>`;
});

fs.writeFileSync(pagePath, content, 'utf8');
console.log("Arabic numeral overlay and formatting injected successfully!");
