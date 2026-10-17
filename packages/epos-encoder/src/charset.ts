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

const maxCountryTokenLengths = new Map<Country, number>()

/**
 * Returns the UTF-16 length from index to the end of the country-table token that starts at or covers index.
 * A covered index occurs when planning reaches the second character of a token such as Tamil கா.
 */
export const countryTokenLengthAt = (country: Country) => (text: string, index: number) => {
	let maxLength = maxCountryTokenLengths.get(country)
	if (maxLength === undefined) {
		maxLength = Math.max(...Object.values(CHARSET_TABLES[country]).map((token) => token.length))
		maxCountryTokenLengths.set(country, maxLength)
	}
	for (let start = index; start >= 0 && start > index - maxLength; start--) {
		const end = start + (matchCountryEncoding(text, start, country)?.token.length ?? 0)
		if (end > index) {
			return end - index
		}
	}
	return undefined
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

/** Returns the byte positions that the country table reassigns. */
export const countryTableBytes = (country: Country) => Object.keys(CHARSET_TABLES[country]).map(Number)
