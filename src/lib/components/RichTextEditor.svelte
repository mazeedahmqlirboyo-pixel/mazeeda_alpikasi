<script lang="ts">
  import { onMount } from 'svelte';
  import { 
    Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify,
    List, ListOrdered, Heading1, Heading2, Type, RefreshCw, Palette,
    ImagePlus, Trash2, Check
  } from 'lucide-svelte';
  import { uploadMemoryPhoto } from '$lib/supabase';

  export let value = '';
  export let placeholder = 'Tulis teks di sini...';

  let editorElement: HTMLDivElement;
  let fileInput: HTMLInputElement;
  
  let showColors = false;
  let isUploading = false;
  
  // Track selected element for deletion
  let selectedElement: HTMLElement | null = null;

  const colors = [
    { name: 'Default', value: '#1E293B' },
    { name: 'Biru (Primary)', value: '#2563EB' },
    { name: 'Hijau (Success)', value: '#10B981' },
    { name: 'Merah (Danger)', value: '#EF4444' },
    { name: 'Oranye (Warning)', value: '#F59E0B' },
    { name: 'Ungu', value: '#8B5CF6' },
    { name: 'Emas (Kuning)', value: '#D97706' }
  ];

  function execCommand(command: string, val: string = '') {
    document.execCommand(command, false, val);
    updateValue();
    if (editorElement) editorElement.focus();
  }

  function insertHtmlAtCursor(html: string) {
    if (editorElement) editorElement.focus();
    let sel = window.getSelection();
    if (sel && sel.getRangeAt && sel.rangeCount) {
      let range = sel.getRangeAt(0);
      
      // Ensure cursor is inside editor
      if (!editorElement.contains(range.commonAncestorContainer)) {
        range.selectNodeContents(editorElement);
        range.collapse(false);
      }

      const el = document.createElement("div");
      el.innerHTML = html;
      let frag = document.createDocumentFragment(), node, lastNode;
      while ((node = el.firstChild)) {
        lastNode = frag.appendChild(node);
      }
      range.insertNode(frag);
      
      if (lastNode) {
        range = range.cloneRange();
        range.setStartAfter(lastNode);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    } else {
      editorElement.innerHTML += html;
    }
    updateValue();
  }

  async function compressImage(file: File, maxWidth = 1000, quality = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(file);
          
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          }, 'image/jpeg', quality);
        };
        img.onerror = (e) => reject(e);
      };
      reader.onerror = (e) => reject(e);
    });
  }

  async function handleImageUpload(e: Event) {
    const target = e.target as HTMLInputElement;
    if (!target.files || target.files.length === 0) return;
    
    isUploading = true;
    try {
      const file = target.files[0];
      const compressed = await compressImage(file);
      const url = await uploadMemoryPhoto(compressed, 'khasanah');
      
      // Default to inserting a simple image if no layout is specifically triggered,
      // but here we just insert a standard full width image if they just clicked upload
      insertHtmlAtCursor(`<img src="${url}" class="w-full h-auto rounded-2xl shadow-md my-4" />&nbsp;`);
    } catch (err: any) {
      alert("Gagal mengupload gambar: " + err.message);
    } finally {
      isUploading = false;
      target.value = '';
    }
  }

  function updateValue() {
    if (editorElement) {
      value = editorElement.innerHTML;
    }
  }

  function handlePaste(e: ClipboardEvent) {
    e.preventDefault();
    const text = e.clipboardData?.getData('text/plain') || '';
    document.execCommand('insertText', false, text);
    updateValue();
  }

  // --- Smart Deletion System ---
  function handleEditorClick(e: MouseEvent) {
    // Clear previous selection
    if (selectedElement) {
      selectedElement.classList.remove('ring-4', 'ring-red-500', 'ring-offset-2', 'relative');
      selectedElement = null;
    }

    const target = e.target as HTMLElement;
    // If they click on an image or a custom block
    if (target.tagName === 'IMG' || target.closest('.khasanah-block')) {
      const elToSelect = target.tagName === 'IMG' ? target : (target.closest('.khasanah-block') as HTMLElement);
      selectedElement = elToSelect;
      
      // Add red outline to indicate it's selected for deletion
      selectedElement.classList.add('ring-4', 'ring-red-500', 'ring-offset-2', 'relative');
    }
  }

  function handleEditorKeyDown(e: KeyboardEvent) {
    if (selectedElement && (e.key === 'Backspace' || e.key === 'Delete')) {
      e.preventDefault(); // Prevent normal backspace
      selectedElement.remove();
      selectedElement = null;
      updateValue();
    } else if (selectedElement && e.key !== 'Shift' && e.key !== 'Control' && e.key !== 'Alt') {
      // If they start typing something else, clear selection
      selectedElement.classList.remove('ring-4', 'ring-red-500', 'ring-offset-2', 'relative');
      selectedElement = null;
    }
  }

  function deleteSelected() {
    if (selectedElement) {
      selectedElement.remove();
      selectedElement = null;
      updateValue();
    }
  }

  onMount(() => {
    if (editorElement && value) {
      editorElement.innerHTML = value;
    }
  });

  $: if (editorElement && value !== editorElement.innerHTML) {
    // Prevent overriding when user is typing, only update if it comes from outside explicitly
    if (!editorElement.contains(document.activeElement)) {
      editorElement.innerHTML = value || '';
    }
  }
</script>

<div class="border border-slate-200/80 rounded-2xl overflow-hidden shadow-soft-sm bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all duration-200 flex flex-col relative">
  
  {#if isUploading}
    <div class="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-50 flex items-center justify-center">
      <div class="bg-white p-4 rounded-xl shadow-lg flex items-center space-x-3 border border-slate-100">
        <RefreshCw class="animate-spin text-primary h-5 w-5" />
        <span class="text-sm font-bold text-slate-800">Mengupload Foto...</span>
      </div>
    </div>
  {/if}

  <!-- Toolbar -->
  <div class="bg-slate-50 border-b border-slate-200/60 p-2 flex flex-wrap gap-1 items-center sticky top-0 z-40">
    
    <!-- Formatting buttons -->
    <div class="flex items-center bg-white border border-slate-200/80 rounded-lg p-0.5 shadow-soft-sm">
      <button type="button" on:click={() => execCommand('bold')} class="p-1.5 rounded-md hover:bg-slate-100 text-slate-600" title="Tebal"><Bold class="h-4 w-4" /></button>
      <button type="button" on:click={() => execCommand('italic')} class="p-1.5 rounded-md hover:bg-slate-100 text-slate-600" title="Miring"><Italic class="h-4 w-4" /></button>
      <button type="button" on:click={() => execCommand('underline')} class="p-1.5 rounded-md hover:bg-slate-100 text-slate-600" title="Garis Bawah"><Underline class="h-4 w-4" /></button>
    </div>

    <!-- Alignments -->
    <div class="flex items-center bg-white border border-slate-200/80 rounded-lg p-0.5 shadow-soft-sm">
      <button type="button" on:click={() => execCommand('justifyLeft')} class="p-1.5 rounded-md hover:bg-slate-100 text-slate-600" title="Kiri"><AlignLeft class="h-4 w-4" /></button>
      <button type="button" on:click={() => execCommand('justifyCenter')} class="p-1.5 rounded-md hover:bg-slate-100 text-slate-600" title="Tengah"><AlignCenter class="h-4 w-4" /></button>
      <button type="button" on:click={() => execCommand('justifyRight')} class="p-1.5 rounded-md hover:bg-slate-100 text-slate-600" title="Kanan"><AlignRight class="h-4 w-4" /></button>
    </div>

    <!-- Colors -->
    <div class="flex items-center bg-white border border-slate-200/80 rounded-lg p-0.5 shadow-soft-sm relative">
      <button type="button" on:click={() => showColors = !showColors} class="p-1.5 rounded-md hover:bg-slate-100 text-slate-600" title="Warna Teks"><Palette class="h-4 w-4" /></button>
      {#if showColors}
        <div class="absolute top-9 left-0 z-50 bg-white border border-slate-200 rounded-xl shadow-lg p-2 flex flex-col gap-1 w-40">
          {#each colors as color}
            <button type="button" on:click={() => { execCommand('foreColor', color.value); showColors = false; }} class="flex items-center space-x-2 w-full p-1.5 rounded-lg text-left text-xs font-semibold hover:bg-slate-50">
              <span class="w-3.5 h-3.5 rounded-full" style="background-color: {color.value}"></span>
              <span>{color.name}</span>
            </button>
          {/each}
        </div>
      {/if}
    </div>

    <div class="w-px h-6 bg-slate-300 mx-1"></div>

    <!-- NEW: Khasanah Specific Tools -->
    
    <!-- Direct Upload -->
    <div class="flex items-center bg-white border border-slate-200/80 rounded-lg p-0.5 shadow-soft-sm">
      <input type="file" bind:this={fileInput} on:change={handleImageUpload} accept="image/*" class="hidden" />
      <button type="button" on:click={() => fileInput.click()} class="flex items-center space-x-1 p-1.5 px-2 rounded-md hover:bg-blue-50 text-blue-600 font-semibold text-xs transition-colors" title="Upload Gambar dari HP/PC">
        <ImagePlus class="h-4 w-4" />
        <span>Foto Tengah</span>
      </button>
    </div>

    <!-- Smart Delete Button (Only shows when something is selected) -->
    {#if selectedElement}
      <button type="button" on:click={deleteSelected} class="ml-auto flex items-center space-x-1 p-1.5 px-3 rounded-md bg-rose-500 text-white font-bold text-xs hover:bg-rose-600 shadow-md animate-pulse">
        <Trash2 class="h-4 w-4" />
        <span>Hapus Pilihan</span>
      </button>
    {/if}

  </div>

  <!-- Editable Field -->
  <div class="relative flex-1 min-h-[400px] flex">
    {#if !value || value === '<br>' || value === '<div><br></div>'}
      <div class="absolute inset-0 pointer-events-none text-slate-400 text-xs p-4 leading-relaxed select-none">
        {placeholder}
      </div>
    {/if}
    
    <div
      id="rich-editor"
      bind:this={editorElement}
      contenteditable="true"
      on:input={updateValue}
      on:blur={updateValue}
      on:paste={handlePaste}
      on:click={handleEditorClick}
      on:keydown={handleEditorKeyDown}
      class="flex-1 p-6 text-slate-800 text-sm leading-relaxed outline-none min-h-full overflow-y-auto font-sans"
      style="user-select: text; -webkit-user-select: text;"
    ></div>
  </div>
</div>

<style>
  /* Base Editor Styles */
  :global(#rich-editor p) {
    margin-bottom: 1rem;
    line-height: 1.8;
  }
  :global(#rich-editor ul) {
    list-style-type: disc;
    padding-left: 1.5rem;
    margin-bottom: 1rem;
  }
  :global(#rich-editor ol) {
    list-style-type: decimal;
    padding-left: 1.5rem;
    margin-bottom: 1rem;
  }
  :global(#rich-editor h1), :global(#rich-editor h2), :global(#rich-editor h3) {
    font-weight: 800;
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
    color: #0F172A;
  }

  /* Clearfix for floats */
  :global(#rich-editor::after) {
    content: "";
    display: table;
    clear: both;
  }
</style>
