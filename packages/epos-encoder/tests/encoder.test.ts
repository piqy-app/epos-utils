import type { Root } from '@piqy/epos-ast'
import { describe, expect, it } from '@effect/vitest'
import { Effect, Stream } from 'effect'

import { encode, encodeStream, InvalidNodeError } from '../src/index.js'

const statefulTree = {
	type: 'root',
	children: [
		{
			type: 'align',
			align: 'center',
			children: [{ type: 'text', value: 'center' }],
		},
		{ type: 'text', value: 'left' },
	],
} satisfies Root

describe('encoder execution', () => {
	it.effect(
		'isolates mutable printer state between concurrent executions',
		Effect.fn(function* () {
			const [first, second] = yield* Effect.all([encode(statefulTree), encode(statefulTree)], { concurrency: 'unbounded' })
			expect(first).toStrictEqual(second)
		}),
	)

	it.effect(
		'reports invalid barcode text through the typed error channel',
		Effect.fn(function* () {
			const error = yield* Effect.flip(
				encode({
					type: 'root',
					children: [{ type: 'barcode', format: 'CODE39', data: 'not-ascii-€' }],
				}),
			)
			expect(error).toBeInstanceOf(InvalidNodeError)
			expect(error.nodeType).toBe('barcode')
		}),
	)

	it.effect(
		'creates a new state context when a stream is executed again',
		Effect.fn(function* () {
			const stream = encodeStream(Stream.fromIterable(statefulTree.children))
			const first = yield* Stream.runCollect(stream)
			const second = yield* Stream.runCollect(stream)
			expect(first).toStrictEqual(second)
		}),
	)
})
