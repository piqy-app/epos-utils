import type { Align, CharacterSpacing, LineSpacing, Margin, Position, PrintArea, TabStops } from '@piqy/epos-ast'
import { Effect } from 'effect'

import { concat, ESC, GS, hex, NUL } from '../commands.js'
import type { Handler } from '../handlers.js'
import { encodeChildren } from './shared.js'

const lineSpacingCommand = (spacing: number | 'default') => (spacing === 'default' ? hex(ESC, '2') : hex(ESC, '3', spacing))
const tabStopsCommand = (stops: readonly number[]) => hex(ESC, 'D', ...stops, NUL)

/** Encodes text alignment and restores the prior traversal state. */
export const align: Handler<Align> = (node, ctx) =>
	Effect.suspend(() => {
		const previous = ctx.alignment
		ctx.alignment = node.align
		return Effect.ensuring(
			encodeChildren(node.children, ctx),
			Effect.sync(() => {
				ctx.alignment = previous
			}),
		)
	})

/** Encodes line spacing and restores the prior printer setting. */
export const lineSpacing: Handler<LineSpacing> = (node, ctx) =>
	Effect.suspend(() => {
		const previous = ctx.lineSpacing
		ctx.lineSpacing = node.spacing
		return Effect.map(
			Effect.ensuring(
				encodeChildren(node.children, ctx),
				Effect.sync(() => {
					ctx.lineSpacing = previous
				}),
			),
			(bytes) => concat(lineSpacingCommand(node.spacing), bytes, lineSpacingCommand(previous)),
		)
	})

/** Encodes right-side character spacing. */
export const characterSpacing: Handler<CharacterSpacing> = (node, ctx) =>
	Effect.suspend(() => {
		const previous = ctx.characterSpacing
		ctx.characterSpacing = node.spacing
		return Effect.map(
			Effect.ensuring(
				encodeChildren(node.children, ctx),
				Effect.sync(() => {
					ctx.characterSpacing = previous
				}),
			),
			(bytes) => concat(hex(ESC, ' ', node.spacing), bytes, hex(ESC, ' ', previous)),
		)
	})

/** Encodes the left margin. */
export const margin: Handler<Margin> = (node, ctx) =>
	Effect.suspend(() => {
		const previous = ctx.marginLeft
		ctx.marginLeft = node.left
		return Effect.map(
			Effect.ensuring(
				encodeChildren(node.children, ctx),
				Effect.sync(() => {
					ctx.marginLeft = previous
				}),
			),
			(bytes) =>
				concat(hex(GS, 'L', node.left & 0xff, (node.left >> 8) & 0xff), bytes, hex(GS, 'L', previous & 0xff, (previous >> 8) & 0xff)),
		)
	})

/** Encodes print-area width. */
export const printArea: Handler<PrintArea> = (node, ctx) =>
	Effect.suspend(() => {
		const previous = ctx.printAreaWidth
		ctx.printAreaWidth = node.width
		return Effect.map(
			Effect.ensuring(
				encodeChildren(node.children, ctx),
				Effect.sync(() => {
					ctx.printAreaWidth = previous
				}),
			),
			(bytes) =>
				concat(hex(GS, 'W', node.width & 0xff, (node.width >> 8) & 0xff), bytes, hex(GS, 'W', previous & 0xff, (previous >> 8) & 0xff)),
		)
	})

/** Encodes horizontal tab stops. */
export const tabStops: Handler<TabStops> = (node, ctx) =>
	Effect.suspend(() => {
		const previous = ctx.tabStops
		ctx.tabStops = [...node.stops]
		return Effect.map(
			Effect.ensuring(
				encodeChildren(node.children, ctx),
				Effect.sync(() => {
					ctx.tabStops = previous
				}),
			),
			(bytes) => concat(tabStopsCommand(node.stops), bytes, tabStopsCommand(previous)),
		)
	})

/** Encodes an absolute or relative horizontal print position. */
export const position: Handler<Position> = (node) =>
	Effect.sync(() => {
		const low = node.horizontal & 0xff
		const high = (node.horizontal >> 8) & 0xff
		return node.mode === 'absolute' ? hex(ESC, '$', low, high) : hex(ESC, '\\', low, high)
	})
