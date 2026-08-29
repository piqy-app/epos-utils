import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { gzipSync } from 'node:zlib'

import { build } from 'vite'

const root = resolve(import.meta.dirname, '..')
const distribution = resolve(root, 'packages/epos-codepages/dist')
const temporary = await mkdtemp(join(tmpdir(), 'epos-codepage-tree-shaking-'))
const cases = [
	{
		name: 'registry-only',
		entry: 'index.mjs',
		imported: 'codepageLayer',
		forbidden: ['Çüéâäàåç', 'ஂஃஅஆஇஈ', '日扱外額割検', 'Thai Character Code 42'],
	},
	{
		name: 'one-page',
		entry: 'pages/page-019.mjs',
		imported: 'page019',
		forbidden: ['ஂஃஅஆஇஈ', 'ँंःअआइ', '日扱外額割検', 'Thai Character Code 42'],
	},
	{
		name: 'standard-preset',
		entry: 'presets/standard.mjs',
		imported: 'standardCodepages',
		forbidden: ['ஂஃஅஆஇஈ', 'ँंःअआइ', '日扱外額割検', 'Thai Character Code 42'],
	},
	{
		name: 'katakana-preset',
		entry: 'presets/katakana.mjs',
		imported: 'katakanaCodepages',
		forbidden: ['日扱外額割検', '訂正品円種担当', 'Thai Character Code 42'],
	},
	{
		name: 'one-kanji-page',
		entry: 'pages/page-007.mjs',
		imported: 'page007',
		forbidden: ['訂正品円種担当', 'Thai Character Code 42'],
	},
	{
		name: 'one-thai-page',
		entry: 'pages/page-020.mjs',
		imported: 'page020',
		forbidden: ['日扱外額割検', '訂正品円種担当', 'ஂஃஅஆஇஈ', 'Thai Character Code 11'],
	},
]

let failed = false
try {
	for (const testCase of cases) {
		const entry = join(temporary, `${testCase.name}.mjs`)
		const output = join(temporary, testCase.name)
		const sourceEntry = pathToFileURL(resolve(distribution, testCase.entry)).href
		await writeFile(entry, `import { ${testCase.imported} } from ${JSON.stringify(sourceEntry)};\nconsole.log(${testCase.imported});\n`)
		await build({
			configFile: false,
			logLevel: 'silent',
			build: {
				emptyOutDir: true,
				lib: { entry, formats: ['es'], fileName: testCase.name },
				minify: true,
				outDir: output,
			},
		})
		const files = await readdir(output)
		const javascript = files.filter((file) => file.endsWith('.js'))
		const sources = await Promise.all(javascript.map((file) => readFile(join(output, file), 'utf8')))
		const bundled = sources.join('\n')
		const retained = testCase.forbidden.filter((marker) => bundled.includes(marker))
		console.log(`${testCase.name}: ${gzipSync(bundled).byteLength} gzip bytes`)
		if (retained.length > 0) {
			console.error(`${testCase.name} retains unused page data: ${retained.join(', ')}`)
			failed = true
		}
	}
} finally {
	await rm(temporary, { force: true, recursive: true })
}

if (failed) {
	process.exitCode = 1
}
