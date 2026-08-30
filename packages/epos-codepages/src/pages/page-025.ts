/**
 * Independently transcribed from Epson reference character page 25.
 * Printer-only positional Thai glyphs without Unicode equivalents remain unavailable.
 */
import { thaiArrowExtras, thaiCodepage } from '../internal/thai.js'

export const page025 = thaiCodepage({
	page: 25,
	name: 'Thai Character Code 17',
	spaces: [0xa0],
	extras: [
		[0x95, '│'],
		[0x96, '─'],
		[0x97, '┼'],
		[0x98, '┌'],
		[0x99, '┐'],
		[0x9a, '└'],
		[0x9b, '┘'],
		[0x9c, '├'],
		[0x9d, '┬'],
		[0x9e, '┤'],
		[0x9f, '┴'],
		...thaiArrowExtras(0xfc),
	],
})
