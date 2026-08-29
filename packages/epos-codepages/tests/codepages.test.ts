import { describe, expect, it } from '@effect/vitest'
import { Effect } from 'effect'

import {
	CodepageNotLoadedError,
	CodepageRegistry,
	DuplicateCodepageError,
	NoCodepageSupportsCharacterError,
	codepageLayer,
	makeCodepageRegistry,
} from '../src/index.js'
import { page000 } from '../src/pages/page-000.js'
import { page019 } from '../src/pages/page-019.js'
import { availableCodepages } from '../src/presets/available.js'

const printableBytes = Uint8Array.from([
	...Array.from({ length: 0x7f - 0x20 }, (_, index) => index + 0x20),
	...Array.from({ length: 0x100 - 0x80 }, (_, index) => index + 0x80),
])

describe('single-byte code pages', () => {
	it.effect(
		'round trips every encodable character in every available table',
		Effect.fn(function* () {
			for (const codepage of availableCodepages) {
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
				if (error instanceof CodepageNotLoadedError) {
					expect(error.page).toBe(19)
				}
			},
			Effect.provide(codepageLayer([page000])),
		),
	)

	it.effect(
		'keeps the current page until the text requires a switch',
		Effect.fn(function* () {
			const registry = yield* makeCodepageRegistry([page000, page019])
			const segments = yield* registry.plan('é€é', { currentPage: 0 })
			expect(segments.map(({ page, text }) => ({ page, text }))).toStrictEqual([
				{ page: 0, text: 'é' },
				{ page: 19, text: '€é' },
			])
		}),
	)

	it.effect(
		'reports the first character that no loaded page supports',
		Effect.fn(function* () {
			const registry = yield* makeCodepageRegistry([page000, page019])
			const error = yield* Effect.flip(registry.plan('ok 🧾'))
			expect(error).toBeInstanceOf(NoCodepageSupportsCharacterError)
			if (error instanceof NoCodepageSupportsCharacterError) {
				expect(error.character).toBe('🧾')
			}
		}),
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
