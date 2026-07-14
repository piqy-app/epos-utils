import type { AlignType, Country, Nodes } from '@piqy/epos-ast'

import type { EncodeOptions } from './encoder.js'
import type { HandlersRecord } from './handlers.js'

/**
 * Context passed through AST traversal during encoding.
 */
export interface EncoderContext {
	codepage: number
	country: Country | undefined
	readonly handlers: HandlersRecord
	readonly options: Required<EncodeOptions>

	/** Desired alignment (set by align handler, restored after block) */
	alignment: AlignType
	/** Alignment emitted for current line (null = at line start, nothing emitted yet) */
	lineAlignment: AlignType | null

	/** Desired upside-down state (set by upsideDown handler, restored after block) */
	upsideDown: boolean
	/** Upside-down state emitted for current line (null = at line start, nothing emitted yet) */
	lineUpsideDown: boolean | null

	lineSpacing: number | 'default'
	characterSpacing: number
	marginLeft: number
	printAreaWidth: number
	tabStops: number[]

	encode(node: Nodes): Uint8Array
}

/**
 * Creates an EncoderContext with the given options and handlers.
 */
export const makeEncoderContext = (handlers: HandlersRecord, options: Required<EncodeOptions>, codepage: number): EncoderContext => {
	const ctx: EncoderContext = {
		codepage,
		country: 'usa',
		handlers,
		options,
		alignment: 'left',
		lineAlignment: null,
		upsideDown: false,
		lineUpsideDown: null,
		lineSpacing: 'default',
		characterSpacing: 0,
		marginLeft: 0,
		printAreaWidth: 0,
		tabStops: [],

		encode(node) {
			const handler = handlers[node.type]
			if (!handler) {
				return new Uint8Array(0)
			}
			return handler(node as never, ctx)
		},
	}

	return ctx
}
