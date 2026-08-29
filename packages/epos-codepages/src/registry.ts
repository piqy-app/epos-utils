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
		const candidates = options.candidatePages === undefined ? [...byPage.values()] : yield* Effect.forEach(options.candidatePages, resolve)
		const byPreference = [
			...candidates.filter((codepage) => codepage.page === options.currentPage),
			...candidates.filter((codepage) => options.usedPages?.has(codepage.page) === true && codepage.page !== options.currentPage),
			...candidates.filter((codepage) => codepage.page !== options.currentPage && options.usedPages?.has(codepage.page) !== true),
		]
		const segments: { page: number; text: string }[] = []
		let index = 0
		let currentPage = options.currentPage
		while (index < text.length) {
			const codePoint = text.codePointAt(index)
			if (codePoint === undefined) {
				break
			}
			const character = String.fromCodePoint(codePoint)
			const selected =
				byPreference.find((codepage) => codepage.page === currentPage && codepage.canEncode(character)) ??
				byPreference.find((codepage) => codepage.canEncode(character))
			if (selected === undefined) {
				return yield* new NoCodepageSupportsCharacterError({
					index,
					character,
					pages: candidates.map((codepage) => codepage.page),
				})
			}
			const previous = segments.at(-1)
			if (previous?.page === selected.page) {
				previous.text += character
			} else {
				segments.push({ page: selected.page, text: character })
			}
			currentPage = selected.page
			index += character.length
		}
		return yield* Effect.forEach(
			segments,
			Effect.fn(function* (segment) {
				return { ...segment, bytes: yield* encode(segment.page, segment.text) }
			}),
		)
	})

	return CodepageRegistry.of({ pages: Object.freeze([...byPage.keys()]), resolve, encode, decode, plan })
})

export const codepageLayer = (codepages: readonly Codepage[]) => Layer.effect(CodepageRegistry, makeCodepageRegistry(codepages))
