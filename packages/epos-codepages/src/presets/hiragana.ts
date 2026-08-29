import { page006 } from '../pages/page-006.js'
import { codepageLayer } from '../registry.js'

export const hiraganaCodepages = [page006] as const
export const HiraganaCodepagesLayer = codepageLayer(hiraganaCodepages)
