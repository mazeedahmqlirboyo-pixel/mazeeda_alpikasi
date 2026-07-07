<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { supabase, uploadMemoryPhoto } from '$lib/supabase';
  import Card from '$lib/components/ui/card.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import Input from '$lib/components/ui/input.svelte';
  import Tabs from '$lib/components/ui/tabs.svelte';
  import RichTextEditor from '$lib/components/RichTextEditor.svelte';
  import { ArrowLeft, Edit, Trash2, Plus, Save, X, CheckCircle, UploadCloud, RefreshCw } from 'lucide-svelte';

  let activeTab = 'mozaik';
  const tabs = [
    { label: 'Mozaik Murobbi', value: 'mozaik' },
    { label: 'Sambutan', value: 'sambutan' },
    { label: 'Profil Unit', value: 'units' }
  ];

  let items: any[] = [];
  let isLoading = false;
  let isSubmitting = false;
  let alertMessage = '';
  
  let fileInputImage: HTMLInputElement;
  let fileInputSignature: HTMLInputElement;
  let isUploadingImg = false;
  let isUploadingSig = false;

  // Form State
  let showForm = false;
  let editingId: number | null = null;
  let formSlug = '';
  let formName = '';
  let formTitle = ''; // Used for 'title' or 'type'
  let formImageUrl = '';
  let formSignatureUrl = '';
  let formShortDesc = '';
  let formContent = '';

  function triggerAlert(msg: string) {
    alertMessage = msg;
    setTimeout(() => alertMessage = '', 3000);
  }

  async function handleUpload(e: Event, type: 'image' | 'signature') {
    const target = e.target as HTMLInputElement;
    if (!target.files || target.files.length === 0) return;
    
    if (type === 'image') isUploadingImg = true;
    else isUploadingSig = true;

    try {
      const file = target.files[0];
      const url = await uploadMemoryPhoto(file, 'khasanah_assets');
      if (type === 'image') formImageUrl = url;
      else formSignatureUrl = url;
      triggerAlert('File berhasil diunggah!');
    } catch (err: any) {
      alert("Gagal mengupload file: " + err.message);
    } finally {
      if (type === 'image') isUploadingImg = false;
      else isUploadingSig = false;
      target.value = ''; // Reset input
    }
  }

  $: activeTab, fetchItems();

  async function fetchItems() {
    isLoading = true;
    try {
      const table = `khasanah_${activeTab}`;
      const { data, error } = await supabase.from(table).select('*').order('id', { ascending: true });
      if (error) throw error;
      items = data || [];
    } catch (err: any) {
      alert("Error fetching data: " + err.message);
    } finally {
      isLoading = false;
    }
  }

  function resetForm() {
    editingId = null;
    formSlug = '';
    formName = '';
    formTitle = '';
    formImageUrl = '';
    formSignatureUrl = '';
    formShortDesc = '';
    formContent = '';
    showForm = false;
  }

  function openForm(item: any = null) {
    if (item) {
      editingId = item.id;
      formSlug = item.slug || '';
      formName = item.name || item.author || '';
      formTitle = item.title || item.type || '';
      formImageUrl = item.image_url || '';
      formSignatureUrl = item.signature_url || '';
      formShortDesc = item.short_desc || item.quote || '';
      formContent = item.content || '';
    } else {
      resetForm();
    }
    showForm = true;
  }

  async function saveItem() {
    isSubmitting = true;
    try {
      const table = `khasanah_${activeTab}`;
      let payload: any = {};

      if (activeTab === 'mozaik') {
        payload = { slug: formSlug, name: formName, title: formTitle, image_url: formImageUrl, short_desc: formShortDesc, content: formContent };
      } else if (activeTab === 'sambutan') {
        payload = { author: formName, title: formTitle, image_url: formImageUrl, signature_url: formSignatureUrl, quote: formShortDesc, content: formContent };
      } else if (activeTab === 'units') {
        payload = { slug: formSlug, name: formName, type: formTitle, image_url: formImageUrl, short_desc: formShortDesc, content: formContent };
      }

      if (editingId) {
        const { error } = await supabase.from(table).update(payload).eq('id', editingId);
        if (error) throw error;
        triggerAlert('Data berhasil diperbarui!');
      } else {
        const { error } = await supabase.from(table).insert([payload]);
        if (error) throw error;
        triggerAlert('Data baru berhasil ditambahkan!');
      }
      resetForm();
      await fetchItems();
    } catch (err: any) {
      alert("Error saving: " + err.message);
    } finally {
      isSubmitting = false;
    }
  }

  async function deleteItem(id: number) {
    if (!confirm('Hapus data ini?')) return;
    try {
      const table = `khasanah_${activeTab}`;
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      triggerAlert('Data berhasil dihapus!');
      await fetchItems();
    } catch (err: any) {
      alert("Error deleting: " + err.message);
    }
  }
</script>

<div class="min-h-screen bg-slate-50 pb-24 font-sans">
  {#if alertMessage}
    <div transition:fade class="fixed top-20 right-4 z-50 flex items-center p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold shadow-xl space-x-2.5">
      <CheckCircle class="h-4 w-4" />
      <span>{alertMessage}</span>
    </div>
  {/if}

  <div class="max-w-5xl mx-auto px-4 py-8 space-y-6">
    <div class="flex items-center space-x-4 mb-8">
      <a href="/admin">
        <Button variant="outline" class="p-2 border-slate-200 hover:bg-slate-100">
          <ArrowLeft class="h-5 w-5 text-slate-600" />
        </Button>
      </a>
      <div>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Khasanah Lirboyo CMS</h1>
        <p class="text-sm text-slate-500">Kelola artikel dinamis dengan Rich Text Editor.</p>
      </div>
    </div>

    <Tabs items={tabs} bind:activeTab class="w-full" />

    {#if !showForm}
      <Card class="p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-lg font-bold text-slate-800">Daftar {tabs.find(t => t.value === activeTab)?.label}</h2>
          <Button on:click={() => openForm()} class="flex items-center space-x-1">
            <Plus class="h-4 w-4" />
            <span>Tambah Baru</span>
          </Button>
        </div>

        {#if isLoading}
          <div class="flex justify-center p-8 text-slate-400">
            <RefreshCw class="animate-spin h-6 w-6" />
          </div>
        {:else}
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-50 border-y border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                  <th class="px-4 py-3 font-semibold">Foto</th>
                  <th class="px-4 py-3 font-semibold">Nama / Judul</th>
                  <th class="px-4 py-3 font-semibold w-1/3">Keterangan</th>
                  <th class="px-4 py-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-sm">
                {#each items as item}
                  <tr class="hover:bg-slate-50 transition-colors">
                    <td class="px-4 py-3">
                      <img src={item.image_url} alt="" class="w-12 h-12 rounded object-cover border border-slate-200" />
                    </td>
                    <td class="px-4 py-3">
                      <p class="font-bold text-slate-800">{item.name || item.author}</p>
                      <p class="text-xs text-slate-500">{item.title || item.type}</p>
                    </td>
                    <td class="px-4 py-3 text-slate-600">
                      <span class="line-clamp-2">{item.short_desc || item.quote}</span>
                    </td>
                    <td class="px-4 py-3 text-right">
                      <div class="flex justify-end space-x-2">
                        <button on:click={() => openForm(item)} class="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit">
                          <Edit class="h-4 w-4" />
                        </button>
                        <button on:click={() => deleteItem(item.id)} class="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors" title="Hapus">
                          <Trash2 class="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                {:else}
                  <tr><td colspan="4" class="text-center py-8 text-slate-400 text-sm">Tidak ada data.</td></tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      </Card>
    {:else}
      <Card class="p-6 animate-in slide-in-from-bottom-4 duration-300">
        <div class="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
          <h2 class="text-lg font-bold text-slate-800">{editingId ? 'Edit Data' : 'Tambah Baru'}</h2>
          <Button variant="outline" on:click={resetForm} class="h-8 border-slate-200">Batal</Button>
        </div>

        <form on:submit|preventDefault={saveItem} class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            {#if activeTab !== 'sambutan'}
              <div class="space-y-1">
                <label class="text-xs font-semibold text-slate-600">Slug (URL)</label>
                <Input bind:value={formSlug} placeholder="contoh: kh-ahmad-fulan" required />
              </div>
            {/if}

            <div class="space-y-1">
              <label class="text-xs font-semibold text-slate-600">Nama {activeTab === 'sambutan' ? 'Pemateri' : 'Lengkap'}</label>
              <Input bind:value={formName} required />
            </div>

            <div class="space-y-1">
              <label class="text-xs font-semibold text-slate-600">{activeTab === 'units' ? 'Tipe Unit' : 'Gelar / Judul'}</label>
              <Input bind:value={formTitle} required />
            </div>

            <div class="space-y-1">
              <label class="text-xs font-semibold text-slate-600">
                Link Foto (Image URL)
                <span class="block font-normal text-[10px] text-slate-400 mt-0.5">
                  {activeTab === 'sambutan' ? 'Rekomendasi: Rasio Persegi 1:1 (contoh: 500x500px)' : 'Rekomendasi: Rasio Lebar 16:9 (contoh: 1280x720px)'}
                </span>
              </label>
              <div class="flex space-x-2">
                <Input bind:value={formImageUrl} required />
                <input type="file" bind:this={fileInputImage} on:change={(e) => handleUpload(e, 'image')} accept="image/*" class="hidden" />
                <Button type="button" variant="outline" on:click={() => fileInputImage.click()} disabled={isUploadingImg} class="px-3 border-slate-200" title="Upload dari perangkat">
                  {#if isUploadingImg}<RefreshCw class="animate-spin h-4 w-4" />{:else}<UploadCloud class="h-4 w-4" />{/if}
                </Button>
              </div>
            </div>

            {#if activeTab === 'sambutan'}
              <div class="space-y-1">
                <label class="text-xs font-semibold text-slate-600">
                  Link Tanda Tangan (Signature URL)
                  <span class="block font-normal text-[10px] text-slate-400 mt-0.5">Rekomendasi: Gambar PNG Transparan (Maks. Tinggi 200px)</span>
                </label>
                <div class="flex space-x-2">
                  <Input bind:value={formSignatureUrl} required />
                  <input type="file" bind:this={fileInputSignature} on:change={(e) => handleUpload(e, 'signature')} accept="image/*" class="hidden" />
                  <Button type="button" variant="outline" on:click={() => fileInputSignature.click()} disabled={isUploadingSig} class="px-3 border-slate-200" title="Upload dari perangkat">
                    {#if isUploadingSig}<RefreshCw class="animate-spin h-4 w-4" />{:else}<UploadCloud class="h-4 w-4" />{/if}
                  </Button>
                </div>
              </div>
            {/if}
          </div>

          <div class="space-y-1">
            <label class="text-xs font-semibold text-slate-600">{activeTab === 'sambutan' ? 'Kutipan Pendek' : 'Deskripsi Singkat'}</label>
            <textarea bind:value={formShortDesc} class="w-full min-h-[80px] p-3 text-sm rounded-lg border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none" required></textarea>
          </div>

          <div class="space-y-1">
            <label class="text-xs font-semibold text-slate-600 flex items-center justify-between">
              Isi Artikel Lengkap
              <span class="font-normal text-[10px] text-amber-600 bg-amber-50 px-2 rounded-full border border-amber-200">Bisa menggunakan format teks dari Editor</span>
            </label>
            <RichTextEditor bind:value={formContent} placeholder="Tulis biografi atau artikel di sini..." />
          </div>

          <div class="flex justify-end pt-4 border-t border-slate-100">
            <Button type="submit" disabled={isSubmitting} class="flex items-center space-x-2">
              {#if isSubmitting}
                <RefreshCw class="animate-spin h-4 w-4" />
                <span>Menyimpan...</span>
              {:else}
                <Save class="h-4 w-4" />
                <span>Simpan Data</span>
              {/if}
            </Button>
          </div>
        </form>
      </Card>
    {/if}
  </div>
</div>
