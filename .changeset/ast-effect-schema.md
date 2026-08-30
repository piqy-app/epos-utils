---
'@piqy/epos-ast': minor
---

Add runtime validation for receipt trees through `@piqy/epos-ast/schema`.

```ts
import { Root } from '@piqy/epos-ast/schema'
import { Effect, Schema } from 'effect'

const receipt = await Effect.runPromise(Schema.decodeUnknownEffect(Root)({ type: 'root', children: [] }))
```

The normal `@piqy/epos-ast` import still contains TypeScript types only. Effect is needed only when the `/schema` import is used.
