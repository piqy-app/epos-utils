import { page030 } from '../pages/page-030.js'
import { page031 } from '../pages/page-031.js'
import { codepageLayer } from '../registry.js'
import { hiraganaCodepages } from './hiragana.js'
import { indicCodepages } from './indic.js'
import { kanjiCodepages } from './kanji.js'
import { katakanaCodepages } from './katakana.js'
import { standardCodepages } from './standard.js'
import { thaiCodepages } from './thai.js'

export const availableCodepages = [
	...standardCodepages,
	...katakanaCodepages,
	...hiraganaCodepages,
	...kanjiCodepages,
	...thaiCodepages,
	page030,
	page031,
	...indicCodepages,
].toSorted((left, right) => left.page - right.page)
export const AvailableCodepagesLayer = codepageLayer(availableCodepages)
