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

export const makeCodepageRegistry = Effect.fn(function* (codepages: readonly Codepage[]) {
	const byPage = new Map<number, Codepage>()
	for (const codepage of codepages) {
		if (byPage.has(codepage.page)) {
			return yield* new DuplicateCodepageError({ page: codepage.page })
		}
		byPage.set(codepage.page, codepage)
	}

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
		const candidates = [...byPage.values()]
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
		const segments: { page: number; text: string }[] = []
		let index = 0
		let segmentStart = 0
		let segmentPage: number | undefined
		while (index < text.length) {
			const codePoint = text.codePointAt(index)
			if (codePoint === undefined) {
				break
			}
			const character = String.fromCodePoint(codePoint)
			let selected = currentCodepage?.canEncode(character) === true ? currentCodepage : undefined
			if (selected === undefined) {
				for (const codepage of byPreference) {
					if (codepage !== currentCodepage && codepage.canEncode(character)) {
						selected = codepage
						break
					}
				}
			}
			if (selected === undefined) {
				return yield* new NoCodepageSupportsCharacterError({
					index,
					character,
					pages: candidates.map((codepage) => codepage.page),
				})
			}
			if (segmentPage !== selected.page) {
				if (segmentPage !== undefined) {
					segments.push({ page: segmentPage, text: text.slice(segmentStart, index) })
				}
				segmentPage = selected.page
				segmentStart = index
			}
			currentCodepage = selected
			index += character.length
		}
		if (segmentPage !== undefined) {
			segments.push({ page: segmentPage, text: text.slice(segmentStart) })
		}
		return segments
	})

	return CodepageRegistry.of({ pages: Object.freeze([...byPage.keys()]), resolve, encode, decode, plan })
})

export const codepageLayer = (codepages: readonly Codepage[]) => Layer.effect(CodepageRegistry, makeCodepageRegistry(codepages))
