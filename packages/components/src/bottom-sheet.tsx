import {cn} from "@core/core-utils";
import {X} from "lucide-react";
import * as React from "react";

import {IconButton} from "./icon-button";
import {Overlay} from "./overlay";

export interface BottomSheetProps {
	/** Whether the bottom sheet is open */
	open: boolean;
	/** Callback when the sheet should close */
	onClose: () => void;
	/** Sheet content */
	children: React.ReactNode;
	/** Sheet title */
	title?: React.ReactNode;
	/** Sheet description */
	description?: React.ReactNode;
	/** Height of the sheet - can be 'auto', 'full', or a percentage */
	height?: "auto" | "full" | "half" | "third";
	/** Allow swipe to close */
	swipeable?: boolean;
}

/** A mobile-first bottom drawer component. */
const BottomSheet = React.forwardRef<HTMLDivElement, BottomSheetProps>(
	({open, onClose, children, title, description, height = "auto", swipeable = true}, ref) => {
		const [isDragging, setIsDragging] = React.useState(false);
		const [startY, setStartY] = React.useState(0);
		const [currentY, setCurrentY] = React.useState(0);
		const sheetRef = React.useRef<HTMLDivElement>(null);

		const heightClasses = {
			auto: "wwc:max-h-[90vh]",
			full: "wwc:h-[100vh]",
			half: "wwc:h-[50vh]",
			third: "wwc:h-[33vh]",
		};

		const handleTouchStart = (e: React.TouchEvent) => {
			if (!swipeable) return;
			setIsDragging(true);
			setStartY(e.touches[0].clientY);
		};

		const handleTouchMove = (e: React.TouchEvent) => {
			if (!swipeable || !isDragging) return;
			setCurrentY(e.touches[0].clientY);
		};

		const handleTouchEnd = () => {
			if (!swipeable || !isDragging) return;
			setIsDragging(false);
			const diff = currentY - startY;
			if (diff > 100) {
				onClose();
			}
			setCurrentY(0);
			setStartY(0);
		};

		React.useEffect(() => {
			if (open) {
				document.body.style.overflow = "hidden";
			} else {
				document.body.style.overflow = "";
			}
			return () => {
				document.body.style.overflow = "";
			};
		}, [open]);

		if (!open) return null;

		const translateY = isDragging ? Math.max(0, currentY - startY) : 0;

		return (
			<>
				<Overlay open={open} onClose={onClose} />
				<div
					ref={ref}
					className={cn(
						"wwc:fixed wwc:bottom-0 wwc:left-0 wwc:right-0 wwc:z-50 wwc:bg-background wwc:border-t wwc:border-border wwc:rounded-t-xl wwc:shadow-lg wwc:transition-transform wwc:duration-200",
						heightClasses[height],
						open ? "wwc:translate-y-0" : "wwc:translate-y-full",
					)}
					style={{
						transform: `translateY(${translateY}px)`,
					}}
					onTouchStart={handleTouchStart}
					onTouchMove={handleTouchMove}
					onTouchEnd={handleTouchEnd}
				>
					{swipeable && (
						<div className="wwc:flex wwc:justify-center wwc:pt-2 wwc:pb-1">
							<div className="wwc:w-12 wwc:h-1 wwc:bg-muted-foreground/30 wwc:rounded-full" />
						</div>
					)}

					{(title || description) && (
						<div className="wwc:flex wwc:items-start wwc:justify-between wwc:gap-4 wwc:p-6 wwc:pb-4">
							<div className="wwc:space-y-1">
								{title && (
									<h2 className="wwc:text-lg wwc:font-semibold wwc:leading-none wwc:tracking-tight">{title}</h2>
								)}
								{description && <p className="wwc:text-sm wwc:text-muted-foreground">{description}</p>}
							</div>
							<IconButton variant="ghost" size="sm" onClick={onClose} tooltip="Close">
								<X />
							</IconButton>
						</div>
					)}

					<div
						ref={sheetRef}
						className={cn("wwc:overflow-y-auto", title || description ? "wwc:p-6 wwc:pt-0" : "wwc:p-6")}
					>
						{children}
					</div>
				</div>
			</>
		);
	},
);
BottomSheet.displayName = "BottomSheet";

export {BottomSheet};
