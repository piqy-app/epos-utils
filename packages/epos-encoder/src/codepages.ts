interface CodepageNames {
	readonly [page: number]: string
}

/**
 * ESC/POS codepage mappings to iconv-lite encodings.
 */
export const CODEPAGES: CodepageNames = {
	0: 'cp437',
	2: 'cp850',
	3: 'cp860',
	4: 'cp863',
	5: 'cp865',
	11: 'cp851',
	12: 'cp853',
	13: 'cp857',
	14: 'cp737',
	15: 'iso88597',
	16: 'win1252',
	17: 'cp866',
	18: 'cp852',
	19: 'cp858',
	32: 'cp720',
	33: 'cp775',
	34: 'cp855',
	35: 'cp861',
	36: 'cp862',
	37: 'cp864',
	38: 'cp869',
	39: 'iso88592',
	40: 'iso885915',
	45: 'win1250',
	46: 'win1251',
	47: 'win1253',
	48: 'win1254',
	49: 'win1255',
	50: 'win1256',
	51: 'win1257',
	52: 'win1258',
}

export const DEFAULT_CODEPAGE = 0
