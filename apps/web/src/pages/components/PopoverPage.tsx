import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";

export function PopoverPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Popover</h1>
					<CopyButton
						value="Popover"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">Displays rich content in a portal, triggered by a button.</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Default</CardTitle>
						<CopyButton
							value="Popover - Default"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<Popover>
						<PopoverTrigger asChild>
							<Button variant="outline">Open popover</Button>
						</PopoverTrigger>
						<PopoverContent className="wwc:w-80">
							<div className="wwc:grid wwc:gap-4">
								<div className="wwc:space-y-2">
									<h4 className="wwc:font-medium wwc:leading-none">Dimensions</h4>
									<p className="wwc:text-sm wwc:text-muted-foreground">Set the dimensions for the layer.</p>
								</div>
								<div className="wwc:grid wwc:gap-2">
									<div className="wwc:grid wwc:grid-cols-3 wwc:items-center wwc:gap-4">
										<Label htmlFor="width">Width</Label>
										<Input id="width" defaultValue="100%" className="wwc:col-span-2 wwc:h-8" />
									</div>
									<div className="wwc:grid wwc:grid-cols-3 wwc:items-center wwc:gap-4">
										<Label htmlFor="maxWidth">Max. width</Label>
										<Input id="maxWidth" defaultValue="300px" className="wwc:col-span-2 wwc:h-8" />
									</div>
									<div className="wwc:grid wwc:grid-cols-3 wwc:items-center wwc:gap-4">
										<Label htmlFor="height">Height</Label>
										<Input id="height" defaultValue="25px" className="wwc:col-span-2 wwc:h-8" />
									</div>
								</div>
							</div>
						</PopoverContent>
					</Popover>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Popover - API Reference"
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
									{prop: "open", type: "boolean", def: "-", desc: "Controlled open state of the popover."},
									{prop: "defaultOpen", type: "boolean", def: "false", desc: "Uncontrolled default open state."},
									{
										prop: "onOpenChange",
										type: "(open: boolean) => void",
										def: "-",
										desc: "Callback when the open state changes.",
									},
									{
										prop: "align",
										type: '"start" | "center" | "end"',
										def: '"start"',
										desc: "Preferred alignment of the content against the trigger.",
									},
									{prop: "sideOffset", type: "number", def: "4", desc: "Distance in pixels from the trigger."},
									{prop: "className", type: "string", def: "-", desc: "Additional CSS classes for PopoverContent."},
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
							value="Popover - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

<Popover>
  <PopoverTrigger>Open</PopoverTrigger>
  <PopoverContent>
    Content here
  </PopoverContent>
</Popover>`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
