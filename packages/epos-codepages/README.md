# @piqy/epos-codepages

Tree-shakable ESC/POS character code tables for Effect.

The package root contains codec mechanics and the `CodepageRegistry` service. It imports no character tables. Each page is an explicit subpath, so a receipt that uses Latin pages does not include Kana, Kanji, Thai, Vietnamese, or Indic data.

## Explicit pages

```ts
import { Effect } from 'effect'
import { CodepageRegistry, codepageLayer } from '@piqy/epos-codepages'
import { page019 } from '@piqy/epos-codepages/pages/page-019'

const program = Effect.gen(function* () {
	const registry = yield* CodepageRegistry
	return yield* registry.encode(19, 'Price: 10 €')
}).pipe(Effect.provide(codepageLayer([page019])))
```

Encoding fails with `CodepageNotLoadedError` when a page is absent and with `UnencodableCharacterError` when the selected page cannot represent the text. It never silently selects another page or inserts a replacement character.

## Presets

- `presets/standard` contains standard DOS, ISO, and Windows mappings.
- `presets/vietnamese` contains split TCVN-3 pages 30 and 31 plus Windows-1258.
- `presets/indic` contains ICU-verified ISCII pages. Assamese page 70 is not included because it differs from Bengali ISCII.
- `presets/available` combines all currently verified pages.

The Epson-only Kana, one-pass Kanji, Thai, Farsi, and Assamese variants remain intentionally absent until an independent, redistributable source is available. This package does not copy Epson images or third-party ESC/POS tables.

Pages 254 and 255 have no fixed global mapping. Supply a custom `Codepage` for printer-defined characters.

See `THIRD_PARTY_NOTICES.md` for mapping-data licenses. Epson table images are used only for verification and are not distributed.
