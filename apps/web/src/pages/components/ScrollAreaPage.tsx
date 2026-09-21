import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Separator} from "@/components/ui/separator";

const tags = Array.from({length: 50}).map((_, i, a) => `Tag ${a.length - i}`);

export function ScrollAreaPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Scroll Area</h1>
					<CopyButton
						value="Scroll Area"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Augments native scroll functionality for custom, cross-browser styling.
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Vertical Scroll</CardTitle>
						<CopyButton
							value="Scroll Area - Vertical Scroll"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<ScrollArea className="wwc:h-72 wwc:w-48 wwc:rounded-md wwc:border">
						<div className="wwc:p-4">
							<h4 className="wwc:mb-4 wwc:text-sm wwc:font-medium wwc:leading-none">Tags</h4>
							{tags.map((tag) => (
								<div key={tag}>
									<div className="wwc:text-sm">{tag}</div>
									<Separator className="wwc:my-2" />
								</div>
							))}
						</div>
					</ScrollArea>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Horizontal Scroll</CardTitle>
						<CopyButton
							value="Scroll Area - Horizontal Scroll"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<ScrollArea className="wwc:w-96 wwc:whitespace-nowrap wwc:rounded-md wwc:border">
						<div className="wwc:flex wwc:w-max wwc:space-x-4 wwc:p-4">
							{Array.from({length: 10}).map((_, i) => (
								<div
									key={i}
									className="wwc:w-32 wwc:h-32 wwc:rounded-md wwc:bg-muted wwc:flex wwc:items-center wwc:justify-center wwc:shrink-0"
								>
									Item {i + 1}
								</div>
							))}
						</div>
					</ScrollArea>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Scroll Area - API Reference"
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
										type: '"auto" | "always" | "scroll" | "hover"',
										def: '"hover"',
										desc: "Scrollbar visibility behavior.",
									},
									{
										prop: "scrollHideDelay",
										type: "number",
										def: "600",
										desc: 'Delay in ms before hiding scrollbars (for type "scroll" or "hover").',
									},
									{
										prop: "orientation",
										type: '"vertical" | "horizontal"',
										def: '"vertical"',
										desc: "The orientation of the scrollbar (ScrollBar).",
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
							value="Scroll Area - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`import { ScrollArea } from "@/components/ui/scroll-area"

<ScrollArea className="wwc:h-72 wwc:w-48 wwc:rounded-md wwc:border">
  <div className="wwc:p-4">
    {items.map((item) => (
      <div key={item}>{item}</div>
    ))}
  </div>
</ScrollArea>`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
