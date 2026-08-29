import type { AlignType, Country, Nodes } from '@piqy/epos-ast'
import type { CodepageRegistry } from '@piqy/epos-codepages'
import { Effect } from 'effect'

import type { EncodeOptions } from './encoder.js'
import { UnsupportedNodeError, type EncoderError } from './errors.js'
import type { HandlersRecord } from './handlers.js'

/**
 * Context passed through AST traversal during encoding.
 */
export interface EncoderContext {
	codepage: number
	country: Country | undefined
	readonly handlers: HandlersRecord
	readonly options: Required<EncodeOptions>
	readonly codepages: CodepageRegistry.Service

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
	readonly usedCodepages: Set<number>

	encode(node: Nodes): Effect.Effect<Uint8Array, EncoderError>
}

/**
 * Creates an EncoderContext with the given options and handlers.
 */
export const createEncoderContext = (
	handlers: HandlersRecord,
	options: Required<EncodeOptions>,
	codepage: number,
	codepages: CodepageRegistry.Service,
) => {
	const ctx: EncoderContext = {
		codepage,
		country: 'usa',
		handlers,
		options,
		codepages,
		alignment: 'left',
		lineAlignment: null,
		upsideDown: false,
		lineUpsideDown: null,
		lineSpacing: 'default',
		characterSpacing: 0,
		marginLeft: 0,
		printAreaWidth: 0,
		tabStops: [],
		usedCodepages: new Set([codepage]),

		encode(node) {
			return Effect.suspend(() => {
				const handler = handlers[node.type]
				if (handler === undefined) {
					return new UnsupportedNodeError({ nodeType: node.type })
				}
				return handler(node, ctx)
			})
		},
	}

	return ctx
}
