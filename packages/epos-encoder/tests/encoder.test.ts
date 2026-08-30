import type { Root } from '@piqy/epos-ast'
import { CodepageNotLoadedError, UnencodableCharacterError, codepageLayer } from '@piqy/epos-codepages'
import { page000 } from '@piqy/epos-codepages/pages/page-000'
import { page019 } from '@piqy/epos-codepages/pages/page-019'
import { page041 } from '@piqy/epos-codepages/pages/page-041'
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

const expectedStatefulBytes = Uint8Array.of(
	0x1b,
	0x40,
	0x1b,
	0x61,
	0x01,
	0x1b,
	0x7b,
	0x00,
	0x63,
	0x65,
	0x6e,
	0x74,
	0x65,
	0x72,
	0x1b,
	0x61,
	0x00,
	0x6c,
	0x65,
	0x66,
	0x74,
)

const expectedStatefulChunks = [
	Uint8Array.of(0x1b, 0x40),
	Uint8Array.of(0x1b, 0x61, 0x01, 0x1b, 0x7b, 0x00, 0x63, 0x65, 0x6e, 0x74, 0x65, 0x72),
	Uint8Array.of(0x1b, 0x61, 0x00, 0x6c, 0x65, 0x66, 0x74),
]

describe('encoder execution', () => {
	it.effect(
		'isolates mutable printer state between concurrent executions of one Effect',
		Effect.fn(function* () {
			const program = encode(statefulTree)
			const [first, second] = yield* Effect.all([program, program], { concurrency: 'unbounded' })
			expect(first).toStrictEqual(expectedStatefulBytes)
			expect(second).toStrictEqual(expectedStatefulBytes)
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
		'encodes a configured CODE39 barcode as ESC/POS bytes',
		Effect.fn(function* () {
			const bytes = yield* encode({
				type: 'root',
				children: [{ type: 'barcode', format: 'CODE39', data: 'ABC', width: 2, height: 40, hri: 'below', hriFont: 'B' }],
			})
			expect(bytes).toStrictEqual(
				Uint8Array.of(
					0x1b,
					0x40,
					0x1d,
					0x77,
					0x02,
					0x1d,
					0x68,
					0x28,
					0x1d,
					0x48,
					0x02,
					0x1d,
					0x66,
					0x01,
					0x1d,
					0x6b,
					0x45,
					0x03,
					0x41,
					0x42,
					0x43,
				),
			)
		}, Effect.provide(StandardCodepagesLayer)),
	)

	it.effect(
		'uses page 0 when automatic selection is disabled',
		Effect.fn(function* () {
			const program = encode({ type: 'root', children: [{ type: 'text', value: 'text' }] }, { automaticCodepage: false }).pipe(
				Effect.provide(codepageLayer([page019])),
			)
			const error = yield* Effect.flip(program)
			expect(error).toBeInstanceOf(CodepageNotLoadedError)
			if (error instanceof CodepageNotLoadedError) {
				expect(error.page).toBe(0)
			}
		}),
	)

	it.effect(
		'checks an explicit page even when the country table can encode all text',
		Effect.fn(function* () {
			const error = yield* Effect.flip(
				encode({ type: 'root', children: [{ type: 'text', value: '@', codepage: 19 }] }).pipe(Effect.provide(codepageLayer([page000]))),
			)
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
		'reports country-table conflicts at their index in the complete text node',
		Effect.fn(function* () {
			const error = yield* Effect.flip(
				encode({ type: 'root', children: [{ type: 'text', value: 'é€@', country: 'france' }] }).pipe(
					Effect.provide(codepageLayer([page000, page019])),
				),
			)
			expect(error).toBeInstanceOf(UnencodableCharacterError)
			if (error instanceof UnencodableCharacterError) {
				expect(error.index).toBe(2)
				expect(error.character).toBe('@')
			}
		}),
	)

	it.effect(
		'encodes long country-substituted text',
		Effect.fn(function* () {
			const value = `${'a'.repeat(100_000)}é`
			const bytes = yield* encode({
				type: 'root',
				children: [{ type: 'text', value, codepage: 0, country: 'france' }],
			}).pipe(Effect.provide(codepageLayer([page000])))
			expect(bytes).toHaveLength(value.length + 11)
			expect(bytes.subarray(0, 11)).toStrictEqual(Uint8Array.of(0x1b, 0x40, 0x1b, 0x61, 0x00, 0x1b, 0x7b, 0x00, 0x1b, 0x52, 0x01))
			expect(bytes.at(-1)).toBe(0x7b)
		}),
	)

	it.effect(
		'keeps compound code-page tokens next to country substitutions',
		Effect.fn(function* () {
			const bytes = yield* encode({
				type: 'root',
				children: [{ type: 'text', value: '$لا', codepage: 41, country: 'usa' }],
			}).pipe(Effect.provide(codepageLayer([page041])))
			expect(bytes).toStrictEqual(Uint8Array.of(0x1b, 0x40, 0x1b, 0x61, 0x00, 0x1b, 0x7b, 0x00, 0x1b, 0x74, 0x29, 0x24, 0x8b))
		}),
	)

	it.effect(
		'selects loaded pages automatically by default',
		Effect.fn(function* () {
			const bytes = yield* encode({ type: 'root', children: [{ type: 'text', value: 'é€é' }] }).pipe(
				Effect.provide(codepageLayer([page000, page019])),
			)
			expect(bytes).toStrictEqual(Uint8Array.of(0x1b, 0x40, 0x1b, 0x61, 0x00, 0x1b, 0x7b, 0x00, 0x82, 0x1b, 0x74, 0x13, 0xd5, 0x82))
		}),
	)

	it.effect(
		'sends a configured start page immediately after printer initialization',
		Effect.fn(function* () {
			const bytes = yield* encode(
				{ type: 'root', children: [{ type: 'text', value: '€' }] },
				{ automaticCodepage: false, codepage: 19 },
			).pipe(Effect.provide(codepageLayer([page019])))
			expect(bytes).toStrictEqual(Uint8Array.of(0x1b, 0x40, 0x1b, 0x74, 0x13, 0x1b, 0x61, 0x00, 0x1b, 0x7b, 0x00, 0xd5))
		}),
	)

	it.effect(
		'does not replace an explicit AST code page with an automatic choice',
		Effect.fn(function* () {
			const error = yield* Effect.flip(
				encode({ type: 'root', children: [{ type: 'text', value: '€', codepage: 0 }] }).pipe(
					Effect.provide(codepageLayer([page000, page019])),
				),
			)
			expect(error).toBeInstanceOf(UnencodableCharacterError)
			if (error instanceof UnencodableCharacterError) {
				expect(error.page).toBe(0)
				expect(error.character).toBe('€')
			}
		}),
	)

	it.effect(
		'creates a new state context when a stream is executed again',
		Effect.fn(function* () {
			const stream = encodeStream(Stream.fromIterable(statefulTree.children))
			const first = yield* Stream.runCollect(stream)
			const second = yield* Stream.runCollect(stream)
			expect(first).toStrictEqual(expectedStatefulChunks)
			expect(second).toStrictEqual(expectedStatefulChunks)
		}, Effect.provide(StandardCodepagesLayer)),
	)
})
