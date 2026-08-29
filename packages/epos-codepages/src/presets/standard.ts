import { page000 } from '../pages/page-000.js'
import { page002 } from '../pages/page-002.js'
import { page003 } from '../pages/page-003.js'
import { page004 } from '../pages/page-004.js'
import { page005 } from '../pages/page-005.js'
import { page011 } from '../pages/page-011.js'
import { page012 } from '../pages/page-012.js'
import { page013 } from '../pages/page-013.js'
import { page014 } from '../pages/page-014.js'
import { page015 } from '../pages/page-015.js'
import { page016 } from '../pages/page-016.js'
import { page017 } from '../pages/page-017.js'
import { page018 } from '../pages/page-018.js'
import { page019 } from '../pages/page-019.js'
import { page032 } from '../pages/page-032.js'
import { page033 } from '../pages/page-033.js'
import { page034 } from '../pages/page-034.js'
import { page035 } from '../pages/page-035.js'
import { page036 } from '../pages/page-036.js'
import { page037 } from '../pages/page-037.js'
import { page038 } from '../pages/page-038.js'
import { page039 } from '../pages/page-039.js'
import { page040 } from '../pages/page-040.js'
import { page041 } from '../pages/page-041.js'
import { page042 } from '../pages/page-042.js'
import { page043 } from '../pages/page-043.js'
import { page044 } from '../pages/page-044.js'
import { page045 } from '../pages/page-045.js'
import { page046 } from '../pages/page-046.js'
import { page047 } from '../pages/page-047.js'
import { page048 } from '../pages/page-048.js'
import { page049 } from '../pages/page-049.js'
import { page050 } from '../pages/page-050.js'
import { page051 } from '../pages/page-051.js'
import { page052 } from '../pages/page-052.js'
import { page053 } from '../pages/page-053.js'
import { codepageLayer } from '../registry.js'

export const standardCodepages = [
	page000,
	page002,
	page003,
	page004,
	page005,
	page011,
	page012,
	page013,
	page014,
	page015,
	page016,
	page017,
	page018,
	page019,
	page032,
	page033,
	page034,
	page035,
	page036,
	page037,
	page038,
	page039,
	page040,
	page041,
	page042,
	page043,
	page044,
	page045,
	page046,
	page047,
	page048,
	page049,
	page050,
	page051,
	page052,
	page053,
] as const

export const StandardCodepagesLayer = codepageLayer(standardCodepages)
