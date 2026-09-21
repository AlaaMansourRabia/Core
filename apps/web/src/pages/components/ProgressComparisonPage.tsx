import {useState} from "react";

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {
	ProgressComparison,
	type ProgressComparisonMilestone,
	type ProgressComparisonStat,
} from "@/components/ui/progress-comparison";

const STATS: ProgressComparisonStat[] = [
	{label: "PV", value: "$160,604"},
	{label: "BAC", value: "$817,218"},
	{label: "SV", value: "-$27,821", negative: true},
	{label: "EV", value: "$184,262"},
];

const MILESTONES: ProgressComparisonMilestone[] = [
	{date: "Jan-27", label: "M35", complete: true},
	{date: "Jan-27", label: "M50", complete: true},
	{date: "Jan-27", label: "M65", complete: true},
	{date: "Mar-27", label: "M80", marker: 80},
	{date: "Jul-27", label: "M95", marker: 95},
	{date: "Dec-27", label: "M100", flag: true},
];

// Schematic floor-plan preview, standing in for a real drawing/thumbnail.
function FloorPlan() {
	return (
		<svg viewBox="0 0 340 160" className="wwc:h-full wwc:w-full" role="img" aria-label="Floor plan preview">
			<rect x="0" y="0" width="340" height="160" fill="#ffffff" />
			<g fill="none" stroke="#3f3f46" strokeWidth="2">
				<rect x="20" y="20" width="300" height="120" />
				<rect x="20" y="20" width="70" height="55" />
				<rect x="20" y="75" width="70" height="65" />
				<rect x="90" y="20" width="90" height="120" />
				<rect x="180" y="20" width="140" height="70" />
				<rect x="180" y="90" width="140" height="50" />
				<line x1="130" y1="90" x2="130" y2="140" />
			</g>
			<g fill="none" stroke="#a1a1aa" strokeWidth="1" strokeDasharray="3 3">
				<line x1="10" y1="10" x2="330" y2="10" />
				<line x1="10" y1="10" x2="10" y2="150" />
			</g>
		</svg>
	);
}

export function ProgressComparisonPage() {
	const [open, setOpen] = useState(false);

	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Progress Comparison</h1>
					<CopyButton
						value="Progress Comparison"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2 wwc:max-w-2xl">
					A comparison panel for two progress sources — most commonly actual vs. planned, but any two sources. It pairs
					two hero percentages with a variance pill and a combined bar, then an expandable stats grid. The{" "}
					<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">milestone</code> variant adds a stepper
					timeline; the <code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">progress</code> variant shows a
					simple status chip. Designed to sit inside a modal.
				</p>
			</div>

			{/* Variants side by side */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Variants</CardTitle>
						<CopyButton
							value="Progress Comparison - Variants"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						<code className="wwc:text-xs">milestone</code> (stepper timeline) and{" "}
						<code className="wwc:text-xs">progress</code> (status chip). Both share the hero comparison and stats grid.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:flex wwc:flex-wrap wwc:items-start wwc:gap-6">
						<ProgressComparison
							className="wwc:max-w-[380px]"
							variant="milestone"
							title="Ground Floor"
							subtitle="Floor | HOUSE-12-F0"
							status={{label: "M65", color: "#38bdf8"}}
							primary={{label: "Approved", value: 67}}
							secondary={{label: "Planned", value: 71}}
							milestones={MILESTONES}
							stats={STATS}
							collapsible
						/>
						<ProgressComparison
							className="wwc:max-w-[380px]"
							variant="progress"
							title="Ground Floor"
							subtitle="Floor | HOUSE-12-F0"
							status={{label: "In Progress", color: "#1c60b7"}}
							primary={{label: "Approved", value: 67}}
							secondary={{label: "Planned", value: 71}}
							stats={STATS}
							collapsible
						/>
					</div>
				</CardContent>
			</Card>

			{/* Collapsed states */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Collapsed</CardTitle>
						<CopyButton
							value="Progress Comparison - Collapsed"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Collapsing minimizes the panel to its header (title + subtitle). Add{" "}
						<code className="wwc:text-xs">collapsedSummary</code> to also keep a summary row — the status chip on the
						left and the primary value on the right. The summary is the same for every variant; expanding reveals that
						variant's content — the <code className="wwc:text-xs">milestone</code> variant shows its stepper, while{" "}
						<code className="wwc:text-xs">progress</code> shows the status view. Toggle the chevron to expand.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:flex wwc:flex-wrap wwc:items-start wwc:gap-6">
						{/* Title-only */}
						<ProgressComparison
							variant="progress"
							title="Ground Floor"
							subtitle="Floor | HOUSE-12-F0"
							status={{label: "In Progress", color: "#1c60b7"}}
							primary={{label: "Approved", value: 67}}
							secondary={{label: "Planned", value: 71}}
							stats={STATS}
							collapsible
							defaultCollapsed
						/>
						{/* Summary with a milestone badge — expands to the stepper */}
						<ProgressComparison
							variant="milestone"
							title="Ground Floor"
							subtitle="Floor | HOUSE-12-F0"
							status={{label: "Milestone 65", color: "#38bdf8"}}
							primary={{label: "Approved", value: 67}}
							secondary={{label: "Planned", value: 71}}
							milestones={MILESTONES}
							stats={STATS}
							collapsible
							collapsedSummary
							defaultCollapsed
						/>
						{/* Summary with a status badge — expands to the status view */}
						<ProgressComparison
							variant="progress"
							title="Ground Floor"
							subtitle="Floor | HOUSE-12-F0"
							status={{label: "In Progress", color: "#1c60b7"}}
							primary={{label: "Approved", value: 67}}
							secondary={{label: "Planned", value: 71}}
							stats={STATS}
							collapsible
							collapsedSummary
							defaultCollapsed
						/>
					</div>
				</CardContent>
			</Card>

			{/* Preview variant */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Preview + action</CardTitle>
						<CopyButton
							value="Progress Comparison - Preview"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						<code className="wwc:text-xs">variant="preview"</code> swaps the status/stepper for an image preview and a
						full-width action button.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ProgressComparison
						className="wwc:max-w-[380px]"
						variant="preview"
						title="Ground Floor"
						subtitle="Floor | HOUSE-12-F0"
						image={<FloorPlan />}
						action={{label: "View Walkthrough", onClick: () => undefined}}
						primary={{label: "Approved", value: 67}}
						secondary={{label: "Planned", value: 71}}
						stats={STATS}
						collapsible
					/>
				</CardContent>
			</Card>

			{/* Expandable stats */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Expandable stats</CardTitle>
						<CopyButton
							value="Progress Comparison - Expandable stats"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						The stats grid grows to fit any number of stats — here six, laid out as a 2-column table with edge-to-edge
						dividers.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ProgressComparison
						className="wwc:max-w-[380px]"
						variant="progress"
						title="Ground Floor"
						subtitle="Floor | HOUSE-12-F0"
						status={{label: "In Progress", color: "#1c60b7"}}
						primary={{label: "Actual", value: 82}}
						secondary={{label: "Baseline", value: 75}}
						stats={[...STATS, {label: "CPI", value: "0.94", negative: true}, {label: "SPI", value: "1.02"}]}
					/>
				</CardContent>
			</Card>

			{/* In a modal */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>In a modal</CardTitle>
						<CopyButton
							value="Progress Comparison - In a modal"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Drop the panel into a Dialog. The header collapse button closes the modal.</CardDescription>
				</CardHeader>
				<CardContent>
					<Dialog open={open} onOpenChange={setOpen}>
						<DialogTrigger asChild>
							<Button>Open comparison</Button>
						</DialogTrigger>
						<DialogContent className="wwc:max-w-[380px] wwc:border-0 wwc:bg-transparent wwc:p-0 wwc:shadow-none wwc:[&>button]:hidden">
							<DialogTitle className="wwc:sr-only">Ground Floor progress comparison</DialogTitle>
							<DialogDescription className="wwc:sr-only">
								Approved vs. planned progress with milestones and cost stats.
							</DialogDescription>
							<ProgressComparison
								variant="milestone"
								title="Ground Floor"
								subtitle="Floor | HOUSE-12-F0"
								status={{label: "M65", color: "#38bdf8"}}
								primary={{label: "Approved", value: 67}}
								secondary={{label: "Planned", value: 71}}
								milestones={MILESTONES}
								stats={STATS}
								onClose={() => setOpen(false)}
							/>
						</DialogContent>
					</Dialog>
				</CardContent>
			</Card>
		</div>
	);
}
