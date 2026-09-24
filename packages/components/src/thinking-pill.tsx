import {cn} from "@corensystem/coren-utils";
import {Brain} from "lucide-react";
import * as React from "react";

export interface ThinkingPillProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
	/** Label. Keep to ~3 words. Defaults to "Thinking". */
	label?: string;
	/** Leading icon. Defaults to a Brain glyph that pairs with the default "Thinking" label. */
	icon?: React.ReactNode;
}

/**
 * Inline indicator that an agent is actively processing before any output has appeared.
 * Mount/unmount, don't toggle. Lifetime = "request started" → "first byte/event received".
 */
export const ThinkingPill = React.forwardRef<HTMLSpanElement, ThinkingPillProps>(
	({label = "Thinking", icon, className, ...props}, ref) => {
		return (
			<span
				ref={ref}
				role="status"
				aria-live="polite"
				className={cn(
					"wwc:inline-flex wwc:items-center wwc:gap-2 wwc:text-[13px] wwc:text-muted-foreground",
					className,
				)}
				{...props}
			>
				<span
					aria-hidden
					className="wwc:flex wwc:h-3.5 wwc:w-3.5 wwc:shrink-0 wwc:items-center wwc:justify-center wwc:animate-pulse wwc:motion-reduce:animate-none"
				>
					{icon ?? <Brain className="wwc:h-3.5 wwc:w-3.5" />}
				</span>
				<span>{label}</span>
			</span>
		);
	},
);
ThinkingPill.displayName = "ThinkingPill";
