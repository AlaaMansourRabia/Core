import {cn} from "@corensystem/core-utils";
import {type VariantProps, cva} from "class-variance-authority";
import * as React from "react";

const overlayVariants = cva("wwc:fixed wwc:inset-0 wwc:z-50 wwc:transition-all wwc:duration-200", {
	variants: {
		variant: {
			default: "wwc:bg-black/50",
			dark: "wwc:bg-black/80",
			light: "wwc:bg-black/30",
			blur: "wwc:bg-black/50 wwc:backdrop-blur-sm",
		},
	},
	defaultVariants: {
		variant: "default",
	},
});

export interface OverlayProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof overlayVariants> {
	/** Whether the overlay is open */
	open?: boolean;
	/** Callback when overlay is clicked */
	onClose?: () => void;
}

/** A base overlay component for modals, dialogs, and other overlays. */
const Overlay = React.forwardRef<HTMLDivElement, OverlayProps>(
	({className, variant, open = true, onClose, ...props}, ref) => {
		if (!open) return null;

		return <div ref={ref} className={cn(overlayVariants({variant, className}))} onClick={onClose} {...props} />;
	},
);
Overlay.displayName = "Overlay";

export {Overlay, overlayVariants};
