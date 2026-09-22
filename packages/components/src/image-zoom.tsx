import {cn} from "@corensystem/core-utils";
import {Maximize2} from "lucide-react";
import * as React from "react";

import {Dialog, DialogContent, DialogTitle} from "./dialog";

export interface ImageZoomProps {
	/** Image URL. */
	src: string;
	/** Accessible description of the image. */
	alt: string;
	/** Title shown in the enlarge dialog header. Defaults to `alt`. */
	title?: React.ReactNode;
	/** Class on the thumbnail wrapper (e.g. border / rounding / background). */
	className?: string;
	/** Max width of the dialog. Defaults to `1400px`. */
	dialogMaxWidth?: number;
	/** Fires if the image fails to load (e.g. to swap in a fallback). */
	onError?: () => void;
}

/**
 * A thumbnail that opens the full image in a large modal on click — a maximize hint appears on hover.
 * Use for plans, blueprints, screenshots, or any image worth inspecting at full size.
 */
export function ImageZoom({src, alt, title, className, dialogMaxWidth = 1400, onError}: ImageZoomProps) {
	const [open, setOpen] = React.useState(false);
	return (
		<>
			<button
				type="button"
				onClick={() => setOpen(true)}
				aria-label={`Enlarge ${alt}`}
				className={cn("wwc:group wwc:relative wwc:block wwc:w-full wwc:cursor-zoom-in wwc:overflow-hidden", className)}
			>
				<img src={src} alt={alt} onError={onError} className="wwc:block wwc:h-auto wwc:w-full" />
				<span className="wwc:pointer-events-none wwc:absolute wwc:inset-0 wwc:flex wwc:items-center wwc:justify-center wwc:bg-black/0 wwc:opacity-0 wwc:transition wwc:group-hover:bg-black/15 wwc:group-hover:opacity-100">
					<Maximize2 className="wwc:h-5 wwc:w-5 wwc:text-white wwc:drop-shadow" />
				</span>
			</button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent
					closeAlign="padded"
					className="wwc:p-6 wwc:w-[calc(100vw-2rem)]"
					style={{maxWidth: dialogMaxWidth}}
				>
					<DialogTitle className="wwc:text-base">{title ?? alt}</DialogTitle>
					<div className="wwc:max-h-[80vh] wwc:overflow-auto wwc:rounded-md wwc:border wwc:border-border wwc:bg-white">
						<img src={src} alt={alt} className="wwc:block wwc:h-auto wwc:w-full" />
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
