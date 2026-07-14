// TODO: replace iconv-lite with our own hand-crafted codepages solution

/**
 * ESC/POS codepage mappings to iconv-lite encodings
 */
export const CODEPAGES: Record<number, string> = {
	0: 'cp437', // PC437: USA, Standard Europe
	2: 'cp850', // PC850: Multilingual
	3: 'cp860', // PC860: Portuguese
	4: 'cp863', // PC863: Canadian-French
	5: 'cp865', // PC865: Nordic
	11: 'cp851', // PC851: Greek
	12: 'cp853', // PC853: Turkish
	13: 'cp857', // PC857: Turkish
	14: 'cp737', // PC737: Greek
	15: 'iso88597', // ISO8859-7: Greek
	16: 'win1252', // WPC1252: Windows Latin 1
	17: 'cp866', // PC866: Cyrillic #2
	18: 'cp852', // PC852: Latin 2
	19: 'cp858', // PC858: Euro (default)
	32: 'cp720', // PC720: Arabic
	33: 'cp775', // WPC775: Baltic Rim
	34: 'cp855', // PC855: Cyrillic
	35: 'cp861', // PC861: Icelandic
	36: 'cp862', // PC862: Hebrew
	37: 'cp864', // PC864: Arabic
	38: 'cp869', // PC869: Greek
	39: 'iso88592', // ISO8859-2: Latin 2
	40: 'iso885915', // ISO8859-15: Latin 9
	45: 'win1250', // WPC1250: Latin 2
	46: 'win1251', // WPC1251: Cyrillic
	47: 'win1253', // WPC1253: Greek
	48: 'win1254', // WPC1254: Turkish
	49: 'win1255', // WPC1255: Hebrew
	50: 'win1256', // WPC1256: Arabic
	51: 'win1257', // WPC1257: Baltic Rim
	52: 'win1258', // WPC1258: Vietnamese
}

export const DEFAULT_CODEPAGE = 0
