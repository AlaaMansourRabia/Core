import type {DialogProps} from "@radix-ui/react-dialog";

import {cn} from "@wakecap/core-utils";
import {Command as CommandPrimitive} from "cmdk";
import {Search} from "lucide-react";
import * as React from "react";

import {Dialog, DialogContent} from "./dialog";

/** A command palette and search interface built on cmdk. */
const Command = React.forwardRef<
	React.ElementRef<typeof CommandPrimitive>,
	React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({className, ...props}, ref) => (
	<CommandPrimitive
		ref={ref}
		className={cn(
			"wwc:flex wwc:h-full wwc:w-full wwc:flex-col wwc:overflow-hidden wwc:rounded-md wwc:bg-popover wwc:text-popover-foreground",
			className,
		)}
		{...props}
	/>
));
Command.displayName = CommandPrimitive.displayName;

/**
 * `contentClassName` reaches the dialog surface itself — width, height, anything about the panel
 * rather than the palette inside it. Without it a caller could only restyle the list, and the
 * surface stayed pinned at `DialogContent`'s default `max-w-lg`.
 */
const CommandDialog = ({children, contentClassName, ...props}: DialogProps & {contentClassName?: string}) => {
	return (
		<Dialog {...props}>
			<DialogContent className={cn("wwc:overflow-hidden wwc:p-0 wwc:shadow-lg", contentClassName)}>
				<Command className="wwc:[&_[cmdk-group-heading]]:px-2 wwc:[&_[cmdk-group-heading]]:font-medium wwc:[&_[cmdk-group-heading]]:text-muted-foreground wwc:[&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 wwc:[&_[cmdk-group]]:px-2 wwc:[&_[cmdk-input-wrapper]_svg]:h-5 wwc:[&_[cmdk-input-wrapper]_svg]:w-5 wwc:[&_[cmdk-input]]:h-12 wwc:[&_[cmdk-item]]:px-2 wwc:[&_[cmdk-item]]:py-3 wwc:[&_[cmdk-item]_svg]:h-5 wwc:[&_[cmdk-item]_svg]:w-5">
					{children}
				</Command>
			</DialogContent>
		</Dialog>
	);
};

const CommandInput = React.forwardRef<
	React.ElementRef<typeof CommandPrimitive.Input>,
	React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({className, ...props}, ref) => (
	<div className="wwc:flex wwc:items-center wwc:border-b wwc:px-3" cmdk-input-wrapper="">
		<Search className="wwc:mr-2 wwc:h-4 wwc:w-4 wwc:shrink-0 wwc:opacity-50" />
		<CommandPrimitive.Input
			ref={ref}
			className={cn(
				"wwc:flex wwc:h-11 wwc:w-full wwc:rounded-md wwc:bg-transparent wwc:py-3 wwc:text-sm wwc:outline-none wwc:placeholder:text-muted-foreground wwc:disabled:cursor-not-allowed wwc:disabled:opacity-50",
				className,
			)}
			{...props}
		/>
	</div>
));

CommandInput.displayName = CommandPrimitive.Input.displayName;

const CommandList = React.forwardRef<
	React.ElementRef<typeof CommandPrimitive.List>,
	React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({className, ...props}, ref) => (
	<CommandPrimitive.List
		ref={ref}
		className={cn("wwc:max-h-[300px] wwc:overflow-y-auto wwc:overflow-x-hidden", className)}
		{...props}
	/>
));

CommandList.displayName = CommandPrimitive.List.displayName;

const CommandEmpty = React.forwardRef<
	React.ElementRef<typeof CommandPrimitive.Empty>,
	React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => <CommandPrimitive.Empty ref={ref} className="wwc:py-6 wwc:text-center wwc:text-sm" {...props} />);

CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

const CommandGroup = React.forwardRef<
	React.ElementRef<typeof CommandPrimitive.Group>,
	React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({className, ...props}, ref) => (
	<CommandPrimitive.Group
		ref={ref}
		className={cn(
			"wwc:overflow-hidden wwc:p-1 wwc:text-foreground wwc:[&_[cmdk-group-heading]]:px-2 wwc:[&_[cmdk-group-heading]]:py-1.5 wwc:[&_[cmdk-group-heading]]:text-xs wwc:[&_[cmdk-group-heading]]:font-medium wwc:[&_[cmdk-group-heading]]:text-muted-foreground",
			className,
		)}
		{...props}
	/>
));

CommandGroup.displayName = CommandPrimitive.Group.displayName;

const CommandSeparator = React.forwardRef<
	React.ElementRef<typeof CommandPrimitive.Separator>,
	React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({className, ...props}, ref) => (
	<CommandPrimitive.Separator ref={ref} className={cn("wwc:-mx-1 wwc:h-px wwc:bg-border", className)} {...props} />
));
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

const CommandItem = React.forwardRef<
	React.ElementRef<typeof CommandPrimitive.Item>,
	React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({className, ...props}, ref) => (
	<CommandPrimitive.Item
		ref={ref}
		className={cn(
			"wwc:relative wwc:flex wwc:cursor-pointer wwc:gap-2 wwc:select-none wwc:items-center wwc:rounded-sm wwc:px-2 wwc:py-1.5 wwc:text-sm wwc:outline-none wwc:data-[disabled=true]:pointer-events-none wwc:data-[selected=true]:bg-menu-highlight wwc:data-[selected=true]:text-menu-highlight-foreground wwc:data-[disabled=true]:opacity-50 wwc:[&_svg]:pointer-events-none wwc:[&_svg]:size-4 wwc:[&_svg]:shrink-0",
			className,
		)}
		{...props}
	/>
));

CommandItem.displayName = CommandPrimitive.Item.displayName;

const CommandShortcut = ({className, ...props}: React.HTMLAttributes<HTMLSpanElement>) => {
	return (
		<span
			className={cn("wwc:ml-auto wwc:text-xs wwc:tracking-widest wwc:text-muted-foreground", className)}
			{...props}
		/>
	);
};
CommandShortcut.displayName = "CommandShortcut";

export {
	Command,
	CommandDialog,
	CommandInput,
	CommandList,
	CommandEmpty,
	CommandGroup,
	CommandItem,
	CommandShortcut,
	CommandSeparator,
};
