import {ChevronsUpDown} from "lucide-react";
import {useState} from "react";

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible";
import {CopyButton} from "@/components/ui/copy-button";

export function CollapsiblePage() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Collapsible</h1>
					<CopyButton
						value="Collapsible"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">An interactive component which expands/collapses a panel.</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Default</CardTitle>
						<CopyButton
							value="Collapsible - Default"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<Collapsible open={isOpen} onOpenChange={setIsOpen} className="wwc:w-[350px] wwc:space-y-2">
						<div className="wwc:flex wwc:items-center wwc:justify-between wwc:space-x-4 wwc:px-4">
							<h4 className="wwc:text-sm wwc:font-semibold">@peduarte starred 3 repositories</h4>
							<CollapsibleTrigger asChild>
								<Button variant="ghost" size="sm">
									<ChevronsUpDown className="wwc:h-4 wwc:w-4" />
									<span className="wwc:sr-only">Toggle</span>
								</Button>
							</CollapsibleTrigger>
						</div>
						<div className="wwc:rounded-md wwc:border wwc:px-4 wwc:py-2 wwc:font-mono wwc:text-sm wwc:shadow-sm">
							@radix-ui/primitives
						</div>
						<CollapsibleContent className="wwc:space-y-2">
							<div className="wwc:rounded-md wwc:border wwc:px-4 wwc:py-2 wwc:font-mono wwc:text-sm wwc:shadow-sm">
								@radix-ui/colors
							</div>
							<div className="wwc:rounded-md wwc:border wwc:px-4 wwc:py-2 wwc:font-mono wwc:text-sm wwc:shadow-sm">
								@stitches/react
							</div>
						</CollapsibleContent>
					</Collapsible>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Collapsible - API Reference"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Extends Radix CollapsiblePrimitive.Root props.</CardDescription>
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
									{prop: "open", type: "boolean", def: "—", desc: "The controlled open state of the collapsible."},
									{
										prop: "defaultOpen",
										type: "boolean",
										def: "false",
										desc: "The default open state when uncontrolled.",
									},
									{
										prop: "onOpenChange",
										type: "(open: boolean) => void",
										def: "—",
										desc: "Callback when the open state changes.",
									},
									{prop: "disabled", type: "boolean", def: "false", desc: "Whether the collapsible is disabled."},
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
							value="Collapsible - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

<Collapsible>
  <CollapsibleTrigger>Toggle</CollapsibleTrigger>
  <CollapsibleContent>
    Collapsible content
  </CollapsibleContent>
</Collapsible>`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
