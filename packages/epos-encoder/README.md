# @piqy/epos-encoder

Encode [`@piqy/epos-ast`](https://www.npmjs.com/package/@piqy/epos-ast) trees as ESC/POS printer commands with Effect.

## Install

```sh
pnpm add @piqy/epos-encoder @piqy/epos-ast @piqy/epos-codepages effect
```

## Usage

The encoder requires a `CodepageRegistry` Layer. This makes the included character tables explicit and tree-shakable.

```ts
import { encode } from '@piqy/epos-encoder'
import { StandardCodepagesLayer } from '@piqy/epos-codepages/presets/standard'
import { Effect } from 'effect'

const program = encode({
	type: 'root',
	children: [{ type: 'text', value: 'Hello' }, { type: 'break' }, { type: 'cut', mode: 'full' }],
}).pipe(Effect.provide(StandardCodepagesLayer))

const bytes = await Effect.runPromise(program)
```

For a smaller bundle, make a Layer from only the selected pages:

```ts
import { codepageLayer } from '@piqy/epos-codepages'
import { page000 } from '@piqy/epos-codepages/pages/page-000'

const ReceiptCodepages = codepageLayer([page000])
```

Text nodes without an explicit `codepage` use automatic selection by default. The planner starts with page 0, keeps the current page when possible, and then prefers pages already used by the print job. A `codepage` on a text node always remains explicit. Set `automaticCodepage: false` to disable planning.

## Streams

`encodeStream` creates an isolated printer-state context for each stream execution. It keeps that state between nodes in one execution.

```ts
import { encodeStream } from '@piqy/epos-encoder'
import { Effect, Stream } from 'effect'

const stream = encodeStream(Stream.make({ type: 'text', value: 'Hello' })).pipe(Stream.provide(StandardCodepagesLayer))
const chunks = await Effect.runPromise(Stream.runCollect(stream))
```

Encoding and extension failures use the Effect error channel. Encoder and code-page domain errors are Effect Schema tagged errors. Missing pages and unencodable text fail explicitly; there is no replacement-character fallback.
