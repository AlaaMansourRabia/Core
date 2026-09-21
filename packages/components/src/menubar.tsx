import * as MenubarPrimitive from "@radix-ui/react-menubar";
import {cn} from "@core/core-utils";
import {Check, ChevronRight, Circle} from "lucide-react";
import * as React from "react";

const MenubarMenu: typeof MenubarPrimitive.Menu = MenubarPrimitive.Menu;

const MenubarGroup: typeof MenubarPrimitive.Group = MenubarPrimitive.Group;

const MenubarPortal: typeof MenubarPrimitive.Portal = MenubarPrimitive.Portal;

const MenubarSub: typeof MenubarPrimitive.Sub = MenubarPrimitive.Sub;

const MenubarRadioGroup: typeof MenubarPrimitive.RadioGroup = MenubarPrimitive.RadioGroup;

/** A visually persistent horizontal menu for desktop-style application navigation. */
const Menubar = React.forwardRef<
	React.ElementRef<typeof MenubarPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Root>
>(({className, ...props}, ref) => (
	<MenubarPrimitive.Root
		ref={ref}
		className={cn(
			"wwc:flex wwc:h-10 wwc:items-center wwc:space-x-1 wwc:rounded-md wwc:border wwc:bg-card wwc:p-1",
			className,
		)}
		{...props}
	/>
));
Menubar.displayName = MenubarPrimitive.Root.displayName;

const MenubarTrigger = React.forwardRef<
	React.ElementRef<typeof MenubarPrimitive.Trigger>,
	React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Trigger>
>(({className, ...props}, ref) => (
	<MenubarPrimitive.Trigger
		ref={ref}
		className={cn(
			"wwc:flex wwc:cursor-pointer wwc:data-[disabled]:cursor-default wwc:select-none wwc:items-center wwc:rounded-sm wwc:px-3 wwc:py-1.5 wwc:text-sm wwc:font-medium wwc:outline-none wwc:focus:bg-menu-highlight wwc:focus:text-menu-highlight-foreground wwc:data-[state=open]:bg-menu-highlight wwc:data-[state=open]:text-menu-highlight-foreground",
			className,
		)}
		{...props}
	/>
));
MenubarTrigger.displayName = MenubarPrimitive.Trigger.displayName;

const MenubarSubTrigger = React.forwardRef<
	React.ElementRef<typeof MenubarPrimitive.SubTrigger>,
	React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubTrigger> & {
		inset?: boolean;
	}
>(({className, inset, children, ...props}, ref) => (
	<MenubarPrimitive.SubTrigger
		ref={ref}
		className={cn(
			"wwc:flex wwc:cursor-pointer wwc:data-[disabled]:cursor-default wwc:select-none wwc:items-center wwc:rounded-sm wwc:px-2 wwc:py-1.5 wwc:text-sm wwc:outline-none wwc:focus:bg-menu-highlight wwc:focus:text-menu-highlight-foreground wwc:data-[state=open]:bg-menu-highlight wwc:data-[state=open]:text-menu-highlight-foreground",
			inset && "wwc:pl-8",
			className,
		)}
		{...props}
	>
		{children}
		<ChevronRight className="wwc:ml-auto wwc:h-4 wwc:w-4" />
	</MenubarPrimitive.SubTrigger>
));
MenubarSubTrigger.displayName = MenubarPrimitive.SubTrigger.displayName;

const MenubarSubContent = React.forwardRef<
	React.ElementRef<typeof MenubarPrimitive.SubContent>,
	React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubContent>
>(({className, ...props}, ref) => (
	<MenubarPrimitive.SubContent
		ref={ref}
		className={cn(
			"wwc:z-50 wwc:min-w-[8rem] wwc:overflow-hidden wwc:rounded-md wwc:border wwc:bg-popover wwc:p-1 wwc:text-popover-foreground wwc:data-[state=open]:animate-in wwc:data-[state=closed]:animate-out wwc:data-[state=closed]:fade-out-0 wwc:data-[state=open]:fade-in-0 wwc:data-[state=closed]:zoom-out-95 wwc:data-[state=open]:zoom-in-95 wwc:data-[side=bottom]:slide-in-from-top-2 wwc:data-[side=left]:slide-in-from-right-2 wwc:data-[side=right]:slide-in-from-left-2 wwc:data-[side=top]:slide-in-from-bottom-2",
			className,
		)}
		{...props}
	/>
));
MenubarSubContent.displayName = MenubarPrimitive.SubContent.displayName;

const MenubarContent = React.forwardRef<
	React.ElementRef<typeof MenubarPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Content>
>(({className, align = "start", alignOffset = -4, sideOffset = 8, ...props}, ref) => (
	<MenubarPrimitive.Portal>
		<MenubarPrimitive.Content
			ref={ref}
			align={align}
			alignOffset={alignOffset}
			sideOffset={sideOffset}
			className={cn(
				"wwc:z-50 wwc:min-w-[12rem] wwc:overflow-hidden wwc:rounded-md wwc:border wwc:bg-popover wwc:p-1 wwc:text-popover-foreground wwc:shadow-md wwc:data-[state=open]:animate-in wwc:data-[state=closed]:fade-out-0 wwc:data-[state=open]:fade-in-0 wwc:data-[state=closed]:zoom-out-95 wwc:data-[state=open]:zoom-in-95 wwc:data-[side=bottom]:slide-in-from-top-2 wwc:data-[side=left]:slide-in-from-right-2 wwc:data-[side=right]:slide-in-from-left-2 wwc:data-[side=top]:slide-in-from-bottom-2",
				className,
			)}
			{...props}
		/>
	</MenubarPrimitive.Portal>
));
MenubarContent.displayName = MenubarPrimitive.Content.displayName;

const MenubarItem = React.forwardRef<
	React.ElementRef<typeof MenubarPrimitive.Item>,
	React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Item> & {
		inset?: boolean;
	}
>(({className, inset, ...props}, ref) => (
	<MenubarPrimitive.Item
		ref={ref}
		className={cn(
			"wwc:relative wwc:flex wwc:cursor-pointer wwc:select-none wwc:items-center wwc:rounded-sm wwc:px-2 wwc:py-1.5 wwc:text-sm wwc:outline-none wwc:focus:bg-menu-highlight wwc:focus:text-menu-highlight-foreground wwc:data-[disabled]:pointer-events-none wwc:data-[disabled]:opacity-50",
			inset && "wwc:pl-8",
			className,
		)}
		{...props}
	/>
));
MenubarItem.displayName = MenubarPrimitive.Item.displayName;

const MenubarCheckboxItem = React.forwardRef<
	React.ElementRef<typeof MenubarPrimitive.CheckboxItem>,
	React.ComponentPropsWithoutRef<typeof MenubarPrimitive.CheckboxItem>
>(({className, children, checked, ...props}, ref) => (
	<MenubarPrimitive.CheckboxItem
		ref={ref}
		className={cn(
			"wwc:relative wwc:flex wwc:cursor-pointer wwc:select-none wwc:items-center wwc:rounded-sm wwc:py-1.5 wwc:pl-8 wwc:pr-2 wwc:text-sm wwc:outline-none wwc:focus:bg-menu-highlight wwc:focus:text-menu-highlight-foreground wwc:data-[disabled]:pointer-events-none wwc:data-[disabled]:opacity-50",
			className,
		)}
		checked={checked}
		{...props}
	>
		<span className="wwc:absolute wwc:left-2 wwc:flex wwc:h-3.5 wwc:w-3.5 wwc:items-center wwc:justify-center">
			<MenubarPrimitive.ItemIndicator>
				<Check className="wwc:h-4 wwc:w-4" />
			</MenubarPrimitive.ItemIndicator>
		</span>
		{children}
	</MenubarPrimitive.CheckboxItem>
));
MenubarCheckboxItem.displayName = MenubarPrimitive.CheckboxItem.displayName;

const MenubarRadioItem = React.forwardRef<
	React.ElementRef<typeof MenubarPrimitive.RadioItem>,
	React.ComponentPropsWithoutRef<typeof MenubarPrimitive.RadioItem>
>(({className, children, ...props}, ref) => (
	<MenubarPrimitive.RadioItem
		ref={ref}
		className={cn(
			"wwc:relative wwc:flex wwc:cursor-pointer wwc:select-none wwc:items-center wwc:rounded-sm wwc:py-1.5 wwc:pl-8 wwc:pr-2 wwc:text-sm wwc:outline-none wwc:focus:bg-menu-highlight wwc:focus:text-menu-highlight-foreground wwc:data-[disabled]:pointer-events-none wwc:data-[disabled]:opacity-50",
			className,
		)}
		{...props}
	>
		<span className="wwc:absolute wwc:left-2 wwc:flex wwc:h-3.5 wwc:w-3.5 wwc:items-center wwc:justify-center">
			<MenubarPrimitive.ItemIndicator>
				<Circle className="wwc:h-2 wwc:w-2 wwc:fill-current" />
			</MenubarPrimitive.ItemIndicator>
		</span>
		{children}
	</MenubarPrimitive.RadioItem>
));
MenubarRadioItem.displayName = MenubarPrimitive.RadioItem.displayName;

const MenubarLabel = React.forwardRef<
	React.ElementRef<typeof MenubarPrimitive.Label>,
	React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Label> & {
		inset?: boolean;
	}
>(({className, inset, ...props}, ref) => (
	<MenubarPrimitive.Label
		ref={ref}
		className={cn("wwc:px-2 wwc:py-1.5 wwc:text-sm wwc:font-semibold", inset && "wwc:pl-8", className)}
		{...props}
	/>
));
MenubarLabel.displayName = MenubarPrimitive.Label.displayName;

const MenubarSeparator = React.forwardRef<
	React.ElementRef<typeof MenubarPrimitive.Separator>,
	React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Separator>
>(({className, ...props}, ref) => (
	<MenubarPrimitive.Separator
		ref={ref}
		className={cn("wwc:-mx-1 wwc:my-1 wwc:h-px wwc:bg-muted", className)}
		{...props}
	/>
));
MenubarSeparator.displayName = MenubarPrimitive.Separator.displayName;

const MenubarShortcut = ({className, ...props}: React.HTMLAttributes<HTMLSpanElement>) => {
	return (
		<span
			className={cn("wwc:ml-auto wwc:text-xs wwc:tracking-widest wwc:text-muted-foreground", className)}
			{...props}
		/>
	);
};
MenubarShortcut.displayname = "MenubarShortcut";

export {
	Menubar,
	MenubarMenu,
	MenubarTrigger,
	MenubarContent,
	MenubarItem,
	MenubarSeparator,
	MenubarLabel,
	MenubarCheckboxItem,
	MenubarRadioGroup,
	MenubarRadioItem,
	MenubarPortal,
	MenubarSubContent,
	MenubarSubTrigger,
	MenubarGroup,
	MenubarSub,
	MenubarShortcut,
};
