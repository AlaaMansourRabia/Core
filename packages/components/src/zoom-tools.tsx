import {cn} from "@wakecap/core-utils";
import {ZoomIn, ZoomOut} from "lucide-react";
import * as React from "react";

import {Toolbar, ToolbarButton} from "./toolbar";

export interface ZoomToolsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
	/** `default` draws the bordered toolbar surface; `bare` drops it (for embedding in other chrome). */
	variant?: "default" | "bare";
	/** Current zoom level as a multiplier (1 = 100%). */
	zoomLevel?: number;
	/** Minimum allowed zoom level. */
	minZoom?: number;
	/** Maximum allowed zoom level. */
	maxZoom?: number;
	/** Label rendered on the fit-to-view button. */
	fitLabel?: string;
	/** Override the auto-derived canZoomIn flag. */
	canZoomIn?: boolean;
	/** Override the auto-derived canZoomOut flag. */
	canZoomOut?: boolean;
	/** Hide the editable zoom percentage shown between the zoom buttons. Defaults to shown. */
	showPercentage?: boolean;
	onZoomIn?: () => void;
	onZoomOut?: () => void;
	onFit?: () => void;
	/** Called with the new zoom level (multiplier) when the user types a percentage and commits it. */
	onZoomChange?: (zoomLevel: number) => void;
}

/** Editable, container-less percentage readout. Type a value and press Enter (or blur) to apply. */
function ZoomPercentInput({
	zoomLevel,
	minZoom,
	maxZoom,
	onZoomChange,
}: {
	zoomLevel: number;
	minZoom: number;
	maxZoom: number;
	onZoomChange?: (zoomLevel: number) => void;
}) {
	const percent = Math.round(zoomLevel * 100);
	const [draft, setDraft] = React.useState<string | null>(null);
	const display = draft ?? String(percent);

	const commit = () => {
		if (draft === null) return;
		const next = Number.parseInt(draft, 10);
		setDraft(null);
		if (!Number.isNaN(next) && onZoomChange) {
			onZoomChange(Math.min(maxZoom, Math.max(minZoom, next / 100)));
		}
	};

	return (
		<div className="wwc:inline-flex wwc:min-w-11 wwc:items-center wwc:justify-center wwc:text-sm wwc:font-medium wwc:tabular-nums">
			<input
				type="text"
				inputMode="numeric"
				aria-label="Zoom percentage"
				value={display}
				readOnly={!onZoomChange}
				onChange={(e) => setDraft(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
				onFocus={(e) => {
					setDraft(String(percent));
					e.currentTarget.select();
				}}
				onBlur={commit}
				onKeyDown={(e) => {
					if (e.key === "Enter") {
						commit();
						e.currentTarget.blur();
					} else if (e.key === "Escape") {
						setDraft(null);
						e.currentTarget.blur();
					}
				}}
				className="wwc:w-9 wwc:bg-transparent wwc:text-right wwc:tabular-nums wwc:outline-none wwc:focus-visible:underline"
			/>
			<span className="wwc:select-none">%</span>
		</div>
	);
}

const ZoomTools = React.forwardRef<HTMLDivElement, ZoomToolsProps>(
	(
		{
			className,
			variant = "default",
			zoomLevel = 1,
			minZoom = 0.1,
			maxZoom = 10,
			fitLabel = "Fit",
			canZoomIn,
			canZoomOut,
			showPercentage = true,
			onZoomIn,
			onZoomOut,
			onFit,
			onZoomChange,
			...rest
		},
		ref,
	) => {
		const zoomInEnabled = canZoomIn ?? zoomLevel < maxZoom;
		const zoomOutEnabled = canZoomOut ?? zoomLevel > minZoom;

		// One unified control: zoom out · percentage · zoom in · fit — no separators or boxed buttons.
		return (
			<Toolbar ref={ref} variant={variant} aria-label="Zoom tools" className={cn("wwc:gap-0.5", className)} {...rest}>
				<ToolbarButton icon onClick={onZoomOut} disabled={!zoomOutEnabled} label="Zoom out">
					<ZoomOut className="wwc:h-4 wwc:w-4" />
				</ToolbarButton>

				{showPercentage && (
					<ZoomPercentInput zoomLevel={zoomLevel} minZoom={minZoom} maxZoom={maxZoom} onZoomChange={onZoomChange} />
				)}

				<ToolbarButton icon onClick={onZoomIn} disabled={!zoomInEnabled} label="Zoom in">
					<ZoomIn className="wwc:h-4 wwc:w-4" />
				</ToolbarButton>

				<ToolbarButton
					onClick={onFit}
					label="Fit to view"
					className="wwc:h-9 wwc:px-2 wwc:text-muted-foreground wwc:hover:text-foreground"
				>
					<span className="wwc:text-sm wwc:font-medium">{fitLabel}</span>
				</ToolbarButton>
			</Toolbar>
		);
	},
);
ZoomTools.displayName = "ZoomTools";

export {ZoomTools};
