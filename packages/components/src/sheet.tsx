import * as SheetPrimitive from "@radix-ui/react-dialog";
import {cn} from "@core/core-utils";
import {type VariantProps, cva} from "class-variance-authority";
import {X} from "lucide-react";
import * as React from "react";

/** A panel that slides in from the edge of the screen as an overlay. */
function Sheet(props: React.ComponentPropsWithoutRef<typeof SheetPrimitive.Root>) {
	return <SheetPrimitive.Root {...props} />;
}

const SheetTrigger: typeof SheetPrimitive.Trigger = SheetPrimitive.Trigger;

const SheetClose: typeof SheetPrimitive.Close = SheetPrimitive.Close;

const SheetPortal: typeof SheetPrimitive.Portal = SheetPrimitive.Portal;

const SheetOverlay = React.forwardRef<
	React.ElementRef<typeof SheetPrimitive.Overlay>,
	React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({className, ...props}, ref) => (
	<SheetPrimitive.Overlay
		className={cn(
			"wwc:fixed wwc:inset-0 wwc:z-50 wwc:bg-black/40 wwc:backdrop-blur-sm  wwc:data-[state=open]:animate-in wwc:data-[state=closed]:animate-out wwc:data-[state=closed]:fade-out-0 wwc:data-[state=open]:fade-in-0",
			className,
		)}
		{...props}
		ref={ref}
	/>
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

const sheetVariants = cva(
	"wwc:fixed wwc:z-50 wwc:gap-4 wwc:bg-card wwc:text-card-foreground wwc:p-6 wwc:shadow-lg wwc:transition wwc:ease-in-out wwc:data-[state=open]:animate-in wwc:data-[state=closed]:animate-out wwc:data-[state=closed]:duration-300 wwc:data-[state=open]:duration-500",
	{
		variants: {
			side: {
				top: "wwc:inset-x-0 wwc:top-0 wwc:border-b wwc:data-[state=closed]:slide-out-to-top wwc:data-[state=open]:slide-in-from-top",
				bottom:
					"wwc:inset-x-0 wwc:bottom-0 wwc:border-t wwc:data-[state=closed]:slide-out-to-bottom wwc:data-[state=open]:slide-in-from-bottom",
				left: "wwc:inset-y-0 wwc:left-0 wwc:h-full wwc:w-3/4 wwc:border-r wwc:data-[state=closed]:slide-out-to-left wwc:data-[state=open]:slide-in-from-left wwc:sm:max-w-sm",
				right:
					"wwc:inset-y-0 wwc:right-0 wwc:h-full wwc:w-3/4  wwc:border-l wwc:data-[state=closed]:slide-out-to-right wwc:data-[state=open]:slide-in-from-right wwc:sm:max-w-sm",
			},
		},
		defaultVariants: {
			side: "right",
		},
	},
);

interface SheetContentProps
	extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>, VariantProps<typeof sheetVariants> {
	/** Forwarded to the portal — pass `container` to mount the sheet somewhere other than `document.body`. */
	portalProps?: React.ComponentPropsWithoutRef<typeof SheetPortal>;
	/**
	 * Forwarded to the default scrim — e.g. `style={{top: 56}}` to start it below an app topbar.
	 * An inline style is the reliable escape here: the scrim's own `inset-0` already sets `top`, and a
	 * class of yours only wins if it lands later in the cascade.
	 */
	overlayProps?: React.ComponentPropsWithoutRef<typeof SheetOverlay>;
	/** Replaces the default scrim. Pass `null` to render none (a sheet that leaves the page usable behind it). */
	overlay?: React.ReactNode;
	/** Set false when the sheet's own header already carries a close control. Default true. */
	showCloseButton?: boolean;
}

const SheetContent = React.forwardRef<React.ElementRef<typeof SheetPrimitive.Content>, SheetContentProps>(
	(
		{side = "right", className, children, portalProps, overlayProps, overlay, showCloseButton = true, ...props},
		ref,
	) => (
		<SheetPortal {...portalProps}>
			{overlay === undefined ? <SheetOverlay {...overlayProps} /> : overlay}
			<SheetPrimitive.Content ref={ref} className={cn(sheetVariants({side}), className)} {...props}>
				{children}
				{showCloseButton && (
					<SheetPrimitive.Close className="wwc:absolute wwc:right-4 wwc:top-4 wwc:rounded-sm wwc:opacity-70 wwc:ring-offset-background wwc:transition-opacity wwc:hover:opacity-100 wwc:focus:outline-none wwc:focus:ring-2 wwc:focus:ring-ring wwc:focus:ring-offset-2 wwc:disabled:pointer-events-none wwc:data-[state=open]:bg-secondary">
						<X className="wwc:h-4 wwc:w-4" />
						<span className="wwc:sr-only">Close</span>
					</SheetPrimitive.Close>
				)}
			</SheetPrimitive.Content>
		</SheetPortal>
	),
);
SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetHeader = ({className, ...props}: React.HTMLAttributes<HTMLDivElement>) => (
	<div className={cn("wwc:flex wwc:flex-col wwc:space-y-2 wwc:text-center wwc:sm:text-left", className)} {...props} />
);
SheetHeader.displayName = "SheetHeader";

const SheetFooter = ({className, ...props}: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn("wwc:flex wwc:flex-col-reverse wwc:sm:flex-row wwc:sm:justify-end wwc:sm:space-x-2", className)}
		{...props}
	/>
);
SheetFooter.displayName = "SheetFooter";

const SheetTitle = React.forwardRef<
	React.ElementRef<typeof SheetPrimitive.Title>,
	React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({className, ...props}, ref) => (
	<SheetPrimitive.Title
		ref={ref}
		className={cn("wwc:text-lg wwc:font-semibold wwc:text-foreground", className)}
		{...props}
	/>
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
	React.ElementRef<typeof SheetPrimitive.Description>,
	React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({className, ...props}, ref) => (
	<SheetPrimitive.Description ref={ref} className={cn("wwc:text-sm wwc:text-muted-foreground", className)} {...props} />
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export type {SheetContentProps};

export {
	Sheet,
	SheetPortal,
	SheetOverlay,
	SheetTrigger,
	SheetClose,
	SheetContent,
	SheetHeader,
	SheetFooter,
	SheetTitle,
	SheetDescription,
	sheetVariants,
};
