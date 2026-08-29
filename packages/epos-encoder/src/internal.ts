import { CodepageRegistry } from '@piqy/epos-codepages'
import { Effect } from 'effect'

import { DEFAULT_CODEPAGE } from './codepages.js'
import { createEncoderContext } from './context.js'
import type { EncodeOptions } from './encoder.js'
import type { EncoderError } from './errors.js'
import type { EncoderExtension } from './extension.js'
import type { HandlersRecord } from './handlers.js'
import { defaultHandlers } from './handlers/index.js'

const applyExtensions = Effect.fn(function* (options: EncodeOptions, extensions: readonly EncoderExtension[]) {
	let result = options
	for (const extension of extensions) {
		if (extension.transformOptions !== undefined) {
			result = yield* extension.transformOptions(result)
		}
	}
	return result
})

const buildHandlers = (baseHandlers: HandlersRecord, options: EncodeOptions, extensions: readonly EncoderExtension[]) => {
	let handlers = { ...baseHandlers, ...options.handlers }
	for (const extension of extensions) {
		if (extension.handlers !== undefined) {
			handlers = { ...handlers, ...extension.handlers }
		}
	}
	return handlers
}

export const prepareEncoder = Effect.fn(function* (options: EncodeOptions) {
	const codepages = yield* CodepageRegistry
	const extensions = options.extensions ?? []
	const processedOptions = yield* applyExtensions(options, extensions)
	const handlers = buildHandlers(defaultHandlers, processedOptions, extensions)
	const requiredOptions: Required<EncodeOptions> = {
		handlers: processedOptions.handlers ?? {},
		extensions,
		codepage: processedOptions.codepage ?? DEFAULT_CODEPAGE,
	}

	return {
		ctx: createEncoderContext(handlers, requiredOptions, requiredOptions.codepage, codepages),
		extensions,
	}
})

export const applyPostProcess = Effect.fn(function* (bytes: Uint8Array, extensions: readonly EncoderExtension[]) {
	let result = bytes
	for (const extension of extensions) {
		if (extension.postProcess !== undefined) {
			result = yield* extension.postProcess(result)
		}
	}
	return result
}) satisfies (bytes: Uint8Array, extensions: readonly EncoderExtension[]) => Effect.Effect<Uint8Array, EncoderError>
