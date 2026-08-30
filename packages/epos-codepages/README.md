# @piqy/epos-codepages

ESC/POS character tables for encoding and decoding printer text.

Each table has its own import path. An application includes only the tables that it imports.

## Encode text with one page

```ts
import { CodepageRegistry, codepageLayer } from '@piqy/epos-codepages'
import { page019 } from '@piqy/epos-codepages/pages/page-019'
import { Effect } from 'effect'

const program = Effect.gen(function* () {
	const codepages = yield* CodepageRegistry
	return yield* codepages.encode(19, 'Price: 10 €')
}).pipe(Effect.provide(codepageLayer([page019])))

const bytes = await Effect.runPromise(program)
```

Encoding fails with `CodepageNotLoadedError` when page 19 was not provided. It fails with `UnencodableCharacterError` when page 19 cannot encode the text. Unsupported characters are never replaced without an error.

## Choose a prepared group

Use a preset when the application needs more than one table:

- `presets/standard` provides common DOS, ISO, Windows, and Persian tables.
- `presets/katakana` provides page 1.
- `presets/hiragana` provides page 6.
- `presets/kanji` provides pages 7 and 8.
- `presets/thai` provides pages 20 through 26.
- `presets/vietnamese` provides pages 30, 31, and 52.
- `presets/indic` provides the documented ISCII pages.
- `presets/available` provides all fixed tables, including Kanji.

```ts
import { StandardCodepagesLayer } from '@piqy/epos-codepages/presets/standard'
```

Import one page or the smallest suitable preset when application size matters.

## Printer-defined pages

Pages 254 and 255 do not have a fixed character mapping. Create a custom `Codepage` when a printer defines either page.

Thai printer-only forms without a standard Unicode character are left unavailable. The package does not create private Unicode values for them.

See `THIRD_PARTY_NOTICES.md` for the sources and licenses of the character mappings.
