---
'@piqy/epos-codepages': minor
'@piqy/epos-encoder': minor
---

Text without a `codepage` now uses any provided character table that can encode it. The encoder starts on page 0 and changes pages only when necessary.

```ts
import type { Root } from '@piqy/epos-ast'
import { encode } from '@piqy/epos-encoder'
import { CodepageRegistry, codepageLayer } from '@piqy/epos-codepages'
import { page000 } from '@piqy/epos-codepages/pages/page-000'
import { page019 } from '@piqy/epos-codepages/pages/page-019'
import { Effect } from 'effect'

const receipt = {
	type: 'root',
	children: [{ type: 'text', value: 'Price: 10 €' }],
} satisfies Root

const program = encode(receipt).pipe(Effect.provide(codepageLayer([page000, page019])))
```

Set a page on a text node to use that exact page. To turn automatic selection off for all text, use:

```ts
encode(receipt, { automaticCodepage: false, codepage: 0 })
```

`CodepageRegistry.plan` exposes the same selection for direct use:

```ts
const plan = Effect.gen(function* () {
	const codepages = yield* CodepageRegistry
	return yield* codepages.plan('Price: 10 €', { currentPage: 0 })
}).pipe(Effect.provide(codepageLayer([page000, page019])))
```

Encoding and planning fail when none of the provided tables support a character.
