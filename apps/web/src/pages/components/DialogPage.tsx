import {ChevronDown, ChevronRight} from "lucide-react";
import {useMemo, useState} from "react";

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible";
import {CopyButton} from "@/components/ui/copy-button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {ScrollArea} from "@/components/ui/scroll-area";
import {SearchFilterBar} from "@/components/ui/search-filter-bar";
import {Separator} from "@/components/ui/separator";
import {cn} from "@/lib/utils";

interface Operation {
	id: string;
	code: string;
	name: string;
}

interface TemplateGroup {
	id: string;
	title: string;
	operations: Operation[];
}

const buildOps = (prefix: string, name: string, count: number): Operation[] =>
	Array.from({length: count}, (_, i) => ({
		id: `${prefix}-${i}`,
		code: `${prefix}-${String(i + 1).padStart(3, "0")}`,
		name,
	}));

const templateGroups: TemplateGroup[] = [
	{
		id: "air-outlets",
		title: "Air outlets / Grilles",
		operations: buildOps("UPL-AIR-OUTLETS", "Air outlets / Grilles", 20),
	},
	{
		id: "alu-doors",
		title: "Aluminium / Wooden Doors",
		operations: buildOps("UPL-ALU-DOORS", "Aluminium / Wooden Doors", 60),
	},
	{
		id: "alu-window",
		title: "Aluminium Window & Curtain Wall",
		operations: buildOps("UPL-ALUMINIUM-WINDOW-CURTAIN-WALL", "Aluminium Window & Curtain Wall", 6),
	},
	{id: "anti-termite", title: "Anti-termite Works", operations: buildOps("UPL-ANTI-TERMITE", "Anti-termite Works", 6)},
	{
		id: "artificial-grass",
		title: "Artificial Grass",
		operations: buildOps("UPL-ARTIFICIAL-GRASS", "Artificial Grass", 2),
	},
	{id: "backfilling", title: "Backfilling Work", operations: buildOps("UPL-BACKFILLING", "Backfilling Work", 6)},
	{
		id: "backfilling-foundation",
		title: "Backfilling For Foundation",
		operations: buildOps("UPL-BACKFILL-FND", "Backfilling For Foundation", 1),
	},
];

function TemplateBrowserDialog({trigger, objectCount = 1}: {trigger: React.ReactNode; objectCount?: number}) {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");
	const [selectedId, setSelectedId] = useState<string>("alu-window");
	const [expandedId, setExpandedId] = useState<string | null>("alu-window");

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) return templateGroups;
		return templateGroups.filter((g) => g.title.toLowerCase().includes(q));
	}, [search]);

	const handleAssign = () => {
		setOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent className="wwc:max-w-md wwc:gap-0 wwc:p-0">
				<DialogHeader className="wwc:flex-row wwc:items-center wwc:justify-between wwc:space-y-0 wwc:border-b wwc:px-4 wwc:py-3">
					<DialogTitle className="wwc:text-sm wwc:font-semibold">Template Browser</DialogTitle>
				</DialogHeader>

				<SearchFilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Search templates..." />

				<ScrollArea className="wwc:h-[440px] wwc:px-3 wwc:pt-3">
					<RadioGroup value={selectedId} onValueChange={setSelectedId} className="wwc:space-y-2 wwc:pb-3">
						{filtered.map((group) => {
							const isOpen = expandedId === group.id;
							const isSelected = selectedId === group.id;
							return (
								<Collapsible key={group.id} open={isOpen} onOpenChange={(o) => setExpandedId(o ? group.id : null)}>
									<Card
										className={cn(
											"wwc:p-0 wwc:shadow-none",
											isSelected ? "wwc:bg-muted/50 wwc:border-muted-foreground/40" : "wwc:bg-card",
										)}
									>
										<CollapsibleTrigger asChild>
											<button
												type="button"
												onClick={() => setSelectedId(group.id)}
												className="wwc:flex wwc:w-full wwc:items-center wwc:gap-3 wwc:rounded-xl wwc:px-3 wwc:py-3 wwc:text-left"
											>
												<RadioGroupItem
													value={group.id}
													className="wwc:shrink-0"
													onClick={(e) => e.stopPropagation()}
												/>
												<div className="wwc:flex-1">
													<div className="wwc:text-sm wwc:font-semibold wwc:text-foreground">{group.title}</div>
													<div className="wwc:text-xs wwc:text-muted-foreground">
														{group.operations.length} operations
													</div>
												</div>
												{isOpen ? (
													<ChevronDown className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
												) : (
													<ChevronRight className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
												)}
											</button>
										</CollapsibleTrigger>
										<CollapsibleContent>
											<Separator />
											<div className="wwc:grid wwc:grid-cols-2 wwc:gap-x-3 wwc:px-3 wwc:py-2 wwc:text-[10px] wwc:font-semibold wwc:uppercase wwc:tracking-wider wwc:text-muted-foreground">
												<span>Code</span>
												<span>Description</span>
											</div>
											<Separator />
											<div className="wwc:grid wwc:grid-cols-2 wwc:gap-x-3 wwc:gap-y-1 wwc:rounded-b-xl wwc:px-3 wwc:py-2">
												{group.operations.map((op) => (
													<div key={op.id} className="wwc:contents">
														<span className="wwc:truncate wwc:font-mono wwc:text-[11px] wwc:text-muted-foreground">
															{op.code}
														</span>
														<span className="wwc:truncate wwc:text-xs wwc:text-foreground">{op.name}</span>
													</div>
												))}
											</div>
										</CollapsibleContent>
									</Card>
								</Collapsible>
							);
						})}
						{filtered.length === 0 && (
							<div className="wwc:py-12 wwc:text-center wwc:text-sm wwc:text-muted-foreground">
								No templates match "{search}"
							</div>
						)}
					</RadioGroup>
				</ScrollArea>

				<DialogFooter className="wwc:border-t wwc:p-3 wwc:sm:flex-col wwc:sm:space-x-0">
					<Button className="wwc:w-full" disabled={!selectedId} onClick={handleAssign}>
						Assign to {objectCount} object{objectCount === 1 ? "" : "s"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export function DialogPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Dialog</h1>
					<CopyButton
						value="Dialog"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					A window overlaid on either the primary window or another dialog window, rendering the content underneath
					inert.
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Default</CardTitle>
						<CopyButton
							value="Dialog - Default"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<Dialog>
						<DialogTrigger asChild>
							<Button variant="outline">Open Dialog</Button>
						</DialogTrigger>
						<DialogContent className="wwc:sm:max-w-[425px]">
							<DialogHeader>
								<DialogTitle>Edit profile</DialogTitle>
								<DialogDescription>Make changes to your profile here. Click save when you're done.</DialogDescription>
							</DialogHeader>
							<div className="wwc:grid wwc:gap-4 wwc:py-4">
								<div className="wwc:grid wwc:grid-cols-4 wwc:items-center wwc:gap-4">
									<Label htmlFor="name" className="wwc:text-right">
										Name
									</Label>
									<Input id="name" defaultValue="John Doe" className="wwc:col-span-3" />
								</div>
								<div className="wwc:grid wwc:grid-cols-4 wwc:items-center wwc:gap-4">
									<Label htmlFor="username" className="wwc:text-right">
										Username
									</Label>
									<Input id="username" defaultValue="@johndoe" className="wwc:col-span-3" />
								</div>
							</div>
							<DialogFooter>
								<Button type="submit">Save changes</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Template Browser</CardTitle>
						<CopyButton
							value="Dialog - Template Browser"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Real-world dialog composition: Dialog hosts a search-and-select UI built from{" "}
						<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">SearchFilterBar</code>,{" "}
						<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">ScrollArea</code>,{" "}
						<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">RadioGroup</code>, and a list of{" "}
						<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">Card</code> +{" "}
						<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">Collapsible</code> rows. Selected card uses
						the attachment-chip fill (<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">bg-muted/50</code>
						) with a darker outline.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<TemplateBrowserDialog trigger={<Button>Browse templates</Button>} objectCount={1} />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Dialog - API Reference"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Extends Radix DialogPrimitive props. Key sub-component props listed below.</CardDescription>
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
									{prop: "open", type: "boolean", def: "—", desc: "The controlled open state of the dialog."},
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
									{
										prop: "modal",
										type: "boolean",
										def: "true",
										desc: "Whether the dialog is modal (blocks interaction with outside elements).",
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
							value="Dialog - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    Content here
  </DialogContent>
</Dialog>`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
