import type { Nodes } from '@piqy/epos-ast'
import type { Effect } from 'effect'

import type { EncoderContext } from './context.js'
import type { EncoderError } from './errors.js'

/**
 * Effect-native handler function that encodes an AST node to ESC/POS bytes.
 * Pure byte creation can stay inside `Effect.succeed` or `Effect.sync`.
 */
export type Handler<N extends Nodes = Nodes> = {
	bivarianceHack(node: N, ctx: EncoderContext): Effect.Effect<Uint8Array, EncoderError>
}['bivarianceHack']

/**
 * Record mapping node types to their handlers.
 */
export type HandlersRecord = Partial<Record<Nodes['type'], Handler>>
