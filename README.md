# epos-utils

TypeScript libraries for working with ESC/POS printers.

## Packages

- [`@piqy/epos-ast`](packages/epos-ast): types and utilities for representing
  ESC/POS commands as a unist syntax tree.
- [`@piqy/epos-encoder`](packages/epos-encoder): encode EPOS syntax trees as
  ESC/POS printer commands.

## Development

This repository requires Node.js 22 or newer and pnpm. Corepack can install the
pinned pnpm version:

```sh
corepack enable
pnpm install
pnpm check
pnpm build
```
