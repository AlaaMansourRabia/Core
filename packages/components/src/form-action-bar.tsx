import {cn} from "@core/core-utils";
import * as React from "react";

export interface FormActionBarProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Left-aligned status node, e.g. "3 unsaved changes" or "New role — not saved yet". */
	status?: React.ReactNode;
	/**
	 * Pin to the bottom of the scroll region (default). Set `false` to render in normal flow —
	 * useful inside a panel that already clips its own content.
	 */
	sticky?: boolean;
	/** Clamp for the inner row, matching the form content it sits under. Default `1200px`. */
	maxWidth?: string | number;
}

/**
 * Page-level form footer: status on the left, actions (children) on the right.
 *
 * Owns its own full-bleed background, top border, and upward shadow, so it must be rendered as a
 * **sibling of the padded content container, not a child of it** — otherwise it inherits that
 * padding and has to cancel it with negative margins. Put the padding on an inner content div and
 * leave the scroll container itself unpadded:
 *
 * ```tsx
 * <main className="flex min-h-0 flex-1 flex-col overflow-auto">
 *   <div className="mx-auto w-full max-w-[1200px] p-6">…form…</div>
 *   <FormActionBar status="3 unsaved changes">…</FormActionBar>
 * </main>
 * ```
 */
const FormActionBar = React.forwardRef<HTMLDivElement, FormActionBarProps>(
	({status, sticky = true, maxWidth = "1200px", className, children, ...props}, ref) => (
		<div
			ref={ref}
			data-core-artifact="form-action-bar"
			data-core-surface-owner="artifact"
			className={cn(
				"wwc:flex wwc:h-[53px] wwc:w-full wwc:shrink-0 wwc:items-center wwc:border-t wwc:border-border wwc:bg-card wwc:px-6",
				"wwc:shadow-[0_-4px_16px_rgba(0,0,0,0.06)]",
				sticky && "wwc:sticky wwc:bottom-0 wwc:z-30",
				className,
			)}
			{...props}
		>
			<div
				className="wwc:mx-auto wwc:flex wwc:w-full wwc:items-center wwc:justify-between wwc:gap-4"
				style={{maxWidth: typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth}}
			>
				<div className="wwc:min-w-0 wwc:truncate wwc:text-sm wwc:text-muted-foreground">{status}</div>
				<div className="wwc:flex wwc:shrink-0 wwc:items-center wwc:gap-2">{children}</div>
			</div>
		</div>
	),
);
FormActionBar.displayName = "FormActionBar";

export {FormActionBar};
