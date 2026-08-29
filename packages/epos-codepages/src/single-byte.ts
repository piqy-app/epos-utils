import { Effect, Result } from 'effect'

import { UnencodableCharacterError } from './errors.js'
import type { SingleByteCodepageDefinition } from './model.js'

const REPLACEMENT_CHARACTER = '\uFFFD'
const HIGH_START = 0x80
const PRINTABLE_ASCII_START = 0x20
const PRINTABLE_ASCII_END = 0x7e

interface EncodingCandidate {
	readonly token: string
	readonly byte: number
}

const decodeTable = (definition: SingleByteCodepageDefinition) => {
	const table = Array.from({ length: 256 }, (_, byte) => String.fromCharCode(byte))
	const high = Array.from(definition.high)
	for (let index = 0; index < 128; index++) {
		table[index + HIGH_START] = high[index] ?? REPLACEMENT_CHARACTER
	}
	for (const [byte, character] of definition.overrides ?? []) {
		table[byte] = character
	}
	return table
}

const encodingCandidates = (definition: SingleByteCodepageDefinition, table: readonly string[]) => {
	const byFirstCharacter = new Map<string, EncodingCandidate[]>()
	const add = (token: string | undefined, byte: number) => {
		if (token === undefined || token === REPLACEMENT_CHARACTER || token.length === 0) {
			return
		}
		const firstCharacter = Array.from(token)[0]
		if (firstCharacter === undefined) {
			return
		}
		const candidates = byFirstCharacter.get(firstCharacter) ?? []
		if (!candidates.some((candidate) => candidate.token === token)) {
			candidates.push({ token, byte })
			candidates.sort((left, right) => right.token.length - left.token.length)
			byFirstCharacter.set(firstCharacter, candidates)
		}
	}

	for (let byte = PRINTABLE_ASCII_START; byte <= PRINTABLE_ASCII_END; byte++) {
		add(table[byte], byte)
	}
	for (let byte = HIGH_START; byte <= 0xff; byte++) {
		add(table[byte], byte)
	}
	for (const [token, byte] of definition.aliases ?? []) {
		add(token, byte)
	}
	return byFirstCharacter
}

const encodeResult = (
	definition: SingleByteCodepageDefinition,
	candidates: ReadonlyMap<string, readonly EncodingCandidate[]>,
	text: string,
) => {
	const bytes: number[] = []
	let index = 0
	while (index < text.length) {
		const codePoint = text.codePointAt(index)
		if (codePoint === undefined) {
			break
		}
		const character = String.fromCodePoint(codePoint)
		const matches = candidates.get(character) ?? []
		const match = matches.find((candidate) => text.startsWith(candidate.token, index))
		if (match === undefined) {
			return Result.fail(new UnencodableCharacterError({ page: definition.page, index, character }))
		}
		bytes.push(match.byte)
		index += match.token.length
	}
	return Result.succeed(new Uint8Array(bytes))
}

/**
 * Creates a lazy single-byte codec. Reverse indexes are built on first use.
 */
export const singleByte = (definition: SingleByteCodepageDefinition) => {
	const table = decodeTable(definition)
	let reverse: ReadonlyMap<string, readonly EncodingCandidate[]> | undefined
	const getCandidates = () => {
		reverse ??= encodingCandidates(definition, table)
		return reverse
	}
	const encode = (text: string) => Effect.fromResult(encodeResult(definition, getCandidates(), text))

	return Object.freeze({
		page: definition.page,
		name: definition.name,
		encode,
		canEncode: (text: string) => Result.isSuccess(encodeResult(definition, getCandidates(), text)),
		decode: (bytes: Uint8Array) => {
			let text = ''
			for (const byte of bytes) {
				text += table[byte] ?? REPLACEMENT_CHARACTER
			}
			return text
		},
	})
}
