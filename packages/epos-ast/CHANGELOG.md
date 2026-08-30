# @piqy/epos-ast

## 0.2.0

### Minor Changes

- 084e8ee: Add runtime validation for receipt trees through `@piqy/epos-ast/schema`.
  
  ```ts
  import { Root } from '@piqy/epos-ast/schema'
  import { Effect, Schema } from 'effect'
  
  const receipt = await Effect.runPromise(Schema.decodeUnknownEffect(Root)({ type: 'root', children: [] }))
  ```
  
  The normal `@piqy/epos-ast` import still contains TypeScript types only. Effect is needed only when the `/schema` import is used.
- 7b6b709: `@piqy/epos-ast` now contains only the receipt tree types. Use it to define receipt data:
  
  ```ts
  import type { Root } from '@piqy/epos-ast'
  
  const receipt: Root = {
  	type: 'root',
  	children: [{ type: 'text', value: 'Hello' }],
  }
  ```
  
  The old `CODEPAGES`, `Commands`, `hex`, `str`, `concat`, and `len16` exports were removed from this package. Printer-byte helpers are now private to the encoder. Character tables are available from `@piqy/epos-codepages`.

## 0.1.0

### Minor Changes

- cb89b9a: Publish the initial ESC/POS abstract syntax tree package.
