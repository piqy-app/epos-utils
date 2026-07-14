/**
 * Converts a character string or number to its char code.
 */
export const charCode = (c: number | string): number => (typeof c === 'string' ? c.charCodeAt(0) : c)

/**
 * Creates a Uint8Array from a sequence of bytes.
 */
export const hex = (...bytes: (number | string)[]) => new Uint8Array(bytes.map(charCode))

/**
 * Encodes a string as UTF-8 bytes.
 */
export const str = (s: string) => new TextEncoder().encode(s)

/**
 * Concatenates multiple Uint8Arrays into one.
 */
export const concat = (...arrays: Uint8Array[]) => {
	const len = arrays.reduce((acc, a) => acc + a.length, 0)
	const result = new Uint8Array(len)
	let offset = 0
	for (const a of arrays) {
		result.set(a, offset)
		offset += a.length
	}
	return result
}

/**
 * Encodes a 16-bit little-endian length as [pL, pH].
 */
export const len16 = (n: number) => [n & 0xff, (n >> 8) & 0xff] as const
