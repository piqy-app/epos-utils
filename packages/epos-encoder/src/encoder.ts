import type { FlowContent, Root } from '@piqy/epos-ast'
import { CodepageRegistry } from '@piqy/epos-codepages'
import { Effect, Stream } from 'effect'

import { concatAll, ESC, hex } from './commands.js'
import { createEncoderContext } from './context.js'

/**
 * Sets what happens to a character that the loaded code pages cannot encode.
 * 'error' fails the encoding. { replace } prints the replacement text in place of the complete character cluster.
 */
export type UnsupportedCharacter = 'error' | { readonly replace: string }

export interface EncodeOptions {
	/** Page selected after printer initialization. Defaults to page 0 (PC437). */
	readonly codepage?: number
	/** Selects pages for text nodes that do not set one. Defaults to true. */
	readonly automaticCodepage?: boolean
	/** Handles characters that no available page supports, for example emoji. Defaults to 'error'. */
	readonly unsupportedCharacter?: UnsupportedCharacter
}

/** Encodes a stream of EPOS AST nodes to ESC/POS byte chunks. */
export const encodeStream = <E, R>(nodes: Stream.Stream<FlowContent, E, R>, options: EncodeOptions = {}) =>
	Stream.fromEffect(CodepageRegistry).pipe(
		Stream.flatMap((codepages) => {
			const requiredOptions: Required<EncodeOptions> = {
				codepage: options.codepage ?? 0,
				automaticCodepage: options.automaticCodepage ?? true,
				unsupportedCharacter: options.unsupportedCharacter ?? 'error',
			}
			const ctx = createEncoderContext(requiredOptions, codepages)
			const initialization = requiredOptions.codepage === 0 ? hex(ESC, '@') : hex(ESC, '@', ESC, 't', requiredOptions.codepage)

			return Stream.concat(
				Stream.make(initialization),
				Stream.mapEffect(nodes, (node) => ctx.encode(node)),
			)
		}),
	)

/** Encodes an EPOS AST to one ESC/POS byte array. */
export const encode = Effect.fn(function* (ast: Root, options: EncodeOptions = {}) {
	const chunks = yield* Stream.runCollect(encodeStream(Stream.fromIterable(ast.children), options))
	return concatAll(chunks)
})
