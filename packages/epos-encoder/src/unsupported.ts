import type { UnsupportedCharacter } from './encoder.js'

const ZERO_WIDTH_JOINER = 0x200d

const isVariationSelector = (codePoint: number) =>
	(codePoint >= 0xfe00 && codePoint <= 0xfe0f) || (codePoint >= 0xe0100 && codePoint <= 0xe01ef)

const isRegionalIndicator = (codePoint: number) => codePoint >= 0x1f1e6 && codePoint <= 0x1f1ff

// variation selectors, skin tones, the keycap mark, and tag characters attach to the previous character
const isExtender = (codePoint: number) =>
	isVariationSelector(codePoint) ||
	(codePoint >= 0x1f3fb && codePoint <= 0x1f3ff) ||
	codePoint === 0x20e3 ||
	(codePoint >= 0xe0020 && codePoint <= 0xe007f)

const codePointLength = (codePoint: number) => (codePoint > 0xffff ? 2 : 1)

/**
 * Returns the end of the emoji-style cluster at start. This covers emoji sequences without Intl.Segmenter,
 * so the result is the same on every runtime.
 */
const clusterEnd = (text: string, start: number) => {
	const first = text.codePointAt(start) ?? 0
	let index = start + codePointLength(first)
	if (isRegionalIndicator(first) && isRegionalIndicator(text.codePointAt(index) ?? 0)) {
		index += 2
	}
	while (index < text.length) {
		const codePoint = text.codePointAt(index) ?? 0
		if (isExtender(codePoint)) {
			index += codePointLength(codePoint)
		} else if (codePoint === ZERO_WIDTH_JOINER && index + 1 < text.length) {
			index += 1 + codePointLength(text.codePointAt(index + 1) ?? 0)
		} else {
			break
		}
	}
	return index
}

export interface TextEdit {
	readonly start: number
	readonly removed: number
	readonly inserted: number
}

/**
 * Maps an index in repaired text to the original text. An index in inserted replacement text maps to the start of the replaced cluster.
 */
export const sourcePosition = (edits: readonly TextEdit[], index: number) => {
	let sourceIndex = index
	let inserted = false
	for (let editIndex = edits.length - 1; editIndex >= 0; editIndex--) {
		const edit = edits[editIndex]
		if (edit === undefined) {
			continue
		}
		if (sourceIndex >= edit.start + edit.inserted) {
			sourceIndex += edit.removed - edit.inserted
		} else if (sourceIndex >= edit.start) {
			sourceIndex = edit.start
			inserted = true
		}
	}
	return { index: sourceIndex, inserted }
}

/**
 * Repairs the cluster that contains the unsupported character at errorIndex.
 * Variation selectors after a supported character are removed. Other clusters are replaced when a replacement is set.
 */
export const repairUnsupportedText = (text: string, errorIndex: number, unsupportedCharacter: UnsupportedCharacter) => {
	let start = 0
	let end = clusterEnd(text, start)
	while (end <= errorIndex && end < text.length) {
		start = end
		end = clusterEnd(text, start)
	}
	const baseEnd = start + codePointLength(text.codePointAt(start) ?? 0)
	let editStart = start
	let replacement: string | undefined
	if (errorIndex >= baseEnd) {
		let onlySelectors = true
		for (let index = baseEnd; index < end;) {
			const codePoint = text.codePointAt(index) ?? 0
			onlySelectors &&= isVariationSelector(codePoint)
			index += codePointLength(codePoint)
		}
		if (onlySelectors) {
			editStart = baseEnd
			replacement = ''
		}
	}
	if (replacement === undefined) {
		if (unsupportedCharacter === 'error') {
			return undefined
		}
		replacement = unsupportedCharacter.replace
	}
	const edit: TextEdit = { start: editStart, removed: end - editStart, inserted: replacement.length }
	return { text: text.slice(0, editStart) + replacement + text.slice(end), edit }
}
