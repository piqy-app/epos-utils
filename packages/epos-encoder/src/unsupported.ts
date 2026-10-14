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

// merged Extended_Pictographic ranges from Unicode 16.0 emoji-data.txt
const PICTOGRAPHIC_RANGES = [
	[0xa9, 0xa9],
	[0xae, 0xae],
	[0x203c, 0x203c],
	[0x2049, 0x2049],
	[0x2122, 0x2122],
	[0x2139, 0x2139],
	[0x2194, 0x2199],
	[0x21a9, 0x21aa],
	[0x231a, 0x231b],
	[0x2328, 0x2328],
	[0x2388, 0x2388],
	[0x23cf, 0x23cf],
	[0x23e9, 0x23f3],
	[0x23f8, 0x23fa],
	[0x24c2, 0x24c2],
	[0x25aa, 0x25ab],
	[0x25b6, 0x25b6],
	[0x25c0, 0x25c0],
	[0x25fb, 0x25fe],
	[0x2600, 0x2605],
	[0x2607, 0x2612],
	[0x2614, 0x2685],
	[0x2690, 0x2705],
	[0x2708, 0x2712],
	[0x2714, 0x2714],
	[0x2716, 0x2716],
	[0x271d, 0x271d],
	[0x2721, 0x2721],
	[0x2728, 0x2728],
	[0x2733, 0x2734],
	[0x2744, 0x2744],
	[0x2747, 0x2747],
	[0x274c, 0x274c],
	[0x274e, 0x274e],
	[0x2753, 0x2755],
	[0x2757, 0x2757],
	[0x2763, 0x2767],
	[0x2795, 0x2797],
	[0x27a1, 0x27a1],
	[0x27b0, 0x27b0],
	[0x27bf, 0x27bf],
	[0x2934, 0x2935],
	[0x2b05, 0x2b07],
	[0x2b1b, 0x2b1c],
	[0x2b50, 0x2b50],
	[0x2b55, 0x2b55],
	[0x3030, 0x3030],
	[0x303d, 0x303d],
	[0x3297, 0x3297],
	[0x3299, 0x3299],
	[0x1f000, 0x1f0ff],
	[0x1f10d, 0x1f10f],
	[0x1f12f, 0x1f12f],
	[0x1f16c, 0x1f171],
	[0x1f17e, 0x1f17f],
	[0x1f18e, 0x1f18e],
	[0x1f191, 0x1f19a],
	[0x1f1ad, 0x1f1e5],
	[0x1f201, 0x1f20f],
	[0x1f21a, 0x1f21a],
	[0x1f22f, 0x1f22f],
	[0x1f232, 0x1f23a],
	[0x1f23c, 0x1f23f],
	[0x1f249, 0x1f3fa],
	[0x1f400, 0x1f53d],
	[0x1f546, 0x1f64f],
	[0x1f680, 0x1f6ff],
	[0x1f774, 0x1f77f],
	[0x1f7d5, 0x1f7ff],
	[0x1f80c, 0x1f80f],
	[0x1f848, 0x1f84f],
	[0x1f85a, 0x1f85f],
	[0x1f888, 0x1f88f],
	[0x1f8ae, 0x1f8ff],
	[0x1f90c, 0x1f93a],
	[0x1f93c, 0x1f945],
	[0x1f947, 0x1faff],
	[0x1fc00, 0x1fffd],
] as const

// pictographs that a zero width joiner connects; other characters after a joiner start a new cluster
const isPictographic = (codePoint: number) => PICTOGRAPHIC_RANGES.some(([first, last]) => codePoint >= first && codePoint <= last)

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
			if (next !== undefined && isPictographic(next)) {
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
		let clusterStart = index
		let clusterStop = clusterEnd(text, clusterStart)
		while (index < clusterStop) {
			const tokenLength = supportedTokenLengthAt(text, index)
			if (tokenLength === undefined) {
				repair(clusterStart, clusterStop, index)
				index = clusterStop
				break
			}
			index += tokenLength
			// a compound token crosses the cluster end, so continue in the cluster that contains its last character
			while (index > clusterStop) {
				clusterStart = clusterStop
				clusterStop = clusterEnd(text, clusterStart)
			}
		}
	}
	return { text: output + text.slice(copied), edits }
}
