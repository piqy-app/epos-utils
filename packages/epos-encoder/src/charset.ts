import type { Country } from '@piqy/epos-ast'
import { countryCharacterTables as CHARSET_TABLES, type CountryCharacterTable as CharTable } from '@piqy/epos-codepages/international'

export { countryCodes as COUNTRY_CODES } from '@piqy/epos-codepages/international'

interface CountryEncoding {
	readonly byte: number
	readonly token: string
}

const countryEncodingTables = new Map<Country, ReadonlyMap<string, readonly CountryEncoding[]>>()

const getCountryEncodings = (country: Country) => {
	const cached = countryEncodingTables.get(country)
	if (cached !== undefined) {
		return cached
	}
	const table: CharTable = CHARSET_TABLES[country]
	const encodings = new Map<string, CountryEncoding[]>()
	for (const [byte, token] of Object.entries(table)) {
		if (token === undefined) {
			continue
		}
		const firstCodePoint = token.codePointAt(0)
		if (firstCodePoint === undefined) {
			continue
		}
		const firstCharacter = String.fromCodePoint(firstCodePoint)
		const candidates = encodings.get(firstCharacter) ?? []
		candidates.push({ byte: Number(byte), token })
		candidates.sort((left, right) => right.token.length - left.token.length)
		encodings.set(firstCharacter, candidates)
	}
	countryEncodingTables.set(country, encodings)
	return encodings
}

export const matchCountryEncoding = (text: string, index: number, country: Country) => {
	const codePoint = text.codePointAt(index)
	if (codePoint === undefined) {
		return undefined
	}
	const character = String.fromCodePoint(codePoint)
	return getCountryEncodings(country)
		.get(character)
		?.find((encoding) => text.startsWith(encoding.token, index))
}

export const hasCountryByte = (bytes: Uint8Array, country: Country) => {
	const table: CharTable = CHARSET_TABLES[country]
	for (const byte of bytes) {
		if (table[byte] !== undefined) {
			return true
		}
	}
	return false
}
