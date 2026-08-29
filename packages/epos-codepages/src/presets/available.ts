import { codepageLayer } from '../registry.js'
import { indicCodepages } from './indic.js'
import { standardCodepages } from './standard.js'
import { page030 } from '../pages/page-030.js'
import { page031 } from '../pages/page-031.js'

export const availableCodepages = [...standardCodepages, page030, page031, ...indicCodepages] as const
export const AvailableCodepagesLayer = codepageLayer(availableCodepages)
