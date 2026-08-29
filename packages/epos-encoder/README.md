# @piqy/epos-encoder

Encode [`@piqy/epos-ast`](https://www.npmjs.com/package/@piqy/epos-ast)
trees as ESC/POS printer commands with Effect.

## Install

```sh
pnpm add @piqy/epos-encoder @piqy/epos-ast effect
```

## Usage

```ts
import { encode } from '@piqy/epos-encoder'
import { Effect } from 'effect'

const program = encode({
	type: 'root',
	children: [{ type: 'text', value: 'Hello' }, { type: 'break' }, { type: 'cut', mode: 'full' }],
})

const bytes = await Effect.runPromise(program)
```

## Streams

`encodeStream` creates an isolated printer-state context for each stream execution.
It keeps that state between nodes in one execution.

```ts
import { encodeStream } from '@piqy/epos-encoder'
import { Effect, Stream } from 'effect'

const stream = encodeStream(Stream.make({ type: 'text', value: 'Hello' }))
const chunks = await Effect.runPromise(Stream.runCollect(stream))
```

Encoding and extension failures use the Effect error channel. Encoder domain errors are
Effect Schema tagged errors.
