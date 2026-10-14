---
'@piqy/epos-codepages': minor
---

Add the `pageIndependentTokenLengthAt` planning option for tokens that every page can print, for example international character set substitutions. Planning uses it when the current page cannot encode a character and then keeps the current page. Export `codepageTokenLengthAt` to check the token that one page can encode at an index.
