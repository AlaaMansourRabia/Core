import {Search} from "lucide-react";
import * as React from "react";

import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {
	Filter,
	FilterCategory,
	FilterContent,
	FilterOption,
	FilterTrigger,
	type FilterValue,
} from "@/components/ui/filter";
import {Input} from "@/components/ui/input";

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

const ALL = [...CREWS, ...TRADES, ...STATUSES, ...NATIONALITIES];
const labelFor = (value: string) => ALL.find((o) => o.value === value)?.label ?? value;

export function FilterPage() {
	const [applied, setApplied] = React.useState<FilterValue>({});

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

	return (
		<div className="wwc:space-y-8">
			<div>
				<h1 className="wwc:text-3xl wwc:font-bold">Filter</h1>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Composite popover for staging-then-applying multi-category filters. Selections are staged in a draft inside
					the popover; <strong>Apply</strong> commits draft → applied (and emits{" "}
					<code className="wwc:text-xs">onChange</code>). Each category renders as a single-open Accordion item: opening
					one auto-collapses the others. The trigger is icon-only with a primary-colored corner badge showing the total
					applied count.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Default — uncontrolled</CardTitle>
					<CardDescription>
						Three categories. Open the popover, check options, click Apply. The corner badge on the trigger updates with
						the applied count.
					</CardDescription>
				</CardHeader>
				<CardContent>
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
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Many options — body scrolls, header & footer stay sticky</CardTitle>
					<CardDescription>
						36 nationalities. The popover body caps at 70vh and scrolls natively (NOT Radix ScrollArea — its{" "}
						<code className="wwc:text-xs">h-full</code> viewport doesn't compute under{" "}
						<code className="wwc:text-xs">flex-1</code> + max-height).
					</CardDescription>
				</CardHeader>
				<CardContent>
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
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Controlled — search row + chips + Clear all</CardTitle>
					<CardDescription>
						Parent owns the applied state. Renders one removable chip per applied selection; <strong>Clear all</strong>{" "}
						wipes everything in one click. This is the canonical layout for a left-panel filter row over an entity list.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:max-w-sm wwc:space-y-3">
						<div className="wwc:flex wwc:items-center wwc:gap-2">
							<div className="wwc:relative wwc:flex-1">
								<Search className="wwc:absolute wwc:left-2.5 wwc:top-1/2 wwc:-translate-y-1/2 wwc:h-3.5 wwc:w-3.5 wwc:text-muted-foreground" />
								<Input placeholder="Search workers..." className="wwc:pl-8 wwc:h-8 wwc:text-[13px]" />
							</div>
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
										<Badge
											key={`${categoryId}-${v}`}
											variant="secondary"
											className="wwc:gap-1 wwc:text-[11px] wwc:pr-1"
										>
											{labelFor(v)}
											<button
												type="button"
												onClick={() => removeOne(categoryId, v)}
												className="wwc:rounded-full wwc:p-0.5 wwc:hover:bg-background/60"
												aria-label={`Remove ${labelFor(v)}`}
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

						<pre className="wwc:text-[11px] wwc:bg-muted wwc:p-2 wwc:rounded wwc:overflow-x-auto">
							{JSON.stringify(applied, null, 2)}
						</pre>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
