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
import { Effect } from 'effect'

import { concat, ESC, GS, hex } from '../commands.js'
import type { Handler } from '../handlers.js'
import { encodeChildren } from './shared.js'

const FONT_MAP = {
	A: 0,
	B: 1,
	C: 2,
	D: 3,
	E: 4,
	specialA: 97,
	specialB: 98,
} satisfies Record<FontType, number>

/** Encodes bold or emphasized text. */
export const strong: Handler<Strong> = (node, ctx) =>
	Effect.map(encodeChildren(node.children, ctx), (bytes) => concat(hex(ESC, 'E', 0x01), bytes, hex(ESC, 'E', 0x00)))

/** Encodes underlined text. */
export const underline: Handler<Underline> = (node, ctx) => {
	const width = node.double ? 2 : 1
	return Effect.map(encodeChildren(node.children, ctx), (bytes) => concat(hex(ESC, '-', width), bytes, hex(ESC, '-', 0)))
}

/** Encodes inverted text. */
export const inverted: Handler<Inverted> = (node, ctx) =>
	Effect.map(encodeChildren(node.children, ctx), (bytes) => concat(hex(GS, 'B', 0x01), bytes, hex(GS, 'B', 0x00)))

/** Encodes scaled text. */
export const scaled: Handler<Scaled> = (node, ctx) => {
	const size = ((node.width - 1) << 4) | (node.height - 1)
	return Effect.map(encodeChildren(node.children, ctx), (bytes) => concat(hex(GS, '!', size), bytes, hex(GS, '!', 0x00)))
}

/** Encodes 90-degree clockwise rotated text. */
export const rotated: Handler<Rotated> = (node, ctx) => {
	const spacing = node.spacing === 1.5 ? 2 : 1
	return Effect.map(encodeChildren(node.children, ctx), (bytes) => concat(hex(ESC, 'V', spacing), bytes, hex(ESC, 'V', 0x00)))
}

/** Encodes upside-down text and restores the prior traversal state. */
export const upsideDown: Handler<UpsideDown> = (node, ctx) =>
	Effect.suspend(() => {
		const previous = ctx.upsideDown
		ctx.upsideDown = true
		return Effect.ensuring(
			encodeChildren(node.children, ctx),
			Effect.sync(() => {
				ctx.upsideDown = previous
			}),
		)
	})

/** Encodes smoothed text. */
export const smoothing: Handler<Smoothing> = (node, ctx) =>
	Effect.map(encodeChildren(node.children, ctx), (bytes) => concat(hex(GS, 'b', 0x01), bytes, hex(GS, 'b', 0x00)))

/** Encodes double-strike text. */
export const doubleStrike: Handler<DoubleStrike> = (node, ctx) =>
	Effect.map(encodeChildren(node.children, ctx), (bytes) => concat(hex(ESC, 'G', 0x01), bytes, hex(ESC, 'G', 0x00)))

/** Encodes font selection. */
export const font: Handler<Font> = (node, ctx) =>
	Effect.map(encodeChildren(node.children, ctx), (bytes) => concat(hex(ESC, 'M', FONT_MAP[node.font]), bytes, hex(ESC, 'M', FONT_MAP.A)))

/** Encodes print color selection. */
export const color: Handler<Color> = (node, ctx) => {
	const colorCode = node.color === 'red' ? 1 : 0
	return Effect.map(encodeChildren(node.children, ctx), (bytes) => concat(hex(ESC, 'r', colorCode), bytes, hex(ESC, 'r', 0x00)))
}
