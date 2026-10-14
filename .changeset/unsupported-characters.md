---
'@piqy/epos-encoder': minor
---

Add the `unsupportedCharacter` option. Use `{ replace: '?' }` to print a replacement for each complete emoji sequence or other unsupported character, so that one emoji no longer stops the encoding. The default `'error'` keeps the strict behavior. The encoder now removes an emoji variation selector after a supported character, so `©️` prints as `©`. Automatic page selection now accepts characters of the active international character set, for example `₩` with `country: 'korea'`.
