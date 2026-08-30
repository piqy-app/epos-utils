---
'@piqy/epos-codepages': minor
---

Add all fixed Epson ESC/POS character tables. This includes PC720, PC853, PC1098, Lithuanian, TCVN-3, ISCII, Thai, Kana, and Kanji tables.

Import one page when the printer setup is known:

```ts
import { page041 } from '@piqy/epos-codepages/pages/page-041'
```

Or import a prepared group:

```ts
import { StandardCodepagesLayer } from '@piqy/epos-codepages/presets/standard'
import { ThaiCodepagesLayer } from '@piqy/epos-codepages/presets/thai'
import { AvailableCodepagesLayer } from '@piqy/epos-codepages/presets/available'
```

Only imported pages are added to the application. Pages 254 and 255 remain application-defined because printers can assign their own characters to them.
