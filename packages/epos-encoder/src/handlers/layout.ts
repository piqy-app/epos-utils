import type { Align, CharacterSpacing, LineSpacing, Margin, Position, PrintArea, TabStops } from '@piqy/epos-ast'

import { concat, ESC, GS, hex, NUL } from '../commands.js'
import type { Handler } from '../handlers.js'
import { encodeChildren } from './shared.js'

const lineSpacingCmd = (spacing: number | 'default') => (spacing === 'default' ? hex(ESC, '2') : hex(ESC, '3', spacing))

/**
 * Encodes text alignment (left, center, right).
 * Sets desired alignment, encodes children, then restores previous alignment.
 * Actual emission happens in text handler when alignment differs from lineAlignment.
 * @see https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_la.html ESC a - Select justification
 */
export const align: Handler<Align> = (node, ctx) => {
	const prev = ctx.alignment
	ctx.alignment = node.align
	const result = encodeChildren(node.children, ctx)
	ctx.alignment = prev
	return result
}

/**
 * Encodes line spacing configuration.
 * @see https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_2.html ESC 2 - Select default line spacing
 * @see https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_3.html ESC 3 - Set line spacing
 */
export const lineSpacing: Handler<LineSpacing> = (node, ctx) => {
	const prev = ctx.lineSpacing
	ctx.lineSpacing = node.spacing
	const result = encodeChildren(node.children, ctx)
	ctx.lineSpacing = prev
	return concat(lineSpacingCmd(node.spacing), result, lineSpacingCmd(prev))
}

/**
 * Encodes right-side character spacing.
 * @see https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_space.html ESC SP - Set right-side character spacing
 */
export const characterSpacing: Handler<CharacterSpacing> = (node, ctx) => {
	const prev = ctx.characterSpacing
	ctx.characterSpacing = node.spacing
	const result = encodeChildren(node.children, ctx)
	ctx.characterSpacing = prev
	return concat(hex(ESC, ' ', node.spacing), result, hex(ESC, ' ', prev))
}

/**
 * Encodes left margin configuration.
 * @see https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_cl.html GS L - Set left margin
 */
export const margin: Handler<Margin> = (node, ctx) => {
	const prev = ctx.marginLeft
	ctx.marginLeft = node.left
	const result = encodeChildren(node.children, ctx)
	ctx.marginLeft = prev
	return concat(hex(GS, 'L', node.left & 0xff, (node.left >> 8) & 0xff), result, hex(GS, 'L', prev & 0xff, (prev >> 8) & 0xff))
}

/**
 * Encodes print area width configuration.
 * @see https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_cw.html GS W - Set print area width
 */
export const printArea: Handler<PrintArea> = (node, ctx) => {
	const prev = ctx.printAreaWidth
	ctx.printAreaWidth = node.width
	const result = encodeChildren(node.children, ctx)
	ctx.printAreaWidth = prev
	return concat(hex(GS, 'W', node.width & 0xff, (node.width >> 8) & 0xff), result, hex(GS, 'W', prev & 0xff, (prev >> 8) & 0xff))
}

/**
 * Encodes horizontal tab stop positions.
 * @see https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_cd.html ESC D - Set horizontal tab positions
 */
export const tabStops: Handler<TabStops> = (node, ctx) => {
	const prev = ctx.tabStops
	ctx.tabStops = node.stops
	const setCmd = node.stops.length > 0 ? hex(ESC, 'D', ...node.stops, NUL) : hex(ESC, 'D', NUL)
	const result = encodeChildren(node.children, ctx)
	ctx.tabStops = prev
	const restoreCmd = prev.length > 0 ? hex(ESC, 'D', ...prev, NUL) : hex(ESC, 'D', NUL)
	return concat(setCmd, result, restoreCmd)
}

/**
 * Encodes absolute or relative horizontal print position.
 * @see https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_dollarssign.html ESC $ - Set absolute print position
 * @see https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_backslash.html ESC \ - Set relative print position
 */
export const position: Handler<Position> = (node) => {
	const nL = node.horizontal & 0xff
	const nH = (node.horizontal >> 8) & 0xff

	if (node.mode === 'absolute') {
		return hex(ESC, '$', nL, nH)
	}
	return hex(ESC, '\\', nL, nH)
}
