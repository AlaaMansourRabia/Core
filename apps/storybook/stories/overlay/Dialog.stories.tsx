import type {Meta, StoryObj} from "storybook/internal/types";

import {Badge} from "@core/core-ui/badge";
import {Button} from "@core/core-ui/button";
import {Card} from "@core/core-ui/card";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@core/core-ui/collapsible";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@core/core-ui/dialog";
import {RadioGroup, RadioGroupItem} from "@core/core-ui/radio-group";
import {ScrollArea} from "@core/core-ui/scroll-area";
import {SearchFilterBar} from "@core/core-ui/search-filter-bar";
import {Separator} from "@core/core-ui/separator";
import {cn} from "@core/core-utils";
import {ArrowLeft, ArrowUpRight, ChevronDown, ChevronRight} from "lucide-react";
import {useMemo, useState} from "react";
import {expect, screen, userEvent, waitFor, within} from "storybook/test";

const meta = {
	title: "Components/Overlay/Dialog",
	component: Dialog,
	tags: ["autodocs"],
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline">Open Dialog</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Dialog Title</DialogTitle>
					<DialogDescription>
						This is a dialog description. It provides additional context about the dialog content.
					</DialogDescription>
				</DialogHeader>
				<div className="wwc:py-4">
					<p className="wwc:text-sm wwc:text-muted-foreground">Dialog body content goes here.</p>
				</div>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Cancel</Button>
					</DialogClose>
					<Button>Save Changes</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	),
};

/**
 * `variant="stacked"` — the pre-0.3 header, restored as a choice rather than a consumer override
 * ([#248](https://github.com/core/Core/issues/248)).
 *
 * Title over description, no band and no rule; the close button insets, the footer drops its strip
 * and keeps full-size buttons, and the content is padded as one block. Right for a short dialog that
 * is a sentence and two buttons rather than a panel.
 *
 * It is ONE prop on `DialogContent`, not three: the header, the footer, the close button and the
 * body padding all read it from context, so they cannot drift apart. `DialogHeader` and
 * `DialogFooter` each take their own `variant` for the odd case that needs to override it.
 *
 * `banded` — the story above — stays the default, because the band is a system decision rather than
 * a dialog one: it is deliberately the same 40px `bg-muted` strip that `WidgetCardHeader` and
 * `TableHeader` draw, and flipping it would leave dialogs as the only unbanded header in the library.
 */
export const Stacked: Story = {
	render: () => (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline">Open stacked dialog</Button>
			</DialogTrigger>
			<DialogContent variant="stacked">
				<DialogHeader>
					<DialogTitle>Add certificate</DialogTitle>
					<DialogDescription>Record the certificate name, type, dates and supporting document.</DialogDescription>
				</DialogHeader>
				<p className="wwc:text-sm wwc:text-muted-foreground">Dialog body content goes here.</p>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Cancel</Button>
					</DialogClose>
					<Button>Save</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	),
};

export const WithForm: Story = {
	render: () => (
		<Dialog>
			<DialogTrigger asChild>
				<Button>Edit Profile</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Profile</DialogTitle>
					<DialogDescription>Make changes to your profile here. Click save when you are done.</DialogDescription>
				</DialogHeader>
				<div className="wwc:grid wwc:gap-4 wwc:py-4">
					<div className="wwc:grid wwc:grid-cols-4 wwc:items-center wwc:gap-4">
						<label htmlFor="name" className="wwc:text-right wwc:text-sm wwc:font-medium">
							Name
						</label>
						<input
							id="name"
							defaultValue="John Doe"
							className="wwc:col-span-3 wwc:rounded-md wwc:border wwc:px-3 wwc:py-2 wwc:text-sm"
						/>
					</div>
					<div className="wwc:grid wwc:grid-cols-4 wwc:items-center wwc:gap-4">
						<label htmlFor="username" className="wwc:text-right wwc:text-sm wwc:font-medium">
							Username
						</label>
						<input
							id="username"
							defaultValue="@johndoe"
							className="wwc:col-span-3 wwc:rounded-md wwc:border wwc:px-3 wwc:py-2 wwc:text-sm"
						/>
					</div>
				</div>
				<DialogFooter>
					<Button>Save Changes</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	),
};

export const WithoutDescription: Story = {
	render: () => (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline">Open</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Are you sure?</DialogTitle>
				</DialogHeader>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">No</Button>
					</DialogClose>
					<Button>Yes</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	),
};

export const OpenCloseInteraction: Story = {
	render: () => (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline">Open Dialog</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Test Dialog</DialogTitle>
					<DialogDescription>Testing open and close.</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Cancel</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	),
	play: async ({canvasElement}) => {
		const canvas = within(canvasElement);

		const trigger = canvas.getByRole("button", {name: /open dialog/i});
		await userEvent.click(trigger);

		const dialog = await screen.findByRole("dialog");
		await waitFor(() => expect(dialog).toBeVisible());

		const cancelButton = within(dialog).getByRole("button", {name: /cancel/i});
		await userEvent.click(cancelButton);
	},
};

// ─── Template Browser ────────────────────────────────────────────────────────

interface TemplateOperation {
	id: string;
	code: string;
	name: string;
}

interface TemplateGroup {
	id: string;
	title: string;
	operations: TemplateOperation[];
}

const buildOps = (prefix: string, name: string, count: number): TemplateOperation[] =>
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

function TemplateBrowserDialog({objectCount = 1}: {objectCount?: number}) {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");
	const [selectedId, setSelectedId] = useState<string>("alu-window");
	const [expandedId, setExpandedId] = useState<string | null>("alu-window");

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) return templateGroups;
		return templateGroups.filter((g) => g.title.toLowerCase().includes(q));
	}, [search]);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>Browse templates</Button>
			</DialogTrigger>
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
					<Button className="wwc:w-full" disabled={!selectedId} onClick={() => setOpen(false)}>
						Assign to {objectCount} object{objectCount === 1 ? "" : "s"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export const TemplateBrowser: Story = {
	render: () => <TemplateBrowserDialog objectCount={1} />,
	parameters: {
		docs: {
			description: {
				story:
					"Real-world dialog composition: Dialog hosts a search-and-select UI built from `SearchFilterBar`, `ScrollArea`, `RadioGroup`, and a list of `Card` + `Collapsible` rows. The selected card uses the attachment-chip fill (`bg-muted/50`) with a darker outline.",
			},
		},
	},
};

// ─── Template Gallery (search → cards → detail with back) ─────────────────────

type GalleryTemplate = {
	id: string;
	title: string;
	description: string;
	overview: string;
	uses: string[];
	gradient: string;
	tag?: string;
};

const GALLERY_TEMPLATES: GalleryTemplate[] = [
	{
		id: "cop",
		title: "Build a common operating picture with geospatial data",
		description:
			"A Common Operating Picture provides a shared, real-time view of a situation that can improve coordination.",
		overview:
			"A Common Operating Picture (COP) brings live geospatial data, alerts, and key metrics into a single shared view so distributed teams can coordinate from the same source of truth.",
		uses: [
			"Monitor assets and incidents on a live map",
			"Surface alerts alongside spatial context",
			"Coordinate field and operations teams",
		],
		gradient: "wwc:from-slate-700 wwc:to-slate-900",
		tag: "Geospatial",
	},
	{
		id: "vega",
		title: "Build Vega charts in Workshop",
		description: "A reference module for building your own Vega chart visualizations in Workshop.",
		overview:
			"A comprehensive module designed to help users create and customize Vega chart widgets. It serves as a reference for building your own visualizations, offering a variety of pre-configured Vega chart examples.",
		uses: [
			"Explore different Vega chart configurations and their applications",
			"Use the pre-configured examples as a starting point",
			"Customize bar, line, scatter, donut, radar, and box plots",
		],
		gradient: "wwc:from-sky-100 wwc:to-indigo-200",
		tag: "Charts",
	},
	{
		id: "objview",
		title: "Building a data-rich custom object view",
		description: "Learn how to leverage the Object View Editor to create data-rich content for full and panel views.",
		overview:
			"Use the Object View Editor to compose data-rich layouts that work across both full-page and side-panel contexts, combining metrics, tables, and related objects.",
		uses: [
			"Design full and panel object views",
			"Combine metrics, tables, and related objects",
			"Reuse a single layout across contexts",
		],
		gradient: "wwc:from-violet-200 wwc:to-indigo-300",
		tag: "Object View",
	},
	{
		id: "loop",
		title: "Bulk edit Object Sets with Workshop's Loop layout",
		description: "Enable object multi-select in the Workshop loop layout to bulk-edit collections more thoroughly.",
		overview:
			"The Loop layout iterates over an object set and renders a widget per object. Pair it with multi-select to bulk-edit large collections without leaving the page.",
		uses: ["Render a widget per object in a set", "Multi-select and bulk-edit collections", "Keep edits in context"],
		gradient: "wwc:from-zinc-100 wwc:to-zinc-300",
	},
	{
		id: "cond",
		title: "Conditional Displays in Workshop",
		description: "This example demonstrates how you can implement conditional notices and banners in your app.",
		overview:
			"Common patterns for drawing user attention to notices and conditions: banner sections, menu-bar buttons, and conditionally-displayed callouts driven by the application's state.",
		uses: [
			"Show conditional banners and notices",
			"Highlight conditions with menu-bar buttons",
			"Guide users to resolve issues",
		],
		gradient: "wwc:from-blue-100 wwc:to-blue-300",
	},
	{
		id: "layout",
		title: "Configure layouts for optimal visual impact in Workshop",
		description: "Explore guided layout configurations for Workshop modules to maximize clarity and visual impact.",
		overview:
			"A guided tour of layout configurations — column splits, fixed regions, and responsive behavior — to make Workshop modules read clearly at any size.",
		uses: ["Compare column and fixed layouts", "Tune responsive behavior", "Maximize clarity and visual impact"],
		gradient: "wwc:from-indigo-100 wwc:to-blue-300",
	},
];

function GalleryTemplateCard({tpl, onClick}: {tpl: GalleryTemplate; onClick: () => void}) {
	return (
		<Card
			role="button"
			tabIndex={0}
			onClick={onClick}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					onClick();
				}
			}}
			className="wwc:flex wwc:flex-col wwc:overflow-hidden wwc:cursor-pointer wwc:transition-colors wwc:hover:border-foreground/30 wwc:hover:bg-accent/30 wwc:focus-visible:outline-none wwc:focus-visible:ring-2 wwc:focus-visible:ring-ring"
		>
			<div className={cn("wwc:relative wwc:aspect-[16/10] wwc:w-full wwc:bg-gradient-to-br", tpl.gradient)}>
				{tpl.tag && (
					<Badge variant="secondary" className="wwc:absolute wwc:left-2 wwc:top-2 wwc:text-[10px]">
						{tpl.tag}
					</Badge>
				)}
			</div>
			<div className="wwc:flex wwc:flex-col wwc:gap-1.5 wwc:p-4">
				<h3 className="wwc:text-[15px] wwc:font-semibold wwc:leading-snug wwc:line-clamp-2">{tpl.title}</h3>
				<p className="wwc:text-[13px] wwc:text-muted-foreground wwc:line-clamp-2">{tpl.description}</p>
			</div>
		</Card>
	);
}

function GalleryListView({
	query,
	onQueryChange,
	items,
	onSelect,
}: {
	query: string;
	onQueryChange: (q: string) => void;
	items: GalleryTemplate[];
	onSelect: (t: GalleryTemplate) => void;
}) {
	return (
		<div className="wwc:flex wwc:h-full wwc:min-h-0 wwc:flex-col">
			<SearchFilterBar
				search={query}
				onSearchChange={onQueryChange}
				searchPlaceholder="Search examples and templates…"
				trailing={<div aria-hidden className="wwc:w-6" />}
			/>
			<ScrollArea className="wwc:min-h-0 wwc:flex-1">
				{items.length === 0 ? (
					<div className="wwc:flex wwc:flex-col wwc:items-center wwc:justify-center wwc:gap-1 wwc:px-6 wwc:py-16 wwc:text-center">
						<p className="wwc:text-sm wwc:font-medium wwc:text-muted-foreground">No results for "{query}"</p>
						<p className="wwc:text-[12px] wwc:text-muted-foreground/70">Try a different example or template name.</p>
					</div>
				) : (
					<div className="wwc:grid wwc:grid-cols-1 wwc:gap-4 wwc:p-4 wwc:sm:grid-cols-2 wwc:lg:grid-cols-3">
						{items.map((t) => (
							<GalleryTemplateCard key={t.id} tpl={t} onClick={() => onSelect(t)} />
						))}
					</div>
				)}
			</ScrollArea>
		</div>
	);
}

function GalleryDetailView({tpl, onBack}: {tpl: GalleryTemplate; onBack: () => void}) {
	return (
		<div className="wwc:flex wwc:h-full wwc:min-h-0 wwc:flex-col">
			<div className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-3 wwc:border-b wwc:px-4 wwc:py-3 wwc:pr-12">
				<Button variant="ghost" icon aria-label="Back to templates" onClick={onBack}>
					<ArrowLeft className="wwc:h-4 wwc:w-4" />
				</Button>
				<a
					href="#"
					onClick={(e) => e.preventDefault()}
					className="wwc:inline-flex wwc:items-center wwc:gap-1 wwc:text-sm wwc:font-medium wwc:text-primary wwc:hover:underline"
				>
					Explore all examples
					<ArrowUpRight className="wwc:h-4 wwc:w-4" />
				</a>
			</div>
			<ScrollArea className="wwc:min-h-0 wwc:flex-1">
				<div className="wwc:space-y-8 wwc:p-6">
					<div className="wwc:grid wwc:grid-cols-1 wwc:items-start wwc:gap-6 wwc:md:grid-cols-2">
						<div className="wwc:space-y-4">
							<h2 className="wwc:text-2xl wwc:font-bold wwc:leading-tight">{tpl.title}</h2>
							<p className="wwc:text-[15px] wwc:text-muted-foreground">{tpl.description}</p>
							<div className="wwc:flex wwc:max-w-[260px] wwc:flex-col wwc:gap-2 wwc:pt-2">
								<Button>Install</Button>
								<Button variant="outline">
									Open in Examples
									<ArrowUpRight className="wwc:h-4 wwc:w-4" />
								</Button>
							</div>
						</div>
						<div
							className={cn(
								"wwc:aspect-[16/10] wwc:w-full wwc:rounded-lg wwc:border wwc:bg-gradient-to-br",
								tpl.gradient,
							)}
						/>
					</div>

					<Separator />

					<div className="wwc:space-y-2">
						<h3 className="wwc:text-lg wwc:font-semibold">Overview</h3>
						<p className="wwc:text-[15px] wwc:leading-relaxed wwc:text-muted-foreground">{tpl.overview}</p>
					</div>

					<div className="wwc:space-y-2">
						<h3 className="wwc:text-lg wwc:font-semibold">Example Uses</h3>
						<ul className="wwc:list-disc wwc:space-y-1.5 wwc:pl-5 wwc:text-[15px] wwc:text-muted-foreground">
							{tpl.uses.map((u) => (
								<li key={u}>{u}</li>
							))}
						</ul>
					</div>
				</div>
			</ScrollArea>
		</div>
	);
}

function TemplateGalleryDialog({defaultOpen = false}: {defaultOpen?: boolean}) {
	const [open, setOpen] = useState(defaultOpen);
	const [query, setQuery] = useState("");
	const [selected, setSelected] = useState<GalleryTemplate | null>(null);

	const q = query.trim().toLowerCase();
	const items = q
		? GALLERY_TEMPLATES.filter((t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
		: GALLERY_TEMPLATES;

	return (
		<>
			<Button onClick={() => setOpen(true)}>Browse examples and templates</Button>
			<Dialog
				open={open}
				onOpenChange={(next) => {
					setOpen(next);
					if (!next) {
						setSelected(null);
						setQuery("");
					}
				}}
			>
				<DialogContent className="wwc:flex wwc:h-[82vh] wwc:w-[92vw] wwc:max-w-[1080px] wwc:flex-col wwc:gap-0 wwc:overflow-hidden wwc:p-0">
					<DialogTitle className="wwc:sr-only">{selected ? selected.title : "Examples and templates"}</DialogTitle>
					{selected ? (
						<GalleryDetailView tpl={selected} onBack={() => setSelected(null)} />
					) : (
						<GalleryListView query={query} onQueryChange={setQuery} items={items} onSelect={setSelected} />
					)}
				</DialogContent>
			</Dialog>
		</>
	);
}

export const TemplateGallery: Story = {
	render: () => <TemplateGalleryDialog defaultOpen />,
	parameters: {
		docs: {
			description: {
				story:
					"A searchable template/example gallery in a Dialog. The header uses `SearchFilterBar` to filter a grid of template cards; clicking a card swaps the same dialog to a detail view (title, Install / Open actions, hero, Overview, Example Uses) with a back button.",
			},
		},
	},
};
