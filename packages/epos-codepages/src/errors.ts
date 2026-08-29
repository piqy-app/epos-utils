import { Schema } from 'effect'

export class CodepageNotLoadedError extends Schema.TaggedError<CodepageNotLoadedError>()('CodepageNotLoadedError', {
	page: Schema.Number,
}) {}

export class DuplicateCodepageError extends Schema.TaggedError<DuplicateCodepageError>()('DuplicateCodepageError', {
	page: Schema.Number,
}) {}

export class UnencodableCharacterError extends Schema.TaggedError<UnencodableCharacterError>()('UnencodableCharacterError', {
	page: Schema.Number,
	index: Schema.Number,
	character: Schema.String,
}) {}

export type CodepageError = CodepageNotLoadedError | UnencodableCharacterError
