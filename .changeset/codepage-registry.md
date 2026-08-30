---
'@piqy/epos-codepages': minor
---

Add `@piqy/epos-codepages` for encoding and decoding ESC/POS text. Character tables are separate imports, so an application includes only the tables that it selects.

```ts
import { CodepageRegistry, codepageLayer } from '@piqy/epos-codepages'
import { page019 } from '@piqy/epos-codepages/pages/page-019'
import { Effect } from 'effect'

const program = Effect.gen(function* () {
	const codepages = yield* CodepageRegistry
	return yield* codepages.encode(19, 'Price: 10 €')
}).pipe(Effect.provide(codepageLayer([page019])))
```

Encoding now fails when a page is not provided or a character is not available. It does not insert replacement characters.
