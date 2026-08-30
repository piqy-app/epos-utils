---
'@piqy/epos-codepages': patch
'@piqy/epos-encoder': patch
---

Use lazy, compact code-page indexes, preallocate encoded output, and slice planned segments instead of growing them one character at a time. Batch country-table text runs and concatenate large outputs without argument spreading. Always check that an explicit page is loaded before applying country substitutions.
