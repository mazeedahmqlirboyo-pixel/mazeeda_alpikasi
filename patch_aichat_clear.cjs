const fs = require('fs');
const path = require('path');

const localesPath = path.join(__dirname, 'src/lib/i18n');
const files = ['id.json', 'en.json', 'ar.json', 'ja.json', 'ko.json', 'zh.json'];

const clearTranslations = {
  'id.json': {
     "clear_title": "Hapus Riwayat?",
     "clear_desc": "Semua percakapan kamu dengan MAZEEDA AI akan dihapus permanen dan tidak bisa dikembalikan.",
     "clear_confirm": "Ya, Hapus",
     "clear_cancel": "Batal"
  },
  'en.json': {
     "clear_title": "Delete History?",
     "clear_desc": "All your conversations with MAZEEDA AI will be permanently deleted and cannot be recovered.",
     "clear_confirm": "Yes, Delete",
     "clear_cancel": "Cancel"
  },
  'ar.json': {
     "clear_title": "حذف السجل؟",
     "clear_desc": "سيتم حذف جميع محادثاتك مع مزيدا AI بشكل دائم ولا يمكن استرجاعها.",
     "clear_confirm": "نعم، احذف",
     "clear_cancel": "إلغاء"
  },
  'ja.json': {
     "clear_title": "履歴を削除しますか？",
     "clear_desc": "MAZEEDA AIとのすべての会話は完全に削除され、復元することはできません。",
     "clear_confirm": "はい、削除します",
     "clear_cancel": "キャンセル"
  },
  'ko.json': {
     "clear_title": "기록을 삭제하시겠습니까?",
     "clear_desc": "MAZEEDA AI와의 모든 대화가 영구적으로 삭제되며 복구할 수 없습니다.",
     "clear_confirm": "예, 삭제합니다",
     "clear_cancel": "취소"
  },
  'zh.json': {
     "clear_title": "删除历史记录？",
     "clear_desc": "您与 MAZEEDA AI 的所有对话将被永久删除且无法恢复。",
     "clear_confirm": "是的，删除",
     "clear_cancel": "取消"
  }
};

files.forEach(file => {
  const filePath = path.join(localesPath, file);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (data.ai_chat) {
      Object.assign(data.ai_chat, clearTranslations[file]);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    }
  }
});

// Now patch the +page.svelte file
const sveltePath = path.join(__dirname, 'src/routes/ai-chat/+page.svelte');
let content = fs.readFileSync(sveltePath, 'utf8');

// 1. Replace Hapus Riwayat?
content = content.replace("Hapus Riwayat?", "{$t('ai_chat.clear_title')}");

// 2. Replace description
content = content.replace(
  "Semua percakapan kamu dengan MAZEEDA AI akan dihapus permanen dan tidak bisa dikembalikan.",
  "{$t('ai_chat.clear_desc')}"
);

// 3. Replace Ya, Hapus
content = content.replace("Ya, Hapus", "{$t('ai_chat.clear_confirm')}");

// 4. Replace Batal
content = content.replace(">Batal<", ">{$t('ai_chat.clear_cancel')}<");

fs.writeFileSync(sveltePath, content, 'utf8');
console.log('Clear chat patch complete.');
