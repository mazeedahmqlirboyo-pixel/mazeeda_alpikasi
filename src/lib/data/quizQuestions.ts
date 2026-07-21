export type QuizQuestion = {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
};

export const quizData: Record<string, QuizQuestion[]> = {
  ula: [
    {
      question: "Siapakah Nabi yang memiliki mu'jizat dapat membelah lautan dengan tongkatnya?",
      options: ["Nabi Ibrahim AS", "Nabi Musa AS", "Nabi Isa AS", "Nabi Nuh AS"],
      correct: 1,
      explanation: "Nabi Musa AS diberikan mu'jizat oleh Allah membelah Laut Merah untuk menyelamatkan Bani Israil dari kejaran Firaun."
    },
    {
      question: "Sholat fardhu manakah yang tidak memiliki sholat sunnah rawatib ba'diyah (sesudahnya)?",
      options: ["Dzuhur dan Ashar", "Maghrib dan Isya", "Subuh dan Ashar", "Hanya Subuh"],
      correct: 2,
      explanation: "Sholat Subuh dan Ashar tidak memiliki sholat sunnah Ba'diyah. Sholat setelahnya diharamkan hingga matahari terbit/terbenam."
    },
    {
      question: "Surah apa yang wajib dibaca setiap rakaat dalam sholat?",
      options: ["Surah Al-Ikhlas", "Surah Yasin", "Surah Al-Fatihah", "Surah Al-Falaq"],
      correct: 2,
      explanation: "Membaca Surah Al-Fatihah adalah salah satu rukun qauli dalam sholat. Tidak sah sholat tanpa membacanya."
    },
    {
      question: "Air yang suci mensucikan (Thohir Muthohhir) biasa disebut juga dengan air?",
      options: ["Air Musta'mal", "Air Mutlak", "Air Mutanajjis", "Air Musyammas"],
      correct: 1,
      explanation: "Air mutlak adalah air yang suci dan dapat digunakan untuk bersuci (wudhu/mandi wajib), seperti air hujan, air sumur, dan air laut."
    },
    {
      question: "Kitab Fiqih dasar yang sering dikaji di pondok pesantren salaf untuk pemula adalah?",
      options: ["Tafsir Jalalain", "Fathul Qorib", "Safinatun Najah", "Alfiyah Ibnu Malik"],
      correct: 2,
      explanation: "Safinatun Najah karya Syekh Salim bin Sumair Al-Hadhrami adalah kitab fiqih dasar bermadzhab Syafi'i yang sangat populer untuk pemula."
    },
    {
      question: "Berapa jumlah rakaat sholat witir paling sedikit?",
      options: ["1 rakaat", "2 rakaat", "3 rakaat", "Tidak ada batasan"],
      correct: 0,
      explanation: "Sholat witir adalah sholat ganjil penutup malam. Jumlah minimalnya adalah 1 rakaat, dan maksimalnya 11 rakaat."
    },
    {
      question: "Sahabat Nabi yang mendapat gelar 'Al-Faruq' (Pemisah kebenaran dan kebatilan) adalah?",
      options: ["Abu Bakar Ash-Shiddiq", "Umar bin Khattab", "Utsman bin Affan", "Ali bin Abi Thalib"],
      correct: 1,
      explanation: "Gelar Al-Faruq diberikan oleh Rasulullah SAW kepada Umar bin Khattab karena keberaniannya membedakan haq dan bathil terang-terangan."
    },
    {
      question: "Peristiwa perjalanan Rasulullah SAW dari Masjidil Haram ke Masjidil Aqsa disebut?",
      options: ["Mi'raj", "Hijrah", "Isra'", "Fathu Makkah"],
      correct: 2,
      explanation: "Isra' adalah perjalanan malam dari Makkah ke Baitul Maqdis (Aqsa), sedangkan Mi'raj adalah naik ke Sidratul Muntaha."
    },
    {
      question: "Zakat yang diwajibkan bagi setiap muslim pada bulan Ramadhan untuk mensucikan jiwa adalah?",
      options: ["Zakat Mal", "Zakat Fitrah", "Zakat Tijarah", "Zakat Ma'din"],
      correct: 1,
      explanation: "Zakat Fitrah dikeluarkan di bulan Ramadhan sebelum Idul Fitri sebesar 1 sha' (kurang lebih 2.5 kg - 3 kg beras)."
    },
    {
      question: "Nabi yang dikenal memiliki kesabaran luar biasa saat diuji dengan penyakit yang lama adalah?",
      options: ["Nabi Zakaria AS", "Nabi Ayyub AS", "Nabi Yunus AS", "Nabi Ya'qub AS"],
      correct: 1,
      explanation: "Nabi Ayyub AS diuji Allah dengan penyakit parah, kehilangan harta, dan anak, namun beliau tetap sabar tak pernah mengeluh."
    }
  ],
  wustha: [
    {
      question: "Dalam Ilmu Nahwu, isim yang i'robnya ditandai dengan kasroh pada posisi nashob adalah?",
      options: ["Isim Mufrod", "Jamak Taksir", "Jamak Muannats Salim", "Asmaul Khomsah"],
      correct: 2,
      explanation: "Jamak Muannats Salim di-nashob-kan dengan harokat kasroh (contoh: رَأَيْتُ الْمُسْلِمَاتِ) sebagai pengecualian dari tanda nashob fathah."
    },
    {
      question: "Perang besar pertama yang dimenangkan oleh umat Islam meskipun jumlah pasukan lebih sedikit adalah?",
      options: ["Perang Uhud", "Perang Khandaq", "Perang Badar", "Perang Tabuk"],
      correct: 2,
      explanation: "Perang Badar (17 Ramadhan 2 H), umat Islam yang berjumlah sekitar 313 orang menang atas 1.000 pasukan musyrikin Quraisy."
    },
    {
      question: "Kitab Al-Hikam yang sangat terkenal dalam dunia tasawuf dikarang oleh siapa?",
      options: ["Imam Al-Ghazali", "Ibnu Atha'illah As-Sakandari", "Syekh Abdul Qodir Al-Jailani", "Imam Asy-Syafi'i"],
      correct: 1,
      explanation: "Kitab Al-Hikam adalah mahakarya Ibnu Atha'illah As-Sakandari, berisi aforisme (kata mutiara) tasawuf yang sangat mendalam."
    },
    {
      question: "Tanda i'rob Rofa' pada Fi'il Mudhore' yang termasuk Af'alul Khomsah adalah dengan?",
      options: ["Dhommah", "Alif", "Wawu", "Tsubutun Nun (Tetapnya huruf Nun)"],
      correct: 3,
      explanation: "Af'alul Khomsah (seperti يَفْعَلُوْنَ) di-rofa'-kan dengan tetapnya nun, di-nashob-kan dan di-jazam-kan dengan membuang nun."
    },
    {
      question: "Berapa jarak perjalanan minimal yang membolehkan seseorang menqashar sholat (menurut mayoritas ulama Syafi'iyah)?",
      options: ["40 KM", "60 KM", "82 KM (2 Marhalah)", "100 KM"],
      correct: 2,
      explanation: "Jarak safar yang membolehkan qashar adalah 2 Marhalah atau setara kurang lebih 80-82 kilometer menurut mayoritas Syafi'iyah."
    },
    {
      question: "Apa hukum dari air musta'mal dalam Madzhab Syafi'i?",
      options: ["Suci Mensucikan", "Suci Tapi Tidak Mensucikan", "Najis", "Makruh"],
      correct: 1,
      explanation: "Air musta'mal (yang sudah digunakan untuk bersuci fardhu) hukumnya Thohir Ghairu Muthohhir (suci dzatnya tapi tidak bisa dipakai bersuci lagi)."
    },
    {
      question: "Peristiwa Fathu Makkah (Pembebasan kota Makkah) terjadi pada tahun berapa Hijriah?",
      options: ["5 Hijriah", "8 Hijriah", "10 Hijriah", "11 Hijriah"],
      correct: 1,
      explanation: "Fathu Makkah terjadi pada bulan Ramadhan tahun ke-8 Hijriah, di mana Rasulullah kembali merebut Makkah tanpa pertumpahan darah."
    },
    {
      question: "Fi'il yang menunjukkan makna perintah dalam ilmu shorof disebut?",
      options: ["Fi'il Mudhore'", "Fi'il Madhi", "Fi'il Amar", "Fi'il Nahi"],
      correct: 2,
      explanation: "Fi'il Amar adalah kata kerja perintah (contoh: اِفْعَلْ). Fi'il Madhi = lampau, Mudhore' = sedang/akan, Nahi = larangan."
    },
    {
      question: "Imam pendiri salah satu dari 4 madzhab yang dilahirkan dalam keadaan yatim dan menghafal Al-Muwaththo' di usia muda adalah?",
      options: ["Imam Abu Hanifah", "Imam Malik", "Imam Asy-Syafi'i", "Imam Ahmad bin Hanbal"],
      correct: 2,
      explanation: "Imam Asy-Syafi'i (Muhammad bin Idris) lahir yatim, dibawa ke Makkah, dan menghafal Al-Qur'an serta kitab Al-Muwaththo' Imam Malik saat masih sangat muda."
    },
    {
      question: "Kalimat مَا (Maa) yang berfungsi me-nashob-kan khobar seperti halnya Laisa (لَيْسَ) disebut Maa apa?",
      options: ["Maa Istifham", "Maa Hijaziyyah", "Maa Maushul", "Maa Zaidah"],
      correct: 1,
      explanation: "Maa Hijaziyyah beramal seperti Laisa, yakni me-rofa'-kan isim dan me-nashob-kan khobar (contoh: مَا هَٰذَا بَشَرًا)."
    }
  ],
  ulya: [
    {
      question: "Kitab Alfiyah Ibnu Malik membahas secara mendalam tentang ilmu apa?",
      options: ["Fiqih", "Tauhid", "Tasawuf", "Nahwu dan Shorof"],
      correct: 3,
      explanation: "Alfiyah Ibnu Malik adalah nadzom fenomenal sejumlah 1.002 bait karya Syekh Jamaluddin Muhammad bin Malik yang berisi kaidah tata bahasa Arab."
    },
    {
      question: "Dalam Ilmu Balaghoh, penyerupaan (tasybih) yang dibuang adat tasybih dan wajh syibih-nya disebut apa?",
      options: ["Tasybih Mursal", "Tasybih Baligh", "Majaz Mursal", "Istia'rah"],
      correct: 1,
      explanation: "Tasybih Baligh adalah bentuk tasybih paling kuat karena adat dan wajh syibih dibuang. Contoh: زَيْدٌ أَسَدٌ (Zaid adalah singa)."
    },
    {
      question: "Siapakah ulama pengarang kitab 'Jam'ul Jawami' yang sangat fenomenal dalam ilmu Ushul Fiqih?",
      options: ["Imam Al-Haramain", "Imam Al-Ghazali", "Tajuddin As-Subki", "Imam Suyuthi"],
      correct: 2,
      explanation: "Jam'ul Jawami' adalah kitab Induk Ushul Fiqih karya Imam Tajuddin As-Subki yang merangkum dari berbagai madzhab."
    },
    {
      question: "Menurut madzhab Syafi'i, menyentuh kulit lawan jenis yang bukan mahram tanpa penghalang hukumnya membatalkan wudhu. Dalil utama yang digunakan dalam Surah Al-Maidah ayat 6 adalah lafadz?",
      options: ["أَوْ جَاءَ أَحَدٌ مِّنكُم", "أَوْ لاَمَسْتُمُ النِّسَاء", "فَتَيَمَّمُوا صَعِيدًا", "وَلَٰكِن يُرِيدُ لِيُطَهِّرَكُمْ"],
      correct: 1,
      explanation: "Lafadz 'Au laamastumun-nisaa' (atau kamu menyentuh perempuan). Syafi'iyah menafsirkan 'menyentuh' secara hakiki (kulit bertemu kulit)."
    },
    {
      question: "Apa syarat utama suatu lafadz disebut sebagai 'Kalam' (كَلَامٌ) menurut Alfiyah Ibnu Malik?",
      options: ["Lafadz yang tersusun dari dua isim", "Lafadz yang berfaedah seperti lafadz 'Istaqim'", "Harus terdiri dari fi'il dan fa'il", "Tersusun dari tiga kata"],
      correct: 1,
      explanation: "Dalam bait Alfiyah disebutkan: كَلَامُنَا لَفْظٌ مُفِيدٌ كَاسْتَقِمْ. Syaratnya: Lafadz, Mufid (Berfaedah memahamkan)."
    },
    {
      question: "Dalam sejarah keilmuan Islam, siapakah yang pertama kali merumuskan kaidah-kaidah Ilmu Ushul Fiqih dalam sebuah kitab khusus (Ar-Risalah)?",
      options: ["Imam Abu Hanifah", "Imam Malik", "Imam Asy-Syafi'i", "Imam Ahmad bin Hanbal"],
      correct: 2,
      explanation: "Imam Asy-Syafi'i adalah bapak Ushul Fiqih karena beliau orang pertama yang membukukannya secara sistematis melalui kitab Ar-Risalah."
    },
    {
      question: "Di dalam bab Mawarits (Faraidh), siapa saja yang mendapat bagian separuh (1/2) harta waris?",
      options: ["Suami (jika tidak ada anak), Anak Perempuan Tunggal, Cucu Perempuan Tunggal, Saudari Kandung Tunggal, Saudari Sebapak Tunggal", "Suami, Istri, Ibu, Bapak", "Anak Laki-laki Tunggal, Anak Perempuan Tunggal", "Kakek, Nenek, Saudara Seibu"],
      correct: 0,
      explanation: "Ada 5 ahli waris yang bisa mendapat bagian 1/2: Suami (tanpa furu'), Bintun (sendiri), Bintu Ibnin (sendiri), Ukhtun Syaqiqoh (sendiri), dan Ukhtun Li-ab (sendiri)."
    },
    {
      question: "Dalam ilmu Mustholahul Hadits, hadits yang diriwayatkan oleh orang banyak dari orang banyak pada tiap thobaqohnya sehingga mustahil mereka sepakat bohong disebut?",
      options: ["Hadits Ahad", "Hadits Hasan", "Hadits Mutawatir", "Hadits Masyhur"],
      correct: 2,
      explanation: "Hadits Mutawatir memberikan faedah ilmu yakin karena diriwayatkan oleh jumlah perawi yang sangat banyak dan terpercaya sejak sahabat hingga mukharij."
    },
    {
      question: "Siapakah pendiri Daulah Bani Abbasiyah yang secara resmi mengakhiri kekuasaan Bani Umayyah?",
      options: ["Harun Ar-Rasyid", "Abu Al-Abbas As-Saffah", "Al-Mansur", "Al-Ma'mun"],
      correct: 1,
      explanation: "Abu Al-Abbas As-Saffah adalah khalifah pertama Bani Abbasiyah yang berkuasa setelah menggulingkan Dinasti Umayyah pada tahun 750 M."
    },
    {
      question: "Kaidah Fiqhiyyah 'Al-Yaqinu Laa Yazaalu Bisy-Syakk' (Keyakinan tidak bisa dihilangkan dengan keraguan) sering diterapkan pada kasus apa?",
      options: ["Jual Beli", "Ragu batal wudhu atau belum", "Hukum pinjam meminjam", "Sistem pembagian waris"],
      correct: 1,
      explanation: "Jika seseorang yakin sudah wudhu, lalu ragu apakah sudah batal atau belum, maka hukumnya ia masih suci (berdasarkan keyakinan awalnya)."
    }
  ]
};
