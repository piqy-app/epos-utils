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

// symbols and pictographs that a zero width joiner connects; other characters after a joiner start a new cluster
const isEmojiContinuation = (codePoint: number) =>
	(codePoint >= 0x2600 && codePoint <= 0x27bf) ||
	(codePoint >= 0x2b00 && codePoint <= 0x2bff) ||
	(codePoint >= 0x1f000 && codePoint <= 0x1faff)

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
		} else if (codePoint === ZERO_WIDTH_JOINER) {
			index += 1
			const next = text.codePointAt(index)
			if (next !== undefined && isEmojiContinuation(next)) {
				index += codePointLength(next)
			}
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
 * Each edit start refers to the text after all earlier edits.
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
 * Repairs the cluster that failed at errorIndex, then every later cluster that supportedTokenLengthAt cannot encode.
 * One pass repairs all of them, so text with many emoji does not need one encoding pass per emoji.
 * Variation selectors after supported text are removed. Other clusters are replaced when a replacement is set.
 * Returns undefined when the failed cluster cannot be repaired.
 */
export const repairUnsupportedText = (
	text: string,
	errorIndex: number,
	supportedTokenLengthAt: (text: string, index: number) => number | undefined,
	unsupportedCharacter: UnsupportedCharacter,
) => {
	const edits: TextEdit[] = []
	let output = ''
	let copied = 0
	// text from start to failedIndex is supported
	const repair = (start: number, end: number, failedIndex: number) => {
		let onlySelectors = failedIndex > start
		for (let index = failedIndex; onlySelectors && index < end;) {
			const codePoint = text.codePointAt(index) ?? 0
			onlySelectors = isVariationSelector(codePoint)
			index += codePointLength(codePoint)
		}
		if (!onlySelectors && unsupportedCharacter === 'error') {
			return false
		}
		const editStart = onlySelectors ? failedIndex : start
		const replacement = onlySelectors || unsupportedCharacter === 'error' ? '' : unsupportedCharacter.replace
		output += text.slice(copied, editStart)
		edits.push({ start: output.length, removed: end - editStart, inserted: replacement.length })
		output += replacement
		copied = end
		return true
	}

	let start = 0
	let end = clusterEnd(text, start)
	while (end <= errorIndex && end < text.length) {
		start = end
		end = clusterEnd(text, start)
	}
	if (!repair(start, end, errorIndex)) {
		return undefined
	}
	let index = end
	while (index < text.length) {
		const clusterStart = index
		let clusterStop = clusterEnd(text, clusterStart)
		while (index < clusterStop) {
			const tokenLength = supportedTokenLengthAt(text, index)
			if (tokenLength === undefined) {
				repair(clusterStart, clusterStop, index)
				index = clusterStop
				break
			}
			index += tokenLength
			if (index > clusterStop) {
				// a compound token crosses the cluster end, so its last character continues the cluster
				const lastStart = index - (index - 2 >= clusterStart && (text.codePointAt(index - 2) ?? 0) > 0xffff ? 2 : 1)
				clusterStop = clusterEnd(text, lastStart)
			}
		}
	}
	return { text: output + text.slice(copied), edits }
}
