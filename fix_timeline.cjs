const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'routes', 'timeline', '+page.svelte');
let s = fs.readFileSync(file, 'utf8');

// Fix 1: Parameter 'name' implicitly has an 'any' type.
s = s.replace(/const isMe = \(name\) => name === \$authStore\.user\?\.name;/, 'const isMe = (name: string) => name === $authStore.user?.name;');

// Fix 2: Element implicitly has an 'any' type...
s = s.replace(/const replies = \{\};/, 'const replies: Record<string, any[]> = {};');

// Fix 3: Cannot find name 'showToastNotification' -> triggerAlert
s = s.replace(/showToastNotification/g, 'triggerAlert');

// Fix 4: Property 'description' does not exist on type 'MemoryItem'.
s = s.replace(/downloads_count: number;\s*likes_bonus: number;/, 'downloads_count: number;\n    likes_bonus: number;\n    description?: string;');

// Fix 5: Property 'style' does not exist on type 'EventTarget & Element'
s = s.replace(/on:error=\{\(e\) => \{ e\.currentTarget\.style\.display\s*=\s*'none'; \}\}/g, 'on:error={(e) => { (e.currentTarget as HTMLImageElement).style.display = \\\'none\\\'; }}');

// Fix 6: 'selectedMemory' is possibly 'null'
s = s.replace(/deleteComment\(comment\.id, selectedMemory\.id\)/g, 'deleteComment(comment.id, selectedMemory!.id)');
s = s.replace(/submitComment\(selectedMemory\.id\)/g, 'submitComment(selectedMemory!.id)');

fs.writeFileSync(file, s);
console.log('Fixed timeline/+page.svelte');
