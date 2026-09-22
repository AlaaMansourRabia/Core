import {cn} from "@core/core-utils";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import {cva} from "class-variance-authority";
import {ChevronDown} from "lucide-react";
import * as React from "react";

/** A collection of links for site navigation built on Radix UI. */
const NavigationMenu = React.forwardRef<
	React.ElementRef<typeof NavigationMenuPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>
>(({className, children, ...props}, ref) => (
	<NavigationMenuPrimitive.Root
		ref={ref}
		className={cn(
			"wwc:relative wwc:z-10 wwc:flex wwc:max-w-max wwc:flex-1 wwc:items-center wwc:justify-center",
			className,
		)}
		{...props}
	>
		{children}
		<NavigationMenuViewport />
	</NavigationMenuPrimitive.Root>
));
NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName;

const NavigationMenuList = React.forwardRef<
	React.ElementRef<typeof NavigationMenuPrimitive.List>,
	React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>
>(({className, ...props}, ref) => (
	<NavigationMenuPrimitive.List
		ref={ref}
		className={cn(
			"wwc:group wwc:flex wwc:flex-1 wwc:list-none wwc:items-center wwc:justify-center wwc:space-x-1",
			className,
		)}
		{...props}
	/>
));
NavigationMenuList.displayName = NavigationMenuPrimitive.List.displayName;

const NavigationMenuItem: typeof NavigationMenuPrimitive.Item = NavigationMenuPrimitive.Item;

const navigationMenuTriggerStyle = cva(
	"wwc:group wwc:inline-flex wwc:h-10 wwc:w-max wwc:items-center wwc:justify-center wwc:rounded-md wwc:bg-card wwc:px-4 wwc:py-2 wwc:text-sm wwc:font-medium wwc:transition-colors wwc:hover:bg-menu-highlight wwc:hover:text-menu-highlight-foreground wwc:focus:bg-menu-highlight wwc:focus:text-menu-highlight-foreground wwc:focus:outline-none wwc:disabled:pointer-events-none wwc:disabled:opacity-50 wwc:data-[active]:bg-accent/50 wwc:data-[state=open]:bg-accent/50",
);

const NavigationMenuTrigger = React.forwardRef<
	React.ElementRef<typeof NavigationMenuPrimitive.Trigger>,
	React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>
>(({className, children, ...props}, ref) => (
	<NavigationMenuPrimitive.Trigger
		ref={ref}
		className={cn(navigationMenuTriggerStyle(), "wwc:group", className)}
		{...props}
	>
		{children}{" "}
		<ChevronDown
			className="wwc:relative wwc:top-[1px] wwc:ml-1 wwc:h-3 wwc:w-3 wwc:transition wwc:duration-200 wwc:group-data-[state=open]:rotate-180"
			aria-hidden="true"
		/>
	</NavigationMenuPrimitive.Trigger>
));
NavigationMenuTrigger.displayName = NavigationMenuPrimitive.Trigger.displayName;

const NavigationMenuContent = React.forwardRef<
	React.ElementRef<typeof NavigationMenuPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>
>(({className, ...props}, ref) => (
	<NavigationMenuPrimitive.Content
		ref={ref}
		className={cn(
			"wwc:left-0 wwc:top-0 wwc:w-full wwc:data-[motion^=from-]:animate-in wwc:data-[motion^=to-]:animate-out wwc:data-[motion^=from-]:fade-in wwc:data-[motion^=to-]:fade-out wwc:data-[motion=from-end]:slide-in-from-right-52 wwc:data-[motion=from-start]:slide-in-from-left-52 wwc:data-[motion=to-end]:slide-out-to-right-52 wwc:data-[motion=to-start]:slide-out-to-left-52 wwc:md:absolute wwc:md:w-auto ",
			className,
		)}
		{...props}
	/>
));
NavigationMenuContent.displayName = NavigationMenuPrimitive.Content.displayName;

const NavigationMenuLink: typeof NavigationMenuPrimitive.Link = NavigationMenuPrimitive.Link;

const NavigationMenuViewport = React.forwardRef<
	React.ElementRef<typeof NavigationMenuPrimitive.Viewport>,
	React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport>
>(({className, ...props}, ref) => (
	<div className={cn("wwc:absolute wwc:left-0 wwc:top-full wwc:flex wwc:justify-center")}>
		<NavigationMenuPrimitive.Viewport
			className={cn(
				"wwc:origin-top-center wwc:relative wwc:mt-1.5 wwc:h-[var(--radix-navigation-menu-viewport-height)] wwc:w-full wwc:overflow-hidden wwc:rounded-md wwc:border wwc:bg-popover wwc:text-popover-foreground wwc:shadow-lg wwc:data-[state=open]:animate-in wwc:data-[state=closed]:animate-out wwc:data-[state=closed]:zoom-out-95 wwc:data-[state=open]:zoom-in-90 wwc:md:w-[var(--radix-navigation-menu-viewport-width)]",
				className,
			)}
			ref={ref}
			{...props}
		/>
	</div>
));
NavigationMenuViewport.displayName = NavigationMenuPrimitive.Viewport.displayName;

const NavigationMenuIndicator = React.forwardRef<
	React.ElementRef<typeof NavigationMenuPrimitive.Indicator>,
	React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Indicator>
>(({className, ...props}, ref) => (
	<NavigationMenuPrimitive.Indicator
		ref={ref}
		className={cn(
			"wwc:top-full wwc:z-[1] wwc:flex wwc:h-1.5 wwc:items-end wwc:justify-center wwc:overflow-hidden wwc:data-[state=visible]:animate-in wwc:data-[state=hidden]:animate-out wwc:data-[state=hidden]:fade-out wwc:data-[state=visible]:fade-in",
			className,
		)}
		{...props}
	>
		<div className="wwc:relative wwc:top-[60%] wwc:h-2 wwc:w-2 wwc:rotate-45 wwc:rounded-tl-sm wwc:bg-border wwc:shadow-md" />
	</NavigationMenuPrimitive.Indicator>
));
NavigationMenuIndicator.displayName = NavigationMenuPrimitive.Indicator.displayName;

export {
	navigationMenuTriggerStyle,
	NavigationMenu,
	NavigationMenuList,
	NavigationMenuItem,
	NavigationMenuContent,
	NavigationMenuTrigger,
	NavigationMenuLink,
	NavigationMenuIndicator,
	NavigationMenuViewport,
};
