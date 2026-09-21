import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {Progress} from "@/components/ui/progress";

export function ProgressPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Progress</h1>
					<CopyButton
						value="Progress"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Displays an indicator showing the completion progress of a task.
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Default</CardTitle>
						<CopyButton
							value="Progress - Default"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<Progress value={33} className="wwc:w-full" />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Various Values</CardTitle>
						<CopyButton
							value="Progress - Various Values"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<div className="wwc:space-y-4">
						<div className="wwc:space-y-2">
							<div className="wwc:flex wwc:justify-between wwc:text-sm">
								<span>0%</span>
							</div>
							<Progress value={0} />
						</div>
						<div className="wwc:space-y-2">
							<div className="wwc:flex wwc:justify-between wwc:text-sm">
								<span>25%</span>
							</div>
							<Progress value={25} />
						</div>
						<div className="wwc:space-y-2">
							<div className="wwc:flex wwc:justify-between wwc:text-sm">
								<span>50%</span>
							</div>
							<Progress value={50} />
						</div>
						<div className="wwc:space-y-2">
							<div className="wwc:flex wwc:justify-between wwc:text-sm">
								<span>75%</span>
							</div>
							<Progress value={75} />
						</div>
						<div className="wwc:space-y-2">
							<div className="wwc:flex wwc:justify-between wwc:text-sm">
								<span>100%</span>
							</div>
							<Progress value={100} />
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Progress - API Reference"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Extends native{" "}
						<code className="wwc:text-[13px] wwc:bg-muted wwc:px-1.5 wwc:py-0.5 wwc:rounded">{"<div>"}</code> HTML
						attributes.
					</CardDescription>
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
									{prop: "value", type: "number | null", def: "0", desc: "The progress value (0 to max)."},
									{prop: "max", type: "number", def: "100", desc: "The maximum progress value."},
									{
										prop: "getValueLabel",
										type: "(value: number, max: number) => string",
										def: "-",
										desc: "Function to generate the accessibility label.",
									},
									{prop: "className", type: "string", def: "-", desc: "Additional CSS classes."},
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

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Usage</CardTitle>
						<CopyButton
							value="Progress - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`import { Progress } from "@/components/ui/progress"

<Progress value={33} />`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
