---
'@piqy/epos-codepages': patch
'@piqy/epos-encoder': patch
---

Make long text and large receipts faster while using less memory.

This also fixes three encoding problems:

- Multi-character mappings, such as Persian ligatures, are handled as one unit.
- Character error positions now point to the correct place in the original text.
- A selected page must be provided even when an international character replacement could encode the text.
