import {VideoOff} from "lucide-react";
import * as React from "react";

import {AspectRatio} from "./aspect-ratio";
import {Badge} from "./badge";
import {DetailPanelShell} from "./detail-panel-shell";
import {ViolationList, type ViolationSummary} from "./violation-list";

/** One row in a camera's violation list. Kept as an alias so existing imports still resolve. */
export type CameraViolation = ViolationSummary;

export interface CameraDetail {
	id: string | number;
	name: string;
	/** Where it is — a zone name or free text. */
	location?: string;
	/** Camera type / model, e.g. "Fixed CCTV". */
	kind?: string;
	/** Online / offline etc. Rendered as a neutral badge. */
	state?: string;
	/** Still frame for the camera view. Omitted renders the "no preview" placeholder. */
	thumbnailUrl?: string;
	/** Marks the feed as live — badges the preview. */
	live?: boolean;
}

export interface CameraDetailPanelProps extends React.HTMLAttributes<HTMLDivElement> {
	camera: CameraDetail;
	/** Violations attributed to this camera, newest first. The count badge reads off this list. */
	violations?: CameraViolation[];
	/** Drill into one violation — the caller swaps the panel for the ticket and passes `onBack`. */
	onViolationSelect?: (violation: CameraViolation) => void;
	onClose?: () => void;
	/**
	 * Replaces the thumbnail entirely — pass a player here once cameras stream live. The 16:9 frame,
	 * rounding and clipping stay with the panel, so a player only has to fill its box.
	 */
	preview?: React.ReactNode;
	/** Panel width in px. Default `340` — matches `ObservationDetailPanel` so the frame never jumps. */
	width?: number;
}

function DetailRow({label, value}: {label: string; value: React.ReactNode}) {
	return (
		<div className="wwc:flex wwc:items-start wwc:justify-between wwc:gap-3 wwc:text-xs">
			<span className="wwc:shrink-0 wwc:text-muted-foreground">{label}</span>
			<span className="wwc:min-w-0 wwc:text-right wwc:font-medium">{value}</span>
		</div>
	);
}

/**
 * Floating detail for one camera: its fields, then the violations it caught as a selectable list. One
 * camera commonly accounts for many violations, so the list is the point of the panel — picking a row
 * drills into that ticket in the same frame, which is why this shares `DetailPanelShell` and its width
 * with `ObservationDetailPanel`.
 */
const CameraDetailPanel = React.forwardRef<HTMLDivElement, CameraDetailPanelProps>(
	({className, camera, violations = [], onViolationSelect, onClose, preview, width = 340, ...props}, ref) => (
		<DetailPanelShell
			ref={ref}
			className={className}
			width={width}
			title={camera.name}
			onClose={onClose}
			meta={
				<>
					<Badge variant="neutralSoft">
						{violations.length} violation{violations.length === 1 ? "" : "s"}
					</Badge>
					{camera.state && <Badge variant="outline">{camera.state}</Badge>}
				</>
			}
			{...props}
		>
			{/* 16:9 preview. A still today, the live stream's box tomorrow — the frame does not change. */}
			<div className="wwc:relative wwc:overflow-hidden wwc:rounded-md wwc:border wwc:border-border wwc:bg-muted">
				<AspectRatio ratio={16 / 9}>
					{preview ??
						(camera.thumbnailUrl ? (
							<img
								src={camera.thumbnailUrl}
								alt={`${camera.name} view`}
								className="wwc:h-full wwc:w-full wwc:object-cover"
							/>
						) : (
							<div className="wwc:flex wwc:h-full wwc:w-full wwc:flex-col wwc:items-center wwc:justify-center wwc:gap-1 wwc:text-muted-foreground">
								<VideoOff className="wwc:size-5" />
								<span className="wwc:text-[11px] wwc:font-medium">No preview</span>
							</div>
						))}
				</AspectRatio>
				{camera.live && (
					<span className="wwc:absolute wwc:left-1.5 wwc:top-1.5 wwc:flex wwc:items-center wwc:gap-1 wwc:rounded wwc:bg-black/70 wwc:px-1.5 wwc:py-0.5 wwc:text-[10px] wwc:font-semibold wwc:text-white">
						<span className="wwc:size-1.5 wwc:rounded-full wwc:bg-red-500" aria-hidden="true" />
						LIVE
					</span>
				)}
			</div>

			<div className="wwc:space-y-1.5">
				{camera.kind && <DetailRow label="Type" value={camera.kind} />}
				{camera.location && <DetailRow label="Location" value={camera.location} />}
				<DetailRow label="Violations" value={violations.length} />
			</div>

			<div className="wwc:space-y-1">
				<p className="wwc:text-[11px] wwc:font-medium wwc:text-muted-foreground">Related violations</p>
				{violations.length === 0 ? (
					<p className="wwc:py-3 wwc:text-center wwc:text-xs wwc:text-muted-foreground">
						No violations from this camera.
					</p>
				) : (
					<ViolationList violations={violations} onSelect={onViolationSelect} />
				)}
			</div>
		</DetailPanelShell>
	),
);
CameraDetailPanel.displayName = "CameraDetailPanel";

export {CameraDetailPanel};
