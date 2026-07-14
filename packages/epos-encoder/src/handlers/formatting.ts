import type {
	Color,
	DoubleStrike,
	Font,
	FontType,
	Inverted,
	Rotated,
	Scaled,
	Smoothing,
	Strong,
	Underline,
	UpsideDown,
} from '@piqy/epos-ast'

import { concat, ESC, GS, hex } from '../commands.js'
import type { Handler } from '../handlers.js'
import { encodeChildren } from './shared.js'

const FONT_MAP: Record<FontType, number> = {
	A: 0,
	B: 1,
	C: 2,
	D: 3,
	E: 4,
	specialA: 97,
	specialB: 98,
}

/**
 * Encodes bold/emphasized text.
 * @see https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_ce.html ESC E - Turn emphasized mode on/off
 */
export const strong: Handler<Strong> = (node, ctx) => concat(hex(ESC, 'E', 0x01), encodeChildren(node.children, ctx), hex(ESC, 'E', 0x00))

/**
 * Encodes underlined text.
 * @see https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_minus.html ESC - - Turn underline mode on/off
 */
export const underline: Handler<Underline> = (node, ctx) => {
	const n = node.double ? 2 : 1
	return concat(hex(ESC, '-', n), encodeChildren(node.children, ctx), hex(ESC, '-', 0))
}

/**
 * Encodes inverted (white on black) text.
 * @see https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_cb.html GS B - Turn white/black reverse print mode on/off
 */
export const inverted: Handler<Inverted> = (node, ctx) => concat(hex(GS, 'B', 0x01), encodeChildren(node.children, ctx), hex(GS, 'B', 0x00))

/**
 * Encodes scaled text with width/height multipliers.
 * @see https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_exclamation.html GS ! - Select character size
 */
export const scaled: Handler<Scaled> = (node, ctx) => {
	const n = ((node.width - 1) << 4) | (node.height - 1)
	return concat(hex(GS, '!', n), encodeChildren(node.children, ctx), hex(GS, '!', 0x00))
}

/**
 * Encodes 90° clockwise rotated text.
 * @see https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_cv.html ESC V - Turn 90° clockwise rotation mode on/off
 */
export const rotated: Handler<Rotated> = (node, ctx) => {
	const n = node.spacing === 1.5 ? 2 : 1
	return concat(hex(ESC, 'V', n), encodeChildren(node.children, ctx), hex(ESC, 'V', 0x00))
}

/**
 * Encodes upside-down printed text.
 * @see https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_lbrace.html ESC { - Turn upside-down print mode on/off
 */
export const upsideDown: Handler<UpsideDown> = (node, ctx) => {
	const prev = ctx.upsideDown
	ctx.upsideDown = true
	const result = encodeChildren(node.children, ctx)
	ctx.upsideDown = prev
	return result
}

/**
 * Encodes smoothed character rendering (for 4x+ sized characters).
 * @see https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lb.html GS b - Turn smoothing mode on/off
 */
export const smoothing: Handler<Smoothing> = (node, ctx) =>
	concat(hex(GS, 'b', 0x01), encodeChildren(node.children, ctx), hex(GS, 'b', 0x00))

/**
 * Encodes double-strike printed text.
 * @see https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_cg.html ESC G - Turn double-strike mode on/off
 */
export const doubleStrike: Handler<DoubleStrike> = (node, ctx) =>
	concat(hex(ESC, 'G', 0x01), encodeChildren(node.children, ctx), hex(ESC, 'G', 0x00))

/**
 * Encodes font selection.
 * @see https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_cm.html ESC M - Select character font
 */
export const font: Handler<Font> = (node, ctx) =>
	concat(hex(ESC, 'M', FONT_MAP[node.font]), encodeChildren(node.children, ctx), hex(ESC, 'M', FONT_MAP['A']))

/**
 * Encodes print color selection.
 * @see https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_lr.html ESC r - Select print color
 */
export const color: Handler<Color> = (node, ctx) => {
	const n = node.color === 'red' ? 1 : 0
	return concat(hex(ESC, 'r', n), encodeChildren(node.children, ctx), hex(ESC, 'r', 0x00))
}
