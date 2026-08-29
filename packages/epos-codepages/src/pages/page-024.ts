/**
 * Independently transcribed from Epson reference character page 24.
 * Printer-only positional Thai glyphs without Unicode equivalents remain unavailable.
 */
import { thaiArrowExtras, thaiBoxDrawingExtras, thaiCodepage } from '../internal/thai.js'

export const page024 = thaiCodepage({
	page: 24,
	name: 'Thai Character Code 16',
	spaces: [0xa0, 0xff],
	extras: [...thaiBoxDrawingExtras, ...thaiArrowExtras(0x8c)],
})
