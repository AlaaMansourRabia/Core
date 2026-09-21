import {AlignCenter, AlignLeft, AlignRight, Bold, Italic, Underline} from "lucide-react";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group";

export function ToggleGroupPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Toggle Group</h1>
					<CopyButton
						value="Toggle Group"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">A set of two-state buttons that can be toggled on or off.</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Single Selection</CardTitle>
						<CopyButton
							value="Toggle Group - Single Selection"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
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
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Multiple Selection</CardTitle>
						<CopyButton
							value="Toggle Group - Multiple Selection"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<ToggleGroup type="multiple">
						<ToggleGroupItem value="bold" aria-label="Toggle bold">
							<Bold className="wwc:h-4 wwc:w-4" />
						</ToggleGroupItem>
						<ToggleGroupItem value="italic" aria-label="Toggle italic">
							<Italic className="wwc:h-4 wwc:w-4" />
						</ToggleGroupItem>
						<ToggleGroupItem value="underline" aria-label="Toggle underline">
							<Underline className="wwc:h-4 wwc:w-4" />
						</ToggleGroupItem>
					</ToggleGroup>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Variants</CardTitle>
						<CopyButton
							value="Toggle Group - Variants"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent className="wwc:space-y-4">
					<div>
						<p className="wwc:text-sm wwc:text-muted-foreground wwc:mb-2">Default</p>
						<ToggleGroup type="single" variant="default">
							<ToggleGroupItem value="a">A</ToggleGroupItem>
							<ToggleGroupItem value="b">B</ToggleGroupItem>
							<ToggleGroupItem value="c">C</ToggleGroupItem>
						</ToggleGroup>
					</div>
					<div>
						<p className="wwc:text-sm wwc:text-muted-foreground wwc:mb-2">Outline</p>
						<ToggleGroup type="single" variant="outline">
							<ToggleGroupItem value="a">A</ToggleGroupItem>
							<ToggleGroupItem value="b">B</ToggleGroupItem>
							<ToggleGroupItem value="c">C</ToggleGroupItem>
						</ToggleGroup>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Sizes</CardTitle>
						<CopyButton
							value="Toggle Group - Sizes"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent className="wwc:space-y-4">
					<div>
						<p className="wwc:text-sm wwc:text-muted-foreground wwc:mb-2">Small</p>
						<ToggleGroup type="single" size="sm">
							<ToggleGroupItem value="a">A</ToggleGroupItem>
							<ToggleGroupItem value="b">B</ToggleGroupItem>
							<ToggleGroupItem value="c">C</ToggleGroupItem>
						</ToggleGroup>
					</div>
					<div>
						<p className="wwc:text-sm wwc:text-muted-foreground wwc:mb-2">Default</p>
						<ToggleGroup type="single" size="default">
							<ToggleGroupItem value="a">A</ToggleGroupItem>
							<ToggleGroupItem value="b">B</ToggleGroupItem>
							<ToggleGroupItem value="c">C</ToggleGroupItem>
						</ToggleGroup>
					</div>
					<div>
						<p className="wwc:text-sm wwc:text-muted-foreground wwc:mb-2">Large</p>
						<ToggleGroup type="single" size="lg">
							<ToggleGroupItem value="a">A</ToggleGroupItem>
							<ToggleGroupItem value="b">B</ToggleGroupItem>
							<ToggleGroupItem value="c">C</ToggleGroupItem>
						</ToggleGroup>
					</div>
				</CardContent>
			</Card>

			{/* API Reference */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Toggle Group - API Reference"
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
									{
										prop: "type",
										type: '"single" | "multiple"',
										def: "—",
										desc: "Whether single or multiple items can be pressed.",
									},
									{
										prop: "value",
										type: "string | string[]",
										def: "—",
										desc: "Controlled value of the pressed item(s).",
									},
									{
										prop: "defaultValue",
										type: "string | string[]",
										def: "—",
										desc: "Default pressed value (uncontrolled).",
									},
									{
										prop: "onValueChange",
										type: "(value: string | string[]) => void",
										def: "—",
										desc: "Callback when value changes.",
									},
									{
										prop: "variant",
										type: '"default" | "outline"',
										def: '"default"',
										desc: "Visual style variant applied to all items.",
									},
									{prop: "size", type: '"default" | "sm" | "lg"', def: '"default"', desc: "Size applied to all items."},
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
							value="Toggle Group - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

{/* Single selection */}
<ToggleGroup type="single">
  <ToggleGroupItem value="a">A</ToggleGroupItem>
  <ToggleGroupItem value="b">B</ToggleGroupItem>
  <ToggleGroupItem value="c">C</ToggleGroupItem>
</ToggleGroup>

{/* Multiple selection */}
<ToggleGroup type="multiple">
  <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
  <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
</ToggleGroup>`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
