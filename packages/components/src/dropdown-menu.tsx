import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import {cn} from "@wakecap/core-utils";
import {Check, ChevronRight, Circle} from "lucide-react";
import * as React from "react";

/** Displays a menu of actions triggered by a button. */
function DropdownMenu(props: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Root>) {
	return <DropdownMenuPrimitive.Root {...props} />;
}
const DropdownMenuTrigger: typeof DropdownMenuPrimitive.Trigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuGroup: typeof DropdownMenuPrimitive.Group = DropdownMenuPrimitive.Group;
const DropdownMenuPortal: typeof DropdownMenuPrimitive.Portal = DropdownMenuPrimitive.Portal;
const DropdownMenuSub: typeof DropdownMenuPrimitive.Sub = DropdownMenuPrimitive.Sub;
const DropdownMenuRadioGroup: typeof DropdownMenuPrimitive.RadioGroup = DropdownMenuPrimitive.RadioGroup;

const DropdownMenuSubTrigger = React.forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {inset?: boolean}
>(({className, inset, children, ...props}, ref) => (
	<DropdownMenuPrimitive.SubTrigger
		ref={ref}
		className={cn(
			// Matches DropdownMenuItem: gap-2 owns icon/label spacing (the chevron is pushed by ml-auto).
			"wwc:flex wwc:cursor-pointer wwc:data-[disabled]:cursor-default wwc:select-none wwc:items-center wwc:gap-2 wwc:rounded-sm wwc:px-2 wwc:py-1.5 wwc:text-sm wwc:outline-none wwc:focus:bg-menu-highlight wwc:data-[state=open]:bg-menu-highlight",
			inset && "wwc:pl-8",
			className,
		)}
		{...props}
	>
		{children}
		<ChevronRight className="wwc:ml-auto wwc:h-4 wwc:w-4" />
	</DropdownMenuPrimitive.SubTrigger>
));
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName;

const DropdownMenuSubContent = React.forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({className, ...props}, ref) => (
	<DropdownMenuPrimitive.SubContent
		ref={ref}
		className={cn(
			"wwc:z-50 wwc:min-w-[8rem] wwc:overflow-hidden wwc:rounded-md wwc:border wwc:bg-popover wwc:p-1 wwc:text-popover-foreground wwc:shadow-lg wwc:data-[state=open]:animate-in wwc:data-[state=closed]:animate-out wwc:data-[state=closed]:fade-out-0 wwc:data-[state=open]:fade-in-0 wwc:data-[state=closed]:zoom-out-95 wwc:data-[state=open]:zoom-in-95 wwc:data-[side=bottom]:slide-in-from-top-2 wwc:data-[side=left]:slide-in-from-right-2 wwc:data-[side=right]:slide-in-from-left-2 wwc:data-[side=top]:slide-in-from-bottom-2",
			className,
		)}
		{...props}
	/>
));
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;

const DropdownMenuContent = React.forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({className, sideOffset = 4, align = "start", ...props}, ref) => (
	<DropdownMenuPrimitive.Portal>
		<DropdownMenuPrimitive.Content
			ref={ref}
			sideOffset={sideOffset}
			align={align}
			className={cn(
				"wwc:z-50 wwc:min-w-[8rem] wwc:overflow-hidden wwc:rounded-md wwc:border wwc:bg-popover wwc:p-1 wwc:text-popover-foreground wwc:shadow-md wwc:data-[state=open]:animate-in wwc:data-[state=closed]:animate-out wwc:data-[state=closed]:fade-out-0 wwc:data-[state=open]:fade-in-0 wwc:data-[state=closed]:zoom-out-95 wwc:data-[state=open]:zoom-in-95 wwc:data-[side=bottom]:slide-in-from-top-2 wwc:data-[side=left]:slide-in-from-right-2 wwc:data-[side=right]:slide-in-from-left-2 wwc:data-[side=top]:slide-in-from-bottom-2",
				className,
			)}
			{...props}
		/>
	</DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

const DropdownMenuItem = React.forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.Item>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {inset?: boolean}
>(({className, inset, ...props}, ref) => (
	<DropdownMenuPrimitive.Item
		ref={ref}
		className={cn(
			// gap-2 owns the icon/label spacing so call sites never need `mr-2` on the leading icon.
			"wwc:relative wwc:flex wwc:cursor-pointer wwc:select-none wwc:items-center wwc:gap-2 wwc:rounded-sm wwc:px-2 wwc:py-1.5 wwc:text-sm wwc:outline-none wwc:transition-colors wwc:focus:bg-menu-highlight wwc:focus:text-menu-highlight-foreground wwc:data-[disabled]:pointer-events-none wwc:data-[disabled]:opacity-50 wwc:[&_svg]:pointer-events-none wwc:[&_svg]:size-4 wwc:[&_svg]:shrink-0",
			inset && "wwc:pl-8",
			className,
		)}
		{...props}
	/>
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

const DropdownMenuCheckboxItem = React.forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({className, children, checked, ...props}, ref) => (
	<DropdownMenuPrimitive.CheckboxItem
		ref={ref}
		className={cn(
			"wwc:relative wwc:flex wwc:cursor-pointer wwc:select-none wwc:items-center wwc:rounded-sm wwc:py-1.5 wwc:pl-8 wwc:pr-2 wwc:text-sm wwc:outline-none wwc:transition-colors wwc:focus:bg-menu-highlight wwc:focus:text-menu-highlight-foreground wwc:data-[disabled]:pointer-events-none wwc:data-[disabled]:opacity-50",
			className,
		)}
		checked={checked}
		{...props}
	>
		<span className="wwc:absolute wwc:left-2 wwc:flex wwc:h-3.5 wwc:w-3.5 wwc:items-center wwc:justify-center">
			<DropdownMenuPrimitive.ItemIndicator>
				<Check className="wwc:h-4 wwc:w-4" />
			</DropdownMenuPrimitive.ItemIndicator>
		</span>
		{children}
	</DropdownMenuPrimitive.CheckboxItem>
));
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName;

const DropdownMenuRadioItem = React.forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({className, children, ...props}, ref) => (
	<DropdownMenuPrimitive.RadioItem
		ref={ref}
		className={cn(
			"wwc:relative wwc:flex wwc:cursor-pointer wwc:select-none wwc:items-center wwc:rounded-sm wwc:py-1.5 wwc:pl-8 wwc:pr-2 wwc:text-sm wwc:outline-none wwc:transition-colors wwc:focus:bg-menu-highlight wwc:focus:text-menu-highlight-foreground wwc:data-[disabled]:pointer-events-none wwc:data-[disabled]:opacity-50",
			className,
		)}
		{...props}
	>
		<span className="wwc:absolute wwc:left-2 wwc:flex wwc:h-3.5 wwc:w-3.5 wwc:items-center wwc:justify-center">
			<DropdownMenuPrimitive.ItemIndicator>
				<Circle className="wwc:h-2 wwc:w-2 wwc:fill-current" />
			</DropdownMenuPrimitive.ItemIndicator>
		</span>
		{children}
	</DropdownMenuPrimitive.RadioItem>
));
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

const DropdownMenuLabel = React.forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.Label>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {inset?: boolean}
>(({className, inset, ...props}, ref) => (
	<DropdownMenuPrimitive.Label
		ref={ref}
		className={cn("wwc:px-2 wwc:py-1.5 wwc:text-sm wwc:font-semibold", inset && "wwc:pl-8", className)}
		{...props}
	/>
));
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

const DropdownMenuSeparator = React.forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({className, ...props}, ref) => (
	<DropdownMenuPrimitive.Separator
		ref={ref}
		className={cn("wwc:-mx-1 wwc:my-1 wwc:h-px wwc:bg-muted", className)}
		{...props}
	/>
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

const DropdownMenuShortcut = ({className, ...props}: React.HTMLAttributes<HTMLSpanElement>) => (
	<span className={cn("wwc:ml-auto wwc:text-xs wwc:tracking-widest wwc:opacity-60", className)} {...props} />
);
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

export {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuCheckboxItem,
	DropdownMenuRadioItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuGroup,
	DropdownMenuPortal,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuRadioGroup,
};
