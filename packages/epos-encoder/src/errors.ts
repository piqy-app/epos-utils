import { Schema } from 'effect'

/**
 * Reports an AST node for which no encoder handler is installed.
 */
export class UnsupportedNodeError extends Schema.TaggedError<UnsupportedNodeError>()('UnsupportedNodeError', {
	nodeType: Schema.String,
}) {}

/**
 * Reports invalid data in an AST node.
 */
export class InvalidNodeError extends Schema.TaggedError<InvalidNodeError>()('InvalidNodeError', {
	nodeType: Schema.String,
	message: Schema.String,
}) {}

export type EncoderError = UnsupportedNodeError | InvalidNodeError
