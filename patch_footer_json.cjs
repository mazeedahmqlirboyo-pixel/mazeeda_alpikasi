const fs = require('fs');
const path = require('path');
const i18nDir = 'src/lib/i18n';
const langs = ['ar.json', 'en.json', 'id.json', 'ja.json', 'ko.json', 'zh.json'];

const data = {
  "id.json": {
    "momen_spesial": "Momen Spesial",
    "wajah_squad": "Wajah-wajah MAZEEDA Squad",
    "copyright": "Hak Cipta ©",
    "tentang_aplikasi": "Tentang Aplikasi",
    "kebijakan_privasi": "Kebijakan Privasi",
    "syarat_ketentuan": "Syarat & Ketentuan",
    "kirim_masukan": "Kirim Masukan"
  },
  "en.json": {
    "momen_spesial": "Special Moments",
    "wajah_squad": "Faces of MAZEEDA Squad",
    "copyright": "Copyright ©",
    "tentang_aplikasi": "About App",
    "kebijakan_privasi": "Privacy Policy",
    "syarat_ketentuan": "Terms & Conditions",
    "kirim_masukan": "Send Feedback"
  },
  "ar.json": {
    "momen_spesial": "لحظات خاصة",
    "wajah_squad": "وجوه فريق مزيدة",
    "copyright": "حقوق النشر ©",
    "tentang_aplikasi": "عن التطبيق",
    "kebijakan_privasi": "سياسة الخصوصية",
    "syarat_ketentuan": "الشروط والأحكام",
    "kirim_masukan": "إرسال ملاحظات"
  },
  "ja.json": {
    "momen_spesial": "特別な瞬間",
    "wajah_squad": "マゼーダスクワッドの顔",
    "copyright": "著作権 ©",
    "tentang_aplikasi": "アプリについて",
    "kebijakan_privasi": "プライバシーポリシー",
    "syarat_ketentuan": "利用規約",
    "kirim_masukan": "フィードバックを送信"
  },
  "zh.json": {
    "momen_spesial": "特别时刻",
    "wajah_squad": "MAZEEDA 小队的面孔",
    "copyright": "版权所有 ©",
    "tentang_aplikasi": "关于应用",
    "kebijakan_privasi": "隐私政策",
    "syarat_ketentuan": "条款与条件",
    "kirim_masukan": "发送反馈"
  },
  "ko.json": {
    "momen_spesial": "특별한 순간",
    "wajah_squad": "마제다 스쿼드의 얼굴들",
    "copyright": "저작권 ©",
    "tentang_aplikasi": "앱 정보",
    "kebijakan_privasi": "개인정보 처리방침",
    "syarat_ketentuan": "이용약관",
    "kirim_masukan": "피드백 보내기"
  }
};

for (const lang of langs) {
  const fp = path.join(i18nDir, lang);
  let content = JSON.parse(fs.readFileSync(fp, 'utf8'));
  content.footer = data[lang];
  fs.writeFileSync(fp, JSON.stringify(content, null, 2));
}

console.log("Done updating footer i18n");
