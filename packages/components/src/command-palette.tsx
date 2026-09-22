import {cn} from "@core/core-utils";
import {Search} from "lucide-react";
import * as React from "react";

import {Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator} from "./command";

export interface CommandPaletteItem {
	id: string;
	label: string;
	description?: string;
	icon?: React.ReactNode;
	shortcut?: string[];
	onSelect?: () => void;
	disabled?: boolean;
}

export interface CommandPaletteGroup {
	heading?: string;
	items: CommandPaletteItem[];
}

export interface CommandPaletteProps {
	/** Whether the palette is open */
	open: boolean;
	/** Callback when open state changes */
	onOpenChange: (open: boolean) => void;
	/** Grouped command items */
	groups: CommandPaletteGroup[];
	/** Placeholder for search input */
	placeholder?: string;
	/** Empty state message */
	emptyMessage?: string;
	/** Callback when an item is selected */
	onSelect?: (item: CommandPaletteItem) => void;
}

/** Full-featured command palette with search and keyboard navigation. */
const CommandPalette = ({
	open,
	onOpenChange,
	groups,
	placeholder = "Type a command or search...",
	emptyMessage = "No results found.",
	onSelect,
}: CommandPaletteProps) => {
	const handleSelect = (item: CommandPaletteItem) => {
		item.onSelect?.();
		onSelect?.(item);
		onOpenChange(false);
	};

	return (
		<CommandDialog open={open} onOpenChange={onOpenChange}>
			<CommandInput placeholder={placeholder} />
			<CommandList>
				<CommandEmpty>{emptyMessage}</CommandEmpty>
				{groups.map((group, groupIndex) => (
					<React.Fragment key={groupIndex}>
						{groupIndex > 0 && <CommandSeparator />}
						<CommandGroup heading={group.heading}>
							{group.items.map((item) => (
								<CommandItem
									key={item.id}
									disabled={item.disabled}
									onSelect={() => handleSelect(item)}
									className="wwc:gap-2"
								>
									{item.icon && (
										<span className="wwc:flex-shrink-0 wwc:text-muted-foreground">{item.icon}</span>
									)}
									<div className="wwc:flex-1 wwc:min-w-0">
										<div className="wwc:truncate">{item.label}</div>
										{item.description && (
											<div className="wwc:text-xs wwc:text-muted-foreground wwc:truncate">
												{item.description}
											</div>
										)}
									</div>
									{item.shortcut && (
										<div className="wwc:flex wwc:items-center wwc:gap-1">
											{item.shortcut.map((key, keyIndex) => (
												<kbd
													key={keyIndex}
													className="wwc:pointer-events-none wwc:inline-flex wwc:h-5 wwc:select-none wwc:items-center wwc:gap-1 wwc:rounded wwc:border wwc:bg-muted wwc:px-1.5 wwc:font-mono wwc:text-[10px] wwc:font-medium wwc:text-muted-foreground"
												>
													{key}
												</kbd>
											))}
										</div>
									)}
								</CommandItem>
							))}
						</CommandGroup>
					</React.Fragment>
				))}
			</CommandList>
		</CommandDialog>
	);
};
CommandPalette.displayName = "CommandPalette";

export interface CommandPaletteTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	/** Shortcut hint text */
	shortcutHint?: string;
}

/** Button trigger for opening command palette with keyboard shortcut hint. */
const CommandPaletteTrigger = React.forwardRef<HTMLButtonElement, CommandPaletteTriggerProps>(
	({className, shortcutHint = "⌘K", children, ...props}, ref) => (
		<button
			ref={ref}
			type="button"
			className={cn(
				"wwc:inline-flex wwc:items-center wwc:gap-2 wwc:rounded-md wwc:border wwc:border-border wwc:bg-background wwc:px-3 wwc:py-2 wwc:text-sm wwc:text-muted-foreground wwc:transition-colors hover:wwc:bg-accent hover:wwc:text-accent-foreground",
				className,
			)}
			{...props}
		>
			<Search className="wwc:h-4 wwc:w-4" />
			{children || <span>Search...</span>}
			{shortcutHint && (
				<kbd className="wwc:pointer-events-none wwc:ml-auto wwc:hidden wwc:h-5 wwc:select-none wwc:items-center wwc:gap-1 wwc:rounded wwc:border wwc:bg-muted wwc:px-1.5 wwc:font-mono wwc:text-[10px] wwc:font-medium wwc:text-muted-foreground wwc:sm:flex">
					{shortcutHint}
				</kbd>
			)}
		</button>
	),
);
CommandPaletteTrigger.displayName = "CommandPaletteTrigger";

export {CommandPalette, CommandPaletteTrigger};
