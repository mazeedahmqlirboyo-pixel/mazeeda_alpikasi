import { writable } from 'svelte/store';

export const isAudioPlayingGlobal = writable<boolean>(false);
