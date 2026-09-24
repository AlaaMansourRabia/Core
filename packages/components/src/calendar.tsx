import type * as React from "react";

import {cn} from "@corensystem/coren-utils";
import {ChevronDown, ChevronLeft, ChevronRight, ChevronUp} from "lucide-react";
import {DayPicker, type DropdownProps} from "react-day-picker";

import {buttonVariants} from "./button";
import {ScrollArea} from "./scroll-area";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "./select";

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
	/** Visual density. `"compact"` shrinks day cells, text, nav, and spacing. */
	size?: "default" | "compact";
};

const calendarSelectedStyle = `
.wkc-cal .selected button:hover {
	background-color: var(--color-primary) !important;
	color: var(--color-primary-foreground) !important;
}
`;

let calStyleInjected = false;
function injectCalStyle() {
	if (calStyleInjected || typeof document === "undefined") return;
	const s = document.createElement("style");
	s.textContent = calendarSelectedStyle;
	document.head.appendChild(s);
	calStyleInjected = true;
}

/** Date picker calendar built on react-day-picker with single, range, and multi-select modes. */
function Calendar({className, classNames, showOutsideDays = true, size = "default", ...props}: CalendarProps) {
	injectCalStyle();
	const compact = size === "compact";
	return (
		<DayPicker
			showOutsideDays={showOutsideDays}
			className={cn(compact ? "wwc:p-2" : "wwc:p-3", "wkc-cal", className)}
			classNames={{
				root: "wwc:w-fit",
				months: cn("wwc:flex wwc:flex-col wwc:sm:flex-row wwc:relative", compact ? "wwc:gap-2" : "wwc:gap-4"),
				month: cn("wwc:flex wwc:flex-col", compact ? "wwc:gap-2" : "wwc:gap-4"),
				month_caption: "wwc:flex wwc:justify-center wwc:pt-1 wwc:relative wwc:items-center wwc:h-7",
				caption_label: "wwc:text-sm wwc:font-medium",
				dropdowns: "wwc:flex wwc:gap-2",
				// react-day-picker v9 renders <nav> BEFORE the month, so the `relative` caption paints over it and
				// swallowed every click but the chevrons' bottom 4px (SAF-1748). Raise the nav, but let clicks fall
				// through its empty span to the caption so `captionLayout="dropdown"` selects stay reachable.
				nav: "wwc:absolute wwc:inset-x-0 wwc:top-0 wwc:z-10 wwc:pointer-events-none wwc:flex wwc:items-center wwc:justify-between wwc:px-1 wwc:pt-1",
				button_previous: cn(
					buttonVariants({variant: "outline"}),
					compact ? "wwc:h-6 wwc:w-6" : "wwc:h-7 wwc:w-7",
					"wwc:pointer-events-auto wwc:bg-transparent wwc:p-0 wwc:opacity-50 wwc:hover:opacity-100",
				),
				button_next: cn(
					buttonVariants({variant: "outline"}),
					compact ? "wwc:h-6 wwc:w-6" : "wwc:h-7 wwc:w-7",
					"wwc:pointer-events-auto wwc:bg-transparent wwc:p-0 wwc:opacity-50 wwc:hover:opacity-100",
				),
				month_grid: cn("wwc:w-full wwc:border-collapse", compact ? "wwc:mt-2" : "wwc:mt-4"),
				weekdays: "wwc:flex",
				weekday: cn(
					"wwc:text-muted-foreground wwc:font-normal wwc:text-[0.8rem] wwc:text-center",
					compact ? "wwc:w-8" : "wwc:w-9",
				),
				week: cn("wwc:flex wwc:w-full", compact ? "wwc:mt-1" : "wwc:mt-2"),
				day: cn(
					"wwc:relative wwc:p-0 wwc:text-center wwc:text-sm wwc:focus-within:relative wwc:focus-within:z-20",
					"wwc:first:[&:has([aria-selected])]:rounded-l-md wwc:last:[&:has([aria-selected])]:rounded-r-md",
					"wwc:[&:has([aria-selected])]:bg-accent wwc:[&:has([aria-selected].day-outside)]:bg-accent/50",
					"wwc:[&:has([aria-selected].day-range-end)]:rounded-r-md",
				),
				day_button: cn(
					buttonVariants({variant: "ghost"}),
					compact ? "wwc:h-8 wwc:w-8" : "wwc:h-9 wwc:w-9",
					"wwc:p-0 wwc:font-normal wwc:aria-selected:opacity-100 wwc:hover:bg-accent wwc:hover:text-accent-foreground",
				),
				range_end: "day-range-end",
				selected:
					"selected wwc:bg-primary wwc:text-primary-foreground wwc:hover:bg-primary wwc:hover:text-primary-foreground wwc:focus:bg-primary wwc:focus:text-primary-foreground wwc:rounded-md",
				today: "wwc:bg-accent wwc:text-accent-foreground wwc:rounded-md",
				outside:
					"day-outside wwc:text-muted-foreground wwc:opacity-50 wwc:aria-selected:bg-accent/50 wwc:aria-selected:text-muted-foreground",
				disabled: "wwc:text-muted-foreground wwc:opacity-50",
				range_middle: "wwc:aria-selected:bg-accent wwc:aria-selected:text-accent-foreground",
				hidden: "wwc:invisible",
				...classNames,
			}}
			components={{
				Chevron: ({orientation}) => {
					const chevronSize = compact ? "wwc:h-3.5 wwc:w-3.5" : "wwc:h-4 wwc:w-4";
					switch (orientation) {
						case "left":
							return <ChevronLeft className={chevronSize} />;
						case "right":
							return <ChevronRight className={chevronSize} />;
						case "up":
							return <ChevronUp className={chevronSize} />;
						case "down":
							return <ChevronDown className={chevronSize} />;
						default:
							return <ChevronDown className={chevronSize} />;
					}
				},
				Dropdown: ({value, onChange, options}: DropdownProps) => {
					const selected = options?.find((option) => option.value === value);
					const handleChange = (newValue: string) => {
						const changeEvent = {
							target: {value: newValue},
						} as React.ChangeEvent<HTMLSelectElement>;
						onChange?.(changeEvent);
					};
					return (
						<Select value={value?.toString()} onValueChange={(val) => handleChange(val)}>
							<SelectTrigger className="wwc:h-8 wwc:w-fit wwc:gap-1 wwc:border-none wwc:px-2 wwc:font-medium wwc:shadow-none wwc:focus:ring-0">
								<SelectValue>{selected?.label}</SelectValue>
							</SelectTrigger>
							<SelectContent>
								<ScrollArea className="wwc:h-60">
									{options?.map((option) => (
										<SelectItem key={option.value} value={option.value.toString()}>
											{option.label}
										</SelectItem>
									))}
								</ScrollArea>
							</SelectContent>
						</Select>
					);
				},
			}}
			{...props}
		/>
	);
}
Calendar.displayName = "Calendar";

export {Calendar};
