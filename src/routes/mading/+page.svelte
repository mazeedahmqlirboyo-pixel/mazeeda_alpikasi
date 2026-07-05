<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import Card from "$lib/components/ui/card.svelte";
  import Button from "$lib/components/ui/button.svelte";
  import Input from "$lib/components/ui/input.svelte";
  import { supabase } from "$lib/supabase";
  import { authStore, activeProfileStore } from "$lib/auth";
  import { fade, slide } from "svelte/transition";
  import {
    Megaphone,
    Calendar,
    User,
    Search,
    Filter,
    MessageSquare,
    ThumbsUp,
    Send,
    Plus,
    Pin,
    Hash,
    Heart,
    Trash2,
    CheckCircle,
    Pencil,
    X as XIcon,
    AlertCircle,
  } from "lucide-svelte";
  import PageHeader from '$lib/components/ui/PageHeader.svelte';

  // Navigation / Tabs
  let activeTab = "pengumuman"; // 'pengumuman' | 'aspirasi'

  // Admin check (reactive)
  $: isAdmin = $authStore.user?.role === 'admin';

  // Announcements State (Official Mading)
  let searchQuery = "";
  let activeFilter = "all";
  let showFilter = false; // dropdown filter terbuka/tutup
  let dynamicCategories: string[] = []; // kategori dari DB, dinamis

  // Local storage cache for liked announcements & notes
  let likedPostsList: any[] = [];
  let likedNotesList: any[] = [];

  let announcements: any[] = [
    {
      id: 1,
      title: "Peluncuran Website MAZEEDA V1",
      category: "Informasi",
      content:
        "Alhamdulillah, hari ini kita resmi meluncurkan platform MAZEEDA. Platform ini diharapkan mempermudah koordinasi seluruh agenda keagamaan, sosial, dan transparansi keuangan Sangu. Berikan tanggapan Anda di kolom saran admin!",
      date: "12 Juni 2026",
      author: "Siti Fatimah",
      likes: 18,
      hasLiked: false,
      comments: [
        {
          id: 101,
          author: "Ahmad Fauzi",
          text: "MasyaAllah, barakallah! Semoga berkah dan bermanfaat bagi seluruh alumni.",
          date: "12 Juni 2026",
        },
        {
          id: 102,
          author: "Muhammad Ali",
          text: "Keren banget UI-nya, sangat bersih, modern, dan responsive.",
          date: "12 Juni 2026",
        },
      ],
      showComments: false,
    },
    {
      id: 2,
      title: "Khataman Al-Qur'an Bersama & Doa Akhir Tahun",
      category: "Kajian",
      content:
        "Mengundang seluruh alumni dan mustahiq untuk menghadiri program Semaan dan Khataman Juz 30 yang akan ditutup dengan buka puasa sunnah senin-kamis bersama. Tempat di Musholla Baiturrahman mulai Ba'da Ashar.",
      date: "08 Juni 2026",
      author: "Ahmad Fauzi",
      likes: 21,
      hasLiked: false,
      comments: [
        {
          id: 201,
          author: "Siti Sarah",
          text: "InsyaAllah hadir bersama keluarga kak. Mohon doanya agar lancar perjalanan.",
          date: "08 Juni 2026",
        },
      ],
      showComments: false,
    },
    {
      id: 3,
      title: "Penyaluran Zakat & Donasi Mustahiq Tahap III",
      category: "Sosial",
      content:
        "Laporan penyaluran donasi Sangu ke 5 kepala keluarga di Tasikmalaya telah selesai dilaksanakan. Kuitansi dan dokumentasi foto lengkap dapat dilihat di folder administrasi publik.",
      date: "02 Juni 2026",
      author: "Muhammad Ali",
      likes: 14,
      hasLiked: false,
      comments: [],
      showComments: false,
    },
  ];

  // Sticky Notes State (Aspirasi / Community Board)
  let stickyNotes: any[] = [];
  let isLoadingNotes = false;
  let newNoteText = "";
  let selectedColor = "yellow"; // 'yellow' | 'pink' | 'cyan' | 'emerald'
  let isPostingNote = false;
  let alertMessage = "";
  let alertType: 'success' | 'error' = 'success';
  let isEditing = false;
  let selectedNoteForComments: any = null;
  let noteCommentsList: any[] = [];
  let newNoteCommentText = "";
  let showNoteCreatorModal = false;
  $: selectedNoteColor = selectedNoteForComments
    ? getNoteColor(selectedNoteForComments.color_theme)
    : null;

  // Announcement Comments Modal State
  let selectedAnnouncementForComments: any = null;

  $: sortedNoteCommentsList = (() => {
    const isMe = (name) => name === $authStore.user?.name;
    const topLevel = [];
    const replies = {};
    for (const c of noteCommentsList) {
      if (c.parent_id) {
        if (!replies[c.parent_id]) replies[c.parent_id] = [];
        replies[c.parent_id].push(c);
      } else {
        topLevel.push(c);
      }
    }
    topLevel.sort((a, b) => {
      const meA = isMe(a.author);
      const meB = isMe(b.author);
      if (meA && !meB) return -1;
      if (!meA && meB) return 1;
      return 0;
    });
    const result = [];
    for (const parent of topLevel) {
      result.push(parent);
      if (replies[parent.id]) result.push(...replies[parent.id]);
    }
    const allInResult = new Set(result.map(c => c.id));
    for (const c of noteCommentsList) {
      if (!allInResult.has(c.id)) result.push(c);
    }
    return result;
  })();

  $: sortedAnnouncementComments = (() => {
    if (!selectedAnnouncementForComments) return [];
    const comments = selectedAnnouncementForComments.comments || [];
    const isMe = (name) => name === $authStore.user?.name;
    const topLevel = [];
    const replies = {};
    for (const c of comments) {
      if (c.parent_id) {
        if (!replies[c.parent_id]) replies[c.parent_id] = [];
        replies[c.parent_id].push(c);
      } else {
        topLevel.push(c);
      }
    }
    topLevel.sort((a, b) => {
      const meA = isMe(a.author);
      const meB = isMe(b.author);
      if (meA && !meB) return -1;
      if (!meA && meB) return 1;
      return 0;
    });
    const result = [];
    for (const parent of topLevel) {
      result.push(parent);
      if (replies[parent.id]) result.push(...replies[parent.id]);
    }
    const allInResult = new Set(result.map(c => c.id));
    for (const c of comments) {
      if (!allInResult.has(c.id)) result.push(c);
    }
    return result;
  })();
  let newAnnouncementCommentText = "";

  // Edit state — announcement comments
  let editingAnnouncementCommentId: number | null = null;
  let editingAnnouncementCommentText = "";

  // Edit state — note comments
  let editingNoteCommentId: string | null = null;
  let editingNoteCommentText = "";

  // Reply state — announcement comments
  let replyingToAnnouncementCommentId: number | null = null;
  let replyingToAnnouncementCommentAuthor: string = "";

  // Reply state — note comments
  let replyingToNoteCommentId: number | null = null;
  let replyingToNoteCommentAuthor: string = "";

  $: if (browser) {
    if (
      selectedNoteForComments ||
      selectedAnnouncementForComments ||
      showNoteCreatorModal
    ) {
      document.documentElement.classList.add("hide-mobile-nav");
    } else {
      document.documentElement.classList.remove("hide-mobile-nav");
    }
  }

  const colors = [
    {
      id: "yellow",
      label: "Amber",
      bg: "bg-amber-50 border-amber-200/80 text-amber-900",
      hover: "hover:bg-amber-100/40",
      dot: "bg-amber-400",
      tape: "bg-amber-200/60",
    },
    {
      id: "pink",
      label: "Pink",
      bg: "bg-pink-50 border-pink-200/80 text-pink-900",
      hover: "hover:bg-pink-100/40",
      dot: "bg-pink-400",
      tape: "bg-pink-200/60",
    },
    {
      id: "cyan",
      label: "Cyan",
      bg: "bg-sky-50 border-sky-200/80 text-sky-900",
      hover: "hover:bg-sky-100/40",
      dot: "bg-sky-400",
      tape: "bg-sky-200/60",
    },
    {
      id: "emerald",
      label: "Emerald",
      bg: "bg-emerald-50 border-emerald-200/80 text-emerald-900",
      hover: "hover:bg-emerald-100/40",
      dot: "bg-emerald-400",
      tape: "bg-emerald-200/60",
    },
  ];

  // Comment Form state
  let newCommentText: { [key: number]: string } = {};

  // Expanded announcements state
  let expandedAnnouncements: Record<number | string, boolean> = {};

  function toggleExpandAnnouncement(id: number | string) {
    expandedAnnouncements[id] = !expandedAnnouncements[id];
    expandedAnnouncements = { ...expandedAnnouncements };
  }

  // Realtime Subscriptions
  let realtimeStatus: "connecting" | "connected" | "error" = "connecting";
  let notesChannel: any;

  // Mention system
  let allUsers: { name: string, avatar: string }[] = [];
  let showMentionDropdown = false;
  let mentionSearchTerm = '';
  let filteredUsers: { name: string, avatar: string }[] = [];
  let activeMentionInput: 'announcement' | 'note' | null = null;
  let announcementInputElement: HTMLInputElement;
  let noteInputElement: HTMLInputElement;
  let allUserNames: string[] = [];

  // Data fetching functions
  async function fetchAllUsers() {
    try {
      const { data: alumni } = await supabase.from('allowed_alumni').select('nama_lengkap, foto_url');
      const { data: asatidzah } = await supabase.from('asatidzah').select('nama_lengkap, foto_url');
      const usersMap = new Map<string, string>();
      const defaultAvatar = 'https://drive.google.com/file/d/1f332yzKnUHuix7YeAvCgMZm4y2v30CwF/view?usp=drive_link';
      
      if (alumni) alumni.forEach(u => {
        if (u.nama_lengkap) usersMap.set(u.nama_lengkap, u.foto_url || defaultAvatar);
      });
      if (asatidzah) asatidzah.forEach(u => {
        if (u.nama_lengkap) usersMap.set(u.nama_lengkap, u.foto_url || defaultAvatar);
      });
      
      allUsers = Array.from(usersMap, ([name, avatar]) => ({ name, avatar }));
      allUserNames = Array.from(usersMap.keys());
    } catch (e) {
      console.error('Failed to fetch user names:', e);
    }
  }

  function handleCommentInput(e: any, type: 'announcement' | 'note') {
    const val = e.target.value;
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursorPosition);
    
    const match = textBeforeCursor.match(/(?:^|\s)@([^@]{0,50})$/);
    if (match) {
      showMentionDropdown = true;
      activeMentionInput = type;
      mentionSearchTerm = match[1].toLowerCase();
      filteredUsers = allUsers.filter(u => u.name.toLowerCase().includes(mentionSearchTerm)).slice(0, 5);
    } else {
      showMentionDropdown = false;
      activeMentionInput = null;
    }
  }

  function insertMention(name: string) {
    const isAnn = activeMentionInput === 'announcement';
    const inputElement = isAnn ? announcementInputElement : noteInputElement;
    if (!inputElement) return;
    
    const val = isAnn ? newAnnouncementCommentText : newNoteCommentText;
    const cursorPosition = inputElement.selectionStart || 0;
    const textBeforeCursor = val.slice(0, cursorPosition);
    
    const match = textBeforeCursor.match(/(?:^|\s)@([^@]{0,50})$/);
    if (match) {
      const replaceLen = match[1].length + 1;
      const prefix = textBeforeCursor.slice(0, -replaceLen);
      const space = prefix.length > 0 && !prefix.endsWith(' ') ? ' ' : '';
      const newText = prefix + space + '@' + name + ' ' + val.slice(cursorPosition);
      
      if (isAnn) {
        newAnnouncementCommentText = newText;
      } else {
        newNoteCommentText = newText;
      }
      
      showMentionDropdown = false;
      activeMentionInput = null;
      
      setTimeout(() => {
        if (inputElement) {
          inputElement.focus();
          const newPos = (prefix + space + '@' + name + ' ').length;
          inputElement.setSelectionRange(newPos, newPos);
        }
      }, 10);
    }
  }

  // Formatting text to highlight @Mentions
  function formatMentions(text: string): string {
    if (!text) return '';
    // Escape HTML tags first to prevent XSS
    let formattedText = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    
    allUserNames.forEach(name => {
      const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(^|\\s)@(${escapedName})(?=\\s|[.,!?]|$)`, 'gi');
      formattedText = formattedText.replace(regex, `$1<button type="button" class="mention-btn text-indigo-600 font-bold bg-indigo-50 px-1 rounded hover:underline cursor-pointer" data-name="$2">@$2</button>`);
    });
    return formattedText;
  }

  function handleDelegatedMentionClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    const btn = target.closest('.mention-btn') as HTMLElement;
    if (btn && btn.dataset.name) {
      const name = btn.dataset.name;
      const currentAdminName = (adminName || 'ADMIN MAZEEDA').toUpperCase();
      const role = (name.toUpperCase() === currentAdminName || name.toUpperCase() === 'ADMIN MAZEEDA' || name.toUpperCase() === 'ADMIN') ? 'admin' : 'member';
      handleOpenProfile(role, name);
    }
  }

  // Parse mentions from text and notify targets
  async function notifyMentions(text: string, title: string, path: string) {
    if (!text) return;
    for (const name of allUserNames) {
      const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(^|\\s)@(${escapedName})(?=\\s|[.,!?]|$)`, 'i');
      if (regex.test(text)) {
        const sender = $authStore.user?.role === 'admin' ? (adminName || 'ADMIN MAZEEDA') : ($authStore.user?.name || 'Seseorang');
        // Prevent sending notification to oneself if they mention themselves
        if (name !== sender) {
          const { error } = await supabase.from('app_notifications').insert([{
            title: title,
            message: `${sender} menyebut anda di sebuah komentar: @${name} "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"|LINK:${path}`,
            type: 'info',
            is_active: true,
            target_user: name
          }]);
          if (error) console.error('Gagal mengirim notif mention mading:', error);
        }
      }
    }
  }

  // ─── Avatar Map: author name → foto_url ───────────────────────────────────
  // Stores a mapping of commenter names to their profile photo URLs.
  // Admin photo is kept in sync via authStore reactive subscription.
  let authorAvatarMap: Record<string, string> = {};
  let adminName = 'ADMIN MAZEEDA';
  let adminFotoUrl = 'https://drive.google.com/file/d/1f332yzKnUHuix7YeAvCgMZm4y2v30CwF/view?usp=drive_link';

  // Helper: convert Google Drive share link → direct thumbnail URL
  function convertDriveUrl(url: string): string {
    if (!url) return '';
    const cleaned = url.trim();
    if (cleaned.includes('lh3.googleusercontent.com/u/0/d/')) {
      return cleaned.replace('lh3.googleusercontent.com/u/0/d/', 'lh3.googleusercontent.com/d/');
    }
    const match = cleaned.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
                  cleaned.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
    return cleaned;
  }

  // Fetch foto_url for all known alumni and admin (once on mount, best-effort)
  async function fetchAuthorAvatars() {
    try {
      const { data: adminData, error: adminErr } = await supabase
        .from('admin_profile')
        .select('nama_lengkap, foto_url')
        .eq('id', 1)
        .maybeSingle();
      if (adminErr) {
        console.error("fetchAuthorAvatars admin_profile error:", adminErr);
      }
      if (!adminErr && adminData) {
        if (adminData.nama_lengkap) adminName = adminData.nama_lengkap;
        if (adminData.foto_url) adminFotoUrl = adminData.foto_url;
      }
    } catch (e) {
      console.error("fetchAuthorAvatars admin_profile exception:", e);
    }

    // Map admin avatars
    authorAvatarMap[adminName] = adminFotoUrl;
    authorAvatarMap['ADMIN MAZEEDA'] = adminFotoUrl;
    authorAvatarMap['Admin MAZEEDA'] = adminFotoUrl;
    authorAvatarMap['ADMIN'] = adminFotoUrl;

    try {
      const { data, error } = await supabase
        .from('allowed_alumni')
        .select('nama_lengkap, foto_url');
      if (error) {
        console.error("fetchAuthorAvatars allowed_alumni error:", error);
      }
      if (!error && data) {
        data.forEach((row: any) => {
          if (row.nama_lengkap && row.foto_url) {
            authorAvatarMap[row.nama_lengkap] = row.foto_url;
          }
        });
      }
    } catch (e) {
      console.error("fetchAuthorAvatars allowed_alumni exception:", e);
    }
    authorAvatarMap = { ...authorAvatarMap }; // trigger reactivity
  }

  function handleOpenProfile(role: 'admin' | 'member', name: string) {
    if (!name || name === 'Anonim' || name === 'Tamu') return;
    activeProfileStore.set({ type: role, nameOrNis: name });
  }

  // Reactive: keep admin photo in sync whenever authStore changes
  $: if ($authStore.user?.role === 'admin') {
    if ($authStore.user.name) adminName = $authStore.user.name;
    if ($authStore.user.foto_url !== undefined) {
      authorAvatarMap[adminName] = $authStore.user.foto_url || adminFotoUrl;
      authorAvatarMap['Admin MAZEEDA'] = $authStore.user.foto_url || adminFotoUrl;
      authorAvatarMap['ADMIN MAZEEDA'] = $authStore.user.foto_url || adminFotoUrl;
      authorAvatarMap['ADMIN'] = $authStore.user.foto_url || adminFotoUrl;
      authorAvatarMap = { ...authorAvatarMap };
    }
  }

  // Helper: get initials from a display name
  function getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  onMount(async () => {
    // Load local storage liked lists
    const storedLikes = localStorage.getItem("mazeeda_liked_announcements");
    if (storedLikes) {
      try {
        likedPostsList = JSON.parse(storedLikes);
      } catch (e) {}
    }

    const storedNoteLikes = localStorage.getItem("mazeeda_liked_notes");
    if (storedNoteLikes) {
      try {
        likedNotesList = JSON.parse(storedNoteLikes);
      } catch (e) {}
    }

    // 1. Fetch announcements, comments, and author avatars
    await fetchAnnouncements();
    await fetchStickyNotes();
    await fetchAuthorAvatars();
    await fetchAllUsers();

    // 2. Setup Realtime subscription channel (Unified and using unique name to prevent cache collisions)
    try {
      const uniqueSuffix = Date.now();
      notesChannel = supabase
        .channel(`mading_realtime_board_${uniqueSuffix}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "mading_notes" },
          (payload) => {
            if (!stickyNotes.some((note) => note.id === payload.new.id)) {
              const freshNote = {
                ...payload.new,
                comments_count: 0,
              };
              stickyNotes = [freshNote, ...stickyNotes];
            }
          },
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "mading_notes" },
          (payload) => {
            stickyNotes = stickyNotes.map((n) => {
              if (n.id === payload.new.id) {
                return { ...n, likes: payload.new.likes };
              }
              return n;
            });
          },
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "mading_announcements" },
          (payload) => {
            announcements = announcements.map((post) => {
              if (post.id === payload.new.id) {
                return { ...post, likes: payload.new.likes };
              }
              return post;
            });
          },
        )
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "mading_announcements" },
          () => {
            fetchAnnouncements();
          },
        )
        .on(
          "postgres_changes",
          { event: "DELETE", schema: "public", table: "mading_announcements" },
          (payload) => {
            announcements = announcements.filter(
              (post) => post.id !== payload.old.id,
            );
          },
        )
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "mading_comments" },
          (payload) => {
            announcements = announcements.map((post) => {
              if (post.id === payload.new.announcement_id) {
                if (!post.comments.some((c: any) => c.id === payload.new.id)) {
                  const mappedComment = {
                    id: payload.new.id,
                    author: payload.new.author,
                    text: payload.new.text,
                    date: "Baru saja",
                  };
                  return {
                    ...post,
                    comments: [...post.comments, mappedComment],
                  };
                }
              }
              return post;
            });
            // Update modal if open
            if (selectedAnnouncementForComments && selectedAnnouncementForComments.id === payload.new.announcement_id) {
                if (!selectedAnnouncementForComments.comments.some((c: any) => c.id === payload.new.id)) {
                  selectedAnnouncementForComments = {
                    ...selectedAnnouncementForComments,
                    comments: [...selectedAnnouncementForComments.comments, {
                      id: payload.new.id,
                      author: payload.new.author,
                      text: payload.new.text,
                      date: "Baru saja",
                      parent_id: payload.new.parent_id
                    }]
                  };
                }
            }
          },
        )
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "mading_note_comments" },
          (payload) => {
            // Update comments inside currently open modal
            if (
              selectedNoteForComments &&
              selectedNoteForComments.id === payload.new.note_id
            ) {
              if (!noteCommentsList.some((c) => c.id === payload.new.id)) {
                noteCommentsList = [...noteCommentsList, payload.new];
              }
            }
            // Update comments_count in grid list
            stickyNotes = stickyNotes.map((n) => {
              if (n.id === payload.new.note_id) {
                return { ...n, comments_count: (n.comments_count || 0) + 1 };
              }
              return n;
            });
          },
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            realtimeStatus = "connected";
          } else if (
            status === "CHANNEL_ERROR" ||
            status === "TIMED_OUT" ||
            status === "CLOSED"
          ) {
            realtimeStatus = "error";
          }
        });
    } catch (err) {
      realtimeStatus = "error";
    }
  });

  onDestroy(() => {
    if (notesChannel) supabase.removeChannel(notesChannel);
    if (browser) {
      document.documentElement.classList.remove("hide-mobile-nav");
    }
  });

  // Custom Confirmation Modal State
  let showConfirmModal = false;
  let confirmConfig = {
    title: '',
    message: '',
    onConfirm: async () => {},
  };

  function runWithConfirmation(title: string, message: string, onConfirm: () => Promise<void> | void) {
    confirmConfig = { title, message, onConfirm };
    showConfirmModal = true;
  }

  // Fetch announcements & comments from database
  async function fetchAnnouncements() {
    try {
      const { data: dbAnnouncements, error: annError } = await supabase
        .from("mading_announcements")
        .select("*")
        .order("is_priority", { ascending: false })
        .order("created_at", { ascending: false });

      if (annError) throw annError;

      const { data: dbComments, error: commError } = await supabase
        .from("mading_comments")
        .select("*")
        .order("created_at", { ascending: true });

      if (dbAnnouncements) {
        announcements = dbAnnouncements.map((item: any) => {
              const matchingComments = dbComments
            ? dbComments
                .filter((c: any) => c.announcement_id === item.id)
                .map((c: any) => ({
                  id: c.id,
                  author: c.author,
                  text: c.text,
                  parent_id: c.parent_id || null,
                  date: new Date(c.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                  }),
                }))
            : [];

          return {
            id: item.id,
            title: item.title,
            category: item.category,
            content: item.content,
            date: new Date(item.created_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            }),
            author: item.author,
            likes: item.likes || 0,
            hasLiked: likedPostsList.includes(item.id),
            comments: matchingComments,
            showComments: false,
            is_priority: item.is_priority,
          };
        });
      }
    } catch (err) {
      console.warn(
        "mading_announcements tables not found. Using local mock fallbacks.",
        err,
      );
    }
  }

  // Fetch sticky notes from database
  async function fetchStickyNotes() {
    try {
      isLoadingNotes = true;
      const { data: notes, error } = await supabase
        .from("mading_notes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch comment counts
      const { data: comments, error: commError } = await supabase
        .from("mading_note_comments")
        .select("id, note_id");

      if (notes) {
        stickyNotes = notes.map((note: any) => {
          const count = comments
            ? comments.filter((c: any) => c.note_id === note.id).length
            : 0;
          return {
            ...note,
            comments_count: count,
          };
        });
      }
    } catch (err) {
      console.error("Error fetching sticky notes:", err);
    } finally {
      isLoadingNotes = false;
    }
  }

  // Kategori dinamis: ambil secara reaktif dari kategori yang benar-benar ada di announcements
  $: dynamicCategories = [
    ...new Set(announcements.map((a) => a.category).filter(Boolean)),
  ].sort() as string[];

  // Filter count badge
  $: activeFilterCount = activeFilter !== "all" ? 1 : 0;

  // Filtering Logic (Official Board)
  $: filteredAnnouncements = announcements
    .filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter =
        activeFilter === "all" || post.category === activeFilter;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (a.is_priority && !b.is_priority) return -1;
      if (!a.is_priority && b.is_priority) return 1;
      return 0;
    });

  // Handle Likes for Announcements
  async function handleLike(post: any) {
    const hasLiked = !post.hasLiked;
    const newLikesCount = hasLiked
      ? post.likes + 1
      : Math.max(0, post.likes - 1);

    announcements = announcements.map((p) => {
      if (p.id === post.id) {
        return { ...p, likes: newLikesCount, hasLiked };
      }
      return p;
    });

    if (hasLiked) {
      likedPostsList = [...likedPostsList, post.id];
    } else {
      likedPostsList = likedPostsList.filter((id) => id !== post.id);
    }
    localStorage.setItem(
      "mazeeda_liked_announcements",
      JSON.stringify(likedPostsList),
    );

    try {
      const { error } = await supabase
        .from("mading_announcements")
        .update({ likes: newLikesCount })
        .eq("id", post.id);
      if (error) throw error;
    } catch (err) {
      console.warn("Failed to update likes count in database:", err);
    }
  }

  // Toggle Comment Box (Official)
  function toggleComments(id: number) {
    announcements = announcements.map((post) => {
      if (post.id === id) {
        return { ...post, showComments: !post.showComments };
      }
      return post;
    });
  }

  // Add Comment (Official)
  async function handleAddComment(postId: any) {
    const text = newCommentText[postId]?.trim();
    if (!text) return;

    const userName = $authStore.user?.name || "Anonim";
    const tempComment = {
      id: Date.now(),
      author: userName,
      text: text,
      date: "Baru saja",
    };

    announcements = announcements.map((post) => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, tempComment],
        };
      }
      return post;
    });

    newCommentText[postId] = "";

    try {
      const { data, error } = await supabase
        .from("mading_comments")
        .insert([
          {
            announcement_id: postId,
            author: userName,
            text: text,
          },
        ])
        .select();

      if (error) throw error;

      triggerAlert("Tanggapan Anda berhasil disimpan!");

      if (data && data.length > 0) {
        announcements = announcements.map((post) => {
          if (post.id === postId) {
            const cleanComments = post.comments.filter(
              (c: any) => c.id !== tempComment.id,
            );
            const savedComment = {
              id: data[0].id,
              author: data[0].author,
              text: data[0].text,
              date: "Hari ini",
            };
            return { ...post, comments: [...cleanComments, savedComment] };
          }
          return post;
        });
      }
    } catch (err) {
      console.warn("Failed to save comment in database:", err);
      triggerAlert("Tanggapan terpasang (Sesi Lokal)!");
    }
  }

  // Add Comment to Announcement (Instagram Style bottom drawer)
  async function handleAddAnnouncementComment() {
    if (!newAnnouncementCommentText.trim() || !selectedAnnouncementForComments) return;
    const postId = selectedAnnouncementForComments.id;
    const text = newAnnouncementCommentText.trim();
    const userName = $authStore.user?.name || "Anonim";
    const parentId = replyingToAnnouncementCommentId;
    const targetAuthor = replyingToAnnouncementCommentAuthor;

    const tempComment = {
      id: Date.now(),
      author: userName,
      text: text,
      date: "Baru saja",
      parent_id: parentId
    };

    // Append locally immediately
    announcements = announcements.map((post) => {
      if (post.id === postId) {
        const updatedPost = {
          ...post,
          comments: [...post.comments, tempComment],
        };
        selectedAnnouncementForComments = updatedPost;
        return updatedPost;
      }
      return post;
    });

    newAnnouncementCommentText = "";
    replyingToAnnouncementCommentId = null;
    replyingToAnnouncementCommentAuthor = "";

    try {
      const { data, error } = await supabase
        .from("mading_comments")
        .insert([
          {
            announcement_id: postId,
            author: userName,
            text: text,
            parent_id: parentId || null
          },
        ])
        .select();

      if (error) throw error;
      
      // Notify mentions
      await notifyMentions(text, "Ada yang Mention Anda di Pengumuman Mading!", `/mading`);

      // Jika ini adalah balasan ke orang lain, kirim notifikasi
      if (parentId && targetAuthor && targetAuthor !== userName) {
        try {
          await supabase.from("app_notifications").insert([{
            title: `Balasan Baru dari ${userName}`,
            message: `${userName} membalas komentar anda: @${targetAuthor} "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"|LINK:/mading`,
            type: 'info',
            target_user: targetAuthor,
            is_active: true
          }]);
        } catch (notifErr) {
          console.warn("Gagal mengirim notifikasi balasan", notifErr);
        }
      }

      triggerAlert("Tanggapan Anda berhasil disimpan!");

      if (data && data.length > 0) {
        const savedComment = {
          id: data[0].id,
          author: data[0].author,
          text: data[0].text,
          date: "Hari ini",
          parent_id: data[0].parent_id
        };
        announcements = announcements.map((post) => {
          if (post.id === postId) {
            const cleanComments = post.comments.filter(
              (c: any) => c.id !== tempComment.id,
            );
            const updatedPost = { ...post, comments: [...cleanComments, savedComment] };
            selectedAnnouncementForComments = updatedPost;
            return updatedPost;
          }
          return post;
        });
      }
    } catch (err) {
      console.warn("Failed to save comment in database:", err);
      triggerAlert("Tanggapan terpasang (Sesi Lokal)!");
    }
  }

  // Liking a Sticky Note
  async function handleLikeNote(note: any) {
    const hasLiked = !likedNotesList.includes(note.id);
    const newCount = hasLiked
      ? (note.likes || 0) + 1
      : Math.max(0, (note.likes || 0) - 1);

    // Toggle state locally
    stickyNotes = stickyNotes.map((n) =>
      n.id === note.id ? { ...n, likes: newCount } : n,
    );

    // Update Local Storage
    if (hasLiked) {
      likedNotesList = [...likedNotesList, note.id];
    } else {
      likedNotesList = likedNotesList.filter((id) => id !== note.id);
    }
    localStorage.setItem("mazeeda_liked_notes", JSON.stringify(likedNotesList));

    // Update Supabase
    try {
      const { error } = await supabase
        .from("mading_notes")
        .update({ likes: newCount })
        .eq("id", note.id);
      if (error) throw error;
    } catch (e) {
      console.warn("Failed to update sticky note likes in database:", e);
    }
  }

  // Open Sticky Note Comment Drawer/Modal
  async function openNoteComments(note: any) {
    selectedNoteForComments = note;
    noteCommentsList = [];
    newNoteCommentText = "";

    try {
      const { data, error } = await supabase
        .from("mading_note_comments")
        .select("*")
        .eq("note_id", note.id)
        .order("created_at", { ascending: true });

      if (!error && data) {
        noteCommentsList = data;
      }
    } catch (e) {
      console.error("Failed to load note comments:", e);
    }
  }

  // ─── Delete Announcement Comment (Admin/Author) ─────────────────────────
  async function deleteAnnouncementComment(commentId: number | string) {
    runWithConfirmation('Hapus Komentar', 'Apakah Anda yakin ingin menghapus komentar ini? Tindakan ini tidak dapat dibatalkan.', async () => {
      try {
        const { error, count } = await supabase
          .from('mading_comments')
          .delete({ count: 'exact' })
          .eq('id', commentId);
        if (error) throw error;
        if (count === 0) throw new Error('Akses ditolak oleh database (RLS). Silakan izinkan akses Hapus di dashboard Supabase Anda.');

        // Remove from local state
        announcements = announcements.map(post => {
          if (post.id === selectedAnnouncementForComments?.id) {
            const updated = { ...post, comments: post.comments.filter((c: any) => c.id !== commentId) };
            selectedAnnouncementForComments = updated;
            return updated;
          }
          return post;
        });
        triggerAlert('Komentar berhasil dihapus.');
      } catch (e) {
        console.error('Action failed:', e);
      triggerAlert(e.message || 'Terjadi kesalahan sistem.', 'error');
      } finally {
        showConfirmModal = false;
      }
    });
  }

  // ─── Edit Announcement Comment (Admin) ────────────────────────────────────
  async function saveEditAnnouncementComment() {
    if (!editingAnnouncementCommentText.trim() || editingAnnouncementCommentId === null) return;
    const newText = editingAnnouncementCommentText.trim();
    try {
      const { error, count } = await supabase
        .from('mading_comments')
        .update({ text: newText }, { count: 'exact' })
        .eq('id', editingAnnouncementCommentId);
      if (error) throw error;
      if (count === 0) throw new Error('Akses ditolak oleh database (RLS). Silakan izinkan akses Edit di dashboard Supabase Anda.');

      announcements = announcements.map(post => {
        if (post.id === selectedAnnouncementForComments?.id) {
          const updated = { ...post, comments: post.comments.map((c: any) =>
            c.id === editingAnnouncementCommentId ? { ...c, text: newText } : c
          )};
          selectedAnnouncementForComments = updated;
          return updated;
        }
        return post;
      });
      editingAnnouncementCommentId = null;
      editingAnnouncementCommentText = '';
      triggerAlert('Komentar berhasil diperbarui.');
    } catch (e) {
      console.error('Action failed:', e);
      triggerAlert(e.message || 'Terjadi kesalahan sistem.', 'error');
    }
  }

  // ─── Delete Note Comment (Admin/Author) ─────────────────────────────────
  async function deleteNoteComment(commentId: string | number) {
    runWithConfirmation('Hapus Komentar', 'Apakah Anda yakin ingin menghapus komentar ini? Tindakan ini tidak dapat dibatalkan.', async () => {
      try {
        const { error, count } = await supabase
          .from('mading_note_comments')
          .delete({ count: 'exact' })
          .eq('id', commentId);
        if (error) throw error;
        if (count === 0) throw new Error('Akses ditolak oleh database (RLS). Silakan izinkan akses Hapus di dashboard Supabase Anda.');

        noteCommentsList = noteCommentsList.filter(c => c.id !== commentId);
        // Decrement count on sticky note
        stickyNotes = stickyNotes.map(n =>
          n.id === selectedNoteForComments?.id
            ? { ...n, comments_count: Math.max(0, (n.comments_count || 1) - 1) }
            : n
        );
        triggerAlert('Komentar berhasil dihapus.');
      } catch (e) {
      console.error('Action failed:', e);
      triggerAlert(e.message || 'Terjadi kesalahan sistem.', 'error');
      } finally {
        showConfirmModal = false;
      }
    });
  }

  // ─── Edit Note Comment (Admin) ────────────────────────────────────────────
  async function saveEditNoteComment() {
    if (!editingNoteCommentText.trim() || editingNoteCommentId === null) return;
    const newText = editingNoteCommentText.trim();
    try {
      const { error, count } = await supabase
        .from('mading_note_comments')
        .update({ text: newText }, { count: 'exact' })
        .eq('id', editingNoteCommentId);
      if (error) throw error;
      if (count === 0) throw new Error('Akses ditolak oleh database (RLS). Silakan izinkan akses Edit di dashboard Supabase Anda.');

      noteCommentsList = noteCommentsList.map(c =>
        c.id === editingNoteCommentId ? { ...c, text: newText } : c
      );
      editingNoteCommentId = null;
      editingNoteCommentText = '';
      triggerAlert('Komentar berhasil diperbarui.');
    } catch (e) {
      console.error('Action failed:', e);
      triggerAlert(e.message || 'Terjadi kesalahan sistem.', 'error');
    }
  }

  // Add Comment to Sticky Note
  async function handleAddNoteComment() {
    if (!newNoteCommentText.trim() || !selectedNoteForComments) return;

    const sender = $authStore.user?.name || "Anonim";
    const text = newNoteCommentText.trim();
    const parentId = replyingToNoteCommentId;
    const targetAuthor = replyingToNoteCommentAuthor;

    const tempComment = {
      id: Date.now(),
      note_id: selectedNoteForComments.id,
      author: sender,
      text: text,
      created_at: new Date().toISOString(),
      parent_id: parentId
    };

    // Append locally immediately
    noteCommentsList = [...noteCommentsList, tempComment];

    // Increment comments_count in grid list
    stickyNotes = stickyNotes.map((n) => {
      if (n.id === selectedNoteForComments.id) {
        return { ...n, comments_count: (n.comments_count || 0) + 1 };
      }
      return n;
    });

    newNoteCommentText = "";
    replyingToNoteCommentId = null;
    replyingToNoteCommentAuthor = "";

    try {
      const { data, error } = await supabase
        .from("mading_note_comments")
        .insert([
          {
            note_id: selectedNoteForComments.id,
            author: sender,
            text: text,
            parent_id: parentId || null
          },
        ])
        .select();

      if (error) throw error;

      // Notify mentions
      await notifyMentions(text, "Ada yang Mention Anda di Kertas Tempel Mading!", `/mading`);
      
      // Kirim notifikasi jika ini balasan ke orang lain
      if (parentId && targetAuthor && targetAuthor !== sender) {
        try {
          await supabase.from("app_notifications").insert([{
            title: `Balasan Aspirasi dari ${sender}`,
            message: `${sender} membalas komentar anda: @${targetAuthor} "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"|LINK:/mading`,
            type: 'info',
            target_user: targetAuthor,
            is_active: true
          }]);
        } catch (notifErr) {
          console.warn("Gagal mengirim notifikasi balasan note", notifErr);
        }
      }

      if (data && data.length > 0) {
        noteCommentsList = noteCommentsList.map((c) =>
          c.id === tempComment.id ? data[0] : c,
        );
      }
      triggerAlert("Tanggapan berhasil disimpan!");
    } catch (e) {
      console.warn("Failed to insert note comment in DB:", e);
      triggerAlert("Tanggapan terpasang (Sesi Lokal)!");
    }
  }

  // Post Sticky Note to Supabase
  async function postStickyNote() {
    if (!newNoteText.trim()) return;

    const sender = $authStore.user?.name || "Anonim";

    let dbColor = "";
    if (selectedColor === "cyan")
      dbColor =
        "bg-cyan-500/10 text-cyan-200 border-cyan-500/30 shadow-cyan-500/5";
    else if (selectedColor === "pink")
      dbColor =
        "bg-pink-500/10 text-pink-200 border-pink-500/30 shadow-pink-500/5";
    else if (selectedColor === "emerald")
      dbColor =
        "bg-emerald-500/10 text-emerald-200 border-emerald-500/30 shadow-emerald-500/5";
    else
      dbColor =
        "bg-yellow-500/10 text-yellow-200 border-yellow-500/30 shadow-yellow-500/5";

    const tempId = String(Math.random());
    const newNote = {
      id: tempId,
      sender_name: sender,
      message: newNoteText,
      color_theme: dbColor,
      likes: 0,
      comments_count: 0,
      created_at: new Date().toISOString(),
    };

    isPostingNote = true;
    try {
      const { data, error } = await supabase
        .from("mading_notes")
        .insert([
          {
            sender_name: sender,
            message: newNoteText,
            color_theme: dbColor,
          },
        ])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        stickyNotes = [{ ...data[0], comments_count: 0 }, ...stickyNotes];
      } else {
        stickyNotes = [newNote, ...stickyNotes];
      }
      newNoteText = "";
      showNoteCreatorModal = false;
      triggerAlert("Aspirasi berhasil ditempel ke dinding!");
    } catch (err) {
      console.warn(
        "RLS permission insert restricted. Showing locally for demo:",
        err,
      );
      stickyNotes = [newNote, ...stickyNotes];
      newNoteText = "";
      showNoteCreatorModal = false;
      triggerAlert("Aspirasi terpasang (Sesi Lokal)!");
    } finally {
      isPostingNote = false;
    }
  }

  // Helper: map DB colors to light theme pastels
  function getNoteColor(dbColor: string) {
    if (!dbColor) return colors[0];
    const lower = dbColor.toLowerCase();
    if (lower.includes("cyan") || lower.includes("sky")) return colors[2];
    if (lower.includes("pink")) return colors[1];
    if (lower.includes("emerald") || lower.includes("green")) return colors[3];
    return colors[0]; // yellow
  }

  // Helper: random rotation styling for organic feel
  function getRotation(index: number) {
    const list = [
      "rotate-1",
      "-rotate-1",
      "rotate-2",
      "-rotate-2",
      "rotate-[0.5deg]",
      "-rotate-[1.5deg]",
    ];
    return list[index % list.length];
  }

  // Trigger temporary notification
  function triggerAlert(msg: string, type: 'success' | 'error' = 'success') {
    alertMessage = msg;
    alertType = type;
    setTimeout(() => {
      alertMessage = "";
    }, 3500);
  }

  // Format category badge styles
  function getCategoryStyles(category: string) {
    switch (category) {
      case "Informasi":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "Kajian":
        return "bg-indigo-50 text-indigo-700 border-indigo-100";
      case "Sosial":
        return "bg-rose-50 text-rose-700 border-rose-100";
      case "Pemberitahuan":
        return "bg-amber-50 text-amber-700 border-amber-100";
      default:
        return "bg-blue-50 text-primary border-blue-100";
    }
  }

  // Arabic text detection helper
  function isArabic(text: string) {
    if (!text) return false;
    const arabicRegExp =
      /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return arabicRegExp.test(text);
  }
</script>

<svelte:head>
  <title>Mading MAZEEDA</title>
</svelte:head>

<div class="space-y-6 pb-24">
  <PageHeader title="Mading MAZEEDA" backTo="/" />

  <!-- Alert / Toast Banner (Floating Toast) -->
  {#if alertMessage}
    <div
      transition:fade={{ duration: 150 }}
      class="fixed top-20 right-4 flex items-center p-4 rounded-xl border text-xs font-semibold shadow-xl space-x-2.5 animate-in slide-in-from-top-4 duration-300 max-w-sm
        {alertType === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}"
      style="z-index: 999999;"
    >
      {#if alertType === 'error'}
        <AlertCircle class="h-4 w-4 shrink-0 text-rose-600" />
      {:else}
        <CheckCircle class="h-4 w-4 shrink-0 text-emerald-600" />
      {/if}
      <span class="leading-relaxed">{alertMessage}</span>
    </div>
  {/if}

  <!-- Dual-Board Tab Navigator -->
  <div
    class="flex border-b border-slate-100 p-0.5 bg-slate-100/50 rounded-xl max-w-max mx-auto"
  >
    <button
      on:click={() => (activeTab = "pengumuman")}
      class="px-5 py-2.5 text-xs font-bold rounded-lg transition-all duration-200 flex items-center space-x-2
        {activeTab === 'pengumuman'
        ? 'bg-white text-primary shadow-soft-sm'
        : 'text-slate-500 hover:text-slate-700'}"
      style="min-height: 40px;"
    >
      <Megaphone class="h-4 w-4" />
      <span> Papan Pengumuman</span>
    </button>
    <button
      on:click={() => (activeTab = "aspirasi")}
      class="px-5 py-2.5 text-xs font-bold rounded-lg transition-all duration-200 flex items-center space-x-2
        {activeTab === 'aspirasi'
        ? 'bg-white text-primary shadow-soft-sm'
        : 'text-slate-500 hover:text-slate-700'}"
      style="min-height: 40px;"
    >
      <Pin class="h-4 w-4" />
      <span> Dinding Aspirasi</span>
    </button>
  </div>

  {#if activeTab === "pengumuman"}
    <!-- ==================== BOARD 1: OFFICIAL ANNOUNCEMENTS ==================== -->
    <div class="space-y-6" in:fade={{ duration: 200 }}>
      <!-- Search Bar & Filter (gaya Squad) -->
      <div class="space-y-0">
        <div class="flex items-center space-x-2 relative">
          <!-- Search input -->
          <div class="relative flex-1">
            <Search class="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Cari pengumuman..."
              class="pl-12 w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white transition-colors duration-200 border-slate-200/80 rounded-xl"
              bind:value={searchQuery}
            />
          </div>

          <!-- Filter trigger button -->
          <div class="relative">
            <button
              type="button"
              class="relative p-3 rounded-xl border transition-all duration-200 {showFilter
                ? 'bg-primary text-white border-primary shadow-soft-sm'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600'}"
              on:click={() => (showFilter = !showFilter)}
            >
              <Filter class="h-5 w-5" />
              {#if activeFilterCount > 0}
                <span
                  class="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center"
                  >{activeFilterCount}</span
                >
              {/if}
            </button>

            <!-- Floating Dropdown -->
            {#if showFilter}
              <!-- Backdrop -->
              <button
                type="button"
                class="fixed inset-0 z-10 cursor-default bg-transparent"
                on:click={() => (showFilter = false)}
                aria-label="Tutup filter"
              ></button>

              <div
                class="absolute right-0 top-[calc(100%+8px)] z-20 w-60 bg-white border border-slate-200/80 rounded-2xl shadow-lg overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-1 duration-150 origin-top-right"
              >
                <!-- Kategori -->
                <div class="px-3 pt-3 pb-2">
                  <p
                    class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5"
                  >
                    Kategori
                  </p>
                  <div class="flex flex-wrap gap-1">
                    <!-- Semua -->
                    <button
                      type="button"
                      on:click={() => (activeFilter = "all")}
                      class="px-2.5 py-1 text-[10px] font-bold rounded-full transition-all duration-150
                        {activeFilter === 'all'
                        ? 'bg-primary text-white'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}"
                      >Semua</button
                    >

                    {#if dynamicCategories.length > 0}
                      {#each dynamicCategories as cat}
                        <button
                          type="button"
                          on:click={() => (activeFilter = cat)}
                          class="px-2.5 py-1 text-[10px] font-bold rounded-full transition-all duration-150
                            {activeFilter === cat
                            ? 'bg-primary text-white'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}"
                          >{cat}</button
                        >
                      {/each}
                    {:else}
                      <span class="text-[10px] text-slate-400 italic"
                        >Belum ada kategori</span
                      >
                    {/if}
                  </div>
                </div>

                <!-- Reset -->
                {#if activeFilterCount > 0}
                  <div class="border-t border-slate-100 px-3 py-2">
                    <button
                      type="button"
                      on:click={() => {
                        activeFilter = "all";
                      }}
                      class="text-[10px] font-bold text-rose-400 hover:text-rose-600 transition-colors"
                      >✕ Reset filter</button
                    >
                  </div>
                {/if}
              </div>
            {/if}
          </div>
        </div>
      </div>

      <!-- Announcements List -->
      {#if filteredAnnouncements.length > 0}
        <div class="space-y-6">
          {#each filteredAnnouncements as post (post.id)}
            <Card
              class="hover:border-primary/25 transition-premium border-slate-200/80 overflow-hidden 
              {post.is_priority
                ? 'border-primary/45 bg-gradient-to-tr from-blue-50/15 via-white to-indigo-50/10 shadow-soft border-l-4 border-l-primary'
                : ''}"
            >
              <!-- Header -->
              <div
                slot="header"
                class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4"
              >
                <div class="flex flex-wrap items-center gap-2">
                  {#if post.is_priority}
                    <span
                      class="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-full bg-primary text-white shadow-soft-sm flex items-center gap-1 animate-pulse"
                    >
                      <span>📌 Prioritas</span>
                    </span>
                  {/if}
                  <span
                    class="px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full border {getCategoryStyles(
                      post.category,
                    )}"
                  >
                    {post.category}
                  </span>
                  <h2
                    class="font-extrabold text-slate-800 text-base sm:text-lg leading-snug"
                  >
                    {post.title}
                  </h2>
                </div>

                <div
                  class="flex items-center text-[10px] font-bold text-slate-400 space-x-3 mt-1 sm:mt-0 uppercase tracking-wider"
                >
                  <span class="flex items-center space-x-1">
                    <Calendar class="h-3.5 w-3.5" />
                    <span>{post.date}</span>
                  </span>
                  <button
                    type="button"
                    on:click={() => handleOpenProfile(post.author && post.author.toUpperCase() === 'ADMIN MAZEEDA' ? 'admin' : 'member', post.author)}
                    class="flex items-center space-x-1 hover:underline cursor-pointer text-left bg-transparent p-0 border-none outline-none font-inherit text-slate-400"
                  >
                    <User class="h-3.5 w-3.5 text-slate-400" />
                    <span>{post.author && post.author.toUpperCase() === 'ADMIN MAZEEDA' ? 'ADMIN MAZEEDA' : post.author}</span>
                  </button>
                </div>
              </div>

              <!-- Body -->
              <div class="py-4 space-y-3">
                {#each (post.content.length > 280 && !expandedAnnouncements[post.id] ? post.content.slice(0, 280) + '...' : post.content).split('\n') as paragraph}
                  {#if paragraph.trim()}
                    <p 
                      class="text-sm leading-relaxed font-normal text-justify
                        {isArabic(paragraph) 
                          ? 'font-arabic text-right text-slate-800 text-lg md:text-xl' 
                          : 'text-slate-600 text-left'}"
                      dir={isArabic(paragraph) ? 'rtl' : 'ltr'}
                      style="text-align: justify; text-align-last: {isArabic(paragraph) ? 'right' : 'left'};"
                    >
                      {paragraph}
                    </p>
                  {:else}
                    <div class="h-2.5"></div>
                  {/if}
                {/each}

                {#if post.content.length > 280}
                  <button
                    type="button"
                    on:click={() => toggleExpandAnnouncement(post.id)}
                    class="text-xs font-extrabold text-primary hover:text-primary-hover flex items-center gap-1.5 focus:outline-none mt-2 transition-colors duration-150"
                  >
                    {#if expandedAnnouncements[post.id]}
                      <span>Tampilkan Lebih Sedikit</span>
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd" /></svg>
                    {:else}
                      <span>Baca Selengkapnya</span>
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                    {/if}
                  </button>
                {/if}
              </div>

              <!-- Footer Buttons -->
              <div slot="footer" class="w-full border-t border-slate-50 pt-3">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <!-- Like Button -->
                    <button
                      on:click={() => handleLike(post)}
                      class="inline-flex items-center space-x-1.5 text-xs font-bold py-2 px-3.5 rounded-xl border transition-all duration-200
                        {post.hasLiked
                        ? 'bg-rose-50 text-rose-600 border-rose-100 shadow-soft-sm'
                        : 'bg-white text-slate-500 border-slate-200/60 hover:bg-slate-50 hover:border-slate-300'}"
                      style="min-height: 40px;"
                    >
                      <Heart
                        class="h-4.5 w-4.5 {post.hasLiked
                          ? 'fill-current text-rose-500'
                          : ''}"
                      />
                      <span>{post.likes}</span>
                    </button>

                    <!-- Comment Button (Instagram Style Bottom Drawer) -->
                    <button
                      on:click={() => { selectedAnnouncementForComments = post; newAnnouncementCommentText = ''; }}
                      class="inline-flex items-center space-x-1.5 text-xs font-bold py-2 px-3.5 rounded-xl border border-slate-200/60 bg-white text-slate-500 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
                      style="min-height: 40px;"
                      title="Lihat Tanggapan"
                    >
                      <MessageSquare class="h-4.5 w-4.5" />
                      <span>{post.comments.length}</span>
                    </button>
                  </div>

                  <span
                    class="text-[9px] font-black uppercase text-slate-300 tracking-widest hidden sm:inline"
                    >MAZEEDA OFFICIAL</span
                  >
                </div>
              </div>
            </Card>
          {/each}
        </div>
      {:else}
        <div
          class="py-16 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50"
        >
          <div class="max-w-xs mx-auto space-y-2">
            <p class="text-sm font-bold text-slate-600">
              Tidak ada pengumuman ditemukan
            </p>
            <p class="text-xs text-slate-400">
              Silakan gunakan kata kunci filter atau pencarian lainnya.
            </p>
          </div>
        </div>
      {/if}
    </div>
  {:else}
    <!-- ==================== BOARD 2: DINDING ASPIRASI (STICKY NOTES) ==================== -->
    <div class="space-y-6" in:fade={{ duration: 200 }}>
      <!-- Full-Width Virtual Corkboard display -->
      <div
        class="bg-amber-50/15 border border-slate-200/60 rounded-3xl p-6 min-h-[500px] relative overflow-hidden shadow-inner"
      >
        <!-- Background pattern grid lines for organic corkboard feel -->
        <div
          class="absolute inset-0 bg-[linear-gradient(to_right,#00000003_1px,transparent_1px),linear-gradient(to_bottom,#00000003_1px,transparent_1px)] bg-[size:24px_24px]"
        ></div>

        <div class="relative z-10">
          {#if isLoadingNotes}
            <div class="py-24 text-center space-y-3">
              <div
                class="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto"
              ></div>
              <p class="text-xs font-semibold text-slate-400">
                Mengambil catatan alumni...
              </p>
            </div>
          {:else if stickyNotes.length > 0}
            <!-- Grid of Sticky Notes -->
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {#each stickyNotes as note, index (note.id)}
                {@const colorObj = getNoteColor(note.color_theme)}
                <div
                  transition:fade
                  class="p-5 border rounded-2xl flex flex-col justify-between shadow-soft-sm relative transition-all duration-300 hover:scale-102 hover:shadow-soft-md min-h-[150px]
                    {colorObj.bg} {getRotation(index)} {colorObj.hover}"
                >
                  <!-- Decorative Top Tape/Pin effect to mimic sticky note -->
                  <div
                    class="absolute -top-2 left-1/2 -translate-x-1/2 h-4.5 w-14 rounded shadow-sm opacity-80 {colorObj.tape}"
                  ></div>

                  <!-- Note Content -->
                  <!-- svelte-ignore a11y-click-events-have-key-events -->
                  <!-- svelte-ignore a11y-no-static-element-interactions -->
                  <p
                    on:click={() => openNoteComments(note)}
                    dir={isArabic(note.message) ? "rtl" : "ltr"}
                    class="text-xs font-bold leading-relaxed tracking-tight py-1 break-words cursor-pointer hover:opacity-95 text-justify {isArabic(
                      note.message,
                    )
                      ? 'text-right font-arabic'
                      : 'text-left'}"
                    style="text-justify: inter-word;"
                  >
                    "{note.message.length > 180
                      ? note.message.substring(0, 180) + "..."
                      : note.message}"
                    {#if note.message.length > 180}
                      <span
                        class="text-[10px] text-primary hover:underline block mt-1 font-extrabold"
                        dir="ltr">Baca Selengkapnya &rarr;</span
                      >
                    {/if}
                  </p>

                  <!-- Sender Details & Actions -->
                  <div
                    class="flex items-center justify-between pt-2.5 border-t border-black/5 text-[9px] font-black uppercase tracking-wider opacity-85"
                  >
                    <button
                      type="button"
                      on:click={() => handleOpenProfile(note.sender_name && note.sender_name.toUpperCase() === 'ADMIN MAZEEDA' ? 'admin' : 'member', note.sender_name)}
                      class="truncate max-w-[95px] hover:underline cursor-pointer text-left bg-transparent p-0 border-none outline-none font-black text-slate-500 text-[9px] uppercase tracking-wider"
                      title={note.sender_name}
                    >
                      {note.sender_name}
                    </button>

                    <div class="flex items-center space-x-2 shrink-0">
                      <!-- Note Like -->
                      <button
                        on:click|stopPropagation={() => handleLikeNote(note)}
                        class="flex items-center space-x-0.5 hover:text-rose-600 transition-colors p-0.5"
                        title="Sukai Catatan"
                      >
                        <Heart
                          class="h-3 w-3 {likedNotesList.includes(note.id)
                            ? 'fill-current text-rose-500'
                            : ''}"
                        />
                        <span>{note.likes || 0}</span>
                      </button>

                      <!-- Note Comment -->
                      <button
                        on:click|stopPropagation={() => openNoteComments(note)}
                        class="flex items-center space-x-0.5 hover:text-primary transition-colors p-0.5"
                        title="Lihat Komentar"
                      >
                        <MessageSquare class="h-3 w-3" />
                        <span>{note.comments_count || 0}</span>
                      </button>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {:else}
            <div
              class="py-24 text-center max-w-xs mx-auto space-y-2 relative z-10"
            >
              <p class="text-sm font-bold text-slate-500">
                Dinding Aspirasi Kosong
              </p>
              <p class="text-xs text-slate-400">
                Jadilah yang pertama untuk menempelkan aspirasi sapaan atau
                kenangan Anda!
              </p>
            </div>
          {/if}
        </div>
      </div>
 
      <!-- Floating Action Button (FAB) to write a sticky note -->
      <button
        on:click={() => (showNoteCreatorModal = true)}
        class="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-40 h-14 w-14 rounded-full bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-600/95 text-white flex items-center justify-center shadow-lg hover:shadow-primary/30 hover:scale-110 active:scale-95 transition-all duration-300 group cursor-pointer"
        title="Tulis Aspirasi"
      >
        <Plus
          class="h-6 w-6 transition-transform duration-300 group-hover:rotate-90"
        />
      </button>
 
      {#if showNoteCreatorModal}
        <!-- MODAL FOR STICKY NOTE CREATION -->
        <div
          transition:fade
          class="fixed inset-0 z-[99999] flex items-end justify-center p-0 sm:items-center sm:p-4 bg-slate-900/60 backdrop-blur-sm"
        >
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div
            on:click|stopPropagation
            transition:slide
            class="bg-white rounded-t-3xl rounded-b-none sm:rounded-3xl w-full max-w-md overflow-hidden border border-slate-100 shadow-2xl flex flex-col max-h-[92vh]"
          >
            <!-- Modal Header -->
            <div
              class="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50"
            >
              <h3
                class="font-black text-slate-800 text-sm tracking-tight flex items-center gap-1.5"
              >
                <Pin class="h-4.5 w-4.5 text-primary" />
                <span>Tulis Aspirasi</span>
              </h3>
              <button
                on:click={() => (showNoteCreatorModal = false)}
                class="h-8 w-8 rounded-full border border-slate-200/60 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <!-- Modal Body (Form) -->
            <div class="p-6">
              <form on:submit|preventDefault={postStickyNote} class="space-y-4">
                <!-- Message Textarea -->
                <div class="space-y-1.5">
                  <div class="flex justify-between items-center">
                    <label
                      for="noteText"
                      class="text-xs font-bold text-slate-500">Isi Pesan</label
                    >
                    <span class="text-[10px] text-slate-400 font-bold"
                      >{newNoteText.length}/1000</span
                    >
                  </div>
                  <textarea
                    id="noteText"
                    rows="5"
                    class="flex w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary focus:outline-none transition-colors"
                    placeholder="Ketik pesan Anda di sini... (maksimal 1000 karakter)"
                    maxlength="1000"
                    bind:value={newNoteText}
                    required
                  ></textarea>
                </div>

                <!-- Color Picker pills -->
                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-slate-500"
                    >Pilih Warna Kertas</label
                  >
                  <div class="flex gap-2">
                    {#each colors as color}
                      <button
                        type="button"
                        on:click={() => (selectedColor = color.id)}
                        class="flex-1 h-9 rounded-xl border-2 flex items-center justify-center gap-1.5 text-[10px] font-bold transition-all duration-200
                          {selectedColor === color.id
                          ? 'border-primary bg-white shadow-soft-sm font-black scale-102'
                          : 'border-slate-200/60 bg-slate-50 text-slate-500 hover:bg-slate-100'}"
                      >
                        <span class="h-2 w-2 rounded-full {color.dot}"></span>
                        <span>{color.label}</span>
                      </button>
                    {/each}
                  </div>
                </div>

                <!-- Submit Button -->
                <Button
                  type="submit"
                  disabled={isPostingNote || !newNoteText.trim()}
                  class="w-full flex items-center justify-center space-x-2 mt-2"
                >
                  {#if isPostingNote}
                    <span>Menempelkan...</span>
                  {:else}
                    <Plus class="h-4.5 w-4.5" />
                    <span>Tempel Aspirasi</span>
                  {/if}
                </Button>
              </form>
            </div>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>

{#if selectedNoteForComments}
  <!-- MODAL FOR STICKY NOTE COMMENTS -->
  <div
    transition:fade
    class="fixed inset-0 z-[99999] flex items-end justify-center p-0 sm:items-center sm:p-4 bg-slate-900/60 backdrop-blur-sm"
  >
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
      on:click|stopPropagation
      transition:slide
      class="bg-white rounded-t-3xl rounded-b-none sm:rounded-3xl w-full max-w-lg overflow-hidden border border-slate-100 shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[85vh]"
    >
      <!-- Modal Header -->
      <div
        class="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50"
      >
        <h3
          class="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"
        >
          <Pin class="h-4 w-4 text-primary" />
          <span>Detail & Diskusi Aspirasi</span>
        </h3>
        <button
          on:click={() => (selectedNoteForComments = null)}
          class="h-8 w-8 rounded-full border border-slate-200/60 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors text-sm font-bold cursor-pointer"
        >
          ✕
        </button>
      </div>

      <!-- Scrollable Content -->
      <div class="px-2 py-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/20">
        <!-- Sticky Note Magnified -->
        <div
          class="px-4 py-6 border rounded-2xl shadow-soft relative {selectedNoteColor?.bg} min-h-[120px] flex flex-col justify-between"
        >
          <div
            class="absolute -top-2 left-1/2 -translate-x-1/2 h-4.5 w-16 rounded shadow-sm opacity-80 {selectedNoteColor?.tape}"
          ></div>
          <p
            dir={isArabic(selectedNoteForComments.message) ? "rtl" : "ltr"}
            class="text-sm font-bold leading-relaxed tracking-tight py-2 break-words text-justify {isArabic(
              selectedNoteForComments.message,
            )
              ? 'text-right font-arabic'
              : 'text-left'}"
            style="text-align: justify; text-align-last: {isArabic(selectedNoteForComments.message) ? 'right' : 'left'}; text-justify: inter-word;"
          >
            "{selectedNoteForComments.message}"
          </p>
          <div
            class="text-[9px] font-black uppercase text-black/40 tracking-wider pt-2 border-t border-black/5 flex justify-between"
            dir="ltr"
          >
            <span class="flex items-center gap-1">
              Oleh: 
              <button
                type="button"
                on:click={() => handleOpenProfile(selectedNoteForComments.sender_name && selectedNoteForComments.sender_name.toUpperCase() === 'ADMIN MAZEEDA' ? 'admin' : 'member', selectedNoteForComments.sender_name)}
                class="hover:underline cursor-pointer text-left bg-transparent p-0 border-none outline-none font-black text-black/40 text-[9px] uppercase tracking-wider"
              >
                {selectedNoteForComments.sender_name}
              </button>
            </span>
            <span
              >{selectedNoteForComments.created_at
                ? new Date(
                    selectedNoteForComments.created_at,
                  ).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                  })
                : "Baru"}</span
            >
          </div>
        </div>

        <!-- Comments Feed -->
        <div class="space-y-4">
          <h4
            class="text-xs font-black text-slate-400 uppercase tracking-widest"
          >
            Komentar
          </h4>

          {#if sortedNoteCommentsList.length > 0}
            <div class="space-y-2.5">
              {#each sortedNoteCommentsList as comment}
                {@const avatarUrl = convertDriveUrl(authorAvatarMap[comment.author] || '')}
                {@const isAdminComment = comment.author && (comment.author.toUpperCase() === (adminName || 'ADMIN MAZEEDA').toUpperCase() || comment.author.toUpperCase() === 'ADMIN MAZEEDA' || comment.author.toUpperCase() === 'ADMIN')}
                {@const isEditing = editingNoteCommentId == comment.id}
                <div class="bg-white border rounded-2xl p-3.5 shadow-soft-sm transition-all {comment.parent_id ? 'ml-8 border-l-4 border-l-indigo-300' : ''}
                  {isAdminComment ? 'border-indigo-100' : 'border-slate-100'}
                  {isAdmin || comment.author === $authStore.user?.name ? 'group/nc' : ''}">
                  <div class="flex items-start gap-3">
                    <!-- Avatar -->
                    <button
                      type="button"
                      on:click={() => handleOpenProfile(isAdminComment ? 'admin' : 'member', comment.author)}
                      class="shrink-0 h-8 w-8 rounded-full overflow-hidden flex items-center justify-center text-[10px] font-black shadow-soft-xs cursor-pointer hover:scale-105 transition-transform
                      {isAdminComment ? 'bg-gradient-to-br from-primary to-indigo-600 text-white' : 'bg-blue-50 border border-blue-100 text-primary'}"
                    >
                      {#if avatarUrl}
                        <img referrerpolicy="no-referrer" src={avatarUrl} alt={comment.author} class="h-full w-full object-cover"
                          on:error={(e) => { e.currentTarget.style.display = 'none'; }} />
                      {:else}
                        {getInitials(comment.author)}
                      {/if}
                    </button>
                    <!-- Content -->
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center justify-between gap-2 mb-1">
                        <div class="flex items-center gap-1 min-w-0">
                          <button
                            type="button"
                            on:click={() => handleOpenProfile(isAdminComment ? 'admin' : 'member', comment.author)}
                            class="text-[10px] font-black truncate hover:underline text-left cursor-pointer bg-transparent p-0 border-none outline-none
                            {isAdminComment ? 'text-indigo-600' : 'text-primary'}"
                          >
                            {isAdminComment ? (adminName || 'ADMIN MAZEEDA') : comment.author}
                          </button>
                          {#if isAdminComment}<span class="ml-0.5 px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[8px] font-black border border-indigo-100">ADMIN</span>{/if}
                        </div>
                        <div class="flex items-center gap-1 shrink-0">
                          <span class="text-[9px] text-slate-400 font-bold">{new Date(comment.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                          <!-- Actions -->
                          <button type="button" on:click|preventDefault|stopPropagation={() => { replyingToNoteCommentId = comment.id; replyingToNoteCommentAuthor = comment.author; }}
                            class="text-[9px] font-bold text-slate-400 hover:text-indigo-600 transition-colors ml-2 cursor-pointer">
                            Balas
                          </button>
                          {#if isAdmin || comment.author === $authStore.user?.name}
                            <button type="button" on:click|preventDefault|stopPropagation={() => { editingNoteCommentId = comment.id; editingNoteCommentText = comment.text; }}
                              class="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer"
                              title="Edit komentar">
                              <Pencil class="h-3.5 w-3.5" />
                            </button>
                            <button type="button" on:click|preventDefault|stopPropagation={() => deleteNoteComment(comment.id)}
                              class="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                              title="Hapus komentar">
                              <Trash2 class="h-3.5 w-3.5" />
                            </button>
                          {/if}
                        </div>
                      </div>
                      <!-- Text or Edit Input -->
                      {#if isEditing}
                        <div class="flex gap-2 items-center mt-1">
                          <input
                            type="text"
                            class="flex-1 h-8 text-xs border border-indigo-200 rounded-xl px-2.5 bg-indigo-50/40 text-slate-700 outline-none focus:border-indigo-400"
                            bind:value={editingNoteCommentText}
                            on:keydown={(e) => { if (e.key === 'Enter') saveEditNoteComment(); if (e.key === 'Escape') { editingNoteCommentId = null; } }}
                            autofocus
                          />
                          <button on:click={saveEditNoteComment}
                            class="h-8 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black rounded-xl transition-colors">
                            Simpan
                          </button>
                          <button on:click={() => { editingNoteCommentId = null; }}
                            class="h-8 w-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl transition-colors">
                            <XIcon class="h-3.5 w-3.5" />
                          </button>
                        </div>
                      {:else}
                        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <p class="text-xs font-medium text-slate-600 leading-relaxed" on:click={handleDelegatedMentionClick}>{@html formatMentions(comment.text)}</p>
                      {/if}
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {:else}
            <div
              class="text-center py-6 text-slate-400 italic text-xs border border-dashed border-slate-200 rounded-2xl bg-white"
            >
              Belum ada komentar. Jadilah yang pertama memberikan masukan!
            </div>
          {/if}
        </div>
      </div>

      <!-- Modal Footer: Comment Form (Sticky Note) -->
      <div class="p-4 border-t border-slate-100 bg-white">
        {#if replyingToNoteCommentId}
          <div class="flex items-center justify-between bg-indigo-50/50 px-3 py-2 rounded-t-xl border border-indigo-100 border-b-0 -mb-2 relative z-0">
            <span class="text-[10px] font-bold text-indigo-700">Membalas @{replyingToNoteCommentAuthor}</span>
            <button on:click={() => { replyingToNoteCommentId = null; replyingToNoteCommentAuthor = ''; }} class="text-indigo-400 hover:text-rose-500 cursor-pointer">
              <XIcon class="h-3.5 w-3.5" />
            </button>
          </div>
        {/if}
        <form
          on:submit|preventDefault={handleAddNoteComment}
          class="flex gap-2 items-center relative z-10 bg-white {replyingToNoteCommentId ? 'pt-2' : ''}"
        >
          <!-- Current user avatar -->
          {#if $authStore.user}
            {@const myAvatarUrl = $authStore.user.role === 'admin' ? convertDriveUrl($authStore.user.foto_url || 'https://drive.google.com/file/d/1f332yzKnUHuix7YeAvCgMZm4y2v30CwF/view?usp=drive_link') : convertDriveUrl($authStore.user.foto_url || '')}
            <div class="shrink-0 h-8 w-8 rounded-full overflow-hidden flex items-center justify-center text-[10px] font-black
              {$authStore.user.role === 'admin' ? 'bg-gradient-to-br from-primary to-indigo-600 text-white' : 'bg-blue-50 border border-blue-100 text-primary'}">
              {#if myAvatarUrl}
                <img referrerpolicy="no-referrer" src={myAvatarUrl} alt="Saya" class="h-full w-full object-cover" on:error={(e) => { e.currentTarget.style.display='none'; }} />
              {:else}
                {getInitials($authStore.user.name)}
              {/if}
            </div>
          {/if}
          <div class="flex-1 relative">
            {#if showMentionDropdown && activeMentionInput === 'note' && filteredUsers.length > 0}
              <div class="absolute bottom-full left-0 mb-2 w-full max-h-48 overflow-y-auto bg-white border border-slate-200 shadow-xl rounded-xl z-[1000] py-1">
                {#each filteredUsers as user}
                  <button 
                    type="button" 
                    class="flex w-full items-center gap-2 px-3 py-2 hover:bg-indigo-50 border-b border-slate-100 last:border-b-0 transition-colors cursor-pointer"
                    on:click={() => insertMention(user.name)}
                  >
                    <img src={convertDriveUrl(user.avatar)} alt={user.name} class="w-6 h-6 rounded-full object-cover shrink-0" on:error={(e) => { e.currentTarget.style.display='none'; }} />
                    <span class="text-[11px] font-bold text-slate-700 truncate">{user.name}</span>
                  </button>
                {/each}
              </div>
            {/if}
            <input
              type="text"
              placeholder={replyingToNoteCommentId ? `Balas komentar...` : "Tulis komentar Anda..."}
              class="w-full h-10 border border-slate-200 text-xs px-3 bg-slate-50/50 hover:bg-slate-50 focus:bg-white rounded-xl outline-none focus:border-primary"
              bind:value={newNoteCommentText}
              bind:this={noteInputElement}
              on:input={(e) => handleCommentInput(e, 'note')}
              required
            />
          </div>
          <button
            type="submit"
            class="h-10 w-10 shrink-0 bg-primary hover:bg-primary/95 text-white flex items-center justify-center rounded-xl shadow-soft-sm transition-transform active:scale-95 cursor-pointer"
          >
            <Send class="h-4.5 w-4.5" />
          </button>
        </form>
      </div>
    </div>
  </div>
{/if}

{#if selectedAnnouncementForComments}
  <div
    transition:fade
    class="fixed inset-0 z-[99999] flex items-end justify-center p-0 sm:items-center sm:p-4 bg-slate-900/60 backdrop-blur-sm"
  >
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
      on:click|stopPropagation
      transition:slide
      class="bg-white rounded-t-3xl rounded-b-none sm:rounded-3xl w-full max-w-lg overflow-hidden border border-slate-100 shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[85vh]"
    >
      <!-- Modal Header -->
      <div
        class="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50"
      >
        <h3
          class="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"
        >
          <Megaphone class="h-4 w-4 text-primary" />
          <span>Detail & Diskusi Pengumuman</span>
        </h3>
        <button
          on:click={() => (selectedAnnouncementForComments = null)}
          class="h-8 w-8 rounded-full border border-slate-200/60 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors text-sm font-bold cursor-pointer"
        >
          ✕
        </button>
      </div>

      <!-- Scrollable Content -->
      <div class="px-2 py-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/20">
        <!-- Announcement Card Magnified -->
        <div class="px-5 py-6 bg-white border border-slate-200/80 rounded-2xl shadow-soft space-y-4">
          <div class="flex flex-wrap items-center gap-2">
            <span class="px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full border {getCategoryStyles(selectedAnnouncementForComments.category)}">
              {selectedAnnouncementForComments.category}
            </span>
            <h2 class="font-extrabold text-slate-800 text-base sm:text-lg leading-snug">
              {selectedAnnouncementForComments.title}
            </h2>
          </div>
          <div class="space-y-3">
            {#each selectedAnnouncementForComments.content.split('\n') as paragraph}
              {#if paragraph.trim()}
                <p 
                  class="text-sm leading-relaxed font-normal text-justify
                    {isArabic(paragraph) 
                      ? 'font-arabic text-right text-slate-800 text-lg md:text-xl' 
                      : 'text-slate-600 text-left'}"
                  dir={isArabic(paragraph) ? 'rtl' : 'ltr'}
                  style="text-align: justify; text-align-last: {isArabic(paragraph) ? 'right' : 'left'};"
                >
                  {paragraph}
                </p>
              {:else}
                <div class="h-2.5"></div>
              {/if}
            {/each}
          </div>
          <div class="text-[9px] font-black uppercase text-slate-400 tracking-wider pt-3 border-t border-slate-100 flex justify-between" dir="ltr">
            <span class="flex items-center gap-1">
              Oleh: 
              <button
                type="button"
                on:click={() => handleOpenProfile(selectedAnnouncementForComments.author && selectedAnnouncementForComments.author.toUpperCase() === 'ADMIN MAZEEDA' ? 'admin' : 'member', selectedAnnouncementForComments.author)}
                class="hover:underline cursor-pointer text-left bg-transparent p-0 border-none outline-none font-black text-slate-400 text-[9px] uppercase tracking-wider"
              >
                {selectedAnnouncementForComments.author && selectedAnnouncementForComments.author.toUpperCase() === 'ADMIN MAZEEDA' ? 'ADMIN MAZEEDA' : selectedAnnouncementForComments.author}
              </button>
            </span>
            <span>{selectedAnnouncementForComments.date}</span>
          </div>
        </div>

        <!-- Comments List -->
        <div class="space-y-4">
          <h4 class="text-xs font-black text-slate-400 uppercase tracking-widest">
            Tanggapan & Diskusi ({selectedAnnouncementForComments.comments.length})
          </h4>

          {#if sortedAnnouncementComments.length > 0}
            <div class="space-y-2.5">
              {#each sortedAnnouncementComments as comment}
                {@const avatarUrl = convertDriveUrl(authorAvatarMap[comment.author] || '')}
                {@const isAdminComment = comment.author && (comment.author.toUpperCase() === (adminName || 'ADMIN MAZEEDA').toUpperCase() || comment.author.toUpperCase() === 'ADMIN MAZEEDA' || comment.author.toUpperCase() === 'ADMIN')}
                {@const isEditing = editingAnnouncementCommentId == comment.id}
                <div class="bg-white border rounded-2xl p-3.5 shadow-soft-sm transition-all {comment.parent_id ? 'ml-8 border-l-4 border-l-indigo-300' : ''}
                  {isAdminComment ? 'border-indigo-100' : 'border-slate-100'}
                  {isAdmin || comment.author === $authStore.user?.name ? 'group/ac' : ''}">
                  <div class="flex items-start gap-3">
                    <!-- Avatar -->
                    <button
                      type="button"
                      on:click={() => handleOpenProfile(isAdminComment ? 'admin' : 'member', comment.author)}
                      class="shrink-0 h-8 w-8 rounded-full overflow-hidden flex items-center justify-center text-[10px] font-black shadow-soft-xs cursor-pointer hover:scale-105 transition-transform
                      {isAdminComment ? 'bg-gradient-to-br from-primary to-indigo-600 text-white' : 'bg-blue-50 border border-blue-100 text-primary'}"
                    >
                      {#if avatarUrl}
                        <img referrerpolicy="no-referrer" src={avatarUrl} alt={comment.author} class="h-full w-full object-cover"
                          on:error={(e) => { e.currentTarget.style.display = 'none'; }} />
                      {:else}
                        {getInitials(comment.author)}
                      {/if}
                    </button>
                    <!-- Content -->
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center justify-between gap-2 mb-1">
                        <div class="flex items-center gap-1 min-w-0">
                          <button
                            type="button"
                            on:click={() => handleOpenProfile(isAdminComment ? 'admin' : 'member', comment.author)}
                            class="text-[10px] font-black truncate hover:underline text-left cursor-pointer bg-transparent p-0 border-none outline-none
                            {isAdminComment ? 'text-indigo-600' : 'text-primary'}"
                          >
                            {isAdminComment ? (adminName || 'ADMIN MAZEEDA') : comment.author}
                          </button>
                          {#if isAdminComment}<span class="ml-0.5 px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[8px] font-black border border-indigo-100">ADMIN</span>{/if}
                        </div>
                        <div class="flex items-center gap-1 shrink-0">
                          <span class="text-[9px] text-slate-400 font-bold">{comment.date}</span>
                          <!-- Actions -->
                          <button type="button" on:click|preventDefault|stopPropagation={() => { replyingToAnnouncementCommentId = comment.id; replyingToAnnouncementCommentAuthor = comment.author; }}
                            class="text-[9px] font-bold text-slate-400 hover:text-indigo-600 transition-colors ml-2 cursor-pointer">
                            Balas
                          </button>
                          {#if isAdmin || comment.author === $authStore.user?.name}
                            <button type="button" on:click|preventDefault|stopPropagation={() => { editingAnnouncementCommentId = comment.id; editingAnnouncementCommentText = comment.text; }}
                              class="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer"
                              title="Edit komentar">
                              <Pencil class="h-3.5 w-3.5" />
                            </button>
                            <button type="button" on:click|preventDefault|stopPropagation={() => deleteAnnouncementComment(comment.id)}
                              class="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                              title="Hapus komentar">
                              <Trash2 class="h-3.5 w-3.5" />
                            </button>
                          {/if}
                        </div>
                      </div>
                      <!-- Text or Edit Input -->
                      {#if isEditing}
                        <div class="flex gap-2 items-center mt-1">
                          <input
                            type="text"
                            class="flex-1 h-8 text-xs border border-indigo-200 rounded-xl px-2.5 bg-indigo-50/40 text-slate-700 outline-none focus:border-indigo-400"
                            bind:value={editingAnnouncementCommentText}
                            on:keydown={(e) => { if (e.key === 'Enter') saveEditAnnouncementComment(); if (e.key === 'Escape') { editingAnnouncementCommentId = null; } }}
                            autofocus
                          />
                          <button on:click={saveEditAnnouncementComment}
                            class="h-8 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black rounded-xl transition-colors">
                            Simpan
                          </button>
                          <button on:click={() => { editingAnnouncementCommentId = null; }}
                            class="h-8 w-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl transition-colors">
                            <XIcon class="h-3.5 w-3.5" />
                          </button>
                        </div>
                      {:else}
                        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <p class="text-xs font-medium text-slate-600 leading-relaxed" on:click={handleDelegatedMentionClick}>{@html formatMentions(comment.text)}</p>
                      {/if}
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {:else}
            <div class="text-center py-6 text-slate-400 italic text-xs border border-dashed border-slate-200 rounded-2xl bg-white">
              Belum ada tanggapan. Jadilah yang pertama menanggapi!
            </div>
          {/if}
        </div>
      </div>

      <!-- Modal Footer: Add Comment Form (Announcement) -->
      <div class="p-4 border-t border-slate-100 bg-white">
        {#if replyingToAnnouncementCommentId}
          <div class="flex items-center justify-between bg-indigo-50/50 px-3 py-2 rounded-t-xl border border-indigo-100 border-b-0 -mb-2 relative z-0">
            <span class="text-[10px] font-bold text-indigo-700">Membalas @{replyingToAnnouncementCommentAuthor}</span>
            <button on:click={() => { replyingToAnnouncementCommentId = null; replyingToAnnouncementCommentAuthor = ''; }} class="text-indigo-400 hover:text-rose-500 cursor-pointer">
              <XIcon class="h-3.5 w-3.5" />
            </button>
          </div>
        {/if}
        <form
          on:submit|preventDefault={handleAddAnnouncementComment}
          class="flex gap-2 items-center relative z-10 bg-white {replyingToAnnouncementCommentId ? 'pt-2' : ''}"
        >
          <!-- Current user avatar -->
          {#if $authStore.user}
            {@const myAvatarUrl = $authStore.user.role === 'admin' ? convertDriveUrl($authStore.user.foto_url || 'https://drive.google.com/file/d/1f332yzKnUHuix7YeAvCgMZm4y2v30CwF/view?usp=drive_link') : convertDriveUrl($authStore.user.foto_url || '')}
            <div class="shrink-0 h-8 w-8 rounded-full overflow-hidden flex items-center justify-center text-[10px] font-black
              {$authStore.user.role === 'admin' ? 'bg-gradient-to-br from-primary to-indigo-600 text-white' : 'bg-blue-50 border border-blue-100 text-primary'}">
              {#if myAvatarUrl}
                <img referrerpolicy="no-referrer" src={myAvatarUrl} alt="Saya" class="h-full w-full object-cover" on:error={(e) => { e.currentTarget.style.display='none'; }} />
              {:else}
                {getInitials($authStore.user.name)}
              {/if}
            </div>
          {/if}
          <div class="flex-1 relative">
            {#if showMentionDropdown && activeMentionInput === 'announcement' && filteredUsers.length > 0}
              <div class="absolute bottom-full left-0 mb-2 w-full max-h-48 overflow-y-auto bg-white border border-slate-200 shadow-xl rounded-xl z-[1000] py-1">
                {#each filteredUsers as user}
                  <button 
                    type="button" 
                    class="flex w-full items-center gap-2 px-3 py-2 hover:bg-indigo-50 border-b border-slate-100 last:border-b-0 transition-colors cursor-pointer"
                    on:click={() => insertMention(user.name)}
                  >
                    <img src={convertDriveUrl(user.avatar)} alt={user.name} class="w-6 h-6 rounded-full object-cover shrink-0" on:error={(e) => { e.currentTarget.style.display='none'; }} />
                    <span class="text-[11px] font-bold text-slate-700 truncate">{user.name}</span>
                  </button>
                {/each}
              </div>
            {/if}
            <input
              type="text"
              placeholder={replyingToAnnouncementCommentId ? `Balas komentar...` : "Tulis tanggapan Anda..."}
              class="w-full h-10 border border-slate-200 text-xs px-3 bg-slate-50/50 hover:bg-slate-50 focus:bg-white rounded-xl outline-none focus:border-primary"
              bind:value={newAnnouncementCommentText}
              bind:this={announcementInputElement}
              on:input={(e) => handleCommentInput(e, 'announcement')}
              required
            />
          </div>
          <button
            type="submit"
            class="h-10 w-10 shrink-0 bg-primary hover:bg-primary/95 text-white flex items-center justify-center rounded-xl shadow-soft-sm transition-transform active:scale-95 cursor-pointer"
          >
            <Send class="h-4.5 w-4.5" />
          </button>
        </form>
      </div>
    </div>
  </div>
{/if}

<!-- ==================== CONFIRMATION MODAL ==================== -->
{#if showConfirmModal}
  <div class="fixed inset-0 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" style="z-index: 9999;">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
      <div class="p-5 border-b border-slate-100 flex items-center gap-3">
        <div class="h-10 w-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
          <AlertCircle class="h-5 w-5 text-rose-500" />
        </div>
        <div>
          <h3 class="text-sm font-bold text-slate-800">{confirmConfig.title}</h3>
          <p class="text-xs text-slate-500 mt-0.5 leading-relaxed">{confirmConfig.message}</p>
        </div>
      </div>
      <div class="p-4 bg-slate-50/50 flex gap-3">
        <button type="button" class="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold h-10 transition-colors" on:click={() => showConfirmModal = false}>
          Batal
        </button>
        <button type="button" class="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold h-10 shadow-soft-sm transition-colors" on:click={confirmConfig.onConfirm}>
          Ya, Hapus
        </button>
      </div>
    </div>
  </div>
{/if}
