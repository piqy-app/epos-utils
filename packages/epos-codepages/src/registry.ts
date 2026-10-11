import { Context, Effect, Layer } from 'effect'

import {
	CodepageNotLoadedError,
	DuplicateCodepageError,
	NoCodepageSupportsCharacterError,
	type CodepageEncodeError,
	type CodepagePlanningError,
} from './errors.js'
import type { Codepage, CodepageSegment, PlanTextOptions } from './model.js'

export namespace CodepageRegistry {
	export interface Service {
		readonly pages: readonly number[]
		readonly resolve: (page: number) => Effect.Effect<Codepage, CodepageNotLoadedError>
		readonly encode: (page: number, text: string) => Effect.Effect<Uint8Array, CodepageEncodeError>
		readonly decode: (page: number, bytes: Uint8Array) => Effect.Effect<string, CodepageNotLoadedError>
		readonly plan: (text: string, options?: PlanTextOptions) => Effect.Effect<readonly CodepageSegment[], CodepagePlanningError>
	}
}

export class CodepageRegistry extends Context.Service<CodepageRegistry, CodepageRegistry.Service>()('epos-codepages/CodepageRegistry') {}

// RETURN TYPE: the predicate narrows an optional token length to a number for the caller
const isTokenLength = (text: string, index: number, tokenLength: number | undefined): tokenLength is number =>
	tokenLength !== undefined && Number.isSafeInteger(tokenLength) && tokenLength > 0 && index + tokenLength <= text.length

/** Returns the UTF-16 length of the next token at index that the page can encode. */
export const codepageTokenLengthAt = (codepage: Codepage, text: string, index: number) => {
	const tokenLength = codepage.tokenLengthAt?.(text, index)
	if (isTokenLength(text, index, tokenLength)) {
		return tokenLength
	}
	const codePoint = text.codePointAt(index)
	if (codePoint === undefined) {
		return undefined
	}
	const character = String.fromCodePoint(codePoint)
	return codepage.canEncode(character) ? character.length : undefined
}

export const makeCodepageRegistry = Effect.fn(function* (codepages: readonly Codepage[]) {
	const byPage = new Map<number, Codepage>()
	for (const codepage of codepages) {
		if (byPage.has(codepage.page)) {
			return yield* new DuplicateCodepageError({ page: codepage.page })
		}
		byPage.set(codepage.page, codepage)
	}
	const candidates = [...byPage.values()]
	const pageNumbers = candidates.map((codepage) => codepage.page)
	const pages = Object.freeze([...pageNumbers])

	const resolve: CodepageRegistry.Service['resolve'] = Effect.fn(function* (page) {
		const codepage = byPage.get(page)
		if (codepage === undefined) {
			return yield* new CodepageNotLoadedError({ page })
		}
		return codepage
	})
	const encode: CodepageRegistry.Service['encode'] = Effect.fn(function* (page, text) {
		return yield* (yield* resolve(page)).encode(text)
	})
	const decode: CodepageRegistry.Service['decode'] = Effect.fn(function* (page, bytes) {
		return (yield* resolve(page)).decode(bytes)
	})
	const plan: CodepageRegistry.Service['plan'] = Effect.fn(function* (text, options = {}) {
		const byPreference: Codepage[] = []
		let currentCodepage = options.currentPage === undefined ? undefined : byPage.get(options.currentPage)
		if (currentCodepage !== undefined) {
			byPreference.push(currentCodepage)
		}
		for (const codepage of candidates) {
			if (codepage !== currentCodepage && options.usedPages?.has(codepage.page) === true) {
				byPreference.push(codepage)
			}
		}
		for (const codepage of candidates) {
			if (codepage !== currentCodepage && options.usedPages?.has(codepage.page) !== true) {
				byPreference.push(codepage)
			}
		}
		const { pageIndependentTokenLengthAt } = options
		const segments: { page: number; text: string }[] = []
		let index = 0
		let segmentStart = 0
		let segmentPage: number | undefined
		while (index < text.length) {
			const codePoint = text.codePointAt(index)
			if (codePoint === undefined) {
				break
			}
			let selected = currentCodepage
			let selectedTokenLength = selected === undefined ? undefined : codepageTokenLengthAt(selected, text, index)
			if (selectedTokenLength === undefined && pageIndependentTokenLengthAt !== undefined) {
				// keep the current page for a token that every page can print
				const pageIndependentLength = pageIndependentTokenLengthAt(text, index)
				if (isTokenLength(text, index, pageIndependentLength)) {
					selected = currentCodepage ?? byPreference[0]
					selectedTokenLength = pageIndependentLength
				}
			}
			if (selected === undefined || selectedTokenLength === undefined) {
				selected = undefined
				for (const codepage of byPreference) {
					if (codepage === currentCodepage) {
						continue
					}
					const candidateTokenLength = codepageTokenLengthAt(codepage, text, index)
					if (candidateTokenLength !== undefined) {
						selected = codepage
						selectedTokenLength = candidateTokenLength
						break
					}
				}
			}
			if (selected === undefined || selectedTokenLength === undefined) {
				return yield* new NoCodepageSupportsCharacterError({ index, character: String.fromCodePoint(codePoint), pages: pageNumbers })
			}
			if (segmentPage !== selected.page) {
				if (segmentPage !== undefined) {
					segments.push({ page: segmentPage, text: text.slice(segmentStart, index) })
				}
				segmentPage = selected.page
				segmentStart = index
			}
			currentCodepage = selected
			index += selectedTokenLength
		}
		if (segmentPage !== undefined) {
			segments.push({ page: segmentPage, text: text.slice(segmentStart) })
		}
		return segments
	})

	return CodepageRegistry.of({ pages, resolve, encode, decode, plan })
})

export const codepageLayer = (codepages: readonly Codepage[]) => Layer.effect(CodepageRegistry, makeCodepageRegistry(codepages))
