import {BlueprintSegment} from "@/components/ui/blueprint-segment";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";

// A minimal SVG floor plan used to fill a segment; a real app passes its own plan node.
function FloorPlan() {
	return (
		<svg
			viewBox="0 0 1000 680"
			preserveAspectRatio="xMidYMid meet"
			className="wwc:h-full wwc:w-full"
			role="img"
			aria-label="Floor plan"
		>
			<rect x="0" y="0" width="1000" height="680" fill="#ffffff" />
			<rect x="60" y="60" width="880" height="560" fill="none" stroke="#3f3f46" strokeWidth="4" />
			<g fill="none" stroke="#52525b" strokeWidth="2">
				<rect x="60" y="320" width="880" height="60" />
				<rect x="240" y="60" width="220" height="260" />
				<rect x="460" y="60" width="300" height="130" />
				<rect x="760" y="380" width="180" height="240" />
			</g>
		</svg>
	);
}

const propsTable: {prop: string; type: string; def: string; desc: string}[] = [
	{prop: "label", type: "string", def: "—", desc: "Floor / level label shown in the corner chip, e.g. “GF”."},
	{
		prop: "value",
		type: "number",
		def: "undefined",
		desc: "Completion percentage shown next to the label. Omit to hide it.",
	},
	{
		prop: "plan",
		type: "ReactNode",
		def: "undefined",
		desc: "The blueprint / plan node (e.g. an SVG floor plan). When omitted, a “No blueprint” placeholder shows.",
	},
	{
		prop: "onWalkthrough",
		type: "() => void",
		def: "undefined",
		desc: "Fires when the walk-through button is pressed. Omit to hide the button.",
	},
	{
		prop: "walkthroughLabel",
		type: "string",
		def: '"Walk-through"',
		desc: "Accessible label + tooltip for the walk-through button.",
	},
	{prop: "active", type: "boolean", def: "false", desc: "Highlight the segment as active (inset ring)."},
	{
		prop: "bare",
		type: "boolean",
		def: "false",
		desc: "Drop the rounded card frame so the segment sits seamlessly in a split grid where the parent supplies the dividers.",
	},
	{
		prop: "labelClassName",
		type: "string",
		def: "undefined",
		desc: "Extra classes on the label chip (e.g. to offset it).",
	},
];

export function BlueprintSegmentPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Blueprint Segment</h1>
					<CopyButton
						value="Blueprint Segment"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:mt-2 wwc:max-w-2xl wwc:text-muted-foreground">
					One cell of a multi-floor blueprint split: a framed blueprint (or a “No blueprint” placeholder when{" "}
					<code>plan</code> is omitted), a floor label + % chip top-left, and an optional walk-through button
					bottom-right. Tile several to build a split canvas; pair the walk-through button with a{" "}
					<strong>Walkthrough Modal</strong>.
				</p>
			</div>

			{/* Tiled split */}
			<div>
				<h2 className="wwc:mb-1 wwc:text-xl wwc:font-semibold">Tiled split</h2>
				<p className="wwc:mb-4 wwc:max-w-2xl wwc:text-muted-foreground">
					A segment with a plan + walk-through button beside one without a plan (the placeholder state).
				</p>
				<div className="wwc:grid wwc:w-[720px] wwc:max-w-full wwc:grid-cols-2 wwc:gap-4">
					<BlueprintSegment className="wwc:h-56" label="GF" value={100} plan={<FloorPlan />} onWalkthrough={() => {}} />
					<BlueprintSegment className="wwc:h-56" label="L7" value={68} />
				</div>
			</div>

			{/* Bare, seamless grid */}
			<div>
				<h2 className="wwc:mb-1 wwc:text-xl wwc:font-semibold">Bare (seamless grid)</h2>
				<p className="wwc:mb-4 wwc:max-w-2xl wwc:text-muted-foreground">
					Pass <code>bare</code> to drop each segment's card frame so the parent grid supplies the dividers. The active
					segment shows an inset ring.
				</p>
				<div className="wwc:grid wwc:w-[720px] wwc:max-w-full wwc:grid-cols-2 wwc:divide-x wwc:divide-border wwc:overflow-hidden wwc:rounded-lg wwc:border wwc:border-border">
					<BlueprintSegment
						bare
						active
						className="wwc:h-56"
						label="GF"
						value={100}
						plan={<FloorPlan />}
						onWalkthrough={() => {}}
					/>
					<BlueprintSegment
						bare
						className="wwc:h-56"
						label="L7"
						value={68}
						plan={<FloorPlan />}
						onWalkthrough={() => {}}
					/>
				</div>
			</div>

			{/* Props table */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Props</CardTitle>
						<CopyButton
							value="Blueprint Segment - Props"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<div className="wwc:overflow-x-auto">
						<table className="wwc:w-full wwc:text-sm">
							<thead>
								<tr className="wwc:border-b wwc:border-border wwc:text-left">
									<th className="wwc:py-2 wwc:pr-4 wwc:font-semibold">Prop</th>
									<th className="wwc:py-2 wwc:pr-4 wwc:font-semibold">Type</th>
									<th className="wwc:py-2 wwc:pr-4 wwc:font-semibold">Default</th>
									<th className="wwc:py-2 wwc:font-semibold">Description</th>
								</tr>
							</thead>
							<tbody>
								{propsTable.map((row) => (
									<tr key={row.prop} className="wwc:border-b wwc:border-border wwc:last:border-b-0">
										<td className="wwc:whitespace-nowrap wwc:py-3 wwc:pr-4 wwc:font-mono wwc:font-medium wwc:text-primary">
											{row.prop}
										</td>
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-muted-foreground">{row.type}</td>
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-muted-foreground">{row.def}</td>
										<td className="wwc:py-3 wwc:text-muted-foreground">{row.desc}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
