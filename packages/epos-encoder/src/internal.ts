import { CodepageRegistry } from '@piqy/epos-codepages'
import { Effect } from 'effect'

import { DEFAULT_CODEPAGE } from './codepages.js'
import { concat, ESC, hex } from './commands.js'
import { createEncoderContext } from './context.js'
import type { EncodeOptions } from './encoder.js'

export const prepareEncoder = Effect.fn(function* (options: EncodeOptions) {
	const codepages = yield* CodepageRegistry
	const requiredOptions: Required<EncodeOptions> = {
		codepage: options.codepage ?? DEFAULT_CODEPAGE,
		automaticCodepage: options.automaticCodepage ?? true,
	}
	const initialization =
		requiredOptions.codepage === DEFAULT_CODEPAGE ? hex(ESC, '@') : concat(hex(ESC, '@'), hex(ESC, 't', requiredOptions.codepage))

	return {
		ctx: createEncoderContext(requiredOptions, codepages),
		initialization,
	}
})
