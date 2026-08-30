import type { Country } from '@piqy/epos-ast'

/**
 * ESC/POS country code mapping (ESC R n command).
 */
export const COUNTRY_CODES = {
	usa: 0,
	france: 1,
	germany: 2,
	uk: 3,
	'denmark-1': 4,
	sweden: 5,
	italy: 6,
	'spain-1': 7,
	japan: 8,
	norway: 9,
	'denmark-2': 10,
	'spain-2': 11,
	'latin-america': 12,
	korea: 13,
	slovenia: 14,
	china: 15,
	vietnam: 16,
	arabia: 17,
	'india-devanagari': 66,
	'india-bengali': 67,
	'india-tamil': 68,
	'india-telugu': 69,
	'india-assamese': 70,
	'india-oriya': 71,
	'india-kannada': 72,
	'india-malayalam': 73,
	'india-gujarati': 74,
	'india-punjabi': 75,
	'india-marathi': 82,
} satisfies Record<Country, number>

type CharTable = Partial<Record<number, string>>

const BASE_CHARSET_TABLES = {
	usa: {
		35: '#',
		36: '$',
		64: '@',
		91: '[',
		92: '\\',
		93: ']',
		94: '^',
		96: '`',
		123: '{',
		124: '|',
		125: '}',
		126: '~',
	},
	france: {
		35: '#',
		36: '$',
		64: 'à',
		91: '°',
		92: 'ç',
		93: '§',
		94: '^',
		96: '`',
		123: 'é',
		124: 'ù',
		125: 'è',
		126: '¨',
	},
	germany: {
		35: '#',
		36: '$',
		64: '§',
		91: 'Ä',
		92: 'Ö',
		93: 'Ü',
		94: '^',
		96: '`',
		123: 'ä',
		124: 'ö',
		125: 'ü',
		126: 'ß',
	},
	uk: {
		35: '£',
		36: '$',
		64: '@',
		91: '[',
		92: '\\',
		93: ']',
		94: '^',
		96: '`',
		123: '{',
		124: '|',
		125: '}',
		126: '~',
	},
	'denmark-1': {
		35: '#',
		36: '$',
		64: '@',
		91: 'Æ',
		92: 'Ø',
		93: 'Å',
		94: '^',
		96: '`',
		123: 'æ',
		124: 'ø',
		125: 'å',
		126: '~',
	},
	sweden: {
		35: '#',
		36: '¤',
		64: 'É',
		91: 'Ä',
		92: 'Ö',
		93: 'Å',
		94: 'Ü',
		96: 'é',
		123: 'ä',
		124: 'ö',
		125: 'å',
		126: 'ü',
	},
	italy: {
		35: '#',
		36: '$',
		64: '@',
		91: '°',
		92: '\\',
		93: 'é',
		94: '^',
		96: 'ù',
		123: 'à',
		124: 'ò',
		125: 'è',
		126: 'ì',
	},
	'spain-1': {
		35: '₧',
		36: '$',
		64: '@',
		91: '¡',
		92: 'Ñ',
		93: '¿',
		94: '^',
		96: '`',
		123: '¨',
		124: 'ñ',
		125: '}',
		126: '~',
	},
	japan: {
		35: '#',
		36: '$',
		64: '@',
		91: '[',
		92: '¥',
		93: ']',
		94: '^',
		96: '`',
		123: '{',
		124: '|',
		125: '}',
		126: '~',
	},
	norway: {
		35: '#',
		36: '¤',
		64: 'É',
		91: 'Æ',
		92: 'Ø',
		93: 'Å',
		94: 'Ü',
		96: 'é',
		123: 'æ',
		124: 'ø',
		125: 'å',
		126: 'ü',
	},
	'denmark-2': {
		35: '#',
		36: '$',
		64: 'É',
		91: 'Æ',
		92: 'Ø',
		93: 'Å',
		94: 'Ü',
		96: 'é',
		123: 'æ',
		124: 'ø',
		125: 'å',
		126: 'ü',
	},
	'spain-2': {
		35: '#',
		36: '$',
		64: 'á',
		91: '¡',
		92: 'Ñ',
		93: '¿',
		94: 'é',
		96: '`',
		123: 'í',
		124: 'ñ',
		125: 'ó',
		126: 'ú',
	},
	'latin-america': {
		35: '#',
		36: '$',
		64: 'á',
		91: '¡',
		92: 'Ñ',
		93: '¿',
		94: 'é',
		96: 'ü',
		123: 'í',
		124: 'ñ',
		125: 'ó',
		126: 'ú',
	},
	korea: {
		35: '#',
		36: '$',
		64: '@',
		91: '[',
		92: '₩',
		93: ']',
		94: '^',
		96: '`',
		123: '{',
		124: '|',
		125: '}',
		126: '~',
	},
	slovenia: {
		35: '#',
		36: '$',
		64: 'Ž',
		91: 'Š',
		92: 'Đ',
		93: 'Ć',
		94: 'Č',
		96: 'ž',
		123: 'š',
		124: 'đ',
		125: 'ć',
		126: 'č',
	},
	china: {
		35: '#',
		36: '¥',
		64: '@',
		91: '[',
		92: '\\',
		93: ']',
		94: '^',
		96: '`',
		123: '{',
		124: '|',
		125: '}',
		126: '~',
	},
	vietnam: {
		35: 'đ',
		36: '$',
		64: '@',
		91: '[',
		92: '\\',
		93: ']',
		94: '^',
		96: '`',
		123: '{',
		124: '|',
		125: '}',
		126: '~',
	},
	arabia: {
		35: '#',
		36: '$',
		64: '\u061c', // arabic letter mark
		91: '[',
		92: '\\',
		93: ']',
		94: '^',
		96: '`',
		123: '{',
		124: '|',
		125: '}',
		126: '~',
	},
} satisfies Partial<Record<Country, CharTable>>

const INDIC_NUMERAL_TABLES = {
	'india-devanagari': {
		48: '०',
		49: '१',
		50: '२',
		51: '३',
		52: '४',
		53: '५',
		54: '६',
		55: '७',
		56: '८',
		57: '९',
	},
	'india-bengali': {
		48: '০',
		49: '১',
		50: '২',
		51: '৩',
		52: '৪',
		53: '৫',
		54: '৬',
		55: '৭',
		56: '৮',
		57: '৯',
	},
	'india-tamil': {
		48: '௦',
		49: 'க',
		50: '௨',
		51: '௩',
		52: '௪',
		53: '௫',
		54: 'கா',
		55: '௭',
		56: '௯',
		57: 'கூ',
	},
	'india-telugu': {
		48: '౦',
		49: '౧',
		50: '౨',
		51: '౩',
		52: '౪',
		53: '౫',
		54: '౬',
		55: '౭',
		56: '౮',
		57: '౯',
	},
	'india-assamese': {
		48: '০',
		49: '১',
		50: '২',
		51: '৩',
		52: '৪',
		53: '৫',
		54: '৬',
		55: '৭',
		56: '৮',
		57: '৯',
	},
	'india-oriya': {
		48: '୦',
		49: '୧',
		50: '୨',
		51: '୩',
		52: '୪',
		53: '୫',
		54: '୬',
		55: '୭',
		56: '୮',
		57: '୯',
	},
	'india-kannada': {
		48: '೦',
		49: '೧',
		50: '೨',
		51: '೩',
		52: '೪',
		53: '೫',
		54: '೬',
		55: '೭',
		56: '೮',
		57: '೯',
	},
	'india-malayalam': {
		48: '൦',
		49: '൧',
		50: '൨',
		51: '൩',
		52: '൪',
		53: '൫',
		54: '൬',
		55: '൭',
		56: '൮',
		57: '൯',
	},
	'india-gujarati': {
		48: '૦',
		49: '૧',
		50: '૨',
		51: '૩',
		52: '૪',
		53: '૫',
		54: '૬',
		55: '૭',
		56: '૮',
		57: '૯',
	},
	'india-punjabi': {
		48: '੦',
		49: '੧',
		50: '੨',
		51: '੩',
		52: '੪',
		53: '੫',
		54: '੬',
		55: '੭',
		56: '੮',
		57: '੯',
	},
	'india-marathi': {
		48: '०',
		49: '१',
		50: '२',
		51: '३',
		52: '४',
		53: '५',
		54: '६',
		55: '७',
		56: '८',
		57: '९',
	},
} satisfies Partial<Record<Country, CharTable>>

/**
 * Character substitution tables per country.
 * Maps byte position to Unicode character.
 */
const CHARSET_TABLES = {
	...BASE_CHARSET_TABLES,
	'india-devanagari': { ...BASE_CHARSET_TABLES.usa, ...INDIC_NUMERAL_TABLES['india-devanagari'] },
	'india-bengali': { ...BASE_CHARSET_TABLES.usa, ...INDIC_NUMERAL_TABLES['india-bengali'] },
	'india-tamil': { ...BASE_CHARSET_TABLES.usa, ...INDIC_NUMERAL_TABLES['india-tamil'] },
	'india-telugu': { ...BASE_CHARSET_TABLES.usa, ...INDIC_NUMERAL_TABLES['india-telugu'] },
	'india-assamese': { ...BASE_CHARSET_TABLES.usa, ...INDIC_NUMERAL_TABLES['india-assamese'] },
	'india-oriya': { ...BASE_CHARSET_TABLES.usa, ...INDIC_NUMERAL_TABLES['india-oriya'] },
	'india-kannada': { ...BASE_CHARSET_TABLES.usa, ...INDIC_NUMERAL_TABLES['india-kannada'] },
	'india-malayalam': { ...BASE_CHARSET_TABLES.usa, ...INDIC_NUMERAL_TABLES['india-malayalam'] },
	'india-gujarati': { ...BASE_CHARSET_TABLES.usa, ...INDIC_NUMERAL_TABLES['india-gujarati'] },
	'india-punjabi': { ...BASE_CHARSET_TABLES.usa, ...INDIC_NUMERAL_TABLES['india-punjabi'] },
	'india-marathi': { ...BASE_CHARSET_TABLES.usa, ...INDIC_NUMERAL_TABLES['india-marathi'] },
} satisfies Record<Country, CharTable>

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
		const firstCharacter = String.fromCodePoint(token.codePointAt(0) ?? 0)
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
