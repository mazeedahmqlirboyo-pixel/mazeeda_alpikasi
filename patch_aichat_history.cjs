const fs = require('fs');
const path = require('path');

const localesPath = path.join(__dirname, 'src/lib/i18n');
const files = ['id.json', 'en.json', 'ar.json', 'ja.json', 'ko.json', 'zh.json'];

const additionalTranslations = {
  'id.json': {
     "history_title": "Riwayat Percakapan",
     "no_history": "Belum ada riwayat percakapan.",
     "untitled_chat": "Obrolan Tanpa Judul"
  },
  'en.json': {
     "history_title": "Conversation History",
     "no_history": "No conversation history yet.",
     "untitled_chat": "Untitled Chat"
  },
  'ar.json': {
     "history_title": "سجل المحادثة",
     "no_history": "لا يوجد سجل محادثة بعد.",
     "untitled_chat": "محادثة بدون عنوان"
  },
  'ja.json': {
     "history_title": "会話履歴",
     "no_history": "会話履歴はまだありません。",
     "untitled_chat": "無題のチャット"
  },
  'ko.json': {
     "history_title": "대화 기록",
     "no_history": "아직 대화 기록이 없습니다.",
     "untitled_chat": "제목 없는 채팅"
  },
  'zh.json': {
     "history_title": "对话历史",
     "no_history": "暂无对话历史记录。",
     "untitled_chat": "无标题对话"
  }
};

files.forEach(file => {
  const filePath = path.join(localesPath, file);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (data.ai_chat) {
      Object.assign(data.ai_chat, additionalTranslations[file]);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    }
  }
});

// Now patch the +page.svelte file
const sveltePath = path.join(__dirname, 'src/routes/ai-chat/+page.svelte');
let content = fs.readFileSync(sveltePath, 'utf8');

// 1. Replace Riwayat Percakapan
content = content.replace("Riwayat Percakapan", "{$t('ai_chat.history_title')}");

// 2. Replace Belum ada riwayat percakapan.
content = content.replace("Belum ada riwayat percakapan.", "{$t('ai_chat.no_history')}");

// 3. Replace Obrolan Tanpa Judul
content = content.replace("'Obrolan Tanpa Judul'", "$t('ai_chat.untitled_chat')");

// 4. Replace date formatting locale
content = content.replace(".toLocaleDateString('id-ID',", ".toLocaleDateString($locale || 'id-ID',");

fs.writeFileSync(sveltePath, content, 'utf8');
console.log('Patch complete.');
