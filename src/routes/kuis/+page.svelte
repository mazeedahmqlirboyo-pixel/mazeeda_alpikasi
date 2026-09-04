<script lang="ts">
  import { fade, fly, scale } from "svelte/transition";
  import Button from "$lib/components/ui/button.svelte";
  import PageHeader from "$lib/components/ui/PageHeader.svelte";
  import { quizData, type QuizQuestion } from "$lib/data/quizQuestions";
  import {
    Brain,
    CheckCircle2,
    XCircle,
    PartyPopper,
    Award,
    Medal,
    Trophy,
    Crown,
    ArrowLeft,
    BookOpen
  } from "lucide-svelte";
  
  let selectedGrade: 'ula' | 'wustha' | 'ulya' | null = null;
  let activeQuestions: QuizQuestion[] = [];
  
  let currentQuestionIndex = 0;
  let isQuizFinished = false;
  let userAnswers: number[] = [];

  $: quizScore = userAnswers.reduce((total, ans, idx) => {
    return total + (ans === activeQuestions[idx]?.correct ? 20 : 0);
  }, 0);
  
  function startQuiz() {
    selectedGrade = null;
    activeQuestions = [];
    currentQuestionIndex = 0;
    isQuizFinished = false;
    selectedAnswer = null;
    isAnswerChecked = false;
  }

  function startGame(grade: 'ula' | 'wustha' | 'ulya' | 'hmq') {
    selectedGrade = grade;
    const allQuestions = [...quizData[grade]];
    
    for (let i = allQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
    }
    
    activeQuestions = allQuestions.slice(0, 25);
    currentQuestionIndex = 0;
    isQuizFinished = false;
    userAnswers = [];
  }

  function checkAnswer(index: number) {
    userAnswers[currentQuestionIndex] = index;
  }

  function nextQuestion() {
    if (currentQuestionIndex < activeQuestions.length - 1) {
      currentQuestionIndex++;
    } else {
      isQuizFinished = true;
    }
  }

  function getPredikat(score: number) {
    if (score === 100) return "Mumtaz! Luar Biasa";
    if (score >= 80) return "Jayyid Jiddan! Hebat";
    if (score >= 60) return "Jayyid! Cukup Baik";
    if (score >= 40) return "Mutawassith! Semangat Terus";
    return "Teruslah Belajar & Mengaji!";
  }
</script>

<svelte:head>
  <title>Kuis Cerdas Cermat Islami - MAZEEDA</title>
</svelte:head>

<div class="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24" in:fade={{ duration: 200 }}>
  <PageHeader title="Kuis Cerdas Cermat" backTo="/" />

  <div class="p-4 sm:p-6 flex justify-center mt-4">
    <div class="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-xl overflow-hidden relative flex flex-col min-h-[70vh] sm:min-h-[60vh]">
      


      <!-- Main Content -->
    <div class="p-6 sm:p-8 overflow-y-auto flex-1">
      {#if !selectedGrade}
        <!-- Grade Selection Screen -->
        <div class="text-center space-y-8 py-4" in:fly={{ y: 20, duration: 400 }}>
          <div class="space-y-2">
            <h2 class="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100">Pilih Tingkat Kesulitan</h2>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <!-- Grade Ula -->
            <button 
              on:click={() => startGame('ula')}
              class="flex flex-row sm:flex-col items-center p-4 sm:p-6 text-left sm:text-center bg-white dark:bg-slate-900 border-2 border-blue-100 hover:border-blue-400 dark:border-blue-500/30 dark:hover:border-blue-500 rounded-2xl hover:shadow-xl transition-all duration-300 group gap-4 sm:gap-0"
            >
              <div class="w-12 h-12 sm:w-16 sm:h-16 shrink-0 bg-blue-200 dark:bg-blue-500/20 rounded-full p-3 sm:p-4 flex items-center justify-center sm:mb-4 group-hover:scale-110 transition-transform">
                <img src="/images/grade ula.png?v=2" alt="Grade Ula" class="w-full h-full object-contain drop-shadow-sm dark:shadow-none opacity-90 dark:invert" />
              </div>
              <div>
                <h3 class="font-black text-base sm:text-lg text-slate-800 dark:text-slate-100">Grade Ula</h3>
                <p class="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-0.5 sm:mt-2">Dasar Sejarah, Fiqih, & Tauhid</p>
              </div>
            </button>

            <!-- Grade Wustha -->
            <button 
              on:click={() => startGame('wustha')}
              class="flex flex-row sm:flex-col items-center p-4 sm:p-6 text-left sm:text-center bg-white dark:bg-slate-900 border-2 border-blue-100 hover:border-blue-400 dark:border-blue-500/30 dark:hover:border-blue-500 rounded-2xl hover:shadow-xl transition-all duration-300 group gap-4 sm:gap-0"
            >
              <div class="w-12 h-12 sm:w-16 sm:h-16 shrink-0 bg-blue-200 dark:bg-blue-500/20 rounded-full p-3 sm:p-4 flex items-center justify-center sm:mb-4 group-hover:scale-110 transition-transform">
                <img src="/images/grade wustha.png?v=2" alt="Grade Wustha" class="w-full h-full object-contain drop-shadow-sm dark:shadow-none opacity-90 dark:invert" />
              </div>
              <div>
                <h3 class="font-black text-base sm:text-lg text-slate-800 dark:text-slate-100">Grade Wustha</h3>
                <p class="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-0.5 sm:mt-2">Fiqih Menengah & Shorof</p>
              </div>
            </button>

            <!-- Grade Ulya -->
            <button 
              on:click={() => startGame('ulya')}
              class="flex flex-row sm:flex-col items-center p-4 sm:p-6 text-left sm:text-center bg-white dark:bg-slate-900 border-2 border-blue-100 hover:border-blue-400 dark:border-blue-500/30 dark:hover:border-blue-500 rounded-2xl hover:shadow-xl transition-all duration-300 group gap-4 sm:gap-0"
            >
              <div class="w-12 h-12 sm:w-16 sm:h-16 shrink-0 bg-blue-200 dark:bg-blue-500/20 rounded-full p-3 sm:p-4 flex items-center justify-center sm:mb-4 group-hover:scale-110 transition-transform">
                <img src="/images/grade ulya.png?v=2" alt="Grade Ulya" class="w-full h-full object-contain drop-shadow-sm dark:shadow-none opacity-90 dark:invert" />
              </div>
              <div>
                <h3 class="font-black text-base sm:text-lg text-slate-800 dark:text-slate-100">Grade Ulya</h3>
                <p class="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-0.5 sm:mt-2">Ushul Fiqih, Alfiyah & Lanjutan</p>
              </div>
            </button>

            <!-- Grade HMQ / MAZEEDA -->
            <button 
              on:click={() => startGame('hmq')}
              class="flex flex-row sm:flex-col items-center p-4 sm:p-6 text-left sm:text-center bg-white dark:bg-slate-900 border-2 border-blue-100 hover:border-blue-400 dark:border-blue-500/30 dark:hover:border-blue-500 rounded-2xl hover:shadow-xl transition-all duration-300 group gap-4 sm:gap-0"
            >
              <div class="w-12 h-12 sm:w-16 sm:h-16 shrink-0 bg-blue-200 dark:bg-blue-500/20 rounded-full p-3 sm:p-4 flex items-center justify-center sm:mb-4 group-hover:scale-110 transition-transform">
                <img src="/images/grade hmq.png?v=2" alt="Grade HMQ" class="w-full h-full object-contain drop-shadow-sm dark:shadow-none opacity-90 dark:invert" />
              </div>
              <div>
                <h3 class="font-black text-base sm:text-lg text-slate-800 dark:text-slate-100">Grade HMQ</h3>
                <p class="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-0.5 sm:mt-2">Sejarah HMQ & MAZEEDA</p>
              </div>
            </button>
          </div>
        </div>

      {:else if !isQuizFinished}
        <!-- Progress Bar -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <button on:click={() => { selectedGrade = null; }} class="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 rounded-full transition-colors" title="Kembali ke Pilihan Grade">
              <ArrowLeft class="w-4 h-4" />
            </button>
            <span class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Pertanyaan {currentQuestionIndex + 1} / {activeQuestions.length}
            </span>
          </div>
          <div class="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold uppercase tracking-widest">
            {selectedGrade}
          </div>
        </div>
        <div class="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mb-8 overflow-hidden">
          <div 
            class="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500" 
            style="width: {((currentQuestionIndex + 1) / activeQuestions.length) * 100}%"
          ></div>
        </div>

        <!-- Question Content -->
        <div class="space-y-6">
          <h2 class="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 leading-tight">
            {activeQuestions[currentQuestionIndex].question}
          </h2>

          <div class="space-y-3">
            {#each activeQuestions[currentQuestionIndex].options as option, idx}
              {@const isAnswerChecked = userAnswers[currentQuestionIndex] !== undefined}
              {@const isSelected = userAnswers[currentQuestionIndex] === idx}
              {@const statusClass = isSelected 
                  ? "border-indigo-500 bg-indigo-50 text-indigo-800 ring-2 ring-indigo-500/20" 
                  : (isAnswerChecked ? "border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 opacity-50" : "border-slate-200 dark:border-blue-500/30 hover:border-indigo-400 hover:bg-indigo-50 text-slate-600 dark:text-slate-300")}
              
              <button
                type="button"
                on:click={() => checkAnswer(idx)}
                class="w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between group {statusClass}"
              >
                <span class="font-bold text-sm sm:text-base">{option}</span>
                
                {#if isSelected}
                  <span in:scale><CheckCircle2 class="w-5 h-5 text-indigo-500" /></span>
                {/if}
              </button>
            {/each}
          </div>
        </div>
      {:else}
        <!-- Result Screen -->
        <div class="text-center space-y-6 py-8" in:fly={{ y: 20, duration: 400 }}>
          <div class="inline-flex items-center justify-center w-32 h-32 mb-2 relative">
            <img 
              src={quizScore < 40 ? "/images/Crying Lolo.svg" : (quizScore < 80 ? "/images/Like a boss Lolo.svg" : "/images/Yesss Lolo.svg")} 
              alt="Result Mascot" 
              class="w-full h-full object-contain drop-shadow-md"
            />
            <!-- Confetti dots for result -->
            <span class="absolute top-4 right-0 w-3 h-3 bg-rose-400 rounded-full animate-ping"></span>
            <span class="absolute bottom-4 -left-2 w-2 h-2 bg-blue-400 rounded-full animate-ping" style="animation-delay: 300ms;"></span>
          </div>

          <div>
            <h2 class="text-3xl font-black text-slate-800 dark:text-slate-100">Skor Akhir: {quizScore}</h2>
            <p class="text-lg font-bold text-indigo-600 mt-2">{getPredikat(quizScore)}</p>
          </div>
          
          <p class="text-slate-500 dark:text-slate-400 dark:text-slate-500 text-sm max-w-sm mx-auto">
            Terima kasih telah mencoba Kuis Cerdas Cermat Islami. Tetap semangat mengaji dan menuntut ilmu!
          </p>

          <!-- Pembahasan Section -->
          <div class="mt-10 text-left bg-slate-50 dark:bg-slate-800 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-blue-500/30">
            <h3 class="font-black text-xl text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
              <BookOpen class="w-5 h-5 text-indigo-600" />
              Kunci Jawaban & Pembahasan
            </h3>
            
            <div class="space-y-6">
              {#each activeQuestions as q, idx}
                {@const isCorrect = userAnswers[idx] === q.correct}
                <div class="pb-6 border-b border-slate-200 dark:border-blue-500/30 last:border-0 last:pb-0">
                  <p class="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base mb-3 leading-relaxed">
                    <span class="text-slate-400 dark:text-slate-500 mr-1">{idx + 1}.</span> {q.question}
                  </p>
                  
                  <div class="flex flex-col gap-2 mb-3">
                    <div class="flex items-start gap-2 text-sm">
                      <span class="font-bold min-w-[100px] text-slate-500 dark:text-slate-400 dark:text-slate-500">Jawaban Anda:</span>
                      <span class="font-bold {isCorrect ? 'text-emerald-600' : 'text-rose-600'}">
                        {userAnswers[idx] !== undefined ? q.options[userAnswers[idx]] : '-'}
                        {#if !isCorrect}
                          <XCircle class="w-4 h-4 inline ml-1 align-text-bottom" />
                        {:else}
                          <CheckCircle2 class="w-4 h-4 inline ml-1 align-text-bottom" />
                        {/if}
                      </span>
                    </div>
                    
                    {#if !isCorrect}
                    <div class="flex items-start gap-2 text-sm">
                      <span class="font-bold min-w-[100px] text-slate-500 dark:text-slate-400 dark:text-slate-500">Jawaban Benar:</span>
                      <span class="font-bold text-emerald-600">
                        {q.options[q.correct]}
                        <CheckCircle2 class="w-4 h-4 inline ml-1 align-text-bottom" />
                      </span>
                    </div>
                    {/if}
                  </div>

                  <div class="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50">
                    <p class="text-xs sm:text-sm text-indigo-900 leading-relaxed">
                      <span class="font-bold block mb-1 text-indigo-700">Penjelasan:</span>
                      {q.explanation}
                    </p>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>
      {/if}
    </div>

    <!-- Footer Action -->
    {#if selectedGrade}
      <div class="p-4 sm:p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 flex justify-end shrink-0">
        {#if !isQuizFinished}
          {#if userAnswers[currentQuestionIndex] !== undefined}
            <Button on:click={nextQuestion} class="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-12 px-8">
              {currentQuestionIndex < activeQuestions.length - 1 ? 'Lanjut ke Soal Berikutnya' : 'Lihat Hasil Akhir'}
            </Button>
          {:else}
            <Button disabled class="w-full sm:w-auto bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 font-bold rounded-xl h-12 px-8">
              Pilih Jawaban Dulu
            </Button>
          {/if}
        {:else}
          <div class="w-full flex justify-end">
            <Button on:click={startQuiz} class="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-12 px-8">
              <PartyPopper class="w-4 h-4 mr-2" />
              Pilih Grade Baru
            </Button>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>
</div>
