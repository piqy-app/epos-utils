/**
 * Independently transcribed from Epson reference character page 21.
 * Printer-only positional Thai glyphs without Unicode equivalents remain unavailable.
 */
import { thaiCodepage } from '../internal/thai.js'

export const page021 = thaiCodepage({
	page: 21,
	name: 'Thai Character Code 11',
	spaces: [0xff],
	extras: [
		[0x99, '┌'],
		[0x9a, '┐'],
		[0x9b, '└'],
		[0x9c, '┘'],
		[0x9d, '│'],
		[0x9e, '├'],
		[0x9f, '┤'],
		[0xdb, '─'],
		[0xdc, '┴'],
		[0xdd, '┬'],
		[0xde, '┼'],
	],
})
