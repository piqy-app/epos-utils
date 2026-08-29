import { defineConfig } from 'vite-plus'

export default defineConfig({
	pack: {
		entry: {
			index: 'src/index.ts',
			effect: 'src/effect.ts',
		},
		unbundle: true,
		dts: {
			tsgo: true,
		},
		exports: true,
		publint: {
			level: 'error',
		},
		attw: {
			profile: 'esm-only',
			level: 'error',
		},
	},
})
