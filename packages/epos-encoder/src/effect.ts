import type { FlowContent } from '@piqy/epos-ast'
import { Effect, Stream } from 'effect'

import { ESC, hex } from './commands.js'
import type { EncodeOptions } from './encoder.js'
import { applyPostProcess, prepareEncoder } from './internal.js'

/**
 * Converts a stream of EPOS AST nodes to ESC/POS byte chunks.
 *
 * Each stream execution gets an isolated encoder context. State is shared only
 * between nodes in that execution.
 */
export const encodeStream = <E, R>(stream: Stream.Stream<FlowContent, E, R>, options: EncodeOptions = {}) =>
	Stream.unwrap(
		Effect.map(prepareEncoder(options), ({ ctx, extensions }) =>
			Stream.concat(
				Stream.make(hex(ESC, '@')),
				Stream.mapEffect(stream, (node) => Effect.flatMap(ctx.encode(node), (bytes) => applyPostProcess(bytes, extensions))),
			),
		),
	)
