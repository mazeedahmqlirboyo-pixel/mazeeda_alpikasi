import adapterStatic from '@sveltejs/adapter-static';
import adapterAuto from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const useStatic = !process.env.VERCEL;

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: useStatic
			? adapterStatic({
				fallback: 'index.html',
				strict: false
			})
			: adapterAuto(),
		prerender: {
			handleHttpError: 'warn'
		},
		alias: {
			$lib: './src/lib',
			'$lib/*': './src/lib/*'
		}
	}
};

export default config;
