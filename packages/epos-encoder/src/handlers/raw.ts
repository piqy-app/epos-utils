import type { Raw } from '@piqy/epos-ast'
import { Effect } from 'effect'

import type { Handler } from '../handlers.js'

/**
 * Passes through raw bytes without transformation.
 */
export const raw: Handler<Raw> = (node) => Effect.sync(() => new Uint8Array(Buffer.from(node.value, 'base64')))
