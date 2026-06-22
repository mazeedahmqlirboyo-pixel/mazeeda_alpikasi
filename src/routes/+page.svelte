<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import Card from '$lib/components/ui/card.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import { supabase } from '$lib/supabase';
  import { deferredPrompt, showInstallBtn } from '$lib/pwaStore';
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
    Scale
  } from 'lucide-svelte';

  // --- Reactive PWA State ---
  let showPWAInstall = false;
  $: showPWAInstall = $showInstallBtn;

  // --- Dynamic Stats & Highlights State ---
  let membersCount = '184 Anggota';
  let madingCount = '12 Pengumuman';
  let sanguCount = '15 Berkas';
  let quranProgress = 'QS. Al-Kahf';
  let quranDescription = 'Surah Terakhir';
  let isLoadingStats = true;
  let hasAnnouncement = false;
  let hasMemory = false;

  // --- News Carousel State ---
  let carouselSlides: any[] = [];
  let isLoadingCarousel = true;
  let currentSlideIndex = 0;
  let autoPlayInterval: any = null;

  let recentAnnouncement = {
    id: '',
    title: '',
    category: '',
    date: '',
    excerpt: '',
    author: ''
  };

  let recentMemory = {
    title: '',
    date: '',
    location: '',
    likes: 0,
    image_url: ''
  };

  // --- Clock State ---
  let timeWIB = '--:--:--';
  let timeWITA = '--:--:--';
  let timeWIT = '--:--:--';
  let clockInterval: any;

  // --- Prayer Times State ---
  let selectedCity = 'Jakarta';
  let timezoneOffset = 7; // WIB offset
  let cityTimezone = 'WIB';
  let prayerTimes: any = null;
  let nextPrayer = { name: '', time: '', countdown: '' };
  let hijriDate = '';
  let gregorianDate = '';
  let isLoadingPrayers = false;
  let prayerTimer: any;

  // Searchable dropdown state
  let isCityDropdownOpen = false;
  let citySearchQuery = '';
  let hasGPSCoords = false;
  let gpsLatitude: number | null = null;
  let gpsLongitude: number | null = null;

  const cities = [
    // --- WIB (Waktu Indonesia Barat) - GMT+7 ---
    // Sumatra
    { name: 'Banda Aceh', timezone: 'WIB', offset: 7 },
    { name: 'Lhokseumawe', timezone: 'WIB', offset: 7 },
    { name: 'Langsa', timezone: 'WIB', offset: 7 },
    { name: 'Subulussalam', timezone: 'WIB', offset: 7 },
    { name: 'Aceh Besar', timezone: 'WIB', offset: 7 },
    { name: 'Bireuen', timezone: 'WIB', offset: 7 },
    { name: 'Medan', timezone: 'WIB', offset: 7 },
    { name: 'Binjai', timezone: 'WIB', offset: 7 },
    { name: 'Pematang Siantar', timezone: 'WIB', offset: 7 },
    { name: 'Sibolga', timezone: 'WIB', offset: 7 },
    { name: 'Tebing Tinggi', timezone: 'WIB', offset: 7 },
    { name: 'Karo', timezone: 'WIB', offset: 7 },
    { name: 'Deli Serdang', timezone: 'WIB', offset: 7 },
    { name: 'Padang', timezone: 'WIB', offset: 7 },
    { name: 'Bukittinggi', timezone: 'WIB', offset: 7 },
    { name: 'Payakumbuh', timezone: 'WIB', offset: 7 },
    { name: 'Solok', timezone: 'WIB', offset: 7 },
    { name: 'Pariaman', timezone: 'WIB', offset: 7 },
    { name: 'Pekanbaru', timezone: 'WIB', offset: 7 },
    { name: 'Dumai', timezone: 'WIB', offset: 7 },
    { name: 'Bengkalis', timezone: 'WIB', offset: 7 },
    { name: 'Kampar', timezone: 'WIB', offset: 7 },
    { name: 'Tanjung Pinang', timezone: 'WIB', offset: 7 },
    { name: 'Batam', timezone: 'WIB', offset: 7 },
    { name: 'Jambi', timezone: 'WIB', offset: 7 },
    { name: 'Palembang', timezone: 'WIB', offset: 7 },
    { name: 'Pangkal Pinang', timezone: 'WIB', offset: 7 },
    { name: 'Bengkulu', timezone: 'WIB', offset: 7 },
    { name: 'Bandar Lampung', timezone: 'WIB', offset: 7 },
    { name: 'Metro', timezone: 'WIB', offset: 7 },
    { name: 'Lampung Selatan', timezone: 'WIB', offset: 7 },
    { name: 'Lampung Tengah', timezone: 'WIB', offset: 7 },
    { name: 'Lampung Timur', timezone: 'WIB', offset: 7 },
    { name: 'Pringsewu', timezone: 'WIB', offset: 7 },
    
    // Jawa
    { name: 'Jakarta', timezone: 'WIB', offset: 7 },
    { name: 'Bogor', timezone: 'WIB', offset: 7 },
    { name: 'Depok', timezone: 'WIB', offset: 7 },
    { name: 'Tangerang', timezone: 'WIB', offset: 7 },
    { name: 'Tangerang Selatan', timezone: 'WIB', offset: 7 },
    { name: 'Bekasi', timezone: 'WIB', offset: 7 },
    { name: 'Serang', timezone: 'WIB', offset: 7 },
    { name: 'Pandeglang', timezone: 'WIB', offset: 7 },
    { name: 'Lebak', timezone: 'WIB', offset: 7 },
    { name: 'Cilegon', timezone: 'WIB', offset: 7 },
    { name: 'Bandung', timezone: 'WIB', offset: 7 },
    { name: 'Cimahi', timezone: 'WIB', offset: 7 },
    { name: 'Tasikmalaya', timezone: 'WIB', offset: 7 },
    { name: 'Cirebon', timezone: 'WIB', offset: 7 },
    { name: 'Garut', timezone: 'WIB', offset: 7 },
    { name: 'Karawang', timezone: 'WIB', offset: 7 },
    { name: 'Purwakarta', timezone: 'WIB', offset: 7 },
    { name: 'Subang', timezone: 'WIB', offset: 7 },
    { name: 'Sumedang', timezone: 'WIB', offset: 7 },
    { name: 'Cianjur', timezone: 'WIB', offset: 7 },
    { name: 'Indramayu', timezone: 'WIB', offset: 7 },
    { name: 'Majalengka', timezone: 'WIB', offset: 7 },
    { name: 'Kuningan', timezone: 'WIB', offset: 7 },
    { name: 'Ciamis', timezone: 'WIB', offset: 7 },
    { name: 'Pangandaran', timezone: 'WIB', offset: 7 },
    { name: 'Banjar', timezone: 'WIB', offset: 7 },
    { name: 'Sukabumi', timezone: 'WIB', offset: 7 },
    { name: 'Semarang', timezone: 'WIB', offset: 7 },
    { name: 'Surakarta', timezone: 'WIB', offset: 7 },
    { name: 'Purwokerto', timezone: 'WIB', offset: 7 },
    { name: 'Cilacap', timezone: 'WIB', offset: 7 },
    { name: 'Banyumas', timezone: 'WIB', offset: 7 },
    { name: 'Brebes', timezone: 'WIB', offset: 7 },
    { name: 'Tegal', timezone: 'WIB', offset: 7 },
    { name: 'Pekalongan', timezone: 'WIB', offset: 7 },
    { name: 'Salatiga', timezone: 'WIB', offset: 7 },
    { name: 'Magelang', timezone: 'WIB', offset: 7 },
    { name: 'Kudus', timezone: 'WIB', offset: 7 },
    { name: 'Jepara', timezone: 'WIB', offset: 7 },
    { name: 'Kebumen', timezone: 'WIB', offset: 7 },
    { name: 'Klaten', timezone: 'WIB', offset: 7 },
    { name: 'Yogyakarta', timezone: 'WIB', offset: 7 },
    { name: 'Sleman', timezone: 'WIB', offset: 7 },
    { name: 'Bantul', timezone: 'WIB', offset: 7 },
    { name: 'Surabaya', timezone: 'WIB', offset: 7 },
    { name: 'Malang', timezone: 'WIB', offset: 7 },
    { name: 'Sidoarjo', timezone: 'WIB', offset: 7 },
    { name: 'Gresik', timezone: 'WIB', offset: 7 },
    { name: 'Kediri', timezone: 'WIB', offset: 7 },
    { name: 'Madiun', timezone: 'WIB', offset: 7 },
    { name: 'Jember', timezone: 'WIB', offset: 7 },
    { name: 'Banyuwangi', timezone: 'WIB', offset: 7 },
    { name: 'Batu', timezone: 'WIB', offset: 7 },
    { name: 'Blitar', timezone: 'WIB', offset: 7 },
    { name: 'Probolinggo', timezone: 'WIB', offset: 7 },
    { name: 'Pasuruan', timezone: 'WIB', offset: 7 },
    { name: 'Mojokerto', timezone: 'WIB', offset: 7 },
    { name: 'Ponorogo', timezone: 'WIB', offset: 7 },
    { name: 'Tuban', timezone: 'WIB', offset: 7 },
    { name: 'Lamongan', timezone: 'WIB', offset: 7 },
    { name: 'Bojonegoro', timezone: 'WIB', offset: 7 },
    { name: 'Nganjuk', timezone: 'WIB', offset: 7 },
    { name: 'Jombang', timezone: 'WIB', offset: 7 },
    
    // Kalimantan (Barat & Tengah)
    { name: 'Pontianak', timezone: 'WIB', offset: 7 },
    { name: 'Singkawang', timezone: 'WIB', offset: 7 },
    { name: 'Palangkaraya', timezone: 'WIB', offset: 7 },
    { name: 'Sampit', timezone: 'WIB', offset: 7 },
    { name: 'Pangkalan Bun', timezone: 'WIB', offset: 7 },
    { name: 'Ketapang', timezone: 'WIB', offset: 7 },
    { name: 'Sambas', timezone: 'WIB', offset: 7 },

    // --- WITA (Waktu Indonesia Tengah) - GMT+8 ---
    // Kalimantan (Selatan, Timur, Utara)
    { name: 'Banjarmasin', timezone: 'WITA', offset: 8 },
    { name: 'Banjarbaru', timezone: 'WITA', offset: 8 },
    { name: 'Samarinda', timezone: 'WITA', offset: 8 },
    { name: 'Balikpapan', timezone: 'WITA', offset: 8 },
    { name: 'Bontang', timezone: 'WITA', offset: 8 },
    { name: 'Tanjung Selor', timezone: 'WITA', offset: 8 },
    { name: 'Tarakan', timezone: 'WITA', offset: 8 },
    { name: 'Martapura', timezone: 'WITA', offset: 8 },
    { name: 'Kotabaru', timezone: 'WITA', offset: 8 },
    { name: 'Kutai Kartanegara', timezone: 'WITA', offset: 8 },
    { name: 'Berau', timezone: 'WITA', offset: 8 },
    
    // Sulawesi
    { name: 'Manado', timezone: 'WITA', offset: 8 },
    { name: 'Bitung', timezone: 'WITA', offset: 8 },
    { name: 'Gorontalo', timezone: 'WITA', offset: 8 },
    { name: 'Palu', timezone: 'WITA', offset: 8 },
    { name: 'Luwuk', timezone: 'WITA', offset: 8 },
    { name: 'Donggala', timezone: 'WITA', offset: 8 },
    { name: 'Mamuju', timezone: 'WITA', offset: 8 },
    { name: 'Makassar', timezone: 'WITA', offset: 8 },
    { name: 'Gowa', timezone: 'WITA', offset: 8 },
    { name: 'Maros', timezone: 'WITA', offset: 8 },
    { name: 'Parepare', timezone: 'WITA', offset: 8 },
    { name: 'Palopo', timezone: 'WITA', offset: 8 },
    { name: 'Bone', timezone: 'WITA', offset: 8 },
    { name: 'Bulukumba', timezone: 'WITA', offset: 8 },
    { name: 'Wajo', timezone: 'WITA', offset: 8 },
    { name: 'Kendari', timezone: 'WITA', offset: 8 },
    { name: 'Bau-Bau', timezone: 'WITA', offset: 8 },
    { name: 'Kolaka', timezone: 'WITA', offset: 8 },
    { name: 'Konawe', timezone: 'WITA', offset: 8 },
    
    // Bali & Nusa Tenggara
    { name: 'Denpasar', timezone: 'WITA', offset: 8 },
    { name: 'Singaraja', timezone: 'WITA', offset: 8 },
    { name: 'Gianyar', timezone: 'WITA', offset: 8 },
    { name: 'Badung', timezone: 'WITA', offset: 8 },
    { name: 'Tabanan', timezone: 'WITA', offset: 8 },
    { name: 'Klungkung', timezone: 'WITA', offset: 8 },
    { name: 'Karangasem', timezone: 'WITA', offset: 8 },
    { name: 'Jembrana', timezone: 'WITA', offset: 8 },
    { name: 'Mataram', timezone: 'WITA', offset: 8 },
    { name: 'Bima', timezone: 'WITA', offset: 8 },
    { name: 'Lombok Barat', timezone: 'WITA', offset: 8 },
    { name: 'Lombok Tengah', timezone: 'WITA', offset: 8 },
    { name: 'Lombok Timur', timezone: 'WITA', offset: 8 },
    { name: 'Sumbawa', timezone: 'WITA', offset: 8 },
    { name: 'Kupang', timezone: 'WITA', offset: 8 },
    { name: 'Ende', timezone: 'WITA', offset: 8 },
    { name: 'Maumere', timezone: 'WITA', offset: 8 },
    { name: 'Manggarai', timezone: 'WITA', offset: 8 },

    // --- WIT (Waktu Indonesia Timur) - GMT+9 ---
    // Maluku
    { name: 'Ambon', timezone: 'WIT', offset: 9 },
    { name: 'Tual', timezone: 'WIT', offset: 9 },
    { name: 'Ternate', timezone: 'WIT', offset: 9 },
    { name: 'Sofifi', timezone: 'WIT', offset: 9 },
    { name: 'Tidore', timezone: 'WIT', offset: 9 },
    
    // Papua
    { name: 'Jayapura', timezone: 'WIT', offset: 9 },
    { name: 'Manokwari', timezone: 'WIT', offset: 9 },
    { name: 'Sorong', timezone: 'WIT', offset: 9 },
    { name: 'Merauke', timezone: 'WIT', offset: 9 },
    { name: 'Nabire', timezone: 'WIT', offset: 9 },
    { name: 'Wamena', timezone: 'WIT', offset: 9 },
    { name: 'Biak', timezone: 'WIT', offset: 9 },
    { name: 'Mimika', timezone: 'WIT', offset: 9 }
  ];

  const prayerFallbacks: Record<string, Record<string, string>> = {
    'Jakarta': { Fajr: '04:45', Sunrise: '06:01', Dhuhr: '11:58', Asr: '15:19', Maghrib: '17:54', Isha: '19:08' },
    'Bandung': { Fajr: '04:42', Sunrise: '05:58', Dhuhr: '11:55', Asr: '15:16', Maghrib: '17:51', Isha: '19:05' },
    'Surabaya': { Fajr: '04:26', Sunrise: '05:42', Dhuhr: '11:39', Asr: '15:00', Maghrib: '17:35', Isha: '18:49' },
    'Makassar': { Fajr: '04:52', Sunrise: '06:08', Dhuhr: '12:05', Asr: '15:26', Maghrib: '18:01', Isha: '19:15' },
    'Denpasar': { Fajr: '05:01', Sunrise: '06:17', Dhuhr: '12:14', Asr: '15:35', Maghrib: '18:10', Isha: '19:24' },
    'Jayapura': { Fajr: '04:15', Sunrise: '05:31', Dhuhr: '11:28', Asr: '14:49', Maghrib: '17:24', Isha: '18:38' },
    'Ambon': { Fajr: '05:00', Sunrise: '06:16', Dhuhr: '12:13', Asr: '15:34', Maghrib: '18:09', Isha: '19:23' }
  };

  $: filteredCities = cities.filter(c => 
    c.name.toLowerCase().includes(citySearchQuery.toLowerCase())
  );

  async function requestGeolocation() {
    isCityDropdownOpen = false;
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      isLoadingPrayers = true;
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          gpsLatitude = position.coords.latitude;
          gpsLongitude = position.coords.longitude;
          hasGPSCoords = true;
          selectedCity = 'Lokasi Saya';
          
          // Determine timezone based on longitude mapping:
          if (gpsLongitude >= 135) {
            cityTimezone = 'WIT';
            timezoneOffset = 9;
          } else if (gpsLongitude >= 120) {
            cityTimezone = 'WITA';
            timezoneOffset = 8;
          } else {
            cityTimezone = 'WIB';
            timezoneOffset = 7;
          }

          await fetchPrayerTimes();
        },
        (error) => {
          console.error('Geolocation error:', error);
          isLoadingPrayers = false;
          alert('Gagal mengakses lokasi GPS Anda. Silakan pilih daerah secara manual.');
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      alert('Browser Anda tidak mendukung layanan Geolocation.');
    }
  }

  function selectCity(city: any) {
    selectedCity = city.name;
    cityTimezone = city.timezone;
    timezoneOffset = city.offset;
    hasGPSCoords = false;
    gpsLatitude = null;
    gpsLongitude = null;
    isCityDropdownOpen = false;
    citySearchQuery = '';
  }

  // --- Prayer Times logic ---
  async function fetchPrayerTimes() {
    const INDO_MONTHS = [
      'JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI',
      'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'
    ];

    const INDO_HIJRI_MONTHS = [
      'MUHARRAM', 'SAFAR', 'RABIUL AWWAL', 'RABIUL AKHIR',
      'JUMADIL AWWAL', 'JUMADIL AKHIR', 'RAJAB', 'SYA\'BAN',
      'RAMADHAN', 'SYAWWAL', 'DZULQA\'DAH', 'DZULHIJJAH'
    ];

    isLoadingPrayers = true;
    
    let url = '';
    if (selectedCity === 'Lokasi Saya' && gpsLatitude && gpsLongitude) {
      url = `https://api.aladhan.com/v1/timings?latitude=${gpsLatitude}&longitude=${gpsLongitude}&method=15`;
    } else {
      url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(selectedCity)}&country=Indonesia&method=15`;
    }

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('API request failed');
      const json = await res.json();
      if (json.code === 200) {
        const timings = json.data.timings;
        prayerTimes = {
          Subuh: timings.Fajr,
          Terbit: timings.Sunrise,
          Dzuhur: timings.Dhuhr,
          Ashar: timings.Asr,
          Maghrib: timings.Maghrib,
          Isya: timings.Isha
        };
        
        const hijriDay = json.data.date.hijri.day;
        const hijriMonthNum = parseInt(json.data.date.hijri.month.number, 10);
        const hijriYear = json.data.date.hijri.year;
        const indHijriMonth = INDO_HIJRI_MONTHS[hijriMonthNum - 1] || json.data.date.hijri.month.en.toUpperCase();
        hijriDate = `${hijriDay} ${indHijriMonth} ${hijriYear} H.`;

        const gregDay = json.data.date.gregorian.day;
        const gregMonthNum = parseInt(json.data.date.gregorian.month.number, 10);
        const gregYear = json.data.date.gregorian.year;
        const indMonth = INDO_MONTHS[gregMonthNum - 1] || json.data.date.gregorian.month.en.toUpperCase();
        gregorianDate = `${gregDay} ${indMonth} ${gregYear} M.`;

        // Auto parse timezone meta from API to support any custom city
        if (json.data.meta && json.data.meta.timezone) {
          const apiTimezone = json.data.meta.timezone;
          const lng = json.data.meta.longitude;
          if (apiTimezone.includes('Jayapura') || lng >= 135) {
            cityTimezone = 'WIT';
            timezoneOffset = 9;
          } else if (apiTimezone.includes('Makassar') || lng >= 120) {
            cityTimezone = 'WITA';
            timezoneOffset = 8;
          } else {
            cityTimezone = 'WIB';
            timezoneOffset = 7;
          }
        }
      }
    } catch (e) {
      console.warn('API error, using offline prayer times fallback for city:', selectedCity);
      const fallbackCity = selectedCity === 'Lokasi Saya' ? 'Jakarta' : selectedCity;
      const fallback = prayerFallbacks[fallbackCity] || prayerFallbacks['Jakarta'];
      prayerTimes = {
        Subuh: fallback.Fajr,
        Terbit: fallback.Sunrise,
        Dzuhur: fallback.Dhuhr,
        Ashar: fallback.Asr,
        Maghrib: fallback.Maghrib,
        Isya: fallback.Isha
      };
      
      const now = new Date();
      gregorianDate = `${now.getDate()} ${INDO_MONTHS[now.getMonth()]} ${now.getFullYear()} M.`;
      hijriDate = 'KALENDER HIJRIYAH H.';
    } finally {
      isLoadingPrayers = false;
      calculateNextPrayer();
    }
  }

  function calculateNextPrayer() {
    if (!prayerTimes) return;
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const localNow = new Date(utc + (3600000 * timezoneOffset));
    
    const currentHours = localNow.getHours();
    const currentMinutes = localNow.getMinutes();
    const currentTotalMinutes = currentHours * 60 + currentMinutes;

    const parseToMinutes = (timeStr: string) => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };

    const prayerOrder = [
      { name: 'Subuh', time: prayerTimes.Subuh },
      { name: 'Dzuhur', time: prayerTimes.Dzuhur },
      { name: 'Ashar', time: prayerTimes.Ashar },
      { name: 'Maghrib', time: prayerTimes.Maghrib },
      { name: 'Isya', time: prayerTimes.Isya }
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
          countdown: `${h > 0 ? h + 'j ' : ''}${m}m lagi`
        };
        found = true;
        break;
      }
    }

    if (!found) {
      const subuhMinutes = parseToMinutes(prayerTimes.Subuh);
      const diff = (24 * 60 - currentTotalMinutes) + subuhMinutes;
      const h = Math.floor(diff / 60);
      const m = diff % 60;
      nextPrayer = {
        name: 'Subuh (Besok)',
        time: prayerTimes.Subuh,
        countdown: `${h > 0 ? h + 'j ' : ''}${m}m lagi`
      };
    }
  }

  // --- News slides logic ---
  async function fetchCarousel() {
    try {
      isLoadingCarousel = true;
      const { data, error } = await supabase
        .from('news_slides')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data && data.length > 0) {
        carouselSlides = data;
      } else {
        // Fallback default slides
        carouselSlides = [
          {
            id: '1',
            title: 'Kilas Balik Rapat Kerja Tahunan 2026',
            description: 'Momen kebersamaan dan merajut ukhuwah alumni MAZEEDA Squad.',
            image_url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1200&auto=format&fit=crop',
            redirect_url: '/timeline'
          },
          {
            id: '2',
            title: 'Sangu & Doa Harian Digital',
            description: 'Kumpulan sholawat, jausyan, nadzom, dan doa lengkap untuk bekal spiritual Anda.',
            image_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200&auto=format&fit=crop',
            redirect_url: '/sangu'
          },
          {
            id: '3',
            title: 'Mading Online Realtime',
            description: 'Dapatkan informasi penting dan kirimkan mading atau sticky notes inspiratif secara instan.',
            image_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200&auto=format&fit=crop',
            redirect_url: '/mading'
          }
        ];
      }
    } catch (err) {
      console.error('Error fetching news slides:', err);
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
    currentSlideIndex = (currentSlideIndex - 1 + carouselSlides.length) % carouselSlides.length;
  }

  // --- Trigger PWA Prompt ---
  async function triggerInstallPrompt() {
    const prompt = $deferredPrompt;
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    console.log('User PWA choice outcome:', outcome);
    deferredPrompt.set(null);
    showInstallBtn.set(false);
  }

  // Convert Google Drive share link to direct image link
  function convertDriveUrl(url: string) {
    if (!url) return "";
    let cleaned = url.trim();
    if (cleaned.includes("lh3.googleusercontent.com/u/0/d/")) {
      return cleaned.replace("lh3.googleusercontent.com/u/0/d/", "lh3.googleusercontent.com/d/");
    }
    const match = cleaned.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || 
                  cleaned.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800`;
    }
    return cleaned;
  }

  // Reactively fetch prayer times on city change
  $: if (selectedCity) {
    fetchPrayerTimes();
  }

  // Handle click outside dropdown
  function handleClickOutside(event: MouseEvent) {
    if (typeof document !== 'undefined') {
      const container = document.getElementById('city-selector-container');
      if (container && !container.contains(event.target as Node)) {
        isCityDropdownOpen = false;
      }
    }
  }

  // --- Realtime Clocks logic ---
  function updateClocks() {
    if (typeof window === 'undefined') return;
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    
    const formatTime = (offset: number) => {
      const d = new Date(utc + (3600000 * offset));
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const seconds = String(d.getSeconds()).padStart(2, '0');
      return `${hours}:${minutes}:${seconds}`;
    };

    timeWIB = formatTime(7);
    timeWITA = formatTime(8);
    timeWIT = formatTime(9);
  }

  // --- Dynamic Stats & Highlights fetching ---
  async function fetchStatsAndHighlights() {
    try {
      isLoadingStats = true;
      
      // 1. Fetch allowed_alumni count
      const { count: squadCount } = await supabase
        .from('allowed_alumni')
        .select('*', { count: 'exact', head: true });
      if (squadCount !== null) {
        membersCount = `${squadCount} Anggota`;
      }

      // 2. Fetch mading counts (announcements + notes)
      const { count: annCount } = await supabase
        .from('mading_announcements')
        .select('*', { count: 'exact', head: true });
      const { count: notesCount } = await supabase
        .from('mading_notes')
        .select('*', { count: 'exact', head: true });
      const totalMading = (annCount || 0) + (notesCount || 0);
      madingCount = `${totalMading} Pengumuman`;

      // 3. Fetch bacaan count
      const { count: bacaanCount } = await supabase
        .from('bacaan')
        .select('*', { count: 'exact', head: true });
      if (bacaanCount !== null) {
        sanguCount = `${bacaanCount} Berkas`;
      }

      // 4. Quran progress from localStorage
      if (typeof localStorage !== 'undefined') {
        const storedName = localStorage.getItem('quran_selectedSurahName');
        const storedAyats = localStorage.getItem('quran_selectedSurahAyats');
        if (storedName) {
          quranProgress = storedName;
          quranDescription = `${storedAyats || '0'} Ayat - Terakhir Dibaca`;
        } else {
          quranProgress = 'QS. Al-Fatihah';
          quranDescription = 'Surah Pertama';
        }
      }

      // 5. Fetch recent announcement
      const { data: annData } = await supabase
        .from('mading_announcements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);
      if (annData && annData.length > 0) {
        const item = annData[0];
        recentAnnouncement = {
          id: item.id,
          title: item.title,
          category: item.category,
          date: new Date(item.created_at).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }),
          excerpt: item.content.length > 150 ? item.content.substring(0, 150) + '...' : item.content,
          author: item.author
        };
        hasAnnouncement = true;
      } else {
        hasAnnouncement = false;
      }

      // 6. Fetch recent memory
      const { data: memData } = await supabase
        .from('memories')
        .select('*, memory_likes(user_name)')
        .order('date', { ascending: false })
        .limit(1);
      if (memData && memData.length > 0) {
        const item = memData[0];
        recentMemory = {
          title: item.title,
          date: new Date(item.date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }),
          location: item.location,
          likes: (item.memory_likes || []).length,
          image_url: item.image_url
        };
        hasMemory = true;
      } else {
        hasMemory = false;
      }

    } catch (e) {
      console.warn('Failed to fetch stats and highlights:', e);
    } finally {
      isLoadingStats = false;
    }
  }

  onMount(() => {
    // Auto detect user location / timezone offset to select city default
    if (typeof window !== 'undefined') {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const offsetHours = -new Date().getTimezoneOffset() / 60;
      
      if (tz.includes('Jayapura') || offsetHours === 9) {
        selectedCity = 'Jayapura';
      } else if (tz.includes('Makassar') || tz.includes('Singapore') || offsetHours === 8) {
        selectedCity = 'Makassar';
      } else {
        // Default WIB (Jakarta, Bandung, Surabaya, dll)
        selectedCity = 'Jakarta';
      }

      window.addEventListener('click', handleClickOutside);
    }

    updateClocks();
    clockInterval = setInterval(updateClocks, 1000);

    fetchStatsAndHighlights();
    fetchCarousel();
    startAutoPlay();

    // Recalculate next prayer countdown every minute
    prayerTimer = setInterval(calculateNextPrayer, 60000);
  });

  onDestroy(() => {
    if (clockInterval) clearInterval(clockInterval);
    if (prayerTimer) clearInterval(prayerTimer);
    stopAutoPlay();
    if (typeof window !== 'undefined') {
      window.removeEventListener('click', handleClickOutside);
    }
  });

  // Stats Grid Definition
  $: stats = [
    { name: 'Mazeeda Squad', value: membersCount, description: 'Alumni, Alumnus & Mustahiq', icon: Users, color: 'text-blue-600 bg-blue-50 border-blue-100/70', href: '/squad' },
    { name: 'Mading Board', value: madingCount, description: 'Update terkini & sticky notes', icon: Megaphone, color: 'text-amber-600 bg-amber-50 border-amber-100/70', href: '/mading' },
    { name: 'Sangu & Wirid', value: sanguCount, description: 'Koleksi doa, sholawat & nadzom', icon: Wallet, color: 'text-emerald-600 bg-emerald-50 border-emerald-100/70', href: '/sangu' },
    { name: 'Al-Qur\'an Progress', value: quranProgress, description: quranDescription, icon: BookOpen, color: 'text-indigo-600 bg-indigo-50 border-indigo-100/70', href: '/quran' }
  ];
</script>

<div class="space-y-6 pb-12">
  
  <!-- ==================== PWA INSTALL BAR ==================== -->
  {#if showPWAInstall}
    <section class="bg-gradient-to-r from-blue-600 via-indigo-600 to-primary text-white rounded-3xl p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-300">
      <div class="flex items-center space-x-4">
        <div class="p-3 bg-white/10 rounded-2xl">
          <Smartphone class="h-6 w-6 text-blue-200" />
        </div>
        <div class="space-y-1 text-center sm:text-left">
          <h3 class="font-extrabold text-sm sm:text-base leading-none">Pasang Aplikasi MAZEEDA</h3>
          <p class="text-xs text-blue-100 leading-relaxed font-normal">
            Instal aplikasi di HP atau komputer Anda untuk akses super cepat dan hemat kuota internet.
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
  <section class="relative h-[220px] sm:h-[300px] md:h-[350px] w-full rounded-3xl overflow-hidden shadow-soft-md bg-slate-900 group">
    {#if isLoadingCarousel}
      <div class="absolute inset-0 flex items-center justify-center bg-slate-950 text-white/50">
        <div class="animate-spin h-7 w-7 border-2 border-white/20 border-t-white rounded-full"></div>
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
            <div class="absolute inset-0 bg-cover bg-center transition-transform duration-1000 transform group-hover:scale-102" style="background-image: url('{convertDriveUrl(slide.image_url)}');"></div>
            <!-- Dark Gradient Overlay -->
            <div class="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/70 to-transparent"></div>
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>

            <!-- Carousel content -->
            <div class="relative z-10 max-w-xl space-y-2 sm:space-y-4 text-white">
              <span class="inline-flex items-center space-x-1.5 bg-primary/80 border border-primary/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                <Compass class="h-3 w-3" />
                <span>Berita Utama</span>
              </span>
              <h2 class="text-lg sm:text-2xl md:text-3xl font-black leading-tight tracking-tight drop-shadow-md">
                {slide.title}
              </h2>
              <p class="text-xs sm:text-sm text-slate-300 font-medium line-clamp-2 max-w-lg leading-relaxed drop-shadow">
                {slide.description}
              </p>
              {#if slide.redirect_url}
                <div class="pt-2">
                  <a href={slide.redirect_url}>
                    <Button variant="default" size="sm" class="font-extrabold text-xs flex items-center space-x-1">
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
      <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-1.5 z-20">
        {#each carouselSlides as _, index}
          <button
            on:click={() => { currentSlideIndex = index; stopAutoPlay(); startAutoPlay(); }}
            class="h-2 rounded-full transition-all duration-300 cursor-pointer {index === currentSlideIndex ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'}"
            aria-label="Slide ke {index + 1}"
          ></button>
        {/each}
      </div>
    {/if}
  </section>

  <!-- ==================== INDONESIAN TIME & PRAYER WIDGET ==================== -->
  <section class="grid grid-cols-1 lg:grid-cols-12 gap-5">
    
    <!-- Timezone Clocks Card (8 columns) -->
    <Card class="lg:col-span-7 bg-slate-50 border-slate-200/50 shadow-soft-sm relative overflow-hidden flex flex-col justify-between">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <div class="flex items-center space-x-2 text-slate-800">
          <Clock class="h-4.5 w-4.5 text-primary" />
          <h2 class="text-sm font-bold uppercase tracking-wider">Waktu Indonesia</h2>
        </div>
        <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">REALTIME CLOCKS</span>
      </div>

      <!-- Timezone Clocks Grid -->
      <div class="grid grid-cols-3 gap-3 py-6 text-center">
        <!-- WIB -->
        <div class="space-y-1.5 p-3 rounded-2xl bg-white border border-slate-100 shadow-soft-xs relative" class:ring-2={cityTimezone === 'WIB'} class:ring-primary={cityTimezone === 'WIB'}>
          {#if cityTimezone === 'WIB'}
            <span class="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] bg-primary text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wider scale-90">Aktif</span>
          {/if}
          <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">WIB</span>
          <h3 class="text-xl sm:text-2xl font-black text-slate-800 tracking-tight font-mono">{timeWIB}</h3>
          <p class="text-[9px] text-slate-500 font-semibold truncate leading-none">GMT+7 (Jakarta)</p>
        </div>

        <!-- WITA -->
        <div class="space-y-1.5 p-3 rounded-2xl bg-white border border-slate-100 shadow-soft-xs relative" class:ring-2={cityTimezone === 'WITA'} class:ring-emerald-500={cityTimezone === 'WITA'}>
          {#if cityTimezone === 'WITA'}
            <span class="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] bg-emerald-500 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wider scale-90">Aktif</span>
          {/if}
          <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">WITA</span>
          <h3 class="text-xl sm:text-2xl font-black text-slate-800 tracking-tight font-mono">{timeWITA}</h3>
          <p class="text-[9px] text-slate-500 font-semibold truncate leading-none">GMT+8 (Makassar)</p>
        </div>

        <!-- WIT -->
        <div class="space-y-1.5 p-3 rounded-2xl bg-white border border-slate-100 shadow-soft-xs relative" class:ring-2={cityTimezone === 'WIT'} class:ring-indigo-500={cityTimezone === 'WIT'}>
          {#if cityTimezone === 'WIT'}
            <span class="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] bg-indigo-500 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wider scale-90">Aktif</span>
          {/if}
          <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">WIT</span>
          <h3 class="text-xl sm:text-2xl font-black text-slate-800 tracking-tight font-mono">{timeWIT}</h3>
          <p class="text-[9px] text-slate-500 font-semibold truncate leading-none">GMT+9 (Jayapura)</p>
        </div>
      </div>

      <!-- Quick Date Footer -->
      <div class="flex flex-col sm:flex-row justify-between items-center bg-white border border-slate-200/50 rounded-2xl p-3 gap-2 mt-2">
        <div class="flex items-center space-x-2">
          <Calendar class="h-4.5 w-4.5 text-slate-400" />
          <span class="text-xs font-bold text-slate-600 uppercase tracking-wider">{gregorianDate || 'MEMUAT TANGGAL...'}</span>
        </div>
        <div class="text-xs font-black text-primary bg-blue-50 border border-blue-100 px-3 py-1 rounded-full uppercase tracking-wider">
          🌙 {hijriDate || 'MEMUAT KALENDER HIJRIYAH...'}
        </div>
      </div>
    </Card>

    <!-- Prayer Times Card (5 columns) -->
    <Card class="lg:col-span-5 bg-white border-slate-200/50 shadow-soft-sm flex flex-col justify-between">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <div class="flex items-center space-x-1.5 text-slate-700">
          <MapPin class="h-4.5 w-4.5 text-primary" />
          <!-- Searchable City Selector -->
          <div class="relative inline-block text-left" id="city-selector-container">
            <button 
              on:click|stopPropagation={() => isCityDropdownOpen = !isCityDropdownOpen}
              class="inline-flex items-center space-x-1 text-sm font-bold text-slate-800 hover:text-primary transition-colors focus:outline-none cursor-pointer py-0.5"
            >
              <span>{selectedCity === 'Lokasi Saya' ? 'Lokasi Saya' : selectedCity} ({cityTimezone})</span>
              <span class="text-slate-450 text-[10px] transform transition-transform duration-200" class:rotate-180={isCityDropdownOpen}>▼</span>
            </button>
            
            {#if isCityDropdownOpen}
              <div 
                class="absolute left-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-3 space-y-2 animate-in fade-in-50 slide-in-from-top-2 duration-150 origin-top-left"
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
                  <svg class="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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
                <div class="max-h-52 overflow-y-auto divide-y divide-slate-100 custom-scrollbar pr-1">
                  {#each filteredCities as city}
                    <button 
                      on:click={() => selectCity(city)}
                      class="w-full text-left py-2 px-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-primary rounded-lg transition-colors flex justify-between items-center cursor-pointer"
                    >
                      <span class="font-bold">{city.name}</span>
                      <span class="text-[9px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase tracking-wider">{city.timezone}</span>
                    </button>
                  {/each}

                  {#if citySearchQuery.trim() !== ''}
                    <button 
                      on:click={() => {
                        selectedCity = citySearchQuery.trim();
                        isCityDropdownOpen = false;
                        citySearchQuery = '';
                      }}
                      class="w-full text-left py-2 px-2.5 text-xs text-primary bg-blue-50/50 hover:bg-blue-50 rounded-lg transition-colors flex items-center space-x-2 font-bold cursor-pointer"
                    >
                      <span>🔍</span>
                      <span class="truncate">Gunakan pencarian kustom: "{citySearchQuery}"</span>
                    </button>
                  {/if}

                  {#if filteredCities.length === 0 && citySearchQuery.trim() === ''}
                    <div class="text-center py-4 text-xs text-slate-400 font-medium">Kota tidak ditemukan</div>
                  {/if}
                </div>
              </div>
            {/if}
          </div>
        </div>
        <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">JADWAL SHOLAT</span>
      </div>

      <!-- Next Prayer countdown -->
      <div class="py-4 text-center">
        {#if isLoadingPrayers}
          <div class="h-8 flex items-center justify-center text-slate-400 font-semibold text-xs animate-pulse">Menyelaraskan waktu...</div>
        {:else if nextPrayer.name}
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sholat Berikutnya</p>
          <h3 class="text-2xl font-black text-primary tracking-tight mt-1">
            {nextPrayer.name} ({nextPrayer.time})
          </h3>
          <p class="text-xs text-slate-500 font-extrabold mt-0.5 bg-blue-50 border border-blue-100/50 px-3 py-0.5 rounded-full inline-block">
            ⏳ {nextPrayer.countdown}
          </p>
        {/if}
      </div>

      <!-- Daily times grid -->
      <div class="grid grid-cols-5 gap-1.5 border-t border-slate-100 pt-3">
        {#if prayerTimes}
          <div class="text-center p-1.5 rounded-xl bg-slate-50 border border-slate-100">
            <p class="text-[9px] text-slate-400 font-black uppercase tracking-wider">Subuh</p>
            <p class="text-xs font-black text-slate-800 font-mono mt-0.5">{prayerTimes.Subuh}</p>
          </div>
          <div class="text-center p-1.5 rounded-xl bg-slate-50 border border-slate-100">
            <p class="text-[9px] text-slate-400 font-black uppercase tracking-wider">Dzuhur</p>
            <p class="text-xs font-black text-slate-800 font-mono mt-0.5">{prayerTimes.Dzuhur}</p>
          </div>
          <div class="text-center p-1.5 rounded-xl bg-slate-50 border border-slate-100">
            <p class="text-[9px] text-slate-400 font-black uppercase tracking-wider">Ashar</p>
            <p class="text-xs font-black text-slate-800 font-mono mt-0.5">{prayerTimes.Ashar}</p>
          </div>
          <div class="text-center p-1.5 rounded-xl bg-slate-50 border border-slate-100">
            <p class="text-[9px] text-slate-400 font-black uppercase tracking-wider">Maghrib</p>
            <p class="text-xs font-black text-slate-800 font-mono mt-0.5">{prayerTimes.Maghrib}</p>
          </div>
          <div class="text-center p-1.5 rounded-xl bg-slate-50 border border-slate-100">
            <p class="text-[9px] text-slate-400 font-black uppercase tracking-wider">Isya</p>
            <p class="text-xs font-black text-slate-800 font-mono mt-0.5">{prayerTimes.Isya}</p>
          </div>
        {:else}
          <div class="col-span-5 text-center text-xs text-slate-400 py-3 font-semibold">Mengambil jadwal...</div>
        {/if}
      </div>
    </Card>

  </section>

  <!-- ==================== FITUR ISLAMI WIDGET ==================== -->
  <section class="space-y-4">
    <h2 class="text-lg font-bold text-slate-800 tracking-tight">Fitur Islami</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
      <!-- Card 1: Qibla Compass -->
      <a href="/kiblat" class="group block transition-all hover:-translate-y-1.5 duration-300">
        <div class="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 border-indigo-500/20 hover:border-indigo-500/40 hover:shadow-[0_8px_30px_rgba(99,102,241,0.2)] text-white p-5 h-44 flex flex-col justify-between transition-all duration-300">
          <div class="absolute -right-4 -bottom-6 opacity-10 text-white pointer-events-none group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
            <Compass class="h-32 w-32" />
          </div>
          <div class="space-y-1.5 z-10">
            <span class="inline-flex items-center space-x-1.5 bg-indigo-500/20 border border-indigo-400/20 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-indigo-300 leading-none">
              🧭 Kompas Arah
            </span>
            <h3 class="text-xl font-extrabold tracking-tight mt-1">Arah Kiblat</h3>
            <p class="text-xs text-indigo-200/80 leading-relaxed font-normal max-w-xs">
              Cari arah kiblat sholat secara real-time dengan HP atau GPS.
            </p>
          </div>
          <div class="z-10 flex justify-end">
            <div class="bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-white/20 text-white rounded-full p-2 transition-all duration-300 group-hover:scale-105">
              <ArrowRight class="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-300" />
            </div>
          </div>
        </div>
      </a>

      <!-- Card 2: Zakat Calculator -->
      <a href="/zakat-faraidh?type=zakat" class="group block transition-all hover:-translate-y-1.5 duration-300">
        <div class="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 border-emerald-500/20 hover:border-emerald-500/40 hover:shadow-[0_8px_30px_rgba(16,185,129,0.2)] text-white p-5 h-44 flex flex-col justify-between transition-all duration-300">
          <div class="absolute -right-4 -bottom-6 opacity-10 text-white pointer-events-none group-hover:scale-110 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-500">
            <Wallet class="h-32 w-32" />
          </div>
          <div class="space-y-1.5 z-10">
            <span class="inline-flex items-center space-x-1.5 bg-emerald-500/20 border border-emerald-400/20 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-emerald-300 leading-none">
              🧮 Hitung Zakat
            </span>
            <h3 class="text-xl font-extrabold tracking-tight mt-1">Kalkulator Zakat</h3>
            <p class="text-xs text-emerald-200/80 leading-relaxed font-normal max-w-xs">
              Hitung Zakat Penghasilan, Maal, Emas, Peternakan, Saham, dll.
            </p>
          </div>
          <div class="z-10 flex justify-end">
            <div class="bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-white/20 text-white rounded-full p-2 transition-all duration-300 group-hover:scale-105">
              <ArrowRight class="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-300" />
            </div>
          </div>
        </div>
      </a>

      <!-- Card 3: Faraidh Calculator -->
      <a href="/zakat-faraidh?type=faraidh" class="group block transition-all hover:-translate-y-1.5 duration-300">
        <div class="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-amber-950 via-slate-900 to-amber-900 border-amber-500/20 hover:border-amber-500/40 hover:shadow-[0_8px_30px_rgba(245,158,11,0.2)] text-white p-5 h-44 flex flex-col justify-between transition-all duration-300">
          <div class="absolute -right-4 -bottom-6 opacity-10 text-white pointer-events-none group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500">
            <Scale class="h-32 w-32" />
          </div>
          <div class="space-y-1.5 z-10">
            <span class="inline-flex items-center space-x-1.5 bg-amber-500/20 border border-amber-400/20 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-amber-300 leading-none">
              ⚖️ Pembagian Waris
            </span>
            <h3 class="text-xl font-extrabold tracking-tight mt-1">Kalkulator Faraidh</h3>
            <p class="text-xs text-amber-200/80 leading-relaxed font-normal max-w-xs">
              Hitung pembagian waris secara syariat Islam dengan mudah.
            </p>
          </div>
          <div class="z-10 flex justify-end">
            <div class="bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-white/20 text-white rounded-full p-2 transition-all duration-300 group-hover:scale-105">
              <ArrowRight class="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-300" />
            </div>
          </div>
        </div>
      </a>
    </div>
  </section>


  <!-- ==================== QUICK STATS GRID ==================== -->
  <section class="space-y-4">
    <h2 class="text-lg font-bold text-slate-800 tracking-tight">Ikhtisar MAZEEDA</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {#each stats as stat}
        <a href={stat.href} class="block transition-transform hover:-translate-y-1 duration-200">
          <Card class="h-full">
            <div class="flex items-start justify-between">
              <div class="space-y-2">
                <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.name}</p>
                <h3 class="text-2xl font-black text-slate-800 tracking-tight leading-none mt-1">
                  {#if isLoadingStats}
                    <span class="inline-block animate-pulse bg-slate-200 rounded w-16 h-7"></span>
                  {:else}
                    {stat.value}
                  {/if}
                </h3>
                <p class="text-xs text-slate-500 font-medium">{stat.description}</p>
              </div>
              <div class="p-3 rounded-xl border {stat.color}">
                <svelte:component this={stat.icon} class="h-6 w-6" />
              </div>
            </div>
          </Card>
        </a>
      {/each}
    </div>
  </section>

  <!-- ==================== HIGHLIGHTS LAYOUT GRID ==================== -->
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
    
    <!-- Left Column: Mading Highlight -->
    <section class="lg:col-span-7 space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold text-slate-800 tracking-tight">Mading Terkini</h2>
        <a href="/mading" class="text-xs font-bold text-primary hover:underline flex items-center space-x-1">
          <span>Semua Mading</span>
          <ArrowRight class="h-3.5 w-3.5" />
        </a>
      </div>
      
      {#if hasAnnouncement}
        <Card class="p-6">
          <div slot="header" class="flex items-center justify-between">
            <span class="px-2.5 py-1 text-xs font-bold bg-blue-50 text-primary border border-blue-100 rounded-full">
              {recentAnnouncement.category}
            </span>
            <div class="flex items-center text-slate-400 text-xs font-semibold space-x-1.5">
              <Calendar class="h-3.5 w-3.5" />
              <span>{recentAnnouncement.date}</span>
            </div>
          </div>
          
          <div class="space-y-3 mt-4">
            <h3 class="text-xl font-bold text-slate-800 hover:text-primary transition-colors">
              <a href="/mading">{recentAnnouncement.title}</a>
            </h3>
            <p class="text-sm text-slate-500 leading-relaxed font-normal">
              {recentAnnouncement.excerpt}
            </p>
          </div>
          
          <div slot="footer" class="w-full flex items-center justify-between pt-2">
            <span class="text-xs font-semibold text-slate-400">Diposting oleh: <strong class="text-slate-600">{recentAnnouncement.author && recentAnnouncement.author.toUpperCase() === 'ADMIN MAZEEDA' ? 'ADMIN MAZEEDA' : recentAnnouncement.author}</strong></span>
            <a href="/mading">
              <Button variant="ghost" size="sm" class="text-primary flex items-center space-x-1.5">
                <span>Selengkapnya</span>
                <ArrowRight class="h-4 w-4" />
              </Button>
            </a>
          </div>
        </Card>
      {:else}
        <Card class="p-6 flex flex-col items-center justify-center text-center py-10 border border-dashed border-slate-200">
          <Megaphone class="h-8 w-8 text-slate-350 mb-2 text-primary/40 animate-bounce" />
          <h3 class="text-xs font-extrabold text-slate-700">Belum Ada Pengumuman</h3>
          <p class="text-[10px] text-slate-400 mt-1 max-w-[250px] leading-relaxed">
            Tidak ada mading terbaru saat ini. Silakan masuk ke Panel Admin untuk membuat pengumuman pertama!
          </p>
          <a href="/admin?tab=mading" class="mt-3">
            <Button size="sm" class="text-[10px] font-bold h-8 px-4">Buat Mading</Button>
          </a>
        </Card>
      {/if}
    </section>

    <!-- Right Column: Timeline Highlight -->
    <section class="lg:col-span-5 space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold text-slate-800 tracking-tight">Memori Terkini</h2>
        <a href="/timeline" class="text-xs font-bold text-primary hover:underline flex items-center space-x-1">
          <span>Semua Galeri</span>
          <ArrowRight class="h-3.5 w-3.5" />
        </a>
      </div>

      {#if hasMemory}
        <Card class="overflow-hidden p-0" noPadding>
          <div class="h-48 relative overflow-hidden flex items-center justify-center p-4">
            {#if recentMemory.image_url}
              <img 
                src={convertDriveUrl(recentMemory.image_url)} 
                alt={recentMemory.title} 
                class="absolute inset-0 w-full h-full object-cover"
              />
            {:else}
              <!-- Render a premium CSS gradient structure since absolute image paths might be restricted -->
              <div class="absolute inset-0 bg-gradient-to-tr from-blue-500 to-indigo-600"></div>
            {/if}
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
            <div class="absolute bottom-4 left-4 right-4 text-white z-10">
              <div class="flex items-center space-x-1 text-xs opacity-90 mb-1 font-semibold">
                <ImageIcon class="h-3.5 w-3.5 text-blue-200" />
                <span>{recentMemory.location}</span>
              </div>
              <h4 class="font-bold text-base line-clamp-1 text-white drop-shadow">{recentMemory.title}</h4>
            </div>
          </div>

          <div class="p-5 space-y-3 bg-white">
            <div class="flex items-center justify-between text-xs text-slate-400 font-semibold">
              <span>Diunggah pada: {recentMemory.date}</span>
              <div class="flex items-center space-x-1 text-rose-500 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100/50">
                <Heart class="h-3.5 w-3.5 fill-current" />
                <span>{recentMemory.likes}</span>
              </div>
            </div>
            <p class="text-xs text-slate-500 font-normal leading-relaxed">
              Bagian dari lembar sejarah dan kenangan manis perjalanan kebersamaan MAZEEDA Squad.
            </p>
          </div>
        </Card>
      {:else}
        <Card class="p-6 flex flex-col items-center justify-center text-center py-10 border border-dashed border-slate-200">
          <ImageIcon class="h-8 w-8 text-slate-350 mb-2 text-primary/40 animate-pulse" />
          <h3 class="text-xs font-extrabold text-slate-700">Belum Ada Foto Memori</h3>
          <p class="text-[10px] text-slate-400 mt-1 max-w-[250px] leading-relaxed">
            Belum ada dokumentasi momen perjalanan kebersamaan MAZEEDA Squad. Unggah foto pertamamu di Direktori Timeline!
          </p>
          <a href="/timeline" class="mt-3">
            <Button variant="outline" size="sm" class="text-[10px] font-bold h-8 px-4 border-slate-200">Buka Timeline</Button>
          </a>
        </Card>
      {/if}
    </section>

  </div>

  <!-- ==================== PREMIUM FOOTER SECTION ==================== -->
  <footer class="mt-12 -mx-4 -mb-12 sm:-mx-8 md:-mx-8 border-t border-slate-200/50 bg-slate-50/50">
    <!-- Top Part: Google Play Store Button -->
    <div class="py-8 px-4 flex flex-col items-center justify-center border-b border-slate-200/40">
      <a 
        href="https://play.google.com/store/apps/details?id=mazeedahmqlirboyo-pixel" 
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
          href="https://wa.me/6289507436989" 
          target="_blank" 
          rel="noopener noreferrer" 
          class="h-9 w-9 flex items-center justify-center transition-all hover:scale-110 active:scale-95 duration-200"
          title="WhatsApp MAZEEDA"
        >
          <img src="/whatsapp.png" alt="WhatsApp" class="h-full w-full object-contain scale-[0.88] filter drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.12)]" />
        </a>

        <!-- Instagram -->
        <a 
          href="https://instagram.com/mazeedahmqlirboyo" 
          target="_blank" 
          rel="noopener noreferrer" 
          class="h-9 w-9 flex items-center justify-center transition-all hover:scale-110 active:scale-95 duration-200"
          title="Instagram MAZEEDA"
        >
          <img src="/instagram.png" alt="Instagram" class="h-full w-full object-contain scale-[0.98] filter drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.12)]" />
        </a>

        <!-- Twitter -->
        <a 
          href="https://x.com/mazeedahmqlirboyo" 
          target="_blank" 
          rel="noopener noreferrer" 
          class="h-9 w-9 flex items-center justify-center transition-all hover:scale-110 active:scale-95 duration-200"
          title="Twitter MAZEEDA"
        >
          <img src="/twitter.png" alt="Twitter" class="h-full w-full object-contain scale-[0.87] filter drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.12)]" />
        </a>

        <!-- TikTok -->
        <a 
          href="https://tiktok.com/@mazeedahmqlirboyo" 
          target="_blank" 
          rel="noopener noreferrer" 
          class="h-9 w-9 flex items-center justify-center transition-all hover:scale-110 active:scale-95 duration-200"
          title="TikTok MAZEEDA"
        >
          <img src="/tiktok.png" alt="TikTok" class="h-full w-full object-contain scale-[0.87] filter drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.12)]" />
        </a>

        <!-- YouTube -->
        <a 
          href="https://youtube.com/mazeedahmqlirboyo" 
          target="_blank" 
          rel="noopener noreferrer" 
          class="h-9 w-9 flex items-center justify-center transition-all hover:scale-110 active:scale-95 duration-200"
          title="YouTube MAZEEDA"
        >
          <img src="/youtube.png" alt="YouTube" class="h-full w-full object-contain scale-[0.90] filter drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.12)]" />
        </a>

        <!-- Web / RSS -->
        <a 
          href="https://mazeedahmqlirboyo.com" 
          target="_blank" 
          rel="noopener noreferrer" 
          class="h-9 w-9 flex items-center justify-center transition-all hover:scale-110 active:scale-95 duration-200"
          title="Website MAZEEDA"
        >
          <img src="/rss.png" alt="Website / RSS" class="h-full w-full object-contain scale-[0.88] filter drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.12)]" />
        </a>
      </div>
    </div>
  </footer>
</div>
