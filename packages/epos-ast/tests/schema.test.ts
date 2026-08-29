import { describe, expect, it } from '@effect/vitest'
import { Effect, Schema } from 'effect'

import { Feed, Root } from '../src/schema.js'

const nestedReceipt = {
	type: 'root',
	children: [
		{
			type: 'align',
			align: 'center',
			children: [{ type: 'strong', children: [{ type: 'text', value: 'Receipt' }] }],
		},
	],
}

describe('AST schemas', () => {
	it.effect(
		'decodes recursive trees without adding a second discriminant',
		Effect.fn(function* () {
			const decoded = yield* Schema.decodeUnknownEffect(Root)(nestedReceipt)
			expect(decoded).toStrictEqual(nestedReceipt)
			expect('_tag' in decoded).toBe(false)
		}),
	)

	it.effect(
		'enforces the phrasing content boundary inside formatting nodes',
		Effect.fn(function* () {
			const invalid = {
				type: 'root',
				children: [{ type: 'strong', children: [{ type: 'image', width: 8, height: 1, data: 'AA==' }] }],
			}
			yield* Effect.flip(Schema.decodeUnknownEffect(Root)(invalid))
		}),
	)

	it('requires one feed measurement mode', () => {
		const isFeed = Schema.is(Feed)
		expect(isFeed({ type: 'feed', lines: 1 })).toBe(true)
		expect(isFeed({ type: 'feed', units: 8 })).toBe(true)
		expect(isFeed({ type: 'feed' })).toBe(false)
		expect(isFeed({ type: 'feed', lines: 1, units: 8 })).toBe(false)
		expect(isFeed({ type: 'feed', units: 8, reverse: true })).toBe(false)
	})
})
