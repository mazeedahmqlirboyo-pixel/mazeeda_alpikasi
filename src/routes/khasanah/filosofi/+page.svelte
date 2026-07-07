<script lang="ts">
  import { ChevronLeft } from "lucide-svelte";
  import { khasanahData } from "$lib/dataKhasanah";
  
  const data = khasanahData.filosofi;
</script>

<div class="min-h-screen bg-slate-50 pb-24">
  <header class="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
    <div class="px-4 h-16 flex items-center max-w-2xl mx-auto">
      <a href="/khasanah" class="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors">
        <ChevronLeft class="h-6 w-6 text-slate-700" />
      </a>
      <h1 class="font-bold text-lg text-slate-900 tracking-tight ml-2">Filosofi Logo</h1>
    </div>
  </header>

  <main class="max-w-2xl mx-auto px-4 py-8">
    <div class="flex flex-col items-center text-center mb-10">
      <!-- Animated Logo Display -->
      <div class="relative w-48 h-48 mb-6 animate-fade-in-up">
        <div class="absolute inset-0 bg-teal-100 rounded-full blur-3xl opacity-50"></div>
        <img src={data.image} alt="Logo Lirboyo" class="relative z-10 w-full h-full object-contain filter drop-shadow-xl hover:scale-105 transition-transform duration-500" />
      </div>
      <h2 class="text-3xl font-black text-slate-900 mb-3">{data.title}</h2>
      <p class="text-slate-500 text-sm max-w-md leading-relaxed">{data.description}</p>
    </div>

    <div class="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 prose prose-slate max-w-none">
      <!-- We render the HTML directly for the dynamic structure -->
      {@html data.content}
    </div>
  </main>
</div>

<style>
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in-up {
    animation: fadeInUp 0.8s ease-out forwards;
  }
</style>
