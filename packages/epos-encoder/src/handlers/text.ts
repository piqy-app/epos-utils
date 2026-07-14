import { type Break, COUNTRY_CODES, type Country, type Tab, type Text, encodeChar } from '@piqy/epos-ast'
import iconv from 'iconv-lite'

import { CODEPAGES, DEFAULT_CODEPAGE } from '../codepages.js'
import { concat, ESC, HT, hex, LF } from '../commands.js'
import type { Handler } from '../handlers.js'
import { ALIGN_MAP } from './shared.js'

/**
 * Encodes text using country charset substitutions where applicable.
 */
const encodeTextWithCountry = (value: string, country: Country, codepage: number): Uint8Array => {
	const encoding = CODEPAGES[codepage] || CODEPAGES[DEFAULT_CODEPAGE]
	const bytes: number[] = []

	for (const char of value) {
		const byte = encodeChar(char, country)
		if (byte !== undefined) {
			bytes.push(byte)
		} else {
			const encoded = iconv.encode(char, encoding)
			for (const b of encoded) {
				bytes.push(b)
			}
		}
	}

	return new Uint8Array(bytes)
}

/**
 * Encodes text content with optional codepage and country selection.
 * Syncs alignment with printer if needed (alignment only takes effect at line start).
 * @see https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_lt.html ESC t - Select character code table
 * @see https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_cr.html ESC R - Select international character set
 */
export const text: Handler<Text> = (node, ctx) => {
	const chunks: Uint8Array[] = []

	if (ctx.lineAlignment !== ctx.alignment) {
		chunks.push(hex(ESC, 'a', ALIGN_MAP[ctx.alignment]))
		ctx.lineAlignment = ctx.alignment
	}

	if (ctx.lineUpsideDown !== ctx.upsideDown) {
		chunks.push(hex(ESC, '{', ctx.upsideDown ? 0x01 : 0x00))
		ctx.lineUpsideDown = ctx.upsideDown
	}

	const codepage = node.codepage ?? ctx.codepage

	if (codepage !== ctx.codepage) {
		chunks.push(hex(ESC, 't', codepage))
		ctx.codepage = codepage
	}

	if (node.country !== undefined && node.country !== ctx.country) {
		const countryCode = COUNTRY_CODES[node.country]
		if (countryCode !== undefined) {
			chunks.push(hex(ESC, 'R', countryCode))
			ctx.country = node.country
		}
	}

	const encoding = CODEPAGES[codepage] || CODEPAGES[DEFAULT_CODEPAGE]
	if (node.country) {
		chunks.push(encodeTextWithCountry(node.value, node.country, codepage))
	} else {
		chunks.push(new Uint8Array(iconv.encode(node.value, encoding)))
	}

	return concat(...chunks)
}

/**
 * Encodes a line feed. Resets lineAlignment so next text can sync if needed.
 * @see https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/lf.html LF - Print and line feed
 */
export const lineBreak: Handler<Break> = (_, ctx) => {
	ctx.lineAlignment = null
	ctx.lineUpsideDown = null
	return hex(LF)
}

/**
 * Encodes a horizontal tab.
 * @see https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/ht.html HT - Horizontal tab
 */
export const tab: Handler<Tab> = () => hex(HT)
