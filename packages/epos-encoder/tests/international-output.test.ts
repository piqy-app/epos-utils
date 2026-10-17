import type { Country, Root } from '@piqy/epos-ast'
import { codepageLayer, UnencodableCharacterError } from '@piqy/epos-codepages'
import { page000 } from '@piqy/epos-codepages/pages/page-000'
import { page019 } from '@piqy/epos-codepages/pages/page-019'
import { describe, expect, it } from '@effect/vitest'
import { Effect, Result, Stream } from 'effect'

import { encode, encodeStream, type EncoderError } from '../src/index.js'

// Expected output was recorded with the encoder before the country tables moved to @piqy/epos-codepages.
// Most text nodes set a page, so that the output depends on the character set tables and not on automatic page selection

interface TextCase {
	readonly country: Country
	readonly value: string
	readonly codepage: number
	readonly bytes?: string
	readonly error?: EncoderError
}

const textCases: readonly TextCase[] = [
	{ country: 'usa', value: '#$@[\\]^`{|}~ AZaz!', codepage: 0, bytes: '1b401b61001b7b002324405b5c5d5e607b7c7d7e20415a617a21' },
	{ country: 'usa', value: '€ #$@[\\]^`{|}~ é', codepage: 19, bytes: '1b401b61001b7b001b7413d5202324405b5c5d5e607b7c7d7e2082' },
	{ country: 'france', value: '#$à°ç§^`éùè¨ AZaz!', codepage: 0, bytes: '1b401b61001b7b001b52012324405b5c5d5e607b7c7d7e20415a617a21' },
	{ country: 'france', value: '€ #$à°ç§^`éùè¨ é', codepage: 19, bytes: '1b401b61001b7b001b52011b7413d5202324405b5c5d5e607b7c7d7e207b' },
	{ country: 'germany', value: '#$§ÄÖÜ^`äöüß AZaz!', codepage: 0, bytes: '1b401b61001b7b001b52022324405b5c5d5e607b7c7d7e20415a617a21' },
	{ country: 'germany', value: '€ #$§ÄÖÜ^`äöüß é', codepage: 19, bytes: '1b401b61001b7b001b52021b7413d5202324405b5c5d5e607b7c7d7e2082' },
	{ country: 'uk', value: '£$@[\\]^`{|}~ AZaz!', codepage: 0, bytes: '1b401b61001b7b001b52032324405b5c5d5e607b7c7d7e20415a617a21' },
	{ country: 'uk', value: '€ £$@[\\]^`{|}~ é', codepage: 19, bytes: '1b401b61001b7b001b52031b7413d5202324405b5c5d5e607b7c7d7e2082' },
	{ country: 'denmark-1', value: '#$@ÆØÅ^`æøå~ AZaz!', codepage: 0, bytes: '1b401b61001b7b001b52042324405b5c5d5e607b7c7d7e20415a617a21' },
	{ country: 'denmark-1', value: '€ #$@ÆØÅ^`æøå~ é', codepage: 19, bytes: '1b401b61001b7b001b52041b7413d5202324405b5c5d5e607b7c7d7e2082' },
	{ country: 'sweden', value: '#¤ÉÄÖÅÜéäöåü AZaz!', codepage: 0, bytes: '1b401b61001b7b001b52052324405b5c5d5e607b7c7d7e20415a617a21' },
	{ country: 'sweden', value: '€ #¤ÉÄÖÅÜéäöåü é', codepage: 19, bytes: '1b401b61001b7b001b52051b7413d5202324405b5c5d5e607b7c7d7e2060' },
	{ country: 'italy', value: '#$@°\\é^ùàòèì AZaz!', codepage: 0, bytes: '1b401b61001b7b001b52062324405b5c5d5e607b7c7d7e20415a617a21' },
	{ country: 'italy', value: '€ #$@°\\é^ùàòèì é', codepage: 19, bytes: '1b401b61001b7b001b52061b7413d5202324405b5c5d5e607b7c7d7e205d' },
	{ country: 'spain-1', value: '₧$@¡Ñ¿^`¨ñ}~ AZaz!', codepage: 0, bytes: '1b401b61001b7b001b52072324405b5c5d5e607b7c7d7e20415a617a21' },
	{ country: 'spain-1', value: '€ ₧$@¡Ñ¿^`¨ñ}~ é', codepage: 19, bytes: '1b401b61001b7b001b52071b7413d5202324405b5c5d5e607b7c7d7e2082' },
	{ country: 'japan', value: '#$@[¥]^`{|}~ AZaz!', codepage: 0, bytes: '1b401b61001b7b001b52082324405b5c5d5e607b7c7d7e20415a617a21' },
	{ country: 'japan', value: '€ #$@[¥]^`{|}~ é', codepage: 19, bytes: '1b401b61001b7b001b52081b7413d5202324405b5c5d5e607b7c7d7e2082' },
	{ country: 'norway', value: '#¤ÉÆØÅÜéæøåü AZaz!', codepage: 0, bytes: '1b401b61001b7b001b52092324405b5c5d5e607b7c7d7e20415a617a21' },
	{ country: 'norway', value: '€ #¤ÉÆØÅÜéæøåü é', codepage: 19, bytes: '1b401b61001b7b001b52091b7413d5202324405b5c5d5e607b7c7d7e2060' },
	{ country: 'denmark-2', value: '#$ÉÆØÅÜéæøåü AZaz!', codepage: 0, bytes: '1b401b61001b7b001b520a2324405b5c5d5e607b7c7d7e20415a617a21' },
	{ country: 'denmark-2', value: '€ #$ÉÆØÅÜéæøåü é', codepage: 19, bytes: '1b401b61001b7b001b520a1b7413d5202324405b5c5d5e607b7c7d7e2060' },
	{ country: 'spain-2', value: '#$á¡Ñ¿é`íñóú AZaz!', codepage: 0, bytes: '1b401b61001b7b001b520b2324405b5c5d5e607b7c7d7e20415a617a21' },
	{ country: 'spain-2', value: '€ #$á¡Ñ¿é`íñóú é', codepage: 19, bytes: '1b401b61001b7b001b520b1b7413d5202324405b5c5d5e607b7c7d7e205e' },
	{
		country: 'latin-america',
		value: '#$á¡Ñ¿éüíñóú AZaz!',
		codepage: 0,
		bytes: '1b401b61001b7b001b520c2324405b5c5d5e607b7c7d7e20415a617a21',
	},
	{
		country: 'latin-america',
		value: '€ #$á¡Ñ¿éüíñóú é',
		codepage: 19,
		bytes: '1b401b61001b7b001b520c1b7413d5202324405b5c5d5e607b7c7d7e205e',
	},
	{ country: 'korea', value: '#$@[₩]^`{|}~ AZaz!', codepage: 0, bytes: '1b401b61001b7b001b520d2324405b5c5d5e607b7c7d7e20415a617a21' },
	{ country: 'korea', value: '€ #$@[₩]^`{|}~ é', codepage: 19, bytes: '1b401b61001b7b001b520d1b7413d5202324405b5c5d5e607b7c7d7e2082' },
	{ country: 'slovenia', value: '#$ŽŠĐĆČžšđćč AZaz!', codepage: 0, bytes: '1b401b61001b7b001b520e2324405b5c5d5e607b7c7d7e20415a617a21' },
	{ country: 'slovenia', value: '€ #$ŽŠĐĆČžšđćč é', codepage: 19, bytes: '1b401b61001b7b001b520e1b7413d5202324405b5c5d5e607b7c7d7e2082' },
	{ country: 'china', value: '#¥@[\\]^`{|}~ AZaz!', codepage: 0, bytes: '1b401b61001b7b001b520f2324405b5c5d5e607b7c7d7e20415a617a21' },
	{ country: 'china', value: '€ #¥@[\\]^`{|}~ é', codepage: 19, bytes: '1b401b61001b7b001b520f1b7413d5202324405b5c5d5e607b7c7d7e2082' },
	{ country: 'vietnam', value: 'đ$@[\\]^`{|}~ AZaz!', codepage: 0, bytes: '1b401b61001b7b001b52102324405b5c5d5e607b7c7d7e20415a617a21' },
	{ country: 'vietnam', value: '€ đ$@[\\]^`{|}~ é', codepage: 19, bytes: '1b401b61001b7b001b52101b7413d5202324405b5c5d5e607b7c7d7e2082' },
	{
		country: 'arabia',
		value: '#$\u061c[\\]^`{|}~ AZaz!',
		codepage: 0,
		bytes: '1b401b61001b7b001b52112324405b5c5d5e607b7c7d7e20415a617a21',
	},
	{
		country: 'arabia',
		value: '€ #$\u061c[\\]^`{|}~ é',
		codepage: 19,
		bytes: '1b401b61001b7b001b52111b7413d5202324405b5c5d5e607b7c7d7e2082',
	},
	{
		country: 'india-devanagari',
		value: '#$०१२३४५६७८९@[\\]^`{|}~ AZaz!',
		codepage: 0,
		bytes: '1b401b61001b7b001b5242232430313233343536373839405b5c5d5e607b7c7d7e20415a617a21',
	},
	{
		country: 'india-devanagari',
		value: '€ #$०१२३४५६७८९@[\\]^`{|}~ é',
		codepage: 19,
		bytes: '1b401b61001b7b001b52421b7413d520232430313233343536373839405b5c5d5e607b7c7d7e2082',
	},
	{
		country: 'india-bengali',
		value: '#$০১২৩৪৫৬৭৮৯@[\\]^`{|}~ AZaz!',
		codepage: 0,
		bytes: '1b401b61001b7b001b5243232430313233343536373839405b5c5d5e607b7c7d7e20415a617a21',
	},
	{
		country: 'india-bengali',
		value: '€ #$০১২৩৪৫৬৭৮৯@[\\]^`{|}~ é',
		codepage: 19,
		bytes: '1b401b61001b7b001b52431b7413d520232430313233343536373839405b5c5d5e607b7c7d7e2082',
	},
	{
		country: 'india-tamil',
		value: '#$௦க௨௩௪௫கா௭௯கூ@[\\]^`{|}~ AZaz!',
		codepage: 0,
		bytes: '1b401b61001b7b001b5244232430313233343536373839405b5c5d5e607b7c7d7e20415a617a21',
	},
	{
		country: 'india-tamil',
		value: '€ #$௦க௨௩௪௫கா௭௯கூ@[\\]^`{|}~ é',
		codepage: 19,
		bytes: '1b401b61001b7b001b52441b7413d520232430313233343536373839405b5c5d5e607b7c7d7e2082',
	},
	{
		country: 'india-telugu',
		value: '#$౦౧౨౩౪౫౬౭౮౯@[\\]^`{|}~ AZaz!',
		codepage: 0,
		bytes: '1b401b61001b7b001b5245232430313233343536373839405b5c5d5e607b7c7d7e20415a617a21',
	},
	{
		country: 'india-telugu',
		value: '€ #$౦౧౨౩౪౫౬౭౮౯@[\\]^`{|}~ é',
		codepage: 19,
		bytes: '1b401b61001b7b001b52451b7413d520232430313233343536373839405b5c5d5e607b7c7d7e2082',
	},
	{
		country: 'india-assamese',
		value: '#$০১২৩৪৫৬৭৮৯@[\\]^`{|}~ AZaz!',
		codepage: 0,
		bytes: '1b401b61001b7b001b5246232430313233343536373839405b5c5d5e607b7c7d7e20415a617a21',
	},
	{
		country: 'india-assamese',
		value: '€ #$০১২৩৪৫৬৭৮৯@[\\]^`{|}~ é',
		codepage: 19,
		bytes: '1b401b61001b7b001b52461b7413d520232430313233343536373839405b5c5d5e607b7c7d7e2082',
	},
	{
		country: 'india-oriya',
		value: '#$୦୧୨୩୪୫୬୭୮୯@[\\]^`{|}~ AZaz!',
		codepage: 0,
		bytes: '1b401b61001b7b001b5247232430313233343536373839405b5c5d5e607b7c7d7e20415a617a21',
	},
	{
		country: 'india-oriya',
		value: '€ #$୦୧୨୩୪୫୬୭୮୯@[\\]^`{|}~ é',
		codepage: 19,
		bytes: '1b401b61001b7b001b52471b7413d520232430313233343536373839405b5c5d5e607b7c7d7e2082',
	},
	{
		country: 'india-kannada',
		value: '#$೦೧೨೩೪೫೬೭೮೯@[\\]^`{|}~ AZaz!',
		codepage: 0,
		bytes: '1b401b61001b7b001b5248232430313233343536373839405b5c5d5e607b7c7d7e20415a617a21',
	},
	{
		country: 'india-kannada',
		value: '€ #$೦೧೨೩೪೫೬೭೮೯@[\\]^`{|}~ é',
		codepage: 19,
		bytes: '1b401b61001b7b001b52481b7413d520232430313233343536373839405b5c5d5e607b7c7d7e2082',
	},
	{
		country: 'india-malayalam',
		value: '#$൦൧൨൩൪൫൬൭൮൯@[\\]^`{|}~ AZaz!',
		codepage: 0,
		bytes: '1b401b61001b7b001b5249232430313233343536373839405b5c5d5e607b7c7d7e20415a617a21',
	},
	{
		country: 'india-malayalam',
		value: '€ #$൦൧൨൩൪൫൬൭൮൯@[\\]^`{|}~ é',
		codepage: 19,
		bytes: '1b401b61001b7b001b52491b7413d520232430313233343536373839405b5c5d5e607b7c7d7e2082',
	},
	{
		country: 'india-gujarati',
		value: '#$૦૧૨૩૪૫૬૭૮૯@[\\]^`{|}~ AZaz!',
		codepage: 0,
		bytes: '1b401b61001b7b001b524a232430313233343536373839405b5c5d5e607b7c7d7e20415a617a21',
	},
	{
		country: 'india-gujarati',
		value: '€ #$૦૧૨૩૪૫૬૭૮૯@[\\]^`{|}~ é',
		codepage: 19,
		bytes: '1b401b61001b7b001b524a1b7413d520232430313233343536373839405b5c5d5e607b7c7d7e2082',
	},
	{
		country: 'india-punjabi',
		value: '#$੦੧੨੩੪੫੬੭੮੯@[\\]^`{|}~ AZaz!',
		codepage: 0,
		bytes: '1b401b61001b7b001b524b232430313233343536373839405b5c5d5e607b7c7d7e20415a617a21',
	},
	{
		country: 'india-punjabi',
		value: '€ #$੦੧੨੩੪੫੬੭੮੯@[\\]^`{|}~ é',
		codepage: 19,
		bytes: '1b401b61001b7b001b524b1b7413d520232430313233343536373839405b5c5d5e607b7c7d7e2082',
	},
	{
		country: 'india-marathi',
		value: '#$०१२३४५६७८९@[\\]^`{|}~ AZaz!',
		codepage: 0,
		bytes: '1b401b61001b7b001b5252232430313233343536373839405b5c5d5e607b7c7d7e20415a617a21',
	},
	{
		country: 'india-marathi',
		value: '€ #$०१२३४५६७८९@[\\]^`{|}~ é',
		codepage: 19,
		bytes: '1b401b61001b7b001b52521b7413d520232430313233343536373839405b5c5d5e607b7c7d7e2082',
	},
	{ country: 'france', value: '@', codepage: 0, error: new UnencodableCharacterError({ page: 0, index: 0, character: '@' }) },
	{ country: 'germany', value: 'x[', codepage: 0, error: new UnencodableCharacterError({ page: 0, index: 1, character: '[' }) },
	{ country: 'india-devanagari', value: '१5', codepage: 0, error: new UnencodableCharacterError({ page: 0, index: 1, character: '5' }) },
]

const mixedReceipt = {
	type: 'root',
	children: [
		{ type: 'align', align: 'center', children: [{ type: 'text', value: 'Grüße', country: 'germany' }] },
		{ type: 'break' },
		{ type: 'text', value: 'Prix: 10 € é', country: 'france' },
		{ type: 'break' },
		{ type: 'text', value: 'கா கூ க ௨', country: 'india-tamil', codepage: 0 },
		{ type: 'text', value: '#1 @ {x}', country: 'usa' },
		{ type: 'strong', children: [{ type: 'text', value: 'Åsa ¤5', country: 'sweden', codepage: 0 }] },
		{ type: 'text', value: 'no country change' },
		{ type: 'cut', mode: 'full' },
	],
} satisfies Root

const mixedReceiptBytes =
	'1b401b61011b7b001b520247727d7e650a1b61001b7b001b5201507269783a203130201b7413d5207b0a1b61001b7b001b52441b7400362039203120321b520023312040207b787d1b45011b52055d73612024351b45006e6f20636f756e747279206368616e67651d5600'

const mixedReceiptChunks = [
	'1b40',
	'1b61011b7b001b520247727d7e65',
	'0a',
	'1b61001b7b001b5201507269783a203130201b7413d5207b',
	'0a',
	'1b61001b7b001b52441b740036203920312032',
	'1b520023312040207b787d',
	'1b45011b52055d73612024351b4500',
	'6e6f20636f756e747279206368616e6765',
	'1d5600',
]

const hex = (bytes: Uint8Array) => Buffer.from(bytes).toString('hex')

const ReceiptCodepages = codepageLayer([page000, page019])

describe('international character set output', () => {
	it.effect(
		'keeps the recorded output for text in every country',
		Effect.fn(function* () {
			for (const { country, value, codepage, bytes, error } of textCases) {
				const result = yield* Effect.result(encode({ type: 'root', children: [{ type: 'text', value, country, codepage }] }))
				const label = `${country} ${JSON.stringify(value)}`
				if (Result.isSuccess(result)) {
					expect(hex(result.success), label).toBe(bytes)
				} else {
					expect(result.failure, label).toStrictEqual(error)
				}
			}
		}, Effect.provide(ReceiptCodepages)),
	)

	it.effect(
		'keeps the recorded output for a receipt that changes the country',
		Effect.fn(function* () {
			expect(hex(yield* encode(mixedReceipt))).toBe(mixedReceiptBytes)
		}, Effect.provide(ReceiptCodepages)),
	)

	it.effect(
		'keeps the recorded stream chunks for a receipt that changes the country',
		Effect.fn(function* () {
			const chunks = yield* Stream.runCollect(encodeStream(Stream.fromIterable(mixedReceipt.children)))
			expect(chunks.map(hex)).toStrictEqual(mixedReceiptChunks)
		}, Effect.provide(ReceiptCodepages)),
	)
})
