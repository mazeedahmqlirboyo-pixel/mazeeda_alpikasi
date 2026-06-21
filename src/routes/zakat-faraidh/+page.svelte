<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, slide } from 'svelte/transition';
  import Card from '$lib/components/ui/card.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import Tabs from '$lib/components/ui/tabs.svelte';
  import { ArrowLeft, HelpCircle, Info, Calculator, DollarSign, Wallet, Scale } from 'lucide-svelte';

  // Active Tab: 'penghasilan', 'maal', 'faraidh'
  let activeTab = 'penghasilan';

  const tabItems = [
    { label: 'Zakat Penghasilan', value: 'penghasilan' },
    { label: 'Zakat Maal (Harta)', value: 'maal' },
    { label: 'Kalkulator Faraidh (Waris)', value: 'faraidh' }
  ];

  // Helper formatting numbers to Indonesian Rupiah currency
  function formatRupiah(num: number): string {
    return 'Rp ' + Math.round(num).toLocaleString('id-ID');
  }

  // Common State
  let hargaEmas = 1400000; // Harga emas per gram default (Rp 1.400.000)

  // ==================== ZAKAT PENGHASILAN STATE & LOGIC ====================
  let gajiBulanan = 0;
  let pendapatanLain = 0;
  let potongKebutuhan = false;
  let kebutuhanBulanan = 0;

  $: totalPendapatanBulanan = (gajiBulanan || 0) + (pendapatanLain || 0);
  $: pendapatanKenaZakat = potongKebutuhan ? Math.max(0, totalPendapatanBulanan - (kebutuhanBulanan || 0)) : totalPendapatanBulanan;
  $: nisabZakatPenghasilanBulanan = Math.round((85 * (hargaEmas || 0)) / 12);
  $: wajibZakatPenghasilan = pendapatanKenaZakat >= nisabZakatPenghasilanBulanan;
  $: jumlahZakatPenghasilan = wajibZakatPenghasilan ? Math.round(pendapatanKenaZakat * 0.025) : 0;
  $: sedekahRekomendasiPenghasilan = !wajibZakatPenghasilan ? Math.round(totalPendapatanBulanan * 0.025) : 0;

  // ==================== ZAKAT MAAL STATE & LOGIC ====================
  let uangTunai = 0;
  let emasPerak = 0;
  let investasi = 0;
  let properti = 0;
  let piutang = 0;
  let hutang = 0;

  $: totalHartaMaal = (uangTunai || 0) + (emasPerak || 0) + (investasi || 0) + (properti || 0) + (piutang || 0);
  $: hartaBersihMaal = Math.max(0, totalHartaMaal - (hutang || 0));
  $: nisabZakatMaalTahunan = 85 * (hargaEmas || 0);
  $: wajibZakatMaal = hartaBersihMaal >= nisabZakatMaalTahunan;
  $: jumlahZakatMaal = wajibZakatMaal ? Math.round(hartaBersihMaal * 0.025) : 0;
  $: sedekahRekomendasiMaal = !wajibZakatMaal ? Math.round(hartaBersihMaal * 0.025) : 0;

  // ==================== FARAIDH (WARIS) STATE & LOGIC ====================
  let hartaKotor = 0;
  let hutangPewaris = 0;
  let biayaJenazah = 0;
  let wasiatPewaris = 0;

  let spouseType = 'none'; // 'none', 'suami', 'istri'
  let istriCount = 1; // 1 s.d 4
  let hasFather = false;
  let hasMother = false;
  let sonsCount = 0;
  let daughtersCount = 0;

  $: totalDeductions = (hutangPewaris || 0) + (biayaJenazah || 0) + (wasiatPewaris || 0);
  $: netEstate = Math.max(0, (hartaKotor || 0) - totalDeductions);
  $: wasiatLimitWarning = (wasiatPewaris || 0) > ((hartaKotor || 0) - (hutangPewaris || 0) - (biayaJenazah || 0)) / 3;

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
      let spouseExplanation = '';
      if (spouseType === 'suami') {
        spouseShare = hasChildren ? 0.25 : 0.5;
        spouseExplanation = hasChildren 
          ? 'Mendapat 1/4 bagian karena pewaris memiliki anak.' 
          : 'Mendapat 1/2 bagian karena pewaris tidak memiliki anak.';
      } else if (spouseType === 'istri') {
        spouseShare = hasChildren ? 0.125 : 0.25;
        spouseExplanation = hasChildren 
          ? `Mendapat 1/8 bagian (dibagi rata untuk ${istriCount} istri) karena pewaris memiliki anak.` 
          : `Mendapat 1/4 bagian (dibagi rata untuk ${istriCount} istri) karena pewaris tidak memiliki anak.`;
      }

      // 2. Mother Share (Fardh)
      let motherShare = 0;
      let motherExplanation = '';
      if (hasMother) {
        motherShare = hasChildren ? 1/6 : 1/3;
        motherExplanation = hasChildren
          ? 'Mendapat 1/6 bagian karena pewaris memiliki anak.'
          : 'Mendapat 1/3 bagian karena pewaris tidak memiliki anak.';
      }

      // 3. Father Share (Fixed/Fardh part)
      let fatherShare = 0;
      let fatherExplanation = '';
      if (hasFather) {
        if (hasChildren) {
          fatherShare = 1/6;
          fatherExplanation = sonsCount > 0 
            ? 'Mendapat 1/6 bagian (fardh) karena pewaris memiliki anak laki-laki.'
            : 'Mendapat 1/6 bagian (fardh) dan berhak mendapat sisa (asabah) karena pewaris hanya memiliki anak perempuan.';
        } else {
          fatherShare = 0; // Purely asabah
          fatherExplanation = 'Mendapat sisa harta (asabah) karena pewaris tidak memiliki anak.';
        }
      }

      // 4. Daughters Share (Fixed/Fardh if NO sons)
      let daughtersFixedShare = 0;
      let daughtersExplanation = '';
      if (sonsCount === 0 && daughtersCount > 0) {
        if (daughtersCount === 1) {
          daughtersFixedShare = 0.5;
          daughtersExplanation = 'Mendapat 1/2 bagian karena merupakan anak perempuan tunggal.';
        } else {
          daughtersFixedShare = 2/3;
          daughtersExplanation = `Mendapat 2/3 bagian (dibagi rata untuk ${daughtersCount} anak perempuan) karena ada lebih dari satu anak perempuan dan tidak ada anak laki-laki.`;
        }
      }

      // Sum of fixed fractions
      const sumFixed = spouseShare + motherShare + fatherShare + (sonsCount === 0 ? daughtersFixedShare : 0);

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
      const finalDaughtersShare = (sonsCount === 0 ? daughtersFixedShare : 0) * scale;

      // Add Spouse to results
      if (spouseType === 'suami') {
        faraidhResults.push({
          name: 'Suami',
          fractionStr: aulApplied ? `${(spouseShare * 24).toFixed(0)}/24 (Aul)` : (hasChildren ? '1/4' : '1/2'),
          percentage: finalSpouseShare * 100,
          amount: Math.round(netEstate * finalSpouseShare),
          explanation: spouseExplanation + (aulApplied ? ' (Bagian disesuaikan/Aul karena total ahli waris berlebih)' : '')
        });
      } else if (spouseType === 'istri') {
        const totalSpouseAmt = netEstate * finalSpouseShare;
        const perIstriAmt = totalSpouseAmt / istriCount;
        for (let i = 1; i <= istriCount; i++) {
          faraidhResults.push({
            name: istriCount > 1 ? `Istri ke-${i}` : 'Istri',
            fractionStr: aulApplied ? `${(spouseShare * 24).toFixed(0)}/24 (Aul)` : (hasChildren ? '1/8' : '1/4'),
            percentage: (finalSpouseShare / istriCount) * 100,
            amount: Math.round(perIstriAmt),
            explanation: spouseExplanation + (aulApplied ? ' (Bagian disesuaikan/Aul karena total ahli waris berlebih)' : '')
          });
        }
      }

      // Add Mother to results
      if (hasMother) {
        faraidhResults.push({
          name: 'Ibu',
          fractionStr: aulApplied ? `${(motherShare * 24).toFixed(0)}/24 (Aul)` : (hasChildren ? '1/6' : '1/3'),
          percentage: finalMotherShare * 100,
          amount: Math.round(netEstate * finalMotherShare),
          explanation: motherExplanation + (aulApplied ? ' (Bagian disesuaikan/Aul karena total ahli waris berlebih)' : '')
        });
      }

      // Remainder for Asabah
      const remainderFraction = Math.max(0, 1 - sumFixed);

      // 5. Calculate children / father asabah distributions
      if (hasChildren) {
        if (sonsCount > 0) {
          // Sons & Daughters share remainder as Asabah Bil Ghair (2:1)
          const totalUnits = (sonsCount * 2) + daughtersCount;
          const sonShare = (remainderFraction * 2) / totalUnits;
          const daughterShare = (remainderFraction * 1) / totalUnits;

          const perSonAmt = netEstate * sonShare;
          const perDaughterAmt = netEstate * daughterShare;

          for (let i = 1; i <= sonsCount; i++) {
            faraidhResults.push({
              name: sonsCount > 1 ? `Anak Laki-laki ke-${i}` : 'Anak Laki-laki',
              fractionStr: `Asabah (${(remainderFraction > 0 ? 'Sisa' : '0')})`,
              percentage: sonShare * 100,
              amount: Math.round(perSonAmt),
              explanation: 'Mendapat sisa harta (asabah) bersama anak perempuan dengan rasio 2:1.'
            });
          }

          for (let i = 1; i <= daughtersCount; i++) {
            faraidhResults.push({
              name: daughtersCount > 1 ? `Anak Perempuan ke-${i}` : 'Anak Perempuan',
              fractionStr: `Asabah (${(remainderFraction > 0 ? 'Sisa' : '0')})`,
              percentage: daughterShare * 100,
              amount: Math.round(perDaughterAmt),
              explanation: 'Mendapat sisa harta (asabah) bersama anak laki-laki dengan rasio 2:1.'
            });
          }

          // Add Father (Fixed 1/6)
          if (hasFather) {
            faraidhResults.push({
              name: 'Ayah',
              fractionStr: aulApplied ? `${(fatherShare * 24).toFixed(0)}/24 (Aul)` : '1/6',
              percentage: finalFatherShare * 100,
              amount: Math.round(netEstate * finalFatherShare),
              explanation: fatherExplanation
            });
          }
        } else {
          // Only daughters (and no sons). They got their fixed share.
          // Add Daughters to results
          const perDaughterAmt = (netEstate * finalDaughtersShare) / daughtersCount;
          for (let i = 1; i <= daughtersCount; i++) {
            faraidhResults.push({
              name: daughtersCount > 1 ? `Anak Perempuan ke-${i}` : 'Anak Perempuan',
              fractionStr: aulApplied ? `${(daughtersFixedShare * 24).toFixed(0)}/24 (Aul)` : (daughtersCount === 1 ? '1/2' : '2/3'),
              percentage: (finalDaughtersShare / daughtersCount) * 100,
              amount: Math.round(perDaughterAmt),
              explanation: daughtersExplanation + (aulApplied ? ' (Bagian disesuaikan/Aul)' : '')
            });
          }

          // Remaining goes to Father as Asabah.
          if (hasFather) {
            const fatherTotalShare = finalFatherShare + remainderFraction;
            faraidhResults.push({
              name: 'Ayah',
              fractionStr: '1/6 + Asabah',
              percentage: fatherTotalShare * 100,
              amount: Math.round(netEstate * fatherTotalShare),
              explanation: fatherExplanation + ' Ditambah sisa harta (asabah) karena tidak ada anak laki-laki.'
            });
          } else {
            // No Father, no Sons, but there are Daughters.
            // Redistribution of remainder to daughters and mother (Radd)
            // Recalculate everything with Radd if there's remaining
            if (remainderFraction > 0) {
              const totalRaddShares = finalDaughtersShare + finalMotherShare;
              if (totalRaddShares > 0) {
                const motherRaddShare = finalMotherShare + remainderFraction * (finalMotherShare / totalRaddShares);
                const daughtersRaddShare = finalDaughtersShare + remainderFraction * (finalDaughtersShare / totalRaddShares);
                
                // Update Mother in results
                if (hasMother) {
                  const mIndex = faraidhResults.findIndex(r => r.name === 'Ibu');
                  if (mIndex >= 0) {
                    faraidhResults[mIndex].fractionStr = 'Fardh + Radd';
                    faraidhResults[mIndex].percentage = motherRaddShare * 100;
                    faraidhResults[mIndex].amount = Math.round(netEstate * motherRaddShare);
                    faraidhResults[mIndex].explanation += ' Ditambah sisa pengembalian (Radd).';
                  }
                }

                // Update Daughters in results
                const perDaughterRaddAmt = (netEstate * daughtersRaddShare) / daughtersCount;
                faraidhResults = faraidhResults.map(r => {
                  if (r.name.startsWith('Anak Perempuan')) {
                    return {
                      ...r,
                      fractionStr: 'Fardh + Radd',
                      percentage: (daughtersRaddShare / daughtersCount) * 100,
                      amount: Math.round(perDaughterRaddAmt),
                      explanation: r.explanation + ' Ditambah sisa pengembalian (Radd).'
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
            name: 'Ayah',
            fractionStr: 'Asabah (Sisa)',
            percentage: remainderFraction * 100,
            amount: Math.round(netEstate * remainderFraction),
            explanation: fatherExplanation
          });
        } else {
          // No children, no Father.
          // Remainder goes to Mother (Radd).
          if (hasMother && remainderFraction > 0) {
            const motherTotalShare = finalMotherShare + remainderFraction;
            const mIndex = faraidhResults.findIndex(r => r.name === 'Ibu');
            if (mIndex >= 0) {
              faraidhResults[mIndex].fractionStr = 'Fardh + Radd';
              faraidhResults[mIndex].percentage = motherTotalShare * 100;
              faraidhResults[mIndex].amount = Math.round(netEstate * motherTotalShare);
              faraidhResults[mIndex].explanation += ' Ditambah sisa pengembalian (Radd) karena tidak ada ayah atau anak.';
            }
          } else {
            // Remainder goes to Baitul Maal if no eligible heirs for residue
            baitulMaalAmount = Math.round(netEstate * remainderFraction);
          }
        }
      }

      // Sum final percentages to display/check
      totalDistributedPercentage = faraidhResults.reduce((acc, curr) => acc + curr.percentage, 0) + (baitulMaalAmount / netEstate) * 100;
    }
  }
</script>

<div class="space-y-6 pb-12 max-w-xl mx-auto">
  <!-- Header Bar -->
  <div class="flex items-center justify-between">
    <a href="/" class="inline-flex items-center space-x-2 text-slate-500 hover:text-primary transition-colors text-sm font-semibold">
      <ArrowLeft class="h-4.5 w-4.5" />
      <span>Kembali</span>
    </a>
    <h1 class="text-base font-bold text-slate-800 uppercase tracking-wider">Hitung Syariah</h1>
    <div class="w-10"></div>
  </div>

  <!-- Navigation Tabs -->
  <div class="bg-slate-50 border border-slate-200/50 p-1.5 rounded-2xl shadow-soft-xs">
    <Tabs items={tabItems} bind:activeTab={activeTab} />
  </div>

  <!-- Harga Emas Customizer (Sticky or top widget for Zakat tabs) -->
  {#if activeTab === 'penghasilan' || activeTab === 'maal'}
    <Card class="bg-amber-50/40 border-amber-200/40 p-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex items-start space-x-2.5">
          <Info class="h-4.5 w-4.5 text-amber-600 mt-0.5 shrink-0" />
          <div class="space-y-0.5">
            <h4 class="text-xs font-black text-slate-800 uppercase">Harga Emas Acuan (Nisab)</h4>
            <p class="text-[10px] text-slate-500 leading-normal font-normal">Nisab zakat maal/penghasilan setara dengan nilai 85 gram emas murni.</p>
          </div>
        </div>
        <div class="relative w-full sm:w-36 shrink-0">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
          <input 
            type="number" 
            bind:value={hargaEmas} 
            placeholder="1.400.000" 
            class="pl-8 pr-3 py-1.5 w-full bg-white border border-slate-200 text-xs font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
      </div>
    </Card>
  {/if}

  <!-- ==================== TAB 1: ZAKAT PENGHASILAN ==================== -->
  {#if activeTab === 'penghasilan'}
    <div in:fade={{ duration: 150 }} class="space-y-5">
      <!-- Input Card -->
      <Card class="p-5 space-y-4 shadow-soft-sm">
        <h3 class="text-xs font-black text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
          <Calculator class="h-4 w-4 text-primary" />
          <span>Form Pendapatan</span>
        </h3>

        <!-- Gaji Pokok -->
        <div class="space-y-1.5">
          <label for="gajiPokok" class="text-xs font-bold text-slate-600">Gaji Pokok Bulanan</label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
            <input 
              id="gajiPokok"
              type="number" 
              bind:value={gajiBulanan} 
              placeholder="0"
              class="pl-10 pr-4 h-11 w-full bg-slate-50/50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
            />
          </div>
        </div>

        <!-- Bonus/Pendapatan Lain -->
        <div class="space-y-1.5">
          <label for="pendapatanLain" class="text-xs font-bold text-slate-600">Pendapatan Lain / Bonus Bulanan</label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
            <input 
              id="pendapatanLain"
              type="number" 
              bind:value={pendapatanLain} 
              placeholder="0"
              class="pl-10 pr-4 h-11 w-full bg-slate-50/50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
            />
          </div>
        </div>

        <!-- Toggle Kebutuhan Pokok -->
        <div class="pt-2 border-t border-slate-100 space-y-3">
          <!-- svelte-ignore a11y-label-has-associated-control -->
          <label class="flex items-center space-x-2.5 cursor-pointer select-none">
            <input 
              type="checkbox" 
              bind:checked={potongKebutuhan} 
              class="h-4.5 w-4.5 rounded border-slate-300 text-primary focus:ring-primary/20"
            />
            <span class="text-xs font-bold text-slate-600">Kurangi Kebutuhan Pokok Bulanan</span>
          </label>

          {#if potongKebutuhan}
            <div in:slide={{ duration: 150 }} class="space-y-1.5 pl-7">
              <span class="text-[10px] font-medium text-slate-400 block leading-tight">Pengeluaran pokok sandang, pangan, papan, & hutang mendesak</span>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                <input 
                  type="number" 
                  bind:value={kebutuhanBulanan} 
                  placeholder="0"
                  class="pl-10 pr-4 h-11 w-full bg-slate-50/50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
                />
              </div>
            </div>
          {/if}
        </div>
      </Card>

      <!-- Calculations output card -->
      <Card class="p-5 space-y-4 border-slate-200 shadow-soft-sm relative overflow-hidden">
        {#if wajibZakatPenghasilan}
          <div class="absolute inset-x-0 top-0 h-1.5 bg-emerald-500"></div>
        {:else}
          <div class="absolute inset-x-0 top-0 h-1.5 bg-slate-300"></div>
        {/if}

        <h3 class="text-xs font-black text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
          <span>Hasil Perhitungan</span>
          {#if wajibZakatPenghasilan}
            <span class="bg-emerald-500 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">Wajib Zakat</span>
          {:else}
            <span class="bg-slate-200 text-slate-500 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">Bukan Wajib Zakat</span>
          {/if}
        </h3>

        <div class="divide-y divide-slate-100 text-xs">
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium">Pendapatan Kotor Bulanan</span>
            <span class="font-bold text-slate-700">{formatRupiah(totalPendapatanBulanan)}</span>
          </div>
          {#if potongKebutuhan}
            <div class="py-2.5 flex justify-between items-center">
              <span class="text-slate-500 font-medium">Pengurangan Kebutuhan</span>
              <span class="font-bold text-slate-700">- {formatRupiah(kebutuhanBulanan || 0)}</span>
            </div>
            <div class="py-2.5 flex justify-between items-center">
              <span class="text-slate-500 font-bold">Pendapatan Kena Zakat</span>
              <span class="font-black text-slate-800">{formatRupiah(pendapatanKenaZakat)}</span>
            </div>
          {/if}
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium">Nisab Zakat Bulanan</span>
            <span class="font-bold text-slate-700">{formatRupiah(nisabZakatPenghasilanBulanan)} / bln</span>
          </div>
        </div>

        <div class="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-center mt-2 space-y-1.5">
          {#if wajibZakatPenghasilan}
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Zakat yang Wajib Dikeluarkan (2.5%)</p>
            <h2 class="text-3xl font-black text-emerald-600 tracking-tight">{formatRupiah(jumlahZakatPenghasilan)} <span class="text-xs font-bold">/ bln</span></h2>
            <p class="text-[10px] text-slate-400 font-medium max-w-[280px] mx-auto leading-normal pt-1">
              "Keluarkanlah zakat dari sebagian harta mereka guna membersihkan dan menyucikan mereka." (QS. At-Taubah: 103)
            </p>
          {:else}
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Rekomendasi Sedekah / Infaq (2.5%)</p>
            <h2 class="text-2xl font-black text-primary tracking-tight">{formatRupiah(sedekahRekomendasiPenghasilan)} <span class="text-xs font-bold">/ bln</span></h2>
            <p class="text-[10px] text-slate-400 font-medium max-w-[280px] mx-auto leading-normal pt-1">
              Pendapatan Anda berada di bawah nisab. Mengeluarkan infaq 2.5% bersifat anjuran sukarela demi keberkahan harta.
            </p>
          {/if}
        </div>
      </Card>
    </div>
  {/if}

  <!-- ==================== TAB 2: ZAKAT MAAL ==================== -->
  {#if activeTab === 'maal'}
    <div in:fade={{ duration: 150 }} class="space-y-5">
      <!-- Input Card -->
      <Card class="p-5 space-y-4 shadow-soft-sm">
        <h3 class="text-xs font-black text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
          <Wallet class="h-4.5 w-4.5 text-primary" />
          <span>Aset Maal (Kekayaan)</span>
        </h3>

        <!-- Uang Tunai/Tabungan -->
        <div class="space-y-1.5">
          <label for="uangTunai" class="text-xs font-bold text-slate-600">Uang Tunai / Tabungan / Giro / Deposito</label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
            <input 
              id="uangTunai"
              type="number" 
              bind:value={uangTunai} 
              placeholder="0"
              class="pl-10 pr-4 h-11 w-full bg-slate-50/50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
            />
          </div>
        </div>

        <!-- Emas/Logam Mulia -->
        <div class="space-y-1.5">
          <label for="emasPerak" class="text-xs font-bold text-slate-600">Emas / Perak / Logam Mulia (Nilai pasar)</label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
            <input 
              id="emasPerak"
              type="number" 
              bind:value={emasPerak} 
              placeholder="0"
              class="pl-10 pr-4 h-11 w-full bg-slate-50/50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
            />
          </div>
        </div>

        <!-- Saham/Reksadana/Investasi -->
        <div class="space-y-1.5">
          <label for="investasi" class="text-xs font-bold text-slate-600">Saham / Investasi / Reksadana / Crypto</label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
            <input 
              id="investasi"
              type="number" 
              bind:value={investasi} 
              placeholder="0"
              class="pl-10 pr-4 h-11 w-full bg-slate-50/50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
            />
          </div>
        </div>

        <!-- Properti/Aset Komersial -->
        <div class="space-y-1.5">
          <label for="properti" class="text-xs font-bold text-slate-600">Nilai Properti Komersial / Nilai Kontrakan / Kendaraan Dagang</label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
            <input 
              id="properti"
              type="number" 
              bind:value={properti} 
              placeholder="0"
              class="pl-10 pr-4 h-11 w-full bg-slate-50/50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
            />
          </div>
        </div>

        <!-- Piutang Lancar -->
        <div class="space-y-1.5">
          <label for="piutang" class="text-xs font-bold text-slate-600">Piutang Lancar (Uang dipinjamkan yang pasti tertagih)</label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
            <input 
              id="piutang"
              type="number" 
              bind:value={piutang} 
              placeholder="0"
              class="pl-10 pr-4 h-11 w-full bg-slate-50/50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
            />
          </div>
        </div>

        <!-- Pengurangan Hutang -->
        <div class="pt-2 border-t border-slate-100 space-y-1.5">
          <label for="hutang" class="text-xs font-bold text-slate-600">Kewajiban / Hutang Jatuh Tempo (Dapat dikurangi)</label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
            <input 
              id="hutang"
              type="number" 
              bind:value={hutang} 
              placeholder="0"
              class="pl-10 pr-4 h-11 w-full bg-slate-50/50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
            />
          </div>
        </div>
      </Card>

      <!-- Calculations output card -->
      <Card class="p-5 space-y-4 border-slate-200 shadow-soft-sm relative overflow-hidden">
        {#if wajibZakatMaal}
          <div class="absolute inset-x-0 top-0 h-1.5 bg-emerald-500"></div>
        {:else}
          <div class="absolute inset-x-0 top-0 h-1.5 bg-slate-300"></div>
        {/if}

        <h3 class="text-xs font-black text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
          <span>Hasil Perhitungan</span>
          {#if wajibZakatMaal}
            <span class="bg-emerald-500 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">Wajib Zakat</span>
          {:else}
            <span class="bg-slate-200 text-slate-500 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">Belum Wajib Zakat</span>
          {/if}
        </h3>

        <div class="divide-y divide-slate-100 text-xs">
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium">Total Aset Maal</span>
            <span class="font-bold text-slate-700">{formatRupiah(totalHartaMaal)}</span>
          </div>
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium">Deductions (Hutang)</span>
            <span class="font-bold text-slate-700">- {formatRupiah(hutang || 0)}</span>
          </div>
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-bold">Harta Bersih (Terkena Haul)</span>
            <span class="font-black text-slate-800">{formatRupiah(hartaBersihMaal)}</span>
          </div>
          <div class="py-2.5 flex justify-between items-center">
            <span class="text-slate-500 font-medium">Nisab Zakat Maal Tahunan (85g Emas)</span>
            <span class="font-bold text-slate-700">{formatRupiah(nisabZakatMaalTahunan)}</span>
          </div>
        </div>

        <div class="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-center mt-2 space-y-1.5">
          {#if wajibZakatMaal}
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Zakat Maal yang Wajib Dikeluarkan (2.5%)</p>
            <h2 class="text-3xl font-black text-emerald-600 tracking-tight">{formatRupiah(jumlahZakatMaal)}</h2>
            <p class="text-[10px] text-slate-400 font-medium max-w-[280px] mx-auto leading-normal pt-1">
              Harta bersih Anda telah melebihi nisab tahunan. Wajib dikeluarkan zakat sebesar 2,5% jika kepemilikan aset telah mencapai haul (1 tahun hijriah).
            </p>
          {:else}
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Rekomendasi Sedekah / Infaq (2.5%)</p>
            <h2 class="text-2xl font-black text-primary tracking-tight">{formatRupiah(sedekahRekomendasiMaal)}</h2>
            <p class="text-[10px] text-slate-400 font-medium max-w-[280px] mx-auto leading-normal pt-1">
              Harta bersih Anda berada di bawah nisab tahunan. Anda disarankan mengeluarkan infaq/sedekah sukarela untuk mensucikan rezeki.
            </p>
          {/if}
        </div>
      </Card>
    </div>
  {/if}

  <!-- ==================== TAB 3: KALKULATOR FARAIDH ==================== -->
  {#if activeTab === 'faraidh'}
    <div in:fade={{ duration: 150 }} class="space-y-5">
      <!-- Input Card: Estate values -->
      <Card class="p-5 space-y-4 shadow-soft-sm">
        <h3 class="text-xs font-black text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
          <Scale class="h-4.5 w-4.5 text-primary" />
          <span>Harta Warisan Pewaris</span>
        </h3>

        <!-- Harta Kotor -->
        <div class="space-y-1.5">
          <label for="hartaKotor" class="text-xs font-bold text-slate-600">Total Harta Peninggalan (Harta Kotor)</label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
            <input 
              id="hartaKotor"
              type="number" 
              bind:value={hartaKotor} 
              placeholder="0"
              class="pl-10 pr-4 h-11 w-full bg-slate-50/50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-100 pt-3">
          <!-- Hutang Pewaris -->
          <div class="space-y-1.5">
            <label for="hutangPewaris" class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Hutang Pewaris</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
              <input 
                id="hutangPewaris"
                type="number" 
                bind:value={hutangPewaris} 
                placeholder="0"
                class="pl-8 pr-2 h-10 w-full bg-slate-50/50 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white"
              />
            </div>
          </div>

          <!-- Pengurusan Jenazah -->
          <div class="space-y-1.5">
            <label for="biayaJenazah" class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pengurusan Jenazah</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
              <input 
                id="biayaJenazah"
                type="number" 
                bind:value={biayaJenazah} 
                placeholder="0"
                class="pl-8 pr-2 h-10 w-full bg-slate-50/50 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white"
              />
            </div>
          </div>

          <!-- Wasiat Pewaris -->
          <div class="space-y-1.5">
            <label for="wasiatPewaris" class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Wasiat Pewaris</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
              <input 
                id="wasiatPewaris"
                type="number" 
                bind:value={wasiatPewaris} 
                placeholder="0"
                class="pl-8 pr-2 h-10 w-full bg-slate-50/50 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white"
              />
            </div>
          </div>
        </div>

        {#if wasiatLimitWarning}
          <div in:slide={{ duration: 150 }} class="bg-rose-50 border border-rose-200/50 p-3 rounded-xl flex items-start gap-2.5">
            <span class="text-sm shrink-0">⚠️</span>
            <p class="text-[10px] text-rose-700 leading-normal font-semibold">
              <strong>Peringatan Syariah:</strong> Nilai wasiat melebihi 1/3 dari harta waris bersih. Menurut hadis Nabi SAW, wasiat untuk orang lain maksimal adalah 1/3, kecuali jika disetujui secara bulat oleh seluruh ahli waris setelah pewaris meninggal.
            </p>
          </div>
        {/if}
      </Card>

      <!-- Input Card: Heirs -->
      <Card class="p-5 space-y-4 shadow-soft-sm">
        <h3 class="text-xs font-black text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
          <HelpCircle class="h-4.5 w-4.5 text-primary" />
          <span>Ahli Waris yang Ditinggalkan</span>
        </h3>

        <!-- Spouse Selector -->
        <div class="space-y-2">
          <span class="text-xs font-bold text-slate-600 block">Hubungan Suami / Istri (Pasangan)</span>
          <div class="grid grid-cols-3 gap-2">
            <button 
              type="button"
              on:click={() => spouseType = 'none'}
              class="py-2.5 text-xs font-bold rounded-xl border transition-all duration-200 focus:outline-none
                     {spouseType === 'none' ? 'bg-primary text-white border-primary shadow-soft-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}"
            >
              Tidak Ada
            </button>
            <button 
              type="button"
              on:click={() => spouseType = 'suami'}
              class="py-2.5 text-xs font-bold rounded-xl border transition-all duration-200 focus:outline-none
                     {spouseType === 'suami' ? 'bg-primary text-white border-primary shadow-soft-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}"
            >
              Meninggalkan Suami
            </button>
            <button 
              type="button"
              on:click={() => spouseType = 'istri'}
              class="py-2.5 text-xs font-bold rounded-xl border transition-all duration-200 focus:outline-none
                     {spouseType === 'istri' ? 'bg-primary text-white border-primary shadow-soft-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}"
            >
              Meninggalkan Istri
            </button>
          </div>

          {#if spouseType === 'istri'}
            <div in:slide={{ duration: 150 }} class="flex items-center space-x-3 pl-1 pt-1.5">
              <span class="text-xs font-bold text-slate-500">Jumlah Istri:</span>
              <div class="flex items-center space-x-1">
                {#each [1, 2, 3, 4] as count}
                  <button 
                    type="button"
                    on:click={() => istriCount = count}
                    class="h-7 w-7 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center
                           {istriCount === count ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}"
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
          <span class="text-xs font-bold text-slate-600 block">Orang Tua Kandung</span>
          <div class="flex items-center gap-4">
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label class="flex items-center space-x-2 cursor-pointer select-none">
              <input 
                type="checkbox" 
                bind:checked={hasFather} 
                class="h-4.5 w-4.5 rounded border-slate-300 text-primary focus:ring-primary/20"
              />
              <span class="text-xs font-bold text-slate-600">Ayah Kandung (Masih hidup)</span>
            </label>
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label class="flex items-center space-x-2 cursor-pointer select-none">
              <input 
                type="checkbox" 
                bind:checked={hasMother} 
                class="h-4.5 w-4.5 rounded border-slate-300 text-primary focus:ring-primary/20"
              />
              <span class="text-xs font-bold text-slate-600">Ibu Kandung (Masih hidup)</span>
            </label>
          </div>
        </div>

        <!-- Children Selector -->
        <div class="pt-2 border-t border-slate-100 grid grid-cols-2 gap-4">
          <!-- Sons Count -->
          <div class="space-y-1.5">
            <label for="sonsCount" class="text-xs font-bold text-slate-600">Anak Kandung Laki-laki</label>
            <div class="flex items-center space-x-2">
              <button 
                type="button" 
                on:click={() => sonsCount = Math.max(0, sonsCount - 1)}
                class="h-9 w-9 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 rounded-xl font-black text-sm flex items-center justify-center cursor-pointer"
              >-</button>
              <input 
                id="sonsCount"
                type="number" 
                bind:value={sonsCount} 
                min="0"
                class="h-9 w-12 text-center bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 text-sm focus:outline-none"
              />
              <button 
                type="button" 
                on:click={() => sonsCount = sonsCount + 1}
                class="h-9 w-9 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 rounded-xl font-black text-sm flex items-center justify-center cursor-pointer"
              >+</button>
            </div>
          </div>

          <!-- Daughters Count -->
          <div class="space-y-1.5">
            <label for="daughtersCount" class="text-xs font-bold text-slate-600">Anak Kandung Perempuan</label>
            <div class="flex items-center space-x-2">
              <button 
                type="button" 
                on:click={() => daughtersCount = Math.max(0, daughtersCount - 1)}
                class="h-9 w-9 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 rounded-xl font-black text-sm flex items-center justify-center cursor-pointer"
              >-</button>
              <input 
                id="daughtersCount"
                type="number" 
                bind:value={daughtersCount} 
                min="0"
                class="h-9 w-12 text-center bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 text-sm focus:outline-none"
              />
              <button 
                type="button" 
                on:click={() => daughtersCount = daughtersCount + 1}
                class="h-9 w-9 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 rounded-xl font-black text-sm flex items-center justify-center cursor-pointer"
              >+</button>
            </div>
          </div>
        </div>
      </Card>

      <!-- Faraidh Calculation output -->
      {#if netEstate > 0}
        <Card class="p-5 space-y-4 shadow-soft-sm relative overflow-hidden">
          <div class="absolute inset-x-0 top-0 h-1.5 bg-emerald-500"></div>

          <h3 class="text-xs font-black text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>Rincian Pembagian Warisan</span>
            <span class="bg-indigo-50 text-indigo-700 border border-indigo-100 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">Harta Bersih: {formatRupiah(netEstate)}</span>
          </h3>

          {#if faraidhResults.length === 0}
            <div class="text-center py-6 text-xs text-slate-400 font-semibold">
              Belum ada data ahli waris. Silakan masukkan status pasangan, orang tua, atau anak di atas.
            </div>
          {:else}
            <!-- Results list -->
            <div class="space-y-3">
              {#each faraidhResults as heir}
                <div class="p-3 bg-slate-50 border border-slate-150 rounded-2xl space-y-1.5 hover:border-slate-300 transition-colors">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-black text-slate-800">{heir.name}</span>
                    <span class="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full font-mono">
                      {heir.fractionStr} ({heir.percentage.toFixed(2)}%)
                    </span>
                  </div>
                  <div class="flex items-baseline justify-between">
                    <span class="text-[10px] text-slate-400 font-medium">Nominal Bagian</span>
                    <span class="text-sm font-black text-slate-800 font-mono">{formatRupiah(heir.amount)}</span>
                  </div>
                  <p class="text-[10px] text-slate-500 font-medium leading-relaxed border-t border-slate-200/50 pt-1.5">
                    📖 {heir.explanation}
                  </p>
                </div>
              {/each}

              {#if baitulMaalAmount > 0}
                <div class="p-3 bg-slate-100 border border-slate-200 rounded-2xl space-y-1.5 text-slate-700">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-black">Baitul Maal (Sisa tak teralokasi)</span>
                    <span class="text-[10px] font-black font-mono">
                      {((baitulMaalAmount / netEstate) * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div class="flex items-baseline justify-between">
                    <span class="text-[10px] text-slate-500 font-medium">Nominal</span>
                    <span class="text-sm font-black font-mono">{formatRupiah(baitulMaalAmount)}</span>
                  </div>
                  <p class="text-[10px] text-slate-500 font-medium leading-relaxed border-t border-slate-200/50 pt-1.5">
                    Sisa warisan diserahkan ke Baitul Maal/Kemasyarakatan Islam karena tidak ada sisa asabah yang mencukupi syarat.
                  </p>
                </div>
              {/if}
            </div>

            <!-- Disclaimer notes -->
            <div class="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 text-[10px] text-slate-500 space-y-1.5 leading-relaxed font-normal">
              <span class="font-bold text-indigo-700 uppercase tracking-wider block">Catatan Hukum Faraidh</span>
              <p>Perhitungan ini berdasarkan kesepakatan jumhur ulama Sunni. Urutan prioritas kewajiban sebelum harta waris dibagi adalah:</p>
              <ul class="list-decimal list-inside pl-1 space-y-0.5 font-medium">
                <li>Melunasi biaya pengurusan jenazah (tajhiz).</li>
                <li>Melunasi hutang piutang pewaris, baik kepada manusia maupun kepada Allah (zakat, nazar).</li>
                <li>Menunaikan wasiat pewaris (maksimal 1/3 dari sisa harta bersih).</li>
              </ul>
              <p class="text-[9px] text-slate-400 italic">Disarankan untuk melakukan konsultasi lanjut dengan Ustadz / Pengadilan Agama setempat untuk detail kasus waris yang rumit.</p>
            </div>
          {/if}
        </Card>
      {/if}
    </div>
  {/if}
</div>
