// Control codes
export const NUL = 0x00
export const EOT = 0x04
export const ENQ = 0x05
export const HT = 0x09
export const LF = 0x0a
export const FF = 0x0c
export const CR = 0x0d
export const DLE = 0x10
export const DC4 = 0x14
export const CAN = 0x18
export const ESC = 0x1b
export const FS = 0x1c
export const GS = 0x1d

/**
 * Checks if a byte input is a character string.
 * RETURN TYPE: The predicate establishes the input representation for charCode.
 */
const isCharacter = (input: number | string): input is string => typeof input === 'string'

const charCode = (input: number | string) => (isCharacter(input) ? input.charCodeAt(0) : input)

export const hex = (...bytes: (number | string)[]) => new Uint8Array(bytes.map(charCode))

export const utf8 = (value: string) => new TextEncoder().encode(value)

export const concatAll = (arrays: readonly Uint8Array[]) => {
	let length = 0
	for (const array of arrays) {
		length += array.length
	}
	const result = new Uint8Array(length)
	let offset = 0
	for (const array of arrays) {
		result.set(array, offset)
		offset += array.length
	}
	return result
}

export const concat = (...arrays: Uint8Array[]) => concatAll(arrays)

export const len16 = (length: number) => [length & 0xff, (length >> 8) & 0xff] as const
