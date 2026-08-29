---
'@piqy/epos-encoder': minor
---

Remove `iconv-lite` and require an explicit `CodepageRegistry` Effect Layer. Use strict loaded-page encoding, set PC858 as the documented default, and account for active international character substitutions.
