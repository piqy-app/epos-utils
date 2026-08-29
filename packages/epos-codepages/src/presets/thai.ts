import { page020 } from '../pages/page-020.js'
import { page021 } from '../pages/page-021.js'
import { page022 } from '../pages/page-022.js'
import { page023 } from '../pages/page-023.js'
import { page024 } from '../pages/page-024.js'
import { page025 } from '../pages/page-025.js'
import { page026 } from '../pages/page-026.js'
import { codepageLayer } from '../registry.js'

export const thaiCodepages = [page020, page021, page022, page023, page024, page025, page026] as const
export const ThaiCodepagesLayer = codepageLayer(thaiCodepages)
