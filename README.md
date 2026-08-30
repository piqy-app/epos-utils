# epos-utils

TypeScript packages for building and encoding ESC/POS receipt data.

## Packages

- [`@piqy/epos-ast`](packages/epos-ast) defines the receipt tree types and optional runtime validation.
- [`@piqy/epos-codepages`](packages/epos-codepages) provides ESC/POS character tables. Applications include only the tables that they import.
- [`@piqy/epos-encoder`](packages/epos-encoder) converts a receipt tree to ESC/POS printer bytes with Effect.

## Development

This repository requires Node.js 22 or newer and pnpm.

```sh
corepack enable
pnpm install
pnpm build
pnpm check
pnpm test
pnpm check:tree-shaking
```
