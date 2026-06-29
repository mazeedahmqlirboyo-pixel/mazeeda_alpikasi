<script lang="ts">
  import { onMount } from "svelte";
  import { fade, slide } from "svelte/transition";
  import { page } from "$app/stores";
  import Card from "$lib/components/ui/card.svelte";
  import Button from "$lib/components/ui/button.svelte";
  import Tabs from "$lib/components/ui/tabs.svelte";
  import {
    ArrowLeft,
    HelpCircle,
    Info,
    Calculator,
    DollarSign,
    Wallet,
    Scale,
    RefreshCw,
    ChevronDown,
    X,
    User,
    CheckCircle2,
    Users,
    Coins,
    HeartPulse,
    PieChart
  } from "lucide-svelte";

  // Navigation & Calculator Type Choice
  let calculatorType = "zakat"; // 'zakat' or 'faraidh'
  let activeTab = "penghasilan";

  $: {
    const typeParam = $page.url.searchParams.get("type");
    if (typeParam === "faraidh") {
      calculatorType = "faraidh";
    } else if (typeParam === "zakat") {
      calculatorType = "zakat";
    }
  }
  let isDropdownOpen = false;

  const zakatItems = [
    { label: "Zakat Penghasilan", value: "penghasilan", icon: "💼" },
    { label: "Zakat Maal (Harta)", value: "maal", icon: "💰" },
    { label: "Zakat Fitrah", value: "fitrah", icon: "🌾" },
    { label: "Zakat Tabungan", value: "tabungan", icon: "🏦" },
    { label: "Zakat Emas", value: "emas", icon: "🪙" },
    { label: "Zakat Perak", value: "perak", icon: "🥈" },
    { label: "Zakat Pertanian", value: "pertanian", icon: "🚜" },
    { label: "Zakat Perdagangan", value: "perniagaan", icon: "🏬" },
    { label: "Zakat Saham", value: "saham", icon: "📈" },
    { label: "Zakat Reksadana", value: "reksadana", icon: "📊" },
    { label: "Zakat Peternakan", value: "peternakan", icon: "🐐" },
    { label: "Zakat Tambak", value: "tambak", icon: "🐟" },
    { label: "Zakat Perusahaan", value: "perusahaan", icon: "🏢" },
    { label: "Zakat Properti", value: "properti_sewa", icon: "🏠" },
    { label: "Zakat Pertambangan", value: "pertambangan", icon: "⛏️" },
  ];

  $: {
    if (calculatorType === "faraidh") {
      activeTab = "faraidh";
    } else if (calculatorType === "zakat" && activeTab === "faraidh") {
      activeTab = "penghasilan";
    }
  }

  import { CapacitorHttp } from '@capacitor/core';

  // Helper formatting numbers to Indonesian Rupiah currency
  function formatRupiah(num: number): string {
    return "Rp " + Math.round(num).toLocaleString("id-ID");
  }

  // Common State
  let hargaEmas = 2710000; // Harga emas per gram default (Update 2026)

  // Real-time gold API state
  let isLoadingGold = false;
  let goldLastUpdated = "";
  let goldDataSource = "Default (Offline)";
  let goldMaterialType = "Emas Batangan";
  let goldUrlHomepage = "https://www.anekalogam.co.id";

  // Real-time silver API state
  let isLoadingSilver = false;
  let silverLastUpdated = "";
  let silverDataSource = "Default (Offline)";
  let silverUrlHomepage = "https://harga-emas.org/perak";

  async function fetchGoldPrice() {
    try {
      isLoadingGold = true;
      let json;
      
      try {
        // Try internal proxy first (works on Web Preview)
        const res = await fetch("/api/gold-price");
        json = await res.json();
      } catch (err) {
        // Fallback to direct fetch via CapacitorHttp (works on Android APK)
        const options = { url: "https://logam-mulia-api.iamutaki.workers.dev/api/prices/anekalogam" };
        const response = await CapacitorHttp.get(options);
        if (response.status === 200) {
          json = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
        }
      }
      
      if (json && json.success && json.data && json.data.length > 0) {
        const oneGramGold =
          json.data.find(
            (item: any) =>
              item.weight === 1 && item.materialType.includes("LM Antam produksi tahun 2026"),
          ) ||
          json.data[0] ||
          json.data.find((item: any) => item.weight === 1);
          
        if (oneGramGold && oneGramGold.sellPrice) {
          hargaEmas = oneGramGold.sellPrice;
          goldLastUpdated =
            oneGramGold.recordedDate || new Date().toISOString().split("T")[0];
          goldDataSource = "Aneka Logam (API Realtime)";
          goldMaterialType = oneGramGold.materialType || "Emas Batangan";
          goldUrlHomepage =
            oneGramGold.urlHomepage || "https://www.anekalogam.co.id";
        } else {
          throw new Error("Invalid gold API response structure");
        }
      } else {
        throw new Error("Failed to fetch gold price");
      }
    } catch (e) {
      console.warn("Failed to fetch gold price:", e);
      goldDataSource = "Default (Offline)";
    } finally {
      isLoadingGold = false;
    }
  }

  async function fetchSilverPrice() {
    try {
      isLoadingSilver = true;
      let price = 0;
      
      try {
        // Try internal proxy first (works on Web Preview)
        const res = await fetch("/api/silver-price");
        const json = await res.json();
        if (json && json.success && json.price) price = json.price;
      } catch (err) {
        // Fallback to direct fetch via CapacitorHttp (works on Android APK)
        const options = {
          url: "https://harga-emas.org/perak",
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        };
        const response = await CapacitorHttp.get(options);
        if (response.status === 200) {
          const html = response.data;
          const match = html.match(/"price"\s*:\s*(\d+)\s*,\s*"priceCurrency"\s*:\s*"IDR"/);
          if (match && match[1]) {
            price = parseInt(match[1], 10);
          } else {
            const fallbackMatch = html.match(/"price"\s*:\s*(\d+)/);
            if (fallbackMatch && fallbackMatch[1]) {
              const p = parseInt(fallbackMatch[1], 10);
              if (p > 10000 && p < 100000) price = p;
            }
          }
        }
      }

      if (price > 0) {
        hargaPerak = price;
        hargaPerakDisp = price.toLocaleString("id-ID");
        silverLastUpdated = new Date().toISOString().split("T")[0];
        silverDataSource = "Harga Perak (API Realtime)";
      } else {
        throw new Error("Could not parse silver price");
      }
    } catch (e) {
      console.warn("Failed to fetch silver price:", e);
      silverDataSource = "Default (Offline)";
    } finally {
      isLoadingSilver = false;
    }
  }

  // Format Helper for automatic thousands input
  function handleNumericInput(event: Event, callback: (v: number) => void) {
    const target = event.target as HTMLInputElement;
    const rawVal = target.value.replace(/[^\d]/g, "");
    const num = rawVal ? parseInt(rawVal, 10) : 0;

    // Set formatted text in target
    target.value = num ? num.toLocaleString("id-ID") : "";
    callback(num);
  }

  function handleGoldInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const rawVal = target.value.replace(/[^\d]/g, "");
    const num = rawVal ? parseInt(rawVal, 10) : 0;
    target.value = num ? num.toLocaleString("id-ID") : "";
    hargaEmas = num;
    goldDataSource = "Manual (User)";
  }

  // Indonesian Terbilang (number to words helper)
  function terbilang(nilai: number): string {
    if (nilai === 0) return "Nol Rupiah";

    const bil = [
      "",
      "Satu",
      "Dua",
      "Tiga",
      "Empat",
      "Lima",
      "Enam",
      "Tujuh",
      "Delapan",
      "Sembilan",
      "Sepuluh",
      "Sebelas",
    ];

    function konversi(n: number): string {
      if (n < 12) {
        return bil[n];
      } else if (n < 20) {
        return bil[n - 10] + " Belas";
      } else if (n < 100) {
        const utama = Math.floor(n / 10);
        const sisa = n % 10;
        return bil[utama] + " Puluh " + bil[sisa];
      } else if (n < 200) {
        return "Seratus " + konversi(n - 100);
      } else if (n < 1000) {
        const utama = Math.floor(n / 100);
        const sisa = n % 100;
        return bil[utama] + " Ratus " + konversi(sisa);
      } else if (n < 2000) {
        return "Seribu " + konversi(n - 1000);
      } else if (n < 1000000) {
        const utama = Math.floor(n / 1000);
        const sisa = n % 1000;
        return konversi(utama) + " Ribu " + konversi(sisa);
      } else if (n < 1000000000) {
        const utama = Math.floor(n / 1000000);
        const sisa = n % 1000000;
        return konversi(utama) + " Juta " + konversi(sisa);
      } else if (n < 1000000000000) {
        const utama = Math.floor(n / 1000000000);
        const sisa = n % 1000000000;
        return konversi(utama) + " Miliar " + konversi(sisa);
      } else if (n < 1000000000000000) {
        const utama = Math.floor(n / 1000000000000);
        const sisa = n % 1000000000000;
        return konversi(utama) + " Triliun " + konversi(sisa);
      }
      return "Nilai terlalu besar";
    }

    const hasil = konversi(nilai).replace(/\s+/g, " ").trim();

    return hasil ? hasil + " Rupiah" : "";
  }

  // Display strings to mirror formatting on initial load / render
  let gajiBulananDisp = "";
  let pendapatanLainDisp = "";
  let kebutuhanBulananDisp = "";

  let uangTunaiDisp = "";
  let beratEmasMaalDisp = "";
  let beratPerakMaalDisp = "";
  let investasiDisp = "";
  let propertiDisp = "";
  let piutangDisp = "";
  let hutangDisp = "";

  let hartaKotorDisp = "";
  let hutangPewarisDisp = "";
  let biayaJenazahDisp = "";
  let wasiatPewarisDisp = "";

  onMount(() => {
    fetchGoldPrice();
    fetchSilverPrice();
  });

  // ==================== ZAKAT PENGHASILAN STATE & LOGIC ====================
  let showPenghasilanInfo = false;
  let gajiBulanan = 0;
  let pendapatanLain = 0;
  let potongKebutuhan = false;
  let kebutuhanBulanan = 0;

  $: totalPendapatanBulanan = (gajiBulanan || 0) + (pendapatanLain || 0);
  $: pendapatanKenaZakat = potongKebutuhan
    ? Math.max(0, totalPendapatanBulanan - (kebutuhanBulanan || 0))
    : totalPendapatanBulanan;
  $: nisabZakatPenghasilanBulanan = Math.round((85 * (hargaEmas || 0)) / 12);
  $: wajibZakatPenghasilan =
    pendapatanKenaZakat >= nisabZakatPenghasilanBulanan;
  $: jumlahZakatPenghasilan = wajibZakatPenghasilan
    ? Math.round(pendapatanKenaZakat * 0.025)
    : 0;
  $: sedekahRekomendasiPenghasilan = !wajibZakatPenghasilan
    ? Math.round(totalPendapatanBulanan * 0.025)
    : 0;

  // ==================== ZAKAT MAAL STATE & LOGIC ====================
  let showMaalInfo = false;
  let uangTunai = 0;
  let beratEmasMaal = 0;
  let beratPerakMaal = 0;
  let investasi = 0;
  let properti = 0;
  let piutang = 0;
  let hutang = 0;

  $: emasPerak = Math.round(
    (beratEmasMaal || 0) * (hargaEmas || 0) +
      (beratPerakMaal || 0) * (hargaPerak || 0),
  );
  $: totalHartaMaal =
    (uangTunai || 0) +
    (emasPerak || 0) +
    (investasi || 0) +
    (properti || 0) +
    (piutang || 0);
  $: hartaBersihMaal = Math.max(0, totalHartaMaal - (hutang || 0));
  $: nisabZakatMaalTahunan = 85 * (hargaEmas || 0);
  $: wajibZakatMaal = hartaBersihMaal >= nisabZakatMaalTahunan;
  $: jumlahZakatMaal = wajibZakatMaal ? Math.round(hartaBersihMaal * 0.025) : 0;
  $: sedekahRekomendasiMaal = !wajibZakatMaal
    ? Math.round(hartaBersihMaal * 0.025)
    : 0;

  // ==================== ZAKAT FITRAH STATE & LOGIC ====================
  let showFitrahInfo = false;
  let jumlahJiwa = 1;
  let hargaBeras = 15000;
  let jumlahJiwaDisp = "1";
  let hargaBerasDisp = "15.000";

  $: totalZakatBerasFitrah = (jumlahJiwa || 0) * 2.5; // kg
  $: totalZakatUangFitrah = (jumlahJiwa || 0) * 2.5 * (hargaBeras || 0);

  // ==================== ZAKAT TABUNGAN STATE & LOGIC ====================
  let saldoTabungan = 0;
  let saldoTabunganDisp = "";
  $: nisabZakatTabungan = 85 * (hargaEmas || 0);
  $: wajibZakatTabungan = (saldoTabungan || 0) >= nisabZakatTabungan;
  $: jumlahZakatTabungan = wajibZakatTabungan
    ? Math.round((saldoTabungan || 0) * 0.025)
    : 0;
  $: sedekahRekomendasiTabungan = !wajibZakatTabungan
    ? Math.round((saldoTabungan || 0) * 0.025)
    : 0;

  // ==================== ZAKAT EMAS STATE & LOGIC ====================
  let showEmasInfo = false;
  let beratEmasSimpan: number | undefined = undefined;
  let beratEmasPakai: number | undefined = undefined;
  let beratEmasSimpanDisp = "";
  let beratEmasPakaiDisp = "";
  $: wajibZakatEmas = (beratEmasSimpan || 0) >= 85;
  $: jumlahZakatEmas = wajibZakatEmas
    ? Math.round((beratEmasSimpan || 0) * (hargaEmas || 0) * 0.025)
    : 0;

  // ==================== ZAKAT PERAK STATE & LOGIC ====================
  let showPerakInfo = false;
  let beratPerak: number | undefined = undefined;
  let hargaPerak = 45000;
  let beratPerakDisp = "";
  let hargaPerakDisp = "45.000";
  $: wajibZakatPerak = (beratPerak || 0) >= 595;
  $: jumlahZakatPerak = wajibZakatPerak
    ? Math.round((beratPerak || 0) * (hargaPerak || 0) * 0.025)
    : 0;

  // ==================== ZAKAT PERTANIAN STATE & LOGIC ====================
  let showPertanianInfo = false;
  let hasilPanen: number | undefined = undefined;
  let hargaPanen = 0;
  let jenisPengairan = "pompa"; // 'pompa' or 'alami'
  let hasilPanenDisp = "";
  let hargaPanenDisp = "";
  $: nisabPertanianKg = 653; // 5 wasaq = 653 kg beras
  $: wajibZakatPertanian = (hasilPanen || 0) >= nisabPertanianKg;
  $: tarifPertanian = jenisPengairan === "alami" ? 0.1 : 0.05;
  $: jumlahZakatPertanianKg = wajibZakatPertanian
    ? (hasilPanen || 0) * tarifPertanian
    : 0;
  $: jumlahZakatPertanianRupiah = wajibZakatPertanian
    ? Math.round(jumlahZakatPertanianKg * (hargaPanen || 0))
    : 0;

  // ==================== ZAKAT PERDAGANGAN (PERNIAGAAN) STATE & LOGIC ====================
  let showPerniagaanInfo = false;
  let modalUsaha = 0;
  let keuntunganUsaha = 0;
  let piutangDagang = 0;
  let hutangDagang = 0;
  let modalUsahaDisp = "";
  let keuntunganUsahaDisp = "";
  let piutangDagangDisp = "";
  let hutangDagangDisp = "";
  $: totalAsetUsaha =
    (modalUsaha || 0) + (keuntunganUsaha || 0) + (piutangDagang || 0);
  $: hartaPerniagaanKenaZakat = Math.max(
    0,
    totalAsetUsaha - (hutangDagang || 0),
  );
  $: nisabPerniagaan = 85 * (hargaEmas || 0);
  $: wajibZakatPerniagaan = hartaPerniagaanKenaZakat >= nisabPerniagaan;
  $: jumlahZakatPerniagaan = wajibZakatPerniagaan
    ? Math.round(hartaPerniagaanKenaZakat * 0.025)
    : 0;
  $: sedekahRekomendasiPerniagaan = !wajibZakatPerniagaan
    ? Math.round(hartaPerniagaanKenaZakat * 0.025)
    : 0;

  // ==================== ZAKAT SAHAM STATE & LOGIC ====================
  let showSahamInfo = false;
  let nilaiSaham = 0;
  let dividenSaham = 0;
  let hutangSaham = 0;
  let nilaiSahamDisp = "";
  let dividenSahamDisp = "";
  let hutangSahamDisp = "";
  $: totalAsetSaham = (nilaiSaham || 0) + (dividenSaham || 0);
  $: hartaSahamKenaZakat = Math.max(0, totalAsetSaham - (hutangSaham || 0));
  $: nisabSaham = 85 * (hargaEmas || 0);
  $: wajibZakatSaham = hartaSahamKenaZakat >= nisabSaham;
  $: jumlahZakatSaham = wajibZakatSaham
    ? Math.round(hartaSahamKenaZakat * 0.025)
    : 0;
  $: sedekahRekomendasiSaham = !wajibZakatSaham
    ? Math.round(hartaSahamKenaZakat * 0.025)
    : 0;

  // ==================== ZAKAT REKSADANA STATE & LOGIC ====================
  let showReksadanaInfo = false;
  let nilaiReksadana = 0;
  let nilaiReksadanaDisp = "";
  $: nisabReksadana = 85 * (hargaEmas || 0);
  $: wajibZakatReksadana = (nilaiReksadana || 0) >= nisabReksadana;
  $: jumlahZakatReksadana = wajibZakatReksadana
    ? Math.round((nilaiReksadana || 0) * 0.025)
    : 0;
  $: sedekahRekomendasiReksadana = !wajibZakatReksadana
    ? Math.round((nilaiReksadana || 0) * 0.025)
    : 0;

  // ==================== ZAKAT PETERNAKAN STATE & LOGIC ====================
  let showPeternakanInfo = false;
  let jenisTernak = "kambing"; // 'kambing', 'domba', 'sapi', 'kerbau'
  let jumlahTernak: number | undefined = undefined;
  let hargaTernak = 3000000;
  let jumlahTernakDisp = "";
  let hargaTernakDisp = "3.000.000";

  function hitungZakatKambingDomba(jumlah: number, jenis: string): { count: number; desc: string } {
    const namaHewan = jenis === "kambing" ? "Kambing" : "Domba";
    const syaratUmur = jenis === "kambing" 
      ? "(Umur minimal 1 Tahun)" 
      : "(Umur minimal 1 Tahun / telah tanggal gigi)";
    
    if (jumlah < 40) return { count: 0, desc: "Belum wajib zakat" };
    if (jumlah <= 120) return { count: 1, desc: `1 Ekor ${namaHewan} ${syaratUmur}` };
    if (jumlah <= 200) return { count: 2, desc: `2 Ekor ${namaHewan}` };
    if (jumlah <= 300) return { count: 3, desc: `3 Ekor ${namaHewan}` };
    if (jumlah <= 400) return { count: 4, desc: `4 Ekor ${namaHewan}` };
    const tambahan = Math.floor((jumlah - 400) / 100);
    const total = 4 + tambahan;
    return {
      count: total,
      desc: `${total} Ekor ${namaHewan} (setiap kelipatan 100 ekor bertambah 1 ekor)`,
    };
  }

  function hitungZakatSapiKerbau(jumlah: number, jenis: string): {
    count: number;
    desc: string;
    tabiCount: number;
    musinnahCount: number;
  } {
    const namaHewan = jenis === "sapi" ? "Sapi" : "Kerbau";
    const labelTabi = `Tabi' (${namaHewan} jantan/betina umur 1 tahun)`;
    const labelMusinnah = `Musinnah (${namaHewan} betina umur 2 tahun)`;

    if (jumlah < 30)
      return {
        count: 0,
        desc: "Belum wajib zakat",
        tabiCount: 0,
        musinnahCount: 0,
      };
    if (jumlah <= 39)
      return {
        count: 1,
        desc: `1 Ekor ${labelTabi}`,
        tabiCount: 1,
        musinnahCount: 0,
      };
    if (jumlah <= 59)
      return {
        count: 1,
        desc: `1 Ekor ${labelMusinnah}`,
        tabiCount: 0,
        musinnahCount: 1,
      };
    if (jumlah <= 69)
      return { count: 2, desc: `2 Ekor ${labelTabi}`, tabiCount: 2, musinnahCount: 0 };
    if (jumlah <= 79)
      return {
        count: 2,
        desc: `1 Ekor ${labelTabi} dan 1 Ekor ${labelMusinnah}`,
        tabiCount: 1,
        musinnahCount: 1,
      };
    if (jumlah <= 89)
      return {
        count: 2,
        desc: `2 Ekor ${labelMusinnah}`,
        tabiCount: 0,
        musinnahCount: 2,
      };
    if (jumlah <= 99)
      return { count: 3, desc: `3 Ekor ${labelTabi}`, tabiCount: 3, musinnahCount: 0 };
    if (jumlah <= 109)
      return {
        count: 3,
        desc: `2 Ekor ${labelTabi} dan 1 Ekor ${labelMusinnah}`,
        tabiCount: 2,
        musinnahCount: 1,
      };
    if (jumlah <= 119)
      return {
        count: 3,
        desc: `1 Ekor ${labelTabi} dan 2 Ekor ${labelMusinnah}`,
        tabiCount: 1,
        musinnahCount: 2,
      };

    let bestT = 0;
    let bestM = 0;
    let minSisa = jumlah;
    for (let t = 0; t <= Math.floor(jumlah / 30); t++) {
      const sisaSetelahT = jumlah - t * 30;
      const m = Math.floor(sisaSetelahT / 40);
      const sisa = sisaSetelahT - m * 40;
      if (sisa < minSisa) {
        minSisa = sisa;
        bestT = t;
        bestM = m;
      } else if (sisa === minSisa) {
        if (m > bestM) {
          bestT = t;
          bestM = m;
        }
      }
    }
    const tabiCount = bestT;
    const musinnahCount = bestM;
    let parts = [];
    if (tabiCount > 0) parts.push(`${tabiCount} Ekor Tabi' (${namaHewan} umur 1 tahun)`);
    if (musinnahCount > 0) parts.push(`${musinnahCount} Ekor Musinnah (${namaHewan} betina umur 2 tahun)`);
    return {
      count: tabiCount + musinnahCount,
      desc: parts.join(" dan "),
      tabiCount,
      musinnahCount,
    };
  }

  $: wajibZakatPeternakan =
    (jenisTernak === "kambing" || jenisTernak === "domba")
      ? (jumlahTernak || 0) >= 40
      : (jumlahTernak || 0) >= 30;
  $: zakatPeternakanResult =
    (jenisTernak === "kambing" || jenisTernak === "domba")
      ? hitungZakatKambingDomba(jumlahTernak || 0, jenisTernak)
      : hitungZakatSapiKerbau(jumlahTernak || 0, jenisTernak);
  $: jumlahZakatPeternakanRupiah = wajibZakatPeternakan
    ? Math.round(zakatPeternakanResult.count * (hargaTernak || 0))
    : 0;

  // ==================== ZAKAT TAMBAK STATE & LOGIC ====================
  let showTambakInfo = false;
  let hasilPanenTambak = 0;
  let kasTambak = 0;
  let biayaTambak = 0;
  let hutangTambak = 0;
  let hasilPanenTambakDisp = "";
  let kasTambakDisp = "";
  let biayaTambakDisp = "";
  let hutangTambakDisp = "";
  $: totalAsetTambak = (hasilPanenTambak || 0) + (kasTambak || 0);
  $: bersihTambak = Math.max(
    0,
    totalAsetTambak - (biayaTambak || 0) - (hutangTambak || 0),
  );
  $: nisabTambak = 85 * (hargaEmas || 0);
  $: wajibZakatTambak = bersihTambak >= nisabTambak;
  $: jumlahZakatTambak = wajibZakatTambak
    ? Math.round(bersihTambak * 0.025)
    : 0;
  $: sedekahRekomendasiTambak = !wajibZakatTambak
    ? Math.round(bersihTambak * 0.025)
    : 0;

  // ==================== ZAKAT PERUSAHAAN STATE & LOGIC ====================
  let showPerusahaanInfo = false;
  let asetLancarPerusahaan = 0;
  let hutangLancarPerusahaan = 0;
  let persenKepemilikan = 100;
  let asetLancarPerusahaanDisp = "";
  let hutangLancarPerusahaanDisp = "";
  let persenKepemilikanDisp = "100";
  $: bersihPerusahaan = Math.max(
    0,
    (asetLancarPerusahaan || 0) - (hutangLancarPerusahaan || 0),
  );
  $: porsiBersihPerusahaan = Math.round(
    bersihPerusahaan * ((persenKepemilikan || 100) / 100),
  );
  $: nisabPerusahaan = 85 * (hargaEmas || 0);
  $: wajibZakatPerusahaan = porsiBersihPerusahaan >= nisabPerusahaan;
  $: jumlahZakatPerusahaan = wajibZakatPerusahaan
    ? Math.round(porsiBersihPerusahaan * 0.025)
    : 0;
  $: sedekahRekomendasiPerusahaan = !wajibZakatPerusahaan
    ? Math.round(porsiBersihPerusahaan * 0.025)
    : 0;

  // ==================== ZAKAT PROPERTI (SEWA) STATE & LOGIC ====================
  let showPropertiSewaInfo = false;
  let pendapatanSewa = 0;
  let biayaProperti = 0;
  let pendapatanSewaDisp = "";
  let biayaPropertiDisp = "";
  $: bersihProperti = Math.max(0, (pendapatanSewa || 0) - (biayaProperti || 0));
  $: nisabProperti = 85 * (hargaEmas || 0);
  $: wajibZakatProperti = bersihProperti >= nisabProperti;
  $: jumlahZakatProperti = wajibZakatProperti
    ? Math.round(bersihProperti * 0.025)
    : 0;
  $: sedekahRekomendasiProperti = !wajibZakatProperti
    ? Math.round(bersihProperti * 0.025)
    : 0;

  // ==================== ZAKAT PERTAMBANGAN STATE & LOGIC ====================
  let showPertambanganInfo = false;
  let hasilTambang = 0;
  let biayaTambang = 0;
  let hasilTambangDisp = "";
  let biayaTambangDisp = "";
  $: bersihTambang = Math.max(0, (hasilTambang || 0) - (biayaTambang || 0));
  $: nisabPertambangan = 85 * (hargaEmas || 0);
  $: wajibZakatPertambangan = bersihTambang >= nisabPertambangan;
  $: jumlahZakatPertambangan = wajibZakatPertambangan
    ? Math.round(bersihTambang * 0.025)
    : 0;
  $: sedekahRekomendasiPertambangan = !wajibZakatPertambangan
    ? Math.round(bersihTambang * 0.025)
    : 0;

  // ==================== FARAIDH (WARIS) STATE & LOGIC ====================
  let hartaKotor = 0;
  let hutangPewaris = 0;
  let biayaJenazah = 0;
  let wasiatPewaris = 0;

  let spouseType = "none"; // 'none', 'suami', 'istri'
  let istriCount = 1; // 1 s.d 4
  let hasFather = false;
  let hasMother = false;
  let sonsCount = 0;
  let daughtersCount = 0;

  // Advanced Faraidh Mode State
  let isAdvancedFaraidh = false;
  let hasKakek = false;
  let hasNenekAyah = false;
  let hasNenekIbu = false;
  let cucuLakiCount = 0;
  let cucuPerempuanCount = 0;
  let saudaraKandungLakiCount = 0;
  let saudaraKandungPerempuanCount = 0;
  $: totalDeductions =
    (hutangPewaris || 0) + (biayaJenazah || 0) + (wasiatPewaris || 0);
  $: netEstate = Math.max(0, (hartaKotor || 0) - totalDeductions);
  $: wasiatLimitWarning =
    (wasiatPewaris || 0) >
    ((hartaKotor || 0) - (hutangPewaris || 0) - (biayaJenazah || 0)) / 3;

  interface HeirResult {
    name: string;
    fractionStr: string;
    percentage: number;
    amount: number;
    explanation: string;
  }

  let faraidhResults: HeirResult[] = [];
  let baitulMaalAmount = 0;
  let totalDistributedPercentage = 0;

  $: {
    faraidhResults = [];
    baitulMaalAmount = 0;
    totalDistributedPercentage = 0;

    if (netEstate > 0) {
      // Determine active heirs based on advanced mode or not
      const _kakek = isAdvancedFaraidh ? hasKakek : false;
      const _nenekAyah = isAdvancedFaraidh ? hasNenekAyah : false;
      const _nenekIbu = isAdvancedFaraidh ? hasNenekIbu : false;
      const _cucuLaki = isAdvancedFaraidh ? cucuLakiCount : 0;
      const _cucuPr = isAdvancedFaraidh ? cucuPerempuanCount : 0;
      const _saudaraLaki = isAdvancedFaraidh ? saudaraKandungLakiCount : 0;
      const _saudaraPr = isAdvancedFaraidh ? saudaraKandungPerempuanCount : 0;

      // --- 1. HIJAB (BLOCKING) RULES ---
      const isAnakLakiExist = sonsCount > 0;
      const isCucuLakiExist = _cucuLaki > 0;
      
      const effCucuLaki = isAnakLakiExist ? 0 : _cucuLaki;
      const effCucuPr = (isAnakLakiExist || (daughtersCount >= 2 && effCucuLaki === 0)) ? 0 : _cucuPr;
      
      const effNenekIbu = hasMother ? false : _nenekIbu;
      const effNenekAyah = (hasMother || hasFather) ? false : _nenekAyah;
      const nenekCount = (effNenekIbu ? 1 : 0) + (effNenekAyah ? 1 : 0);

      const effKakek = hasFather ? false : _kakek;

      const isSaudaraBlocked = hasFather || effKakek || isAnakLakiExist || effCucuLaki > 0;
      const effSaudaraLaki = isSaudaraBlocked ? 0 : _saudaraLaki;
      const effSaudaraPr = isSaudaraBlocked ? 0 : _saudaraPr;

      const hasFarikWaris = sonsCount > 0 || daughtersCount > 0 || effCucuLaki > 0 || effCucuPr > 0;
      const hasMultipleSaudara = (effSaudaraLaki + effSaudaraPr) >= 2 || (_saudaraLaki + _saudaraPr) >= 2;

      // --- 2. CALCULATE FARDH SHARES ---
      let shares: any = {};
      let sumFardh = 0;
      
      if (spouseType === "suami") {
        shares.suami = hasFarikWaris ? 1/4 : 1/2;
        sumFardh += shares.suami;
      } else if (spouseType === "istri" && istriCount > 0) {
        shares.istri = hasFarikWaris ? 1/8 : 1/4;
        sumFardh += shares.istri;
      }

      if (hasMother) {
        shares.ibu = (hasFarikWaris || hasMultipleSaudara) ? 1/6 : 1/3;
        sumFardh += shares.ibu;
      }

      if (nenekCount > 0) {
        shares.nenek = 1/6;
        sumFardh += shares.nenek;
      }

      if (sonsCount === 0 && daughtersCount > 0) {
        shares.anakPr = daughtersCount === 1 ? 1/2 : 2/3;
        sumFardh += shares.anakPr;
      }

      if (effCucuPr > 0 && effCucuLaki === 0) {
        if (daughtersCount === 1) {
          shares.cucuPr = 1/6; // Takmilah 2/3
        } else if (daughtersCount === 0) {
          shares.cucuPr = effCucuPr === 1 ? 1/2 : 2/3;
        } else {
          shares.cucuPr = 0;
        }
        if(shares.cucuPr) sumFardh += shares.cucuPr;
      }

      let ayahAsabah = false;
      let kakekAsabah = false;
      
      if (hasFather) {
        shares.ayah = 1/6;
        sumFardh += shares.ayah;
        if (!isAnakLakiExist && effCucuLaki === 0) ayahAsabah = true;
      } else if (effKakek) {
        shares.kakek = 1/6;
        sumFardh += shares.kakek;
        if (!isAnakLakiExist && effCucuLaki === 0) kakekAsabah = true;
      }

      let saudaraPrAsabahMaalGhair = false;
      if (effSaudaraPr > 0 && effSaudaraLaki === 0) {
        if (daughtersCount > 0 || effCucuPr > 0) {
          saudaraPrAsabahMaalGhair = true;
        } else {
          shares.saudaraPr = effSaudaraPr === 1 ? 1/2 : 2/3;
          sumFardh += shares.saudaraPr;
        }
      }

      // --- 3. AUL ---
      let scale = 1;
      let isAul = false;
      if (sumFardh > 1) {
        scale = 1 / sumFardh;
        isAul = true;
      }

      const pushResult = (name: string, fraction: string, percentage: number, amount: number, explanation: string) => {
        faraidhResults.push({ name, fractionStr: fraction, percentage: percentage * 100, amount: Math.round(amount), explanation });
      }

      let sSuami = (shares.suami || 0) * scale;
      let sIstri = (shares.istri || 0) * scale;
      let sIbu = (shares.ibu || 0) * scale;
      let sNenek = (shares.nenek || 0) * scale;
      let sAyah = (shares.ayah || 0) * scale;
      let sKakek = (shares.kakek || 0) * scale;
      let sAnakPr = (shares.anakPr || 0) * scale;
      let sCucuPr = (shares.cucuPr || 0) * scale;
      let sSaudaraPr = (shares.saudaraPr || 0) * scale;

      // --- 4. RADD ---
      let remainder = Math.max(0, 1 - sumFardh);
      let hasAsabah = (sonsCount > 0) || (effCucuLaki > 0) || ayahAsabah || kakekAsabah || effSaudaraLaki > 0 || saudaraPrAsabahMaalGhair;
      
      if (remainder > 0 && !hasAsabah) {
        const raddBase = sumFardh - (shares.suami || 0) - (shares.istri || 0);
        if (raddBase > 0) {
          sIbu += remainder * ((shares.ibu || 0) / raddBase);
          sNenek += remainder * ((shares.nenek || 0) / raddBase);
          sAnakPr += remainder * ((shares.anakPr || 0) / raddBase);
          sCucuPr += remainder * ((shares.cucuPr || 0) / raddBase);
          sSaudaraPr += remainder * ((shares.saudaraPr || 0) / raddBase);
          remainder = 0;
        }
      }

      // --- RESULTS PUSH ---
      if (sSuami > 0) pushResult("Suami", isAul ? "Aul" : hasFarikWaris ? "1/4" : "1/2", sSuami, sSuami * netEstate, hasFarikWaris ? "Pewaris memiliki keturunan." : "Pewaris tidak memiliki keturunan.");
      if (sIstri > 0) {
        const pIstri = sIstri/istriCount;
        for(let i=1; i<=istriCount; i++) pushResult(istriCount>1?`Istri ke-${i}`:"Istri", isAul ? "Aul" : hasFarikWaris ? "1/8" : "1/4", pIstri, pIstri * netEstate, hasFarikWaris ? "Pewaris memiliki keturunan." : "Pewaris tidak memiliki keturunan.");
      }
      if (sIbu > 0) pushResult("Ibu", isAul ? "Aul" : (hasFarikWaris || hasMultipleSaudara) ? "1/6" : "1/3", sIbu, sIbu * netEstate, (hasFarikWaris || hasMultipleSaudara) ? "Pewaris memiliki keturunan atau beberapa saudara." : "Pewaris tidak memiliki keturunan dan saudara < 2.");
      
      if (nenekCount > 0 && sNenek > 0) {
        const pNenek = sNenek / nenekCount;
        if (effNenekAyah) pushResult("Nenek (Pihak Ayah)", isAul ? "Aul" : "1/6", pNenek, pNenek * netEstate, "Mendapat 1/6 (dibagi rata dengan nenek pihak ibu).");
        if (effNenekIbu) pushResult("Nenek (Pihak Ibu)", isAul ? "Aul" : "1/6", pNenek, pNenek * netEstate, "Mendapat 1/6 (dibagi rata dengan nenek pihak ayah).");
      }

      if (sAnakPr > 0) {
        const pAnakPr = sAnakPr / daughtersCount;
        for(let i=1; i<=daughtersCount; i++) pushResult(daughtersCount>1?`Anak Pr ke-${i}`:"Anak Perempuan", isAul ? "Aul" : (daughtersCount===1?"1/2":"2/3"), pAnakPr, pAnakPr * netEstate, "Bagian Fardh (tidak ada anak laki-laki).");
      }

      if (sCucuPr > 0) {
        const pCucuPr = sCucuPr / effCucuPr;
        for(let i=1; i<=effCucuPr; i++) pushResult(effCucuPr>1?`Cucu Pr ke-${i}`:"Cucu Perempuan", isAul ? "Aul" : (daughtersCount===1?"1/6":"Fardh"), pCucuPr, pCucuPr * netEstate, "Bagian Fardh karena menggantikan kedudukan anak.");
      }

      if (sSaudaraPr > 0 && !saudaraPrAsabahMaalGhair) {
        const pSaudPr = sSaudaraPr / effSaudaraPr;
        for(let i=1; i<=effSaudaraPr; i++) pushResult(effSaudaraPr>1?`Saudari ke-${i}`:"Saudari Kandung", isAul ? "Aul" : (effSaudaraPr===1?"1/2":"2/3"), pSaudPr, pSaudPr * netEstate, "Bagian Fardh.");
      }

      // --- 5. ASABAH (REMAINDER) ---
      if (remainder > 0) {
        if (sonsCount > 0) {
          const units = sonsCount * 2 + daughtersCount;
          const perSon = (remainder / units) * 2;
          const perDaughter = (remainder / units) * 1;
          for(let i=1; i<=sonsCount; i++) pushResult(sonsCount>1?`Anak Lk ke-${i}`:"Anak Laki-laki", "Asabah (2:1)", perSon, perSon * netEstate, "Sisa harta bersama anak perempuan (2:1).");
          for(let i=1; i<=daughtersCount; i++) pushResult(daughtersCount>1?`Anak Pr ke-${i}`:"Anak Perempuan", "Asabah (2:1)", perDaughter, perDaughter * netEstate, "Sisa harta ditarik asabah oleh anak laki-laki.");
        } 
        else if (effCucuLaki > 0) {
          const units = effCucuLaki * 2 + effCucuPr;
          const perCucuLk = (remainder / units) * 2;
          const perCucuPr = (remainder / units) * 1;
          for(let i=1; i<=effCucuLaki; i++) pushResult(effCucuLaki>1?`Cucu Lk ke-${i}`:"Cucu Laki-laki", "Asabah (2:1)", perCucuLk, perCucuLk * netEstate, "Sisa harta sebagai asabah.");
          for(let i=1; i<=effCucuPr; i++) pushResult(effCucuPr>1?`Cucu Pr ke-${i}`:"Cucu Perempuan", "Asabah (2:1)", perCucuPr, perCucuPr * netEstate, "Sisa harta ditarik asabah oleh cucu laki-laki.");
        }
        else if (ayahAsabah) {
          sAyah += remainder;
        }
        else if (kakekAsabah) {
          sKakek += remainder;
        }
        else if (effSaudaraLaki > 0) {
          const units = effSaudaraLaki * 2 + effSaudaraPr;
          const perSaudLk = (remainder / units) * 2;
          const perSaudPr = (remainder / units) * 1;
          for(let i=1; i<=effSaudaraLaki; i++) pushResult(effSaudaraLaki>1?`Saudara ke-${i}`:"Saudara Kandung Laki", "Asabah", perSaudLk, perSaudLk * netEstate, "Sisa harta sebagai asabah.");
          for(let i=1; i<=effSaudaraPr; i++) pushResult(effSaudaraPr>1?`Saudari ke-${i}`:"Saudari Kandung", "Asabah (2:1)", perSaudPr, perSaudPr * netEstate, "Sisa harta ditarik asabah oleh saudara laki-laki.");
        }
        else if (saudaraPrAsabahMaalGhair) {
          const perSaudPr = remainder / effSaudaraPr;
          for(let i=1; i<=effSaudaraPr; i++) pushResult(effSaudaraPr>1?`Saudari ke-${i}`:"Saudari Kandung", "Asabah Ma'al Ghair", perSaudPr, perSaudPr * netEstate, "Asabah menyusul adanya keturunan perempuan (Ma'al Ghair).");
        }
        else {
          baitulMaalAmount = Math.round(netEstate * remainder);
        }
      }

      if (sAyah > 0) pushResult("Ayah", ayahAsabah ? (sAyah === remainder ? "Asabah" : "1/6 + Asabah") : (isAul ? "Aul" : "1/6"), sAyah, sAyah * netEstate, ayahAsabah ? "Mendapat sisa harta setelah fardh karena tidak ada keturunan laki-laki." : "Bagian Fardh karena ada keturunan laki-laki.");
      if (sKakek > 0) pushResult("Kakek", kakekAsabah ? (sKakek === remainder ? "Asabah" : "1/6 + Asabah") : (isAul ? "Aul" : "1/6"), sKakek, sKakek * netEstate, "Kakek menempati kedudukan ayah.");

      totalDistributedPercentage = faraidhResults.reduce((acc, curr) => acc + curr.percentage, 0) + (baitulMaalAmount / netEstate) * 100;
    }
  }
</script>

<div class="space-y-6 pb-12 max-w-xl mx-auto">
  <!-- Header Bar -->
  <div class="flex items-center justify-between">
    <a
      href="/"
      class="inline-flex items-center space-x-2 text-slate-500 hover:text-primary transition-colors text-sm font-semibold"
    >
      <ArrowLeft class="h-4.5 w-4.5" />
      <span>Kembali</span>
    </a>
    <h1 class="text-base font-bold text-slate-800 uppercase tracking-wider">
      {calculatorType === 'zakat' ? 'Kalkulator Zakat' : 'Waris (Faraidh)'}
    </h1>
    <div class="w-10"></div>
  </div>


  {#if calculatorType === "zakat"}
    <!-- Zakat Type Selector Dropdown -->
    <div class="relative space-y-1.5">
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none flex items-center gap-1">
        <span>Pilih Jenis Zakat</span>
        <span class="text-slate-350 text-[8px] animate-pulse">▼</span>
      </label>
      
      <button
        type="button"
        on:click={() => (isDropdownOpen = !isDropdownOpen)}
        class="w-full flex items-center justify-between px-4 h-12 bg-white border border-slate-200 hover:border-slate-350 hover:bg-slate-50/30 text-sm font-bold text-slate-700 rounded-xl focus:outline-none transition-all cursor-pointer shadow-soft-xs"
      >
        <div class="flex items-center gap-2.5">
          <span class="text-base shrink-0">
            {zakatItems.find(item => item.value === activeTab)?.icon || '🕌'}
          </span>
          <span class="truncate">
            {zakatItems.find(item => item.value === activeTab)?.label || 'Pilih Zakat'}
          </span>
        </div>
        <div class="text-emerald-500 transition-transform duration-200 shrink-0 {isDropdownOpen ? 'rotate-180' : ''}">
          <ChevronDown class="h-4.5 w-4.5" />
        </div>
      </button>
      <p class="text-[10px] text-slate-400/80 text-center font-medium leading-none pt-1">
        *Ketuk tombol di atas untuk memilih atau mengubah jenis zakat yang ingin dihitung
      </p>

      {#if isDropdownOpen}
        <!-- Backdrop to close dropdown on outside click -->
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="fixed inset-0 z-10" on:click={() => (isDropdownOpen = false)}></div>

        <!-- Dropdown Menu List -->
        <div
          in:slide={{ duration: 150 }}
          out:slide={{ duration: 100 }}
          class="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200/80 rounded-xl shadow-lg z-20 max-h-80 overflow-y-auto divide-y divide-slate-100"
        >
          {#each zakatItems as item}
            <button
              type="button"
              on:click={() => {
                activeTab = item.value;
                isDropdownOpen = false;
              }}
              class="w-full flex items-center gap-3 px-4 py-3 text-xs sm:text-sm font-bold text-left transition-colors cursor-pointer
                     {activeTab === item.value 
                ? 'bg-emerald-50/50 text-emerald-600' 
                : 'text-slate-650 hover:bg-slate-50'}"
            >
              <span class="text-base">{item.icon}</span>
              <span class="flex-1">{item.label}</span>
              {#if activeTab === item.value}
                <span class="text-emerald-500">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </span>
              {/if}
            </button>
          {/each}
        </div>
      {/if}
    </div>
  {/if}

  <!-- Harga Acuan Customizer (Emas & Perak) -->
  {#if activeTab === "penghasilan" || activeTab === "maal" || activeTab === "tabungan" || activeTab === "emas" || activeTab === "perak" || activeTab === "perniagaan" || activeTab === "saham" || activeTab === "reksadana" || activeTab === "tambak" || activeTab === "perusahaan" || activeTab === "properti_sewa" || activeTab === "pertambangan"}
    <Card class="bg-emerald-50/30 border-emerald-250/20 p-4">
      <div
        class="grid grid-cols-1 {activeTab === 'maal'
          ? 'md:grid-cols-2 gap-6'
          : ''}"
      >
        <!-- Harga Emas Acuan (Tampil jika bukan tab Perak) -->
        {#if activeTab !== "perak"}
          <div
            class="flex flex-col gap-3 {activeTab === 'maal'
              ? 'border-b md:border-b-0 md:border-r border-slate-200/60 pb-5 md:pb-0 md:pr-6'
              : ''}"
          >
            <div class="flex items-start space-x-2.5">
              <Info class="h-4.5 w-4.5 text-emerald-600 mt-0.5 shrink-0" />
              <div class="space-y-1">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span
                    class="text-xs font-black text-slate-800 uppercase tracking-wider"
                    >Harga Emas Acuan</span
                  >
                  {#if isLoadingGold}
                    <span
                      class="animate-pulse bg-amber-200 text-amber-800 text-[8px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider"
                      >Syncing...</span
                    >
                  {:else if goldDataSource.includes("API")}
                    <span
                      class="bg-emerald-100 text-emerald-800 text-[8px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider"
                      >Realtime Aktif</span
                    >
                  {:else}
                    <span
                      class="bg-slate-100 text-slate-500 text-[8px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider"
                      >Manual</span
                    >
                  {/if}
                </div>
                <p
                  class="text-[10px] text-slate-550 leading-relaxed font-normal"
                >
                  Nisab 85g emas. Acuan: {goldMaterialType}
                  {#if goldLastUpdated}
                    <span class="text-slate-400 font-mono text-[9px] block"
                      >(Diperbarui: {goldLastUpdated} via {goldDataSource}.
                      <a
                        href={goldUrlHomepage}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-emerald-600 hover:text-emerald-700 underline font-bold"
                        >Klik Disini</a
                      > untuk mengakses halaman tersebut)</span
                    >
                  {/if}
                </p>
              </div>
            </div>

            <!-- Input & Refresh Button Row -->
            <div class="flex items-center gap-2 w-full mt-1">
              <div class="relative flex-1">
                <span
                  class="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400"
                  >Rp</span
                >
                <input
                  type="text"
                  value={hargaEmas.toLocaleString("id-ID")}
                  on:input={handleGoldInput}
                  placeholder="1.400.000"
                  class="pl-9 pr-3 py-2 w-full bg-white border border-slate-200 text-xs font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-soft-xs"
                />
              </div>
              <button
                type="button"
                on:click={fetchGoldPrice}
                class="p-2.5 hover:bg-emerald-100/60 rounded-xl text-emerald-700 transition-colors border border-emerald-250/20 bg-white cursor-pointer shadow-soft-xs flex items-center justify-center shrink-0"
                title="Sync harga emas terbaru"
                disabled={isLoadingGold}
              >
                <RefreshCw
                  class="h-3.5 w-3.5 {isLoadingGold ? 'animate-spin' : ''}"
                />
              </button>
            </div>
          </div>
        {/if}

        <!-- Harga Perak Acuan (Tampil hanya di tab Maal dan Perak) -->
        {#if activeTab === "maal" || activeTab === "perak"}
          <div class="flex flex-col gap-3">
            <div class="flex items-start space-x-2.5">
              <Info class="h-4.5 w-4.5 text-emerald-600 mt-0.5 shrink-0" />
              <div class="space-y-1">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span
                    class="text-xs font-black text-slate-800 uppercase tracking-wider"
                    >Harga Perak Acuan</span
                  >
                  {#if isLoadingSilver}
                    <span
                      class="animate-pulse bg-amber-200 text-amber-800 text-[8px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider"
                      >Syncing...</span
                    >
                  {:else if silverDataSource.includes("API")}
                    <span
                      class="bg-emerald-100 text-emerald-800 text-[8px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider"
                      >Realtime Aktif</span
                    >
                  {:else}
                    <span
                      class="bg-slate-100 text-slate-500 text-[8px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider"
                      >Manual</span
                    >
                  {/if}
                </div>
                <p
                  class="text-[10px] text-slate-550 leading-relaxed font-normal"
                >
                  Nisab 595g perak.
                  {#if silverLastUpdated}
                    <span class="text-slate-400 font-mono text-[9px] block"
                      >(Diperbarui: {silverLastUpdated} via {silverDataSource}.
                      <a
                        href={silverUrlHomepage}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-emerald-600 hover:text-emerald-700 underline font-bold"
                        >Klik Disini</a
                      > untuk mengakses halaman tersebut)</span
                    >
                  {/if}
                </p>
              </div>
            </div>

            <!-- Input & Refresh Button Row -->
            <div class="flex items-center gap-2 w-full mt-1">
              <div class="relative flex-1">
                <span
                  class="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400"
                  >Rp</span
                >
                <input
                  type="text"
                  value={hargaPerak.toLocaleString("id-ID")}
                  on:input={(e) =>
                    handleNumericInput(e, (v) => {
                      hargaPerak = v;
                      hargaPerakDisp = v ? v.toLocaleString("id-ID") : "";
                      silverDataSource = "Manual (User)";
                    })}
                  placeholder="37.970"
                  class="pl-9 pr-3 py-2 w-full bg-white border border-slate-200 text-xs font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-soft-xs"
                />
              </div>
              <button
                type="button"
                on:click={fetchSilverPrice}
                class="p-2.5 hover:bg-emerald-100/60 rounded-xl text-emerald-700 transition-colors border border-emerald-250/20 bg-white cursor-pointer shadow-soft-xs flex items-center justify-center shrink-0"
                title="Sync harga perak terbaru"
                disabled={isLoadingSilver}
              >
                <RefreshCw
                  class="h-3.5 w-3.5 {isLoadingSilver ? 'animate-spin' : ''}"
                />
              </button>
            </div>
          </div>
        {/if}
      </div>
    </Card>
  {/if}

  <!-- ==================== TAB 1: ZAKAT PENGHASILAN ==================== -->
  {#if activeTab === "penghasilan"}
    <div in:fade={{ duration: 150 }} class="space-y-5">
      <!-- Input Card -->
      <Card class="p-5 space-y-4 shadow-soft-sm">
        <div
          class="flex items-center justify-between border-b border-slate-100 pb-2"
        >
          <h3
            class="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5"
          >
            <Calculator class="h-4 w-4 text-primary" />
            <span>Isi Pendapatan</span>
          </h3>
          <button
            type="button"
            on:click={() => (showPenghasilanInfo = !showPenghasilanInfo)}
            class="p-1 hover:bg-slate-100 text-slate-400 hover:text-primary rounded-lg transition-colors cursor-pointer"
            title="Penjelasan Zakat Penghasilan"
          >
            <HelpCircle class="h-4.5 w-4.5" />
          </button>
        </div>

        {#if showPenghasilanInfo}
          <div
            in:slide={{ duration: 200 }}
            out:slide={{ duration: 150 }}
            class="bg-emerald-50/40 border border-emerald-100/50 rounded-xl p-3.5 text-xs text-slate-650 space-y-3 leading-relaxed text-justify"
          >
            <div>
              <h4
                class="font-bold text-slate-800 uppercase text-[10px] mb-1 tracking-wider"
              >
                Ketentuan Utama
              </h4>
              <ul class="list-disc pl-4.5 space-y-1">
                <li>
                  <strong>Nisab (Batas Minimum):</strong> Setara dengan nilai 85
                  gram emas per tahun (atau 1/12 dari 85 gram emas per bulannya).
                </li>
                <li>
                  <strong>Kadar Zakat:</strong> 2,5% dari total pendapatan bersih.
                </li>
                <li>
                  <strong>Waktu Pembayaran:</strong> Bisa ditunaikan setiap bulan
                  saat menerima gaji/penghasilan atau secara tahunan.
                </li>
              </ul>
            </div>
            <div class="border-t border-emerald-100/30 pt-2.5">
              <h4
                class="font-bold text-slate-800 uppercase text-[10px] mb-1 tracking-wider"
              >
                Cara Menghitung (3 Langkah Mudah)
              </h4>
              <ul class="list-decimal pl-4.5 space-y-1">
                <li>
                  <strong>Hitung Total Pendapatan:</strong> Jumlahkan gaji bulanan
                  dan bonus/pendapatan lain.
                </li>
                <li>
                  <strong>Kurangi Pengeluaran Pokok (Opsional):</strong> Sebagian
                  ulama memperbolehkan mengurangkan kebutuhan pokok (sandang, pangan,
                  papan, hutang jatuh tempo) terlebih dahulu.
                </li>
                <li>
                  <strong>Hitung Zakatnya:</strong> Jika sisa pendapatan bulanan
                  mencapai nisab bulanan, kalikan sisa tersebut dengan 2,5%.
                </li>
              </ul>
            </div>
            <div class="border-t border-emerald-100/30 pt-2.5">
              <span
                class="font-bold text-slate-800 uppercase text-[10px] block mb-1 tracking-wider"
                >Rumus:</span
              >
              <div
                class="bg-white border border-emerald-100 rounded-xl p-2.5 text-center font-black text-emerald-700 font-mono text-xs"
              >
                Zakat Penghasilan = Pendapatan Kena Zakat &times; 2,5%
              </div>
            </div>
            <p
              class="text-[10px] text-slate-400 mt-1 border-t border-emerald-100/30 pt-1.5 italic"
            >
              (Sumber: Al Qur'an Surah Al Baqarah ayat 267, Peraturan Menteri
              Agama Nomor 31 Tahun 2019, Fatwa MUI Nomor 3 Tahun 2003, dan
              pendapat Shaikh Yusuf Qardawi).
            </p>
          </div>
        {/if}

        <!-- Gaji Pokok -->
        <div class="space-y-1.5">
          <label for="gajiPokok" class="text-xs font-bold text-slate-600"
            >Gaji Pokok Saya Bulanan</label
          >
          <div class="relative">
            <span
              class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400"
              >Rp</span
            >
            <input
              id="gajiPokok"
              type="text"
              value={gajiBulananDisp}
              on:input={(e) =>
                handleNumericInput(e, (v) => {
                  gajiBulanan = v;
                  gajiBulananDisp = v ? v.toLocaleString("id-ID") : "";
                })}
              placeholder="0"
              class="pl-10 pr-4 h-11 w-full bg-slate-50/50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
            />
          </div>
          {#if gajiBulanan > 0}
            <p
              in:slide={{ duration: 150 }}
              class="text-[10px] text-emerald-600 font-extrabold mt-1 tracking-wide leading-none capitalize"
            >
              🗣️ Terbilang: {terbilang(gajiBulanan)}
            </p>
          {/if}
        </div>

        <!-- Bonus/Pendapatan Lain -->
        <div class="space-y-1.5">
          <label for="pendapatanLain" class="text-xs font-bold text-slate-600"
            >Pendapatan Lain / Bonus Bulanan</label
          >
          <div class="relative">
            <span
              class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400"
              >Rp</span
            >
            <input
              id="pendapatanLain"
              type="text"
              value={pendapatanLainDisp}
              on:input={(e) =>
                handleNumericInput(e, (v) => {
                  pendapatanLain = v;
                  pendapatanLainDisp = v ? v.toLocaleString("id-ID") : "";
                })}
              placeholder="0"
              class="pl-10 pr-4 h-11 w-full bg-slate-50/50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
            />
          </div>
          {#if pendapatanLain > 0}
            <p
              in:slide={{ duration: 150 }}
              class="text-[10px] text-emerald-600 font-extrabold mt-1 tracking-wide leading-none capitalize"
            >
              🗣️ Terbilang: {terbilang(pendapatanLain)}
            </p>
          {/if}
        </div>

        <!-- Toggle Kebutuhan Pokok -->
        <div class="pt-2 border-t border-slate-100 space-y-3">
          <!-- svelte-ignore a11y-label-has-associated-control -->
          <label
            class="flex items-center space-x-2.5 cursor-pointer select-none"
          >
            <input
              type="checkbox"
              bind:checked={potongKebutuhan}
              class="h-4.5 w-4.5 rounded border-slate-300 text-primary focus:ring-primary/20"
            />
            <span class="text-xs font-bold text-slate-600"
              >Kurangi Kebutuhan Pokok Bulanan</span
            >
          </label>

          {#if potongKebutuhan}
            <div in:slide={{ duration: 150 }} class="space-y-1.5 pl-7">
              <span
                class="text-[10px] font-medium text-slate-400 block leading-tight"
                >Pengeluaran pokok sandang, pangan, papan, & hutang mendesak</span
              >
              <div class="relative">
                <span
                  class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400"
                  >Rp</span
                >
                <input
                  type="text"
                  value={kebutuhanBulananDisp}
                  on:input={(e) =>
                    handleNumericInput(e, (v) => {
                      kebutuhanBulanan = v;
                      kebutuhanBulananDisp = v ? v.toLocaleString("id-ID") : "";
                    })}
                  placeholder="0"
                  class="pl-10 pr-4 h-11 w-full bg-slate-50/50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
                />
              </div>
              {#if kebutuhanBulanan > 0}
                <p
                  in:slide={{ duration: 150 }}
                  class="text-[10px] text-emerald-600 font-extrabold mt-1 tracking-wide leading-none capitalize"
                >
                  🗣️ Terbilang: {terbilang(kebutuhanBulanan)}
                </p>
              {/if}
            </div>
          {/if}
        </div>
      </Card>

      <!-- Calculations output card -->
      <Card
        class="p-5 space-y-4 border-slate-200 shadow-soft-sm relative overflow-hidden"
      >
        {#if wajibZakatPenghasilan}
          <div class="absolute inset-x-0 top-0 h-1.5 bg-emerald-500"></div>
        {:else}
          <div class="absolute inset-x-0 top-0 h-1.5 bg-slate-300"></div>
        {/if}

        <h3
          class="text-xs font-black text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between"
        >
          <span>Hasil Perhitungan</span>
          {#if wajibZakatPenghasilan}
            <span
              class="bg-emerald-500 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider"
              >Wajib Zakat</span
            >
          {:else}
            <span
              class="bg-slate-200 text-slate-500 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider"
              >Belum Wajib Zakat</span
            >
          {/if}
        </h3>

        <div class="divide-y divide-slate-100 text-xs">
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium"
              >Pendapatan Kotor Bulanan</span
            >
            <span class="font-bold text-slate-700"
              >{formatRupiah(totalPendapatanBulanan)}</span
            >
          </div>
          {#if potongKebutuhan}
            <div class="py-2.5 flex justify-between items-center">
              <span class="text-slate-500 font-medium"
                >Pengurangan Kebutuhan</span
              >
              <span class="font-bold text-slate-700"
                >- {formatRupiah(kebutuhanBulanan || 0)}</span
              >
            </div>
            <div class="py-2.5 flex justify-between items-center">
              <span class="text-slate-500 font-bold">Pendapatan Kena Zakat</span
              >
              <span class="font-black text-slate-800"
                >{formatRupiah(pendapatanKenaZakat)}</span
              >
            </div>
          {/if}
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium">Nisab Zakat Bulanan</span>
            <span class="font-bold text-slate-700"
              >{formatRupiah(nisabZakatPenghasilanBulanan)} / bln</span
            >
          </div>
        </div>

        <div
          class="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-center mt-2 space-y-1.5"
        >
          {#if wajibZakatPenghasilan}
            <p
              class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none"
            >
              Zakat yang Wajib Dikeluarkan (2.5%)
            </p>
            <h2 class="text-3xl font-black text-emerald-600 tracking-tight">
              {formatRupiah(jumlahZakatPenghasilan)}
              <span class="text-xs font-bold">/ bln</span>
            </h2>
            {#if jumlahZakatPenghasilan > 0}
              <p
                class="text-[10px] text-emerald-600 font-extrabold mt-1 tracking-wide leading-none capitalize"
              >
                🗣️ Terbilang: {terbilang(jumlahZakatPenghasilan)}
              </p>
            {/if}
            <p
              class="text-[10px] text-slate-400 font-medium max-w-[280px] mx-auto leading-normal pt-1.5"
            >
              "Keluarkanlah zakat dari sebagian harta mereka guna membersihkan
              dan menyucikan mereka." (QS. At-Taubah: 103)
            </p>
          {:else}
            <p
              class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none"
            >
              Rekomendasi Sedekah / Infaq (2.5%)
            </p>
            <h2 class="text-2xl font-black text-primary tracking-tight">
              {formatRupiah(sedekahRekomendasiPenghasilan)}
              <span class="text-xs font-bold">/ bln</span>
            </h2>
            {#if sedekahRekomendasiPenghasilan > 0}
              <p
                class="text-[10px] text-primary font-extrabold mt-1 tracking-wide leading-none capitalize"
              >
                🗣️ Terbilang: {terbilang(sedekahRekomendasiPenghasilan)}
              </p>
            {/if}
            <p
              class="text-[10px] text-slate-400 font-medium max-w-[280px] mx-auto leading-normal pt-1.5"
            >
              Pendapatan Anda berada di bawah nisab. Mengeluarkan infaq 2.5%
              bersifat anjuran sukarela demi keberkahan harta.
            </p>
          {/if}
        </div>
      </Card>
    </div>
  {/if}

  <!-- ==================== TAB 2: ZAKAT MAAL ==================== -->
  {#if activeTab === "maal"}
    <div in:fade={{ duration: 150 }} class="space-y-5">
      <!-- Input Card -->
      <Card class="p-5 space-y-4 shadow-soft-sm">
        <div
          class="flex items-center justify-between border-b border-slate-100 pb-2"
        >
          <h3
            class="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5"
          >
            <Wallet class="h-4.5 w-4.5 text-primary" />
            <span>Aset Maal (Kekayaan)</span>
          </h3>
          <button
            type="button"
            on:click={() => (showMaalInfo = !showMaalInfo)}
            class="p-1 hover:bg-slate-100 text-slate-400 hover:text-primary rounded-lg transition-colors cursor-pointer"
            title="Penjelasan Zakat Maal"
          >
            <HelpCircle class="h-4.5 w-4.5" />
          </button>
        </div>

        {#if showMaalInfo}
          <div
            in:slide={{ duration: 200 }}
            out:slide={{ duration: 150 }}
            class="bg-emerald-50/40 border border-emerald-100/50 rounded-xl p-3.5 text-xs text-slate-650 space-y-3 leading-relaxed text-justify"
          >
            <div>
              <h4
                class="font-bold text-slate-800 uppercase text-[10px] mb-1 tracking-wider"
              >
                Syarat & Ketentuan Utama
              </h4>
              <ul class="list-disc pl-4.5 space-y-1">
                <li>
                  <strong>Nisab (Batas Minimum):</strong> Harta bersih minimal setara
                  dengan nilai 85 gram emas.
                </li>
                <li>
                  <strong>Haul (Waktu):</strong> Harta tersebut telah dimiliki secara
                  penuh selama 1 tahun.
                </li>
                <li>
                  <strong>Kadar Zakat:</strong> 2,5% dari total harta bersih.
                </li>
              </ul>
            </div>
            <div class="border-t border-emerald-100/30 pt-2.5">
              <h4
                class="font-bold text-slate-800 uppercase text-[10px] mb-1 tracking-wider"
              >
                Cara Menghitung (3 Langkah Mudah)
              </h4>
              <ul class="list-decimal pl-4.5 space-y-1">
                <li>
                  <strong>Hitung Total Harta:</strong> Jumlahkan semua aset (uang
                  tunai, tabungan, emas, perak, investasi, dan barang dagangan).
                </li>
                <li>
                  <strong>Kurangi Utang:</strong> Kurangkan total harta tersebut
                  dengan utang yang jatuh tempo pada tahun itu untuk mendapatkan
                  Harta Bersih.
                </li>
                <li>
                  <strong>Hitung Zakatnya:</strong> Jika Harta Bersih sudah mencapai
                  nilai nisab (85 gram emas), kalikan dengan 2,5%.
                </li>
              </ul>
            </div>
            <div class="border-t border-emerald-100/30 pt-2.5">
              <span
                class="font-bold text-slate-800 uppercase text-[10px] block mb-1 tracking-wider"
                >Rumus:</span
              >
              <div
                class="bg-white border border-emerald-100 rounded-xl p-2.5 text-center font-black text-emerald-700 font-mono text-xs"
              >
                Zakat Mal = Total Harta Bersih &times; 2,5%
              </div>
            </div>
          </div>
        {/if}

        <!-- Uang Tunai/Tabungan -->
        <div class="space-y-1.5">
          <label for="uangTunai" class="text-xs font-bold text-slate-600"
            >Uang Tunai / Tabungan / Giro / Deposito</label
          >
          <div class="relative">
            <span
              class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400"
              >Rp</span
            >
            <input
              id="uangTunai"
              type="text"
              value={uangTunaiDisp}
              on:input={(e) =>
                handleNumericInput(e, (v) => {
                  uangTunai = v;
                  uangTunaiDisp = v ? v.toLocaleString("id-ID") : "";
                })}
              placeholder="0"
              class="pl-10 pr-4 h-11 w-full bg-slate-50/50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
            />
          </div>
          {#if uangTunai > 0}
            <p
              in:slide={{ duration: 150 }}
              class="text-[10px] text-emerald-600 font-extrabold mt-1 tracking-wide leading-none capitalize"
            >
              🗣️ Terbilang: {terbilang(uangTunai)}
            </p>
          {/if}
        </div>

        <!-- Emas/Logam Mulia Maal (Split Input) -->
        <div class="space-y-1.5">
          <label for="beratEmasMaal" class="text-xs font-bold text-slate-600"
            >Emas / Logam Mulia (gram)</label
          >
          <div class="relative">
            <input
              id="beratEmasMaal"
              type="text"
              value={beratEmasMaalDisp}
              on:input={(e) =>
                handleNumericInput(e, (v) => {
                  beratEmasMaal = v;
                  beratEmasMaalDisp = v ? v.toLocaleString("id-ID") : "";
                })}
              placeholder="0"
              class="pr-12 pl-4 h-11 w-full bg-slate-50/50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
            />
            <span
              class="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400"
              >gram</span
            >
          </div>
          <div
            class="flex flex-col sm:flex-row justify-between sm:items-center gap-1 text-[10px] mt-1 font-semibold"
          >
            <span class="text-slate-505 font-medium"
              >Estimasi Nilai: {formatRupiah(
                (beratEmasMaal || 0) * (hargaEmas || 0),
              )}</span
            >
            {#if (beratEmasMaal || 0) > 0}
              <span class="text-emerald-600 font-extrabold capitalize"
                >🗣️ Terbilang: {terbilang(
                  (beratEmasMaal || 0) * (hargaEmas || 0),
                )}</span
              >
            {/if}
          </div>
        </div>

        <!-- Perak Maal (Split Input) -->
        <div class="space-y-1.5">
          <label for="beratPerakMaal" class="text-xs font-bold text-slate-600"
            >Perak (gram)</label
          >
          <div class="relative">
            <input
              id="beratPerakMaal"
              type="text"
              value={beratPerakMaalDisp}
              on:input={(e) =>
                handleNumericInput(e, (v) => {
                  beratPerakMaal = v;
                  beratPerakMaalDisp = v ? v.toLocaleString("id-ID") : "";
                })}
              placeholder="0"
              class="pr-12 pl-4 h-11 w-full bg-slate-50/50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
            />
            <span
              class="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400"
              >gram</span
            >
          </div>
          <div
            class="flex flex-col sm:flex-row justify-between sm:items-center gap-1 text-[10px] mt-1 font-semibold"
          >
            <span class="text-slate-505 font-medium"
              >Estimasi Nilai: {formatRupiah(
                (beratPerakMaal || 0) * (hargaPerak || 0),
              )}</span
            >
            {#if (beratPerakMaal || 0) > 0}
              <span class="text-emerald-600 font-extrabold capitalize"
                >🗣️ Terbilang: {terbilang(
                  (beratPerakMaal || 0) * (hargaPerak || 0),
                )}</span
              >
            {/if}
          </div>
        </div>

        <!-- Saham/Reksadana/Investasi -->
        <div class="space-y-1.5">
          <label for="investasi" class="text-xs font-bold text-slate-600"
            >Saham / Investasi / Reksadana / Crypto</label
          >
          <div class="relative">
            <span
              class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400"
              >Rp</span
            >
            <input
              id="investasi"
              type="text"
              value={investasiDisp}
              on:input={(e) =>
                handleNumericInput(e, (v) => {
                  investasi = v;
                  investasiDisp = v ? v.toLocaleString("id-ID") : "";
                })}
              placeholder="0"
              class="pl-10 pr-4 h-11 w-full bg-slate-50/50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
            />
          </div>
          {#if investasi > 0}
            <p
              in:slide={{ duration: 150 }}
              class="text-[10px] text-emerald-600 font-extrabold mt-1 tracking-wide leading-none capitalize"
            >
              🗣️ Terbilang: {terbilang(investasi)}
            </p>
          {/if}
        </div>

        <!-- Properti/Aset Komersial -->
        <div class="space-y-1.5">
          <label for="properti" class="text-xs font-bold text-slate-600"
            >Nilai Properti Komersial / Nilai Kontrakan / Kendaraan Dagang</label
          >
          <div class="relative">
            <span
              class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400"
              >Rp</span
            >
            <input
              id="properti"
              type="text"
              value={propertiDisp}
              on:input={(e) =>
                handleNumericInput(e, (v) => {
                  properti = v;
                  propertiDisp = v ? v.toLocaleString("id-ID") : "";
                })}
              placeholder="0"
              class="pl-10 pr-4 h-11 w-full bg-slate-50/50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
            />
          </div>
          {#if properti > 0}
            <p
              in:slide={{ duration: 150 }}
              class="text-[10px] text-emerald-600 font-extrabold mt-1 tracking-wide leading-none capitalize"
            >
              🗣️ Terbilang: {terbilang(properti)}
            </p>
          {/if}
        </div>

        <!-- Piutang Lancar -->
        <div class="space-y-1.5">
          <label for="piutang" class="text-xs font-bold text-slate-600"
            >Piutang Lancar (Uang dipinjamkan yang pasti tertagih)</label
          >
          <div class="relative">
            <span
              class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400"
              >Rp</span
            >
            <input
              id="piutang"
              type="text"
              value={piutangDisp}
              on:input={(e) =>
                handleNumericInput(e, (v) => {
                  piutang = v;
                  piutangDisp = v ? v.toLocaleString("id-ID") : "";
                })}
              placeholder="0"
              class="pl-10 pr-4 h-11 w-full bg-slate-50/50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
            />
          </div>
          {#if piutang > 0}
            <p
              in:slide={{ duration: 150 }}
              class="text-[10px] text-emerald-600 font-extrabold mt-1 tracking-wide leading-none capitalize"
            >
              🗣️ Terbilang: {terbilang(piutang)}
            </p>
          {/if}
        </div>

        <!-- Pengurangan Hutang -->
        <div class="pt-2 border-t border-slate-100 space-y-1.5">
          <label for="hutang" class="text-xs font-bold text-slate-600"
            >Kewajiban / Hutang Jatuh Tempo (Dapat dikurangi)</label
          >
          <div class="relative">
            <span
              class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400"
              >Rp</span
            >
            <input
              id="hutang"
              type="text"
              value={hutangDisp}
              on:input={(e) =>
                handleNumericInput(e, (v) => {
                  hutang = v;
                  hutangDisp = v ? v.toLocaleString("id-ID") : "";
                })}
              placeholder="0"
              class="pl-10 pr-4 h-11 w-full bg-slate-50/50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
            />
          </div>
          {#if hutang > 0}
            <p
              in:slide={{ duration: 150 }}
              class="text-[10px] text-emerald-600 font-extrabold mt-1 tracking-wide leading-none capitalize"
            >
              🗣️ Terbilang: {terbilang(hutang)}
            </p>
          {/if}
        </div>
      </Card>

      <!-- Calculations output card -->
      <Card
        class="p-5 space-y-4 border-slate-200 shadow-soft-sm relative overflow-hidden"
      >
        {#if wajibZakatMaal}
          <div class="absolute inset-x-0 top-0 h-1.5 bg-emerald-500"></div>
        {:else}
          <div class="absolute inset-x-0 top-0 h-1.5 bg-slate-300"></div>
        {/if}

        <h3
          class="text-xs font-black text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between"
        >
          <span>Hasil Perhitungan</span>
          {#if wajibZakatMaal}
            <span
              class="bg-emerald-500 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider"
              >Wajib Zakat</span
            >
          {:else}
            <span
              class="bg-slate-200 text-slate-500 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider"
              >Belum Wajib Zakat</span
            >
          {/if}
        </h3>

        <div class="divide-y divide-slate-100 text-xs">
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium">Total Aset Maal</span>
            <span class="font-bold text-slate-700"
              >{formatRupiah(totalHartaMaal)}</span
            >
          </div>
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium">Deductions (Hutang)</span>
            <span class="font-bold text-slate-700"
              >- {formatRupiah(hutang || 0)}</span
            >
          </div>
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-bold"
              >Harta Bersih (Terkena Haul)</span
            >
            <span class="font-black text-slate-800"
              >{formatRupiah(hartaBersihMaal)}</span
            >
          </div>
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium"
              >Nisab Zakat Maal Tahunan (85g Emas)</span
            >
            <span class="font-bold text-slate-700"
              >{formatRupiah(nisabZakatMaalTahunan)}</span
            >
          </div>
        </div>

        <div
          class="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-center mt-2 space-y-1.5"
        >
          {#if wajibZakatMaal}
            <p
              class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none"
            >
              Zakat Maal yang Wajib Dikeluarkan (2.5%)
            </p>
            <h2 class="text-3xl font-black text-emerald-600 tracking-tight">
              {formatRupiah(jumlahZakatMaal)}
            </h2>
            {#if jumlahZakatMaal > 0}
              <p
                class="text-[10px] text-emerald-600 font-extrabold mt-1 tracking-wide leading-none capitalize"
              >
                🗣️ Terbilang: {terbilang(jumlahZakatMaal)}
              </p>
            {/if}
            <p
              class="text-[10px] text-slate-400 font-medium max-w-[280px] mx-auto leading-normal pt-1.5"
            >
              Harta bersih Anda telah melebihi nisab tahunan. Wajib dikeluarkan
              zakat sebesar 2,5% jika kepemilikan aset telah mencapai haul (1
              tahun hijriah).
            </p>
          {:else}
            <p
              class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none"
            >
              Rekomendasi Sedekah / Infaq (2.5%)
            </p>
            <h2 class="text-2xl font-black text-primary tracking-tight">
              {formatRupiah(sedekahRekomendasiMaal)}
            </h2>
            {#if sedekahRekomendasiMaal > 0}
              <p
                class="text-[10px] text-primary font-extrabold mt-1 tracking-wide leading-none capitalize"
              >
                🗣️ Terbilang: {terbilang(sedekahRekomendasiMaal)}
              </p>
            {/if}
            <p
              class="text-[10px] text-slate-400 font-medium max-w-[280px] mx-auto leading-normal pt-1.5"
            >
              Harta bersih Anda berada di bawah nisab tahunan. Anda disarankan
              mengeluarkan infaq/sedekah sukarela untuk mensucikan rezeki.
            </p>
          {/if}
        </div>
      </Card>
    </div>
  {/if}

  <!-- ==================== TAB: ZAKAT FITRAH ==================== -->
  {#if activeTab === "fitrah"}
    <div in:fade={{ duration: 150 }} class="space-y-5">
      <!-- Input Card -->
      <Card class="p-5 space-y-4 shadow-soft-sm">
        <div
          class="flex items-center justify-between border-b border-slate-100 pb-2"
        >
          <h3
            class="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5"
          >
            <Wallet class="h-4.5 w-4.5 text-primary" />
            <span>Isi Data Zakat Fitrah</span>
          </h3>
          <button
            type="button"
            on:click={() => (showFitrahInfo = !showFitrahInfo)}
            class="p-1 hover:bg-slate-100 text-slate-400 hover:text-primary rounded-lg transition-colors cursor-pointer"
            title="Penjelasan Zakat Fitrah"
          >
            <HelpCircle class="h-4.5 w-4.5" />
          </button>
        </div>

        {#if showFitrahInfo}
          <div
            in:slide={{ duration: 200 }}
            out:slide={{ duration: 150 }}
            class="bg-emerald-50/40 border border-emerald-100/50 rounded-xl p-3.5 text-xs text-slate-650 space-y-3 leading-relaxed text-justify"
          >
            <div>
              <h4
                class="font-bold text-slate-800 uppercase text-[10px] mb-1 tracking-wider"
              >
                Ketentuan Utama
              </h4>
              <ul class="list-disc pl-4.5 space-y-1">
                <li>
                  <strong>Waktu Pembayaran:</strong> Selama bulan Ramadhan, paling
                  lambat sebelum salat Idulfitri.
                </li>
                <li>
                  <strong>Besaran per Jiwa:</strong> Bahan makanan pokok seberat
                  2,5 kg (atau 3,5 liter). Bisa diganti dengan uang tunai yang nilainya
                  setara dengan harga beras tersebut (mengikuti ketetapan BAZNAS
                  daerah setempat).
                </li>
                <li>
                  <strong>Siapa yang Wajib?</strong> Setiap muslim (termasuk bayi
                  yang baru lahir sebelum matahari terbenam di akhir Ramadhan) yang
                  memiliki kelebihan makanan untuk malam dan hari raya.
                </li>
              </ul>
            </div>
            <div class="border-t border-emerald-100/30 pt-2.5">
              <h4
                class="font-bold text-slate-800 uppercase text-[10px] mb-1 tracking-wider"
              >
                Cara Menghitung (2 Langkah Mudah)
              </h4>
              <ul class="list-decimal pl-4.5 space-y-1">
                <li>
                  <strong>Hitung Jumlah Jiwa:</strong> Data semua anggota keluarga
                  yang ditanggung (termasuk diri sendiri, pasangan, anak, atau asisten
                  rumah tangga).
                </li>
                <li>
                  <strong>Kalikan dengan Besaran Zakat:</strong> Kalikan total jiwa
                  dengan ketetapan zakat fitrah per jiwa.
                </li>
              </ul>
            </div>
            <div class="border-t border-emerald-100/30 pt-2.5 space-y-2">
              <span
                class="font-bold text-slate-800 uppercase text-[10px] block mb-1 tracking-wider"
                >Rumus:</span
              >
              <div class="space-y-1.5 font-mono text-xs">
                <div
                  class="bg-white border border-emerald-100 rounded-xl p-2 text-center text-emerald-750"
                >
                  <span
                    class="text-[9px] text-slate-400 font-semibold uppercase block"
                    >Rumus Beras:</span
                  >
                  <span class="font-black"
                    >Total Zakat = Jumlah Jiwa &times; 2,5 kg</span
                  >
                </div>
                <div
                  class="bg-white border border-emerald-100 rounded-xl p-2 text-center text-emerald-750"
                >
                  <span
                    class="text-[9px] text-slate-400 font-semibold uppercase block"
                    >Rumus Uang:</span
                  >
                  <span class="font-black"
                    >Total Zakat = Jumlah Jiwa &times; Harga Beras/Jiwa</span
                  >
                </div>
              </div>
            </div>
          </div>
        {/if}

        <!-- Jumlah Jiwa -->
        <div class="space-y-1.5">
          <label for="jumlahJiwa" class="text-xs font-bold text-slate-600"
            >Jumlah Anggota Keluarga (Jiwa)</label
          >
          <div class="relative">
            <input
              id="jumlahJiwa"
              type="number"
              min="1"
              bind:value={jumlahJiwa}
              class="px-4 h-11 w-full bg-slate-50/50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
            />
          </div>
          <p class="text-[10px] text-slate-400 block leading-tight">
            Masing-masing jiwa wajib mengeluarkan 2,5 kg beras (makanan pokok)
            atau uang senilai dengannya.
          </p>
        </div>

        <!-- Harga Beras -->
        <div class="space-y-1.5">
          <label for="hargaBeras" class="text-xs font-bold text-slate-600"
            >Harga Beras per kg di Wilayah Anda (Rupiah)</label
          >
          <div class="relative">
            <span
              class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400"
              >Rp</span
            >
            <input
              id="hargaBeras"
              type="text"
              value={hargaBerasDisp}
              on:input={(e) =>
                handleNumericInput(e, (v) => {
                  hargaBeras = v;
                  hargaBerasDisp = v ? v.toLocaleString("id-ID") : "";
                })}
              placeholder="15.000"
              class="pl-10 pr-4 h-11 w-full bg-slate-50/50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
            />
          </div>
          {#if hargaBeras > 0}
            <p
              in:slide={{ duration: 150 }}
              class="text-[10px] text-emerald-600 font-extrabold mt-1 tracking-wide leading-none capitalize"
            >
              🗣️ Terbilang: {terbilang(hargaBeras)}
            </p>
          {/if}
        </div>
      </Card>

      <!-- Output Card -->
      <Card
        class="p-5 space-y-4 border-slate-200 shadow-soft-sm relative overflow-hidden"
      >
        <div class="absolute inset-x-0 top-0 h-1.5 bg-emerald-500"></div>
        <h3
          class="text-xs font-black text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between"
        >
          <span>Hasil Perhitungan Zakat Fitrah</span>
          <span
            class="bg-emerald-500 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider"
            >Wajib Zakat</span
          >
        </h3>

        <div class="divide-y divide-slate-100 text-xs">
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium">Jumlah Jiwa</span>
            <span class="font-bold text-slate-700">{jumlahJiwa} Orang</span>
          </div>
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium">Kewajiban per Jiwa</span>
            <span class="font-bold text-slate-700">2.5 kg Beras</span>
          </div>
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium">Harga Beras per kg</span>
            <span class="font-bold text-slate-700"
              >{formatRupiah(hargaBeras)}</span
            >
          </div>
        </div>

        <div
          class="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-center mt-2 space-y-2"
        >
          <div>
            <p
              class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1"
            >
              Total Zakat (Beras)
            </p>
            <h2 class="text-2xl font-black text-emerald-600 tracking-tight">
              {totalZakatBerasFitrah} kg
              <span class="text-sm font-bold text-slate-500">Beras</span>
            </h2>
          </div>
          <div class="pt-2 border-t border-slate-200/50">
            <p
              class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1"
            >
              Atau Jika Berupa Uang
            </p>
            <h2 class="text-2xl font-black text-emerald-600 tracking-tight">
              {formatRupiah(totalZakatUangFitrah)}
            </h2>
            <p
              class="text-[10px] text-emerald-600 font-extrabold mt-1 tracking-wide leading-none capitalize"
            >
              🗣️ Terbilang: {terbilang(totalZakatUangFitrah)}
            </p>
          </div>
        </div>
      </Card>
    </div>
  {/if}

  <!-- ==================== TAB: ZAKAT TABUNGAN ==================== -->
  {#if activeTab === "tabungan"}
    <div in:fade={{ duration: 150 }} class="space-y-5">
      <!-- Input Card -->
      <Card class="p-5 space-y-4 shadow-soft-sm">
        <h3
          class="text-xs font-black text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5"
        >
          <Wallet class="h-4.5 w-4.5 text-primary" />
          <span>Isi Saldo Tabungan</span>
        </h3>

        <!-- Saldo Tabungan -->
        <div class="space-y-1.5">
          <label for="saldoTabungan" class="text-xs font-bold text-slate-600"
            >Total Saldo Simpanan / Tabungan (Telah Mengendap 1 Tahun/Haul)</label
          >
          <div class="relative">
            <span
              class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400"
              >Rp</span
            >
            <input
              id="saldoTabungan"
              type="text"
              value={saldoTabunganDisp}
              on:input={(e) =>
                handleNumericInput(e, (v) => {
                  saldoTabungan = v;
                  saldoTabunganDisp = v ? v.toLocaleString("id-ID") : "";
                })}
              placeholder="0"
              class="pl-10 pr-4 h-11 w-full bg-slate-50/50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
            />
          </div>
          {#if saldoTabungan > 0}
            <p
              in:slide={{ duration: 150 }}
              class="text-[10px] text-emerald-600 font-extrabold mt-1 tracking-wide leading-none capitalize"
            >
              🗣️ Terbilang: {terbilang(saldoTabungan)}
            </p>
          {/if}
        </div>
      </Card>

      <!-- Output Card -->
      <Card
        class="p-5 space-y-4 border-slate-200 shadow-soft-sm relative overflow-hidden"
      >
        {#if wajibZakatTabungan}
          <div class="absolute inset-x-0 top-0 h-1.5 bg-emerald-500"></div>
        {:else}
          <div class="absolute inset-x-0 top-0 h-1.5 bg-slate-300"></div>
        {/if}

        <h3
          class="text-xs font-black text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between"
        >
          <span>Hasil Perhitungan Zakat Tabungan</span>
          {#if wajibZakatTabungan}
            <span
              class="bg-emerald-500 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider"
              >Wajib Zakat</span
            >
          {:else}
            <span
              class="bg-slate-200 text-slate-500 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider"
              >Belum Wajib Zakat</span
            >
          {/if}
        </h3>

        <div class="divide-y divide-slate-100 text-xs">
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium">Total Saldo Tabungan</span>
            <span class="font-bold text-slate-700"
              >{formatRupiah(saldoTabungan)}</span
            >
          </div>
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium"
              >Nisab Tabungan (85 gram Emas)</span
            >
            <span class="font-bold text-slate-700"
              >{formatRupiah(nisabZakatTabungan)}</span
            >
          </div>
        </div>

        <div
          class="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-center mt-2 space-y-1.5"
        >
          {#if wajibZakatTabungan}
            <p
              class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none"
            >
              Zakat yang Wajib Dikeluarkan (2.5%)
            </p>
            <h2 class="text-3xl font-black text-emerald-600 tracking-tight">
              {formatRupiah(jumlahZakatTabungan)}
            </h2>
            <p
              class="text-[10px] text-emerald-600 font-extrabold mt-1 tracking-wide leading-none capitalize"
            >
              🗣️ Terbilang: {terbilang(jumlahZakatTabungan)}
            </p>
          {:else}
            <p
              class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none"
            >
              Rekomendasi Sedekah / Infaq (2.5%)
            </p>
            <h2 class="text-2xl font-black text-primary tracking-tight">
              {formatRupiah(sedekahRekomendasiTabungan)}
            </h2>
            {#if sedekahRekomendasiTabungan > 0}
              <p
                class="text-[10px] text-primary font-extrabold mt-1 tracking-wide leading-none capitalize"
              >
                🗣️ Terbilang: {terbilang(sedekahRekomendasiTabungan)}
              </p>
            {/if}
            <p
              class="text-[10px] text-slate-400 font-medium max-w-[280px] mx-auto leading-normal pt-1"
            >
              Saldo tabungan Anda belum mencapai nishab tahunan. Anda disarankan
              mengeluarkan sedekah sukarela.
            </p>
          {/if}
        </div>
      </Card>
    </div>
  {/if}

  <!-- ==================== TAB: ZAKAT EMAS ==================== -->
  {#if activeTab === "emas"}
    <div in:fade={{ duration: 150 }} class="space-y-5">
      <!-- Input Card -->
      <Card class="p-5 space-y-4 shadow-soft-sm">
        <div
          class="flex items-center justify-between border-b border-slate-100 pb-2"
        >
          <h3
            class="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5"
          >
            <Wallet class="h-4.5 w-4.5 text-primary" />
            <span>Isi Jumlah Kepemilikan Emas</span>
          </h3>
          <button
            type="button"
            on:click={() => (showEmasInfo = !showEmasInfo)}
            class="p-1 hover:bg-slate-100 text-slate-400 hover:text-primary rounded-lg transition-colors cursor-pointer"
            title="Penjelasan Zakat Emas"
          >
            <HelpCircle class="h-4.5 w-4.5" />
          </button>
        </div>

        {#if showEmasInfo}
          <div
            in:slide={{ duration: 200 }}
            out:slide={{ duration: 150 }}
            class="bg-emerald-50/40 border border-emerald-100/50 rounded-xl p-3.5 text-xs text-slate-650 space-y-3 leading-relaxed text-justify"
          >
            <div>
              <h4
                class="font-bold text-slate-800 uppercase text-[10px] mb-1 tracking-wider"
              >
                Ketentuan Utama
              </h4>
              <ul class="list-disc pl-4.5 space-y-1">
                <li>
                  <strong>Nisab (Batas Minimum):</strong> 85 gram emas simpanan/investasi.
                </li>
                <li>
                  <strong>Haul (Waktu):</strong> Telah dimiliki secara penuh selama
                  1 tahun hijriah.
                </li>
                <li>
                  <strong>Kadar Zakat:</strong> 2,5% dari nilai emas yang disimpan.
                </li>
                <li>
                  <strong>Emas Perhiasan:</strong> Emas perhiasan yang rutin dipakai
                  sehari-hari tidak wajib dizakati menurut mayoritas ulama (selama
                  dalam batas wajar), sedangkan emas simpanan/investasi wajib dizakati
                  jika mencapai nisab.
                </li>
              </ul>
            </div>
            <div class="border-t border-emerald-100/30 pt-2.5">
              <h4
                class="font-bold text-slate-800 uppercase text-[10px] mb-1 tracking-wider"
              >
                Cara Menghitung (2 Langkah Mudah)
              </h4>
              <ul class="list-decimal pl-4.5 space-y-1">
                <li>
                  <strong>Masukkan Berat Emas:</strong> Tentukan jumlah gram emas
                  simpanan/investasi Anda.
                </li>
                <li>
                  <strong>Hitung Zakatnya:</strong> Jika berat emas simpanan mencapai
                  atau melebihi 85 gram, kalikan berat tersebut dengan harga acuan
                  emas saat ini, lalu kalikan dengan 2,5%.
                </li>
              </ul>
            </div>
            <div class="border-t border-emerald-100/30 pt-2.5">
              <span
                class="font-bold text-slate-800 uppercase text-[10px] block mb-1 tracking-wider"
                >Rumus:</span
              >
              <div
                class="bg-white border border-emerald-100 rounded-xl p-2.5 text-center font-black text-emerald-700 font-mono text-xs"
              >
                Zakat Emas = Berat Emas Simpanan &times; Harga Emas/gram &times;
                2,5%
              </div>
            </div>
          </div>
        {/if}

        <!-- Emas Simpanan -->
        <div class="space-y-1.5">
          <label for="beratEmasSimpan" class="text-xs font-bold text-slate-600"
            >Berat Emas yang Disimpan / Investasi (gram)</label
          >
          <input
            id="beratEmasSimpan"
            type="number"
            min="0"
            bind:value={beratEmasSimpan}
            placeholder="0"
            class="px-4 h-11 w-full bg-slate-50/50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
          />
          <p class="text-[10px] text-slate-400 block leading-tight">
            Emas batangan, koin emas, atau perhiasan yang disimpan dan jarang
            dipakai (wajib zakat jika >= 85 gram).
          </p>
        </div>

        <!-- Emas Dipakai -->
        <div class="space-y-1.5">
          <label for="beratEmasPakai" class="text-xs font-bold text-slate-600"
            >Berat Emas Perhiasan yang Rutin Dipakai (gram)</label
          >
          <input
            id="beratEmasPakai"
            type="number"
            min="0"
            bind:value={beratEmasPakai}
            placeholder="0"
            class="px-4 h-11 w-full bg-slate-50/50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
          />
          <p class="text-[10px] text-slate-400 block leading-tight">
            Emas yang digunakan sebagai perhiasan sehari-hari (tidak wajib zakat
            menurut mayoritas ulama jika dalam batas wajar).
          </p>
        </div>
      </Card>

      <!-- Output Card -->
      <Card
        class="p-5 space-y-4 border-slate-200 shadow-soft-sm relative overflow-hidden"
      >
        {#if wajibZakatEmas}
          <div class="absolute inset-x-0 top-0 h-1.5 bg-emerald-500"></div>
        {:else}
          <div class="absolute inset-x-0 top-0 h-1.5 bg-slate-300"></div>
        {/if}

        <h3
          class="text-xs font-black text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between"
        >
          <span>Hasil Perhitungan Zakat Emas</span>
          {#if wajibZakatEmas}
            <span
              class="bg-emerald-500 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider"
              >Wajib Zakat</span
            >
          {:else}
            <span
              class="bg-slate-200 text-slate-500 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider"
              >Belum Wajib Zakat</span
            >
          {/if}
        </h3>

        <div class="divide-y divide-slate-100 text-xs">
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium">Emas Wajib Zakat</span>
            <span class="font-bold text-slate-700"
              >{beratEmasSimpan || 0} gram</span
            >
          </div>
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium">Nisab Emas</span>
            <span class="font-bold text-slate-700">85 gram</span>
          </div>
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium"
              >Nilai Emas Acuan per gram</span
            >
            <span class="font-bold text-slate-700"
              >{formatRupiah(hargaEmas)}</span
            >
          </div>
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium"
              >Total Estimasi Nilai Emas</span
            >
            <span class="font-bold text-slate-700"
              >{formatRupiah((beratEmasSimpan || 0) * hargaEmas)}</span
            >
          </div>
        </div>

        <div
          class="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-center mt-2 space-y-1.5"
        >
          {#if wajibZakatEmas}
            <p
              class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none"
            >
              Zakat yang Wajib Dikeluarkan (2.5%)
            </p>
            <h2 class="text-3xl font-black text-emerald-600 tracking-tight">
              {formatRupiah(jumlahZakatEmas)}
            </h2>
            <p
              class="text-[10px] text-emerald-600 font-extrabold mt-1 tracking-wide leading-none capitalize"
            >
              🗣️ Terbilang: {terbilang(jumlahZakatEmas)}
            </p>
          {:else}
            <p
              class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none"
            >
              Rekomendasi Sedekah / Infaq
            </p>
            <h2 class="text-2xl font-black text-primary tracking-tight">
              Rp 0
            </h2>
            <p
              class="text-[10px] text-slate-400 font-medium max-w-[280px] mx-auto leading-normal pt-1"
            >
              Berat emas simpanan Anda ({beratEmasSimpan || 0} gram) masih di bawah
              batas nishab (85 gram).
            </p>
          {/if}
        </div>
      </Card>
    </div>
  {/if}

  <!-- ==================== TAB: ZAKAT PERAK ==================== -->
  {#if activeTab === "perak"}
    <div in:fade={{ duration: 150 }} class="space-y-5">
      <!-- Input Card -->
      <Card class="p-5 space-y-4 shadow-soft-sm">
        <div
          class="flex items-center justify-between border-b border-slate-100 pb-2"
        >
          <h3
            class="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5"
          >
            <Wallet class="h-4.5 w-4.5 text-primary" />
            <span>Isi Jumlah Kepemilikan Perak</span>
          </h3>
          <button
            type="button"
            on:click={() => (showPerakInfo = !showPerakInfo)}
            class="p-1 hover:bg-slate-100 text-slate-400 hover:text-primary rounded-lg transition-colors cursor-pointer"
            title="Penjelasan Zakat Perak"
          >
            <HelpCircle class="h-4.5 w-4.5" />
          </button>
        </div>

        {#if showPerakInfo}
          <div
            in:slide={{ duration: 200 }}
            out:slide={{ duration: 150 }}
            class="bg-emerald-50/40 border border-emerald-100/50 rounded-xl p-3.5 text-xs text-slate-650 space-y-3 leading-relaxed text-justify"
          >
            <div>
              <h4
                class="font-bold text-slate-800 uppercase text-[10px] mb-1 tracking-wider"
              >
                Ketentuan Utama
              </h4>
              <ul class="list-disc pl-4.5 space-y-1">
                <li><strong>Nisab (Batas Minimum):</strong> 595 gram perak.</li>
                <li>
                  <strong>Haul (Waktu):</strong> Telah dimiliki secara penuh selama
                  1 tahun hijriah.
                </li>
                <li><strong>Kadar Zakat:</strong> 2,5% dari nilai perak.</li>
              </ul>
            </div>
            <div class="border-t border-emerald-100/30 pt-2.5">
              <h4
                class="font-bold text-slate-800 uppercase text-[10px] mb-1 tracking-wider"
              >
                Cara Menghitung (2 Langkah Mudah)
              </h4>
              <ul class="list-decimal pl-4.5 space-y-1">
                <li>
                  <strong>Masukkan Berat Perak:</strong> Tentukan jumlah gram perak
                  simpanan/investasi Anda.
                </li>
                <li>
                  <strong>Hitung Zakatnya:</strong> Jika berat perak mencapai atau
                  melebihi 595 gram, kalikan berat tersebut dengan harga perak saat
                  ini, lalu kalikan dengan 2,5%.
                </li>
              </ul>
            </div>
            <div class="border-t border-emerald-100/30 pt-2.5">
              <span
                class="font-bold text-slate-800 uppercase text-[10px] block mb-1 tracking-wider"
                >Rumus:</span
              >
              <div
                class="bg-white border border-emerald-100 rounded-xl p-2.5 text-center font-black text-emerald-700 font-mono text-xs"
              >
                Zakat Perak = Berat Perak &times; Harga Perak/gram &times; 2,5%
              </div>
            </div>
          </div>
        {/if}

        <!-- Perak Simpanan -->
        <div class="space-y-1.5">
          <label for="beratPerak" class="text-xs font-bold text-slate-600"
            >Berat Perak yang Disimpan / Investasi (gram)</label
          >
          <input
            id="beratPerak"
            type="number"
            min="0"
            bind:value={beratPerak}
            placeholder="0"
            class="px-4 h-11 w-full bg-slate-50/50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
          />
          <p class="text-[10px] text-slate-400 block leading-tight">
            Perak wajib dikeluarkan zakatnya jika total beratnya mencapai batas
            nishab **595 gram**.
          </p>
        </div>

        <!-- Harga Perak per gram -->
        <div class="space-y-1.5">
          <label for="hargaPerak" class="text-xs font-bold text-slate-600"
            >Harga Perak per gram (Rupiah)</label
          >
          <div class="relative">
            <span
              class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400"
              >Rp</span
            >
            <input
              id="hargaPerak"
              type="text"
              value={hargaPerakDisp}
              on:input={(e) =>
                handleNumericInput(e, (v) => {
                  hargaPerak = v;
                  hargaPerakDisp = v ? v.toLocaleString("id-ID") : "";
                })}
              placeholder="16.000"
              class="pl-10 pr-4 h-11 w-full bg-slate-50/50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
            />
          </div>
          {#if hargaPerak > 0}
            <p
              in:slide={{ duration: 150 }}
              class="text-[10px] text-emerald-600 font-extrabold mt-1 tracking-wide leading-none capitalize"
            >
              🗣️ Terbilang: {terbilang(hargaPerak)}
            </p>
          {/if}
        </div>
      </Card>

      <!-- Output Card -->
      <Card
        class="p-5 space-y-4 border-slate-200 shadow-soft-sm relative overflow-hidden"
      >
        {#if wajibZakatPerak}
          <div class="absolute inset-x-0 top-0 h-1.5 bg-emerald-500"></div>
        {:else}
          <div class="absolute inset-x-0 top-0 h-1.5 bg-slate-300"></div>
        {/if}

        <h3
          class="text-xs font-black text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between"
        >
          <span>Hasil Perhitungan Zakat Perak</span>
          {#if wajibZakatPerak}
            <span
              class="bg-emerald-500 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider"
              >Wajib Zakat</span
            >
          {:else}
            <span
              class="bg-slate-200 text-slate-500 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider"
              >Belum Wajib Zakat</span
            >
          {/if}
        </h3>

        <div class="divide-y divide-slate-100 text-xs">
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium">Perak Wajib Zakat</span>
            <span class="font-bold text-slate-700">{beratPerak || 0} gram</span>
          </div>
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium">Nisab Perak</span>
            <span class="font-bold text-slate-700">595 gram</span>
          </div>
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium">Harga Perak per gram</span>
            <span class="font-bold text-slate-700"
              >{formatRupiah(hargaPerak)}</span
            >
          </div>
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium">Total Nilai Perak</span>
            <span class="font-bold text-slate-700"
              >{formatRupiah((beratPerak || 0) * hargaPerak)}</span
            >
          </div>
        </div>

        <div
          class="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-center mt-2 space-y-1.5"
        >
          {#if wajibZakatPerak}
            <p
              class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none"
            >
              Zakat yang Wajib Dikeluarkan (2.5%)
            </p>
            <h2 class="text-3xl font-black text-emerald-600 tracking-tight">
              {formatRupiah(jumlahZakatPerak)}
            </h2>
            <p
              class="text-[10px] text-emerald-600 font-extrabold mt-1 tracking-wide leading-none capitalize"
            >
              🗣️ Terbilang: {terbilang(jumlahZakatPerak)}
            </p>
          {:else}
            <p
              class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none"
            >
              Rekomendasi Sedekah / Infaq
            </p>
            <h2 class="text-2xl font-black text-primary tracking-tight">
              Rp 0
            </h2>
            <p
              class="text-[10px] text-slate-400 font-medium max-w-[280px] mx-auto leading-normal pt-1"
            >
              Berat perak simpanan Anda ({beratPerak || 0} gram) masih di bawah batas
              nishab (595 gram).
            </p>
          {/if}
        </div>
      </Card>
    </div>
  {/if}

  <!-- ==================== TAB: ZAKAT PERTANIAN ==================== -->
  {#if activeTab === "pertanian"}
    <div in:fade={{ duration: 150 }} class="space-y-5">
      <!-- Input Card -->
      <Card class="p-5 space-y-4 shadow-soft-sm">
        <div
          class="flex items-center justify-between border-b border-slate-100 pb-2"
        >
          <h3
            class="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5"
          >
            <Scale class="h-4.5 w-4.5 text-primary" />
            <span>Isi Hasil Pertanian</span>
          </h3>
          <button
            type="button"
            on:click={() => (showPertanianInfo = !showPertanianInfo)}
            class="p-1 hover:bg-slate-100 text-slate-400 hover:text-primary rounded-lg transition-colors cursor-pointer"
            title="Penjelasan Zakat Pertanian"
          >
            <HelpCircle class="h-4.5 w-4.5" />
          </button>
        </div>

        {#if showPertanianInfo}
          <div
            in:slide={{ duration: 200 }}
            out:slide={{ duration: 150 }}
            class="bg-emerald-50/40 border border-emerald-100/50 rounded-xl p-3.5 text-xs text-slate-650 space-y-3 leading-relaxed text-justify"
          >
            <div>
              <h4
                class="font-bold text-slate-800 uppercase text-[10px] mb-1 tracking-wider"
              >
                Syarat & Ketentuan Utama
              </h4>
              <ul class="list-disc pl-4.5 space-y-1">
                <li>
                  <strong>Nisab (Batas Minimum):</strong> 5 Wasaq, setara dengan
                  <strong>653 kg beras</strong>
                  (atau <strong>1.323 kg gabah kering giling</strong>).
                </li>
                <li>
                  <strong>Kadar Zakat:</strong> Tergantung metode pengairan yang
                  digunakan:
                  <ul class="list-disc pl-4 mt-0.5 space-y-0.5">
                    <li>
                      <strong>5%</strong> jika menggunakan pengairan buatan/berbayar
                      (pompa air, irigasi berbayar).
                    </li>
                    <li>
                      <strong>10%</strong> jika menggunakan pengairan alami/tanpa
                      biaya (air hujan, sungai, mata air).
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>Haul (Waktu):</strong> Tidak disyaratkan satu tahun.
                  Zakat pertanian wajib dikeluarkan
                  <strong>setiap kali panen</strong>.
                </li>
              </ul>
            </div>
            <div class="border-t border-emerald-100/30 pt-2.5">
              <h4
                class="font-bold text-slate-800 uppercase text-[10px] mb-1 tracking-wider"
              >
                Cara Menghitung (3 Langkah Mudah)
              </h4>
              <ul class="list-decimal pl-4.5 space-y-1">
                <li>
                  <strong>Hitung Hasil Panen:</strong> Tentukan total berat bersih
                  hasil panen pertanian dalam kilogram.
                </li>
                <li>
                  <strong>Tentukan Tarif Zakat:</strong> Tentukan tarif berdasarkan
                  sumber pengairan (5% jika berbayar, 10% jika tadah hujan/alami).
                </li>
                <li>
                  <strong>Hitung Zakatnya:</strong> Jika total hasil panen mencapai
                  nisab (653 kg beras), kalikan total hasil panen dengan tarif tersebut.
                  Jika ingin diuangkan, kalikan hasilnya dengan harga jual beras
                  per kg.
                </li>
              </ul>
            </div>
            <div class="border-t border-emerald-100/30 pt-2.5">
              <span
                class="font-bold text-slate-800 uppercase text-[10px] block mb-1 tracking-wider"
                >Rumus:</span
              >
              <div
                class="bg-white border border-emerald-100 rounded-xl p-2.5 text-center font-black text-emerald-700 font-mono text-[10px] sm:text-xs space-y-1"
              >
                <div>
                  Zakat Pertanian (kg) = Hasil Panen &times; Tarif Zakat (5% /
                  10%)
                </div>
                <div class="text-[9px] text-slate-400 font-normal font-sans">
                  Jika Diuangkan: Zakat (Rupiah) = Zakat Pertanian (kg) &times;
                  Harga Jual per kg
                </div>
              </div>
            </div>
          </div>
        {/if}

        <!-- Hasil Panen -->
        <div class="space-y-1.5">
          <label for="hasilPanen" class="text-xs font-bold text-slate-600"
            >Total Berat Hasil Panen (kg Gabah / Beras / Makanan Pokok)</label
          >
          <input
            id="hasilPanen"
            type="number"
            min="0"
            bind:value={hasilPanen}
            placeholder="0"
            class="px-4 h-11 w-full bg-slate-50/50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
          />
          <p class="text-[10px] text-slate-400 block leading-tight">
            Nishab zakat pertanian adalah 5 wasaq (setara **653 kg beras** /
            **1323 kg gabah kering giling**).
          </p>
        </div>

        <!-- Harga Hasil Panen per kg -->
        <div class="space-y-1.5">
          <label for="hargaPanen" class="text-xs font-bold text-slate-600"
            >Harga Jual Beras / Hasil Panen per kg (Rupiah)</label
          >
          <div class="relative">
            <span
              class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400"
              >Rp</span
            >
            <input
              id="hargaPanen"
              type="text"
              value={hargaPanenDisp}
              on:input={(e) =>
                handleNumericInput(e, (v) => {
                  hargaPanen = v;
                  hargaPanenDisp = v ? v.toLocaleString("id-ID") : "";
                })}
              placeholder="12.000"
              class="pl-10 pr-4 h-11 w-full bg-slate-50/50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
            />
          </div>
          {#if hargaPanen > 0}
            <p
              in:slide={{ duration: 150 }}
              class="text-[10px] text-emerald-600 font-extrabold mt-1 tracking-wide leading-none capitalize"
            >
              🗣️ Terbilang: {terbilang(hargaPanen)}
            </p>
          {/if}
        </div>

        <!-- Jenis Pengairan -->
        <div class="space-y-1.5">
          <!-- svelte-ignore a11y-label-has-associated-control -->
          <label class="text-xs font-bold text-slate-600"
            >Metode Pengairan / Irigasi</label
          >
          <div class="flex gap-4 flex-col sm:flex-row">
            <label
              class="flex items-center space-x-2 text-xs font-semibold text-slate-650 cursor-pointer"
            >
              <input
                type="radio"
                bind:group={jenisPengairan}
                value="pompa"
                class="h-4 w-4 border-slate-350 text-primary focus:ring-primary/20"
              />
              <span>Pompa / Air Berbayar / Irigasi Buatan (Tarif 5%)</span>
            </label>
            <label
              class="flex items-center space-x-2 text-xs font-semibold text-slate-650 cursor-pointer"
            >
              <input
                type="radio"
                bind:group={jenisPengairan}
                value="alami"
                class="h-4 w-4 border-slate-350 text-primary focus:ring-primary/20"
              />
              <span>Alami / Air Hujan / Sungai (Bebas Biaya - Tarif 10%)</span>
            </label>
          </div>
        </div>
      </Card>

      <!-- Output Card -->
      <Card
        class="p-5 space-y-4 border-slate-200 shadow-soft-sm relative overflow-hidden"
      >
        {#if wajibZakatPertanian}
          <div class="absolute inset-x-0 top-0 h-1.5 bg-emerald-500"></div>
        {:else}
          <div class="absolute inset-x-0 top-0 h-1.5 bg-slate-300"></div>
        {/if}

        <h3
          class="text-xs font-black text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between"
        >
          <span>Hasil Perhitungan Zakat Pertanian</span>
          {#if wajibZakatPertanian}
            <span
              class="bg-emerald-500 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider"
              >Wajib Zakat</span
            >
          {:else}
            <span
              class="bg-slate-200 text-slate-500 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider"
              >Belum Wajib Zakat</span
            >
          {/if}
        </h3>

        <div class="divide-y divide-slate-100 text-xs">
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium">Total Hasil Panen</span>
            <span class="font-bold text-slate-700">{hasilPanen || 0} kg</span>
          </div>
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium">Nisab Pertanian</span>
            <span class="font-bold text-slate-700">653 kg Beras</span>
          </div>
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium">Tarif Zakat</span>
            <span class="font-bold text-slate-700"
              >{jenisPengairan === "alami" ? "10%" : "5%"}</span
            >
          </div>
        </div>

        <!-- Detail Perhitungan -->
        <div class="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1.5 bg-slate-50/50 p-3 rounded-xl text-left">
          <p class="font-bold text-slate-700 uppercase tracking-wider text-[9px] mb-1.5">🔬 Detail Perhitungan:</p>
          <p>• <strong>Total Panen:</strong> {hasilPanen || 0} kg (Nisab: 653 kg beras)</p>
          <p>• <strong>Metode Pengairan:</strong> {jenisPengairan === 'alami' ? 'Alami / Tadah Hujan (Tarif 10%)' : 'Buatan / Pompa Berbayar (Tarif 5%)'}</p>
          <p>• <strong>Status:</strong> {#if wajibZakatPertanian}<span class="text-emerald-600 font-bold">Wajib Zakat (Panen >= 653 kg)</span>{:else}<span class="text-slate-500 font-bold">Belum Wajib Zakat</span>{/if}</p>
          {#if wajibZakatPertanian}
            <p>• <strong>Kadar Zakat (kg):</strong> {hasilPanen || 0} kg &times; {jenisPengairan === 'alami' ? '10%' : '5%'} = <strong class="text-emerald-600">{jumlahZakatPertanianKg.toFixed(1)} kg</strong></p>
            {#if hargaPanen > 0}
              <p>• <strong>Jika Diuangkan:</strong> {jumlahZakatPertanianKg.toFixed(1)} kg &times; {formatRupiah(hargaPanen)} / kg = <strong class="text-emerald-600">{formatRupiah(jumlahZakatPertanianRupiah)}</strong></p>
            {/if}
          {:else}
            <p class="text-slate-400 italic">• Tidak ada kewajiban zakat hasil pertanian karena total hasil panen di bawah batas minimum (nisab).</p>
          {/if}
        </div>

        <div
          class="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-center mt-2 space-y-2"
        >
          {#if wajibZakatPertanian}
            <div>
              <p
                class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1"
              >
                Zakat Hasil Panen (dalam kg)
              </p>
              <h2 class="text-2xl font-black text-emerald-600 tracking-tight">
                {jumlahZakatPertanianKg.toFixed(1)} kg
                <span class="text-sm font-bold text-slate-500">Hasil Panen</span
                >
              </h2>
            </div>
            <div class="pt-2 border-t border-slate-200/50">
              <p
                class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1"
              >
                Atau Jika Diuangkan
              </p>
              <h2 class="text-2xl font-black text-emerald-600 tracking-tight">
                {formatRupiah(jumlahZakatPertanianRupiah)}
              </h2>
              <p
                class="text-[10px] text-emerald-600 font-extrabold mt-1 tracking-wide leading-none capitalize"
              >
                🗣️ Terbilang: {terbilang(jumlahZakatPertanianRupiah)}
              </p>
            </div>
          {:else}
            <p
              class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none"
            >
              Rekomendasi Sedekah / Infaq
            </p>
            <h2 class="text-2xl font-black text-primary tracking-tight">
              Rp 0
            </h2>
            <p
              class="text-[10px] text-slate-400 font-medium max-w-[280px] mx-auto leading-normal pt-1"
            >
              Hasil panen Anda ({hasilPanen || 0} kg) masih di bawah batas nishab
              (653 kg beras).
            </p>
          {/if}
        </div>
      </Card>
    </div>
  {/if}

  <!-- ==================== TAB: ZAKAT PERNIAGAAN ==================== -->
  {#if activeTab === "perniagaan"}
    <div in:fade={{ duration: 150 }} class="space-y-5">
      <!-- Input Card -->
      <Card class="p-5 space-y-4 shadow-soft-sm">
        <div
          class="flex items-center justify-between border-b border-slate-100 pb-2"
        >
          <h3
            class="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5"
          >
            <Wallet class="h-4.5 w-4.5 text-primary" />
            <span>Isi Aset Perniagaan (Usaha Dagang)</span>
          </h3>
          <button
            type="button"
            on:click={() => (showPerniagaanInfo = !showPerniagaanInfo)}
            class="p-1 hover:bg-slate-100 text-slate-400 hover:text-primary rounded-lg transition-colors cursor-pointer"
            title="Penjelasan Zakat Perdagangan"
          >
            <HelpCircle class="h-4.5 w-4.5" />
          </button>
        </div>

        {#if showPerniagaanInfo}
          <div
            in:slide={{ duration: 200 }}
            out:slide={{ duration: 150 }}
            class="bg-emerald-50/40 border border-emerald-100/50 rounded-xl p-3.5 text-xs text-slate-650 space-y-3 leading-relaxed text-justify"
          >
            <div>
              <h4
                class="font-bold text-slate-800 uppercase text-[10px] mb-1 tracking-wider"
              >
                Syarat & Ketentuan Utama
              </h4>
              <ul class="list-disc pl-4.5 space-y-1">
                <li>
                  <strong>Nisab (Batas Minimum):</strong> Setara dengan nilai
                  <strong>85 gram Emas</strong>.
                </li>
                <li>
                  <strong>Kadar Zakat:</strong> 2,5% dari total harta bersih usaha.
                </li>
                <li>
                  <strong>Haul (Waktu):</strong> Usaha perdagangan telah berjalan
                  selama 1 tahun.
                </li>
              </ul>
            </div>
            <div class="border-t border-emerald-100/30 pt-2.5">
              <h4
                class="font-bold text-slate-800 uppercase text-[10px] mb-1 tracking-wider"
              >
                Cara Menghitung (3 Langkah Mudah)
              </h4>
              <ul class="list-decimal pl-4.5 space-y-1">
                <li>
                  <strong>Hitung Total Aset Usaha:</strong> Jumlahkan modal usaha
                  (nilai barang dagangan/stok/bahan baku), keuntungan bersih, dan
                  piutang lancar (yang pasti terbayar).
                </li>
                <li>
                  <strong>Kurangi Hutang Usaha:</strong> Kurangkan total aset dengan
                  hutang jangka pendek (hutang jatuh tempo terkait operasional usaha)
                  untuk mendapatkan Harta Bersih Usaha.
                </li>
                <li>
                  <strong>Hitung Zakatnya:</strong> Jika Harta Bersih Usaha mencapai
                  nisab (85 gram emas), kalikan harta bersih tersebut dengan 2,5%.
                </li>
              </ul>
            </div>
            <div class="border-t border-emerald-100/30 pt-2.5">
              <span
                class="font-bold text-slate-800 uppercase text-[10px] block mb-1 tracking-wider"
                >Rumus:</span
              >
              <div
                class="bg-white border border-emerald-100 rounded-xl p-2.5 text-center font-black text-emerald-700 font-mono text-[10px] sm:text-xs"
              >
                Zakat Perdagangan = (Modal Usaha + Keuntungan + Piutang -
                Hutang) &times; 2,5%
              </div>
            </div>
          </div>
        {/if}

        <!-- Modal Usaha -->
        <div class="space-y-1.5">
          <label for="modalUsaha" class="text-xs font-bold text-slate-600"
            >Modal Usaha / Stok Barang / Bahan Baku / Aset Lancar (Rupiah)</label
          >
          <div class="relative">
            <span
              class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400"
              >Rp</span
            >
            <input
              id="modalUsaha"
              type="text"
              value={modalUsahaDisp}
              on:input={(e) =>
                handleNumericInput(e, (v) => {
                  modalUsaha = v;
                  modalUsahaDisp = v ? v.toLocaleString("id-ID") : "";
                })}
              placeholder="0"
              class="pl-10 pr-4 h-11 w-full bg-slate-50/50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
            />
          </div>
          {#if modalUsaha > 0}
            <p
              in:slide={{ duration: 150 }}
              class="text-[10px] text-emerald-600 font-extrabold mt-1 tracking-wide leading-none capitalize"
            >
              🗣️ Terbilang: {terbilang(modalUsaha)}
            </p>
          {/if}
        </div>

        <!-- Keuntungan -->
        <div class="space-y-1.5">
          <label for="keuntunganUsaha" class="text-xs font-bold text-slate-600"
            >Keuntungan Bersih Usaha (Rupiah)</label
          >
          <div class="relative">
            <span
              class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400"
              >Rp</span
            >
            <input
              id="keuntunganUsaha"
              type="text"
              value={keuntunganUsahaDisp}
              on:input={(e) =>
                handleNumericInput(e, (v) => {
                  keuntunganUsaha = v;
                  keuntunganUsahaDisp = v ? v.toLocaleString("id-ID") : "";
                })}
              placeholder="0"
              class="pl-10 pr-4 h-11 w-full bg-slate-50/50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
            />
          </div>
          {#if keuntunganUsaha > 0}
            <p
              in:slide={{ duration: 150 }}
              class="text-[10px] text-emerald-600 font-extrabold mt-1 tracking-wide leading-none capitalize"
            >
              🗣️ Terbilang: {terbilang(keuntunganUsaha)}
            </p>
          {/if}
        </div>

        <!-- Piutang Dagang -->
        <div class="space-y-1.5">
          <label for="piutangDagang" class="text-xs font-bold text-slate-600"
            >Piutang Lancar Usaha / Tagihan yang Pasti Terbayar (Rupiah)</label
          >
          <div class="relative">
            <span
              class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400"
              >Rp</span
            >
            <input
              id="piutangDagang"
              type="text"
              value={piutangDagangDisp}
              on:input={(e) =>
                handleNumericInput(e, (v) => {
                  piutangDagang = v;
                  piutangDagangDisp = v ? v.toLocaleString("id-ID") : "";
                })}
              placeholder="0"
              class="pl-10 pr-4 h-11 w-full bg-slate-50/50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
            />
          </div>
          {#if piutangDagang > 0}
            <p
              in:slide={{ duration: 150 }}
              class="text-[10px] text-emerald-600 font-extrabold mt-1 tracking-wide leading-none capitalize"
            >
              🗣️ Terbilang: {terbilang(piutangDagang)}
            </p>
          {/if}
        </div>

        <!-- Hutang Dagang -->
        <div class="space-y-1.5">
          <label for="hutangDagang" class="text-xs font-bold text-slate-600"
            >Hutang Dagang / Hutang Jatuh Tempo Terkait Usaha (Rupiah)</label
          >
          <div class="relative">
            <span
              class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400"
              >Rp</span
            >
            <input
              id="hutangDagang"
              type="text"
              value={hutangDagangDisp}
              on:input={(e) =>
                handleNumericInput(e, (v) => {
                  hutangDagang = v;
                  hutangDagangDisp = v ? v.toLocaleString("id-ID") : "";
                })}
              placeholder="0"
              class="pl-10 pr-4 h-11 w-full bg-slate-50/50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
            />
          </div>
          {#if hutangDagang > 0}
            <p
              in:slide={{ duration: 150 }}
              class="text-[10px] text-emerald-600 font-extrabold mt-1 tracking-wide leading-none capitalize"
            >
              🗣️ Terbilang: {terbilang(hutangDagang)}
            </p>
          {/if}
        </div>
      </Card>

      <!-- Output Card -->
      <Card
        class="p-5 space-y-4 border-slate-200 shadow-soft-sm relative overflow-hidden"
      >
        {#if wajibZakatPerniagaan}
          <div class="absolute inset-x-0 top-0 h-1.5 bg-emerald-500"></div>
        {:else}
          <div class="absolute inset-x-0 top-0 h-1.5 bg-slate-300"></div>
        {/if}

        <h3
          class="text-xs font-black text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between"
        >
          <span>Hasil Perhitungan Zakat Perdagangan</span>
          {#if wajibZakatPerniagaan}
            <span
              class="bg-emerald-500 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider"
              >Wajib Zakat</span
            >
          {:else}
            <span
              class="bg-slate-200 text-slate-500 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider"
              >Belum Wajib Zakat</span
            >
          {/if}
        </h3>

        <div class="divide-y divide-slate-100 text-xs">
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium"
              >Total Aset Lancar Usaha</span
            >
            <span class="font-bold text-slate-700"
              >{formatRupiah(totalAsetUsaha)}</span
            >
          </div>
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium">Hutang Jangka Pendek</span>
            <span class="font-bold text-slate-700"
              >- {formatRupiah(hutangDagang)}</span
            >
          </div>
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-550 font-bold"
              >Harta Perdagangan Wajib Zakat</span
            >
            <span class="font-black text-slate-800"
              >{formatRupiah(hartaPerniagaanKenaZakat)}</span
            >
          </div>
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium"
              >Nisab Perdagangan (85 gram Emas)</span
            >
            <span class="font-bold text-slate-700"
              >{formatRupiah(nisabPerniagaan)}</span
            >
          </div>
        </div>

        <!-- Detail Perhitungan -->
        <div class="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1.5 bg-slate-50/50 p-3 rounded-xl text-left">
          <p class="font-bold text-slate-700 uppercase tracking-wider text-[9px] mb-1.5">🔬 Detail Perhitungan:</p>
          <p>• <strong>Total Aset Usaha:</strong> Modal Usaha ({formatRupiah(modalUsaha || 0)}) + Keuntungan ({formatRupiah(keuntunganUsaha || 0)}) + Piutang ({formatRupiah(piutangDagang || 0)}) = {formatRupiah(totalAsetUsaha)}</p>
          <p>• <strong>Hutang Dagang/Usaha:</strong> - {formatRupiah(hutangDagang || 0)}</p>
          <p>• <strong>Harta Bersih Perdagangan:</strong> {formatRupiah(totalAsetUsaha)} - {formatRupiah(hutangDagang || 0)} = <strong>{formatRupiah(hartaPerniagaanKenaZakat)}</strong></p>
          <p>• <strong>Batas Nisab (85g Emas):</strong> {formatRupiah(nisabPerniagaan)}</p>
          <p>• <strong>Status:</strong> {#if wajibZakatPerniagaan}<span class="text-emerald-600 font-bold">Mencapai Nisab (Wajib Zakat 2.5%)</span>{:else}<span class="text-slate-500 font-bold">Belum Mencapai Nisab</span>{/if}</p>
          {#if wajibZakatPerniagaan}
            <p>• <strong>Kadar Zakat:</strong> {formatRupiah(hartaPerniagaanKenaZakat)} &times; 2.5% = <strong class="text-emerald-600">{formatRupiah(jumlahZakatPerniagaan)}</strong></p>
          {:else}
            <p>• <strong>Rekomendasi Sedekah:</strong> {formatRupiah(hartaPerniagaanKenaZakat)} &times; 2.5% = <strong class="text-primary">{formatRupiah(sedekahRekomendasiPerniagaan)}</strong></p>
          {/if}
        </div>

        <div
          class="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-center mt-2 space-y-1.5"
        >
          {#if wajibZakatPerniagaan}
            <p
              class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none"
            >
              Zakat yang Wajib Dikeluarkan (2.5%)
            </p>
            <h2 class="text-3xl font-black text-emerald-600 tracking-tight">
              {formatRupiah(jumlahZakatPerniagaan)}
            </h2>
            <p
              class="text-[10px] text-emerald-600 font-extrabold mt-1 tracking-wide leading-none capitalize"
            >
              🗣️ Terbilang: {terbilang(jumlahZakatPerniagaan)}
            </p>
          {:else}
            <p
              class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none"
            >
              Rekomendasi Sedekah / Infaq
            </p>
            <h2 class="text-2xl font-black text-primary tracking-tight">
              {formatRupiah(sedekahRekomendasiPerniagaan)}
            </h2>
            {#if sedekahRekomendasiPerniagaan > 0}
              <p
                class="text-[10px] text-primary font-extrabold mt-1 tracking-wide leading-none capitalize"
              >
                🗣️ Terbilang: {terbilang(sedekahRekomendasiPerniagaan)}
              </p>
            {/if}
            <p
              class="text-[10px] text-slate-400 font-medium max-w-[280px] mx-auto leading-normal pt-1"
            >
              Aset bersih perdagangan Anda masih di bawah nishab tahunan. Anda
              disarankan mengeluarkan sedekah sukarela.
            </p>
          {/if}
        </div>
      </Card>
    </div>
  {/if}

  <!-- ==================== TAB: ZAKAT SAHAM ==================== -->
  {#if activeTab === "saham"}
    <div in:fade={{ duration: 150 }} class="space-y-5">
      <!-- Input Card -->
      <Card class="p-5 space-y-4 shadow-soft-sm">
        <div
          class="flex items-center justify-between border-b border-slate-100 pb-2"
        >
          <h3
            class="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5"
          >
            <Wallet class="h-4.5 w-4.5 text-primary" />
            <span>Isi Nilai Portofolio Saham</span>
          </h3>
          <button
            type="button"
            on:click={() => (showSahamInfo = !showSahamInfo)}
            class="p-1 hover:bg-slate-100 text-slate-400 hover:text-primary rounded-lg transition-colors cursor-pointer"
            title="Penjelasan Zakat Saham"
          >
            <HelpCircle class="h-4.5 w-4.5" />
          </button>
        </div>

        {#if showSahamInfo}
          <div
            in:slide={{ duration: 200 }}
            out:slide={{ duration: 150 }}
            class="bg-emerald-50/40 border border-emerald-100/50 rounded-xl p-3.5 text-xs text-slate-650 space-y-3 leading-relaxed text-justify"
          >
            <div>
              <h4
                class="font-bold text-slate-800 uppercase text-[10px] mb-1 tracking-wider"
              >
                Ketentuan Utama
              </h4>
              <ul class="list-disc pl-4.5 space-y-1">
                <li>
                  <strong>Nisab (Batas Minimum):</strong> Nilai bersih portofolio
                  saham setara dengan nilai 85 gram emas.
                </li>
                <li>
                  <strong>Haul (Waktu):</strong> Saham tersebut telah dimiliki secara
                  penuh selama 1 tahun.
                </li>
                <li>
                  <strong>Kadar Zakat:</strong> 2,5% dari total nilai bersih saham
                  (nilai pasar + dividen - hutang margin).
                </li>
              </ul>
            </div>
            <div class="border-t border-emerald-100/30 pt-2.5">
              <h4
                class="font-bold text-slate-800 uppercase text-[10px] mb-1 tracking-wider"
              >
                Cara Menghitung (3 Langkah Mudah)
              </h4>
              <ul class="list-decimal pl-4.5 space-y-1">
                <li>
                  <strong>Hitung Nilai Portofolio:</strong> Tentukan nilai pasar
                  dari portofolio saham Anda saat ini.
                </li>
                <li>
                  <strong>Tambahkan Dividen & Kurangi Hutang:</strong> Jumlahkan
                  dengan dividen tunai yang diterima, lalu kurangkan dengan hutang
                  margin/lancar pembelian saham.
                </li>
                <li>
                  <strong>Hitung Zakatnya:</strong> Jika total nilai bersih mencapai
                  nisab, kalikan dengan 2,5%.
                </li>
              </ul>
            </div>
            <div class="border-t border-emerald-100/30 pt-2.5">
              <span
                class="font-bold text-slate-800 uppercase text-[10px] block mb-1 tracking-wider"
                >Rumus:</span
              >
              <div
                class="bg-white border border-emerald-100 rounded-xl p-2.5 text-center font-black text-emerald-700 font-mono text-xs"
              >
                Zakat Saham = (Nilai Pasar Saham + Dividen - Hutang Margin)
                &times; 2,5%
              </div>
            </div>
            <p
              class="text-[10px] text-slate-400 mt-1 border-t border-emerald-100/30 pt-1.5 italic"
            >
              (Sumber: Keputusan Fatwa MUI, BAZNAS, dan fiqh kontemporer tentang
              zakat investasi keuangan).
            </p>
          </div>
        {/if}

        <!-- Nilai Portofolio Saham -->
        <div class="space-y-1.5">
          <label for="nilaiSaham" class="text-xs font-bold text-slate-600"
            >Nilai Portofolio Saham Saat Ini / Nilai Pasar Saham (Rupiah)</label
          >
          <div class="relative">
            <span
              class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400"
              >Rp</span
            >
            <input
              id="nilaiSaham"
              type="text"
              value={nilaiSahamDisp}
              on:input={(e) =>
                handleNumericInput(e, (v) => {
                  nilaiSaham = v;
                  nilaiSahamDisp = v ? v.toLocaleString("id-ID") : "";
                })}
              placeholder="0"
              class="pl-10 pr-4 h-11 w-full bg-slate-50/50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
            />
          </div>
          {#if nilaiSaham > 0}
            <p
              in:slide={{ duration: 150 }}
              class="text-[10px] text-emerald-600 font-extrabold mt-1 tracking-wide leading-none capitalize"
            >
              🗣️ Terbilang: {terbilang(nilaiSaham)}
            </p>
          {/if}
        </div>

        <!-- Dividen Saham -->
        <div class="space-y-1.5">
          <label for="dividenSaham" class="text-xs font-bold text-slate-600"
            >Dividen yang Diterima (Rupiah)</label
          >
          <div class="relative">
            <span
              class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400"
              >Rp</span
            >
            <input
              id="dividenSaham"
              type="text"
              value={dividenSahamDisp}
              on:input={(e) =>
                handleNumericInput(e, (v) => {
                  dividenSaham = v;
                  dividenSahamDisp = v ? v.toLocaleString("id-ID") : "";
                })}
              placeholder="0"
              class="pl-10 pr-4 h-11 w-full bg-slate-50/50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
            />
          </div>
          {#if dividenSaham > 0}
            <p
              in:slide={{ duration: 150 }}
              class="text-[10px] text-emerald-600 font-extrabold mt-1 tracking-wide leading-none capitalize"
            >
              🗣️ Terbilang: {terbilang(dividenSaham)}
            </p>
          {/if}
        </div>

        <!-- Hutang Lancar Saham -->
        <div class="space-y-1.5">
          <label for="hutangSaham" class="text-xs font-bold text-slate-600"
            >Hutang Lancar untuk Pembelian Saham / Margin Debt (Rupiah)</label
          >
          <div class="relative">
            <span
              class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400"
              >Rp</span
            >
            <input
              id="hutangSaham"
              type="text"
              value={hutangSahamDisp}
              on:input={(e) =>
                handleNumericInput(e, (v) => {
                  hutangSaham = v;
                  hutangSahamDisp = v ? v.toLocaleString("id-ID") : "";
                })}
              placeholder="0"
              class="pl-10 pr-4 h-11 w-full bg-slate-50/50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
            />
          </div>
          {#if hutangSaham > 0}
            <p
              in:slide={{ duration: 150 }}
              class="text-[10px] text-emerald-600 font-extrabold mt-1 tracking-wide leading-none capitalize"
            >
              🗣️ Terbilang: {terbilang(hutangSaham)}
            </p>
          {/if}
        </div>
      </Card>

      <!-- Output Card -->
      <Card
        class="p-5 space-y-4 border-slate-200 shadow-soft-sm relative overflow-hidden"
      >
        {#if wajibZakatSaham}
          <div class="absolute inset-x-0 top-0 h-1.5 bg-emerald-500"></div>
        {:else}
          <div class="absolute inset-x-0 top-0 h-1.5 bg-slate-300"></div>
        {/if}

        <h3
          class="text-xs font-black text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between"
        >
          <span>Hasil Perhitungan Zakat Saham</span>
          {#if wajibZakatSaham}
            <span
              class="bg-emerald-500 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider"
              >Wajib Zakat</span
            >
          {:else}
            <span
              class="bg-slate-200 text-slate-500 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider"
              >Belum Wajib Zakat</span
            >
          {/if}
        </h3>

        <div class="divide-y divide-slate-100 text-xs">
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium"
              >Nilai Portofolio Saham</span
            >
            <span class="font-bold text-slate-700"
              >{formatRupiah(nilaiSaham)}</span
            >
          </div>
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium">Dividen Saham</span>
            <span class="font-bold text-slate-700"
              >+ {formatRupiah(dividenSaham)}</span
            >
          </div>
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium">Hutang Lancar Saham</span>
            <span class="font-bold text-slate-700"
              >- {formatRupiah(hutangSaham)}</span
            >
          </div>
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-505 font-bold">Harta Saham Wajib Zakat</span
            >
            <span class="font-black text-slate-800"
              >{formatRupiah(hartaSahamKenaZakat)}</span
            >
          </div>
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium"
              >Nisab Saham (85 gram Emas)</span
            >
            <span class="font-bold text-slate-700"
              >{formatRupiah(nisabSaham)}</span
            >
          </div>
        </div>

        <!-- Detail Perhitungan -->
        <div class="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1.5 bg-slate-50/50 p-3 rounded-xl text-left">
          <p class="font-bold text-slate-700 uppercase tracking-wider text-[9px] mb-1.5">🔬 Detail Perhitungan:</p>
          <p>• <strong>Nilai Saham:</strong> {formatRupiah(nilaiSaham || 0)}</p>
          <p>• <strong>Dividen Saham:</strong> + {formatRupiah(dividenSaham || 0)}</p>
          <p>• <strong>Hutang Saham:</strong> - {formatRupiah(hutangSaham || 0)}</p>
          <p>• <strong>Harta Saham Kena Zakat:</strong> ({formatRupiah(nilaiSaham || 0)} + {formatRupiah(dividenSaham || 0)}) - {formatRupiah(hutangSaham || 0)} = <strong>{formatRupiah(hartaSahamKenaZakat)}</strong></p>
          <p>• <strong>Batas Nisab (85g Emas):</strong> {formatRupiah(nisabSaham)}</p>
          <p>• <strong>Status:</strong> {#if wajibZakatSaham}<span class="text-emerald-600 font-bold">Mencapai Nisab (Wajib Zakat 2.5%)</span>{:else}<span class="text-slate-500 font-bold">Belum Mencapai Nisab</span>{/if}</p>
          {#if wajibZakatSaham}
            <p>• <strong>Kadar Zakat:</strong> {formatRupiah(hartaSahamKenaZakat)} &times; 2.5% = <strong class="text-emerald-600">{formatRupiah(jumlahZakatSaham)}</strong></p>
          {:else}
            <p>• <strong>Rekomendasi Sedekah:</strong> {formatRupiah(hartaSahamKenaZakat)} &times; 2.5% = <strong class="text-primary">{formatRupiah(sedekahRekomendasiSaham)}</strong></p>
          {/if}
        </div>

        <div
          class="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-center mt-2 space-y-1.5"
        >
          {#if wajibZakatSaham}
            <p
              class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none"
            >
              Zakat yang Wajib Dikeluarkan (2.5%)
            </p>
            <h2 class="text-3xl font-black text-emerald-600 tracking-tight">
              {formatRupiah(jumlahZakatSaham)}
            </h2>
            <p
              class="text-[10px] text-emerald-600 font-extrabold mt-1 tracking-wide leading-none capitalize"
            >
              🗣️ Terbilang: {terbilang(jumlahZakatSaham)}
            </p>
          {:else}
            <p
              class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none"
            >
              Rekomendasi Sedekah / Infaq
            </p>
            <h2 class="text-2xl font-black text-primary tracking-tight">
              {formatRupiah(sedekahRekomendasiSaham)}
            </h2>
            {#if sedekahRekomendasiSaham > 0}
              <p
                class="text-[10px] text-primary font-extrabold mt-1 tracking-wide leading-none capitalize"
              >
                🗣️ Terbilang: {terbilang(sedekahRekomendasiSaham)}
              </p>
            {/if}
            <p
              class="text-[10px] text-slate-400 font-medium max-w-[280px] mx-auto leading-normal pt-1"
            >
              Aset saham bersih Anda masih di bawah nishab tahunan. Anda
              disarankan mengeluarkan sedekah sukarela.
            </p>
          {/if}
        </div>
      </Card>
    </div>
  {/if}

  <!-- ==================== TAB: ZAKAT REKSADANA ==================== -->
  {#if activeTab === "reksadana"}
    <div in:fade={{ duration: 150 }} class="space-y-5">
      <!-- Input Card -->
      <Card class="p-5 space-y-4 shadow-soft-sm">
        <div
          class="flex items-center justify-between border-b border-slate-100 pb-2"
        >
          <h3
            class="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5"
          >
            <Wallet class="h-4.5 w-4.5 text-primary" />
            <span>Isi Nilai Reksa Dana</span>
          </h3>
          <button
            type="button"
            on:click={() => (showReksadanaInfo = !showReksadanaInfo)}
            class="p-1 hover:bg-slate-100 text-slate-400 hover:text-primary rounded-lg transition-colors cursor-pointer"
            title="Penjelasan Zakat Reksa Dana"
          >
            <HelpCircle class="h-4.5 w-4.5" />
          </button>
        </div>

        {#if showReksadanaInfo}
          <div
            in:slide={{ duration: 200 }}
            out:slide={{ duration: 150 }}
            class="bg-emerald-50/40 border border-emerald-100/50 rounded-xl p-3.5 text-xs text-slate-650 space-y-3 leading-relaxed text-justify"
          >
            <div>
              <h4
                class="font-bold text-slate-800 uppercase text-[10px] mb-1 tracking-wider"
              >
                Ketentuan Utama
              </h4>
              <ul class="list-disc pl-4.5 space-y-1">
                <li>
                  <strong>Nisab (Batas Minimum):</strong> Nilai investasi reksa dana
                  setara dengan nilai 85 gram emas.
                </li>
                <li>
                  <strong>Haul (Waktu):</strong> Kepemilikan investasi reksa dana
                  telah berjalan selama 1 tahun.
                </li>
                <li>
                  <strong>Kadar Zakat:</strong> 2,5% dari total nilai pasar reksa
                  dana saat mencapai haul.
                </li>
              </ul>
            </div>
            <div class="border-t border-emerald-100/30 pt-2.5">
              <h4
                class="font-bold text-slate-800 uppercase text-[10px] mb-1 tracking-wider"
              >
                Cara Menghitung (2 Langkah Mudah)
              </h4>
              <ul class="list-decimal pl-4.5 space-y-1">
                <li>
                  <strong>Tentukan Nilai Investasi:</strong> Masukkan total nilai
                  pasar dari portofolio investasi Reksa Dana Anda saat ini.
                </li>
                <li>
                  <strong>Hitung Zakatnya:</strong> Jika total nilai tersebut mencapai
                  nisab, kalikan nilai tersebut dengan 2,5%.
                </li>
              </ul>
            </div>
            <div class="border-t border-emerald-100/30 pt-2.5">
              <span
                class="font-bold text-slate-800 uppercase text-[10px] block mb-1 tracking-wider"
                >Rumus:</span
              >
              <div
                class="bg-white border border-emerald-100 rounded-xl p-2.5 text-center font-black text-emerald-700 font-mono text-xs"
              >
                Zakat Reksa Dana = Nilai Reksadana &times; 2,5%
              </div>
            </div>
            <p
              class="text-[10px] text-slate-400 mt-1 border-t border-emerald-100/30 pt-1.5 italic"
            >
              (Sumber: Fatwa MUI & BAZNAS tentang zakat aset keuangan /
              investasi reksa dana).
            </p>
          </div>
        {/if}

        <!-- Nilai Investasi Reksadana -->
        <div class="space-y-1.5">
          <label for="nilaiReksadana" class="text-xs font-bold text-slate-600"
            >Nilai Investasi Reksadana Saat Ini (Rupiah)</label
          >
          <div class="relative">
            <span
              class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400"
              >Rp</span
            >
            <input
              id="nilaiReksadana"
              type="text"
              value={nilaiReksadanaDisp}
              on:input={(e) =>
                handleNumericInput(e, (v) => {
                  nilaiReksadana = v;
                  nilaiReksadanaDisp = v ? v.toLocaleString("id-ID") : "";
                })}
              placeholder="0"
              class="pl-10 pr-4 h-11 w-full bg-slate-50/50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
            />
          </div>
          {#if nilaiReksadana > 0}
            <p
              in:slide={{ duration: 150 }}
              class="text-[10px] text-emerald-600 font-extrabold mt-1 tracking-wide leading-none capitalize"
            >
              🗣️ Terbilang: {terbilang(nilaiReksadana)}
            </p>
          {/if}
        </div>
      </Card>

      <!-- Output Card -->
      <Card
        class="p-5 space-y-4 border-slate-200 shadow-soft-sm relative overflow-hidden"
      >
        {#if wajibZakatReksadana}
          <div class="absolute inset-x-0 top-0 h-1.5 bg-emerald-500"></div>
        {:else}
          <div class="absolute inset-x-0 top-0 h-1.5 bg-slate-300"></div>
        {/if}

        <h3
          class="text-xs font-black text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between"
        >
          <span>Hasil Perhitungan Zakat Reksa Dana</span>
          {#if wajibZakatReksadana}
            <span
              class="bg-emerald-500 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider"
              >Wajib Zakat</span
            >
          {:else}
            <span
              class="bg-slate-200 text-slate-500 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider"
              >Belum Wajib Zakat</span
            >
          {/if}
        </h3>

        <div class="divide-y divide-slate-100 text-xs">
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium"
              >Nilai Investasi Reksa Dana</span
            >
            <span class="font-bold text-slate-700"
              >{formatRupiah(nilaiReksadana)}</span
            >
          </div>
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium"
              >Nisab Reksa Dana (85 gram Emas)</span
            >
            <span class="font-bold text-slate-700"
              >{formatRupiah(nisabReksadana)}</span
            >
          </div>
        </div>

        <!-- Detail Perhitungan -->
        <div class="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1.5 bg-slate-50/50 p-3 rounded-xl text-left">
          <p class="font-bold text-slate-700 uppercase tracking-wider text-[9px] mb-1.5">🔬 Detail Perhitungan:</p>
          <p>• <strong>Nilai Reksadana:</strong> <strong>{formatRupiah(nilaiReksadana || 0)}</strong></p>
          <p>• <strong>Batas Nisab (85g Emas):</strong> {formatRupiah(nisabReksadana)}</p>
          <p>• <strong>Status:</strong> {#if wajibZakatReksadana}<span class="text-emerald-600 font-bold">Mencapai Nisab (Wajib Zakat 2.5%)</span>{:else}<span class="text-slate-500 font-bold">Belum Mencapai Nisab</span>{/if}</p>
          {#if wajibZakatReksadana}
            <p>• <strong>Kadar Zakat:</strong> {formatRupiah(nilaiReksadana || 0)} &times; 2.5% = <strong class="text-emerald-600">{formatRupiah(jumlahZakatReksadana)}</strong></p>
          {:else}
            <p>• <strong>Rekomendasi Sedekah:</strong> {formatRupiah(nilaiReksadana || 0)} &times; 2.5% = <strong class="text-primary">{formatRupiah(sedekahRekomendasiReksadana)}</strong></p>
          {/if}
        </div>

        <div
          class="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-center mt-2 space-y-1.5"
        >
          {#if wajibZakatReksadana}
            <p
              class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none"
            >
              Zakat yang Wajib Dikeluarkan (2.5%)
            </p>
            <h2 class="text-3xl font-black text-emerald-600 tracking-tight">
              {formatRupiah(jumlahZakatReksadana)}
            </h2>
            <p
              class="text-[10px] text-emerald-600 font-extrabold mt-1 tracking-wide leading-none capitalize"
            >
              🗣️ Terbilang: {terbilang(jumlahZakatReksadana)}
            </p>
          {:else}
            <p
              class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none"
            >
              Rekomendasi Sedekah / Infaq
            </p>
            <h2 class="text-2xl font-black text-primary tracking-tight">
              {formatRupiah(sedekahRekomendasiReksadana)}
            </h2>
            {#if sedekahRekomendasiReksadana > 0}
              <p
                class="text-[10px] text-primary font-extrabold mt-1 tracking-wide leading-none capitalize"
              >
                🗣️ Terbilang: {terbilang(sedekahRekomendasiReksadana)}
              </p>
            {/if}
            <p
              class="text-[10px] text-slate-400 font-medium max-w-[280px] mx-auto leading-normal pt-1"
            >
              Aset reksa dana Anda masih di bawah nishab tahunan. Anda
              disarankan mengeluarkan sedekah sukarela.
            </p>
          {/if}
        </div>
      </Card>
    </div>
  {/if}

  <!-- ==================== TAB: ZAKAT PETERNAKAN ==================== -->
  {#if activeTab === "peternakan"}
    <div in:fade={{ duration: 150 }} class="space-y-5">
      <!-- Input Card -->
      <Card class="p-5 space-y-4 shadow-soft-sm">
        <div
          class="flex items-center justify-between border-b border-slate-100 pb-2"
        >
          <h3
            class="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5"
          >
            <Wallet class="h-4.5 w-4.5 text-primary" />
            <span>Isi Data Hewan Ternak</span>
          </h3>
          <button
            type="button"
            on:click={() => (showPeternakanInfo = !showPeternakanInfo)}
            class="p-1 hover:bg-slate-100 text-slate-400 hover:text-primary rounded-lg transition-colors cursor-pointer"
            title="Penjelasan Zakat Peternakan"
          >
            <HelpCircle class="h-4.5 w-4.5" />
          </button>
        </div>

        {#if showPeternakanInfo}
          <div
            in:slide={{ duration: 200 }}
            out:slide={{ duration: 150 }}
            class="bg-emerald-50/40 border border-emerald-100/50 rounded-xl p-3.5 text-xs text-slate-650 space-y-3 leading-relaxed text-justify"
          >
            <div>
              <h4
                class="font-bold text-slate-800 uppercase text-[10px] mb-1 tracking-wider"
              >
                Ketentuan Utama
              </h4>
              <ul class="list-disc pl-4.5 space-y-1">
                <li><strong>Nisab Kambing/Domba:</strong> minimal 40 ekor.</li>
                <li><strong>Nisab Sapi/Kerbau:</strong> minimal 30 ekor.</li>
                <li>
                  <strong>Haul (Waktu):</strong> Telah dimiliki secara penuh selama
                  1 tahun.
                </li>
                <li>
                  <strong>Syarat Ternak:</strong> Digembalakan di tempat rumput bebas
                  (Saimah) dan tidak diperkerjakan untuk membajak sawah/alat angkut.
                </li>
              </ul>
            </div>
            <div class="border-t border-emerald-100/30 pt-2.5">
              <h4
                class="font-bold text-slate-800 uppercase text-[10px] mb-1 tracking-wider"
              >
                Cara Menghitung (Hadis Riwayat Bukhari)
              </h4>
              <ul class="list-disc pl-4.5 space-y-1">
                <li>
                  <strong>Kambing/Domba:</strong>
                  <ul class="list-circle pl-4 space-y-0.5 mt-0.5 text-[11px]">
                    <li>40 - 120 ekor = 1 kambing (1 thn/2 thn)</li>
                    <li>121 - 200 ekor = 2 kambing</li>
                    <li>201 - 300 ekor = 3 kambing</li>
                    <li>
                      &gt; 300 ekor = setiap kelipatan 100 bertambah 1 kambing
                    </li>
                  </ul>
                </li>
                <li class="mt-1">
                  <strong>Sapi/Kerbau:</strong>
                  <ul class="list-circle pl-4 space-y-0.5 mt-0.5 text-[11px]">
                    <li>
                      30 - 39 ekor = 1 tabi' (sapi jantan/betina umur 1 thn)
                    </li>
                    <li>40 - 59 ekor = 1 musinnah (sapi betina umur 2 thn)</li>
                    <li>60 - 69 ekor = 2 tabi'</li>
                    <li>70 - 79 ekor = 1 tabi' &amp; 1 musinnah</li>
                    <li>80 - 89 ekor = 2 musinnah</li>
                    <li>
                      &gt;= 120 ekor = setiap 30 ekor tambah 1 tabi', setiap 40
                      ekor tambah 1 musinnah
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
            <p
              class="text-[10px] text-slate-400 mt-1 border-t border-emerald-100/30 pt-1.5 italic"
            >
              (Sumber: Hadis Riwayat Bukhari nomor 1454, Peraturan Menteri Agama
              RI Nomor 52 Tahun 2014, dan BAZNAS).
            </p>
          </div>
        {/if}

        <!-- Jenis Ternak Selector -->
        <div class="space-y-1.5">
          <span class="text-xs font-bold text-slate-600 block"
            >Jenis Hewan Ternak (dengan Batas Nisab)</span
          >
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              on:click={() => {
                jenisTernak = "kambing";
              }}
              class="py-2.5 px-2 text-[10px] sm:text-xs font-bold rounded-xl border transition-all duration-200 focus:outline-none flex flex-col items-center justify-center gap-1
                     {jenisTernak === 'kambing'
                ? 'bg-primary text-white border-primary shadow-soft-sm'
                : 'bg-slate-50 text-slate-650 border-slate-200 hover:bg-slate-100'}"
            >
              <span>🐐 Kambing</span>
              <span class="text-[9px] font-medium opacity-80">(Nisab: 40)</span>
            </button>
            <button
              type="button"
              on:click={() => {
                jenisTernak = "domba";
              }}
              class="py-2.5 px-2 text-[10px] sm:text-xs font-bold rounded-xl border transition-all duration-200 focus:outline-none flex flex-col items-center justify-center gap-1
                     {jenisTernak === 'domba'
                ? 'bg-primary text-white border-primary shadow-soft-sm'
                : 'bg-slate-50 text-slate-650 border-slate-200 hover:bg-slate-100'}"
            >
              <span>🐑 Domba</span>
              <span class="text-[9px] font-medium opacity-80">(Nisab: 40)</span>
            </button>
            <button
              type="button"
              on:click={() => {
                jenisTernak = "sapi";
              }}
              class="py-2.5 px-2 text-[10px] sm:text-xs font-bold rounded-xl border transition-all duration-200 focus:outline-none flex flex-col items-center justify-center gap-1
                     {jenisTernak === 'sapi'
                ? 'bg-primary text-white border-primary shadow-soft-sm'
                : 'bg-slate-50 text-slate-650 border-slate-200 hover:bg-slate-100'}"
            >
              <span>🐂 Sapi</span>
              <span class="text-[9px] font-medium opacity-80">(Nisab: 30)</span>
            </button>
            <button
              type="button"
              on:click={() => {
                jenisTernak = "kerbau";
              }}
              class="py-2.5 px-2 text-[10px] sm:text-xs font-bold rounded-xl border transition-all duration-200 focus:outline-none flex flex-col items-center justify-center gap-1
                     {jenisTernak === 'kerbau'
                ? 'bg-primary text-white border-primary shadow-soft-sm'
                : 'bg-slate-50 text-slate-650 border-slate-200 hover:bg-slate-100'}"
            >
              <span>🐃 Kerbau</span>
              <span class="text-[9px] font-medium opacity-80">(Nisab: 30)</span>
            </button>
          </div>
        </div>

        <!-- Jumlah Ternak -->
        <div class="space-y-1.5">
          <label for="jumlahTernak" class="text-xs font-bold text-slate-600"
            >Jumlah Ternak yang Dimiliki (Ekor)</label
          >
          <div class="relative">
            <input
              id="jumlahTernak"
              type="text"
              value={jumlahTernakDisp}
              on:input={(e) =>
                handleNumericInput(e, (v) => {
                  jumlahTernak = v;
                  jumlahTernakDisp = v ? v.toLocaleString("id-ID") : "";
                })}
              placeholder="0"
              class="pr-12 pl-4 h-11 w-full bg-slate-50/50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
            />
            <span
              class="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400"
              >ekor</span
            >
          </div>
        </div>

        <!-- Harga Rata-rata per Ekor -->
        <div class="space-y-1.5">
          <label for="hargaTernak" class="text-xs font-bold text-slate-600">
            Estimasi Harga Rata-rata per Ekor (Rupiah) - jika diuangkan
          </label>
          <div class="relative">
            <span
              class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400"
              >Rp</span
            >
            <input
              id="hargaTernak"
              type="text"
              value={hargaTernakDisp}
              on:input={(e) =>
                handleNumericInput(e, (v) => {
                  hargaTernak = v;
                  hargaTernakDisp = v ? v.toLocaleString("id-ID") : "";
                })}
              placeholder="3.000.000"
              class="pl-10 pr-4 h-11 w-full bg-slate-50/50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
            />
          </div>
          {#if hargaTernak > 0}
            <p
              in:slide={{ duration: 150 }}
              class="text-[10px] text-emerald-600 font-extrabold mt-1 tracking-wide leading-none capitalize"
            >
              🗣️ Terbilang: {terbilang(hargaTernak)}
            </p>
          {/if}
        </div>
      </Card>

      <!-- Output Card -->
      <Card
        class="p-5 space-y-4 border-slate-200 shadow-soft-sm relative overflow-hidden"
      >
        {#if wajibZakatPeternakan}
          <div class="absolute inset-x-0 top-0 h-1.5 bg-emerald-500"></div>
        {:else}
          <div class="absolute inset-x-0 top-0 h-1.5 bg-slate-300"></div>
        {/if}

        <h3
          class="text-xs font-black text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between"
        >
          <span>Hasil Perhitungan Zakat Peternakan</span>
          {#if wajibZakatPeternakan}
            <span
              class="bg-emerald-500 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider"
              >Wajib Zakat</span
            >
          {:else}
            <span
              class="bg-slate-200 text-slate-500 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider"
              >Belum Wajib Zakat</span
            >
          {/if}
        </h3>

        <div class="divide-y divide-slate-100 text-xs">
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium">Total Ternak</span>
            <span class="font-bold text-slate-700"
              >{jumlahTernak || 0} ekor</span
            >
          </div>
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium">Batas Nisab</span>
            <span class="font-bold text-slate-700"
              >{(jenisTernak === "kambing" || jenisTernak === "domba") ? "40" : "30"} ekor</span
            >
          </div>
          {#if wajibZakatPeternakan}
            <div class="py-2.5 flex justify-between items-center">
              <span class="text-slate-500 font-medium">Zakat Wajib (Hewan)</span>
              <span class="font-bold text-emerald-600"
                >{zakatPeternakanResult.desc}</span
              >
            </div>
          {/if}
        </div>

        <!-- Detail Perhitungan -->
        <div class="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1.5 bg-slate-50/50 p-3 rounded-xl">
          <p class="font-bold text-slate-700 uppercase tracking-wider text-[9px] mb-1.5">🔬 Detail Perhitungan:</p>
          <p>• <strong>Jenis Ternak:</strong> <span class="capitalize">{jenisTernak}</span> (Nisab: {(jenisTernak === "kambing" || jenisTernak === "domba") ? "40" : "30"} ekor)</p>
          <p>• <strong>Jumlah Kepemilikan:</strong> {jumlahTernak || 0} ekor</p>
          <p>• <strong>Status Nisab:</strong> 
            {#if wajibZakatPeternakan}
              <span class="text-emerald-600 font-bold">Mencapai Nisab (Wajib Zakat)</span>
            {:else}
              <span class="text-slate-500 font-bold">Belum Mencapai Nisab</span>
            {/if}
          </p>
          {#if wajibZakatPeternakan}
            <p>• <strong>Kewajiban Zakat:</strong> {zakatPeternakanResult.desc}</p>
            <p>• <strong>Rincian Jika Diuangkan:</strong> {zakatPeternakanResult.count} ekor zakat &times; {formatRupiah(hargaTernak)} / ekor = <strong class="text-emerald-600">{formatRupiah(jumlahZakatPeternakanRupiah)}</strong></p>
          {:else}
            <p class="text-slate-400 italic">• Tidak ada kewajiban zakat ternak karena jumlah di bawah batas minimum (nisab).</p>
          {/if}
        </div>

        <div
          class="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-center mt-2 space-y-1.5"
        >
          {#if wajibZakatPeternakan}
            <p
              class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none"
            >
              Estimasi Nilai Zakat (Dalam Rupiah)
            </p>
            <h2 class="text-3xl font-black text-emerald-600 tracking-tight">
              {formatRupiah(jumlahZakatPeternakanRupiah)}
            </h2>
            <p
              class="text-[10px] text-emerald-600 font-extrabold mt-1 tracking-wide leading-none capitalize"
            >
              🗣️ Terbilang: {terbilang(jumlahZakatPeternakanRupiah)}
            </p>
          {:else}
            <p
              class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none"
            >
              Rekomendasi Infaq / Sedekah
            </p>
            <h2 class="text-2xl font-black text-primary tracking-tight">
              Rp 0
            </h2>
            <p
              class="text-[10px] text-slate-400 font-medium max-w-[280px] mx-auto leading-normal pt-1"
            >
              Jumlah ternak Anda ({jumlahTernak || 0} ekor) belum mencapai nisab
              minimum ({jenisTernak === "kambing" ? "40" : "30"} ekor).
            </p>
          {/if}
        </div>
      </Card>
    </div>
  {/if}

  <!-- ==================== TAB: ZAKAT TAMBAK ==================== -->
  {#if activeTab === "tambak"}
    <div in:fade={{ duration: 150 }} class="space-y-5">
      <!-- Input Card -->
      <Card class="p-5 space-y-4 shadow-soft-sm">
        <div
          class="flex items-center justify-between border-b border-slate-100 pb-2"
        >
          <h3
            class="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5"
          >
            <Wallet class="h-4.5 w-4.5 text-primary" />
            <span>Isi Data Aset Tambak (Perikanan)</span>
          </h3>
          <button
            type="button"
            on:click={() => (showTambakInfo = !showTambakInfo)}
            class="p-1 hover:bg-slate-100 text-slate-400 hover:text-primary rounded-lg transition-colors cursor-pointer"
            title="Penjelasan Zakat Tambak"
          >
            <HelpCircle class="h-4.5 w-4.5" />
          </button>
        </div>

        {#if showTambakInfo}
          <div
            in:slide={{ duration: 200 }}
            out:slide={{ duration: 150 }}
            class="bg-emerald-50/40 border border-emerald-100/50 rounded-xl p-3.5 text-xs text-slate-655 space-y-3 leading-relaxed text-justify"
          >
            <div>
              <h4
                class="font-bold text-slate-800 uppercase text-[10px] mb-1 tracking-wider"
              >
                Ketentuan Utama
              </h4>
              <ul class="list-disc pl-4.5 space-y-1">
                <li>
                  <strong>Nisab (Batas Minimum):</strong> Nilai keuntungan bersih
                  tambak setara 85 gram emas per tahun.
                </li>
                <li>
                  <strong>Haul (Waktu):</strong> Diambil pada akhir tahun buku/panen
                  tahunan.
                </li>
                <li>
                  <strong>Kadar Zakat:</strong> 2,5% dari keuntungan bersih.
                </li>
              </ul>
            </div>
            <div class="border-t border-emerald-100/30 pt-2.5">
              <h4
                class="font-bold text-slate-800 uppercase text-[10px] mb-1 tracking-wider"
              >
                Cara Menghitung (3 Langkah Mudah)
              </h4>
              <ul class="list-decimal pl-4.5 space-y-1">
                <li>
                  <strong>Hitung Pendapatan Tambak:</strong> Jumlahkan total penjualan
                  hasil panen perikanan/tambak ditambah uang kas usaha yang mengendap.
                </li>
                <li>
                  <strong>Kurangi Pengeluaran:</strong> Kurangkan dengan biaya operasional
                  tambak (pakan, bibit, upah, perawatan) dan hutang jatuh tempo.
                </li>
                <li>
                  <strong>Hitung Zakatnya:</strong> Jika hasil bersih mencapai nisab
                  85g emas, kalikan dengan 2,5%.
                </li>
              </ul>
            </div>
            <div class="border-t border-emerald-100/30 pt-2.5">
              <span
                class="font-bold text-slate-800 uppercase text-[10px] block mb-1 tracking-wider"
                >Rumus:</span
              >
              <div
                class="bg-white border border-emerald-100 rounded-xl p-2.5 text-center font-black text-emerald-700 font-mono text-xs"
              >
                Zakat Tambak = (Hasil Panen + Kas - Biaya Operasional - Hutang)
                &times; 2,5%
              </div>
            </div>
            <p
              class="text-[10px] text-slate-400 mt-1 border-t border-emerald-100/30 pt-1.5 italic"
            >
              (Sumber: Fiqh Zakat Yusuf Qardawi, Keputusan BAZNAS tentang zakat
              sektor perikanan budidaya/tambak).
            </p>
          </div>
        {/if}

        <!-- Hasil Panen Tambak -->
        <div class="space-y-1.5">
          <label for="hasilPanenTambak" class="text-xs font-bold text-slate-600"
            >Total Penjualan Hasil Keuntungan Panen Tambak (Rupiah)</label
          >
          <div class="relative">
            <span
              class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400"
              >Rp</span
            >
            <input
              id="hasilPanenTambak"
              type="text"
              value={hasilPanenTambakDisp}
              on:input={(e) =>
                handleNumericInput(e, (v) => {
                  hasilPanenTambak = v;
                  hasilPanenTambakDisp = v ? v.toLocaleString("id-ID") : "";
                })}
              placeholder="0"
              class="pl-10 pr-4 h-11 w-full bg-slate-50/50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
            />
          </div>
          {#if hasilPanenTambak > 0}
            <p
              in:slide={{ duration: 150 }}
              class="text-[10px] text-emerald-600 font-extrabold mt-1 tracking-wide leading-none capitalize"
            >
              🗣️ Terbilang: {terbilang(hasilPanenTambak)}
            </p>
          {/if}
        </div>

        <!-- Uang Kas Tambak -->
        <div class="space-y-1.5">
          <label for="kasTambak" class="text-xs font-bold text-slate-600"
            >Uang Kas Tambak / Saldo Bank Usaha Tambak (Rupiah)</label
          >
          <div class="relative">
            <span
              class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400"
              >Rp</span
            >
            <input
              id="kasTambak"
              type="text"
              value={kasTambakDisp}
              on:input={(e) =>
                handleNumericInput(e, (v) => {
                  kasTambak = v;
                  kasTambakDisp = v ? v.toLocaleString("id-ID") : "";
                })}
              placeholder="0"
              class="pl-10 pr-4 h-11 w-full bg-slate-50/50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
            />
          </div>
          {#if kasTambak > 0}
            <p
              in:slide={{ duration: 150 }}
              class="text-[10px] text-emerald-600 font-extrabold mt-1 tracking-wide leading-none capitalize"
            >
              🗣️ Terbilang: {terbilang(kasTambak)}
            </p>
          {/if}
        </div>

        <!-- Biaya Tambak -->
        <div class="space-y-1.5">
          <label for="biayaTambak" class="text-xs font-bold text-slate-600"
            >Biaya Operasional (Pakan, Bibit, Perawatan, Upah) (Rupiah)</label
          >
          <div class="relative">
            <span
              class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400"
              >Rp</span
            >
            <input
              id="biayaTambak"
              type="text"
              value={biayaTambakDisp}
              on:input={(e) =>
                handleNumericInput(e, (v) => {
                  biayaTambak = v;
                  biayaTambakDisp = v ? v.toLocaleString("id-ID") : "";
                })}
              placeholder="0"
              class="pl-10 pr-4 h-11 w-full bg-slate-50/50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
            />
          </div>
          {#if biayaTambak > 0}
            <p
              in:slide={{ duration: 150 }}
              class="text-[10px] text-emerald-600 font-extrabold mt-1 tracking-wide leading-none capitalize"
            >
              🗣️ Terbilang: {terbilang(biayaTambak)}
            </p>
          {/if}
        </div>

        <!-- Hutang Usaha Tambak -->
        <div class="space-y-1.5">
          <label for="hutangTambak" class="text-xs font-bold text-slate-600"
            >Hutang Jatuh Tempo Usaha Tambak (Rupiah)</label
          >
          <div class="relative">
            <span
              class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400"
              >Rp</span
            >
            <input
              id="hutangTambak"
              type="text"
              value={hutangTambakDisp}
              on:input={(e) =>
                handleNumericInput(e, (v) => {
                  hutangTambak = v;
                  hutangTambakDisp = v ? v.toLocaleString("id-ID") : "";
                })}
              placeholder="0"
              class="pl-10 pr-4 h-11 w-full bg-slate-50/50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
            />
          </div>
          {#if hutangTambak > 0}
            <p
              in:slide={{ duration: 150 }}
              class="text-[10px] text-emerald-600 font-extrabold mt-1 tracking-wide leading-none capitalize"
            >
              🗣️ Terbilang: {terbilang(hutangTambak)}
            </p>
          {/if}
        </div>
      </Card>

      <!-- Output Card -->
      <Card
        class="p-5 space-y-4 border-slate-200 shadow-soft-sm relative overflow-hidden"
      >
        {#if wajibZakatTambak}
          <div class="absolute inset-x-0 top-0 h-1.5 bg-emerald-500"></div>
        {:else}
          <div class="absolute inset-x-0 top-0 h-1.5 bg-slate-300"></div>
        {/if}

        <h3
          class="text-xs font-black text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between"
        >
          <span>Hasil Perhitungan Zakat Tambak</span>
          {#if wajibZakatTambak}
            <span
              class="bg-emerald-500 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider"
              >Wajib Zakat</span
            >
          {:else}
            <span
              class="bg-slate-200 text-slate-500 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider"
              >Belum Wajib Zakat</span
            >
          {/if}
        </h3>

        <div class="divide-y divide-slate-100 text-xs">
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium"
              >Total Aset Lancar Tambak</span
            >
            <span class="font-bold text-slate-700"
              >{formatRupiah(totalAsetTambak)}</span
            >
          </div>
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium">Biaya &amp; Hutang</span>
            <span class="font-bold text-slate-700"
              >- {formatRupiah((biayaTambak || 0) + (hutangTambak || 0))}</span
            >
          </div>
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-550 font-bold">Harta Tambak Kena Zakat</span
            >
            <span class="font-black text-slate-800"
              >{formatRupiah(bersihTambak)}</span
            >
          </div>
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium"
              >Nisab Tambak (85 gram Emas)</span
            >
            <span class="font-bold text-slate-700"
              >{formatRupiah(nisabTambak)}</span
            >
          </div>
        </div>

        <!-- Detail Perhitungan -->
        <div class="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1.5 bg-slate-50/50 p-3 rounded-xl text-left">
          <p class="font-bold text-slate-700 uppercase tracking-wider text-[9px] mb-1.5">🔬 Detail Perhitungan:</p>
          <p>• <strong>Total Aset Tambak:</strong> Hasil Panen ({formatRupiah(hasilPanenTambak || 0)}) + Uang Kas ({formatRupiah(kasTambak || 0)}) = {formatRupiah(totalAsetTambak)}</p>
          <p>• <strong>Pengurang:</strong> Biaya Operasional ({formatRupiah(biayaTambak || 0)}) + Hutang Jatuh Tempo ({formatRupiah(hutangTambak || 0)}) = {formatRupiah((biayaTambak || 0) + (hutangTambak || 0))}</p>
          <p>• <strong>Aset Bersih Tambak:</strong> {formatRupiah(totalAsetTambak)} - {formatRupiah((biayaTambak || 0) + (hutangTambak || 0))} = <strong>{formatRupiah(bersihTambak)}</strong></p>
          <p>• <strong>Batas Nisab (85g Emas):</strong> {formatRupiah(nisabTambak)}</p>
          <p>• <strong>Status:</strong> {#if wajibZakatTambak}<span class="text-emerald-600 font-bold">Mencapai Nisab (Wajib Zakat 2.5%)</span>{:else}<span class="text-slate-500 font-bold">Belum Mencapai Nisab</span>{/if}</p>
          {#if wajibZakatTambak}
            <p>• <strong>Kadar Zakat:</strong> {formatRupiah(bersihTambak)} &times; 2.5% = <strong class="text-emerald-600">{formatRupiah(jumlahZakatTambak)}</strong></p>
          {:else}
            <p>• <strong>Rekomendasi Sedekah:</strong> {formatRupiah(bersihTambak)} &times; 2.5% = <strong class="text-primary">{formatRupiah(sedekahRekomendasiTambak)}</strong></p>
          {/if}
        </div>

        <div
          class="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-center mt-2 space-y-1.5"
        >
          {#if wajibZakatTambak}
            <p
              class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none"
            >
              Zakat yang Wajib Dikeluarkan (2.5%)
            </p>
            <h2 class="text-3xl font-black text-emerald-600 tracking-tight">
              {formatRupiah(jumlahZakatTambak)}
            </h2>
            <p
              class="text-[10px] text-emerald-600 font-extrabold mt-1 tracking-wide leading-none capitalize"
            >
              🗣️ Terbilang: {terbilang(jumlahZakatTambak)}
            </p>
          {:else}
            <p
              class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none"
            >
              Rekomendasi Sedekah / Infaq
            </p>
            <h2 class="text-2xl font-black text-primary tracking-tight">
              {formatRupiah(sedekahRekomendasiTambak)}
            </h2>
            {#if sedekahRekomendasiTambak > 0}
              <p
                class="text-[10px] text-primary font-extrabold mt-1 tracking-wide leading-none capitalize"
              >
                🗣️ Terbilang: {terbilang(sedekahRekomendasiTambak)}
              </p>
            {/if}
            <p
              class="text-[10px] text-slate-400 font-medium max-w-[280px] mx-auto leading-normal pt-1"
            >
              Aset tambak bersih Anda masih di bawah nishab tahunan. Anda
              disarankan mengeluarkan sedekah sukarela.
            </p>
          {/if}
        </div>
      </Card>
    </div>
  {/if}

  <!-- ==================== TAB: ZAKAT PERUSAHAAN ==================== -->
  {#if activeTab === "perusahaan"}
    <div in:fade={{ duration: 150 }} class="space-y-5">
      <!-- Input Card -->
      <Card class="p-5 space-y-4 shadow-soft-sm">
        <div
          class="flex items-center justify-between border-b border-slate-100 pb-2"
        >
          <h3
            class="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5"
          >
            <Wallet class="h-4.5 w-4.5 text-primary" />
            <span>Isi Data Aset Perusahaan</span>
          </h3>
          <button
            type="button"
            on:click={() => (showPerusahaanInfo = !showPerusahaanInfo)}
            class="p-1 hover:bg-slate-100 text-slate-400 hover:text-primary rounded-lg transition-colors cursor-pointer"
            title="Penjelasan Zakat Perusahaan"
          >
            <HelpCircle class="h-4.5 w-4.5" />
          </button>
        </div>

        {#if showPerusahaanInfo}
          <div
            in:slide={{ duration: 200 }}
            out:slide={{ duration: 150 }}
            class="bg-emerald-50/40 border border-emerald-100/50 rounded-xl p-3.5 text-xs text-slate-650 space-y-3 leading-relaxed text-justify"
          >
            <div>
              <h4
                class="font-bold text-slate-800 uppercase text-[10px] mb-1 tracking-wider"
              >
                Ketentuan Utama
              </h4>
              <ul class="list-disc pl-4.5 space-y-1">
                <li>
                  <strong>Nisab (Batas Minimum):</strong> Nilai kekayaan bersih perusahaan
                  (aset lancar - hutang jangka pendek) setara 85 gram emas.
                </li>
                <li>
                  <strong>Haul (Waktu):</strong> Perusahaan telah berdiri/beroperasi
                  selama 1 tahun.
                </li>
                <li>
                  <strong>Kadar Zakat:</strong> 2,5% dari kekayaan bersih perusahaan
                  yang disesuaikan dengan persentase kepemilikan Anda.
                </li>
              </ul>
            </div>
            <div class="border-t border-emerald-100/30 pt-2.5">
              <h4
                class="font-bold text-slate-800 uppercase text-[10px] mb-1 tracking-wider"
              >
                Cara Menghitung (3 Langkah Mudah)
              </h4>
              <ul class="list-decimal pl-4.5 space-y-1">
                <li>
                  <strong>Hitung Aset Bersih Perusahaan:</strong> Kurangi total aset
                  lancar (uang kas, tabungan, stok barang dagangan, piutang lancar)
                  dengan hutang jangka pendek yang jatuh tempo tahun tersebut.
                </li>
                <li>
                  <strong>Hitung Porsi Kepemilikan Anda:</strong> Kalikan hasil bersih
                  tersebut dengan persentase saham/kepemilikan Anda di perusahaan.
                </li>
                <li>
                  <strong>Hitung Zakatnya:</strong> Jika porsi kepemilikan Anda mencapai
                  nisab (85 gram emas), kalikan dengan 2,5%.
                </li>
              </ul>
            </div>
            <div class="border-t border-emerald-100/30 pt-2.5">
              <span
                class="font-bold text-slate-800 uppercase text-[10px] block mb-1 tracking-wider"
                >Rumus:</span
              >
              <div
                class="bg-white border border-emerald-100 rounded-xl p-2.5 text-center font-black text-emerald-700 font-mono text-xs"
              >
                Zakat Perusahaan = (Aset Lancar - Hutang Lancar) &times; %
                Kepemilikan &times; 2,5%
              </div>
            </div>
            <p
              class="text-[10px] text-slate-400 mt-1 border-t border-emerald-100/30 pt-1.5 italic"
            >
              (Sumber: Muktamar Zakat Internasional ke-1, Fatwa MUI, BAZNAS, dan
              fiqh korporasi).
            </p>
          </div>
        {/if}

        <!-- Aset Lancar Perusahaan -->
        <div class="space-y-1.5">
          <label
            for="asetLancarPerusahaan"
            class="text-xs font-bold text-slate-600"
            >Aset Lancar Perusahaan (Kas, Bank, Stok Dagangan, Piutang) (Rupiah)</label
          >
          <div class="relative">
            <span
              class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400"
              >Rp</span
            >
            <input
              id="asetLancarPerusahaan"
              type="text"
              value={asetLancarPerusahaanDisp}
              on:input={(e) =>
                handleNumericInput(e, (v) => {
                  asetLancarPerusahaan = v;
                  asetLancarPerusahaanDisp = v ? v.toLocaleString("id-ID") : "";
                })}
              placeholder="0"
              class="pl-10 pr-4 h-11 w-full bg-slate-50/50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
            />
          </div>
          {#if asetLancarPerusahaan > 0}
            <p
              in:slide={{ duration: 150 }}
              class="text-[10px] text-emerald-600 font-extrabold mt-1 tracking-wide leading-none capitalize"
            >
              🗣️ Terbilang: {terbilang(asetLancarPerusahaan)}
            </p>
          {/if}
        </div>

        <!-- Hutang Lancar Perusahaan -->
        <div class="space-y-1.5">
          <label
            for="hutangLancarPerusahaan"
            class="text-xs font-bold text-slate-600"
            >Memiliki Hutang (Rupiah)</label
          >
          <div class="relative">
            <span
              class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400"
              >Rp</span
            >
            <input
              id="hutangLancarPerusahaan"
              type="text"
              value={hutangLancarPerusahaanDisp}
              on:input={(e) =>
                handleNumericInput(e, (v) => {
                  hutangLancarPerusahaan = v;
                  hutangLancarPerusahaanDisp = v
                    ? v.toLocaleString("id-ID")
                    : "";
                })}
              placeholder="0"
              class="pl-10 pr-4 h-11 w-full bg-slate-50/50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
            />
          </div>
          {#if hutangLancarPerusahaan > 0}
            <p
              in:slide={{ duration: 150 }}
              class="text-[10px] text-emerald-600 font-extrabold mt-1 tracking-wide leading-none capitalize"
            >
              🗣️ Terbilang: {terbilang(hutangLancarPerusahaan)}
            </p>
          {/if}
        </div>

        <!-- Persentase Kepemilikan -->
        <div class="space-y-1.5">
          <label
            for="persenKepemilikan"
            class="text-xs font-bold text-slate-600"
            >Persentase Kepemilikan Saham Anda (%)</label
          >
          <div class="relative">
            <input
              id="persenKepemilikan"
              type="text"
              value={persenKepemilikanDisp}
              on:input={(e) =>
                handleNumericInput(e, (v) => {
                  persenKepemilikan = Math.min(100, Math.max(0, v));
                  persenKepemilikanDisp = v
                    ? Math.min(100, v).toLocaleString("id-ID")
                    : "";
                })}
              placeholder="100"
              class="pr-12 pl-4 h-11 w-full bg-slate-50/50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
            />
            <span
              class="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400"
              >%</span
            >
          </div>
        </div>
      </Card>

      <!-- Output Card -->
      <Card
        class="p-5 space-y-4 border-slate-200 shadow-soft-sm relative overflow-hidden"
      >
        {#if wajibZakatPerusahaan}
          <div class="absolute inset-x-0 top-0 h-1.5 bg-emerald-500"></div>
        {:else}
          <div class="absolute inset-x-0 top-0 h-1.5 bg-slate-300"></div>
        {/if}

        <h3
          class="text-xs font-black text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between"
        >
          <span>Hasil Perhitungan Zakat Perusahaan</span>
          {#if wajibZakatPerusahaan}
            <span
              class="bg-emerald-500 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider"
              >Wajib Zakat</span
            >
          {:else}
            <span
              class="bg-slate-200 text-slate-500 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider"
              >Belum Wajib Zakat</span
            >
          {/if}
        </h3>

        <div class="divide-y divide-slate-100 text-xs">
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium"
              >Aset Bersih Perusahaan (Total)</span
            >
            <span class="font-bold text-slate-700"
              >{formatRupiah(bersihPerusahaan)}</span
            >
          </div>
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium"
              >Porsi Kepemilikan Anda ({persenKepemilikan}%)</span
            >
            <span class="font-bold text-slate-700"
              >{formatRupiah(porsiBersihPerusahaan)}</span
            >
          </div>
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium"
              >Nisab Zakat Perusahaan (85 gram Emas)</span
            >
            <span class="font-bold text-slate-700"
              >{formatRupiah(nisabPerusahaan)}</span
            >
          </div>
        </div>

        <!-- Detail Perhitungan -->
        <div class="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1.5 bg-slate-50/50 p-3 rounded-xl text-left">
          <p class="font-bold text-slate-700 uppercase tracking-wider text-[9px] mb-1.5">🔬 Detail Perhitungan:</p>
          <p>• <strong>Bersih Perusahaan (Total):</strong> Aset Lancar ({formatRupiah(asetLancarPerusahaan || 0)}) - Hutang Lancar ({formatRupiah(hutangLancarPerusahaan || 0)}) = {formatRupiah(bersihPerusahaan)}</p>
          <p>• <strong>Porsi Kepemilikan Anda ({persenKepemilikan}%):</strong> {formatRupiah(bersihPerusahaan)} &times; {persenKepemilikan}% = <strong>{formatRupiah(porsiBersihPerusahaan)}</strong></p>
          <p>• <strong>Batas Nisab (85g Emas):</strong> {formatRupiah(nisabPerusahaan)}</p>
          <p>• <strong>Status:</strong> {#if wajibZakatPerusahaan}<span class="text-emerald-600 font-bold">Mencapai Nisab (Wajib Zakat 2.5%)</span>{:else}<span class="text-slate-500 font-bold">Belum Mencapai Nisab</span>{/if}</p>
          {#if wajibZakatPerusahaan}
            <p>• <strong>Kadar Zakat:</strong> {formatRupiah(porsiBersihPerusahaan)} &times; 2.5% = <strong class="text-emerald-600">{formatRupiah(jumlahZakatPerusahaan)}</strong></p>
          {:else}
            <p>• <strong>Rekomendasi Sedekah:</strong> {formatRupiah(porsiBersihPerusahaan)} &times; 2.5% = <strong class="text-primary">{formatRupiah(sedekahRekomendasiPerusahaan)}</strong></p>
          {/if}
        </div>

        <div
          class="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-center mt-2 space-y-1.5"
        >
          {#if wajibZakatPerusahaan}
            <p
              class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none"
            >
              Zakat yang Wajib Dikeluarkan (2.5%)
            </p>
            <h2 class="text-3xl font-black text-emerald-600 tracking-tight">
              {formatRupiah(jumlahZakatPerusahaan)}
            </h2>
            <p
              class="text-[10px] text-emerald-600 font-extrabold mt-1 tracking-wide leading-none capitalize"
            >
              🗣️ Terbilang: {terbilang(jumlahZakatPerusahaan)}
            </p>
          {:else}
            <p
              class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none"
            >
              Rekomendasi Sedekah / Infaq
            </p>
            <h2 class="text-2xl font-black text-primary tracking-tight">
              {formatRupiah(sedekahRekomendasiPerusahaan)}
            </h2>
            {#if sedekahRekomendasiPerusahaan > 0}
              <p
                class="text-[10px] text-primary font-extrabold mt-1 tracking-wide leading-none capitalize"
              >
                🗣️ Terbilang: {terbilang(sedekahRekomendasiPerusahaan)}
              </p>
            {/if}
            <p
              class="text-[10px] text-slate-400 font-medium max-w-[280px] mx-auto leading-normal pt-1"
            >
              Porsi kekayaan bersih Anda di perusahaan masih di bawah nishab
              tahunan. Anda disarankan mengeluarkan sedekah sukarela.
            </p>
          {/if}
        </div>
      </Card>
    </div>
  {/if}

  <!-- ==================== TAB: ZAKAT PROPERTI ==================== -->
  {#if activeTab === "properti_sewa"}
    <div in:fade={{ duration: 150 }} class="space-y-5">
      <!-- Input Card -->
      <Card class="p-5 space-y-4 shadow-soft-sm">
        <div
          class="flex items-center justify-between border-b border-slate-100 pb-2"
        >
          <h3
            class="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5"
          >
            <Wallet class="h-4.5 w-4.5 text-primary" />
            <span>Isi Pendapatan Sewa Properti</span>
          </h3>
          <button
            type="button"
            on:click={() => (showPropertiSewaInfo = !showPropertiSewaInfo)}
            class="p-1 hover:bg-slate-100 text-slate-400 hover:text-primary rounded-lg transition-colors cursor-pointer"
            title="Penjelasan Zakat Properti"
          >
            <HelpCircle class="h-4.5 w-4.5" />
          </button>
        </div>

        {#if showPropertiSewaInfo}
          <div
            in:slide={{ duration: 200 }}
            out:slide={{ duration: 150 }}
            class="bg-emerald-50/40 border border-emerald-100/50 rounded-xl p-3.5 text-xs text-slate-650 space-y-3 leading-relaxed text-justify"
          >
            <div>
              <h4
                class="font-bold text-slate-800 uppercase text-[10px] mb-1 tracking-wider"
              >
                Ketentuan Utama
              </h4>
              <ul class="list-disc pl-4.5 space-y-1">
                <li>
                  <strong>Nisab (Batas Minimum):</strong> Pendapatan bersih sewa
                  properti setara dengan nilai 85 gram emas per tahun.
                </li>
                <li>
                  <strong>Objek Zakat:</strong> Zakat dikenakan pada **hasil sewa**
                  properti (bukan pada nilai fisik bangunan rumah/apartemen/tanah
                  itu sendiri).
                </li>
                <li>
                  <strong>Kadar Zakat:</strong> 2,5% dari pendapatan bersih hasil
                  sewa setelah dikurangi biaya operasional pemeliharaan.
                </li>
              </ul>
            </div>
            <div class="border-t border-emerald-100/30 pt-2.5">
              <h4
                class="font-bold text-slate-800 uppercase text-[10px] mb-1 tracking-wider"
              >
                Cara Menghitung (3 Langkah Mudah)
              </h4>
              <ul class="list-decimal pl-4.5 space-y-1">
                <li>
                  <strong>Hitung Hasil Sewa:</strong> Tentukan total uang hasil sewa
                  properti yang didapatkan dalam 1 tahun.
                </li>
                <li>
                  <strong>Kurangi Biaya Perawatan:</strong> Kurangkan dengan biaya
                  pemeliharaan, perawatan, renovasi, atau pajak properti yang dibayarkan.
                </li>
                <li>
                  <strong>Hitung Zakatnya:</strong> Jika hasil bersih sewa mencapai
                  nisab 85g emas, kalikan dengan 2,5%.
                </li>
              </ul>
            </div>
            <div class="border-t border-emerald-100/30 pt-2.5">
              <span
                class="font-bold text-slate-800 uppercase text-[10px] block mb-1 tracking-wider"
                >Rumus:</span
              >
              <div
                class="bg-white border border-emerald-100 rounded-xl p-2.5 text-center font-black text-emerald-700 font-mono text-xs"
              >
                Zakat Properti Sewa = (Pendapatan Sewa - Biaya Perawatan)
                &times; 2,5%
              </div>
            </div>
            <p
              class="text-[10px] text-slate-400 mt-1 border-t border-emerald-100/30 pt-1.5 italic"
            >
              (Sumber: Fatwa Majelis Ulama Indonesia, Fatwa Yusuf Qardawi, dan
              Ketentuan Zakat BAZNAS tentang aset komersial/investasi properti).
            </p>
          </div>
        {/if}

        <!-- Pendapatan Sewa -->
        <div class="space-y-1.5">
          <label for="pendapatanSewa" class="text-xs font-bold text-slate-600"
            >Total Pendapatan Sewa Diterima (Rupiah / Tahunan)</label
          >
          <div class="relative">
            <span
              class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400"
              >Rp</span
            >
            <input
              id="pendapatanSewa"
              type="text"
              value={pendapatanSewaDisp}
              on:input={(e) =>
                handleNumericInput(e, (v) => {
                  pendapatanSewa = v;
                  pendapatanSewaDisp = v ? v.toLocaleString("id-ID") : "";
                })}
              placeholder="0"
              class="pl-10 pr-4 h-11 w-full bg-slate-50/50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
            />
          </div>
          {#if pendapatanSewa > 0}
            <p
              in:slide={{ duration: 150 }}
              class="text-[10px] text-emerald-600 font-extrabold mt-1 tracking-wide leading-none capitalize"
            >
              🗣️ Terbilang: {terbilang(pendapatanSewa)}
            </p>
          {/if}
        </div>

        <!-- Biaya Properti -->
        <div class="space-y-1.5">
          <label for="biayaProperti" class="text-xs font-bold text-slate-600"
            >Biaya Perawatan / Renovasi / Pajak Properti (Rupiah / Tahunan)</label
          >
          <div class="relative">
            <span
              class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400"
              >Rp</span
            >
            <input
              id="biayaProperti"
              type="text"
              value={biayaPropertiDisp}
              on:input={(e) =>
                handleNumericInput(e, (v) => {
                  biayaProperti = v;
                  biayaPropertiDisp = v ? v.toLocaleString("id-ID") : "";
                })}
              placeholder="0"
              class="pl-10 pr-4 h-11 w-full bg-slate-50/50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
            />
          </div>
          {#if biayaProperti > 0}
            <p
              in:slide={{ duration: 150 }}
              class="text-[10px] text-emerald-600 font-extrabold mt-1 tracking-wide leading-none capitalize"
            >
              🗣️ Terbilang: {terbilang(biayaProperti)}
            </p>
          {/if}
        </div>
      </Card>

      <!-- Output Card -->
      <Card
        class="p-5 space-y-4 border-slate-200 shadow-soft-sm relative overflow-hidden"
      >
        {#if wajibZakatProperti}
          <div class="absolute inset-x-0 top-0 h-1.5 bg-emerald-500"></div>
        {:else}
          <div class="absolute inset-x-0 top-0 h-1.5 bg-slate-300"></div>
        {/if}

        <h3
          class="text-xs font-black text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between"
        >
          <span>Hasil Perhitungan Zakat Properti Sewa</span>
          {#if wajibZakatProperti}
            <span
              class="bg-emerald-500 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider"
              >Wajib Zakat</span
            >
          {:else}
            <span
              class="bg-slate-200 text-slate-500 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider"
              >Belum Wajib Zakat</span
            >
          {/if}
        </h3>

        <div class="divide-y divide-slate-100 text-xs">
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium">Total Pendapatan Sewa</span
            >
            <span class="font-bold text-slate-700"
              >{formatRupiah(pendapatanSewa)}</span
            >
          </div>
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium"
              >Biaya Perawatan Properti</span
            >
            <span class="font-bold text-slate-700"
              >- {formatRupiah(biayaProperti)}</span
            >
          </div>
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-505 font-bold">Hasil Sewa Bersih</span>
            <span class="font-black text-slate-800"
              >{formatRupiah(bersihProperti)}</span
            >
          </div>
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium"
              >Nisab Sewa Properti (85 gram Emas)</span
            >
            <span class="font-bold text-slate-700"
              >{formatRupiah(nisabProperti)}</span
            >
          </div>
        </div>

        <!-- Detail Perhitungan -->
        <div class="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1.5 bg-slate-50/50 p-3 rounded-xl text-left">
          <p class="font-bold text-slate-700 uppercase tracking-wider text-[9px] mb-1.5">🔬 Detail Perhitungan:</p>
          <p>• <strong>Total Pendapatan Sewa:</strong> {formatRupiah(pendapatanSewa || 0)}</p>
          <p>• <strong>Biaya Perawatan Properti:</strong> - {formatRupiah(biayaProperti || 0)}</p>
          <p>• <strong>Hasil Sewa Bersih:</strong> {formatRupiah(pendapatanSewa || 0)} - {formatRupiah(biayaProperti || 0)} = <strong>{formatRupiah(bersihProperti)}</strong></p>
          <p>• <strong>Batas Nisab (85g Emas):</strong> {formatRupiah(nisabProperti)}</p>
          <p>• <strong>Status:</strong> {#if wajibZakatProperti}<span class="text-emerald-600 font-bold">Mencapai Nisab (Wajib Zakat 2.5%)</span>{:else}<span class="text-slate-500 font-bold">Belum Mencapai Nisab</span>{/if}</p>
          {#if wajibZakatProperti}
            <p>• <strong>Kadar Zakat:</strong> {formatRupiah(bersihProperti)} &times; 2.5% = <strong class="text-emerald-600">{formatRupiah(jumlahZakatProperti)}</strong></p>
          {:else}
            <p>• <strong>Rekomendasi Sedekah:</strong> {formatRupiah(bersihProperti)} &times; 2.5% = <strong class="text-primary">{formatRupiah(sedekahRekomendasiProperti)}</strong></p>
          {/if}
        </div>

        <div
          class="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-center mt-2 space-y-1.5"
        >
          {#if wajibZakatProperti}
            <p
              class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none"
            >
              Zakat yang Wajib Dikeluarkan (2.5%)
            </p>
            <h2 class="text-3xl font-black text-emerald-600 tracking-tight">
              {formatRupiah(jumlahZakatProperti)}
            </h2>
            <p
              class="text-[10px] text-emerald-600 font-extrabold mt-1 tracking-wide leading-none capitalize"
            >
              🗣️ Terbilang: {terbilang(jumlahZakatProperti)}
            </p>
          {:else}
            <p
              class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none"
            >
              Rekomendasi Sedekah / Infaq
            </p>
            <h2 class="text-2xl font-black text-primary tracking-tight">
              {formatRupiah(sedekahRekomendasiProperti)}
            </h2>
            {#if sedekahRekomendasiProperti > 0}
              <p
                class="text-[10px] text-primary font-extrabold mt-1 tracking-wide leading-none capitalize"
              >
                🗣️ Terbilang: {terbilang(sedekahRekomendasiProperti)}
              </p>
            {/if}
            <p
              class="text-[10px] text-slate-400 font-medium max-w-[280px] mx-auto leading-normal pt-1"
            >
              Pendapatan sewa bersih properti Anda belum mencapai nishab
              tahunan. Anda disarankan mengeluarkan sedekah sukarela.
            </p>
          {/if}
        </div>
      </Card>
    </div>
  {/if}

  <!-- ==================== TAB: ZAKAT PERTAMBANGAN ==================== -->
  {#if activeTab === "pertambangan"}
    <div in:fade={{ duration: 150 }} class="space-y-5">
      <!-- Input Card -->
      <Card class="p-5 space-y-4 shadow-soft-sm">
        <div
          class="flex items-center justify-between border-b border-slate-100 pb-2"
        >
          <h3
            class="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5"
          >
            <Wallet class="h-4.5 w-4.5 text-primary" />
            <span>Isi Data Hasil Tambang</span>
          </h3>
          <button
            type="button"
            on:click={() => (showPertambanganInfo = !showPertambanganInfo)}
            class="p-1 hover:bg-slate-100 text-slate-400 hover:text-primary rounded-lg transition-colors cursor-pointer"
            title="Penjelasan Zakat Pertambangan"
          >
            <HelpCircle class="h-4.5 w-4.5" />
          </button>
        </div>

        {#if showPertambanganInfo}
          <div
            in:slide={{ duration: 200 }}
            out:slide={{ duration: 150 }}
            class="bg-emerald-50/40 border border-emerald-100/50 rounded-xl p-3.5 text-xs text-slate-650 space-y-3 leading-relaxed text-justify"
          >
            <div>
              <h4
                class="font-bold text-slate-800 uppercase text-[10px] mb-1 tracking-wider"
              >
                Ketentuan Utama
              </h4>
              <ul class="list-disc pl-4.5 space-y-1">
                <li>
                  <strong>Nisab (Batas Minimum):</strong> Hasil pertambangan bersih
                  bernilai setara 85 gram emas.
                </li>
                <li>
                  <strong>Haul (Waktu):</strong> Tidak disyaratkan haul. Wajib dikeluarkan
                  zakatnya seketika saat hasil tambang diperoleh/dibersihkan.
                </li>
                <li>
                  <strong>Kadar Zakat:</strong> 2,5% dari hasil tambang bersih setelah
                  dikurangi biaya eksploitasi/operasional.
                </li>
              </ul>
            </div>
            <div class="border-t border-emerald-100/30 pt-2.5">
              <h4
                class="font-bold text-slate-800 uppercase text-[10px] mb-1 tracking-wider"
              >
                Cara Menghitung (3 Langkah Mudah)
              </h4>
              <ul class="list-decimal pl-4.5 space-y-1">
                <li>
                  <strong>Tentukan Nilai Hasil Tambang:</strong> Hitung total nilai
                  pasar/jual dari bahan tambang yang diperoleh.
                </li>
                <li>
                  <strong>Kurangi Biaya Eksploitasi:</strong> Kurangkan dengan biaya
                  operasional penambangan (alat, energi, transportasi, upah kerja).
                </li>
                <li>
                  <strong>Hitung Zakatnya:</strong> Jika nilai bersih mencapai nisab
                  85g emas, kalikan dengan 2,5% untuk mendapatkan kewajiban zakatnya.
                </li>
              </ul>
            </div>
            <div class="border-t border-emerald-100/30 pt-2.5">
              <span
                class="font-bold text-slate-800 uppercase text-[10px] block mb-1 tracking-wider"
                >Rumus:</span
              >
              <div
                class="bg-white border border-emerald-100 rounded-xl p-2.5 text-center font-black text-emerald-700 font-mono text-xs"
              >
                Zakat Pertambangan = (Nilai Hasil Tambang - Biaya Eksploitasi)
                &times; 2,5%
              </div>
            </div>
            <p
              class="text-[10px] text-slate-400 mt-1 border-t border-emerald-100/30 pt-1.5 italic"
            >
              (Sumber: Undang-Undang RI Nomor 23 Tahun 2011 tentang Pengelolaan
              Zakat, Fatwa MUI, dan Keputusan BAZNAS).
            </p>
          </div>
        {/if}

        <!-- Nilai Hasil Tambang -->
        <div class="space-y-1.5">
          <label for="hasilTambang" class="text-xs font-bold text-slate-600"
            >Total Nilai Pasar Hasil Tambang yang Diperoleh (Rupiah)</label
          >
          <div class="relative">
            <span
              class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400"
              >Rp</span
            >
            <input
              id="hasilTambang"
              type="text"
              value={hasilTambangDisp}
              on:input={(e) =>
                handleNumericInput(e, (v) => {
                  hasilTambang = v;
                  hasilTambangDisp = v ? v.toLocaleString("id-ID") : "";
                })}
              placeholder="0"
              class="pl-10 pr-4 h-11 w-full bg-slate-50/50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
            />
          </div>
          {#if hasilTambang > 0}
            <p
              in:slide={{ duration: 150 }}
              class="text-[10px] text-emerald-600 font-extrabold mt-1 tracking-wide leading-none capitalize"
            >
              🗣️ Terbilang: {terbilang(hasilTambang)}
            </p>
          {/if}
        </div>

        <!-- Biaya Eksploitasi -->
        <div class="space-y-1.5">
          <label for="biayaTambang" class="text-xs font-bold text-slate-600"
            >Biaya Eksploitasi / Operasional Tambang (Rupiah)</label
          >
          <div class="relative">
            <span
              class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400"
              >Rp</span
            >
            <input
              id="biayaTambang"
              type="text"
              value={biayaTambangDisp}
              on:input={(e) =>
                handleNumericInput(e, (v) => {
                  biayaTambang = v;
                  biayaTambangDisp = v ? v.toLocaleString("id-ID") : "";
                })}
              placeholder="0"
              class="pl-10 pr-4 h-11 w-full bg-slate-50/50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
            />
          </div>
          {#if biayaTambang > 0}
            <p
              in:slide={{ duration: 150 }}
              class="text-[10px] text-emerald-600 font-extrabold mt-1 tracking-wide leading-none capitalize"
            >
              🗣️ Terbilang: {terbilang(biayaTambang)}
            </p>
          {/if}
        </div>
      </Card>

      <!-- Output Card -->
      <Card
        class="p-5 space-y-4 border-slate-200 shadow-soft-sm relative overflow-hidden"
      >
        {#if wajibZakatPertambangan}
          <div class="absolute inset-x-0 top-0 h-1.5 bg-emerald-500"></div>
        {:else}
          <div class="absolute inset-x-0 top-0 h-1.5 bg-slate-300"></div>
        {/if}

        <h3
          class="text-xs font-black text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between"
        >
          <span>Hasil Perhitungan Zakat Pertambangan</span>
          {#if wajibZakatPertambangan}
            <span
              class="bg-emerald-500 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider"
              >Wajib Zakat</span
            >
          {:else}
            <span
              class="bg-slate-200 text-slate-500 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider"
              >Belum Wajib Zakat</span
            >
          {/if}
        </h3>

        <div class="divide-y divide-slate-100 text-xs">
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium"
              >Total Nilai Hasil Tambang</span
            >
            <span class="font-bold text-slate-700"
              >{formatRupiah(hasilTambang)}</span
            >
          </div>
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium">Biaya Eksploitasi</span>
            <span class="font-bold text-slate-700"
              >- {formatRupiah(biayaTambang)}</span
            >
          </div>
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-505 font-bold">Hasil Tambang Bersih</span>
            <span class="font-black text-slate-800"
              >{formatRupiah(bersihTambang)}</span
            >
          </div>
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium"
              >Nisab Pertambangan (85 gram Emas)</span
            >
            <span class="font-bold text-slate-700"
              >{formatRupiah(nisabPertambangan)}</span
            >
          </div>
        </div>

        <!-- Detail Perhitungan -->
        <div class="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1.5 bg-slate-50/50 p-3 rounded-xl text-left">
          <p class="font-bold text-slate-700 uppercase tracking-wider text-[9px] mb-1.5">🔬 Detail Perhitungan:</p>
          <p>• <strong>Total Nilai Hasil Tambang:</strong> {formatRupiah(hasilTambang || 0)}</p>
          <p>• <strong>Biaya Eksploitasi/Operasional:</strong> - {formatRupiah(biayaTambang || 0)}</p>
          <p>• <strong>Hasil Tambang Bersih:</strong> {formatRupiah(hasilTambang || 0)} - {formatRupiah(biayaTambang || 0)} = <strong>{formatRupiah(bersihTambang)}</strong></p>
          <p>• <strong>Batas Nisab (85g Emas):</strong> {formatRupiah(nisabPertambangan)}</p>
          <p>• <strong>Status:</strong> {#if wajibZakatPertambangan}<span class="text-emerald-600 font-bold">Mencapai Nisab (Wajib Zakat 2.5%)</span>{:else}<span class="text-slate-500 font-bold">Belum Mencapai Nisab</span>{/if}</p>
          {#if wajibZakatPertambangan}
            <p>• <strong>Kadar Zakat:</strong> {formatRupiah(bersihTambang)} &times; 2.5% = <strong class="text-emerald-600">{formatRupiah(jumlahZakatPertambangan)}</strong></p>
          {:else}
            <p>• <strong>Rekomendasi Sedekah:</strong> {formatRupiah(bersihTambang)} &times; 2.5% = <strong class="text-primary">{formatRupiah(sedekahRekomendasiPertambangan)}</strong></p>
          {/if}
        </div>

        <div
          class="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-center mt-2 space-y-1.5"
        >
          {#if wajibZakatPertambangan}
            <p
              class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none"
            >
              Zakat yang Wajib Dikeluarkan (2.5%)
            </p>
            <h2 class="text-3xl font-black text-emerald-600 tracking-tight">
              {formatRupiah(jumlahZakatPertambangan)}
            </h2>
            <p
              class="text-[10px] text-emerald-600 font-extrabold mt-1 tracking-wide leading-none capitalize"
            >
              🗣️ Terbilang: {terbilang(jumlahZakatPertambangan)}
            </p>
          {:else}
            <p
              class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none"
            >
              Rekomendasi Sedekah / Infaq
            </p>
            <h2 class="text-2xl font-black text-primary tracking-tight">
              {formatRupiah(sedekahRekomendasiPertambangan)}
            </h2>
            {#if sedekahRekomendasiPertambangan > 0}
              <p
                class="text-[10px] text-primary font-extrabold mt-1 tracking-wide leading-none capitalize"
              >
                🗣️ Terbilang: {terbilang(sedekahRekomendasiPertambangan)}
              </p>
            {/if}
            <p
              class="text-[10px] text-slate-400 font-medium max-w-[280px] mx-auto leading-normal pt-1"
            >
              Hasil tambang bersih Anda masih di bawah nishab. Anda disarankan
              mengeluarkan sedekah sukarela.
            </p>
          {/if}
        </div>
      </Card>
    </div>
  {/if}

  <!-- ==================== TAB 3: KALKULATOR FARAIDH ==================== -->
  {#if activeTab === "faraidh"}
    <div in:fade={{ duration: 150 }} class="space-y-5">
      <!-- Input Card: Estate values -->
      <Card class="p-5 space-y-4 shadow-soft-sm">
        <h3
          class="text-xs font-black text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5"
        >
          <Scale class="h-4.5 w-4.5 text-primary" />
          <span>Harta Warisan Pewaris</span>
        </h3>

        <!-- Harta Kotor -->
        <div class="space-y-1.5">
          <label for="hartaKotor" class="text-xs font-bold text-slate-600"
            >Total Harta Peninggalan (Harta Kotor)</label
          >
          <div class="relative">
            <span
              class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400"
              >Rp</span
            >
            <input
              id="hartaKotor"
              type="text"
              value={hartaKotorDisp}
              on:input={(e) =>
                handleNumericInput(e, (v) => {
                  hartaKotor = v;
                  hartaKotorDisp = v ? v.toLocaleString("id-ID") : "";
                })}
              placeholder="0"
              class="pl-10 pr-4 h-11 w-full bg-slate-50/50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
            />
          </div>
          {#if hartaKotor > 0}
            <p
              in:slide={{ duration: 150 }}
              class="text-[10px] text-emerald-600 font-extrabold mt-1 tracking-wide leading-none capitalize"
            >
              🗣️ Terbilang: {terbilang(hartaKotor)}
            </p>
          {/if}
        </div>

        <div
          class="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-100 pt-3"
        >
          <!-- Hutang Pewaris -->
          <div class="space-y-1.5">
            <label
              for="hutangPewaris"
              class="text-[10px] font-bold text-slate-500 uppercase tracking-wider"
              >Hutang Pewaris</label
            >
            <div class="relative">
              <span
                class="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400"
                >Rp</span
              >
              <input
                id="hutangPewaris"
                type="text"
                value={hutangPewarisDisp}
                on:input={(e) =>
                  handleNumericInput(e, (v) => {
                    hutangPewaris = v;
                    hutangPewarisDisp = v ? v.toLocaleString("id-ID") : "";
                  })}
                placeholder="0"
                class="pl-8 pr-2 h-10 w-full bg-slate-50/50 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white"
              />
            </div>
            {#if hutangPewaris > 0}
              <p
                in:slide={{ duration: 150 }}
                class="text-[9px] text-emerald-600 font-black tracking-normal capitalize mt-1 leading-tight"
              >
                {terbilang(hutangPewaris)}
              </p>
            {/if}
          </div>

          <!-- Pengurusan Jenazah -->
          <div class="space-y-1.5">
            <label
              for="biayaJenazah"
              class="text-[10px] font-bold text-slate-500 uppercase tracking-wider"
              >Pengurusan Jenazah</label
            >
            <div class="relative">
              <span
                class="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400"
                >Rp</span
              >
              <input
                id="biayaJenazah"
                type="text"
                value={biayaJenazahDisp}
                on:input={(e) =>
                  handleNumericInput(e, (v) => {
                    biayaJenazah = v;
                    biayaJenazahDisp = v ? v.toLocaleString("id-ID") : "";
                  })}
                placeholder="0"
                class="pl-8 pr-2 h-10 w-full bg-slate-50/50 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white"
              />
            </div>
            {#if biayaJenazah > 0}
              <p
                in:slide={{ duration: 150 }}
                class="text-[9px] text-emerald-600 font-black tracking-normal capitalize mt-1 leading-tight"
              >
                {terbilang(biayaJenazah)}
              </p>
            {/if}
          </div>

          <!-- Wasiat Pewaris -->
          <div class="space-y-1.5">
            <label
              for="wasiatPewaris"
              class="text-[10px] font-bold text-slate-500 uppercase tracking-wider"
              >Wasiat Pewaris</label
            >
            <div class="relative">
              <span
                class="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400"
                >Rp</span
              >
              <input
                id="wasiatPewaris"
                type="text"
                value={wasiatPewarisDisp}
                on:input={(e) =>
                  handleNumericInput(e, (v) => {
                    wasiatPewaris = v;
                    wasiatPewarisDisp = v ? v.toLocaleString("id-ID") : "";
                  })}
                placeholder="0"
                class="pl-8 pr-2 h-10 w-full bg-slate-50/50 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white"
              />
            </div>
            {#if wasiatPewaris > 0}
              <p
                in:slide={{ duration: 150 }}
                class="text-[9px] text-emerald-600 font-black tracking-normal capitalize mt-1 leading-tight"
              >
                {terbilang(wasiatPewaris)}
              </p>
            {/if}
          </div>
        </div>

        {#if wasiatLimitWarning}
          <div
            in:slide={{ duration: 150 }}
            class="bg-rose-50 border border-rose-200/50 p-3 rounded-xl flex items-start gap-2.5"
          >
            <span class="text-sm shrink-0">⚠️</span>
            <p class="text-[10px] text-rose-700 leading-normal font-semibold">
              <strong>Peringatan Syariah:</strong> Nilai wasiat melebihi 1/3 dari
              harta waris bersih. Menurut hadis Nabi SAW, wasiat untuk orang lain
              maksimal adalah 1/3, kecuali jika disetujui secara bulat oleh seluruh
              ahli waris setelah pewaris meninggal.
            </p>
          </div>
        {/if}
      </Card>

      <!-- Input Card: Heirs -->
      <Card class="p-5 space-y-4 shadow-soft-sm">
        <h3
          class="text-xs font-black text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center justify-between"
        >
          <div class="flex items-center gap-1.5">
            <HelpCircle class="h-4.5 w-4.5 text-primary" />
            <span>Ahli Waris yang Ditinggalkan</span>
          </div>
          <button
            type="button"
            on:click={() => (isAdvancedFaraidh = !isAdvancedFaraidh)}
            class="px-3 py-1.5 {isAdvancedFaraidh ? 'bg-slate-700 hover:bg-slate-800' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg text-[10px] font-black tracking-wider transition-all uppercase shadow-md hover:shadow-lg flex items-center gap-1.5"
          >
            {isAdvancedFaraidh ? 'Tutup Lanjutan' : '✨ Mode Lanjutan'}
          </button>
        </h3>

        <!-- Spouse Selector -->
        <div class="space-y-3">
          <span class="text-xs font-bold text-slate-600 block"
            >Hubungan Suami / Istri (Pasangan)</span
          >
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              on:click={() => (spouseType = "none")}
              class="relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 focus:outline-none overflow-hidden group
                     {spouseType === 'none'
                ? 'bg-slate-50 border-slate-400 shadow-md'
                : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'}"
            >
              <div class="h-10 w-10 rounded-full flex items-center justify-center mb-2 transition-colors {spouseType === 'none' ? 'bg-slate-200 text-slate-700' : 'bg-slate-50 text-slate-400 group-hover:text-slate-500'}">
                <X class="h-5 w-5" />
              </div>
              <span class="text-xs font-bold {spouseType === 'none' ? 'text-slate-800' : 'text-slate-500'}">Tidak Ada</span>
            </button>
            <button
              type="button"
              on:click={() => (spouseType = "suami")}
              class="relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 focus:outline-none overflow-hidden group
                     {spouseType === 'suami'
                ? 'bg-sky-50 border-sky-400 shadow-md'
                : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-sky-50/30'}"
            >
              <div class="h-10 w-10 rounded-full flex items-center justify-center mb-2 transition-colors {spouseType === 'suami' ? 'bg-sky-200 text-sky-700' : 'bg-sky-50 text-sky-400 group-hover:text-sky-500'}">
                <User class="h-5 w-5" />
              </div>
              <span class="text-xs font-bold {spouseType === 'suami' ? 'text-sky-800' : 'text-slate-500'}">Meninggalkan Suami</span>
              {#if spouseType === 'suami'}
                <div class="absolute top-2 right-2 text-sky-500"><CheckCircle2 class="h-4 w-4" /></div>
              {/if}
            </button>
            <button
              type="button"
              on:click={() => (spouseType = "istri")}
              class="relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 focus:outline-none overflow-hidden group
                     {spouseType === 'istri'
                ? 'bg-rose-50 border-rose-400 shadow-md'
                : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-rose-50/30'}"
            >
              <div class="h-10 w-10 rounded-full flex items-center justify-center mb-2 transition-colors {spouseType === 'istri' ? 'bg-rose-200 text-rose-700' : 'bg-rose-50 text-rose-400 group-hover:text-rose-500'}">
                <Users class="h-5 w-5" />
              </div>
              <span class="text-xs font-bold {spouseType === 'istri' ? 'text-rose-800' : 'text-slate-500'}">Meninggalkan Istri</span>
              {#if spouseType === 'istri'}
                <div class="absolute top-2 right-2 text-rose-500"><CheckCircle2 class="h-4 w-4" /></div>
              {/if}
            </button>
          </div>

          {#if spouseType === "istri"}
            <div
              in:slide={{ duration: 150 }}
              class="flex items-center justify-center space-x-3 p-3 bg-rose-50/50 rounded-xl border border-rose-100 mt-2"
            >
              <span class="text-xs font-bold text-slate-600">Jumlah Istri:</span>
              <div class="flex items-center space-x-1">
                {#each [1, 2, 3, 4] as count}
                  <button
                    type="button"
                    on:click={() => (istriCount = count)}
                    class="h-8 w-8 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center
                           {istriCount === count
                      ? 'bg-rose-500 text-white border-rose-500 shadow-md'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-rose-50 hover:text-rose-600'}"
                  >
                    {count}
                  </button>
                {/each}
              </div>
            </div>
          {/if}
        </div>

        <!-- Parents Selector -->
        <div class="pt-4 border-t border-slate-100 space-y-3">
          <span class="text-xs font-bold text-slate-600 block"
            >Orang Tua Kandung</span
          >
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              on:click={() => (hasFather = !hasFather)}
              class="relative flex items-center p-3 rounded-2xl border-2 transition-all duration-300 focus:outline-none text-left
                     {hasFather
                ? 'bg-emerald-50 border-emerald-400 shadow-md'
                : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-emerald-50/30'}"
            >
              <div class="h-10 w-10 rounded-full flex items-center justify-center shrink-0 transition-colors {hasFather ? 'bg-emerald-200 text-emerald-700' : 'bg-emerald-50 text-emerald-400'}">
                <User class="h-5 w-5" />
              </div>
              <div class="flex flex-col flex-1 min-w-0 px-3">
                <span class="text-sm font-bold truncate {hasFather ? 'text-emerald-800' : 'text-slate-600'}">Ayah Kandung</span>
                <span class="text-[9px] text-slate-400 font-medium leading-tight mt-0.5">Masih hidup saat pewaris wafat</span>
              </div>
              <div class="shrink-0 flex items-center justify-center">
                <div class="w-5 h-5 rounded border {hasFather ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 bg-white'} flex items-center justify-center transition-colors">
                  {#if hasFather}<CheckCircle2 class="w-3 h-3 text-white" />{/if}
                </div>
              </div>
            </button>

            <button
              type="button"
              on:click={() => (hasMother = !hasMother)}
              class="relative flex items-center p-3 rounded-2xl border-2 transition-all duration-300 focus:outline-none text-left
                     {hasMother
                ? 'bg-amber-50 border-amber-400 shadow-md'
                : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-amber-50/30'}"
            >
              <div class="h-10 w-10 rounded-full flex items-center justify-center shrink-0 transition-colors {hasMother ? 'bg-amber-200 text-amber-700' : 'bg-amber-50 text-amber-400'}">
                <User class="h-5 w-5" />
              </div>
              <div class="flex flex-col flex-1 min-w-0 px-3">
                <span class="text-sm font-bold truncate {hasMother ? 'text-amber-800' : 'text-slate-600'}">Ibu Kandung</span>
                <span class="text-[9px] text-slate-400 font-medium leading-tight mt-0.5">Masih hidup saat pewaris wafat</span>
              </div>
              <div class="shrink-0 flex items-center justify-center">
                <div class="w-5 h-5 rounded border {hasMother ? 'bg-amber-500 border-amber-500' : 'border-slate-300 bg-white'} flex items-center justify-center transition-colors">
                  {#if hasMother}<CheckCircle2 class="w-3 h-3 text-white" />{/if}
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- Children Selector -->
        <div class="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <!-- Sons Count -->
          <div class="flex items-center justify-between p-3 rounded-2xl border-2 bg-white transition-colors gap-2 {sonsCount > 0 ? 'border-sky-300 bg-sky-50/20' : 'border-slate-100 hover:border-slate-200'}">
            <div class="flex items-center gap-2.5 min-w-0 flex-1">
              <div class="h-10 w-10 rounded-full flex items-center justify-center shrink-0 transition-colors {sonsCount > 0 ? 'bg-sky-100 text-sky-600' : 'bg-slate-100 text-slate-400'}">
                <User class="h-5 w-5" />
              </div>
              <div class="flex flex-col min-w-0">
                <span class="text-xs sm:text-sm font-bold leading-tight {sonsCount > 0 ? 'text-sky-800' : 'text-slate-600'}">Anak Laki-laki</span>
              </div>
            </div>
            
            <div class="flex items-center space-x-1 shrink-0 bg-slate-50 p-1 rounded-xl border border-slate-100">
              <button type="button" on:click={() => (sonsCount = Math.max(0, sonsCount - 1))} class="h-7 w-7 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg font-black text-sm flex items-center justify-center transition-colors shadow-sm cursor-pointer focus:outline-none">-</button>
              <input type="number" bind:value={sonsCount} min="0" class="h-7 w-8 text-center bg-transparent border-none font-bold text-slate-700 text-sm focus:outline-none p-0" />
              <button type="button" on:click={() => (sonsCount = sonsCount + 1)} class="h-7 w-7 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg font-black text-sm flex items-center justify-center transition-colors shadow-sm cursor-pointer focus:outline-none">+</button>
            </div>
          </div>

          <!-- Daughters Count -->
          <div class="flex items-center justify-between p-3 rounded-2xl border-2 bg-white transition-colors gap-2 {daughtersCount > 0 ? 'border-rose-300 bg-rose-50/20' : 'border-slate-100 hover:border-slate-200'}">
            <div class="flex items-center gap-2.5 min-w-0 flex-1">
              <div class="h-10 w-10 rounded-full flex items-center justify-center shrink-0 transition-colors {daughtersCount > 0 ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-400'}">
                <User class="h-5 w-5" />
              </div>
              <div class="flex flex-col min-w-0">
                <span class="text-xs sm:text-sm font-bold leading-tight {daughtersCount > 0 ? 'text-rose-800' : 'text-slate-600'}">Anak Perempuan</span>
              </div>
            </div>
            
            <div class="flex items-center space-x-1 shrink-0 bg-slate-50 p-1 rounded-xl border border-slate-100">
              <button type="button" on:click={() => (daughtersCount = Math.max(0, daughtersCount - 1))} class="h-7 w-7 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg font-black text-sm flex items-center justify-center transition-colors shadow-sm cursor-pointer focus:outline-none">-</button>
              <input type="number" bind:value={daughtersCount} min="0" class="h-7 w-8 text-center bg-transparent border-none font-bold text-slate-700 text-sm focus:outline-none p-0" />
              <button type="button" on:click={() => (daughtersCount = daughtersCount + 1)} class="h-7 w-7 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg font-black text-sm flex items-center justify-center transition-colors shadow-sm cursor-pointer focus:outline-none">+</button>
            </div>
          </div>
        </div>

        <!-- Advanced Heirs Mode -->
        {#if isAdvancedFaraidh}
          <div in:slide={{ duration: 200 }} class="pt-4 mt-2 border-t border-slate-100 space-y-4 bg-slate-50/70 p-4 -mx-2 rounded-2xl">
            <!-- Grandparents -->
            <div class="space-y-3">
              <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Kakek & Nenek</span>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button type="button" on:click={() => (hasKakek = !hasKakek)} class="relative flex items-center p-2.5 rounded-xl border-2 transition-all focus:outline-none text-left {hasKakek ? 'bg-indigo-50 border-indigo-400' : 'bg-white border-slate-100 hover:border-slate-200'}">
                  <div class="flex flex-col flex-1 min-w-0 px-2">
                    <span class="text-xs font-bold leading-tight {hasKakek ? 'text-indigo-800' : 'text-slate-600'}">Kakek (dari Ayah)</span>
                  </div>
                  <div class="shrink-0 flex items-center justify-center pr-2">
                    <div class="w-4 h-4 rounded border {hasKakek ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300 bg-white'} flex items-center justify-center transition-colors">
                      {#if hasKakek}<CheckCircle2 class="w-2.5 h-2.5 text-white" />{/if}
                    </div>
                  </div>
                </button>
                <button type="button" on:click={() => (hasNenekAyah = !hasNenekAyah)} class="relative flex items-center p-2.5 rounded-xl border-2 transition-all focus:outline-none text-left {hasNenekAyah ? 'bg-indigo-50 border-indigo-400' : 'bg-white border-slate-100 hover:border-slate-200'}">
                  <div class="flex flex-col flex-1 min-w-0 px-2">
                    <span class="text-xs font-bold leading-tight {hasNenekAyah ? 'text-indigo-800' : 'text-slate-600'}">Nenek (dari Ayah)</span>
                  </div>
                  <div class="shrink-0 flex items-center justify-center pr-2">
                    <div class="w-4 h-4 rounded border {hasNenekAyah ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300 bg-white'} flex items-center justify-center transition-colors">
                      {#if hasNenekAyah}<CheckCircle2 class="w-2.5 h-2.5 text-white" />{/if}
                    </div>
                  </div>
                </button>
                <button type="button" on:click={() => (hasNenekIbu = !hasNenekIbu)} class="relative flex items-center p-2.5 rounded-xl border-2 transition-all focus:outline-none text-left {hasNenekIbu ? 'bg-indigo-50 border-indigo-400' : 'bg-white border-slate-100 hover:border-slate-200'}">
                  <div class="flex flex-col flex-1 min-w-0 px-2">
                    <span class="text-xs font-bold leading-tight {hasNenekIbu ? 'text-indigo-800' : 'text-slate-600'}">Nenek (dari Ibu)</span>
                  </div>
                  <div class="shrink-0 flex items-center justify-center pr-2">
                    <div class="w-4 h-4 rounded border {hasNenekIbu ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300 bg-white'} flex items-center justify-center transition-colors">
                      {#if hasNenekIbu}<CheckCircle2 class="w-2.5 h-2.5 text-white" />{/if}
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <!-- Grandchildren -->
            <div class="space-y-3 pt-2 border-t border-slate-200/50">
              <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Cucu (Dari Anak Laki-laki)</span>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="flex items-center justify-between p-2.5 rounded-xl border-2 bg-white transition-colors gap-2 {cucuLakiCount > 0 ? 'border-sky-300 bg-sky-50/20' : 'border-slate-100'}">
                  <span class="text-xs font-bold leading-tight px-2 flex-1 {cucuLakiCount > 0 ? 'text-sky-800' : 'text-slate-600'}">Cucu Laki-laki</span>
                  <div class="flex items-center space-x-1 shrink-0 bg-slate-50 p-1 rounded-lg border border-slate-100">
                    <button type="button" on:click={() => (cucuLakiCount = Math.max(0, cucuLakiCount - 1))} class="h-6 w-6 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded font-black text-xs flex items-center justify-center shadow-sm">-</button>
                    <input type="number" bind:value={cucuLakiCount} min="0" class="h-6 w-8 text-center bg-transparent border-none font-bold text-slate-700 text-sm focus:outline-none p-0" />
                    <button type="button" on:click={() => (cucuLakiCount = cucuLakiCount + 1)} class="h-6 w-6 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded font-black text-xs flex items-center justify-center shadow-sm">+</button>
                  </div>
                </div>
                <div class="flex items-center justify-between p-2.5 rounded-xl border-2 bg-white transition-colors gap-2 {cucuPerempuanCount > 0 ? 'border-rose-300 bg-rose-50/20' : 'border-slate-100'}">
                  <span class="text-xs font-bold leading-tight px-2 flex-1 {cucuPerempuanCount > 0 ? 'text-rose-800' : 'text-slate-600'}">Cucu Perempuan</span>
                  <div class="flex items-center space-x-1 shrink-0 bg-slate-50 p-1 rounded-lg border border-slate-100">
                    <button type="button" on:click={() => (cucuPerempuanCount = Math.max(0, cucuPerempuanCount - 1))} class="h-6 w-6 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded font-black text-xs flex items-center justify-center shadow-sm">-</button>
                    <input type="number" bind:value={cucuPerempuanCount} min="0" class="h-6 w-8 text-center bg-transparent border-none font-bold text-slate-700 text-sm focus:outline-none p-0" />
                    <button type="button" on:click={() => (cucuPerempuanCount = cucuPerempuanCount + 1)} class="h-6 w-6 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded font-black text-xs flex items-center justify-center shadow-sm">+</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Siblings -->
            <div class="space-y-3 pt-2 border-t border-slate-200/50">
              <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Saudara Kandung</span>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="flex items-center justify-between p-2.5 rounded-xl border-2 bg-white transition-colors gap-2 {saudaraKandungLakiCount > 0 ? 'border-teal-300 bg-teal-50/20' : 'border-slate-100'}">
                  <span class="text-xs font-bold leading-tight px-2 flex-1 {saudaraKandungLakiCount > 0 ? 'text-teal-800' : 'text-slate-600'}">Saudara Laki-laki</span>
                  <div class="flex items-center space-x-1 shrink-0 bg-slate-50 p-1 rounded-lg border border-slate-100">
                    <button type="button" on:click={() => (saudaraKandungLakiCount = Math.max(0, saudaraKandungLakiCount - 1))} class="h-6 w-6 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded font-black text-xs flex items-center justify-center shadow-sm">-</button>
                    <input type="number" bind:value={saudaraKandungLakiCount} min="0" class="h-6 w-8 text-center bg-transparent border-none font-bold text-slate-700 text-sm focus:outline-none p-0" />
                    <button type="button" on:click={() => (saudaraKandungLakiCount = saudaraKandungLakiCount + 1)} class="h-6 w-6 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded font-black text-xs flex items-center justify-center shadow-sm">+</button>
                  </div>
                </div>
                <div class="flex items-center justify-between p-2.5 rounded-xl border-2 bg-white transition-colors gap-2 {saudaraKandungPerempuanCount > 0 ? 'border-orange-300 bg-orange-50/20' : 'border-slate-100'}">
                  <span class="text-xs font-bold leading-tight px-2 flex-1 {saudaraKandungPerempuanCount > 0 ? 'text-orange-800' : 'text-slate-600'}">Saudara Perempuan</span>
                  <div class="flex items-center space-x-1 shrink-0 bg-slate-50 p-1 rounded-lg border border-slate-100">
                    <button type="button" on:click={() => (saudaraKandungPerempuanCount = Math.max(0, saudaraKandungPerempuanCount - 1))} class="h-6 w-6 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded font-black text-xs flex items-center justify-center shadow-sm">-</button>
                    <input type="number" bind:value={saudaraKandungPerempuanCount} min="0" class="h-6 w-8 text-center bg-transparent border-none font-bold text-slate-700 text-sm focus:outline-none p-0" />
                    <button type="button" on:click={() => (saudaraKandungPerempuanCount = saudaraKandungPerempuanCount + 1)} class="h-6 w-6 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded font-black text-xs flex items-center justify-center shadow-sm">+</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        {/if}
      </Card>

      <!-- Faraidh Calculation output -->
      {#if netEstate > 0}
        <Card class="p-5 space-y-4 shadow-soft-sm relative overflow-hidden">
          <div class="absolute inset-x-0 top-0 h-1.5 bg-emerald-500"></div>

          <h3
            class="text-xs font-black text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between"
          >
            <span>Rincian Pembagian Warisan</span>
            <span
              class="bg-indigo-50 text-indigo-700 border border-indigo-100 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider"
              >Harta Bersih: {formatRupiah(netEstate)}</span
            >
          </h3>

          {#if faraidhResults.length === 0}
            <div class="text-center py-6 text-xs text-slate-400 font-semibold">
              Belum ada data ahli waris. Silakan masukkan status pasangan, orang
              tua, atau anak di atas.
            </div>
          {:else}
            <!-- Visual Distribution Bar -->
            <div class="space-y-1.5 mb-6">
              <div class="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span>Distribusi Visual</span>
                <span>100%</span>
              </div>
              <div class="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                {#each faraidhResults as heir, i}
                  <div 
                    class="h-full flex items-center justify-center text-[8px] text-white font-bold opacity-90 transition-all hover:opacity-100 cursor-help
                           {['bg-sky-500', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-500', 'bg-indigo-500', 'bg-purple-500'][i % 6]}"
                    style="width: {heir.percentage}%;"
                    title="{heir.name}: {heir.percentage.toFixed(1)}%"
                  ></div>
                {/each}
                {#if baitulMaalAmount > 0}
                  <div class="h-full bg-slate-400 opacity-90 hover:opacity-100 transition-all cursor-help" style="width: {((baitulMaalAmount / netEstate) * 100)}%;" title="Baitul Maal: {((baitulMaalAmount / netEstate) * 100).toFixed(1)}%"></div>
                {/if}
              </div>
            </div>

            <!-- Results Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {#each faraidhResults as heir, i}
                <div class="p-4 bg-white border-2 border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-md rounded-2xl space-y-2.5 transition-all group relative overflow-hidden">
                  <!-- Decorative accent -->
                  <div class="absolute right-0 top-0 w-16 h-16 rounded-bl-full -z-10 group-hover:scale-110 transition-transform opacity-10 {['bg-sky-500', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-500', 'bg-indigo-500', 'bg-purple-500'][i % 6]}"></div>
                  
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex items-center gap-2.5">
                      <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white {['bg-sky-500', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-500', 'bg-indigo-500', 'bg-purple-500'][i % 6]} shadow-sm">
                        <User class="w-4 h-4" />
                      </div>
                      <span class="text-xs sm:text-sm font-bold text-slate-800 line-clamp-1 pr-1">{heir.name}</span>
                    </div>
                    <span class="text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-mono whitespace-nowrap shrink-0 shadow-sm">
                      {heir.fractionStr} ({heir.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  
                  <div class="flex flex-col">
                    <span class="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Nominal Bagian</span>
                    <span class="text-base sm:text-lg font-black text-slate-800 font-mono tracking-tight">{formatRupiah(heir.amount)}</span>
                  </div>
                  
                  <p class="text-[10px] text-slate-500 font-medium leading-relaxed border-t border-slate-100 pt-2 line-clamp-2 hover:line-clamp-none transition-all cursor-pointer">
                    {heir.explanation}
                  </p>
                </div>
              {/each}

              {#if baitulMaalAmount > 0}
                <div class="p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl space-y-2.5 opacity-80">
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex items-center gap-2.5">
                      <div class="w-8 h-8 rounded-full bg-slate-300 text-slate-600 flex items-center justify-center shrink-0">
                        <Users class="w-4 h-4" />
                      </div>
                      <span class="text-xs sm:text-sm font-bold text-slate-800">Baitul Maal</span>
                    </div>
                    <span class="text-[9px] font-black text-slate-600 bg-slate-200 border border-slate-300 px-2 py-0.5 rounded-full font-mono shrink-0">
                      {((baitulMaalAmount / netEstate) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Sisa Nominal</span>
                    <span class="text-base sm:text-lg font-black text-slate-700 font-mono tracking-tight">{formatRupiah(baitulMaalAmount)}</span>
                  </div>
                  <p class="text-[10px] text-slate-500 font-medium leading-relaxed border-t border-slate-200 pt-2">
                    Sisa warisan diserahkan ke Baitul Maal karena tidak ada sisa asabah yang mencukupi syarat (tidak ada ahli waris asabah).
                  </p>
                </div>
              {/if}
            </div>

            <!-- Disclaimer notes -->
            <div
              class="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 text-[10px] text-slate-500 space-y-1.5 leading-relaxed font-normal"
            >
              <span
                class="font-bold text-indigo-700 uppercase tracking-wider block"
                >Catatan Hukum Faraidh</span
              >
              <p>
                Perhitungan ini berdasarkan kesepakatan jumhur ulama Sunni.
                Urutan prioritas kewajiban sebelum harta waris dibagi adalah:
              </p>
              <ul class="list-decimal list-inside pl-1 space-y-0.5 font-medium">
                <li>Melunasi biaya pengurusan jenazah (tajhiz).</li>
                <li>
                  Melunasi hutang piutang pewaris, baik kepada manusia maupun
                  kepada Allah (zakat, nazar).
                </li>
                <li>
                  Menunaikan wasiat pewaris (maksimal 1/3 dari sisa harta
                  bersih).
                </li>
              </ul>
              <p class="text-[9px] text-slate-400 italic">
                Disarankan untuk melakukan konsultasi lanjut dengan Ustadz /
                Pengadilan Agama setempat untuk detail kasus waris yang rumit.
              </p>
            </div>
          {/if}
        </Card>
      {/if}
    </div>
  {/if}
</div>
