const SEMANTIC_COLORS = new Set([
	"background",
	"foreground",
	"card",
	"card-foreground",
	"popover",
	"popover-foreground",
	"primary",
	"primary-foreground",
	"secondary",
	"secondary-foreground",
	"muted",
	"muted-foreground",
	"accent",
	"accent-foreground",
	"menu-highlight",
	"menu-highlight-foreground",
	"destructive",
	"destructive-foreground",
	"success",
	"warning",
	"border",
	"input",
	"ring",
	"chart-1",
	"chart-2",
	"chart-3",
	"chart-4",
	"chart-5",
	"sidebar",
	"sidebar-foreground",
	"sidebar-primary",
	"sidebar-primary-foreground",
	"sidebar-accent",
	"sidebar-accent-foreground",
	"sidebar-border",
	"sidebar-ring",
]);

const PALETTE_COLORS = new Set([
	"amber-50",
	"amber-100",
	"amber-400",
	"amber-500",
	"amber-600",
	"amber-700",
	"amber-800",
	"black",
	"blue-50",
	"blue-300",
	"blue-400",
	"blue-500",
	"blue-600",
	"blue-700",
	"blue-950",
	"emerald-50",
	"emerald-100",
	"emerald-500",
	"emerald-600",
	"emerald-700",
	"gray-50",
	"gray-800",
	"green-100",
	"green-400",
	"green-500",
	"green-600",
	"green-700",
	"green-800",
	"orange-100",
	"pink-500",
	"red-50",
	"red-100",
	"red-300",
	"red-400",
	"red-500",
	"red-600",
	"red-700",
	"red-800",
	"rose-200",
	"sky-100",
	"sky-500",
	"slate-200",
	"slate-500",
	"violet-500",
	"violet-600",
	"white",
	"yellow-100",
	"yellow-500",
	"yellow-800",
	"zinc-100",
	"zinc-300",
	"zinc-400",
	"zinc-500",
	"zinc-900",
]);

function bareName(name) {
	return name.replace(/^--/, "");
}

export function tokenColorRole(name) {
	let bare = bareName(name);
	if (bare.startsWith("wwc-color-")) bare = bare.slice("wwc-color-".length);
	else if (bare.startsWith("color-")) bare = bare.slice("color-".length);
	if (SEMANTIC_COLORS.has(bare)) return bare;
	if (PALETTE_COLORS.has(bare)) return "palette";
	return undefined;
}

export function wakecoreTokenType(name) {
	return tokenColorRole(name) ? "complete-color" : "scalar";
}

export function isKnownWakeCoreToken(name) {
	const bare = bareName(name);
	if (SEMANTIC_COLORS.has(bare)) return true;
	if (bare.startsWith("color-") && SEMANTIC_COLORS.has(bare.slice("color-".length))) return true;
	if (bare.startsWith("wwc-color-")) {
		const color = bare.slice("wwc-color-".length);
		return SEMANTIC_COLORS.has(color) || PALETTE_COLORS.has(color);
	}
	return (
		/^(?:wwc-)?spacing(?:-[0-9.]+)?$/.test(bare) ||
		/^(?:wwc-)?radius(?:-(?:sm|md|lg|xl|2xl|full))?$/.test(bare) ||
		/^(?:wwc-)?(?:font|text|leading|shadow|animate|ease)-[a-z0-9-]+$/.test(bare)
	);
}

export const WAKECORE_SEMANTIC_COLOR_TOKENS = [...SEMANTIC_COLORS];
