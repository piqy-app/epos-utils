import type { Nodes } from '@piqy/epos-ast'
import type { Effect } from 'effect'

import type { EncoderContext } from './context.js'
import type { EncoderError } from './errors.js'

/**
 * Encodes one AST node and reports expected failures through Effect.
 * The method form permits handlers for specific node types in the shared registry.
 */
export type Handler<N extends Nodes = Nodes> = {
	encode(node: N, ctx: EncoderContext): Effect.Effect<Uint8Array, EncoderError>
}['encode']

/**
 * Record mapping node types to their handlers.
 */
export type HandlersRecord = Partial<Record<Nodes['type'], Handler>>
