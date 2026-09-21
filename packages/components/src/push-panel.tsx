import {cn} from "@wakecap/core-utils";
import {type VariantProps, cva} from "class-variance-authority";
import * as React from "react";

/* -----------------------------------------------------------------------------
 * PushPanel Context
 * -------------------------------------------------------------------------- */

interface PushPanelContextValue {
	open: boolean;
	setOpen: (open: boolean) => void;
	side: "left" | "right";
}

const PushPanelContext = React.createContext<PushPanelContextValue | null>(null);

function usePushPanel() {
	const context = React.useContext(PushPanelContext);
	if (!context) {
		throw new Error("PushPanel components must be used within a PushPanelProvider");
	}
	return context;
}

/* -----------------------------------------------------------------------------
 * PushPanelProvider
 * -------------------------------------------------------------------------- */

interface PushPanelProviderProps {
	children: React.ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	defaultOpen?: boolean;
	side?: "left" | "right";
}

function PushPanelProvider({
	children,
	open: controlledOpen,
	onOpenChange,
	defaultOpen = false,
	side = "right",
}: PushPanelProviderProps) {
	const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);

	const isControlled = controlledOpen !== undefined;
	const open = isControlled ? controlledOpen : uncontrolledOpen;

	const setOpen = React.useCallback(
		(value: boolean) => {
			if (!isControlled) {
				setUncontrolledOpen(value);
			}
			onOpenChange?.(value);
		},
		[isControlled, onOpenChange],
	);

	return <PushPanelContext.Provider value={{open, setOpen, side}}>{children}</PushPanelContext.Provider>;
}

/* -----------------------------------------------------------------------------
 * PushPanelContainer
 * -------------------------------------------------------------------------- */

interface PushPanelContainerProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
}

const PushPanelContainer = React.forwardRef<HTMLDivElement, PushPanelContainerProps>(
	({className, children, ...props}, ref) => {
		const {side} = usePushPanel();

		return (
			<div
				ref={ref}
				className={cn("wwc:flex wwc:w-full", side === "left" ? "wwc:flex-row-reverse" : "wwc:flex-row", className)}
				{...props}
			>
				{children}
			</div>
		);
	},
);
PushPanelContainer.displayName = "PushPanelContainer";

/* -----------------------------------------------------------------------------
 * PushPanelMain
 * -------------------------------------------------------------------------- */

interface PushPanelMainProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
}

const PushPanelMain = React.forwardRef<HTMLDivElement, PushPanelMainProps>(({className, children, ...props}, ref) => {
	return (
		<div
			ref={ref}
			className={cn("wwc:flex-1 wwc:min-w-0 wwc:transition-all wwc:duration-300 wwc:ease-in-out", className)}
			{...props}
		>
			{children}
		</div>
	);
});
PushPanelMain.displayName = "PushPanelMain";

/* -----------------------------------------------------------------------------
 * PushPanel (The sliding panel itself)
 * -------------------------------------------------------------------------- */

const pushPanelVariants = cva("wwc:shrink-0 wwc:overflow-hidden wwc:transition-all wwc:duration-300 wwc:ease-in-out", {
	variants: {
		side: {
			left: "wwc:border-r wwc:rounded-l-[inherit]",
			right: "wwc:border-l wwc:rounded-r-[inherit]",
		},
	},
	defaultVariants: {
		side: "right",
	},
});

interface PushPanelProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof pushPanelVariants> {
	children: React.ReactNode;
	width?: string | number;
}

/** A side panel that slides in and pushes the main content aside. */
const PushPanel = React.forwardRef<HTMLDivElement, PushPanelProps>(
	({className, children, width = 320, ...props}, ref) => {
		const {open, side} = usePushPanel();
		const numericWidth = typeof width === "number" ? width : Number.parseInt(width, 10) || 320;

		if (!open) {
			return <div ref={ref} className={cn(pushPanelVariants({side}), className)} style={{width: 0}} {...props} />;
		}

		return (
			<div
				ref={ref}
				className={cn(pushPanelVariants({side}), "wwc:overflow-hidden", className)}
				style={{width: numericWidth}}
				{...props}
			>
				<div
					className={cn(
						"wwc:h-full wwc:bg-card wwc:flex wwc:flex-col wwc:overflow-hidden",
						side === "left" ? "wwc:rounded-l-[inherit]" : "wwc:rounded-r-[inherit]",
					)}
					style={{width: numericWidth}}
				>
					{children}
				</div>
			</div>
		);
	},
);
PushPanel.displayName = "PushPanel";

/* -----------------------------------------------------------------------------
 * PushPanelHeader
 * -------------------------------------------------------------------------- */

interface PushPanelHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
}

const PushPanelHeader = React.forwardRef<HTMLDivElement, PushPanelHeaderProps>(
	({className, children, ...props}, ref) => {
		return (
			<div
				ref={ref}
				className={cn("wwc:flex wwc:items-center wwc:gap-2 wwc:px-4 wwc:py-3 wwc:border-b wwc:shrink-0", className)}
				{...props}
			>
				{children}
			</div>
		);
	},
);
PushPanelHeader.displayName = "PushPanelHeader";

/* -----------------------------------------------------------------------------
 * PushPanelHeaderTitle - Flex container for title area (takes remaining space)
 * -------------------------------------------------------------------------- */

interface PushPanelHeaderTitleProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
}

const PushPanelHeaderTitle = React.forwardRef<HTMLDivElement, PushPanelHeaderTitleProps>(
	({className, children, ...props}, ref) => {
		return (
			<div ref={ref} className={cn("wwc:flex-1 wwc:min-w-0 wwc:flex wwc:items-center wwc:gap-2", className)} {...props}>
				{children}
			</div>
		);
	},
);
PushPanelHeaderTitle.displayName = "PushPanelHeaderTitle";

/* -----------------------------------------------------------------------------
 * PushPanelHeaderActions - Container for header action buttons
 * -------------------------------------------------------------------------- */

interface PushPanelHeaderActionsProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
}

const PushPanelHeaderActions = React.forwardRef<HTMLDivElement, PushPanelHeaderActionsProps>(
	({className, children, ...props}, ref) => {
		return (
			<div ref={ref} className={cn("wwc:flex wwc:items-center wwc:gap-1 wwc:shrink-0", className)} {...props}>
				{children}
			</div>
		);
	},
);
PushPanelHeaderActions.displayName = "PushPanelHeaderActions";

/* -----------------------------------------------------------------------------
 * PushPanelContent
 * -------------------------------------------------------------------------- */

interface PushPanelContentProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
}

const PushPanelContent = React.forwardRef<HTMLDivElement, PushPanelContentProps>(
	({className, children, ...props}, ref) => {
		return (
			<div ref={ref} className={cn("wwc:flex-1 wwc:overflow-auto wwc:px-4 wwc:py-3", className)} {...props}>
				{children}
			</div>
		);
	},
);
PushPanelContent.displayName = "PushPanelContent";

/* -----------------------------------------------------------------------------
 * PushPanelFooter
 * -------------------------------------------------------------------------- */

interface PushPanelFooterProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
}

const PushPanelFooter = React.forwardRef<HTMLDivElement, PushPanelFooterProps>(
	({className, children, ...props}, ref) => {
		return (
			<div
				ref={ref}
				className={cn("wwc:flex wwc:items-center wwc:gap-2 wwc:px-4 wwc:py-3 wwc:border-t wwc:shrink-0", className)}
				{...props}
			>
				{children}
			</div>
		);
	},
);
PushPanelFooter.displayName = "PushPanelFooter";

/* -----------------------------------------------------------------------------
 * PushPanelTitle
 * -------------------------------------------------------------------------- */

interface PushPanelTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
	children: React.ReactNode;
}

const PushPanelTitle = React.forwardRef<HTMLHeadingElement, PushPanelTitleProps>(
	({className, children, ...props}, ref) => {
		return (
			<h3
				ref={ref}
				className={cn("wwc:text-base wwc:font-semibold wwc:text-foreground wwc:truncate", className)}
				{...props}
			>
				{children}
			</h3>
		);
	},
);
PushPanelTitle.displayName = "PushPanelTitle";

/* -----------------------------------------------------------------------------
 * PushPanelDescription
 * -------------------------------------------------------------------------- */

interface PushPanelDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
	children: React.ReactNode;
}

const PushPanelDescription = React.forwardRef<HTMLParagraphElement, PushPanelDescriptionProps>(
	({className, children, ...props}, ref) => {
		return (
			<p ref={ref} className={cn("wwc:text-sm wwc:text-muted-foreground", className)} {...props}>
				{children}
			</p>
		);
	},
);
PushPanelDescription.displayName = "PushPanelDescription";

/* -----------------------------------------------------------------------------
 * PushPanelTrigger
 * -------------------------------------------------------------------------- */

interface PushPanelTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	children: React.ReactNode;
	asChild?: boolean;
}

const PushPanelTrigger = React.forwardRef<HTMLButtonElement, PushPanelTriggerProps>(
	({className, children, asChild, onClick, ...props}, ref) => {
		const {open, setOpen} = usePushPanel();

		const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
			setOpen(!open);
			onClick?.(e);
		};

		if (asChild && React.isValidElement(children)) {
			return React.cloneElement(children as React.ReactElement<any>, {
				onClick: handleClick,
				ref,
			});
		}

		return (
			<button ref={ref} className={className} onClick={handleClick} {...props}>
				{children}
			</button>
		);
	},
);
PushPanelTrigger.displayName = "PushPanelTrigger";

/* -----------------------------------------------------------------------------
 * PushPanelClose
 * -------------------------------------------------------------------------- */

interface PushPanelCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	children: React.ReactNode;
	asChild?: boolean;
}

const PushPanelClose = React.forwardRef<HTMLButtonElement, PushPanelCloseProps>(
	({className, children, asChild, onClick, ...props}, ref) => {
		const {setOpen} = usePushPanel();

		const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
			setOpen(false);
			onClick?.(e);
		};

		if (asChild && React.isValidElement(children)) {
			return React.cloneElement(children as React.ReactElement<any>, {
				onClick: handleClick,
				ref,
			});
		}

		return (
			<button ref={ref} className={className} onClick={handleClick} {...props}>
				{children}
			</button>
		);
	},
);
PushPanelClose.displayName = "PushPanelClose";

export {
	PushPanelProvider,
	PushPanelContainer,
	PushPanelMain,
	PushPanel,
	PushPanelHeader,
	PushPanelHeaderTitle,
	PushPanelHeaderActions,
	PushPanelContent,
	PushPanelFooter,
	PushPanelTitle,
	PushPanelDescription,
	PushPanelTrigger,
	PushPanelClose,
	usePushPanel,
};
