import {Maximize2, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen} from "lucide-react";
import {useMemo, useState} from "react";

import {Button} from "@/components/ui/button";
import {CopyButton} from "@/components/ui/copy-button";
import {
	Filter,
	FilterCategory,
	FilterContent,
	FilterOption,
	FilterTrigger,
	type FilterValue,
} from "@/components/ui/filter";
import {FullscreenExitButton} from "@/components/ui/fullscreen-exit-button";
import {SearchFilterBar} from "@/components/ui/search-filter-bar";

const ITEMS_C = ["Item C-1", "Item C-2", "Item C-3", "Item C-4"];

type Row = {id: string; label: string; status: "open" | "done"};

const PANEL_A_ROWS: Row[] = [
	{id: "a-1", label: "Region · Middle East", status: "open"},
	{id: "a-2", label: "Region · Asia Pacific", status: "open"},
	{id: "a-3", label: "Region · Europe", status: "done"},
];

const PANEL_B_ROWS: Row[] = [
	{id: "b-1", label: "Site Alpha", status: "open"},
	{id: "b-2", label: "Site Beta", status: "open"},
	{id: "b-3", label: "Site Gamma", status: "done"},
	{id: "b-4", label: "Site Delta", status: "open"},
];

const PANEL_C_ROWS: Row[] = [
	{id: "c-1", label: "Building A1 · Floor 1", status: "open"},
	{id: "c-2", label: "Building A1 · Floor 2", status: "open"},
	{id: "c-3", label: "Building A1 · Floor 3", status: "done"},
	{id: "c-4", label: "Building A2 · Roof", status: "open"},
];

const PANEL_D_ROWS: Row[] = [
	{id: "d-1", label: "Operation · HVAC piping", status: "open"},
	{id: "d-2", label: "Operation · Refrigerant pipework", status: "open"},
	{id: "d-3", label: "Operation · Pipework lagging", status: "done"},
];

export function FixedContent5Page() {
	const [fullscreen, setFullscreen] = useState(false);

	const [leftOpen, setLeftOpen] = useState(true);
	const [autoClosedA, setAutoClosedA] = useState(false);
	const [selectedC, setSelectedC] = useState<string | null>(null);
	const dOpen = selectedC !== null;

	const handleSelectC = (id: string) => {
		// Drilldown trigger: when selectedC transitions null → non-null,
		// auto-collapse A (and remember we did it so we can restore later).
		if (selectedC === null) {
			if (leftOpen) {
				setLeftOpen(false);
				setAutoClosedA(true);
			}
		}
		setSelectedC(id);
	};

	const handleCloseD = () => {
		setSelectedC(null);
		// Restore A only if we were the ones who closed it.
		if (autoClosedA) {
			setLeftOpen(true);
			setAutoClosedA(false);
		}
	};

	const handleOpenA = () => {
		setLeftOpen(true);
		setAutoClosedA(false); // user took control; don't auto-restore later
	};

	const handleCloseA = () => {
		setLeftOpen(false);
		setAutoClosedA(false);
	};

	// Width buckets: each visible panel gets `flex-1` so the layout balances
	// 3-open as w-1/3, 4-open as w-1/4 automatically.
	return (
		<div
			className={fullscreen ? "wwc:fixed wwc:inset-0 wwc:z-50 wwc:bg-background wwc:overflow-y-auto" : "wwc:space-y-8"}
		>
			{!fullscreen && (
				<div className="wwc:flex wwc:items-center wwc:justify-between">
					<div>
						<h1 className="wwc:text-3xl wwc:font-bold">Fixed Content #5</h1>
						<p className="wwc:text-muted-foreground wwc:mt-2">
							Four fixed panels with auto-collapsing drilldown. Starts with three open (A · B · C). Selecting an item in
							C mounts panel D and auto-collapses A. The user can manually re-open A (four open). Closing D returns to
							the initial state and restores A only if it was auto-closed.
						</p>
					</div>
					<Button variant="outline" size="sm" onClick={() => setFullscreen(true)}>
						<Maximize2 /> Fullscreen
					</Button>
				</div>
			)}

			<div
				className={`wwc:flex wwc:overflow-hidden ${fullscreen ? "wwc:h-screen" : "wwc:h-[600px] wwc:rounded-xl wwc:border"}`}
			>
				{/* Panel A — auto-collapses on first drilldown */}
				{leftOpen ? (
					<div className="wwc:flex-1 wwc:bg-background wwc:flex-shrink-0 wwc:border-r wwc:overflow-hidden wwc:transition-[flex-basis,width] wwc:duration-200 wwc:ease-in-out">
						<div className="wwc:h-full wwc:p-4 wwc:min-w-[200px]">
							<div className="wwc:flex wwc:items-center wwc:justify-between wwc:mb-3">
								<h3 className="wwc:text-sm wwc:font-semibold">Panel A</h3>
								<Button
									variant="ghost"
									icon
									className="wwc:h-7 wwc:w-7"
									onClick={handleCloseA}
									aria-label="Collapse Panel A"
								>
									<PanelLeftClose className="wwc:h-4 wwc:w-4" />
								</Button>
							</div>
							<p className="wwc:text-sm wwc:text-muted-foreground">Left context.</p>
						</div>
					</div>
				) : (
					<button
						type="button"
						onClick={handleOpenA}
						aria-label="Expand Panel A"
						className="wwc:group wwc:flex wwc:w-9 wwc:flex-shrink-0 wwc:flex-col wwc:items-center wwc:gap-3 wwc:border-r wwc:bg-muted/30 wwc:py-3 wwc:transition-colors wwc:hover:bg-muted/60 wwc:focus-visible:outline-none wwc:focus-visible:ring-1 wwc:focus-visible:ring-ring"
					>
						<PanelLeftOpen className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground wwc:group-hover:text-foreground" />
						<span
							className="wwc:text-xs wwc:font-semibold wwc:uppercase wwc:tracking-wider wwc:text-muted-foreground wwc:group-hover:text-foreground"
							style={{writingMode: "vertical-rl", transform: "rotate(180deg)"}}
						>
							Panel A
						</span>
					</button>
				)}

				{/* Panel B */}
				<div className="wwc:flex-1 wwc:flex wwc:flex-col wwc:bg-background wwc:min-w-0 wwc:border-r">
					<div className="wwc:flex wwc:items-center wwc:gap-2 wwc:p-4 wwc:pb-0">
						<h3 className="wwc:text-sm wwc:font-semibold">Panel B</h3>
					</div>
					<div className="wwc:p-4 wwc:pt-3 wwc:text-sm wwc:text-muted-foreground">Middle list.</div>
				</div>

				{/* Panel C — selecting a row triggers the drilldown */}
				<div className="wwc:flex-1 wwc:flex wwc:flex-col wwc:bg-background wwc:min-w-0">
					<div className="wwc:p-4 wwc:pb-0">
						<h3 className="wwc:text-sm wwc:font-semibold">Panel C</h3>
					</div>
					<div className="wwc:flex wwc:flex-col wwc:gap-1 wwc:p-4 wwc:pt-3">
						{ITEMS_C.map((id) => {
							const isSelected = selectedC === id;
							return (
								<button
									key={id}
									type="button"
									onClick={() => handleSelectC(id)}
									className={`wwc:rounded-md wwc:border wwc:px-3 wwc:py-2 wwc:text-left wwc:text-sm wwc:transition-colors ${
										isSelected
											? "wwc:border-primary wwc:bg-accent wwc:text-foreground"
											: "wwc:border-border wwc:bg-background wwc:text-foreground wwc:hover:bg-accent/50"
									}`}
								>
									{id}
								</button>
							);
						})}
					</div>
				</div>

				{/* Panel D — mounts only when selectedC is set */}
				<div
					className={`wwc:bg-background wwc:flex-shrink-0 wwc:transition-[flex-basis,width] wwc:duration-200 wwc:ease-in-out wwc:overflow-hidden ${dOpen ? "wwc:flex-1 wwc:border-l" : "wwc:w-0 wwc:border-l-0"}`}
				>
					<div className="wwc:h-full wwc:p-4 wwc:min-w-[200px]">
						<div className="wwc:flex wwc:items-center wwc:justify-between wwc:mb-3">
							<h3 className="wwc:text-sm wwc:font-semibold">Panel D</h3>
							<Button
								variant="ghost"
								icon
								className="wwc:h-7 wwc:w-7"
								onClick={handleCloseD}
								aria-label="Close Panel D"
							>
								<PanelRightClose className="wwc:h-4 wwc:w-4" />
							</Button>
						</div>
						<p className="wwc:text-sm wwc:text-muted-foreground">Detail for {selectedC ?? "—"}.</p>
					</div>
				</div>

				{/* Floating reopen affordance for D when it's been closed but C still has a selection */}
				{!dOpen && selectedC !== null && (
					<div className="wwc:flex wwc:items-start wwc:p-4">
						<Button
							variant="ghost"
							icon
							className="wwc:h-7 wwc:w-7"
							onClick={() => setSelectedC(selectedC)}
							aria-label="Open Panel D"
						>
							<PanelRightOpen className="wwc:h-4 wwc:w-4" />
						</Button>
					</div>
				)}
			</div>

			{!fullscreen && <FixedContent5Example />}
			{fullscreen && <FullscreenExitButton onExit={() => setFullscreen(false)} />}
		</div>
	);
}

interface PanelHeadProps {
	title: string;
	count?: number;
	search?: string;
	onSearchChange?: (s: string) => void;
	filter?: FilterValue;
	onFilterChange?: (next: FilterValue) => void;
	collapse?: React.ReactNode;
	disabled?: boolean;
}

function PanelHead({title, count, search, onSearchChange, filter, onFilterChange, collapse, disabled}: PanelHeadProps) {
	return (
		<div className="wwc:flex wwc:flex-col wwc:bg-card">
			<div className="wwc:flex wwc:h-12 wwc:flex-shrink-0 wwc:items-center wwc:justify-between wwc:gap-2 wwc:px-3">
				<div className="wwc:flex wwc:items-baseline wwc:gap-2">
					<h3 className={`wwc:text-sm wwc:font-semibold ${disabled ? "wwc:text-muted-foreground" : ""}`}>{title}</h3>
					{!disabled && count !== undefined && <span className="wwc:text-xs wwc:text-muted-foreground">{count}</span>}
				</div>
				{collapse}
			</div>
			{!disabled && search !== undefined && onSearchChange && filter && onFilterChange && (
				<SearchFilterBar
					search={search}
					onSearchChange={onSearchChange}
					searchPlaceholder={`Search ${title.toLowerCase()}…`}
					trailing={
						<Filter value={filter} onChange={onFilterChange}>
							<FilterTrigger />
							<FilterContent>
								<FilterCategory value="status" label="Status">
									<FilterOption value="open">Open</FilterOption>
									<FilterOption value="done">Done</FilterOption>
								</FilterCategory>
							</FilterContent>
						</Filter>
					}
				/>
			)}
		</div>
	);
}

function PanelEmpty({message}: {message: string}) {
	return (
		<div className="wwc:flex wwc:flex-1 wwc:items-center wwc:justify-center wwc:p-6 wwc:text-center wwc:text-xs wwc:text-muted-foreground">
			{message}
		</div>
	);
}

function applyFilters(rows: Row[], search: string, filter: FilterValue): Row[] {
	const q = search.trim().toLowerCase();
	const statuses = filter.status;
	return rows.filter((r) => {
		if (statuses && statuses.length > 0 && !statuses.includes(r.status)) return false;
		if (q && !r.label.toLowerCase().includes(q)) return false;
		return true;
	});
}

function FixedContent5Example() {
	const [leftOpen, setLeftOpen] = useState(true);
	const [autoClosedA, setAutoClosedA] = useState(false);

	const [selectedA, setSelectedA] = useState<string | null>(null);
	const [selectedB, setSelectedB] = useState<string | null>(null);
	const [selectedCRow, setSelectedCRow] = useState<string | null>(null);

	const bEnabled = selectedA !== null;
	const cEnabled = selectedB !== null;
	const dOpen = selectedCRow !== null;

	const [aSearch, setASearch] = useState("");
	const [bSearch, setBSearch] = useState("");
	const [cSearch, setCSearch] = useState("");
	const [dSearch, setDSearch] = useState("");

	const [aFilter, setAFilter] = useState<FilterValue>({});
	const [bFilter, setBFilter] = useState<FilterValue>({});
	const [cFilter, setCFilter] = useState<FilterValue>({});
	const [dFilter, setDFilter] = useState<FilterValue>({});

	const aRows = useMemo(() => applyFilters(PANEL_A_ROWS, aSearch, aFilter), [aSearch, aFilter]);
	const bRows = useMemo(() => applyFilters(PANEL_B_ROWS, bSearch, bFilter), [bSearch, bFilter]);
	const cRows = useMemo(() => applyFilters(PANEL_C_ROWS, cSearch, cFilter), [cSearch, cFilter]);
	const dRows = useMemo(() => applyFilters(PANEL_D_ROWS, dSearch, dFilter), [dSearch, dFilter]);

	const handleSelectA = (id: string) => {
		setSelectedA(id);
		// New A selection invalidates downstream selections.
		setSelectedB(null);
		setSelectedCRow(null);
		if (autoClosedA) {
			setLeftOpen(true);
			setAutoClosedA(false);
		}
	};

	const handleSelectB = (id: string) => {
		setSelectedB(id);
		setSelectedCRow(null);
	};

	const handleSelectC = (id: string) => {
		if (selectedCRow === null && leftOpen) {
			setLeftOpen(false);
			setAutoClosedA(true);
		}
		setSelectedCRow(id);
	};

	const handleCloseD = () => {
		setSelectedCRow(null);
		if (autoClosedA) {
			setLeftOpen(true);
			setAutoClosedA(false);
		}
	};

	const handleOpenA = () => {
		setLeftOpen(true);
		setAutoClosedA(false);
	};

	const handleCloseA = () => {
		setLeftOpen(false);
		setAutoClosedA(false);
	};

	return (
		<div className="wwc:space-y-4">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h2 className="wwc:text-2xl wwc:font-bold">Example</h2>
					<CopyButton
						value="Fixed Content #5 - Example"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Sequential drilldown: pick a region in Panel A to populate Sites, then a site to populate Floors, then a floor
					to open the Operations panel. Panels show empty-state messaging until their prerequisite is selected.
					Selecting a floor auto-collapses Panel A so the workspace fits three columns plus the detail.
				</p>
			</div>

			<div className="wwc:flex wwc:h-[640px] wwc:overflow-hidden wwc:rounded-xl wwc:border">
				{/* Panel A */}
				{leftOpen ? (
					<div className="wwc:flex wwc:flex-1 wwc:flex-shrink-0 wwc:flex-col wwc:overflow-hidden wwc:border-r wwc:bg-background wwc:transition-[flex-basis,width] wwc:duration-200 wwc:ease-in-out">
						<PanelHead
							title="Regions"
							count={aRows.length}
							search={aSearch}
							onSearchChange={setASearch}
							filter={aFilter}
							onFilterChange={setAFilter}
							collapse={
								<Button
									variant="ghost"
									icon
									className="wwc:h-7 wwc:w-7"
									onClick={handleCloseA}
									aria-label="Collapse Panel A"
								>
									<PanelLeftClose className="wwc:h-4 wwc:w-4" />
								</Button>
							}
						/>
						<RowList rows={aRows} selectedId={selectedA} onSelect={handleSelectA} />
					</div>
				) : (
					<button
						type="button"
						onClick={handleOpenA}
						aria-label="Expand Panel A"
						className="wwc:group wwc:flex wwc:w-9 wwc:flex-shrink-0 wwc:flex-col wwc:items-center wwc:gap-3 wwc:border-r wwc:bg-muted/30 wwc:py-3 wwc:transition-colors wwc:hover:bg-muted/60 wwc:focus-visible:outline-none wwc:focus-visible:ring-1 wwc:focus-visible:ring-ring"
					>
						<PanelLeftOpen className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground wwc:group-hover:text-foreground" />
						<span
							className="wwc:text-xs wwc:font-semibold wwc:uppercase wwc:tracking-wider wwc:text-muted-foreground wwc:group-hover:text-foreground"
							style={{writingMode: "vertical-rl", transform: "rotate(180deg)"}}
						>
							Regions
						</span>
					</button>
				)}

				{/* Panel B */}
				<div className="wwc:flex wwc:flex-1 wwc:min-w-0 wwc:flex-col wwc:overflow-hidden wwc:border-r wwc:bg-background">
					{bEnabled ? (
						<>
							<PanelHead
								title="Sites"
								count={bRows.length}
								search={bSearch}
								onSearchChange={setBSearch}
								filter={bFilter}
								onFilterChange={setBFilter}
							/>
							<RowList rows={bRows} selectedId={selectedB} onSelect={handleSelectB} />
						</>
					) : (
						<>
							<PanelHead title="Sites" disabled />
							<PanelEmpty message="Select a region to see its sites." />
						</>
					)}
				</div>

				{/* Panel C */}
				<div className="wwc:flex wwc:flex-1 wwc:min-w-0 wwc:flex-col wwc:overflow-hidden wwc:bg-background">
					{cEnabled ? (
						<>
							<PanelHead
								title="Floors"
								count={cRows.length}
								search={cSearch}
								onSearchChange={setCSearch}
								filter={cFilter}
								onFilterChange={setCFilter}
							/>
							<RowList rows={cRows} selectedId={selectedCRow} onSelect={handleSelectC} />
						</>
					) : (
						<>
							<PanelHead title="Floors" disabled />
							<PanelEmpty
								message={selectedA === null ? "Select a region first." : "Select a site to see its floors."}
							/>
						</>
					)}
				</div>

				{/* Panel D */}
				<div
					className={`wwc:bg-background wwc:flex-shrink-0 wwc:overflow-hidden wwc:transition-[flex-basis,width] wwc:duration-200 wwc:ease-in-out ${
						dOpen ? "wwc:flex wwc:flex-1 wwc:flex-col wwc:border-l" : "wwc:w-0 wwc:border-l-0"
					}`}
				>
					<PanelHead
						title="Operations"
						count={dRows.length}
						search={dSearch}
						onSearchChange={setDSearch}
						filter={dFilter}
						onFilterChange={setDFilter}
						collapse={
							<Button
								variant="ghost"
								icon
								className="wwc:h-7 wwc:w-7"
								onClick={handleCloseD}
								aria-label="Close Panel D"
							>
								<PanelRightClose className="wwc:h-4 wwc:w-4" />
							</Button>
						}
					/>
					<RowList rows={dRows} />
				</div>
			</div>
		</div>
	);
}

interface RowListProps {
	rows: Row[];
	selectedId?: string | null;
	onSelect?: (id: string) => void;
}

function RowList({rows, selectedId, onSelect}: RowListProps) {
	if (rows.length === 0) {
		return (
			<div className="wwc:flex wwc:flex-1 wwc:items-center wwc:justify-center wwc:p-4 wwc:text-xs wwc:text-muted-foreground">
				No rows match
			</div>
		);
	}
	return (
		<div className="wwc:flex wwc:flex-1 wwc:flex-col wwc:gap-1 wwc:overflow-y-auto wwc:p-3">
			{rows.map((row) => {
				const isSelected = selectedId === row.id;
				const interactive = onSelect !== undefined;
				const className = `wwc:rounded-md wwc:border wwc:px-3 wwc:py-2 wwc:text-left wwc:text-sm wwc:transition-colors ${
					isSelected
						? "wwc:border-primary wwc:bg-accent wwc:text-foreground"
						: "wwc:border-border wwc:bg-background wwc:text-foreground"
				} ${interactive ? "wwc:cursor-pointer wwc:hover:bg-accent/50" : ""}`;
				if (interactive) {
					return (
						<button key={row.id} type="button" onClick={() => onSelect?.(row.id)} className={className}>
							<div className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-2">
								<span className="wwc:truncate">{row.label}</span>
								<span className="wwc:text-xs wwc:text-muted-foreground wwc:capitalize">{row.status}</span>
							</div>
						</button>
					);
				}
				return (
					<div key={row.id} className={className}>
						<div className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-2">
							<span className="wwc:truncate">{row.label}</span>
							<span className="wwc:text-xs wwc:text-muted-foreground wwc:capitalize">{row.status}</span>
						</div>
					</div>
				);
			})}
		</div>
	);
}
