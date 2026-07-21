<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import Card from "$lib/components/ui/card.svelte";
  import Button from "$lib/components/ui/button.svelte";
  import BirthdayWidget from "$lib/components/BirthdayWidget.svelte";
  import CoverflowCarousel from "$lib/components/CoverflowCarousel.svelte";
  import LandscapeCarousel from "$lib/components/LandscapeCarousel.svelte";
  import AvatarMarquee from "$lib/components/AvatarMarquee.svelte";
  import ImageLightbox from "$lib/components/ImageLightbox.svelte";
  import { supabase } from "$lib/supabase";
  import { authStore } from "$lib/auth";
  import { deferredPrompt, showInstallBtn } from "$lib/pwaStore";
  import { Geolocation } from '@capacitor/geolocation';
  import { createSWRStore } from "$lib/swrStore";
  import {
    Users,
    Megaphone,
    BookOpen,
    Wallet,
    Image as ImageIcon,
    ArrowRight,
    TrendingUp,
    Calendar,
    Heart,
    Clock,
    MapPin,
    Compass,
    Smartphone,
    Download,
    ChevronLeft,
    ChevronRight,
    Facebook,
    Twitter,
    Instagram,
    Youtube,
    Rss,
    Scale,
    Award,
    Sun,
    Sunrise,
    Sunset,
    Moon,
    CloudRain,
    Wind,
    Bot,
    Info,
    Brain,
    CheckCircle2,
    XCircle,
    PartyPopper,
    Play
  } from "lucide-svelte";

  import { fade, fly, scale } from "svelte/transition";

  // --- Lightbox State ---
  let showLightbox = false;
  let lightboxImageUrl = "";

  function openLightbox(e: CustomEvent<string>) {
    lightboxImageUrl = e.detail;
    showLightbox = true;
  }

  // --- Quiz State ---
  import { quizData, type QuizQuestion } from "$lib/data/quizQuestions";

  let showQuizModal = false;
  let selectedGrade: 'ula' | 'wustha' | 'ulya' | null = null;
  let activeQuestions: QuizQuestion[] = [];
  
  let currentQuestionIndex = 0;
  let quizScore = 0;
  let isQuizFinished = false;
  let selectedAnswer: number | null = null;
  let isAnswerChecked = false;
  
  // Start Modal (Show Grade Selection)
  function startQuiz() {
    selectedGrade = null;
    activeQuestions = [];
    currentQuestionIndex = 0;
    quizScore = 0;
    isQuizFinished = false;
    selectedAnswer = null;
    isAnswerChecked = false;
    showQuizModal = true;
  }

  // Pick 5 random questions and start the game
  function startGame(grade: 'ula' | 'wustha' | 'ulya') {
    selectedGrade = grade;
    const allQuestions = [...quizData[grade]];
    
    // Fisher-Yates shuffle
    for (let i = allQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
    }
    
    // Pick 5 questions
    activeQuestions = allQuestions.slice(0, 5);
    
    currentQuestionIndex = 0;
    quizScore = 0;
    isQuizFinished = false;
    selectedAnswer = null;
    isAnswerChecked = false;
  }

  function checkAnswer(index: number) {
    if (isAnswerChecked) return;
    selectedAnswer = index;
    isAnswerChecked = true;
    if (index === activeQuestions[currentQuestionIndex].correct) {
      quizScore += 20; // 5 questions * 20 = 100 max score
    }
  }

  function nextQuestion() {
    if (currentQuestionIndex < activeQuestions.length - 1) {
      currentQuestionIndex++;
      selectedAnswer = null;
      isAnswerChecked = false;
    } else {
      isQuizFinished = true;
    }
  }

  function getPredikat(score: number) {
    if (score === 100) return "Mumtaz! Luar Biasa";
    if (score >= 80) return "Jayyid Jiddan! Hebat";
    if (score >= 60) return "Jayyid! Cukup Baik";
    if (score >= 40) return "Mutawassith! Semangat Terus";
    return "Teruslah Belajar & Mengaji!";
  }

  // --- Reactive PWA State ---
  let showPWAInstall = false;
  $: showPWAInstall = $showInstallBtn;

  // --- Helper to parse Indonesian Date ---
  function parseIndonesianDate(dateStr: string | undefined): string | null {
    if (!dateStr) return null;
    if (dateStr.includes("-")) return dateStr; // Already YYYY-MM-DD
    const parts = dateStr.trim().split(" ");
    if (parts.length >= 3) {
      const day = parts[0].padStart(2, "0");
      const monthStr = parts[1].toLowerCase();
      const year = parts[parts.length - 1]; // Use last part as year

      const monthMap: Record<string, string> = {
        januari: "01",
        februari: "02",
        maret: "03",
        april: "04",
        mei: "05",
        juni: "06",
        juli: "07",
        agustus: "08",
        september: "09",
        oktober: "10",
        november: "11",
        desember: "12",
      };

      const month = monthMap[monthStr] || "01";
      return `${year}-${month}-${day}`;
    }
    return null;
  }

  // --- User Session ---
  // Data otomatis diisi dari authStore
  let user = {
    name: "Santriwati",
    tanggal_lahir: "2000-12-29",
  };

  $: {
    if ($authStore.user) {
      user.name = $authStore.user.name;
      // Convert "22 September 2010" to "2010-09-22"
      if ($authStore.user.tahun_lahir) {
        user.tanggal_lahir =
          parseIndonesianDate($authStore.user.tahun_lahir) || "";
      }
    }
  }

  // --- Dynamic Stats & Highlights State ---
  let membersCount = "184 Anggota";
  let asatidzahCount = "20 Pengajar";
  let madingCount = "12 Momen";
  let sanguCount = "15 Berkas";
  let nilaiCount = "0 Data";
  let quranProgress = "QS. Al-Kahf";
  let quranDescription = "Surah Terakhir";
  let isLoadingStats = true;
  let hasAnnouncement = false;
  let hasMemory = false;

  // --- News Carousel State ---
  let carouselSlides: any[] = [];
  let isLoadingCarousel = true;
  let currentSlideIndex = 0;
  let autoPlayInterval: any = null;

  let recentAnnouncement = {
    id: "",
    title: "",
    category: "",
    date: "",
    excerpt: "",
    author: "",
  };

  let recentMemory = {
    title: "",
    date: "",
    location: "",
    likes: 0,
    image_url: "",
  };

  // --- Clock State ---
  let timeWIB = "--:--:--";
  let timeWITA = "--:--:--";
  let timeWIT = "--:--:--";
  let timeWIS = "--:--:--";
  let clockInterval: any;

  $: timezoneOrder = (() => {
    const getCityName = (code: string, fallback: string) =>
      cityTimezone === code
        ? selectedCity === "Lokasi Saya"
          ? "GPS"
          : selectedCity
        : fallback;

    const baseWIB = {
      code: "WIB",
      label: "Waktu Indonesia Barat",
      shortLabel: "WIB",
      time: timeWIB,
      offset: "GMT+7",
      city: getCityName("WIB", "Jakarta"),
    };
    const baseWITA = {
      code: "WITA",
      label: "Waktu Indonesia Tengah",
      shortLabel: "WITA",
      time: timeWITA,
      offset: "GMT+8",
      city: getCityName("WITA", "Makassar"),
    };
    const baseWIT = {
      code: "WIT",
      label: "Waktu Indonesia Timur",
      shortLabel: "WIT",
      time: timeWIT,
      offset: "GMT+9",
      city: getCityName("WIT", "Jayapura"),
    };
    const wisTz = {
      code: "WIS",
      label: "Waktu Istiwa' (Matahari)",
      shortLabel: "WIS",
      time: timeWIS,
      offset: "Hakiki Lokal",
      city: selectedCity === "Lokasi Saya" ? "GPS" : selectedCity,
    };

    let activeTz;
    let otherTz = [];

    if (cityTimezone === "WITA") {
      activeTz = baseWITA;
      otherTz = [baseWIB, baseWIT];
    } else if (cityTimezone === "WIT") {
      activeTz = baseWIT;
      otherTz = [baseWIB, baseWITA];
    } else {
      activeTz = baseWIB;
      otherTz = [baseWITA, baseWIT];
    }

    return [activeTz, wisTz, ...otherTz];
  })();

  $: currentHour = (() => {
    if (typeof window === "undefined") return 12;
    const _trigger = timeWIB; // Reactively update every second
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const localNow = new Date(utc + 3600000 * timezoneOffset);
    return localNow.getHours();
  })();

  $: timePeriod = (() => {
    const hour = currentHour;
    if (hour >= 5 && hour < 11) {
      return {
        name: "Pagi",
        bgClass: "bg-gradient-to-br from-indigo-200 via-sky-200 to-amber-100",
        badgeClass:
          "text-amber-800 bg-white/60 border-white/50 backdrop-blur-md shadow-sm",
        textColor: "text-slate-800",
        badge: "🌅 Pagi",
        sunPosition:
          "bottom-[-10px] left-8 w-24 h-24 bg-gradient-to-t from-amber-400 to-yellow-200 rounded-full blur-md opacity-80",
        cloudOpacity: "opacity-70",
      };
    } else if (hour >= 11 && hour < 15) {
      return {
        name: "Siang",
        bgClass: "bg-gradient-to-br from-blue-400 via-sky-300 to-sky-100",
        badgeClass:
          "text-sky-900 bg-white/60 border-white/50 backdrop-blur-md shadow-sm",
        textColor: "text-slate-900",
        badge: "☀️ Siang",
        sunPosition:
          "top-2 right-12 w-16 h-16 bg-yellow-100 rounded-full shadow-[0_0_40px_15px_rgba(253,224,71,0.6)] animate-pulse",
        cloudOpacity: "opacity-100",
      };
    } else if (hour >= 15 && hour < 18) {
      return {
        name: "Sore",
        bgClass: "bg-gradient-to-br from-blue-400 via-orange-300 to-rose-300",
        badgeClass:
          "text-orange-900 bg-white/60 border-white/50 backdrop-blur-md shadow-sm",
        textColor: "text-slate-900",
        badge: "🌇 Sore",
        sunPosition:
          "bottom-[-20px] right-10 w-28 h-28 bg-gradient-to-t from-orange-500 to-amber-300 rounded-full shadow-[0_0_50px_20px_rgba(249,115,22,0.4)]",
        cloudOpacity: "opacity-80",
      };
    } else {
      return {
        name: "Malam",
        bgClass: "bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900",
        badgeClass:
          "text-indigo-100 bg-white/10 border-white/10 backdrop-blur-md shadow-sm",
        textColor: "text-white",
        badge: "🌙 Malam",
        sunPosition:
          "top-3 right-10 w-10 h-10 bg-transparent rounded-full shadow-[-10px_10px_0_0_rgba(226,232,240,0.9)]",
        cloudOpacity: "opacity-20",
      };
    }
  })();

  import { prayerStore } from "$lib/prayerStore";

  // --- Prayer Times State (Synced from Store) ---
  $: selectedCity = $prayerStore.selectedCity;
  $: timezoneOffset = $prayerStore.timezoneOffset;
  $: cityTimezone = $prayerStore.cityTimezone;
  $: prayerTimes = $prayerStore.prayerTimes;
  $: hijriDate = $prayerStore.hijriDate;
  $: gregorianDate = $prayerStore.gregorianDate;
  $: isLoadingPrayers = $prayerStore.isLoadingPrayers;
  $: hasGPSCoords = $prayerStore.hasGPSCoords;
  $: gpsLatitude = $prayerStore.gpsLatitude;
  $: gpsLongitude = $prayerStore.gpsLongitude;

  let nextPrayer = { name: "", time: "", countdown: "" };
  $: isFridayLocal =
    new Date(
      new Date().getTime() +
        new Date().getTimezoneOffset() * 60000 +
        3600000 * timezoneOffset,
    ).getDay() === 5;
  
  let prayerTimer: any;

  // Searchable dropdown state
  let isCityDropdownOpen = false;
  let citySearchQuery = "";


  const cities = [
    // --- WIB (Waktu Indonesia Barat) - GMT+7 ---
    // Sumatra
    { name: "Banda Aceh", timezone: "WIB", offset: 7 },
    { name: "Lhokseumawe", timezone: "WIB", offset: 7 },
    { name: "Langsa", timezone: "WIB", offset: 7 },
    { name: "Subulussalam", timezone: "WIB", offset: 7 },
    { name: "Aceh Besar", timezone: "WIB", offset: 7 },
    { name: "Bireuen", timezone: "WIB", offset: 7 },
    { name: "Medan", timezone: "WIB", offset: 7 },
    { name: "Binjai", timezone: "WIB", offset: 7 },
    { name: "Pematang Siantar", timezone: "WIB", offset: 7 },
    { name: "Sibolga", timezone: "WIB", offset: 7 },
    { name: "Tebing Tinggi", timezone: "WIB", offset: 7 },
    { name: "Karo", timezone: "WIB", offset: 7 },
    { name: "Deli Serdang", timezone: "WIB", offset: 7 },
    { name: "Padang", timezone: "WIB", offset: 7 },
    { name: "Bukittinggi", timezone: "WIB", offset: 7 },
    { name: "Payakumbuh", timezone: "WIB", offset: 7 },
    { name: "Solok", timezone: "WIB", offset: 7 },
    { name: "Pariaman", timezone: "WIB", offset: 7 },
    { name: "Pekanbaru", timezone: "WIB", offset: 7 },
    { name: "Dumai", timezone: "WIB", offset: 7 },
    { name: "Bengkalis", timezone: "WIB", offset: 7 },
    { name: "Kampar", timezone: "WIB", offset: 7 },
    { name: "Tanjung Pinang", timezone: "WIB", offset: 7 },
    { name: "Batam", timezone: "WIB", offset: 7 },
    { name: "Jambi", timezone: "WIB", offset: 7 },
    { name: "Palembang", timezone: "WIB", offset: 7 },
    { name: "Pangkal Pinang", timezone: "WIB", offset: 7 },
    { name: "Bengkulu", timezone: "WIB", offset: 7 },
    { name: "Bandar Lampung", timezone: "WIB", offset: 7 },
    { name: "Metro", timezone: "WIB", offset: 7 },
    { name: "Lampung Selatan", timezone: "WIB", offset: 7 },
    { name: "Lampung Tengah", timezone: "WIB", offset: 7 },
    { name: "Lampung Timur", timezone: "WIB", offset: 7 },
    { name: "Pringsewu", timezone: "WIB", offset: 7 },

    // Jawa
    { name: "Jakarta", timezone: "WIB", offset: 7 },
    { name: "Bogor", timezone: "WIB", offset: 7 },
    { name: "Depok", timezone: "WIB", offset: 7 },
    { name: "Tangerang", timezone: "WIB", offset: 7 },
    { name: "Tangerang Selatan", timezone: "WIB", offset: 7 },
    { name: "Bekasi", timezone: "WIB", offset: 7 },
    { name: "Serang", timezone: "WIB", offset: 7 },
    { name: "Pandeglang", timezone: "WIB", offset: 7 },
    { name: "Lebak", timezone: "WIB", offset: 7 },
    { name: "Cilegon", timezone: "WIB", offset: 7 },
    { name: "Bandung", timezone: "WIB", offset: 7 },
    { name: "Cimahi", timezone: "WIB", offset: 7 },
    { name: "Tasikmalaya", timezone: "WIB", offset: 7 },
    { name: "Cirebon", timezone: "WIB", offset: 7 },
    { name: "Garut", timezone: "WIB", offset: 7 },
    { name: "Karawang", timezone: "WIB", offset: 7 },
    { name: "Purwakarta", timezone: "WIB", offset: 7 },
    { name: "Subang", timezone: "WIB", offset: 7 },
    { name: "Sumedang", timezone: "WIB", offset: 7 },
    { name: "Cianjur", timezone: "WIB", offset: 7 },
    { name: "Indramayu", timezone: "WIB", offset: 7 },
    { name: "Majalengka", timezone: "WIB", offset: 7 },
    { name: "Kuningan", timezone: "WIB", offset: 7 },
    { name: "Ciamis", timezone: "WIB", offset: 7 },
    { name: "Pangandaran", timezone: "WIB", offset: 7 },
    { name: "Banjar", timezone: "WIB", offset: 7 },
    { name: "Sukabumi", timezone: "WIB", offset: 7 },
    { name: "Semarang", timezone: "WIB", offset: 7 },
    { name: "Surakarta", timezone: "WIB", offset: 7 },
    { name: "Purwokerto", timezone: "WIB", offset: 7 },
    { name: "Cilacap", timezone: "WIB", offset: 7 },
    { name: "Banyumas", timezone: "WIB", offset: 7 },
    { name: "Brebes", timezone: "WIB", offset: 7 },
    { name: "Tegal", timezone: "WIB", offset: 7 },
    { name: "Pekalongan", timezone: "WIB", offset: 7 },
    { name: "Salatiga", timezone: "WIB", offset: 7 },
    { name: "Magelang", timezone: "WIB", offset: 7 },
    { name: "Kudus", timezone: "WIB", offset: 7 },
    { name: "Jepara", timezone: "WIB", offset: 7 },
    { name: "Kebumen", timezone: "WIB", offset: 7 },
    { name: "Klaten", timezone: "WIB", offset: 7 },
    { name: "Yogyakarta", timezone: "WIB", offset: 7 },
    { name: "Sleman", timezone: "WIB", offset: 7 },
    { name: "Bantul", timezone: "WIB", offset: 7 },
    { name: "Surabaya", timezone: "WIB", offset: 7 },
    { name: "Malang", timezone: "WIB", offset: 7 },
    { name: "Sidoarjo", timezone: "WIB", offset: 7 },
    { name: "Gresik", timezone: "WIB", offset: 7 },
    { name: "Kediri", timezone: "WIB", offset: 7 },
    { name: "Madiun", timezone: "WIB", offset: 7 },
    { name: "Jember", timezone: "WIB", offset: 7 },
    { name: "Banyuwangi", timezone: "WIB", offset: 7 },
    { name: "Batu", timezone: "WIB", offset: 7 },
    { name: "Blitar", timezone: "WIB", offset: 7 },
    { name: "Probolinggo", timezone: "WIB", offset: 7 },
    { name: "Pasuruan", timezone: "WIB", offset: 7 },
    { name: "Mojokerto", timezone: "WIB", offset: 7 },
    { name: "Ponorogo", timezone: "WIB", offset: 7 },
    { name: "Tuban", timezone: "WIB", offset: 7 },
    { name: "Lamongan", timezone: "WIB", offset: 7 },
    { name: "Bojonegoro", timezone: "WIB", offset: 7 },
    { name: "Nganjuk", timezone: "WIB", offset: 7 },
    { name: "Jombang", timezone: "WIB", offset: 7 },

    // Kalimantan (Barat & Tengah)
    { name: "Pontianak", timezone: "WIB", offset: 7 },
    { name: "Singkawang", timezone: "WIB", offset: 7 },
    { name: "Palangkaraya", timezone: "WIB", offset: 7 },
    { name: "Sampit", timezone: "WIB", offset: 7 },
    { name: "Pangkalan Bun", timezone: "WIB", offset: 7 },
    { name: "Ketapang", timezone: "WIB", offset: 7 },
    { name: "Sambas", timezone: "WIB", offset: 7 },

    // --- WITA (Waktu Indonesia Tengah) - GMT+8 ---
    // Kalimantan (Selatan, Timur, Utara)
    { name: "Banjarmasin", timezone: "WITA", offset: 8 },
    { name: "Banjarbaru", timezone: "WITA", offset: 8 },
    { name: "Samarinda", timezone: "WITA", offset: 8 },
    { name: "Balikpapan", timezone: "WITA", offset: 8 },
    { name: "Bontang", timezone: "WITA", offset: 8 },
    { name: "Tanjung Selor", timezone: "WITA", offset: 8 },
    { name: "Tarakan", timezone: "WITA", offset: 8 },
    { name: "Martapura", timezone: "WITA", offset: 8 },
    { name: "Kotabaru", timezone: "WITA", offset: 8 },
    { name: "Kutai Kartanegara", timezone: "WITA", offset: 8 },
    { name: "Berau", timezone: "WITA", offset: 8 },

    // Sulawesi
    { name: "Manado", timezone: "WITA", offset: 8 },
    { name: "Bitung", timezone: "WITA", offset: 8 },
    { name: "Gorontalo", timezone: "WITA", offset: 8 },
    { name: "Palu", timezone: "WITA", offset: 8 },
    { name: "Luwuk", timezone: "WITA", offset: 8 },
    { name: "Donggala", timezone: "WITA", offset: 8 },
    { name: "Mamuju", timezone: "WITA", offset: 8 },
    { name: "Makassar", timezone: "WITA", offset: 8 },
    { name: "Gowa", timezone: "WITA", offset: 8 },
    { name: "Maros", timezone: "WITA", offset: 8 },
    { name: "Parepare", timezone: "WITA", offset: 8 },
    { name: "Palopo", timezone: "WITA", offset: 8 },
    { name: "Bone", timezone: "WITA", offset: 8 },
    { name: "Bulukumba", timezone: "WITA", offset: 8 },
    { name: "Wajo", timezone: "WITA", offset: 8 },
    { name: "Kendari", timezone: "WITA", offset: 8 },
    { name: "Bau-Bau", timezone: "WITA", offset: 8 },
    { name: "Kolaka", timezone: "WITA", offset: 8 },
    { name: "Konawe", timezone: "WITA", offset: 8 },

    // Bali & Nusa Tenggara
    { name: "Denpasar", timezone: "WITA", offset: 8 },
    { name: "Singaraja", timezone: "WITA", offset: 8 },
    { name: "Gianyar", timezone: "WITA", offset: 8 },
    { name: "Badung", timezone: "WITA", offset: 8 },
    { name: "Tabanan", timezone: "WITA", offset: 8 },
    { name: "Klungkung", timezone: "WITA", offset: 8 },
    { name: "Karangasem", timezone: "WITA", offset: 8 },
    { name: "Jembrana", timezone: "WITA", offset: 8 },
    { name: "Mataram", timezone: "WITA", offset: 8 },
    { name: "Bima", timezone: "WITA", offset: 8 },
    { name: "Lombok Barat", timezone: "WITA", offset: 8 },
    { name: "Lombok Tengah", timezone: "WITA", offset: 8 },
    { name: "Lombok Timur", timezone: "WITA", offset: 8 },
    { name: "Sumbawa", timezone: "WITA", offset: 8 },
    { name: "Kupang", timezone: "WITA", offset: 8 },
    { name: "Ende", timezone: "WITA", offset: 8 },
    { name: "Maumere", timezone: "WITA", offset: 8 },
    { name: "Manggarai", timezone: "WITA", offset: 8 },

    // --- WIT (Waktu Indonesia Timur) - GMT+9 ---
    // Maluku
    { name: "Ambon", timezone: "WIT", offset: 9 },
    { name: "Tual", timezone: "WIT", offset: 9 },
    { name: "Ternate", timezone: "WIT", offset: 9 },
    { name: "Sofifi", timezone: "WIT", offset: 9 },
    { name: "Tidore", timezone: "WIT", offset: 9 },

    // Papua
    { name: "Jayapura", timezone: "WIT", offset: 9 },
    { name: "Manokwari", timezone: "WIT", offset: 9 },
    { name: "Sorong", timezone: "WIT", offset: 9 },
    { name: "Merauke", timezone: "WIT", offset: 9 },
    { name: "Nabire", timezone: "WIT", offset: 9 },
    { name: "Wamena", timezone: "WIT", offset: 9 },
    { name: "Biak", timezone: "WIT", offset: 9 },
    { name: "Mimika", timezone: "WIT", offset: 9 },
  ];

  const prayerFallbacks: Record<string, Record<string, string>> = {
    Jakarta: {
      Fajr: "04:45",
      Sunrise: "06:01",
      Dhuhr: "11:58",
      Asr: "15:19",
      Maghrib: "17:54",
      Isha: "19:08",
    },
    Bandung: {
      Fajr: "04:42",
      Sunrise: "05:58",
      Dhuhr: "11:55",
      Asr: "15:16",
      Maghrib: "17:51",
      Isha: "19:05",
    },
    Surabaya: {
      Fajr: "04:26",
      Sunrise: "05:42",
      Dhuhr: "11:39",
      Asr: "15:00",
      Maghrib: "17:35",
      Isha: "18:49",
    },
    Makassar: {
      Fajr: "04:52",
      Sunrise: "06:08",
      Dhuhr: "12:05",
      Asr: "15:26",
      Maghrib: "18:01",
      Isha: "19:15",
    },
    Denpasar: {
      Fajr: "05:01",
      Sunrise: "06:17",
      Dhuhr: "12:14",
      Asr: "15:35",
      Maghrib: "18:10",
      Isha: "19:24",
    },
    Jayapura: {
      Fajr: "04:15",
      Sunrise: "05:31",
      Dhuhr: "11:28",
      Asr: "14:49",
      Maghrib: "17:24",
      Isha: "18:38",
    },
    Ambon: {
      Fajr: "05:00",
      Sunrise: "06:16",
      Dhuhr: "12:13",
      Asr: "15:34",
      Maghrib: "18:09",
      Isha: "19:23",
    },
  };

  $: filteredCities = cities.filter((c) =>
    c.name.toLowerCase().includes(citySearchQuery.toLowerCase()),
  );

  // requestGeolocation removed (handled by prayerStore)
  async function requestGeolocation() {
    isCityDropdownOpen = false;
    await prayerStore.requestGeolocation();
  }

  function selectCity(city: any) {
    prayerStore.setCity(city);
    isCityDropdownOpen = false;
    citySearchQuery = "";
  }

  // Reactively calculate next prayer whenever prayerTimes updates
  $: if (prayerTimes) {
    calculateNextPrayer();
  }


  function calculateNextPrayer() {
    if (!prayerTimes) return;
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const localNow = new Date(utc + 3600000 * timezoneOffset);

    const currentHours = localNow.getHours();
    const currentMinutes = localNow.getMinutes();
    const currentTotalMinutes = currentHours * 60 + currentMinutes;

    const parseToMinutes = (timeStr: string) => {
      const [h, m] = timeStr.split(":").map(Number);
      return h * 60 + m;
    };

    const prayerOrder = [
      { name: "Subuh", time: prayerTimes.Subuh },
      {
        name: localNow.getDay() === 5 ? "Jum'at" : "Dzuhur",
        time: prayerTimes.Dzuhur,
      },
      { name: "Ashar", time: prayerTimes.Ashar },
      { name: "Maghrib", time: prayerTimes.Maghrib },
      { name: "Isya", time: prayerTimes.Isya },
    ];

    let found = false;
    for (const prayer of prayerOrder) {
      const pMinutes = parseToMinutes(prayer.time);
      if (pMinutes > currentTotalMinutes) {
        const diff = pMinutes - currentTotalMinutes;
        const h = Math.floor(diff / 60);
        const m = diff % 60;
        nextPrayer = {
          name: prayer.name,
          time: prayer.time,
          countdown: `${h > 0 ? h + "j " : ""}${m}m lagi`,
        };
        found = true;
        break;
      }
    }

    if (!found) {
      const subuhMinutes = parseToMinutes(prayerTimes.Subuh);
      const diff = 24 * 60 - currentTotalMinutes + subuhMinutes;
      const h = Math.floor(diff / 60);
      const m = diff % 60;
      nextPrayer = {
        name: "Subuh (Besok)",
        time: prayerTimes.Subuh,
        countdown: `${h > 0 ? h + "j " : ""}${m}m lagi`,
      };
    }
  }

  // --- News slides logic ---
  async function fetchCarousel() {
    try {
      isLoadingCarousel = true;
      const { data, error } = await supabase
        .from("news_slides")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        carouselSlides = data;
      } else {
        // Fallback default slides
        carouselSlides = [
          {
            id: "1",
            title: "Kilas Balik Rapat Kerja Tahunan 2026",
            description:
              "Momen kebersamaan dan merajut ukhuwah alumni MAZEEDA Squad.",
            image_url:
              "https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1200&auto=format&fit=crop",
            redirect_url: "/timeline",
          },
          {
            id: "2",
            title: "Sangu & Doa Harian Digital",
            description:
              "Kumpulan sholawat, jausyan, nadzom, dan doa lengkap untuk bekal spiritual Anda.",
            image_url:
              "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200&auto=format&fit=crop",
            redirect_url: "/sangu",
          },
          {
            id: "3",
            title: "Mading Online Realtime",
            description:
              "Dapatkan informasi penting dan kirimkan mading atau sticky notes inspiratif secara instan.",
            image_url:
              "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200&auto=format&fit=crop",
            redirect_url: "/mading",
          },
        ];
      }
    } catch (err) {
      console.error("Error fetching news slides:", err);
    } finally {
      isLoadingCarousel = false;
    }
  }

  function startAutoPlay() {
    stopAutoPlay();
    autoPlayInterval = setInterval(() => {
      nextSlide();
    }, 5000);
  }

  function stopAutoPlay() {
    if (autoPlayInterval) clearInterval(autoPlayInterval);
  }

  function nextSlide() {
    if (carouselSlides.length === 0) return;
    currentSlideIndex = (currentSlideIndex + 1) % carouselSlides.length;
  }

  function prevSlide() {
    if (carouselSlides.length === 0) return;
    currentSlideIndex =
      (currentSlideIndex - 1 + carouselSlides.length) % carouselSlides.length;
  }

  // --- Trigger PWA Prompt ---
  async function triggerInstallPrompt() {
    const prompt = $deferredPrompt;
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    console.log("User PWA choice outcome:", outcome);
    deferredPrompt.set(null);
    showInstallBtn.set(false);
  }

  // Convert Google Drive share link to direct image link
  function convertDriveUrl(url: string) {
    if (!url) return "";
    let cleaned = url.trim();
    if (cleaned.includes("lh3.googleusercontent.com/u/0/d/")) {
      return cleaned.replace(
        "lh3.googleusercontent.com/u/0/d/",
        "lh3.googleusercontent.com/d/",
      );
    }
    const match =
      cleaned.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
      cleaned.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
    return cleaned;
  }

  // Reactively fetch prayer times on city change
  // $: if (selectedCity) {
  //   fetchPrayerTimes(); // Now handled inside the store
  // }

  // Handle click outside dropdown
  function handleClickOutside(event: MouseEvent) {
    if (typeof document !== "undefined") {
      const container = document.getElementById("city-selector-container");
      if (container && !container.contains(event.target as Node)) {
        isCityDropdownOpen = false;
      }
    }
  }

  // --- Realtime Clocks logic ---
  function updateClocks() {
    if (typeof window === "undefined") return;
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;

    const formatTime = (offset: number) => {
      const d = new Date(utc + 3600000 * offset);
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      const seconds = String(d.getSeconds()).padStart(2, "0");
      return `${hours}:${minutes}:${seconds}`;
    };

    timeWIB = formatTime(7);
    timeWITA = formatTime(8);
    timeWIT = formatTime(9);

    // Calculate Waktu Istiwa' (WIS) based on Dhuhr time of selected city
    if (prayerTimes && prayerTimes.Dzuhur) {
      const [dzHours, dzMinutes] = prayerTimes.Dzuhur.split(":").map(Number);
      // Solar Noon is Dzuhur prayer time - 2 minutes (standard ihtiyati safety buffer correction)
      const noonMinutes = dzHours * 60 + dzMinutes - 2;

      // Selected city's current local standard time:
      const localNow = new Date(utc + 3600000 * timezoneOffset);
      const currentMinutes = localNow.getHours() * 60 + localNow.getMinutes();
      const currentSeconds = localNow.getSeconds();

      // Difference in minutes from solar noon:
      const diffMinutes = currentMinutes - noonMinutes;

      // WIS time is 12:00:00 + difference:
      let wisTotalMinutes = 12 * 60 + diffMinutes;

      // Keep within 0 to 24 hours:
      wisTotalMinutes = (wisTotalMinutes + 1440) % 1440;

      const wisHours = String(Math.floor(wisTotalMinutes / 60)).padStart(
        2,
        "0",
      );
      const wisMin = String(wisTotalMinutes % 60).padStart(2, "0");
      const wisSec = String(currentSeconds).padStart(2, "0");

      timeWIS = `${wisHours}:${wisMin}:${wisSec}`;
    } else {
      timeWIS = "--:--:--";
    }
  }

  // --- Dynamic Stats & Highlights SWR Store ---
  const dashboardDataStore = createSWRStore(
    "dashboardStats",
    async () => {
      // 1. Fetch allowed_alumni count
      const { count: squadCount } = await supabase
        .from("allowed_alumni")
        .select("*", { count: "exact", head: true });

      // 1b. Fetch asatidzah count
      const { count: asatidzahCountRaw } = await supabase
        .from("asatidzah")
        .select("*", { count: "exact", head: true });

      // 2. Fetch mading counts (announcements + notes)
      const { count: annCount } = await supabase
        .from("mading_announcements")
        .select("*", { count: "exact", head: true });
      const { count: notesCount } = await supabase
        .from("mading_notes")
        .select("*", { count: "exact", head: true });

      // 3. Fetch bacaan count
      const { count: bacaanCount } = await supabase
        .from("bacaan")
        .select("*", { count: "exact", head: true });

      // 5. Fetch recent announcement
      const { data: annData } = await supabase
        .from("mading_announcements")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1);

      // 6. Fetch recent memory
      const { data: memData } = await supabase
        .from("memories")
        .select("*, memory_likes(user_name)")
        .order("date", { ascending: false })
        .limit(1);

      // Fetch Galleries
      const { data: coverflowData } = await supabase.from("gallery_coverflow").select("image_url").order("created_at", { ascending: true });
      const { data: landscapeData } = await supabase.from("gallery_landscape").select("image_url").order("created_at", { ascending: true });
      const { data: marqueeData } = await supabase.from("gallery_marquee").select("image_url").order("created_at", { ascending: true });

      // Fetch Nilai counts
      const { count: nilaiTamrinCount } = await supabase.from("nilai_tamrin").select("*", { count: "exact", head: true });
      const { count: nilaiUjianCount } = await supabase.from("nilai_ujian").select("*", { count: "exact", head: true });

      return {
        squadCount,
        asatidzahCountRaw,
        annCount,
        notesCount,
        bacaanCount,
        annData,
        memData,
        coverflowData,
        landscapeData,
        marqueeData,
        nilaiTamrinCount,
        nilaiUjianCount
      };
    },
    null
  );

  // Sync state variables with SWR Store
  $: if ($dashboardDataStore) {
    isLoadingStats = false;
    const d = $dashboardDataStore;

    if (d.squadCount !== null) membersCount = `${d.squadCount} Anggota`;
    if (d.asatidzahCountRaw !== null) asatidzahCount = `${d.asatidzahCountRaw} Pengajar`;
    
    const totalMading = (d.annCount || 0) + (d.notesCount || 0);
    madingCount = `${totalMading} Momen`;
    
    if (d.bacaanCount !== null) sanguCount = `${d.bacaanCount} Berkas`;

    const totalNilai = (d.nilaiTamrinCount || 0) + (d.nilaiUjianCount || 0);
    nilaiCount = `${totalNilai} Data`;

    if (d.annData && d.annData.length > 0) {
      const item = d.annData[0];
      recentAnnouncement = {
        id: item.id,
        title: item.title,
        category: item.category,
        date: new Date(item.created_at).toLocaleDateString("id-ID", {
          day: "numeric", month: "long", year: "numeric",
        }),
        excerpt: item.content.length > 150 ? item.content.substring(0, 150) + "..." : item.content,
        author: item.author,
      };
      hasAnnouncement = true;
    } else {
      hasAnnouncement = false;
    }

    if (d.memData && d.memData.length > 0) {
      const item = d.memData[0];
      recentMemory = {
        title: item.title,
        date: new Date(item.date).toLocaleDateString("id-ID", {
          day: "numeric", month: "long", year: "numeric",
        }),
        location: item.location,
        likes: (item.memory_likes || []).length,
        image_url: item.image_url,
      };
      hasMemory = true;
    } else {
      hasMemory = false;
    }

    if (d.coverflowData) coverflowImages = d.coverflowData.map((x: any) => x.image_url);
    if (d.landscapeData) landscapeImages = d.landscapeData.map((x: any) => x.image_url);
    if (d.marqueeData) marqueeImages = d.marqueeData.map((x: any) => x.image_url);
  }

  function fetchStatsAndHighlights() {
    // 4. Quran progress from localStorage
    if (typeof localStorage !== "undefined") {
      const storedName = localStorage.getItem("quran_selectedSurahName");
      const storedAyats = localStorage.getItem("quran_selectedSurahAyats");
      if (storedName) {
        quranProgress = storedName;
        quranDescription = `${storedAyats || "0"} Ayat - Terakhir Dibaca`;
      } else {
        quranProgress = "QS. Al-Fatihah";
        quranDescription = "Surah Pertama";
      }
    }
    dashboardDataStore.revalidate();
  }

  let greeting = "";
  // Dynamic Galleries State
  let coverflowImages: string[] = [];
  let landscapeImages: string[] = [];
  let marqueeImages: string[] = [];

  onMount(() => {
    // Auto detect user location / timezone offset to select city default
    if (typeof window !== "undefined") {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const offsetHours = -new Date().getTimezoneOffset() / 60;

      if (tz.includes("Jayapura") || offsetHours === 9) {
        cityTimezone = "WIT";
        timezoneOffset = 9;
      } else if (
        tz.includes("Makassar") ||
        tz.includes("Singapore") ||
        offsetHours === 8
      ) {
        cityTimezone = "WITA";
        timezoneOffset = 8;
      } else {
        cityTimezone = "WIB";
        timezoneOffset = 7;
      }

      window.addEventListener("click", handleClickOutside);
    }

    updateClocks();
    clockInterval = setInterval(updateClocks, 1000);

    fetchStatsAndHighlights();
    fetchCarousel();
    startAutoPlay();

    // Init prayer store (will load from cache instantly, or trigger GPS if empty)
    prayerStore.init();

    // Recalculate next prayer countdown every minute
    prayerTimer = setInterval(calculateNextPrayer, 60000);
  });

  onDestroy(() => {
    if (clockInterval) clearInterval(clockInterval);
    if (prayerTimer) clearInterval(prayerTimer);
    stopAutoPlay();
    if (typeof window !== "undefined") {
      window.removeEventListener("click", handleClickOutside);
    }
  });

  // Stats Grid Definition
  $: stats = [
    {
      name: "Guruku",
      value: asatidzahCount,
      description: "Mustahiq | Mustahiqoh | Munawwib | Munawibah",
      icon: Users,
      image: "/images/asatidzah_icon_v3.png",
      color: "text-purple-600 bg-purple-50/50 border-purple-100",
      gradient: "from-purple-100/80 to-purple-50/20",
      href: "/asatidzah",
    },
    {
      name: "Mazeeda Squad",
      value: membersCount,
      description: "Alumni | Alumnus",
      icon: Users,
      image: "/images/squad_icon_v3.png",
      color: "text-blue-600 bg-blue-50/50 border-blue-100",
      gradient: "from-blue-100/80 to-blue-50/20",
      href: "/squad",
    },
    {
      name: "Time Line",
      value: madingCount,
      description: "Foto kenangan | album memori",
      icon: ImageIcon,
      image: "/images/timeline_icon.png",
      color: "text-amber-600 bg-amber-50/50 border-amber-100",
      gradient: "from-amber-100/80 to-amber-50/20",
      href: "/timeline",
    },
    {
      name: "Sangu | Wirid",
      value: sanguCount,
      description: "Koleksi doa | sholawat | nadzom",
      icon: Wallet,
      image: "/images/sangu_icon.png",
      color: "text-emerald-600 bg-emerald-50/50 border-emerald-100",
      gradient: "from-emerald-100/80 to-emerald-50/20",
      href: "/sangu",
    },
    {
      name: "Al-Qur'an Progress",
      value: quranProgress,
      description: quranDescription,
      icon: BookOpen,
      image: "/images/quran_icon.png",
      color: "text-indigo-600 bg-indigo-50/50 border-indigo-100",
      gradient: "from-indigo-100/80 to-indigo-50/20",
      href: "/quran",
    },
    {
      name: "MAZEEDA AI",
      value: "Tanya AI",
      description: "Teman curhat & asisten cerdas",
      icon: Bot,
      image: "/merak.png",
      color: "text-rose-600 bg-rose-50/50 border-rose-100",
      gradient: "from-rose-100/80 to-rose-50/20",
      href: "/ai-chat",
    },
    {
      name: "Riwayat Akademik",
      value: "Daftar Nilai",
      description: "Cari | lihat daftar nilai siswi",
      icon: Award,
      image: "/images/nilai_icon.png",
      color: "text-teal-600 bg-teal-50/50 border-teal-100",
      gradient: "from-teal-100/80 to-teal-50/20",
      href: "/nilai",
    },
  ];
</script>

<div class="space-y-6 pb-12">
  <!-- ==================== BIRTHDAY WIDGET ==================== -->
  {#if user && user.tanggal_lahir}
    <BirthdayWidget tanggalLahir={user.tanggal_lahir} userName={user.name} />
  {/if}

  <!-- ==================== PWA INSTALL BAR ==================== -->
  {#if showPWAInstall}
    <section
      class="bg-gradient-to-r from-blue-600 via-indigo-600 to-primary text-white rounded-3xl p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-300"
    >
      <div class="flex items-center space-x-4">
        <div class="p-3 bg-white/10 rounded-2xl">
          <Smartphone class="h-6 w-6 text-blue-200" />
        </div>
        <div class="space-y-1 text-center sm:text-left">
          <h3 class="font-extrabold text-sm sm:text-base leading-none">
            Pasang Aplikasi MAZEEDA
          </h3>
          <p class="text-xs text-blue-100 leading-relaxed font-normal">
            Instal aplikasi di HP atau komputer Anda untuk akses super cepat dan
            hemat kuota internet.
          </p>
        </div>
      </div>
      <button
        on:click={triggerInstallPrompt}
        class="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 bg-white text-primary font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors shadow-soft-sm cursor-pointer"
        style="min-height: 40px;"
      >
        <Download class="h-4 w-4" />
        <span>Instal Sekarang</span>
      </button>
    </section>
  {/if}

  <!-- ==================== NEWS CAROUSEL SLIDER ==================== -->
  <section
    class="relative h-[220px] sm:h-[300px] md:h-[350px] w-full rounded-3xl overflow-hidden shadow-soft-md bg-slate-900 group"
  >
    {#if isLoadingCarousel}
      <div
        class="absolute inset-0 flex items-center justify-center bg-slate-950 text-white/50"
      >
        <div
          class="animate-spin h-7 w-7 border-2 border-white/20 border-t-white rounded-full"
        ></div>
      </div>
    {:else}
      <!-- Carousel Track -->
      <div class="relative w-full h-full">
        {#each carouselSlides as slide, index}
          <div
            class="absolute inset-0 transition-opacity duration-700 ease-in-out flex items-center p-6 sm:p-10 md:p-12"
            class:opacity-100={index === currentSlideIndex}
            class:opacity-0={index !== currentSlideIndex}
            class:pointer-events-none={index !== currentSlideIndex}
          >
            <!-- Background Image -->
            <div
              class="absolute inset-0 bg-cover bg-center transition-transform duration-1000 transform group-hover:scale-102"
              style="background-image: url('{convertDriveUrl(
                slide.image_url,
              )}');"
            ></div>
            <!-- Dark Gradient Overlay -->
            <div
              class="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/70 to-transparent"
            ></div>
            <div
              class="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"
            ></div>

            <!-- Carousel content -->
            <div
              class="relative z-10 max-w-xl space-y-2 sm:space-y-4 text-white"
            >
              <span
                class="inline-flex items-center space-x-1.5 bg-primary/80 border border-primary/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
              >
                <Compass class="h-3 w-3" />
                <span>Berita Utama</span>
              </span>
              <h2
                class="text-lg sm:text-2xl md:text-3xl font-black leading-tight tracking-tight drop-shadow-md"
              >
                {slide.title}
              </h2>
              <p
                class="text-xs sm:text-sm text-slate-300 font-medium line-clamp-2 max-w-lg leading-relaxed drop-shadow"
              >
                {slide.description}
              </p>
              {#if slide.redirect_url}
                <div class="pt-2">
                  <a href={slide.redirect_url}>
                    <Button
                      variant="default"
                      size="sm"
                      class="font-extrabold text-xs flex items-center space-x-1"
                    >
                      <span>Lihat Selengkapnya</span>
                      <ArrowRight class="h-3.5 w-3.5" />
                    </Button>
                  </a>
                </div>
              {/if}
            </div>
          </div>
        {/each}
      </div>

      <!-- Arrow Controls -->
      <button
        on:click={prevSlide}
        class="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-slate-950/30 hover:bg-slate-950/65 text-white/80 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
        style="min-height: 40px; min-width: 40px;"
      >
        <ChevronLeft class="h-5 w-5" />
      </button>
      <button
        on:click={nextSlide}
        class="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-slate-950/30 hover:bg-slate-950/65 text-white/80 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
        style="min-height: 40px; min-width: 40px;"
      >
        <ChevronRight class="h-5 w-5" />
      </button>

      <!-- Dot Indicators -->
      <div
        class="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-1.5 z-20"
      >
        {#each carouselSlides as _, index}
          <button
            on:click={() => {
              currentSlideIndex = index;
              stopAutoPlay();
              startAutoPlay();
            }}
            class="h-2 rounded-full transition-all duration-300 cursor-pointer {index ===
            currentSlideIndex
              ? 'w-6 bg-white'
              : 'w-2 bg-white/40 hover:bg-white/60'}"
            aria-label="Slide ke {index + 1}"
          ></button>
        {/each}
      </div>
    {/if}
  </section>

  <!-- ==================== PARTNERS MARQUEE ==================== -->
  <section class="border-y border-slate-200/60 bg-white py-2 overflow-hidden relative">
    <!-- Optional gradient masks -->
    <div class="absolute left-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
    <div class="absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>

    <div class="flex w-max animate-marquee-right items-center opacity-85 hover:opacity-100 transition-opacity duration-300">
      <!-- Duplicate the items for seamless loop -->
      {#each [1, 2, 3, 4] as _}
        <div class="flex items-center space-x-10 sm:space-x-16 px-5 sm:px-8">
          <div class="flex items-center justify-center h-10 w-24 sm:h-12 sm:w-36 grayscale hover:grayscale-0 transition-all duration-300 cursor-pointer relative">
            <img src="/images/logo_emabror.png" alt="emabror" class="absolute inset-0 w-full h-full object-contain mix-blend-multiply scale-[1.8] hover:scale-[2]" />
          </div>
          <div class="flex items-center justify-center h-10 w-24 sm:h-12 sm:w-36 grayscale hover:grayscale-0 transition-all duration-300 cursor-pointer relative">
            <img src="/images/logo_alimaf.png" alt="Alimaf" class="absolute inset-0 w-full h-full object-contain mix-blend-multiply scale-[1.8] hover:scale-[2]" />
          </div>
          <div class="flex items-center justify-center h-10 w-24 sm:h-12 sm:w-36 grayscale hover:grayscale-0 transition-all duration-300 cursor-pointer relative">
            <img src="/images/logo_rayhar.png" alt="Rayhar" class="absolute inset-0 w-full h-full object-contain mix-blend-multiply scale-[1.8] hover:scale-[2]" />
          </div>
          <div class="flex items-center justify-center h-10 w-24 sm:h-12 sm:w-36 grayscale hover:grayscale-0 transition-all duration-300 cursor-pointer relative">
            <img src="/images/logo_wepose.png" alt="WEPOSE" class="absolute inset-0 w-full h-full object-contain mix-blend-multiply scale-[1.8] hover:scale-[2]" />
          </div>
        </div>
      {/each}
    </div>
  </section>

  <!-- ==================== INDONESIAN TIME & PRAYER WIDGET ==================== -->
  <section class="grid grid-cols-1 lg:grid-cols-12 gap-5">
    <!-- Timezone Clocks Card (8 columns) -->
    <Card
      class="lg:col-span-7 bg-slate-50 border-slate-200 shadow-soft-sm relative overflow-hidden flex flex-col justify-between"
    >
      <!-- Scenic Header -->
      <div
        class="relative -mx-4 sm:-mx-5 -mt-4 sm:-mt-5 rounded-t-2xl transition-all duration-1000 ease-in-out {timePeriod.bgClass} overflow-hidden flex items-center p-4 sm:px-5 sm:py-4 border-b border-slate-100 shadow-inner"
      >
        <!-- Decorative Elements Container -->
        <div class="absolute inset-0 z-0 pointer-events-none">
          <!-- Sun / Moon -->
          <div
            class="absolute {timePeriod.sunPosition} transition-all duration-1000 ease-in-out"
          ></div>

          <!-- Clouds (Only visible during day/morning/evening) -->
          {#if timePeriod.name !== "Malam"}
            <div
              class="absolute top-6 left-6 w-16 h-4 bg-white/40 rounded-full blur-[2px] {timePeriod.cloudOpacity} transition-all duration-1000"
            ></div>
            <div
              class="absolute top-10 left-12 w-12 h-3 bg-white/30 rounded-full blur-[2px] {timePeriod.cloudOpacity} transition-all duration-1000"
            ></div>
            <div
              class="absolute top-4 right-1/3 w-24 h-5 bg-white/40 rounded-full blur-[3px] {timePeriod.cloudOpacity} transition-all duration-1000"
            ></div>
            <div
              class="absolute bottom-4 right-1/4 w-14 h-3 bg-white/20 rounded-full blur-[2px] {timePeriod.cloudOpacity} transition-all duration-1000"
            ></div>
          {:else}
            <!-- Stars for Night -->
            <div
              class="absolute top-4 left-1/4 w-1 h-1 bg-white rounded-full animate-pulse"
            ></div>
            <div
              class="absolute top-8 left-10 w-1.5 h-1.5 bg-white/80 rounded-full animate-pulse"
              style="animation-delay: 1s;"
            ></div>
            <div
              class="absolute top-12 left-1/2 w-1 h-1 bg-white/60 rounded-full animate-pulse"
              style="animation-delay: 0.5s;"
            ></div>
            <div
              class="absolute top-6 right-1/4 w-2 h-2 bg-white/90 rounded-full animate-pulse"
              style="animation-delay: 1.5s; filter: blur(1px);"
            ></div>
            <div
              class="absolute top-16 right-12 w-1 h-1 bg-white/70 rounded-full animate-pulse"
              style="animation-delay: 2s;"
            ></div>
            <div
              class="absolute top-10 right-2 w-1 h-1 bg-white/50 rounded-full animate-pulse"
              style="animation-delay: 0.8s;"
            ></div>
          {/if}

          <!-- Scenic Overlay Gradient -->
          <div
            class="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent"
          ></div>
        </div>

        <!-- Header Content -->
        <div class="relative z-10 flex items-start justify-between w-full">
          <div
            class="flex items-center space-x-2 {timePeriod.textColor} drop-shadow-sm"
          >
            {#if timePeriod.name === "Pagi"}
              <Sunrise class="h-5 w-5" />
            {:else if timePeriod.name === "Siang"}
              <Sun class="h-5 w-5" />
            {:else if timePeriod.name === "Sore"}
              <Sunset class="h-5 w-5" />
            {:else}
              <Moon class="h-5 w-5" />
            {/if}
            <h2 class="text-sm font-black uppercase tracking-widest">
              Waktu Indonesia
            </h2>
          </div>
          <span
            class="text-[10px] font-extrabold px-3 py-1 rounded-full border uppercase tracking-wider transition-all duration-500 {timePeriod.badgeClass}"
          >
            {timePeriod.badge}
          </span>
        </div>
      </div>

      <!-- Timezone Clocks Table -->
      <div class="overflow-x-auto py-4 z-10">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-100">
              <th
                class="py-2.5 px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center"
                >Zona</th
              >
              <th
                class="py-2.5 px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center"
                >Waktu Realtime</th
              >
              <th
                class="py-2.5 px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center hidden sm:table-cell"
                >Selisih</th
              >

              <th
                class="py-2.5 px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center"
                >Status</th
              >
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            {#each timezoneOrder as tz}
              {@const isActive = tz.code === cityTimezone}
              {@const isWIS = tz.code === "WIS"}
              <tr
                class="transition-colors duration-150 {isActive || isWIS
                  ? 'bg-slate-50/60 font-medium'
                  : 'hover:bg-slate-50/30'}"
              >
                <!-- Zona Waktu -->
                <td class="py-2.5 px-3 text-center">
                  <span
                    class="inline-block text-[10px] font-black px-2 py-0.5 rounded-md border uppercase tracking-wider text-slate-600 bg-slate-100 border-slate-200"
                  >
                    {tz.shortLabel}
                  </span>
                </td>

                <!-- Waktu Realtime -->
                <td class="py-2.5 px-3 text-center">
                  <span
                    class="text-base sm:text-lg font-black font-mono tracking-tight text-slate-800"
                  >
                    {tz.time}
                  </span>
                </td>

                <!-- Selisih -->
                <td
                  class="py-2.5 px-3 text-xs text-slate-500 font-semibold hidden sm:table-cell text-center"
                >
                  {tz.offset}
                </td>

                <!-- Status -->
                <td class="py-2.5 px-3 text-center">
                  {#if isActive || isWIS}
                    <span
                      class="inline-flex items-center text-[9px] text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse shadow-soft-xs bg-primary"
                    >
                      Aktif
                    </span>
                  {:else}
                    <span
                      class="inline-flex items-center text-[9px] bg-slate-100 text-slate-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                    >
                      Pendukung
                    </span>
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <!-- Quick Date Footer -->
      <div
        class="flex flex-col sm:flex-row justify-between items-center bg-white border border-slate-200 rounded-2xl p-3 gap-2 mt-2"
      >
        <div class="flex items-center space-x-2">
          <Calendar class="h-4.5 w-4.5 text-slate-400" />
          <span
            class="text-xs font-bold text-slate-600 uppercase tracking-wider"
            >{gregorianDate || "MEMUAT TANGGAL..."}</span
          >
        </div>
        <div
          class="text-xs font-black text-primary bg-blue-50 border border-blue-100 px-3 py-1 rounded-full uppercase tracking-wider"
        >
          🌙 {hijriDate || "MEMUAT KALENDER HIJRIYAH..."}
        </div>
      </div>
    </Card>

    <!-- Prayer Times Card (5 columns) -->
    <Card
      class="lg:col-span-5 bg-white border-slate-200 shadow-soft-sm flex flex-col justify-between"
    >
      <div
        class="relative -mx-4 sm:-mx-5 -mt-4 sm:-mt-5 rounded-t-2xl bg-gradient-to-r from-emerald-50 via-teal-50/50 to-cyan-50 p-4 sm:px-5 sm:py-4 flex items-center justify-start border-b border-emerald-100/60 shadow-inner mb-4"
      >
        <!-- Dekorasi Background -->
        <div
          class="absolute inset-0 overflow-hidden rounded-t-2xl pointer-events-none z-0"
        >
          <div
            class="absolute inset-0 opacity-[0.35] bg-[url('/images/makkah_bg.png')] bg-cover bg-[position:center_55%] bg-no-repeat mix-blend-multiply"
          ></div>
          <div
            class="absolute right-0 top-0 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl -mt-10 -mr-10"
          ></div>
          <div
            class="absolute left-10 bottom-0 w-24 h-24 bg-cyan-400/20 rounded-full blur-xl -mb-10"
          ></div>
        </div>

        <div
          class="relative z-10 bg-white/70 backdrop-blur-md border border-emerald-200/50 px-3 py-1.5 rounded-full shadow-sm flex items-center space-x-1.5"
        >
          <span class="text-xs">🕌</span>
          <span
            class="text-[9px] text-emerald-700 font-black uppercase tracking-widest"
            >Jadwal Sholat</span
          >
        </div>
      </div>

      <!-- City Selector Placed Below Header -->
      <div class="px-5 pt-3 pb-1 flex justify-center border-b border-slate-50">
        <!-- Searchable City Selector -->
        <div
          class="relative inline-block text-center"
          id="city-selector-container"
        >
          <button
            on:click|stopPropagation={() =>
              (isCityDropdownOpen = !isCityDropdownOpen)}
            class="inline-flex items-center justify-center space-x-1.5 text-[13px] font-bold text-slate-600 hover:text-primary transition-colors focus:outline-none cursor-pointer py-1 px-3 rounded-full hover:bg-slate-50"
          >
            <MapPin class="h-3.5 w-3.5 text-primary" />
            <span
              class="whitespace-normal leading-tight text-center break-words max-w-[85vw] sm:max-w-[500px]"
              >{selectedCity === "Lokasi Saya" ? "Lokasi Saya" : selectedCity}
              <span
                class="text-slate-400 ml-0.5 font-semibold text-[11px] whitespace-nowrap"
                >({cityTimezone})</span
              ></span
            >
            <span
              class="text-slate-400 text-[10px] transform transition-transform duration-200 ml-1"
              class:rotate-180={isCityDropdownOpen}>▼</span
            >
          </button>

          {#if isCityDropdownOpen}
            <div
              class="absolute left-1/2 -translate-x-1/2 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-3 space-y-2 animate-in fade-in-50 slide-in-from-top-2 duration-150 origin-top"
            >
              <!-- Search Input -->
              <div class="relative">
                <input
                  type="text"
                  bind:value={citySearchQuery}
                  placeholder="Cari daerah / kota..."
                  class="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 rounded-xl py-2 pl-8 pr-3 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all font-medium"
                  on:click|stopPropagation={() => {}}
                />
                <svg
                  class="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2.5"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              <!-- Use GPS Location Button -->
              <button
                on:click={requestGeolocation}
                class="w-full flex items-center justify-center space-x-2 p-2 rounded-xl text-xs font-bold text-primary bg-blue-50 border border-blue-100/50 hover:bg-blue-100 transition-colors cursor-pointer"
              >
                <span class="text-xs">📍</span>
                <span>Gunakan Lokasi Saya (GPS)</span>
              </button>

              <!-- Cities List -->
              <div
                class="max-h-52 overflow-y-auto divide-y divide-slate-100 custom-scrollbar pr-1"
              >
                {#each filteredCities as city}
                  <button
                    on:click={() => selectCity(city)}
                    class="w-full text-left py-2 px-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-primary rounded-lg transition-colors flex justify-between items-center cursor-pointer"
                  >
                    <span class="font-bold">{city.name}</span>
                    <span
                      class="text-[9px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase tracking-wider"
                      >{city.timezone}</span
                    >
                  </button>
                {/each}

                {#if citySearchQuery.trim() !== ""}
                  <button
                    on:click={() => {
                      selectedCity = citySearchQuery.trim();
                      isCityDropdownOpen = false;
                      citySearchQuery = "";
                    }}
                    class="w-full text-left py-2 px-2.5 text-xs text-primary bg-blue-50/50 hover:bg-blue-50 rounded-lg transition-colors flex items-center space-x-2 font-bold cursor-pointer"
                  >
                    <span>🔍</span>
                    <span class="truncate"
                      >Gunakan pencarian kustom: "{citySearchQuery}"</span
                    >
                  </button>
                {/if}

                {#if filteredCities.length === 0 && citySearchQuery.trim() === ""}
                  <div
                    class="text-center py-4 text-xs text-slate-400 font-medium"
                  >
                    Kota tidak ditemukan
                  </div>
                {/if}
              </div>
            </div>
          {/if}
        </div>
      </div>

      <!-- Next Prayer countdown -->
      <div class="py-4 text-center">
        {#if isLoadingPrayers}
          <div
            class="h-8 flex items-center justify-center text-slate-400 font-semibold text-xs animate-pulse"
          >
            Menyelaraskan waktu...
          </div>
        {:else if nextPrayer.name}
          <p
            class="text-[10px] font-black text-slate-400 uppercase tracking-widest"
          >
            Sholat Berikutnya
          </p>
          <h3 class="text-2xl font-black text-primary tracking-tight mt-1">
            {nextPrayer.name} ({nextPrayer.time})
          </h3>
          <p
            class="text-xs text-slate-500 font-extrabold mt-0.5 bg-blue-50 border border-blue-100/50 px-3 py-0.5 rounded-full inline-block"
          >
            ⏳ {nextPrayer.countdown}
          </p>
        {/if}
      </div>

      <!-- Daily times grid -->
      <div class="grid grid-cols-5 gap-1.5 border-t border-slate-100 pt-3">
        {#if prayerTimes}
          <div
            class="text-center p-1.5 rounded-xl bg-slate-50 border border-slate-100"
          >
            <p
              class="text-[9px] text-slate-400 font-black uppercase tracking-wider"
            >
              Subuh
            </p>
            <p class="text-xs font-black text-slate-800 font-mono mt-0.5">
              {prayerTimes.Subuh}
            </p>
          </div>
          <div
            class="text-center p-1.5 rounded-xl bg-slate-50 border border-slate-100"
          >
            <p
              class="text-[9px] text-slate-400 font-black uppercase tracking-wider"
            >
              {isFridayLocal ? "Jum'at" : "Dzuhur"}
            </p>
            <p class="text-xs font-black text-slate-800 font-mono mt-0.5">
              {prayerTimes.Dzuhur}
            </p>
          </div>
          <div
            class="text-center p-1.5 rounded-xl bg-slate-50 border border-slate-100"
          >
            <p
              class="text-[9px] text-slate-400 font-black uppercase tracking-wider"
            >
              Ashar
            </p>
            <p class="text-xs font-black text-slate-800 font-mono mt-0.5">
              {prayerTimes.Ashar}
            </p>
          </div>
          <div
            class="text-center p-1.5 rounded-xl bg-slate-50 border border-slate-100"
          >
            <p
              class="text-[9px] text-slate-400 font-black uppercase tracking-wider"
            >
              Maghrib
            </p>
            <p class="text-xs font-black text-slate-800 font-mono mt-0.5">
              {prayerTimes.Maghrib}
            </p>
          </div>
          <div
            class="text-center p-1.5 rounded-xl bg-slate-50 border border-slate-100"
          >
            <p
              class="text-[9px] text-slate-400 font-black uppercase tracking-wider"
            >
              Isya
            </p>
            <p class="text-xs font-black text-slate-800 font-mono mt-0.5">
              {prayerTimes.Isya}
            </p>
          </div>
        {:else}
          <div
            class="col-span-5 text-center text-xs text-slate-400 py-3 font-semibold"
          >
            Mengambil jadwal...
          </div>
        {/if}
      </div>
    </Card>
  </section>

  <!-- ==================== FITUR ISLAMI WIDGET ==================== -->
  <section class="space-y-4">
    <h2 class="text-lg font-bold text-slate-800 tracking-tight">
      Fitur Islami
    </h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <!-- Card 1: Qibla Compass -->
      <a
        href="/kiblat"
        class="group block transition-all hover:-translate-y-1.5 duration-300"
      >
        <div
          class="relative overflow-hidden rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/40 via-white to-white hover:border-indigo-300 hover:shadow-soft-md text-slate-800 p-5 h-44 flex flex-col justify-between transition-all duration-300"
        >
          <!-- Dekorasi AI -->
          <div
            class="absolute -right-4 -bottom-4 w-40 h-40 opacity-90 pointer-events-none group-hover:scale-110 transition-transform duration-500 mix-blend-multiply"
            style="mask-image: radial-gradient(circle at center, black 30%, transparent 65%); -webkit-mask-image: radial-gradient(circle at center, black 30%, transparent 65%);"
          >
            <img
              src="/images/kiblat_bg.png"
              alt="Arah Kiblat"
              class="w-full h-full object-contain"
            />
          </div>
          <div class="space-y-1.5 z-10">
            <span
              class="inline-flex items-center space-x-1.5 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-indigo-600 leading-none"
            >
              🧭 Kompas Arah
            </span>
            <h3
              class="text-lg font-extrabold tracking-tight mt-1 text-slate-800"
            >
              Arah Kiblat
            </h3>
            <p
              class="text-xs text-slate-500 leading-relaxed font-normal max-w-xs"
            >
              Cari arah kiblat sholat secara real-time dengan HP atau GPS.
            </p>
          </div>
        </div>
      </a>

      <!-- Card 2: Zakat Calculator -->
      <a
        href="/zakat-faraidh?type=zakat"
        class="group block transition-all hover:-translate-y-1.5 duration-300"
      >
        <div
          class="relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/40 via-white to-white hover:border-emerald-300 hover:shadow-soft-md text-slate-800 p-5 h-44 flex flex-col justify-between transition-all duration-300"
        >
          <!-- Dekorasi AI -->
          <div
            class="absolute -right-4 -bottom-4 w-40 h-40 opacity-90 pointer-events-none group-hover:scale-110 transition-transform duration-500 mix-blend-multiply"
            style="mask-image: radial-gradient(circle at center, black 30%, transparent 65%); -webkit-mask-image: radial-gradient(circle at center, black 30%, transparent 65%);"
          >
            <img
              src="/images/zakat_bg.png"
              alt="Hitung Zakat"
              class="w-full h-full object-contain"
            />
          </div>
          <div class="space-y-1.5 z-10">
            <span
              class="inline-flex items-center space-x-1.5 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-emerald-600 leading-none"
            >
              🧮 Hitung Zakat
            </span>
            <h3
              class="text-lg font-extrabold tracking-tight mt-1 text-slate-800"
            >
              Kalkulator Zakat
            </h3>
            <p
              class="text-xs text-slate-500 leading-relaxed font-normal max-w-xs"
            >
              Hitung Zakat Penghasilan, Maal, Emas, Peternakan, Saham, dll.
            </p>
          </div>
        </div>
      </a>

      <!-- Card 3: Faraidh Calculator -->
      <a
        href="/zakat-faraidh?type=faraidh"
        class="group block transition-all hover:-translate-y-1.5 duration-300"
      >
        <div
          class="relative overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/40 via-white to-white hover:border-amber-300 hover:shadow-soft-md text-slate-800 p-5 h-44 flex flex-col justify-between transition-all duration-300"
        >
          <!-- Dekorasi AI -->
          <div
            class="absolute -right-4 -bottom-4 w-40 h-40 opacity-90 pointer-events-none group-hover:scale-110 transition-transform duration-500 mix-blend-multiply"
            style="mask-image: radial-gradient(circle at center, black 30%, transparent 65%); -webkit-mask-image: radial-gradient(circle at center, black 30%, transparent 65%);"
          >
            <img
              src="/images/faraidh_bg.png"
              alt="Kalkulator Waris"
              class="w-full h-full object-contain"
            />
          </div>
          <div class="space-y-1.5 z-10">
            <span
              class="inline-flex items-center space-x-1.5 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-amber-600 leading-none"
            >
              ⚖️ Pembagian Waris
            </span>
            <h3
              class="text-lg font-extrabold tracking-tight mt-1 text-slate-800"
            >
              Kalkulator Faraidh
            </h3>
            <p
              class="text-xs text-slate-500 leading-relaxed font-normal max-w-xs"
            >
              Hitung pembagian waris secara syariat Islam dengan mudah.
            </p>
          </div>
        </div>
      </a>

      <!-- Card 4: Kalender Hijriah -->
      <a
        href="/kalender"
        class="group block transition-all hover:-translate-y-1.5 duration-300"
      >
        <div
          class="relative overflow-hidden rounded-2xl border border-green-200 bg-gradient-to-br from-green-50/40 via-white to-white hover:border-green-300 hover:shadow-soft-md text-slate-800 p-5 h-44 flex flex-col justify-between transition-all duration-300"
        >
          <!-- Dekorasi AI -->
          <div
            class="absolute -right-4 -bottom-4 w-40 h-40 opacity-90 pointer-events-none group-hover:scale-110 transition-transform duration-500 mix-blend-multiply"
            style="mask-image: radial-gradient(circle at center, black 30%, transparent 65%); -webkit-mask-image: radial-gradient(circle at center, black 30%, transparent 65%);"
          >
            <img
              src="/images/kalender_bg.png"
              alt="Kalender Hijriah"
              class="w-full h-full object-contain scale-125 translate-x-2 translate-y-2"
            />
          </div>
          <div class="space-y-1.5 z-10">
            <span
              class="inline-flex items-center space-x-1.5 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-green-600 leading-none"
            >
              📅 Kalender
            </span>
            <h3
              class="text-lg font-extrabold tracking-tight mt-1 text-slate-800"
            >
              Masehi & Hijriah
            </h3>
            <p
              class="text-xs text-slate-500 leading-relaxed font-normal max-w-xs"
            >
              Lihat penanggalan Masehi dan Hijriah secara interaktif dalam satu
              layar.
            </p>
          </div>
        </div>
      </a>
      <!-- Card 5: Tasbih Digital -->
      <a
        href="/tasbih"
        class="group block transition-all hover:-translate-y-1.5 duration-300"
      >
        <div
          class="relative overflow-hidden rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50/40 via-white to-white hover:border-teal-300 hover:shadow-soft-md text-slate-800 p-5 h-44 flex flex-col justify-between transition-all duration-300"
        >
          <!-- Dekorasi AI -->
          <div
            class="absolute -right-4 -bottom-4 w-40 h-40 opacity-90 pointer-events-none group-hover:scale-110 transition-transform duration-500 mix-blend-multiply"
            style="mask-image: radial-gradient(circle at center, black 30%, transparent 65%); -webkit-mask-image: radial-gradient(circle at center, black 30%, transparent 65%);"
          >
            <img
              src="/images/tasbih_icon.png"
              alt="Tasbih Digital"
              class="w-full h-full object-contain scale-110 translate-x-2 translate-y-2"
            />
          </div>
          <div class="space-y-1.5 z-10">
            <span
              class="inline-flex items-center space-x-1.5 bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-teal-600 leading-none"
            >
              📿 Zikir Pintar
            </span>
            <h3
              class="text-lg font-extrabold tracking-tight mt-1 text-slate-800"
            >
              Tasbih Digital
            </h3>
            <p
              class="text-xs text-slate-500 leading-relaxed font-normal max-w-xs"
            >
              Hitung dan simpan zikir harianmu secara otomatis.
            </p>
          </div>
        </div>
      </a>

      <!-- Card 5: Catatan Keuangan -->
      <a
        href="/keuangan"
        class="group block transition-all hover:-translate-y-1.5 duration-300"
      >
        <div
          class="relative overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/40 via-white to-white hover:border-blue-300 hover:shadow-soft-md text-slate-800 p-5 h-44 flex flex-col justify-between transition-all duration-300"
        >
          <!-- Dekorasi AI -->
          <div
            class="absolute -right-4 -bottom-4 w-40 h-40 opacity-90 pointer-events-none group-hover:scale-110 transition-transform duration-500 mix-blend-multiply flex items-center justify-center text-blue-100"
            style="mask-image: radial-gradient(circle at center, black 30%, transparent 65%); -webkit-mask-image: radial-gradient(circle at center, black 30%, transparent 65%);"
          >
            <img src="/images/cashflow_icon.png" alt="Cash Flow" class="w-full h-full object-contain drop-shadow-sm scale-110 translate-x-2 translate-y-2 opacity-80" />
          </div>
          <div class="space-y-1.5 z-10">
            <span
              class="inline-flex items-center space-x-1.5 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-blue-600 leading-none"
            >
              💳 Manajemen Uang
            </span>
            <h3
              class="text-lg font-extrabold tracking-tight mt-1 text-slate-800"
            >
              Cash Flow
            </h3>
            <p
              class="text-xs text-slate-500 leading-relaxed font-normal max-w-xs"
            >
              Catat Cash Flow harianmu dengan mudah dan aman sebagaimana isyarat QS. Al-Baqarah: 282.
            </p>
          </div>
        </div>
      </a>
    </div>
  </section>

  <!-- ==================== KUIS CERDAS CERMAT WIDGET ==================== -->
  <section class="space-y-4">
    <h2 class="text-lg font-bold text-slate-800 tracking-tight">
      Uji Pengetahuanmu
    </h2>
    <a
      href="#"
      on:click|preventDefault={startQuiz}
      class="group block transition-all hover:-translate-y-1.5 duration-300"
    >
      <div
        class="relative overflow-hidden rounded-2xl border border-fuchsia-200 bg-gradient-to-br from-fuchsia-50/40 via-white to-white hover:border-fuchsia-300 hover:shadow-soft-md text-slate-800 p-5 sm:p-6 min-h-[11rem] flex flex-col justify-between transition-all duration-300"
      >
        <!-- Dekorasi AI -->
        <div
          class="absolute -right-4 -bottom-4 w-40 h-40 sm:w-48 sm:h-48 opacity-100 pointer-events-none group-hover:scale-110 transition-transform duration-500 flex items-center justify-center"
          style="mask-image: radial-gradient(circle at center, black 30%, transparent 65%); -webkit-mask-image: radial-gradient(circle at center, black 30%, transparent 65%);"
        >
          <img src="/images/quiz_icon.png" alt="Quiz Cerdas Cermat" class="w-full h-full object-contain drop-shadow-md scale-110 translate-x-2 translate-y-2 opacity-90 group-hover:opacity-100 transition-opacity" />
        </div>
        
        <div class="space-y-2 z-10 w-[70%] sm:w-2/3">
          <span
            class="inline-flex items-center space-x-1.5 bg-fuchsia-50 border border-fuchsia-100 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-fuchsia-600 leading-none"
          >
            🎉 Mini Game Baru!
          </span>
          <h3
            class="text-lg sm:text-xl font-extrabold tracking-tight mt-1 text-slate-800"
          >
            Kuis Cerdas Cermat Islami
          </h3>
          <p
            class="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal max-w-sm"
          >
            Uji seberapa jauh pengetahuan agamamu! Ada pertanyaan seputar Fiqih, Nahwu, dan Sejarah.
          </p>
        </div>
      </div>
    </a>
  </section>

  <!-- ==================== KHASANAH LIRBOYO BANNER ==================== -->
  <section class="space-y-4">
    <h2 class="text-lg font-bold text-slate-800 tracking-tight">
      Khasanah Lirboyo
    </h2>
    <a
      href="/khasanah"
      class="group block transition-all hover:-translate-y-1.5 duration-300"
    >
      <div
        class="relative overflow-hidden rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50/40 via-white to-white hover:border-teal-300 hover:shadow-soft-md text-slate-800 p-5 h-44 flex flex-col justify-between transition-all duration-300"
      >
        <!-- Dekorasi Background -->
        <div
          class="absolute -right-4 -bottom-4 w-40 h-40 opacity-90 pointer-events-none group-hover:scale-110 transition-transform duration-500 mix-blend-multiply flex items-center justify-center text-teal-100"
          style="mask-image: radial-gradient(circle at center, black 30%, transparent 65%); -webkit-mask-image: radial-gradient(circle at center, black 30%, transparent 65%);"
        >
          <div class="text-8xl scale-125 translate-x-2 translate-y-2 opacity-30 drop-shadow-md">
            🕌
          </div>
        </div>
        <div class="space-y-1.5 z-10">
          <span
            class="inline-flex items-center space-x-1.5 bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-teal-700 leading-none"
          >
            📖 Profil & Sejarah
          </span>
          <h3 class="text-lg font-extrabold tracking-tight mt-1 text-slate-800">
            Jejak Lirboyo & Mozaik Murobbi
          </h3>
          <p
            class="text-xs text-slate-500 leading-relaxed font-normal max-w-xl"
          >
            Selami nilai-nilai sejarah, filosofi, dan profil lengkap Pondok Pesantren Lirboyo beserta pesan-pesan Masyayikh.
          </p>
        </div>
      </div>
    </a>
  </section>

  <!-- ==================== KABINET KEPENGURUSAN BANNER ==================== -->
  <section class="space-y-4">
    <h2 class="text-lg font-bold text-slate-800 tracking-tight">
      Kepengurusan
    </h2>
    <a
      href="/kepengurusan"
      class="group block transition-all hover:-translate-y-1.5 duration-300"
    >
      <div
        class="relative overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/40 via-white to-white hover:border-blue-300 hover:shadow-soft-md text-slate-800 p-5 h-44 flex flex-col justify-between transition-all duration-300"
      >
        <!-- Dekorasi AI -->
        <div
          class="absolute -right-4 -bottom-4 w-40 h-40 opacity-90 pointer-events-none group-hover:scale-110 transition-transform duration-500 mix-blend-multiply"
          style="mask-image: radial-gradient(circle at center, black 30%, transparent 65%); -webkit-mask-image: radial-gradient(circle at center, black 30%, transparent 65%);"
        >
          <img
            src="/images/kepengurusan_bg.png"
            alt="Kepengurusan"
            class="w-full h-full object-contain"
          />
        </div>
        <div class="space-y-1.5 z-10">
          <span
            class="inline-flex items-center space-x-1.5 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-blue-600 leading-none"
          >
            👥 Kepengurusan Santri
          </span>
          <h3 class="text-lg font-extrabold tracking-tight mt-1 text-slate-800">
            Kenangan Kepengurusan Santri
          </h3>
          <p
            class="text-xs text-slate-500 leading-relaxed font-normal max-w-xl"
          >
            Jelajahi rekam jejak kepengurusan siswi yang pernah menjabat pada
            periode tahun ajaran 2026 - 2032.
          </p>
        </div>
      </div>
    </a>
  </section>

  <!-- ==================== QUICK STATS GRID ==================== -->
  <section class="space-y-4">
    <h2 class="text-lg font-bold text-slate-800 tracking-tight">
      Ikhtisar MAZEEDA
    </h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {#each stats as stat}
        <a
          href={stat.href}
          class="block transition-transform hover:-translate-y-1 duration-200"
        >
          <Card class="h-full">
            <div class="flex items-start justify-between">
              <div class="space-y-2">
                <p
                  class="text-xs font-semibold text-slate-400 uppercase tracking-wider"
                >
                  {stat.name}
                </p>
                <h3
                  class="text-2xl font-black text-slate-800 tracking-tight leading-none mt-1"
                >
                  {#if isLoadingStats}
                    <span
                      class="inline-block animate-pulse bg-slate-200 rounded w-16 h-7"
                    ></span>
                  {:else}
                    {stat.value}
                  {/if}
                </h3>
                <p class="text-xs text-slate-500 font-medium">
                  {stat.description}
                </p>
              </div>

              {#if stat.image}
                <div
                  class="h-20 w-20 sm:h-24 sm:w-24 rounded-[1.25rem] bg-gradient-to-br {stat.gradient} border border-white/60 shadow-inner overflow-hidden flex items-center justify-center p-2 shrink-0 group-hover:scale-110 group-hover:-rotate-2 transition-transform duration-300 relative"
                >
                  <img
                    src={stat.image}
                    alt={stat.name}
                    class="w-full h-full object-contain mix-blend-multiply drop-shadow-md scale-110 relative z-10"
                  />
                </div>
              {:else}
                <div class="p-3 rounded-xl border {stat.color}">
                  <svelte:component this={stat.icon} class="h-6 w-6" />
                </div>
              {/if}
            </div>
          </Card>
        </a>
      {/each}
    </div>

    <!-- Tombol Perjalanan Kami (Style Card) -->
    <div class="mt-4">
      <a
        href="/perjalanan"
        class="block transition-transform hover:-translate-y-1 duration-200"
      >
        <Card class="h-full relative overflow-hidden group border border-indigo-100 hover:border-indigo-300 hover:shadow-xl transition-all">
          <div class="flex items-start justify-between relative z-10">
            <div class="space-y-2">
              <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Jejak MAZEEDA
              </p>
              <h3 class="text-2xl font-black text-slate-800 tracking-tight leading-none mt-1 transition-colors">
                Perjalanan Kami
              </h3>
              <p class="text-xs text-slate-500 font-medium">
                2023 — 2032 · Eksplorasi Kenangan
              </p>
            </div>

            <div class="h-20 w-20 sm:h-24 sm:w-24 rounded-[1.25rem] bg-gradient-to-br from-indigo-50 to-white border border-slate-100 shadow-inner overflow-hidden flex items-center justify-center p-2 shrink-0 group-hover:scale-110 group-hover:-rotate-2 transition-transform duration-300 relative">
              <img src="/images/journey_compass.png" alt="Jejak MAZEEDA" class="w-full h-full object-contain mix-blend-multiply drop-shadow-sm scale-110 relative z-10" />
            </div>
          </div>
        </Card>
      </a>
    </div>
  </section>

  <!-- ==================== HIGHLIGHTS LAYOUT GRID ==================== -->
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
    <!-- Left Column: Mading Highlight -->
    <section class="lg:col-span-7 space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold text-slate-800 tracking-tight">
          Mading Terkini
        </h2>
        <a
          href="/mading"
          class="text-xs font-bold text-primary hover:underline flex items-center space-x-1"
        >
          <span>Semua Mading</span>
          <ArrowRight class="h-3.5 w-3.5" />
        </a>
      </div>

      {#if hasAnnouncement}
        <Card class="p-6">
          <div slot="header" class="flex items-center justify-between">
            <span
              class="px-2.5 py-1 text-xs font-bold bg-blue-50 text-primary border border-blue-100 rounded-full"
            >
              {recentAnnouncement.category}
            </span>
            <div
              class="flex items-center text-slate-400 text-xs font-semibold space-x-1.5"
            >
              <Calendar class="h-3.5 w-3.5" />
              <span>{recentAnnouncement.date}</span>
            </div>
          </div>

          <div class="space-y-3 mt-4">
            <h3
              class="text-xl font-bold text-slate-800 hover:text-primary transition-colors"
            >
              <a href="/mading">{recentAnnouncement.title}</a>
            </h3>
            <p class="text-sm text-slate-500 leading-relaxed font-normal">
              {recentAnnouncement.excerpt}
            </p>
          </div>

          <div
            slot="footer"
            class="w-full flex items-center justify-between pt-2"
          >
            <span class="text-xs font-semibold text-slate-400"
              >Diposting oleh: <strong class="text-slate-600"
                >{recentAnnouncement.author &&
                recentAnnouncement.author.toUpperCase() === "ADMIN MAZEEDA"
                  ? "ADMIN MAZEEDA"
                  : recentAnnouncement.author}</strong
              ></span
            >
            <a href="/mading">
              <Button
                variant="ghost"
                size="sm"
                class="text-primary flex items-center space-x-1.5"
              >
                <span>Selengkapnya</span>
                <ArrowRight class="h-4 w-4" />
              </Button>
            </a>
          </div>
        </Card>
      {:else}
        <Card
          class="p-6 flex flex-col items-center justify-center text-center py-10 border border-dashed border-slate-200"
        >
          <Megaphone
            class="h-8 w-8 text-slate-350 mb-2 text-primary/40 animate-bounce"
          />
          <h3 class="text-xs font-extrabold text-slate-700">
            Belum Ada Momen
          </h3>
          <p
            class="text-[10px] text-slate-400 mt-1 max-w-[250px] leading-relaxed"
          >
            Tidak ada mading terbaru saat ini. Silakan masuk ke Panel Admin
            untuk membuat kenangan pertama!
          </p>
          <a href="/admin?tab=mading" class="mt-3">
            <Button size="sm" class="text-[10px] font-bold h-8 px-4"
              >Buat Mading</Button
            >
          </a>
        </Card>
      {/if}
    </section>

    <!-- Right Column: Timeline Highlight -->
    <section class="lg:col-span-5 space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold text-slate-800 tracking-tight">
          Memori Terkini
        </h2>
        <a
          href="/timeline"
          class="text-xs font-bold text-primary hover:underline flex items-center space-x-1"
        >
          <span>Semua Galeri</span>
          <ArrowRight class="h-3.5 w-3.5" />
        </a>
      </div>

      {#if hasMemory}
        <Card class="overflow-hidden p-0" noPadding>
          <div
            class="h-48 relative overflow-hidden flex items-center justify-center p-4"
          >
            {#if recentMemory.image_url}
              <img
                src={convertDriveUrl(recentMemory.image_url)}
                alt={recentMemory.title}
                class="absolute inset-0 w-full h-full object-cover"
              />
            {:else}
              <!-- Render a premium CSS gradient structure since absolute image paths might be restricted -->
              <div
                class="absolute inset-0 bg-gradient-to-tr from-blue-500 to-indigo-600"
              ></div>
            {/if}
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"
            ></div>
            <div class="absolute bottom-4 left-4 right-4 text-white z-10">
              <div
                class="flex items-center space-x-1 text-xs opacity-90 mb-1 font-semibold"
              >
                <MapPin class="h-3.5 w-3.5 text-blue-200" />
                <span>{recentMemory.location}</span>
              </div>
              <h4
                class="font-bold text-base line-clamp-1 text-white drop-shadow"
              >
                {recentMemory.title}
              </h4>
            </div>
          </div>

          <div class="p-5 space-y-3 bg-white">
            <div
              class="flex items-center justify-between text-xs text-slate-400 font-semibold"
            >
              <span>Diunggah pada: {recentMemory.date}</span>
              <div
                class="flex items-center space-x-1 text-rose-500 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100/50"
              >
                <Heart class="h-3.5 w-3.5 fill-current" />
                <span>{recentMemory.likes}</span>
              </div>
            </div>
            <p class="text-xs text-slate-500 font-normal leading-relaxed">
              Bagian dari lembar sejarah dan kenangan manis perjalanan
              kebersamaan MAZEEDA Squad.
            </p>
          </div>
        </Card>
      {:else}
        <Card
          class="p-6 flex flex-col items-center justify-center text-center py-10 border border-dashed border-slate-200"
        >
          <ImageIcon
            class="h-8 w-8 text-slate-350 mb-2 text-primary/40 animate-pulse"
          />
          <h3 class="text-xs font-extrabold text-slate-700">
            Belum Ada Foto Memori
          </h3>
          <p
            class="text-[10px] text-slate-400 mt-1 max-w-[250px] leading-relaxed"
          >
            Belum ada dokumentasi momen perjalanan kebersamaan MAZEEDA Squad.
            Unggah foto pertamamu di Direktori Timeline!
          </p>
          <a href="/timeline" class="mt-3">
            <Button
              variant="outline"
              size="sm"
              class="text-[10px] font-bold h-8 px-4 border-slate-200"
              >Buka Timeline</Button
            >
          </a>
        </Card>
      {/if}

      <!-- ==================== BIRTHDAY WIDGET (LONG COUNTDOWN) ==================== -->
      {#if user && user.tanggal_lahir}
        <BirthdayWidget
          tanggalLahir={user.tanggal_lahir}
          userName={user.name}
          placement="bottom"
        />
      {/if}
    </section>
  </div>

  <!-- ==================== COVERFLOW CAROUSEL (ALBUM MEMORI) ==================== -->
  <section class="mt-8 pt-8 border-t border-slate-200/50 w-full overflow-hidden">
    <div class="flex items-center justify-center mb-2">
      <h2 class="text-sm font-bold text-slate-400 uppercase tracking-widest">Galeri Kenangan</h2>
    </div>
    <CoverflowCarousel images={coverflowImages} on:imageClick={openLightbox} />
    
    <!-- Landscape Image Carousel -->
    <div class="mt-2 border-t border-slate-100 pt-4">
      <div class="flex items-center justify-center mb-0">
        <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest">Momen Spesial</h3>
      </div>
      <LandscapeCarousel images={landscapeImages} on:imageClick={openLightbox} />
    </div>

    <!-- Infinite Avatar Marquee -->
    <div class="mt-2 border-t border-slate-100 pt-4">
      <div class="flex items-center justify-center mb-2">
        <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest">Wajah-wajah MAZEEDA Squad</h3>
      </div>
      <AvatarMarquee images={marqueeImages} on:imageClick={openLightbox} />
    </div>
  </section>

  <!-- ==================== PREMIUM FOOTER SECTION ==================== -->
  <footer
    class="mt-12 -mx-4 -mb-12 sm:-mx-8 md:-mx-8 border-t border-slate-200 bg-slate-50/50"
  >
    <!-- Top Part: Google Play Store Button -->
    <div
      class="py-8 px-4 flex flex-col items-center justify-center border-b border-slate-200/40"
    >
      <a
        href="https://play.google.com/store/apps/details?id=com.miHoYo.GenshinImpact"
        target="_blank"
        rel="noopener noreferrer"
        class="transition-all hover:scale-105 active:scale-95 duration-200"
      >
        <img
          src="/google-play-badge.png"
          alt="Dapatkan di Google Play"
          class="h-12 w-auto object-contain"
        />
      </a>
    </div>

    <!-- Bottom Part: Copyright & Social Accounts -->
    <div class="bg-slate-100/70 py-8 px-4 text-center space-y-5">
      <p class="text-xs font-bold text-slate-500 tracking-wide">
        © 2026 MAZEEDA | MA HMQ LIRBOYO
      </p>

      <!-- Social Media Buttons -->
      <div class="flex items-center justify-center gap-3">
        <!-- WhatsApp -->
        <a
          href="https://wa.me/6285111653232"
          target="_blank"
          rel="noopener noreferrer"
          class="h-9 w-9 flex items-center justify-center transition-all hover:scale-110 active:scale-95 duration-200"
          title="WhatsApp MAZEEDA"
        >
          <img
            src="/whatsapp.png"
            alt="WhatsApp"
            class="h-full w-full object-contain scale-[0.88] filter drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.12)]"
          />
        </a>

        <!-- Instagram -->
        <a
          href="https://instagram.com/mazeedahmqlirboyo"
          target="_blank"
          rel="noopener noreferrer"
          class="h-9 w-9 flex items-center justify-center transition-all hover:scale-110 active:scale-95 duration-200"
          title="Instagram MAZEEDA"
        >
          <img
            src="/instagram.png"
            alt="Instagram"
            class="h-full w-full object-contain scale-[0.98] filter drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.12)]"
          />
        </a>

        <!-- Twitter -->
        <a
          href="https://x.com/MAZEEDA_HMQ_LBY"
          target="_blank"
          rel="noopener noreferrer"
          class="h-9 w-9 flex items-center justify-center transition-all hover:scale-110 active:scale-95 duration-200"
          title="Twitter MAZEEDA"
        >
          <img
            src="/twitter.png"
            alt="Twitter"
            class="h-full w-full object-contain scale-[0.87] filter drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.12)]"
          />
        </a>

        <!-- TikTok -->
        <a
          href="https://tiktok.com/@mazeedahmqlirboyo"
          target="_blank"
          rel="noopener noreferrer"
          class="h-9 w-9 flex items-center justify-center transition-all hover:scale-110 active:scale-95 duration-200"
          title="TikTok MAZEEDA"
        >
          <img
            src="/tiktok.png"
            alt="TikTok"
            class="h-full w-full object-contain scale-[0.87] filter drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.12)]"
          />
        </a>

        <!-- YouTube -->
        <a
          href="https://www.youtube.com/@HaloMazeeda"
          target="_blank"
          rel="noopener noreferrer"
          class="h-9 w-9 flex items-center justify-center transition-all hover:scale-110 active:scale-95 duration-200"
          title="YouTube MAZEEDA"
        >
          <img
            src="/youtube.png"
            alt="YouTube"
            class="h-full w-full object-contain scale-[0.90] filter drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.12)]"
          />
        </a>
      </div>
      
      <!-- Tentang Aplikasi Link -->
      <div class="mt-5 mb-2 flex items-center justify-center flex-wrap gap-3 text-[11px] font-semibold text-slate-400">
        <a href="/tentang" class="hover:text-indigo-600 transition-colors">Tentang Aplikasi</a>
        <span class="w-1 h-1 rounded-full bg-slate-300"></span>
        <a href="/kebijakan-privasi" class="hover:text-indigo-600 transition-colors">Kebijakan Privasi</a>
        <span class="w-1 h-1 rounded-full bg-slate-300"></span>
        <a href="/syarat-ketentuan" class="hover:text-indigo-600 transition-colors">Syarat & Ketentuan</a>
      </div>
    </div>
  </footer>
</div>

<ImageLightbox bind:show={showLightbox} imageUrl={lightboxImageUrl} on:close={() => showLightbox = false} />

<!-- ==================== FULLSCREEN QUIZ MODAL ==================== -->
{#if showQuizModal}
  <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/80 backdrop-blur-md" transition:fade={{ duration: 200 }}>
    <div 
      class="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]" 
      in:scale={{ duration: 300, start: 0.95 }}
    >
      <!-- Top Header -->
      <div class="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 sm:p-5 flex items-center justify-between shrink-0 relative overflow-hidden">
        <div class="absolute inset-0 bg-[url('/images/pattern-islamic.png')] opacity-10 mix-blend-overlay"></div>
        <h3 class="font-black text-white text-lg tracking-tight relative z-10 flex items-center gap-2">
          <Brain class="w-5 h-5 text-yellow-300" />
          Kuis Cerdas Cermat
        </h3>
        <button
          on:click={() => showQuizModal = false}
          class="relative z-10 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
        >
          <XCircle class="w-5 h-5" />
        </button>
      </div>

      <div class="p-6 sm:p-8 overflow-y-auto flex-1">
        {#if !selectedGrade}
          <!-- Grade Selection Screen -->
          <div class="text-center space-y-8 py-4" in:fly={{ y: 20, duration: 400 }}>
            <div class="space-y-2">
              <h2 class="text-2xl sm:text-3xl font-black text-slate-800">Pilih Tingkat Kesulitan</h2>
              <p class="text-slate-500 text-sm">Pilih grade untuk memulai kuis. Soal akan diacak dan berbeda setiap kali Anda bermain!</p>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <!-- Grade Ula -->
              <button 
                on:click={() => startGame('ula')}
                class="flex flex-col items-center p-6 bg-white border-2 border-emerald-100 hover:border-emerald-400 rounded-2xl hover:shadow-xl transition-all duration-300 group"
              >
                <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span class="text-2xl font-black">1</span>
                </div>
                <h3 class="font-black text-lg text-slate-800">Grade Ula</h3>
                <p class="text-xs text-slate-500 mt-2">Dasar Sejarah, Fiqih, & Tauhid</p>
              </button>

              <!-- Grade Wustha -->
              <button 
                on:click={() => startGame('wustha')}
                class="flex flex-col items-center p-6 bg-white border-2 border-amber-100 hover:border-amber-400 rounded-2xl hover:shadow-xl transition-all duration-300 group"
              >
                <div class="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span class="text-2xl font-black">2</span>
                </div>
                <h3 class="font-black text-lg text-slate-800">Grade Wustha</h3>
                <p class="text-xs text-slate-500 mt-2">Fiqih Menengah & Shorof</p>
              </button>

              <!-- Grade Ulya -->
              <button 
                on:click={() => startGame('ulya')}
                class="flex flex-col items-center p-6 bg-white border-2 border-rose-100 hover:border-rose-400 rounded-2xl hover:shadow-xl transition-all duration-300 group"
              >
                <div class="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span class="text-2xl font-black">3</span>
                </div>
                <h3 class="font-black text-lg text-slate-800">Grade Ulya</h3>
                <p class="text-xs text-slate-500 mt-2">Ushul Fiqih, Alfiyah & Lanjutan</p>
              </button>
            </div>
          </div>

        {:else if !isQuizFinished}
          <!-- Progress Bar -->
          <div class="flex items-center justify-between mb-6">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Pertanyaan {currentQuestionIndex + 1} / {activeQuestions.length}
              <span class="ml-2 px-2 py-0.5 bg-slate-100 rounded text-[10px] text-slate-500 font-bold uppercase">{selectedGrade}</span>
            </span>
            <span class="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              Skor: {quizScore}
            </span>
          </div>
          <div class="w-full bg-slate-100 h-2 rounded-full mb-8 overflow-hidden">
            <div 
              class="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500" 
              style="width: {((currentQuestionIndex + 1) / activeQuestions.length) * 100}%"
            ></div>
          </div>

          <!-- Question Content -->
          <div class="space-y-6">
            <h2 class="text-xl sm:text-2xl font-black text-slate-800 leading-tight">
              {activeQuestions[currentQuestionIndex].question}
            </h2>

            <div class="space-y-3">
              {#each activeQuestions[currentQuestionIndex].options as option, idx}
                {@const isSelected = selectedAnswer === idx}
                {@const isCorrect = idx === activeQuestions[currentQuestionIndex].correct}
                {@const statusClass = !isAnswerChecked 
                  ? "border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 text-slate-600" 
                  : (isCorrect 
                      ? "border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20" 
                      : (isSelected ? "border-rose-500 bg-rose-50 text-rose-800" : "border-slate-100 text-slate-400 opacity-50"))}
                
                <button
                  type="button"
                  on:click={() => checkAnswer(idx)}
                  disabled={isAnswerChecked}
                  class="w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between group {statusClass}"
                >
                  <span class="font-bold text-sm sm:text-base">{option}</span>
                  
                  {#if isAnswerChecked}
                    {#if isCorrect}
                      <span in:scale><CheckCircle2 class="w-5 h-5 text-emerald-500" /></span>
                    {:else if isSelected}
                      <span in:scale><XCircle class="w-5 h-5 text-rose-500" /></span>
                    {/if}
                  {/if}
                </button>
              {/each}
            </div>

            <!-- Explanation Box -->
            {#if isAnswerChecked}
              <div class="p-4 rounded-2xl bg-blue-50 border border-blue-100" in:fly={{ y: 20, duration: 300 }}>
                <p class="text-sm text-blue-800 font-medium leading-relaxed">
                  <span class="font-black text-blue-900 block mb-1">Penjelasan:</span>
                  {activeQuestions[currentQuestionIndex].explanation}
                </p>
              </div>
            {/if}
          </div>
        {:else}
          <!-- Result Screen -->
          <div class="text-center space-y-6 py-8" in:fly={{ y: 20, duration: 400 }}>
            <div class="inline-flex items-center justify-center w-24 h-24 rounded-full bg-yellow-100 text-yellow-500 mb-2 ring-8 ring-yellow-50 relative">
              <Award class="w-12 h-12" />
              <!-- Confetti dots for result -->
              <span class="absolute top-0 right-0 w-3 h-3 bg-rose-400 rounded-full animate-ping"></span>
              <span class="absolute bottom-4 -left-2 w-2 h-2 bg-blue-400 rounded-full animate-ping" style="animation-delay: 300ms;"></span>
            </div>

            <div>
              <h2 class="text-3xl font-black text-slate-800">Skor Akhir: {quizScore}</h2>
              <p class="text-lg font-bold text-indigo-600 mt-2">{getPredikat(quizScore)}</p>
            </div>
            
            <p class="text-slate-500 text-sm max-w-sm mx-auto">
              Terima kasih telah mencoba Kuis Cerdas Cermat Islami. Tetap semangat mengaji dan menuntut ilmu!
            </p>
          </div>
        {/if}
      </div>

      <!-- Footer Action -->
      <div class="p-4 sm:p-6 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
        {#if !selectedGrade}
           <Button on:click={() => showQuizModal = false} variant="outline" class="w-full sm:w-auto border-slate-200 text-slate-600 font-bold rounded-xl h-12 px-8">
              Tutup Modal
            </Button>
        {:else if !isQuizFinished}
          {#if isAnswerChecked}
            <Button on:click={nextQuestion} class="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-12 px-8">
              {currentQuestionIndex < activeQuestions.length - 1 ? 'Lanjut ke Soal Berikutnya' : 'Lihat Hasil Akhir'}
            </Button>
          {:else}
            <Button disabled class="w-full sm:w-auto bg-slate-200 text-slate-400 font-bold rounded-xl h-12 px-8">
              Pilih Jawaban Dulu
            </Button>
          {/if}
        {:else}
          <div class="w-full flex flex-col sm:flex-row gap-3">
            <Button on:click={() => showQuizModal = false} variant="outline" class="w-full sm:flex-1 border-slate-200 text-slate-600 font-bold rounded-xl h-12">
              Tutup Kuis
            </Button>
            <Button on:click={startQuiz} class="w-full sm:flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-12">
              <PartyPopper class="w-4 h-4 mr-2" />
              Pilih Grade Baru
            </Button>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  @keyframes marqueeRight {
    0% {
      transform: translateX(-50%);
    }
    100% {
      transform: translateX(0);
    }
  }

  .animate-marquee-right {
    animation: marqueeRight 35s linear infinite;
  }
</style>
