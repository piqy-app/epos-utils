/**
 * Independently implemented from Epson reference character page 70 and ISCII.
 * Assamese replaces Bengali RA at 0xcf and adds Assamese VA at 0xd4.
 */
import { assameseIsciiHigh } from '../internal/bengali-assamese.js'
import { singleByte } from '../single-byte.js'

export const page070 = singleByte({
	page: 70,
	name: 'Assamese ISCII',
	high: assameseIsciiHigh(),
})
