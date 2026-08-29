/**
 * Independently transcribed from Epson reference character page 20.
 * Printer-only positional Thai glyphs without Unicode equivalents remain unavailable.
 */
import { thaiCodepage } from '../internal/thai.js'

export const page020 = thaiCodepage({
	page: 20,
	name: 'Thai Character Code 42',
	spaces: [0xa0, 0xff],
	extras: [
		[0x80, '┌'],
		[0x81, '┐'],
		[0x82, '└'],
		[0x83, '┘'],
		[0x84, '│'],
		[0x85, '─'],
		[0x86, '├'],
		[0x87, '┤'],
		[0x88, '┴'],
		[0x89, '┬'],
		[0x8a, '┼'],
		[0x8b, '█'],
		[0x8c, '←'],
		[0x8d, '↑'],
		[0x8e, '→'],
		[0x8f, '↓'],
		...Array.from({ length: 10 }, (_, index) => [0x90 + index, String.fromCodePoint(0x0e50 + index)] as const),
	],
})
