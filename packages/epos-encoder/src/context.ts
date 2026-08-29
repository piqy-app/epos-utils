import type { AlignType, Country, Nodes } from '@piqy/epos-ast'
import type { CodepageRegistry } from '@piqy/epos-codepages'
import { Effect } from 'effect'

import type { EncodeOptions } from './encoder.js'
import { UnsupportedNodeError, type EncoderError } from './errors.js'
import { defaultHandlers } from './handlers/index.js'

/**
 * Context passed through AST traversal during encoding.
 */
export interface EncoderContext {
	codepage: number
	country: Country | undefined
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

/** Creates independent state for one encoder execution. */
export const createEncoderContext = (options: Required<EncodeOptions>, codepages: CodepageRegistry.Service) => {
	const ctx: EncoderContext = {
		codepage: options.codepage,
		country: 'usa',
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
		usedCodepages: new Set([options.codepage]),

		encode(node) {
			return Effect.suspend(() => {
				const handler = defaultHandlers[node.type]
				if (handler === undefined) {
					return new UnsupportedNodeError({ nodeType: node.type })
				}
				return handler(node, ctx)
			})
		},
	}

	return ctx
}
