# epos-utils

TypeScript libraries for working with ESC/POS printers.

## Packages

- [`@piqy/epos-ast`](packages/epos-ast): types and utilities for representing
  ESC/POS commands as a unist syntax tree.
- [`@piqy/epos-codepages`](packages/epos-codepages): strict, tree-shakable character tables and an Effect registry.
- [`@piqy/epos-encoder`](packages/epos-encoder): encode EPOS syntax trees as Effect programs that produce ESC/POS printer commands.

## Development

This repository requires Node.js 22 or newer and pnpm. Corepack can install the
pinned pnpm version:

```sh
corepack enable
pnpm install
pnpm check
pnpm test
pnpm build
pnpm check:tree-shaking
```
