import { readdirSync } from 'node:fs'
import { basename } from 'node:path'
import { defineConfig } from 'vite-plus'

const sourceEntries = (directory: string, outputDirectory: string) =>
	Object.fromEntries(
		readdirSync(directory, { withFileTypes: true })
			.filter((entry) => entry.isFile() && entry.name.endsWith('.ts'))
			.map((entry) => [`${outputDirectory}/${basename(entry.name, '.ts')}`, `${directory}/${entry.name}`]),
	)

export default defineConfig({
	pack: {
		entry: {
			index: 'src/index.ts',
			...sourceEntries('src/pages', 'pages'),
			...sourceEntries('src/presets', 'presets'),
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
