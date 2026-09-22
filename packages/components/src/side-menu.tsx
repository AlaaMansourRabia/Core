import type {ComponentType, ReactNode} from "react";

import {cn} from "@corensystem/core-utils";
import {ArrowLeft, Check, ChevronDown, Search} from "lucide-react";

import {Badge} from "./badge";
import {Button} from "./button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "./dropdown-menu";
import {Input} from "./input";

export interface SideMenuItem {
	id: string;
	label: string;
	/** Optional leading icon (a lucide-style icon component taking `className`). */
	icon?: ComponentType<{className?: string}>;
	/** Optional trailing count pill (e.g. how many records the item holds). */
	count?: number;
}

export interface SideMenuGroup {
	/** Optional uppercase section label shown above the group (e.g. "CATEGORIES"). */
	label?: string;
	/**
	 * Draw a rule above this group, separating it from the one before.
	 *
	 * For a rail whose groups are unlabelled: without a label there is nothing but a 2px gap between
	 * two groups, so they read as one list. Ignored on the first group, which has nothing to separate
	 * from.
	 */
	divider?: boolean;
	items: SideMenuItem[];
}

export interface SideMenuProps {
	/** Panel title shown in the header. */
	title: string;
	/** Optional leading icon shown before the title. */
	icon?: ReactNode;
	/** When provided, a back button is rendered before the title and calls this on click. */
	onBack?: () => void;
	/** Accessible label for the back button. Defaults to "Back". */
	backLabel?: string;
	/** Show the search field. Defaults to `true`. */
	showSearch?: boolean;
	searchPlaceholder?: string;
	/** Controlled search value; pair with `onSearchChange`. Uncontrolled when omitted. */
	searchValue?: string;
	onSearchChange?: (value: string) => void;
	/** Grouped navigation entries. */
	groups: SideMenuGroup[];
	/** Currently active item id — highlighted. */
	activeItemId?: string;
	onItemSelect?: (id: string) => void;
	/** Extra classes on the panel container (e.g. width override). */
	className?: string;
}

/**
 * Navigation panel for a content-area sub-surface (settings, integrations, filters). Owns its own
 * header (optional back button + icon + title), optional search, and grouped items with an active
 * state. Place it as the left column of a content region, not as the app shell sidebar (use
 * CoreAppSidebar for that).
 *
 * Responsive: on desktop it's the vertical left column; below `md` the column is hidden and the items
 * collapse into a full-width bar with a dropdown picker (selecting an item opens it). For the mobile
 * bar to sit above the content rather than beside it, give the surrounding row `flex-col md:flex-row`.
 */
export function SideMenu({
	title,
	icon,
	onBack,
	backLabel = "Back",
	showSearch = true,
	searchPlaceholder = "Search...",
	searchValue,
	onSearchChange,
	groups,
	activeItemId,
	onItemSelect,
	className,
}: SideMenuProps) {
	const items = groups.flatMap((group) => group.items);
	const activeItem = items.find((item) => item.id === activeItemId);
	const ActiveIcon = activeItem?.icon;

	return (
		<>
			{/* Mobile: a compact bar with the panel title and a dropdown of the items. */}
			<div className="wwc:flex wwc:items-center wwc:gap-2 wwc:border-b wwc:border-border wwc:bg-card wwc:px-3 wwc:py-2 wwc:md:hidden">
				{onBack ? (
					<Button
						type="button"
						variant="ghost"
						size="sm"
						icon
						aria-label={backLabel}
						onClick={onBack}
						className="wwc:shrink-0"
					>
						<ArrowLeft />
					</Button>
				) : null}
				{icon ? <span className="wwc:flex wwc:shrink-0 wwc:items-center wwc:text-foreground">{icon}</span> : null}
				<h2 className="wwc:truncate wwc:text-base wwc:font-semibold wwc:text-foreground">{title}</h2>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" size="sm" className="wwc:ml-auto wwc:min-w-0 wwc:max-w-[60%] wwc:gap-2">
							{ActiveIcon ? <ActiveIcon className="wwc:h-4 wwc:w-4 wwc:shrink-0 wwc:text-muted-foreground" /> : null}
							<span className="wwc:truncate">{activeItem?.label ?? "Select"}</span>
							<ChevronDown className="wwc:h-4 wwc:w-4 wwc:shrink-0 wwc:opacity-60" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="wwc:max-h-[60vh] wwc:min-w-[13rem] wwc:overflow-y-auto">
						{groups.map((group, groupIndex) => (
							<div key={group.label ?? `group-${groupIndex}`}>
								{group.label ? <DropdownMenuLabel>{group.label}</DropdownMenuLabel> : null}
								{group.items.map((item) => {
									const Icon = item.icon;
									return (
										<DropdownMenuItem key={item.id} onSelect={() => onItemSelect?.(item.id)} className="wwc:gap-2">
											{Icon ? <Icon className="wwc:h-4 wwc:w-4 wwc:shrink-0 wwc:text-muted-foreground" /> : null}
											<span className="wwc:flex-1 wwc:truncate">{item.label}</span>
											{typeof item.count === "number" ? (
												<Badge
													variant="secondary"
													className="wwc:h-auto wwc:shrink-0 wwc:rounded-full wwc:px-1.5 wwc:py-0.5 wwc:text-[10px] wwc:leading-none wwc:tabular-nums"
												>
													{item.count}
												</Badge>
											) : null}
											{item.id === activeItemId ? <Check className="wwc:h-4 wwc:w-4 wwc:shrink-0" /> : null}
										</DropdownMenuItem>
									);
								})}
							</div>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{/* Desktop: the vertical left column. */}
			<div
				data-core-artifact="side-menu"
				className={cn(
					"wwc:hidden wwc:h-full wwc:min-h-0 wwc:w-64 wwc:shrink-0 wwc:flex-col wwc:border-r wwc:border-border wwc:bg-card wwc:md:flex",
					className,
				)}
			>
				<div className="wwc:flex wwc:items-center wwc:gap-2 wwc:px-3 wwc:py-3">
					{onBack ? (
						<Button
							type="button"
							variant="ghost"
							size="sm"
							icon
							aria-label={backLabel}
							onClick={onBack}
							className="wwc:shrink-0"
						>
							<ArrowLeft />
						</Button>
					) : null}
					{icon ? <span className="wwc:flex wwc:shrink-0 wwc:items-center wwc:text-foreground">{icon}</span> : null}
					<h2 className="wwc:truncate wwc:text-base wwc:font-semibold wwc:text-foreground">{title}</h2>
				</div>

				{showSearch ? (
					<div className="wwc:px-3 wwc:pb-2">
						<div className="wwc:relative">
							<Search className="wwc:pointer-events-none wwc:absolute wwc:top-1/2 wwc:left-2.5 wwc:h-4 wwc:w-4 wwc:-translate-y-1/2 wwc:text-muted-foreground" />
							<Input
								type="search"
								placeholder={searchPlaceholder}
								value={searchValue}
								onChange={(event) => onSearchChange?.(event.target.value)}
								className="wwc:h-9 wwc:pl-8"
							/>
						</div>
					</div>
				) : null}

				<nav className="wwc:flex wwc:min-h-0 wwc:flex-1 wwc:flex-col wwc:gap-0.5 wwc:overflow-y-auto wwc:px-2 wwc:pb-3">
					{groups.map((group, groupIndex) => (
						<div
							key={group.label ?? `group-${groupIndex}`}
							className={cn(
								"wwc:flex wwc:flex-col wwc:gap-0.5",
								group.divider && groupIndex > 0 && "wwc:mt-2 wwc:border-t wwc:border-border wwc:pt-2",
							)}
						>
							{group.label ? (
								<div className="wwc:px-3 wwc:pt-3 wwc:pb-1 wwc:text-[10px] wwc:font-medium wwc:tracking-wide wwc:text-muted-foreground wwc:uppercase">
									{group.label}
								</div>
							) : null}
							{group.items.map((item) => {
								const isActive = item.id === activeItemId;
								const Icon = item.icon;
								return (
									<button
										key={item.id}
										type="button"
										onClick={() => onItemSelect?.(item.id)}
										aria-current={isActive ? "page" : undefined}
										className={cn(
											"wwc:group wwc:flex wwc:w-full wwc:items-center wwc:gap-3 wwc:rounded-lg wwc:px-3 wwc:py-[7px] wwc:text-[13px] wwc:transition-colors",
											isActive
												? "wwc:bg-muted wwc:font-medium wwc:text-foreground"
												: "wwc:text-foreground/80 wwc:hover:bg-muted/50 wwc:hover:text-foreground",
										)}
									>
										{Icon ? (
											<Icon className="wwc:h-[15px] wwc:w-[15px] wwc:shrink-0 wwc:text-muted-foreground wwc:group-hover:text-foreground" />
										) : null}
										<span className="wwc:truncate">{item.label}</span>
										{typeof item.count === "number" ? (
											<Badge
												variant="secondary"
												className="wwc:ml-auto wwc:h-auto wwc:shrink-0 wwc:rounded-full wwc:px-1.5 wwc:py-0.5 wwc:text-[10px] wwc:leading-none wwc:tabular-nums"
											>
												{item.count}
											</Badge>
										) : null}
									</button>
								);
							})}
						</div>
					))}
				</nav>
			</div>
		</>
	);
}
