import type { Effect } from 'effect'

import type { UnencodableCharacterError } from './errors.js'

export interface Codepage {
	readonly page: number
	readonly name: string
	readonly encode: (text: string) => Effect.Effect<Uint8Array, UnencodableCharacterError>
	readonly canEncode: (text: string) => boolean
	readonly decode: (bytes: Uint8Array) => string
}

export interface CodepageSegment {
	readonly page: number
	readonly text: string
}

export interface PlanTextOptions {
	readonly currentPage?: number
	readonly usedPages?: ReadonlySet<number>
}

export interface SingleByteCodepageDefinition {
	readonly page: number
	readonly name: string
	/** Unicode characters for bytes 0x80 through 0xff. */
	readonly high: string
	/** Changes to printable ASCII byte positions. */
	readonly overrides?: readonly (readonly [byte: number, character: string])[]
	/** Additional Unicode tokens accepted during encoding without changing canonical decoding. */
	readonly aliases?: readonly (readonly [token: string, byte: number])[]
}
