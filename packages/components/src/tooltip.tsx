import {cn} from "@core/core-utils";
import {Slot} from "@radix-ui/react-slot";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as React from "react";

const TooltipProvider: typeof TooltipPrimitive.Provider = TooltipPrimitive.Provider;
/** A popup that displays information related to an element on hover or focus. */
function Tooltip(props: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root>) {
	return <TooltipPrimitive.Root {...props} />;
}
const TooltipTrigger: typeof TooltipPrimitive.Trigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
	React.ElementRef<typeof TooltipPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({className, sideOffset = 4, ...props}, ref) => (
	<TooltipPrimitive.Portal>
		<TooltipPrimitive.Content
			ref={ref}
			sideOffset={sideOffset}
			className={cn(
				// Capped so a long label wraps into a compact block instead of stretching into a banner.
				"wwc:z-50 wwc:max-w-[220px] wwc:overflow-hidden wwc:rounded-md wwc:bg-primary wwc:px-3 wwc:py-1.5 wwc:text-xs wwc:text-primary-foreground wwc:animate-in wwc:fade-in-0 wwc:zoom-in-95 wwc:data-[state=closed]:animate-out wwc:data-[state=closed]:fade-out-0 wwc:data-[state=closed]:zoom-out-95 wwc:data-[side=bottom]:slide-in-from-top-2 wwc:data-[side=left]:slide-in-from-right-2 wwc:data-[side=right]:slide-in-from-left-2 wwc:data-[side=top]:slide-in-from-bottom-2",
				className,
			)}
			{...props}
		/>
	</TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export interface HoverTooltipProps {
	content: React.ReactNode;
	/** Which side the tooltip opens on. Defaults to "top". */
	side?: "top" | "right" | "bottom" | "left";
	/** ms of hover before the tooltip appears. */
	delayDuration?: number;
	contentClassName?: string;
	children: React.ReactNode;
}

/**
 * Forwards the tooltip trigger's props to the real child while DROPPING the tooltip's own
 * `data-state`. Radix merges trigger props onto the child via `asChild`, so a wrapped Tabs/Accordion/
 * Collapsible trigger would have its own `data-state="active"/"open"` overwritten with the tooltip's
 * "open"/"closed" — silently killing every `data-[state=...]` style rule on that child.
 *
 * This MUST delegate to `Slot` rather than `cloneElement`: Slot *composes* event handlers and refs,
 * so the child's own `onClick` still runs alongside the trigger's. Spreading the props directly would
 * overwrite the child's handlers and break every button wrapped in a tooltip.
 */
const PreserveChildState = React.forwardRef<HTMLElement, {children: React.ReactNode; "data-state"?: string}>(
	({children, "data-state": _tooltipState, ...triggerProps}, ref) => (
		<Slot ref={ref} {...triggerProps}>
			{children}
		</Slot>
	),
);
PreserveChildState.displayName = "PreserveChildState";

/**
 * Tooltip driven by pointer hover and keyboard focus only.
 *
 * The default Radix trigger also opens on *programmatic* focus, which makes the hint
 * reappear and stick when a Dialog or Popover restores focus to the icon button that
 * opened it. This variant owns `open` itself: it shows on hover or `:focus-visible`,
 * and dismisses on pointer-down so the hint never sits on top of the surface it just
 * opened.
 */
function HoverTooltip({content, side = "top", delayDuration = 300, contentClassName, children}: HoverTooltipProps) {
	const [open, setOpen] = React.useState(false);
	const timerRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

	const clear = React.useCallback(() => {
		if (timerRef.current !== undefined) clearTimeout(timerRef.current);
		timerRef.current = undefined;
	}, []);

	React.useEffect(() => clear, [clear]);

	const hide = React.useCallback(() => {
		clear();
		setOpen(false);
	}, [clear]);

	const show = React.useCallback(() => {
		clear();
		timerRef.current = setTimeout(() => setOpen(true), delayDuration);
	}, [clear, delayDuration]);

	return (
		<TooltipProvider>
			{/* Controlled with no `onOpenChange` — Radix's own hover/focus handlers become no-ops. */}
			<Tooltip open={open}>
				<TooltipTrigger
					asChild
					onPointerEnter={show}
					onPointerLeave={hide}
					onPointerDown={hide}
					onFocus={(event) => {
						// Only keyboard focus shows the hint. A closing Dialog restoring focus to its
						// trigger does not match :focus-visible, so the tooltip stays shut.
						if (event.currentTarget.matches(":focus-visible")) setOpen(true);
					}}
					onBlur={hide}
				>
					<PreserveChildState>{children}</PreserveChildState>
				</TooltipTrigger>
				<TooltipContent side={side} className={contentClassName}>
					{content}
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}

export {Tooltip, TooltipTrigger, TooltipContent, TooltipProvider, HoverTooltip};
