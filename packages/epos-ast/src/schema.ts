import { Schema } from 'effect'

import type * as Ast from './definitions.js'

const taggedStruct = <const Type extends string, const Fields extends Schema.Struct.Fields>(type: Type, fields: Fields) =>
	Schema.Struct({ type: Schema.tag(type), ...fields })

const mutableArray = <S extends Schema.Constraint>(item: S) => Schema.mutable(Schema.Array(item))
const optional = Schema.optionalKey

export const AlignType = Schema.Literals(['left', 'center', 'right'])
export const CutType = Schema.Literals(['full', 'partial-1', 'partial-3'])
export const Country = Schema.Literals([
	'usa',
	'france',
	'germany',
	'uk',
	'denmark-1',
	'sweden',
	'italy',
	'spain-1',
	'japan',
	'norway',
	'denmark-2',
	'spain-2',
	'latin-america',
	'korea',
	'slovenia',
	'china',
	'vietnam',
	'arabia',
	'india-devanagari',
	'india-bengali',
	'india-tamil',
	'india-telugu',
	'india-assamese',
	'india-oriya',
	'india-kannada',
	'india-malayalam',
	'india-gujarati',
	'india-punjabi',
	'india-marathi',
])
export const BarcodeFormat = Schema.Literals(['UPC-A', 'UPC-E', 'EAN13', 'EAN8', 'CODE39', 'ITF', 'CODABAR', 'CODE93', 'CODE128'])
export const Code128CodeSet = Schema.Literals(['A', 'B', 'C'])
export const HriPosition = Schema.Literals(['none', 'above', 'below', 'both'])
export const ErrorCorrection = Schema.Literals(['L', 'M', 'Q', 'H'])
export const PositionMode = Schema.Literals(['absolute', 'relative'])
export const FontType = Schema.Literals(['A', 'B', 'C', 'D', 'E', 'specialA', 'specialB'])
export const PrintColor = Schema.Literals(['black', 'red'])
export const RotationSpacing = Schema.Literals([1, 1.5])
export const ScaleFactor = Schema.Literals([1, 2, 3, 4, 5, 6, 7, 8])
export const BarcodeModuleWidth = Schema.Literals([1, 2, 3, 4, 5, 6])
export const Symbol2DModuleWidth = Schema.Literals([2, 3, 4, 5, 6, 7, 8])
export const QRModel = Schema.Literals([1, 2])
export const MaxiCodeMode = Schema.Literals([2, 3, 4, 5, 6])
export const AztecMode = Schema.Literals(['full', 'compact'])
export const DataMatrixType = Schema.Literals(['square', 'rectangular'])
export const GS1DataBarSymbology = Schema.Literals(['STACKED', 'STACKED-OMNIDIRECTIONAL', 'EXPANDED-STACKED'])
export const CompositeLineBarcode = Schema.Literals(['EAN8', 'EAN13', 'UPC-A', 'UPC-E', 'UPC-E-FULL', 'GS1-DATABAR', 'GS1-128'])
export const CompositeGS1DataBarVariant = Schema.Literals([
	'OMNIDIRECTIONAL',
	'TRUNCATED',
	'STACKED',
	'STACKED-OMNIDIRECTIONAL',
	'LIMITED',
	'EXPANDED',
	'EXPANDED-STACKED',
])
export const Composite2DSymbology = Schema.Literals(['AUTO', 'CC-C'])
export const DrawerPin = Schema.Literals(['pin2', 'pin5'])
export const HriFont = Schema.Literals(['A', 'B'])

const PDF417LevelErrorCorrection = Schema.Struct({ mode: Schema.tag('level'), level: Schema.Number })
const PDF417RatioErrorCorrection = Schema.Struct({ mode: Schema.tag('ratio'), ratio: Schema.Number })
export const PDF417ErrorCorrection = Schema.Union([PDF417LevelErrorCorrection, PDF417RatioErrorCorrection]).pipe(
	Schema.toTaggedUnion('mode'),
)

const phrasingChildren = mutableArray(
	Schema.suspend(
		// RETURN TYPE: TypeScript needs the recursive schema contract before initialization.
		(): Schema.Decoder<Ast.PhrasingContent> => PhrasingContent,
	),
)
const flowChildren = mutableArray(
	Schema.suspend(
		// RETURN TYPE: TypeScript needs the recursive schema contract before initialization.
		(): Schema.Decoder<Ast.FlowContent> => FlowContent,
	),
)

export const Text = taggedStruct('text', {
	value: Schema.String,
	codepage: optional(Schema.Number),
	country: optional(Country),
}) satisfies Schema.Decoder<Ast.Text>
export const Break = taggedStruct('break', {}) satisfies Schema.Decoder<Ast.Break>
export const Tab = taggedStruct('tab', {}) satisfies Schema.Decoder<Ast.Tab>
export const Strong = taggedStruct('strong', { children: phrasingChildren }) satisfies Schema.Decoder<Ast.Strong>
export const Underline = taggedStruct('underline', {
	double: optional(Schema.Boolean),
	children: phrasingChildren,
}) satisfies Schema.Decoder<Ast.Underline>
export const Inverted = taggedStruct('inverted', { children: phrasingChildren }) satisfies Schema.Decoder<Ast.Inverted>
export const Scaled = taggedStruct('scaled', {
	width: ScaleFactor,
	height: ScaleFactor,
	children: phrasingChildren,
}) satisfies Schema.Decoder<Ast.Scaled>
export const Rotated = taggedStruct('rotated', {
	spacing: optional(RotationSpacing),
	children: phrasingChildren,
}) satisfies Schema.Decoder<Ast.Rotated>
export const UpsideDown = taggedStruct('upsideDown', { children: phrasingChildren }) satisfies Schema.Decoder<Ast.UpsideDown>
export const Smoothing = taggedStruct('smoothing', { children: phrasingChildren }) satisfies Schema.Decoder<Ast.Smoothing>
export const DoubleStrike = taggedStruct('doubleStrike', { children: phrasingChildren }) satisfies Schema.Decoder<Ast.DoubleStrike>
export const Font = taggedStruct('font', {
	font: FontType,
	children: phrasingChildren,
}) satisfies Schema.Decoder<Ast.Font>
export const Color = taggedStruct('color', {
	color: PrintColor,
	children: phrasingChildren,
}) satisfies Schema.Decoder<Ast.Color>
export const Position = taggedStruct('position', {
	horizontal: Schema.Number,
	mode: PositionMode,
}) satisfies Schema.Decoder<Ast.Position>
export const Raw = taggedStruct('raw', {
	value: Schema.String,
	description: optional(Schema.String),
}) satisfies Schema.Decoder<Ast.Raw>

export const Align = taggedStruct('align', {
	align: AlignType,
	children: flowChildren,
}) satisfies Schema.Decoder<Ast.Align>
export const LineSpacing = taggedStruct('lineSpacing', {
	spacing: Schema.Union([Schema.Number, Schema.Literal('default')]),
	children: flowChildren,
}) satisfies Schema.Decoder<Ast.LineSpacing>
export const CharacterSpacing = taggedStruct('characterSpacing', {
	spacing: Schema.Number,
	children: flowChildren,
}) satisfies Schema.Decoder<Ast.CharacterSpacing>
export const Margin = taggedStruct('margin', {
	left: Schema.Number,
	children: flowChildren,
}) satisfies Schema.Decoder<Ast.Margin>
export const PrintArea = taggedStruct('printArea', {
	width: Schema.Number,
	children: flowChildren,
}) satisfies Schema.Decoder<Ast.PrintArea>
export const TabStops = taggedStruct('tabStops', {
	stops: mutableArray(Schema.Number),
	children: flowChildren,
}) satisfies Schema.Decoder<Ast.TabStops>

const FeedStruct = taggedStruct('feed', {
	lines: optional(Schema.Union([Schema.Number, Schema.Undefined])),
	units: optional(Schema.Union([Schema.Number, Schema.Undefined])),
	reverse: optional(Schema.Union([Schema.Boolean, Schema.Undefined])),
})
export const Feed = FeedStruct.pipe(
	Schema.refine(
		// RETURN TYPE: The guard narrows the broad wire shape to the exclusive AST union.
		(value): value is Ast.Feed =>
			(value.lines !== undefined && value.units === undefined) ||
			(value.lines === undefined && value.units !== undefined && value.reverse === undefined),
		{ expected: 'a feed by lines or by units' },
	),
) satisfies Schema.Decoder<Ast.Feed>
export const Cut = taggedStruct('cut', {
	mode: CutType,
	feed: optional(Schema.Number),
}) satisfies Schema.Decoder<Ast.Cut>
export const Pulse = taggedStruct('pulse', {
	pin: DrawerPin,
	onTime: Schema.Number,
	offTime: Schema.Number,
}) satisfies Schema.Decoder<Ast.Pulse>
export const Image = taggedStruct('image', {
	width: Schema.Number,
	height: Schema.Number,
	data: Schema.String,
	scaleX: optional(Schema.Literals([1, 2])),
	scaleY: optional(Schema.Literals([1, 2])),
}) satisfies Schema.Decoder<Ast.Image>
export const Barcode = taggedStruct('barcode', {
	format: BarcodeFormat,
	data: Schema.String,
	codeSet: optional(Code128CodeSet),
	width: optional(BarcodeModuleWidth),
	height: optional(Schema.Number),
	hri: optional(HriPosition),
	hriFont: optional(HriFont),
}) satisfies Schema.Decoder<Ast.Barcode>
export const QRCode = taggedStruct('qrCode', {
	data: Schema.String,
	model: optional(QRModel),
	size: optional(Schema.Number),
	errorCorrection: optional(ErrorCorrection),
}) satisfies Schema.Decoder<Ast.QRCode>
export const PDF417 = taggedStruct('pdf417', {
	data: Schema.String,
	columns: optional(Schema.Number),
	rows: optional(Schema.Number),
	width: optional(Symbol2DModuleWidth),
	height: optional(Symbol2DModuleWidth),
	errorCorrection: optional(PDF417ErrorCorrection),
	truncated: optional(Schema.Boolean),
}) satisfies Schema.Decoder<Ast.PDF417>
export const DataMatrix = taggedStruct('dataMatrix', {
	data: Schema.String,
	symbolType: optional(DataMatrixType),
	columns: optional(Schema.Number),
	rows: optional(Schema.Number),
	size: optional(Schema.Number),
}) satisfies Schema.Decoder<Ast.DataMatrix>
export const MaxiCode = taggedStruct('maxiCode', {
	data: Schema.String,
	mode: optional(MaxiCodeMode),
}) satisfies Schema.Decoder<Ast.MaxiCode>
export const AztecCode = taggedStruct('aztecCode', {
	data: Schema.String,
	mode: optional(AztecMode),
	layers: optional(Schema.Number),
	size: optional(Schema.Number),
	errorCorrection: optional(Schema.Number),
}) satisfies Schema.Decoder<Ast.AztecCode>
export const GS1DataBar = taggedStruct('gs1DataBar', {
	symbology: GS1DataBarSymbology,
	data: Schema.String,
	width: optional(Symbol2DModuleWidth),
	maxWidth: optional(Schema.Number),
}) satisfies Schema.Decoder<Ast.GS1DataBar>
export const CompositeLineElement = Schema.Struct({
	barcode: CompositeLineBarcode,
	symbology: optional(CompositeGS1DataBarVariant),
	data: Schema.String,
}) satisfies Schema.Decoder<Ast.CompositeLineElement>
export const Composite2DElement = Schema.Struct({
	symbology: Composite2DSymbology,
	data: Schema.String,
}) satisfies Schema.Decoder<Ast.Composite2DElement>
export const Composite = taggedStruct('composite', {
	lineElement: CompositeLineElement,
	element2D: Composite2DElement,
	width: optional(Symbol2DModuleWidth),
	maxWidth: optional(Schema.Number),
	hriFont: optional(Schema.Union([HriFont, Schema.Null])),
}) satisfies Schema.Decoder<Ast.Composite>

export const PhrasingContent = Schema.Union([
	Text,
	Break,
	Tab,
	Strong,
	Underline,
	Inverted,
	Scaled,
	Rotated,
	UpsideDown,
	Smoothing,
	DoubleStrike,
	Font,
	Color,
	Position,
	Raw,
]).pipe(Schema.toTaggedUnion('type')) satisfies Schema.Decoder<Ast.PhrasingContent>

export const FlowBlockContent = Schema.Union([
	Align,
	LineSpacing,
	CharacterSpacing,
	Margin,
	PrintArea,
	TabStops,
	Feed,
	Cut,
	Pulse,
	Image,
	Barcode,
	QRCode,
	PDF417,
	DataMatrix,
	MaxiCode,
	AztecCode,
	GS1DataBar,
	Composite,
]).pipe(Schema.toTaggedUnion('type')) satisfies Schema.Decoder<Ast.FlowBlockContent>

export const FlowContent = Schema.Union([
	Text,
	Break,
	Tab,
	Strong,
	Underline,
	Inverted,
	Scaled,
	Rotated,
	UpsideDown,
	Smoothing,
	DoubleStrike,
	Font,
	Color,
	Position,
	Raw,
	Align,
	LineSpacing,
	CharacterSpacing,
	Margin,
	PrintArea,
	TabStops,
	Feed,
	Cut,
	Pulse,
	Image,
	Barcode,
	QRCode,
	PDF417,
	DataMatrix,
	MaxiCode,
	AztecCode,
	GS1DataBar,
	Composite,
]).pipe(Schema.toTaggedUnion('type')) satisfies Schema.Decoder<Ast.FlowContent>

export const Root = taggedStruct('root', { children: flowChildren }) satisfies Schema.Decoder<Ast.Root>
export const RootContent = FlowContent
export const Nodes = Schema.Union([Root, ...FlowContent.members]).pipe(Schema.toTaggedUnion('type')) satisfies Schema.Decoder<Ast.Nodes>
