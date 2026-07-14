import type { Raw } from '@piqy/epos-ast'

import type { Handler } from '../handlers.js'

/**
 * Passes through raw bytes without transformation.
 */
export const raw: Handler<Raw> = (node) => new Uint8Array(Buffer.from(node.value, 'base64'))
