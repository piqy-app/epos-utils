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
import { page007 } from '../src/pages/page-007.js'
import { page008 } from '../src/pages/page-008.js'
import { page019 } from '../src/pages/page-019.js'
import { page041 } from '../src/pages/page-041.js'
import { page067 } from '../src/pages/page-067.js'
import { page070 } from '../src/pages/page-070.js'
import { availableCodepages } from '../src/presets/available.js'
import { thaiCodepages } from '../src/presets/thai.js'

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

	it('publishes every fixed Epson page as an isolated codec', () => {
		expect(availableCodepages.map((codepage) => codepage.page)).toStrictEqual([
			0, 1, 2, 3, 4, 5, 6, 7, 8, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
			41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 82,
		])
	})

	it.effect(
		'round trips normal Unicode Thai text through every Epson Thai layout',
		Effect.fn(function* () {
			const text = 'กำลังพิมพ์ภาษาไทย ๑๒๓'
			for (const codepage of thaiCodepages) {
				const encoded = yield* codepage.encode(text)
				expect(codepage.decode(encoded)).toBe(text)
			}
		}),
	)

	it.effect(
		'encodes semantic Persian text through PC1098 presentation forms',
		Effect.fn(function* () {
			const text = 'فارسی ۱۲۳'
			const encoded = yield* page041.encode(text)
			expect(page041.decode(encoded).normalize('NFKC')).toBe(text)
		}),
	)

	it.effect(
		'distinguishes the Assamese ISCII additions from Bengali',
		Effect.fn(function* () {
			expect(page067.canEncode('ৰৱ')).toBe(false)
			const encoded = yield* page070.encode('ৰৱ')
			expect(page070.decode(encoded)).toBe('ৰৱ')
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
		'segments the two isolated one-pass Kanji pages only when required',
		Effect.fn(function* () {
			const registry = yield* makeCodepageRegistry([page007, page008])
			const segments = yield* registry.plan('日訂')
			expect(segments.map(({ page, text }) => ({ page, text }))).toStrictEqual([
				{ page: 7, text: '日' },
				{ page: 8, text: '訂' },
			])
		}),
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
