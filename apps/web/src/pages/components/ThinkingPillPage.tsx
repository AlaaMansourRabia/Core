import {LineChart, Search, Sparkles} from "lucide-react";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {ThinkingPill} from "@/components/ui/thinking-pill";

export function ThinkingPillPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Thinking Pill</h1>
					<CopyButton
						value="Thinking Pill"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Inline indicator that an agent is actively processing before any output has appeared. Mount/unmount, don't
					toggle. Lifetime = request started → first byte/event received.
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Default</CardTitle>
						<CopyButton
							value="Thinking Pill - Default"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Default label is "Thinking". The default icon is a Brain glyph.</CardDescription>
				</CardHeader>
				<CardContent>
					<ThinkingPill />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Activity Variants</CardTitle>
						<CopyButton
							value="Thinking Pill - Activity Variants"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Override the <code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">label</code> and{" "}
						<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">icon</code> props to match the activity.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-3">
						<ThinkingPill />
						<ThinkingPill label="Generating" icon={<Sparkles className="wwc:h-3.5 wwc:w-3.5" />} />
						<ThinkingPill label="Researching" icon={<Search className="wwc:h-3.5 wwc:w-3.5" />} />
						<ThinkingPill label="Analysing" icon={<LineChart className="wwc:h-3.5 wwc:w-3.5" />} />
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Thinking Pill - API Reference"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
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
									{prop: "label", type: "string", def: '"Thinking"', desc: "Text to show next to the icon."},
									{prop: "icon", type: "ReactNode", def: "<Brain />", desc: "Leading icon."},
									{prop: "className", type: "string", def: "—", desc: "Optional class to merge with the pill."},
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
		</div>
	);
}
