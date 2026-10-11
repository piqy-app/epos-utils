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

## International character sets

`ESC R n` selects an international character set. The character set changes some bytes below 0x80. For example, byte `0x5B` prints `Ä` when `germany` is selected. Bytes from 0x80 come from the selected code page.

`@piqy/epos-codepages/international` contains these tables. `@piqy/epos-encoder` uses the same tables for text with a `country`.

```ts
import { countryFromCode, decodeCountryByte, decodeCountryText } from '@piqy/epos-codepages/international'
import { page000 } from '@piqy/epos-codepages/pages/page-000'

const country = countryFromCode(2) ?? 'usa' // 'germany'

decodeCountryByte(0x5b, country) // 'Ä'
decodeCountryByte(0x41, country) // 'A'
decodeCountryByte(0x84, country) // undefined, because the code page defines this byte
decodeCountryText(Uint8Array.of(0x47, 0x72, 0x7d, 0x7e, 0x65), country) // 'Grüße'

const decodeByte = (byte: number) => decodeCountryByte(byte, country) ?? page000.decode(Uint8Array.of(byte))
```

- `countryFromCode(code)` returns the `Country` for code `n` of `ESC R n`. It returns `undefined` for a code without a character set, so that the application selects the fallback.
- `decodeCountryByte(byte, country)` returns the character for a byte from 0x00 through 0x7F. A byte that the character set does not change returns its ASCII character, also a control character. It returns `undefined` for bytes from 0x80 and for numbers that are not bytes.
- `decodeCountryText(bytes, country)` decodes a byte array in the same way. It replaces each byte from 0x80 with U+FFFD.
- `countryCodes` contains the `ESC R n` code for each `Country`.
- `countryCharacterTables` contains the bytes that each character set controls, also bytes that keep their ASCII character.

Some bytes print more than one character. With `india-tamil`, byte `0x36` decodes to `கா`. The `Country` type comes from `@piqy/epos-ast`.

## Printer-defined pages

Pages 254 and 255 do not have a fixed character mapping. Create a custom `Codepage` when a printer defines either page.

Thai printer-only forms without a standard Unicode character are left unavailable. The package does not create private Unicode values for them.

See `THIRD_PARTY_NOTICES.md` for the sources and licenses of the character mappings.
