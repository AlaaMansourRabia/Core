// Trade taxonomy for the 4D timeline. Every activity code maps to exactly one trade, and each trade
// carries a colour used both to tint elements in the 3D model while they're being worked and to
// colour-code the UI (legend, "now on site" badges, per-floor active-trade dots). Single source of
// truth — the schedule generator mirrors these keys/labels for the exported activity table.

export interface Trade {
	key: string;
	label: string;
	color: string;
	activities: string[];
}

export const TRADES: Trade[] = [
	{key: "enabling", label: "Enabling & Preliminaries", color: "#4F46E5", activities: ["ENABLING", "MOBILISE", "HAZMAT", "ISOLATE", "SHORE"]},
	{key: "demolition", label: "Demolition & Strip-out", color: "#DC2626", activities: ["STRIP", "DEMO"]},
	{key: "structure", label: "Concrete Structure", color: "#2563EB", activities: ["COL", "WALL-RC", "SLAB", "BEAM+SLAB"]},
	{key: "circulation", label: "Stairs & Ramps", color: "#06B6D4", activities: ["STAIR", "RAMP"]},
	{key: "metalwork", label: "Metalwork & Railings", color: "#F97316", activities: ["RAIL"]},
	{key: "facade", label: "Façade & Glazing", color: "#8B5CF6", activities: ["CW", "WIN", "FACADE"]},
	{key: "roofing", label: "Roofing & Waterproofing", color: "#EC4899", activities: ["ROOF"]},
	{key: "transport", label: "Vertical Transport", color: "#B45309", activities: ["LIFT"]},
	{key: "mep", label: "MEP", color: "#22C55E", activities: ["MEP-ROUGH/DECK", "SAN/MEP-FIT", "MEP-FIT"]},
	{key: "fitout", label: "Fit-out & Finishes", color: "#EAB308", activities: ["PART", "CEIL/FLOOR-FIN", "FLOOR-FIN", "DOOR", "FURN"]},
	{key: "commissioning", label: "Commissioning & Handover", color: "#10B981", activities: ["COMMISSIONING", "COMMISSION", "HANDOVER"]},
	// P6 disciplines (villa schedule) — one trade per discipline code, so tradeForActivity(discipline)
	// resolves a colour/label for the real schedule too.
	{key: "architectural", label: "Architectural", color: "#EAB308", activities: ["ARC"]},
	{key: "structural", label: "Structural", color: "#2563EB", activities: ["STR"]},
	{key: "plumbing", label: "Plumbing", color: "#06B6D4", activities: ["PLU"]},
	{key: "mechanical", label: "Mechanical / HVAC", color: "#22C55E", activities: ["MEP"]},
	{key: "electrical", label: "Electrical", color: "#F97316", activities: ["ELE"]},
	{key: "sitework", label: "Sitework / Landscape", color: "#10B981", activities: ["SITE"]},
];

const FALLBACK: Trade = {key: "other", label: "Other", color: "#EAB308", activities: []};

export const TRADE_BY_KEY = new Map(TRADES.map((t) => [t.key, t]));

const ACTIVITY_TO_TRADE = new Map<string, string>();
for (const t of TRADES) for (const a of t.activities) ACTIVITY_TO_TRADE.set(a, t.key);

export function tradeForActivity(activity: string): Trade {
	return TRADE_BY_KEY.get(ACTIVITY_TO_TRADE.get(activity) ?? "") ?? FALLBACK;
}

export function tradeColor(activity: string): string {
	return tradeForActivity(activity).color;
}
