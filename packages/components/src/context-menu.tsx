import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import {cn} from "@wakecap/core-utils";
import {Check, ChevronRight, Circle} from "lucide-react";
import * as React from "react";

/** Displays a menu triggered by a right-click. */
function ContextMenu(props: React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Root>) {
	return <ContextMenuPrimitive.Root {...props} />;
}

const ContextMenuTrigger: typeof ContextMenuPrimitive.Trigger = ContextMenuPrimitive.Trigger;

const ContextMenuGroup: typeof ContextMenuPrimitive.Group = ContextMenuPrimitive.Group;

const ContextMenuPortal: typeof ContextMenuPrimitive.Portal = ContextMenuPrimitive.Portal;

const ContextMenuSub: typeof ContextMenuPrimitive.Sub = ContextMenuPrimitive.Sub;

const ContextMenuRadioGroup: typeof ContextMenuPrimitive.RadioGroup = ContextMenuPrimitive.RadioGroup;

const ContextMenuSubTrigger = React.forwardRef<
	React.ElementRef<typeof ContextMenuPrimitive.SubTrigger>,
	React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubTrigger> & {
		inset?: boolean;
	}
>(({className, inset, children, ...props}, ref) => (
	<ContextMenuPrimitive.SubTrigger
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
	</ContextMenuPrimitive.SubTrigger>
));
ContextMenuSubTrigger.displayName = ContextMenuPrimitive.SubTrigger.displayName;

const ContextMenuSubContent = React.forwardRef<
	React.ElementRef<typeof ContextMenuPrimitive.SubContent>,
	React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubContent>
>(({className, ...props}, ref) => (
	<ContextMenuPrimitive.SubContent
		ref={ref}
		className={cn(
			"wwc:z-50 wwc:min-w-[8rem] wwc:overflow-hidden wwc:rounded-md wwc:border wwc:bg-popover wwc:p-1 wwc:text-popover-foreground wwc:shadow-md wwc:data-[state=open]:animate-in wwc:data-[state=closed]:animate-out wwc:data-[state=closed]:fade-out-0 wwc:data-[state=open]:fade-in-0 wwc:data-[state=closed]:zoom-out-95 wwc:data-[state=open]:zoom-in-95 wwc:data-[side=bottom]:slide-in-from-top-2 wwc:data-[side=left]:slide-in-from-right-2 wwc:data-[side=right]:slide-in-from-left-2 wwc:data-[side=top]:slide-in-from-bottom-2",
			className,
		)}
		{...props}
	/>
));
ContextMenuSubContent.displayName = ContextMenuPrimitive.SubContent.displayName;

const ContextMenuContent = React.forwardRef<
	React.ElementRef<typeof ContextMenuPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Content>
>(({className, ...props}, ref) => (
	<ContextMenuPrimitive.Portal>
		<ContextMenuPrimitive.Content
			ref={ref}
			className={cn(
				"wwc:z-50 wwc:min-w-[8rem] wwc:overflow-hidden wwc:rounded-md wwc:border wwc:bg-popover wwc:p-1 wwc:text-popover-foreground wwc:shadow-md wwc:animate-in wwc:fade-in-80 wwc:data-[state=open]:animate-in wwc:data-[state=closed]:animate-out wwc:data-[state=closed]:fade-out-0 wwc:data-[state=open]:fade-in-0 wwc:data-[state=closed]:zoom-out-95 wwc:data-[state=open]:zoom-in-95 wwc:data-[side=bottom]:slide-in-from-top-2 wwc:data-[side=left]:slide-in-from-right-2 wwc:data-[side=right]:slide-in-from-left-2 wwc:data-[side=top]:slide-in-from-bottom-2",
				className,
			)}
			{...props}
		/>
	</ContextMenuPrimitive.Portal>
));
ContextMenuContent.displayName = ContextMenuPrimitive.Content.displayName;

const ContextMenuItem = React.forwardRef<
	React.ElementRef<typeof ContextMenuPrimitive.Item>,
	React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item> & {
		inset?: boolean;
	}
>(({className, inset, ...props}, ref) => (
	<ContextMenuPrimitive.Item
		ref={ref}
		className={cn(
			"wwc:relative wwc:flex wwc:cursor-pointer wwc:select-none wwc:items-center wwc:rounded-sm wwc:px-2 wwc:py-1.5 wwc:text-sm wwc:outline-none wwc:focus:bg-menu-highlight wwc:focus:text-menu-highlight-foreground wwc:data-[disabled]:pointer-events-none wwc:data-[disabled]:opacity-50",
			inset && "wwc:pl-8",
			className,
		)}
		{...props}
	/>
));
ContextMenuItem.displayName = ContextMenuPrimitive.Item.displayName;

const ContextMenuCheckboxItem = React.forwardRef<
	React.ElementRef<typeof ContextMenuPrimitive.CheckboxItem>,
	React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.CheckboxItem>
>(({className, children, checked, ...props}, ref) => (
	<ContextMenuPrimitive.CheckboxItem
		ref={ref}
		className={cn(
			"wwc:relative wwc:flex wwc:cursor-pointer wwc:select-none wwc:items-center wwc:rounded-sm wwc:py-1.5 wwc:pl-8 wwc:pr-2 wwc:text-sm wwc:outline-none wwc:focus:bg-menu-highlight wwc:focus:text-menu-highlight-foreground wwc:data-[disabled]:pointer-events-none wwc:data-[disabled]:opacity-50",
			className,
		)}
		checked={checked}
		{...props}
	>
		<span className="wwc:absolute wwc:left-2 wwc:flex wwc:h-3.5 wwc:w-3.5 wwc:items-center wwc:justify-center">
			<ContextMenuPrimitive.ItemIndicator>
				<Check className="wwc:h-4 wwc:w-4" />
			</ContextMenuPrimitive.ItemIndicator>
		</span>
		{children}
	</ContextMenuPrimitive.CheckboxItem>
));
ContextMenuCheckboxItem.displayName = ContextMenuPrimitive.CheckboxItem.displayName;

const ContextMenuRadioItem = React.forwardRef<
	React.ElementRef<typeof ContextMenuPrimitive.RadioItem>,
	React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.RadioItem>
>(({className, children, ...props}, ref) => (
	<ContextMenuPrimitive.RadioItem
		ref={ref}
		className={cn(
			"wwc:relative wwc:flex wwc:cursor-pointer wwc:select-none wwc:items-center wwc:rounded-sm wwc:py-1.5 wwc:pl-8 wwc:pr-2 wwc:text-sm wwc:outline-none wwc:focus:bg-menu-highlight wwc:focus:text-menu-highlight-foreground wwc:data-[disabled]:pointer-events-none wwc:data-[disabled]:opacity-50",
			className,
		)}
		{...props}
	>
		<span className="wwc:absolute wwc:left-2 wwc:flex wwc:h-3.5 wwc:w-3.5 wwc:items-center wwc:justify-center">
			<ContextMenuPrimitive.ItemIndicator>
				<Circle className="wwc:h-2 wwc:w-2 wwc:fill-current" />
			</ContextMenuPrimitive.ItemIndicator>
		</span>
		{children}
	</ContextMenuPrimitive.RadioItem>
));
ContextMenuRadioItem.displayName = ContextMenuPrimitive.RadioItem.displayName;

const ContextMenuLabel = React.forwardRef<
	React.ElementRef<typeof ContextMenuPrimitive.Label>,
	React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Label> & {
		inset?: boolean;
	}
>(({className, inset, ...props}, ref) => (
	<ContextMenuPrimitive.Label
		ref={ref}
		className={cn(
			"wwc:px-2 wwc:py-1.5 wwc:text-sm wwc:font-semibold wwc:text-foreground",
			inset && "wwc:pl-8",
			className,
		)}
		{...props}
	/>
));
ContextMenuLabel.displayName = ContextMenuPrimitive.Label.displayName;

const ContextMenuSeparator = React.forwardRef<
	React.ElementRef<typeof ContextMenuPrimitive.Separator>,
	React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Separator>
>(({className, ...props}, ref) => (
	<ContextMenuPrimitive.Separator
		ref={ref}
		className={cn("wwc:-mx-1 wwc:my-1 wwc:h-px wwc:bg-border", className)}
		{...props}
	/>
));
ContextMenuSeparator.displayName = ContextMenuPrimitive.Separator.displayName;

const ContextMenuShortcut = ({className, ...props}: React.HTMLAttributes<HTMLSpanElement>) => {
	return (
		<span
			className={cn("wwc:ml-auto wwc:text-xs wwc:tracking-widest wwc:text-muted-foreground", className)}
			{...props}
		/>
	);
};
ContextMenuShortcut.displayName = "ContextMenuShortcut";

export {
	ContextMenu,
	ContextMenuTrigger,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuCheckboxItem,
	ContextMenuRadioItem,
	ContextMenuLabel,
	ContextMenuSeparator,
	ContextMenuShortcut,
	ContextMenuGroup,
	ContextMenuPortal,
	ContextMenuSub,
	ContextMenuSubContent,
	ContextMenuSubTrigger,
	ContextMenuRadioGroup,
};
