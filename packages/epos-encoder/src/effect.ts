import type { FlowContent } from '@piqy/epos-ast'
import { Stream } from 'effect'

import { ESC, hex } from './commands.js'
import type { EncodeOptions } from './encoder.js'
import { applyPostProcess, prepareEncoder } from './internal.js'

/**
 * Converts a stream of EPOS AST nodes to ESC/POS byte chunks.
 */
export const encodeStream = <E, R>(
	stream: Stream.Stream<FlowContent, E, R>,
	options: EncodeOptions = {},
): Stream.Stream<Uint8Array, E, R> =>
	Stream.suspend(() => {
		const { ctx, extensions } = prepareEncoder(options)
		let initialized = false

		return Stream.mapConcat(stream, (node) => {
			const chunks: Uint8Array[] = []

			if (!initialized) {
				chunks.push(hex(ESC, '@'))
				initialized = true
			}

			const bytes = applyPostProcess(ctx.encode(node), extensions)
			if (bytes.length > 0) {
				chunks.push(bytes)
			}

			return chunks
		})
	})
