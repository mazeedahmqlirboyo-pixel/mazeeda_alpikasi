<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, slide as slideTransition } from 'svelte/transition';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { supabase, uploadMemoryPhoto, uploadProfilePhoto } from '$lib/supabase';
  import Card from '$lib/components/ui/card.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import Input from '$lib/components/ui/input.svelte';
  import Tabs from '$lib/components/ui/tabs.svelte';
  import RichTextEditor from '$lib/components/RichTextEditor.svelte';
  import { 
    Users, Megaphone, Image, Plus, Trash2, Edit, Save, CheckCircle,
    UserPlus, UploadCloud, FileText, Heart, Globe, Phone, Home, 
    Award, Music, X, Bell, Search, BookOpen, Info, Calendar, ChevronRight,
    ChevronDown, ShieldCheck, UserX, UserCheck, RefreshCw, CheckCircle2, Filter, MessageCircle
  } from 'lucide-svelte';

  // Current active management tab
  let activeSection = 'members';
  let isMobileDropdownOpen = false;

  $: {
    const tabParam = $page.url.searchParams.get('tab');
    if (tabParam) {
      activeSection = tabParam;
    } else {
      activeSection = 'members';
    }
  }

  function handleMobileNav(e: Event) {
    const select = e.target as HTMLSelectElement;
    const val = select.value;
    if (val === 'khasanah') {
      goto('/admin/khasanah');
    } else {
      goto(`/admin?tab=${val}`, { replaceState: true });
    }
  }

  // Admin Management Tabs Configuration
  const sections = [
    { label: '👥 Kelola Squad', value: 'members' },
    { label: '🧑‍🏫 Kelola Asatidzah', value: 'asatidzah' },
    { label: '📊 Nilai Akademik', value: 'nilai' },
    { label: '🎓 Kelola Kepengurusan', value: 'kepengurusan' },
    { label: '✅ Persetujuan Foto', value: 'persetujuan_foto' },
    { label: '📖 Kelola Sangu', value: 'sangu' },
    { label: '📢 Pengumuman Mading', value: 'mading' },
    { label: '📌 Dinding Aspirasi', value: 'stickynotes' },
    { label: '📸 Kelola Timeline', value: 'timeline' },
    { label: '🔔 Notifikasi', value: 'notifikasi' },
    { label: '🎪 Banner Slide', value: 'carousel' },
    { label: '🖼️ Galeri Kenangan', value: 'gallery_coverflow' },
    { label: '🖼️ Momen Spesial', value: 'gallery_landscape' },
    { label: '🖼️ Wajah MAZEEDA', value: 'gallery_marquee' },
    { label: '📬 Kotak Saran', value: 'feedbacks' }
  ];

  // Custom confirmation modal states
  let showConfirmModal = false;
  let confirmModalTitle = '';
  let confirmModalMessage = '';
  let confirmModalCallback: (() => Promise<void> | void) | null = null;

  function runWithConfirmation(title: string, message: string, callback: () => Promise<void> | void) {
    confirmModalTitle = title;
    confirmModalMessage = message;
    confirmModalCallback = callback;
    showConfirmModal = true;
  }

  // Squad search query and filter
  let squadSearchQuery = '';
  let squadLoginFilter = 'all'; // 'all' | 'logged_in' | 'not_logged_in'
  let editingMemberId: any = null;
  let failedImages = new Set();

  // Generate Initials
  function getInitials(name: string) {
    if (!name) return 'M';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  // Consistent accent color mapping for cards (matched from Squad page)
  const accentPalette = [
    { border: 'border-l-violet-400',  avatar: 'bg-violet-50 border-violet-200 text-violet-600',  ring: 'ring-violet-300',  dot: 'bg-violet-400', gradient: 'from-violet-500 via-indigo-500 to-purple-600' },
    { border: 'border-l-sky-400',     avatar: 'bg-sky-50 border-sky-200 text-sky-600',            ring: 'ring-sky-300',     dot: 'bg-sky-400', gradient: 'from-sky-400 via-blue-500 to-indigo-600' },
    { border: 'border-l-emerald-400', avatar: 'bg-emerald-50 border-emerald-200 text-emerald-600',ring: 'ring-emerald-300', dot: 'bg-emerald-400', gradient: 'from-emerald-400 via-teal-500 to-cyan-600' },
    { border: 'border-l-rose-400',    avatar: 'bg-rose-50 border-rose-200 text-rose-600',         ring: 'ring-rose-300',    dot: 'bg-rose-400', gradient: 'from-rose-400 via-pink-500 to-red-500' },
    { border: 'border-l-amber-400',   avatar: 'bg-amber-50 border-amber-200 text-amber-600',      ring: 'ring-amber-300',   dot: 'bg-amber-400', gradient: 'from-amber-400 via-orange-400 to-yellow-500' },
    { border: 'border-l-teal-400',    avatar: 'bg-teal-50 border-teal-200 text-teal-600',         ring: 'ring-teal-300',    dot: 'bg-teal-400', gradient: 'from-teal-400 via-emerald-500 to-green-500' },
    { border: 'border-l-pink-400',    avatar: 'bg-pink-50 border-pink-200 text-pink-600',         ring: 'ring-pink-300',    dot: 'bg-pink-400', gradient: 'from-pink-400 via-rose-500 to-purple-500' },
    { border: 'border-l-indigo-400',  avatar: 'bg-indigo-50 border-indigo-200 text-indigo-600',   ring: 'ring-indigo-300',  dot: 'bg-indigo-400', gradient: 'from-indigo-500 via-purple-500 to-pink-500' },
    { border: 'border-l-orange-400',  avatar: 'bg-orange-50 border-orange-200 text-orange-600',   ring: 'ring-orange-300',  dot: 'bg-orange-400', gradient: 'from-orange-400 via-amber-500 to-red-500' },
    { border: 'border-l-cyan-400',    avatar: 'bg-cyan-50 border-cyan-200 text-cyan-600',         ring: 'ring-cyan-300',    dot: 'bg-cyan-400', gradient: 'from-cyan-400 via-sky-500 to-blue-500' }
  ];

  function getAccent(name: string) {
    if (!name) return accentPalette[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return accentPalette[Math.abs(hash) % accentPalette.length];
  }

  function formatDateTime(isoString: string) {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      }).replace('.', ':');
    } catch (e) {
      return '';
    }
  }

  function startEditMember(item: any) {
    editingMemberId = item.id;
    foto_url = item.foto_url || '';
    nama_lengkap = item.nama_lengkap || '';
    nama_panggilan = item.nama_panggilan || '';
    tempat_lahir = item.tempat_lahir || '';
    tahun_lahir = item.tahun_lahir || '';
    
    // map db goldar ('1' | '2' | '3') to form options ('A' | 'B' | 'AB' | 'O')
    if (item.golongan_darah === '1') golongan_darah = 'A';
    else if (item.golongan_darah === '2') golongan_darah = 'B';
    else golongan_darah = 'O'; // default fallback for goldar 3
    
    alamat_ktp = item.alamat_ktp || '';
    alamat_domisili = item.alamat_domisili || '';
    no_whatsapp = item.no_whatsapp || '';
    email = item.email || '';
    media_social = item.media_social || '';
    riwayat_pendidikan = item.riwayat_pendidikan || '';
    alamat_riwayatpendidikan = item.alamat_riwayatpendidikan || '';
    tahun_masuk = item.tahun_masuk ? String(item.tahun_masuk) : '2026';
    keterampilan_khusus = item.keterampilan_khusus || '';
    cita_cita = item.cita_cita || '';
    makanan_kesukaan = item.makanan_kesukaan || '';
    kutipan_kenangan = item.kutipan_kenangan || '';
    music = item.music || '';
    hobi = item.hobi || '';
    kesan = item.kesan || '';
    pesan = item.pesan || '';
    nis = item.nis || '';
    nama_ayah = item.nama_ayah || '';
    kategori_mazeeda = item.kategori_mazeeda || 'alumni';
    daerah_santri = item.daerah_santri || '';
    tiktok_akun = item.tiktok_akun || '';
    facebook_akun = item.facebook_akun || '';
    xtwitter_akun = item.xtwitter_akun || '';
    rute_lengkap = item.rute_lengkap || '';
    kamar_santri = item.kamar_santri || '';
    tahfidz_santri = item.tahfidz_santri || '';
    
    activeFormStep = 'personal';
  }

  function cancelEditMember() {
    editingMemberId = null;
    foto_url = ''; nama_lengkap = ''; nama_panggilan = ''; tempat_lahir = '';
    tahun_lahir = ''; golongan_darah = 'O'; alamat_ktp = ''; alamat_domisili = '';
    no_whatsapp = ''; email = ''; media_social = ''; riwayat_pendidikan = '';
    alamat_riwayatpendidikan = ''; tahun_masuk = '2026'; keterampilan_khusus = '';
    cita_cita = ''; makanan_kesukaan = '';
    kutipan_kenangan = ''; music = ''; hobi = ''; kesan = ''; pesan = '';
    nis = ''; nama_ayah = ''; kategori_mazeeda = activeSection === 'asatidzah' ? 'pengajar' : 'alumni'; daerah_santri = '';
    tiktok_akun = ''; facebook_akun = ''; xtwitter_akun = ''; rute_lengkap = '';
    kamar_santri = ''; tahfidz_santri = '';
  }


  // --- GLOBAL HELPERS ---
  let alertMessage = '';
  let alertType: 'success' | 'error' = 'success';
  let isSubmitting = false;
  function triggerAlert(msg: string, type: 'success' | 'error' = 'success') {
    alertMessage = msg;
    alertType = type;
    setTimeout(() => { alertMessage = ''; alertType = 'success'; }, 3000);
  }

  // --- 1. SQUAD MEMBERS CRUD (Direct Supabase Table: allowed_alumni) ---
  let squad: any[] = [];
  let isLoadingSquad = true;

  let squadTotalCount = 0;
  let squadLimit = 10;
  let searchTimeout: any;

  // React to search query, filter, or limit changes with debounce
  $: if (typeof window !== 'undefined' && (activeSection === 'members' || activeSection === 'asatidzah')) {
    const search = squadSearchQuery;
    const filter = squadLoginFilter;
    const limit = squadLimit;
    const section = activeSection; // dependency
    
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      fetchSquad(search, filter, limit, section);
    }, 300);
  }

  // Form input states matching the 29 database columns exactly
  let foto_url = '';
  let nama_lengkap = '';
  let nama_panggilan = '';
  let tempat_lahir = '';
  let tahun_lahir = '';
  let golongan_darah = 'O';
  let alamat_ktp = '';
  let alamat_domisili = '';
  let no_whatsapp = '';
  let email = '';
  let media_social = '';
  let riwayat_pendidikan = '';
  let alamat_riwayatpendidikan = ''; // ADDED
  let tahun_masuk = '2026';
  let keterampilan_khusus = '';
  let cita_cita = '';
  let makanan_kesukaan = '';
  let kutipan_kenangan = '';
  let music = '';
  let hobi = '';
  let kesan = '';
  let pesan = '';
  let nis = '';
  let nama_ayah = '';
  let kategori_mazeeda = 'alumni'; // 'alumni' | 'alumnus' | 'mustahiq' | 'mustahiqoh'
  let daerah_santri = '';
  let tiktok_akun = '';
  let facebook_akun = '';
  let xtwitter_akun = '';
  let rute_lengkap = '';
  let kamar_santri = '';
  let tahfidz_santri = '';

  // CSV Import States
  let isDragging = false;
  let csvFile: File | null = null;
  let parsedCSVData: any[] = [];
  let csvImportStatus = '';
  let csvImportError = '';

  // Batch Photo Upload States
  let isDraggingPhoto = false;
  let batchPhotoFiles: File[] = [];
  let batchPhotoStatus = '';
  let batchPhotoError = '';
  let batchPhotoProgress = { current: 0, total: 0, success: 0, failed: 0, skipped: 0 };

  async function compressImage(file: File, maxWidth = 800, quality = 0.8): Promise<File> {
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

  async function handleBatchPhotoUpload() {
    if (batchPhotoFiles.length === 0) return;
    
    isSubmitting = true;
    batchPhotoStatus = "Memproses dan mengompres foto...";
    batchPhotoError = "";
    batchPhotoProgress = { current: 0, total: batchPhotoFiles.length, success: 0, failed: 0, skipped: 0 };

    const tableName = activeSection === 'asatidzah' ? 'asatidzah' : 'allowed_alumni';
    
    for (const rawFile of batchPhotoFiles) {
      batchPhotoProgress.current++;
      const nameWithoutExt = rawFile.name.substring(0, rawFile.name.lastIndexOf('.')).toLowerCase().trim();
      
      try {
        // Compress image before processing
        const file = await compressImage(rawFile);
        
        // Find user by NIS or Nama Lengkap (case-insensitive)
        let query = supabase.from(tableName).select('id, nama_lengkap, nis');
        
        // If it's all digits, assume it's NIS, else name
        if (/^\d+$/.test(nameWithoutExt)) {
           query = query.eq('nis', nameWithoutExt);
        } else {
           query = query.ilike('nama_lengkap', nameWithoutExt);
        }

        const { data, error } = await query.maybeSingle();
        
        if (error || !data) {
          batchPhotoProgress.skipped++;
          continue; // No matching user found
        }
        
        // Match found, upload image
        const publicUrl = await uploadProfilePhoto(file);
        
        // Update user
        const { error: updateError } = await supabase
          .from(tableName)
          .update({ foto_url: publicUrl })
          .eq('id', data.id);
          
        if (updateError) throw updateError;
        
        batchPhotoProgress.success++;
      } catch (err) {
        console.error(`Failed to upload photo for ${file.name}:`, err);
        batchPhotoProgress.failed++;
      }
    }
    
    batchPhotoStatus = `Selesai: ${batchPhotoProgress.success} Berhasil, ${batchPhotoProgress.skipped} Dilewati (Nama tidak cocok), ${batchPhotoProgress.failed} Gagal.`;
    isSubmitting = false;
    
    // Refresh list
    if (activeSection === 'asatidzah') {
      await fetchAsatidzah();
    } else {
      await fetchSquad();
    }
  }

  function photo_handleDragOver(e: DragEvent) {
    e.preventDefault();
    isDraggingPhoto = true;
  }
  function photo_handleDragLeave() {
    isDraggingPhoto = false;
  }
  function photo_handleDrop(e: DragEvent) {
    e.preventDefault();
    isDraggingPhoto = false;
    if (e.dataTransfer && e.dataTransfer.files.length > 0) {
      batchPhotoFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
      batchPhotoError = "";
      batchPhotoStatus = `${batchPhotoFiles.length} foto dipilih. Klik "Mulai Upload Foto" untuk melanjutkan.`;
    }
  }
  function photo_handleFileSelect(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      batchPhotoFiles = Array.from(target.files).filter(f => f.type.startsWith('image/'));
      batchPhotoError = "";
      batchPhotoStatus = `${batchPhotoFiles.length} foto dipilih. Klik "Mulai Upload Foto" untuk melanjutkan.`;
    }
  }

  let isUploadingSinglePhoto = false;

  async function handleSinglePhotoUpload(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const rawFile = target.files[0];
      if (!rawFile.type.startsWith('image/')) {
        alert("File harus berupa gambar!");
        return;
      }
      
      isUploadingSinglePhoto = true;
      try {
        const file = await compressImage(rawFile);
        const publicUrl = await uploadProfilePhoto(file);
        foto_url = publicUrl;
        triggerAlert("Foto berhasil diunggah!");
      } catch (err: any) {
        alert("Gagal mengunggah foto: " + err.message);
      } finally {
        isUploadingSinglePhoto = false;
        target.value = '';
      }
    }
  }

  // Form step navigation for the member creation form
  let activeFormStep = 'personal'; // 'personal' | 'academic' | 'social' | 'messages'

  const stepTabs = [
    { label: 'Identitas Diri', value: 'personal' },
    { label: 'Pondok & Pendidikan', value: 'academic' },
    { label: 'Kontak & Medsos', value: 'social' },
    { label: 'Kesan & Pesan', value: 'messages' }
  ];

  // Capitalize each word helper
  function capitalizeEachWord(str: string) {
    if (!str) return '';
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Extract a 4-digit year from various date formats
  function extractYear(value: string): string {
    if (!value) return '';
    const match = value.match(/(\d{4})/);
    return match ? match[1] : '';
  }

  // Format WhatsApp to start with 0 and prevent exceeding 20 chars
  function normalizeWhatsApp(phone: string) {
    if (!phone) return '';
    // Jika ada nomor ganda (dipisah koma/garis miring), ambil yang pertama
    let firstPhone = phone.split(/[\/,]/)[0];
    let cleaned = firstPhone.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('62')) {
      cleaned = '0' + cleaned.slice(2);
    } else if (cleaned.startsWith('8')) {
      cleaned = '0' + cleaned;
    }
    return cleaned.slice(0, 20);
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
      return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
    return cleaned;
  }

  $: if (activeSection === 'persetujuan_foto') {
    fetchPendingPhotos();
  }

  // Feedbacks State
  let feedbacksList: any[] = [];
  let isLoadingFeedbacks = false;
  let feedbackFilter = 'all'; // 'all', 'unread', 'read'
  let replyingToId: string | null = null;
  let replyMessage = '';
  let isReplying = false;

  async function fetchFeedbacks() {
    try {
      isLoadingFeedbacks = true;
      let query = supabase.from('feedbacks').select('*').order('created_at', { ascending: false });
      
      if (feedbackFilter === 'unread') {
        query = query.eq('is_read', false);
      } else if (feedbackFilter === 'read') {
        query = query.eq('is_read', true);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      feedbacksList = data || [];
    } catch (e) {
      console.error('Failed to fetch feedbacks:', e);
      triggerAlert('Gagal memuat daftar saran', 'error');
    } finally {
      isLoadingFeedbacks = false;
    }
  }

  async function markFeedbackRead(id: string) {
    try {
      const { error } = await supabase.from('feedbacks').update({ is_read: true }).eq('id', id);
      if (error) throw error;
      feedbacksList = feedbacksList.map(f => f.id === id ? { ...f, is_read: true } : f);
      triggerAlert('Ditandai sebagai telah dibaca');
    } catch (e) {
      triggerAlert('Gagal menandai pesan', 'error');
    }
  }

  async function deleteFeedback(id: string) {
    if (!confirm('Hapus saran ini secara permanen?')) return;
    try {
      const { error } = await supabase.from('feedbacks').delete().eq('id', id);
      if (error) throw error;
      feedbacksList = feedbacksList.filter(f => f.id !== id);
      triggerAlert('Saran berhasil dihapus');
    } catch (e) {
      triggerAlert('Gagal menghapus saran', 'error');
    }
  }

  async function submitReply(feedback: any) {
    if (!replyMessage.trim()) return;
    isReplying = true;
    try {
      // 1. Update feedback with admin's reply and mark as read
      const { error: updateError } = await supabase.from('feedbacks').update({
        admin_reply: replyMessage.trim(),
        is_read: true
      }).eq('id', feedback.id);
      if (updateError) throw updateError;

      // 2. Insert notification to app_notifications
      if (feedback.user_name && !feedback.user_name.includes('(Tamu)')) {
        const { error: notifError } = await supabase.from('app_notifications').insert([{
          target_user: feedback.user_name,
          title: "Balasan Saran & Masukan",
          message: `Admin MAZEEDA membalas saran Anda: "${replyMessage.trim()}"`,
          type: "success",
          icon: "MessageCircle",
          is_active: true
        }]);
        if (notifError) throw notifError;
      }

      feedbacksList = feedbacksList.map(f => f.id === feedback.id ? { ...f, admin_reply: replyMessage.trim(), is_read: true } : f);
      triggerAlert('Balasan berhasil dikirim');
      replyingToId = null;
      replyMessage = '';
    } catch (e) {
      console.error(e);
      triggerAlert('Gagal mengirim balasan', 'error');
    } finally {
      isReplying = false;
    }
  }

  $: if (activeSection === 'feedbacks') {
    fetchFeedbacks();
  }

  // Fetch squad from database
  async function fetchSquad(search = squadSearchQuery, filter = squadLoginFilter, limit = squadLimit, section = activeSection) {
    try {
      isLoadingSquad = true;
      const tableName = section === 'asatidzah' ? 'asatidzah' : 'allowed_alumni';
      
      let query = supabase
        .from(tableName)
        .select('*', { count: 'exact' });

      // Apply Filter
      if (filter === 'logged_in') {
        query = query.eq('has_logged_in', true);
      } else if (filter === 'not_logged_in') {
        query = query.neq('has_logged_in', true);
      } else if (filter === 'deactivated') {
        query = query.eq('is_active', false);
      }

      // Apply Search
      if (search && search.trim() !== '') {
        const q = search.trim();
        query = query.or(`nama_lengkap.ilike.%${q}%,nama_panggilan.ilike.%${q}%,nis.ilike.%${q}%,email.ilike.%${q}%`);
      }

      // Order and Limit
      query = query.order('id', { ascending: false }).limit(limit);

      const { data, count, error } = await query;
        
      if (error) throw error;
      squad = data || [];
      squadTotalCount = count || 0;
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      isLoadingSquad = false;
    }
  }

  // Insert or Update member in database
  async function handleAddMember() {
    if (!nama_lengkap || !email) {
      alert('Nama Lengkap dan Email wajib diisi!');
      return;
    }

    isSubmitting = true;

    // Map blood type safely to ('1' | '2' | '3')
    let dbGoldar = '3';
    if (golongan_darah === 'A') dbGoldar = '1';
    else if (golongan_darah === 'B') dbGoldar = '2';
    else if (golongan_darah === 'AB' || golongan_darah === 'O') dbGoldar = '3';

    const memberPayload = {
      foto_url: convertDriveUrl(foto_url),
      nama_lengkap,
      nama_panggilan,
      tempat_lahir: capitalizeEachWord(tempat_lahir),
      tahun_lahir,
      golongan_darah: dbGoldar,
      alamat_ktp: capitalizeEachWord(alamat_ktp),
      alamat_domisili,
      no_whatsapp: normalizeWhatsApp(no_whatsapp),
      email,
      media_social: media_social.trim().toLowerCase(),
      riwayat_pendidikan,
      alamat_riwayatpendidikan: capitalizeEachWord(alamat_riwayatpendidikan),
      tahun_masuk: tahun_masuk ? (parseInt(tahun_masuk, 10) || null) : null,
      keterampilan_khusus,
      cita_cita,
      makanan_kesukaan,
      kutipan_kenangan,
      music,
      hobi,
      kesan,
      pesan,
      nis,
      nama_ayah,
      kategori_mazeeda,
      daerah_santri: capitalizeEachWord(daerah_santri),
      tiktok_akun,
      facebook_akun,
      xtwitter_akun,
      rute_lengkap,
      kamar_santri,
      tahfidz_santri: capitalizeEachWord(tahfidz_santri)
    };

    try {
      const tableName = activeSection === 'asatidzah' ? 'asatidzah' : 'allowed_alumni';
      if (editingMemberId) {
        const { error } = await supabase
          .from(tableName)
          .update(memberPayload)
          .eq('id', editingMemberId);

        if (error) throw error;
        triggerAlert('Data anggota berhasil diperbarui!');
      } else {
        const { error } = await supabase
          .from(tableName)
          .insert([memberPayload]);

        if (error) throw error;
        triggerAlert('Anggota baru berhasil dimasukkan ke database!');
      }

      // Reset form states
      cancelEditMember();
      
      activeFormStep = 'personal';
      await fetchSquad();
    } catch (err: any) {
      alert('Error saving member: ' + err.message);
    } finally {
      isSubmitting = false;
    }
  }

  // --- PERSETUJUAN FOTO PROFIL ---
  let pendingPhotos: any[] = [];
  let isLoadingPendingPhotos = false;

  async function fetchPendingPhotos() {
    isLoadingPendingPhotos = true;
    try {
      const { data, error } = await supabase
        .from('custom_profile_photos')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      pendingPhotos = data || [];
    } catch (err: any) {
      console.error('Error fetching pending photos:', err);
    } finally {
      isLoadingPendingPhotos = false;
    }
  }

  async function approvePhoto(photo: any) {
    isSubmitting = true;
    try {
      const { error } = await supabase
        .from('custom_profile_photos')
        .update({ status: 'approved' })
        .eq('id', photo.id);
        
      if (error) throw error;
      
      // Kirim notifikasi ke user bahwa fotonya disetujui (opsional)
      await supabase.from('app_notifications').insert([{
        type: 'success',
        title: 'Foto Disetujui',
        message: `Foto profil tambahan Anda telah disetujui oleh Admin.`,
        icon: 'CheckCircle',
        is_read: false
      }]);
      
      triggerAlert('Foto berhasil disetujui.', 'success');
      await fetchPendingPhotos();
    } catch (err: any) {
      triggerAlert('Gagal menyetujui foto: ' + err.message, 'error');
    } finally {
      isSubmitting = false;
    }
  }

  async function rejectPhoto(photo: any) {
    isSubmitting = true;
    runWithConfirmation(
      'Tolak Foto',
      `Yakin ingin menolak foto dari ${photo.user_name}?`,
      async () => {
        try {
          const { error } = await supabase
            .from('custom_profile_photos')
            .update({ status: 'rejected' })
            .eq('id', photo.id);
            
          if (error) throw error;
          triggerAlert('Foto ditolak.', 'success');
          await fetchPendingPhotos();
        } catch (err: any) {
          triggerAlert('Gagal menolak foto: ' + err.message, 'error');
        } finally {
          isSubmitting = false;
        }
      }
    );
  }

  // --- CSV drag-and-drop & parsing logic ---
  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    isDragging = true;
  }

  function handleDragLeave() {
    isDragging = false;
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    isDragging = false;
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      processCSV(files[0]);
    }
  }

  function handleFileSelect(e: any) {
    const files = e.target.files;
    if (files && files.length > 0) {
      processCSV(files[0]);
    }
  }

  function parseCSVLine(text: string, separator: string = ',') {
    let p = '';
    let c: string[] = [];
    let q = false;

    for (let i = 0; i < text.length; i++) {
      let char = text[i];
      if (char === '"') {
        q = !q;
      } else if (char === separator && !q) {
        c.push(p.trim());
        p = '';
      } else {
        p += char;
      }
    }
    c.push(p.trim());
    return c.map(col => col.replace(/^["']|["']$/g, "").trim());
  }

  function processCSV(file: File) {
    csvImportError = "";
    csvImportStatus = "";
    if (!file.name.endsWith(".csv")) {
      csvImportError = "File harus berupa format .csv";
      return;
    }
    
    csvFile = file;
    const reader = new FileReader();
    reader.onload = (event: any) => {
      const text = event.target.result;
      const lines = text.split(/\r?\n/).map((line: string) => line.trim()).filter((line: string) => line.length > 0);
      
      if (lines.length === 0) {
        csvImportError = "File CSV kosong.";
        csvFile = null;
        return;
      }

      // Detect separator
      let separator = ',';
      const firstLine = lines[0];
      if (firstLine.includes(';')) separator = ';';
      else if (firstLine.includes('\t')) separator = '\t';

      // Parse headers
      const rawHeaders = parseCSVLine(firstLine, separator);
      const headers = rawHeaders.map(h => h.toLowerCase().trim().replace(/[\s_-]+/g, ''));

      function findIndex(aliases: string[]) {
        for (const alias of aliases) {
          const idx = headers.indexOf(alias.toLowerCase().replace(/[\s_-]+/g, ''));
          if (idx !== -1) return idx;
        }
        return -1;
      }

      const indices = {
        foto_url: findIndex(["foto_url", "foto url", "foto", "avatar", "foto_profil"]),
        nama_lengkap: findIndex(["nama_lengkap", "nama lengkap", "nama", "name", "full_name", "fullname"]),
        nama_panggilan: findIndex(["nama_panggilan", "nama panggilan", "panggilan", "nickname", "nick"]),
        tempat_lahir: findIndex(["tempat_lahir", "tempat lahir", "tempat"]),
        tahun_lahir: findIndex(["tahun_lahir", "tahun lahir", "tahun"]),
        golongan_darah: findIndex(["golongan_darah", "golongan darah", "goldar", "gol darah", "gol_darah"]),
        alamat_ktp: findIndex(["alamat_ktp", "alamat ktp", "ktp", "alamat", "tempat tinggal", "tempat_tinggal"]),
        alamat_domisili: findIndex(["alamat_domisili", "alamat domisili", "domisili", "kota"]),
        no_whatsapp: findIndex(["no_whatsapp", "no whatsapp", "whatsapp", "wa", "no_wa", "no wa", "telepon", "telp", "no_hp", "nohp"]),
        email: findIndex(["email", "mail"]),
        media_social: findIndex(["media_social", "media social", "sosmed", "instagram", "ig", "tiktok", "medsos"]),
        riwayat_pendidikan: findIndex(["riwayat_pendidikan", "riwayat pendidikan", "pendidikan", "sekolah", "riwayat"]),
        alamat_riwayatpendidikan: findIndex(["alamat_riwayatpendidikan", "alamat riwayat pendidikan", "alamat riwayatpendidikan", "alamat_pendidikan", "alamat pendidikan"]),
        tahun_masuk: findIndex(["tahun_masuk", "tahun masuk", "masuk", "angkatan", "tahun_masuk_pondok"]),
        keterampilan_khusus: findIndex(["keterampilan_khusus", "keterampilan", "keahlian", "skill", "keterampilan khusus"]),
        cita_cita: findIndex(["cita_cita", "cita-cita", "cita cita", "harapan", "impian"]),
        makanan_kesukaan: findIndex(["makanan_kesukaan", "makanan kesukaan", "makanan", "makanan favorit"]),
        kutipan_kenangan: findIndex(["kutipan_kenangan", "kutipan", "quote", "quotes", "kutipan kenangan"]),
        music: findIndex(["music", "musik", "lagu", "spotify", "lagu_kesukaan", "lagu kesukaan"]),
        hobi: findIndex(["hobi", "hobby"]),
        kesan: findIndex(["kesan"]),
        pesan: findIndex(["pesan"]),
        status: findIndex(["status"]),
        category: findIndex(["category", "kategori"]),
        kategori_mazeeda: findIndex(["kategori_mazeeda", "kategori mazeeda", "mazeeda", "jenis"]),
        nis: findIndex(["nis", "no_induk", "no induk", "nomor induk", "nomor induk siswa"]),
        nama_ayah: findIndex(["nama_ayah", "nama ayah", "ayah", "bapak", "nama bapak"]),
        daerah_santri: findIndex(["daerah_santri", "daerah santri", "daerah", "asal daerah"]),
        tiktok_akun: findIndex(["tiktok_akun", "tiktok akun", "tiktok"]),
        facebook_akun: findIndex(["facebook_akun", "facebook akun", "facebook", "fb"]),
        xtwitter_akun: findIndex(["xtwitter_akun", "xtwitter akun", "xtwitter", "twitter", "x"]),
        rute_lengkap: findIndex(["rute_lengkap", "rute lengkap", "rute"]),
        kamar_santri: findIndex(["kamar_santri", "kamar santri", "kamar", "kamar terakhir", "kamar_terakhir"]),
        tahfidz_santri: findIndex(["tahfidz_santri", "tahfidz santri", "tahfidz", "status tahfidz", "status_tahfidz", "tahfid"])
      };

      if (indices.nama_lengkap === -1) {
        csvImportError = "Kolom 'Nama Lengkap' wajib ada di file CSV.";
        csvFile = null;
        return;
      }

      function getValue(columns: string[], field: keyof typeof indices, fallback: any = "") {
        const idx = indices[field];
        if (idx !== -1 && idx < columns.length) {
          return columns[idx] || fallback;
        }
        return fallback;
      }

      const list = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const columns = parseCSVLine(line, separator);
        
        const namaLengkapVal = getValue(columns, "nama_lengkap");
        if (namaLengkapVal) {
          if (["nama", "name", "full_name", "nama lengkap"].includes(namaLengkapVal.toLowerCase())) {
            continue;
          }

          const rawTahunLahir = getValue(columns, "tahun_lahir", "");
          const rawTahunMasuk = getValue(columns, "tahun_masuk", "");
          const rawGoldar = getValue(columns, "golongan_darah", "").trim().toUpperCase();
          
          let dbGoldar = '3';
          if (rawGoldar === 'A' || rawGoldar === '1') dbGoldar = '1';
          else if (rawGoldar === 'B' || rawGoldar === '2') dbGoldar = '2';
          else if (rawGoldar === 'AB' || rawGoldar === 'O' || rawGoldar === '3') dbGoldar = '3';

          const csvKategori = getValue(columns, "kategori_mazeeda", "").trim();
          let finalCategory = getValue(columns, "category", "").trim();
          if (!finalCategory && csvKategori) {
            finalCategory = csvKategori;
          }
          if (!finalCategory) {
            finalCategory = activeSection === 'asatidzah' ? 'pengajar' : 'alumni';
          }

          list.push({
            foto_url: convertDriveUrl(getValue(columns, "foto_url")),
            nama_lengkap: namaLengkapVal,
            nama_panggilan: getValue(columns, "nama_panggilan"),
            tempat_lahir: capitalizeEachWord(getValue(columns, "tempat_lahir")),
            tahun_lahir: rawTahunLahir ? String(rawTahunLahir) : "" ,
            golongan_darah: dbGoldar,
            alamat_ktp: capitalizeEachWord(getValue(columns, "alamat_ktp")),
            alamat_domisili: getValue(columns, "alamat_domisili"),
            no_whatsapp: normalizeWhatsApp(getValue(columns, "no_whatsapp")),
            email: getValue(columns, "email"),
            media_social: getValue(columns, "media_social").trim().toLowerCase(),
            riwayat_pendidikan: getValue(columns, "riwayat_pendidikan"),
            alamat_riwayatpendidikan: capitalizeEachWord(getValue(columns, "alamat_riwayatpendidikan")),
            tahun_masuk: rawTahunMasuk ? (parseInt(rawTahunMasuk, 10) || null) : null,
            keterampilan_khusus: getValue(columns, "keterampilan_khusus"),
            cita_cita: getValue(columns, "cita_cita"),
            makanan_kesukaan: getValue(columns, "makanan_kesukaan"),
            kutipan_kenangan: getValue(columns, "kutipan_kenangan"),
            music: getValue(columns, "music"),
            hobi: getValue(columns, "hobi"),
            kesan: getValue(columns, "kesan"),
            pesan: getValue(columns, "pesan"),
            status: getValue(columns, "status", "Alumni").slice(0, 20),
            category: finalCategory.toLowerCase().slice(0, 20),
            kategori_mazeeda: finalCategory.toLowerCase().slice(0, 20),
            nis: getValue(columns, "nis").slice(0, 20),
            nama_ayah: getValue(columns, "nama_ayah"),
            daerah_santri: capitalizeEachWord(getValue(columns, "daerah_santri")),
            tiktok_akun: getValue(columns, "tiktok_akun"),
            facebook_akun: getValue(columns, "facebook_akun"),
            xtwitter_akun: getValue(columns, "xtwitter_akun"),
            rute_lengkap: getValue(columns, "rute_lengkap"),
            kamar_santri: getValue(columns, "kamar_santri"),
            tahfidz_santri: capitalizeEachWord(getValue(columns, "tahfidz_santri")),
            bagian: getValue(columns, "bagian", getValue(columns, "kelas", "")).trim()
          });
        }
      }

      if (list.length === 0) {
        csvImportError = "Tidak ditemukan data nama valid di CSV.";
        csvFile = null;
      } else {
        parsedCSVData = list;
        csvImportStatus = `Berhasil memproses ${parsedCSVData.length} baris data dari CSV. Siap diunggah ke database.`;
      }
    };

    reader.onerror = () => {
      csvImportError = "Gagal membaca berkas CSV.";
      csvFile = null;
    };
    reader.readAsText(file);
  }

  async function handleUploadCSVData() {
    if (parsedCSVData.length === 0) return;
    isSubmitting = true;
    csvImportStatus = "Mengunggah data ke database...";
    csvImportError = "";

    try {
      const tableName = activeSection === 'asatidzah' ? 'asatidzah' : 'allowed_alumni';
      const { error } = await supabase
        .from(tableName)
        .upsert(parsedCSVData, { onConflict: 'nama_lengkap' });

      if (error) throw error;

      triggerAlert(`Berhasil mengimpor ${parsedCSVData.length} data ke database!`);
      parsedCSVData = [];
      csvFile = null;
      csvImportStatus = "";
      await fetchSquad();
    } catch (err: any) {
      csvImportError = "Gagal mengunggah data: " + err.message;
      csvImportStatus = "";
    } finally {
      isSubmitting = false;
    }
  }

  // Delete member from database
  async function handleDeleteMember(id: number) {
    runWithConfirmation(
      'Hapus Anggota Squad',
      'Apakah Anda yakin ingin menghapus anggota ini?',
      async () => {
        try {
          const tableName = activeSection === 'asatidzah' ? 'asatidzah' : 'allowed_alumni';
          const { error } = await supabase
            .from(tableName)
            .delete()
            .eq('id', id);

          if (error) throw error;
          triggerAlert('Anggota berhasil dihapus dari Supabase.');
          await fetchSquad();
        } catch (err: any) {
          alert('Error deleting: ' + err.message);
        }
      }
    );
  }

  async function toggleMemberActiveStatus(item: any) {
    const currentStatus = item.is_active === false ? false : true;
    const newStatus = !currentStatus;
    const actionText = newStatus ? 'Mengaktifkan' : 'Menonaktifkan';
    
    runWithConfirmation(
      `${actionText} Akun`,
      `Yakin ingin ${actionText.toLowerCase()} akun ${item.nama_lengkap}? ${!newStatus ? 'Pengguna ini akan segera dikeluarkan dari aplikasi jika sedang login.' : ''}`,
      async () => {
        try {
          const tableName = activeSection === 'asatidzah' ? 'asatidzah' : 'allowed_alumni';
          const { error } = await supabase.from(tableName).update({ is_active: newStatus }).eq('id', item.id);
          if (error) throw error;
          triggerAlert(`Akun berhasil ${actionText.toLowerCase()}!`);
          await fetchSquad();
        } catch (err: any) {
          alert(`Gagal ${actionText.toLowerCase()} akun: ` + err.message);
        }
      }
    );
  }

  // Delete all members from allowed_alumni
  async function handleDeleteAllMembers() {
    runWithConfirmation(
      'Hapus Semua Anggota Squad',
      'Apakah Anda yakin ingin menghapus semua anggota Squad dari database? Tindakan ini tidak dapat dibatalkan.',
      async () => {
        try {
          const tableName = activeSection === 'asatidzah' ? 'asatidzah' : 'allowed_alumni';
          const { error } = await supabase.from(tableName).delete().neq('id', '00000000-0000-0000-0000-000000000000');
          if (error) throw error;
          triggerAlert('Semua anggota Squad berhasil dihapus.');
          await fetchSquad();
        } catch (err: any) {
          alert('Error deleting all members: ' + err.message);
        }
      }
    );
  }

  // --- 2. MADING ANNOUNCEMENT & STICKY NOTES CRUD ---
  let madingList: any[] = [];
  let stickyNotes: any[] = [];
  let isLoadingMading = false;
  let isLoadingSticky = false;
  let madingSearchQuery = '';
  let stickySearchQuery = '';

  let madingTitle = '', madingCategory = 'Informasi', madingAuthor = 'ADMIN MAZEEDA', madingContent = '';
  let madingNewCategory = '';
  let madingIsPriority = false;

  // Fetch announcements from Supabase
  async function fetchAnnouncements() {
    try {
      isLoadingMading = true;
      const { data, error } = await supabase
        .from('mading_announcements')
        .select('*')
        .order('is_priority', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        madingList = data;
      } else {
        console.warn('mading_announcements table not found, using mock fallbacks.');
        madingList = [
          { id: 1, title: 'Peluncuran Website MAZEEDA V1', category: 'Informasi', author: 'Siti Fatimah', content: '...', is_priority: false, date: '2026-06-12' }
        ];
      }
    } catch (err) {
      console.error('Failed to load announcements:', err);
    } finally {
      isLoadingMading = false;
    }
  }

  // Fetch sticky notes for moderation
  async function fetchStickyNotes() {
    try {
      isLoadingSticky = true;
      const { data, error } = await supabase
        .from('mading_notes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        stickyNotes = data;
      }
    } catch (err) {
      console.error('Failed to load sticky notes:', err);
    } finally {
      isLoadingSticky = false;
    }
  }

  let editingMadingId: any = null;

  function startEditMading(item: any) {
    editingMadingId = item.id;
    madingTitle = item.title || '';
    madingCategory = item.category || 'Informasi';
    madingNewCategory = '';
    madingAuthor = item.author || 'ADMIN MAZEEDA';
    madingContent = item.content || '';
    madingIsPriority = item.is_priority || false;
  }

  function cancelEditMading() {
    editingMadingId = null;
    madingTitle = '';
    madingContent = '';
    madingIsPriority = false;
    madingCategory = 'Informasi';
    madingNewCategory = '';
    madingAuthor = 'ADMIN MAZEEDA';
  }

  // Add announcement to Supabase
  async function addMading() {
    if (!madingTitle || !madingContent) return;
    
    // Determine category to send
    const finalCategory = madingCategory === 'new' ? madingNewCategory.trim() : madingCategory;
    if (madingCategory === 'new' && !finalCategory) {
      alert('Nama kategori baru wajib diisi!');
      return;
    }
    
    const madingPayload = {
      title: madingTitle,
      category: finalCategory,
      author: madingAuthor || 'ADMIN MAZEEDA',
      content: madingContent,
      is_priority: madingIsPriority
    };

    isSubmitting = true;

    try {
      if (editingMadingId) {
        const { error } = await supabase
          .from('mading_announcements')
          .update(madingPayload)
          .eq('id', editingMadingId);

        if (error) throw error;
        triggerAlert('Pengumuman berhasil diperbarui!');
      } else {
        const { error } = await supabase
          .from('mading_announcements')
          .insert([madingPayload]);

        if (error) throw error;
        triggerAlert('Pengumuman baru berhasil dipublikasikan!');
      }
      
      cancelEditMading();
      await fetchAnnouncements();
    } catch (err: any) {
      alert('Gagal menyimpan pengumuman: ' + err.message);
    } finally {
      isSubmitting = false;
    }
  }

  // --- 2c. STICKY NOTES MODERATION ---
  let stickySenderName = '';
  let stickyMessage = '';
  let stickyColorTheme = 'bg-cyan-500/10 text-cyan-200 border-cyan-500/30 shadow-cyan-500/5';
  let editingStickyId: any = null;

  const stickyColors = [
    { name: 'Biru Cyan', value: 'bg-cyan-500/10 text-cyan-200 border-cyan-500/30 shadow-cyan-500/5' },
    { name: 'Pink Mawar', value: 'bg-pink-500/10 text-pink-200 border-pink-500/30 shadow-pink-500/5' },
    { name: 'Kuning Amber', value: 'bg-yellow-500/10 text-yellow-200 border-yellow-500/30 shadow-yellow-500/5' },
    { name: 'Hijau Zamrud', value: 'bg-emerald-500/10 text-emerald-200 border-emerald-500/30 shadow-emerald-500/5' }
  ];

  function startEditSticky(item: any) {
    editingStickyId = item.id;
    stickySenderName = item.sender_name || '';
    stickyMessage = item.message || '';
    stickyColorTheme = item.color_theme || stickyColors[0].value;
  }

  function cancelEditSticky() {
    editingStickyId = null;
    stickySenderName = '';
    stickyMessage = '';
    stickyColorTheme = stickyColors[0].value;
  }

  async function handleSaveSticky() {
    if (!stickySenderName.trim() || !stickyMessage.trim()) {
      alert('Nama pengirim dan pesan wajib diisi!');
      return;
    }

    isSubmitting = true;

    const stickyPayload = {
      sender_name: stickySenderName.trim(),
      message: stickyMessage.trim(),
      color_theme: stickyColorTheme
    };

    try {
      if (editingStickyId) {
        const { error } = await supabase
          .from('mading_notes')
          .update(stickyPayload)
          .eq('id', editingStickyId);
        if (error) throw error;
        triggerAlert('Sticky note berhasil diperbarui!');
      } else {
        const { error } = await supabase
          .from('mading_notes')
          .insert([stickyPayload]);
        if (error) throw error;
        triggerAlert('Sticky note baru berhasil ditambahkan!');
      }
      cancelEditSticky();
      await fetchStickyNotes();
    } catch (err: any) {
      alert('Gagal menyimpan sticky note: ' + err.message);
    } finally {
      isSubmitting = false;
    }
  }

  // Delete announcement from Supabase
  async function deleteMading(id: any) {
    runWithConfirmation(
      'Hapus Pengumuman Mading',
      'Apakah Anda yakin ingin menghapus pengumuman ini?',
      async () => {
        try {
          const { error } = await supabase
            .from('mading_announcements')
            .delete()
            .eq('id', id);

          if (error) throw error;
          triggerAlert('Pengumuman berhasil dihapus dari database.');
          await fetchAnnouncements();
        } catch (err: any) {
          madingList = madingList.filter(p => p.id !== id);
          triggerAlert('Pengumuman dihapus (Sesi Lokal).');
        }
      }
    );
  }

  async function handleDeleteAllMading() {
    runWithConfirmation(
      'Hapus Semua Pengumuman Mading',
      'Apakah Anda yakin ingin menghapus semua pengumuman Mading dari database? Tindakan ini tidak dapat dibatalkan.',
      async () => {
        try {
          const { error } = await supabase
            .from('mading_announcements')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');
          if (error) throw error;
          triggerAlert('Semua pengumuman Mading berhasil dihapus.');
          await fetchAnnouncements();
        } catch (err: any) {
          alert('Error deleting all mading: ' + err.message);
        }
      }
    );
  }

  // Moderate / Delete Sticky Note from Supabase
  async function deleteStickyNote(id: any) {
    runWithConfirmation(
      'Hapus Aspirasi',
      'Apakah Anda yakin ingin menghapus aspirasi ini dari dinding aspirasi?',
      async () => {
        try {
          const { error } = await supabase
            .from('mading_notes')
            .delete()
            .eq('id', id);

          if (error) throw error;
          triggerAlert('Aspirasi berhasil dimoderasi / dihapus.');
          await fetchStickyNotes();
        } catch (err: any) {
          stickyNotes = stickyNotes.filter(n => n.id !== id);
          triggerAlert('Aspirasi dihapus (Sesi Lokal).');
        }
      }
    );
  }

  async function handleDeleteAllStickyNotes() {
    runWithConfirmation(
      'Hapus Semua Aspirasi',
      'Apakah Anda yakin ingin menghapus semua aspirasi dari dinding aspirasi? Tindakan ini tidak dapat dibatalkan.',
      async () => {
        try {
          const { error } = await supabase
            .from('mading_notes')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');
          if (error) throw error;
          triggerAlert('Semua aspirasi berhasil dihapus.');
          await fetchStickyNotes();
        } catch (err: any) {
          alert('Error deleting all aspirations: ' + err.message);
        }
      }
    );
  }

  // --- NOTIFIKASI APP (app_notifications) CRUD ---
  let notifList: any[] = [];
  let isLoadingNotif = false;
  let notifSearchQuery = '';
  let notifTitle = '';
  let notifMessage = '';
  let notifType = 'info'; // 'info' | 'success' | 'warning' | 'urgent'

  async function fetchNotifList() {
    try {
      isLoadingNotif = true;
      const { data, error } = await supabase
        .from('app_notifications')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) notifList = data;
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      isLoadingNotif = false;
    }
  }

  async function addNotif() {
    if (!notifTitle.trim()) return;
    try {
      isSubmitting = true;
      const { error } = await supabase
        .from('app_notifications')
        .insert([{ title: notifTitle, message: notifMessage, type: notifType, is_active: true }]);
      if (error) throw error;
      notifTitle = ''; notifMessage = ''; notifType = 'info';
      triggerAlert('Notifikasi berhasil dikirim ke semua user!');
      await fetchNotifList();
    } catch (err: any) {
      alert('Gagal menambah notifikasi: ' + err.message);
    } finally {
      isSubmitting = false;
    }
  }

  async function toggleNotif(id: any, current: boolean) {
    try {
      const { error } = await supabase
        .from('app_notifications')
        .update({ is_active: !current })
        .eq('id', id);
      if (error) throw error;
      triggerAlert(!current ? 'Notifikasi diaktifkan.' : 'Notifikasi dinonaktifkan.');
      await fetchNotifList();
    } catch (err: any) {
      alert('Gagal update: ' + err.message);
    }
  }

  async function deleteNotif(id: any) {
    runWithConfirmation(
      'Hapus Notifikasi',
      'Apakah Anda yakin ingin menghapus notifikasi ini?',
      async () => {
        try {
          const { error } = await supabase.from('app_notifications').delete().eq('id', id);
          if (error) throw error;
          triggerAlert('Notifikasi dihapus.');
          await fetchNotifList();
        } catch (err: any) {
          alert('Gagal hapus: ' + err.message);
        }
      }
    );
  }

  async function handleDeleteAllNotifications() {
    runWithConfirmation(
      'Hapus Semua Notifikasi',
      'Apakah Anda yakin ingin menghapus semua notifikasi? Tindakan ini tidak dapat dibatalkan.',
      async () => {
        try {
          const { error } = await supabase
            .from('app_notifications')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');
          if (error) throw error;
          triggerAlert('Semua notifikasi berhasil dihapus.');
          await fetchNotifList();
        } catch (err: any) {
          alert('Error deleting all notifications: ' + err.message);
        }
      }
    );
  }

  // Sangu Kas Ledger has been removed as per user request.

  // --- 2b. SANGU BACAAN MANAGEMENT ---
  let sanguList: any[] = [];
  let isLoadingSangu = false;
  let sanguSearchQuery = '';

  let sanguTitle = '';
  let sanguCategory = 'sholawat';
  let sanguNewCategory = '';
  let sanguContent = '';
  let editingSanguId: any = null;

  async function fetchSangu() {
    try {
      isLoadingSangu = true;
      const { data, error } = await supabase
        .from('bacaan')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      sanguList = data || [];
    } catch (err: any) {
      console.error('Error fetching Sangu:', err);
    } finally {
      isLoadingSangu = false;
    }
  }

  async function handleSaveSangu() {
    if (!sanguTitle.trim() || !sanguContent.trim()) {
      alert('Judul dan Konten Sangu wajib diisi!');
      return;
    }

    isSubmitting = true;
    const categoryToSave = sanguCategory === 'new' ? sanguNewCategory.trim().toLowerCase() : sanguCategory;
    if (sanguCategory === 'new' && !categoryToSave) {
      alert('Nama kategori baru wajib diisi!');
      isSubmitting = false;
      return;
    }

    try {
      if (editingSanguId) {
        const { error } = await supabase
          .from('bacaan')
          .update({
            title: sanguTitle.trim(),
            category: categoryToSave,
            content: sanguContent
          })
          .eq('id', editingSanguId);
        if (error) throw error;
        triggerAlert('Sangu Bacaan berhasil diperbarui!');
      } else {
        const { error } = await supabase
          .from('bacaan')
          .insert([{
            title: sanguTitle.trim(),
            category: categoryToSave,
            content: sanguContent
          }]);
        if (error) throw error;
        triggerAlert('Sangu Bacaan baru berhasil ditambahkan!');
      }
      cancelEditSangu();
      await fetchSangu();
    } catch (err: any) {
      alert('Error saving Sangu: ' + err.message);
    } finally {
      isSubmitting = false;
    }
  }

  function startEditSangu(item: any) {
    editingSanguId = item.id;
    sanguTitle = item.title || '';
    sanguCategory = item.category || 'others';
    sanguNewCategory = '';
    sanguContent = item.content || '';
  }

  function cancelEditSangu() {
    editingSanguId = null;
    sanguTitle = '';
    sanguCategory = 'sholawat';
    sanguNewCategory = '';
    sanguContent = '';
  }

  async function deleteSangu(id: string) {
    runWithConfirmation(
      'Hapus Catatan Sangu',
      'Apakah Anda yakin ingin menghapus catatan Sangu ini dari database?',
      async () => {
        try {
          const { error } = await supabase
            .from('bacaan')
            .delete()
            .eq('id', id);
          if (error) throw error;
          triggerAlert('Sangu Bacaan berhasil dihapus.');
          await fetchSangu();
        } catch (err: any) {
          alert('Gagal menghapus Sangu: ' + err.message);
        }
      }
    );
  }

  async function handleDeleteAllSangu() {
    runWithConfirmation(
      'Hapus Semua Catatan Sangu',
      'Apakah Anda yakin ingin menghapus semua catatan Sangu dari database? Tindakan ini tidak dapat dibatalkan.',
      async () => {
        try {
          const { error } = await supabase
            .from('bacaan')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');
          if (error) throw error;
          triggerAlert('Semua catatan Sangu berhasil dihapus.');
          await fetchSangu();
        } catch (err: any) {
          alert('Error deleting all Sangu: ' + err.message);
        }
      }
    );
  }

  // --- 4. TIMELINE PHOTO CRUD ---
  let photosList: any[] = [];
  $: uniquePhotoCategories = Array.from(new Set([
    'Kegiatan', 'Kajian', 'Rapat', 'Agenda', 'Sosial',
    ...photosList.map(p => p.category).filter(Boolean)
  ]));
  let isLoadingPhotos = false;
  let timelineSearchQuery = '';
  let timelineFilterCategory = '';
  let timelineFilterOpen = false;
  let photoTitle = '', photoLoc = '', photoDate = new Date().toISOString().split('T')[0], photoCategory = 'Kegiatan', photoNewCategory = '', photoDesc = '';
  let selectedFile: File | null = null;
  let uploadProgressStatus = '';
  let fileInputRef: HTMLInputElement;
  let editingPhotoId: any = null;

  function startEditPhoto(item: any) {
    editingPhotoId = item.id;
    photoTitle = item.title || '';
    photoLoc = item.location || '';
    photoDate = item.date || new Date().toISOString().split('T')[0];
    photoCategory = item.category || 'Kegiatan';
    photoDesc = item.description || '';
    selectedFile = null;
    if (fileInputRef) fileInputRef.value = '';
  }

  function cancelEditPhoto() {
    editingPhotoId = null;
    photoTitle = '';
    photoLoc = '';
    photoDate = new Date().toISOString().split('T')[0];
    photoCategory = 'Kegiatan';
    photoNewCategory = '';
    photoDesc = '';
    selectedFile = null;
    if (fileInputRef) fileInputRef.value = '';
    uploadProgressStatus = '';
  }

  async function fetchPhotos() {
    try {
      isLoadingPhotos = true;
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .order('date', { ascending: false });
        
      if (!error && data) {
        photosList = data;
      }
    } catch (err) {
      console.error('Error fetching memories:', err);
    } finally {
      isLoadingPhotos = false;
    }
  }

  function handlePhotoFileSelect(e: any) {
    const files = e.target.files;
    if (files && files.length > 0) {
      selectedFile = files[0];
    }
  }

  async function addPhoto() {
    if (!photoTitle || !photoLoc || (!selectedFile && !editingPhotoId)) {
      alert('Judul, lokasi, dan berkas foto wajib diisi/dipilih (kecuali saat edit)!');
      return;
    }
    
    isSubmitting = true;
    uploadProgressStatus = selectedFile ? 'Mengunggah berkas foto...' : 'Menyimpan pembaruan...';
    
    try {
      let finalImageUrl = undefined;
      const finalCategory = photoCategory === 'new' ? photoNewCategory : photoCategory;
      
      // 1. Upload to Supabase Storage if a new file is selected
      if (selectedFile) {
        finalImageUrl = await uploadMemoryPhoto(selectedFile, 'timeline');
      }
      
      // 2. Save metadata to memories table
      if (editingPhotoId) {
        const updatePayload: any = {
          title: photoTitle,
          location: photoLoc,
          date: photoDate,
          category: finalCategory,
          description: photoDesc,
        };
        if (finalImageUrl) updatePayload.image_url = finalImageUrl;
        
        const { error } = await supabase
          .from('memories')
          .update(updatePayload)
          .eq('id', editingPhotoId);
          
        if (error) throw error;
        triggerAlert('Data memori berhasil diperbarui!');
      } else {
        const { error } = await supabase
          .from('memories')
          .insert([{
            title: photoTitle,
            location: photoLoc,
            date: photoDate,
            category: finalCategory,
            description: photoDesc,
            image_url: finalImageUrl
          }]);
          
        if (error) throw error;
        triggerAlert('Foto memori berhasil diunggah dan disimpan!');
      }
      
      cancelEditPhoto();
      await fetchPhotos();
    } catch (err: any) {
      console.error('Error uploading memory:', err);
      alert('Gagal menyimpan foto memori: ' + err.message);
      uploadProgressStatus = '';
    } finally {
      isSubmitting = false;
    }
  }

  async function deletePhoto(id: string) {
    runWithConfirmation(
      'Hapus Foto Memori',
      'Apakah Anda yakin ingin menghapus foto memori ini dari galeri?',
      async () => {
        try {
          const { error } = await supabase
            .from('memories')
            .delete()
            .eq('id', id);
            
          if (error) throw error;
          
          triggerAlert('Foto memori berhasil dihapus.');
          await fetchPhotos();
        } catch (err: any) {
          alert('Gagal menghapus foto memori: ' + err.message);
        }
      }
    );
  }

  async function handleDeleteAllPhotos() {
    runWithConfirmation(
      'Hapus Semua Foto Memori',
      'Apakah Anda yakin ingin menghapus semua foto memori Timeline dari galeri? Tindakan ini tidak dapat dibatalkan.',
      async () => {
        try {
          const { error } = await supabase
            .from('memories')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');
          if (error) throw error;
          triggerAlert('Semua foto memori Timeline berhasil dihapus.');
          await fetchPhotos();
        } catch (err: any) {
          alert('Error deleting all memories: ' + err.message);
        }
      }
    );
  }

  // --- CAROUSEL NEWS SLIDES CRUD STATE ---
  let carouselSlides: any[] = [];
  let isLoadingCarousel = false;
  let editingSlideId: any = null;

  let slideTitle = '';
  let slideDesc = '';
  let slideImageUrl = '';
  let slideRedirectUrl = '';

  let slideFileRef: HTMLInputElement;
  let slideSelectedFile: File | null = null;
  let slideUploadProgressStatus = '';

  async function fetchCarouselSlides() {
    try {
      isLoadingCarousel = true;
      const { data, error } = await supabase
        .from('news_slides')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        carouselSlides = data;
      }
    } catch (err) {
      console.error('Failed to load news slides:', err);
    } finally {
      isLoadingCarousel = false;
    }
  }

  function handleSlideFileSelect(e: any) {
    const files = e.target.files;
    if (files && files.length > 0) {
      slideSelectedFile = files[0];
    }
  }

  async function saveNewsSlide() {
    if (!slideTitle || (!slideImageUrl && !slideSelectedFile)) {
      alert('Judul slide dan Gambar wajib diisi/dipilih!');
      return;
    }

    isSubmitting = true;
    slideUploadProgressStatus = 'Menyimpan banner slide...';

    try {
      let finalImageUrl = slideImageUrl;

      if (slideSelectedFile) {
        slideUploadProgressStatus = 'Mengunggah berkas foto slide...';
        const publicUrl = await uploadMemoryPhoto(slideSelectedFile, 'news');
        finalImageUrl = publicUrl;
      }

      const slidePayload = {
        title: slideTitle,
        description: slideDesc,
        image_url: finalImageUrl,
        redirect_url: slideRedirectUrl
      };

      if (editingSlideId) {
        const { error } = await supabase
          .from('news_slides')
          .update(slidePayload)
          .eq('id', editingSlideId);
        
        if (error) throw error;
        triggerAlert('Banner slide berhasil diperbarui!');
      } else {
        const { error } = await supabase
          .from('news_slides')
          .insert([slidePayload]);
        
        if (error) throw error;
        triggerAlert('Banner slide baru berhasil disimpan!');
      }

      cancelEditSlide();
      await fetchCarouselSlides();
    } catch (err: any) {
      alert('Gagal menyimpan slide: ' + err.message);
    } finally {
      isSubmitting = false;
      slideUploadProgressStatus = '';
    }
  }

  function startEditSlide(slide: any) {
    editingSlideId = slide.id;
    slideTitle = slide.title || '';
    slideDesc = slide.description || '';
    slideImageUrl = slide.image_url || '';
    slideRedirectUrl = slide.redirect_url || '';
    slideSelectedFile = null;
  }

  function cancelEditSlide() {
    editingSlideId = null;
    slideTitle = '';
    slideDesc = '';
    slideImageUrl = '';
    slideRedirectUrl = '';
    slideSelectedFile = null;
    if (slideFileRef) slideFileRef.value = '';
  }

  function deleteNewsSlide(id: string) {
    runWithConfirmation(
      'Hapus Banner Slide',
      'Apakah Anda yakin ingin menghapus banner slide ini?',
      async () => {
        try {
          const { error } = await supabase
            .from('news_slides')
            .delete()
            .eq('id', id);
          
          if (error) throw error;
          triggerAlert('Banner slide berhasil dihapus.');
          await fetchCarouselSlides();
        } catch (err: any) {
          alert('Gagal menghapus slide: ' + err.message);
        }
      }
    );
  }

  // --- 5. KEPENGURUSAN HISTORY CRUD ---
  let kepengurusanList: any[] = [];
  let isLoadingKepengurusan = false;
  let kepengurusanSearchQuery = '';
  
  // Form input states
  let kep_tahunAjaran = '2026-2027';
  let kep_namaLengkap = '';
  let kep_jabatan = '';
  let kep_divisi = '';
  let kep_fotoCustomUrl = '';
  let editingKepId: any = null;
  let kepengurusanYearFilter = 'all';
  
  // Custom dropdown states
  let showKepDropdown = false;
  let kepSearchQuery = '';

  let showDivisiDropdown = false;
  let divisiSearchQuery = '';

  // Get all unique divisions ever created across all years
  $: availableDivisions = [...new Set(
    kepengurusanList
      .filter(k => k.divisi)
      .map(k => k.divisi.trim())
  )].sort();

  $: squadMap = squad.reduce((map: Record<string, any>, item) => {
    map[item.nama_lengkap.trim().toLowerCase()] = item;
    return map;
  }, {});

  // CSV states for Kepengurusan
  let kep_isDragging = false;
  let kep_csvFile: File | null = null;
  let kep_parsedCSVData: any[] = [];
  let kep_csvImportStatus = '';
  let kep_csvImportError = '';

  async function fetchKepengurusan() {
    try {
      isLoadingKepengurusan = true;
      const { data, error } = await supabase
        .from('kepengurusan_history')
        .select('*')
        .order('tahun_ajaran', { ascending: false });
      if (!error && data) {
        kepengurusanList = data;
      }
    } catch (err) {
      console.error('Failed to fetch kepengurusan:', err);
    } finally {
      isLoadingKepengurusan = false;
    }
  }

  function startEditKepengurusan(item: any) {
    editingKepId = item.id;
    kep_tahunAjaran = (item.tahun_ajaran || '2026-2027').replace(/\//g, '-');
    kep_namaLengkap = item.nama_lengkap || '';
    kep_jabatan = item.jabatan || '';
    kep_divisi = item.divisi || 'Pengurus Harian';
    kep_fotoCustomUrl = item.foto_custom_url || '';
  }

  function cancelEditKepengurusan() {
    editingKepId = null;
    kep_tahunAjaran = '2026-2027';
    kep_namaLengkap = '';
    kep_jabatan = '';
    kep_divisi = '';
    kep_fotoCustomUrl = '';
  }

  async function handleSaveKepengurusan() {
    if (!kep_namaLengkap || !kep_jabatan || !kep_divisi) {
      alert('Nama, Jabatan, dan Divisi wajib diisi!');
      return;
    }

    isSubmitting = true;
    const payload = {
      tahun_ajaran: kep_tahunAjaran,
      nama_lengkap: kep_namaLengkap.trim(),
      jabatan: kep_jabatan.trim(),
      divisi: kep_divisi.trim(),
      foto_custom_url: kep_fotoCustomUrl.trim()
    };

    try {
      if (editingKepId) {
        const { error } = await supabase
          .from('kepengurusan_history')
          .update(payload)
          .eq('id', editingKepId);
        if (error) throw error;
        triggerAlert('Data kepengurusan berhasil diperbarui!');
      } else {
        const { error } = await supabase
          .from('kepengurusan_history')
          .insert([payload]);
        if (error) throw error;
        triggerAlert('Pengurus baru berhasil ditambahkan!');
      }
      cancelEditKepengurusan();
      await fetchKepengurusan();
    } catch (err: any) {
      alert('Gagal menyimpan data kepengurusan: ' + err.message);
    } finally {
      isSubmitting = false;
    }
  }

  async function deleteKepengurusan(id: any) {
    runWithConfirmation(
      'Hapus Pengurus',
      'Apakah Anda yakin ingin menghapus data pengurus ini?',
      async () => {
        try {
          const { error } = await supabase
            .from('kepengurusan_history')
            .delete()
            .eq('id', id);
          if (error) throw error;
          triggerAlert('Data pengurus berhasil dihapus.');
          await fetchKepengurusan();
        } catch (err: any) {
          alert('Gagal menghapus data pengurus: ' + err.message);
        }
      }
    );
  }

  async function handleDeleteAllKepengurusan() {
    runWithConfirmation(
      'Hapus Semua Data Kepengurusan',
      'Apakah Anda yakin ingin menghapus seluruh riwayat kepengurusan dari database? Tindakan ini tidak dapat dibatalkan.',
      async () => {
        try {
          const { error } = await supabase
            .from('kepengurusan_history')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');
          if (error) throw error;
          triggerAlert('Semua data kepengurusan berhasil dihapus.');
          await fetchKepengurusan();
        } catch (err: any) {
          alert('Gagal menghapus semua data kepengurusan: ' + err.message);
        }
      }
    );
  }

  // CSV Import logic for Kepengurusan
  function kep_handleDragOver(e: DragEvent) {
    e.preventDefault();
    kep_isDragging = true;
  }
  function kep_handleDragLeave() {
    kep_isDragging = false;
  }
  function kep_handleDrop(e: DragEvent) {
    e.preventDefault();
    kep_isDragging = false;
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      kep_processCSV(files[0]);
    }
  }
  function kep_handleFileSelect(e: any) {
    const files = e.target.files;
    if (files && files.length > 0) {
      kep_processCSV(files[0]);
    }
  }
  function kep_processCSV(file: File) {
    kep_csvImportError = "";
    kep_csvImportStatus = "";
    if (!file.name.endsWith(".csv")) {
      kep_csvImportError = "File harus berupa format .csv";
      return;
    }
    kep_csvFile = file;
    const reader = new FileReader();
    reader.onload = (event: any) => {
      const text = event.target.result;
      const lines = text.split(/\r?\n/).map((line: string) => line.trim()).filter((line: string) => line.length > 0);
      if (lines.length === 0) {
        kep_csvImportError = "File CSV kosong.";
        kep_csvFile = null;
        return;
      }
      let separator = ',';
      if (lines[0].includes(';')) separator = ';';
      else if (lines[0].includes('\t')) separator = '\t';

      const rawHeaders = parseCSVLine(lines[0], separator);
      const headers = rawHeaders.map(h => h.toLowerCase().trim().replace(/[\s_-]+/g, ''));

      function findIndex(aliases: string[]) {
        for (const alias of aliases) {
          const idx = headers.indexOf(alias.toLowerCase().replace(/[\s_-]+/g, ''));
          if (idx !== -1) return idx;
        }
        return -1;
      }

      const indices = {
        tahun_ajaran: findIndex(["tahun_ajaran", "tahun ajaran", "tahun", "periode"]),
        nama_lengkap: findIndex(["nama_lengkap", "nama lengkap", "nama", "name"]),
        jabatan: findIndex(["jabatan", "role", "position"]),
        divisi: findIndex(["divisi", "bagian", "division", "section"]),
        foto_custom_url: findIndex(["foto_custom_url", "foto custom url", "foto", "image"])
      };

      if (indices.nama_lengkap === -1 || indices.jabatan === -1 || indices.divisi === -1 || indices.tahun_ajaran === -1) {
        kep_csvImportError = "Kolom 'tahun_ajaran', 'nama_lengkap', 'jabatan', dan 'divisi' wajib ada.";
        kep_csvFile = null;
        return;
      }

      function getValue(columns: string[], field: keyof typeof indices, fallback: any = "") {
        const idx = indices[field];
        if (idx !== -1 && idx < columns.length) {
          return columns[idx] || fallback;
        }
        return fallback;
      }

      const list = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const columns = parseCSVLine(line, separator);
        const nameVal = getValue(columns, "nama_lengkap");
        if (nameVal && !["nama", "name", "nama lengkap"].includes(nameVal.toLowerCase())) {
          list.push({
            tahun_ajaran: getValue(columns, "tahun_ajaran", "2026-2027").replace(/\//g, '-'),
            nama_lengkap: nameVal,
            jabatan: getValue(columns, "jabatan"),
            divisi: getValue(columns, "divisi"),
            foto_custom_url: getValue(columns, "foto_custom_url")
          });
        }
      }

      if (list.length === 0) {
        kep_csvImportError = "Tidak ditemukan data valid di CSV.";
        kep_csvFile = null;
      } else {
        kep_parsedCSVData = list;
        kep_csvImportStatus = `Berhasil memproses ${kep_parsedCSVData.length} baris data dari CSV.`;
      }
    };
    reader.readAsText(file);
  }

  async function kep_handleUploadCSVData() {
    if (kep_parsedCSVData.length === 0) return;
    isSubmitting = true;
    kep_csvImportStatus = "Mengunggah data ke database...";
    kep_csvImportError = "";
    try {
      const { error } = await supabase
        .from('kepengurusan_history')
        .insert(kep_parsedCSVData);
      if (error) throw error;
      triggerAlert(`Berhasil mengimpor ${kep_parsedCSVData.length} data pengurus dari CSV!`);
      kep_parsedCSVData = [];
      kep_csvFile = null;
      kep_csvImportStatus = "";
      await fetchKepengurusan();
    } catch (err: any) {
      kep_csvImportError = "Gagal mengunggah data: " + err.message;
      kep_csvImportStatus = "";
    } finally {
      isSubmitting = false;
    }
  }

  onMount(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get('tab');
      if (tab && ['members', 'sangu', 'mading', 'stickynotes', 'timeline', 'notifikasi', 'carousel', 'kepengurusan', 'persetujuan_foto'].includes(tab)) {
        activeSection = tab;
      }
    }
    fetchSquad();
    fetchSangu();
    fetchAnnouncements();
    fetchStickyNotes();
    fetchPhotos();
    fetchNotifList();
    fetchCarouselSlides();
    fetchKepengurusan();
    fetchPendingPhotos();
  });
  // --- 8. GALLERIES CRUD ---
  // --- CSV Import for Nilai Akademik ---
  let nilai_targetTable = 'nilai_tamrin';
  let nilai_csvFile: File | null = null;
  let nilai_parsedCSVData: any[] = [];
  let nilai_csvImportStatus = '';
  let nilai_csvImportError = '';

  // --- CRUD Manual Nilai Akademik ---
  let nilai_mode: 'manual' | 'csv' = 'manual';
  let isFetchingNilai = false;
  let nilaiData: any[] = [];
  let nilaiSearch = '';
  let showNilaiModal = false;
  let editingNilai: any = null;
  let nilaiFilterKategori = '';
  let nilaiFilterTahunAjaran = '';
  let formNilai = {
    nis: '',
    nama_siswi: '',
    periode: '',
    tahun_ajaran: '2026-2027',
    kategori: '',
    mata_pelajaran: '',
    nilai: '',
    catatan: ''
  };

  async function fetchNilaiManual() {
    if (nilaiSearch.trim().length < 2) {
      nilaiData = [];
      return;
    }
    isFetchingNilai = true;
    try {
      let query = supabase.from('nilai_tamrin').select('*').order('created_at', { ascending: false }).limit(50);
      if (nilaiSearch.trim()) {
        query = query.or(`nama_siswi.ilike.%${nilaiSearch}%,nis.ilike.%${nilaiSearch}%`);
      }
      if (nilaiFilterKategori) {
        query = query.eq('kategori', nilaiFilterKategori);
      }
      if (nilaiFilterTahunAjaran) {
        query = query.eq('tahun_ajaran', nilaiFilterTahunAjaran);
      }
      const { data, error } = await query;
      if (error) throw error;
      nilaiData = data || [];
    } catch (err) {
      console.error(err);
    } finally {
      isFetchingNilai = false;
    }
  }

  // Remove automatic fetching to save egress
  // Re-fetch only if they are actively searching and change the table type
  $: if (nilai_targetTable && activeSection === 'nilai' && nilai_mode === 'manual' && nilaiSearch.trim().length >= 2) {
    fetchNilaiManual();
  }

  function openAddNilai() {
    editingNilai = null;
    formNilai = { nis: '', nama_siswi: '', periode: 'Ganjil', tahun_ajaran: '2026-2027', kategori: '', mata_pelajaran: '', nilai: '', catatan: '' };
    showNilaiModal = true;
  }

  function openEditNilai(n: any) {
    editingNilai = n;
    formNilai = {
      nis: n.nis || '',
      nama_siswi: n.nama_siswi || '',
      periode: n.periode || '',
      tahun_ajaran: n.tahun_ajaran || '2026-2027',
      kategori: n.kategori || '',
      mata_pelajaran: n.mata_pelajaran || '',
      nilai: n.nilai !== null ? String(n.nilai) : '',
      catatan: n.catatan || ''
    };
    showNilaiModal = true;
  }

  async function saveNilaiManual() {
    if (!formNilai.nis || !formNilai.nama_siswi || !formNilai.mata_pelajaran) {
      triggerAlert("NIS, Nama Siswi, dan Mata Pelajaran wajib diisi!");
      return;
    }
    isSubmitting = true;
    try {
      const payload = {
        nis: formNilai.nis,
        nama_siswi: formNilai.nama_siswi,
        periode: formNilai.periode,
        tahun_ajaran: formNilai.tahun_ajaran,
        kategori: formNilai.kategori,
        mata_pelajaran: formNilai.mata_pelajaran,
        nilai: formNilai.nilai ? parseFloat(formNilai.nilai.replace(',','.')) : null,
        catatan: formNilai.catatan
      };

      if (editingNilai) {
        const { error } = await supabase.from(nilai_targetTable).update(payload).eq('id', editingNilai.id);
        if (error) throw error;
        triggerAlert("Berhasil memperbarui nilai!");
      } else {
        const { error } = await supabase.from(nilai_targetTable).insert([payload]);
        if (error) throw error;
        triggerAlert("Berhasil menambah nilai!");
      }
      showNilaiModal = false;
      fetchNilaiManual();
    } catch (err: any) {
      triggerAlert("Gagal menyimpan nilai: " + err.message);
    } finally {
      isSubmitting = false;
    }
  }

  function deleteNilai(id: string) {
    runWithConfirmation(
      'Hapus Nilai',
      'Apakah Anda yakin ingin menghapus data nilai ini? Tindakan ini tidak dapat dibatalkan.',
      async () => {
        try {
          const { error } = await supabase.from(nilai_targetTable).delete().eq('id', id);
          if (error) throw error;
          triggerAlert('Data nilai berhasil dihapus.');
          fetchNilaiManual();
        } catch (err: any) {
          alert('Gagal menghapus nilai: ' + err.message);
        }
      }
    );
  }

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
      if (!text) { nilai_csvImportError = "File CSV kosong."; nilai_csvFile = null; return; }
      const lines = text.split(/\r?\n/).filter((l: string) => l.trim() !== "");
      if (lines.length < 2) { nilai_csvImportError = "CSV harus ada header + minimal 1 baris data."; nilai_csvFile = null; return; }
      const sep = text.includes("\t") ? "\t" : text.includes(";") ? ";" : ",";
      const rawHeaders = parseCSVLine(lines[0], sep);
      const headers = rawHeaders.map((h: string) => h.trim().toLowerCase());

      function localFindIdx(aliases: string[]) {
        for (const a of aliases) { const i = headers.indexOf(a); if (i !== -1) return i; }
        return -1;
      }

      const nisIdx      = localFindIdx(["nis", "no_induk", "nomor induk", "no induk"]);
      const namaIdx     = localFindIdx(["nama", "nama_siswi", "nama lengkap", "nama_lengkap"]);
      const periodeIdx  = localFindIdx(["periode", "semester"]);
      const tahunIdx    = localFindIdx(["tahun_ajaran", "tahun ajaran", "tahun"]);
      const kategoriIdx = localFindIdx(["kategori", "kategori_mazeeda"]);

      if (nisIdx === -1) { nilai_csvImportError = "Kolom 'NIS' wajib ada di file CSV."; nilai_csvFile = null; return; }

      const standardIdx = new Set([nisIdx, namaIdx, periodeIdx, tahunIdx, kategoriIdx]);
      const subjectCols: {idx: number, name: string}[] = [];
      headers.forEach((h: string, idx: number) => {
        if (!standardIdx.has(idx) && h !== "") subjectCols.push({ idx, name: rawHeaders[idx].trim() });
      });
      if (subjectCols.length === 0) { nilai_csvImportError = "Tidak ditemukan kolom mata pelajaran."; nilai_csvFile = null; return; }

      const list: any[] = [];
      const baseTime = Date.now();
      let sortCounter = 0;
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const cols = parseCSVLine(lines[i], sep);
        const nis = nisIdx < cols.length ? cols[nisIdx] : "";
        if (!nis) continue;
        const nama     = namaIdx !== -1 && namaIdx < cols.length     ? cols[namaIdx]     : "";
        const periode  = periodeIdx !== -1 && periodeIdx < cols.length  ? cols[periodeIdx]  : "";
        const tahun    = tahunIdx !== -1 && tahunIdx < cols.length    ? cols[tahunIdx]    : "";
        const kategori = kategoriIdx !== -1 && kategoriIdx < cols.length ? cols[kategoriIdx] : "";
        for (let j = 0; j < subjectCols.length; j++) {
          const sub = subjectCols[j];
          const rawVal = sub.idx < cols.length ? cols[sub.idx] : "";
          if (rawVal && rawVal.trim() !== "") {
            const cleanVal = rawVal.trim();
            const num = parseFloat(cleanVal.replace(",", "."));
            const isStrictNum = !isNaN(Number(cleanVal.replace(",", "."))) && cleanVal !== "";
            const hasBayan = cleanVal.includes("|||");
            
            list.push({ 
              nis: nis.slice(0, 20), 
              nama_siswi: nama, 
              periode, 
              tahun_ajaran: tahun, 
              kategori, 
              mata_pelajaran: sub.name, 
              nilai: isNaN(num) ? null : num, 
              catatan: (!isStrictNum || hasBayan) ? cleanVal : "",
              created_at: new Date(baseTime + sortCounter++).toISOString()
            });
          }
        }
      }
      if (list.length === 0) { nilai_csvImportError = "Tidak ditemukan data nilai valid."; nilai_csvFile = null; }
      else { nilai_parsedCSVData = list; nilai_csvImportStatus = `Berhasil memproses ${list.length} baris nilai pelajaran.`; }
    };
    reader.onerror = () => { nilai_csvImportError = "Gagal membaca berkas CSV."; nilai_csvFile = null; };
    reader.readAsText(file);
  }

  async function handleUploadNilaiCSV() {
    if (nilai_parsedCSVData.length === 0) return;
    nilai_csvImportStatus = `Mengunggah ke ${nilai_targetTable}...`;
    nilai_csvImportError = "";
    isImporting = true;
    try {
      const { error: err } = await supabase.from(nilai_targetTable).insert(nilai_parsedCSVData);
      if (err) throw err;
      triggerAlert(`Berhasil mengimpor ${nilai_parsedCSVData.length} nilai ke ${nilai_targetTable}!`);
      nilai_parsedCSVData = []; nilai_csvFile = null; nilai_csvImportStatus = "";
    } catch (err: any) {
      nilai_csvImportError = "Gagal mengunggah: " + err.message;
      nilai_csvImportStatus = "";
    } finally { isImporting = false; }
  }

  function handleNilaiFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) nilai_processCSV(input.files[0]);
  }
  // -------------------------------------------


  let galleryItems: any[] = [];
  let isLoadingGallery = false;
  let galleryImageUrl = '';
  let gallerySelectedFile: File | null = null;
  let editingGalleryId: any = null;

  $: if (activeSection === 'gallery_coverflow' || activeSection === 'gallery_landscape' || activeSection === 'gallery_marquee') {
    if (typeof window !== 'undefined') fetchGallery();
  }

  async function fetchGallery() {
    try {
      isLoadingGallery = true;
      const { data, error } = await supabase
        .from(activeSection)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        galleryItems = data;
      } else {
        galleryItems = [];
      }
    } catch (err) {
      console.error('Failed to load gallery:', err);
    } finally {
      isLoadingGallery = false;
    }
  }

  async function addGalleryImage() {
    if (!galleryImageUrl && !gallerySelectedFile) {
      alert('Gambar wajib diisi melalui URL atau unggah file!');
      return;
    }
    isSubmitting = true;
    try {
      let finalImageUrl = galleryImageUrl;
      if (gallerySelectedFile) {
        const publicUrl = await uploadMemoryPhoto(gallerySelectedFile, 'galleries');
        finalImageUrl = publicUrl;
      }

      if (editingGalleryId) {
        const { error } = await supabase.from(activeSection).update({ image_url: convertDriveUrl(finalImageUrl) }).eq('id', editingGalleryId);
        if (error) throw error;
        triggerAlert('Gambar berhasil diperbarui!');
      } else {
        const { error } = await supabase.from(activeSection).insert([{ image_url: convertDriveUrl(finalImageUrl) }]);
        if (error) throw error;
        triggerAlert('Gambar baru berhasil ditambahkan!');
      }
      galleryImageUrl = '';
      gallerySelectedFile = null;
      editingGalleryId = null;
      await fetchGallery();
    } catch (err: any) {
      alert('Gagal menyimpan gambar: ' + err.message);
    } finally {
      isSubmitting = false;
    }
  }

  function handleGalleryFileSelect(e: any) {
    const files = e.target.files;
    if (files && files.length > 0) {
      gallerySelectedFile = files[0];
      galleryImageUrl = ''; // clear url if file is selected
    }
  }

  function startEditGallery(item: any) {
    editingGalleryId = item.id;
    galleryImageUrl = item.image_url;
  }

  function deleteGalleryImage(id: string) {
    runWithConfirmation(
      'Hapus Gambar',
      'Yakin ingin menghapus gambar ini?',
      async () => {
        const { error } = await supabase.from(activeSection).delete().eq('id', id);
        if (error) alert(error.message);
        else {
          triggerAlert('Gambar dihapus');
          await fetchGallery();
        }
      }
    );
  }
</script>

<div class="space-y-6 pb-16 pt-4">

  <!-- Realtime Alert Message Banner (Floating Toast) -->
  {#if alertMessage}
    <div 
      transition:fade={{ duration: 150 }}
      class="fixed top-20 right-4 z-[999] flex items-center p-4 rounded-xl border {alertType === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'} text-xs font-semibold shadow-xl space-x-2.5 animate-in slide-in-from-top-4 duration-300"
    >
      {#if alertType === 'success'}
        <CheckCircle class="h-4.5 w-4.5 text-emerald-600" />
      {:else}
        <X class="h-4.5 w-4.5 text-rose-600" />
      {/if}
      <span>{alertMessage}</span>
    </div>
  {/if}

  <!-- Mobile Only Admin Navigation Dropdown -->
  <div class="md:hidden mb-4 relative z-[60]">
    <button
      on:click={() => isMobileDropdownOpen = !isMobileDropdownOpen}
      class="w-full flex items-center justify-between bg-white border border-slate-200 text-slate-700 font-bold rounded-xl p-3.5 shadow-sm transition-all {isMobileDropdownOpen ? 'ring-2 ring-primary border-transparent' : ''}"
    >
      <div class="flex items-center space-x-3 text-sm">
        <ShieldCheck class="h-5 w-5 text-primary" />
        <span class="truncate">{sections.find(s => s.value === activeSection)?.label || 'Pilih Menu Pengelolaan...'}</span>
      </div>
      <ChevronDown class="h-5 w-5 text-slate-400 transition-transform duration-200 {isMobileDropdownOpen ? 'rotate-180' : ''}" />
    </button>

    {#if isMobileDropdownOpen}
      <!-- Backdrop -->
      <button 
        class="fixed inset-0 z-40 w-full h-full cursor-default" 
        on:click={() => isMobileDropdownOpen = false}
        aria-label="Tutup menu"
      ></button>

      <!-- Dropdown Menu -->
      <div 
        transition:slideTransition={{ duration: 200 }}
        class="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50"
      >
        <div class="max-h-[60vh] overflow-y-auto py-2">
          <!-- Khasanah Link -->
          <button 
            on:click={() => { isMobileDropdownOpen = false; goto('/admin/khasanah'); }}
            class="w-full flex items-center space-x-3 px-4 py-3.5 text-left hover:bg-slate-50 transition-colors border-b border-slate-50"
          >
            <BookOpen class="h-5 w-5 text-emerald-500" />
            <span class="text-sm font-bold text-slate-700">Khasanah Lirboyo (Mozaik, dll)</span>
          </button>
          
          <div class="px-4 py-3 bg-slate-50/50">
            <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Manajemen Data</span>
          </div>

          {#each sections as s}
            <button
              on:click={() => { 
                isMobileDropdownOpen = false; 
                activeSection = s.value;
                goto(`/admin?tab=${s.value}`, { replaceState: true });
              }}
              class="w-full flex items-center px-4 py-3 text-left transition-colors
                {activeSection === s.value ? 'bg-primary/5 text-primary' : 'text-slate-600 hover:bg-slate-50'}"
            >
              <div class="w-1.5 h-1.5 rounded-full {activeSection === s.value ? 'bg-primary' : 'bg-transparent'} mr-3"></div>
              <span class="text-sm {activeSection === s.value ? 'font-bold' : 'font-medium'}">{s.label}</span>
            </button>
          {/each}
        </div>
      </div>
    {/if}
  </div>

  <!-- Tab Content Grid -->
  {#if activeSection === 'members' || activeSection === 'asatidzah'}
    <!-- ==================== TAB: MEMBERS & ASATIDZAH ==================== -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-200" transition:fade={{ duration: 150 }}>
      <!-- LEFT SIDE: INPUT FORM -->
      <div class="lg:col-span-6 space-y-4">
        <h2 class="text-lg font-bold text-slate-800 tracking-tight flex items-center space-x-2">
          {#if editingMemberId}
            <Edit class="h-5 w-5 text-indigo-600" />
            <span>Edit Data Anggota</span>
          {:else}
            <Plus class="h-5 w-5 text-primary" />
            <span>Tambah Data Baru</span>
          {/if}
        </h2>

        <!-- CSV Import Widget -->
        <Card class="p-5 space-y-3 border-dashed border-2 border-slate-200 bg-slate-50/20 mb-4">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 class="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <UploadCloud class="h-4.5 w-4.5 text-primary" />
              <span>Impor Data dari CSV</span>
            </h3>
            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Bulk Upload</span>
          </div>

          <!-- Instruction Rules -->
          <div class="bg-indigo-50/60 rounded-xl p-3 text-[11px] leading-relaxed text-indigo-900 border border-indigo-100/50">
            <p class="font-bold text-indigo-950 mb-1 flex items-center gap-1">
              <Info class="h-3.5 w-3.5" /> Aturan Berkas CSV Alumni:
            </p>
            <ul class="list-disc pl-4 space-y-0.5">
              <li>Header kolom **wajib**: <code class="font-mono bg-indigo-100 px-1 rounded">nama_lengkap</code> (sisanya opsional).</li>
              <li>Header kolom lain yang didukung: <code class="font-mono bg-indigo-100 px-1 rounded">nama_panggilan</code>, <code class="font-mono bg-indigo-100 px-1 rounded">nis</code>, <code class="font-mono bg-indigo-100 px-1 rounded">email</code>, <code class="font-mono bg-indigo-100 px-1 rounded">no_whatsapp</code>, <code class="font-mono bg-indigo-100 px-1 rounded">tempat_lahir</code>, <code class="font-mono bg-indigo-100 px-1 rounded">tahun_lahir</code>, <code class="font-mono bg-indigo-100 px-1 rounded">golongan_darah</code>, <code class="font-mono bg-indigo-100 px-1 rounded">foto_url</code>, dll.</li>
              <li>Pemisah kolom otomatis terdeteksi (koma `,`, titik koma `;`, atau tab).</li>
            </ul>
          </div>

          <!-- Drag and Drop Zone -->
          <div 
            on:dragover={handleDragOver}
            on:dragleave={handleDragLeave}
            on:drop={handleDrop}
            class="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors
              {isDragging ? 'border-primary bg-blue-50/30' : 'border-slate-200 bg-white hover:border-primary/40'}"
            on:click={() => document.getElementById('csv-file-input')?.click()}
          >
            <input 
              type="file" 
              id="csv-file-input" 
              accept=".csv" 
              class="hidden" 
              on:change={handleFileSelect}
            />
            <UploadCloud class="h-8 w-8 text-slate-400 mx-auto mb-2" />
            {#if csvFile}
              <p class="text-xs font-bold text-slate-700 truncate max-w-xs mx-auto">{csvFile.name}</p>
              <p class="text-[10px] text-slate-400 mt-1">{(csvFile.size / 1024).toFixed(1)} KB</p>
            {:else}
              <p class="text-xs font-bold text-slate-600">Seret & taruh file CSV di sini, atau klik untuk memilih</p>
              <p class="text-[10px] text-slate-400 mt-1">Pastikan terdapat kolom header <strong>nama_lengkap</strong></p>
            {/if}
          </div>

          <!-- Alert / Status messages -->
          {#if csvImportError}
            <p class="text-xs font-semibold text-rose-600 bg-rose-50/50 p-2.5 rounded-lg border border-rose-100">{csvImportError}</p>
          {/if}
          {#if csvImportStatus}
            <p class="text-xs font-semibold text-emerald-600 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100">{csvImportStatus}</p>
          {/if}

          <!-- Upload triggers -->
          {#if parsedCSVData.length > 0}
            <div class="flex gap-2 justify-end pt-2">
              <Button variant="secondary" on:click={() => { parsedCSVData = []; csvFile = null; csvImportStatus = ''; }} size="sm">Batal</Button>
              <Button on:click={handleUploadCSVData} disabled={isSubmitting} size="sm">
                <span>Unggah {parsedCSVData.length} Alumni</span>
              </Button>
            </div>
          {/if}
        </Card>

        <!-- Batch Photo Upload Widget -->
        <Card class="p-5 space-y-3 border-dashed border-2 border-emerald-200 bg-emerald-50/20 mb-4">
          <div class="flex items-center justify-between pb-2 border-b border-emerald-100">
            <h3 class="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <Image class="h-4.5 w-4.5 text-emerald-600" />
              <span>Upload Foto Profil Massal</span>
            </h3>
            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Batch Upload</span>
          </div>

          <div class="bg-emerald-50/60 rounded-xl p-3 text-[11px] leading-relaxed text-emerald-900 border border-emerald-100/50">
            <p class="font-bold text-emerald-950 mb-1 flex items-center gap-1">
              <Info class="h-3.5 w-3.5" /> Aturan Nama File Foto:
            </p>
            <ul class="list-disc pl-4 space-y-0.5">
              <li>Nama file <strong>wajib</strong> sama persis dengan <code class="font-mono bg-emerald-100 px-1 rounded">Nama Lengkap</code> atau <code class="font-mono bg-emerald-100 px-1 rounded">NIS</code>.</li>
              <li>Contoh: <code class="font-mono bg-emerald-100 px-1 rounded">Ahmad Fulan.jpg</code> atau <code class="font-mono bg-emerald-100 px-1 rounded">12345.png</code>.</li>
              <li>Gambar yang kebesaran akan <strong>di-resize otomatis</strong> oleh sistem.</li>
            </ul>
          </div>

          <!-- Drag and Drop Zone -->
          <div 
            on:dragover={photo_handleDragOver}
            on:dragleave={photo_handleDragLeave}
            on:drop={photo_handleDrop}
            class="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors
              {isDraggingPhoto ? 'border-emerald-400 bg-emerald-100/50' : 'border-emerald-200 bg-white hover:border-emerald-400/40'}"
            on:click={() => document.getElementById('photo-batch-input')?.click()}
          >
            <input 
              type="file" 
              id="photo-batch-input" 
              accept="image/*" 
              multiple
              class="hidden" 
              on:change={photo_handleFileSelect}
            />
            <Image class="h-8 w-8 text-emerald-400 mx-auto mb-2" />
            {#if batchPhotoFiles.length > 0}
              <p class="text-xs font-bold text-emerald-700 truncate max-w-xs mx-auto">{batchPhotoFiles.length} File Terpilih</p>
            {:else}
              <p class="text-xs font-bold text-emerald-600">Seret & taruh banyak foto di sini, atau klik untuk memilih</p>
            {/if}
          </div>

          <!-- Alert / Status messages -->
          {#if batchPhotoError}
            <p class="text-xs font-semibold text-rose-600 bg-rose-50/50 p-2.5 rounded-lg border border-rose-100">{batchPhotoError}</p>
          {/if}
          {#if batchPhotoStatus}
            <p class="text-xs font-semibold text-emerald-700 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100">{batchPhotoStatus}</p>
          {/if}
          {#if isSubmitting && batchPhotoProgress.total > 0}
             <div class="w-full bg-slate-200 rounded-full h-1.5 mt-2">
               <div class="bg-emerald-500 h-1.5 rounded-full transition-all duration-300" style="width: {(batchPhotoProgress.current / batchPhotoProgress.total) * 100}%"></div>
             </div>
             <p class="text-[10px] text-slate-500 text-center">Proses {batchPhotoProgress.current} dari {batchPhotoProgress.total}</p>
          {/if}

          <!-- Upload triggers -->
          {#if batchPhotoFiles.length > 0}
            <div class="flex gap-2 justify-end pt-2">
              <Button variant="secondary" on:click={() => { batchPhotoFiles = []; batchPhotoStatus = ''; batchPhotoError = ''; }} size="sm">Batal</Button>
              <Button on:click={handleBatchPhotoUpload} disabled={isSubmitting} size="sm" class="bg-emerald-600 hover:bg-emerald-700 text-white">
                <span>Mulai Upload Foto</span>
              </Button>
            </div>
          {/if}
        </Card>

        <Card class="p-5 space-y-4">
          <!-- Step Tab Toggles -->
          <Tabs items={stepTabs} bind:activeTab={activeFormStep} class="w-full bg-slate-50/50 p-0.5 rounded-lg border border-slate-200/40" />

          <form on:submit|preventDefault={handleAddMember} class="space-y-4 pt-2">
            <!-- STEP 1: IDENTITAS DIRI -->
            {#if activeFormStep === 'personal'}
              <div class="space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="space-y-1">
                    <label class="text-xs font-bold text-slate-500" for="nama_lengkap">Nama Lengkap *</label>
                    <Input id="nama_lengkap" placeholder="Nama lengkap sesuai KTP" bind:value={nama_lengkap} required />
                  </div>
                  <div class="space-y-1">
                    <label class="text-xs font-bold text-slate-500" for="nama_panggilan">Nama Panggilan</label>
                    <Input id="nama_panggilan" placeholder="Nama akrab panggilan" bind:value={nama_panggilan} />
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div class="space-y-1">
                    <label class="text-xs font-bold text-slate-500" for="nis">Nomor Induk Santri (NIS)</label>
                    <Input id="nis" placeholder="e.g. 220412" bind:value={nis} />
                  </div>
                  <div class="space-y-1">
                    <label class="text-xs font-bold text-slate-500" for="tempat_lahir">Tempat Lahir</label>
                    <Input id="tempat_lahir" placeholder="Kota lahir" bind:value={tempat_lahir} />
                  </div>
                  <div class="space-y-1">
                    <label class="text-xs font-bold text-slate-500" for="tahun_lahir">Tahun Lahir</label>
                    <Input id="tahun_lahir" type="text" placeholder="e.g. 18 APRIL 2010" bind:value={tahun_lahir} />
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="space-y-1">
                    <label class="text-xs font-bold text-slate-500" for="golongan_darah">Golongan Darah</label>
                    <select id="golongan_darah" class="flex h-12 w-full rounded-xl border border-border bg-white px-3 text-sm text-slate-700 focus:outline-none focus:border-primary" bind:value={golongan_darah}>
                      <option value="A">Golongan Darah A</option>
                      <option value="B">Golongan Darah B</option>
                      <option value="AB">Golongan Darah AB</option>
                      <option value="O">Golongan Darah O</option>
                    </select>
                  </div>
                  <div class="space-y-1">
                    <label class="text-xs font-bold text-slate-500" for="nama_ayah">Nama Ayah Kandung</label>
                    <Input id="nama_ayah" placeholder="Nama ayah kandung" bind:value={nama_ayah} />
                  </div>
                </div>

                <div class="space-y-1">
                  <label class="text-xs font-bold text-slate-500" for="alamat_ktp">Alamat Sesuai KTP</label>
                  <Input id="alamat_ktp" placeholder="Tulis alamat asal KTP" bind:value={alamat_ktp} />
                </div>
              </div>

            <!-- STEP 2: PONDOK & PENDIDIKAN -->
            {:else if activeFormStep === 'academic'}
              <div class="space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="space-y-1">
                    <label class="text-xs font-bold text-slate-500" for="kategori_mazeeda">Kategori Mazeeda *</label>
                    <select id="kategori_mazeeda" class="flex h-12 w-full rounded-xl border border-border bg-white px-3 text-sm text-slate-700 focus:outline-none focus:border-primary" bind:value={kategori_mazeeda}>
                      {#if activeSection === 'asatidzah'}
                        <option value="pengajar">Pengajar</option>
                        <option value="musyrif">Musyrif</option>
                        <option value="musyrifah">Musyrifah</option>
                        <option value="staf">Staf / Karyawan</option>
                      {:else}
                        <option value="alumni">Alumni</option>
                        <option value="alumnus">Alumnus</option>
                        <option value="mustahiq">Mustahiq</option>
                        <option value="mustahiqoh">Mustahiqoh</option>
                      {/if}
                    </select>
                  </div>
                  <div class="space-y-1">
                    <label class="text-xs font-bold text-slate-500" for="tahun_masuk">Tahun Masuk Pondok</label>
                    <Input id="tahun_masuk" placeholder="e.g. 2022" bind:value={tahun_masuk} />
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div class="space-y-1">
                    <label class="text-xs font-bold text-slate-500" for="kamar_santri">Kamar Santri</label>
                    <Input id="kamar_santri" placeholder="e.g. Aisyah 02" bind:value={kamar_santri} />
                  </div>
                  <div class="space-y-1">
                    <label class="text-xs font-bold text-slate-500" for="daerah_santri">Daerah Santri</label>
                    <Input id="daerah_santri" placeholder="e.g. Priangan, Jabodetabek" bind:value={daerah_santri} />
                  </div>
                  <div class="space-y-1">
                    <label class="text-xs font-bold text-slate-500" for="tahfidz_santri">Hafalan Qur'an</label>
                    <Input id="tahfidz_santri" placeholder="e.g. 5 Juz" bind:value={tahfidz_santri} />
                  </div>
                </div>

                <div class="space-y-1">
                  <label class="text-xs font-bold text-slate-500" for="riwayat_pendidikan">Riwayat Pendidikan Terakhir</label>
                  <Input id="riwayat_pendidikan" placeholder="Pendidikan terakhir santri" bind:value={riwayat_pendidikan} />
                </div>

                <div class="space-y-1">
                  <label class="text-xs font-bold text-slate-500" for="alamat_riwayatpendidikan">Alamat Pendidikan</label>
                  <Input id="alamat_riwayatpendidikan" placeholder="Alamat riwayat pendidikan terakhir" bind:value={alamat_riwayatpendidikan} />
                </div>

                <div class="space-y-1">
                  <label class="text-xs font-bold text-slate-500" for="rute_lengkap">Rute Lengkap Pulang / Perjalanan</label>
                  <Input id="rute_lengkap" placeholder="e.g. Lembang - Subang - Sumedang" bind:value={rute_lengkap} />
                </div>
              </div>

            {:else if activeFormStep === 'social'}
              <div class="space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="space-y-1">
                    <label class="text-xs font-bold text-slate-500" for="no_whatsapp">No. WhatsApp *</label>
                    <Input id="no_whatsapp" placeholder="Format: +6281..." bind:value={no_whatsapp} required />
                  </div>
                  <div class="space-y-1">
                    <label class="text-xs font-bold text-slate-500" for="email">Alamat Email *</label>
                    <Input id="email" type="email" placeholder="alamat@domain.com" bind:value={email} required />
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="space-y-1">
                    <label class="text-xs font-bold text-slate-500" for="media_social">Username Instagram</label>
                    <Input id="media_social" placeholder="e.g. @alumni_mazeeda" bind:value={media_social} />
                  </div>
                  <div class="space-y-1">
                    <label class="text-xs font-bold text-slate-500" for="tiktok_akun">Akun TikTok</label>
                    <Input id="tiktok_akun" placeholder="e.g. @username_tiktok" bind:value={tiktok_akun} />
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="space-y-1">
                    <label class="text-xs font-bold text-slate-500" for="facebook_akun">Akun Facebook</label>
                    <Input id="facebook_akun" placeholder="e.g. facebook.com/name" bind:value={facebook_akun} />
                  </div>
                  <div class="space-y-1">
                    <label class="text-xs font-bold text-slate-500" for="xtwitter_akun">Akun X / Twitter</label>
                    <Input id="xtwitter_akun" placeholder="e.g. @username_x" bind:value={xtwitter_akun} />
                  </div>
                </div>

                <div class="space-y-2">
                  <label class="text-xs font-bold text-slate-500" for="foto_url">Foto Profile</label>
                  
                  <div class="flex items-center gap-3">
                    {#if foto_url}
                      <img src={convertDriveUrl(foto_url)} alt="Preview" class="w-12 h-12 rounded-full object-cover border border-slate-200 shadow-sm" />
                    {:else}
                      <div class="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-200 shadow-sm">
                        <Image class="w-5 h-5" />
                      </div>
                    {/if}
                    
                    <div class="flex-1">
                      <div class="flex gap-2 relative">
                        <Input id="foto_url" placeholder="URL Foto / Link Storage" bind:value={foto_url} class="flex-1" />
                        
                        <div class="relative flex">
                          <input 
                            type="file" 
                            accept="image/*" 
                            class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            on:change={handleSinglePhotoUpload}
                            disabled={isUploadingSinglePhoto}
                          />
                          <Button type="button" variant="outline" class="whitespace-nowrap px-3 pointer-events-none relative z-0 {isUploadingSinglePhoto ? 'bg-slate-50 text-slate-400' : ''}" disabled={isUploadingSinglePhoto}>
                            {#if isUploadingSinglePhoto}
                              <UploadCloud class="w-4 h-4 mr-2 animate-pulse" />
                              Loading...
                            {:else}
                              <UploadCloud class="w-4 h-4 mr-2" />
                              Pilih Foto
                            {/if}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            <!-- STEP 4: KESAN & PESAN -->
            {:else}
              <div class="space-y-4">
                <div class="space-y-1">
                  <label class="text-xs font-bold text-slate-500" for="alamat_domisili">Alamat Domisili Sekarang</label>
                  <Input id="alamat_domisili" placeholder="Alamat tinggal sekarang" bind:value={alamat_domisili} />
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div class="space-y-1">
                    <label class="text-xs font-bold text-slate-500" for="keterampilan_khusus">Keterampilan Khusus</label>
                    <Input id="keterampilan_khusus" placeholder="e.g. Desain, Jahit" bind:value={keterampilan_khusus} />
                  </div>
                  <div class="space-y-1">
                    <label class="text-xs font-bold text-slate-500" for="hobi">Hobi</label>
                    <Input id="hobi" placeholder="Hobi santri" bind:value={hobi} />
                  </div>
                  <div class="space-y-1">
                    <label class="text-xs font-bold text-slate-500" for="music">Musik Favorit</label>
                    <Input id="music" placeholder="Musik kesukaan" bind:value={music} />
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="space-y-1">
                    <label class="text-xs font-bold text-slate-500" for="cita_cita">Cita-Cita</label>
                    <Input id="cita_cita" placeholder="Cita-cita santri" bind:value={cita_cita} />
                  </div>
                  <div class="space-y-1">
                    <label class="text-xs font-bold text-slate-500" for="makanan_kesukaan">Makanan Kesukaan</label>
                    <Input id="makanan_kesukaan" placeholder="Makanan favorit" bind:value={makanan_kesukaan} />
                  </div>
                </div>

                <div class="space-y-1">
                  <label class="text-xs font-bold text-slate-500" for="kutipan_kenangan">Kutipan Kenangan Terindah (Quotes)</label>
                  <Input id="kutipan_kenangan" placeholder="Kutipan memori / kata bijak selama di pondok" bind:value={kutipan_kenangan} />
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="space-y-1">
                    <label class="text-xs font-bold text-slate-500" for="kesan">Kesan Selama di Pondok</label>
                    <textarea id="kesan" rows="3" class="flex w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-primary focus:outline-none" placeholder="Tulis kesan santri..." bind:value={kesan}></textarea>
                  </div>
                  <div class="space-y-1">
                    <label class="text-xs font-bold text-slate-500" for="pesan">Pesan untuk Anggota Lain</label>
                    <textarea id="pesan" rows="3" class="flex w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-primary focus:outline-none" placeholder="Tulis pesan santri..." bind:value={pesan}></textarea>
                  </div>
                </div>
              </div>
            {/if}

            <!-- Submit trigger -->
            <div class="flex items-center justify-between pt-4 border-t border-slate-100 gap-2">
              <span class="text-[10px] text-slate-400 font-bold uppercase truncate max-w-[120px]">Langkah: {activeFormStep}</span>
              
              <div class="flex items-center gap-2">
                {#if editingMemberId}
                  <Button type="button" variant="secondary" on:click={cancelEditMember} size="sm" class="font-bold">
                    <span>Batal</span>
                  </Button>
                {/if}
                <Button type="submit" disabled={isSubmitting} class="flex items-center space-x-2">
                  {#if isSubmitting}
                    <span class="animate-pulse">Menyimpan...</span>
                  {:else if editingMemberId}
                    <Save class="h-4.5 w-4.5" />
                    <span>Simpan Perubahan</span>
                  {:else}
                    <UserPlus class="h-4.5 w-4.5" />
                    <span>Simpan ke Database</span>
                  {/if}
                </Button>
              </div>
            </div>
          </form>
        </Card>
      </div>

      <!-- RIGHT SIDE: DATABASE LIST -->
      <div class="lg:col-span-6 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 class="text-lg font-bold text-slate-800 tracking-tight flex items-center space-x-2">
            <FileText class="h-5 w-5 text-blue-600" />
            <span>Database {activeSection === 'asatidzah' ? 'Asatidzah' : 'Squad'} ({squad.length} dari {squadTotalCount})</span>
          </h2>
          <Button on:click={handleDeleteAllMembers} variant="destructive" size="sm" class="font-bold flex items-center space-x-1">
            <Trash2 class="h-3.5 w-3.5" />
            <span>Hapus Semua</span>
          </Button>
        </div>

        <!-- Squad Search Bar -->
        <Card class="p-3">
          <div class="space-y-3">
            <div class="relative">
              <Search class="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari alumni berdasarkan nama, panggilan, NIS..." 
                class="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-medium focus:outline-none focus:border-primary focus:bg-white"
                bind:value={squadSearchQuery}
              />
            </div>
            
            <!-- Login Status Filter Buttons -->
            <div class="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100/50">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status Login:</span>
              <div class="flex bg-slate-100/80 rounded-lg p-0.5 border border-slate-200/40">
                <button
                  type="button"
                  on:click={() => squadLoginFilter = 'all'}
                  class="px-2.5 py-1 text-[10px] font-bold rounded-md transition-all duration-200
                    {squadLoginFilter === 'all' ? 'bg-white text-primary shadow-soft-sm' : 'text-slate-500 hover:text-slate-700'}"
                >
                  Semua ({squad.length})
                </button>
                <button
                  type="button"
                  on:click={() => squadLoginFilter = 'logged_in'}
                  class="px-2.5 py-1 text-[10px] font-bold rounded-md transition-all duration-200
                    {squadLoginFilter === 'logged_in' ? 'bg-white text-emerald-600 shadow-soft-sm' : 'text-slate-500 hover:text-slate-700'}"
                >
                  Pernah Login ({squad.filter(s => s.has_logged_in).length})
                </button>
                <button
                  type="button"
                  on:click={() => squadLoginFilter = 'not_logged_in'}
                  class="px-2.5 py-1 text-[10px] font-bold rounded-md transition-all duration-200
                    {squadLoginFilter === 'not_logged_in' ? 'bg-white text-slate-600 shadow-soft-sm' : 'text-slate-500 hover:text-slate-700'}"
                >
                  Belum Login ({squad.filter(s => !s.has_logged_in).length})
                </button>
                <button
                  type="button"
                  on:click={() => squadLoginFilter = 'deactivated'}
                  class="px-2.5 py-1 text-[10px] font-bold rounded-md transition-all duration-200
                    {squadLoginFilter === 'deactivated' ? 'bg-white text-rose-600 shadow-soft-sm' : 'text-slate-500 hover:text-slate-700'}"
                >
                  Dinonaktifkan ({squad.filter(s => s.is_active === false).length})
                </button>
              </div>
            </div>
          </div>
        </Card>

        <!-- Squad List View (styled as Card Grid identical to /squad) -->
        <div class="max-h-[600px] overflow-y-auto pr-1">
          {#if isLoadingSquad}
            <div class="py-16 text-center space-y-4">
              <img src="/loading.svg" alt="Loading..." class="h-16 w-16 mx-auto animate-pulse" />
              <p class="text-xs font-bold text-slate-400 tracking-wide uppercase">Memuat data {activeSection === 'asatidzah' ? 'Asatidzah' : 'Squad'}...</p>
            </div>
          {:else if squad.length > 0}
            <div class="grid grid-cols-1 gap-2">
              {#each squad as item (item.id || item.nama_lengkap)}
                {@const accent = getAccent(item.nama_lengkap)}
                <Card class="group flex flex-col justify-between hover:scale-[1.01] hover:shadow-soft-md transition-all duration-300 h-full p-4 border-slate-100">
                  <div class="flex items-center space-x-3 min-w-0">
                    <!-- Avatar with accent ring + dot -->
                    <div class="relative shrink-0">
                      {#if item.foto_url && !failedImages.has(item.id)}
                        <img referrerpolicy="no-referrer" 
                          src={convertDriveUrl(item.foto_url)} 
                          alt={item.nama_lengkap}
                          class="h-10 w-10 rounded-full object-cover shadow-soft-sm ring-2 {accent.ring}"
                          on:error={() => { failedImages.add(item.id); failedImages = failedImages; }}
                        />
                      {:else}
                        <div class="h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs shadow-soft-sm ring-2 {accent.avatar} {accent.ring}">
                          {getInitials(item.nama_lengkap)}
                        </div>
                      {/if}
                      <!-- Login status dot on avatar -->
                      {#if item.has_logged_in}
                        <span class="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" title="Pernah Login"></span>
                      {:else}
                        <span class="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-slate-300" title="Belum Login"></span>
                      {/if}
                    </div>
                    
                    <div class="flex-1 min-w-0 leading-tight">
                      <div class="flex items-center justify-between gap-2">
                        <h3 class="font-extrabold text-slate-800 text-sm truncate group-hover:text-primary transition-colors" title={item.nama_lengkap}>
                          {item.nama_lengkap}
                        </h3>
                        <span class="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200/50 px-2.5 py-0.5 rounded-full truncate max-w-[100px]" title={item.alamat_domisili}>
                          {item.alamat_domisili || '-'}
                        </span>
                      </div>
                      
                      <!-- Display nickname | region -->
                      <p class="text-xs text-slate-400 font-medium truncate mt-1">
                        {item.nama_panggilan || '-'}{item.daerah_santri ? ' | ' + capitalizeEachWord(item.daerah_santri) : ''}
                      </p>

                      <!-- Login status badge -->
                      {#if item.has_logged_in}
                        <div class="flex items-center space-x-1 mt-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100/60 rounded-lg px-2 py-0.5 text-[9px] font-bold w-fit">
                          <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>Pernah Login</span>
                          {#if item.last_login}
                            <span class="text-slate-400 font-medium font-mono text-[8.5px]">({formatDateTime(item.last_login)})</span>
                          {/if}
                        </div>
                      {:else}
                        <div class="flex items-center space-x-1 mt-1.5 bg-slate-50 text-slate-400 border border-slate-200/50 rounded-lg px-2 py-0.5 text-[9px] font-bold w-fit">
                          <span class="h-1.5 w-1.5 rounded-full bg-slate-300"></span>
                          <span>Belum Login</span>
                        </div>
                      {/if}
                    </div>
                  </div>

                  <!-- Footer with category and action buttons -->
                  <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span class="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full truncate uppercase" title={item.kategori_mazeeda}>
                      {item.kategori_mazeeda || 'alumni'}
                    </span>

                    <div class="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        on:click={() => toggleMemberActiveStatus(item)}
                        class="p-2 rounded-lg transition-all duration-200 flex items-center justify-center
                          {item.is_active === false ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-500 hover:text-white border border-emerald-100 hover:border-emerald-500' : 'text-amber-600 bg-amber-50 hover:bg-amber-500 hover:text-white border border-amber-100 hover:border-amber-500'}"
                        title={item.is_active === false ? 'Aktifkan Akun' : 'Nonaktifkan Akun'}
                      >
                        {#if item.is_active === false}
                          <UserCheck class="h-4 w-4" />
                        {:else}
                          <UserX class="h-4 w-4" />
                        {/if}
                      </button>
                      <button
                        type="button"
                        on:click={() => startEditMember(item)}
                        class="p-2 rounded-lg text-indigo-600 hover:text-white bg-indigo-50 hover:bg-indigo-600 border border-indigo-100 hover:border-indigo-600 transition-all duration-200 flex items-center justify-center"
                        title="Edit Anggota"
                      >
                        <Edit class="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        on:click={() => handleDeleteMember(item.id)}
                        class="p-2 rounded-lg text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-500 border border-rose-100 hover:border-rose-500 transition-all duration-200 flex items-center justify-center"
                        title="Hapus Anggota"
                      >
                        <Trash2 class="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              {/each}
            </div>
            
            {#if squad.length < squadTotalCount}
              <div class="mt-6 text-center pb-2">
                <Button 
                  on:click={() => { squadLimit += 10; fetchSquad(squadSearchQuery, squadLoginFilter, squadLimit, activeSection); }} 
                  variant="outline" 
                  class="font-bold text-slate-600 bg-white hover:bg-slate-50 border-slate-200/60 w-full sm:w-auto"
                >
                  Muat Lebih Banyak ({squadTotalCount - squad.length} tersisa)
                </Button>
              </div>
            {/if}
          {:else}
            <div class="py-16 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50 flex flex-col items-center justify-center space-y-4">
              <img src="/empty-content.svg" alt="Tidak ada data" class="h-40 w-40 opacity-80" />
              <div>
                <p class="text-sm font-bold text-slate-500">Data {activeSection === 'asatidzah' ? 'Asatidzah' : 'Squad'} tidak ditemukan</p>
                <p class="text-xs text-slate-400 mt-1">Silakan sesuaikan filter pencarian atau isi formulir baru di sebelah kiri.</p>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>

  {:else if activeSection === 'feedbacks'}
    <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl shadow-soft-sm border border-slate-100">
        <div>
          <h2 class="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <span class="text-2xl">📬</span> Kotak Saran & Masukan
          </h2>
          <p class="text-sm text-slate-500 mt-1">Kelola dan baca saran dari para alumni & asatidzah.</p>
        </div>
        
        <div class="flex items-center gap-2">
          <select 
            bind:value={feedbackFilter} 
            on:change={fetchFeedbacks}
            class="h-10 border border-slate-200 text-sm font-semibold text-slate-600 rounded-xl px-3 focus:outline-none focus:border-indigo-400 bg-slate-50"
          >
            <option value="all">Semua Pesan</option>
            <option value="unread">Belum Dibaca</option>
            <option value="read">Sudah Dibaca</option>
          </select>
          <button on:click={fetchFeedbacks} class="flex items-center justify-center h-10 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-4 rounded-xl transition-colors">
            <RefreshCw class="w-4 h-4 mr-2 {isLoadingFeedbacks ? 'animate-spin' : ''}" />
            Refresh
          </button>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-soft-sm border border-slate-100 overflow-hidden">
        {#if isLoadingFeedbacks}
          <div class="py-12 text-center space-y-4">
            <img src="/loading.svg" alt="Loading..." class="h-16 w-16 mx-auto animate-pulse" />
            <p class="text-xs font-bold text-slate-400 tracking-wide uppercase">Memuat Kotak Saran...</p>
          </div>
        {:else if feedbacksList.length === 0}
          <div class="py-16 text-center flex flex-col items-center justify-center space-y-4">
            <img src="/empty-content.svg" alt="Kosong" class="h-32 w-32 opacity-75" />
            <div>
              <p class="text-sm font-bold text-slate-500">Belum ada saran yang masuk</p>
              <p class="text-xs text-slate-400 mt-1">Saran dan masukan pengguna akan muncul di sini.</p>
            </div>
          </div>
        {:else}
          <div class="divide-y divide-slate-100">
            {#each feedbacksList as item (item.id)}
              <div class="p-5 hover:bg-slate-50 transition-colors {item.is_read ? 'opacity-70' : 'bg-indigo-50/30'} flex flex-col sm:flex-row gap-4">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="font-bold text-slate-800 text-sm">{item.user_name}</span>
                    <span class="text-[10px] text-slate-400 font-medium">• {formatDateTime(item.created_at)}</span>
                    {#if !item.is_read}
                      <span class="bg-indigo-100 text-indigo-700 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Baru</span>
                    {/if}
                  </div>
                  <p class="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{item.message}</p>
                  
                  {#if item.admin_reply}
                    <div class="mt-3 bg-indigo-50/50 rounded-lg p-3 border border-indigo-100/50">
                      <p class="text-xs font-bold text-indigo-700 mb-1 flex items-center gap-1.5">
                        <ShieldCheck class="w-3.5 h-3.5" /> Balasan Admin:
                      </p>
                      <p class="text-sm text-slate-700 whitespace-pre-wrap">{item.admin_reply}</p>
                    </div>
                  {/if}
                  
                  <!-- Reply Form -->
                  {#if replyingToId === item.id}
                    <div class="mt-4 bg-white border border-slate-200 rounded-xl p-3 shadow-soft-sm">
                      <textarea 
                        bind:value={replyMessage}
                        placeholder="Ketik balasan Anda di sini..." 
                        class="w-full text-sm border-none bg-slate-50 focus:bg-white focus:ring-1 focus:ring-indigo-400 rounded-lg p-2 resize-none outline-none mb-3"
                        rows="3"
                      ></textarea>
                      <div class="flex items-center justify-end gap-2">
                        <button 
                          on:click={() => replyingToId = null}
                          class="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        >Batal</button>
                        <button 
                          on:click={() => submitReply(item)}
                          disabled={isReplying || !replyMessage.trim()}
                          class="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center disabled:opacity-50"
                        >
                          {#if isReplying}
                            <RefreshCw class="w-3.5 h-3.5 mr-1.5 animate-spin" /> Mengirim...
                          {:else}
                            <MessageCircle class="w-3.5 h-3.5 mr-1.5" /> Kirim Balasan
                          {/if}
                        </button>
                      </div>
                    </div>
                  {/if}
                </div>
                
                <div class="flex sm:flex-col gap-2 shrink-0 justify-end sm:justify-start">
                  {#if !item.is_read}
                    <button 
                      on:click={() => markFeedbackRead(item.id)}
                      class="flex items-center justify-center h-8 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-100 text-[11px] font-bold px-3 rounded-lg transition-colors"
                    >
                      <CheckCircle class="w-3.5 h-3.5 mr-1.5" />
                      Tandai Dibaca
                    </button>
                  {/if}
                  <button 
                    on:click={() => deleteFeedback(item.id)}
                    class="flex items-center justify-center h-8 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white border border-rose-100 text-[11px] font-bold px-3 rounded-lg transition-colors"
                  >
                    <Trash2 class="w-3.5 h-3.5 mr-1.5" />
                    Hapus
                  </button>
                  
                  {#if !item.admin_reply && replyingToId !== item.id}
                    <button 
                      on:click={() => { replyingToId = item.id; replyMessage = ''; }}
                      class="flex items-center justify-center h-8 bg-indigo-50 text-indigo-600 hover:bg-indigo-500 hover:text-white border border-indigo-100 text-[11px] font-bold px-3 rounded-lg transition-colors"
                    >
                      <MessageCircle class="w-3.5 h-3.5 mr-1.5" />
                      Balas
                    </button>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>

  {:else if activeSection === 'sangu'}
    <!-- ==================== TAB: SANGU BACAAN ==================== -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-200" transition:fade={{ duration: 150 }}>
      <!-- LEFT SIDE: INPUT FORM -->
      <div class="lg:col-span-5 space-y-4">
        <form on:submit|preventDefault={handleSaveSangu} class="space-y-4">
          <!-- Sticky Action Bar for Form -->
          <Card noPadding class="p-3 sm:p-4 border-slate-200/50 shadow-soft-sm bg-white/95 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between gap-4">
            <!-- Title -->
            <h2 class="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
              {#if editingSanguId}
                <Edit class="h-4.5 w-4.5 text-indigo-600 shrink-0" />
                <span>Edit Catatan Sangu</span>
              {:else}
                <Plus class="h-4.5 w-4.5 text-teal-600 shrink-0" />
                <span>Sangu Baru</span>
              {/if}
            </h2>

            <!-- Actions -->
            <div class="flex items-center space-x-2 shrink-0">
              {#if editingSanguId}
                <button 
                  type="button" 
                  on:click={cancelEditSangu} 
                  class="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-premium cursor-pointer"
                  style="min-height: 36px;"
                >
                  Batal
                </button>
              {/if}
              
              <button 
                type="submit"
                disabled={isSubmitting}
                class="inline-flex items-center space-x-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-soft-sm transition-premium cursor-pointer disabled:opacity-50"
                style="min-height: 36px;"
              >
                {#if isSubmitting}
                  <span class="animate-pulse">...</span>
                {:else}
                  <Save class="h-3.5 w-3.5" />
                  <span>Simpan Sangu</span>
                {/if}
              </button>
            </div>
          </Card>

          <Card class="p-5 space-y-4">
            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-500" for="sangu_title">Judul Sangu / Wirid *</label>
              <Input id="sangu_title" placeholder="e.g. Sholawat Ibrahimiyah, Doa Tolak Bala" bind:value={sanguTitle} required />
            </div>

            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-500" for="sangu_cat">Kategori *</label>
              <select id="sangu_cat" class="flex h-12 w-full rounded-xl border border-border bg-white px-3 text-sm text-slate-700 focus:outline-none focus:border-teal-500" bind:value={sanguCategory}>
                <option value="sholawat">Sholawat</option>
                <option value="jausyan">Jausyan</option>
                <option value="nadzom">Nadzom</option>
                <option value="doa">Doa & Hizib</option>
                <option value="others">Lainnya</option>
                <option value="new">+ Tambah Kategori Baru...</option>
              </select>
            </div>

            {#if sanguCategory === 'new'}
              <div class="space-y-1" transition:slideTransition>
                <label class="text-xs font-bold text-slate-500" for="sangu_new_cat">Nama Kategori Baru *</label>
                <Input id="sangu_new_cat" placeholder="e.g. Wirid, Ratib" bind:value={sanguNewCategory} required />
              </div>
            {/if}

            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-500">Isi Konten Bacaan *</label>
              <RichTextEditor bind:value={sanguContent} placeholder="Tulis isi bacaan arab, latin, dan terjemahan di sini..." />
            </div>
          </Card>
        </form>
      </div>

      <!-- RIGHT SIDE: DATABASE LIST -->
      <div class="lg:col-span-7 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 class="text-lg font-bold text-slate-800 tracking-tight flex items-center space-x-2">
            <BookOpen class="h-5 w-5 text-teal-600" />
            <span>Daftar Bacaan Sangu ({sanguList.length})</span>
          </h2>
          <Button on:click={handleDeleteAllSangu} variant="destructive" size="sm" class="font-bold flex items-center space-x-1">
            <Trash2 class="h-3.5 w-3.5" />
            <span>Hapus Semua</span>
          </Button>
        </div>

        <!-- Sangu Search Bar -->
        <Card class="p-3">
          <div class="relative">
            <Search class="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari sholawat, nadzom, atau berkas doa..." 
              class="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-medium focus:outline-none focus:border-teal-500 focus:bg-white"
              bind:value={sanguSearchQuery}
            />
          </div>
        </Card>

        <!-- Sangu Cards Grid -->
        <div class="max-h-[600px] overflow-y-auto pr-1">
          {#if isLoadingSangu}
            <div class="py-12 text-center space-y-2">
              <div class="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p class="text-xs font-semibold text-slate-400">Memuat data bacaan...</p>
            </div>
          {:else}
            {@const filteredSangu = sanguList.filter(item => {
              if (!sanguSearchQuery) return true;
              const q = sanguSearchQuery.toLowerCase();
              return (item.title || '').toLowerCase().includes(q) || (item.content || '').toLowerCase().includes(q) || (item.category || '').toLowerCase().includes(q);
            })}

            {#if filteredSangu.length > 0}
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {#each filteredSangu as item (item.id)}
                  <Card class="p-4 flex flex-col justify-between hover:scale-[1.01] hover:shadow-soft-md transition-all duration-300 h-full border-slate-100">
                    <div class="space-y-2.5">
                      <div class="flex items-center justify-between">
                        <span class="text-[10px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full uppercase">
                          {item.category || 'UMUM'}
                        </span>
                      </div>
                      <h4 class="font-extrabold text-slate-800 text-sm line-clamp-2" title={item.title}>{item.title.toUpperCase()}</h4>
                      <p class="text-[11px] text-slate-500 font-normal line-clamp-3">
                        {item.content ? item.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : ''}
                      </p>
                    </div>

                    <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        on:click={() => startEditSangu(item)}
                        class="p-2 rounded-lg text-indigo-600 hover:text-white bg-indigo-50 hover:bg-indigo-600 border border-indigo-100 hover:border-indigo-600 transition-all duration-200 flex items-center justify-center"
                        title="Edit Sangu"
                      >
                        <Edit class="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        on:click={() => deleteSangu(item.id)}
                        class="p-2 rounded-lg text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-500 border border-rose-100 hover:border-rose-500 transition-all duration-200 flex items-center justify-center"
                        title="Hapus Sangu"
                      >
                        <Trash2 class="h-4 w-4" />
                      </button>
                    </div>
                  </Card>
                {/each}
              </div>
            {:else}
              <div class="py-12 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <p class="text-xs font-semibold text-slate-500">Tidak ada bacaan Sangu ditemukan</p>
              </div>
            {/if}
          {/if}
        </div>
      </div>
    </div>

  {:else if activeSection === 'mading'}
    <!-- ==================== TAB: MADING ==================== -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-200" transition:fade={{ duration: 150 }}>
      <!-- LEFT SIDE: CREATE FORM -->
      <div class="lg:col-span-5 space-y-4">
        <h2 class="text-lg font-bold text-slate-800 tracking-tight flex items-center space-x-2">
          {#if editingMadingId}
            <Edit class="h-5 w-5 text-amber-600" />
            <span>Edit Pengumuman Mading</span>
          {:else}
            <Plus class="h-5 w-5 text-amber-600" />
            <span>Buat Pengumuman Mading</span>
          {/if}
        </h2>

        <Card class="p-5">
          <form on:submit|preventDefault={addMading} class="space-y-4">
            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-500" for="madTitle">Judul Mading</label>
              <Input id="madTitle" placeholder="e.g. Jadwal Ronda Masjid Baru" bind:value={madingTitle} required />
            </div>

            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-500" for="madCat">Kategori Pengumuman</label>
              <select id="madCat" class="flex h-12 w-full rounded-xl border border-border bg-white px-3 text-sm text-slate-700 focus:outline-none focus:border-amber-500" bind:value={madingCategory}>
                <option value="Informasi">Informasi</option>
                <option value="Kajian">Kajian</option>
                <option value="Sosial">Sosial</option>
                <option value="Pemberitahuan">Pemberitahuan</option>
                <option value="new">+ Tambah Kategori Baru...</option>
              </select>
            </div>

            {#if madingCategory === 'new'}
              <div class="space-y-1" transition:slideTransition>
                <label class="text-xs font-bold text-slate-500" for="madNewCat">Nama Kategori Baru</label>
                <Input id="madNewCat" placeholder="e.g. Kreatif, Olahraga" bind:value={madingNewCategory} required />
              </div>
            {/if}

            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-500" for="madAuth">Penulis</label>
              <Input id="madAuth" placeholder="Masukkan nama pembuat" bind:value={madingAuthor} />
            </div>

            <!-- Priority Checkbox -->
            <div class="flex items-center space-x-3 py-1">
              <input 
                type="checkbox" 
                id="madPriority" 
                class="h-4.5 w-4.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500/20 cursor-pointer" 
                bind:checked={madingIsPriority} 
              />
              <label for="madPriority" class="text-xs font-bold text-slate-600 cursor-pointer select-none">
                📌 Sematkan Pengumuman (Jadikan Prioritas di Bagian Paling Atas)
              </label>
            </div>

            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-500" for="madCont">Isi Pengumuman</label>
              <textarea id="madCont" rows="4" class="flex w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none" placeholder="Tulis detail pengumuman disini..." bind:value={madingContent} required></textarea>
            </div>

            <div class="flex items-center justify-end gap-2 pt-2">
              {#if editingMadingId}
                <Button type="button" variant="secondary" on:click={cancelEditMading} size="sm">Batal</Button>
              {/if}
              <Button type="submit" disabled={isSubmitting} class="flex items-center justify-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white font-bold h-11">
                {#if isSubmitting}
                  <span>Menyimpan...</span>
                {:else if editingMadingId}
                  <Save class="h-4.5 w-4.5" />
                  <span>Simpan Perubahan</span>
                {:else}
                  <Megaphone class="h-4.5 w-4.5" />
                  <span>Publikasikan Mading</span>
                {/if}
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <!-- RIGHT SIDE: MADING DATABASE LISTS -->
      <div class="lg:col-span-7 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 class="text-lg font-bold text-slate-800 tracking-tight flex items-center space-x-2">
            <FileText class="h-5 w-5 text-amber-600" />
            <span>Pengumuman Resmi ({madingList.length})</span>
          </h2>
          <Button on:click={handleDeleteAllMading} variant="destructive" size="sm" class="font-bold flex items-center space-x-1">
            <Trash2 class="h-3.5 w-3.5" />
            <span>Hapus Semua</span>
          </Button>
        </div>

        <!-- Mading Search Bar -->
        <Card class="p-3">
          <div class="relative">
            <Search class="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari pengumuman berdasarkan judul, isi, kategori..." 
              class="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-medium focus:outline-none focus:border-amber-500 focus:bg-white"
              bind:value={madingSearchQuery}
            />
          </div>
        </Card>

        <div class="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
          {#if isLoadingMading}
            <div class="py-6 text-center text-xs font-semibold text-slate-400">Memuat pengumuman...</div>
          {:else}
            {@const filteredMading = madingList.filter(item => {
              if (!madingSearchQuery) return true;
              const q = madingSearchQuery.toLowerCase();
              return (item.title || '').toLowerCase().includes(q) || (item.content || '').toLowerCase().includes(q) || (item.category || '').toLowerCase().includes(q) || (item.author || '').toLowerCase().includes(q);
            })}

            {#if filteredMading.length > 0}
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {#each filteredMading as item}
                  <Card class="p-4 flex flex-col justify-between border-slate-100 {item.is_priority ? 'border-l-4 border-l-amber-500 bg-amber-50/10' : ''}">
                    <div class="leading-tight min-w-0 pr-2">
                      <div class="flex items-center space-x-1.5">
                        {#if item.is_priority}
                          <span class="text-xs text-amber-600" title="Pinned/Prioritas">📌</span>
                        {/if}
                        <h4 class="font-extrabold text-slate-800 text-sm truncate max-w-[200px]" title={item.title}>{item.title}</h4>
                      </div>
                      <p class="text-[9px] text-slate-400 font-bold uppercase mt-1">
                        <span class="px-1.5 py-0.5 rounded bg-amber-50 border border-amber-100 text-amber-700">{item.category}</span>
                        <span class="ml-1">Oleh: {item.author}</span>
                      </p>
                      <p class="text-xs text-slate-500 line-clamp-3 mt-2">{item.content}</p>
                    </div>
                    
                    <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        on:click={() => startEditMading(item)}
                        class="p-2 rounded-lg text-indigo-600 hover:text-white bg-indigo-50 hover:bg-indigo-600 border border-indigo-100 hover:border-indigo-600 transition-all duration-200 flex items-center justify-center"
                        title="Edit Mading"
                      >
                        <Edit class="h-4 w-4" />
                      </button>
                      <button 
                        type="button"
                        on:click={() => deleteMading(item.id)}
                        class="p-2 rounded-lg text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-500 border border-rose-100 hover:border-rose-500 transition-all duration-200 flex items-center justify-center"
                        title="Hapus Pengumuman"
                      >
                        <Trash2 class="h-4 w-4" />
                      </button>
                    </div>
                  </Card>
                {/each}
              </div>
            {:else}
              <div class="py-6 text-center text-xs font-semibold text-slate-400 border border-dashed rounded-xl bg-slate-50/50">Tidak ada pengumuman ditemukan.</div>
            {/if}
          {/if}
        </div>
      </div>
    </div>

  {:else if activeSection === 'stickynotes'}
    <!-- ==================== TAB: STICKY NOTES ==================== -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-200" transition:fade={{ duration: 150 }}>
      <!-- LEFT SIDE: CREATE/EDIT FORM -->
      <div class="lg:col-span-5 space-y-4">
        <h2 class="text-lg font-bold text-slate-800 tracking-tight flex items-center space-x-2">
          {#if editingStickyId}
            <Edit class="h-5 w-5 text-amber-600" />
            <span>Edit Aspirasi Dinding</span>
          {:else}
            <Plus class="h-5 w-5 text-amber-600" />
            <span>Tulis Aspirasi Baru</span>
          {/if}
        </h2>

        <Card class="p-5">
          <form on:submit|preventDefault={handleSaveSticky} class="space-y-4">
            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-500" for="stickySender">Nama Pengirim *</label>
              <Input id="stickySender" placeholder="Masukkan nama Anda..." bind:value={stickySenderName} required />
            </div>

            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-500" for="stickyTheme">Warna Tempelan *</label>
              <select id="stickyTheme" class="flex h-12 w-full rounded-xl border border-border bg-white px-3 text-sm text-slate-700 focus:outline-none focus:border-amber-500" bind:value={stickyColorTheme}>
                {#each stickyColors as col}
                  <option value={col.value}>{col.name}</option>
                {/each}
              </select>
            </div>

            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-500" for="stickyMsg">Isi Catatan/Aspirasi *</label>
              <textarea id="stickyMsg" rows="4" class="flex w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none" placeholder="Tulis aspirasi atau pesan singkat..." bind:value={stickyMessage} required></textarea>
            </div>

            <div class="flex items-center justify-end gap-2 pt-2">
              {#if editingStickyId}
                <Button type="button" variant="secondary" on:click={cancelEditSticky} size="sm">Batal</Button>
              {/if}
              <Button type="submit" disabled={isSubmitting} class="flex items-center justify-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white font-bold h-11">
                {#if isSubmitting}
                  <span>Menyimpan...</span>
                {:else if editingStickyId}
                  <Save class="h-4.5 w-4.5" />
                  <span>Simpan Perubahan</span>
                {:else}
                  <Plus class="h-4.5 w-4.5" />
                  <span>Tempel di Dinding</span>
                {/if}
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <!-- RIGHT SIDE: DATABASE LIST -->
      <div class="lg:col-span-7 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 class="text-lg font-bold text-slate-800 tracking-tight flex items-center space-x-2">
            <FileText class="h-5 w-5 text-amber-600" />
            <span>Moderasi Dinding Aspirasi ({stickyNotes.length})</span>
          </h2>
          <Button on:click={handleDeleteAllStickyNotes} variant="destructive" size="sm" class="font-bold flex items-center space-x-1">
            <Trash2 class="h-3.5 w-3.5" />
            <span>Hapus Semua</span>
          </Button>
        </div>

        <!-- Sticky Notes Search Bar -->
        <Card class="p-3">
          <div class="relative">
            <Search class="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari aspirasi berdasarkan pesan, pengirim..." 
              class="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-medium focus:outline-none focus:border-amber-500 focus:bg-white"
              bind:value={stickySearchQuery}
            />
          </div>
        </Card>
 
        <div class="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
          {#if isLoadingSticky}
            <div class="py-6 text-center text-xs font-semibold text-slate-400">Memuat aspirasi...</div>
          {:else}
            {@const filteredSticky = stickyNotes.filter(item => {
              if (!stickySearchQuery) return true;
              const q = stickySearchQuery.toLowerCase();
              return (item.message || '').toLowerCase().includes(q) || (item.sender_name || '').toLowerCase().includes(q);
            })}
 
            {#if filteredSticky.length > 0}
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {#each filteredSticky as item}
                  <Card class="p-4 flex flex-col justify-between border-slate-100 hover:border-amber-100 transition-colors">
                    <div class="leading-tight min-w-0 pr-2">
                      <p class="text-xs font-semibold text-slate-700 italic break-words">"{item.message}"</p>
                      <p class="text-[9px] text-slate-400 font-bold uppercase mt-1">
                        Tempelan Oleh: {item.sender_name}
                      </p>
                    </div>
                    
                    <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        on:click={() => startEditSticky(item)}
                        class="p-2 rounded-lg text-indigo-600 hover:text-white bg-indigo-50 hover:bg-indigo-600 border border-indigo-100 hover:border-indigo-600 transition-all duration-200 flex items-center justify-center"
                        title="Edit Aspirasi"
                      >
                        <Edit class="h-4 w-4" />
                      </button>
                      <button 
                        type="button"
                        on:click={() => deleteStickyNote(item.id)}
                        class="p-2 rounded-lg text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-500 border border-rose-100 hover:border-rose-500 transition-all duration-200 flex items-center justify-center"
                        title="Hapus Aspirasi"
                      >
                        <Trash2 class="h-4 w-4" />
                      </button>
                    </div>
                  </Card>
                {/each}
              </div>
            {:else}
              <div class="py-6 text-center text-xs font-semibold text-slate-400 border border-dashed rounded-xl bg-slate-50/50">Tidak ada aspirasi ditemukan.</div>
            {/if}
          {/if}
        </div>
      </div>
    </div>

  {:else if activeSection === 'timeline'}
    <!-- ==================== TAB: TIMELINE ==================== -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-200" transition:fade={{ duration: 150 }}>
      <!-- LEFT SIDE: UPLOAD FORM -->
      <div class="lg:col-span-5 space-y-4">
        <h2 class="text-lg font-bold text-slate-800 tracking-tight flex items-center space-x-2">
          <Plus class="h-5 w-5 text-indigo-600" />
          <span>{editingPhotoId ? 'Edit Foto Memori' : 'Unggah Foto Memori Baru'}</span>
        </h2>

        <Card class="p-5">
          <form on:submit|preventDefault={addPhoto} class="space-y-4">
            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-500" for="phTitle">Judul Kegiatan / Momen</label>
              <Input id="phTitle" placeholder="e.g. Raker MAZEEDA" bind:value={photoTitle} required />
            </div>

            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-500" for="phLoc">Lokasi Momen</label>
              <Input id="phLoc" placeholder="e.g. Lembang, Bandung" bind:value={photoLoc} required />
            </div>

            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-500" for="phDate">Tanggal</label>
              <Input id="phDate" type="date" bind:value={photoDate} required />
            </div>

            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-500" for="phCategory">Kategori</label>
              <select id="phCategory" class="flex h-12 w-full rounded-xl border border-border bg-white px-3 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none" bind:value={photoCategory}>
                {#each uniquePhotoCategories as cat}
                  <option value={cat}>{cat}</option>
                {/each}
                <option value="new">+ Tambah Kategori Baru...</option>
              </select>
            </div>

            {#if photoCategory === 'new'}
              <div class="space-y-1" transition:slideTransition>
                <label class="text-xs font-bold text-slate-500" for="phNewCat">Nama Kategori Baru *</label>
                <Input id="phNewCat" placeholder="e.g. Masa-masa Ibtida'iyah" bind:value={photoNewCategory} required />
              </div>
            {/if}

            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-500" for="phDesc">Deskripsi Momen</label>
              <textarea 
                id="phDesc" 
                placeholder="Tulis cerita singkat atau deskripsi momen di sini..." 
                class="flex w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 transition-colors focus:border-indigo-500 focus:outline-none min-h-[80px]"
                bind:value={photoDesc}
              ></textarea>
            </div>

            <div class="space-y-2">
              <label class="text-xs font-bold text-slate-500">Pilih Berkas Foto</label>
              <!-- svelte-ignore a11y-click-events-have-key-events -->
              <!-- svelte-ignore a11y-no-static-element-interactions -->
              <div 
                on:click={() => fileInputRef.click()}
                class="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center bg-slate-50/50 hover:bg-slate-50 hover:border-indigo-500/40 transition-colors cursor-pointer"
              >
                <input 
                  type="file" 
                  bind:this={fileInputRef} 
                  on:change={handlePhotoFileSelect} 
                  accept="image/*" 
                  class="hidden" 
                />
                <UploadCloud class="h-8 w-8 text-slate-400 mx-auto mb-2" />
                {#if selectedFile}
                  <p class="text-xs font-bold text-slate-700 truncate max-w-xs mx-auto">{selectedFile.name}</p>
                  <p class="text-[10px] text-slate-400 mt-1">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                {:else}
                  <p class="text-xs font-bold text-slate-600">{editingPhotoId ? 'Klik jika ingin mengganti foto (opsional)' : 'Klik untuk memilih berkas foto'}</p>
                  <p class="text-[10px] text-slate-400 mt-1">Format PNG, JPG atau WebP hingga 5MB</p>
                {/if}
              </div>
            </div>

            {#if uploadProgressStatus}
              <p class="text-xs font-semibold text-indigo-600 animate-pulse">{uploadProgressStatus}</p>
            {/if}

            <div class="flex flex-col space-y-2 mt-2">
              <Button type="submit" disabled={isSubmitting} class="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11">
                {#if editingPhotoId}
                  <Edit class="h-4.5 w-4.5" />
                  <span>Simpan Perubahan</span>
                {:else}
                  <Image class="h-4.5 w-4.5" />
                  <span>Unggah Ke Galeri</span>
                {/if}
              </Button>
              {#if editingPhotoId}
                <Button type="button" variant="outline" on:click={cancelEditPhoto} class="w-full h-11 border-slate-200 text-slate-600 hover:bg-slate-50 font-bold">
                  Batal Edit
                </Button>
              {/if}
            </div>
          </form>
        </Card>
      </div>

      <!-- RIGHT SIDE: TIMELINE RECORDS LIST -->
      <div class="lg:col-span-7 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 class="text-lg font-bold text-slate-800 tracking-tight flex items-center space-x-2">
            <FileText class="h-5 w-5 text-indigo-600" />
            <span>Daftar Foto Galeri Memori ({photosList.length})</span>
          </h2>
          <Button on:click={handleDeleteAllPhotos} variant="destructive" size="sm" class="font-bold flex items-center space-x-1">
            <Trash2 class="h-3.5 w-3.5" />
            <span>Hapus Semua</span>
          </Button>
        </div>

        <!-- Timeline Search Bar -->
        <Card class="p-3 !overflow-visible">
          <div class="flex items-center space-x-2">
            <div class="relative flex-1">
              <Search class="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari foto memori berdasarkan judul, lokasi, kategori..." 
                class="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-medium focus:outline-none focus:border-indigo-500 focus:bg-white"
                bind:value={timelineSearchQuery}
              />
            </div>
            <div class="relative">
              <button 
                type="button" 
                class="flex items-center justify-center h-[38px] w-[38px] bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 hover:text-indigo-600 focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-500 transition-colors relative" 
                on:click={() => timelineFilterOpen = !timelineFilterOpen}
                title="Filter Kategori"
              >
                <Filter class="h-4 w-4" />
                {#if timelineFilterCategory}
                  <span class="absolute top-2 right-2 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-white"></span>
                {/if}
              </button>
              
              {#if timelineFilterOpen}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <div class="fixed inset-0 z-40" on:click={() => timelineFilterOpen = false}></div>
                <div class="absolute right-0 top-full mt-1.5 w-48 bg-white border border-slate-100 rounded-xl shadow-lg z-50 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-100">
                  <button type="button" class="w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-slate-50 {timelineFilterCategory === '' ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-600'} transition-colors" on:click={() => { timelineFilterCategory = ''; timelineFilterOpen = false; }}>
                    Semua Kategori
                  </button>
                  <div class="h-px bg-slate-100 w-full my-1"></div>
                  <div class="max-h-60 overflow-y-auto">
                    {#each uniquePhotoCategories as cat}
                      <button type="button" class="w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-slate-50 {timelineFilterCategory === cat ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-600'} truncate transition-colors" on:click={() => { timelineFilterCategory = cat; timelineFilterOpen = false; }}>
                        {cat}
                      </button>
                    {/each}
                  </div>
                </div>
              {/if}
            </div>
          </div>
        </Card>

        <div class="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
          {#if isLoadingPhotos}
            <div class="py-12 text-center space-y-4">
              <img src="/loading.svg" alt="Loading..." class="h-16 w-16 mx-auto animate-pulse" />
              <p class="text-xs font-bold text-slate-400 tracking-wide uppercase">Memuat foto memori...</p>
            </div>
          {:else}
            {@const filteredPhotos = photosList.filter(item => {
              const matchCat = !timelineFilterCategory || item.category === timelineFilterCategory;
              if (!timelineSearchQuery) return matchCat;
              const q = timelineSearchQuery.toLowerCase();
              const matchSearch = (item.title || '').toLowerCase().includes(q) || (item.location || '').toLowerCase().includes(q) || (item.category || '').toLowerCase().includes(q) || (item.description || '').toLowerCase().includes(q);
              return matchCat && matchSearch;
            })}

            {#if filteredPhotos.length > 0}
              {#each filteredPhotos as item}
                <Card class="p-4 relative border-slate-100 hover:border-indigo-100 hover:shadow-soft-sm transition-all duration-200 block">
                  <div class="flex items-center space-x-3 min-w-0 pr-16">
                    {#if item.image_url}
                      <img referrerpolicy="no-referrer" src={convertDriveUrl(item.image_url)} alt={item.title} class="h-12 w-12 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200" />
                    {/if}
                    <div class="leading-tight min-w-0">
                      <h4 class="font-extrabold text-slate-800 text-sm truncate">{item.title}</h4>
                      <p class="text-[9px] text-slate-400 font-bold uppercase mt-1">
                        <span class="px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-100 text-indigo-700">{item.category}</span>
                        <span class="ml-1">{item.location} • {item.date}</span>
                      </p>
                    </div>
                  </div>
                  <div class="absolute top-2 right-2 flex items-center space-x-0.5">
                    <button 
                      type="button"
                      on:click={() => startEditPhoto(item)}
                      class="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg flex items-center justify-center border border-transparent hover:border-indigo-100 transition-colors"
                      title="Edit Foto"
                    >
                      <Edit class="h-4 w-4" />
                    </button>
                    <button 
                      type="button"
                      on:click={() => deletePhoto(item.id)}
                      class="h-8 w-8 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg flex items-center justify-center border border-transparent hover:border-rose-100 transition-colors"
                      title="Hapus Foto"
                    >
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </div>
                </Card>
              {/each}
            {:else}
              <div class="py-16 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50 flex flex-col items-center justify-center space-y-4">
                <img src="/Empty content.svg" alt="Tidak ada data" class="h-40 w-40 opacity-80" />
                <div>
                  <p class="text-sm font-bold text-slate-500">Foto Memori tidak ditemukan</p>
                  <p class="text-xs text-slate-400 mt-1">Silakan sesuaikan filter pencarian atau kategori.</p>
                </div>
              </div>
            {/if}
          {/if}
        </div>
      </div>
    </div>

  {:else if activeSection === 'notifikasi'}
    <!-- ==================== TAB: NOTIFIKASI ==================== -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-200" transition:fade={{ duration: 150 }}>
      <!-- LEFT SIDE: CREATE NOTIFICATION -->
      <div class="lg:col-span-5 space-y-4">
        <h2 class="text-lg font-bold text-slate-800 tracking-tight flex items-center space-x-2">
          <Plus class="h-5 w-5 text-rose-600" />
          <span>Kirim Notifikasi Baru</span>
        </h2>

        <Card class="space-y-4">
          <div class="space-y-3">
            <div>
              <label class="text-xs font-bold text-slate-600 mb-1 block" for="notTitle">Judul Notifikasi *</label>
              <Input id="notTitle" bind:value={notifTitle} placeholder="Contoh: Aplikasi Update v1.00" class="w-full" />
            </div>
            <div>
              <label class="text-xs font-bold text-slate-600 mb-1 block" for="notMsg">Pesan (opsional)</label>
              <textarea
                id="notMsg"
                bind:value={notifMessage}
                placeholder="Tulis detail pesan singkat untuk user..."
                rows="3"
                class="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 bg-slate-50/50"
              ></textarea>
            </div>
            <div>
              <label class="text-xs font-bold text-slate-600 mb-1 block">Tipe Notifikasi</label>
              <div class="flex flex-wrap gap-2">
                {#each [
                  { value: 'info', label: 'ℹ️ Info', cls: 'bg-blue-50 border-blue-200 text-blue-700' },
                  { value: 'success', label: '✅ Sukses', cls: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
                  { value: 'warning', label: '⚠️ Peringatan', cls: 'bg-amber-50 border-amber-200 text-amber-700' },
                  { value: 'urgent', label: '🚨 Urgent', cls: 'bg-rose-50 border-rose-200 text-rose-700' }
                ] as t}
                  <button
                    type="button"
                    on:click={() => notifType = t.value}
                    class="px-3 py-1.5 rounded-xl text-xs font-bold border transition-all {notifType === t.value ? t.cls + ' ring-2 ring-offset-1 ring-current' : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'}"
                  >{t.label}</button>
                {/each}
              </div>
            </div>
          </div>

          <div class="pt-3 border-t border-slate-100">
            <Button on:click={addNotif} disabled={isSubmitting || !notifTitle.trim()} class="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold h-11">
              <Bell class="h-4 w-4 mr-2" />
              {isSubmitting ? 'Mengirim...' : 'Kirim Notifikasi ke Semua User'}
            </Button>
          </div>
        </Card>
      </div>

      <!-- RIGHT SIDE: NOTIFICATION HISTORY -->
      <div class="lg:col-span-7 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 class="text-lg font-bold text-slate-800 tracking-tight flex items-center space-x-2">
            <FileText class="h-5 w-5 text-rose-600" />
            <span>Riwayat Notifikasi ({notifList.length})</span>
          </h2>
          <Button on:click={handleDeleteAllNotifications} variant="destructive" size="sm" class="font-bold flex items-center space-x-1">
            <Trash2 class="h-3.5 w-3.5" />
            <span>Hapus Semua</span>
          </Button>
        </div>

        <!-- Notifications Search Bar -->
        <Card class="p-3">
          <div class="relative">
            <Search class="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari riwayat notifikasi berdasarkan judul, tipe, isi..." 
              class="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-medium focus:outline-none focus:border-rose-500 focus:bg-white"
              bind:value={notifSearchQuery}
            />
          </div>
        </Card>

        <div class="space-y-3 max-h-[600px] overflow-y-auto pr-1">
          {#if isLoadingNotif}
            <div class="py-10 text-center"><div class="animate-spin h-6 w-6 border-3 border-primary border-t-transparent rounded-full mx-auto"></div></div>
          {:else}
            {@const filteredNotif = notifList.filter(item => {
              if (!notifSearchQuery) return true;
              const q = notifSearchQuery.toLowerCase();
              return (item.title || '').toLowerCase().includes(q) || (item.message || '').toLowerCase().includes(q) || (item.type || '').toLowerCase().includes(q);
            })}

            {#if filteredNotif.length === 0}
              <div class="py-12 text-center text-xs font-semibold text-slate-400 border border-dashed rounded-xl bg-slate-50/50">
                Tidak ada notifikasi ditemukan.
              </div>
            {:else}
              {#each filteredNotif as notif (notif.id)}
                <Card class="flex items-start justify-between gap-3 p-4 {notif.is_active ? 'border-rose-100 bg-rose-50/10' : 'opacity-60'}">
                  <div class="flex items-start gap-3 flex-1 min-w-0">
                    <span class="mt-1.5 h-2.5 w-2.5 rounded-full shrink-0
                      {notif.type === 'success' ? 'bg-emerald-500' :
                       notif.type === 'warning' ? 'bg-amber-500' :
                       notif.type === 'urgent'  ? 'bg-rose-500'   : 'bg-blue-500'}">
                    </span>
                    <div class="flex-1 min-w-0 leading-normal">
                      <p class="text-sm font-black text-slate-800 leading-snug">{notif.title}</p>
                      {#if notif.message}
                        <p class="text-xs text-slate-500 mt-0.5 leading-relaxed">{notif.message}</p>
                      {/if}
                      <div class="flex items-center gap-2 mt-1.5">
                        <span class="text-[10px] font-bold uppercase tracking-wider
                          {notif.type === 'success' ? 'text-emerald-600' :
                           notif.type === 'warning' ? 'text-amber-600' :
                           notif.type === 'urgent'  ? 'text-rose-600'   : 'text-blue-600'}">{notif.type}</span>
                        <span class="text-[10px] text-slate-400">•</span>
                        <span class="text-[10px] font-semibold {notif.is_active ? 'text-emerald-600' : 'text-slate-400'}">
                          {notif.is_active ? '● Aktif' : '○ Nonaktif'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-1.5 shrink-0">
                    <button
                      on:click={() => toggleNotif(notif.id, notif.is_active)}
                      class="px-2.5 py-1.5 text-[10px] font-bold rounded-lg border transition-all {notif.is_active ? 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'}"
                    >{notif.is_active ? 'Nonaktifkan' : 'Aktifkan'}</button>
                    <button
                      on:click={() => deleteNotif(notif.id)}
                      class="h-8 w-8 flex items-center justify-center rounded-lg border border-transparent text-slate-400 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-100 transition-all"
                    ><Trash2 class="h-3.5 w-3.5" /></button>
                  </div>
                </Card>
              {/each}
            {/if}
          {/if}
        </div>
      </div>
    </div>
  {:else if activeSection === 'carousel'}
    <!-- ==================== TAB: CAROUSEL NEWS SLIDES ==================== -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-200" transition:fade={{ duration: 150 }}>
      <!-- LEFT SIDE: CREATE/EDIT SLIDE -->
      <div class="lg:col-span-5 space-y-4">
        <h2 class="text-lg font-bold text-slate-800 tracking-tight flex items-center space-x-2">
          {#if editingSlideId}
            <Edit class="h-5 w-5 text-primary" />
            <span>Edit Banner Slide</span>
          {:else}
            <Plus class="h-5 w-5 text-primary" />
            <span>Buat Banner Slide Baru</span>
          {/if}
        </h2>

        <Card class="space-y-4">
          <form on:submit|preventDefault={saveNewsSlide} class="space-y-4">
            
            <!-- Title -->
            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-600 mb-1 block" for="slTitle">Judul Slide *</label>
              <Input id="slTitle" bind:value={slideTitle} placeholder="Contoh: Pembaruan Aplikasi v1.4.0" required />
            </div>

            <!-- Description -->
            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-600 mb-1 block" for="slDesc">Deskripsi Singkat</label>
              <textarea 
                id="slDesc" 
                bind:value={slideDesc} 
                placeholder="Tuliskan deskripsi singkat banner slide..." 
                rows="3"
                class="flex w-full rounded-xl border border-border bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-primary focus:outline-none"
              ></textarea>
            </div>

            <!-- Redirect URL -->
            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-600 mb-1 block" for="slRedirect">Link Tujuan (Redirect URL)</label>
              <Input id="slRedirect" bind:value={slideRedirectUrl} placeholder="Contoh: /mading atau https://..." />
              <p class="text-[10px] text-slate-400 mt-1">Mengarah ke halaman tertentu saat banner diklik (opsional).</p>
            </div>

            <!-- Photo Upload/URL selection -->
            <div class="space-y-2.5">
              <label class="text-xs font-bold text-slate-600 block">Foto Banner *</label>
              
              <!-- Direct URL option -->
              <div class="space-y-1">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Opsi A: Tulis URL Gambar</span>
                <Input bind:value={slideImageUrl} placeholder="Contoh: https://images.unsplash.com/..." />
              </div>

              <div class="relative flex py-1 items-center">
                <div class="flex-grow border-t border-slate-100"></div>
                <span class="flex-shrink mx-2 text-[10px] font-bold text-slate-300 uppercase tracking-widest">ATAU</span>
                <div class="flex-grow border-t border-slate-100"></div>
              </div>

              <!-- File Upload option -->
              <div class="space-y-1">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Opsi B: Unggah Berkas Foto</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  bind:this={slideFileRef}
                  on:change={handleSlideFileSelect}
                  class="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-primary hover:file:bg-blue-100 cursor-pointer"
                />
              </div>
            </div>

            <!-- Upload Progress Status -->
            {#if slideUploadProgressStatus}
              <div class="text-xs font-bold text-primary flex items-center space-x-1.5 animate-pulse pt-2">
                <span>🔄 {slideUploadProgressStatus}</span>
              </div>
            {/if}

            <!-- Form Actions -->
            <div class="flex items-center gap-2 pt-2 border-t border-slate-100">
              {#if editingSlideId}
                <Button 
                  type="button" 
                  variant="outline" 
                  class="flex-1" 
                  on:click={cancelEditSlide}
                  disabled={isSubmitting}
                >
                  Batal
                </Button>
              {/if}
              <Button 
                type="submit" 
                class="flex-1" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Menyimpan...' : (editingSlideId ? 'Perbarui Slide' : 'Simpan Slide')}
              </Button>
            </div>

          </form>
        </Card>
      </div>

      <!-- RIGHT SIDE: SLIDES LIST -->
      <div class="lg:col-span-7 space-y-4">
        <h2 class="text-lg font-bold text-slate-800 tracking-tight flex items-center justify-between">
          <span>Daftar Banner Slide ({carouselSlides.length})</span>
          <button 
            type="button" 
            on:click={fetchCarouselSlides}
            class="text-xs text-primary hover:underline font-bold"
            disabled={isLoadingCarousel}
          >
            {isLoadingCarousel ? 'Memuat...' : '🔄 Segarkan'}
          </button>
        </h2>

        <div class="grid grid-cols-1 gap-4">
          {#if isLoadingCarousel}
            <div class="py-12 text-center text-xs font-semibold text-slate-400">Memuat banner slide...</div>
          {:else}
            {#if carouselSlides.length > 0}
              {#each carouselSlides as slide (slide.id)}
                <Card class="flex gap-4 p-4 items-start relative hover:shadow-soft-md transition-shadow">
                  <img referrerpolicy="no-referrer" 
                    src={convertDriveUrl(slide.image_url)} 
                    alt={slide.title} 
                    class="h-16 w-24 rounded-lg object-cover border border-slate-200/60 bg-slate-50 shrink-0" 
                    on:error={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1594322436404-5a0526db4d13?q=80&w=200&auto=format&fit=crop'; }}
                  />
                  <div class="min-w-0 flex-1 space-y-1">
                    <h3 class="font-extrabold text-sm text-slate-800 truncate pr-16">{slide.title}</h3>
                    {#if slide.description}
                      <p class="text-xs text-slate-400 font-medium line-clamp-1">{slide.description}</p>
                    {/if}
                    {#if slide.redirect_url}
                      <p class="text-[10px] text-primary font-black truncate">🔗 Link: {slide.redirect_url}</p>
                    {/if}
                    <p class="text-[9px] text-slate-400 font-bold uppercase tracking-wider pt-1">Dibuat: {formatDateTime(slide.created_at)}</p>
                  </div>
                  
                  <!-- Actions -->
                  <div class="absolute right-4 top-4 flex items-center space-x-1">
                    <button
                      type="button"
                      on:click={() => startEditSlide(slide)}
                      class="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-blue-50 transition-all"
                      title="Edit Banner"
                      style="min-height: 32px; min-width: 32px;"
                    >
                      <Edit class="h-4.5 w-4.5" />
                    </button>
                    <button
                      type="button"
                      on:click={() => deleteNewsSlide(slide.id)}
                      class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                      title="Hapus Banner"
                      style="min-height: 32px; min-width: 32px;"
                    >
                      <Trash2 class="h-4.5 w-4.5" />
                    </button>
                  </div>
                </Card>
              {/each}
            {:else}
              <div class="py-12 text-center text-xs font-semibold text-slate-400 border border-dashed rounded-xl bg-slate-50/50">Belum ada banner slide yang dibuat.</div>
            {/if}
          {/if}
        </div>
      </div>
    </div>

  {:else if activeSection === 'nilai'}
    <!-- ==================== NILAI AKADEMIK ==================== -->
    <div in:fade={{ duration: 200 }} class="space-y-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
        <div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Award class="h-8 w-8 text-primary" />
            Manajemen Nilai Akademik
          </h1>
          <p class="text-sm text-slate-500 mt-1">Kelola data nilai santri secara manual atau upload via CSV.</p>
        </div>
        
        <div class="flex items-center bg-slate-100 p-1 rounded-xl shadow-inner w-full sm:w-auto">
          <button 
            on:click={() => nilai_mode = 'manual'}
            class="flex-1 sm:flex-none px-4 py-2 text-sm font-bold rounded-lg transition-all duration-200 {nilai_mode === 'manual' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}"
          >
            Kelola Manual
          </button>
          <button 
            on:click={() => nilai_mode = 'csv'}
            class="flex-1 sm:flex-none px-4 py-2 text-sm font-bold rounded-lg transition-all duration-200 {nilai_mode === 'csv' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}"
          >
            Upload CSV
          </button>
        </div>
      </div>



      {#if nilai_mode === 'csv'}
        <div class="mb-2 mt-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <label class="text-sm font-bold text-slate-700 whitespace-nowrap">Pilih Tabel Database:</label>
          <select bind:value={nilai_targetTable} class="w-full sm:max-w-xs text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-medium text-slate-700">
            <option value="nilai_tamrin">Tabel: nilai_tamrin (Atau Muhafadzoh)</option>
            <option value="nilai_ujian">Tabel: nilai_ujian</option>
          </select>
        </div>

        <Card class="p-6 border-emerald-100 shadow-sm mt-4">
          <h3 class="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <UploadCloud class="h-5 w-5 text-emerald-500" />
            Import CSV Nilai
          </h3>
        


        <div class="space-y-4">
          <div class="p-4 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 hover:border-emerald-400 transition-colors relative group text-center cursor-pointer">
            <input type="file" accept=".csv" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" on:change={handleNilaiFileSelect} />
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
      
      {:else}
        <!-- MODE KELOLA MANUAL -->
        <Card class="p-0 overflow-hidden shadow-sm border-indigo-100 mt-4">
          <!-- Toolbar -->
          <div class="p-4 sm:p-5 border-b border-slate-100 bg-white flex flex-col gap-4">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div class="relative w-full sm:max-w-md">
                <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Cari NIS atau Nama Siswi..." 
                  bind:value={nilaiSearch}
                  on:input={() => {
                    clearTimeout(searchTimeout);
                    searchTimeout = setTimeout(fetchNilaiManual, 500);
                  }}
                  class="w-full pl-10 pr-4 py-2.5 text-sm font-medium border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-400"
                />
              </div>
              <Button on:click={openAddNilai} class="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transition-all rounded-xl py-2.5 px-5 shrink-0">
                <Plus class="h-4.5 w-4.5" />
                <span class="font-bold tracking-wide">Tambah Nilai</span>
              </Button>
            </div>
            
            <div class="flex flex-col sm:flex-row gap-4 w-full bg-slate-50/80 p-3 rounded-xl border border-slate-100">
              <div class="w-full sm:w-1/2">
                <label class="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2 block">Filter Kategori Nilai</label>
                <div class="relative group cursor-pointer">
                  <div class="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-50 rounded-lg text-indigo-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors pointer-events-none">
                    <Award class="h-3.5 w-3.5" />
                  </div>
                  <select bind:value={nilaiFilterKategori} on:change={() => { if(nilaiSearch.trim().length >= 2) fetchNilaiManual(); }} class="w-full text-sm pl-12 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-bold text-slate-700 appearance-none shadow-sm cursor-pointer hover:border-indigo-300">
                    <option value="">Semua Kategori</option>
                    <option value="Tamrin">Tamrin</option>
                    <option value="Ujian">Ujian</option>
                    <option value="Muhafadzoh">Muhafadzoh</option>
                  </select>
                  <ChevronDown class="absolute right-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 group-hover:text-indigo-500 transition-colors pointer-events-none" />
                </div>
              </div>
              <div class="w-full sm:w-1/2">
                <label class="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2 block">Filter Tahun Ajaran</label>
                <div class="relative group cursor-pointer">
                  <div class="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 bg-sky-50 rounded-lg text-sky-500 group-hover:bg-sky-100 group-hover:text-sky-600 transition-colors pointer-events-none">
                    <Calendar class="h-3.5 w-3.5" />
                  </div>
                  <select bind:value={nilaiFilterTahunAjaran} on:change={() => { if(nilaiSearch.trim().length >= 2) fetchNilaiManual(); }} class="w-full text-sm pl-12 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all font-bold text-slate-700 appearance-none shadow-sm cursor-pointer hover:border-sky-300">
                    <option value="">Semua Tahun Ajaran</option>
                    <option value="2023-2024">2023-2024</option>
                    <option value="2024-2025">2024-2025</option>
                    <option value="2025-2026">2025-2026</option>
                    <option value="2026-2027">2026-2027</option>
                    <option value="2027-2028">2027-2028</option>
                  </select>
                  <ChevronDown class="absolute right-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 group-hover:text-sky-500 transition-colors pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          <!-- Table -->
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm whitespace-nowrap">
              <thead class="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th class="px-5 py-4 border-b border-slate-100">Siswi</th>
                  <th class="px-5 py-4 border-b border-slate-100">Periode & Tahun</th>
                  <th class="px-5 py-4 border-b border-slate-100">Pelajaran</th>
                  <th class="px-5 py-4 border-b border-slate-100">Perolehan / Bayan</th>
                  <th class="px-5 py-4 border-b border-slate-100 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                {#if isFetchingNilai}
                  <tr><td colspan="5" class="px-5 py-12 text-center text-slate-400 font-medium">Mencari data nilai...</td></tr>
                {:else if !nilaiSearch || nilaiSearch.length < 2}
                  <tr><td colspan="5" class="px-5 py-12 text-center text-slate-400 font-medium bg-slate-50/50">Ketikkan minimal 2 huruf/angka dari Nama atau NIS untuk mencari data nilai.</td></tr>
                {:else if nilaiData.length === 0}
                  <tr><td colspan="5" class="px-5 py-12 text-center text-rose-400 font-medium bg-rose-50/50 border-y border-rose-100">Data nilai tidak ditemukan untuk pencarian "{nilaiSearch}".</td></tr>
                {:else}
                  {#each nilaiData as item}
                    <tr class="hover:bg-slate-50/80 transition-colors group">
                      <td class="px-5 py-3">
                        <div class="font-bold text-slate-800">{item.nama_siswi || '-'}</div>
                        <div class="text-[11px] font-semibold text-slate-500 mt-0.5">NIS: {item.nis}</div>
                      </td>
                      <td class="px-5 py-3">
                        <div class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-indigo-50 border border-indigo-100/50 text-indigo-700 text-xs font-bold">
                          {item.periode || '-'}
                        </div>
                        <div class="text-[11px] text-slate-500 font-medium mt-1">{item.tahun_ajaran || '-'}</div>
                      </td>
                      <td class="px-5 py-3">
                        <div class="font-bold text-slate-700">{item.mata_pelajaran || '-'}</div>
                        {#if item.kategori}
                          <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{item.kategori}</div>
                        {/if}
                      </td>
                      <td class="px-5 py-3">
                        {#if item.catatan && item.catatan.includes('|||')}
                          {@const parts = item.catatan.split('|||')}
                          {@const perolehan = (item.nilai !== null && item.nilai !== undefined && item.nilai !== -1) ? item.nilai : (parts[0].trim() || 'LULUS / KHATAM')}
                          {@const bayan = parts[1] ? parts[1].trim() : '-'}
                          
                          <div class="font-black text-sm text-emerald-700">
                            {perolehan} <span class="text-slate-300 font-normal mx-1.5">|</span> <span class="text-slate-600">{bayan}</span>
                          </div>
                        {:else}
                          <!-- NON-MUHAFADZOH / STANDARD -->
                          {@const perolehan = (item.nilai !== null && item.nilai !== undefined && item.nilai !== -1) ? item.nilai : 'LULUS / KHATAM'}
                          {@const bayan = item.catatan ? item.catatan.trim() : ''}
                          
                          <div class="font-black text-sm text-emerald-700">
                            {perolehan} 
                            {#if bayan}
                              <span class="text-slate-300 font-normal mx-1.5">|</span> <span class="text-slate-600">{bayan}</span>
                            {/if}
                          </div>
                        {/if}
                      </td>
                      <td class="px-5 py-3 text-right">
                        <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button on:click={() => openEditNilai(item)} class="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                            <Edit class="h-4 w-4" />
                          </button>
                          <button on:click={() => deleteNilai(item.id)} class="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="Hapus">
                            <Trash2 class="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  {/each}
                {/if}
              </tbody>
            </table>
          </div>
        </Card>
      {/if}
    </div>
  {:else if activeSection === 'kepengurusan'}
    <!-- ==================== TAB: KEPENGURUSAN ==================== -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-200" transition:fade={{ duration: 150 }}>
      <!-- LEFT SIDE: INPUT FORM & CSV UPLOAD -->
      <div class="lg:col-span-6 space-y-4">
        <!-- CSV Import Widget for Kepengurusan -->
        <Card class="p-5 space-y-3 border-dashed border-2 border-slate-200 bg-slate-50/20 mb-4">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 class="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <UploadCloud class="h-4.5 w-4.5 text-primary" />
              <span>Impor Data Pengurus (.CSV)</span>
            </h3>
            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Bulk Upload</span>
          </div>

          <!-- Rules / Instructions -->
          <div class="bg-indigo-50/60 rounded-xl p-3 text-[11px] leading-relaxed text-indigo-900 border border-indigo-100/50">
            <p class="font-bold text-indigo-950 mb-1 flex items-center gap-1">
              <Info class="h-3.5 w-3.5" /> Aturan Berkas CSV:
            </p>
            <ul class="list-disc pl-4 space-y-0.5">
              <li>Header kolom **wajib**: <code class="font-mono bg-indigo-100 px-1 rounded">tahun_ajaran</code>, <code class="font-mono bg-indigo-100 px-1 rounded">nama_lengkap</code>, <code class="font-mono bg-indigo-100 px-1 rounded">jabatan</code>, <code class="font-mono bg-indigo-100 px-1 rounded">divisi</code></li>
              <li>Header kolom **opsional**: <code class="font-mono bg-indigo-100 px-1 rounded">foto_custom_url</code></li>
              <li>Format Tahun Ajaran menggunakan tanda hubung (e.g. <code class="font-mono bg-indigo-100 px-1 rounded">2026-2027</code>).</li>
              <li>Nama lengkap harus persis sama dengan data di database Alumni.</li>
            </ul>
          </div>

          <!-- Drag and Drop Zone -->
          <div 
            on:dragover={kep_handleDragOver}
            on:dragleave={kep_handleDragLeave}
            on:drop={kep_handleDrop}
            class="border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors
              {kep_isDragging ? 'border-primary bg-blue-50/30' : 'border-slate-200 bg-white hover:border-primary/40'}"
            on:click={() => document.getElementById('kep-csv-file-input')?.click()}
          >
            <input 
              type="file" 
              id="kep-csv-file-input" 
              accept=".csv" 
              class="hidden" 
              on:change={kep_handleFileSelect}
            />
            <UploadCloud class="h-7 w-7 text-slate-400 mx-auto mb-1.5" />
            {#if kep_csvFile}
              <p class="text-xs font-bold text-slate-700 truncate max-w-xs mx-auto">{kep_csvFile.name}</p>
              <p class="text-[10px] text-slate-400 mt-1">{(kep_csvFile.size / 1024).toFixed(1)} KB</p>
            {:else}
              <p class="text-xs font-bold text-slate-600 text-center">Tarik & letakkan berkas CSV, atau klik untuk memilih</p>
            {/if}
          </div>

          <!-- Alert / Status messages -->
          {#if kep_csvImportError}
            <p class="text-xs font-semibold text-rose-600 bg-rose-50/50 p-2.5 rounded-lg border border-rose-100">{kep_csvImportError}</p>
          {/if}
          {#if kep_csvImportStatus}
            <p class="text-xs font-semibold text-emerald-600 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100">{kep_csvImportStatus}</p>
          {/if}

          <!-- Upload triggers -->
          {#if kep_parsedCSVData.length > 0}
            <div class="flex gap-2 justify-end pt-1">
              <Button variant="secondary" on:click={() => { kep_parsedCSVData = []; kep_csvFile = null; kep_csvImportStatus = ''; }} size="sm">Batal</Button>
              <Button on:click={kep_handleUploadCSVData} disabled={isSubmitting} size="sm" class="font-bold">
                <span>Unggah {kep_parsedCSVData.length} Pengurus</span>
              </Button>
            </div>
          {/if}
        </Card>

        <h2 class="text-lg font-bold text-slate-800 tracking-tight flex items-center space-x-2">
          {#if editingKepId}
            <Edit class="h-5 w-5 text-indigo-600" />
            <span>Edit Pengurus</span>
          {:else}
            <Plus class="h-5 w-5 text-primary" />
            <span>Tambah Pengurus Baru</span>
          {/if}
        </h2>

        <!-- Form Input -->
        <Card class="p-5">
          <form on:submit|preventDefault={handleSaveKepengurusan} class="space-y-4">
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Tahun Ajaran -->
              <div class="space-y-1">
                <label class="text-xs font-bold text-slate-500" for="kep_year">Tahun Ajaran *</label>
                <select id="kep_year" class="flex h-11 w-full rounded-xl border border-slate-200/80 bg-white px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200" bind:value={kep_tahunAjaran}>
                  <option value="2026-2027">2026-2027</option>
                  <option value="2027-2028">2027-2028</option>
                  <option value="2028-2029">2028-2029</option>
                  <option value="2029-2030">2029-2030</option>
                  <option value="2030-2031">2030-2031</option>
                  <option value="2031-2032">2031-2032</option>
                </select>
              </div>

              <!-- Nama Lengkap -->
              <div class="space-y-1 relative">
                <label class="text-xs font-bold text-slate-500" for="kep_name">Nama Pengurus *</label>
                <div class="relative">
                  <input 
                    id="kep_name" 
                    type="text"
                    placeholder="Ketik untuk mencari nama..." 
                    class="flex h-11 w-full rounded-xl border border-slate-200/80 bg-white px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200" 
                    bind:value={kep_namaLengkap} 
                    on:focus={() => { showKepDropdown = true; kepSearchQuery = kep_namaLengkap; }}
                    on:blur={() => setTimeout(() => showKepDropdown = false, 200)}
                    on:input={(e) => { kepSearchQuery = e.currentTarget.value; showKepDropdown = true; }}
                    required
                  />
                  <!-- Custom Dropdown -->
                  {#if showKepDropdown}
                    <ul class="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {#each squad.filter(s => (s.nama_lengkap || '').toLowerCase().includes((kepSearchQuery || '').toLowerCase())).sort((a, b) => a.nama_lengkap.localeCompare(b.nama_lengkap)).slice(0, 15) as item}
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                        <li 
                          class="px-4 py-2.5 text-xs text-slate-700 hover:bg-primary/10 hover:text-primary cursor-pointer border-b border-slate-50 last:border-0"
                          on:mousedown={() => {
                            kep_namaLengkap = item.nama_lengkap;
                            kepSearchQuery = item.nama_lengkap;
                            showKepDropdown = false;
                          }}
                        >
                          <span class="font-bold">{item.nama_lengkap}</span>
                          {#if item.nama_panggilan}
                            <span class="text-slate-400 ml-1">({item.nama_panggilan})</span>
                          {/if}
                        </li>
                      {/each}
                      {#if squad.filter(s => (s.nama_lengkap || '').toLowerCase().includes((kepSearchQuery || '').toLowerCase())).length === 0}
                        <li class="px-4 py-3 text-xs text-slate-400 text-center italic">Nama tidak ditemukan</li>
                      {/if}
                    </ul>
                  {/if}
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Jabatan -->
              <div class="space-y-1">
                <label class="text-xs font-bold text-slate-500" for="kep_role">Jabatan / Peran *</label>
                <Input id="kep_role" placeholder="e.g. Ketua Koordinator" class="h-11 rounded-xl text-xs" bind:value={kep_jabatan} required />
              </div>

              <!-- Divisi / Bagian -->
              <div class="space-y-1 relative">
                <label class="text-xs font-bold text-slate-500" for="kep_division">Divisi / Bagian *</label>
                <div class="relative">
                  <input 
                    id="kep_division" 
                    type="text"
                    placeholder="Ketik divisi atau pilih..." 
                    class="flex h-11 w-full rounded-xl border border-slate-200/80 bg-white px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200" 
                    bind:value={kep_divisi} 
                    on:focus={() => { showDivisiDropdown = true; divisiSearchQuery = kep_divisi; }}
                    on:blur={() => setTimeout(() => showDivisiDropdown = false, 200)}
                    on:input={(e) => { divisiSearchQuery = e.currentTarget.value; showDivisiDropdown = true; }}
                    required
                  />
                  <!-- Custom Dropdown -->
                  {#if showDivisiDropdown && availableDivisions.length > 0}
                    <ul class="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {#each availableDivisions.filter(d => d.toLowerCase().includes((divisiSearchQuery || '').toLowerCase())).slice(0, 15) as divName}
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                        <li 
                          class="px-4 py-2.5 text-xs text-slate-700 hover:bg-primary/10 hover:text-primary cursor-pointer border-b border-slate-50 last:border-0"
                          on:mousedown={() => {
                            kep_divisi = divName;
                            divisiSearchQuery = divName;
                            showDivisiDropdown = false;
                          }}
                        >
                          <span class="font-bold">{divName}</span>
                        </li>
                      {/each}
                      {#if availableDivisions.filter(d => d.toLowerCase().includes((divisiSearchQuery || '').toLowerCase())).length === 0}
                        <li class="px-4 py-3 text-xs text-slate-400 text-center italic">Belum ada divisi serupa</li>
                      {/if}
                    </ul>
                  {/if}
                </div>
              </div>
            </div>

            <!-- Custom Photo URL (opsional) -->
            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-500" for="kep_photo">URL Foto Khusus (Opsional)</label>
              <Input id="kep_photo" placeholder="Kosongkan untuk memakai foto profil asli alumni" class="h-11 rounded-xl text-xs" bind:value={kep_fotoCustomUrl} />
            </div>

            <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              {#if editingKepId}
                <Button type="button" variant="secondary" on:click={cancelEditKepengurusan} size="sm">Batal</Button>
              {/if}
              <Button type="submit" disabled={isSubmitting} size="sm" class="flex items-center justify-center space-x-1.5 bg-primary hover:bg-primary/95 text-white font-bold h-10 px-4 rounded-xl">
                {#if isSubmitting}
                  <span>Menyimpan...</span>
                {:else if editingKepId}
                  <Save class="h-4 w-4" />
                  <span>Simpan</span>
                {:else}
                  <Plus class="h-4 w-4" />
                  <span>Tambah</span>
                {/if}
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <!-- RIGHT SIDE: KEPENGURUSAN LIST -->
      <div class="lg:col-span-6 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 class="text-lg font-bold text-slate-800 tracking-tight flex items-center space-x-2">
            <FileText class="h-5 w-5 text-indigo-600" />
            <span>Database Pengurus ({kepengurusanList.length})</span>
          </h2>
          <Button on:click={handleDeleteAllKepengurusan} variant="destructive" size="sm" class="font-bold flex items-center space-x-1">
            <Trash2 class="h-3.5 w-3.5" />
            <span>Hapus Semua</span>
          </Button>
        </div>

        <!-- Search Bar with Integrated Year Filter -->
        <div class="relative w-full">
          <div class="relative flex items-center w-full bg-slate-50 border border-slate-200 rounded-xl transition-all duration-300 h-10 overflow-hidden focus-within:bg-white focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20">
            <!-- Search Icon -->
            <Search class="h-4 w-4 text-slate-400 ml-3.5 shrink-0 pointer-events-none" />
            
            <!-- Search Input -->
            <input 
              type="text" 
              placeholder="Cari pengurus berdasarkan nama, jabatan, divisi..." 
              class="flex-1 h-full bg-transparent pl-2.5 pr-2 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none"
              bind:value={kepengurusanSearchQuery}
            />

            <!-- Divider -->
            <div class="w-px h-5 bg-slate-200 shrink-0"></div>

            <!-- Dropdown Filter inside search bar -->
            <div class="relative shrink-0 flex items-center pr-2 h-full hover:bg-slate-100/50 transition-colors">
              <Calendar class="absolute left-3 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <select
                bind:value={kepengurusanYearFilter}
                class="pl-8 pr-7 py-2 bg-transparent text-[11px] font-black text-slate-600 hover:text-slate-800 transition-colors appearance-none cursor-pointer focus:outline-none h-full"
              >
                <option value="all">Semua TA</option>
                <option value="2026-2027">2026-2027</option>
                <option value="2027-2028">2027-2028</option>
                <option value="2028-2029">2028-2029</option>
                <option value="2029-2030">2029-2030</option>
                <option value="2030-2031">2030-2031</option>
                <option value="2031-2032">2031-2032</option>
              </select>
              <div class="absolute right-3 pointer-events-none">
                <svg class="h-2.5 w-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- List View -->
        <div class="space-y-3 max-h-[600px] overflow-y-auto pr-1">
          {#if isLoadingKepengurusan}
            <div class="py-12 text-center text-xs font-semibold text-slate-400">Memuat data pengurus...</div>
          {:else}
            {@const filteredKep = kepengurusanList.filter(item => {
              // 1. Filter by Year
              if (kepengurusanYearFilter !== 'all') {
                const itemYear = (item.tahun_ajaran || '').replace(/\//g, '-');
                const filterYear = kepengurusanYearFilter.replace(/\//g, '-');
                if (itemYear !== filterYear) return false;
              }
              // 2. Filter by Search Query
              if (!kepengurusanSearchQuery) return true;
              const q = kepengurusanSearchQuery.toLowerCase();
              return (
                (item.nama_lengkap || '').toLowerCase().includes(q) ||
                (item.jabatan || '').toLowerCase().includes(q) ||
                (item.divisi || '').toLowerCase().includes(q) ||
                (item.tahun_ajaran || '').toLowerCase().includes(q)
              );
            })}

            {#if filteredKep.length > 0}
              {#each filteredKep as item}
                {@const alumni = squadMap[item.nama_lengkap.trim().toLowerCase()]}
                {@const profilePhoto = item.foto_custom_url || (alumni && alumni.foto_url)}
                <Card noPadding class="border-slate-100 hover:shadow-soft-sm hover:border-indigo-100/80 transition-all duration-300">
                  <div class="p-3.5 flex items-center justify-between gap-4">
                    <div class="flex items-center space-x-3.5 min-w-0">
                      {#if profilePhoto}
                        <img referrerpolicy="no-referrer" 
                          src={convertDriveUrl(profilePhoto)} 
                          alt={item.nama_lengkap} 
                          class="h-11 w-11 rounded-full object-cover shadow-soft-sm border border-slate-100 shrink-0"
                        />
                      {:else}
                        <div class="h-11 w-11 rounded-full flex items-center justify-center font-bold text-xs bg-indigo-50 border border-indigo-100 text-indigo-600 shrink-0">
                          {getInitials(item.nama_lengkap)}
                        </div>
                      {/if}

                      <div class="min-w-0 leading-snug">
                        <div class="flex flex-wrap items-center gap-1.5">
                          <h4 class="font-extrabold text-slate-800 text-sm truncate">{item.nama_lengkap}</h4>
                          <span class="px-1.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-100/50 text-indigo-700 text-[9px] font-black tracking-tight">{item.tahun_ajaran}</span>
                        </div>
                        <p class="text-xs text-primary font-black uppercase tracking-wider mt-0.5">{item.jabatan}</p>
                        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-0.5">{item.divisi}</p>
                      </div>
                    </div>
                    
                    <div class="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        on:click={() => startEditKepengurusan(item)}
                        class="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-center"
                        title="Edit Pengurus"
                      >
                        <Edit class="h-4.5 w-4.5" />
                      </button>
                      <button 
                        type="button"
                        on:click={() => deleteKepengurusan(item.id)}
                        class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors flex items-center justify-center"
                        title="Hapus Pengurus"
                      >
                        <Trash2 class="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>
                </Card>
              {/each}
            {:else}
              <div class="py-12 text-center text-xs font-semibold text-slate-400 border border-dashed rounded-xl bg-slate-50/50">Tidak ada pengurus ditemukan.</div>
            {/if}
          {/if}
        </div>
      </div>
    </div>
  {:else if activeSection === 'persetujuan_foto'}
    <!-- ==================== PERSETUJUAN FOTO PROFIL ==================== -->
    <div in:fade={{ duration: 200 }} class="space-y-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
        <div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <CheckCircle2 class="h-8 w-8 text-primary" />
            Persetujuan Foto Profil
          </h1>
          <p class="text-sm text-slate-500 mt-1">Kelola dan setujui foto profil custom yang diunggah oleh anggota.</p>
        </div>
        <button on:click={fetchPendingPhotos} class="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold text-xs rounded-xl shadow-sm hover:bg-slate-50 flex items-center gap-2">
          <RefreshCw class="h-4 w-4 {isLoadingPendingPhotos ? 'animate-spin' : ''}" />
          Segarkan
        </button>
      </div>

      {#if isLoadingPendingPhotos}
        <div class="py-16 text-center text-xs font-semibold text-slate-400">Memuat data foto...</div>
      {:else if pendingPhotos.length === 0}
        <div class="py-16 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 flex flex-col items-center">
          <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
            <CheckCircle2 class="h-8 w-8 text-emerald-400" />
          </div>
          <h3 class="text-slate-700 font-bold">Semua Bersih!</h3>
          <p class="text-slate-500 text-xs mt-1">Tidak ada foto baru yang menunggu persetujuan.</p>
        </div>
      {:else}
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {#each pendingPhotos as photo (photo.id)}
            <Card class="overflow-hidden flex flex-col bg-white border-slate-100 hover:shadow-soft-md transition-all">
              <div class="relative w-full aspect-square bg-slate-100 group">
                <img referrerpolicy="no-referrer" src={convertDriveUrl(photo.photo_url)} alt={photo.user_name} class="w-full h-full object-cover" />
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <a href={convertDriveUrl(photo.photo_url)} target="_blank" class="px-4 py-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-xl text-white text-xs font-bold transition-colors">
                    Lihat Penuh
                  </a>
                </div>
              </div>
              <div class="p-4 flex flex-col gap-3 flex-1">
                <div>
                  <h3 class="font-bold text-sm text-slate-800 line-clamp-1">{photo.user_name}</h3>
                  <p class="text-[10px] text-slate-400 font-medium mt-0.5">Diupload {new Date(photo.created_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}</p>
                </div>
                <div class="flex items-center gap-2 mt-auto pt-2 border-t border-slate-50">
                  <button on:click={() => rejectPhoto(photo)} class="flex-1 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-lg transition-colors border border-rose-100 flex justify-center items-center gap-1.5" disabled={isSubmitting}>
                    <X class="h-3.5 w-3.5" /> Tolak
                  </button>
                  <button on:click={() => approvePhoto(photo)} class="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-bold text-xs rounded-lg transition-colors border border-emerald-100 flex justify-center items-center gap-1.5" disabled={isSubmitting}>
                    <CheckCircle2 class="h-3.5 w-3.5" /> Setujui
                  </button>
                </div>
              </div>
            </Card>
          {/each}
        </div>
      {/if}
    </div>
  {:else if activeSection === 'gallery_coverflow' || activeSection === 'gallery_landscape' || activeSection === 'gallery_marquee'}
    <!-- DYNAMIC GALLERIES MANAGEMENT -->
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start" in:fade={{ duration: 250, delay: 50 }}>
      <!-- Form Panel -->
      <div class="xl:col-span-4 space-y-6">
        <Card class="border-slate-100 shadow-soft-xl bg-white relative overflow-hidden">
          <div class="p-6">
            <h3 class="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
              <Image class="h-5 w-5 text-indigo-500" />
              {editingGalleryId ? 'Edit Gambar' : 'Tambah Gambar'}
            </h3>
            <div class="space-y-4">
              <div>
                <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Pilih File Foto</label>
                <div class="relative w-full h-11 border border-slate-200 border-dashed rounded-xl bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors">
                  <input type="file" accept="image/*" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" on:change={handleGalleryFileSelect} />
                  <span class="text-xs font-semibold text-slate-500 flex items-center gap-2">
                    <UploadCloud class="h-4 w-4 text-indigo-500" />
                    {gallerySelectedFile ? gallerySelectedFile.name : 'Klik untuk Unggah File (Opsional)'}
                  </span>
                </div>
              </div>
              <div class="text-center relative">
                <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-slate-200"></div></div>
                <span class="relative bg-white px-2 text-[10px] font-bold text-slate-400">ATAU</span>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">URL Gambar Eksternal</label>
                <Input type="url" bind:value={galleryImageUrl} on:input={() => gallerySelectedFile = null} placeholder="https://..." class="w-full text-sm font-medium" />
              </div>
              {#if galleryImageUrl || gallerySelectedFile}
                <div class="rounded-xl overflow-hidden border border-slate-200 h-32 w-full bg-slate-50 flex items-center justify-center">
                  {#if gallerySelectedFile}
                    <span class="text-xs font-semibold text-indigo-600 px-4 text-center">Berkas terpilih akan diunggah saat disimpan</span>
                  {:else}
                    <img src={convertDriveUrl(galleryImageUrl)} alt="Preview" class="h-full w-full object-cover" />
                  {/if}
                </div>
              {/if}
              <div class="flex gap-3 pt-2">
                {#if editingGalleryId}
                  <Button type="button" variant="outline" class="flex-1 font-bold text-xs" on:click={() => { editingGalleryId = null; galleryImageUrl = ''; gallerySelectedFile = null; }}>Batal</Button>
                {/if}
                <Button type="button" class="flex-1 font-bold text-xs bg-indigo-600 hover:bg-indigo-700" on:click={addGalleryImage} disabled={isSubmitting}>
                  {isSubmitting ? 'Menyimpan...' : (editingGalleryId ? 'Simpan' : 'Tambah')}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <!-- List Panel -->
      <div class="xl:col-span-8 space-y-6">
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {#if isLoadingGallery}
            <div class="col-span-full py-12 text-center text-xs font-semibold text-slate-400">Memuat galeri...</div>
          {:else if galleryItems.length > 0}
            {#each galleryItems as item}
              <Card class="group overflow-hidden border-slate-100 relative h-32 hover:shadow-soft-md transition-all p-0">
                <img src={item.image_url} alt="Gallery item" class="w-full h-full object-cover" />
                <div class="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                  <button on:click={() => startEditGallery(item)} class="p-2 bg-white/20 hover:bg-white text-white hover:text-indigo-600 rounded-lg transition-colors"><Edit class="h-4 w-4" /></button>
                  <button on:click={() => deleteGalleryImage(item.id)} class="p-2 bg-white/20 hover:bg-white text-white hover:text-rose-600 rounded-lg transition-colors"><Trash2 class="h-4 w-4" /></button>
                </div>
              </Card>
            {/each}
          {:else}
            <div class="col-span-full py-12 text-center text-xs font-semibold text-slate-400 border border-dashed rounded-xl bg-slate-50/50">Belum ada gambar di galeri ini.</div>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>

{#if showNilaiModal}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-[2px] animate-in fade-in duration-200">
    <div class="bg-white rounded-3xl border border-slate-100 shadow-soft-xl max-w-lg w-full overflow-hidden animate-in scale-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
      <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
        <h3 class="text-xl font-black text-slate-800 flex items-center gap-2">
          <Award class="h-6 w-6 text-indigo-500" />
          {editingNilai ? 'Edit Nilai Santri' : 'Tambah Nilai Manual'}
        </h3>
        <button on:click={() => showNilaiModal = false} class="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors">
          <X class="h-5 w-5" />
        </button>
      </div>
      <div class="p-6 overflow-y-auto space-y-5">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-600">NIS Siswi <span class="text-rose-500">*</span></label>
            <input type="text" bind:value={formNilai.nis} placeholder="Misal: 22001" class="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-600">Nama Lengkap <span class="text-rose-500">*</span></label>
            <input type="text" bind:value={formNilai.nama_siswi} placeholder="Nama Siswi" class="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none" />
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-600">Periode</label>
            <select bind:value={formNilai.periode} class="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none">
              <option value="Ganjil">Ganjil</option>
              <option value="Genap">Genap</option>
            </select>
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-600">Tahun Ajaran</label>
            <input type="text" bind:value={formNilai.tahun_ajaran} placeholder="2026-2027" class="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none" />
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-600">Mata Pelajaran <span class="text-rose-500">*</span></label>
            <input type="text" bind:value={formNilai.mata_pelajaran} placeholder="Fiqih / Nahwu / Shorof" class="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-600">Kategori</label>
            <select bind:value={formNilai.kategori} class="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none">
              <option value="">- Pilih Kategori (Opsional) -</option>
              <option value="Qobla Maulud">Qobla Maulud</option>
              <option value="Ba'da Maulud">Ba'da Maulud</option>
              <option value="Ramadhan">Ramadhan</option>
              <option value="Syawal">Syawal</option>
            </select>
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-600">Nilai (Angka)</label>
            <input type="text" bind:value={formNilai.nilai} placeholder="Contoh: 90.5" class="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-600">Catatan / Predikat</label>
            <input type="text" bind:value={formNilai.catatan} placeholder="Misal: Mumtaz / Jayyid" class="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none" />
          </div>
        </div>
      </div>
      <div class="p-6 border-t border-slate-100 bg-slate-50/30 flex justify-end gap-3 shrink-0">
        <Button variant="secondary" on:click={() => showNilaiModal = false} class="rounded-xl">Batal</Button>
        <Button on:click={saveNilaiManual} disabled={isSubmitting} class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl px-6 shadow-md">
          {#if isSubmitting}Menyimpan...{:else}Simpan Data{/if}
        </Button>
      </div>
    </div>
  </div>
{/if}

{#if showConfirmModal}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-[2px] animate-in fade-in duration-200">
    <div class="bg-white rounded-3xl border border-slate-100 shadow-soft-xl max-w-sm w-full overflow-hidden p-6 space-y-5 animate-in scale-in zoom-in-95 duration-200">
      <div class="flex flex-col items-center text-center space-y-3">
        <div class="h-14 w-14 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100/60 shadow-soft-sm">
          <Trash2 class="h-7 w-7" />
        </div>
        <div class="space-y-1">
          <h3 class="font-extrabold text-base text-slate-800 leading-tight">
            {confirmModalTitle}
          </h3>
          <p class="text-xs text-slate-500 font-medium leading-relaxed px-2">
            {confirmModalMessage}
          </p>
        </div>
      </div>
      
      <div class="flex items-center gap-2 pt-2 border-t border-slate-100">
        <button 
          type="button" 
          class="flex-1 h-11 rounded-2xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors focus:outline-none"
          on:click={() => { showConfirmModal = false; confirmModalCallback = null; }}
        >
          Batal
        </button>
        <button 
          type="button" 
          class="flex-1 h-11 rounded-2xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-soft-md hover:shadow-soft-lg transition-all flex items-center justify-center space-x-1.5 focus:outline-none"
          on:click={async () => {
            if (confirmModalCallback) {
              const cb = confirmModalCallback;
              showConfirmModal = false;
              confirmModalCallback = null;
              await cb();
            }
          }}
        >
          <Trash2 class="h-4 w-4" />
          <span>Hapus</span>
        </button>
      </div>
    </div>
  </div>
{/if}
