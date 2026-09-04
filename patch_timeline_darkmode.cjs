const fs = require('fs');
const path = require('path');

const sveltePath = path.join(__dirname, 'src/routes/timeline/+page.svelte');
let content = fs.readFileSync(sveltePath, 'utf8');

// Header View Mode Buttons
content = content.replace(
  /class="flex items-center bg-white\/60 backdrop-blur-sm rounded-lg border border-slate-200 p-1 shadow-sm mr-2 sm:mr-0 gap-0\.5"/g,
  'class="flex items-center bg-white/60 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg border border-slate-200 dark:border-slate-700 p-1 shadow-sm mr-2 sm:mr-0 gap-0.5"'
);

content = content.replace(
  /'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'/g,
  "'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'"
);

// Card main container
content = content.replace(
  /class="group bg-white border border-slate-200\/60 hover:border-primary\/20 hover:shadow-soft-md {viewMode === 'small' \? 'rounded-xl' : 'rounded-2xl'} overflow-hidden transition-premium flex flex-col h-full cursor-pointer relative"/g,
  'class="group bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 hover:border-primary/20 dark:hover:border-primary/40 hover:shadow-soft-md {viewMode === \'small\' ? \'rounded-xl\' : \'rounded-2xl\'} overflow-hidden transition-premium flex flex-col h-full cursor-pointer relative"'
);

// Category Badge
content = content.replace(
  /class="absolute top-3 left-3 z-20 bg-white\/95 backdrop-blur-sm border border-slate-200\/40 rounded-lg px-2\.5 py-0\.5 shadow-soft-sm"/g,
  'class="absolute top-3 left-3 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-slate-200/40 dark:border-slate-800 rounded-lg px-2.5 py-0.5 shadow-soft-sm"'
);

// Card Text Colors
content = content.replace(
  /class="font-extrabold text-slate-800 text-\[11px\] truncate leading-snug group-hover:text-primary transition-colors"/g,
  'class="font-extrabold text-slate-800 dark:text-slate-100 text-[11px] truncate leading-snug group-hover:text-primary transition-colors"'
);

content = content.replace(
  /class="font-extrabold text-slate-800 text-base leading-snug group-hover:text-primary transition-colors line-clamp-2"/g,
  'class="font-extrabold text-slate-800 dark:text-slate-100 text-base leading-snug group-hover:text-primary transition-colors line-clamp-2"'
);

content = content.replace(
  /class="text-xs text-slate-500 font-normal line-clamp-2 leading-relaxed bg-slate-50\/60 p-2\.5 rounded-xl border border-slate-100"/g,
  'class="text-xs text-slate-500 dark:text-slate-400 font-normal line-clamp-2 leading-relaxed bg-slate-50/60 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800"'
);

content = content.replace(
  /class="flex items-center justify-between border-t border-slate-100 pt-3 relative z-20"/g,
  'class="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 relative z-20"'
);

// Filter Dropdown
content = content.replace(
  /class="absolute right-0 top-full mt-2 w-64 bg-white\/95 backdrop-blur-md rounded-xl shadow-xl border border-slate-200\/60 z-50 overflow-hidden py-1\.5 flex flex-col"/g,
  'class="absolute right-0 top-full mt-2 w-64 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-xl shadow-xl border border-slate-200/60 dark:border-slate-700 z-50 overflow-hidden py-1.5 flex flex-col"'
);

// Lightbox modal container
content = content.replace(
  /class="bg-slate-950 md:bg-white w-full h-full md:h-\[75vh\] md:max-h-\[85vh\] md:max-w-5xl md:rounded-3xl overflow-hidden flex flex-col md:grid md:grid-cols-12 shadow-2xl relative"/g,
  'class="bg-slate-950 md:bg-white md:dark:bg-slate-900 w-full h-full md:h-[75vh] md:max-h-[85vh] md:max-w-5xl md:rounded-3xl overflow-hidden flex flex-col md:grid md:grid-cols-12 shadow-2xl relative"'
);

content = content.replace(
  /class="space-y-2\.5 pb-4 border-b border-slate-200\/60 bg-white -mx-4 -mt-4 p-4 sm:-mx-5 sm:-mt-5 sm:p-5"/g,
  'class="space-y-2.5 pb-4 border-b border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 -mx-4 -mt-4 p-4 sm:-mx-5 sm:-mt-5 sm:p-5"'
);

content = content.replace(
  /class="flex items-start space-x-3 bg-white p-3 rounded-xl border border-slate-200\/40 shadow-soft-sm relative {comment\.parent_id \? 'ml-8 border-l-4 border-l-indigo-300' : ''}"/g,
  'class="flex items-start space-x-3 bg-white dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/40 dark:border-slate-700 shadow-soft-sm relative {comment.parent_id ? \'ml-8 border-l-4 border-l-indigo-300 dark:border-l-indigo-500\' : \'\'}"'
);

content = content.replace(
  /class="py-8 text-center border-2 border-dashed border-slate-200\/60 rounded-2xl bg-white"/g,
  'class="py-8 text-center border-2 border-dashed border-slate-200/60 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-800/20"'
);

content = content.replace(
  /class="p-4 bg-white border-t border-slate-200\/60 shrink-0" style="padding-bottom: max\(16px, env\(safe-area-inset-bottom, 16px\)\);"/g,
  'class="p-4 bg-white dark:bg-slate-900 border-t border-slate-200/60 dark:border-slate-800 shrink-0" style="padding-bottom: max(16px, env(safe-area-inset-bottom, 16px));"'
);

content = content.replace(
  /class="space-y-2\.5 relative z-10 bg-white {replyingToCommentId \? 'pt-2' : ''}"/g,
  'class="space-y-2.5 relative z-10 bg-white dark:bg-slate-900 {replyingToCommentId ? \'pt-2\' : \'\'}"'
);

content = content.replace(
  /class="flex-1 h-7 border border-slate-200 rounded-lg text-xs px-2\.5 bg-slate-50 text-slate-700 outline-none focus:border-primary focus:bg-white"/g,
  'class="flex-1 h-7 border border-slate-200 dark:border-slate-700 rounded-lg text-xs px-2.5 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:border-primary focus:bg-white dark:focus:bg-slate-700"'
);

content = content.replace(
  /class="w-full h-10 border border-slate-200 rounded-xl text-xs px-3 bg-slate-50 text-slate-700 outline-none focus:border-primary focus:bg-white"/g,
  'class="w-full h-10 border border-slate-200 dark:border-slate-700 rounded-xl text-xs px-3 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:border-primary focus:bg-white dark:focus:bg-slate-700"'
);

content = content.replace(
  /class="absolute bottom-full left-0 mb-2 w-full max-h-48 overflow-y-auto bg-white border border-slate-200 shadow-xl rounded-xl z-\[1000\] py-1"/g,
  'class="absolute bottom-full left-0 mb-2 w-full max-h-48 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl rounded-xl z-[1000] py-1"'
);

// Confirmation Modal & Modals
content = content.replace(
  /class="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200"/g,
  'class="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border dark:border-slate-800"'
);

content = content.replace(
  /class="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold h-10 transition-colors"/g,
  'class="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold h-10 transition-colors"'
);

content = content.replace(
  /class="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"/g,
  'class="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border dark:border-slate-800"'
);

content = content.replace(
  /class="w-full rounded-xl border-slate-200 shadow-sm focus:border-rose-500 focus:ring-rose-500 text-sm p-3 resize-none bg-slate-50 focus:bg-white transition-colors"/g,
  'class="w-full rounded-xl border-slate-200 dark:border-slate-700 shadow-sm focus:border-rose-500 focus:ring-rose-500 text-sm p-3 resize-none bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors"'
);

fs.writeFileSync(sveltePath, content, 'utf8');
console.log('Dark mode classes added to Timeline');
