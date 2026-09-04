const fs = require('fs');
const path = require('path');

const ar = {
  jadwal_sholat: "مواقيت الصلاة",
  next_prayer: "الصلاة القادمة",
  subuh: "الفجر",
  dzuhur: "الظهر",
  jumat: "الجمعة",
  ashar: "العصر",
  maghrib: "المغرب",
  isya: "العشاء",
  tomorrow: "غداً",
  hour_short: "س ",
  minute_short: "د ",
  remaining: "متبقي"
};

const ja = {
  jadwal_sholat: "礼拝の時間",
  next_prayer: "次の礼拝",
  subuh: "ファジュル",
  dzuhur: "ズフル",
  jumat: "金曜礼拝",
  ashar: "アスル",
  maghrib: "マグリブ",
  isya: "イシャー",
  tomorrow: "明日",
  hour_short: "時間 ",
  minute_short: "分 ",
  remaining: "後"
};

const zh = {
  jadwal_sholat: "祈祷时间",
  next_prayer: "下次祈祷",
  subuh: "晨礼",
  dzuhur: "晌礼",
  jumat: "主麻",
  ashar: "晡礼",
  maghrib: "昏礼",
  isya: "宵礼",
  tomorrow: "明天",
  hour_short: "小时 ",
  minute_short: "分钟 ",
  remaining: "后"
};

const ko = {
  jadwal_sholat: "예배 시간",
  next_prayer: "다음 예배",
  subuh: "파즈르",
  dzuhur: "두흐르",
  jumat: "주무아",
  ashar: "아스르",
  maghrib: "마그리브",
  isya: "이샤",
  tomorrow: "내일",
  hour_short: "시간 ",
  minute_short: "분 ",
  remaining: "남음"
};

function updateFile(filename, translations) {
  const p = path.join(__dirname, 'src/lib/i18n', filename);
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  data.prayer_times = translations;
  fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
}

updateFile('ar.json', ar);
updateFile('ja.json', ja);
updateFile('zh.json', zh);
updateFile('ko.json', ko);
