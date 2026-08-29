import { page066 } from '../pages/page-066.js'
import { page067 } from '../pages/page-067.js'
import { page068 } from '../pages/page-068.js'
import { page069 } from '../pages/page-069.js'
import { page071 } from '../pages/page-071.js'
import { page072 } from '../pages/page-072.js'
import { page073 } from '../pages/page-073.js'
import { page074 } from '../pages/page-074.js'
import { page075 } from '../pages/page-075.js'
import { page082 } from '../pages/page-082.js'
import { codepageLayer } from '../registry.js'

export const indicCodepages = [page066, page067, page068, page069, page071, page072, page073, page074, page075, page082] as const
export const IndicCodepagesLayer = codepageLayer(indicCodepages)
