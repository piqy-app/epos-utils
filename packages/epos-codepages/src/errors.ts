import { Schema } from 'effect'

export class CodepageNotLoadedError extends Schema.TaggedError<CodepageNotLoadedError>()('CodepageNotLoadedError', {
	page: Schema.Number,
}) {}

export class DuplicateCodepageError extends Schema.TaggedError<DuplicateCodepageError>()('DuplicateCodepageError', {
	page: Schema.Number,
}) {}

export class NoCodepageSupportsCharacterError extends Schema.TaggedError<NoCodepageSupportsCharacterError>()(
	'NoCodepageSupportsCharacterError',
	{
		index: Schema.Number,
		character: Schema.String,
		pages: Schema.Array(Schema.Number),
	},
) {}

export class UnencodableCharacterError extends Schema.TaggedError<UnencodableCharacterError>()('UnencodableCharacterError', {
	page: Schema.Number,
	index: Schema.Number,
	character: Schema.String,
}) {}

export type CodepageEncodeError = CodepageNotLoadedError | UnencodableCharacterError
export type CodepagePlanningError = NoCodepageSupportsCharacterError
export type CodepageError = CodepageEncodeError | CodepagePlanningError
