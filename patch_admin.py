import re

with open(r'c:\MAZEEDA\MAZEEDA CODING\New folder\src\routes\admin\+page.svelte', 'r', encoding='utf-8') as f:
    content = f.read()

state_logic = """
  // --- CSV Import for Nilai Akademik ---
  let nilai_targetTable = 'nilai_tamrin'; // 'nilai_tamrin' | 'nilai_ujian'
  let nilai_csvFile: File | null = null;
  let nilai_parsedCSVData: any[] = [];
  let nilai_csvImportStatus = '';
  let nilai_csvImportError = '';

  function nilai_processCSV(file: File) {
    nilai_csvImportError = "";
    nilai_csvImportStatus = "";
    if (!file.name.endsWith(".csv")) {
      nilai_csvImportError = "File harus berupa format .csv";
      return;
    }
    nilai_csvFile = file;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) {
        nilai_csvImportError = "File CSV kosong.";
        nilai_csvFile = null;
        return;
      }

      const lines = text.split(/\\r?\\n/).filter((line: string) => line.trim() !== "");
      if (lines.length < 2) {
        nilai_csvImportError = "CSV harus memiliki setidaknya baris header dan satu baris data.";
        nilai_csvFile = null;
        return;
      }

      const separator = text.includes("\\t") ? "\\t" : text.includes(";") ? ";" : ",";
      const rawHeaders = parseCSVLine(lines[0], separator);
      const headers = rawHeaders.map((h: string) => h.trim().toLowerCase());

      const nisIdx = findIndex(["nis", "no_induk", "nomor induk", "no induk", "nomor induk siswa"], headers);
      const namaIdx = findIndex(["nama", "nama_siswi", "nama lengkap"], headers);
      const periodeIdx = findIndex(["periode", "semester"], headers);
      const tahunIdx = findIndex(["tahun_ajaran", "tahun ajaran", "tahun"], headers);
      const kategoriIdx = findIndex(["kategori", "kategori_mazeeda", "mazeeda"], headers);

      if (nisIdx === -1) {
        nilai_csvImportError = "Kolom 'NIS' wajib ada di file CSV.";
        nilai_csvFile = null;
        return;
      }

      const standardIndices = new Set([nisIdx, namaIdx, periodeIdx, tahunIdx, kategoriIdx]);
      const subjectHeaders: { idx: number, name: string }[] = [];
      headers.forEach((h: string, idx: number) => {
        if (!standardIndices.has(idx) && h !== "") {
          subjectHeaders.push({ idx, name: rawHeaders[idx].trim() });
        }
      });

      if (subjectHeaders.length === 0) {
        nilai_csvImportError = "Tidak ditemukan kolom mata pelajaran.";
        nilai_csvFile = null;
        return;
      }

      let list = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;
        const columns = parseCSVLine(line, separator);

        let nis = "";
        if (nisIdx !== -1 && nisIdx < columns.length) nis = columns[nisIdx];
        if (!nis) continue;
        
        let nama = "";
        if (namaIdx !== -1 && namaIdx < columns.length) nama = columns[namaIdx];

        let periode = "";
        if (periodeIdx !== -1 && periodeIdx < columns.length) periode = columns[periodeIdx];

        let tahun = "";
        if (tahunIdx !== -1 && tahunIdx < columns.length) tahun = columns[tahunIdx];

        let kategori = "";
        if (kategoriIdx !== -1 && kategoriIdx < columns.length) kategori = columns[kategoriIdx];

        for (const sub of subjectHeaders) {
          let rawNilai = "";
          if (sub.idx < columns.length) rawNilai = columns[sub.idx];

          if (rawNilai && rawNilai.trim() !== "") {
            let numNilai = parseFloat(rawNilai.replace(',', '.'));
            list.push({
              nis: nis.slice(0, 20),
              nama_siswi: nama,
              periode: periode,
              tahun_ajaran: tahun,
              kategori: kategori,
              mata_pelajaran: sub.name,
              nilai: isNaN(numNilai) ? null : numNilai,
              catatan: isNaN(numNilai) ? rawNilai : ""
            });
          }
        }
      }

      if (list.length === 0) {
        nilai_csvImportError = "Tidak ditemukan data nilai valid di CSV.";
        nilai_csvFile = null;
      } else {
        nilai_parsedCSVData = list;
        nilai_csvImportStatus = `Berhasil memproses ${nilai_parsedCSVData.length} baris nilai pelajaran dari CSV.`;
      }
    };
    reader.onerror = () => {
      nilai_csvImportError = "Gagal membaca berkas CSV.";
      nilai_csvFile = null;
    };
    reader.readAsText(file);
  }

  async function handleUploadNilaiCSV() {
    if (nilai_parsedCSVData.length === 0) return;
    
    nilai_csvImportStatus = `Mengunggah data ke ${nilai_targetTable}...`;
    nilai_csvImportError = "";
    isImporting = true;

    try {
      const { error: err } = await supabase
        .from(nilai_targetTable)
        .insert(nilai_parsedCSVData);

      if (err) throw err;

      triggerAlert(`Berhasil mengimpor ${nilai_parsedCSVData.length} baris nilai ke tabel ${nilai_targetTable}!`);
      nilai_parsedCSVData = [];
      nilai_csvFile = null;
      nilai_csvImportStatus = "";
    } catch (err: any) {
      console.error(err);
      nilai_csvImportError = "Gagal mengunggah data: " + err.message;
      nilai_csvImportStatus = "";
    } finally {
      isImporting = false;
    }
  }

"""

content = content.replace('  // --- Gallery Management ---', state_logic + '  // --- Gallery Management ---')

ui_html = """
  {:else if activeSection === 'nilai'}
    <!-- ==================== NILAI AKADEMIK ==================== -->
    <div in:fade={{ duration: 200 }} class="space-y-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Award class="h-8 w-8 text-primary" />
            Upload Nilai Akademik
          </h1>
          <p class="text-sm text-slate-500 mt-1">Upload CSV nilai tamrin atau nilai ujian semester santri.</p>
        </div>
      </div>

      <Card class="p-6">
        <h3 class="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <UploadCloud class="h-5 w-5 text-emerald-500" />
          Import CSV Nilai
        </h3>
        
        <div class="mb-4">
          <label class="block text-xs font-bold text-slate-500 mb-2">Pilih Tujuan Tabel Database</label>
          <select bind:value={nilai_targetTable} class="w-full sm:w-64 text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary">
            <option value="nilai_tamrin">Tabel: nilai_tamrin</option>
            <option value="nilai_ujian">Tabel: nilai_ujian</option>
          </select>
        </div>

        <div class="space-y-4">
          <div class="p-4 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 hover:border-emerald-400 transition-colors relative group text-center cursor-pointer">
            <input type="file" accept=".csv" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" on:change={(e) => {
              const files = (e.target as HTMLInputElement).files;
              if (files && files.length > 0) nilai_processCSV(files[0]);
            }} />
            <div class="flex flex-col items-center justify-center space-y-2 text-slate-500 group-hover:text-emerald-500 transition-colors">
              <UploadCloud class="h-8 w-8" />
              <p class="text-sm font-semibold">Klik atau Drag & Drop file CSV Nilai di sini</p>
              <p class="text-xs opacity-75">Hanya file berformat .csv yang diterima</p>
            </div>
          </div>

          <div class="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
            <h4 class="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Info class="h-3 w-3" /> Panduan Format CSV Nilai
            </h4>
            <ul class="text-xs text-indigo-700/80 space-y-1.5 list-disc list-inside">
              <li>Header wajib: <code class="font-mono bg-indigo-100 px-1 rounded">nis</code></li>
              <li>Header informasi opsional: <code class="font-mono bg-indigo-100 px-1 rounded">nama_siswi</code>, <code class="font-mono bg-indigo-100 px-1 rounded">periode</code>, <code class="font-mono bg-indigo-100 px-1 rounded">tahun_ajaran</code>, <code class="font-mono bg-indigo-100 px-1 rounded">kategori</code></li>
              <li>Selain header di atas, <strong>kolom lainnya akan dianggap sebagai nama Mata Pelajaran</strong>.</li>
              <li>Contoh Format CSV yang benar: <br/>
                <code class="font-mono bg-indigo-100 px-1 rounded block mt-1 overflow-x-auto whitespace-nowrap p-2">
                  nis,nama_siswi,periode,tahun_ajaran,MTK,Fiqih,Nahwu<br/>
                  22001,Aisyah,Ganjil,2024/2025,85,90,75<br/>
                  22002,Fatimah,Ganjil,2024/2025,80,88,82
                </code>
              </li>
            </ul>
          </div>

          {#if nilai_csvImportError}
            <div class="p-3 bg-rose-50 text-rose-600 text-sm rounded-lg border border-rose-100 flex items-start gap-2">
              <X class="h-4 w-4 mt-0.5 shrink-0" />
              <p>{nilai_csvImportError}</p>
            </div>
          {/if}
          {#if nilai_csvImportStatus}
            <div class="p-3 bg-emerald-50 text-emerald-600 text-sm rounded-lg border border-emerald-100 flex items-start gap-2">
              <CheckCircle class="h-4 w-4 mt-0.5 shrink-0" />
              <p>{nilai_csvImportStatus}</p>
            </div>
          {/if}

          {#if nilai_parsedCSVData.length > 0}
            <div class="flex justify-end pt-2">
              <Button on:click={handleUploadNilaiCSV} disabled={isImporting} class="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-2 rounded-xl shadow-lg shadow-emerald-500/20">
                {#if isImporting}
                  <div class="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Mengunggah...
                {:else}
                  <UploadCloud class="h-4 w-4 mr-2" />
                  Mulai Import ke Database
                {/if}
              </Button>
            </div>
          {/if}
        </div>
      </Card>
    </div>
"""

content = content.replace("  {:else if activeSection === 'kepengurusan'}", ui_html + "  {:else if activeSection === 'kepengurusan'}")

with open(r'c:\MAZEEDA\MAZEEDA CODING\New folder\src\routes\admin\+page.svelte', 'w', encoding='utf-8') as f:
    f.write(content)

print("Added Nilai section successfully")
