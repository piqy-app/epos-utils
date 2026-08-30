---
'@piqy/epos-encoder': minor
---

The encoder no longer includes every character table through `iconv-lite`. Applications must now provide the tables that their printer can use.

```ts
import { encode } from '@piqy/epos-encoder'
import { StandardCodepagesLayer } from '@piqy/epos-codepages/presets/standard'
import { Effect } from 'effect'

const program = encode(receipt).pipe(Effect.provide(StandardCodepagesLayer))
```

The default starting page is now page 0 (PC437). Encoding fails when a required page or character is not available. It no longer replaces unsupported text without an error.
