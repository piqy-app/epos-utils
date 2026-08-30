/**
 * Independently transcribed from Epson reference character page 20.
 * Printer-only positional Thai glyphs without Unicode equivalents remain unavailable.
 */
import { thaiArrowExtras, thaiBoxDrawingExtras, thaiCodepage } from '../internal/thai.js'

export const page020 = thaiCodepage({
	page: 20,
	name: 'Thai Character Code 42',
	spaces: [0xa0, 0xff],
	extras: [
		...thaiBoxDrawingExtras,
		...thaiArrowExtras(0x8c),
		...Array.from({ length: 10 }, (_, index) => [0x90 + index, String.fromCodePoint(0x0e50 + index)] as const),
	],
})
