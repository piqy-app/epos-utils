---
'@piqy/epos-encoder': minor
---

Remove `iconv-lite` and require an explicit `CodepageRegistry` Effect Layer. Use strict loaded-page encoding, start from ESC/POS page 0, and account for active international character substitutions.
