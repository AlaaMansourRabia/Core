import {
	Calendar,
	CalendarCheck,
	CircleUser,
	Component,
	Disc,
	Disc3,
	LayoutGrid,
	Signal,
	Tag,
	Users,
	X,
} from "lucide-react";

import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {PropertyEmpty, PropertyList, PropertyRow} from "@/components/ui/property-list";

// ---- Local value renderers (compose primitives, no new domain types needed) ----

function StatusValue({label}: {label: string}) {
	return (
		<span className="wwc:inline-flex wwc:items-center wwc:gap-1.5 wwc:text-foreground">
			<span className="wwc:relative wwc:flex wwc:h-3.5 wwc:w-3.5 wwc:items-center wwc:justify-center wwc:rounded-full wwc:border-2 wwc:border-amber-500">
				<span className="wwc:h-1.5 wwc:w-1.5 wwc:rounded-full wwc:bg-amber-500" />
			</span>
			{label}
		</span>
	);
}

function PriorityValue({label, bars}: {label: string; bars: 1 | 2 | 3}) {
	return (
		<span className="wwc:inline-flex wwc:items-center wwc:gap-1.5 wwc:rounded-md wwc:border wwc:border-amber-200 wwc:bg-amber-50 wwc:px-2 wwc:py-1 wwc:text-xs wwc:font-medium wwc:text-amber-700">
			<span className="wwc:inline-flex wwc:items-end wwc:gap-[2px] wwc:h-3 wwc:w-3 wwc:text-amber-600">
				<span
					className={`wwc:w-[3px] wwc:rounded-sm wwc:h-[30%] ${bars >= 1 ? "wwc:bg-current" : "wwc:bg-current/30"}`}
				/>
				<span
					className={`wwc:w-[3px] wwc:rounded-sm wwc:h-[60%] ${bars >= 2 ? "wwc:bg-current" : "wwc:bg-current/30"}`}
				/>
				<span
					className={`wwc:w-[3px] wwc:rounded-sm wwc:h-[90%] ${bars >= 3 ? "wwc:bg-current" : "wwc:bg-current/30"}`}
				/>
			</span>
			{label}
		</span>
	);
}

function PersonValue({name}: {name: string}) {
	return (
		<span className="wwc:inline-flex wwc:items-center wwc:gap-2">
			<Avatar className="wwc:h-5 wwc:w-5">
				<AvatarFallback className="wwc:bg-emerald-500 wwc:text-[10px] wwc:font-medium wwc:text-white">
					{name.charAt(0).toUpperCase()}
				</AvatarFallback>
			</Avatar>
			<span className="wwc:text-foreground">{name}</span>
		</span>
	);
}

function ParentChip({id, onClear}: {id: string; onClear?: () => void}) {
	return (
		<span className="wwc:inline-flex wwc:items-center wwc:gap-1.5 wwc:rounded-md wwc:bg-emerald-50 wwc:px-2 wwc:py-1 wwc:text-xs wwc:font-medium wwc:text-emerald-700">
			{id}
			{onClear && (
				<button
					type="button"
					onClick={onClear}
					className="wwc:ml-0.5 wwc:rounded-sm wwc:opacity-70 wwc:hover:opacity-100"
					aria-label={`Remove ${id}`}
				>
					<X className="wwc:h-3 wwc:w-3" />
				</button>
			)}
		</span>
	);
}

function LabelChip({name, dotClass, onClear}: {name: string; dotClass: string; onClear?: () => void}) {
	return (
		<span className="wwc:inline-flex wwc:h-7 wwc:items-center wwc:gap-1.5 wwc:rounded-full wwc:border wwc:border-border wwc:bg-background wwc:px-2 wwc:text-xs wwc:text-foreground">
			<span className={`wwc:h-2 wwc:w-2 wwc:rounded-full ${dotClass}`} />
			{name}
			{onClear && (
				<button
					type="button"
					onClick={onClear}
					className="wwc:ml-0.5 wwc:rounded-sm wwc:opacity-60 wwc:hover:opacity-100"
					aria-label={`Remove ${name}`}
				>
					<X className="wwc:h-3 wwc:w-3" />
				</button>
			)}
		</span>
	);
}

function AddLabelChip() {
	return (
		<button
			type="button"
			className="wwc:inline-flex wwc:h-7 wwc:items-center wwc:gap-1.5 wwc:rounded-full wwc:border wwc:border-border wwc:bg-background wwc:px-2 wwc:text-xs wwc:text-muted-foreground wwc:hover:bg-accent/40"
		>
			<Tag className="wwc:h-3 wwc:w-3" />
			Select label
		</button>
	);
}

// ---- Props table data ----

const propertyListProps: {prop: string; type: string; def: string; desc: string}[] = [
	{prop: "title", type: "ReactNode", def: "undefined", desc: "Optional section heading rendered above the rows."},
	{prop: "labelWidth", type: "string", def: '"9rem"', desc: "Width of the label column. Accepts any CSS length."},
];

const propertyRowProps: {prop: string; type: string; def: string; desc: string}[] = [
	{prop: "icon", type: "ReactNode", def: "undefined", desc: "Leading icon rendered next to the label."},
	{prop: "label", type: "ReactNode", def: "—", desc: "Label text (the property name)."},
	{
		prop: "align",
		type: '"center" | "start"',
		def: '"center"',
		desc: "Vertical alignment of the value relative to the label. Use start for multi-line values.",
	},
	{prop: "children", type: "ReactNode", def: "—", desc: "The value content rendered in the right column."},
];

export function PropertyListPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Property List</h1>
					<CopyButton
						value="Property List"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:mt-2 wwc:text-muted-foreground">
					Vertical list of labeled properties for issue / work item detail panels, settings summaries, and any
					"icon&nbsp;+&nbsp;label&nbsp;:&nbsp;value" stack. Renders as semantic <code>&lt;dl&gt;</code> markup.
					Composable — value content is fully consumer-controlled.
				</p>
			</div>

			{/* Default — Plane-style Properties panel */}
			<div>
				<h2 className="wwc:text-xl wwc:font-semibold wwc:mb-4">Default</h2>
				<p className="wwc:text-muted-foreground wwc:mb-4">
					The full Properties panel from a Plane-style work item detail view: state, assignees, priority, created by,
					dates, modules, cycle, parent, and labels.
				</p>
				<div className="wwc:max-w-md wwc:rounded-xl wwc:border wwc:border-border wwc:bg-background wwc:p-6">
					<PropertyList title="Properties">
						<PropertyRow icon={<Disc className="wwc:h-4 wwc:w-4" />} label="State">
							<StatusValue label="In Progress" />
						</PropertyRow>
						<PropertyRow icon={<Users className="wwc:h-4 wwc:w-4" />} label="Assignees">
							<PersonValue name="samlee.mobbin+1" />
						</PropertyRow>
						<PropertyRow icon={<Signal className="wwc:h-4 wwc:w-4" />} label="Priority">
							<PriorityValue label="High" bars={3} />
						</PropertyRow>
						<PropertyRow icon={<CircleUser className="wwc:h-4 wwc:w-4" />} label="Created by">
							<PersonValue name="samlee.mobbin+1" />
						</PropertyRow>
						<PropertyRow icon={<Calendar className="wwc:h-4 wwc:w-4" />} label="Start date">
							<span className="wwc:text-foreground">Aug 14, 2025</span>
						</PropertyRow>
						<PropertyRow icon={<CalendarCheck className="wwc:h-4 wwc:w-4" />} label="Due date">
							<span className="wwc:text-foreground">Aug 28, 2025</span>
						</PropertyRow>
						<PropertyRow icon={<LayoutGrid className="wwc:h-4 wwc:w-4" />} label="Modules">
							<PropertyEmpty>No module</PropertyEmpty>
						</PropertyRow>
						<PropertyRow icon={<Disc3 className="wwc:h-4 wwc:w-4" />} label="Cycle">
							<PropertyEmpty>No cycle</PropertyEmpty>
						</PropertyRow>
						<PropertyRow icon={<Component className="wwc:h-4 wwc:w-4" />} label="Parent">
							<ParentChip id="ASMOB-5" onClear={() => {}} />
						</PropertyRow>
						<PropertyRow icon={<Tag className="wwc:h-4 wwc:w-4" />} label="Labels" align="start">
							<LabelChip name="admin" dotClass="wwc:bg-sky-500" onClear={() => {}} />
							<AddLabelChip />
						</PropertyRow>
					</PropertyList>
				</div>
			</div>

			{/* Without title */}
			<div>
				<h2 className="wwc:text-xl wwc:font-semibold wwc:mb-4">Without title</h2>
				<p className="wwc:text-muted-foreground wwc:mb-4">
					Omit the title prop to embed the list inside another section.
				</p>
				<div className="wwc:max-w-md wwc:rounded-xl wwc:border wwc:border-border wwc:bg-background wwc:p-6">
					<PropertyList>
						<PropertyRow icon={<Calendar className="wwc:h-4 wwc:w-4" />} label="Start date">
							<span className="wwc:text-foreground">Aug 14, 2025</span>
						</PropertyRow>
						<PropertyRow icon={<CalendarCheck className="wwc:h-4 wwc:w-4" />} label="Due date">
							<span className="wwc:text-foreground">Aug 28, 2025</span>
						</PropertyRow>
					</PropertyList>
				</div>
			</div>

			{/* Custom label width */}
			<div>
				<h2 className="wwc:text-xl wwc:font-semibold wwc:mb-4">Custom label width</h2>
				<p className="wwc:text-muted-foreground wwc:mb-4">
					Pass <code>labelWidth</code> when properties have longer labels.
				</p>
				<div className="wwc:max-w-lg wwc:rounded-xl wwc:border wwc:border-border wwc:bg-background wwc:p-6">
					<PropertyList title="Build configuration" labelWidth="13rem">
						<PropertyRow label="Storybook port">
							<span className="wwc:font-mono">6007</span>
						</PropertyRow>
						<PropertyRow label="Vite dev port">
							<span className="wwc:font-mono">5173</span>
						</PropertyRow>
						<PropertyRow label="Tailwind prefix">
							<span className="wwc:font-mono">wwc:</span>
						</PropertyRow>
					</PropertyList>
				</div>
			</div>

			{/* PropertyList Props */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>PropertyList Props</CardTitle>
						<CopyButton
							value="PropertyList - Props"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<div className="wwc:overflow-x-auto">
						<table className="wwc:w-full wwc:text-sm">
							<thead>
								<tr className="wwc:border-b wwc:border-border wwc:text-left">
									<th className="wwc:py-2 wwc:pr-4 wwc:font-semibold">Prop</th>
									<th className="wwc:py-2 wwc:pr-4 wwc:font-semibold">Type</th>
									<th className="wwc:py-2 wwc:pr-4 wwc:font-semibold">Default</th>
									<th className="wwc:py-2 wwc:font-semibold">Description</th>
								</tr>
							</thead>
							<tbody>
								{propertyListProps.map((row) => (
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

			{/* PropertyRow Props */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>PropertyRow Props</CardTitle>
						<CopyButton
							value="PropertyRow - Props"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<div className="wwc:overflow-x-auto">
						<table className="wwc:w-full wwc:text-sm">
							<thead>
								<tr className="wwc:border-b wwc:border-border wwc:text-left">
									<th className="wwc:py-2 wwc:pr-4 wwc:font-semibold">Prop</th>
									<th className="wwc:py-2 wwc:pr-4 wwc:font-semibold">Type</th>
									<th className="wwc:py-2 wwc:pr-4 wwc:font-semibold">Default</th>
									<th className="wwc:py-2 wwc:font-semibold">Description</th>
								</tr>
							</thead>
							<tbody>
								{propertyRowProps.map((row) => (
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

			{/* Usage */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Usage</CardTitle>
						<CopyButton
							value="Property List - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`import { PropertyList, PropertyRow, PropertyEmpty } from "@/components/ui/property-list";
import { Calendar, Users, Signal } from "lucide-react";

<PropertyList title="Properties">
  <PropertyRow icon={<Users className="h-4 w-4" />} label="Assignees">
    <Avatar /> samlee.mobbin+1
  </PropertyRow>
  <PropertyRow icon={<Signal className="h-4 w-4" />} label="Priority">
    <PriorityPill label="High" />
  </PropertyRow>
  <PropertyRow icon={<Calendar className="h-4 w-4" />} label="Modules">
    <PropertyEmpty>No module</PropertyEmpty>
  </PropertyRow>
</PropertyList>`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
