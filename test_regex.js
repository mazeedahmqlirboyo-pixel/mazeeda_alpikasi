const cleanText1 = `نَسْئَلُكَ يَا مَنْ هُوَ اللّٰهُ الَّذِي لَا إِلْٰهَ إِلَّا هُوَ`;
const cleanText2 = `الرَّحْمٰنُ الرَّحِــــــيْمُ الْمَــلِكُ`;

function check(cleanText, label) {
  const letterText = cleanText.replace(/^[^a-zA-Z\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+/, '');
  const startsWithArabic = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(letterText);
  console.log(label, 'starts with Arabic?', startsWithArabic);
}

check(cleanText1, 'Paragraph 1');
check(cleanText2, 'Paragraph 2');
