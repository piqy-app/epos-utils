import { describe, expect, it } from '@effect/vitest'
import { Effect } from 'effect'

import { CodepageNotLoadedError, CodepageRegistry, DuplicateCodepageError, codepageLayer, makeCodepageRegistry } from '../src/index.js'
import { page000 } from '../src/pages/page-000.js'
import { standardCodepages } from '../src/presets/standard.js'

const printableBytes = Uint8Array.from([
	...Array.from({ length: 0x7f - 0x20 }, (_, index) => index + 0x20),
	...Array.from({ length: 0x100 - 0x80 }, (_, index) => index + 0x80),
])

describe('single-byte code pages', () => {
	it.effect(
		'round trips every encodable character in every standard table',
		Effect.fn(function* () {
			for (const codepage of standardCodepages) {
				for (const byte of printableBytes) {
					const character = codepage.decode(Uint8Array.of(byte))
					if (character !== '\uFFFD' && codepage.canEncode(character)) {
						const encoded = yield* codepage.encode(character)
						expect(codepage.decode(encoded)).toBe(character)
					}
				}
			}
		}),
	)
})

describe('code-page registry', () => {
	it.effect(
		'does not fall back when a requested page is absent',
		Effect.fn(
			function* () {
				const registry = yield* CodepageRegistry
				const error = yield* Effect.flip(registry.encode(19, 'text'))
				expect(error).toBeInstanceOf(CodepageNotLoadedError)
				expect(error.page).toBe(19)
			},
			Effect.provide(codepageLayer([page000])),
		),
	)

	it.effect(
		'rejects ambiguous registry composition',
		Effect.fn(function* () {
			const error = yield* Effect.flip(makeCodepageRegistry([page000, page000]))
			expect(error).toBeInstanceOf(DuplicateCodepageError)
			expect(error.page).toBe(0)
		}),
	)
})
