import type { Root } from '@piqy/epos-ast'

import { concat, ESC, hex } from './commands.js'
import type { EncoderExtension } from './extension.js'
import type { HandlersRecord } from './handlers.js'
import { applyPostProcess, prepareEncoder } from './internal.js'

export interface EncodeOptions {
	handlers?: Partial<HandlersRecord>
	extensions?: EncoderExtension[]
	codepage?: number
}

/**
 * Encodes an EPOS AST to binary ESC/POS data.
 */
export const encode = (ast: Root, options: EncodeOptions = {}) => {
	const { ctx, extensions } = prepareEncoder(options)

	const chunks: Uint8Array[] = []

	chunks.push(hex(ESC, '@')) // initialize
	for (const child of ast.children) {
		chunks.push(ctx.encode(child))
	}

	const output = concat(...chunks)
	return applyPostProcess(output, extensions)
}
