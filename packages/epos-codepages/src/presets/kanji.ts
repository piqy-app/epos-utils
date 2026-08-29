import { page007 } from '../pages/page-007.js'
import { page008 } from '../pages/page-008.js'
import { codepageLayer } from '../registry.js'

export const kanjiCodepages = [page007, page008] as const
export const KanjiCodepagesLayer = codepageLayer(kanjiCodepages)
