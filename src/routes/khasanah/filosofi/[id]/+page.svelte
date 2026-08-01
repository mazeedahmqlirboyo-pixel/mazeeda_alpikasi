<script lang="ts">
  import { ChevronLeft } from "lucide-svelte";
  import PageHeader from "$lib/components/ui/PageHeader.svelte";
  
  export let data: any;
  $: logo = data.filosofi;
</script>

<div class="min-h-screen bg-slate-50 pb-24">
  <PageHeader noMargin={true} title={logo.title} backTo="/khasanah/filosofi" variant="small" />

  <main class="max-w-2xl mx-auto px-4 py-8">
    <div class="flex flex-col items-center text-center mb-10">
      <!-- Animated Logo Display -->
      <div class="relative w-48 h-48 mb-6 animate-fade-in-up">
        <div class="absolute inset-0 bg-teal-100 rounded-full blur-3xl opacity-50"></div>
        <img src={logo.image_url} alt={logo.title} class="relative z-10 w-full h-full object-contain filter drop-shadow-xl hover:scale-105 transition-transform duration-500" />
      </div>
      <h2 class="text-3xl font-black text-slate-900 mb-3">{logo.title}</h2>
      <p class="text-slate-500 text-sm max-w-md leading-relaxed">{logo.description}</p>
    </div>

    <div class="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 prose prose-slate max-w-none">
      <!-- Render the HTML content from Supabase -->
      {@html logo.content}
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
