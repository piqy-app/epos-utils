import type { Nodes } from '@piqy/epos-ast'

import type { EncoderContext } from './context.js'

/**
 * Handler function that encodes an AST node to ESC/POS bytes.
 */
export type Handler<N extends Nodes = Nodes> = (node: N, ctx: EncoderContext) => Uint8Array

/**
 * Record mapping node types to their handlers.
 */
export type HandlersRecord = {
	[K in Nodes['type']]?: Handler<Extract<Nodes, { type: K }>>
}
