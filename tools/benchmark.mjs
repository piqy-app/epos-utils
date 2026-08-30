import { performance } from 'node:perf_hooks'

import { Effect } from 'effect'

const forceGc = () => {
	for (let index = 0; index < 4; index++) {
		globalThis.gc?.()
	}
}
const heap = () => process.memoryUsage().heapUsed
const median = (values) => values.toSorted((left, right) => left - right)[Math.floor(values.length / 2)]
const formatHeap = (bytes) => `${(bytes / 1024).toFixed(1)} KiB`
let sink = 0

const benchmark = (name, bytesPerIteration, iterations, operation) => {
	for (let index = 0; index < 3; index++) {
		sink += operation()
	}
	const samples = []
	for (let sample = 0; sample < 7; sample++) {
		const start = performance.now()
		for (let index = 0; index < iterations; index++) {
			sink += operation()
		}
		samples.push(performance.now() - start)
	}
	const elapsed = median(samples)
	const throughput = (bytesPerIteration * iterations) / 1024 / 1024 / (elapsed / 1000)
	console.log(`${name}: ${throughput.toFixed(1)} MiB/s (${elapsed.toFixed(2)} ms median)`)
}

forceGc()
const heapBeforeImport = heap()
const [{ page000 }, { page019 }, { page041 }, { availableCodepages }, { codepageLayer, makeCodepageRegistry }] = await Promise.all([
	import('../packages/epos-codepages/dist/pages/page-000.mjs'),
	import('../packages/epos-codepages/dist/pages/page-019.mjs'),
	import('../packages/epos-codepages/dist/pages/page-041.mjs'),
	import('../packages/epos-codepages/dist/presets/available.mjs'),
	import('../packages/epos-codepages/dist/index.mjs'),
])
forceGc()
const heapAfterImport = heap()

forceGc()
const heapBeforeIndexes = heap()
for (const codepage of availableCodepages) {
	codepage.canEncode('A')
}
forceGc()
const heapAfterIndexes = heap()

const latinText = 'Café € 123 | receipt line '.repeat(10_000)
const planningText = 'é€é'.repeat(30_000)
const persianText = 'فارسی ۱۲۳ لا '.repeat(10_000)
const latinBytes = Effect.runSync(page019.encode(latinText))
const registry = Effect.runSync(makeCodepageRegistry([page000, page019]))

console.log('\nCode pages')
benchmark('canEncode Latin', latinText.length, 100, () => Number(page019.canEncode(latinText)))
benchmark('encode Latin', latinText.length, 30, () => Effect.runSync(page019.encode(latinText)).length)
benchmark('decode Latin', latinBytes.length, 30, () => page019.decode(latinBytes).length)
benchmark('encode Persian aliases', persianText.length, 30, () => Effect.runSync(page041.encode(persianText)).length)
benchmark('plan switching pages', planningText.length, 20, () => Effect.runSync(registry.plan(planningText)).length)
benchmark('plan stable page', latinText.length, 20, () => Effect.runSync(registry.plan(latinText, { currentPage: 19 })).length)

console.log('\nRetained heap')
console.log(`available-page imports: ${formatHeap(heapAfterImport - heapBeforeImport)}`)
console.log(`all encoding indexes: ${formatHeap(heapAfterIndexes - heapBeforeIndexes)}`)

const { encode } = await import('../packages/epos-encoder/dist/index.mjs')
const layer = codepageLayer([page000, page019])
const benchmarkEncoder = (name, text, iterations, fields = {}) => {
	const program = encode({ type: 'root', children: [{ type: 'text', value: text, ...fields }] }).pipe(Effect.provide(layer))
	benchmark(name, text.length, iterations, () => Effect.runSync(program).length)
}

console.log('\nEncoder')
benchmarkEncoder('default country plain text', 'Receipt line 123 '.repeat(10_000), 20)
benchmarkEncoder('French substitutions', 'Total été à 10 € '.repeat(10_000), 5, { country: 'france' })
benchmarkEncoder('French one substitution', `${'Receipt line '.repeat(10_000)}é`, 10, { country: 'france' })
console.log(`measurement sink: ${sink}`)
