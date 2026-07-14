import { DEFAULT_CODEPAGE } from './codepages.js'
import { makeEncoderContext } from './context.js'
import type { EncodeOptions } from './encoder.js'
import type { EncoderExtension } from './extension.js'
import type { HandlersRecord } from './handlers.js'
import { defaultHandlers } from './handlers/index.js'

const applyExtensions = (options: EncodeOptions, extensions: EncoderExtension[]): EncodeOptions => {
	let result = options
	for (const extension of extensions) {
		if (extension.transformOptions) {
			result = extension.transformOptions(result)
		}
	}
	return result
}

const buildHandlers = (baseHandlers: HandlersRecord, options: EncodeOptions, extensions: EncoderExtension[]): HandlersRecord => {
	let handlers = { ...baseHandlers, ...options.handlers }
	for (const extension of extensions) {
		if (extension.handlers) {
			handlers = { ...handlers, ...extension.handlers }
		}
	}
	return handlers
}

export const prepareEncoder = (options: EncodeOptions) => {
	const extensions = options.extensions ?? []
	const processedOptions = applyExtensions(options, extensions)
	const handlers = buildHandlers(defaultHandlers, processedOptions, extensions)
	const requiredOptions: Required<EncodeOptions> = {
		handlers: processedOptions.handlers ?? {},
		extensions,
		codepage: processedOptions.codepage ?? DEFAULT_CODEPAGE,
	}

	return {
		ctx: makeEncoderContext(handlers, requiredOptions, requiredOptions.codepage),
		extensions,
	}
}

export const applyPostProcess = (bytes: Uint8Array, extensions: EncoderExtension[]): Uint8Array => {
	let result = bytes
	for (const extension of extensions) {
		if (extension.postProcess) {
			result = extension.postProcess(result)
		}
	}
	return result
}
