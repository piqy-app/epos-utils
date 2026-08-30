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
- a character is not available in the selected tables, or
- a receipt node contains invalid data.

The encoder does not replace unsupported text without an error.
