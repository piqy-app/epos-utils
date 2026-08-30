import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const forceGc = () => {
	for (let index = 0; index < 4; index++) {
		globalThis.gc?.()
	}
}
const formatBytes = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MiB`
const expectedOutcomes = new Map([
	['valid-codepage', 'ok'],
	['invalid-codepage', 'UnencodableCharacterError'],
	['country-substitutions', 'ok'],
])

const runWorker = async (scenario) => {
	const { Effect } = await import('effect')
	let operation
	if (scenario === 'valid-codepage') {
		const { page019 } = await import('../packages/epos-codepages/dist/pages/page-019.mjs')
		operation = () => {
			const text = 'Café € 123 '.repeat(700_000)
			const output = Effect.runSync(page019.encode(text))
			return { output, text }
		}
	} else if (scenario === 'invalid-codepage') {
		const { page019 } = await import('../packages/epos-codepages/dist/pages/page-019.mjs')
		operation = () => {
			const text = `🧾${'A'.repeat(8_000_000)}`
			try {
				Effect.runSync(page019.encode(text))
				return { outcome: 'unexpected success', text }
			} catch (error) {
				return { outcome: error instanceof Error ? error.name : 'encoding failure', text }
			}
		}
	} else if (scenario === 'country-substitutions') {
		const [{ encode }, { codepageLayer }, { page000 }] = await Promise.all([
			import('../packages/epos-encoder/dist/index.mjs'),
			import('../packages/epos-codepages/dist/index.mjs'),
			import('../packages/epos-codepages/dist/pages/page-000.mjs'),
		])
		const layer = codepageLayer([page000])
		operation = () => {
			const text = 'été à '.repeat(8_000)
			const output = Effect.runSync(
				encode({ type: 'root', children: [{ type: 'text', value: text, country: 'france' }] }).pipe(Effect.provide(layer)),
			)
			return { output, text }
		}
	} else {
		throw new Error(`unknown memory scenario: ${scenario}`)
	}

	forceGc()
	const before = process.memoryUsage()
	const peakBefore = process.resourceUsage().maxRSS * 1024
	let retained
	let outcome = 'ok'
	try {
		retained = operation()
		if ('outcome' in retained) {
			outcome = retained.outcome
		}
	} catch (error) {
		outcome = error instanceof Error ? `${error.name}: ${error.message}` : 'operation failed'
	}
	globalThis.memoryBenchmarkRetained = retained
	forceGc()
	const after = process.memoryUsage()
	const peakAfter = process.resourceUsage().maxRSS * 1024
	console.log(
		JSON.stringify({
			scenario,
			outcome,
			totalPeakRss: peakAfter,
			additionalPeakRss: Math.max(0, peakAfter - peakBefore),
			retainedRss: after.rss - before.rss,
			retainedHeap: after.heapUsed - before.heapUsed,
			retainedArrayBuffers: after.arrayBuffers - before.arrayBuffers,
		}),
	)
}

if (process.argv[2] === '--worker') {
	await runWorker(process.argv[3])
} else {
	console.log('Memory')
	for (const [scenario, expectedOutcome] of expectedOutcomes) {
		const child = spawnSync(process.execPath, ['--expose-gc', fileURLToPath(import.meta.url), '--worker', scenario], {
			encoding: 'utf8',
		})
		if (child.status !== 0) {
			console.error(`${scenario}: ${child.stderr.trim() || `worker exited with status ${child.status}`}`)
			process.exitCode = 1
			continue
		}
		const result = JSON.parse(child.stdout.trim())
		console.log(
			`${scenario}: total peak rss ${formatBytes(result.totalPeakRss)}, additional peak rss ${formatBytes(result.additionalPeakRss)}, ` +
				`retained rss ${formatBytes(result.retainedRss)}, retained heap ${formatBytes(result.retainedHeap)}, ` +
				`retained array buffers ${formatBytes(result.retainedArrayBuffers)} (${result.outcome})`,
		)
		if (result.outcome !== expectedOutcome) {
			console.error(`${scenario}: expected ${expectedOutcome}, received ${result.outcome}`)
			process.exitCode = 1
		}
	}
}
