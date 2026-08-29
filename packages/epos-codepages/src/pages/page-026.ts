/**
 * Independently transcribed from Epson reference character page 26.
 * Printer-only positional Thai glyphs without Unicode equivalents remain unavailable.
 */
import { thaiArrowExtras, thaiBoxDrawingExtras, thaiCodepage } from '../internal/thai.js'

export const page026 = thaiCodepage({
	page: 26,
	name: 'Thai Character Code 18',
	spaces: [0xa0, 0xff],
	extras: [...thaiBoxDrawingExtras, ...thaiArrowExtras(0x8c)],
})
