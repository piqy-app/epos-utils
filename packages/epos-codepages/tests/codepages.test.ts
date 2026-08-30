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
import { page020 } from '../src/pages/page-020.js'
import { page021 } from '../src/pages/page-021.js'
import { page022 } from '../src/pages/page-022.js'
import { page023 } from '../src/pages/page-023.js'
import { page024 } from '../src/pages/page-024.js'
import { page025 } from '../src/pages/page-025.js'
import { page026 } from '../src/pages/page-026.js'
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
		'round trips every defined character in every available table',
		Effect.fn(function* () {
			for (const codepage of availableCodepages) {
				for (const byte of printableBytes) {
					const character = codepage.decode(Uint8Array.of(byte))
					if (character === '\uFFFD') {
						continue
					}
					expect(codepage.canEncode(character), `${codepage.name} must encode ${character}`).toBe(true)
					const encoded = yield* codepage.encode(character)
					expect(codepage.decode(encoded), `${codepage.name} must round trip ${character}`).toBe(character)
				}
			}
		}),
	)

	it('publishes all 60 fixed Epson pages in page order', () => {
		expect(availableCodepages.map((codepage) => codepage.page)).toStrictEqual([
			0, 1, 2, 3, 4, 5, 6, 7, 8, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
			41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 82,
		])
	})

	it.effect(
		'encodes normal Unicode Thai text with the TIS-620 byte positions in every Thai layout',
		Effect.fn(function* () {
			const text = 'กำ ไทย'
			const expected = Uint8Array.of(0xa1, 0xd3, 0x20, 0xe4, 0xb7, 0xc2)
			for (const codepage of thaiCodepages) {
				const encoded = yield* codepage.encode(text)
				expect(encoded, codepage.name).toStrictEqual(expected)
				expect(codepage.decode(encoded), codepage.name).toBe(text)
			}
		}),
	)

	it.effect(
		'keeps the documented line and arrow graphics at stable byte positions in every Thai layout',
		Effect.fn(function* () {
			const cases = [
				{ codepage: page020, text: '┌█←', bytes: Uint8Array.of(0x80, 0x8b, 0x8c) },
				{ codepage: page021, text: '┌─┼', bytes: Uint8Array.of(0x99, 0xdb, 0xde) },
				{ codepage: page022, text: '←↑→↓', bytes: Uint8Array.of(0xfc, 0xfd, 0xfe, 0xff) },
				{ codepage: page023, text: '┌█', bytes: Uint8Array.of(0x80, 0x8b) },
				{ codepage: page024, text: '┌█←', bytes: Uint8Array.of(0x80, 0x8b, 0x8c) },
				{ codepage: page025, text: '│─┼┌←', bytes: Uint8Array.of(0x95, 0x96, 0x97, 0x98, 0xfc) },
				{ codepage: page026, text: '┌█←', bytes: Uint8Array.of(0x80, 0x8b, 0x8c) },
			] as const
			for (const testCase of cases) {
				const encoded = yield* testCase.codepage.encode(testCase.text)
				expect(encoded, testCase.codepage.name).toStrictEqual(testCase.bytes)
				expect(testCase.codepage.decode(encoded), testCase.codepage.name).toBe(testCase.text)
			}
		}),
	)

	it.effect(
		'encodes semantic Persian text at the documented PC1098 byte positions',
		Effect.fn(function* () {
			const text = 'فارسی ۱۲۳'
			const encoded = yield* page041.encode(text)
			expect(encoded).toStrictEqual(Uint8Array.of(0xd7, 0x89, 0xa5, 0xa8, 0xef, 0x20, 0xf5, 0xf6, 0xf7))
			expect(page041.decode(encoded).normalize('NFKC')).toBe(text)
		}),
	)

	it('rejects Arabic Yeh instead of changing it to Persian Yeh', () => {
		expect(page041.canEncode('ي')).toBe(false)
	})

	it.effect(
		'uses the documented PC1098 cell for each Lam-Alef token',
		Effect.fn(function* () {
			const cases = [
				{ text: 'لآ', byte: 0x88 },
				{ text: 'لا', byte: 0x8b },
				{ text: 'لأ', byte: 0x8f },
			] as const
			for (const testCase of cases) {
				const encoded = yield* page041.encode(testCase.text)
				expect(encoded).toStrictEqual(Uint8Array.of(testCase.byte))
				expect(page041.decode(encoded).normalize('NFKC')).toBe(testCase.text)
			}
		}),
	)

	it.effect(
		'uses the documented Assamese ISCII cells without adding them to Bengali',
		Effect.fn(function* () {
			expect(page067.canEncode('ৰৱ')).toBe(false)
			const encoded = yield* page070.encode('ৰৱ')
			expect(encoded).toStrictEqual(Uint8Array.of(0xcf, 0xd4))
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
			const error = yield* Effect.flip(registry.plan('ok 🧾💣'))
			expect(error).toBeInstanceOf(NoCodepageSupportsCharacterError)
			if (error instanceof NoCodepageSupportsCharacterError) {
				expect(error.character).toBe('🧾')
				expect(error.index).toBe(3)
				expect(error.pages).toStrictEqual([0, 19])
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
