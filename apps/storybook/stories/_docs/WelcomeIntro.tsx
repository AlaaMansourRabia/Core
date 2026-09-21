// WelcomeIntro — the Welcome page's masthead: hero, the material model (Components/Widgets vs
// Templates), and the "open an issue" call to action.
//
// Authored as TSX rather than inline MDX for one concrete reason: MDX parses JSX children that sit
// on their own line as markdown, so `<span style={{color: "var(--primary-foreground)"}}>\n  Use
// these to build\n</span>` became `<span><p>Use these to build</p></span>`. Storybook's own
// `.sbdocs p` rule then won on the inner <p> — repainting the label in the docs body colour and
// adding 16px margins — which is how the badges rendered as oversized blobs with unreadable
// near-black text on a near-black pill. TSX has no markdown layer, and <Unstyled> keeps the docs
// stylesheet off this subtree entirely.
//
// It also *is* Wakecore: the badges and the CTA are the real Badge and Button from @wakecap/core-ui,
// and every colour is a token, so the block follows the light/dark toolbar toggle.

import {Unstyled} from "@storybook/addon-docs/blocks";
import {Badge} from "@wakecap/core-ui/badge";
import {Button} from "@wakecap/core-ui/button";

// Docs pages render inside Storybook's own chrome, so this block sets its own type scale instead of
// inheriting one. Tokens (not hex) so the light/dark toolbar toggle carries the whole page.
const root: React.CSSProperties = {
	fontFamily: "var(--font-sans)",
	// The markdown prose that follows opens with an <h2> whose own top margin the docs stylesheet
	// zeroes out, so the separation from the CTA card is owned here.
	marginBottom: 44,
	color: "var(--foreground)",
	lineHeight: 1.6,
	WebkitFontSmoothing: "antialiased",
};

const eyebrow: React.CSSProperties = {
	fontSize: 11,
	fontWeight: 600,
	letterSpacing: "0.12em",
	textTransform: "uppercase",
	color: "var(--muted-foreground)",
	margin: 0,
};

const h1: React.CSSProperties = {
	fontSize: 38,
	lineHeight: 1.1,
	letterSpacing: "-0.025em",
	fontWeight: 700,
	color: "var(--foreground)",
	margin: "10px 0 0",
};

const lead: React.CSSProperties = {
	fontSize: 16,
	lineHeight: 1.65,
	color: "var(--muted-foreground)",
	margin: "14px 0 0",
	maxWidth: "62ch",
};

const sectionTitle: React.CSSProperties = {
	fontSize: 20,
	fontWeight: 650,
	letterSpacing: "-0.015em",
	color: "var(--foreground)",
	margin: 0,
};

const card: React.CSSProperties = {
	flex: "1 1 320px",
	minWidth: 0,
	background: "var(--card)",
	color: "var(--card-foreground)",
	border: "1px solid var(--border)",
	borderRadius: 12,
	padding: 22,
};

const cardTitle: React.CSSProperties = {
	fontSize: 17,
	fontWeight: 650,
	letterSpacing: "-0.01em",
	color: "var(--card-foreground)",
	margin: "14px 0 8px",
};

const body: React.CSSProperties = {fontSize: 14.5, color: "var(--muted-foreground)", margin: 0};
const strong: React.CSSProperties = {color: "var(--card-foreground)", fontWeight: 600};

const list: React.CSSProperties = {
	listStyle: "none",
	margin: "14px 0 0",
	padding: 0,
	display: "flex",
	flexDirection: "column",
	gap: 10,
	fontSize: 14.5,
	color: "var(--muted-foreground)",
};

// A leading dash reads calmer than a bullet at this density and needs no list-style reset fights.
const item: React.CSSProperties = {display: "flex", gap: 10, alignItems: "baseline"};
const dash: React.CSSProperties = {color: "var(--muted-foreground)", opacity: 0.45, flexShrink: 0, fontSize: 13};

const codeChip: React.CSSProperties = {
	fontFamily: "var(--font-mono)",
	fontSize: 12,
	lineHeight: "20px",
	padding: "0 6px",
	borderRadius: 5,
	border: "1px solid var(--border)",
	background: "var(--muted)",
	color: "var(--foreground)",
	whiteSpace: "nowrap",
};

const Code = ({children}: {children: React.ReactNode}) => <code style={codeChip}>{children}</code>;

// The pipeline strip — the mental model in one line, each step a flat token-coloured chip.
const STEPS = ["Tokens", "Components", "Widgets", "Templates"];

const step: React.CSSProperties = {
	fontFamily: "var(--font-mono)",
	fontSize: 12,
	letterSpacing: "0.02em",
	color: "var(--foreground)",
	background: "var(--muted)",
	border: "1px solid var(--border)",
	borderRadius: 999,
	padding: "3px 12px",
};

const arrow: React.CSSProperties = {color: "var(--muted-foreground)", fontSize: 12};

export function WelcomeIntro() {
	return (
		<Unstyled>
			<div style={root}>
				{/* ── Hero ── */}
				<header style={{paddingBottom: 28, borderBottom: "1px solid var(--border)"}}>
					<p style={eyebrow}>WakeCap Design System</p>
					<h1 style={h1}>Wakecore Design Framework</h1>
					<p style={lead}>
						One artifact library — tokens, components, widgets and templates — purpose-built for construction technology
						interfaces, and shared by every WakeCap product.
					</p>
					<div style={{display: "flex", flexWrap: "wrap", gap: 10, marginTop: 22}}>
						{/* target="_top" + a relative href: the manager lives one level up from iframe.html, so this
						    resolves under /storybook/ when hosted and at / locally. */}
						<Button asChild>
							<a href="./?path=/docs/components-overview--docs" target="_top">
								Browse components
							</a>
						</Button>
						<Button asChild variant="outline">
							<a href="./?path=/docs/design-tokens-overview--docs" target="_top">
								Design tokens
							</a>
						</Button>
						<Button asChild variant="ghost">
							<a href="https://wakecap.com" target="_blank" rel="noreferrer">
								wakecap.com ↗
							</a>
						</Button>
					</div>
				</header>

				{/* ── The material model ── */}
				<section style={{marginTop: 32}}>
					<h2 style={sectionTitle}>Components, Widgets and Templates — know the difference</h2>
					<p style={{...body, margin: "10px 0 0", maxWidth: "72ch"}}>
						Wakecore ships these as <span style={strong}>distinct kinds of building material</span>. The single most
						common mistake is treating a Template like a Component you can import.
					</p>

					<div style={{display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", margin: "18px 0 16px"}}>
						{STEPS.map((s, i) => (
							<span key={s} style={{display: "inline-flex", alignItems: "center", gap: 8}}>
								<span style={step}>{s}</span>
								{i < STEPS.length - 1 && <span style={arrow}>→</span>}
							</span>
						))}
					</div>

					<div style={{display: "flex", flexWrap: "wrap", gap: 16}}>
						<div style={card}>
							<Badge>Use these to build</Badge>
							<h3 style={cardTitle}>Components + Widgets — the building blocks</h3>
							<p style={body}>
								The primitive blocks. <span style={strong}>Import them and compose them freely</span> — assemble them
								however your product needs.
							</p>
							<ul style={list}>
								<li style={item}>
									<span style={dash}>—</span>
									<span>
										<span style={strong}>Components</span> are generic primitives: <Code>Button</Code>,{" "}
										<Code>Input</Code>, <Code>Badge</Code>, <Code>Card</Code>, <Code>Table</Code>…
									</span>
								</li>
								<li style={item}>
									<span style={dash}>—</span>
									<span>
										<span style={strong}>Widgets</span> are composed, domain-aware blocks with a data contract:{" "}
										<Code>DataTable</Code>, <Code>App Sidebar</Code>, <Code>Activity Log</Code>…
									</span>
								</li>
							</ul>
						</div>

						<div style={card}>
							<Badge variant="neutralSoft">Build your module to match</Badge>
							<h3 style={cardTitle}>Templates — the prototypes</h3>
							<p style={body}>
								<span style={strong}>Interactive prototypes</span> of how a whole module should look and behave. A
								Template is a <span style={strong}>reference you build against</span> — not a block you drop in.
							</p>
							<ul style={list}>
								<li style={item}>
									<span style={dash}>—</span>
									<span>Open one and study its layout, states and data flow.</span>
								</li>
								<li style={item}>
									<span style={dash}>—</span>
									<span>Then build your own module to match it, composed from Components + Widgets.</span>
								</li>
							</ul>
						</div>
					</div>
				</section>

				{/* ── Call to action ── */}
				<section
					style={{
						marginTop: 16,
						display: "flex",
						flexWrap: "wrap",
						alignItems: "center",
						justifyContent: "space-between",
						gap: 20,
						background: "var(--muted)",
						border: "1px solid var(--border)",
						borderRadius: 12,
						padding: "20px 22px",
					}}
				>
					<div style={{flex: "1 1 420px", minWidth: 0}}>
						<h3 style={{...cardTitle, margin: "0 0 6px"}}>Missing something on a Component or Widget?</h3>
						<p style={{...body, maxWidth: "72ch"}}>
							If a Component or Widget can't do what you need — it should support a prop it doesn't, say —{" "}
							<span style={strong}>open an issue</span> rather than silently forking or working around it. The code
							owners, <span style={strong}>Hamed Farag</span> and <span style={strong}>Alaa Mansour</span>, review every
							request and decide how it gets fixed.
						</p>
					</div>
					<Button asChild>
						<a
							href="https://github.com/wakecap/Wakecore/issues/new?template=component-widget-gap.yml"
							target="_blank"
							rel="noreferrer"
						>
							Open a Wakecore issue
						</a>
					</Button>
				</section>
			</div>
		</Unstyled>
	);
}
