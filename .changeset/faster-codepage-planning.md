---
'@piqy/epos-codepages': patch
'@piqy/epos-encoder': patch
---

Avoid output allocation while checking code-page support and encode normal text segments in one operation. Always check that an explicit page is loaded before applying country substitutions.
