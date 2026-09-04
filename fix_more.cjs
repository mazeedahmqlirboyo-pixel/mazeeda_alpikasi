const fs = require('fs');
const path = require('path');

const tentangFile = path.join(__dirname, 'src', 'routes', 'tentang', '+page.svelte');
if (fs.existsSync(tentangFile)) {
  let tentangContent = fs.readFileSync(tentangFile, 'utf8');
  // Revert previous failed attempt and use valid Svelte syntax:
  tentangContent = tentangContent.replace(/<svelte:component this=\{\(feature as any\)\.icon\}/g, '<!-- @ts-ignore -->\n                  <svelte:component this={feature.icon}');
  fs.writeFileSync(tentangFile, tentangContent, 'utf8');
  console.log('Fixed tentang/+page.svelte');
}

const timelineFile = path.join(__dirname, 'src', 'routes', 'timeline', '+page.svelte');
if (fs.existsSync(timelineFile)) {
  let timelineContent = fs.readFileSync(timelineFile, 'utf8');
  // Fix TS error: Argument of type 'string | undefined' is not assignable to 'string'
  timelineContent = timelineContent.replace(/deleteComment\(comment\.id, selectedMemory\?\.id\)/g, "deleteComment(comment.id, selectedMemory?.id || '')");
  timelineContent = timelineContent.replace(/submitComment\(selectedMemory\?\.id\)/g, "submitComment(selectedMemory?.id || '')");
  fs.writeFileSync(timelineFile, timelineContent, 'utf8');
  console.log('Fixed timeline/+page.svelte');
}
