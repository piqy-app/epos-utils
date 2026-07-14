import type { EncodeOptions } from './encoder.js'
import type { HandlersRecord } from './handlers.js'

/**
 * Extension interface for customizing encoder behavior.
 */
export interface EncoderExtension {
	name: string
	handlers?: Partial<HandlersRecord>
	transformOptions?: (options: EncodeOptions) => EncodeOptions
	postProcess?: (bytes: Uint8Array) => Uint8Array
}
