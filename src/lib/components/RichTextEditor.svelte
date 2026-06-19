<script lang="ts">
  import { onMount } from 'svelte';
  import { 
    Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify,
    List, ListOrdered, Heading1, Heading2, Type, RefreshCw, Palette
  } from 'lucide-svelte';

  export let value = '';
  export let placeholder = 'Tulis teks di sini...';

  let editorElement: HTMLDivElement;
  let showColors = false;

  const colors = [
    { name: 'Default', value: '#1E293B' },
    { name: 'Biru (Primary)', value: '#2563EB' },
    { name: 'Hijau (Success)', value: '#10B981' },
    { name: 'Merah (Danger)', value: '#EF4444' },
    { name: 'Oranye (Warning)', value: '#F59E0B' },
    { name: 'Ungu', value: '#8B5CF6' },
    { name: 'Emas (Kuning)', value: '#D97706' }
  ];

  function execCommand(command: string, value: string = '') {
    document.execCommand(command, false, value);
    updateValue();
    if (editorElement) editorElement.focus();
  }

  function applyEditorStyles() {
    if (!editorElement) return;
    
    // Find all blocks (p, div, li, blockquote, h1, h2)
    const blocks = editorElement.querySelectorAll('p, div, li, blockquote, h1, h2');
    
    blocks.forEach(block => {
      const htmlBlock = block as HTMLElement;
      
      const hasBlockChildren = htmlBlock.querySelector('p, div, li, blockquote, h1, h2') !== null;
      if (hasBlockChildren) return;
      
      const text = htmlBlock.textContent || '';
      const cleanText = text.trim();
      
      if (cleanText.startsWith('@')) {
        // Style as blue translation
        htmlBlock.style.color = '#2563EB';
        htmlBlock.style.fontFamily = "'Outfit', 'Inter', sans-serif";
      } else {
        // Reset color if it was previously set to blue by us
        if (htmlBlock.style.color === 'rgb(37, 99, 235)' || htmlBlock.style.color === '#2563EB' || htmlBlock.style.color === 'blue') {
          htmlBlock.style.color = '';
          if (htmlBlock.style.fontFamily === "'Outfit', 'Inter', sans-serif") {
            htmlBlock.style.fontFamily = '';
          }
        }
      }
      
      // Kalam Nadzom: Center align blocks containing '#'
      if (cleanText.includes('#')) {
        htmlBlock.style.textAlign = 'center';
      } else {
        if (htmlBlock.style.textAlign === 'center') {
          htmlBlock.style.textAlign = '';
        }
      }
    });
  }

  function updateValue() {
    if (editorElement) {
      applyEditorStyles();
      value = editorElement.innerHTML;
    }
  }

  function handlePaste(e: ClipboardEvent) {
    e.preventDefault();
    const text = e.clipboardData?.getData('text/plain') || '';
    // Strip HTML to paste as clean text
    document.execCommand('insertText', false, text);
    updateValue();
  }

  // Helper to apply Text Direction (LTR / RTL) for the selection parent block
  function setDirection(dir: 'ltr' | 'rtl') {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      let parent = range.commonAncestorContainer as HTMLElement;
      if (parent.nodeType === Node.TEXT_NODE) {
        parent = parent.parentNode as HTMLElement;
      }
      
      while (parent && parent !== editorElement) {
        if (['DIV', 'P', 'H1', 'H2', 'LI', 'SPAN', 'BLOCKQUOTE'].includes(parent.tagName)) {
          parent.setAttribute('dir', dir);
          if (dir === 'rtl') {
            parent.style.textAlign = 'right';
            parent.style.direction = 'rtl';
            parent.style.fontFamily = "'KFGQPC Uthmanic Script HAFS', 'Amiri Quran', 'Scheherazade New', 'Amiri', 'Traditional Arabic', serif";
          } else {
            parent.style.textAlign = 'left';
            parent.style.direction = 'ltr';
            parent.style.fontFamily = "'Outfit', 'Inter', sans-serif";
          }
          break;
        }
        parent = parent.parentNode as HTMLElement;
      }
      updateValue();
      editorElement.focus();
    }
  }

  function addArabicClass() {
    // Wrap selection with an arabic styled font
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = selection.toString();
      if (!selectedText.trim()) return;

      const span = document.createElement('span');
      span.className = 'font-arabic text-right tracking-wide leading-loose block py-2';
      span.style.fontSize = '28px';
      span.style.direction = 'rtl';
      span.setAttribute('dir', 'rtl');
      span.style.fontFamily = "'KFGQPC Uthmanic Script HAFS', 'Amiri Quran', 'Scheherazade New', 'Amiri', 'Traditional Arabic', serif";
      span.textContent = selectedText;
      
      range.deleteContents();
      range.insertNode(span);
      updateValue();
      editorElement.focus();
    }
  }

  onMount(() => {
    // If we have initial value, display it
    if (editorElement && value) {
      editorElement.innerHTML = value;
      applyEditorStyles();
    }
  });

  // Keep editor content in sync if value changes externally (e.g. edit mode loads)
  $: if (editorElement && value !== editorElement.innerHTML) {
    editorElement.innerHTML = value || '';
    applyEditorStyles();
  }
</script>

<div class="border border-slate-200/80 rounded-2xl overflow-hidden shadow-soft-sm bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all duration-200 flex flex-col">
  <!-- Toolbar -->
  <div class="bg-slate-50 border-b border-slate-200/60 p-2 flex flex-wrap gap-1 items-center">
    
    <!-- Formatting buttons -->
    <div class="flex items-center bg-white border border-slate-200/80 rounded-lg p-0.5 shadow-soft-sm">
      <button
        type="button"
        on:click={() => execCommand('bold')}
        class="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-800 transition-colors"
        title="Tebal (Bold)"
      >
        <Bold class="h-4 w-4" />
      </button>
      <button
        type="button"
        on:click={() => execCommand('italic')}
        class="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-800 transition-colors"
        title="Miring (Italic)"
      >
        <Italic class="h-4 w-4" />
      </button>
      <button
        type="button"
        on:click={() => execCommand('underline')}
        class="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-800 transition-colors"
        title="Garis Bawah (Underline)"
      >
        <Underline class="h-4 w-4" />
      </button>
    </div>

    <!-- Heading / Style -->
    <div class="flex items-center bg-white border border-slate-200/80 rounded-lg p-0.5 shadow-soft-sm">
      <button
        type="button"
        on:click={() => execCommand('formatBlock', 'H1')}
        class="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-800 transition-colors font-bold text-xs px-2"
        title="Judul 1 (Heading 1)"
      >
        H1
      </button>
      <button
        type="button"
        on:click={() => execCommand('formatBlock', 'H2')}
        class="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-800 transition-colors font-bold text-xs px-2"
        title="Judul 2 (Heading 2)"
      >
        H2
      </button>
      <button
        type="button"
        on:click={() => execCommand('formatBlock', 'P')}
        class="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-800 transition-colors font-bold text-xs px-2"
        title="Paragraf Biasa"
      >
        P
      </button>
    </div>

    <!-- Alignments -->
    <div class="flex items-center bg-white border border-slate-200/80 rounded-lg p-0.5 shadow-soft-sm">
      <button
        type="button"
        on:click={() => execCommand('justifyLeft')}
        class="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-800 transition-colors"
        title="Rata Kiri"
      >
        <AlignLeft class="h-4 w-4" />
      </button>
      <button
        type="button"
        on:click={() => execCommand('justifyCenter')}
        class="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-800 transition-colors"
        title="Rata Tengah"
      >
        <AlignCenter class="h-4 w-4" />
      </button>
      <button
        type="button"
        on:click={() => execCommand('justifyRight')}
        class="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-800 transition-colors"
        title="Rata Kanan"
      >
        <AlignRight class="h-4 w-4" />
      </button>
      <button
        type="button"
        on:click={() => execCommand('justifyFull')}
        class="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-800 transition-colors"
        title="Rata Kiri Kanan"
      >
        <AlignJustify class="h-4 w-4" />
      </button>
    </div>

    <!-- Direction (LTR/RTL) - Crucial for Arabic -->
    <div class="flex items-center bg-white border border-slate-200/80 rounded-lg p-0.5 shadow-soft-sm gap-0.5">
      <button
        type="button"
        on:click={() => setDirection('ltr')}
        class="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-800 transition-colors text-xs font-bold px-2"
        title="Arah LTR (Kiri ke Kanan)"
      >
        LTR
      </button>
      <button
        type="button"
        on:click={() => setDirection('rtl')}
        class="p-1.5 rounded-md hover:bg-teal-50 hover:text-teal-700 text-slate-600 transition-colors text-xs font-bold px-2"
        title="Arah RTL (Arab - Kanan ke Kiri)"
      >
        RTL (Arab)
      </button>
      <button
        type="button"
        on:click={addArabicClass}
        class="p-1.5 rounded-md hover:bg-teal-50 hover:text-teal-700 text-teal-600 transition-colors text-xs font-bold px-1.5 border border-teal-100 bg-teal-50/20"
        title="Setel Seleksi Teks sebagai Font Arab"
      >
        Format Arab
      </button>
    </div>

    <!-- Lists -->
    <div class="flex items-center bg-white border border-slate-200/80 rounded-lg p-0.5 shadow-soft-sm">
      <button
        type="button"
        on:click={() => execCommand('insertUnorderedList')}
        class="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-800 transition-colors"
        title="Daftar Poin (Bullet List)"
      >
        <List class="h-4 w-4" />
      </button>
      <button
        type="button"
        on:click={() => execCommand('insertOrderedList')}
        class="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-800 transition-colors"
        title="Daftar Angka (Numbered List)"
      >
        <ListOrdered class="h-4 w-4" />
      </button>
    </div>

    <!-- Colors & Clear Formatting -->
    <div class="flex items-center bg-white border border-slate-200/80 rounded-lg p-0.5 shadow-soft-sm relative">
      <button
        type="button"
        on:click={() => showColors = !showColors}
        class="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-800 transition-colors"
        title="Warna Teks"
      >
        <Palette class="h-4 w-4" />
      </button>
      
      {#if showColors}
        <div class="absolute top-9 left-0 z-30 bg-white border border-slate-200 rounded-xl shadow-soft-lg p-2 flex flex-col gap-1 w-40">
          {#each colors as color}
            <button
              type="button"
              on:click={() => { execCommand('foreColor', color.value); showColors = false; }}
              class="flex items-center space-x-2 w-full p-1.5 rounded-lg text-left text-xs font-semibold hover:bg-slate-50 text-slate-700"
            >
              <span class="w-3.5 h-3.5 rounded-full border border-slate-200 shrink-0" style="background-color: {color.value}"></span>
              <span>{color.name}</span>
            </button>
          {/each}
        </div>
      {/if}

      <button
        type="button"
        on:click={() => execCommand('removeFormat')}
        class="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-800 transition-colors"
        title="Hapus Format (Clear Formatting)"
      >
        <RefreshCw class="h-4 w-4" />
      </button>
    </div>

  </div>

  <!-- Editable Field -->
  <div class="relative flex-1 min-h-[300px] flex">
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
      class="flex-1 p-4 text-slate-800 text-sm leading-relaxed outline-none min-h-full overflow-y-auto font-sans focus:outline-none"
      style="user-select: text; -webkit-user-select: text;"
    ></div>
  </div>
</div>

<style>
  /* Custom bullet and padding styles for list rendering inside contenteditable */
  :global(#rich-editor ul) {
    list-style-type: disc;
    padding-left: 1.5rem;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
  }
  :global(#rich-editor ol) {
    list-style-type: decimal;
    padding-left: 1.5rem;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
  }
  :global(#rich-editor h1) {
    font-size: 1.5rem;
    font-weight: 800;
    margin-top: 0.75rem;
    margin-bottom: 0.5rem;
    color: #1E293B;
  }
  :global(#rich-editor h2) {
    font-size: 1.25rem;
    font-weight: 700;
    margin-top: 0.75rem;
    margin-bottom: 0.5rem;
    color: #1E293B;
  }
</style>
