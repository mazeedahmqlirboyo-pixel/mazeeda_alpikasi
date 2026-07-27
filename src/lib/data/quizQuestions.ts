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
          "question": "Air yang suci secara dzatnya namun tidak dapat digunakan untuk bersuci (mensucikan yang lain) disebut...",
          "options": [
              "Air Mutlaq",
              "Air Musta'mal",
              "Air Musyammas",
              "Air Mutanajjis"
          ],
          "correct": 1,
          "explanation": "Air musta'mal adalah air yang sudah digunakan untuk fardhu bersuci (wudhu atau mandi wajib) dan tidak ada perubahan pada sifatnya, ia suci tapi tidak bisa mensucikan lagi."
      },
      {
          "question": "Najis yang berasal dari anjing dan babi atau keturunannya digolongkan ke dalam najis...",
          "options": [
              "Mukhaffafah",
              "Mutawassithah",
              "Mughallazah",
              "Ma'fu"
          ],
          "correct": 2,
          "explanation": "Najis mughallazah (najis berat) adalah najis dari anjing dan babi. Cara mensucikannya dengan membasuh tujuh kali, salah satunya dicampur dengan tanah."
      },
      {
          "question": "Berikut ini yang merupakan rukun haji dan tidak dapat diganti dengan dam (denda) jika ditinggalkan adalah...",
          "options": [
              "Mabit di Muzdalifah",
              "Wukuf di Arafah",
              "Melempar Jumrah",
              "Ihram dari Miqat"
          ],
          "correct": 1,
          "explanation": "Wukuf di Arafah adalah rukun haji yang paling utama (Al-Hajju Arafah). Jika ditinggalkan, maka hajinya tidak sah dan tidak bisa diganti dengan dam."
      },
      {
          "question": "Batas nisab zakat emas menurut kesepakatan ulama fiqih adalah setara dengan...",
          "options": [
              "93 gram emas",
              "85 gram emas",
              "75 gram emas",
              "100 gram emas"
          ],
          "correct": 1,
          "explanation": "Nisab emas adalah 20 Dinar, yang dikonversikan dalam satuan gram modern setara dengan kurang lebih 85 gram emas murni."
      },
      {
          "question": "Syarat diperbolehkannya shalat jamak taqdim bagi musafir adalah...",
          "options": [
              "Niat jamak dilakukan pada shalat yang kedua",
              "Tidak harus berurutan (tartib)",
              "Niat jamak dilakukan pada saat shalat yang pertama",
              "Mendahulukan shalat yang rakaatnya lebih sedikit"
          ],
          "correct": 2,
          "explanation": "Pada jamak taqdim, niat untuk menjamak shalat harus dilakukan ketika sedang melaksanakan shalat yang pertama (sebelum salam)."
      },
      {
          "question": "Mandi wajib setelah selesai dari haid merupakan kewajiban bagi wanita. Berikut ini yang merupakan rukun mandi wajib adalah...",
          "options": [
              "Membaca basmalah dan niat",
              "Niat dan meratakan air ke seluruh tubuh",
              "Niat, wudhu, dan membasuh kepala 3 kali",
              "Membersihkan kemaluan dan meratakan air"
          ],
          "correct": 1,
          "explanation": "Dalam madzhab Syafi'i, rukun mandi wajib (janabah) hanya ada dua: Niat dan meratakan air ke seluruh bagian luar tubuh termasuk rambut."
      },
      {
          "question": "Sujud yang dilakukan karena seseorang lupa atau ragu terhadap jumlah rakaat dalam shalatnya disebut...",
          "options": [
              "Sujud Tilawah",
              "Sujud Syukur",
              "Sujud Sahwi",
              "Sujud Rukun"
          ],
          "correct": 2,
          "explanation": "Sujud sahwi dilakukan sebanyak dua kali sebelum salam jika terjadi keraguan jumlah rakaat, tertinggal sunnah ab'adl, atau menambah gerakan rukun karena lupa."
      },
      {
          "question": "Shalat sunnah yang mengiringi shalat fardhu dan sangat dianjurkan (tidak pernah ditinggalkan oleh Nabi SAW) disebut...",
          "options": [
              "Sunnah Mutlaqoh",
              "Sunnah Muakkad",
              "Sunnah Ghairu Muakkad",
              "Sunnah Hajat"
          ],
          "correct": 1,
          "explanation": "Sunnah muakkad adalah sunnah yang sangat ditekankan pengerjaannya, seperti 2 rakaat sebelum subuh atau 2 rakaat sesudah dhuhur."
      },
      {
          "question": "Berapa kadar wajib zakat fitrah per jiwa dalam satuan beras/makanan pokok?",
          "options": [
              "1 Sha' (sekitar 2,5 - 3 kg)",
              "2 Sha' (sekitar 5 kg)",
              "1/2 Sha' (sekitar 1,5 kg)",
              "1 Mud (sekitar 0,6 kg)"
          ],
          "correct": 0,
          "explanation": "Kadar zakat fitrah adalah 1 sha' dari makanan pokok (kurma, gandum, beras), yang disetarakan dengan sekitar 2,5 hingga 3 kilogram."
      },
      {
          "question": "Hukum membaca basmalah (Bismillahir-rahmaanir-rahiim) dalam surah Al-Fatihah ketika shalat menurut mazhab Syafi'i adalah...",
          "options": [
              "Sunnah Muakkad",
              "Makruh",
              "Wajib (bagian dari surat)",
              "Mubah"
          ],
          "correct": 2,
          "explanation": "Mazhab Syafi'i menetapkan bahwa basmalah adalah ayat pertama dari surah Al-Fatihah, sehingga wajib dibaca dalam shalat."
      },
      {
          "question": "Tahun di mana Nabi Muhammad SAW dilahirkan sering disebut sebagai Tahun Gajah, hal ini dikarenakan pada tahun tersebut terjadi peristiwa...",
          "options": [
              "Wabah penyakit gajah di Jazirah Arab",
              "Penyerangan Ka'bah oleh pasukan gajah pimpinan Abrahah",
              "Nabi lahir di atas seekor gajah",
              "Gajah menjadi hewan sembelihan kurban terbanyak"
          ],
          "correct": 1,
          "explanation": "Disebut Tahun Gajah karena raja Abrahah dari Yaman memimpin pasukan bergajah untuk menghancurkan Ka'bah, yang kemudian dihancurkan Allah dengan burung Ababil."
      },
      {
          "question": "Tahun kesedihan (Amul Huzni) bagi Nabi Muhammad SAW ditandai dengan wafatnya dua tokoh penting pembela dakwah beliau, yaitu...",
          "options": [
              "Hamzah dan Abu Bakar",
              "Khadijah dan Abu Thalib",
              "Aminah dan Abdul Muthalib",
              "Ali bin Abi Thalib dan Fatimah"
          ],
          "correct": 1,
          "explanation": "Amul Huzni (Tahun Kesedihan) terjadi pada tahun ke-10 kenabian, di mana istri tercinta beliau, Khadijah RA, dan paman beliau, Abu Thalib, wafat dalam waktu berdekatan."
      },
      {
          "question": "Perjanjian damai yang disepakati antara kaum Muslimin Madinah dan kaum Musyrikin Quraisy pada tahun ke-6 Hijriah disebut...",
          "options": [
              "Perjanjian Aqabah",
              "Perjanjian Hudaibiyah",
              "Piagam Madinah",
              "Perjanjian Thaif"
          ],
          "correct": 1,
          "explanation": "Perjanjian Hudaibiyah adalah perjanjian gencatan senjata selama 10 tahun antara umat Islam dan Quraisy Makkah yang membawa banyak hikmah diplomasi."
      },
      {
          "question": "Masjid yang pertama kali dibangun oleh Rasulullah SAW ketika dalam perjalanan hijrah ke Madinah adalah...",
          "options": [
              "Masjidil Haram",
              "Masjid Nabawi",
              "Masjid Quba",
              "Masjid Qiblatain"
          ],
          "correct": 2,
          "explanation": "Masjid Quba adalah masjid pertama yang dibangun Nabi Muhammad SAW pada tahun 1 Hijriah di daerah Quba, dekat Madinah."
      },
      {
          "question": "Panglima Islam yang terkenal keberaniannya menaklukkan wilayah Al-Andalus (Spanyol) dan namanya diabadikan menjadi nama sebuah selat adalah...",
          "options": [
              "Khalid bin Walid",
              "Amru bin Ash",
              "Thariq bin Ziyad",
              "Salahuddin Al-Ayyubi"
          ],
          "correct": 2,
          "explanation": "Thariq bin Ziyad adalah jenderal Bani Umayyah yang menaklukkan semenanjung Iberia. Tempat ia mendarat dikenal sebagai Jabal Tariq (Gibraltar)."
      },
      {
          "question": "Sahabat Nabi SAW yang mendapat gelar 'Dzun Nurain' (Pemilik Dua Cahaya) karena menikahi dua putri Rasulullah adalah...",
          "options": [
              "Abu Bakar Ash-Shiddiq",
              "Umar bin Khattab",
              "Utsman bin Affan",
              "Ali bin Abi Thalib"
          ],
          "correct": 2,
          "explanation": "Utsman bin Affan mendapat gelar Dzun Nurain karena menikahi putri Nabi, Ruqayyah RA. Setelah Ruqayyah wafat, ia dinikahkan dengan Ummu Kultsum RA."
      },
      {
          "question": "Dinasti Abbasiyah mencapai puncak masa kejayaannya dalam bidang ilmu pengetahuan dan peradaban pada masa pemerintahan khalifah...",
          "options": [
              "Abu Ja'far Al-Manshur",
              "Harun Ar-Rasyid",
              "Al-Mu'tashim Billah",
              "Umar bin Abdul Aziz"
          ],
          "correct": 1,
          "explanation": "Pada masa Harun Ar-Rasyid (dan diteruskan putranya Al-Ma'mun), Baghdad menjadi pusat ilmu pengetahuan dunia dengan berdirinya Baitul Hikmah."
      },
      {
          "question": "Perang besar pertama antara umat Islam dan kaum musyrikin Quraisy yang terjadi pada bulan Ramadhan tahun 2 Hijriah adalah...",
          "options": [
              "Perang Uhud",
              "Perang Khandaq",
              "Perang Badar",
              "Perang Hunain"
          ],
          "correct": 2,
          "explanation": "Perang Badar Al-Kubra terjadi pada 17 Ramadhan tahun ke-2 Hijriah, di mana 313 kaum muslimin mengalahkan sekitar 1.000 pasukan musyrikin Makkah."
      },
      {
          "question": "Bani Umayyah di Damaskus didirikan pada tahun 41 H (661 M). Pendiri sekaligus khalifah pertamanya adalah...",
          "options": [
              "Muawiyah bin Abu Sufyan",
              "Yazid bin Muawiyah",
              "Abdul Malik bin Marwan",
              "Umar bin Abdul Aziz"
          ],
          "correct": 0,
          "explanation": "Muawiyah bin Abu Sufyan adalah pendiri Daulah Umayyah setelah peristiwa Amul Jama'ah (Tahun Persatuan) saat Hasan bin Ali menyerahkan kekhalifahan kepadanya."
      },
      {
          "question": "Ilmuwan muslim penemu angka nol dan peletak dasar ilmu Aljabar (Matematika) adalah...",
          "options": [
              "Ibnu Sina",
              "Al-Khawarizmi",
              "Al-Kindi",
              "Jabir bin Hayyan"
          ],
          "correct": 1,
          "explanation": "Muhammad bin Musa Al-Khawarizmi adalah ilmuwan matematika muslim yang menulis kitab Al-Jabr wa Al-Muqabala, cikal bakal ilmu Aljabar modern."
      },
      {
          "question": "Sifat wajib bagi Allah 'Qiyamuhu Binafsihi' memiliki arti...",
          "options": [
              "Berbeda dengan makhluk-Nya",
              "Berdiri sendiri (tidak membutuhkan bantuan)",
              "Maha Mengetahui",
              "Esa atau Tunggal"
          ],
          "correct": 1,
          "explanation": "Qiyamuhu binafsihi berarti Allah SWT berdiri sendiri, tidak membutuhkan tempat maupun bantuan dari makhluk apapun."
      },
      {
          "question": "Malaikat yang bertugas meniup sangkakala (terompet) pada hari kiamat dan hari kebangkitan adalah...",
          "options": [
              "Malaikat Jibril",
              "Malaikat Mikail",
              "Malaikat Israfil",
              "Malaikat Izrail"
          ],
          "correct": 2,
          "explanation": "Malaikat Israfil ditugaskan oleh Allah untuk meniup sangkakala (Shur). Tiupan pertama membinasakan makhluk, tiupan kedua membangkitkan mereka kembali."
      },
      {
          "question": "Meyakini dengan sepenuh hati, mengucapkan dengan lisan, dan mengamalkan dengan anggota badan merupakan definisi dari...",
          "options": [
              "Islam",
              "Iman",
              "Ihsan",
              "Taqwa"
          ],
          "correct": 1,
          "explanation": "Menurut ulama Ahlussunnah wal Jama'ah, definisi iman mencakup tiga unsur tersebut: At-Tashdiqu bil Qalbi, wal Iqraru bil Lisan, wal 'Amalu bil Arkan."
      },
      {
          "question": "Rasul-rasul yang memiliki ketabahan dan kesabaran yang luar biasa dalam menghadapi cobaan dakwah diberi gelar...",
          "options": [
              "Ulil Albab",
              "Ulul Azmi",
              "Khatamun Nabiyyin",
              "Al-Amin"
          ],
          "correct": 1,
          "explanation": "Ulul Azmi adalah rasul-rasul pilihan yang memiliki keteguhan hati luar biasa. Mereka adalah Nuh, Ibrahim, Musa, Isa, dan Muhammad (alaihimus-salam)."
      },
      {
          "question": "Perbuatan menyekutukan Allah SWT dengan sesuatu yang lain, dan merupakan dosa terbesar yang tidak akan diampuni jika dibawa mati tanpa taubat, disebut...",
          "options": [
              "Nifaq",
              "Kufur",
              "Fasiq",
              "Syirik"
          ],
          "correct": 3,
          "explanation": "Syirik adalah dosa menyekutukan Allah. Syirik akbar membatalkan keislaman dan pelakunya diancam neraka kekal jika tidak bertaubat sebelum mati."
      },
      {
          "question": "Hari di mana amal perbuatan manusia akan ditimbang untuk menentukan balasannya di akhirat disebut...",
          "options": [
              "Yaumul Ba'ats",
              "Yaumul Mahsyar",
              "Yaumul Mizan",
              "Yaumul Jaza'"
          ],
          "correct": 2,
          "explanation": "Yaumul Mizan artinya hari penimbangan. Seluruh amal baik dan buruk manusia akan ditimbang dengan timbangan keadilan Allah."
      },
      {
          "question": "Sifat mustahil bagi Allah adalah 'Fana', yang artinya...",
          "options": [
              "Terbilang (banyak)",
              "Baru",
              "Bodoh",
              "Binasa (hancur)"
          ],
          "correct": 3,
          "explanation": "Fana berarti binasa atau memiliki akhir. Ini adalah lawan dari sifat wajib 'Baqa' (Kekal)."
      },
      {
          "question": "Nama-nama Allah yang baik dan indah disebut Asmaul Husna. Salah satunya adalah 'Al-Ghaffar' yang berarti...",
          "options": [
              "Maha Pengasih",
              "Maha Pengampun",
              "Maha Pemberi Rezeki",
              "Maha Perkasa"
          ],
          "correct": 1,
          "explanation": "Al-Ghaffar berasal dari kata ghafara yang berarti menutupi. Secara istilah berarti Allah Maha Pengampun terhadap dosa-dosa hamba-Nya."
      },
      {
          "question": "Rukun Iman yang keenam adalah percaya kepada...",
          "options": [
              "Hari Akhir",
              "Qada dan Qadar",
              "Rasul-rasul Allah",
              "Kitab-kitab Allah"
          ],
          "correct": 1,
          "explanation": "Berdasarkan hadits Jibril, Rukun Iman ada 6: Iman kepada Allah, Malaikat, Kitab, Rasul, Hari Kiamat, dan Qada & Qadar (Takdir baik maupun buruk)."
      },
      {
          "question": "Kitab suci Zabur diturunkan oleh Allah SWT kepada nabi...",
          "options": [
              "Musa AS",
              "Isa AS",
              "Daud AS",
              "Ibrahim AS"
          ],
          "correct": 2,
          "explanation": "Kitab Zabur diturunkan kepada Nabi Daud AS, berisi puji-pujian (mazmur), dzikir, dan nasihat, tanpa syariat baru."
      },
      {
          "question": "Apabila ada Nun Mati (نْ) atau Tanwin (ـً ـٍ ـٌ) bertemu dengan huruf Ba (ب), maka hukum bacaannya adalah...",
          "options": [
              "Idzhar Halqi",
              "Idgham Bighunnah",
              "Ikhfa Haqiqi",
              "Iqlab"
          ],
          "correct": 3,
          "explanation": "Iqlab secara bahasa berarti menukar. Jika nun mati/tanwin bertemu Ba, suara nun ditukar menjadi suara mim mati yang disertai dengung."
      },
      {
          "question": "Huruf Idzhar Halqi berjumlah enam, yaitu...",
          "options": [
              "ي، ن، م، و (Ya, Nun, Mim, Wawu)",
              "ح، خ، ع، غ، أ، هـ (Ha, Kha, 'Ain, Ghain, Hamzah, Ha)",
              "ب (Ba)",
              "ل، ر (Lam, Ra)"
          ],
          "correct": 1,
          "explanation": "Idzhar Halqi terjadi jika nun mati/tanwin bertemu salah satu huruf tenggorokan (halqi) yaitu Hamzah, Ha, 'Ain, Ha, Ghain, Kha."
      },
      {
          "question": "Mad Thabi'i (Mad Asli) dibaca panjang dengan ukuran...",
          "options": [
              "1 harakat (1/2 alif)",
              "2 harakat (1 alif)",
              "4 harakat (2 alif)",
              "6 harakat (3 alif)"
          ],
          "correct": 1,
          "explanation": "Mad Thabi'i dibaca dengan panjang 2 harakat (ketukan) atau setara dengan durasi mengucapkan satu huruf alif."
      },
      {
          "question": "Hukum Mim Mati (مْ) apabila bertemu dengan huruf Ba (ب) disebut...",
          "options": [
              "Idgham Mimi",
              "Idzhar Syafawi",
              "Ikhfa Syafawi",
              "Iqlab"
          ],
          "correct": 2,
          "explanation": "Ikhfa Syafawi terjadi ketika mim mati bertemu Ba. Dibaca samar-samar di bibir (syafawi) sambil mendengung."
      },
      {
          "question": "Huruf Qalqalah ada lima (ق، ط، ب، ج، د). Apabila huruf Qalqalah tersebut berharakat sukun asli di tengah kalimat, maka hukum bacaannya adalah...",
          "options": [
              "Qalqalah Sugra",
              "Qalqalah Kubra",
              "Qalqalah Akbar",
              "Qalqalah Thabi'i"
          ],
          "correct": 0,
          "explanation": "Qalqalah Sugra (kecil) terjadi jika huruf qalqalah mati/sukun di tengah kata. Pantulannya dibaca ringan."
      },
      {
          "question": "Apabila ada huruf Mad Thabi'i bertemu dengan huruf Hamzah (ء) dalam satu kata/kalimat, maka hukum bacaannya disebut...",
          "options": [
              "Mad Jaiz Munfashil",
              "Mad Wajib Muttashil",
              "Mad 'Aridl Lissukun",
              "Mad Badal"
          ],
          "correct": 1,
          "explanation": "Mad Wajib Muttashil (bersambung) terjadi karena mad bertemu hamzah dalam satu kata. Wajib dibaca panjang 4 atau 5 harakat."
      },
      {
          "question": "Cara membaca huruf Ra (ر) jika ia berharakat Kasrah ( رِ ) adalah...",
          "options": [
              "Tafkhim (ditebalkan)",
              "Tarqiq (ditipiskan)",
              "Jawazul Wajhain (boleh tebal/tipis)",
              "Idgham (dimasukkan)"
          ],
          "correct": 1,
          "explanation": "Huruf Ra berharakat kasrah wajib dibaca Tarqiq (tipis), dengan cara merendahkan pangkal lidah."
      },
      {
          "question": "Hukum bacaan Alif Lam (ال) apabila bertemu dengan huruf Syin (ش) disebut...",
          "options": [
              "Idzhar Qamariyah",
              "Idgham Syamsiyah",
              "Idzhar Halqi",
              "Ikhfa Syafawi"
          ],
          "correct": 1,
          "explanation": "Syin adalah salah satu huruf Syamsiyah. Alif lam tidak dibaca jelas, melainkan dileburkan (diidghamkan) ke dalam huruf Syin."
      },
      {
          "question": "Dalam ilmu Nahwu, kalimat (kata) dibagi menjadi tiga macam, yaitu...",
          "options": [
              "Mubtada, Khabar, Fa'il",
              "Isim, Fi'il, Huruf",
              "Rafa, Nashab, Jar",
              "Madhi, Mudhari, Amr"
          ],
          "correct": 1,
          "explanation": "Pembagian kata (Al-Kalimah) dalam bahasa Arab menurut ilmu Nahwu hanya ada tiga: Isim (Kata Benda), Fi'il (Kata Kerja), dan Huruf (Kata Tugas)."
      },
      {
          "question": "Tanda asli dari I'rab Rafa' pada Isim Mufrad (kata benda tunggal) adalah...",
          "options": [
              "Fathah",
              "Kasrah",
              "Dhommah",
              "Alif"
          ],
          "correct": 2,
          "explanation": "Tanda asal (pokok) untuk i'rab rafa' adalah dhommah. Tanda-tanda penggantinya adalah wawu, alif, dan tetapnya nun."
      },
      {
          "question": "Isim marfu' yang terletak di awal jumlah ismiyah (kalimat nominal) disebut...",
          "options": [
              "Fa'il",
              "Na'ibul Fa'il",
              "Mubtada",
              "Khabar"
          ],
          "correct": 2,
          "explanation": "Mubtada adalah subjek dalam struktur kalimat nominal bahasa Arab, selalu dibaca marfu' (biasanya ditandai dhommah) dan terletak di awal."
      },
      {
          "question": "Di antara huruf-huruf di bawah ini, yang termasuk ke dalam Huruf Jar (huruf yang mengkasrahkan isim setelahnya) adalah...",
          "options": [
              "Inna, Anna, Ka'anna",
              "Lam, Lamma, Lan",
              "Min, Ila, 'An, 'Ala, Fi",
              "Hal, A, Man"
          ],
          "correct": 2,
          "explanation": "Huruf Jar (Mina, Ila, 'An, 'Ala, Fi, Rubba, Ba, Kaf, Lam) bertugas mema-jarr-kan (biasanya kasrah) isim yang berada setelahnya."
      },
      {
          "question": "Amal (tugas) dari amil 'Inna wa Akhwatuha' (إِنَّ وَأَخَوَاتُهَا) terhadap kalimat susunan Mubtada dan Khabar adalah...",
          "options": [
              "Merafa'kan Mubtada dan Merafa'kan Khabar",
              "Menashabkan Mubtada dan Merafa'kan Khabar",
              "Merafa'kan Mubtada dan Menashabkan Khabar",
              "Menashabkan Mubtada dan Menashabkan Khabar"
          ],
          "correct": 1,
          "explanation": "Inna dan saudara-saudaranya beramal menashabkan isimnya (asalnya mubtada) dan merafa'kan khabarnya (Tanshibul Isma wa Tarfa'ul Khabar)."
      },
      {
          "question": "Isim yang menunjukkan kepada orang atau pihak yang melakukan suatu pekerjaan dalam jumlah fi'liyah disebut...",
          "options": [
              "Maf'ul bih",
              "Fa'il",
              "Hal",
              "Tamyiz"
          ],
          "correct": 1,
          "explanation": "Fa'il adalah subjek dalam kalimat verbal (jumlah fi'liyah), kedudukannya harus dirafa'kan dan posisinya berada setelah Fi'il (kata kerja)."
      },
      {
          "question": "Wazan (timbangan kata) dasar untuk Fi'il Madhi Tsulasi Mujarrad (tiga huruf asli tanpa tambahan) secara umum adalah...",
          "options": [
              "فَعَّلَ (Fa'ala dengan tasydid)",
              "فَاعَلَ (Faa'ala)",
              "فَعَلَ (Fa'ala)",
              "أَفْعَلَ (Af'ala)"
          ],
          "correct": 2,
          "explanation": "Tsulasi mujarrad adalah kata kerja asli tiga huruf tanpa huruf tambahan. Wazannya ada tiga: Fa'ala (فَعَلَ), Fa'ila (فَعِلَ), dan Fa'ula (فَعُلَ)."
      },
      {
          "question": "Bentuk Fi'il Amar (kata kerja perintah) dari kata جَلَسَ - يَجْلِسُ (Jalasa - Yajlisu) adalah...",
          "options": [
              "اِجْلَسْ (Ijlas)",
              "اِجْلِسْ (Ijlis)",
              "اُجْلُسْ (Ujlus)",
              "مَجْلِسْ (Majlis)"
          ],
          "correct": 1,
          "explanation": "Karena 'ain fi'il pada fi'il mudhari'nya dikasrah (yajLisu), maka hamzah washal pada fi'il amar juga dikasrah menjadi Ijlis (اِجْلِسْ)."
      },
      {
          "question": "Kata 'مَكْتُوْبٌ' (Maktubun) yang berarti 'sesuatu yang ditulis', dalam ilmu shorof merupakan bentuk dari...",
          "options": [
              "Isim Fa'il",
              "Isim Makan",
              "Mashdar",
              "Isim Maf'ul"
          ],
          "correct": 3,
          "explanation": "Maktubun mengikuti wazan مَفْعُوْلٌ (Maf'ulun), yang merupakan bentuk Isim Maf'ul (kata benda yang dikenai pekerjaan / objek)."
      },
      {
          "question": "Fi'il yang salah satu huruf aslinya berupa huruf illat (Wawu, Alif, atau Ya) disebut...",
          "options": [
              "Fi'il Shahih",
              "Fi'il Mu'tal",
              "Fi'il Salim",
              "Fi'il Mudha'af"
          ],
          "correct": 1,
          "explanation": "Fi'il Mu'tal adalah fi'il yang mengandung huruf penyakit/illat (ا، و، ي), seperti kata Qoola (قال) atau Wa'ada (وعد)."
      },
      {
          "question": "Bentuk Mashdar (kata dasar yang dibendakan) dari fi'il نَصَرَ (Nashara - menolong) adalah...",
          "options": [
              "نَاصِرٌ (Naashirun)",
              "مَنْصُوْرٌ (Manshuurun)",
              "نَصْرًا (Nashran)",
              "مَنْصَرٌ (Mansharun)"
          ],
          "correct": 2,
          "explanation": "Mashdar dari nashara - yanshuru dalam tashrif ushul adalah nashran (نَصْرًا) yang berarti pertolongan."
      },
      {
          "question": "Isim yang digunakan untuk menunjukkan alat terjadinya suatu pekerjaan (Isim Alat) dari kata فَتَحَ (Fataha - membuka) adalah...",
          "options": [
              "فَاتِحٌ (Faatihun)",
              "مِفْتَاحٌ (Miftaahun)",
              "مَفْتُوْحٌ (Maftuuhun)",
              "مَفْتَحٌ (Maftahun)"
          ],
          "correct": 1,
          "explanation": "Isim alat sering mengikuti wazan مِفْعَالٌ (Mif'aalun). Dari fataha (membuka), isim alatnya miftaahun (مِفْتَاحٌ) yang berarti kunci."
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
  ],
  hmq: [
    {
      question: "Apa kepanjangan dari HMQ?",
      options: ["Himpunan Mutakharrijin Qudus", "Himpunan Murid Quran", "Himpunan Mahasiswa Quran", "Himpunan Masyarakat Qudus"],
      correct: 0,
      explanation: "HMQ singkatan dari Himpunan Mutakharrijin Qudus, yang merupakan wadah berkumpulnya para alumni."
    },
    {
      question: "MAZEEDA merupakan nama angkatan atau himpunan alumni dari pesantren mana?",
      options: ["Pondok Pesantren Lirboyo", "Pondok Pesantren Sidogiri", "Pondok Pesantren Ploso", "Pondok Pesantren Gontor"],
      correct: 0,
      explanation: "MAZEEDA umumnya merupakan wadah persatuan atau nama angkatan dari santri/alumni Pondok Pesantren Lirboyo, Kediri."
    },
    {
      question: "Tujuan utama dibentuknya wadah perkumpulan alumni seperti MAZEEDA adalah...",
      options: ["Untuk berbisnis bersama", "Menyambung silaturahmi dan menjaga sanad keilmuan", "Mencari keuntungan politik", "Berkompetisi antar pesantren"],
      correct: 1,
      explanation: "Wadah alumni dibentuk semata-mata untuk tholabul ilmi berkelanjutan, menjaga silaturahmi (ukhuwah), dan mempererat sanad guru-murid."
    },
    {
      question: "Kegiatan rutin yang biasa diadakan oleh himpunan alumni seperti HMQ MAZEEDA adalah...",
      options: ["Bahtsul Masail dan Lailatul Ijtima'", "Konser Musik", "Turnamen Esports", "Pameran Mobil"],
      correct: 0,
      explanation: "Kegiatan khas santri dan alumni pesantren biasanya berkisar pada Bahtsul Masail, pengajian rutinan (Lailatul Ijtima'), dan khataman Al-Qur'an."
    },
    {
      question: "Sikap yang paling ditekankan bagi seorang mutakharrijin (alumni) pesantren saat kembali ke masyarakat adalah...",
      options: ["Menjadi pejabat negara", "Berdebat dengan tokoh agama lain", "Tawadhu' dan mengamalkan ilmunya", "Menyembunyikan identitas santrinya"],
      correct: 2,
      explanation: "Akhlak yang paling utama dari seorang santri adalah tawadhu' (rendah hati) dan siap menebarkan kemanfaatan ilmunya (khidmah) di tengah masyarakat."
    }
  ]
};
