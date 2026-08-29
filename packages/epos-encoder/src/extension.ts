import type { Effect } from 'effect'

import type { EncodeOptions } from './encoder.js'
import type { EncoderError } from './errors.js'
import type { HandlersRecord } from './handlers.js'

/**
 * Effect-native extension interface for customizing encoder behavior.
 */
export interface EncoderExtension {
	readonly name: string
	readonly handlers?: Partial<HandlersRecord>
	readonly transformOptions?: (options: EncodeOptions) => Effect.Effect<EncodeOptions, EncoderError>
	readonly postProcess?: (bytes: Uint8Array) => Effect.Effect<Uint8Array, EncoderError>
}
