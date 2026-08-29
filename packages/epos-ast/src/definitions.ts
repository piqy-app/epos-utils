import type { Literal as UnistLiteral, Node as UnistNode, Parent as UnistParent } from 'unist'

// ## Enumerations

/**
 * Horizontal text alignment.
 *
 * - `'left'`: Left-aligned (default)
 * - `'center'`: Centered
 * - `'right'`: Right-aligned
 */
export type AlignType = 'left' | 'center' | 'right'

/**
 * Paper cut mode.
 *
 * - `'full'`: Full cut (complete paper separation)
 * - `'partial-1'`: Partial cut with 1 point left uncut (ESC i)
 * - `'partial-3'`: Partial cut with 3 points left uncut (ESC m)
 */
export type CutType = 'full' | 'partial-1' | 'partial-3'

/**
 * International character set selection.
 *
 * Each country defines variations for specific ASCII positions (currency symbols,
 * punctuation, accented characters).
 */
export type Country =
	| 'usa'
	| 'france'
	| 'germany'
	| 'uk'
	| 'denmark-1'
	| 'sweden'
	| 'italy'
	| 'spain-1'
	| 'japan'
	| 'norway'
	| 'denmark-2'
	| 'spain-2'
	| 'latin-america'
	| 'korea'
	| 'slovenia'
	| 'china'
	| 'vietnam'
	| 'arabia'
	| 'india-devanagari'
	| 'india-bengali'
	| 'india-tamil'
	| 'india-telugu'
	| 'india-assamese'
	| 'india-oriya'
	| 'india-kannada'
	| 'india-malayalam'
	| 'india-gujarati'
	| 'india-punjabi'
	| 'india-marathi'

/**
 * 1D barcode symbology.
 */
export type BarcodeFormat = 'UPC-A' | 'UPC-E' | 'EAN13' | 'EAN8' | 'CODE39' | 'ITF' | 'CODABAR' | 'CODE93' | 'CODE128'

/**
 * CODE128 code set selection.
 *
 * - `'A'`: Uppercase, control characters, digits
 * - `'B'`: Upper/lowercase, digits, symbols (default)
 * - `'C'`: Numeric pairs for high-density digit encoding
 */
export type Code128CodeSet = 'A' | 'B' | 'C'

/**
 * Human Readable Interpretation text position for barcodes.
 *
 * - `'none'`: No HRI text
 * - `'above'`: HRI printed above barcode
 * - `'below'`: HRI printed below barcode
 * - `'both'`: HRI printed above and below
 */
export type HriPosition = 'none' | 'above' | 'below' | 'both'

/**
 * QR code error correction level.
 *
 * - `'L'`: Low (~7% recovery)
 * - `'M'`: Medium (~15% recovery)
 * - `'Q'`: Quartile (~25% recovery)
 * - `'H'`: High (~30% recovery)
 */
export type ErrorCorrection = 'L' | 'M' | 'Q' | 'H'

/**
 * Print position movement type.
 *
 * - `'absolute'`: Position from origin
 * - `'relative'`: Position from current location
 */
export type PositionMode = 'absolute' | 'relative'

/**
 * Printer font selection.
 *
 * - `'A'`: Font A (typically 12x24 dots)
 * - `'B'`: Font B (typically 9x17 dots)
 * - `'C'`, `'D'`, `'E'`: Additional fonts (availability varies by printer)
 * - `'specialA'`, `'specialB'`: Special fonts
 */
export type FontType = 'A' | 'B' | 'C' | 'D' | 'E' | 'specialA' | 'specialB'

/**
 * Print color selection.
 *
 * - `'black'`: Black ink (default)
 * - `'red'`: Red ink (requires compatible printer and paper)
 */
export type PrintColor = 'black' | 'red'

/**
 * Character spacing for 90° clockwise rotation mode.
 *
 * - `1`: 1-dot character spacing (ESC V n=1/49)
 * - `1.5`: 1.5-dot character spacing (ESC V n=2/50)
 */
export type RotationSpacing = 1 | 1.5

/**
 * Character size magnification factor (1-8x).
 *
 * Used by GS ! command which encodes magnification as (n-1) in 3 bits.
 */
export type ScaleFactor = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

/**
 * 1D barcode module width (1-6 dots).
 *
 * Used by GS w command. Actual supported range varies by printer model,
 * but 2-6 is typical with 3 as default.
 */
export type BarcodeModuleWidth = 1 | 2 | 3 | 4 | 5 | 6

/**
 * 2D symbol module width (2-8 dots).
 *
 * Used by PDF417, GS1 DataBar, and Composite Symbology.
 */
export type Symbol2DModuleWidth = 2 | 3 | 4 | 5 | 6 | 7 | 8

/**
 * QR code model selection.
 *
 * - `1`: Model 1 (original)
 * - `2`: Model 2 (enhanced capacity)
 */
export type QRModel = 1 | 2

/**
 * MaxiCode symbol mode.
 *
 * - `2`: Structured carrier message (US)
 * - `3`: Structured carrier message (non-US)
 * - `4`: Standard symbol, SEC
 * - `5`: Full ECC symbol
 * - `6`: Reader programming
 */
export type MaxiCodeMode = 2 | 3 | 4 | 5 | 6

/**
 * Aztec Code symbol type.
 *
 * - `'full'`: Full-range symbol (1-32 layers)
 * - `'compact'`: Compact symbol (1-4 layers)
 */
export type AztecMode = 'full' | 'compact'

/**
 * DataMatrix symbol type.
 *
 * - `'square'`: Square symbol (default)
 * - `'rectangular'`: Rectangular symbol
 */
export type DataMatrixType = 'square' | 'rectangular'

/**
 * GS1 DataBar symbology type (fn380 `n` parameter).
 *
 * - `'STACKED'`: GS1 DataBar Stacked (n=72)
 * - `'STACKED-OMNIDIRECTIONAL'`: GS1 DataBar Stacked Omnidirectional (n=73)
 * - `'EXPANDED-STACKED'`: GS1 DataBar Expanded Stacked (n=76)
 */
export type GS1DataBarSymbology = 'STACKED' | 'STACKED-OMNIDIRECTIONAL' | 'EXPANDED-STACKED'

/**
 * Composite Symbology line element barcode type (fn480 `b` parameter, a=48).
 */
export type CompositeLineBarcode = 'EAN8' | 'EAN13' | 'UPC-A' | 'UPC-E' | 'UPC-E-FULL' | 'GS1-DATABAR' | 'GS1-128'

/**
 * Composite Symbology GS1 DataBar variant (fn480 `b` parameter when barcode is 'GS1-DATABAR').
 */
export type CompositeGS1DataBarVariant =
	| 'OMNIDIRECTIONAL'
	| 'TRUNCATED'
	| 'STACKED'
	| 'STACKED-OMNIDIRECTIONAL'
	| 'LIMITED'
	| 'EXPANDED'
	| 'EXPANDED-STACKED'

/**
 * Composite Symbology 2D element type (fn480 `b` parameter, a=49).
 *
 * - `'AUTO'`: Automatically select CC-A or CC-B (b=65)
 * - `'CC-C'`: CC-C composite component (b=66)
 */
export type Composite2DSymbology = 'AUTO' | 'CC-C'

/**
 * PDF417 error correction configuration.
 *
 * - `{ mode: 'level', level: 0-8 }`: Specific error correction level
 * - `{ mode: 'ratio', ratio: 1-400 }`: Error correction as ratio percentage
 */
export type PDF417ErrorCorrection = { mode: 'level'; level: number } | { mode: 'ratio'; ratio: number }

/**
 * Cash drawer connector pin.
 *
 * - `'pin2'`: Drawer kick-out connector pin 2
 * - `'pin5'`: Drawer kick-out connector pin 5
 */
export type DrawerPin = 'pin2' | 'pin5'

/**
 * Font for barcode HRI (Human Readable Interpretation) text.
 */
export type HriFont = 'A' | 'B'

// ## Abstract interfaces

/**
 * Abstract epos-ast node.
 */
export interface Node extends UnistNode {
	type: string
}

/**
 * Abstract epos-ast node containing a value.
 */
export interface Literal extends Node {
	/**
	 * Plain-text value.
	 */
	value: string
}

/**
 * Abstract epos-ast node containing other nodes (children).
 */
export interface Parent extends Node {
	/**
	 * List of children.
	 */
	children: FlowContent[]
}

// ## Concrete nodes

/**
 * Represents a complete print job or receipt.
 *
 * Root can be used as the root of a tree, never as a child.
 * A Root represents one TCP connection or one serial transmission (delimited by full cuts).
 */
export interface Root extends Parent {
	type: 'root'
	children: FlowContent[]
}

/**
 * Represents printable text content.
 */
export interface Text extends Literal {
	type: 'text'
	/**
	 * The explicit ESC/POS codepage number for encoding during serialization.
	 * When absent, the encoder starts at page 0 and selects from loaded pages automatically.
	 */
	codepage?: number | undefined
	/**
	 * Country-specific character variations for serialization.
	 */
	country?: Country | undefined
}

/**
 * Represents a line feed (LF).
 */
export interface Break extends Node {
	type: 'break'
}

/**
 * Represents a horizontal tab (HT).
 *
 * Tab positions are defined by TabStops.
 */
export interface Tab extends Node {
	type: 'tab'
}

/**
 * Represents bold/emphasized text.
 */
export interface Strong extends Parent {
	type: 'strong'
	children: PhrasingContent[]
}

/**
 * Represents underlined text.
 */
export interface Underline extends Parent {
	type: 'underline'
	/**
	 * When true, uses double (2-dot) underline. Defaults to single (1-dot) underline.
	 */
	double?: boolean | undefined
	children: PhrasingContent[]
}

/**
 * Represents reverse-printed text (white text on black background).
 */
export interface Inverted extends Parent {
	type: 'inverted'
	children: PhrasingContent[]
}

/**
 * Represents enlarged text with width and/or height multipliers.
 */
export interface Scaled extends Parent {
	type: 'scaled'
	/**
	 * Horizontal size multiplier (1-8).
	 */
	width: ScaleFactor
	/**
	 * Vertical size multiplier (1-8).
	 */
	height: ScaleFactor
	children: PhrasingContent[]
}

/**
 * Represents 90° clockwise rotated text (ESC V).
 *
 * ESC V only supports 90° clockwise rotation. The spacing property
 * controls character spacing during rotation mode.
 */
export interface Rotated extends Parent {
	type: 'rotated'
	/**
	 * Character spacing in rotation mode. Defaults to 1 (1-dot spacing).
	 */
	spacing?: RotationSpacing | undefined
	children: PhrasingContent[]
}

/**
 * Represents 180°-rotated text printed right-to-left.
 *
 * Only effective in Standard mode at the beginning of a line.
 * Does not affect graphics or raster images.
 */
export interface UpsideDown extends Parent {
	type: 'upsideDown'
	children: PhrasingContent[]
}

/**
 * Represents smoothed character rendering.
 *
 * Only effective for quadruple-size (4x) or larger characters.
 */
export interface Smoothing extends Parent {
	type: 'smoothing'
	children: PhrasingContent[]
}

/**
 * Represents double-strike printed text (prints each line twice for darker output).
 */
export interface DoubleStrike extends Parent {
	type: 'doubleStrike'
	children: PhrasingContent[]
}

/**
 * Represents a font selection.
 *
 * Font A is typically 12x24 dots, Font B is 9x17 dots.
 * Availability of other fonts varies by printer model.
 */
export interface Font extends Parent {
	type: 'font'
	font: FontType
	children: PhrasingContent[]
}

/**
 * Represents text alignment.
 */
export interface Align extends Parent {
	type: 'align'
	align: AlignType
	children: FlowContent[]
}

/**
 * Represents line spacing configuration.
 */
export interface LineSpacing extends Parent {
	type: 'lineSpacing'
	/**
	 * Spacing in dots, or 'default' to reset to printer's default.
	 */
	spacing: number | 'default'
	children: FlowContent[]
}

/**
 * Represents right-side character spacing.
 */
export interface CharacterSpacing extends Parent {
	type: 'characterSpacing'
	/**
	 * Additional spacing in dots added to the right side of each character.
	 */
	spacing: number
	children: FlowContent[]
}

/**
 * Represents absolute or relative horizontal print position movement.
 */
export interface Position extends Node {
	type: 'position'
	/**
	 * Horizontal position in motion units.
	 */
	horizontal: number
	/**
	 * Whether positioning is absolute (from origin) or relative (from current position).
	 */
	mode: PositionMode
}

/**
 * Represents paper feed commands.
 *
 * `reverse` is only supported with `lines` (ESC e). There is no ESC/POS
 * command for reverse feed by motion units.
 */
export type Feed = FeedLines | FeedUnits

interface FeedLines extends Node {
	type: 'feed'
	lines: number
	units?: undefined
	reverse?: boolean | undefined
}

interface FeedUnits extends Node {
	type: 'feed'
	lines?: undefined
	units: number
	reverse?: undefined
}

/**
 * Represents paper cutting commands.
 */
export interface Cut extends Node {
	type: 'cut'
	/**
	 * The type of cut to perform.
	 */
	mode: CutType
	/**
	 * Lines to feed before cutting.
	 */
	feed?: number | undefined
}

/**
 * Represents a pulse output signal (ESC p).
 *
 * Typically used to drive cash drawers, but can also control external buzzers
 * or other devices connected to the drawer kick-out connector.
 */
export interface Pulse extends Node {
	type: 'pulse'
	/**
	 * Which connector pin to pulse (0 for pin 2, 1 for pin 5).
	 */
	pin: DrawerPin
	/**
	 * Pulse ON time in units of 2ms.
	 */
	onTime: number
	/**
	 * Pulse OFF time in units of 2ms.
	 */
	offTime: number
}

/**
 * Represents a printed image.
 *
 * The parser normalizes all image formats (GS v 0, ESC *, GS ( L) into this representation.
 * The stringifier always outputs using GS ( L Function 112 + Function 50.
 */
export interface Image extends Node {
	type: 'image'
	/**
	 * Image width in pixels.
	 */
	width: number
	/**
	 * Image height in pixels.
	 */
	height: number
	/**
	 * Base64-encoded bitmap data in normalized raster format: row-major, 1 bit per pixel,
	 * MSB is leftmost pixel. Each row is padded to byte boundary.
	 */
	data: string
	/**
	 * Horizontal scale multiplier (1 or 2). Defaults to 1.
	 */
	scaleX?: 1 | 2 | undefined
	/**
	 * Vertical scale multiplier (1 or 2). Defaults to 1.
	 */
	scaleY?: 1 | 2 | undefined
}

/**
 * Represents a 1D barcode.
 */
export interface Barcode extends Node {
	type: 'barcode'
	/**
	 * The barcode symbology.
	 */
	format: BarcodeFormat
	/**
	 * The data to encode. Valid characters depend on the barcode format.
	 */
	data: string
	/**
	 * CODE128 code set selection. Only applies when format is 'CODE128'.
	 * Defaults to 'B' (standard ASCII).
	 */
	codeSet?: Code128CodeSet | undefined
	/**
	 * Module (bar) width in dots (1-6). Default is 3.
	 */
	width?: BarcodeModuleWidth | undefined
	/**
	 * Barcode height in dots (1-255). Default is 162.
	 */
	height?: number | undefined
	/**
	 * Where to print Human Readable Interpretation text.
	 */
	hri?: HriPosition | undefined
	/**
	 * Which font to use for HRI text.
	 */
	hriFont?: HriFont | undefined
}

/**
 * Represents a QR code.
 */
export interface QRCode extends Node {
	type: 'qrCode'
	/**
	 * The data to encode.
	 */
	data: string
	/**
	 * QR code model. Model 1 is the original; Model 2 has higher capacity. Defaults to 2.
	 */
	model?: QRModel | undefined
	/**
	 * Module size (1-16). Defaults to 3.
	 */
	size?: number | undefined
	/**
	 * Error correction level. Defaults to 'L'.
	 */
	errorCorrection?: ErrorCorrection | undefined
}

/**
 * Represents a PDF417 2D barcode.
 */
export interface PDF417 extends Node {
	type: 'pdf417'
	/**
	 * The data to encode.
	 */
	data: string
	/**
	 * Number of data columns (0-30). 0 = auto.
	 */
	columns?: number | undefined
	/**
	 * Number of rows. Valid values: 0 (auto) or 3-90.
	 */
	rows?: number | undefined
	/**
	 * Module width (2-8). Default is 3.
	 */
	width?: Symbol2DModuleWidth | undefined
	/**
	 * Row height (2-8). Default is 3.
	 */
	height?: Symbol2DModuleWidth | undefined
	/**
	 * Error correction configuration.
	 */
	errorCorrection?: PDF417ErrorCorrection | undefined
	/**
	 * When true, generates truncated PDF417.
	 */
	truncated?: boolean | undefined
}

/**
 * Represents a DataMatrix 2D barcode.
 */
export interface DataMatrix extends Node {
	type: 'dataMatrix'
	/**
	 * The data to encode.
	 */
	data: string
	/**
	 * Symbol type: 'square' or 'rectangular'. Defaults to 'square'.
	 */
	symbolType?: DataMatrixType | undefined
	/**
	 * Number of columns. Auto-selected when not present.
	 */
	columns?: number | undefined
	/**
	 * Number of rows. Auto-selected when not present.
	 */
	rows?: number | undefined
	/**
	 * Module size (2-16).
	 */
	size?: number | undefined
}

/**
 * Represents a MaxiCode 2D barcode.
 */
export interface MaxiCode extends Node {
	type: 'maxiCode'
	/**
	 * The data to encode.
	 */
	data: string
	/**
	 * MaxiCode mode. Defaults to 4 (standard symbol).
	 */
	mode?: MaxiCodeMode | undefined
}

/**
 * Represents an Aztec Code 2D barcode.
 */
export interface AztecCode extends Node {
	type: 'aztecCode'
	/**
	 * The data to encode.
	 */
	data: string
	/**
	 * Symbol type: 'full' (1-32 layers) or 'compact' (1-4 layers). Defaults to 'full'.
	 */
	mode?: AztecMode | undefined
	/**
	 * Number of data layers (1-32 for full, 1-4 for compact). Auto-selected when not present.
	 */
	layers?: number | undefined
	/**
	 * Module size (2-16).
	 */
	size?: number | undefined
	/**
	 * Error correction percentage (5-95). Defaults to 23.
	 */
	errorCorrection?: number | undefined
}

/**
 * Represents a GS1 DataBar (formerly RSS) 2D barcode.
 */
export interface GS1DataBar extends Node {
	type: 'gs1DataBar'
	/**
	 * The symbology variant (fn380 `n` parameter).
	 */
	symbology: GS1DataBarSymbology
	/**
	 * The data to encode (without the symbology identifier byte).
	 */
	data: string
	/**
	 * Module width (2-8). Default is 2.
	 */
	width?: Symbol2DModuleWidth | undefined
	/**
	 * Maximum width for Expanded Stacked variants.
	 */
	maxWidth?: number | undefined
}

/**
 * Represents a Composite Symbology barcode (combining linear and 2D components).
 */
export interface Composite extends Node {
	type: 'composite'
	/**
	 * The linear (1D) barcode component stored via fn480 a=48.
	 */
	lineElement: CompositeLineElement
	/**
	 * The 2D composite component stored via fn480 a=49.
	 */
	element2D: Composite2DElement
	/**
	 * Module width (2-8). Default is 2.
	 */
	width?: Symbol2DModuleWidth | undefined
	/**
	 * Maximum width for Expanded Stacked variants.
	 */
	maxWidth?: number | undefined
	/**
	 * Font for HRI text. When null, HRI is not added (fn472 n=0).
	 */
	hriFont?: HriFont | null | undefined
}

/**
 * The linear (1D) barcode component of a Composite Symbology.
 */
export interface CompositeLineElement {
	barcode: CompositeLineBarcode
	/**
	 * GS1 DataBar variant, only present when `barcode` is `'GS1-DATABAR'`.
	 */
	symbology?: CompositeGS1DataBarVariant | undefined
	data: string
}

/**
 * The 2D composite component of a Composite Symbology.
 */
export interface Composite2DElement {
	symbology: Composite2DSymbology
	data: string
}

/**
 * Represents horizontal tab position configuration.
 */
export interface TabStops extends Parent {
	type: 'tabStops'
	/**
	 * Column positions where tabs stop. Maximum 32 positions.
	 */
	stops: number[]
	children: FlowContent[]
}

/**
 * Represents print color selection.
 *
 * Two-color printing requires compatible printer and paper.
 */
export interface Color extends Parent {
	type: 'color'
	color: PrintColor
	children: PhrasingContent[]
}

/**
 * Represents left margin configuration.
 */
export interface Margin extends Parent {
	type: 'margin'
	/**
	 * Left margin in motion units (dots).
	 */
	left: number
	children: FlowContent[]
}

/**
 * Represents print area width configuration.
 */
export interface PrintArea extends Parent {
	type: 'printArea'
	/**
	 * Print area width in motion units (dots).
	 */
	width: number
	children: FlowContent[]
}

/**
 * Represents unrecognized or vendor-specific command bytes.
 *
 * This node ensures lossless parsing of ESC/POS data even when commands are not recognized.
 */
export interface Raw extends Literal {
	type: 'raw'
	/**
	 * Base64-encoded raw bytes.
	 */
	value: string
	/**
	 * Human-readable description of the unknown command.
	 */
	description?: string | undefined
}

// ## Content model

/**
 * Phrasing content represents the text in a receipt and its markup.
 */
export type PhrasingContent =
	| Text
	| Break
	| Tab
	| Strong
	| Underline
	| Inverted
	| Scaled
	| Rotated
	| UpsideDown
	| Smoothing
	| DoubleStrike
	| Font
	| Color
	| Position
	| Raw

/**
 * Block content represents structural elements of a receipt.
 */
export type FlowBlockContent =
	| Align
	| LineSpacing
	| CharacterSpacing
	| Margin
	| PrintArea
	| TabStops
	| Feed
	| Cut
	| Pulse
	| Image
	| Barcode
	| QRCode
	| PDF417
	| DataMatrix
	| MaxiCode
	| AztecCode
	| GS1DataBar
	| Composite

/**
 * Epos content represents all content in an epos-ast tree.
 */
export type FlowContent = FlowBlockContent | PhrasingContent

/**
 * Content that can appear as children of Root.
 */
export type RootContent = FlowContent

// ## Helper types

/**
 * Union of all epos-ast nodes.
 */
export type Nodes = Root | RootContent

/**
 * Union of all epos-ast parent nodes.
 */
export type Parents = Extract<Nodes, UnistParent>

/**
 * Union of all epos-ast literal nodes.
 */
export type Literals = Extract<Nodes, UnistLiteral>
