const fs = require('fs'); 
let s = fs.readFileSync('src/routes/+page.svelte', 'utf8'); 
let idx = s.indexOf('@keyframes marqueeRight {'); 
if (idx !== -1) { 
  s = s.substring(0, idx) + `@keyframes marqueeRight {
    0% {
      transform: translateX(-50%);
    }
    100% {
      transform: translateX(0);
    }
  }

  .animate-marquee-right {
    animation: marqueeRight 35s linear infinite;
  }

  :global(html.font-amiri .jadwal-sholat-widget),
  :global(html.font-amiri .jadwal-sholat-widget *),
  :global(html.font-amiri .date-widget),
  :global(html.font-amiri .date-widget *) {
    font-family: 'Amiri', serif !important;
  }
</style>
`; 
  fs.writeFileSync('src/routes/+page.svelte', s); 
}
