import type {Meta, StoryObj} from "storybook/internal/types";

import {Badge} from "@wakecap/core-ui/badge";
import {Button} from "@wakecap/core-ui/button";
import {
	Filter,
	FilterCategory,
	FilterContent,
	FilterOption,
	FilterTrigger,
	type FilterValue,
} from "@wakecap/core-ui/filter";
import * as React from "react";

const meta = {
	title: "Widgets/Data/Filter",
	component: Filter,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Composite popover for staging-then-applying multi-category filters. Selections are staged in a draft inside the popover; Apply commits draft → applied (and emits `onChange`). Each category renders as a single-open Accordion item. The trigger is icon-only with a corner badge showing the total applied count.",
			},
		},
	},
} satisfies Meta<typeof Filter>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Mock data ────────────────────────────────────────────────────────────────

const CREWS = [
	{value: "snyder", label: "Snyder Concrete"},
	{value: "nsg", label: "NSG Electric"},
	{value: "apex", label: "Apex Framing"},
	{value: "core-mep", label: "Core MEP"},
	{value: "delta-mason", label: "Delta Masonry"},
	{value: "ny-ins", label: "NY Insulation"},
];

const TRADES = [
	{value: "concrete", label: "Concrete"},
	{value: "electrical", label: "Electrical"},
	{value: "framing", label: "Framing"},
	{value: "mep", label: "MEP"},
	{value: "masonry", label: "Masonry"},
	{value: "insulation", label: "Insulation"},
];

const STATUSES = [
	{value: "active", label: "Active"},
	{value: "warning", label: "Warning"},
	{value: "inactive", label: "Inactive"},
];

// 30 fake nationalities so users can see the in-popover scroll engage
const NATIONALITIES = [
	"American",
	"Australian",
	"Bangladeshi",
	"Brazilian",
	"British",
	"Canadian",
	"Egyptian",
	"Emirati",
	"Filipino",
	"French",
	"German",
	"Indian",
	"Indonesian",
	"Iranian",
	"Iraqi",
	"Italian",
	"Japanese",
	"Jordanian",
	"Kenyan",
	"Korean",
	"Kuwaiti",
	"Lebanese",
	"Mexican",
	"Moroccan",
	"Nepalese",
	"Nigerian",
	"Pakistani",
	"Saudi",
	"Spanish",
	"Sri Lankan",
	"Sudanese",
	"Syrian",
	"Tunisian",
	"Turkish",
	"Ukrainian",
	"Yemeni",
].map((label) => ({value: label.toLowerCase().replace(/\s+/g, "-"), label}));

// ── Stories ──────────────────────────────────────────────────────────────────

/** Default uncontrolled filter with three categories. Open the popover, check
 *  some options, click Apply — selections stay highlighted via the corner
 *  badge on the trigger. Click an open category to collapse it; opening
 *  another auto-collapses the first. */
export const Default: Story = {
	render: () => (
		<div className="wwc:p-8">
			<Filter defaultValue={{}} onChange={(v) => console.log("applied", v)}>
				<FilterTrigger />
				<FilterContent>
					<FilterCategory value="crew" label="Crew">
						{CREWS.map((c) => (
							<FilterOption key={c.value} value={c.value}>
								{c.label}
							</FilterOption>
						))}
					</FilterCategory>
					<FilterCategory value="trade" label="Trade">
						{TRADES.map((t) => (
							<FilterOption key={t.value} value={t.value}>
								{t.label}
							</FilterOption>
						))}
					</FilterCategory>
					<FilterCategory value="status" label="Status">
						{STATUSES.map((s) => (
							<FilterOption key={s.value} value={s.value}>
								{s.label}
							</FilterOption>
						))}
					</FilterCategory>
				</FilterContent>
			</Filter>
		</div>
	),
};

/** A category with many options forces the popover body to scroll. The header
 *  ("Filter") and footer (Clear / Apply) stay sticky; only the middle moves. */
export const ManyOptionsScrollable: Story = {
	render: () => (
		<div className="wwc:p-8">
			<Filter defaultValue={{}}>
				<FilterTrigger />
				<FilterContent>
					<FilterCategory value="nationality" label="Nationality">
						{NATIONALITIES.map((n) => (
							<FilterOption key={n.value} value={n.value}>
								{n.label}
							</FilterOption>
						))}
					</FilterCategory>
					<FilterCategory value="status" label="Status">
						{STATUSES.map((s) => (
							<FilterOption key={s.value} value={s.value}>
								{s.label}
							</FilterOption>
						))}
					</FilterCategory>
				</FilterContent>
			</Filter>
		</div>
	),
};

/** Controlled mode: parent owns the applied state. Useful when filters drive
 *  another data surface (table rows, map dots, etc.). The "Active filters"
 *  block below the trigger renders one removable chip per applied selection
 *  plus a "Clear all" ghost button. */
export const Controlled: Story = {
	render: () => {
		const [applied, setApplied] = React.useState<FilterValue>({crew: ["snyder"], trade: ["concrete"]});

		const totalApplied = Object.values(applied).reduce((sum, arr) => sum + arr.length, 0);

		const removeOne = (categoryId: string, value: string) => {
			setApplied((prev) => {
				const arr = (prev[categoryId] ?? []).filter((v) => v !== value);
				const next = {...prev};
				if (arr.length === 0) delete next[categoryId];
				else next[categoryId] = arr;
				return next;
			});
		};

		const labelFor = (categoryId: string, value: string) => {
			const list = categoryId === "crew" ? CREWS : categoryId === "trade" ? TRADES : STATUSES;
			return list.find((o) => o.value === value)?.label ?? value;
		};

		return (
			<div className="wwc:p-8 wwc:space-y-3 wwc:max-w-md">
				<div className="wwc:flex wwc:items-center wwc:gap-2">
					<input
						type="text"
						placeholder="Search workers..."
						className="wwc:flex-1 wwc:h-8 wwc:rounded-md wwc:border wwc:border-input wwc:bg-transparent wwc:px-3 wwc:text-sm"
					/>
					<Filter value={applied} onChange={setApplied}>
						<FilterTrigger />
						<FilterContent>
							<FilterCategory value="crew" label="Crew">
								{CREWS.map((c) => (
									<FilterOption key={c.value} value={c.value}>
										{c.label}
									</FilterOption>
								))}
							</FilterCategory>
							<FilterCategory value="trade" label="Trade">
								{TRADES.map((t) => (
									<FilterOption key={t.value} value={t.value}>
										{t.label}
									</FilterOption>
								))}
							</FilterCategory>
							<FilterCategory value="status" label="Status">
								{STATUSES.map((s) => (
									<FilterOption key={s.value} value={s.value}>
										{s.label}
									</FilterOption>
								))}
							</FilterCategory>
						</FilterContent>
					</Filter>
				</div>

				{totalApplied > 0 && (
					<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-1">
						{Object.entries(applied).flatMap(([categoryId, values]) =>
							values.map((v) => (
								<Badge key={`${categoryId}-${v}`} variant="secondary" className="wwc:gap-1 wwc:text-[11px] wwc:pr-1">
									{labelFor(categoryId, v)}
									<button
										type="button"
										onClick={() => removeOne(categoryId, v)}
										className="wwc:rounded-full wwc:p-0.5 wwc:hover:bg-background/60"
										aria-label={`Remove ${labelFor(categoryId, v)}`}
									>
										✕
									</button>
								</Badge>
							)),
						)}
						<Button
							variant="ghost"
							size="sm"
							className="wwc:h-5 wwc:px-1.5 wwc:text-[11px] wwc:text-muted-foreground wwc:hover:text-foreground"
							onClick={() => setApplied({})}
						>
							Clear all
						</Button>
					</div>
				)}

				<pre className="wwc:text-[11px] wwc:bg-muted wwc:p-2 wwc:rounded">{JSON.stringify(applied, null, 2)}</pre>
			</div>
		);
	},
};
