import {cn} from "@corensystem/coren-utils";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import * as React from "react";

import {buttonVariants} from "./button";

/** A modal dialog that interrupts the user with important content and expects a response. */
function AlertDialog(props: React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Root>) {
	return <AlertDialogPrimitive.Root {...props} />;
}
const AlertDialogTrigger: typeof AlertDialogPrimitive.Trigger = AlertDialogPrimitive.Trigger;
const AlertDialogPortal: typeof AlertDialogPrimitive.Portal = AlertDialogPrimitive.Portal;

const AlertDialogOverlay = React.forwardRef<
	React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
	React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({className, ...props}, ref) => (
	<AlertDialogPrimitive.Overlay
		className={cn(
			"wwc:fixed wwc:inset-0 wwc:z-50 wwc:bg-black/40 wwc:backdrop-blur-sm wwc:data-[state=open]:animate-in wwc:data-[state=closed]:animate-out wwc:data-[state=closed]:fade-out-0 wwc:data-[state=open]:fade-in-0",
			className,
		)}
		{...props}
		ref={ref}
	/>
));
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

const AlertDialogContent = React.forwardRef<
	React.ElementRef<typeof AlertDialogPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({className, ...props}, ref) => (
	<AlertDialogPortal>
		<AlertDialogOverlay />
		<AlertDialogPrimitive.Content
			ref={ref}
			className={cn(
				"wwc:fixed wwc:left-[50%] wwc:top-[50%] wwc:z-50 wwc:grid wwc:w-full wwc:max-w-lg wwc:translate-x-[-50%] wwc:translate-y-[-50%] wwc:gap-4 wwc:border wwc:bg-card wwc:text-card-foreground wwc:p-6 wwc:shadow-lg wwc:duration-200 wwc:data-[state=open]:animate-in wwc:data-[state=closed]:animate-out wwc:data-[state=closed]:fade-out-0 wwc:data-[state=open]:fade-in-0 wwc:data-[state=closed]:zoom-out-95 wwc:data-[state=open]:zoom-in-95 wwc:data-[state=closed]:slide-out-to-left-1/2 wwc:data-[state=closed]:slide-out-to-top-[48%] wwc:data-[state=open]:slide-in-from-left-1/2 wwc:data-[state=open]:slide-in-from-top-[48%] wwc:sm:rounded-lg",
				className,
			)}
			{...props}
		/>
	</AlertDialogPortal>
));
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

const AlertDialogHeader = ({className, ...props}: React.HTMLAttributes<HTMLDivElement>) => (
	<div className={cn("wwc:flex wwc:flex-col wwc:space-y-2 wwc:text-center wwc:sm:text-left", className)} {...props} />
);
AlertDialogHeader.displayName = "AlertDialogHeader";

const AlertDialogFooter = ({className, ...props}: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn("wwc:flex wwc:flex-col-reverse wwc:sm:flex-row wwc:sm:justify-end wwc:sm:space-x-2", className)}
		{...props}
	/>
);
AlertDialogFooter.displayName = "AlertDialogFooter";

const AlertDialogTitle = React.forwardRef<
	React.ElementRef<typeof AlertDialogPrimitive.Title>,
	React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({className, ...props}, ref) => (
	<AlertDialogPrimitive.Title ref={ref} className={cn("wwc:text-lg wwc:font-semibold", className)} {...props} />
));
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;

const AlertDialogDescription = React.forwardRef<
	React.ElementRef<typeof AlertDialogPrimitive.Description>,
	React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({className, ...props}, ref) => (
	<AlertDialogPrimitive.Description
		ref={ref}
		className={cn("wwc:text-sm wwc:text-muted-foreground", className)}
		{...props}
	/>
));
AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName;

const AlertDialogAction = React.forwardRef<
	React.ElementRef<typeof AlertDialogPrimitive.Action>,
	React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({className, ...props}, ref) => (
	<AlertDialogPrimitive.Action ref={ref} className={cn(buttonVariants(), className)} {...props} />
));
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;

const AlertDialogCancel = React.forwardRef<
	React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
	React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({className, ...props}, ref) => (
	<AlertDialogPrimitive.Cancel
		ref={ref}
		className={cn(buttonVariants({variant: "outline"}), "wwc:mt-2 wwc:sm:mt-0", className)}
		{...props}
	/>
));
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;

export {
	AlertDialog,
	AlertDialogPortal,
	AlertDialogOverlay,
	AlertDialogTrigger,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogFooter,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogAction,
	AlertDialogCancel,
};
