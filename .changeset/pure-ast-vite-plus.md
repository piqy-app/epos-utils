---
'@piqy/epos-ast': minor
---

`@piqy/epos-ast` now contains only the receipt tree types. Use it to define receipt data:

```ts
import type { Root } from '@piqy/epos-ast'

const receipt: Root = {
	type: 'root',
	children: [{ type: 'text', value: 'Hello' }],
}
```

The old `CODEPAGES`, `Commands`, `hex`, `str`, `concat`, and `len16` exports were removed from this package. Printer-byte helpers are now private to the encoder. Character tables are available from `@piqy/epos-codepages`.
