---
'@piqy/epos-codepages': minor
---

Add `@piqy/epos-codepages/international` to decode ESC/POS international character sets (`ESC R n`). Use it to convert printer bytes below 0x80 back to text for a `Country` from `@piqy/epos-ast`.

```ts
import { countryFromCode, decodeCountryByte, decodeCountryText } from '@piqy/epos-codepages/international'

const country = countryFromCode(2) ?? 'usa' // 'germany'

decodeCountryByte(0x5b, country) // 'Ä'
decodeCountryByte(0x84, country) // undefined, because the code page defines this byte
decodeCountryText(Uint8Array.of(0x47, 0x72, 0x7d, 0x7e, 0x65), country) // 'Grüße'
```

- `countryFromCode` returns `undefined` for a code without a character set. The application selects the fallback.
- `decodeCountryByte` returns the exact token for bytes that print more than one character, for example `கா` for byte `0x36` with `india-tamil`.
- `decodeCountryText` replaces each byte from 0x80 with U+FFFD. Decode these bytes with the selected code page.
- `countryCodes` and `countryCharacterTables` contain the `ESC R n` codes and the character tables.

The package now depends on `@piqy/epos-ast` for the `Country` type.
