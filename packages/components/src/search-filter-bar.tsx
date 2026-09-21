import {cn} from "@wakecap/core-utils";
import {Search} from "lucide-react";
import * as React from "react";

import {Chip} from "./chip";
import {Input} from "./input";

export type SearchFilterBarFilter = {
	id: string;
	label: string;
	count?: number;
};

export interface SearchFilterBarProps extends React.HTMLAttributes<HTMLDivElement> {
	search: string;
	onSearchChange: (next: string) => void;
	searchPlaceholder?: string;
	filters?: SearchFilterBarFilter[];
	activeFilterId?: string;
	onActiveFilterChange?: (id: string | undefined) => void;
	trailing?: React.ReactNode;
	/** Applied-filter strip rendered directly under the search row (e.g. `<FilterChips>`). */
	filterStrip?: React.ReactNode;
}

const SearchFilterBar = React.forwardRef<HTMLDivElement, SearchFilterBarProps>(
	(
		{
			className,
			search,
			onSearchChange,
			searchPlaceholder = "Search...",
			filters,
			activeFilterId,
			onActiveFilterChange,
			trailing,
			filterStrip,
			...rest
		},
		ref,
	) => {
		const hasFilters = filters !== undefined && filters.length > 0;

		return (
			<div ref={ref} className={cn("wwc:flex wwc:flex-col", className)} {...rest}>
				<div className="wwc:flex wwc:items-center wwc:gap-2 wwc:p-3 wwc:border-b">
					<div className="wwc:relative wwc:flex-1">
						<Search className="wwc:absolute wwc:left-2.5 wwc:top-1/2 wwc:-translate-y-1/2 wwc:h-3.5 wwc:w-3.5 wwc:text-muted-foreground" />
						<Input
							placeholder={searchPlaceholder}
							value={search}
							onChange={(e) => onSearchChange(e.target.value)}
							className="wwc:pl-8"
						/>
					</div>
					{trailing && <div className="wwc:flex wwc:items-center wwc:gap-2">{trailing}</div>}
				</div>
				{filterStrip && <div className="wwc:px-3 wwc:py-2 wwc:border-b">{filterStrip}</div>}
				{hasFilters && (
					<div className="wwc:flex wwc:items-center wwc:gap-1.5 wwc:px-3 wwc:py-2 wwc:border-b wwc:flex-wrap">
						{filters.map((filter) => {
							const isActive = activeFilterId === filter.id;
							return (
								<Chip
									key={filter.id}
									size="sm"
									pressed={isActive}
									onPressedChange={(next) => {
										if (!onActiveFilterChange) return;
										onActiveFilterChange(next ? filter.id : undefined);
									}}
								>
									{filter.label}
									{filter.count !== undefined && ` ${filter.count}`}
								</Chip>
							);
						})}
					</div>
				)}
			</div>
		);
	},
);
SearchFilterBar.displayName = "SearchFilterBar";

export {SearchFilterBar};
