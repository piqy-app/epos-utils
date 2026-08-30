# @piqy/epos-encoder

## 0.3.0

### Minor Changes

- 1175ee7: Text without a `codepage` now uses any provided character table that can encode it. The encoder starts on page 0 and changes pages only when necessary.
  
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
- 4b5d07a: `encode` now returns an Effect instead of returning a `Uint8Array` immediately. Provide the character tables for the printer, then run the Effect.
  
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
- 9a22ac1: The encoder no longer includes every character table through `iconv-lite`. Applications must now provide the tables that their printer can use.
  
  ```ts
  import { encode } from '@piqy/epos-encoder'
  import { StandardCodepagesLayer } from '@piqy/epos-codepages/presets/standard'
  import { Effect } from 'effect'
  
  const program = encode(receipt).pipe(Effect.provide(StandardCodepagesLayer))
  ```
  
  The default starting page is now page 0 (PC437). Encoding fails when a required page or character is not available. It no longer replaces unsupported text without an error.

### Patch Changes

- 6bc4553: Make long text and large receipts faster while using less memory.
  
  This also fixes three encoding problems:
  
  - Multi-character mappings, such as Persian ligatures, are handled as one unit.
  - Character error positions now point to the correct place in the original text.
  - A selected page must be provided even when an international character replacement could encode the text.
- Updated dependencies [084e8ee]
- Updated dependencies [1175ee7]
- Updated dependencies [0788e8d]
- Updated dependencies [5913ca9]
- Updated dependencies [6bc4553]
- Updated dependencies [7b6b709]
  - @piqy/epos-ast@0.2.0
  - @piqy/epos-codepages@0.2.0

## 0.2.0

### Minor Changes

- b08da53: Require Effect v4 for the optional streaming entry point.

## 0.1.1

### Patch Changes

- eb2d73f: Use the stable iconv-lite release instead of the 1.0 alpha.

## 0.1.0

### Minor Changes

- e8b9bd0: Publish the initial ESC/POS encoder with an optional Effect streaming entry point.
