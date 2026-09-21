import {AlignCenter, AlignLeft, AlignRight, Bold, Italic, Underline} from "lucide-react";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {Toggle} from "@/components/ui/toggle";
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group";

export function TogglePage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Toggle</h1>
					<CopyButton
						value="Toggle"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">A two-state button that can be either on or off.</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Default</CardTitle>
						<CopyButton
							value="Toggle - Default"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<Toggle aria-label="Toggle bold">
						<Bold className="wwc:h-4 wwc:w-4" />
					</Toggle>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Variants</CardTitle>
						<CopyButton
							value="Toggle - Variants"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<div className="wwc:flex wwc:gap-4">
						<Toggle variant="default" aria-label="Toggle">
							<Bold className="wwc:h-4 wwc:w-4" />
						</Toggle>
						<Toggle variant="outline" aria-label="Toggle">
							<Italic className="wwc:h-4 wwc:w-4" />
						</Toggle>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Sizes</CardTitle>
						<CopyButton
							value="Toggle - Sizes"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<div className="wwc:flex wwc:items-center wwc:gap-4">
						<Toggle size="sm" aria-label="Toggle">
							<Bold className="wwc:h-4 wwc:w-4" />
						</Toggle>
						<Toggle size="default" aria-label="Toggle">
							<Bold className="wwc:h-4 wwc:w-4" />
						</Toggle>
						<Toggle size="lg" aria-label="Toggle">
							<Bold className="wwc:h-4 wwc:w-4" />
						</Toggle>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Toggle Group</CardTitle>
						<CopyButton
							value="Toggle - Toggle Group"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<div className="wwc:space-y-4">
						<div>
							<p className="wwc:text-sm wwc:text-muted-foreground wwc:mb-2">Single selection</p>
							<ToggleGroup type="single">
								<ToggleGroupItem value="left" aria-label="Align left">
									<AlignLeft className="wwc:h-4 wwc:w-4" />
								</ToggleGroupItem>
								<ToggleGroupItem value="center" aria-label="Align center">
									<AlignCenter className="wwc:h-4 wwc:w-4" />
								</ToggleGroupItem>
								<ToggleGroupItem value="right" aria-label="Align right">
									<AlignRight className="wwc:h-4 wwc:w-4" />
								</ToggleGroupItem>
							</ToggleGroup>
						</div>
						<div>
							<p className="wwc:text-sm wwc:text-muted-foreground wwc:mb-2">Multiple selection</p>
							<ToggleGroup type="multiple">
								<ToggleGroupItem value="bold" aria-label="Bold">
									<Bold className="wwc:h-4 wwc:w-4" />
								</ToggleGroupItem>
								<ToggleGroupItem value="italic" aria-label="Italic">
									<Italic className="wwc:h-4 wwc:w-4" />
								</ToggleGroupItem>
								<ToggleGroupItem value="underline" aria-label="Underline">
									<Underline className="wwc:h-4 wwc:w-4" />
								</ToggleGroupItem>
							</ToggleGroup>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* API Reference */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Toggle - API Reference"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Extends native{" "}
						<code className="wwc:text-[13px] wwc:bg-muted wwc:px-1.5 wwc:py-0.5 wwc:rounded">{"<button>"}</code> HTML
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
									{prop: "variant", type: '"default" | "outline"', def: '"default"', desc: "Visual style variant."},
									{prop: "size", type: '"default" | "sm" | "lg"', def: '"default"', desc: "Size of the toggle button."},
									{prop: "pressed", type: "boolean", def: "—", desc: "Controlled pressed state."},
									{
										prop: "defaultPressed",
										type: "boolean",
										def: "false",
										desc: "Default pressed state (uncontrolled).",
									},
									{
										prop: "onPressedChange",
										type: "(pressed: boolean) => void",
										def: "—",
										desc: "Callback when pressed state changes.",
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

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Usage</CardTitle>
						<CopyButton
							value="Toggle - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`import { Toggle } from "@/components/ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

<Toggle aria-label="Toggle bold">
  <Bold className="wwc:h-4 wwc:w-4" />
</Toggle>

<ToggleGroup type="single">
  <ToggleGroupItem value="a">A</ToggleGroupItem>
  <ToggleGroupItem value="b">B</ToggleGroupItem>
</ToggleGroup>`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
