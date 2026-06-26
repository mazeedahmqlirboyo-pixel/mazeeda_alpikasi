<script lang="ts">
  import {
    mdiZodiacAquarius, mdiZodiacAries, mdiZodiacCancer, mdiZodiacCapricorn,
    mdiZodiacGemini, mdiZodiacLeo, mdiZodiacLibra, mdiZodiacPisces,
    mdiZodiacSagittarius, mdiZodiacScorpio, mdiZodiacTaurus, mdiZodiacVirgo,
    mdiRodent, mdiCow, mdiCat, mdiRabbit, mdiFire, mdiSnake,
    mdiHorse, mdiSheep, mdiPaw, mdiBird, mdiDog, mdiPig
  } from '@mdi/js';

  export let type: 'zodiak' | 'shio';
  export let name: string;
  let clazz = '';
  export { clazz as class };

  // Pemetaan untuk Zodiak Masehi
  const zodiacMap: Record<string, string> = {
    'Aquarius': mdiZodiacAquarius,
    'Pisces': mdiZodiacPisces,
    'Aries': mdiZodiacAries,
    'Taurus': mdiZodiacTaurus,
    'Gemini': mdiZodiacGemini,
    'Cancer': mdiZodiacCancer,
    'Leo': mdiZodiacLeo,
    'Virgo': mdiZodiacVirgo,
    'Libra': mdiZodiacLibra,
    'Scorpio': mdiZodiacScorpio,
    'Sagittarius': mdiZodiacSagittarius,
    'Capricorn': mdiZodiacCapricorn
  };

  // Pemetaan untuk Shio (Zodiak Tiongkok)
  const shioMap: Record<string, string> = {
    'Tikus': mdiRodent,
    'Kerbau': mdiCow,
    'Macan': mdiCat, // Harimau
    'Kelinci': mdiRabbit,
    'Naga': mdiFire, // Naga
    'Ular': mdiSnake,
    'Kuda': mdiHorse,
    'Kambing': mdiSheep,
    'Monyet': mdiPaw, // Monyet menggunakan paw print
    'Ayam': mdiBird,
    'Anjing': mdiDog,
    'Babi': mdiPig
  };

  $: path = type === 'zodiak' ? (zodiacMap[name] || '') : (shioMap[name] || '');

</script>

{#if path}
  <svg viewBox="0 0 24 24" class={clazz} fill="currentColor">
    <path d={path} />
  </svg>
{/if}
