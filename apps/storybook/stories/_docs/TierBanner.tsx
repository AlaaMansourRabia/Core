import type {CSSProperties} from "react";

/**
 * A compact, theme-aware banner that reminds visitors which Wakecore tier they are looking at and
 * how it is meant to be used. The full explainer lives on Getting Started → Welcome; this is the
 * per-section reminder placed at the top of each tier's Overview page.
 *
 * Building blocks (Components, Widgets) → "use these to build".
 * Templates → "build your module to match" (a prototype you reference, not a block you drop in).
 */

type Tier = "components" | "widgets" | "templates";

// Direct link to the Component/Widget gap issue form (.github/ISSUE_TEMPLATE/component-widget-gap.yml).
const ISSUE_URL = "https://github.com/wakecap/Wakecore/issues/new?template=component-widget-gap.yml";

const TIERS: Record<Tier, {kind: "build" | "match"; pill: string; title: string; body: string; issue: boolean}> = {
	components: {
		kind: "build",
		pill: "Use these to build",
		title: "Components are building blocks",
		body: "Generic primitives you import and compose freely to build whatever you want — assemble them however your product needs.",
		issue: true,
	},
	widgets: {
		kind: "build",
		pill: "Use these to build",
		title: "Widgets are building blocks",
		body: "Composed, domain-aware blocks with a data contract — import them and drop them into your pages. Still yours to assemble.",
		issue: true,
	},
	templates: {
		kind: "match",
		pill: "Build your module to match",
		title: "Templates are prototypes, not drop-in blocks",
		body: "Interactive prototypes of how a whole module should look and behave. Use a Template as the reference you build against — then compose the real thing from Components + Widgets.",
		issue: false,
	},
};

export function TierBanner({tier}: {tier: Tier}) {
	const t = TIERS[tier];
	const isBuild = t.kind === "build";

	const container: CSSProperties = {
		display: "flex",
		flexDirection: "column",
		gap: "8px",
		background: "var(--muted)",
		border: "1px solid var(--border)",
		borderLeft: `4px solid ${isBuild ? "var(--primary)" : "var(--muted-foreground)"}`,
		borderRadius: "10px",
		padding: "16px 20px",
		margin: "0 0 24px",
	};

	const pill: CSSProperties = {
		alignSelf: "flex-start",
		fontSize: "0.7rem",
		fontWeight: 700,
		letterSpacing: "0.06em",
		textTransform: "uppercase",
		borderRadius: "999px",
		padding: "3px 10px",
		color: isBuild ? "var(--primary-foreground)" : "var(--accent-foreground)",
		background: isBuild ? "var(--primary)" : "var(--accent)",
		border: isBuild ? "none" : "1px solid var(--border)",
	};

	return (
		<div style={container}>
			<span style={pill}>{t.pill}</span>
			<p style={{margin: 0, color: "var(--muted-foreground)"}}>
				<strong style={{color: "var(--foreground)"}}>{t.title}.</strong> {t.body}
			</p>
			<p style={{margin: 0, fontSize: "0.85rem", color: "var(--muted-foreground)"}}>
				New to the tiers? See <strong style={{color: "var(--foreground)"}}>Getting Started → Welcome</strong> for how
				Components, Widgets, and Templates fit together.
				{t.issue ? " " : null}
				{t.issue ? (
					<a
						href={ISSUE_URL}
						target="_blank"
						rel="noreferrer"
						style={{color: "var(--primary)", fontWeight: 600, textDecoration: "underline"}}
					>
						Missing a prop or behavior? Open an issue →
					</a>
				) : null}
			</p>
		</div>
	);
}
