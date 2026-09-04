const fs = require('fs');
const path = require('path');
const i18nDir = 'src/lib/i18n';
const langs = ['ar.json', 'en.json', 'id.json', 'ja.json', 'ko.json', 'zh.json'];

const data = {
  'id.json': {
    'quiz_section': 'Uji Pengetahuanmu',
    'quiz_badge': '🎉 Mini Game Baru!',
    'quiz_title': 'Kuis Cerdas Cermat Islami',
    'quiz_desc': 'Uji seberapa jauh pengetahuan agamamu! Ada pertanyaan seputar Fiqih, Nahwu, dan Sejarah.',
    'khasanah_section': 'Khasanah Lirboyo',
    'khasanah_badge': '📖 Profil & Sejarah',
    'khasanah_title': 'Jejak Lirboyo & Mozaik Murobbi',
    'khasanah_desc': 'Selami nilai-nilai sejarah, filosofi, dan profil lengkap Pondok Pesantren Lirboyo beserta pesan-pesan Masyayikh.',
    'pengurus_section': 'Kepengurusan',
    'pengurus_badge': '👥 Kepengurusan Santri',
    'pengurus_title': 'Kenangan Kepengurusan Santri',
    'pengurus_desc': 'Jelajahi rekam jejak kepengurusan siswi yang pernah menjabat pada periode tahun ajaran 2026 - 2032.'
  },
  'en.json': {
    'quiz_section': 'Test Your Knowledge',
    'quiz_badge': '🎉 New Mini Game!',
    'quiz_title': 'Islamic Quiz Trivia',
    'quiz_desc': 'Test how far your religious knowledge goes! There are questions about Fiqh, Nahwu, and History.',
    'khasanah_section': 'Lirboyo Heritage',
    'khasanah_badge': '📖 Profile & History',
    'khasanah_title': 'Lirboyo Traces & Murobbi Mosaic',
    'khasanah_desc': 'Dive into the historical values, philosophy, and complete profile of the Lirboyo Islamic Boarding School along with the messages of the Masyayikh.',
    'pengurus_section': 'Management',
    'pengurus_badge': '👥 Student Management',
    'pengurus_title': 'Student Management Memories',
    'pengurus_desc': 'Explore the track record of female student management who served in the 2026 - 2032 academic year period.'
  },
  'ar.json': {
    'quiz_section': 'اختبر معلوماتك',
    'quiz_badge': '🎉 لعبة مصغرة جديدة!',
    'quiz_title': 'مسابقة ثقافية إسلامية',
    'quiz_desc': 'اختبر مدى معرفتك الدينية! هناك أسئلة حول الفقه والنحو والتاريخ.',
    'khasanah_section': 'تراث ليربويو',
    'khasanah_badge': '📖 الملف الشخصي والتاريخ',
    'khasanah_title': 'آثار ليربويو وفسيفساء المربي',
    'khasanah_desc': 'اغص في القيم التاريخية والفلسفة والملف الشخصي الكامل لمدرسة ليربويو الإسلامية الداخلية مع رسائل المشايخ.',
    'pengurus_section': 'الإدارة',
    'pengurus_badge': '👥 إدارة الطلاب',
    'pengurus_title': 'ذكريات إدارة الطلاب',
    'pengurus_desc': 'استكشف سجل إدارة الطالبات اللاتي خدمن في فترة العام الدراسي 2026 - 2032.'
  },
  'ja.json': {
    'quiz_section': 'あなたの知識をテストする',
    'quiz_badge': '🎉 新しいミニゲーム！',
    'quiz_title': 'イスラムクイズトリビア',
    'quiz_desc': 'あなたの宗教的知識がどれほどかテストしてください！フィクフ、ナフウ、歴史に関する質問があります。',
    'khasanah_section': 'リルボヨの遺産',
    'khasanah_badge': '📖 プロフィールと歴史',
    'khasanah_title': 'リルボヨの足跡とムロッビモザイク',
    'khasanah_desc': '歴史的価値観、哲学、リルボヨ・イスラム寄宿学校の完全なプロフィール、そしてマシャイヒのメッセージに飛び込んでください。',
    'pengurus_section': '管理',
    'pengurus_badge': '👥 学生管理',
    'pengurus_title': '学生管理の思い出',
    'pengurus_desc': '2026年から2032年の学年度に奉仕した女子学生管理の軌跡を探求してください。'
  },
  'zh.json': {
    'quiz_section': '测试你的知识',
    'quiz_badge': '🎉 新迷你游戏！',
    'quiz_title': '伊斯兰问答测验',
    'quiz_desc': '测试您的宗教知识！包含有关法理学、语法和历史的问题。',
    'khasanah_section': 'Lirboyo 遗产',
    'khasanah_badge': '📖 简介与历史',
    'khasanah_title': 'Lirboyo 痕迹与 Murobbi 马赛克',
    'khasanah_desc': '深入了解历史价值、哲学、Lirboyo 伊斯兰寄宿学校的完整简介以及 Masyayikh 的信息。',
    'pengurus_section': '管理层',
    'pengurus_badge': '👥 学生管理',
    'pengurus_title': '学生管理回忆',
    'pengurus_desc': '探索 2026 - 2032 学年期间任职的女学生管理的往绩。'
  },
  'ko.json': {
    'quiz_section': '당신의 지식을 테스트하세요',
    'quiz_badge': '🎉 새로운 미니 게임!',
    'quiz_title': '이슬람 퀴즈 트리비아',
    'quiz_desc': '당신의 종교적 지식이 얼마나 깊은지 테스트하세요! 피크, 나흐우, 역사에 관한 질문이 있습니다.',
    'khasanah_section': '리르보요 유산',
    'khasanah_badge': '📖 프로필 및 역사',
    'khasanah_title': '리르보요의 발자취와 무로비 모자이크',
    'khasanah_desc': '역사적 가치, 철학, 리르보요 이슬람 기숙 학교의 전체 프로필 및 마샤이크의 메시지에 빠져보세요.',
    'pengurus_section': '관리',
    'pengurus_badge': '👥 학생 관리',
    'pengurus_title': '학생 관리 추억',
    'pengurus_desc': '2026-2032 학년도에 봉사한 여학생 관리의 행적을 탐색하세요.'
  }
};

for (const lang of langs) {
  const fp = path.join(i18nDir, lang);
  let content = JSON.parse(fs.readFileSync(fp, 'utf8'));
  content.extra_features = data[lang];
  fs.writeFileSync(fp, JSON.stringify(content, null, 2));
}
console.log("Done updating extra features i18n");
