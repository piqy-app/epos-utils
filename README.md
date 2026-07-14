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

## Releasing

Add a Changeset for every user-facing change:

```sh
pnpm changeset
```

After the change reaches `main`, the release workflow creates or updates a
version PR. Merging the version PR publishes the package to npm.

Publishing uses npm trusted publishing. npm only permits trusted publishers to
be configured for an existing package, so bootstrap the first release with a
granular npm access token stored as the `NPM_TOKEN` secret in the `npm` GitHub
environment. After the first publish:

1. Open the package settings on npm.
2. Add `piqy-app/epos-utils` as a trusted publisher.
3. Set the workflow to `release.yml` and environment to `npm`.
4. Delete the `NPM_TOKEN` secret; later releases authenticate through OIDC.
