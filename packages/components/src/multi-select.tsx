import {cn} from "@corensystem/coren-utils";
import {ChevronsUpDown, X} from "lucide-react";
import * as React from "react";

import {Badge} from "./badge";
import {Button} from "./button";
import {Checkbox} from "./checkbox";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "./command";
import {Popover, PopoverContent, PopoverTrigger} from "./popover";

export interface MultiSelectOption {
	value: string;
	label: string;
	disabled?: boolean;
}

export interface MultiSelectProps {
	/** Applied to the trigger, so a `<Label htmlFor>` can address the field. */
	id?: string;
	options: MultiSelectOption[];
	value: string[];
	onValueChange: (value: string[]) => void;
	placeholder?: string;
	searchPlaceholder?: string;
	emptyMessage?: string;
	/** Marks the field as invalid — sets aria-invalid and a destructive border. */
	invalid?: boolean;
	disabled?: boolean;
	/** Render the selected options as removable pills below the field. Defaults to true. */
	showPills?: boolean;
	/**
	 * Cap on how many pills are drawn before the rest collapse behind a `+N` chip that opens them in a
	 * popover. Keeps a long selection from growing the field's height without bound. Default `4`; pass
	 * `0` to always show every pill.
	 */
	maxPills?: number;
	className?: string;
	/** Class applied to the popover content. The popover matches the trigger width by default. */
	popoverClassName?: string;
}

/** One removable pill. Shared so the inline row and the overflow popover cannot drift apart. */
function Pill({
	option,
	onRemove,
	disabled,
}: {
	option: MultiSelectOption;
	onRemove: (value: string) => void;
	disabled?: boolean;
}) {
	return (
		<Badge variant="neutralSoft" className="wwc:gap-1 wwc:pr-1">
			{option.label}
			<button
				type="button"
				onClick={() => onRemove(option.value)}
				disabled={disabled}
				aria-label={`Remove ${option.label}`}
				className="wwc:rounded-sm wwc:p-0.5 wwc:text-muted-foreground wwc:transition-colors wwc:hover:bg-background/60 wwc:hover:text-foreground wwc:disabled:pointer-events-none wwc:disabled:opacity-50"
			>
				<X className="wwc:h-3 wwc:w-3" />
			</button>
		</Badge>
	);
}

/**
 * A searchable multi-select field combining a Popover, Command palette, and Button.
 * Selections stay open for rapid picking and are shown as removable pills below the field.
 */
function MultiSelect({
	id,
	options,
	value,
	onValueChange,
	placeholder = "Select options...",
	searchPlaceholder = "Search...",
	emptyMessage = "No option found.",
	invalid = false,
	disabled = false,
	showPills = true,
	maxPills = 4,
	className,
	popoverClassName,
}: MultiSelectProps) {
	const [open, setOpen] = React.useState(false);

	const toggle = (optionValue: string) =>
		onValueChange(value.includes(optionValue) ? value.filter((v) => v !== optionValue) : [...value, optionValue]);

	const selectedOptions = options.filter((option) => value.includes(option.value));
	const [overflowOpen, setOverflowOpen] = React.useState(false);
	// A cap of 0 means "no cap"; anything past the cap collapses into the +N chip.
	const capped = maxPills > 0 && selectedOptions.length > maxPills;
	const shownPills = capped ? selectedOptions.slice(0, maxPills) : selectedOptions;
	const overflowPills = capped ? selectedOptions.slice(maxPills) : [];
	const triggerLabel = selectedOptions.length === 0 ? placeholder : `${selectedOptions.length} selected`;

	return (
		<div>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						id={id}
						variant="outline"
						role="combobox"
						aria-expanded={open}
						aria-invalid={invalid || undefined}
						disabled={disabled}
						className={cn(
							"wwc:w-full wwc:justify-between wwc:font-normal",
							"wwc:aria-invalid:border-destructive wwc:aria-invalid:focus-visible:ring-destructive",
							className,
						)}
					>
						<span className={cn("wwc:truncate", selectedOptions.length === 0 && "wwc:text-muted-foreground")}>
							{triggerLabel}
						</span>
						<ChevronsUpDown className="wwc:ml-2 wwc:h-4 wwc:w-4 wwc:shrink-0 wwc:opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent
					align="start"
					style={{width: "var(--radix-popover-trigger-width)"}}
					className={cn("wwc:min-w-[240px] wwc:p-0", popoverClassName)}
				>
					<Command>
						<CommandInput placeholder={searchPlaceholder} />
						<CommandList>
							<CommandEmpty>{emptyMessage}</CommandEmpty>
							<CommandGroup>
								{options.map((option) => (
									<CommandItem
										key={option.value}
										// Search matches the human-readable label, not the (possibly opaque) value.
										value={option.label}
										onSelect={() => toggle(option.value)}
										disabled={option.disabled}
									>
										<Checkbox checked={value.includes(option.value)} className="wwc:mr-2" />
										{option.label}
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>

			{/* Selected values as removable pills below the field — visible without opening the dropdown. */}
			{showPills && selectedOptions.length > 0 && (
				<div className="wwc:mt-2 wwc:flex wwc:flex-wrap wwc:gap-1.5">
					{shownPills.map((option) => (
						<Pill key={option.value} option={option} onRemove={toggle} disabled={disabled} />
					))}

					{overflowPills.length > 0 && (
						<Popover open={overflowOpen} onOpenChange={setOverflowOpen}>
							<PopoverTrigger asChild>
								<button
									type="button"
									aria-label={`Show ${overflowPills.length} more selected`}
									className="wwc:inline-flex wwc:items-center wwc:rounded-md wwc:border wwc:border-border wwc:bg-muted wwc:px-2 wwc:py-0.5 wwc:text-xs wwc:font-semibold wwc:text-muted-foreground wwc:transition-colors wwc:hover:bg-muted/70"
								>
									+{overflowPills.length}
								</button>
							</PopoverTrigger>
							<PopoverContent align="start" className="wwc:w-auto wwc:max-w-[280px] wwc:p-2">
								<div className="wwc:flex wwc:flex-wrap wwc:gap-1.5">
									{overflowPills.map((option) => (
										<Pill key={option.value} option={option} onRemove={toggle} disabled={disabled} />
									))}
								</div>
							</PopoverContent>
						</Popover>
					)}
				</div>
			)}
		</div>
	);
}

export {MultiSelect};
