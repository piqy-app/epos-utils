import type { HandlersRecord } from '../handlers.js'
import { cut, feed, pulse } from './actions.js'
import { aztecCode, barcode, composite, dataMatrix, gs1DataBar, maxiCode, pdf417, qrCode } from './barcode.js'
import { color, doubleStrike, font, inverted, rotated, scaled, smoothing, strong, underline, upsideDown } from './formatting.js'
import { image } from './image.js'
import { align, characterSpacing, lineSpacing, margin, position, printArea, tabStops } from './layout.js'
import { raw } from './raw.js'
import { lineBreak, tab, text } from './text.js'

export const defaultHandlers: HandlersRecord = {
	// text
	text,
	break: lineBreak,
	tab,

	// formatting
	strong,
	underline,
	inverted,
	scaled,
	rotated,
	upsideDown,
	smoothing,
	doubleStrike,
	font,
	color,

	// layout
	align,
	lineSpacing,
	characterSpacing,
	margin,
	printArea,
	tabStops,
	position,

	// actions
	feed,
	cut,
	pulse,

	// barcodes
	barcode,
	qrCode,
	pdf417,
	dataMatrix,
	maxiCode,
	aztecCode,
	gs1DataBar,
	composite,

	// image
	image,

	// raw
	raw,
}
