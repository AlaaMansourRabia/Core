import {cn} from "@wakecap/core-utils";
import {ChevronLeft, ChevronRight, Video, X} from "lucide-react";
import {useRef} from "react";

import {Button} from "./button";
import {Input} from "./input";
import {Progress} from "./progress";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "./table";

/** A single operation line in the drawer's table. */
export interface OperationRow {
	/** Operation name — the bold first line (e.g. "Backfill"). */
	name: string;
	/** Operation code — the muted second line (e.g. "BF-01"). */
	code: string;
	/** Weight of the operation. */
	wt: string;
	/** Previous progress. */
	prev: string;
	/** Budget at completion. */
	bac: string;
	/** Earned value. */
	ev: string;
	/** Editable progress value shown in the input (e.g. "100%"). */
	progress: string;
	/** Called when the progress input changes. */
	onProgressChange?: (value: string) => void;
}

export interface OperationsDrawerProps {
	/** Bold title — the object identifier (e.g. "2266-DP1-R-SS"). */
	title: string;
	/** Full WBS path, shown muted under the title. */
	wbs: string;
	/** Overall completion percentage (0–100) for the header bar. */
	progress: number;
	/** Optional pager shown beside the title (e.g. 1 of 4). */
	page?: {current: number; total: number};
	/** Operation rows for the table. */
	rows: OperationRow[];
	onWalkthrough?: () => void;
	onClose?: () => void;
	onPrev?: () => void;
	onNext?: () => void;
	onDiscard?: () => void;
	onSave?: () => void;
	className?: string;
}

const numericHead = "wwc:h-9 wwc:w-12 wwc:px-1.5 wwc:text-center wwc:text-[11px] wwc:uppercase wwc:tracking-wide";
const numericCell = "wwc:px-1.5 wwc:text-center wwc:text-xs wwc:text-foreground";

/**
 * A drawer for reviewing and editing the operations under a single object: a header (identifier, WBS
 * path, overall progress, and a walkthrough button), a compact per-operation table with an editable
 * progress field, and a discard / save footer (Save is disabled until a progress value changes).
 * Composed from Wakecore Table, Progress, Input, and Button.
 */
export function OperationsDrawer({
	title,
	wbs,
	progress,
	page,
	rows,
	onWalkthrough,
	onClose,
	onPrev,
	onNext,
	onDiscard,
	onSave,
	className,
}: OperationsDrawerProps) {
	// Snapshot the progress values first seen for this set of operations; Save enables only once a value
	// diverges from that snapshot. A new operation set (e.g. paging to another object) re-snapshots.
	const rowsKey = rows.map((r) => r.code).join("|");
	const snapshotKey = useRef("");
	const initialByCode = useRef<Record<string, string>>({});
	if (snapshotKey.current !== rowsKey) {
		snapshotKey.current = rowsKey;
		initialByCode.current = Object.fromEntries(rows.map((r) => [r.code, r.progress]));
	}
	const dirty = rows.some((r) => r.progress !== initialByCode.current[r.code]);

	return (
		<div
			className={cn(
				"wwc:flex wwc:h-full wwc:w-[440px] wwc:max-w-full wwc:flex-col wwc:overflow-hidden wwc:rounded-b-lg wwc:border wwc:border-border wwc:bg-background wwc:shadow-lg",
				className,
			)}
		>
			{/* Header */}
			<div className="wwc:flex wwc:flex-col wwc:gap-3 wwc:px-5 wwc:py-4">
				<div className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-2">
					<h2 className="wwc:truncate wwc:text-sm wwc:font-bold wwc:text-foreground">{title}</h2>
					<div className="wwc:flex wwc:shrink-0 wwc:items-center wwc:gap-1">
						{page && (
							<div className="wwc:flex wwc:items-center wwc:text-muted-foreground">
								<Button variant="ghost" size="sm" icon aria-label="Previous object" onClick={onPrev}>
									<ChevronLeft />
								</Button>
								<span className="wwc:tabular-nums wwc:text-xs">
									{page.current} / {page.total}
								</span>
								<Button variant="ghost" size="sm" icon aria-label="Next object" onClick={onNext}>
									<ChevronRight />
								</Button>
							</div>
						)}
						<Button variant="ghost" size="sm" icon aria-label="Close" onClick={onClose}>
							<X />
						</Button>
					</div>
				</div>

				<p className="wwc:text-xs wwc:text-muted-foreground">{wbs}</p>

				<div className="wwc:flex wwc:items-center wwc:gap-3">
					<Progress value={progress} className="wwc:h-1.5 wwc:flex-1" />
					<span className="wwc:shrink-0 wwc:text-xs wwc:font-semibold wwc:text-muted-foreground">{progress}%</span>
				</div>

				<div>
					<Button variant="outline" size="sm" onClick={onWalkthrough}>
						<Video />
						Walkthrough
					</Button>
				</div>
			</div>

			{/* Operations table */}
			<div className="wwc:min-h-0 wwc:flex-1 wwc:overflow-y-auto wwc:border-t wwc:border-border">
				<Table>
					<TableHeader className="wwc:bg-muted">
						<TableRow className="wwc:hover:bg-muted">
							<TableHead className="wwc:h-9 wwc:px-4 wwc:text-[11px] wwc:uppercase wwc:tracking-wide">
								Operation
							</TableHead>
							<TableHead className={numericHead}>WT</TableHead>
							<TableHead className={numericHead}>Prev</TableHead>
							<TableHead className={numericHead}>BAC</TableHead>
							<TableHead className={numericHead}>EV</TableHead>
							<TableHead className="wwc:h-9 wwc:w-[88px] wwc:px-3 wwc:text-right wwc:text-[11px] wwc:uppercase wwc:tracking-wide">
								Progress
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{rows.map((row) => (
							<TableRow key={row.code}>
								<TableCell className="wwc:px-4 wwc:py-2.5">
									<div className="wwc:flex wwc:flex-col">
										<span className="wwc:truncate wwc:text-xs wwc:font-semibold wwc:text-foreground" title={row.name}>
											{row.name}
										</span>
										<span className="wwc:text-[11px] wwc:text-muted-foreground">{row.code}</span>
									</div>
								</TableCell>
								<TableCell className={numericCell}>{row.wt}</TableCell>
								<TableCell className={numericCell}>{row.prev}</TableCell>
								<TableCell className={numericCell}>{row.bac}</TableCell>
								<TableCell className={numericCell}>{row.ev}</TableCell>
								<TableCell className="wwc:px-3 wwc:py-2.5">
									<Input
										value={row.progress}
										onChange={(e) => row.onProgressChange?.(e.target.value)}
										aria-label={`${row.name} progress`}
										className="wwc:ml-auto wwc:h-8 wwc:w-14 wwc:px-2 wwc:text-center wwc:text-xs"
									/>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{/* Footer */}
			<div className="wwc:flex wwc:items-center wwc:justify-between wwc:border-t wwc:border-border wwc:px-5 wwc:py-3">
				<Button variant="ghost" onClick={onDiscard}>
					Discard
				</Button>
				<Button onClick={onSave} disabled={!dirty}>
					Save changes
				</Button>
			</div>
		</div>
	);
}
