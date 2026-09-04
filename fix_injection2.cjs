const fs = require('fs');
const file = 'src/routes/+page.svelte';
let s = fs.readFileSync(file, 'utf8');

// 1. Remove the incorrectly injected functions
const startMarker = '// --- Arabic Format Helpers ---';
const endMarker = 'return String(surahStr);\r\n  }';
const endMarker2 = 'return String(surahStr);\n  }';

let startIndex = s.indexOf(startMarker);
if (startIndex !== -1) {
  let endIndex = s.indexOf(endMarker, startIndex);
  if (endIndex === -1) endIndex = s.indexOf(endMarker2, startIndex);
  if (endIndex !== -1) {
    endIndex += endMarker2.length;
    s = s.substring(0, startIndex) + s.substring(endIndex);
  }
}

// 2. Inject them correctly before </script>
const helpers = `
  // --- Arabic Format Helpers ---
  function formatNumberStr(numStr, loc) {
    if (!numStr) return numStr;
    if (loc === 'ar') {
      const arabicNumbers = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
      return String(numStr).replace(/[0-9]/g, w => arabicNumbers[+w]);
    }
    return String(numStr);
  }

  function translateSurahName(surahStr, loc) {
    if (!surahStr) return surahStr;
    if (loc === 'ar') {
      const mappings = {
        'Al-Fatihah': 'الفاتحة', 'Al-Baqarah': 'البقرة', 'Ali \\'Imran': 'آل عمران',
        'An-Nisa\\'': 'النساء', 'Al-Ma\\'idah': 'المائدة', 'Al-An\\'am': 'الأنعام',
        'Al-A\\'raf': 'الأعراف', 'Al-Anfal': 'الأنفال', 'At-Taubah': 'التوبة',
        'Yunus': 'يونس', 'Hud': 'هود', 'Yusuf': 'يوسف', 'Ar-Ra\\'d': 'الرعد',
        'Ibrahim': 'إبراهيم', 'Al-Hijr': 'الحجر', 'An-Nahl': 'النحل', 'Al-Isra\\'': 'الإسراء',
        'Al-Kahf': 'الكهف', 'Maryam': 'مريم', 'Taha': 'طه', 'Al-Anbiya\\'': 'الأنبياء',
        'Al-Hajj': 'الحج', 'Al-Mu\\'minun': 'المؤمنون', 'An-Nur': 'النور', 'Al-Furqan': 'الفرقان',
        'Asy-Syu\\'ara\\'': 'الشعراء', 'An-Naml': 'النمل', 'Al-Qasas': 'القصص',
        'Al-\\'Ankabut': 'العنكبوت', 'Ar-Rum': 'الروم', 'Luqman': 'لقمان',
        'As-Sajdah': 'السجدة', 'Al-Ahzab': 'الأحزاب', 'Saba\\'': 'سبأ', 'Fatir': 'فاطر',
        'Yasin': 'يس', 'As-Saffat': 'الصافات', 'Sad': 'ص', 'Az-Zumar': 'الزمر',
        'Ghafir': 'غافر', 'Fussilat': 'فصلت', 'Asy-Syura': 'الشورى', 'Az-Zukhruf': 'الزخرف',
        'Ad-Dukhan': 'الدخان', 'Al-Jasiyah': 'الجاثية', 'Al-Ahqaf': 'الأحقاف', 'Muhammad': 'محمد',
        'Al-Fath': 'الفتح', 'Al-Hujurat': 'الحجرات', 'Qaf': 'ق', 'Az-Zariyat': 'الذاريات',
        'At-Tur': 'الطور', 'An-Najm': 'النجم', 'Al-Qamar': 'القمر', 'Ar-Rahman': 'الرحمن',
        'Al-Waqi\\'ah': 'الواقعة', 'Al-Hadid': 'الحديد', 'Al-Mujadalah': 'المجادلة',
        'Al-Hasyr': 'الحشر', 'Al-Mumtahanah': 'الممتحنة', 'As-Saff': 'الصف', 'Al-Jumu\\'ah': 'الجمعة',
        'Al-Munafiqun': 'المنافقون', 'At-Tagabun': 'التغابن', 'At-Talaq': 'الطلاق',
        'At-Tahrim': 'التحريم', 'Al-Mulk': 'الملك', 'Al-Qalam': 'القلم', 'Al-Haqqah': 'الحاقة',
        'Al-Ma\\'arij': 'المعارج', 'Nuh': 'نوح', 'Al-Jinn': 'الجن', 'Al-Muzzammil': 'المزمل',
        'Al-Muddassir': 'المدثر', 'Al-Qiyamah': 'القيامة', 'Al-Insan': 'الإنسان', 'Al-Mursalat': 'المرسلات',
        'An-Naba\\'': 'النبأ', 'An-Nazi\\'at': 'النازعات', 'Abasa': 'عبس', 'At-Takwir': 'التكوير',
        'Al-Infitar': 'الانفطار', 'Al-Mutaffifin': 'المطففين', 'Al-Insyiqaq': 'الانشقاق', 'Al-Buruj': 'البروج',
        'At-Tariq': 'الطارق', 'Al-A\\'la': 'الأعلى', 'Al-Gasyiyah': 'الغاشية', 'Al-Fajr': 'الفجر',
        'Al-Balad': 'البلد', 'Asy-Syams': 'الشمس', 'Al-Lail': 'الليل', 'Ad-Duha': 'الضحى',
        'Asy-Syarh': 'الشرح', 'At-Tin': 'التين', 'Al-\\'Alaq': 'العلق', 'Al-Qadr': 'القدر',
        'Al-Bayyinah': 'البينة', 'Az-Zalzalah': 'الزلزلة', 'Al-\\'Adiyat': 'العاديات', 'Al-Qari\\'ah': 'القارعة',
        'At-Takasur': 'التكاثر', 'Al-\\'Asr': 'العصر', 'Al-Humazah': 'الهمزة', 'Al-Fil': 'الفيل',
        'Quraisy': 'قريش', 'Al-Ma\\'un': 'الماعون', 'Al-Kausar': 'الكوثر', 'Al-Kafirun': 'الكافرون',
        'An-Nasr': 'النصر', 'Al-Lahab': 'المسد', 'Al-Ikhlas': 'الإخلاص', 'Al-Falaq': 'الفلق', 'An-Nas': 'الناس'
      };
      
      let res = String(surahStr).replace('QS. ', '');
      for (const [key, val] of Object.entries(mappings)) {
         if (res.includes(key)) {
            res = res.replace(key, val);
         }
      }
      return 'سورة ' + res;
    }
    return String(surahStr);
  }
`;

s = s.replace(/<\/script>/, helpers + '\n</script>');

fs.writeFileSync(file, s);
console.log("Successfully fixed injection position");
