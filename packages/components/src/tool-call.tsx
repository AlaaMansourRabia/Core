import {cn} from "@wakecap/core-utils";
import {Check, ChevronDown, CircleDashed, CircleX, Loader2} from "lucide-react";
import * as React from "react";

import {Card} from "./card";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "./collapsible";
import {ScrollArea} from "./scroll-area";

export type ToolCallStatus = "running" | "success" | "error" | "cancelled";

const STATUS_ICON = {
	success: Check,
	error: CircleX,
	running: Loader2,
	cancelled: CircleDashed,
} as const;

const STATUS_TONE: Record<ToolCallStatus, string> = {
	success: "wwc:text-green-600",
	error: "wwc:text-destructive",
	running: "wwc:text-primary",
	cancelled: "wwc:text-muted-foreground",
};

const STATUS_DOT: Record<ToolCallStatus, string> = {
	success: "wwc:bg-green-500",
	error: "wwc:bg-destructive",
	running: "wwc:bg-primary",
	cancelled: "wwc:bg-muted-foreground",
};

export interface ToolCallProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "onChange"> {
	/** Function/tool name shown in the header (e.g. "Read", "Bash"). */
	name: string;
	/** Compact argument preview shown in the header — truncated to a single line. */
	args?: string;
	/** Drives the leading status icon and tone. Defaults to "success". */
	status?: ToolCallStatus;
	/** Always-visible result summary line (e.g. "Read 1 line"). Shown in both closed and open states. */
	summary?: React.ReactNode;
	/** Default open state (uncontrolled). */
	defaultOpen?: boolean;
	/** Controlled open state. */
	open?: boolean;
	/** Open-state change callback. */
	onOpenChange?: (open: boolean) => void;
	/** Output rendered inside the ScrollArea when open. */
	children?: React.ReactNode;
	/** Max height of the output ScrollArea. Defaults to 320. Pass a number (px) or any CSS length. */
	outputMaxHeight?: number | string;
	/** Override the default status icon (e.g. a function-specific glyph). */
	icon?: React.ReactNode;
}

const ToolCall = React.forwardRef<HTMLDivElement, ToolCallProps>(
	(
		{
			className,
			name,
			args,
			status = "success",
			summary,
			defaultOpen,
			open: controlledOpen,
			onOpenChange,
			children,
			outputMaxHeight = 320,
			icon,
			...rest
		},
		ref,
	) => {
		const [internalOpen, setInternalOpen] = React.useState(defaultOpen ?? false);
		const isControlled = controlledOpen !== undefined;
		const isOpen = isControlled ? controlledOpen : internalOpen;

		const handleOpenChange = (next: boolean) => {
			if (!isControlled) setInternalOpen(next);
			onOpenChange?.(next);
		};

		const StatusIcon = STATUS_ICON[status];
		const hasOutput = children !== undefined && children !== null && children !== false;
		const hasBelowHeader = summary !== undefined || hasOutput;
		const maxHeightStyle = typeof outputMaxHeight === "number" ? `${outputMaxHeight}px` : outputMaxHeight;

		return (
			<Collapsible open={isOpen} onOpenChange={handleOpenChange}>
				<Card ref={ref} className={cn("wwc:overflow-hidden wwc:shadow-none", className)} {...rest}>
					<CollapsibleTrigger asChild>
						<button
							type="button"
							className="wwc:flex wwc:w-full wwc:items-center wwc:gap-2.5 wwc:px-3 wwc:py-2.5 wwc:text-left wwc:transition-colors wwc:hover:bg-accent/30 wwc:focus-visible:outline-none wwc:focus-visible:ring-2 wwc:focus-visible:ring-ring"
						>
							{icon ?? (
								<StatusIcon
									className={cn(
										"wwc:h-3.5 wwc:w-3.5 wwc:shrink-0",
										STATUS_TONE[status],
										status === "running" && "wwc:animate-spin",
									)}
								/>
							)}
							<span className="wwc:shrink-0 wwc:text-sm wwc:font-semibold wwc:text-foreground">{name}</span>
							{args && (
								<span className="wwc:flex-1 wwc:truncate wwc:font-mono wwc:text-xs wwc:text-muted-foreground">
									{args}
								</span>
							)}
							<ChevronDown
								className={cn(
									"wwc:h-4 wwc:w-4 wwc:shrink-0 wwc:text-muted-foreground wwc:transition-transform",
									!args && "wwc:ml-auto",
									isOpen && "wwc:rotate-180",
								)}
							/>
						</button>
					</CollapsibleTrigger>
					{hasBelowHeader && <div className="wwc:border-t wwc:border-border" />}
					{summary !== undefined && (
						<div className="wwc:flex wwc:items-center wwc:gap-2 wwc:px-3 wwc:py-2.5">
							<span className={cn("wwc:h-1.5 wwc:w-1.5 wwc:shrink-0 wwc:rounded-full", STATUS_DOT[status])} />
							<span className="wwc:text-xs wwc:font-medium wwc:text-foreground">{summary}</span>
						</div>
					)}
					<CollapsibleContent>
						{hasOutput && (
							<>
								{summary !== undefined && <div className="wwc:border-t wwc:border-border" />}
								<ScrollArea style={{maxHeight: maxHeightStyle}}>
									<div className="wwc:px-3 wwc:py-3 wwc:font-mono wwc:text-xs wwc:text-muted-foreground">
										{children}
									</div>
								</ScrollArea>
							</>
						)}
					</CollapsibleContent>
				</Card>
			</Collapsible>
		);
	},
);
ToolCall.displayName = "ToolCall";

export {ToolCall};
