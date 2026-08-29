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

- `presets/standard` contains the named DOS, ISO, Windows, Farsi, and related standard mappings.
- `presets/katakana` contains only page 1.
- `presets/hiragana` contains only page 6.
- `presets/kanji` contains only one-pass Kanji pages 7 and 8.
- `presets/thai` contains pages 20 through 26 and shares one generated TIS-620-compatible repertoire.
- `presets/vietnamese` contains split TCVN-3 pages 30 and 31 plus Windows-1258.
- `presets/indic` contains all documented ISCII pages, including the Assamese differences.
- `presets/available` combines all 60 fixed pages. It intentionally includes Kanji data.

Import an individual page or a focused preset when size is important. Importing the package root, a Western page, or `presets/standard` does not load Kana, Kanji, Thai, or Indic tables.

The Thai pages contain line graphics, normal Thai characters, and printer-positioned Thai glyph variants. Stable graphics and normal Unicode Thai text are supported. Position-only glyph variants with no stable Unicode scalar value decode as unavailable instead of using invented private-use values.

Pages 254 and 255 have no fixed global mapping. Supply a custom `Codepage` for printer-defined characters.

See `THIRD_PARTY_NOTICES.md` for mapping-data licenses. Epson-specific tables were implemented from the published character tables. Epson image assets are not distributed.
