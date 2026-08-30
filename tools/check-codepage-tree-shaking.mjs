import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { gzipSync } from 'node:zlib'

import { build } from 'vite'

const root = resolve(import.meta.dirname, '..')
const distribution = resolve(root, 'packages/epos-codepages/dist')
const temporary = await mkdtemp(join(tmpdir(), 'epos-codepage-tree-shaking-'))
const standardPages = [
	0, 2, 3, 4, 5, 11, 12, 13, 14, 15, 16, 17, 18, 19, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53,
]
const cases = [
	{
		name: 'registry-only',
		entry: 'index.mjs',
		imported: 'codepageLayer',
		required: ['epos-codepages/CodepageRegistry'],
		expectedPages: [],
		maxGzipBytes: 32_000,
	},
	{
		name: 'one-page',
		entry: 'pages/page-019.mjs',
		imported: 'page019',
		required: ['PC858'],
		expectedPages: [19],
		maxGzipBytes: 28_000,
	},
	{
		name: 'standard-preset',
		entry: 'presets/standard.mjs',
		imported: 'standardCodepages',
		required: ['PC437', 'PC858'],
		expectedPages: standardPages,
		maxGzipBytes: 38_000,
	},
	{
		name: 'katakana-preset',
		entry: 'presets/katakana.mjs',
		imported: 'katakanaCodepages',
		required: ['Katakana'],
		expectedPages: [1],
		maxGzipBytes: 34_000,
	},
	{
		name: 'one-kanji-page',
		entry: 'pages/page-007.mjs',
		imported: 'page007',
		required: ['One-pass Kanji 1'],
		expectedPages: [7],
		maxGzipBytes: 28_000,
	},
	{
		name: 'one-thai-page',
		entry: 'pages/page-020.mjs',
		imported: 'page020',
		required: ['Thai Character Code 42'],
		expectedPages: [20],
		maxGzipBytes: 28_000,
	},
]

const pageFromModule = (moduleId, renderedLength) => {
	if (renderedLength === 0) {
		return []
	}
	const normalized = moduleId.replaceAll('\\', '/')
	const match = /\/epos-codepages\/dist\/pages\/page-(\d{3})\.mjs$/.exec(normalized)
	return match === null ? [] : [Number(match[1])]
}

let failed = false
try {
	for (const testCase of cases) {
		const entry = join(temporary, `${testCase.name}.mjs`)
		const output = join(temporary, testCase.name)
		const sourceEntry = pathToFileURL(resolve(distribution, testCase.entry)).href
		await writeFile(entry, `import { ${testCase.imported} } from ${JSON.stringify(sourceEntry)};\nconsole.log(${testCase.imported});\n`)
		const result = await build({
			configFile: false,
			logLevel: 'silent',
			build: {
				emptyOutDir: true,
				lib: { entry, formats: ['es'], fileName: testCase.name },
				minify: true,
				outDir: output,
			},
		})
		const outputs = (Array.isArray(result) ? result : [result]).flatMap((buildResult) => buildResult.output)
		const chunks = outputs.filter((buildOutput) => buildOutput.type === 'chunk')
		const bundled = chunks.map((chunk) => chunk.code).join('\n')
		const retainedPages = [
			...new Set(
				chunks.flatMap((chunk) =>
					Object.entries(chunk.modules).flatMap(([moduleId, module]) => pageFromModule(moduleId, module.renderedLength)),
				),
			),
		].toSorted((left, right) => left - right)
		const missingMarkers = testCase.required.filter((marker) => !bundled.includes(marker))
		const missingPages = testCase.expectedPages.filter((page) => !retainedPages.includes(page))
		const unexpectedPages = retainedPages.filter((page) => !testCase.expectedPages.includes(page))
		const gzipBytes = gzipSync(bundled).byteLength

		console.log(`${testCase.name}: ${gzipBytes} gzip bytes; pages: ${retainedPages.join(', ') || 'none'}`)
		if (missingMarkers.length > 0) {
			console.error(`${testCase.name} does not retain required data: ${missingMarkers.join(', ')}`)
			failed = true
		}
		if (missingPages.length > 0) {
			console.error(`${testCase.name} does not retain required pages: ${missingPages.join(', ')}`)
			failed = true
		}
		if (unexpectedPages.length > 0) {
			console.error(`${testCase.name} retains unexpected pages: ${unexpectedPages.join(', ')}`)
			failed = true
		}
		if (gzipBytes > testCase.maxGzipBytes) {
			console.error(`${testCase.name} exceeds its ${testCase.maxGzipBytes} gzip-byte limit`)
			failed = true
		}
	}
} finally {
	await rm(temporary, { force: true, recursive: true })
}

if (failed) {
	process.exitCode = 1
}
