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

interface EncodingIndex {
	readonly byteByToken: ReadonlyMap<string, number>
	readonly compoundsByFirstCharacter: ReadonlyMap<string, readonly EncodingCandidate[]> | undefined
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

const encodingIndex = (definition: SingleByteCodepageDefinition, table: readonly string[]) => {
	const byteByToken = new Map<string, number>()
	let compoundsByFirstCharacter: Map<string, EncodingCandidate[]> | undefined
	const add = (token: string | undefined, byte: number) => {
		if (token === undefined || token === REPLACEMENT_CHARACTER || token.length === 0 || byteByToken.has(token)) {
			return
		}
		byteByToken.set(token, byte)
		const firstCodePoint = token.codePointAt(0)
		if (firstCodePoint === undefined) {
			return
		}
		const firstCharacter = String.fromCodePoint(firstCodePoint)
		if (firstCharacter !== token) {
			compoundsByFirstCharacter ??= new Map()
			const compounds = compoundsByFirstCharacter.get(firstCharacter) ?? []
			compounds.push({ token, byte })
			compounds.sort((left, right) => right.token.length - left.token.length)
			compoundsByFirstCharacter.set(firstCharacter, compounds)
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
	return { byteByToken, compoundsByFirstCharacter }
}

const matchingCompound = (encoding: EncodingIndex, text: string, index: number, character: string) =>
	encoding.compoundsByFirstCharacter?.get(character)?.find((candidate) => text.startsWith(candidate.token, index))

const tokenLengthAt = (encoding: EncodingIndex, text: string, index: number) => {
	const codePoint = text.codePointAt(index)
	if (codePoint === undefined) {
		return undefined
	}
	const character = String.fromCodePoint(codePoint)
	const compound = matchingCompound(encoding, text, index, character)
	if (compound !== undefined) {
		return compound.token.length
	}
	return encoding.byteByToken.has(character) ? character.length : undefined
}

const canEncodeText = (encoding: EncodingIndex, text: string) => {
	let index = 0
	while (index < text.length) {
		const tokenLength = tokenLengthAt(encoding, text, index)
		if (tokenLength === undefined) {
			return false
		}
		index += tokenLength
	}
	return true
}

const encodeResult = (definition: SingleByteCodepageDefinition, encoding: EncodingIndex, text: string) => {
	const bytes = new Uint8Array(text.length)
	let index = 0
	let outputIndex = 0
	while (index < text.length) {
		const codePoint = text.codePointAt(index)
		if (codePoint === undefined) {
			break
		}
		const character = String.fromCodePoint(codePoint)
		const compound = matchingCompound(encoding, text, index, character)
		const byte = compound?.byte ?? encoding.byteByToken.get(character)
		if (byte === undefined) {
			return Result.fail(new UnencodableCharacterError({ page: definition.page, index, character }))
		}
		bytes[outputIndex] = byte
		outputIndex += 1
		index += compound?.token.length ?? character.length
	}
	return Result.succeed(outputIndex === bytes.length ? bytes : bytes.slice(0, outputIndex))
}

/**
 * Creates a lazy single-byte codec. Reverse indexes are built on first use.
 */
export const singleByte = (definition: SingleByteCodepageDefinition) => {
	let table: readonly string[] | undefined
	let encoding: EncodingIndex | undefined
	const getTable = () => {
		table ??= decodeTable(definition)
		return table
	}
	const getEncoding = () => {
		encoding ??= encodingIndex(definition, getTable())
		return encoding
	}
	const encode = (text: string) => Effect.fromResult(encodeResult(definition, getEncoding(), text))

	return Object.freeze({
		page: definition.page,
		name: definition.name,
		encode,
		canEncode: (text: string) => canEncodeText(getEncoding(), text),
		decode: (bytes: Uint8Array) => {
			const characters = getTable()
			let text = ''
			for (const byte of bytes) {
				text += characters[byte] ?? REPLACEMENT_CHARACTER
			}
			return text
		},
		tokenLengthAt: (text: string, index: number) => tokenLengthAt(getEncoding(), text, index),
	})
}
