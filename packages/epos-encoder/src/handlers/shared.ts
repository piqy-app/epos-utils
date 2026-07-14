import type { AlignType, Nodes } from '@piqy/epos-ast'

import { concat } from '../commands.js'
import type { EncoderContext } from '../context.js'

export const ALIGN_MAP: Record<AlignType, number> = {
	left: 0,
	center: 1,
	right: 2,
}

export const encodeChildren = (children: readonly { type: string }[], ctx: EncoderContext) =>
	concat(...children.map((child) => ctx.encode(child as Nodes)))
