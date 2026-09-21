import {cn} from "@wakecap/core-utils";
import {differenceInDays, eachDayOfInterval, eachMonthOfInterval, endOfMonth, format, isToday} from "date-fns";
import * as React from "react";

// Types
export interface GanttTask {
	id: string;
	name: string;
	startDate: Date;
	endDate: Date;
	progress?: number;
	color?: "default" | "muted" | "accent" | "chart1" | "chart2" | "chart3" | "chart4" | "chart5";
	children?: GanttTask[];
}

export interface GanttResource {
	id: string;
	name: string;
	avatar?: string;
	role?: string;
	department?: string;
	tasks: GanttTask[];
}

interface GanttContextValue {
	startDate: Date;
	endDate: Date;
	columnWidth: number;
	rowHeight: number;
	sidebarWidth: number;
	timelineRef: React.RefObject<HTMLDivElement | null>;
}

const GanttContext = React.createContext<GanttContextValue | null>(null);

function useGantt() {
	const context = React.useContext(GanttContext);
	if (!context) {
		throw new Error("useGantt must be used within a GanttProvider");
	}
	return context;
}

// Color variants for bars - aligned with design system
// Chart colors are light orange/amber, so they need dark text for contrast
const barColors = {
	default: "wwc:bg-primary wwc:text-primary-foreground",
	muted: "wwc:bg-muted wwc:text-muted-foreground",
	accent: "wwc:bg-accent wwc:text-accent-foreground",
	chart1: "wwc:bg-chart-1 wwc:text-zinc-900",
	chart2: "wwc:bg-chart-2 wwc:text-zinc-900",
	chart3: "wwc:bg-chart-3 wwc:text-zinc-900",
	chart4: "wwc:bg-chart-4 wwc:text-zinc-900",
	chart5: "wwc:bg-chart-5 wwc:text-zinc-900",
};

// Main Gantt Container
interface GanttProps extends React.HTMLAttributes<HTMLDivElement> {
	startDate: Date;
	endDate: Date;
	columnWidth?: number;
	rowHeight?: number;
	sidebarWidth?: number;
}

/** Gantt chart for project timeline visualization with task dependencies. */
const Gantt = React.forwardRef<HTMLDivElement, GanttProps>(
	({className, children, startDate, endDate, columnWidth = 40, rowHeight = 50, sidebarWidth = 300, ...props}, ref) => {
		const timelineRef = React.useRef<HTMLDivElement>(null);

		const contextValue = React.useMemo(
			() => ({
				startDate,
				endDate,
				columnWidth,
				rowHeight,
				sidebarWidth,
				timelineRef,
			}),
			[startDate, endDate, columnWidth, rowHeight, sidebarWidth],
		);

		return (
			<GanttContext.Provider value={contextValue}>
				<div
					ref={ref}
					className={cn("wwc:flex wwc:flex-col wwc:border wwc:rounded-lg wwc:overflow-hidden", className)}
					{...props}
				>
					{children}
				</div>
			</GanttContext.Provider>
		);
	},
);
Gantt.displayName = "Gantt";

// Gantt Header with months and days
interface GanttHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
	sidebarHeader?: React.ReactNode;
}

const GanttHeader = React.forwardRef<HTMLDivElement, GanttHeaderProps>(({className, sidebarHeader, ...props}, ref) => {
	const {startDate, endDate, columnWidth, sidebarWidth, timelineRef} = useGantt();

	const months = eachMonthOfInterval({start: startDate, end: endDate});
	const days = eachDayOfInterval({start: startDate, end: endDate});
	const totalWidth = days.length * columnWidth;

	// Sync scroll with timeline body
	const headerTimelineRef = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		const timeline = timelineRef.current;
		const headerTimeline = headerTimelineRef.current;

		if (!timeline || !headerTimeline) return;

		const handleScroll = () => {
			headerTimeline.scrollLeft = timeline.scrollLeft;
		};

		timeline.addEventListener("scroll", handleScroll);
		return () => timeline.removeEventListener("scroll", handleScroll);
	}, [timelineRef]);

	return (
		<div ref={ref} className={cn("wwc:flex wwc:border-b wwc:bg-muted/30", className)} {...props}>
			{/* Sidebar header - fixed */}
			<div
				className="wwc:shrink-0 wwc:border-r wwc:bg-card wwc:flex wwc:items-center wwc:px-3"
				style={{width: sidebarWidth}}
			>
				{sidebarHeader && <span className="wwc:text-sm wwc:font-medium wwc:text-foreground">{sidebarHeader}</span>}
			</div>

			{/* Timeline header - synced scroll, hidden scrollbar */}
			<div ref={headerTimelineRef} className="wwc:flex-1 wwc:overflow-hidden">
				<div className="wwc:flex wwc:flex-col" style={{width: totalWidth}}>
					{/* Months row */}
					<div className="wwc:flex wwc:border-b">
						{months.map((month) => {
							const monthStart = month < startDate ? startDate : month;
							const monthEnd = endOfMonth(month) > endDate ? endDate : endOfMonth(month);
							const daysInMonth = differenceInDays(monthEnd, monthStart) + 1;
							const width = daysInMonth * columnWidth;

							return (
								<div
									key={month.toISOString()}
									className="wwc:text-xs wwc:font-medium wwc:text-muted-foreground wwc:px-2 wwc:py-1.5 wwc:border-r wwc:shrink-0 wwc:truncate wwc:overflow-hidden"
									style={{width}}
								>
									{format(month, "MMMM yyyy")}
								</div>
							);
						})}
					</div>

					{/* Days row */}
					<div className="wwc:flex">
						{days.map((day) => (
							<div
								key={day.toISOString()}
								className={cn(
									"wwc:text-[10px] wwc:text-center wwc:py-1 wwc:border-r wwc:shrink-0",
									isToday(day) && "wwc:bg-primary wwc:text-primary-foreground wwc:font-medium",
									!isToday(day) && "wwc:text-muted-foreground",
								)}
								style={{width: columnWidth}}
							>
								{format(day, "d")}
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
});
GanttHeader.displayName = "GanttHeader";

// Helper to flatten children (handles fragments)
function flattenChildren(children: React.ReactNode): React.ReactElement[] {
	const result: React.ReactElement[] = [];

	React.Children.forEach(children, (child) => {
		if (!React.isValidElement(child)) return;

		// Handle fragments
		if (child.type === React.Fragment) {
			const fragmentProps = child.props as {children?: React.ReactNode};
			result.push(...flattenChildren(fragmentProps.children));
		} else {
			result.push(child);
		}
	});

	return result;
}

// Gantt Body - contains sidebar and scrollable timeline
interface GanttBodyProps extends React.HTMLAttributes<HTMLDivElement> {
	showTodayLine?: boolean;
}

const GanttBody = React.forwardRef<HTMLDivElement, GanttBodyProps>(
	({className, children, showTodayLine = true, ...props}, ref) => {
		const {startDate, endDate, columnWidth, sidebarWidth, timelineRef} = useGantt();

		// Calculate total timeline width
		const days = eachDayOfInterval({start: startDate, end: endDate});
		const totalWidth = days.length * columnWidth;

		// Flatten children to handle fragments
		const flatChildren = flattenChildren(children);
		const rowChildren = flatChildren.filter((child) => child.type === GanttRow);

		return (
			<div ref={ref} className={cn("wwc:flex wwc:overflow-hidden", className)} {...props}>
				{/* Fixed sidebar */}
				<div
					className="wwc:shrink-0 wwc:border-r wwc:overflow-y-auto wwc:overflow-x-hidden"
					style={{width: sidebarWidth}}
				>
					{rowChildren.map((child, index) =>
						React.cloneElement(child as React.ReactElement<GanttRowProps>, {
							key: child.key ?? index,
							_renderSidebar: true,
						}),
					)}
				</div>

				{/* Scrollable timeline */}
				<div
					ref={timelineRef as React.RefObject<HTMLDivElement>}
					className="wwc:flex-1 wwc:overflow-x-auto wwc:overflow-y-auto"
				>
					<div className="wwc:relative" style={{minWidth: totalWidth}}>
						{showTodayLine && <GanttTodayLine />}
						{rowChildren.map((child, index) =>
							React.cloneElement(child as React.ReactElement<GanttRowProps>, {
								key: child.key ?? index,
								_renderTimeline: true,
							}),
						)}
					</div>
				</div>
			</div>
		);
	},
);
GanttBody.displayName = "GanttBody";

// Gantt Row
interface GanttRowProps extends React.HTMLAttributes<HTMLDivElement> {
	isGroup?: boolean;
	_renderSidebar?: boolean;
	_renderTimeline?: boolean;
}

const GanttRow = React.forwardRef<HTMLDivElement, GanttRowProps>(
	({className, children, isGroup = false, _renderSidebar, _renderTimeline, ...props}, ref) => {
		const {rowHeight} = useGantt();

		// Find sidebar and timeline children
		let sidebarChild: React.ReactNode = null;
		let timelineChild: React.ReactNode = null;

		React.Children.forEach(children, (child) => {
			if (React.isValidElement(child)) {
				if (child.type === GanttSidebarCell) {
					sidebarChild = child;
				} else if (child.type === GanttTimelineCell) {
					timelineChild = child;
				}
			}
		});

		// Render only sidebar part
		if (_renderSidebar) {
			return (
				<div
					ref={ref}
					className={cn(
						"wwc:flex wwc:w-full wwc:border-b wwc:border-border wwc:hover:bg-muted/30 wwc:transition-colors",
						isGroup && "wwc:bg-muted/20",
						className,
					)}
					style={{minHeight: rowHeight}}
					{...props}
				>
					{sidebarChild}
				</div>
			);
		}

		// Render only timeline part
		if (_renderTimeline) {
			return (
				<div
					className={cn(
						"wwc:flex wwc:border-b wwc:border-border wwc:hover:bg-muted/30 wwc:transition-colors wwc:w-fit wwc:min-w-full",
						isGroup && "wwc:bg-muted/20",
					)}
					style={{minHeight: rowHeight}}
				>
					{timelineChild}
				</div>
			);
		}

		// Default: render both (for backwards compatibility)
		return (
			<div
				ref={ref}
				className={cn(
					"wwc:flex wwc:border-b wwc:border-border wwc:hover:bg-muted/30 wwc:transition-colors",
					isGroup && "wwc:bg-muted/20",
					className,
				)}
				style={{minHeight: rowHeight}}
				{...props}
			>
				{children}
			</div>
		);
	},
);
GanttRow.displayName = "GanttRow";

// Gantt Sidebar Cell (left panel)
const GanttSidebarCell = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({className, children, ...props}, ref) => {
		return (
			<div
				ref={ref}
				className={cn("wwc:flex-1 wwc:px-3 wwc:py-2 wwc:flex wwc:items-center wwc:bg-card wwc:self-stretch", className)}
				{...props}
			>
				{children}
			</div>
		);
	},
);
GanttSidebarCell.displayName = "GanttSidebarCell";

// Gantt Timeline Cell (right panel with grid)
const GanttTimelineCell = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({className, children, ...props}, ref) => {
		const {startDate, endDate, columnWidth} = useGantt();
		const days = eachDayOfInterval({start: startDate, end: endDate});
		const totalWidth = days.length * columnWidth;

		return (
			<div ref={ref} className={cn("wwc:relative", className)} style={{width: totalWidth}} {...props}>
				{/* Grid lines */}
				<div className="wwc:absolute wwc:inset-0 wwc:flex wwc:pointer-events-none">
					{days.map((day) => (
						<div
							key={day.toISOString()}
							className={cn("wwc:border-r wwc:h-full wwc:shrink-0", isToday(day) && "wwc:bg-primary/5")}
							style={{width: columnWidth}}
						/>
					))}
				</div>

				{/* Content */}
				<div className="wwc:relative wwc:h-full wwc:flex wwc:items-center wwc:py-1">{children}</div>
			</div>
		);
	},
);
GanttTimelineCell.displayName = "GanttTimelineCell";

// Gantt Bar
interface GanttBarProps extends React.HTMLAttributes<HTMLDivElement> {
	startDate: Date;
	endDate: Date;
	color?: "default" | "muted" | "accent" | "chart1" | "chart2" | "chart3" | "chart4" | "chart5";
	progress?: number;
	label?: string;
	showLabel?: boolean;
}

const GanttBar = React.forwardRef<HTMLDivElement, GanttBarProps>(
	(
		{className, startDate: taskStart, endDate: taskEnd, color = "default", progress, label, showLabel = true, ...props},
		ref,
	) => {
		const {startDate: chartStart, columnWidth} = useGantt();

		const offsetDays = differenceInDays(taskStart, chartStart);
		const durationDays = differenceInDays(taskEnd, taskStart) + 1;

		const left = offsetDays * columnWidth;
		const width = durationDays * columnWidth;

		return (
			<div
				ref={ref}
				className={cn(
					"wwc:absolute wwc:h-7 wwc:rounded-md wwc:flex wwc:items-center wwc:px-2 wwc:text-xs wwc:font-medium wwc:shadow-sm",
					barColors[color],
					className,
				)}
				style={{
					left,
					width: Math.max(width, columnWidth),
				}}
				{...props}
			>
				{showLabel && label && <span className="wwc:truncate">{label}</span>}
				{progress !== undefined && <span className="wwc:ml-auto wwc:text-[10px] wwc:opacity-80">{progress}%</span>}
			</div>
		);
	},
);
GanttBar.displayName = "GanttBar";

// Gantt Today Line
const GanttTodayLine = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({className, ...props}, ref) => {
		const {startDate, columnWidth} = useGantt();

		const today = new Date();
		const offsetDays = differenceInDays(today, startDate);
		const left = offsetDays * columnWidth + columnWidth / 2;

		if (offsetDays < 0) return null;

		return (
			<div
				ref={ref}
				className={cn(
					"wwc:absolute wwc:top-0 wwc:bottom-0 wwc:w-0.5 wwc:bg-foreground wwc:z-50 wwc:pointer-events-none",
					className,
				)}
				style={{left}}
				{...props}
			>
				<div className="wwc:absolute wwc:top-2 wwc:left-1/2 wwc:-translate-x-1/2 wwc:bg-foreground wwc:text-background wwc:text-[10px] wwc:px-1.5 wwc:py-0.5 wwc:rounded wwc:font-medium wwc:whitespace-nowrap wwc:shadow-md">
					Today
				</div>
			</div>
		);
	},
);
GanttTodayLine.displayName = "GanttTodayLine";

// Gantt Milestone (diamond marker)
interface GanttMilestoneProps extends React.HTMLAttributes<HTMLDivElement> {
	date: Date;
	color?: "default" | "muted" | "accent" | "chart1" | "chart2" | "chart3" | "chart4" | "chart5";
}

const GanttMilestone = React.forwardRef<HTMLDivElement, GanttMilestoneProps>(
	({className, date, color = "default", ...props}, ref) => {
		const {startDate: chartStart, columnWidth} = useGantt();

		const offsetDays = differenceInDays(date, chartStart);
		const left = offsetDays * columnWidth + columnWidth / 2;

		return (
			<div
				ref={ref}
				className={cn("wwc:absolute wwc:w-3 wwc:h-3 wwc:rotate-45", barColors[color], className)}
				style={{
					left: left - 6,
				}}
				{...props}
			/>
		);
	},
);
GanttMilestone.displayName = "GanttMilestone";

// Utility function to calculate date position
function getDatePosition(date: Date, chartStart: Date, columnWidth: number) {
	const offsetDays = differenceInDays(date, chartStart);
	return offsetDays * columnWidth;
}

export {
	Gantt,
	GanttHeader,
	GanttBody,
	GanttRow,
	GanttSidebarCell,
	GanttTimelineCell,
	GanttBar,
	GanttTodayLine,
	GanttMilestone,
	useGantt,
	getDatePosition,
};

export type {GanttHeaderProps};
