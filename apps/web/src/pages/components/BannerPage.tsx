import {useState} from "react";

import {Banner} from "@/components/ui/banner";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";

export function BannerPage() {
	const [dismissed, setDismissed] = useState<Record<string, boolean>>({});

	const show = (id: string) => !dismissed[id];
	const dismiss = (id: string) => setDismissed((d) => ({...d, [id]: true}));
	const resetAll = () => setDismissed({});

	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Banner</h1>
					<CopyButton
						value="Banner"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Contextual alert banners for system insights, warnings, and action prompts.
				</p>
			</div>

			{/* Variants */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Variants</CardTitle>
						<CopyButton
							value="Banner - Variants"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Info, warning, danger, and success styles.</CardDescription>
				</CardHeader>
				<CardContent className="wwc:space-y-3">
					<Banner
						variant="info"
						title="Version 2.0 is now available!"
						description="Read the full release notes to learn about new features."
						onDismiss={() => {}}
					/>
					<Banner
						variant="warning"
						title="8 complaints are due within 4 hours"
						description="Immediate action required to avoid SLA breach."
						onDismiss={() => {}}
					/>
					<Banner
						variant="danger"
						title="No complaints are being processed"
						description="14 complaints are still NEW and none are in progress."
						onDismiss={() => {}}
					/>
					<Banner
						variant="success"
						title="All SLAs met this week"
						description="Great job! Resolution rate improved by 15%."
						onDismiss={() => {}}
					/>
				</CardContent>
			</Card>

			{/* Smart Insights */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Smart Insights</CardTitle>
						<CopyButton
							value="Banner - Smart Insights"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Real-world banner examples for operational dashboards.</CardDescription>
				</CardHeader>
				<CardContent className="wwc:space-y-3">
					{/* Flow Breakdown */}
					{show("flow") && (
						<Banner
							variant="danger"
							title="No complaints are being processed"
							description="14 complaints are still NEW and none are in progress."
							action={{label: "Assign Now", onClick: () => {}}}
							onDismiss={() => dismiss("flow")}
						/>
					)}

					{/* SLA Risk */}
					{show("sla") && (
						<Banner
							variant="danger"
							title="5 complaints have breached SLA"
							description="Immediate action required to avoid escalation."
							action={{label: "View Overdue", onClick: () => {}}}
							onDismiss={() => dismiss("sla")}
						/>
					)}

					{/* SLA Warning */}
					{show("sla-warn") && (
						<Banner
							variant="warning"
							title="8 complaints are due within 4 hours"
							description="Prioritize these complaints to meet SLA targets."
							action={{label: "View At Risk", onClick: () => {}}}
							onDismiss={() => dismiss("sla-warn")}
						/>
					)}

					{/* Slow Response */}
					{show("slow") && (
						<Banner
							variant="warning"
							title="Complaints are not being picked up quickly"
							description="Avg. response time: 18 hours (target: 4 hours)."
							onDismiss={() => dismiss("slow")}
						/>
					)}

					{/* Poor Resolution */}
					{show("reopen") && (
						<Banner
							variant="warning"
							title="High number of reopened complaints"
							description="6 complaints were reopened this week. Investigate root causes."
							action={{label: "View Reopened", onClick: () => {}}}
							onDismiss={() => dismiss("reopen")}
						/>
					)}

					{/* Ownership Problem */}
					{show("owner") && (
						<Banner
							variant="danger"
							title="No one owns 9 complaints"
							description="Assign responsible teams immediately."
							action={{label: "Assign Teams", onClick: () => {}}}
							onDismiss={() => dismiss("owner")}
						/>
					)}

					{/* Severity Risk */}
					{show("severity") && (
						<Banner
							variant="danger"
							title="5 high severity complaints are unresolved"
							description="These may impact worker safety or rights."
							action={{label: "View Critical", onClick: () => {}}}
							onDismiss={() => dismiss("severity")}
						/>
					)}

					{/* System Getting Worse */}
					{show("trend") && (
						<Banner
							variant="warning"
							title="Complaints increased by 60% this week"
							description="Investigate root cause and resource allocation."
							onDismiss={() => dismiss("trend")}
						/>
					)}

					{/* Worker Trust Risk */}
					{show("trust") && (
						<Banner
							variant="warning"
							title="Workers are not receiving updates"
							description="10 complaints have no activity for 3+ days."
							action={{label: "View Stale", onClick: () => {}}}
							onDismiss={() => dismiss("trust")}
						/>
					)}

					{Object.keys(dismissed).length > 0 && (
						<button type="button" onClick={resetAll} className="wwc:text-xs wwc:text-primary wwc:hover:underline">
							Reset all dismissed banners
						</button>
					)}
				</CardContent>
			</Card>

			{/* Combined Smart Insight */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Combined Smart Insight</CardTitle>
						<CopyButton
							value="Banner - Combined Smart Insight"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Executive-level banner combining multiple signals.</CardDescription>
				</CardHeader>
				<CardContent>
					<Banner
						variant="danger"
						title="System is at risk"
						items={["14 complaints are still NEW", "5 have breached SLA", "0 have been resolved"]}
						action={{label: "Take Action", onClick: () => {}}}
						onDismiss={() => {}}
					/>
				</CardContent>
			</Card>

			{/* With Action */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>With Action Button</CardTitle>
						<CopyButton
							value="Banner - With Action Button"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Banners with actionable buttons to resolve issues.</CardDescription>
				</CardHeader>
				<CardContent className="wwc:space-y-3">
					<Banner
						variant="danger"
						title="No one owns 9 complaints"
						description="Assign responsible teams immediately."
						action={{label: "Assign Teams", onClick: () => {}}}
						onDismiss={() => {}}
					/>
					<Banner
						variant="warning"
						title="Complaints are not being picked up quickly"
						description="Avg. response time: 18 hours (target: 4 hours)."
						action={{label: "Review Queue", onClick: () => {}}}
						onDismiss={() => {}}
					/>
					<Banner
						variant="info"
						title="New reporting features available"
						description="Export complaints data to CSV and PDF."
						action={{label: "Learn More", onClick: () => {}}}
						onDismiss={() => {}}
					/>
				</CardContent>
			</Card>

			{/* API Reference */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Banner - API Reference"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Props for the Banner component.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:overflow-x-auto">
						<table className="wwc:w-full wwc:text-[13px]">
							<thead>
								<tr className="wwc:border-b wwc:border-border">
									<th className="wwc:text-left wwc:py-3 wwc:pr-4 wwc:font-semibold wwc:text-foreground">Prop</th>
									<th className="wwc:text-left wwc:py-3 wwc:pr-4 wwc:font-semibold wwc:text-foreground">Type</th>
									<th className="wwc:text-left wwc:py-3 wwc:pr-4 wwc:font-semibold wwc:text-foreground">Default</th>
									<th className="wwc:text-left wwc:py-3 wwc:font-semibold wwc:text-foreground">Description</th>
								</tr>
							</thead>
							<tbody>
								{[
									{
										prop: "variant",
										type: '"info" | "warning" | "danger" | "success"',
										def: '"info"',
										desc: "Visual style of the banner.",
									},
									{prop: "title", type: "string", def: "—", desc: "Bold heading text."},
									{prop: "description", type: "string", def: "—", desc: "Supporting text below the title."},
									{prop: "items", type: "string[]", def: "—", desc: "Bullet list of items below the description."},
									{
										prop: "action",
										type: "{ label: string; onClick: () => void }",
										def: "—",
										desc: "Action button with label and handler.",
									},
									{
										prop: "onDismiss",
										type: "() => void",
										def: "—",
										desc: "Shows dismiss X icon and calls handler on click.",
									},
								].map((row) => (
									<tr key={row.prop} className="wwc:border-b wwc:border-border wwc:last:border-b-0">
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-primary wwc:font-medium wwc:whitespace-nowrap">
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

			{/* Usage */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Usage</CardTitle>
						<CopyButton
							value="Banner - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`import { Banner } from "@/components/ui/banner"

// Simple
<Banner
  variant="warning"
  title="8 complaints are due within 4 hours"
  description="Immediate action required."
  onDismiss={() => setShow(false)}
/>

// With action
<Banner
  variant="danger"
  title="No one owns 9 complaints"
  action={{ label: "Assign Teams", onClick: handleAssign }}
  onDismiss={() => setShow(false)}
/>

// With bullet items
<Banner
  variant="danger"
  title="System is at risk"
  items={["14 complaints are still NEW", "5 have breached SLA"]}
  action={{ label: "Take Action", onClick: handleAction }}
  onDismiss={() => setShow(false)}
/>`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
