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
		'decodes recursive trees without changing their wire shape',
		Effect.fn(function* () {
			const decoded = yield* Schema.decodeUnknownEffect(Root)(nestedReceipt)
			expect(decoded).toStrictEqual(nestedReceipt)
		}),
	)

	it('accepts images as flow content but rejects them as phrasing content', () => {
		const image = { type: 'image', width: 8, height: 1, data: 'AA==' }
		const isRoot = Schema.is(Root)
		expect(isRoot({ type: 'root', children: [image] })).toBe(true)
		expect(isRoot({ type: 'root', children: [{ type: 'strong', children: [image] }] })).toBe(false)
	})

	it('requires one feed measurement mode', () => {
		const isFeed = Schema.is(Feed)
		expect(isFeed({ type: 'feed', lines: 1 })).toBe(true)
		expect(isFeed({ type: 'feed', lines: 1, reverse: true })).toBe(true)
		expect(isFeed({ type: 'feed', units: 8 })).toBe(true)
		expect(isFeed({ type: 'feed' })).toBe(false)
		expect(isFeed({ type: 'feed', lines: 1, units: 8 })).toBe(false)
		expect(isFeed({ type: 'feed', units: 8, reverse: true })).toBe(false)
	})
})
