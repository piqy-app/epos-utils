import { page030 } from '../pages/page-030.js'
import { page031 } from '../pages/page-031.js'
import { page052 } from '../pages/page-052.js'
import { codepageLayer } from '../registry.js'

export const vietnameseCodepages = [page030, page031, page052] as const
export const VietnameseCodepagesLayer = codepageLayer(vietnameseCodepages)
