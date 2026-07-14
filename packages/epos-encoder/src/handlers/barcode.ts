import type {
	AztecCode,
	Barcode,
	BarcodeFormat,
	Composite,
	Composite2DSymbology,
	CompositeGS1DataBarVariant,
	CompositeLineBarcode,
	DataMatrix,
	ErrorCorrection,
	GS1DataBar,
	GS1DataBarSymbology,
	HriFont,
	HriPosition,
	MaxiCode,
	PDF417,
	QRCode,
} from '@piqy/epos-ast'
import iconv from 'iconv-lite'

import { concat, GS, hex, len16 } from '../commands.js'
import type { Handler } from '../handlers.js'

const BARCODE_FORMAT_MAP: Record<BarcodeFormat, number> = {
	'UPC-A': 65,
	'UPC-E': 66,
	EAN13: 67,
	EAN8: 68,
	CODE39: 69,
	ITF: 70,
	CODABAR: 71,
	CODE93: 72,
	CODE128: 73,
}

const HRI_POSITION_MAP: Record<HriPosition, number> = {
	none: 0,
	above: 1,
	below: 2,
	both: 3,
}

const HRI_FONT_MAP: Record<HriFont, number> = {
	A: 0,
	B: 1,
}

// fn472 uses different values: 0=not added, 1=Font A, 2=Font B
const COMPOSITE_HRI_FONT_MAP: Record<HriFont, number> = {
	A: 1,
	B: 2,
}

const EC_MAP: Record<ErrorCorrection, number> = {
	L: 48,
	M: 49,
	Q: 50,
	H: 51,
}

/**
 * Encodes a 1D barcode.
 * @see https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lk.html GS k - Print barcode
 * @see https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lw.html GS w - Set barcode width
 * @see https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lh.html GS h - Set barcode height
 * @see https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_ch.html GS H - Select print position of HRI characters
 * @see https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lf.html GS f - Select font for HRI characters
 */
export const barcode: Handler<Barcode> = (node) => {
	const chunks: Uint8Array[] = []

	if (node.width !== undefined) {
		chunks.push(hex(GS, 'w', node.width))
	}

	if (node.height !== undefined) {
		chunks.push(hex(GS, 'h', node.height))
	}

	if (node.hri !== undefined) {
		chunks.push(hex(GS, 'H', HRI_POSITION_MAP[node.hri]))
	}

	if (node.hriFont !== undefined) {
		chunks.push(hex(GS, 'f', HRI_FONT_MAP[node.hriFont]))
	}

	const m = BARCODE_FORMAT_MAP[node.format]

	// CODE128 requires code set selection prefix
	const codeSetPrefix = node.format === 'CODE128' ? `{${node.codeSet ?? 'B'}` : ''
	const data = iconv.encode(codeSetPrefix + node.data, 'ascii')
	chunks.push(hex(GS, 'k', m, data.length))
	chunks.push(data)

	return concat(...chunks)
}

/**
 * Encodes a QR code.
 * @see https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk.html GS ( k - Set up and print 2D code
 */
export const qrCode: Handler<QRCode> = (node) => {
	const chunks: Uint8Array[] = []
	const data = iconv.encode(node.data, 'utf8')
	const storeLen = data.length + 3

	// select model (spec expects ASCII 49/50 for model 1/2)
	chunks.push(hex(GS, '(', 'k', 4, 0, '1', 'A', (node.model ?? 2) + 48, 0))

	// set module size
	chunks.push(hex(GS, '(', 'k', 3, 0, '1', 'C', node.size ?? 3))

	// set error correction level
	chunks.push(hex(GS, '(', 'k', 3, 0, '1', 'E', EC_MAP[node.errorCorrection ?? 'L']))

	// store data
	const [pL, pH] = len16(storeLen)
	chunks.push(hex(GS, '(', 'k', pL, pH, '1', 'P', '0'))
	chunks.push(data)

	// print
	chunks.push(hex(GS, '(', 'k', 3, 0, '1', 'Q', '0'))

	return concat(...chunks)
}

/**
 * Encodes a PDF417 2D barcode.
 * @see https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk.html GS ( k - Set up and print 2D code
 */
export const pdf417: Handler<PDF417> = (node) => {
	const chunks: Uint8Array[] = []
	const data = iconv.encode(node.data, 'utf8')
	const storeLen = data.length + 3

	if (node.columns !== undefined) {
		chunks.push(hex(GS, '(', 'k', 3, 0, '0', 'A', node.columns))
	}

	if (node.rows !== undefined) {
		chunks.push(hex(GS, '(', 'k', 3, 0, '0', 'B', node.rows))
	}

	if (node.width !== undefined) {
		chunks.push(hex(GS, '(', 'k', 3, 0, '0', 'C', node.width))
	}

	if (node.height !== undefined) {
		chunks.push(hex(GS, '(', 'k', 3, 0, '0', 'D', node.height))
	}

	if (node.errorCorrection !== undefined) {
		const ec = node.errorCorrection
		if (ec.mode === 'level') {
			chunks.push(hex(GS, '(', 'k', 4, 0, '0', 'E', '0', ec.level + 48))
		} else {
			chunks.push(hex(GS, '(', 'k', 4, 0, '0', 'E', '1', ec.ratio))
		}
	}

	if (node.truncated !== undefined) {
		chunks.push(hex(GS, '(', 'k', 3, 0, '0', 'F', node.truncated ? 1 : 0))
	}

	const [pL, pH] = len16(storeLen)
	chunks.push(hex(GS, '(', 'k', pL, pH, '0', 'P', '0'))
	chunks.push(data)

	chunks.push(hex(GS, '(', 'k', 3, 0, '0', 'Q', '0'))

	return concat(...chunks)
}

/**
 * Encodes a DataMatrix 2D barcode.
 * @see https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk.html GS ( k - Set up and print 2D code
 */
export const dataMatrix: Handler<DataMatrix> = (node) => {
	const chunks: Uint8Array[] = []
	const data = iconv.encode(node.data, 'utf8')
	const storeLen = data.length + 3

	// fn='B': symbol type, columns, rows (spec fn666, pL=5)
	if (node.symbolType !== undefined || node.columns !== undefined || node.rows !== undefined) {
		const symbolTypeValue = node.symbolType === 'rectangular' ? 1 : 0
		chunks.push(hex(GS, '(', 'k', 5, 0, '6', 'B', symbolTypeValue, node.columns ?? 0, node.rows ?? 0))
	}

	if (node.size !== undefined) {
		chunks.push(hex(GS, '(', 'k', 3, 0, '6', 'C', node.size))
	}

	const [pL, pH] = len16(storeLen)
	chunks.push(hex(GS, '(', 'k', pL, pH, '6', 'P', '0'))
	chunks.push(data)

	chunks.push(hex(GS, '(', 'k', 3, 0, '6', 'Q', '0'))

	return concat(...chunks)
}

/**
 * Encodes a MaxiCode 2D barcode.
 * @see https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk.html GS ( k - Set up and print 2D code
 */
export const maxiCode: Handler<MaxiCode> = (node) => {
	const chunks: Uint8Array[] = []
	const data = iconv.encode(node.data, 'utf8')
	const storeLen = data.length + 3

	if (node.mode !== undefined) {
		// spec expects ASCII 50-54 for modes 2-6
		chunks.push(hex(GS, '(', 'k', 3, 0, '2', 'A', node.mode + 48))
	}

	const [pL, pH] = len16(storeLen)
	chunks.push(hex(GS, '(', 'k', pL, pH, '2', 'P', '0'))
	chunks.push(data)

	chunks.push(hex(GS, '(', 'k', 3, 0, '2', 'Q', '0'))

	return concat(...chunks)
}

/**
 * Encodes an Aztec Code 2D barcode.
 * @see https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk.html GS ( k - Set up and print 2D code
 */
export const aztecCode: Handler<AztecCode> = (node) => {
	const chunks: Uint8Array[] = []
	const data = iconv.encode(node.data, 'utf8')
	const storeLen = data.length + 3

	// fn='B': combined mode + layers (spec fn566, pL=4)
	const modeValue = node.mode === 'compact' ? 1 : 0
	chunks.push(hex(GS, '(', 'k', 4, 0, '5', 'B', modeValue, node.layers ?? 0))

	if (node.size !== undefined) {
		chunks.push(hex(GS, '(', 'k', 3, 0, '5', 'C', node.size))
	}

	if (node.errorCorrection !== undefined) {
		chunks.push(hex(GS, '(', 'k', 3, 0, '5', 'E', node.errorCorrection))
	}

	const [pL, pH] = len16(storeLen)
	chunks.push(hex(GS, '(', 'k', pL, pH, '5', 'P', '0'))
	chunks.push(data)

	chunks.push(hex(GS, '(', 'k', 3, 0, '5', 'Q', '0'))

	return concat(...chunks)
}

const GS1_SYMBOLOGY_MAP: Record<GS1DataBarSymbology, number> = {
	STACKED: 72,
	'STACKED-OMNIDIRECTIONAL': 73,
	'EXPANDED-STACKED': 76,
}

const COMPOSITE_LINE_BARCODE_MAP: Record<Exclude<CompositeLineBarcode, 'GS1-DATABAR'>, number> = {
	EAN8: 65,
	EAN13: 66,
	'UPC-A': 67,
	'UPC-E': 68,
	'UPC-E-FULL': 69,
	'GS1-128': 77,
}

const COMPOSITE_GS1_VARIANT_MAP: Record<CompositeGS1DataBarVariant, number> = {
	OMNIDIRECTIONAL: 70,
	TRUNCATED: 71,
	STACKED: 72,
	'STACKED-OMNIDIRECTIONAL': 73,
	LIMITED: 74,
	EXPANDED: 75,
	'EXPANDED-STACKED': 76,
}

const COMPOSITE_2D_MAP: Record<Composite2DSymbology, number> = {
	AUTO: 65,
	'CC-C': 66,
}

/**
 * Encodes a GS1 DataBar (formerly RSS) barcode.
 * @see https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk.html GS ( k - Set up and print 2D code
 */
export const gs1DataBar: Handler<GS1DataBar> = (node) => {
	const chunks: Uint8Array[] = []
	const data = iconv.encode(node.data, 'utf8')
	const n = GS1_SYMBOLOGY_MAP[node.symbology]
	const storeLen = data.length + 4

	if (node.width !== undefined) {
		chunks.push(hex(GS, '(', 'k', 3, 0, '3', 'C', node.width))
	}

	if (node.maxWidth !== undefined) {
		const [wL, wH] = len16(node.maxWidth)
		chunks.push(hex(GS, '(', 'k', 4, 0, '3', 'G', wL, wH))
	}

	const [pL, pH] = len16(storeLen)
	chunks.push(hex(GS, '(', 'k', pL, pH, '3', 'P', '0', n))
	chunks.push(data)

	chunks.push(hex(GS, '(', 'k', 3, 0, '3', 'Q', '0'))

	return concat(...chunks)
}

/**
 * Encodes a Composite Symbology barcode.
 *
 * Composite requires two separate fn480 store commands (line element a=48, 2D element a=49)
 * followed by a single fn481 print command.
 *
 * @see https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk.html GS ( k - Set up and print 2D code
 */
export const composite: Handler<Composite> = (node) => {
	const chunks: Uint8Array[] = []

	if (node.width !== undefined) {
		chunks.push(hex(GS, '(', 'k', 3, 0, '4', 'C', node.width))
	}

	if (node.maxWidth !== undefined) {
		const [wL, wH] = len16(node.maxWidth)
		chunks.push(hex(GS, '(', 'k', 4, 0, '4', 'G', wL, wH))
	}

	if (node.hriFont !== undefined) {
		const fontValue = node.hriFont === null ? 0 : COMPOSITE_HRI_FONT_MAP[node.hriFont]
		chunks.push(hex(GS, '(', 'k', 3, 0, '4', 'H', fontValue))
	}

	// resolve b-value for line element
	let lineB: number
	if (node.lineElement.barcode === 'GS1-DATABAR') {
		if (!node.lineElement.symbology) throw new Error('GS1 DataBar composite line element requires a symbology')
		lineB = COMPOSITE_GS1_VARIANT_MAP[node.lineElement.symbology]
	} else {
		lineB = COMPOSITE_LINE_BARCODE_MAP[node.lineElement.barcode]
	}

	// store line element (a='0')
	const lineData = iconv.encode(node.lineElement.data, 'utf8')
	const lineStoreLen = lineData.length + 5
	const [linePL, linePH] = len16(lineStoreLen)
	chunks.push(hex(GS, '(', 'k', linePL, linePH, '4', 'P', '0', '0', lineB))
	chunks.push(lineData)

	// store 2D element (a='1')
	const el2dData = iconv.encode(node.element2D.data, 'utf8')
	const el2dStoreLen = el2dData.length + 5
	const [el2dPL, el2dPH] = len16(el2dStoreLen)
	const el2dB = COMPOSITE_2D_MAP[node.element2D.symbology]
	chunks.push(hex(GS, '(', 'k', el2dPL, el2dPH, '4', 'P', '0', '1', el2dB))
	chunks.push(el2dData)

	// print
	chunks.push(hex(GS, '(', 'k', 3, 0, '4', 'Q', '0'))

	return concat(...chunks)
}
