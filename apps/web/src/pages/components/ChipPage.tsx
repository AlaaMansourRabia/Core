import {AtSign, Calendar, FileSpreadsheet, FileText, MapPin, Star, Tag, X} from "lucide-react";
import {useState} from "react";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Chip} from "@/components/ui/chip";
import {CopyButton} from "@/components/ui/copy-button";

const initialFilters = [
	{label: "All", active: true},
	{label: "Active", active: false},
	{label: "Archived", active: false},
	{label: "Draft", active: false},
];

const initialAttachments = [
	{id: "a1", label: "Weekly progress report.pdf", icon: <FileText className="wwc:h-3 wwc:w-3" />},
	{id: "a2", label: "Project schedule", icon: <AtSign className="wwc:h-3 wwc:w-3" />},
	{id: "a3", label: "Cost budget Q3.xlsx", icon: <FileSpreadsheet className="wwc:h-3 wwc:w-3" />},
];

export function ChipPage() {
	const [filters, setFilters] = useState(initialFilters);
	const [tags, setTags] = useState<Set<string>>(new Set(["frontend", "design"]));
	const [attachments, setAttachments] = useState(initialAttachments);

	const toggleFilter = (i: number) => {
		setFilters((prev) => prev.map((f, idx) => (idx === i ? {...f, active: !f.active} : f)));
	};

	const toggleTag = (tag: string) => {
		setTags((prev) => {
			const next = new Set(prev);
			if (next.has(tag)) next.delete(tag);
			else next.add(tag);
			return next;
		});
	};

	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Chip</h1>
					<CopyButton
						value="Chip"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					A chip primitive with two variants:{" "}
					<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">filter</code> (pill-shaped toggleable,
					default) and <code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">attachment</code> (square-rounded
					static chip with optional remove). Used for filters, selectable categories, and displaying attached files /
					context items.
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Filter — Default</CardTitle>
						<CopyButton
							value="Chip - Filter — Default"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Single-select and multi-select chip groups.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2">
						{filters.map((filter, i) => (
							<Chip key={filter.label} pressed={filter.active} onPressedChange={() => toggleFilter(i)}>
								{filter.label}
							</Chip>
						))}
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Sizes</CardTitle>
						<CopyButton
							value="Chip - Sizes"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Three size variants: sm, default, lg.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2">
						<Chip size="sm" defaultPressed>
							Small
						</Chip>
						<Chip size="default" defaultPressed>
							Default
						</Chip>
						<Chip size="lg" defaultPressed>
							Large
						</Chip>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>States</CardTitle>
						<CopyButton
							value="Chip - States"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Unselected, selected, and disabled states.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2">
						<Chip>Unselected</Chip>
						<Chip defaultPressed>Selected</Chip>
						<Chip disabled>Disabled</Chip>
						<Chip defaultPressed disabled>
							Disabled selected
						</Chip>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Custom Leading Icon</CardTitle>
						<CopyButton
							value="Chip - Custom Leading Icon"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Override the default checkmark with any icon by passing a leadingIcon prop.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2">
						<Chip leadingIcon={<MapPin className="wwc:h-3.5 wwc:w-3.5" />} defaultPressed>
							Location
						</Chip>
						<Chip leadingIcon={<Calendar className="wwc:h-3.5 wwc:w-3.5" />}>Date</Chip>
						<Chip leadingIcon={<Star className="wwc:h-3.5 wwc:w-3.5" />} defaultPressed>
							Favorite
						</Chip>
						<Chip leadingIcon={<Tag className="wwc:h-3.5 wwc:w-3.5" />}>Tag</Chip>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>With Trailing Icon</CardTitle>
						<CopyButton
							value="Chip - With Trailing Icon"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Use trailingIcon for actions like "remove". Click chips to toggle selection state.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2">
						{["frontend", "backend", "design", "product", "qa"].map((tag) => (
							<Chip
								key={tag}
								pressed={tags.has(tag)}
								onPressedChange={() => toggleTag(tag)}
								trailingIcon={tags.has(tag) ? <X className="wwc:h-3.5 wwc:w-3.5" /> : undefined}
							>
								{tag}
							</Chip>
						))}
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>No Checkmark</CardTitle>
						<CopyButton
							value="Chip - No Checkmark"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Disable the default checkmark with showCheck=false.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2">
						<Chip showCheck={false} defaultPressed>
							Selected (no check)
						</Chip>
						<Chip showCheck={false}>Unselected</Chip>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Attachment — Default</CardTitle>
						<CopyButton
							value="Chip - Attachment — Default"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Static rounded-square chips for displaying attached files or context items. Pass{" "}
						<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">onRemove</code> to render a trailing X
						button.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2">
						{attachments.map((att) => (
							<Chip
								key={att.id}
								variant="attachment"
								leadingIcon={att.icon}
								onRemove={() => setAttachments((prev) => prev.filter((a) => a.id !== att.id))}
								removeLabel={`Remove ${att.label}`}
							>
								{att.label}
							</Chip>
						))}
						{attachments.length === 0 && (
							<button
								type="button"
								onClick={() => setAttachments(initialAttachments)}
								className="wwc:text-xs wwc:text-muted-foreground wwc:underline"
							>
								Reset
							</button>
						)}
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Attachment — Static (no remove)</CardTitle>
						<CopyButton
							value="Chip - Attachment — Static (no remove)"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Without onRemove, the chip is purely a label.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2">
						<Chip variant="attachment" leadingIcon={<FileText className="wwc:h-3 wwc:w-3" />}>
							spec.md
						</Chip>
						<Chip variant="attachment" leadingIcon={<AtSign className="wwc:h-3 wwc:w-3" />}>
							Project schedule
						</Chip>
						<Chip variant="attachment" leadingIcon={<FileSpreadsheet className="wwc:h-3 wwc:w-3" />}>
							budget.xlsx
						</Chip>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Attachment — Sizes</CardTitle>
						<CopyButton
							value="Chip - Attachment — Sizes"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>The same size scale as filter chips.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2">
						<Chip
							variant="attachment"
							size="sm"
							leadingIcon={<FileText className="wwc:h-3 wwc:w-3" />}
							onRemove={() => {}}
						>
							Small
						</Chip>
						<Chip variant="attachment" leadingIcon={<FileText className="wwc:h-3 wwc:w-3" />} onRemove={() => {}}>
							Default
						</Chip>
						<Chip
							variant="attachment"
							size="lg"
							leadingIcon={<FileText className="wwc:h-3 wwc:w-3" />}
							onRemove={() => {}}
						>
							Large
						</Chip>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Attachment — Hover preview</CardTitle>
						<CopyButton
							value="Chip - Attachment — Hover preview"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Pass <code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">preview</code> with{" "}
						<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">{'{ type: "image", src }'}</code> or{" "}
						<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">{'{ type: "custom", content }'}</code> to
						show a fixed-size preview when the user hovers the chip. All previews share the same h-32 container; images
						use object-cover to fill it.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2">
						<Chip
							variant="attachment"
							leadingIcon={<FileText className="wwc:h-3 wwc:w-3" />}
							preview={{
								type: "image",
								src: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=600&q=80",
								alt: "Architectural concrete building",
							}}
						>
							building-elevation.jpg
						</Chip>
						<Chip
							variant="attachment"
							leadingIcon={<FileText className="wwc:h-3 wwc:w-3" />}
							preview={{
								type: "image",
								src: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=600&q=80",
								alt: "Construction site overview",
							}}
						>
							site-overview.jpg
						</Chip>
						<Chip
							variant="attachment"
							leadingIcon={<FileSpreadsheet className="wwc:h-3 wwc:w-3" />}
							preview={{
								type: "custom",
								content: (
									<div className="wwc:flex wwc:flex-col wwc:gap-1 wwc:font-mono wwc:text-[10px] wwc:text-foreground">
										<span>Q3 Costs · 124 rows</span>
										<span className="wwc:text-muted-foreground">Labor · $1.2M</span>
										<span className="wwc:text-muted-foreground">Materials · $3.4M</span>
										<span className="wwc:text-muted-foreground">Equipment · $0.8M</span>
									</div>
								),
							}}
						>
							cost-budget-q3.xlsx
						</Chip>
						<Chip variant="attachment" leadingIcon={<FileText className="wwc:h-3 wwc:w-3" />}>
							no-preview.pdf
						</Chip>
					</div>
					<p className="wwc:mt-3 wwc:text-xs wwc:text-muted-foreground">
						Hover any chip to see its preview. The last chip has no preview prop, so no hover card appears.
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Chip - API Reference"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<div className="wwc:overflow-x-auto">
						<table className="wwc:w-full wwc:text-[13px]">
							<thead>
								<tr className="wwc:border-b wwc:border-border">
									<th className="wwc:py-3 wwc:pr-4 wwc:text-left wwc:font-semibold wwc:text-foreground">Prop</th>
									<th className="wwc:py-3 wwc:pr-4 wwc:text-left wwc:font-semibold wwc:text-foreground">Type</th>
									<th className="wwc:py-3 wwc:pr-4 wwc:text-left wwc:font-semibold wwc:text-foreground">Default</th>
									<th className="wwc:py-3 wwc:text-left wwc:font-semibold wwc:text-foreground">Description</th>
								</tr>
							</thead>
							<tbody>
								{[
									{
										prop: "variant",
										type: '"filter" | "attachment"',
										def: '"filter"',
										desc: "Filter = pill toggle. Attachment = static rounded-md chip.",
									},
									{prop: "size", type: '"sm" | "default" | "lg"', def: '"default"', desc: "Chip size."},
									{prop: "leadingIcon", type: "ReactNode", def: "—", desc: "Leading icon (both variants)."},
									{prop: "disabled", type: "boolean", def: "false", desc: "Disable interaction."},
									{
										prop: "pressed (filter)",
										type: "boolean",
										def: "—",
										desc: "Controlled selected state (filter only).",
									},
									{
										prop: "defaultPressed (filter)",
										type: "boolean",
										def: "false",
										desc: "Initial state (filter only, uncontrolled).",
									},
									{
										prop: "onPressedChange (filter)",
										type: "(pressed: boolean) => void",
										def: "—",
										desc: "Selection callback (filter only).",
									},
									{
										prop: "showCheck (filter)",
										type: "boolean",
										def: "true",
										desc: "Show checkmark when selected (filter only).",
									},
									{prop: "trailingIcon (filter)", type: "ReactNode", def: "—", desc: "Trailing icon (filter only)."},
									{
										prop: "onRemove (attachment)",
										type: "() => void",
										def: "—",
										desc: "Renders trailing X button when provided (attachment only).",
									},
									{
										prop: "removeLabel (attachment)",
										type: "string",
										def: '"Remove"',
										desc: "aria-label for the remove button.",
									},
									{
										prop: "preview (attachment)",
										type: "AttachmentPreview",
										def: "—",
										desc: 'Hover preview. { type: "image", src } or { type: "custom", content }.',
									},
									{
										prop: "previewCaption (attachment)",
										type: "ReactNode",
										def: "label",
										desc: "Caption shown under the preview content.",
									},
								].map((row) => (
									<tr key={row.prop} className="wwc:border-b wwc:border-border wwc:last:border-b-0">
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:font-medium wwc:text-primary wwc:whitespace-nowrap">
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
							value="Chip - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:overflow-x-auto wwc:rounded-lg wwc:bg-muted wwc:p-4 wwc:text-sm">
						{`import { Chip } from "@/components/ui/chip";

// Filter (default) — toggleable pill
<Chip pressed={isActive} onPressedChange={setActive}>
  All
</Chip>

// Filter with custom leading icon
<Chip defaultPressed leadingIcon={<MapPin />}>
  Location
</Chip>

// Attachment — static rounded chip with remove
<Chip
  variant="attachment"
  leadingIcon={<FileText />}
  onRemove={() => removeFile(id)}
>
  spec.md
</Chip>

// Attachment — static label only (no remove)
<Chip variant="attachment" leadingIcon={<AtSign />}>
  Project schedule
</Chip>`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
