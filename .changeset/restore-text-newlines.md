---
'@piqy/epos-codepages': patch
'@piqy/epos-encoder': patch
---

Restore support for embedded `\n` in text nodes. Line feeds encode as `0x0A` with explicit and automatic codepage selection.
