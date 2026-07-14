import type { Cut, Feed, Pulse } from '@piqy/epos-ast'

import { ESC, GS, hex } from '../commands.js'
import type { Handler } from '../handlers.js'

/**
 * Encodes paper feed commands.
 * @see https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_ld.html ESC d - Print and feed n lines
 * @see https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_le.html ESC e - Print and reverse feed n lines
 * @see https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_cj.html ESC J - Print and feed paper
 */
export const feed: Handler<Feed> = (node) => {
	if (node.lines !== undefined) {
		if (node.reverse) {
			return hex(ESC, 'e', node.lines)
		}
		return hex(ESC, 'd', node.lines)
	}

	if (node.units !== undefined) {
		return hex(ESC, 'J', node.units)
	}

	return new Uint8Array(0)
}

/**
 * Encodes paper cut commands.
 * @see https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_cv.html GS V - Select cut mode and cut paper
 * @see https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_li.html ESC i - Partial cut (one point left uncut)
 * @see https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_lm.html ESC m - Partial cut (three points left uncut)
 */
export const cut: Handler<Cut> = (node) => {
	if (node.mode === 'partial-1') {
		if (node.feed !== undefined) {
			return hex(GS, 'V', 'B', node.feed)
		}
		return hex(ESC, 'i')
	}

	if (node.mode === 'partial-3') {
		return hex(ESC, 'm')
	}

	if (node.feed !== undefined) {
		return hex(GS, 'V', 'A', node.feed)
	}
	return hex(GS, 'V', 0)
}

/**
 * Encodes pulse output signal (for cash drawer).
 * @see https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_lp.html ESC p - Generate pulse
 */
export const pulse: Handler<Pulse> = (node) => {
	const pin = node.pin === 'pin5' ? 1 : 0
	return hex(ESC, 'p', pin, node.onTime, node.offTime)
}
