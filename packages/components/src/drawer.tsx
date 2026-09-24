import {cn} from "@corensystem/coren-utils";
import * as React from "react";
import {Drawer as DrawerPrimitive} from "vaul";

/** A panel that slides in from the edge of the screen, built on Vaul. */
const Drawer = ({shouldScaleBackground = true, ...props}: React.ComponentProps<typeof DrawerPrimitive.Root>) => (
	<DrawerPrimitive.Root shouldScaleBackground={shouldScaleBackground} {...props} />
);
Drawer.displayName = "Drawer";

const DrawerTrigger: typeof DrawerPrimitive.Trigger = DrawerPrimitive.Trigger;

const DrawerPortal: typeof DrawerPrimitive.Portal = DrawerPrimitive.Portal;

const DrawerClose: typeof DrawerPrimitive.Close = DrawerPrimitive.Close;

const DrawerOverlay = React.forwardRef<
	React.ElementRef<typeof DrawerPrimitive.Overlay>,
	React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({className, ...props}, ref) => (
	<DrawerPrimitive.Overlay
		ref={ref}
		className={cn("wwc:fixed wwc:inset-0 wwc:z-50 wwc:bg-black/40 wwc:backdrop-blur-sm", className)}
		{...props}
	/>
));
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName;

const DrawerContent = React.forwardRef<
	React.ElementRef<typeof DrawerPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({className, children, ...props}, ref) => (
	<DrawerPortal>
		<DrawerOverlay />
		<DrawerPrimitive.Content
			ref={ref}
			className={cn(
				"wwc:fixed wwc:inset-x-0 wwc:bottom-0 wwc:z-50 wwc:mt-24 wwc:flex wwc:h-auto wwc:flex-col wwc:rounded-t-[10px] wwc:border wwc:bg-card wwc:text-card-foreground",
				className,
			)}
			{...props}
		>
			<div className="wwc:mx-auto wwc:mt-4 wwc:h-2 wwc:w-[100px] wwc:rounded-full wwc:bg-muted" />
			{children}
		</DrawerPrimitive.Content>
	</DrawerPortal>
));
DrawerContent.displayName = "DrawerContent";

const DrawerHeader = ({className, ...props}: React.HTMLAttributes<HTMLDivElement>) => (
	<div className={cn("wwc:grid wwc:gap-1.5 wwc:p-4 wwc:text-center wwc:sm:text-left", className)} {...props} />
);
DrawerHeader.displayName = "DrawerHeader";

const DrawerFooter = ({className, ...props}: React.HTMLAttributes<HTMLDivElement>) => (
	<div className={cn("wwc:mt-auto wwc:flex wwc:flex-col wwc:gap-2 wwc:p-4", className)} {...props} />
);
DrawerFooter.displayName = "DrawerFooter";

const DrawerTitle = React.forwardRef<
	React.ElementRef<typeof DrawerPrimitive.Title>,
	React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({className, ...props}, ref) => (
	<DrawerPrimitive.Title
		ref={ref}
		className={cn("wwc:text-lg wwc:font-semibold wwc:leading-none wwc:tracking-tight", className)}
		{...props}
	/>
));
DrawerTitle.displayName = DrawerPrimitive.Title.displayName;

const DrawerDescription = React.forwardRef<
	React.ElementRef<typeof DrawerPrimitive.Description>,
	React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({className, ...props}, ref) => (
	<DrawerPrimitive.Description
		ref={ref}
		className={cn("wwc:text-sm wwc:text-muted-foreground", className)}
		{...props}
	/>
));
DrawerDescription.displayName = DrawerPrimitive.Description.displayName;

export {
	Drawer,
	DrawerPortal,
	DrawerOverlay,
	DrawerTrigger,
	DrawerClose,
	DrawerContent,
	DrawerHeader,
	DrawerFooter,
	DrawerTitle,
	DrawerDescription,
};
