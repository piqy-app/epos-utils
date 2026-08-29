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

`@piqy/epos-codepages/presets/standard` provides the licensed DOS, ISO, and Windows tables that are currently generated from Unicode and ICU data.

Pages 254 and 255 have no fixed global mapping. Supply a custom `Codepage` for printer-defined characters.

See `THIRD_PARTY_NOTICES.md` for mapping-data licenses. Epson table images are used only for verification and are not distributed.
