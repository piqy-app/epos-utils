import type { Root } from '@piqy/epos-ast'
import { Effect } from 'effect'

import { concat, ESC, hex } from './commands.js'
import type { EncoderExtension } from './extension.js'
import type { HandlersRecord } from './handlers.js'
import { applyPostProcess, prepareEncoder } from './internal.js'

export interface EncodeOptions {
	readonly handlers?: Partial<HandlersRecord>
	readonly extensions?: readonly EncoderExtension[]
	readonly codepage?: number
}

/**
 * Encodes an EPOS AST to binary ESC/POS data.
 */
export const encode = Effect.fn(function* (ast: Root, options: EncodeOptions = {}) {
	const { ctx, extensions } = yield* prepareEncoder(options)
	const encodedChildren = yield* Effect.forEach(ast.children, (node) => ctx.encode(node))
	return yield* applyPostProcess(concat(hex(ESC, '@'), ...encodedChildren), extensions)
})
