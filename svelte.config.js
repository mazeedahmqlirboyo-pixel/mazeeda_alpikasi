import adapterStatic from '@sveltejs/adapter-static';
import adapterVercel from '@sveltejs/adapter-vercel';
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
			: adapterVercel({
				runtime: 'nodejs22.x'
			}),
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
