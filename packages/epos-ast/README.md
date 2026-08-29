# ESC/POS Abstract Syntax Tree

---

epos-ast is a specification for representing [ESC/POS](escpos) commands in a [syntax tree](syntax-tree). It implements [unist](https://github.com/syntax-tree/unist).
ESC/POS is a command system developed by Epson for controlling point-of-sale receipt printers. Since 1980s, numerous manufacturers have reverse-engineered and adopted the specification.

This specification is written in a [Web IDL](webidl)-like grammar.

This package provides a pure TypeScript implementation of the specification.

epos-ast can be used to:

- Parse binary ESC/POS data into a structured, inspectable format
- Transform receipt data (modify, filter, translate)
- Convert to other formats (HTML, Markdown, PDF)
- Generate ESC/POS binary data from structured input
- Analyze receipt content programmatically

## Contents

- [Nodes (abstract)](#nodes-abstract)
  - [Literal](#literal)
  - [Parent](#parent)
- [Nodes](#nodes)
  - [Root](#root)
  - [Text](#text)
  - [Break](#break)
  - [Tab](#tab)
  - [Strong](#strong)
  - [Underline](#underline)
  - [Inverted](#inverted)
  - [Scaled](#scaled)
  - [Rotated](#rotated)
  - [UpsideDown](#upsidedown)
  - [Smoothing](#smoothing)
  - [DoubleStrike](#doublestrike)
  - [Font](#font)
  - [Align](#align)
  - [LineSpacing](#linespacing)
  - [CharacterSpacing](#characterspacing)
  - [Position](#position)
  - [Feed](#feed)
  - [Cut](#cut)
  - [Pulse](#pulse)
  - [Image](#image)
  - [Barcode](#barcode)
  - [QRCode](#qrcode)
  - [PDF417](#pdf417)
  - [DataMatrix](#datamatrix)
  - [MaxiCode](#maxicode)
  - [AztecCode](#azteccode)
  - [GS1DataBar](#gs1databar)
  - [Composite](#composite)
  - [TabStops](#tabstops)
  - [Color](#color)
  - [Margin](#margin)
  - [PrintArea](#printarea)
  - [Raw](#raw)
- [Enumeration](#enumeration)
  - [AlignType](#aligntype)
  - [CutType](#cuttype)
  - [Country](#country)
  - [BarcodeFormat](#barcodeformat)
  - [HriPosition](#hriposition)
  - [ErrorCorrection](#errorcorrection)
  - [PositionMode](#positionmode)
  - [FontType](#fonttype)
  - [PrintColor](#printcolor)
  - [RotationSpacing](#rotationspacing)
  - [QRModel](#qrmodel)
  - [MaxiCodeMode](#maxicodemode)
  - [AztecMode](#aztecmode)
  - [DataMatrixType](#datamatrixtype)
  - [GS1DataBarSymbology](#gs1databarsymbology)
  - [CompositeLineBarcode](#compositelinebarcode)
  - [CompositeGS1DataBarVariant](#compositegs1databarvariant)
  - [Composite2DSymbology](#composite2dsymbology)
  - [DrawerPin](#drawerpin)
  - [HriFont](#hrifont)
- [Content model](#content-model)
  - [PhrasingContent](#phrasingcontent)
  - [FlowBlockContent](#flowblockcontent)
  - [FlowContent](#flowcontent)
- [Serialization](#serialization)
  - [Parsing](#parsing)
  - [Stringifying](#stringifying)
  - [Round-trip guarantees](#round-trip-guarantees)
- [Codepage reference](#codepage-reference)
- [Unsupported](#unsupported)
- [Unit system](#unit-system)
- [Glossary](#glossary)
- [References](#references)

## Nodes (abstract)

### Literal

```idl
interface Literal <: UnistLiteral {
  value: string
}
```

**Literal** ([**UnistLiteral**][dfn-unist-literal]) represents an abstract
interface in epos-ast containing a value.

Its `value` field is a `string`.

### Parent

```idl
interface Parent <: UnistParent {
  children: [FlowContent]
}
```

**Parent** ([**UnistParent**][dfn-unist-parent]) represents an abstract
interface in epos-ast containing other nodes (said to be [_children_][term-child]).

Its content is limited to only other [epos-ast content](#content-model).

## Nodes

### Root

```idl
interface Root <: Parent {
  type: 'root'
  children: [FlowContent]
}
```

**Root** ([**Parent**](#parent)) represents a complete print job or receipt.

Root can be used as the [_root_][term-root] of a tree, never as a [_child_][term-child]. Its content model is [**flow**](#flowcontent) content.

A Root represents one TCP connection or one serial transmission (delimited by full cuts).

For example, a simple receipt:

```js
{
  type: 'root',
  children: [
    {
      type: 'align',
      align: 'center',
      children: [
        { type: 'text', value: 'RECEIPT' },
        { type: 'break' }
      ]
    },
    { type: 'cut', mode: 'full' }
  ]
}
```

### Text

```idl
interface Text <: Literal {
  type: 'text'
  codepage: number?
  country: Country?
}
```

**Text** ([**Literal**](#literal)) represents printable text content.

Text can be used where [**phrasing**](#phrasingcontent) content is expected. Its content is represented by its `value` field.

A `codepage` field can be present. It specifies the ESC/POS codepage number for encoding during serialization. When not present, defaults to `19` (CP858). See [Codepage reference](#codepage-reference) for supported values.

A `country` field can be present. It specifies country-specific character variations for serialization.

The stringifier emits [ESC t](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_lt.html) and [ESC R](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_cr.html) commands when the codepage or country changes between text nodes.

For example:

```js
{ type: 'text', value: 'Hello, World!' }
{ type: 'text', value: 'café', codepage: 19, country: 'france' }
```

### Break

```idl
interface Break <: Node {
  type: 'break'
}
```

**Break** ([**Node**][dfn-unist-node]) represents a [line feed](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/lf.html) (LF).

Break can be used where [**phrasing**](#phrasingcontent) content is expected. It has no content model.

Yields: `0A`

### Tab

```idl
interface Tab <: Node {
  type: 'tab'
}
```

**Tab** ([**Node**][dfn-unist-node]) represents a [horizontal tab](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/ht.html) (HT).

Tab can be used where [**phrasing**](#phrasingcontent) content is expected. It has no content model.

Tab positions are defined by [**TabStops**](#tabstops).

Yields: `09`

### Strong

```idl
interface Strong <: Parent {
  type: 'strong'
  children: [PhrasingContent]
}
```

**Strong** ([**Parent**](#parent)) represents bold/emphasized text using [ESC E](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_ce.html).

Strong can be used where [**phrasing**](#phrasingcontent) content is expected. Its content model is [**phrasing**](#phrasingcontent) content.

Yields: `1B 45 01` + children + `1B 45 00`

### Underline

```idl
interface Underline <: Parent {
  type: 'underline'
  double?: boolean
  children: [PhrasingContent]
}
```

**Underline** ([**Parent**](#parent)) represents underlined text using [ESC -](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_minus.html).

Underline can be used where [**phrasing**](#phrasingcontent) content is expected. Its content model is [**phrasing**](#phrasingcontent) content.

A `double` field can be present. When `true`, uses double (2-dot) underline. When not present or `false`, uses single (1-dot) underline.

Yields: `1B 2D n` + children + `1B 2D 00` where n = 2 if double, 1 otherwise

### Inverted

```idl
interface Inverted <: Parent {
  type: 'inverted'
  children: [PhrasingContent]
}
```

**Inverted** ([**Parent**](#parent)) represents reverse-printed text (white text on black background) using [GS B](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_cb.html).

Inverted can be used where [**phrasing**](#phrasingcontent) content is expected. Its content model is [**phrasing**](#phrasingcontent) content.

Yields: `1D 42 01` + children + `1D 42 00`

### Scaled

```idl
interface Scaled <: Parent {
  type: 'scaled'
  width: 1 <= number <= 8
  height: 1 <= number <= 8
  children: [PhrasingContent]
}
```

**Scaled** ([**Parent**](#parent)) represents enlarged text with width and/or height multipliers using [GS !](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_exclamation.html).

Scaled can be used where [**phrasing**](#phrasingcontent) content is expected. Its content model is [**phrasing**](#phrasingcontent) content.

A `width` field must be present. It represents the horizontal size multiplier (1-8).

A `height` field must be present. It represents the vertical size multiplier (1-8).

Yields: `1D 21 n` + children + `1D 21 00` where n = ((width-1) << 4) | (height-1)

### Rotated

```idl
interface Rotated <: Parent {
  type: 'rotated'
  spacing: RotationSpacing?
  children: [PhrasingContent]
}
```

**Rotated** ([**Parent**](#parent)) represents 90° clockwise rotated text using [ESC V](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_cv.html).

Rotated can be used where [**phrasing**](#phrasingcontent) content is expected. Its content model is [**phrasing**](#phrasingcontent) content.

A `spacing` field may be present. It represents character spacing during rotation mode. Defaults to `1` (1-dot spacing).

Yields: `1B 56 n` + children + `1B 56 00` where n = 1 for 1-dot spacing, n = 2 for 1.5-dot spacing

### UpsideDown

```idl
interface UpsideDown <: Parent {
  type: 'upsideDown'
  children: [PhrasingContent]
}
```

**UpsideDown** ([**Parent**](#parent)) represents 180°-rotated text printed right-to-left using [ESC {](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_lbrace.html).

UpsideDown can be used where [**phrasing**](#phrasingcontent) content is expected. Its content model is [**phrasing**](#phrasingcontent) content.

Note: Only effective in Standard mode at the beginning of a line. Does not affect graphics or raster images.

Yields: `1B 7B 01` + children + `1B 7B 00`

### Smoothing

```idl
interface Smoothing <: Parent {
  type: 'smoothing'
  children: [PhrasingContent]
}
```

**Smoothing** ([**Parent**](#parent)) represents smoothed character rendering using [GS b](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lb.html).

Smoothing can be used where [**phrasing**](#phrasingcontent) content is expected. Its content model is [**phrasing**](#phrasingcontent) content.

Note: Only effective for quadruple-size (4x) or larger characters.

Yields: `1D 62 01` + children + `1D 62 00`

### DoubleStrike

```idl
interface DoubleStrike <: Parent {
  type: 'doubleStrike'
  children: [PhrasingContent]
}
```

**DoubleStrike** ([**Parent**](#parent)) represents double-strike printed text (prints each line twice for darker output) using [ESC G](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_cg.html).

DoubleStrike can be used where [**phrasing**](#phrasingcontent) content is expected. Its content model is [**phrasing**](#phrasingcontent) content.

Yields: `1B 47 01` + children + `1B 47 00`

### Font

```idl
interface Font <: Parent {
  type: 'font'
  font: FontType
  children: [PhrasingContent]
}
```

**Font** ([**Parent**](#parent)) represents a font selection using [ESC M](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_cm.html).

Font can be used where [**phrasing**](#phrasingcontent) content is expected. Its content model is [**phrasing**](#phrasingcontent) content.

A `font` field must be present. Font A is typically 12x24 dots, Font B is 9x17 dots. Availability of other fonts varies by printer model.

Settings are effective until ESC !, ESC @, reset, or power off.

Yields: `1B 4D n` + children where n = 0 (A), 1 (B), 2 (C), 3 (D), 4 (E), 97 (specialA), 98 (specialB). Stringifier restores previous font after children.

### Align

```idl
interface Align <: Parent {
  type: 'align'
  align: AlignType
  children: [FlowContent]
}
```

**Align** ([**Parent**](#parent)) represents text alignment using [ESC a](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_la.html).

Align can be used where [**flow**](#flowcontent) content is expected. Its content model is also [**flow**](#flowcontent) content.

An `align` field must be present. It represents horizontal text alignment.

Yields: `1B 61 n` + children where n = 0 (left), 1 (center), 2 (right). Stringifier restores previous alignment after children.

### LineSpacing

```idl
interface LineSpacing <: Parent {
  type: 'lineSpacing'
  spacing: number | 'default'
  children: [FlowContent]
}
```

**LineSpacing** ([**Parent**](#parent)) represents line spacing configuration using [ESC 3](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_3.html) or [ESC 2](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_2.html).

LineSpacing can be used where [**flow**](#flowcontent) content is expected. Its content model is also [**flow**](#flowcontent) content.

A `spacing` field must be present. When a number, it represents spacing in [canonical units](#unit-system). When `'default'`, it resets to the printer's default line spacing.

Yields: `1B 33 n` + children where n = spacing, or `1B 32` for default. Stringifier restores previous spacing after children.

### CharacterSpacing

```idl
interface CharacterSpacing <: Parent {
  type: 'characterSpacing'
  spacing: number
  children: [FlowContent]
}
```

**CharacterSpacing** ([**Parent**](#parent)) represents right-side character spacing using [ESC SP](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_space.html).

CharacterSpacing can be used where [**flow**](#flowcontent) content is expected. Its content model is also [**flow**](#flowcontent) content.

A `spacing` field must be present. It represents additional spacing added to the right side of each character, in [canonical units](#unit-system).

Yields: `1B 20 n` + children where n = spacing. Stringifier restores previous spacing after children.

### Position

```idl
interface Position <: Node {
  type: 'position'
  horizontal: number
  mode: PositionMode
}
```

**Position** ([**Node**][dfn-unist-node]) represents absolute or relative horizontal print position movement using [ESC $](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_dollarssign.html) (absolute) or [ESC \](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_backslash.html) (relative).

Position can be used where [**phrasing**](#phrasingcontent) content is expected. It has no content model.

A `horizontal` field must be present. It represents horizontal position in [canonical units](#unit-system).

A `mode` field must be present. It represents whether positioning is absolute (from origin) or relative (from current position).

Yields: `1B 24 nL nH` (absolute) or `1B 5C nL nH` (relative) where nL/nH = position as low/high byte

### Feed

```idl
interface Feed <: Node {
  type: 'feed'
  lines: number?
  units: number?
  reverse: boolean?
}
```

**Feed** ([**Node**][dfn-unist-node]) represents paper feed commands using [ESC d](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_ld.html) (lines), [ESC J](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_cj.html) (units), or [ESC e](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_le.html) (reverse).

Feed can be used where [**flow**](#flowcontent) content is expected. It has no content model.

Either a `lines` or `units` field should be present, but not both.

A `lines` field represents the number of lines to feed.

A `units` field represents feed distance in [canonical units](#unit-system).

A `reverse` field can be present. When `true`, paper feeds in reverse direction. Not all printers support reverse feed.

Yields: `1B 64 n` (lines), `1B 4A n` (units), or `1B 65 n` (reverse lines)

### Cut

```idl
interface Cut <: Node {
  type: 'cut'
  mode: CutType
  feed: number?
}
```

**Cut** ([**Node**][dfn-unist-node]) represents paper cutting commands using [GS V](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_cv.html), [ESC i](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_li.html), or [ESC m](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_lm.html).

Cut can be used where [**flow**](#flowcontent) content is expected. It has no content model.

A `mode` field must be present. It represents the type of cut to perform.

A `feed` field can be present. It represents lines to feed before cutting.

Yields: `1D 56 00` (full), `1B 69` (partial-1), `1B 6D` (partial-3), or `1D 56 42 n` (full with feed)

### Pulse

```idl
interface Pulse <: Node {
  type: 'pulse'
  pin: DrawerPin
  onTime: number
  offTime: number
}
```

**Pulse** ([**Node**][dfn-unist-node]) represents a pulse output signal using [ESC p](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_lp.html).

Pulse can be used where [**flow**](#flowcontent) content is expected. It has no content model.

Typically used to drive cash drawers, but can also control external buzzers or other devices connected to the drawer kick-out connector.

A `pin` field must be present. It represents which connector pin to pulse (`'pin2'` for connector pin 2, `'pin5'` for connector pin 5).

An `onTime` field must be present. It represents pulse ON time in units of 2ms.

An `offTime` field must be present. It represents pulse OFF time in units of 2ms.

Yields: `1B 70 m t1 t2` where m = 0 (pin2) or 1 (pin5), t1 = onTime, t2 = offTime

### Image

```idl
interface Image <: Node {
  type: 'image'
  width: number
  height: number
  data: string
}
```

**Image** ([**Node**][dfn-unist-node]) represents a printed image using [GS ( L / GS 8 L](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_cl.html) Function 112 (store) and Function 50 (print).

Image can be used where [**flow**](#flowcontent) content is expected. It has no content model.

A `width` field must be present. It represents image width in pixels.

A `height` field must be present. It represents image height in pixels.

A `data` field must be present. It contains base64-encoded bitmap data in normalized raster format: row-major, 1 bit per pixel, MSB is leftmost pixel. Each row is padded to byte boundary.

The parser normalizes all image formats (GS v 0, ESC \*, GS ( L) into this representation. The stringifier always outputs using GS ( L Function 112 + Function 50.

Note: ESC/POS supports grayscale (multiple tone) and multi-color (up to 4 colors for 2-color thermal paper) images via the `a` and `c` parameters of Function 112. This AST currently only supports monochrome images, which covers the vast majority of receipt printing use cases. Grayscale/color support may be added in a future version if needed.

Yields: `1D 28 4C pL pH 30 70 30 01 01 31 xL xH yL yH d...` (Function 112) + `1D 28 4C 02 00 30 32` (Function 50)

### Barcode

```idl
interface Barcode <: Node {
  type: 'barcode'
  format: BarcodeFormat
  data: string
  width: number?
  height: number?
  hri: HriPosition?
  hriFont: HriFont?
}
```

**Barcode** ([**Node**][dfn-unist-node]) represents a 1D barcode using [GS k](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lk.html), with optional configuration via [GS w](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lw.html) (width), [GS h](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lh.html) (height), [GS H](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_ch.html) (HRI position), and [GS f](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lf.html) (HRI font).

Barcode can be used where [**flow**](#flowcontent) content is expected. It has no content model.

A `format` field must be present. It represents the barcode symbology.

A `data` field must be present. It contains the data to encode. Valid characters depend on the barcode format.

A `width` field can be present. It represents the module (bar) width in dots (1-6).

A `height` field can be present. It represents the barcode height in dots.

An `hri` field can be present. It represents where to print Human Readable Interpretation text.

An `hriFont` field can be present. It represents which font to use for HRI text.

Yields: `1D 77 n` (width) + `1D 68 n` (height) + `1D 48 n` (HRI) + `1D 66 n` (font) + `1D 6B m d...` where m = format, d = data

### QRCode

```idl
interface QRCode <: Node {
  type: 'qrCode'
  data: string
  model: QRModel?
  size: number?
  errorCorrection: ErrorCorrection?
}
```

**QRCode** ([**Node**][dfn-unist-node]) represents a QR code using [GS ( k](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk.html) (cn=49) with functions 165 (model), 167 (size), 169 (error correction), 180 (store), and 181 (print).

QRCode can be used where [**flow**](#flowcontent) content is expected. It has no content model.

A `data` field must be present. It contains the data to encode.

A `model` field can be present. Model 1 is the original QR code; Model 2 is an enhanced version with higher capacity. When not present, defaults to `2`.

A `size` field can be present. It represents module size (1-16). When not present, defaults to `3`.

An `errorCorrection` field can be present. When not present, defaults to `'L'`.

Yields: `1D 28 6B 04 00 31 41 n 00` (model) + `1D 28 6B 03 00 31 43 n` (size) + `1D 28 6B 03 00 31 45 n` (error) + `1D 28 6B pL pH 31 50 30 d...` (store) + `1D 28 6B 03 00 31 51 30` (print)

### PDF417

```idl
interface PDF417 <: Node {
  type: 'pdf417'
  data: string
  columns: number?
  rows: number?
  width: number?
  height: number?
  errorCorrection: PDF417ErrorCorrection?
  truncated: boolean?
}
```

**PDF417** ([**Node**][dfn-unist-node]) represents a PDF417 2D barcode using [GS ( k](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk.html) (cn=48) with functions 065 (columns), 066 (rows), 067 (width), 068 (height), 069 (error), 070 (options), 080 (store), and 081 (print).

PDF417 can be used where [**flow**](#flowcontent) content is expected. It has no content model.

A `data` field must be present. It contains the data to encode.

A `columns` field can be present. It represents the number of data columns (0-30). 0 = auto.

A `rows` field can be present. It represents the number of rows (0, 3-90). 0 = auto.

A `width` field can be present. It represents module width (2-8).

A `height` field can be present. It represents row height (2-8).

An `errorCorrection` field can be present. It specifies error correction using a `PDF417ErrorCorrection` union:

- `{ mode: 'level', level: 0-8 }`: Specific error correction level (fn069 m=48, n=level+48)
- `{ mode: 'ratio', ratio: 1-400 }`: Error correction as ratio percentage (fn069 m=49, n=ratio)

A `truncated` field can be present. When `true`, generates truncated PDF417.

Yields: `1D 28 6B 03 00 30 41 n` (columns) + `1D 28 6B 03 00 30 42 n` (rows) + `1D 28 6B 03 00 30 43 n` (width) + `1D 28 6B 03 00 30 44 n` (height) + `1D 28 6B 04 00 30 45 m n` (error) + `1D 28 6B 03 00 30 46 n` (options) + `1D 28 6B pL pH 30 50 30 d...` (store) + `1D 28 6B 03 00 30 51 30` (print)

### DataMatrix

```idl
interface DataMatrix <: Node {
  type: 'dataMatrix'
  data: string
  symbolType: DataMatrixType?
  columns: number?
  rows: number?
  size: number?
}
```

**DataMatrix** ([**Node**][dfn-unist-node]) represents a DataMatrix 2D barcode using [GS ( k](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk.html) (cn=54) with functions 666 (type/columns/rows), 667 (module size), 680 (store), and 681 (print).

DataMatrix can be used where [**flow**](#flowcontent) content is expected. It has no content model.

A `data` field must be present. It contains the data to encode.

A `symbolType` field can be present. It represents the symbol type (square or rectangular). When not present, defaults to `'square'`.

A `columns` field can be present. It represents the number of columns. When not present, auto-selected based on data length.

A `rows` field can be present. It represents the number of rows. When not present, auto-selected based on data length.

A `size` field can be present. It represents module size (2-16).

Yields: `1D 28 6B 05 00 36 42 d1 d2 d3` (type/columns/rows) + `1D 28 6B 03 00 36 43 n` (module size) + `1D 28 6B pL pH 36 50 30 d...` (store) + `1D 28 6B 03 00 36 51 30` (print)

### MaxiCode

```idl
interface MaxiCode <: Node {
  type: 'maxiCode'
  data: string
  mode: MaxiCodeMode?
}
```

**MaxiCode** ([**Node**][dfn-unist-node]) represents a MaxiCode 2D barcode using [GS ( k](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk.html) (cn=50) with functions [265](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk_fn265.html) (mode), [280](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk_fn280.html) (store), and [281](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk_fn281.html) (print).

MaxiCode can be used where [**flow**](#flowcontent) content is expected. It has no content model.

A `data` field must be present. It contains the data to encode.

A `mode` field can be present. Mode 2 is for structured carrier message (US), Mode 3 for non-US, Mode 4 for standard symbol, Mode 5 for full ECC, Mode 6 for reader programming. When not present, defaults to `4`.

Yields: `1D 28 6B 03 00 32 41 n` (mode) + `1D 28 6B pL pH 32 50 30 d...` (store) + `1D 28 6B 03 00 32 51 30` (print)

### AztecCode

```idl
interface AztecCode <: Node {
  type: 'aztecCode'
  data: string
  mode: AztecMode?
  layers: number?
  size: number?
  errorCorrection: number?
}
```

**AztecCode** ([**Node**][dfn-unist-node]) represents an Aztec Code 2D barcode using [GS ( k](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk.html) (cn=53) with functions [566](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk_fn566.html) (mode/layers), [567](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk_fn567.html) (size), [569](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk_fn569.html) (error correction), [580](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk_fn580.html) (store), and [581](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk_fn581.html) (print).

AztecCode can be used where [**flow**](#flowcontent) content is expected. It has no content model.

A `data` field must be present. It contains the data to encode.

A `mode` field can be present. `'full'` is the full-range symbol, `'compact'` is the compact symbol. When not present, defaults to `'full'`.

A `layers` field can be present. It represents the number of data layers (1-32 for full, 1-4 for compact). When not present, auto-selected.

A `size` field can be present. It represents module size (2-16).

An `errorCorrection` field can be present. It represents error correction percentage (5-95). When not present, defaults to `23`.

Yields: `1D 28 6B 04 00 35 42 m n` (mode/layers) + `1D 28 6B 03 00 35 43 n` (size) + `1D 28 6B 04 00 35 45 n1 n2` (error) + `1D 28 6B pL pH 35 50 30 d...` (store) + `1D 28 6B 03 00 35 51 30` (print)

### GS1DataBar

```idl
interface GS1DataBar <: Node {
  type: 'gs1DataBar'
  symbology: GS1DataBarSymbology
  data: string
  width: number?
  maxWidth: number?
}
```

**GS1DataBar** ([**Node**][dfn-unist-node]) represents a GS1 DataBar (formerly RSS) 2D barcode using [GS ( k](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk.html) (cn=51) with functions [367](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk_fn367.html) (width), [371](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk_fn371.html) (max width for Expanded Stacked), [380](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk_fn380.html) (store), and [381](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk_fn381.html) (print).

GS1DataBar can be used where [**flow**](#flowcontent) content is expected. It has no content model.

A `symbology` field must be present. It represents the GS1 DataBar variant ([GS1DataBarSymbology](#gs1databarsymbology)), encoded as the `n` parameter in fn380.

A `data` field must be present. It contains the symbol data to encode (without the symbology identifier byte).

A `width` field can be present. It represents module width (2-8).

A `maxWidth` field can be present. It represents maximum width for Expanded Stacked variants.

Yields: `1D 28 6B 03 00 33 43 n` (width) + `1D 28 6B 04 00 33 47 nL nH` (max width) + `1D 28 6B pL pH 33 50 30 n d...` (store) + `1D 28 6B 03 00 33 51 30` (print)

### Composite

```idl
interface Composite <: Node {
  type: 'composite'
  lineElement: CompositeLineElement
  element2D: Composite2DElement
  width: number?
  maxWidth: number?
  hriFont: HriFont | null?
}

interface CompositeLineElement {
  barcode: CompositeLineBarcode
  symbology: CompositeGS1DataBarVariant?
  data: string
}

interface Composite2DElement {
  symbology: Composite2DSymbology
  data: string
}
```

**Composite** ([**Node**][dfn-unist-node]) represents a Composite Symbology barcode (combining linear and 2D components) using [GS ( k](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk.html) (cn=52) with functions [467](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk_fn467.html) (width), [471](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk_fn471.html) (max width), [472](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk_fn472.html) (HRI font), [480](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk_fn480.html) (store), and [481](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk_fn481.html) (print).

Composite can be used where [**flow**](#flowcontent) content is expected. It has no content model.

A `lineElement` field must be present. It describes the linear (1D) barcode component, stored via fn480 with a=48. The `barcode` sub-field identifies the barcode type ([CompositeLineBarcode](#compositelinebarcode)). When `barcode` is `'GS1-DATABAR'`, the optional `symbology` sub-field specifies the GS1 DataBar variant ([CompositeGS1DataBarVariant](#compositegs1databarvariant)). The `data` sub-field contains the encoded data.

An `element2D` field must be present. It describes the 2D composite component, stored via fn480 with a=49. The `symbology` sub-field identifies the 2D symbology type ([Composite2DSymbology](#composite2dsymbology)). The `data` sub-field contains the encoded data.

A `width` field can be present. It represents module width (2-8).

A `maxWidth` field can be present. It represents maximum width for Expanded Stacked variants.

An `hriFont` field can be present. It represents the font for HRI text. When `null`, HRI text is not added (fn472 n=0).

Yields: `1D 28 6B 03 00 34 43 n` (width) + `1D 28 6B 04 00 34 47 nL nH` (max width) + `1D 28 6B 03 00 34 48 n` (HRI font) + `1D 28 6B pL pH 34 50 30 b d...` (store line element, a=48) + `1D 28 6B pL pH 34 50 31 b d...` (store 2D element, a=49) + `1D 28 6B 03 00 34 51 30` (print)

### TabStops

```idl
interface TabStops <: Parent {
  type: 'tabStops'
  stops: [number]
  children: [FlowContent]
}
```

**TabStops** ([**Parent**](#parent)) represents horizontal tab position configuration using [ESC D](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_cd.html).

TabStops can be used where [**flow**](#flowcontent) content is expected. Its content model is also [**flow**](#flowcontent) content.

A `stops` field must be present. It is a list of column positions where tabs stop. Maximum 32 positions.

Yields: `1B 44 n1 n2 ... nk 00` + children where n1...nk = stop positions. Stringifier restores previous tab stops after children.

### Color

```idl
interface Color <: Parent {
  type: 'color'
  color: PrintColor
  children: [PhrasingContent]
}
```

**Color** ([**Parent**](#parent)) represents print color selection using [ESC r](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_lr.html).

Color can be used where [**phrasing**](#phrasingcontent) content is expected. Its content model is [**phrasing**](#phrasingcontent) content.

A `color` field must be present.

Note: Two-color printing requires compatible printer and paper.

Yields: `1B 72 n` + children where n = 0 (black), 1 (red). Stringifier restores previous color after children.

### Margin

```idl
interface Margin <: Parent {
  type: 'margin'
  left: number
  children: [FlowContent]
}
```

**Margin** ([**Parent**](#parent)) represents left margin configuration using [GS L](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_cl.html).

Margin can be used where [**flow**](#flowcontent) content is expected. Its content model is also [**flow**](#flowcontent) content.

A `left` field must be present. It represents the left margin in [canonical units](#unit-system).

Yields: `1D 4C nL nH` + children where nL/nH = left margin as low/high byte. Stringifier restores previous margin after children.

### PrintArea

```idl
interface PrintArea <: Parent {
  type: 'printArea'
  width: number
  children: [FlowContent]
}
```

**PrintArea** ([**Parent**](#parent)) represents print area width configuration using [GS W](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_cw.html).

PrintArea can be used where [**flow**](#flowcontent) content is expected. Its content model is also [**flow**](#flowcontent) content.

A `width` field must be present. It represents the print area width in [canonical units](#unit-system).

Yields: `1D 57 nL nH` + children where nL/nH = width as low/high byte. Stringifier restores previous width after children.

### Raw

```idl
interface Raw <: Literal {
  type: 'raw'
  value: string
  description: string?
}
```

**Raw** ([**Literal**](#literal)) represents unrecognized or vendor-specific command bytes.

Raw can be used where [**flow**](#flowcontent) or [**phrasing**](#phrasingcontent) content is expected. It has no content model.

A `value` field must be present. It contains base64-encoded raw bytes.

A `description` field can be present. It provides a human-readable description of the unknown command.

This node ensures lossless parsing of ESC/POS data even when commands are not recognized.

Yields: decoded bytes from `value` field (unchanged)

[escpos]: https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/
[webidl]: https://heycam.github.io/webidl/

## Enumeration

### AlignType

```idl
enum AlignType {
  'left' | 'center' | 'right'
}
```

**AlignType** represents horizontal text alignment.

- `'left'`: Left-aligned (default)
- `'center'`: Centered
- `'right'`: Right-aligned

### CutType

```idl
enum CutType {
  'full' | 'partial-1' | 'partial-3'
}
```

**CutType** represents paper cut mode.

- `'full'`: Full cut (complete paper separation)
- `'partial-1'`: Partial cut with 1 point left uncut (ESC i)
- `'partial-3'`: Partial cut with 3 points left uncut (ESC m)

### Country

```idl
enum Country {
  'usa' | 'france' | 'germany' | 'uk' | 'denmark-1' | 'sweden' |
  'italy' | 'spain-1' | 'japan' | 'norway' | 'denmark-2' | 'spain-2' |
  'latin-america' | 'korea' | 'slovenia' | 'china' | 'vietnam' | 'arabia' |
  'india-devanagari' | 'india-bengali' | 'india-tamil' | 'india-telugu' |
  'india-assamese' | 'india-oriya' | 'india-kannada' | 'india-malayalam' |
  'india-gujarati' | 'india-punjabi' | 'india-marathi'
}
```

**Country** represents international character set selection. Each country defines variations for specific ASCII positions:

| Code | Country       | 23  | 24  | 25  | 2A  | 40  | 5B  | 5C  | 5D  | 5E  | 60  | 7B  | 7C  | 7D  | 7E  |
| ---- | ------------- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0    | usa           | #   | $   | %   | \*  | @   | [   | \   | ]   | ^   | `   | {   | \|  | }   | ~   |
| 1    | france        | #   | $   | %   | \*  | à   | °   | ç   | §   | ^   | `   | é   | ù   | è   | ¨   |
| 2    | germany       | #   | $   | %   | \*  | §   | Ä   | Ö   | Ü   | ^   | `   | ä   | ö   | ü   | ß   |
| 3    | uk            | £   | $   | %   | \*  | @   | [   | \   | ]   | ^   | `   | {   | \|  | }   | ~   |
| 4    | denmark-1     | #   | $   | %   | \*  | @   | Æ   | Ø   | Å   | ^   | `   | æ   | ø   | å   | ~   |
| 5    | sweden        | #   | ¤   | %   | \*  | É   | Ä   | Ö   | Å   | Ü   | é   | ä   | ö   | å   | ü   |
| 6    | italy         | #   | $   | %   | \*  | @   | °   | \   | é   | ^   | ù   | à   | ò   | è   | ì   |
| 7    | spain-1       | ₧   | $   | %   | \*  | @   | ¡   | Ñ   | ¿   | ^   | `   | ¨   | ñ   | }   | ~   |
| 8    | japan         | #   | $   | %   | \*  | @   | [   | ¥   | ]   | ^   | `   | {   | \|  | }   | ~   |
| 9    | norway        | #   | ¤   | %   | \*  | É   | Æ   | Ø   | Å   | Ü   | é   | æ   | ø   | å   | ü   |
| 10   | denmark-2     | #   | $   | %   | \*  | É   | Æ   | Ø   | Å   | Ü   | é   | æ   | ø   | å   | ü   |
| 11   | spain-2       | #   | $   | %   | \*  | á   | ¡   | Ñ   | ¿   | é   | `   | í   | ñ   | ó   | ú   |
| 12   | latin-america | #   | $   | %   | \*  | á   | ¡   | Ñ   | ¿   | é   | ü   | í   | ñ   | ó   | ú   |
| 13   | korea         | #   | $   | %   | \*  | @   | [   | ₩   | ]   | ^   | `   | {   | \|  | }   | ~   |
| 14   | slovenia      | #   | $   | %   | \*  | Ž   | Š   | Đ   | Ć   | Č   | ž   | š   | đ   | ć   | č   |
| 15   | china         | #   | ¥   | %   | \*  | @   | [   | \   | ]   | ^   | `   | {   | \|  | }   | ~   |
| 16   | vietnam       | đ   | $   | %   | \*  | @   | [   | \   | ]   | ^   | `   | {   | \|  | }   | ~   |
| 17   | arabia        | #   | $   | ٪   | \*  | @   | [   | \   | ]   | ^   | `   | {   | \|  | }   | ~   |

India character sets (codes 66-75, 82) replace ASCII positions 30-39 with language-specific numerals.

### BarcodeFormat

```idl
enum BarcodeFormat {
  'UPC-A' | 'UPC-E' | 'EAN13' | 'EAN8' |
  'CODE39' | 'ITF' | 'CODABAR' | 'CODE93' | 'CODE128'
}
```

**BarcodeFormat** represents 1D barcode symbology.

### HriPosition

```idl
enum HriPosition {
  'none' | 'above' | 'below' | 'both'
}
```

**HriPosition** represents Human Readable Interpretation text position.

- `'none'`: No HRI text
- `'above'`: HRI printed above barcode
- `'below'`: HRI printed below barcode
- `'both'`: HRI printed above and below

### ErrorCorrection

```idl
enum ErrorCorrection {
  'L' | 'M' | 'Q' | 'H'
}
```

**ErrorCorrection** represents QR code error correction level.

- `'L'`: Low (~7% recovery)
- `'M'`: Medium (~15% recovery)
- `'Q'`: Quartile (~25% recovery)
- `'H'`: High (~30% recovery)

### PositionMode

```idl
enum PositionMode {
  'absolute' | 'relative'
}
```

**PositionMode** represents print position movement type.

- `'absolute'`: Position from origin
- `'relative'`: Position from current location

### FontType

```idl
enum FontType {
  'A' | 'B' | 'C' | 'D' | 'E' | 'specialA' | 'specialB'
}
```

**FontType** represents the printer font selection.

- `'A'`: Font A (typically 12x24 dots)
- `'B'`: Font B (typically 9x17 dots)
- `'C'`, `'D'`, `'E'`: Additional fonts (availability varies by printer)
- `'specialA'`, `'specialB'`: Special fonts

### PrintColor

```idl
enum PrintColor {
  'black' | 'red'
}
```

**PrintColor** represents print color selection.

- `'black'`: Black ink (default)
- `'red'`: Red ink (requires compatible printer and paper)

### RotationSpacing

```idl
enum RotationSpacing {
  1 | 1.5
}
```

**RotationSpacing** represents character spacing for 90° clockwise rotation mode.

- `1`: 1-dot character spacing (ESC V n=1/49)
- `1.5`: 1.5-dot character spacing (ESC V n=2/50)

### QRModel

```idl
enum QRModel {
  1 | 2
}
```

**QRModel** represents QR code model selection.

- `1`: Model 1 (original)
- `2`: Model 2 (enhanced capacity)

### MaxiCodeMode

```idl
enum MaxiCodeMode {
  2 | 3 | 4 | 5 | 6
}
```

**MaxiCodeMode** represents MaxiCode symbol mode.

- `2`: Structured carrier message (US)
- `3`: Structured carrier message (non-US)
- `4`: Standard symbol, SEC
- `5`: Full ECC symbol
- `6`: Reader programming

### AztecMode

```idl
enum AztecMode {
  'full' | 'compact'
}
```

**AztecMode** represents Aztec Code symbol type.

- `'full'`: Full-range symbol (1-32 layers)
- `'compact'`: Compact symbol (1-4 layers)

### DataMatrixType

```idl
enum DataMatrixType {
  'square' | 'rectangular'
}
```

**DataMatrixType** represents DataMatrix symbol shape.

- `'square'`: Square symbol (default)
- `'rectangular'`: Rectangular symbol

### GS1DataBarSymbology

```idl
enum GS1DataBarSymbology {
  'STACKED' | 'STACKED-OMNIDIRECTIONAL' | 'EXPANDED-STACKED'
}
```

**GS1DataBarSymbology** represents the GS1 DataBar variant (fn380 `n` parameter).

- `'STACKED'`: GS1 DataBar Stacked (n=72)
- `'STACKED-OMNIDIRECTIONAL'`: GS1 DataBar Stacked Omnidirectional (n=73)
- `'EXPANDED-STACKED'`: GS1 DataBar Expanded Stacked (n=76)

### CompositeLineBarcode

```idl
enum CompositeLineBarcode {
  'EAN8' | 'EAN13' | 'UPC-A' | 'UPC-E' | 'UPC-E-FULL' |
  'GS1-DATABAR' | 'GS1-128'
}
```

**CompositeLineBarcode** represents the linear barcode type for a Composite Symbology line element (fn480, a=48).

| b   | Value          |
| --- | -------------- |
| 65  | `'EAN8'`       |
| 66  | `'EAN13'`      |
| 67  | `'UPC-A'`      |
| 68  | `'UPC-E'`      |
| 69  | `'UPC-E-FULL'` |
| 77  | `'GS1-128'`    |

When b=70–76, the barcode is `'GS1-DATABAR'` and a [CompositeGS1DataBarVariant](#compositegs1databarvariant) is also present.

### CompositeGS1DataBarVariant

```idl
enum CompositeGS1DataBarVariant {
  'OMNIDIRECTIONAL' | 'TRUNCATED' | 'STACKED' |
  'STACKED-OMNIDIRECTIONAL' | 'LIMITED' |
  'EXPANDED' | 'EXPANDED-STACKED'
}
```

**CompositeGS1DataBarVariant** represents the GS1 DataBar variant within a Composite Symbology line element.

| b   | Value                       |
| --- | --------------------------- |
| 70  | `'OMNIDIRECTIONAL'`         |
| 71  | `'TRUNCATED'`               |
| 72  | `'STACKED'`                 |
| 73  | `'STACKED-OMNIDIRECTIONAL'` |
| 74  | `'LIMITED'`                 |
| 75  | `'EXPANDED'`                |
| 76  | `'EXPANDED-STACKED'`        |

### Composite2DSymbology

```idl
enum Composite2DSymbology {
  'AUTO' | 'CC-C'
}
```

**Composite2DSymbology** represents the 2D element type for a Composite Symbology (fn480, a=49).

| b   | Value    |
| --- | -------- |
| 65  | `'AUTO'` |
| 66  | `'CC-C'` |

### DrawerPin

```idl
enum DrawerPin {
  'pin2' | 'pin5'
}
```

**DrawerPin** represents cash drawer connector pin.

- `'pin2'`: Drawer kick-out connector pin 2
- `'pin5'`: Drawer kick-out connector pin 5

### HriFont

```idl
enum HriFont {
  'A' | 'B'
}
```

**HriFont** represents the font for barcode HRI (Human Readable Interpretation) text.

## Content model

```idl
type FlowContent = FlowBlockContent | PhrasingContent
```

Each node in epos-ast falls into one or more categories of **Content** that group nodes with similar characteristics together.

### PhrasingContent

```idl
type PhrasingContent =
  Text | Break | Tab | Strong | Underline | Inverted | Scaled | Rotated |
  UpsideDown | Smoothing | DoubleStrike | Font | Color | Position | Raw
```

**Phrasing** content represents the text in a receipt and its markup.

### FlowBlockContent

```idl
type FlowBlockContent =
  Align | LineSpacing | CharacterSpacing |
  Margin | PrintArea | TabStops | Feed | Cut | Pulse |
  Image | Barcode | QRCode | PDF417 | DataMatrix | MaxiCode | AztecCode |
  GS1DataBar | Composite
```

**Flow block** content represents structural elements of a receipt.

### FlowContent

**Flow** content represents all content in an epos-ast tree. It is the union of [**flow block**](#flowblockcontent) and [**phrasing**](#phrasingcontent) content.

## Serialization

### Parsing

Parsing converts ESC/POS binary data to an epos-ast tree.

The parser maintains state for:

- Current codepage
- Current international character set
- Active formatting (bold, underline, etc.)
- Alignment
- Font

When a formatting command is encountered (e.g., ESC E 1 for bold ON), the parser opens a new parent node. When the corresponding OFF command is encountered (ESC E 0), the parser closes that node.

Codepage ([ESC t](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_lt.html)) and international character set ([ESC R](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_cr.html)) commands update parser state. The parser decodes text bytes to Unicode using the current codepage/country, and stores these values on each [**Text**](#text) node. This makes text nodes self-contained and easy to manipulate.

The printer reset command ([ESC @](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_atsign.html)) is handled internally by the parser. When encountered, it resets all parser state (codepage, formatting, alignment, etc.) to defaults without emitting a node. This is equivalent to starting a new print job.

```
Input bytes: 1B 45 01 48 65 6C 6C 6F 1B 45 00
             │         │           │
             │         │           └─ ESC E 0 (bold off)
             │         └─ "Hello"
             └─ ESC E 1 (bold on)

Output AST:
{
  type: 'root',
  children: [
    {
      type: 'strong',
      children: [
        { type: 'text', value: 'Hello' }
      ]
    }
  ]
}
```

### Stringifying

Stringifying converts an epos-ast tree back to ESC/POS binary data.

Each node type has a corresponding byte sequence documented in its "Yields" section. The stringifier maintains state to properly restore settings after nested nodes close.

For [**Text**](#text) nodes, the stringifier tracks the current codepage/country and emits ESC t / ESC R commands only when they change. Text is encoded to bytes using the codepage specified on each node (or the default CP858 if not specified).

### Round-trip guarantees

**Semantic equivalence**: `stringify(parse(bytes))` produces bytes that, when printed, produce visually identical output.

**Not guaranteed**: Byte-identical round-trip. Different command sequences can produce the same visual result. The parser normalizes to canonical forms.

**Guaranteed**: No information loss for recognized commands. Unknown commands preserved via Raw nodes produce identical bytes.

## Codepage reference

| Code | Name       | Description                   |
| ---- | ---------- | ----------------------------- |
| 0    | PC437      | USA, Standard Europe          |
| 1    | Katakana   | Katakana                      |
| 2    | PC850      | Multilingual                  |
| 3    | PC860      | Portuguese                    |
| 4    | PC863      | Canadian-French               |
| 5    | PC865      | Nordic                        |
| 6    | Hiragana   | Hiragana                      |
| 7    | Kanji      | One-pass printing Kanji       |
| 8    | Kanji      | One-pass printing Kanji       |
| 11   | PC851      | Greek                         |
| 12   | PC853      | Turkish                       |
| 13   | PC857      | Turkish                       |
| 14   | PC737      | Greek                         |
| 15   | ISO8859-7  | Greek                         |
| 16   | WPC1252    | Windows Latin 1               |
| 17   | PC866      | Cyrillic #2                   |
| 18   | PC852      | Latin 2                       |
| 19   | PC858      | Euro (default)                |
| 20   | Thai42     | Thai Character Code 42        |
| 21   | Thai11     | Thai Character Code 11        |
| 22   | Thai13     | Thai Character Code 13        |
| 23   | Thai14     | Thai Character Code 14        |
| 24   | Thai16     | Thai Character Code 16        |
| 25   | Thai17     | Thai Character Code 17        |
| 26   | Thai18     | Thai Character Code 18        |
| 30   | TCVN-3     | Vietnamese                    |
| 31   | TCVN-3     | Vietnamese                    |
| 32   | PC720      | Arabic                        |
| 33   | WPC775     | Baltic Rim                    |
| 34   | PC855      | Cyrillic                      |
| 35   | PC861      | Icelandic                     |
| 36   | PC862      | Hebrew                        |
| 37   | PC864      | Arabic                        |
| 38   | PC869      | Greek                         |
| 39   | ISO8859-2  | Latin 2                       |
| 40   | ISO8859-15 | Latin 9                       |
| 41   | PC1098     | Farsi                         |
| 42   | PC1118     | Lithuanian                    |
| 43   | PC1119     | Lithuanian                    |
| 44   | PC1125     | Ukrainian                     |
| 45   | WPC1250    | Latin 2                       |
| 46   | WPC1251    | Cyrillic                      |
| 47   | WPC1253    | Greek                         |
| 48   | WPC1254    | Turkish                       |
| 49   | WPC1255    | Hebrew                        |
| 50   | WPC1256    | Arabic                        |
| 51   | WPC1257    | Baltic Rim                    |
| 52   | WPC1258    | Vietnamese                    |
| 53   | KZ-1048    | Kazakhstan                    |
| 66   | Devanagari | India (Hindi, Sanskrit, etc.) |
| 67   | Bengali    | India (Bengali, Assamese)     |
| 68   | Tamil      | India (Tamil)                 |
| 69   | Telugu     | India (Telugu)                |
| 70   | Assamese   | India (Assamese)              |
| 71   | Oriya      | India (Odia)                  |
| 72   | Kannada    | India (Kannada)               |
| 73   | Malayalam  | India (Malayalam)             |
| 74   | Gujarati   | India (Gujarati)              |
| 75   | Punjabi    | India (Punjabi/Gurmukhi)      |
| 82   | Marathi    | India (Marathi)               |
| 254  | Page 254   | User-defined                  |
| 255  | Page 255   | User-defined                  |

## Unsupported

The following commands are unsupported due to unlikelihood of use or being status/control commands handled by the parser directly, not the document AST.

| Command                                                                                           | Description                                        |
| ------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| [CAN](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/can.html)                      | Cancel print data in page mode                     |
| [CR](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/cr.html)                        | Print and carriage return                          |
| [DLE DC4](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/dle_dc4_fn1.html)          | Real-time commands                                 |
| [DLE ENQ](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/dle_enq.html)              | Send real-time request to printer                  |
| [DLE EOT](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/dle_eot.html)              | Transmit real-time status                          |
| [ESC %](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_percent.html)            | Select/cancel user-defined characters              |
| [ESC &](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_ampersand.html)          | Define user-defined characters                     |
| [ESC \*](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_asterisk.html)          | Select bit-image mode                              |
| [ESC <](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_less_than_sign.html)     | Return home                                        |
| [ESC =](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_equal.html)              | Select peripheral device                           |
| [ESC ( A](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_lparen_ca.html)        | Execute beeper buzzer                              |
| [ESC ?](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_questionmark.html)       | Cancel user-defined characters                     |
| [ESC FF](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_ff.html)                | Print data in page mode                            |
| [ESC K](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_ck.html)                 | Print and reverse feed                             |
| [ESC L](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_cl.html)                 | Select page mode                                   |
| [ESC S](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_cs.html)                 | Select standard mode                               |
| [ESC T](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_ct.html)                 | Select print direction in page mode                |
| [ESC U](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_cu.html)                 | Turn unidirectional print mode on/off              |
| [ESC W](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_cw.html)                 | Set print area in page mode                        |
| [ESC c 3](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_lc_3.html)             | Select paper sensor(s) to output paper-end signals |
| [ESC c 4](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_lc_4.html)             | Select paper sensor(s) to stop printing            |
| [ESC c 5](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_lc_5.html)             | Enable/disable panel buttons                       |
| [ESC u](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_lu.html)                 | Transmit peripheral device status                  |
| [ESC v](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_lv.html)                 | Transmit paper sensor status                       |
| [ESC ( Y](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_lparen_cy.html)        | Specify batch print                                |
| [FF](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/ff_in_standard.html)            | Form feed (page mode / end job)                    |
| [FS !](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/fs_exclamation.html)          | Select print mode(s) for Kanji                     |
| [FS &](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/fs_ampersand.html)            | Select Kanji character mode                        |
| [FS ( A](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/fs_lparen_ca.html)          | Select Kanji character style(s)                    |
| [FS ( C](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/fs_lparen_cc.html)          | Select code conversion method                      |
| [FS ( E](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/fs_lparen_ce.html)          | Receipt enhancement control (top/bottom logo)      |
| [FS ( L](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/fs_lparen_cl.html)          | Label and black mark control                       |
| [FS ( e](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/fs_lparen_le.html)          | Enable/disable ASB for optional functions          |
| [FS -](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/fs_minus.html)                | Turn underline on/off for Kanji                    |
| [FS .](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/fs_period.html)               | Cancel Kanji character mode                        |
| [FS 2](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/fs_2.html)                    | Define user-defined Kanji characters               |
| [FS ?](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/fs_questionmark.html)         | Cancel user-defined Kanji characters               |
| [FS C](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/fs_cc.html)                   | Select Kanji character code system                 |
| [FS S](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/fs_cs.html)                   | Set Kanji character spacing                        |
| [FS W](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/fs_cw.html)                   | Turn quadruple-size on/off for Kanji               |
| [FS g 1](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/fs_lg_1.html)               | Write to NV user memory                            |
| [FS g 2](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/fs_lg_2.html)               | Read from NV user memory                           |
| [FS p](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/fs_lp.html)                   | Print NV bit image                                 |
| [FS q](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/fs_lq.html)                   | Define NV bit image                                |
| [GS $](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_dollarssign.html)          | Set absolute vertical print position in page mode  |
| [GS ( A](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_ca.html)          | Execute test print                                 |
| [GS ( C](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_cc.html)          | Edit NV user memory                                |
| [GS ( D](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_cd.html)          | Enable/disable real-time command                   |
| [GS ( E](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_ce.html)          | Set user setup commands                            |
| [GS ( H](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_ch.html)          | Request transmission of response or status         |
| [GS ( K](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_ck.html)          | Select print control method(s)                     |
| [GS ( L fn=48-52](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_cl.html) | Graphics memory capacity/density                   |
| [GS ( L fn=64-69](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_cl.html) | NV graphics storage                                |
| [GS ( L fn=80-85](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_cl.html) | Download graphics storage                          |
| [GS ( L fn=113](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_cl.html)   | Store graphics data (column format)                |
| [GS ( M](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_cm.html)          | Customize printer control value(s)                 |
| [GS ( N](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_cn.html)          | Select character effects                           |
| [GS ( P](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_cp.html)          | Page mode control                                  |
| [GS ( Q](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_cq.html)          | Draw line/rectangle (page mode)                    |
| [GS ( V](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_cv.html)          | Specify paper cut                                  |
| [GS ( k fn=082](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk.html)   | PDF417 transmit size information                   |
| [GS ( k fn=182](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk.html)   | QR Code transmit size information                  |
| [GS ( k fn=282](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk.html)   | MaxiCode transmit size information                 |
| [GS ( k fn=382](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk.html)   | GS1 DataBar transmit size information              |
| [GS ( k fn=482](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk.html)   | Composite transmit size information                |
| [GS ( k fn=582](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk.html)   | Aztec Code transmit size information               |
| [GS ( k fn=682](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk.html)   | DataMatrix transmit size information               |
| [GS \*](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_asterisk.html)            | Define downloaded bit image                        |
| [GS /](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_slash.html)                | Print downloaded bit image                         |
| [GS :](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_colon.html)                | Start/end macro definition                         |
| [GS C 0](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_cc_0.html)               | Select counter print mode                          |
| [GS C 1](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_cc_1.html)               | Select count mode (A)                              |
| [GS C 2](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_cc_2.html)               | Set counter                                        |
| [GS C ;](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_cc_semicolon.html)       | Select count mode (B)                              |
| [GS D](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_cd.html)                   | Specify Windows BMP graphics data                  |
| [GS I](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_ci.html)                   | Transmit printer ID                                |
| [GS P](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_cp.html)                   | Set horizontal and vertical motion units           |
| [GS Q 0](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_cq_0.html)               | Print variable vertical size bit image             |
| [GS T](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_ct.html)                   | Set print position to beginning of print line      |
| [GS \\](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_backslash.html)           | Set relative vertical print position in page mode  |
| [GS ^](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_caret.html)                | Execute macro                                      |
| [GS a](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_la.html)                   | Enable/disable ASB                                 |
| [GS c](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lc.html)                   | Print counter                                      |
| [GS g 0](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lg_0.html)               | Initialize maintenance counter                     |
| [GS g 2](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lg_2.html)               | Transmit maintenance counter                       |
| [GS j](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lj.html)                   | Enable/disable ASB for ink                         |
| [GS r](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lr.html)                   | Transmit status                                    |
| [GS v 0](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lv_0.html)               | Print raster bit image                             |
| [GS z 0](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lz_0.html)               | Set online recovery wait time                      |

## Unit system

epos-ast uses **dots at 203 DPI** as the canonical unit for all distance and position values. This provides:

- **Integer math** — no floating-point rounding errors
- **Common baseline** — 203 DPI matches the majority of modern thermal printers
- **Portability** — AST values are independent of source printer motion unit configuration

### Motion units in ESC/POS

ESC/POS printers use configurable "motion units" set by [GS P](https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_cp.html). The `x` parameter controls horizontal commands, `y` controls vertical commands. The physical distance per unit is 25.4/x mm horizontally and 25.4/y mm vertically.

| Printer family                                                       | Default x | Default y | Horizontal | Vertical | Notes                |
| -------------------------------------------------------------------- | --------- | --------- | ---------- | -------- | -------------------- |
| TM-m30 series, TM-m50, EU-m30, TM-L90, TM-L100, TM-m10               | 203       | 406       | 0.125mm    | 0.063mm  |                      |
| TM-T20 series, TM-T81III, TM-T82 series, TM-T83 series, TM-T100      | 203       | 406       | 0.125mm    | 0.063mm  | standard column mode |
| TM-T20 series, TM-T82 series (42-column mode)                        | 180       | 360       | 0.141mm    | 0.071mm  |                      |
| TM-T88IV, TM-T88V, TM-T88VI, TM-T88VII, TM-J2000, TM-J2100, TM-m50II | 180       | 360       | 0.141mm    | 0.071mm  |                      |
| TM-P20, TM-P20II                                                     | 203       | 203       | 0.125mm    | 0.125mm  | 1:1 ratio            |
| TM-P80, TM-P80II (48-column)                                         | 203       | 203       | 0.125mm    | 0.125mm  |                      |
| TM-P80, TM-P80II (42-column)                                         | 180       | 360       | 0.141mm    | 0.071mm  |                      |
| TM-L90 LFC 65\*/66\*/68\* (40mm paper)                               | 417       | 835       | 0.061mm    | 0.030mm  | auto scaling enabled |

### Canonical conversion

Horizontal commands (ESC $, ESC \, GS L, GS W, ESC SP) use `x` motion units. Vertical commands (ESC 3, ESC J) use `y` motion units.

The decoder normalizes to 203 DPI:

```
canonicalHorizontal = sourceValue × (203 / x)
canonicalVertical = sourceValue × (203 / y)
```

The encoder converts back to target motion units:

```
targetHorizontal = canonical × (x / 203)
targetVertical = canonical × (y / 203)
```

For printers with finer resolution (y=406), vertical values are scaled by 0.5 when converting to canonical form. This means sub-dot precision in the source is rounded to the nearest canonical unit.

### Affected fields

The following node fields use 203 DPI dots as their unit:

| Node                                  | Field        | ESC/POS command | Direction      |
| ------------------------------------- | ------------ | --------------- | -------------- |
| [Position](#position)                 | `horizontal` | ESC $, ESC \    | horizontal (x) |
| [Margin](#margin)                     | `left`       | GS L            | horizontal (x) |
| [PrintArea](#printarea)               | `width`      | GS W            | horizontal (x) |
| [CharacterSpacing](#characterspacing) | `spacing`    | ESC SP          | horizontal (x) |
| [LineSpacing](#linespacing)           | `spacing`    | ESC 3           | vertical (y)   |
| [Feed](#feed)                         | `units`      | ESC J           | vertical (y)   |

All other numeric fields (barcode height, image dimensions, scale multipliers) use absolute values unaffected by motion units.

## Glossary

See the [unist glossary][unist-glossary].

## References

- **unist**: <https://github.com/syntax-tree/unist>
- **ESC/POS**: <https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/>
- **Web IDL**: <https://webidl.spec.whatwg.org/>

[escpos]: https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/
[webidl]: https://heycam.github.io/webidl/
[unist]: https://github.com/syntax-tree/unist
[unist-glossary]: https://github.com/syntax-tree/unist#glossary
[syntax-tree]: https://github.com/syntax-tree/unist#syntax-tree
[dfn-unist-parent]: https://github.com/syntax-tree/unist#parent
[dfn-unist-literal]: https://github.com/syntax-tree/unist#literal
[dfn-unist-node]: https://github.com/syntax-tree/unist#node
[term-child]: https://github.com/syntax-tree/unist#child
[term-root]: https://github.com/syntax-tree/unist#root
