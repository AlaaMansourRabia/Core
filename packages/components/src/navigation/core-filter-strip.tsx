import {X} from "lucide-react";
import {useState} from "react";

import {Badge} from "../badge";
import {Button} from "../button";
import {DateRangePicker} from "../date-picker";
import {MultiSelect} from "../select";
import {Separator} from "../separator";

// Filter option types
interface FilterOption {
	value: string;
	label: string;
}

// Projects list
const projectOptions: FilterOption[] = [
	{value: "six-flags", label: "Six Flags"},
	{value: "aquarabia", label: "Aquarabia"},
	{value: "gaming-district", label: "Gaming District"},
	{value: "speed-park", label: "Speed Park"},
	{value: "stadium", label: "Stadium"},
	{value: "golf-course", label: "Golf Course"},
	{value: "mercedes-amg", label: "Mercedes-AMG"},
	{value: "arts-centre", label: "Arts Centre"},
	{value: "studios", label: "Studios"},
];

// Zone options
const zoneOptions: FilterOption[] = [
	{value: "zone-a", label: "Construction Zone A"},
	{value: "heavy-equipment", label: "Heavy Equipment"},
	{value: "foundation", label: "Foundation Works"},
	{value: "steel", label: "Steel Structure"},
	{value: "electrical", label: "Electrical Works"},
	{value: "finishing", label: "Finishing Zone"},
	{value: "excavation", label: "Excavation Site"},
	{value: "assembly", label: "Assembly Area"},
];

// Trade options
const tradeOptions: FilterOption[] = [
	{value: "civil", label: "Civil"},
	{value: "electrical", label: "Electrical"},
	{value: "mechanical", label: "Mechanical"},
	{value: "steel", label: "Steel"},
	{value: "finishing", label: "Finishing"},
	{value: "others", label: "Others"},
];

// Status options
const statusOptions: FilterOption[] = [
	{value: "on-track", label: "On Track"},
	{value: "at-risk", label: "At Risk"},
	{value: "critical", label: "Critical"},
];

// Filter strip
export type FilterStripVariant = "performance" | "workforce" | "reality-capture";
export type FilterStripSize = "default" | "sm";

interface CoreFilterStripProps {
	variant: FilterStripVariant;
	size?: FilterStripSize;
	onFiltersChange?: (filters: Record<string, unknown>) => void;
}

/** Horizontal filter strip with variant-specific controls for dashboards. */
export function CoreFilterStrip({variant, size = "default", onFiltersChange}: CoreFilterStripProps) {
	const [dateRange, setDateRange] = useState<{from: Date | undefined; to: Date | undefined}>({
		from: undefined,
		to: undefined,
	});
	const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
	const [selectedZones, setSelectedZones] = useState<string[]>([]);
	const [selectedTrades, setSelectedTrades] = useState<string[]>([]);
	const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

	const isSmall = size === "sm";

	const hasDateFilter = dateRange.from !== undefined;
	const activeFilterCount =
		(hasDateFilter ? 1 : 0) +
		selectedProjects.length +
		selectedZones.length +
		selectedTrades.length +
		selectedStatuses.length;

	const handleClearAll = () => {
		setDateRange({from: undefined, to: undefined});
		setSelectedProjects([]);
		setSelectedZones([]);
		setSelectedTrades([]);
		setSelectedStatuses([]);
		onFiltersChange?.({});
	};

	const notifyChange = () => {
		onFiltersChange?.({
			dateRange,
			projects: selectedProjects,
			zones: selectedZones,
			trades: selectedTrades,
			statuses: selectedStatuses,
		});
	};

	const selectWidth = isSmall ? "wwc:w-[120px]" : "wwc:w-[140px]";

	return (
		<div className={`wwc:flex wwc:items-center wwc:flex-wrap wwc:gap-2 ${isSmall ? "wwc:py-1.5" : "wwc:py-2"}`}>
			{/* Date Range Picker */}
			<DateRangePicker
				dateRange={dateRange}
				onDateRangeChange={(range) => {
					setDateRange(range ?? {from: undefined, to: undefined});
					notifyChange();
				}}
				placeholder="Date range"
				className={isSmall ? "wwc:w-[180px] wwc:h-7 wwc:text-xs" : "wwc:w-[220px] wwc:h-9 wwc:text-xs"}
			/>

			{/* Projects */}
			<MultiSelect
				options={projectOptions}
				value={selectedProjects}
				onValueChange={(selected) => {
					setSelectedProjects(selected);
					notifyChange();
				}}
				placeholder="Projects"
				searchPlaceholder="Search projects..."
				className={selectWidth}
				keepPlaceholder
				size={size}
			/>

			{/* Variant-specific filters */}
			{variant === "performance" && (
				<MultiSelect
					options={statusOptions}
					value={selectedStatuses}
					onValueChange={(selected) => {
						setSelectedStatuses(selected);
						notifyChange();
					}}
					placeholder="Status"
					searchPlaceholder="Search status..."
					className={selectWidth}
					keepPlaceholder
					size={size}
				/>
			)}

			{variant === "workforce" && (
				<>
					<MultiSelect
						options={zoneOptions}
						value={selectedZones}
						onValueChange={(selected) => {
							setSelectedZones(selected);
							notifyChange();
						}}
						placeholder="Zones"
						searchPlaceholder="Search zones..."
						className={selectWidth}
						keepPlaceholder
						size={size}
					/>
					<MultiSelect
						options={tradeOptions}
						value={selectedTrades}
						onValueChange={(selected) => {
							setSelectedTrades(selected);
							notifyChange();
						}}
						placeholder="Trades"
						searchPlaceholder="Search trades..."
						className={selectWidth}
						keepPlaceholder
						size={size}
					/>
				</>
			)}

			{/* Separator + Clear + Chips — only when filters are active */}
			{activeFilterCount > 0 && (
				<>
					<Separator orientation="vertical" className={isSmall ? "wwc:h-4 wwc:mx-0.5" : "wwc:h-6 wwc:mx-1"} />

					<Button
						variant="ghost"
						size="sm"
						className={`wwc:gap-1.5 wwc:text-muted-foreground wwc:hover:text-foreground ${isSmall ? "wwc:h-7 wwc:text-[11px]" : "wwc:h-8 wwc:text-xs"}`}
						onClick={handleClearAll}
					>
						<X className={isSmall ? "wwc:h-3 wwc:w-3" : "wwc:h-3.5 wwc:w-3.5"} />
						Clear all
					</Button>

					<div className="wwc:flex wwc:items-center wwc:flex-wrap wwc:gap-1.5">
						{selectedProjects.map((val) => {
							const opt = projectOptions.find((o) => o.value === val);
							return opt ? (
								<Badge
									key={val}
									variant="outline"
									className={`wwc:gap-1 wwc:font-normal wwc:shrink-0 ${isSmall ? "wwc:h-5 wwc:text-[10px]" : "wwc:h-6 wwc:text-xs"}`}
								>
									{opt.label}
									<X
										className="wwc:h-3 wwc:w-3 wwc:cursor-pointer wwc:hover:text-destructive"
										onClick={() => setSelectedProjects(selectedProjects.filter((v) => v !== val))}
									/>
								</Badge>
							) : null;
						})}
						{selectedZones.map((val) => {
							const opt = zoneOptions.find((o) => o.value === val);
							return opt ? (
								<Badge
									key={val}
									variant="outline"
									className={`wwc:gap-1 wwc:font-normal wwc:shrink-0 ${isSmall ? "wwc:h-5 wwc:text-[10px]" : "wwc:h-6 wwc:text-xs"}`}
								>
									{opt.label}
									<X
										className="wwc:h-3 wwc:w-3 wwc:cursor-pointer wwc:hover:text-destructive"
										onClick={() => setSelectedZones(selectedZones.filter((v) => v !== val))}
									/>
								</Badge>
							) : null;
						})}
						{selectedTrades.map((val) => {
							const opt = tradeOptions.find((o) => o.value === val);
							return opt ? (
								<Badge
									key={val}
									variant="outline"
									className={`wwc:gap-1 wwc:font-normal wwc:shrink-0 ${isSmall ? "wwc:h-5 wwc:text-[10px]" : "wwc:h-6 wwc:text-xs"}`}
								>
									{opt.label}
									<X
										className="wwc:h-3 wwc:w-3 wwc:cursor-pointer wwc:hover:text-destructive"
										onClick={() => setSelectedTrades(selectedTrades.filter((v) => v !== val))}
									/>
								</Badge>
							) : null;
						})}
						{selectedStatuses.map((val) => {
							const opt = statusOptions.find((o) => o.value === val);
							return opt ? (
								<Badge
									key={val}
									variant="outline"
									className={`wwc:gap-1 wwc:font-normal wwc:shrink-0 ${isSmall ? "wwc:h-5 wwc:text-[10px]" : "wwc:h-6 wwc:text-xs"}`}
								>
									{opt.label}
									<X
										className="wwc:h-3 wwc:w-3 wwc:cursor-pointer wwc:hover:text-destructive"
										onClick={() => setSelectedStatuses(selectedStatuses.filter((v) => v !== val))}
									/>
								</Badge>
							) : null;
						})}
					</div>
				</>
			)}
		</div>
	);
}
