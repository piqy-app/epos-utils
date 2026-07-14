# @piqy/epos-encoder

Encode [`@piqy/epos-ast`](https://www.npmjs.com/package/@piqy/epos-ast)
trees as ESC/POS printer commands.

## Install

```sh
pnpm add @piqy/epos-encoder @piqy/epos-ast
```

## Usage

```ts
import { encode } from '@piqy/epos-encoder'

const bytes = encode({
	type: 'root',
	children: [{ type: 'text', value: 'Hello' }, { type: 'break' }, { type: 'cut', mode: 'full' }],
})
```

### Effect

The optional Effect integration is provided as a separate entry point:

```sh
pnpm add effect
```

```ts
import { encodeStream } from '@piqy/epos-encoder/effect'
import { Stream } from 'effect'

const bytes = encodeStream(Stream.make({ type: 'text', value: 'Hello' }))
```
