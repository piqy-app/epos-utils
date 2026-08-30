import type { SingleByteCodepageDefinition } from '../model.js'
import { singleByte } from '../single-byte.js'

const REPLACEMENT_CHARACTER = '\uFFFD'
const HIGH_START = 0x80

interface ThaiCodepageDefinition {
	readonly page: number
	readonly name: string
	readonly spaces?: readonly number[]
	readonly extras?: readonly (readonly [byte: number, character: string])[]
}

const sequentialExtras = (start: number, characters: string) =>
	Array.from(characters, (character, index) => [start + index, character] as const)

export const thaiBoxDrawingExtras = sequentialExtras(0x80, '┌┐└┘│─├┤┴┬┼█')
export const thaiArrowExtras = (start: number) => sequentialExtras(start, '←↑→↓')

const thaiHigh = (definition: ThaiCodepageDefinition) => {
	const high = Array.from({ length: 128 }, () => REPLACEMENT_CHARACTER)
	const set = (byte: number, character: string) => {
		high[byte - HIGH_START] = character
	}

	for (let byte = 0xa1; byte <= 0xda; byte++) {
		set(byte, String.fromCodePoint(0x0e01 + byte - 0xa1))
	}
	set(0xdf, '฿')
	for (let byte = 0xe0; byte <= 0xfb; byte++) {
		set(byte, String.fromCodePoint(0x0e40 + byte - 0xe0))
	}
	for (const byte of definition.spaces ?? []) {
		set(byte, ' ')
	}
	for (const [byte, character] of definition.extras ?? []) {
		set(byte, character)
	}
	return high.join('')
}

/** Creates one Epson Thai table while sharing its TIS-620-compatible repertoire. */
export const thaiCodepage = (definition: ThaiCodepageDefinition) =>
	singleByte({
		page: definition.page,
		name: definition.name,
		high: thaiHigh(definition),
	} satisfies SingleByteCodepageDefinition)
