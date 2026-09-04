<script lang="ts">
  import { t, locale } from "svelte-i18n";

  $: localizeDateString = (dateStr) => {
    if (!dateStr) return "";
    let str = formatNumberDisplay(dateStr); // apply number format first

    // Replace Masehi months
    const masehiMap = {
      "januari": $t('calendar.months.jan') || "Januari",
      "februari": $t('calendar.months.feb') || "Februari",
      "maret": $t('calendar.months.mar') || "Maret",
      "april": $t('calendar.months.apr') || "April",
      "mei": $t('calendar.months.may') || "Mei",
      "juni": $t('calendar.months.jun') || "Juni",
      "juli": $t('calendar.months.jul') || "Juli",
      "agustus": $t('calendar.months.aug') || "Agustus",
      "september": $t('calendar.months.sep') || "September",
      "oktober": $t('calendar.months.oct') || "Oktober",
      "november": $t('calendar.months.nov') || "November",
      "desember": $t('calendar.months.dec') || "Desember"
    };

    // Replace Hijri months
    const hijriMap = {
      "muharram": $t('calendar.hijri_months.m1') || "Muharram",
      "safar": $t('calendar.hijri_months.m2') || "Safar",
      "rabi'ul awal": $t('calendar.hijri_months.m3') || "Rabi'ul Awal",
      "rabi'ul akhir": $t('calendar.hijri_months.m4') || "Rabi'ul Akhir",
      "jumadil awal": $t('calendar.hijri_months.m5') || "Jumadil Awal",
      "jumadil akhir": $t('calendar.hijri_months.m6') || "Jumadil Akhir",
      "rajab": $t('calendar.hijri_months.m7') || "Rajab",
      "sya'ban": $t('calendar.hijri_months.m8') || "Sya'ban",
      "ramadhan": $t('calendar.hijri_months.m9') || "Ramadhan",
      "syawal": $t('calendar.hijri_months.m10') || "Syawal",
      "dzulqa'dah": $t('calendar.hijri_months.m11') || "Dzulqa'dah",
      "dzulhijjah": $t('calendar.hijri_months.m12') || "Dzulhijjah",
      
      // Additional edge cases for text in Hari Penting
      "rabiul awal": $t('calendar.hijri_months.m3') || "Rabi'ul Awal",
      "rabiul akhir": $t('calendar.hijri_months.m4') || "Rabi'ul Akhir",
      "zulhijah": $t('calendar.hijri_months.m12') || "Dzulhijjah",
      "muharam": $t('calendar.hijri_months.m1') || "Muharram"
    };

    const combinedMap = { ...masehiMap, ...hijriMap };
    
    // Replace whole words (case insensitive matching)
    for (const [key, value] of Object.entries(combinedMap)) {
      const regex = new RegExp("\\b" + key + "\\b", "gi");
      str = str.replace(regex, value);
    }
    
    return str;
  };

  $: localizeHijriMonth = (hijriStr) => {
    if (!hijriStr) return "";
    const map = {
      "muharram": $t('calendar.hijri_months.m1') || "Muharram",
      "safar": $t('calendar.hijri_months.m2') || "Safar",
      "rabi'ul awal": $t('calendar.hijri_months.m3') || "Rabi'ul Awal",
      "rabi'ul akhir": $t('calendar.hijri_months.m4') || "Rabi'ul Akhir",
      "jumadil awal": $t('calendar.hijri_months.m5') || "Jumadil Awal",
      "jumadil akhir": $t('calendar.hijri_months.m6') || "Jumadil Akhir",
      "rajab": $t('calendar.hijri_months.m7') || "Rajab",
      "sya'ban": $t('calendar.hijri_months.m8') || "Sya'ban",
      "ramadhan": $t('calendar.hijri_months.m9') || "Ramadhan",
      "syawal": $t('calendar.hijri_months.m10') || "Syawal",
      "dzulqa'dah": $t('calendar.hijri_months.m11') || "Dzulqa'dah",
      "dzulhijjah": $t('calendar.hijri_months.m12') || "Dzulhijjah"
    };
    
    // Hijri string could be "Safar" or "Safar - Rabi'ul Awal"
    const parts = hijriStr.split(" - ");
    const localized = parts.map(p => map[p.toLowerCase()] || p);
    return localized.join(" - ");
  };

  $: formatNumberDisplay = (num) => {
    let str = (num ?? "").toString();
    if ($locale === 'ar') {
      const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
      return str.replace(/[0-9]/g, function (w) {
        return arabicNumbers[+w];
      });
    }
    return str;
  };
  import { onMount } from "svelte";
  import { fade, scale } from "svelte/transition";
  import {
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    X,
    Calendar as CalendarIcon,
    Info,
    MoonStar,
    Map,
    Book,
    Heart,
    BookOpen,
  } from "lucide-svelte";
  import Card from "$lib/components/ui/card.svelte";
  import { authStore } from "$lib/auth";
  import { watakWetonMap, watakZodiakMap, getShio } from "$lib/dataKepribadian";
  import AstrologyIcon from "$lib/components/ui/AstrologyIcon.svelte";
  import PageHeader from "$lib/components/ui/PageHeader.svelte";

  // --- State & Logika Cek Kelahiran ---
  let showBirthResult = false;
  let birthDateInput = "";
  let birthResult: any = null;

  function parseIndonesianDate(dateStr: string | undefined): string | null {
    if (!dateStr) return null;
    if (dateStr.includes("-")) return dateStr;
    const parts = dateStr.trim().split(" ");
    if (parts.length >= 3) {
      const day = parts[0].padStart(2, "0");
      const monthStr = parts[1].toLowerCase();
      const year = parts[parts.length - 1];
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
      return `${formatNumberDisplay(year)}-${month}-${day}`;
    }
    return null;
  }

  function calculateAge(birthDate: Date, today: Date) {
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }
    return { years, months, days };
  }

  function getZodiac(day: number, month: number): string {
    if ((month == 0 && day >= 20) || (month == 1 && day <= 18))
      return "Aquarius ♒";
    if ((month == 1 && day >= 19) || (month == 2 && day <= 20))
      return "Pisces ♓";
    if ((month == 2 && day >= 21) || (month == 3 && day <= 19))
      return "Aries ♈";
    if ((month == 3 && day >= 20) || (month == 4 && day <= 20))
      return "Taurus ♉";
    if ((month == 4 && day >= 21) || (month == 5 && day <= 20))
      return "Gemini ♊";
    if ((month == 5 && day >= 21) || (month == 6 && day <= 22))
      return "Cancer ♋";
    if ((month == 6 && day >= 23) || (month == 7 && day <= 22)) return "Leo ♌";
    if ((month == 7 && day >= 23) || (month == 8 && day <= 22))
      return "Virgo ♍";
    if ((month == 8 && day >= 23) || (month == 9 && day <= 22))
      return "Libra ♎";
    if ((month == 9 && day >= 23) || (month == 10 && day <= 21))
      return "Scorpio ♏";
    if ((month == 10 && day >= 22) || (month == 11 && day <= 21))
      return "Sagittarius ♐";
    return "Capricorn ♑";
  }

  function getWatakByNeptu(neptu: number): string {
    const watakMap: Record<number, string> = {
      7: "Pendiam, suka menyendiri (Pendito Kang Lelaku).",
      8: "Tegas, keras hati, dan bersemangat (Lakuning Geni).",
      9: "Mudah terpengaruh, lincah, namun mudah goyah (Lakuning Angin).",
      10: "Tenang, suka memberikan nasihat (Pendito Mbangun Teki).",
      11: "Pemberani, dermawan, namun terkadang keras (Lakuning Setan).",
      12: "Cinta damai, suka mengalah, disukai banyak orang (Lakuning Kembang).",
      13: "Berkarisma, lemah lembut, sabar (Lakuning Lintang).",
      14: "Cerdas, mudah bergaul, berwawasan luas (Lakuning Rembulan).",
      15: "Berwibawa, tegas, penuh dendam jika disakiti (Lakuning Matahari).",
      16: "Pengayom, pemaaf, baik hati (Lakuning Bumi).",
      17: "Pekerja keras, pendiam, namun terkadang kaku (Lakuning Gunung).",
      18: "Berkuasa, paripurna, tangguh (Lakuning Paripurna).",
    };
    return watakMap[neptu] || "Karakteristik unik dan seimbang.";
  }

  function processBirthDate(dateString: string | null) {
    if (!dateString) return;
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return;

    const hInfo = getHijriInfo(d);
    const jInfo = getJawaInfo(d, hInfo);
    const age = calculateAge(d, new Date());
    const zodiac = getZodiac(d.getDate(), d.getMonth());
    const shioObj = getShio(d.getFullYear());

    $: daysName = [
      $t('calendar.days.sun') || "Ahad",
      $t('calendar.days.mon') || "Senin",
      $t('calendar.days.tue') || "Selasa",
      $t('calendar.days.wed') || "Rabu",
      $t('calendar.days.thu') || "Kamis",
      $t('calendar.days.fri') || "Jumat",
      $t('calendar.days.sat') || "Sabtu",
    ];
    $: monthsName = [
      $t('calendar.months.jan') || "Januari",
      $t('calendar.months.feb') || "Februari",
      $t('calendar.months.mar') || "Maret",
      $t('calendar.months.apr') || "April",
      $t('calendar.months.may') || "Mei",
      $t('calendar.months.jun') || "Juni",
      $t('calendar.months.jul') || "Juli",
      $t('calendar.months.aug') || "Agustus",
      $t('calendar.months.sep') || "September",
      $t('calendar.months.oct') || "Oktober",
      $t('calendar.months.nov') || "November",
      $t('calendar.months.dec') || "Desember",
    ];

    const wetonName = jInfo
      ? `${daysName[d.getDay()]} ${jInfo.weton.pasaran}`
      : "";
    const zodiacName = zodiac.split(" ")[0];

    birthResult = {
      masehi: `${daysName[d.getDay()]}, ${d.getDate()} ${monthsName[d.getMonth()]} ${d.getFullYear()}`,
      hijri: `${hInfo.day} ${localizeHijriMonth(hInfo.month)} ${hInfo.year} H`,
      weton: wetonName || "-",
      neptu: jInfo ? jInfo.weton.neptu : "-",
      watak: wetonName
        ? watakWetonMap[wetonName] || getWatakByNeptu(jInfo.weton.neptu)
        : "-",
      watakZodiak: watakZodiakMap[zodiacName] || "Karakteristik unik.",
      zodiak: zodiac,
      shio: shioObj,
      wuku: jInfo ? jInfo.wuku.nama : "-",
      warsa: jInfo ? jInfo.kalender.namaTahun : "-",
      ageStr: `${age.years} Tahun, ${age.months} Bulan, ${age.days} Hari`,
    };
    showBirthResult = true;
  }

  function checkMyBirthDate() {
    const tLahir = $authStore.user?.tahun_lahir;
    const parsed = parseIndonesianDate(tLahir);
    if (parsed) {
      processBirthDate(parsed);
    } else {
      alert("Maaf, data tanggal lahir Anda belum lengkap di profil.");
    }
  }

  function checkCustomBirthDate() {
    if (birthDateInput) {
      processBirthDate(birthDateInput);
    }
  }

  // Auto-check for logged in user on load
  let initialCheckDone = false;
  $: if ($authStore.user?.tahun_lahir && !initialCheckDone) {
    checkMyBirthDate();
    initialCheckDone = true;
  }
  // --- Akhir Logika Cek Kelahiran ---

  let currentDate = new Date();
  const today = new Date();

  interface DayInfo {
    dateObj: Date;
    masehiDay: number;
    hijriDay: string;
    hijriMonth: string;
    hijriYear: string;
    isCurrentMonth: boolean;
    isToday: boolean;
    jawa: any; // Primbon data
  }

  let calendarDays: DayInfo[] = [];
  let dominantHijriMonth = "";
  let dominantHijriYear = "";
  let masehiMonthName = "";
  let masehiYear = "";
  let allPeringatan: any[] = [];
  let currentMonthPeringatan: any[] = [];

  $: masehiMonths = [
    $t('calendar.months.jan') || "Januari",
    $t('calendar.months.feb') || "Februari",
    $t('calendar.months.mar') || "Maret",
    $t('calendar.months.apr') || "April",
    $t('calendar.months.may') || "Mei",
    $t('calendar.months.jun') || "Juni",
    $t('calendar.months.jul') || "Juli",
    $t('calendar.months.aug') || "Agustus",
    $t('calendar.months.sep') || "September",
    $t('calendar.months.oct') || "Oktober",
    $t('calendar.months.nov') || "November",
    $t('calendar.months.dec') || "Desember",
  ];

  $: weekDays = [
    $t('calendar.days.sun') || "Ahad",
    $t('calendar.days.mon') || "Senin",
    $t('calendar.days.tue') || "Selasa",
    $t('calendar.days.wed') || "Rabu",
    $t('calendar.days.thu') || "Kamis",
    $t('calendar.days.fri') || "Jum'at",
    $t('calendar.days.sat') || "Sabtu",
  ];

  // Modal State
  let selectedDay: DayInfo | null = null;
  let showModal = false;

  function openDetails(day: DayInfo) {
    selectedDay = day;
    showModal = true;
    document.body.style.overflow = "hidden";
  }

  function closeDetails() {
    showModal = false;
    setTimeout(() => {
      selectedDay = null;
    }, 300);
    document.body.style.overflow = "";
  }

  function getHijriInfo(date: Date) {
    // Kuwaiti Algorithm for Hijri date calculation
    // This is much more reliable across different Android WebViews 
    // compared to Intl.DateTimeFormat with u-ca-islamic which sometimes returns Masehi months.
    const wd = date.getDay();
    const dd = date.getDate();
    const mm = date.getMonth() + 1; // FIX: Kuwaiti algorithm expects 1-12
    const yy = date.getFullYear();
    const mpart = (mm - 11) / 12;
    let jd = Math.floor((1461 * (yy + 4800 + Math.floor(mpart))) / 4) +
             Math.floor((367 * (mm - 2 - 12 * Math.floor(mpart))) / 12) -
             Math.floor((3 * Math.floor((yy + 4900 + Math.floor(mpart)) / 100)) / 4) +
             dd - 32075;
    let l = jd - 1948440 + 10632;
    const n = Math.floor((l - 1) / 10631);
    l = l - 10631 * n + 354;
    const j = (Math.floor((10985 - l) / 5316)) * (Math.floor((50 * l) / 17719)) + (Math.floor(l / 5670)) * (Math.floor((43 * l) / 15238));
    l = l - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) - (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
    const hm = Math.floor((24 * l) / 709);
    const hd = l - Math.floor((709 * hm) / 24);
    const hy = 30 * n + j - 30;

    const INDO_HIJRI_MONTHS = ["Muharram", "Safar", "Rabi'ul Awal", "Rabi'ul Akhir", "Jumadil Awal", "Jumadil Akhir", "Rajab", "Sya'ban", "Ramadhan", "Syawal", "Dzulqa'dah", "Dzulhijjah"];
    return { day: hd.toString(), month: INDO_HIJRI_MONTHS[hm-1], year: hy.toString() };
  }

  function getJawaInfo(date: Date, hijriInfo: any) {
    try {
      const msPerDay = 86400000;
      // Gunakan timezone UTC untuk menghitung selisih hari absolut sejak epoch (1 Jan 1970)
      const dateUtc = new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
      );
      const epochUtc = new Date(Date.UTC(1970, 0, 1));
      const days = Math.floor(
        (dateUtc.getTime() - epochUtc.getTime()) / msPerDay,
      );

      // 1. Pasaran & Neptu
      const pasaranNames = ["Legi", "Pahing", "Pon", "Wage", "Kliwon"];
      const neptuPasaran = [5, 9, 7, 4, 8];
      const pasaranIndex = ((((days % 5) + 5) % 5) + 3) % 5;
      const pasaranName = pasaranNames[pasaranIndex];
      const nPasaran = neptuPasaran[pasaranIndex];

      // Hari Neptu
      const hariIndex = date.getDay(); // 0 = Ahad
      const neptuHari = [5, 4, 3, 7, 8, 6, 9];
      const nHari = neptuHari[hariIndex];
      const neptuTotal = nHari + nPasaran;

      // 2. Wuku
      const wukus = [
        "Sinta",
        "Landep",
        "Wukir",
        "Kurantil",
        "Tolu",
        "Gumbreg",
        "Warigalit",
        "Warigagung",
        "Julungwangi",
        "Sungsang",
        "Galungan",
        "Kuningan",
        "Langkir",
        "Mandasiya",
        "Julungpujut",
        "Pahang",
        "Kuruwelut",
        "Marakeh",
        "Tambir",
        "Medangkungan",
        "Maktal",
        "Wuye",
        "Manahil",
        "Prangbakat",
        "Bala",
        "Wugu",
        "Wayang",
        "Kulawu",
        "Dukut",
        "Watugunung",
      ];
      // Days shifted by 4 because 1 Jan 1970 was Thursday. Sunday is start of Wuku week.
      const wukuIndex =
        ((((Math.floor((days + 4) / 7) % 30) + 30) % 30) + 4) % 30;
      const wukuName = wukus[wukuIndex];

      // 3. Tanggal Jawa
      const hijriToJawa: Record<string, string> = {
        Muharram: "Sura",
        Safar: "Sapar",
        "Rabiul Awal": "Mulud",
        "Rabiul Akhir": "Bakda Mulud",
        "Jumadil Awal": "Jumadilawal",
        "Jumadil Akhir": "Jumadilakhir",
        Rajab: "Rejeb",
        "Sya'ban": "Ruwah",
        Ramadhan: "Pasa",
        Syawal: "Sawal",
        "Dzulqa'dah": "Dulkangidah",
        Dzulhijjah: "Besar",
      };

      const jawaMonth = hijriToJawa[hijriInfo.month] || hijriInfo.month;
      const jawaYear = parseInt(hijriInfo.year) + 512;

      // 4. Warsa
      const warsas = [
        "Be",
        "Wawu",
        "Jimakir",
        "Alip",
        "Ehe",
        "Jimawal",
        "Je",
        "Dal",
      ];
      const warsaName = warsas[jawaYear % 8];

      return {
        weton: { pasaran: pasaranName, neptu: neptuTotal },
        wuku: { nama: wukuName },
        kalender: {
          tanggal: hijriInfo.day,
          bulan: jawaMonth,
          tahun: jawaYear,
          namaTahun: warsaName,
        },
      };
    } catch (e) {
      return null;
    }
  }

  $: if ($locale) generateCalendar();

  function generateCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    masehiMonthName = masehiMonths[month];
    masehiYear = year.toString();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const firstHijri = getHijriInfo(firstDayOfMonth);
    const lastHijri = getHijriInfo(lastDayOfMonth);

    if (firstHijri.month === lastHijri.month) {
      dominantHijriMonth = firstHijri.month;
      dominantHijriYear = firstHijri.year;
    } else {
      dominantHijriMonth = `${firstHijri.month} - ${lastHijri.month}`;
      if (firstHijri.year === lastHijri.year) {
        dominantHijriYear = firstHijri.year;
      } else {
        dominantHijriYear = `${firstHijri.year}/${lastHijri.year}`;
      }
    }

    const startDayOfWeek = firstDayOfMonth.getDay();
    const totalDays = lastDayOfMonth.getDate();

    let days: DayInfo[] = [];

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      const hInfo = getHijriInfo(d);
      days.push({
        dateObj: d,
        masehiDay: d.getDate(),
        hijriDay: hInfo.day,
        hijriMonth: hInfo.month,
        hijriYear: hInfo.year,
        isCurrentMonth: false,
        isToday: isSameDay(d, today),
        jawa: getJawaInfo(d, hInfo),
      });
    }

    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(year, month, i);
      const hInfo = getHijriInfo(d);
      days.push({
        dateObj: d,
        masehiDay: i,
        hijriDay: hInfo.day,
        hijriMonth: hInfo.month,
        hijriYear: hInfo.year,
        isCurrentMonth: true,
        isToday: isSameDay(d, today),
        jawa: getJawaInfo(d, hInfo),
      });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const d = new Date(year, month + 1, i);
      const hInfo = getHijriInfo(d);
      days.push({
        dateObj: d,
        masehiDay: i,
        hijriDay: hInfo.day,
        hijriMonth: hInfo.month,
        hijriYear: hInfo.year,
        isCurrentMonth: false,
        isToday: isSameDay(d, today),
        jawa: getJawaInfo(d, hInfo),
      });
    }

    calendarDays = days;
    filterPeringatan();
  }

  function filterPeringatan() {
    if (allPeringatan.length === 0) return;
    currentMonthPeringatan = allPeringatan.filter((p) => {
      const t = p.tanggal.toLowerCase();
      const idMasehiMonths = ["januari", "februari", "maret", "april", "mei", "juni", "juli", "agustus", "september", "oktober", "november", "desember"];
      const m1 = idMasehiMonths[currentDate.getMonth()];
      if (t.includes(m1)) return true;

      const hMonths = dominantHijriMonth.toLowerCase().split(' - ');
            for (let hm of hMonths) {
        const hmClean = hm.replace(/'/g, "");
        const tClean = t.replace(/'/g, "");
        if (hmClean.length > 3 && tClean.includes(hmClean)) return true;
        if (hm === "dzulhijjah" && t.includes("zulhijah")) return true;
        if (hm === "muharram" && t.includes("muharam")) return true;
      }
      return false;
    });
  }

  function isSameDay(d1: Date, d2: Date) {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }

  function prevMonth() {
    currentDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1,
    );
    generateCalendar();
  }

  function nextMonth() {
    currentDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      1,
    );
    generateCalendar();
  }

  function resetToToday() {
    currentDate = new Date();
    generateCalendar();
  }

  const availableYears = Array.from({ length: 101 }, (_, i) => 1970 + i);

  let showMonthDropdown = false;
  let showYearDropdown = false;

  function selectMonth(index: number) {
    currentDate = new Date(currentDate.getFullYear(), index, 1);
    generateCalendar();
    showMonthDropdown = false;
  }

  function selectYear(yr: number) {
    currentDate = new Date(yr, currentDate.getMonth(), 1);
    generateCalendar();
    showYearDropdown = false;
  }

  onMount(async () => {
    generateCalendar();
    try {
      const res = await fetch("https://api-peringatan.vercel.app/api");
      const data = await res.json();
      allPeringatan = data.map((item: any, i: number) => ({
        ...item,
        isHoliday: i <= 14,
      }));
      filterPeringatan();
    } catch (e) {
      console.error("Gagal mengambil data hari penting:", e);
    }
  });
</script>

<svelte:head>
  <title>Kalender Interaktif | MAZEEDA</title>
</svelte:head>

<PageHeader title={$t('calendar.title') || 'Kalender'} backText={$t('common.dashboard') || 'Dashboard'} />

<div class="space-y-6 animate-in fade-in duration-500 pb-10 pt-4 px-4">
  <!-- Header / Nav -->
  <div
    class="bg-gradient-to-r from-green-50/50 via-teal-50/20 to-white dark:from-slate-900 dark:via-slate-800/80 dark:to-slate-900 border border-green-100/50 dark:border-slate-700/80 shadow-sm relative rounded-2xl"
  >
    <div
      class="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none"
    >
      <div
        class="absolute top-0 right-0 w-64 h-64 bg-green-400/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"
      ></div>
    </div>
    <div
      class="flex flex-col md:flex-row items-center justify-between gap-5 py-4 px-4 sm:px-6 z-10"
    >
      <!-- Date Info -->
      <div class="flex items-center gap-4 sm:gap-5 w-full md:w-auto">
        <div
          class="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-white dark:bg-slate-900 shadow-soft-sm dark:shadow-none flex items-center justify-center border border-green-100/60 shrink-0 relative overflow-hidden group"
        >
          <div
            class="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          ></div>
          <img
            src="/images/kalender_bg.png"
            alt="Kalender"
            class="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-300"
          />
        </div>
        <div class="flex flex-col justify-center">
          <h1
            class="text-2xl sm:text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-tight"
          >
            {masehiMonthName}
            <span
              class="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-500"
              >{formatNumberDisplay(masehiYear)}</span
            >
          </h1>
          <p
            class="text-[11px] sm:text-sm font-bold text-slate-500 dark:text-slate-400 mt-1 sm:mt-1.5 flex items-center gap-1.5"
          >
            <MoonStar class="w-3.5 h-3.5 text-green-500" />
            {localizeHijriMonth(dominantHijriMonth)}
            {formatNumberDisplay(dominantHijriYear)} H
          </p>
        </div>
      </div>

      <!-- Navigation Controls & Actions -->
      <div class="flex flex-col sm:items-end gap-3 w-full md:w-auto">
        <div
          class="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto"
        >
          <!-- Custom Pickers -->
          <div
            class="flex items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-soft-sm dark:shadow-none border border-slate-200/80 p-1.5 shrink-0 w-full sm:w-auto relative z-50"
          >
            {#if showMonthDropdown || showYearDropdown}
              <!-- svelte-ignore a11y-click-events-have-key-events -->
              <!-- svelte-ignore a11y-no-static-element-interactions -->
              <div
                class="fixed inset-0 z-30"
                on:click={() => {
                  showMonthDropdown = false;
                  showYearDropdown = false;
                }}
              ></div>
            {/if}

            <!-- Month Picker -->
            <div class="relative flex-1 sm:flex-none group z-40 min-w-[120px]">
              <button
                on:click={() => {
                  showMonthDropdown = !showMonthDropdown;
                  showYearDropdown = false;
                }}
                class="flex items-center justify-between w-full bg-transparent border-none text-sm font-bold text-slate-700 dark:text-slate-200 py-2 pl-3 sm:pl-4 pr-3 sm:pr-4 rounded-xl hover:bg-green-50 dark:bg-slate-800 transition-colors focus:outline-none {showMonthDropdown
                  ? 'bg-green-50 dark:bg-slate-800'
                  : ''}"
              >
                <span class="mr-2">{masehiMonths[currentDate.getMonth()]}</span>
                <ChevronDown
                  class="w-4 h-4 text-slate-400 transition-transform {showMonthDropdown
                    ? 'rotate-180 text-green-600'
                    : 'group-hover:text-green-600'}"
                />
              </button>

              {#if showMonthDropdown}
                <div
                  class="absolute top-full left-0 right-0 mt-2 w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden py-2"
                  transition:fade={{ duration: 150 }}
                >
                  <div class="max-h-60 overflow-y-auto custom-scrollbar">
                    {#each masehiMonths as month, i}
                      <button
                        class="w-full text-left px-4 py-2 text-sm font-bold {currentDate.getMonth() ===
                        i
                          ? 'bg-green-50 dark:bg-slate-800 text-green-700 dark:text-green-400'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-900/50 hover:text-slate-900'} transition-colors whitespace-nowrap"
                        on:click={() => selectMonth(i)}
                      >
                        {month}
                      </button>
                    {/each}
                  </div>
                </div>
              {/if}
            </div>

            <div class="w-[1px] h-6 bg-slate-200/60 mx-1 z-40"></div>

            <!-- Year Picker -->
            <div class="relative flex-1 sm:flex-none group z-40 min-w-[100px]">
              <button
                on:click={() => {
                  showYearDropdown = !showYearDropdown;
                  showMonthDropdown = false;
                }}
                class="flex items-center justify-between w-full bg-transparent border-none text-sm font-bold text-slate-700 dark:text-slate-200 py-2 pl-3 sm:pl-4 pr-3 sm:pr-4 rounded-xl hover:bg-green-50 dark:bg-slate-800 transition-colors focus:outline-none {showYearDropdown
                  ? 'bg-green-50 dark:bg-slate-800'
                  : ''}"
              >
                <span class="mr-2">{formatNumberDisplay(currentDate.getFullYear())}</span>
                <ChevronDown
                  class="w-4 h-4 text-slate-400 transition-transform {showYearDropdown
                    ? 'rotate-180 text-green-600'
                    : 'group-hover:text-green-600'}"
                />
              </button>

              {#if showYearDropdown}
                <div
                  class="absolute top-full left-0 right-0 mt-2 w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden py-2"
                  transition:fade={{ duration: 150 }}
                >
                  <div class="max-h-60 overflow-y-auto custom-scrollbar">
                    {#each availableYears as yr}
                      <button
                        class="w-full text-left px-4 py-2 text-sm font-bold {currentDate.getFullYear() ===
                        yr
                          ? 'bg-green-50 dark:bg-slate-800 text-green-700 dark:text-green-400'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-900/50 hover:text-slate-900'} transition-colors whitespace-nowrap"
                        on:click={() => selectYear(yr)}
                      >
                        {yr}
                      </button>
                    {/each}
                  </div>
                </div>
              {/if}
            </div>
          </div>

          <!-- Arrows & Today -->
          <div
            class="flex items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-soft-sm dark:shadow-none border border-slate-200/80 p-1.5 shrink-0 w-full sm:w-auto justify-between sm:justify-start"
          >
            <button
              on:click={prevMonth}
              class="flex items-center justify-center h-10 w-12 sm:h-11 sm:w-12 hover:bg-green-50 dark:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 hover:text-green-600 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-100"
            >
              <ChevronLeft class="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

            <div class="w-[1px] h-6 bg-slate-200/60 mx-1"></div>

            <button
              on:click={resetToToday}
              class="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base font-bold text-slate-600 dark:text-slate-300 hover:bg-green-50 dark:bg-slate-800 hover:text-green-700 dark:text-green-400 rounded-xl transition-all active:scale-95 mx-1 focus:outline-none focus:ring-2 focus:ring-green-100"
            >{$t('calendar.hari_ini') || 'Hari Ini'}</button>

            <div class="w-[1px] h-6 bg-slate-200/60 mx-1"></div>

            <button
              on:click={nextMonth}
              class="flex items-center justify-center h-10 w-12 sm:h-11 sm:w-12 hover:bg-green-50 dark:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 hover:text-green-600 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-100"
            >
              <ChevronRight class="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
        </div>

        <!-- Shortcut Button -->
        <button
          on:click={() =>
            document
              .getElementById("astrologi-section")
              ?.scrollIntoView({ behavior: "smooth" })}
          class="w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 px-4 py-2 sm:py-2.5 text-sm sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-slate-700 hover:text-indigo-700 dark:hover:text-indigo-300 rounded-xl transition-all active:scale-95 focus:outline-none shadow-sm border border-indigo-100/50 dark:border-slate-700/80"
        >
          <MoonStar class="w-4 h-4" />{$t('calendar.cek_astrologi') || 'Cek Astrologi Kamu'}</button>
      </div>
    </div>
  </div>

  <!-- Calendar Grid -->
  <div
    class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 shadow-soft-md dark:shadow-none overflow-hidden"
  >
    <!-- Days Header -->
    <div class="grid grid-cols-7 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
      {#each weekDays as day, i}
        <div class="text-center py-4 border-r border-slate-100 dark:border-slate-800 last:border-r-0">
          <span
            class="text-[11px] sm:text-sm font-black uppercase tracking-widest {i ===
            0
              ? 'text-rose-500'
              : 'text-slate-500 dark:text-slate-400'}"
          >
            {day}
          </span>
        </div>
      {/each}
    </div>

    <!-- Days Grid -->
    <div class="grid grid-cols-7 bg-slate-100 dark:bg-slate-800 gap-[1px]">
      {#each calendarDays as day}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div
          class="relative flex flex-col justify-center items-center h-24 sm:h-32 bg-white dark:bg-slate-900 transition-all duration-200 group hover:z-10 hover:shadow-soft-md dark:shadow-none hover:scale-[1.02] p-1
            {day.isCurrentMonth ? '' : 'bg-slate-50 dark:bg-slate-900/50 opacity-60'}
            {day.isToday
            ? 'ring-2 ring-inset ring-green-500 bg-green-50 dark:bg-slate-800/20'
            : 'hover:ring-1 hover:ring-inset hover:ring-green-300'}
          "
        >
          <!-- Masehi Date & Pasaran -->
          <div class="flex flex-col items-center text-center w-full">
            <span
              class="text-xl sm:text-2xl font-black leading-none {day.isToday
                ? 'text-green-600'
                : day.dateObj.getDay() === 0
                  ? 'text-rose-500'
                  : 'text-slate-800 dark:text-slate-100'}"
            >
              {formatNumberDisplay(day.masehiDay)}
            </span>
            {#if day.jawa}
              <span
                class="text-[8px] sm:text-[9px] font-medium leading-[1.1] text-slate-400 mt-1"
              >
                {day.jawa.weton.pasaran}
              </span>
            {/if}
          </div>

          <!-- Hijri Date & Month -->
          <div
            class="flex flex-col items-center text-center w-full mt-2 sm:mt-3"
          >
            <span
              class="text-[11px] sm:text-xs font-bold leading-none {day.isToday
                ? 'text-green-700 dark:text-green-400'
                : 'text-slate-600 dark:text-slate-300'}"
            >
              {formatNumberDisplay(day.hijriDay)}
            </span>
            <span
              class="text-[8px] sm:text-[9px] font-medium text-slate-400 leading-[1.1] whitespace-normal mt-0.5"
            >
              {localizeHijriMonth(day.hijriMonth)}
            </span>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Hari Penting Section -->
  {#if currentMonthPeringatan.length > 0}
    <div
      class="mt-10 bg-gradient-to-br from-white via-green-50/20 to-white dark:from-slate-900 dark:via-slate-800/80 dark:to-slate-900 rounded-3xl border border-green-100/50 dark:border-slate-700/80 shadow-soft-lg dark:shadow-none overflow-hidden relative"
    >
      <!-- Decorative background blur -->
      <div
        class="absolute top-0 right-0 w-64 h-64 bg-green-400/10 rounded-full blur-3xl -z-10 transform translate-x-1/2 -translate-y-1/2 pointer-events-none"
      ></div>

      <div class="p-6 sm:p-8">
        <div class="text-center mb-8">
          <div
            class="inline-flex items-center justify-center p-3 bg-gradient-to-br from-green-100 to-green-50 dark:from-slate-800 dark:to-slate-800 rounded-2xl mb-4 shadow-sm border border-green-100/50 dark:border-slate-700/80"
          >
            <Info class="h-7 w-7 text-green-600" />
          </div>
          <h2
            class="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight mb-3"
          >
            {$t('calendar.hari_penting') || 'Hari Penting'} <span
              class="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-500"
              >Se-Indonesia</span
            >
          </h2>

          <!-- Legend -->
          <div
            class="flex items-center justify-center gap-3 text-[11px] font-bold tracking-wider uppercase"
          >
            <div
              class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-100/50 shadow-soft-sm dark:shadow-none"
            >
              <span
                class="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse-slow"
              ></span>
              <span class="text-rose-700">{$t('calendar.libur_nasional') || 'Libur Nasional'}</span>
            </div>
            <div
              class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 dark:bg-slate-800 border border-green-100/50 dark:border-slate-700/80 shadow-soft-sm dark:shadow-none"
            >
              <span class="w-2.5 h-2.5 rounded-full bg-green-50 dark:bg-slate-8000"></span>
              <span class="text-green-700 dark:text-green-400">{$t('calendar.tidak_libur') || 'Tidak Libur'}</span>
            </div>
          </div>
        </div>

        <div
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 relative z-10"
        >
          {#each currentMonthPeringatan as p}
            <div
              class="relative overflow-hidden p-5 rounded-2xl bg-white dark:bg-slate-900 border {p.isHoliday
                ? 'border-rose-100 hover:border-rose-300 hover:shadow-rose-100/50'
                : 'border-green-100 hover:border-green-300 hover:shadow-green-100/50'} shadow-soft-sm dark:shadow-none hover:shadow-md dark:shadow-none hover:-translate-y-1 transition-all duration-300 group"
            >
              <!-- Left accent line -->
              <div
                class="absolute left-0 top-0 bottom-0 w-1 {p.isHoliday
                  ? 'bg-gradient-to-b from-rose-400 to-rose-600'
                  : 'bg-gradient-to-b from-green-400 to-green-600'}"
              ></div>

              <div class="flex flex-col h-full justify-center pl-2">
                <span
                  class="text-sm font-black tracking-tight {p.isHoliday
                    ? 'text-rose-600'
                    : 'text-green-600'} flex items-center gap-2"
                >
                  <CalendarIcon class="w-4 h-4" />
                  {localizeDateString(p.tanggal)}
                </span>
                <p
                  class="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-2.5 leading-relaxed"
                >
                  {p.peringatan}
                </p>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {/if}

  <!-- Cek Kelahiran & Weton Section -->
  <div
    id="astrologi-section"
    class="mt-10 bg-gradient-to-br from-indigo-50/50 via-white to-sky-50/30 dark:from-slate-900 dark:via-slate-800/80 dark:to-slate-900 rounded-3xl border border-indigo-100/50 dark:border-slate-700/80 shadow-soft-lg dark:shadow-none p-6 sm:p-8 relative overflow-hidden"
  >
    <!-- Decor -->
    <div
      class="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-400/10 rounded-full blur-3xl -z-10 pointer-events-none"
    ></div>
    <div
      class="absolute top-10 right-10 w-32 h-32 bg-sky-400/10 rounded-full blur-2xl -z-10 pointer-events-none"
    ></div>

    <div class="text-center mb-8">
      <div
        class="inline-flex items-center justify-center p-3 bg-gradient-to-br from-green-100 to-emerald-50 dark:from-slate-800 dark:to-slate-800 rounded-2xl mb-4 shadow-sm border border-green-100/50 dark:border-slate-700/80"
      >
        <Info class="h-7 w-7 text-green-600" />
      </div>
      <h2
        class="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight mb-3"
      >
        {$t('calendar.astrologi') || 'Astrologi'} <span
          class="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500"
          >Lahir & Weton</span
        >
      </h2>
      <p class="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
        {$t('calendar.ketahui_watak') || 'Ketahui watak Masehi, Zodiak Tiongkok, hingga weton Jawa Anda secara komprehensif.'}
      </p>
    </div>

    <div class="flex flex-col items-center justify-center gap-4 mb-8">
      <!-- Custom Date Input -->
      <div
        class="flex items-center w-full sm:w-auto bg-white dark:bg-slate-900 rounded-2xl shadow-soft-sm dark:shadow-none border border-slate-200 dark:border-slate-700 p-1.5 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 transition-all"
      >
        <input
          type="date"
          bind:value={birthDateInput}
          class="bg-transparent border-none px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-0 w-full sm:w-auto"
        />
        <button
          on:click={checkCustomBirthDate}
          disabled={!birthDateInput}
          class="ml-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-slate-200 font-bold text-sm rounded-xl transition-colors"
        >{$t('calendar.cek_manual') || 'Cek Manual'}</button>
      </div>

      <!-- Fast Check Button -->
      {#if $authStore.user?.tahun_lahir}
        <button
          on:click={checkMyBirthDate}
          class="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-2xl shadow-lg dark:shadow-none shadow-indigo-200 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 mt-2"
        >
          <MoonStar class="w-5 h-5" />{$t('calendar.berikut_astrologi') || 'Berikut Adalah Astrologi Mu'}</button>
      {/if}
    </div>

    <!-- Result Card -->
    {#if showBirthResult && birthResult}
      <div
        class="bg-white dark:bg-slate-900 rounded-2xl border border-indigo-100 shadow-md dark:shadow-none p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
      >
        <!-- Result Data Card -->
        <div
          class="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 relative z-10"
        >
          <!-- Kolom 1 -->
          <div class="space-y-5">
            <div class="flex items-start gap-4">
              <div
                class="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 shrink-0"
              >
                <CalendarIcon class="w-5 h-5" />
              </div>
              <div>
                <p
                  class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1"
                >{$t('calendar.tanggal_lahir_masehi') || 'Tanggal Lahir (Masehi)'}</p>
                <p class="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100">
                  {formatNumberDisplay(birthResult.masehi)}
                </p>
              </div>
            </div>

            <div class="flex items-start gap-4">
              <div class="p-2.5 bg-sky-50 rounded-xl text-sky-600 shrink-0">
                <Info class="w-5 h-5" />
              </div>
              <div>
                <p
                  class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1"
                >
                  Umur Saat Ini
                </p>
                <p class="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100">
                  {formatNumberDisplay(birthResult.ageStr)}
                </p>
              </div>
            </div>

            <div class="flex items-start gap-4">
              <div class="p-2.5 bg-rose-50 rounded-xl text-rose-500 shrink-0">
                <AstrologyIcon
                  type="zodiak"
                  name={birthResult.zodiak.split(" ")[0]}
                  class="w-6 h-6"
                />
              </div>
              <div>
                <p
                  class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1"
                >
                  Zodiak
                </p>
                <p class="text-base sm:text-lg font-black text-rose-600">
                  {birthResult.zodiak.split(" ")[0]}
                </p>
              </div>
            </div>
          </div>

          <!-- Kolom 2 -->
          <div class="relative h-full">
            <div
              class="hidden md:block absolute left-[-20px] top-0 bottom-0 w-[1px] bg-slate-100 dark:bg-slate-800"
            ></div>

            <div class="space-y-5">
              <div class="flex items-start gap-4">
                <div class="p-2.5 bg-green-50 dark:bg-slate-800 rounded-xl text-green-600 shrink-0">
                  <MoonStar class="w-5 h-5" />
                </div>
              <div>
                <p
                  class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1"
                >
                  Kelahiran Hijriyah
                </p>
                <p class="text-base sm:text-lg font-black text-green-700 dark:text-green-400">
                  {formatNumberDisplay(birthResult.hijri)}
                </p>
              </div>
            </div>

            <div class="flex items-start gap-4">
              <div class="p-2.5 bg-amber-50 rounded-xl text-amber-600 shrink-0">
                <Book class="w-5 h-5" />
              </div>
              <div>
                <p
                  class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1"
                >
                  Primbon Jawa
                </p>
                <p class="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100">
                  {formatNumberDisplay(birthResult.weton)}
                  <span class="text-slate-400 font-medium text-sm ml-1"
                    >(Neptu {formatNumberDisplay(birthResult.neptu)})</span
                  >
                </p>
                <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                  Wuku: {birthResult.wuku} • Warsa: {birthResult.warsa}
                </p>
              </div>
            </div>

            <div class="flex items-start gap-4">
              <div
                class="p-2.5 bg-orange-50 rounded-xl text-orange-600 shrink-0"
              >
                <AstrologyIcon
                  type="shio"
                  name={birthResult.shio.nama}
                  class="w-6 h-6"
                />
              </div>
              <div>
                <p
                  class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1"
                >
                  Shio (Zodiak Tiongkok)
                </p>
                <p class="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100">
                  {birthResult.shio.nama}
                </p>
              </div>
            </div>
            </div>
          </div>
        </div>

        <!-- Watak Section -->
        <div
          class="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8"
        >
          <div class="flex items-start gap-4">
            <div class="p-2.5 bg-purple-50 rounded-xl text-purple-600 shrink-0">
              <BookOpen class="w-5 h-5" />
            </div>
            <div>
              <p
                class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1"
              >
                Watak (Weton Jawa)
              </p>
              <p class="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">
                {birthResult.watak}
              </p>
            </div>
          </div>

          <div class="flex items-start gap-4 relative">
            <div
              class="hidden md:block absolute left-[-20px] top-0 bottom-0 w-[1px] bg-slate-100 dark:bg-slate-800"
            ></div>
            <div class="p-2.5 bg-rose-50 rounded-xl text-rose-500 shrink-0">
              <AstrologyIcon
                type="zodiak"
                name={birthResult.zodiak.split(" ")[0]}
                class="w-6 h-6"
              />
            </div>
            <div>
              <p
                class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1"
              >
                Watak (Zodiak Masehi)
              </p>
              <p class="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">
                {birthResult.watakZodiak}
              </p>
            </div>
          </div>

          <div class="flex items-start gap-4 relative">
            <div
              class="hidden md:block absolute left-[-20px] top-0 bottom-0 w-[1px] bg-slate-100 dark:bg-slate-800"
            ></div>
            <div class="p-2.5 bg-orange-50 rounded-xl text-orange-500 shrink-0">
              <AstrologyIcon
                type="shio"
                name={birthResult.shio.nama}
                class="w-6 h-6"
              />
            </div>
            <div>
              <p
                class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1"
              >
                Watak (Shio Tiongkok)
              </p>
              <p class="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">
                {birthResult.shio.watak}
              </p>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
