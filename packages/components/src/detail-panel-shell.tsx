import {cn} from "@wakecap/core-utils";
import {ArrowLeft, X} from "lucide-react";
import * as React from "react";

import {Button} from "./button";
import {FLOAT_SHADOW} from "./float-shadow";
import {Separator} from "./separator";

export interface DetailPanelShellProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
	title: React.ReactNode;
	/** Badges or meta rendered under the title. */
	meta?: React.ReactNode;
	/** Shows a back arrow left of the title — the drill-in returns to whatever opened it. */
	onBack?: () => void;
	/** Accessible label for the back control. Default "Back". */
	backLabel?: string;
	/** Closes the panel. Omit to hide the close button. */
	onClose?: () => void;
	/**
	 * Pinned below the scrolling body — a composer or action bar that must stay reachable however long
	 * the content gets. It sits outside the scroll area, so it never scrolls away.
	 */
	footer?: React.ReactNode;
	/**
	 * Panel width in px. Fixed on purpose — it floats over a map, so it must not grow with its content.
	 * Default `340`.
	 */
	width?: number;
	/**
	 * Cap on the whole card's height, as a CSS length; the body scrolls beneath it. Default `"60vh"`,
	 * matching `MapControlPanel` so the two floating panels agree.
	 */
	maxHeight?: string;
}

/**
 * The chrome shared by every floating detail panel: a fixed width, a header carrying an optional back
 * control, title, meta row and close button, and a body that scrolls inside the panel rather than
 * growing it. Drill-in panels swap their body and pass `onBack`; the frame never moves between steps.
 */
const DetailPanelShell = React.forwardRef<HTMLDivElement, DetailPanelShellProps>(
	(
		{
			className,
			title,
			meta,
			onBack,
			backLabel = "Back",
			onClose,
			footer,
			width = 340,
			maxHeight = "60vh",
			style,
			children,
			...props
		},
		ref,
	) => {
		// Escape closes the panel, matching how every other dismissible surface behaves.
		React.useEffect(() => {
			if (!onClose) return;
			const onKey = (event: KeyboardEvent) => {
				if (event.key !== "Escape" || event.defaultPrevented) return;
				// A dropdown or popover open over the panel owns Escape first — let it close alone.
				if (document.querySelector("[data-radix-popper-content-wrapper]")) return;
				onClose();
			};
			document.addEventListener("keydown", onKey);
			return () => document.removeEventListener("keydown", onKey);
		}, [onClose]);

		return (
			<div
				ref={ref}
				className={cn(
					"wwc:flex wwc:flex-col wwc:overflow-hidden wwc:rounded-lg wwc:border wwc:border-border wwc:bg-card wwc:text-card-foreground",
					FLOAT_SHADOW,
					className,
				)}
				// The cap keeps the panel inside its container; the body scrolls, the page does not.
				style={{width, maxHeight, ...style}}
				{...props}
			>
				<div className="wwc:flex wwc:shrink-0 wwc:items-start wwc:justify-between wwc:gap-2 wwc:px-3 wwc:py-2.5">
					<div className="wwc:flex wwc:min-w-0 wwc:items-start wwc:gap-1.5">
						{onBack && (
							<Button
								variant="ghost"
								size="sm"
								icon
								aria-label={backLabel}
								className="wwc:-ml-1 wwc:h-6 wwc:w-6 wwc:shrink-0 wwc:text-muted-foreground"
								onClick={onBack}
							>
								<ArrowLeft className="wwc:h-3.5 wwc:w-3.5" />
							</Button>
						)}
						<div className="wwc:min-w-0">
							<h3 className="wwc:truncate wwc:text-sm wwc:font-semibold">{title}</h3>
							{meta && <div className="wwc:mt-1 wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-1">{meta}</div>}
						</div>
					</div>
					{onClose && (
						<Button
							variant="ghost"
							size="sm"
							icon
							aria-label="Close details"
							className="wwc:h-6 wwc:w-6 wwc:shrink-0 wwc:text-muted-foreground"
							onClick={onClose}
						>
							<X className="wwc:h-3.5 wwc:w-3.5" />
						</Button>
					)}
				</div>

				<Separator className="wwc:shrink-0" />

				<div className="wwc:min-h-0 wwc:flex-1 wwc:overflow-y-auto">
					<div className="wwc:space-y-3 wwc:px-3 wwc:py-3">{children}</div>
				</div>

				{footer && (
					<div className="wwc:shrink-0 wwc:border-t wwc:border-border wwc:bg-card wwc:px-3 wwc:py-2.5">{footer}</div>
				)}
			</div>
		);
	},
);
DetailPanelShell.displayName = "DetailPanelShell";

export {DetailPanelShell};
