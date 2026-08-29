import { type Break, type Country, type Tab, type Text } from '@piqy/epos-ast'
import { UnencodableCharacterError } from '@piqy/epos-codepages'
import { Effect, Match } from 'effect'

import { COUNTRY_CODES, isCountryByte, matchCountryEncoding } from '../charset.js'
import { concat, ESC, HT, hex, LF } from '../commands.js'
import type { EncoderContext } from '../context.js'
import type { Handler } from '../handlers.js'
import { ALIGN_MAP } from './shared.js'

const encodeTextWithCountry = Effect.fn(function* (value: string, country: Country, codepage: number, ctx: EncoderContext) {
	const chunks: Uint8Array[] = []
	let index = 0
	while (index < value.length) {
		const countryEncoding = matchCountryEncoding(value, index, country)
		if (countryEncoding !== undefined) {
			chunks.push(Uint8Array.of(countryEncoding.byte))
			index += countryEncoding.token.length
			continue
		}

		const codePoint = value.codePointAt(index)
		if (codePoint === undefined) {
			break
		}
		const character = String.fromCodePoint(codePoint)
		const encoded = yield* Effect.mapError(ctx.codepages.encode(codepage, character), (error) =>
			Match.valueTags(error, {
				CodepageNotLoadedError: (cause) => cause,
				UnencodableCharacterError: (cause) =>
					new UnencodableCharacterError({ page: cause.page, index: index + cause.index, character: cause.character }),
			}),
		)
		if (encoded.some((byte) => isCountryByte(byte, country))) {
			return yield* new UnencodableCharacterError({ page: codepage, index, character })
		}
		chunks.push(encoded)
		index += character.length
	}
	return concat(...chunks)
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
	const segments =
		node.codepage === undefined && ctx.options.automaticCodepage
			? yield* ctx.codepages.plan(node.value, { currentPage: ctx.codepage, usedPages: ctx.usedCodepages })
			: [{ page: node.codepage ?? ctx.codepage, text: node.value }]
	for (const segment of segments) {
		if (segment.page !== ctx.codepage) {
			chunks.push(hex(ESC, 't', segment.page))
			ctx.codepage = segment.page
		}
		chunks.push(yield* encodeTextWithCountry(segment.text, country, segment.page, ctx))
		ctx.usedCodepages.add(segment.page)
	}
	return concat(...chunks)
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
