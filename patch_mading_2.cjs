const fs = require('fs');
const path = require('path');

const localesPath = path.join(__dirname, 'src/lib/i18n');
const files = ['id.json', 'en.json', 'ar.json', 'ja.json', 'ko.json', 'zh.json'];

const additionalTranslations = {
  'id.json': {
    "comments": "Komentar",
    "reply": "Balas",
    "save": "Simpan",
    "cancel": "Batal",
    "delete": "Hapus",
    "edit": "Edit",
    "type_comment": "Ketik komentar..."
  },
  'en.json': {
    "comments": "Comments",
    "reply": "Reply",
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "type_comment": "Type a comment..."
  },
  'ar.json': {
    "comments": "تعليقات",
    "reply": "رد",
    "save": "حفظ",
    "cancel": "إلغاء",
    "delete": "حذف",
    "edit": "تعديل",
    "type_comment": "اكتب تعليقاً..."
  },
  'ja.json': {
    "comments": "コメント",
    "reply": "返信",
    "save": "保存",
    "cancel": "キャンセル",
    "delete": "削除",
    "edit": "編集",
    "type_comment": "コメントを入力..."
  },
  'ko.json': {
    "comments": "댓글",
    "reply": "답글",
    "save": "저장",
    "cancel": "취소",
    "delete": "삭제",
    "edit": "편집",
    "type_comment": "댓글 쓰기..."
  },
  'zh.json': {
    "comments": "评论",
    "reply": "回复",
    "save": "保存",
    "cancel": "取消",
    "delete": "删除",
    "edit": "编辑",
    "type_comment": "写评论..."
  }
};

files.forEach(file => {
  const filePath = path.join(localesPath, file);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (data.mading) {
      data.mading = { ...data.mading, ...additionalTranslations[file] };
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    }
  }
});
console.log('Mading JSONs 2 patched.');

const sveltePath = path.join(__dirname, 'src/routes/mading/+page.svelte');
let content = fs.readFileSync(sveltePath, 'utf8');

content = content.replace(/>\s*Komentar\s*<\/h4>/g, '>{$t("mading.comments") || "Komentar"}</h4>');
content = content.replace(/>\s*Balas\s*<\/button>/g, '>{$t("mading.reply") || "Balas"}</button>');
content = content.replace(/>\s*Simpan\s*<\/button>/g, '>{$t("mading.save") || "Simpan"}</button>');
content = content.replace(/>\s*Batal\s*<\/button>/g, '>{$t("mading.cancel") || "Batal"}</button>');
content = content.replace(/>\s*Hapus\s*<\/button>/g, '>{$t("mading.delete") || "Hapus"}</button>');
content = content.replace(/placeholder="Ketik komentar..."/g, 'placeholder={$t("mading.type_comment") || "Ketik komentar..."}');

fs.writeFileSync(sveltePath, content, 'utf8');
console.log('Mading svelte 2 patched.');
