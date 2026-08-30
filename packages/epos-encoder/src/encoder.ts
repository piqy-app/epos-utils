import type { Root } from '@piqy/epos-ast'
import { Effect } from 'effect'

import { concatAll } from './commands.js'
import { prepareEncoder } from './internal.js'

export interface EncodeOptions {
	/** Page selected after printer initialization. Defaults to page 0 (PC437). */
	readonly codepage?: number
	/** Selects pages for text nodes that do not set one. Defaults to true. */
	readonly automaticCodepage?: boolean
}

/**
 * Encodes an EPOS AST to binary ESC/POS data.
 */
export const encode = Effect.fn(function* (ast: Root, options: EncodeOptions = {}) {
	const { ctx, initialization } = yield* prepareEncoder(options)
	const encodedChildren = yield* Effect.forEach(ast.children, (node) => ctx.encode(node))
	encodedChildren.unshift(initialization)
	return concatAll(encodedChildren)
})
