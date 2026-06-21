<script lang="ts">
  import { onMount } from "svelte";
  import { fade, slide } from "svelte/transition";
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
  } from "lucide-svelte";

  // Active Tab: 'penghasilan', 'maal', 'faraidh'
  let activeTab = "penghasilan";

  const tabItems = [
    { label: "Zakat Penghasilan", value: "penghasilan" },
    { label: "Zakat Maal (Harta)", value: "maal" },
    { label: "Zakat Fitrah", value: "fitrah" },
    { label: "Zakat Tabungan", value: "tabungan" },
    { label: "Zakat Emas", value: "emas" },
    { label: "Zakat Perak", value: "perak" },
    { label: "Zakat Pertanian", value: "pertanian" },
    { label: "Zakat Perdagangan", value: "perniagaan" },
    { label: "Zakat Saham", value: "saham" },
    { label: "Zakat Reksadana", value: "reksadana" },
    { label: "Kalkulator Faraidh (Waris)", value: "faraidh" },
  ];

  // Helper formatting numbers to Indonesian Rupiah currency
  function formatRupiah(num: number): string {
    return "Rp " + Math.round(num).toLocaleString("id-ID");
  }

  // Common State
  let hargaEmas = 1400000; // Harga emas per gram default (Rp 1.400.000)

  // Real-time gold API state
  let isLoadingGold = false;
  let goldLastUpdated = "";
  let goldDataSource = "Default (Offline)";
  let goldMaterialType = "Emas Batangan";
  let goldUrlHomepage = "https://www.anekalogam.co.id";

  async function fetchGoldPrice() {
    try {
      isLoadingGold = true;
      const res = await fetch("/api/gold-price");
      if (!res.ok) throw new Error("API failed");
      const json = await res.json();
      if (json.success && json.data && json.data.length > 0) {
        // Prioritize the featured homepage price (typically the first item in API, e.g. Certicard gramasi 100 gram)
        // because that matches what users see on the Aneka Logam homepage.
        // Fallback to other items if not available.
        const oneGramGold =
          json.data[0] ||
          json.data.find(
            (item: any) =>
              item.weight === 1 && item.materialType.includes("LM Antam"),
          ) ||
          json.data.find((item: any) => item.weight === 1);
        if (oneGramGold && oneGramGold.sellPrice) {
          hargaEmas = oneGramGold.sellPrice;
          goldLastUpdated =
            oneGramGold.recordedDate || new Date().toISOString().split("T")[0];
          goldDataSource = "Aneka Logam (API Realtime)";
          goldMaterialType = oneGramGold.materialType || "Emas Batangan";
          goldUrlHomepage =
            oneGramGold.urlHomepage || "https://www.anekalogam.co.id";
        }
      }
    } catch (e) {
      console.warn("Failed to fetch gold price:", e);
      goldDataSource = "Default (Offline)";
    } finally {
      isLoadingGold = false;
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
  let emasPerakDisp = "";
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
  let uangTunai = 0;
  let emasPerak = 0;
  let investasi = 0;
  let properti = 0;
  let piutang = 0;
  let hutang = 0;

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
  $: jumlahZakatTabungan = wajibZakatTabungan ? Math.round((saldoTabungan || 0) * 0.025) : 0;
  $: sedekahRekomendasiTabungan = !wajibZakatTabungan ? Math.round((saldoTabungan || 0) * 0.025) : 0;

  // ==================== ZAKAT EMAS STATE & LOGIC ====================
  let beratEmasSimpan = 0;
  let beratEmasPakai = 0;
  let beratEmasSimpanDisp = "";
  let beratEmasPakaiDisp = "";
  $: wajibZakatEmas = (beratEmasSimpan || 0) >= 85;
  $: jumlahZakatEmas = wajibZakatEmas ? Math.round((beratEmasSimpan || 0) * (hargaEmas || 0) * 0.025) : 0;

  // ==================== ZAKAT PERAK STATE & LOGIC ====================
  let beratPerak = 0;
  let hargaPerak = 16000;
  let beratPerakDisp = "";
  let hargaPerakDisp = "16.000";
  $: wajibZakatPerak = (beratPerak || 0) >= 595;
  $: jumlahZakatPerak = wajibZakatPerak ? Math.round((beratPerak || 0) * (hargaPerak || 0) * 0.025) : 0;

  // ==================== ZAKAT PERTANIAN STATE & LOGIC ====================
  let hasilPanen = 0;
  let hargaPanen = 0;
  let jenisPengairan = "pompa"; // 'pompa' or 'alami'
  let hasilPanenDisp = "";
  let hargaPanenDisp = "";
  $: nisabPertanianKg = 653; // 5 wasaq = 653 kg beras
  $: wajibZakatPertanian = (hasilPanen || 0) >= nisabPertanianKg;
  $: tarifPertanian = jenisPengairan === "alami" ? 0.10 : 0.05;
  $: jumlahZakatPertanianKg = wajibZakatPertanian ? (hasilPanen || 0) * tarifPertanian : 0;
  $: jumlahZakatPertanianRupiah = wajibZakatPertanian ? Math.round(jumlahZakatPertanianKg * (hargaPanen || 0)) : 0;

  // ==================== ZAKAT PERDAGANGAN (PERNIAGAAN) STATE & LOGIC ====================
  let asetLancar = 0;
  let uangKas = 0;
  let piutangDagang = 0;
  let hutangDagang = 0;
  let asetLancarDisp = "";
  let uangKasDisp = "";
  let piutangDagangDisp = "";
  let hutangDagangDisp = "";
  $: totalAsetUsaha = (asetLancar || 0) + (uangKas || 0) + (piutangDagang || 0);
  $: hartaPerniagaanKenaZakat = Math.max(0, totalAsetUsaha - (hutangDagang || 0));
  $: nisabPerniagaan = 85 * (hargaEmas || 0);
  $: wajibZakatPerniagaan = hartaPerniagaanKenaZakat >= nisabPerniagaan;
  $: jumlahZakatPerniagaan = wajibZakatPerniagaan ? Math.round(hartaPerniagaanKenaZakat * 0.025) : 0;
  $: sedekahRekomendasiPerniagaan = !wajibZakatPerniagaan ? Math.round(hartaPerniagaanKenaZakat * 0.025) : 0;

  // ==================== ZAKAT SAHAM STATE & LOGIC ====================
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
  $: jumlahZakatSaham = wajibZakatSaham ? Math.round(hartaSahamKenaZakat * 0.025) : 0;
  $: sedekahRekomendasiSaham = !wajibZakatSaham ? Math.round(hartaSahamKenaZakat * 0.025) : 0;

  // ==================== ZAKAT REKSADANA STATE & LOGIC ====================
  let nilaiReksadana = 0;
  let nilaiReksadanaDisp = "";
  $: nisabReksadana = 85 * (hargaEmas || 0);
  $: wajibZakatReksadana = (nilaiReksadana || 0) >= nisabReksadana;
  $: jumlahZakatReksadana = wajibZakatReksadana ? Math.round((nilaiReksadana || 0) * 0.025) : 0;
  $: sedekahRekomendasiReksadana = !wajibZakatReksadana ? Math.round((nilaiReksadana || 0) * 0.025) : 0;

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
      const hasChildren = sonsCount > 0 || daughtersCount > 0;

      // 1. Spouse Share (Fardh)
      let spouseShare = 0;
      let spouseExplanation = "";
      if (spouseType === "suami") {
        spouseShare = hasChildren ? 0.25 : 0.5;
        spouseExplanation = hasChildren
          ? "Mendapat 1/4 bagian karena pewaris memiliki anak."
          : "Mendapat 1/2 bagian karena pewaris tidak memiliki anak.";
      } else if (spouseType === "istri") {
        spouseShare = hasChildren ? 0.125 : 0.25;
        spouseExplanation = hasChildren
          ? `Mendapat 1/8 bagian (dibagi rata untuk ${istriCount} istri) karena pewaris memiliki anak.`
          : `Mendapat 1/4 bagian (dibagi rata untuk ${istriCount} istri) karena pewaris tidak memiliki anak.`;
      }

      // 2. Mother Share (Fardh)
      let motherShare = 0;
      let motherExplanation = "";
      if (hasMother) {
        motherShare = hasChildren ? 1 / 6 : 1 / 3;
        motherExplanation = hasChildren
          ? "Mendapat 1/6 bagian karena pewaris memiliki anak."
          : "Mendapat 1/3 bagian karena pewaris tidak memiliki anak.";
      }

      // 3. Father Share (Fixed/Fardh part)
      let fatherShare = 0;
      let fatherExplanation = "";
      if (hasFather) {
        if (hasChildren) {
          fatherShare = 1 / 6;
          fatherExplanation =
            sonsCount > 0
              ? "Mendapat 1/6 bagian (fardh) karena pewaris memiliki anak laki-laki."
              : "Mendapat 1/6 bagian (fardh) dan berhak mendapat sisa (asabah) karena pewaris hanya memiliki anak perempuan.";
        } else {
          fatherShare = 0; // Purely asabah
          fatherExplanation =
            "Mendapat sisa harta (asabah) karena pewaris tidak memiliki anak.";
        }
      }

      // 4. Daughters Share (Fixed/Fardh if NO sons)
      let daughtersFixedShare = 0;
      let daughtersExplanation = "";
      if (sonsCount === 0 && daughtersCount > 0) {
        if (daughtersCount === 1) {
          daughtersFixedShare = 0.5;
          daughtersExplanation =
            "Mendapat 1/2 bagian karena merupakan anak perempuan tunggal.";
        } else {
          daughtersFixedShare = 2 / 3;
          daughtersExplanation = `Mendapat 2/3 bagian (dibagi rata untuk ${daughtersCount} anak perempuan) karena ada lebih dari satu anak perempuan dan tidak ada anak laki-laki.`;
        }
      }

      // Sum of fixed fractions
      const sumFixed =
        spouseShare +
        motherShare +
        fatherShare +
        (sonsCount === 0 ? daughtersFixedShare : 0);

      // Handle AUL (if sum of fixed fractions exceeds 1)
      let scale = 1;
      let aulApplied = false;
      if (sumFixed > 1) {
        scale = 1 / sumFixed;
        aulApplied = true;
      }

      // Apply scaled values for fixed heirs
      const finalSpouseShare = spouseShare * scale;
      const finalMotherShare = motherShare * scale;
      const finalFatherShare = fatherShare * scale;
      const finalDaughtersShare =
        (sonsCount === 0 ? daughtersFixedShare : 0) * scale;

      // Add Spouse to results
      if (spouseType === "suami") {
        faraidhResults.push({
          name: "Suami",
          fractionStr: aulApplied
            ? `${(spouseShare * 24).toFixed(0)}/24 (Aul)`
            : hasChildren
              ? "1/4"
              : "1/2",
          percentage: finalSpouseShare * 100,
          amount: Math.round(netEstate * finalSpouseShare),
          explanation:
            spouseExplanation +
            (aulApplied
              ? " (Bagian disesuaikan/Aul karena total ahli waris berlebih)"
              : ""),
        });
      } else if (spouseType === "istri") {
        const totalSpouseAmt = netEstate * finalSpouseShare;
        const perIstriAmt = totalSpouseAmt / istriCount;
        for (let i = 1; i <= istriCount; i++) {
          faraidhResults.push({
            name: istriCount > 1 ? `Istri ke-${i}` : "Istri",
            fractionStr: aulApplied
              ? `${(spouseShare * 24).toFixed(0)}/24 (Aul)`
              : hasChildren
                ? "1/8"
                : "1/4",
            percentage: (finalSpouseShare / istriCount) * 100,
            amount: Math.round(perIstriAmt),
            explanation:
              spouseExplanation +
              (aulApplied
                ? " (Bagian disesuaikan/Aul karena total ahli waris berlebih)"
                : ""),
          });
        }
      }

      // Add Mother to results
      if (hasMother) {
        faraidhResults.push({
          name: "Ibu",
          fractionStr: aulApplied
            ? `${(motherShare * 24).toFixed(0)}/24 (Aul)`
            : hasChildren
              ? "1/6"
              : "1/3",
          percentage: finalMotherShare * 100,
          amount: Math.round(netEstate * finalMotherShare),
          explanation:
            motherExplanation +
            (aulApplied
              ? " (Bagian disesuaikan/Aul karena total ahli waris berlebih)"
              : ""),
        });
      }

      // Remainder for Asabah
      const remainderFraction = Math.max(0, 1 - sumFixed);

      // 5. Calculate children / father asabah distributions
      if (hasChildren) {
        if (sonsCount > 0) {
          // Sons & Daughters share remainder as Asabah Bil Ghair (2:1)
          const totalUnits = sonsCount * 2 + daughtersCount;
          const sonShare = (remainderFraction * 2) / totalUnits;
          const daughterShare = (remainderFraction * 1) / totalUnits;

          const perSonAmt = netEstate * sonShare;
          const perDaughterAmt = netEstate * daughterShare;

          for (let i = 1; i <= sonsCount; i++) {
            faraidhResults.push({
              name: sonsCount > 1 ? `Anak Laki-laki ke-${i}` : "Anak Laki-laki",
              fractionStr: `Asabah (${remainderFraction > 0 ? "Sisa" : "0"})`,
              percentage: sonShare * 100,
              amount: Math.round(perSonAmt),
              explanation:
                "Mendapat sisa harta (asabah) bersama anak perempuan dengan rasio 2:1.",
            });
          }

          for (let i = 1; i <= daughtersCount; i++) {
            faraidhResults.push({
              name:
                daughtersCount > 1
                  ? `Anak Perempuan ke-${i}`
                  : "Anak Perempuan",
              fractionStr: `Asabah (${remainderFraction > 0 ? "Sisa" : "0"})`,
              percentage: daughterShare * 100,
              amount: Math.round(perDaughterAmt),
              explanation:
                "Mendapat sisa harta (asabah) bersama anak laki-laki dengan rasio 2:1.",
            });
          }

          // Add Father (Fixed 1/6)
          if (hasFather) {
            faraidhResults.push({
              name: "Ayah",
              fractionStr: aulApplied
                ? `${(fatherShare * 24).toFixed(0)}/24 (Aul)`
                : "1/6",
              percentage: finalFatherShare * 100,
              amount: Math.round(netEstate * finalFatherShare),
              explanation: fatherExplanation,
            });
          }
        } else {
          // Only daughters (and no sons). They got their fixed share.
          // Add Daughters to results
          const perDaughterAmt =
            (netEstate * finalDaughtersShare) / daughtersCount;
          for (let i = 1; i <= daughtersCount; i++) {
            faraidhResults.push({
              name:
                daughtersCount > 1
                  ? `Anak Perempuan ke-${i}`
                  : "Anak Perempuan",
              fractionStr: aulApplied
                ? `${(daughtersFixedShare * 24).toFixed(0)}/24 (Aul)`
                : daughtersCount === 1
                  ? "1/2"
                  : "2/3",
              percentage: (finalDaughtersShare / daughtersCount) * 100,
              amount: Math.round(perDaughterAmt),
              explanation:
                daughtersExplanation +
                (aulApplied ? " (Bagian disesuaikan/Aul)" : ""),
            });
          }

          // Remaining goes to Father as Asabah.
          if (hasFather) {
            const fatherTotalShare = finalFatherShare + remainderFraction;
            faraidhResults.push({
              name: "Ayah",
              fractionStr: "1/6 + Asabah",
              percentage: fatherTotalShare * 100,
              amount: Math.round(netEstate * fatherTotalShare),
              explanation:
                fatherExplanation +
                " Ditambah sisa harta (asabah) karena tidak ada anak laki-laki.",
            });
          } else {
            // No Father, no Sons, but there are Daughters.
            // Redistribution of remainder to daughters and mother (Radd)
            // Recalculate everything with Radd if there's remaining
            if (remainderFraction > 0) {
              const totalRaddShares = finalDaughtersShare + finalMotherShare;
              if (totalRaddShares > 0) {
                const motherRaddShare =
                  finalMotherShare +
                  remainderFraction * (finalMotherShare / totalRaddShares);
                const daughtersRaddShare =
                  finalDaughtersShare +
                  remainderFraction * (finalDaughtersShare / totalRaddShares);

                // Update Mother in results
                if (hasMother) {
                  const mIndex = faraidhResults.findIndex(
                    (r) => r.name === "Ibu",
                  );
                  if (mIndex >= 0) {
                    faraidhResults[mIndex].fractionStr = "Fardh + Radd";
                    faraidhResults[mIndex].percentage = motherRaddShare * 100;
                    faraidhResults[mIndex].amount = Math.round(
                      netEstate * motherRaddShare,
                    );
                    faraidhResults[mIndex].explanation +=
                      " Ditambah sisa pengembalian (Radd).";
                  }
                }

                // Update Daughters in results
                const perDaughterRaddAmt =
                  (netEstate * daughtersRaddShare) / daughtersCount;
                faraidhResults = faraidhResults.map((r) => {
                  if (r.name.startsWith("Anak Perempuan")) {
                    return {
                      ...r,
                      fractionStr: "Fardh + Radd",
                      percentage: (daughtersRaddShare / daughtersCount) * 100,
                      amount: Math.round(perDaughterRaddAmt),
                      explanation:
                        r.explanation + " Ditambah sisa pengembalian (Radd).",
                    };
                  }
                  return r;
                });
              }
            }
          }
        }
      } else {
        // No children.
        // Remainder goes to Father as Asabah.
        if (hasFather) {
          faraidhResults.push({
            name: "Ayah",
            fractionStr: "Asabah (Sisa)",
            percentage: remainderFraction * 100,
            amount: Math.round(netEstate * remainderFraction),
            explanation: fatherExplanation,
          });
        } else {
          // No children, no Father.
          // Remainder goes to Mother (Radd).
          if (hasMother && remainderFraction > 0) {
            const motherTotalShare = finalMotherShare + remainderFraction;
            const mIndex = faraidhResults.findIndex((r) => r.name === "Ibu");
            if (mIndex >= 0) {
              faraidhResults[mIndex].fractionStr = "Fardh + Radd";
              faraidhResults[mIndex].percentage = motherTotalShare * 100;
              faraidhResults[mIndex].amount = Math.round(
                netEstate * motherTotalShare,
              );
              faraidhResults[mIndex].explanation +=
                " Ditambah sisa pengembalian (Radd) karena tidak ada ayah atau anak.";
            }
          } else {
            // Remainder goes to Baitul Maal if no eligible heirs for residue
            baitulMaalAmount = Math.round(netEstate * remainderFraction);
          }
        }
      }

      // Sum final percentages to display/check
      totalDistributedPercentage =
        faraidhResults.reduce((acc, curr) => acc + curr.percentage, 0) +
        (baitulMaalAmount / netEstate) * 100;
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
      Hitung Syariah
    </h1>
    <div class="w-10"></div>
  </div>

  <!-- Navigation Tabs -->
  <div
    class="bg-slate-50 border border-slate-200/50 p-1.5 rounded-2xl shadow-soft-xs"
  >
    <Tabs items={tabItems} bind:activeTab />
  </div>

  <!-- Harga Emas Customizer (Sticky or top widget for Zakat tabs) -->
  {#if activeTab === "penghasilan" || activeTab === "maal" || activeTab === "tabungan" || activeTab === "emas" || activeTab === "perniagaan" || activeTab === "saham" || activeTab === "reksadana"}
    <Card class="bg-emerald-50/30 border-emerald-250/20 p-4">
      <div
        class="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div class="flex items-start space-x-2.5">
          <Info class="h-4.5 w-4.5 text-emerald-600 mt-0.5 shrink-0" />
          <div class="space-y-0.5">
            <h4
              class="text-xs font-black text-slate-800 uppercase flex items-center gap-1.5"
            >
              <span>Harga Emas Acuan (Nisab)</span>
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
            </h4>
            <p class="text-[10px] text-slate-500 leading-normal font-normal">
              Nisab setara 85 gram emas. Acuan: {goldMaterialType}
              {#if goldLastUpdated}
                <span class="text-slate-400 font-mono text-[9px]"
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
        <div class="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <div class="relative w-full sm:w-36 shrink-0">
            <span
              class="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400"
              >Rp</span
            >
            <input
              type="text"
              value={hargaEmas.toLocaleString("id-ID")}
              on:input={handleGoldInput}
              placeholder="1.400.000"
              class="pl-8 pr-3 py-1.5 w-full bg-white border border-slate-200 text-xs font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <button
            type="button"
            on:click={fetchGoldPrice}
            class="p-2 hover:bg-emerald-100/60 rounded-xl text-emerald-700 transition-colors border border-emerald-200/40 bg-white cursor-pointer shadow-soft-xs"
            title="Sync harga emas terbaru"
            disabled={isLoadingGold}
          >
            <RefreshCw
              class="h-3.5 w-3.5 {isLoadingGold ? 'animate-spin' : ''}"
            />
          </button>
        </div>
      </div>
    </Card>
  {/if}

  <!-- ==================== TAB 1: ZAKAT PENGHASILAN ==================== -->
  {#if activeTab === "penghasilan"}
    <div in:fade={{ duration: 150 }} class="space-y-5">
      <!-- Input Card -->
      <Card class="p-5 space-y-4 shadow-soft-sm">
        <div class="flex items-center justify-between border-b border-slate-100 pb-2">
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
            class="bg-emerald-50/40 border border-emerald-100/50 rounded-xl p-3.5 text-xs text-slate-600 space-y-2 leading-relaxed text-justify"
          >
            <p>
              <strong>Zakat penghasilan</strong> atau yang dikenal juga sebagai zakat profesi adalah bagian dari zakat mal yang wajib dikeluarkan atas harta yang berasal dari pendapatan / penghasilan rutin dari pekerjaan yang tidak melanggar syariah.
            </p>
            <p>
              Nishab zakat penghasilan sebesar <strong>85 gram emas per tahun</strong>. Kadar zakat penghasilan senilai <strong>2,5%</strong>.
            </p>
            <p>
              Dalam praktiknya, zakat penghasilan dapat ditunaikan setiap bulan dengan nilai nishab per bulannya adalah setara dengan nilai seperduabelas dari 85 gram emas, dengan kadar 2,5%. Jadi apabila penghasilan setiap bulan telah melebihi nilai nishab bulanan, maka wajib dikeluarkan zakatnya sebesar 2,5% dari penghasilannya tersebut.
            </p>
            <p class="text-[10px] text-slate-400 mt-1 border-t border-emerald-100/30 pt-1.5 italic">
              (Sumber: Al Qur'an Surah Al Baqarah ayat 267, Peraturan Menteri Agama Nomor 31 Tahun 2019, Fatwa MUI Nomor 3 Tahun 2003, dan pendapat Shaikh Yusuf Qardawi).
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
            <p
              class="text-[10px] text-slate-400 font-medium max-w-[280px] mx-auto leading-normal pt-1"
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
            <p
              class="text-[10px] text-slate-400 font-medium max-w-[280px] mx-auto leading-normal pt-1"
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
        <h3
          class="text-xs font-black text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5"
        >
          <Wallet class="h-4.5 w-4.5 text-primary" />
          <span>Aset Maal (Kekayaan)</span>
        </h3>

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

        <!-- Emas/Logam Mulia -->
        <div class="space-y-1.5">
          <label for="emasPerak" class="text-xs font-bold text-slate-600"
            >Emas / Perak / Logam Mulia (Nilai pasar)</label
          >
          <div class="relative">
            <span
              class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400"
              >Rp</span
            >
            <input
              id="emasPerak"
              type="text"
              value={emasPerakDisp}
              on:input={(e) =>
                handleNumericInput(e, (v) => {
                  emasPerak = v;
                  emasPerakDisp = v ? v.toLocaleString("id-ID") : "";
                })}
              placeholder="0"
              class="pl-10 pr-4 h-11 w-full bg-slate-50/50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
            />
          </div>
          {#if emasPerak > 0}
            <p
              in:slide={{ duration: 150 }}
              class="text-[10px] text-emerald-600 font-extrabold mt-1 tracking-wide leading-none capitalize"
            >
              🗣️ Terbilang: {terbilang(emasPerak)}
            </p>
          {/if}
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
            <p
              class="text-[10px] text-slate-400 font-medium max-w-[280px] mx-auto leading-normal pt-1"
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
            <p
              class="text-[10px] text-slate-400 font-medium max-w-[280px] mx-auto leading-normal pt-1"
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
        <h3
          class="text-xs font-black text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5"
        >
          <Wallet class="h-4.5 w-4.5 text-primary" />
          <span>Isi Data Zakat Fitrah</span>
        </h3>

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
            Masing-masing jiwa wajib mengeluarkan 2,5 kg beras (makanan pokok) atau uang senilai dengannya.
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
      <Card class="p-5 space-y-4 border-slate-200 shadow-soft-sm relative overflow-hidden">
        <div class="absolute inset-x-0 top-0 h-1.5 bg-emerald-500"></div>
        <h3 class="text-xs font-black text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
          <span>Hasil Perhitungan Zakat Fitrah</span>
          <span class="bg-emerald-500 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">Wajib Zakat</span>
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
            <span class="font-bold text-slate-700">{formatRupiah(hargaBeras)}</span>
          </div>
        </div>

        <div class="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-center mt-2 space-y-2">
          <div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Zakat (Beras)</p>
            <h2 class="text-2xl font-black text-emerald-600 tracking-tight">{totalZakatBerasFitrah} kg <span class="text-sm font-bold text-slate-500">Beras</span></h2>
          </div>
          <div class="pt-2 border-t border-slate-200/50">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Atau Jika Berupa Uang</p>
            <h2 class="text-2xl font-black text-emerald-600 tracking-tight">{formatRupiah(totalZakatUangFitrah)}</h2>
            <p class="text-[10px] text-emerald-600 font-extrabold mt-1 tracking-wide leading-none capitalize">🗣️ Terbilang: {terbilang(totalZakatUangFitrah)}</p>
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
      <Card class="p-5 space-y-4 border-slate-200 shadow-soft-sm relative overflow-hidden">
        {#if wajibZakatTabungan}
          <div class="absolute inset-x-0 top-0 h-1.5 bg-emerald-500"></div>
        {:else}
          <div class="absolute inset-x-0 top-0 h-1.5 bg-slate-300"></div>
        {/if}

        <h3 class="text-xs font-black text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
          <span>Hasil Perhitungan Zakat Tabungan</span>
          {#if wajibZakatTabungan}
            <span class="bg-emerald-500 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">Wajib Zakat</span>
          {:else}
            <span class="bg-slate-200 text-slate-500 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">Belum Wajib Zakat</span>
          {/if}
        </h3>

        <div class="divide-y divide-slate-100 text-xs">
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium">Total Saldo Tabungan</span>
            <span class="font-bold text-slate-700">{formatRupiah(saldoTabungan)}</span>
          </div>
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium">Nisab Tabungan (85 gram Emas)</span>
            <span class="font-bold text-slate-700">{formatRupiah(nisabZakatTabungan)}</span>
          </div>
        </div>

        <div class="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-center mt-2 space-y-1.5">
          {#if wajibZakatTabungan}
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Zakat yang Wajib Dikeluarkan (2.5%)</p>
            <h2 class="text-3xl font-black text-emerald-600 tracking-tight">{formatRupiah(jumlahZakatTabungan)}</h2>
            <p class="text-[10px] text-emerald-600 font-extrabold mt-1 tracking-wide leading-none capitalize">🗣️ Terbilang: {terbilang(jumlahZakatTabungan)}</p>
          {:else}
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Rekomendasi Sedekah / Infaq (2.5%)</p>
            <h2 class="text-2xl font-black text-primary tracking-tight">{formatRupiah(sedekahRekomendasiTabungan)}</h2>
            <p class="text-[10px] text-slate-400 font-medium max-w-[280px] mx-auto leading-normal pt-1">
              Saldo tabungan Anda belum mencapai nishab tahunan. Anda disarankan mengeluarkan sedekah sukarela.
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
        <h3
          class="text-xs font-black text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5"
        >
          <Wallet class="h-4.5 w-4.5 text-primary" />
          <span>Isi Jumlah Kepemilikan Emas</span>
        </h3>

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
            Emas batangan, koin emas, atau perhiasan yang disimpan dan jarang dipakai (wajib zakat jika >= 85 gram).
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
            Emas yang digunakan sebagai perhiasan sehari-hari (tidak wajib zakat menurut mayoritas ulama jika dalam batas wajar).
          </p>
        </div>
      </Card>

      <!-- Output Card -->
      <Card class="p-5 space-y-4 border-slate-200 shadow-soft-sm relative overflow-hidden">
        {#if wajibZakatEmas}
          <div class="absolute inset-x-0 top-0 h-1.5 bg-emerald-500"></div>
        {:else}
          <div class="absolute inset-x-0 top-0 h-1.5 bg-slate-300"></div>
        {/if}

        <h3 class="text-xs font-black text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
          <span>Hasil Perhitungan Zakat Emas</span>
          {#if wajibZakatEmas}
            <span class="bg-emerald-500 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">Wajib Zakat</span>
          {:else}
            <span class="bg-slate-200 text-slate-500 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">Belum Wajib Zakat</span>
          {/if}
        </h3>

        <div class="divide-y divide-slate-100 text-xs">
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium">Emas Wajib Zakat</span>
            <span class="font-bold text-slate-700">{beratEmasSimpan || 0} gram</span>
          </div>
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium">Nisab Emas</span>
            <span class="font-bold text-slate-700">85 gram</span>
          </div>
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium">Nilai Emas Acuan per gram</span>
            <span class="font-bold text-slate-700">{formatRupiah(hargaEmas)}</span>
          </div>
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium">Total Estimasi Nilai Emas</span>
            <span class="font-bold text-slate-700">{formatRupiah((beratEmasSimpan || 0) * hargaEmas)}</span>
          </div>
        </div>

        <div class="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-center mt-2 space-y-1.5">
          {#if wajibZakatEmas}
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Zakat yang Wajib Dikeluarkan (2.5%)</p>
            <h2 class="text-3xl font-black text-emerald-600 tracking-tight">{formatRupiah(jumlahZakatEmas)}</h2>
            <p class="text-[10px] text-emerald-600 font-extrabold mt-1 tracking-wide leading-none capitalize">🗣️ Terbilang: {terbilang(jumlahZakatEmas)}</p>
          {:else}
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Rekomendasi Sedekah / Infaq</p>
            <h2 class="text-2xl font-black text-primary tracking-tight">Rp 0</h2>
            <p class="text-[10px] text-slate-400 font-medium max-w-[280px] mx-auto leading-normal pt-1">
              Berat emas simpanan Anda ({beratEmasSimpan || 0} gram) masih di bawah batas nishab (85 gram).
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
        <h3
          class="text-xs font-black text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5"
        >
          <Wallet class="h-4.5 w-4.5 text-primary" />
          <span>Isi Jumlah Kepemilikan Perak</span>
        </h3>

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
            Perak wajib dikeluarkan zakatnya jika total beratnya mencapai batas nishab **595 gram**.
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
      <Card class="p-5 space-y-4 border-slate-200 shadow-soft-sm relative overflow-hidden">
        {#if wajibZakatPerak}
          <div class="absolute inset-x-0 top-0 h-1.5 bg-emerald-500"></div>
        {:else}
          <div class="absolute inset-x-0 top-0 h-1.5 bg-slate-300"></div>
        {/if}

        <h3 class="text-xs font-black text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
          <span>Hasil Perhitungan Zakat Perak</span>
          {#if wajibZakatPerak}
            <span class="bg-emerald-500 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">Wajib Zakat</span>
          {:else}
            <span class="bg-slate-200 text-slate-500 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">Belum Wajib Zakat</span>
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
            <span class="font-bold text-slate-700">{formatRupiah(hargaPerak)}</span>
          </div>
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium">Total Nilai Perak</span>
            <span class="font-bold text-slate-700">{formatRupiah((beratPerak || 0) * hargaPerak)}</span>
          </div>
        </div>

        <div class="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-center mt-2 space-y-1.5">
          {#if wajibZakatPerak}
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Zakat yang Wajib Dikeluarkan (2.5%)</p>
            <h2 class="text-3xl font-black text-emerald-600 tracking-tight">{formatRupiah(jumlahZakatPerak)}</h2>
            <p class="text-[10px] text-emerald-600 font-extrabold mt-1 tracking-wide leading-none capitalize">🗣️ Terbilang: {terbilang(jumlahZakatPerak)}</p>
          {:else}
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Rekomendasi Sedekah / Infaq</p>
            <h2 class="text-2xl font-black text-primary tracking-tight">Rp 0</h2>
            <p class="text-[10px] text-slate-400 font-medium max-w-[280px] mx-auto leading-normal pt-1">
              Berat perak simpanan Anda ({beratPerak || 0} gram) masih di bawah batas nishab (595 gram).
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
        <h3
          class="text-xs font-black text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5"
        >
          <Scale class="h-4.5 w-4.5 text-primary" />
          <span>Isi Hasil Pertanian</span>
        </h3>

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
            Nishab zakat pertanian adalah 5 wasaq (setara **653 kg beras** / **1323 kg gabah kering giling**).
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
          <label class="text-xs font-bold text-slate-600">Metode Pengairan / Irigasi</label>
          <div class="flex gap-4 flex-col sm:flex-row">
            <label class="flex items-center space-x-2 text-xs font-semibold text-slate-650 cursor-pointer">
              <input type="radio" bind:group={jenisPengairan} value="pompa" class="h-4 w-4 border-slate-350 text-primary focus:ring-primary/20" />
              <span>Pompa / Air Berbayar / Irigasi Buatan (Tarif 5%)</span>
            </label>
            <label class="flex items-center space-x-2 text-xs font-semibold text-slate-650 cursor-pointer">
              <input type="radio" bind:group={jenisPengairan} value="alami" class="h-4 w-4 border-slate-350 text-primary focus:ring-primary/20" />
              <span>Alami / Air Hujan / Sungai (Bebas Biaya - Tarif 10%)</span>
            </label>
          </div>
        </div>
      </Card>

      <!-- Output Card -->
      <Card class="p-5 space-y-4 border-slate-200 shadow-soft-sm relative overflow-hidden">
        {#if wajibZakatPertanian}
          <div class="absolute inset-x-0 top-0 h-1.5 bg-emerald-500"></div>
        {:else}
          <div class="absolute inset-x-0 top-0 h-1.5 bg-slate-300"></div>
        {/if}

        <h3 class="text-xs font-black text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
          <span>Hasil Perhitungan Zakat Pertanian</span>
          {#if wajibZakatPertanian}
            <span class="bg-emerald-500 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">Wajib Zakat</span>
          {:else}
            <span class="bg-slate-200 text-slate-500 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">Belum Wajib Zakat</span>
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
            <span class="font-bold text-slate-700">{jenisPengairan === 'alami' ? '10%' : '5%'}</span>
          </div>
        </div>

        <div class="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-center mt-2 space-y-2">
          {#if wajibZakatPertanian}
            <div>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Zakat Hasil Panen (dalam kg)</p>
              <h2 class="text-2xl font-black text-emerald-600 tracking-tight">{jumlahZakatPertanianKg.toFixed(1)} kg <span class="text-sm font-bold text-slate-500">Hasil Panen</span></h2>
            </div>
            <div class="pt-2 border-t border-slate-200/50">
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Atau Jika Diuangkan</p>
              <h2 class="text-2xl font-black text-emerald-600 tracking-tight">{formatRupiah(jumlahZakatPertanianRupiah)}</h2>
              <p class="text-[10px] text-emerald-600 font-extrabold mt-1 tracking-wide leading-none capitalize">🗣️ Terbilang: {terbilang(jumlahZakatPertanianRupiah)}</p>
            </div>
          {:else}
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Rekomendasi Sedekah / Infaq</p>
            <h2 class="text-2xl font-black text-primary tracking-tight">Rp 0</h2>
            <p class="text-[10px] text-slate-400 font-medium max-w-[280px] mx-auto leading-normal pt-1">
              Hasil panen Anda ({hasilPanen || 0} kg) masih di bawah batas nishab (653 kg beras).
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
        <h3
          class="text-xs font-black text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5"
        >
          <Wallet class="h-4.5 w-4.5 text-primary" />
          <span>Isi Aset Perniagaan (Usaha Dagang)</span>
        </h3>

        <!-- Aset Lancar / Stok Dagangan -->
        <div class="space-y-1.5">
          <label for="asetLancar" class="text-xs font-bold text-slate-600"
            >Nilai Barang Dagangan / Stok Barang / Bahan Baku (Rupiah)</label
          >
          <div class="relative">
            <span
              class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400"
              >Rp</span
            >
            <input
              id="asetLancar"
              type="text"
              value={asetLancarDisp}
              on:input={(e) =>
                handleNumericInput(e, (v) => {
                  asetLancar = v;
                  asetLancarDisp = v ? v.toLocaleString("id-ID") : "";
                })}
              placeholder="0"
              class="pl-10 pr-4 h-11 w-full bg-slate-50/50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
            />
          </div>
          {#if asetLancar > 0}
            <p
              in:slide={{ duration: 150 }}
              class="text-[10px] text-emerald-600 font-extrabold mt-1 tracking-wide leading-none capitalize"
            >
              🗣️ Terbilang: {terbilang(asetLancar)}
            </p>
          {/if}
        </div>

        <!-- Uang Kas Usaha -->
        <div class="space-y-1.5">
          <label for="uangKas" class="text-xs font-bold text-slate-600"
            >Uang Kas Usaha / Saldo Bank Khusus Usaha (Rupiah)</label
          >
          <div class="relative">
            <span
              class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400"
              >Rp</span
            >
            <input
              id="uangKas"
              type="text"
              value={uangKasDisp}
              on:input={(e) =>
                handleNumericInput(e, (v) => {
                  uangKas = v;
                  uangKasDisp = v ? v.toLocaleString("id-ID") : "";
                })}
              placeholder="0"
              class="pl-10 pr-4 h-11 w-full bg-slate-50/50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
            />
          </div>
          {#if uangKas > 0}
            <p
              in:slide={{ duration: 150 }}
              class="text-[10px] text-emerald-600 font-extrabold mt-1 tracking-wide leading-none capitalize"
            >
              🗣️ Terbilang: {terbilang(uangKas)}
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
            >Hutang Jangka Pendek / Hutang Dagang Jatuh Tempo (Rupiah)</label
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
      <Card class="p-5 space-y-4 border-slate-200 shadow-soft-sm relative overflow-hidden">
        {#if wajibZakatPerniagaan}
          <div class="absolute inset-x-0 top-0 h-1.5 bg-emerald-500"></div>
        {:else}
          <div class="absolute inset-x-0 top-0 h-1.5 bg-slate-300"></div>
        {/if}

        <h3 class="text-xs font-black text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
          <span>Hasil Perhitungan Zakat Perdagangan</span>
          {#if wajibZakatPerniagaan}
            <span class="bg-emerald-500 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">Wajib Zakat</span>
          {:else}
            <span class="bg-slate-200 text-slate-500 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">Belum Wajib Zakat</span>
          {/if}
        </h3>

        <div class="divide-y divide-slate-100 text-xs">
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium">Total Aset Lancar Usaha</span>
            <span class="font-bold text-slate-700">{formatRupiah(totalAsetUsaha)}</span>
          </div>
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium">Hutang Jangka Pendek</span>
            <span class="font-bold text-slate-700">- {formatRupiah(hutangDagang)}</span>
          </div>
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-505 font-bold">Harta Perdagangan Wajib Zakat</span>
            <span class="font-black text-slate-800">{formatRupiah(hartaPerniagaanKenaZakat)}</span>
          </div>
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium">Nisab Perdagangan (85 gram Emas)</span>
            <span class="font-bold text-slate-700">{formatRupiah(nisabPerniagaan)}</span>
          </div>
        </div>

        <div class="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-center mt-2 space-y-1.5">
          {#if wajibZakatPerniagaan}
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Zakat yang Wajib Dikeluarkan (2.5%)</p>
            <h2 class="text-3xl font-black text-emerald-600 tracking-tight">{formatRupiah(jumlahZakatPerniagaan)}</h2>
            <p class="text-[10px] text-emerald-600 font-extrabold mt-1 tracking-wide leading-none capitalize">🗣️ Terbilang: {terbilang(jumlahZakatPerniagaan)}</p>
          {:else}
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Rekomendasi Sedekah / Infaq</p>
            <h2 class="text-2xl font-black text-primary tracking-tight">{formatRupiah(sedekahRekomendasiPerniagaan)}</h2>
            <p class="text-[10px] text-slate-400 font-medium max-w-[280px] mx-auto leading-normal pt-1">
              Aset bersih perdagangan Anda masih di bawah nishab tahunan. Anda disarankan mengeluarkan sedekah sukarela.
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
        <h3
          class="text-xs font-black text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5"
        >
          <Wallet class="h-4.5 w-4.5 text-primary" />
          <span>Isi Nilai Portofolio Saham</span>
        </h3>

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
      <Card class="p-5 space-y-4 border-slate-200 shadow-soft-sm relative overflow-hidden">
        {#if wajibZakatSaham}
          <div class="absolute inset-x-0 top-0 h-1.5 bg-emerald-500"></div>
        {:else}
          <div class="absolute inset-x-0 top-0 h-1.5 bg-slate-300"></div>
        {/if}

        <h3 class="text-xs font-black text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
          <span>Hasil Perhitungan Zakat Saham</span>
          {#if wajibZakatSaham}
            <span class="bg-emerald-500 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">Wajib Zakat</span>
          {:else}
            <span class="bg-slate-200 text-slate-500 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">Belum Wajib Zakat</span>
          {/if}
        </h3>

        <div class="divide-y divide-slate-100 text-xs">
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium">Nilai Portofolio Saham</span>
            <span class="font-bold text-slate-700">{formatRupiah(nilaiSaham)}</span>
          </div>
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium">Dividen Saham</span>
            <span class="font-bold text-slate-700">+ {formatRupiah(dividenSaham)}</span>
          </div>
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium">Hutang Lancar Saham</span>
            <span class="font-bold text-slate-700">- {formatRupiah(hutangSaham)}</span>
          </div>
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-505 font-bold">Harta Saham Wajib Zakat</span>
            <span class="font-black text-slate-800">{formatRupiah(hartaSahamKenaZakat)}</span>
          </div>
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium">Nisab Saham (85 gram Emas)</span>
            <span class="font-bold text-slate-700">{formatRupiah(nisabSaham)}</span>
          </div>
        </div>

        <div class="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-center mt-2 space-y-1.5">
          {#if wajibZakatSaham}
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Zakat yang Wajib Dikeluarkan (2.5%)</p>
            <h2 class="text-3xl font-black text-emerald-600 tracking-tight">{formatRupiah(jumlahZakatSaham)}</h2>
            <p class="text-[10px] text-emerald-600 font-extrabold mt-1 tracking-wide leading-none capitalize">🗣️ Terbilang: {terbilang(jumlahZakatSaham)}</p>
          {:else}
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Rekomendasi Sedekah / Infaq</p>
            <h2 class="text-2xl font-black text-primary tracking-tight">{formatRupiah(sedekahRekomendasiSaham)}</h2>
            <p class="text-[10px] text-slate-400 font-medium max-w-[280px] mx-auto leading-normal pt-1">
              Aset saham bersih Anda masih di bawah nishab tahunan. Anda disarankan mengeluarkan sedekah sukarela.
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
        <h3
          class="text-xs font-black text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5"
        >
          <Wallet class="h-4.5 w-4.5 text-primary" />
          <span>Isi Nilai Reksa Dana</span>
        </h3>

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
      <Card class="p-5 space-y-4 border-slate-200 shadow-soft-sm relative overflow-hidden">
        {#if wajibZakatReksadana}
          <div class="absolute inset-x-0 top-0 h-1.5 bg-emerald-500"></div>
        {:else}
          <div class="absolute inset-x-0 top-0 h-1.5 bg-slate-300"></div>
        {/if}

        <h3 class="text-xs font-black text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
          <span>Hasil Perhitungan Zakat Reksa Dana</span>
          {#if wajibZakatReksadana}
            <span class="bg-emerald-500 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">Wajib Zakat</span>
          {:else}
            <span class="bg-slate-200 text-slate-500 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">Belum Wajib Zakat</span>
          {/if}
        </h3>

        <div class="divide-y divide-slate-100 text-xs">
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium">Nilai Investasi Reksa Dana</span>
            <span class="font-bold text-slate-700">{formatRupiah(nilaiReksadana)}</span>
          </div>
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium">Nisab Reksa Dana (85 gram Emas)</span>
            <span class="font-bold text-slate-700">{formatRupiah(nisabReksadana)}</span>
          </div>
        </div>

        <div class="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-center mt-2 space-y-1.5">
          {#if wajibZakatReksadana}
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Zakat yang Wajib Dikeluarkan (2.5%)</p>
            <h2 class="text-3xl font-black text-emerald-600 tracking-tight">{formatRupiah(jumlahZakatReksadana)}</h2>
            <p class="text-[10px] text-emerald-600 font-extrabold mt-1 tracking-wide leading-none capitalize">🗣️ Terbilang: {terbilang(jumlahZakatReksadana)}</p>
          {:else}
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Rekomendasi Sedekah / Infaq</p>
            <h2 class="text-2xl font-black text-primary tracking-tight">{formatRupiah(sedekahRekomendasiReksadana)}</h2>
            <p class="text-[10px] text-slate-400 font-medium max-w-[280px] mx-auto leading-normal pt-1">
              Aset reksa dana Anda masih di bawah nishab tahunan. Anda disarankan mengeluarkan sedekah sukarela.
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
          class="text-xs font-black text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5"
        >
          <HelpCircle class="h-4.5 w-4.5 text-primary" />
          <span>Ahli Waris yang Ditinggalkan</span>
        </h3>

        <!-- Spouse Selector -->
        <div class="space-y-2">
          <span class="text-xs font-bold text-slate-600 block"
            >Hubungan Suami / Istri (Pasangan)</span
          >
          <div class="grid grid-cols-3 gap-2">
            <button
              type="button"
              on:click={() => (spouseType = "none")}
              class="py-2.5 text-xs font-bold rounded-xl border transition-all duration-200 focus:outline-none
                     {spouseType === 'none'
                ? 'bg-primary text-white border-primary shadow-soft-sm'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}"
            >
              Tidak Ada
            </button>
            <button
              type="button"
              on:click={() => (spouseType = "suami")}
              class="py-2.5 text-xs font-bold rounded-xl border transition-all duration-200 focus:outline-none
                     {spouseType === 'suami'
                ? 'bg-primary text-white border-primary shadow-soft-sm'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}"
            >
              Meninggalkan Suami
            </button>
            <button
              type="button"
              on:click={() => (spouseType = "istri")}
              class="py-2.5 text-xs font-bold rounded-xl border transition-all duration-200 focus:outline-none
                     {spouseType === 'istri'
                ? 'bg-primary text-white border-primary shadow-soft-sm'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}"
            >
              Meninggalkan Istri
            </button>
          </div>

          {#if spouseType === "istri"}
            <div
              in:slide={{ duration: 150 }}
              class="flex items-center space-x-3 pl-1 pt-1.5"
            >
              <span class="text-xs font-bold text-slate-500">Jumlah Istri:</span
              >
              <div class="flex items-center space-x-1">
                {#each [1, 2, 3, 4] as count}
                  <button
                    type="button"
                    on:click={() => (istriCount = count)}
                    class="h-7 w-7 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center
                           {istriCount === count
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}"
                  >
                    {count}
                  </button>
                {/each}
              </div>
            </div>
          {/if}
        </div>

        <!-- Parents Selector -->
        <div class="pt-2 border-t border-slate-100 space-y-2">
          <span class="text-xs font-bold text-slate-600 block"
            >Orang Tua Kandung</span
          >
          <div class="flex items-center gap-4">
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label
              class="flex items-center space-x-2 cursor-pointer select-none"
            >
              <input
                type="checkbox"
                bind:checked={hasFather}
                class="h-4.5 w-4.5 rounded border-slate-300 text-primary focus:ring-primary/20"
              />
              <span class="text-xs font-bold text-slate-600"
                >Ayah Kandung (Masih hidup)</span
              >
            </label>
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label
              class="flex items-center space-x-2 cursor-pointer select-none"
            >
              <input
                type="checkbox"
                bind:checked={hasMother}
                class="h-4.5 w-4.5 rounded border-slate-300 text-primary focus:ring-primary/20"
              />
              <span class="text-xs font-bold text-slate-600"
                >Ibu Kandung (Masih hidup)</span
              >
            </label>
          </div>
        </div>

        <!-- Children Selector -->
        <div class="pt-2 border-t border-slate-100 grid grid-cols-2 gap-4">
          <!-- Sons Count -->
          <div class="space-y-1.5">
            <label for="sonsCount" class="text-xs font-bold text-slate-600"
              >Anak Kandung Laki-laki</label
            >
            <div class="flex items-center space-x-2">
              <button
                type="button"
                on:click={() => (sonsCount = Math.max(0, sonsCount - 1))}
                class="h-9 w-9 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 rounded-xl font-black text-sm flex items-center justify-center cursor-pointer"
                >-</button
              >
              <input
                id="sonsCount"
                type="number"
                bind:value={sonsCount}
                min="0"
                class="h-9 w-12 text-center bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 text-sm focus:outline-none"
              />
              <button
                type="button"
                on:click={() => (sonsCount = sonsCount + 1)}
                class="h-9 w-9 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 rounded-xl font-black text-sm flex items-center justify-center cursor-pointer"
                >+</button
              >
            </div>
          </div>

          <!-- Daughters Count -->
          <div class="space-y-1.5">
            <label for="daughtersCount" class="text-xs font-bold text-slate-600"
              >Anak Kandung Perempuan</label
            >
            <div class="flex items-center space-x-2">
              <button
                type="button"
                on:click={() =>
                  (daughtersCount = Math.max(0, daughtersCount - 1))}
                class="h-9 w-9 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 rounded-xl font-black text-sm flex items-center justify-center cursor-pointer"
                >-</button
              >
              <input
                id="daughtersCount"
                type="number"
                bind:value={daughtersCount}
                min="0"
                class="h-9 w-12 text-center bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 text-sm focus:outline-none"
              />
              <button
                type="button"
                on:click={() => (daughtersCount = daughtersCount + 1)}
                class="h-9 w-9 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 rounded-xl font-black text-sm flex items-center justify-center cursor-pointer"
                >+</button
              >
            </div>
          </div>
        </div>
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
            <!-- Results list -->
            <div class="space-y-3">
              {#each faraidhResults as heir}
                <div
                  class="p-3 bg-slate-50 border border-slate-150 rounded-2xl space-y-1.5 hover:border-slate-300 transition-colors"
                >
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-black text-slate-800"
                      >{heir.name}</span
                    >
                    <span
                      class="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full font-mono"
                    >
                      {heir.fractionStr} ({heir.percentage.toFixed(2)}%)
                    </span>
                  </div>
                  <div class="flex items-baseline justify-between">
                    <span class="text-[10px] text-slate-400 font-medium"
                      >Nominal Bagian</span
                    >
                    <span class="text-sm font-black text-slate-800 font-mono"
                      >{formatRupiah(heir.amount)}</span
                    >
                  </div>
                  <p
                    class="text-[10px] text-slate-500 font-medium leading-relaxed border-t border-slate-200/50 pt-1.5"
                  >
                    📖 {heir.explanation}
                  </p>
                </div>
              {/each}

              {#if baitulMaalAmount > 0}
                <div
                  class="p-3 bg-slate-100 border border-slate-200 rounded-2xl space-y-1.5 text-slate-700"
                >
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-black"
                      >Baitul Maal (Sisa tak teralokasi)</span
                    >
                    <span class="text-[10px] font-black font-mono">
                      {((baitulMaalAmount / netEstate) * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div class="flex items-baseline justify-between">
                    <span class="text-[10px] text-slate-500 font-medium"
                      >Nominal</span
                    >
                    <span class="text-sm font-black font-mono"
                      >{formatRupiah(baitulMaalAmount)}</span
                    >
                  </div>
                  <p
                    class="text-[10px] text-slate-500 font-medium leading-relaxed border-t border-slate-200/50 pt-1.5"
                  >
                    Sisa warisan diserahkan ke Baitul Maal/Kemasyarakatan Islam
                    karena tidak ada sisa asabah yang mencukupi syarat.
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
