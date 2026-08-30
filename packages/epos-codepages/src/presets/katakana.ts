import { page001 } from '../pages/page-001.js'
import { codepageLayer } from '../registry.js'

export const katakanaCodepages = [page001] as const
export const KatakanaCodepagesLayer = codepageLayer(katakanaCodepages)
