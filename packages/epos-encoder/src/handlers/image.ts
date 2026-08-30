import type { Image } from '@piqy/epos-ast'
import { Effect } from 'effect'

import { concat, GS, hex } from '../commands.js'
import type { Handler } from '../handlers.js'

/**
 * Encodes a raster image using GS ( L or GS 8 L graphics command.
 * Uses GS 8 L (4-byte length) for large images that exceed 65535 bytes.
 * @see https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_cl_fn112.html
 * @see https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_8_cl_fn112.html
 */
export const image: Handler<Image> = (node) =>
	Effect.sync(() => {
		const rawData = new Uint8Array(Buffer.from(node.data, 'base64'))
		const dataLen = 10 + rawData.length

		const bx = node.scaleX ?? 1
		const by = node.scaleY ?? 1

		// use GS 8 L (4-byte length) for large images
		const useLargeFormat = dataLen > 65535

		const storeCmd = useLargeFormat
			? hex(
					GS,
					'8',
					'L',
					dataLen & 0xff,
					(dataLen >> 8) & 0xff,
					(dataLen >> 16) & 0xff,
					(dataLen >> 24) & 0xff,
					'0', // m
					'p', // fn = 112
					'0', // a = color specification
					bx,
					by,
					'1', // c = color 1
					node.width & 0xff,
					(node.width >> 8) & 0xff,
					node.height & 0xff,
					(node.height >> 8) & 0xff,
				)
			: hex(
					GS,
					'(',
					'L',
					dataLen & 0xff,
					(dataLen >> 8) & 0xff,
					'0', // m
					'p', // fn = 112
					'0', // a = color specification
					bx,
					by,
					'1', // c = color 1
					node.width & 0xff,
					(node.width >> 8) & 0xff,
					node.height & 0xff,
					(node.height >> 8) & 0xff,
				)

		return concat(
			storeCmd,
			rawData,
			// GS ( L - function 50: print the graphics data in the print buffer
			hex(GS, '(', 'L', 2, 0, '0', '2'),
		)
	})
