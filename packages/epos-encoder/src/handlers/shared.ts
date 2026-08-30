import type { AlignType, Nodes } from '@piqy/epos-ast'
import { Effect } from 'effect'

import { concatAll } from '../commands.js'
import type { EncoderContext } from '../context.js'

export const ALIGN_MAP = {
	left: 0,
	center: 1,
	right: 2,
} satisfies Record<AlignType, number>

export const encodeChildren = Effect.fn(function* (children: readonly Nodes[], ctx: EncoderContext) {
	return concatAll(yield* Effect.forEach(children, (node) => ctx.encode(node)))
})
