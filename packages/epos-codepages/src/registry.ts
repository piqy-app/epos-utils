import { Context, Effect, Layer } from 'effect'

import { CodepageNotLoadedError, DuplicateCodepageError, type CodepageError } from './errors.js'
import type { Codepage } from './model.js'

export namespace CodepageRegistry {
	export interface Service {
		readonly pages: readonly number[]
		readonly resolve: (page: number) => Effect.Effect<Codepage, CodepageNotLoadedError>
		readonly encode: (page: number, text: string) => Effect.Effect<Uint8Array, CodepageError>
		readonly decode: (page: number, bytes: Uint8Array) => Effect.Effect<string, CodepageNotLoadedError>
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

	return CodepageRegistry.of({ pages: Object.freeze([...byPage.keys()]), resolve, encode, decode })
})

export const codepageLayer = (codepages: readonly Codepage[]) => Layer.effect(CodepageRegistry, makeCodepageRegistry(codepages))
