# @piqy/epos-encoder

Convert an [`@piqy/epos-ast`](https://www.npmjs.com/package/@piqy/epos-ast) receipt tree to ESC/POS printer bytes.

## Install

```sh
pnpm add @piqy/epos-encoder @piqy/epos-ast @piqy/epos-codepages effect
```

## Encode a receipt

`encode` returns an Effect. Provide the character tables that the printer supports, then run the Effect.

```ts
import type { Root } from '@piqy/epos-ast'
import { encode } from '@piqy/epos-encoder'
import { StandardCodepagesLayer } from '@piqy/epos-codepages/presets/standard'
import { Effect } from 'effect'

const receipt = {
	type: 'root',
	children: [{ type: 'text', value: 'Hello' }, { type: 'break' }, { type: 'cut', mode: 'full' }],
} satisfies Root

const bytes = await Effect.runPromise(encode(receipt).pipe(Effect.provide(StandardCodepagesLayer)))
```

## Choose character tables

Use exact pages when application size matters:

```ts
import { codepageLayer } from '@piqy/epos-codepages'
import { page000 } from '@piqy/epos-codepages/pages/page-000'
import { page019 } from '@piqy/epos-codepages/pages/page-019'

const ReceiptCodepages = codepageLayer([page000, page019])
const program = encode(receipt).pipe(Effect.provide(ReceiptCodepages))
```

Text without a `codepage` automatically uses any provided table that supports it. Selection starts on page 0 and changes pages only when necessary.

A page on a text node always has priority:

```ts
{ type: 'text', value: 'Price: 10 €', codepage: 19 }
```

Turn automatic selection off with:

```ts
encode(receipt, { automaticCodepage: false, codepage: 0 })
```

## Stream a receipt

`encodeStream` emits the printer initialization bytes first. It then emits one byte chunk for each input node. Each run has separate printer state.

```ts
import { encodeStream } from '@piqy/epos-encoder'
import { Effect, Stream } from 'effect'

const chunks = await Effect.runPromise(
	encodeStream(Stream.fromIterable(receipt.children)).pipe(Stream.provide(StandardCodepagesLayer), Stream.runCollect),
)
```

Both `encode` and `encodeStream` are available from `@piqy/epos-encoder`.

## Errors

The returned Effect or Stream fails when:

- a required character table was not provided,
- a character is not available in the selected tables and `unsupportedCharacter` is `'error'` (the default),
- the `unsupportedCharacter` replacement is not available in the selected tables, or
- a receipt node contains invalid data.

With the default `unsupportedCharacter: 'error'`, the encoder does not replace unsupported text. Error indexes refer to the original text node.

## Unsupported characters

Code pages do not contain emoji and many symbols. To print a replacement in place of these characters, set `unsupportedCharacter`:

```ts
encode(receipt, { unsupportedCharacter: { replace: '?' } })
```

The encoder replaces each complete emoji sequence with one replacement. For example, `👍🏽`, `👨‍👩‍👧`, `🇩🇪`, and `1️⃣` each become one `?`. This works the same on all runtimes, including React Native with Hermes. Use `{ replace: '' }` to remove the characters. If the replacement itself cannot be encoded, the encoding fails.

Characters of the active international character set (`country`) count as supported, also with automatic page selection. For example, `₩` with `country: 'korea'` prints without a page change.

In all modes, the encoder removes an emoji variation selector (`U+FE0F` or `U+FE0E`) after a supported character. For example, `©️` prints as `©`.
