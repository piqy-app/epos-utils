import type { Country } from '@piqy/epos-ast'
import { describe, expect, it } from '@effect/vitest'

import { countryCharacterTables, countryCodes, countryFromCode, decodeCountryByte, decodeCountryText } from '../src/international.js'

// ESC R n codes from the Epson ESC/POS reference
const epsonCountryCodes: readonly (readonly [code: number, country: Country])[] = [
	[0, 'usa'],
	[1, 'france'],
	[2, 'germany'],
	[3, 'uk'],
	[4, 'denmark-1'],
	[5, 'sweden'],
	[6, 'italy'],
	[7, 'spain-1'],
	[8, 'japan'],
	[9, 'norway'],
	[10, 'denmark-2'],
	[11, 'spain-2'],
	[12, 'latin-america'],
	[13, 'korea'],
	[14, 'slovenia'],
	[15, 'china'],
	[16, 'vietnam'],
	[17, 'arabia'],
	[66, 'india-devanagari'],
	[67, 'india-bengali'],
	[68, 'india-tamil'],
	[69, 'india-telugu'],
	[70, 'india-assamese'],
	[71, 'india-oriya'],
	[72, 'india-kannada'],
	[73, 'india-malayalam'],
	[74, 'india-gujarati'],
	[75, 'india-punjabi'],
	[82, 'india-marathi'],
]

const countries = epsonCountryCodes.map(([, country]) => country)
const lowBytes = Array.from({ length: 0x80 }, (_, byte) => byte)
const highBytes = Array.from({ length: 0x80 }, (_, index) => index + 0x80)

describe('international character set codes', () => {
	it('maps every ESC R code to its country and back', () => {
		for (const [code, country] of epsonCountryCodes) {
			expect(countryFromCode(code), `code ${code}`).toBe(country)
			expect(countryCodes[country], country).toBe(code)
		}
		expect(Object.keys(countryCodes)).toHaveLength(epsonCountryCodes.length)
	})

	it('returns undefined for codes without a character set', () => {
		const knownCodes = new Set(epsonCountryCodes.map(([code]) => code))
		for (let code = 0; code <= 0xff; code++) {
			if (!knownCodes.has(code)) {
				expect(countryFromCode(code), `code ${code}`).toBeUndefined()
			}
		}
		for (const code of [-1, 0.5, 256, Number.NaN]) {
			expect(countryFromCode(code), `code ${code}`).toBeUndefined()
		}
	})
})

describe('international character set decoding', () => {
	it('decodes every byte that a country table lists to the exact table token', () => {
		for (const country of countries) {
			for (const byte of lowBytes) {
				const token = countryCharacterTables[country][byte]
				if (token !== undefined) {
					expect(decodeCountryByte(byte, country), `${country} byte ${byte}`).toBe(token)
				}
			}
		}
	})

	it('decodes every byte below 0x80 that a country table does not list to ASCII', () => {
		for (const country of countries) {
			for (const byte of lowBytes) {
				if (countryCharacterTables[country][byte] === undefined) {
					expect(decodeCountryByte(byte, country), `${country} byte ${byte}`).toBe(String.fromCharCode(byte))
				}
			}
		}
	})

	it('decodes the documented characters of selected countries', () => {
		const cases: readonly (readonly [country: Country, byte: number, token: string])[] = [
			['usa', 0x23, '#'],
			['uk', 0x23, '£'],
			['germany', 0x5b, 'Ä'],
			['germany', 0x7e, 'ß'],
			['france', 0x40, 'à'],
			['japan', 0x5c, '¥'],
			['korea', 0x5c, '₩'],
			['spain-1', 0x23, '₧'],
			['india-devanagari', 0x30, '०'],
			['india-tamil', 0x31, 'க'],
			['india-tamil', 0x36, 'கா'],
			['india-tamil', 0x39, 'கூ'],
			['germany', 0x41, 'A'],
			['germany', 0x0a, '\n'],
		]
		for (const [country, byte, token] of cases) {
			expect(decodeCountryByte(byte, country), `${country} byte ${byte}`).toBe(token)
		}
	})

	it('leaves bytes from 0x80 to the code page', () => {
		for (const country of countries) {
			for (const byte of highBytes) {
				expect(decodeCountryByte(byte, country), `${country} byte ${byte}`).toBeUndefined()
			}
		}
		for (const value of [-1, 0.5, 0x100, Number.NaN]) {
			expect(decodeCountryByte(value, 'usa'), `value ${value}`).toBeUndefined()
		}
	})

	it('decodes byte arrays with multi-character tokens', () => {
		expect(decodeCountryText(Uint8Array.of(0x47, 0x72, 0x7d, 0x7e, 0x65), 'germany')).toBe('Grüße')
		expect(decodeCountryText(Uint8Array.of(0x36, 0x20, 0x39, 0x20, 0x31), 'india-tamil')).toBe('கா கூ க')
		expect(decodeCountryText(new Uint8Array(), 'usa')).toBe('')
	})

	it('decodes byte arrays like single bytes for every country', () => {
		for (const country of countries) {
			const expected = lowBytes.map((byte) => decodeCountryByte(byte, country)).join('')
			expect(decodeCountryText(Uint8Array.from(lowBytes), country), country).toBe(expected)
		}
	})

	it('replaces each byte from 0x80 in byte arrays with U+FFFD', () => {
		expect(decodeCountryText(Uint8Array.of(0x5b, 0x80, 0xff, 0x5d), 'germany')).toBe('Ä\uFFFD\uFFFDÜ')
	})
})

describe('international character tables', () => {
	it('lists only bytes below 0x80 with non-empty tokens', () => {
		for (const country of countries) {
			for (const [byte, token] of Object.entries(countryCharacterTables[country])) {
				expect(Number(byte), `${country} byte ${byte}`).toBeLessThan(0x80)
				expect(token, `${country} byte ${byte}`).not.toBe('')
			}
		}
	})

	it('cannot be changed by an application', () => {
		expect(Object.isFrozen(countryCodes)).toBe(true)
		expect(Object.isFrozen(countryCharacterTables)).toBe(true)
		for (const country of countries) {
			expect(Object.isFrozen(countryCharacterTables[country]), country).toBe(true)
		}
	})
})
