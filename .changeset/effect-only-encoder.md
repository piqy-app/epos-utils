---
'@piqy/epos-encoder': minor
---

`encode` now returns an Effect instead of returning a `Uint8Array` immediately. Provide the character tables for the printer, then run the Effect.

Before:

```ts
import { encode } from '@piqy/epos-encoder'
import { encodeStream } from '@piqy/epos-encoder/effect'

const bytes = encode(receipt)
```

After:

```ts
import { encode, encodeStream } from '@piqy/epos-encoder'
import { StandardCodepagesLayer } from '@piqy/epos-codepages/presets/standard'
import { Effect } from 'effect'

const bytes = await Effect.runPromise(encode(receipt).pipe(Effect.provide(StandardCodepagesLayer)))
```

`encodeStream` is now imported from `@piqy/epos-encoder`, not `@piqy/epos-encoder/effect`.

Encoding errors are reported by the returned Effect or Stream. `InvalidNodeError` and `UnsupportedNodeError` are now public. Each run has separate printer state, so the same program can run more than once or at the same time.

The following low-level exports were removed: `DEFAULT_CODEPAGE`, `EncoderContext`, `EncoderExtension`, `Handler`, `HandlersRecord`, `defaultHandlers`, and `makeEncoderContext`. Use `encode` or `encodeStream` instead. Effect v4 is now required.
