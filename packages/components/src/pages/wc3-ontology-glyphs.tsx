import {
	Beaker,
	Box,
	Boxes,
	Building2,
	Calendar,
	Clock,
	Compass,
	Component,
	Construction,
	Database,
	FileText,
	Folder,
	Globe,
	HardHat,
	IdCard,
	KeyRound,
	Layers,
	Link2,
	MapPin,
	Network,
	Puzzle,
	Share2,
	Shield,
	Signal,
	Target,
	TrendingUp,
	TriangleAlert,
	Truck,
	Users,
	Wrench,
	Zap,
} from "lucide-react";

// The prototype stores an icon name per object type and interface (its own glyph set, WC3_ICON_GLYPHS).
// This maps every name in that palette onto a lucide equivalent so a type keeps the same identity here
// as it has there. `crane` has no lucide equivalent — Construction is the closest read.
const GLYPHS: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
	beaker: Beaker,
	bolt: Zap,
	box: Box,
	building: Building2,
	calendar: Calendar,
	clock: Clock,
	compass: Compass,
	component: Component,
	crane: Construction,
	cube: Boxes,
	database: Database,
	fileText: FileText,
	folder: Folder,
	globe: Globe,
	graph: Network,
	hardhat: HardHat,
	idCard: IdCard,
	key: KeyRound,
	layers: Layers,
	link: Link2,
	mapPin: MapPin,
	pipeline: Share2,
	puzzle: Puzzle,
	shield: Shield,
	signal: Signal,
	target: Target,
	trendUp: TrendingUp,
	truck: Truck,
	users: Users,
	warning: TriangleAlert,
	wrench: Wrench,
};

/**
 * An object type's or interface's glyph, tinted with its authored colour. Falls back to a generic
 * box so an unmapped name never renders as a blank cell.
 */
export function OntologyGlyph({name, color, className}: {name: string; color?: string; className?: string}) {
	const Icon = GLYPHS[name] ?? Box;
	return <Icon className={className ?? "wwc:h-3.5 wwc:w-3.5 wwc:shrink-0"} style={color ? {color} : undefined} />;
}

/** Every glyph name the icon picker offers, in palette order. */
export const ONTOLOGY_GLYPH_NAMES = Object.keys(GLYPHS);
