# @piqy/epos-codepages

## 0.2.0

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
- 0788e8d: Add `@piqy/epos-codepages` for encoding and decoding ESC/POS text. Character tables are separate imports, so an application includes only the tables that it selects.
  
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
- 5913ca9: Add all fixed Epson ESC/POS character tables. This includes PC720, PC853, PC1098, Lithuanian, TCVN-3, ISCII, Thai, Kana, and Kanji tables.
  
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

### Patch Changes

- 6bc4553: Make long text and large receipts faster while using less memory.
  
  This also fixes three encoding problems:
  
  - Multi-character mappings, such as Persian ligatures, are handled as one unit.
  - Character error positions now point to the correct place in the original text.
  - A selected page must be provided even when an international character replacement could encode the text.
