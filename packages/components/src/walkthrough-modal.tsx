import {Dialog, DialogContent, DialogHeader, DialogTitle} from "./dialog";
import {MapCompareLayout} from "./pages/core-map-compare-layout";

// ── Walkthrough Modal ───────────────────────────────────────────────────────────────────────────────
// The capture walkthrough: a large, edge-to-edge Map Compare Layout (with the session timeline) shown
// in a dialog. Opened from a capture point to compare that capture against another session. The header
// is just a compact 14px title (no subtitle); the map fills the dialog flush to every edge.

export interface WalkthroughModalProps {
	/** Whether the modal is open. */
	open: boolean;
	/** Fired when the open state should change (e.g. overlay/Esc/close). */
	onOpenChange: (open: boolean) => void;
	/** Title shown in the header, e.g. `Capture 2 of 17 · Ground Floor · 10:05`. */
	title: React.ReactNode;
}

export function WalkthroughModal({open, onOpenChange, title}: WalkthroughModalProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			{/* No description → tell Radix explicitly so it doesn't warn about a missing `aria-describedby`. */}
			<DialogContent
				aria-describedby={undefined}
				className="wwc:max-w-[min(96vw,1200px)] wwc:gap-0 wwc:overflow-hidden wwc:p-0"
			>
				<DialogHeader className="wwc:px-6 wwc:py-4">
					<DialogTitle className="wwc:text-sm">{title}</DialogTitle>
				</DialogHeader>
				{/* Edge-to-edge map, flush to the dialog's bottom edge (no padding / gap). */}
				<div className="wwc:h-[68vh]">
					<MapCompareLayout withSessionTimeline />
				</div>
			</DialogContent>
		</Dialog>
	);
}
