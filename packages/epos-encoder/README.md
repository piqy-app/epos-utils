# @piqy/epos-encoder

Encode [`@piqy/epos-ast`](https://www.npmjs.com/package/@piqy/epos-ast) trees as ESC/POS printer commands with Effect.

## Install

```sh
pnpm add @piqy/epos-encoder @piqy/epos-ast @piqy/epos-codepages effect
```

## Usage

The encoder requires a `CodepageRegistry` Layer. The Layer controls which character tables are included in the application bundle.

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

Text nodes without a `codepage` use automatic selection by default. Selection starts with page 0. It keeps the current page when possible and then prefers pages already used by the print job. A `codepage` on a text node always takes priority. Set `automaticCodepage: false` to turn off automatic selection.

Set `codepage` in the encoder options to start with another page. The encoder sends that selection after it initializes the printer.

## Streams

`encodeStream` creates an isolated printer-state context for each stream execution. It keeps that state between nodes in one execution.

```ts
import { encodeStream } from '@piqy/epos-encoder'
import { Effect, Stream } from 'effect'

const stream = encodeStream(Stream.make({ type: 'text', value: 'Hello' })).pipe(Stream.provide(StandardCodepagesLayer))
const chunks = await Effect.runPromise(Stream.runCollect(stream))
```

Encoding failures use the Effect error channel. Encoder and code-page errors are Effect Schema tagged errors. A missing page or unsupported character causes a failure. The encoder does not insert replacement characters.
