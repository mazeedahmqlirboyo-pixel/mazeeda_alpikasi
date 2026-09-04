const fs = require('fs');
const path = require('path');

const localesPath = path.join(__dirname, 'src/lib/i18n');
const files = ['id.json', 'en.json', 'ar.json', 'ja.json', 'ko.json', 'zh.json'];

const translations = {
  'id.json': {
     "title": "MAZEEDA AI",
     "new_chat": "Obrolan Baru",
     "history": "Riwayat",
     "delete_chat": "Hapus Obrolan Ini",
     "today": "Hari Ini",
     "placeholder": "Tanya apa saja ke MAZEEDA AI...",
     "welcome_prefix": "Assalamu'alaikum",
     "welcome_suffix": "Saya **MAZEEDA AI**, asisten cerdas yang siap menemani hari-harimu.\n\nMau nanya seputar aplikasi, ngobrol santai, curhat, atau minta **buatkan gambar**? Ketik aja di bawah ya! Satset saya jawab. 😊"
  },
  'en.json': {
     "title": "MAZEEDA AI",
     "new_chat": "New Chat",
     "history": "History",
     "delete_chat": "Delete this Chat",
     "today": "Today",
     "placeholder": "Ask MAZEEDA AI anything...",
     "welcome_prefix": "Assalamu'alaikum",
     "welcome_suffix": "I am **MAZEEDA AI**, your smart assistant ready to accompany your day.\n\nWant to ask about the app, have a casual chat, vent, or ask to **generate an image**? Just type below! I'll reply swiftly. 😊"
  },
  'ar.json': {
     "title": "مزيدا AI",
     "new_chat": "محادثة جديدة",
     "history": "السجل",
     "delete_chat": "حذف هذه المحادثة",
     "today": "اليوم",
     "placeholder": "اسأل مزيدا AI عن أي شيء...",
     "welcome_prefix": "السلام عليكم",
     "welcome_suffix": "أنا **مزيدا AI**، مساعدك الذكي المستعد لمرافقة يومك.\n\nهل تريد السؤال عن التطبيق، أو الدردشة، أو طلب **إنشاء صورة**؟ فقط اكتب أدناه! سأرد بسرعة. 😊"
  },
  'ja.json': {
     "title": "MAZEEDA AI",
     "new_chat": "新しいチャット",
     "history": "履歴",
     "delete_chat": "このチャットを削除",
     "today": "今日",
     "placeholder": "MAZEEDA AIに何でも聞いてください...",
     "welcome_prefix": "アッサラームアライクム",
     "welcome_suffix": "私は**MAZEEDA AI**です。あなたの毎日をサポートするスマートアシスタントです。\n\nアプリについて質問したり、雑談したり、悩みを聞いたり、**画像を生成**したりしませんか？下に入力してください！すぐにお答えします。😊"
  },
  'ko.json': {
     "title": "MAZEEDA AI",
     "new_chat": "새 채팅",
     "history": "기록",
     "delete_chat": "이 채팅 삭제",
     "today": "오늘",
     "placeholder": "MAZEEDA AI에게 무엇이든 물어보세요...",
     "welcome_prefix": "앗살라무알라이쿰",
     "welcome_suffix": "저는 **MAZEEDA AI**입니다. 당신의 하루를 함께할 스마트 비서입니다.\n\n앱에 대해 질문하거나, 가볍게 수다를 떨거나, 고민을 이야기하거나, **이미지 생성**을 요청하고 싶으신가요? 아래에 입력하세요! 즉시 답변해 드리겠습니다. 😊"
  },
  'zh.json': {
     "title": "MAZEEDA AI",
     "new_chat": "新聊天",
     "history": "历史记录",
     "delete_chat": "删除此聊天",
     "today": "今天",
     "placeholder": "向 MAZEEDA AI 询问任何事情...",
     "welcome_prefix": "色兰",
     "welcome_suffix": "我是 **MAZEEDA AI**，您的智能助手，随时准备陪伴您的一天。\n\n想询问有关应用程序的信息、闲聊、发泄或要求**生成图像**吗？只需在下面输入！我会迅速回复。😊"
  }
};

files.forEach(file => {
  const filePath = path.join(localesPath, file);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    data.ai_chat = translations[file];
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  }
});

// Now patch the +page.svelte file
const sveltePath = path.join(__dirname, 'src/routes/ai-chat/+page.svelte');
let content = fs.readFileSync(sveltePath, 'utf8');

// 1. Add imports
if (!content.includes("import { t, locale } from 'svelte-i18n';")) {
  content = content.replace("import { authStore } from '$lib/auth';", "import { authStore } from '$lib/auth';\n  import { t, locale } from 'svelte-i18n';\n  import { get } from 'svelte/store';");
}

// 2. Replace hardcoded strings in startNewChat
content = content.replace(
  "`Assalamu'alaikum ${$authStore.user?.name ? 'Kak **' + $authStore.user.name + '**' : 'Kak'}! 👋 Saya **MAZEEDA AI**, asisten cerdas yang siap menemani hari-harimu.\\n\\nMau nanya seputar aplikasi, ngobrol santai, curhat, atau minta **buatkan gambar**? Ketik aja di bawah ya! Satset saya jawab. 😊`",
  "`${get(t)('ai_chat.welcome_prefix')} ${$authStore.user?.name ? '**' + $authStore.user.name + '**' : ''}! 👋 ${get(t)('ai_chat.welcome_suffix')}`"
);

// 3. Replace Obrolan Baru
content = content.replace("let title = 'Obrolan Baru';", "let title = get(t)('ai_chat.new_chat') || 'Obrolan Baru';");
content = content.replace("<Plus class=\"h-4 w-4\" /> Obrolan Baru", "<Plus class=\"h-4 w-4\" /> {$t('ai_chat.new_chat')}");

// 4. Replace Riwayat
content = content.replace("<History class=\"h-4 w-4\" /> Riwayat", "<History class=\"h-4 w-4\" /> {$t('ai_chat.history')}");

// 5. Replace Hapus Obrolan Ini
content = content.replace("<Trash2 class=\"h-4 w-4\" /> Hapus Obrolan Ini", "<Trash2 class=\"h-4 w-4\" /> {$t('ai_chat.delete_chat')}");

// 6. Replace Hari Ini
content = content.replace("<span class=\"px-3 text-xs font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full py-1 shadow-sm\">\n              Hari Ini\n            </span>", "<span class=\"px-3 text-xs font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full py-1 shadow-sm\">\n              {$t('ai_chat.today')}\n            </span>");

// 7. Replace Placeholder
content = content.replace("placeholder=\"Tanya apa saja ke MAZEEDA AI...\"", "placeholder={$t('ai_chat.placeholder')}");

// 8. Inject AI System Instruction Language Prompt
const promptOriginal = "Jangan pernah bilang kamu hanya AI buatan OpenAI, karena kamu adalah MAZEEDA AI.";
const promptNew = "Jangan pernah bilang kamu hanya AI buatan OpenAI, karena kamu adalah MAZEEDA AI.\\n\\n[CRITICAL INSTRUCTION]: You MUST reply to the user using the language specified by this ISO code: ${get(locale)}. All your responses, explanations, greetings, and jokes must be in this language.";
content = content.replace(promptOriginal, promptNew);

// 9. Update header text if it's there
content = content.replace(/MAZEEDA AI<\/h1>/g, "{$t('ai_chat.title')}</h1>");
content = content.replace(/MAZEEDA AI<\/span>/g, "{$t('ai_chat.title')}</span>");

fs.writeFileSync(sveltePath, content, 'utf8');
console.log('Patch complete.');
