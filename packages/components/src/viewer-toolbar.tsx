import {cn} from "@core/core-utils";
import {
	Box,
	EyeOff,
	Ghost,
	Hand,
	Layers,
	type LucideIcon,
	Maximize2,
	Orbit,
	Ruler,
	Scan,
	Scissors,
	Sparkles,
	Square,
	Triangle,
} from "lucide-react";
import * as React from "react";

import {Button} from "./button";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "./dropdown-menu";
import {useFragmentViewer} from "./fragment-viewer/context";
import type {MeasurementKind, NavigationMode} from "./fragment-viewer/runtime";
import {Separator} from "./separator";
import {Toolbar} from "./toolbar";

/**
 * The control bar for a FragmentViewer: navigation (orbit/pan), fit, ortho, sections, measurement, an
 * IFC-storey menu, hide/isolate/show-all, and an appearance menu of ghost mode and shading toggles.
 *
 * Chrome only — every button calls the viewer API from context, so this file owns no 3D code. It is
 * a sibling of FragmentViewer rather than part of it, so a template can place it where it likes:
 * docked above the canvas, floating over it, or split across two surfaces.
 */

export interface ViewerToolbarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "children"> {
	/** Hide groups that don't apply to a given surface. */
	show?: {navigation?: boolean; tools?: boolean; visibility?: boolean; levels?: boolean; appearance?: boolean};
	/** Extra controls appended after a divider at the end of the bar. Receives the current density so
	 * a `ToolButton` here can match the built-in ones (icon-only when the bar is compact). */
	extra?: (ctx: {compact: boolean}) => React.ReactNode;
}

const NAVIGATION: {mode: NavigationMode; label: string; icon: LucideIcon}[] = [
	{mode: "Orbit", label: "Orbit", icon: Orbit},
	{mode: "Pan", label: "Pan", icon: Hand},
];

const MEASUREMENTS: {kind: MeasurementKind; label: string; icon: LucideIcon}[] = [
	{kind: "length", label: "Length", icon: Ruler},
	{kind: "area", label: "Area", icon: Square},
	{kind: "angle", label: "Angle", icon: Triangle},
	{kind: "volume", label: "Volume", icon: Box},
];

/**
 * Width the bar needs for labelled buttons, and the floor below which even icons must wrap.
 * Measured from the rendered bar rather than guessed: ~62px per labelled control, ~40px per icon.
 */
const LABELLED_MIN_PX = 820;
const ICONS_MIN_PX = 520;

type Density = "labels" | "icons" | "wrap";

/**
 * Keep the bar on one line for as long as it fits: drop the labels first, and only wrap once even
 * the icons won't fit. Measured from the parent, because measuring the bar itself is circular —
 * going icon-only makes it narrower, which would immediately satisfy the labelled test again.
 */
function useDensity(ref: React.RefObject<HTMLDivElement | null>): Density {
	const [density, setDensity] = React.useState<Density>("labels");

	React.useEffect(() => {
		// offsetParent, not parentElement: hosts commonly wrap a floating toolbar in a content-sized
		// box, and measuring that is circular — it is only ever as wide as the bar itself. The nearest
		// positioned ancestor is the surface the bar actually has to fit into.
		const element = ref.current;
		if (!element) return;
		const host = (element.offsetParent as HTMLElement | null) ?? element.parentElement;
		if (!host) return;
		const measure = () => {
			const width = host.clientWidth;
			setDensity(width >= LABELLED_MIN_PX ? "labels" : width >= ICONS_MIN_PX ? "icons" : "wrap");
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(host);
		return () => observer.disconnect();
	}, [ref]);

	return density;
}

/** A labelled toolbar button — the stacked icon-over-label shape BIM viewers use. Exported so a
 * consumer's `extra` slot can add buttons that match the bar exactly. */
export function ToolButton({
	icon: Icon,
	label,
	active,
	disabled,
	compact,
	onClick,
}: {
	icon: LucideIcon;
	label: string;
	active?: boolean;
	disabled?: boolean;
	/** Icon only. The label moves to the accessible name so the control stays announced. */
	compact?: boolean;
	onClick?: () => void;
}) {
	return (
		<Button
			variant={active ? "secondary" : "ghost"}
			size="sm"
			aria-pressed={active}
			aria-label={compact ? label : undefined}
			title={compact ? label : undefined}
			disabled={disabled}
			onClick={onClick}
			className={cn(
				"wwc:flex-col wwc:gap-0.5 wwc:font-medium",
				compact ? "wwc:h-9 wwc:w-9 wwc:px-0" : "wwc:h-11 wwc:px-2.5 wwc:text-[11px]",
			)}
		>
			<Icon className="wwc:h-4 wwc:w-4" />
			{!compact && label}
		</Button>
	);
}

const ViewerToolbar = React.forwardRef<HTMLDivElement, ViewerToolbarProps>(
	({show, className, extra, ...props}, ref) => {
		const {state, api} = useFragmentViewer();
		const innerRef = React.useRef<HTMLDivElement>(null);
		React.useImperativeHandle(ref, () => innerRef.current as HTMLDivElement);
		const density = useDensity(innerRef);
		// The SDK has no getter for postproduction, so the toolbar remembers what it last set.
		const [postproduction, setPostproduction] = React.useState(true);
		const compact = density !== "labels";

		const groups = {navigation: true, tools: true, visibility: true, levels: true, appearance: true, ...show};
		const idle = !state.ready || state.status !== "ready";
		const noSelection = !state.selection || state.selection.itemCount === 0;
		const navigation = NAVIGATION.find((entry) => entry.mode === state.navigation) ?? NAVIGATION[0];
		const measurement = MEASUREMENTS.find((entry) => entry.kind === state.interaction);

		/** Menu triggers share ToolButton's shape so the bar reads as one row of controls. */
		const trigger = (icon: LucideIcon, label: string, active: boolean) => (
			<Button
				variant={active ? "secondary" : "ghost"}
				size="sm"
				disabled={idle}
				aria-pressed={active}
				aria-label={compact ? label : undefined}
				title={compact ? label : undefined}
				className={cn(
					"wwc:flex-col wwc:gap-0.5 wwc:font-medium",
					compact ? "wwc:h-9 wwc:w-9 wwc:px-0" : "wwc:h-11 wwc:px-2.5 wwc:text-[11px]",
				)}
			>
				{React.createElement(icon, {className: "wwc:h-4 wwc:w-4"})}
				{!compact && label}
			</Button>
		);

		return (
			<Toolbar
				ref={innerRef}
				className={cn(
					"wwc:h-auto wwc:justify-center wwc:gap-0.5 wwc:py-1",
					density === "wrap" ? "wwc:flex-wrap" : "wwc:flex-nowrap",
					className,
				)}
				{...props}
			>
				{groups.navigation && (
					<>
						{/* Navigation modes are mutually exclusive, so the current one is the label. */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>{trigger(navigation.icon, navigation.label, true)}</DropdownMenuTrigger>
							<DropdownMenuContent align="start">
								{NAVIGATION.map((entry) => (
									<DropdownMenuItem key={entry.mode} onSelect={() => api.setNavigation(entry.mode)}>
										<entry.icon className="wwc:mr-2 wwc:h-4 wwc:w-4" />
										{entry.label}
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>

						<ToolButton icon={Maximize2} label="Fit" compact={compact} disabled={idle} onClick={() => void api.fit()} />
						<ToolButton
							icon={Box}
							label="Ortho"
							compact={compact}
							disabled={idle}
							active={state.projection === "Orthographic"}
							onClick={() => void api.toggleProjection()}
						/>
					</>
				)}

				{groups.tools && (
					<>
						<Separator orientation="vertical" className="wwc:mx-1 wwc:h-8" />

						<ToolButton
							icon={Scissors}
							label="Sections"
							compact={compact}
							disabled={idle}
							active={state.interaction === "section"}
							onClick={() => api.setInteraction("section")}
						/>

						{/* Four measurement kinds behind one control, active when any is armed. */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								{trigger(measurement?.icon ?? Ruler, measurement?.label ?? "Measure", Boolean(measurement))}
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start">
								{MEASUREMENTS.map((entry) => (
									<DropdownMenuItem key={entry.kind} onSelect={() => api.setInteraction(entry.kind)}>
										<entry.icon className="wwc:mr-2 wwc:h-4 wwc:w-4" />
										{entry.label}
									</DropdownMenuItem>
								))}
								<DropdownMenuItem onSelect={() => api.clearMeasurements()}>Clear measurements</DropdownMenuItem>
								<DropdownMenuItem onSelect={() => api.clearSections()}>Clear sections</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</>
				)}

				{groups.levels && (
					<>
						<Separator orientation="vertical" className="wwc:mx-1 wwc:h-8" />

						{/* Storeys are read from the IFC spatial structure the first time the menu opens —
						    deriving them eagerly would cost a pass over the model nobody asked for. */}
						<DropdownMenu
							onOpenChange={(open) => {
								if (open && state.storeys.length === 0) void api.loadStoreys();
							}}
						>
							<DropdownMenuTrigger asChild>
								{trigger(Layers, "Levels", Boolean(state.activeStorey))}
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start" className="wwc:max-h-80 wwc:overflow-y-auto">
								{state.storeys.length === 0 ? (
									<DropdownMenuItem disabled>No IFC storeys in this model</DropdownMenuItem>
								) : (
									state.storeys.map((storey) => (
										<DropdownMenuItem key={storey.id} onSelect={() => void api.openStorey(storey.id)}>
											<Layers className="wwc:mr-2 wwc:h-4 wwc:w-4" />
											{storey.name}
										</DropdownMenuItem>
									))
								)}
								{state.activeStorey && (
									<DropdownMenuItem onSelect={() => void api.closeStorey()}>Exit level</DropdownMenuItem>
								)}
							</DropdownMenuContent>
						</DropdownMenu>
					</>
				)}

				{groups.visibility && (
					<>
						<Separator orientation="vertical" className="wwc:mx-1 wwc:h-8" />
						<ToolButton
							icon={EyeOff}
							label="Hide"
							compact={compact}
							disabled={idle || noSelection}
							onClick={() => void api.hideSelection()}
						/>
						<ToolButton
							icon={Scan}
							label="Isolate"
							compact={compact}
							disabled={idle || noSelection}
							onClick={() => void api.isolateSelection()}
						/>
						<ToolButton
							icon={Sparkles}
							label="Show all"
							compact={compact}
							disabled={idle}
							onClick={() => void api.showAll()}
						/>
					</>
				)}

				{groups.appearance && (
					<>
						<Separator orientation="vertical" className="wwc:mx-1 wwc:h-8" />

						{/* Two direct toggles, not a menu — Ghost and Shading each read as their own control. */}
						<ToolButton
							icon={Ghost}
							label="Ghost"
							compact={compact}
							disabled={idle}
							active={state.ghost}
							onClick={() => void api.setGhost(!state.ghost)}
						/>
						<ToolButton
							icon={Sparkles}
							label="Shading"
							compact={compact}
							disabled={idle}
							active={postproduction}
							onClick={() => {
								const next = !postproduction;
								setPostproduction(next);
								api.setPostproduction(next);
							}}
						/>
					</>
				)}

				{extra && (
					<>
						<Separator orientation="vertical" className="wwc:mx-1 wwc:h-8" />
						{extra({compact})}
					</>
				)}
			</Toolbar>
		);
	},
);
ViewerToolbar.displayName = "ViewerToolbar";

export {ViewerToolbar};
