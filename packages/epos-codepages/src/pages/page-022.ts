/**
 * Independently transcribed from Epson reference character page 22.
 * Printer-only positional Thai glyphs without Unicode equivalents remain unavailable.
 */
import { thaiArrowExtras, thaiCodepage } from '../internal/thai.js'

export const page022 = thaiCodepage({
	page: 22,
	name: 'Thai Character Code 13',
	spaces: [0x80, 0x85, 0x8a, 0x94, 0x99, 0x9e, 0x9f, 0xa0],
	extras: thaiArrowExtras(0xfc),
})
