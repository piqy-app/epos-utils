const HIGH_START = 0x80

export const bengaliIsciiHigh =
	'                                 ঁংঃঅআইঈউঊঋ এঐ  ওঔ কখগঘঙচছজঝঞটঠডঢণতথদধন পফবভমযয়র ল   শষসহ ািীুূৃ েৈ  োৌ ়্       ০১২৩৪৫৬৭৮৯     '

export const assameseIsciiHigh = () => {
	const high = Array.from(bengaliIsciiHigh)
	high[0xcf - HIGH_START] = 'ৰ'
	high[0xd4 - HIGH_START] = 'ৱ'
	return high.join('')
}
