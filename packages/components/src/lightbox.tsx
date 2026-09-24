import {cn} from "@corensystem/coren-utils";
import {ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut} from "lucide-react";
import * as React from "react";

import {IconButton} from "./icon-button";
import {Overlay} from "./overlay";

export interface LightboxImage {
	src: string;
	alt?: string;
	caption?: string;
}

export interface LightboxProps {
	/** Whether the lightbox is open */
	open: boolean;
	/** Callback when the lightbox should close */
	onClose: () => void;
	/** Array of images to display */
	images: LightboxImage[];
	/** Current image index */
	currentIndex?: number;
	/** Callback when index changes */
	onIndexChange?: (index: number) => void;
	/** Show navigation controls */
	showControls?: boolean;
	/** Show zoom controls */
	showZoom?: boolean;
}

/** A lightbox component for viewing images in fullscreen. */
const Lightbox = React.forwardRef<HTMLDivElement, LightboxProps>(
	({open, onClose, images, currentIndex = 0, onIndexChange, showControls = true, showZoom = true}, ref) => {
		const [index, setIndex] = React.useState(currentIndex);
		const [zoom, setZoom] = React.useState(1);

		React.useEffect(() => {
			setIndex(currentIndex);
		}, [currentIndex]);

		React.useEffect(() => {
			if (open) {
				document.body.style.overflow = "hidden";
			} else {
				document.body.style.overflow = "";
				setZoom(1);
			}
			return () => {
				document.body.style.overflow = "";
			};
		}, [open]);

		const handlePrevious = () => {
			const newIndex = index > 0 ? index - 1 : images.length - 1;
			setIndex(newIndex);
			onIndexChange?.(newIndex);
			setZoom(1);
		};

		const handleNext = () => {
			const newIndex = index < images.length - 1 ? index + 1 : 0;
			setIndex(newIndex);
			onIndexChange?.(newIndex);
			setZoom(1);
		};

		const handleZoomIn = () => {
			setZoom((prev) => Math.min(prev + 0.25, 3));
		};

		const handleZoomOut = () => {
			setZoom((prev) => Math.max(prev - 0.25, 0.5));
		};

		React.useEffect(() => {
			const handleKeyDown = (e: KeyboardEvent) => {
				if (!open) return;
				if (e.key === "Escape") onClose();
				if (e.key === "ArrowLeft") handlePrevious();
				if (e.key === "ArrowRight") handleNext();
			};

			window.addEventListener("keydown", handleKeyDown);
			return () => window.removeEventListener("keydown", handleKeyDown);
		}, [open, index]);

		if (!open || images.length === 0) return null;

		const currentImage = images[index];

		return (
			<>
				<Overlay open={open} onClose={onClose} variant="dark" />
				<div ref={ref} className="wwc:fixed wwc:inset-0 wwc:z-50 wwc:flex wwc:items-center wwc:justify-center wwc:p-4">
					{/* Close Button */}
					<div className="wwc:absolute wwc:top-4 wwc:right-4 wwc:z-10">
						<IconButton variant="ghost" size="lg" onClick={onClose} tooltip="Close (Esc)">
							<X className="wwc:text-white" />
						</IconButton>
					</div>

					{/* Zoom Controls */}
					{showZoom && (
						<div className="wwc:absolute wwc:top-4 wwc:left-4 wwc:z-10 wwc:flex wwc:gap-2">
							<IconButton variant="ghost" size="md" onClick={handleZoomOut} tooltip="Zoom out">
								<ZoomOut className="wwc:text-white" />
							</IconButton>
							<IconButton variant="ghost" size="md" onClick={handleZoomIn} tooltip="Zoom in">
								<ZoomIn className="wwc:text-white" />
							</IconButton>
							<div className="wwc:flex wwc:items-center wwc:px-3 wwc:text-white wwc:text-sm">
								{Math.round(zoom * 100)}%
							</div>
						</div>
					)}

					{/* Navigation Controls */}
					{showControls && images.length > 1 && (
						<>
							<div className="wwc:absolute wwc:left-4 wwc:top-1/2 wwc:-translate-y-1/2">
								<IconButton variant="ghost" size="lg" onClick={handlePrevious} tooltip="Previous (←)">
									<ChevronLeft className="wwc:text-white wwc:h-8 wwc:w-8" />
								</IconButton>
							</div>
							<div className="wwc:absolute wwc:right-4 wwc:top-1/2 wwc:-translate-y-1/2">
								<IconButton variant="ghost" size="lg" onClick={handleNext} tooltip="Next (→)">
									<ChevronRight className="wwc:text-white wwc:h-8 wwc:w-8" />
								</IconButton>
							</div>
						</>
					)}

					{/* Image */}
					<div className="wwc:flex wwc:flex-col wwc:items-center wwc:gap-4 wwc:max-h-full">
						<img
							src={currentImage.src}
							alt={currentImage.alt || `Image ${index + 1}`}
							className={cn(
								"wwc:max-h-[calc(100vh-8rem)] wwc:max-w-full wwc:object-contain wwc:transition-transform wwc:duration-200",
							)}
							style={{transform: `scale(${zoom})`}}
						/>
						{currentImage.caption && (
							<p className="wwc:text-white wwc:text-sm wwc:text-center">{currentImage.caption}</p>
						)}
					</div>

					{/* Counter */}
					{images.length > 1 && (
						<div className="wwc:absolute wwc:bottom-4 wwc:left-1/2 wwc:-translate-x-1/2 wwc:text-white wwc:text-sm wwc:bg-black/50 wwc:px-4 wwc:py-2 wwc:rounded-full">
							{index + 1} / {images.length}
						</div>
					)}
				</div>
			</>
		);
	},
);
Lightbox.displayName = "Lightbox";

export {Lightbox};
