import type { Country } from '@piqy/epos-ast'
import { codepageLayer } from '@piqy/epos-codepages'
import { countryCharacterTables, countryCodes, decodeCountryByte, decodeCountryText } from '@piqy/epos-codepages/international'
import { page000 } from '@piqy/epos-codepages/pages/page-000'
import { describe, expect, it } from '@effect/vitest'
import { Effect, Struct } from 'effect'

import { encode } from '../src/index.js'

const textPrefix = (country: Country) =>
	Uint8Array.of(0x1b, 0x40, 0x1b, 0x61, 0x00, 0x1b, 0x7b, 0x00, ...(country === 'usa' ? [] : [0x1b, 0x52, countryCodes[country]]))

const encodeText = (value: string, country: Country) =>
	encode({ type: 'root', children: [{ type: 'text', value, country, codepage: 0 }] }).pipe(Effect.provide(codepageLayer([page000])))

const tableEntries = (country: Country) =>
	Object.entries(countryCharacterTables[country]).flatMap(([byte, token]) => (token === undefined ? [] : [{ byte: Number(byte), token }]))

describe('international character set round trip', () => {
	it.effect(
		'encodes each table token of every country to its byte and decodes the byte to the same token',
		Effect.fn(function* () {
			for (const country of Struct.keys(countryCodes)) {
				for (const { byte, token } of tableEntries(country)) {
					const bytes = yield* encodeText(token, country)
					expect(bytes, `${country} ${token}`).toStrictEqual(Uint8Array.of(...textPrefix(country), byte))
					expect(decodeCountryByte(byte, country), `${country} byte ${byte}`).toBe(token)
				}
			}
		}),
	)

	it.effect(
		'round trips all table tokens of every country in one text',
		Effect.fn(function* () {
			for (const country of Struct.keys(countryCodes)) {
				const entries = tableEntries(country)
				const value = entries.map(({ token }) => token).join('')
				const bytes = yield* encodeText(value, country)
				const prefix = textPrefix(country)
				expect(bytes.subarray(0, prefix.length), country).toStrictEqual(prefix)
				const text = bytes.subarray(prefix.length)
				expect(text, country).toStrictEqual(Uint8Array.from(entries, ({ byte }) => byte))
				expect(decodeCountryText(text, country), country).toBe(value)
			}
		}),
	)

	it.effect(
		'round trips Tamil tokens that start with the same character',
		Effect.fn(function* () {
			const value = 'கா க கூ'
			const bytes = yield* encodeText(value, 'india-tamil')
			const text = bytes.subarray(textPrefix('india-tamil').length)
			expect(text).toStrictEqual(Uint8Array.of(0x36, 0x20, 0x31, 0x20, 0x39))
			expect(decodeCountryText(text, 'india-tamil')).toBe(value)
		}),
	)
})
