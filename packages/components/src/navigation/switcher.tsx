import {cn} from "@core/core-utils";
import {Building2, Check, ChevronsUpDown, Search} from "lucide-react";
import * as React from "react";

import {Button} from "../button";
import {Input} from "../input";
import {Popover, PopoverContent, PopoverTrigger} from "../popover";
import {ScrollArea} from "../scroll-area";

export type SwitcherGroup = {label: string; items: string[]};
export type SwitcherDensity = "comfortable" | "compact";

export interface SwitcherProps {
	/** Content rendered inside the trigger button, before the chevron (e.g. a logo + label). */
	children: React.ReactNode;
	/** Flat list of options. Ignored when `groups` is provided. */
	items?: readonly string[];
	/** Grouped options — a header label with nested items. */
	groups?: SwitcherGroup[];
	/** The currently selected option (gets a check mark). */
	selected?: string;
	onSelect: (item: string) => void;
	placeholder?: string;
	emptyLabel?: string;
	density?: SwitcherDensity;
	align?: "start" | "end";
	/** Popover width in px. Defaults to 300. */
	contentWidth?: number;
	/** Extra classes for the trigger button. */
	triggerClassName?: string;
	/** When set, renders a pinned footer action in the popover (e.g. "View all organizations"). */
	onViewAll?: () => void;
	/** Label for the `onViewAll` footer action. Defaults to "View all". */
	viewAllLabel?: string;
}

const D = {
	comfortable: {
		header: "wwc:px-3 wwc:pt-3 wwc:pb-2",
		input: "wwc:h-8 wwc:text-[13px]",
		esc: "wwc:h-6 wwc:px-1.5 wwc:text-[11px]",
		list: "wwc:px-3 wwc:py-2 wwc:space-y-0.5",
		item: "wwc:gap-3 wwc:px-3 wwc:py-2.5",
		itemText: "wwc:text-[13px]",
		empty: "wwc:text-[13px] wwc:py-4",
		groupLabel: "wwc:px-3 wwc:py-1.5 wwc:text-[11px]",
		chevron: "wwc:h-3.5 wwc:w-3.5",
	},
	compact: {
		header: "wwc:px-2 wwc:pt-2 wwc:pb-1",
		input: "wwc:h-7 wwc:text-[12px]",
		esc: "wwc:h-5 wwc:px-1 wwc:text-[10px]",
		list: "wwc:px-2 wwc:py-1.5 wwc:space-y-0",
		item: "wwc:gap-2 wwc:px-2 wwc:py-1.5",
		itemText: "wwc:text-[12px]",
		empty: "wwc:text-[12px] wwc:py-3",
		groupLabel: "wwc:px-2 wwc:py-1 wwc:text-[10px]",
		chevron: "wwc:h-3 wwc:w-3",
	},
} as const;

/**
 * The canonical searchable "pick from a list" dropdown used across the app shell — the app top bar's
 * project switcher and the app sidebar's organization switcher render THIS component. Supports a flat list
 * or grouped items, matches on type, marks the selected row, and closes on pick / Esc.
 */
export function Switcher({
	children,
	items,
	groups,
	selected,
	onSelect,
	placeholder = "Find…",
	emptyLabel = "No results",
	density = "comfortable",
	align = "start",
	contentWidth = 300,
	triggerClassName,
	onViewAll,
	viewAllLabel = "View all",
}: SwitcherProps) {
	const [open, setOpen] = React.useState(false);
	const [query, setQuery] = React.useState("");
	const d = D[density];
	const q = query.trim().toLowerCase();

	const filteredItems = (items ?? []).filter((i) => i.toLowerCase().includes(q));
	const filteredGroups = (groups ?? [])
		.map((g) => ({
			label: g.label,
			items:
				q === "" || g.label.toLowerCase().includes(q) ? g.items : g.items.filter((i) => i.toLowerCase().includes(q)),
		}))
		.filter((g) => g.items.length > 0);
	const isEmpty = groups ? filteredGroups.length === 0 : filteredItems.length === 0;

	const pick = (item: string) => {
		onSelect(item);
		setOpen(false);
		setQuery("");
	};

	const itemButton = (item: string) => (
		<button
			key={item}
			type="button"
			onClick={() => pick(item)}
			className={cn(
				"wwc:w-full wwc:flex wwc:items-center wwc:rounded-lg wwc:transition-colors",
				d.item,
				selected === item ? "wwc:bg-accent" : "wwc:hover:bg-accent/50",
			)}
		>
			<span
				className={cn(
					"wwc:flex-1 wwc:text-left wwc:font-medium wwc:text-foreground wwc:truncate wwc:min-w-0",
					d.itemText,
				)}
			>
				{item}
			</span>
			{selected === item && <Check className="wwc:h-4 wwc:w-4 wwc:shrink-0 wwc:text-foreground" />}
		</button>
	);

	return (
		<Popover
			open={open}
			onOpenChange={(o) => {
				setOpen(o);
				if (!o) setQuery("");
			}}
		>
			<PopoverTrigger asChild>
				<Button variant="ghost" className={cn(triggerClassName, open && "wwc:bg-accent wwc:text-accent-foreground")}>
					{children}
					<ChevronsUpDown className={cn(d.chevron, "wwc:flex-shrink-0 wwc:text-muted-foreground")} />
				</Button>
			</PopoverTrigger>
			<PopoverContent align={align} style={{width: contentWidth}} className="wwc:rounded-xl wwc:p-0">
				<div className={cn("wwc:flex-shrink-0 wwc:border-b wwc:border-border", d.header)}>
					<div className="wwc:flex wwc:items-center wwc:gap-2">
						<Search className="wwc:h-3.5 wwc:w-3.5 wwc:shrink-0 wwc:text-muted-foreground" />
						<Input
							autoFocus
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder={placeholder}
							className={cn("wwc:border-0 wwc:px-0 wwc:shadow-none wwc:focus-visible:ring-0", d.input)}
						/>
						<Button
							variant="outline"
							size="sm"
							onClick={() => {
								setOpen(false);
								setQuery("");
							}}
							className={cn("wwc:text-muted-foreground", d.esc)}
						>
							Esc
						</Button>
					</div>
				</div>
				<ScrollArea className="wwc:max-h-[280px]">
					<div className={d.list}>
						{isEmpty ? (
							<p className={cn("wwc:text-center wwc:text-muted-foreground", d.empty)}>{emptyLabel}</p>
						) : groups ? (
							filteredGroups.map((g) => (
								<div key={g.label} className="wwc:mb-2 wwc:last:mb-0">
									<div
										className={cn(
											"wwc:font-semibold wwc:uppercase wwc:tracking-widest wwc:text-muted-foreground/70",
											d.groupLabel,
										)}
									>
										{g.label}
									</div>
									{g.items.map(itemButton)}
								</div>
							))
						) : (
							filteredItems.map(itemButton)
						)}
					</div>
				</ScrollArea>
				{onViewAll && (
					<div className="wwc:flex-shrink-0 wwc:border-t wwc:border-border wwc:p-1">
						<button
							type="button"
							onClick={() => {
								onViewAll();
								setOpen(false);
								setQuery("");
							}}
							className={cn(
								"wwc:flex wwc:w-full wwc:items-center wwc:gap-2 wwc:rounded-lg wwc:font-medium wwc:text-foreground wwc:transition-colors wwc:hover:bg-accent/50",
								d.item,
								d.itemText,
							)}
						>
							<Building2 className="wwc:h-4 wwc:w-4 wwc:shrink-0 wwc:text-muted-foreground" />
							{viewAllLabel}
						</button>
					</div>
				)}
			</PopoverContent>
		</Popover>
	);
}
