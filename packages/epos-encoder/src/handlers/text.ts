import { type Break, type Country, type Tab, type Text } from '@piqy/epos-ast'
import {
	type Codepage,
	CodepageNotLoadedError,
	codepageTokenLengthAt,
	NoCodepageSupportsCharacterError,
	UnencodableCharacterError,
} from '@piqy/epos-codepages'
import { Effect, Result } from 'effect'

import { COUNTRY_CODES, countryTableBytes, countryTokenLengthAt, hasCountryByte, matchCountryEncoding } from '../charset.js'
import { concatAll, ESC, HT, hex, LF } from '../commands.js'
import type { EncoderContext } from '../context.js'
import type { Handler } from '../handlers.js'
import { repairUnsupportedText, sourcePosition, type TextEdit } from '../unsupported.js'
import { ALIGN_MAP } from './shared.js'

// avoid creating a tiny byte array for every country-table token in long text
const makeByteWriter = (initialCapacity: number) => {
	let bytes = new Uint8Array(initialCapacity)
	let length = 0
	const ensureCapacity = (additionalLength: number) => {
		const requiredLength = length + additionalLength
		if (requiredLength <= bytes.length) {
			return
		}
		const grown = new Uint8Array(Math.max(requiredLength, bytes.length * 2, 8))
		grown.set(bytes)
		bytes = grown
	}
	return {
		append: (chunk: Uint8Array) => {
			ensureCapacity(chunk.length)
			bytes.set(chunk, length)
			length += chunk.length
		},
		appendByte: (byte: number) => {
			ensureCapacity(1)
			bytes[length] = byte
			length += 1
		},
		finish: () => (length === bytes.length ? bytes : bytes.slice(0, length)),
	}
}

const encodeTextCharacterByCharacter = Effect.fn(function* (value: string, sourceIndex: number, country: Country, codepage: Codepage) {
	const writer = makeByteWriter(value.length)
	let index = 0
	while (index < value.length) {
		const codePoint = value.codePointAt(index)
		if (codePoint === undefined) {
			break
		}
		const character = String.fromCodePoint(codePoint)
		const encoded = yield* Effect.mapError(
			codepage.encode(character),
			(cause) =>
				new UnencodableCharacterError({
					page: cause.page,
					index: sourceIndex + index + cause.index,
					character: cause.character,
				}),
		)
		if (hasCountryByte(encoded, country)) {
			return yield* new UnencodableCharacterError({ page: codepage.page, index: sourceIndex + index, character })
		}
		writer.append(encoded)
		index += character.length
	}
	return writer.finish()
})

const encodePageText = Effect.fn(function* (value: string, sourceIndex: number, country: Country, codepage: Codepage) {
	const encoded = yield* Effect.mapError(
		codepage.encode(value),
		(cause) =>
			new UnencodableCharacterError({
				page: cause.page,
				index: sourceIndex + cause.index,
				character: cause.character,
			}),
	)
	if (!hasCountryByte(encoded, country)) {
		return encoded
	}
	return yield* encodeTextCharacterByCharacter(value, sourceIndex, country, codepage)
})

const encodeTextWithCountry = Effect.fn(function* (
	value: string,
	sourceIndex: number,
	country: Country,
	codepage: number,
	ctx: EncoderContext,
) {
	const selectedPage = yield* ctx.codepages.resolve(codepage)
	let writer: ReturnType<typeof makeByteWriter> | undefined
	let index = 0
	let runStart = 0
	while (index < value.length) {
		const countryEncoding = matchCountryEncoding(value, index, country)
		if (countryEncoding !== undefined) {
			writer ??= makeByteWriter(value.length)
			if (runStart < index) {
				writer.append(yield* encodePageText(value.slice(runStart, index), sourceIndex + runStart, country, selectedPage))
			}
			writer.appendByte(countryEncoding.byte)
			index += countryEncoding.token.length
			runStart = index
			continue
		}
		const codePoint = value.codePointAt(index)
		if (codePoint === undefined) {
			break
		}
		index += String.fromCodePoint(codePoint).length
	}
	if (writer === undefined) {
		return yield* encodePageText(value, sourceIndex, country, selectedPage)
	}
	if (runStart < value.length) {
		writer.append(yield* encodePageText(value.slice(runStart), sourceIndex + runStart, country, selectedPage))
	}
	return writer.finish()
})

/** Encodes text to bytes per page without changing the encoder state. */
const encodePages = Effect.fn(function* (value: string, codepage: number | undefined, country: Country, ctx: EncoderContext) {
	const segments =
		codepage === undefined && ctx.options.automaticCodepage
			? yield* ctx.codepages.plan(value, {
					currentPage: ctx.codepage,
					usedPages: ctx.usedCodepages,
					pageIndependentTokenLengthAt: countryTokenLengthAt(country),
				})
			: [{ page: codepage ?? ctx.codepage, text: value }]
	const encoded: { readonly page: number; readonly bytes: Uint8Array }[] = []
	let sourceIndex = 0
	for (const segment of segments) {
		encoded.push({ page: segment.page, bytes: yield* encodeTextWithCountry(segment.text, sourceIndex, country, segment.page, ctx) })
		sourceIndex += segment.text.length
	}
	return encoded
})

/**
 * Returns a check for the longest token that the country table or one of the usable pages can encode.
 * A page token whose byte the country table reassigns is not supported.
 */
const makeSupportedTokenLengthAt = Effect.fn(function* (codepage: number | undefined, country: Country, ctx: EncoderContext) {
	const pageNumbers = codepage === undefined && ctx.options.automaticCodepage ? ctx.codepages.pages : [codepage ?? ctx.codepage]
	const countryBytes = countryTableBytes(country)
	const countryTokenLength = countryTokenLengthAt(country)
	// a page character conflicts when its encoded byte is a byte that the country table reassigns.
	// Aliases that encode to such a byte are not found here, so encoding reports them one at a time
	const pages = yield* Effect.forEach(
		pageNumbers,
		Effect.fnUntraced(function* (pageNumber) {
			const page = yield* ctx.codepages.resolve(pageNumber)
			const conflicts = new Set<string>()
			for (const byte of countryBytes) {
				const character = page.decode(Uint8Array.of(byte))
				const encoded = yield* Effect.result(page.encode(character))
				if (Result.isSuccess(encoded) && hasCountryByte(encoded.success, country)) {
					conflicts.add(character)
				}
			}
			return { page, conflicts }
		}),
	)
	return (text: string, index: number) => {
		let longest = countryTokenLength(text, index)
		for (const { page, conflicts } of pages) {
			const tokenLength = codepageTokenLengthAt(page, text, index)
			if (
				tokenLength !== undefined &&
				(longest === undefined || tokenLength > longest) &&
				!conflicts.has(text.slice(index, index + tokenLength))
			) {
				longest = tokenLength
			}
		}
		return longest
	}
})

/**
 * Encodes text with explicit code-page and international-character-set state.
 */
export const text: Handler<Text> = Effect.fn(function* (node, ctx) {
	const chunks: Uint8Array[] = []

	if (ctx.lineAlignment !== ctx.alignment) {
		chunks.push(hex(ESC, 'a', ALIGN_MAP[ctx.alignment]))
		ctx.lineAlignment = ctx.alignment
	}

	if (ctx.lineUpsideDown !== ctx.upsideDown) {
		chunks.push(hex(ESC, '{', ctx.upsideDown ? 0x01 : 0x00))
		ctx.lineUpsideDown = ctx.upsideDown
	}

	if (node.country !== undefined && node.country !== ctx.country) {
		chunks.push(hex(ESC, 'R', COUNTRY_CODES[node.country]))
		ctx.country = node.country
	}

	const country = ctx.country ?? 'usa'
	let value = node.value
	const edits: TextEdit[] = []
	let supportedTokenLengthAt: ((text: string, index: number) => number | undefined) | undefined
	let result = yield* Effect.result(encodePages(value, node.codepage, country, ctx))
	// repair unsupported clusters, then encode again from a clean state. Usually one pass repairs all of them,
	// but a country-table conflict is found only by encoding
	while (Result.isFailure(result) && !(result.failure instanceof CodepageNotLoadedError)) {
		// a failure in inserted replacement text cannot be repaired, so each repair consumes original text
		if (sourcePosition(edits, result.failure.index).inserted) {
			break
		}
		supportedTokenLengthAt ??= yield* makeSupportedTokenLengthAt(node.codepage, country, ctx)
		const repaired = repairUnsupportedText(value, result.failure.index, supportedTokenLengthAt, ctx.options.unsupportedCharacter)
		if (repaired === undefined) {
			break
		}
		value = repaired.text
		for (const edit of repaired.edits) {
			edits.push(edit)
		}
		result = yield* Effect.result(encodePages(value, node.codepage, country, ctx))
	}
	if (Result.isFailure(result) && edits.length > 0) {
		// report the index in the text node, not in the repaired text
		const error = result.failure
		if (error instanceof NoCodepageSupportsCharacterError) {
			const { index } = sourcePosition(edits, error.index)
			return yield* new NoCodepageSupportsCharacterError({ index, character: error.character, pages: error.pages })
		}
		if (error instanceof UnencodableCharacterError) {
			const { index } = sourcePosition(edits, error.index)
			return yield* new UnencodableCharacterError({ page: error.page, index, character: error.character })
		}
	}
	for (const segment of yield* Effect.fromResult(result)) {
		if (segment.page !== ctx.codepage) {
			chunks.push(hex(ESC, 't', segment.page))
			ctx.codepage = segment.page
		}
		chunks.push(segment.bytes)
		ctx.usedCodepages.add(segment.page)
	}
	return concatAll(chunks)
})

/** Resets line-scoped state after a line feed. */
export const lineBreak: Handler<Break> = (_, ctx) =>
	Effect.sync(() => {
		ctx.lineAlignment = null
		ctx.lineUpsideDown = null
		return hex(LF)
	})

/** Encodes a horizontal tab. */
export const tab: Handler<Tab> = () => Effect.succeed(hex(HT))
