import type { Root } from '@piqy/epos-ast'
import { CodepageNotLoadedError, UnencodableCharacterError, codepageLayer } from '@piqy/epos-codepages'
import { page000 } from '@piqy/epos-codepages/pages/page-000'
import { page019 } from '@piqy/epos-codepages/pages/page-019'
import { StandardCodepagesLayer } from '@piqy/epos-codepages/presets/standard'
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
		}, Effect.provide(StandardCodepagesLayer)),
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
			if (error instanceof InvalidNodeError) {
				expect(error.nodeType).toBe('barcode')
			}
		}, Effect.provide(StandardCodepagesLayer)),
	)

	it.effect(
		'fails when the selected code page was removed from the Layer',
		Effect.fn(function* () {
			const program = encode({ type: 'root', children: [{ type: 'text', value: 'text' }] }).pipe(Effect.provide(codepageLayer([page000])))
			const error = yield* Effect.flip(program)
			expect(error).toBeInstanceOf(CodepageNotLoadedError)
			if (error instanceof CodepageNotLoadedError) {
				expect(error.page).toBe(19)
			}
		}),
	)

	it.effect(
		'does not emit a byte that the active country table reassigns',
		Effect.fn(function* () {
			const program = encode({
				type: 'root',
				children: [{ type: 'text', value: '@', codepage: 0, country: 'france' }],
			}).pipe(Effect.provide(codepageLayer([page000])))
			const error = yield* Effect.flip(program)
			expect(error).toBeInstanceOf(UnencodableCharacterError)
			if (error instanceof UnencodableCharacterError) {
				expect(error.character).toBe('@')
			}
		}),
	)

	it.effect(
		'can select loaded pages automatically without changing explicit text nodes',
		Effect.fn(function* () {
			const program = encode({ type: 'root', children: [{ type: 'text', value: 'é€é' }] }, { codepage: 0, automaticCodepage: true }).pipe(
				Effect.provide(codepageLayer([page000, page019])),
			)
			yield* program
		}),
	)

	it.effect(
		'creates a new state context when a stream is executed again',
		Effect.fn(function* () {
			const stream = encodeStream(Stream.fromIterable(statefulTree.children))
			const first = yield* Stream.runCollect(stream)
			const second = yield* Stream.runCollect(stream)
			expect(first).toStrictEqual(second)
		}, Effect.provide(StandardCodepagesLayer)),
	)
})
