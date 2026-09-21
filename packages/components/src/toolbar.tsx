import {cn} from "@wakecap/core-utils";
import {ChevronDown} from "lucide-react";
import * as React from "react";

import {Button, type ButtonProps} from "./button";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "./dropdown-menu";
import {Separator} from "./separator";

/**
 * Toolbar shell (`role="toolbar"`). The shared container behind ZoomTools, DrawingActions,
 * and CanvasToolbar. Use `variant="bare"` when nesting one toolbar's controls inside another
 * (drops the border/background so the host toolbar owns the chrome).
 */
export interface ToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
	/** `default` draws the bordered surface; `bare` is transparent for nesting inside another toolbar. */
	variant?: "default" | "bare";
	/** Lay the items out in a row (default) or a column — e.g. a vertical toolbar floating over a map. */
	orientation?: "horizontal" | "vertical";
	/** Stretch to fill the available length (width when horizontal, height when vertical). Defaults to content size. */
	fullWidth?: boolean;
}

const Toolbar = React.forwardRef<HTMLDivElement, ToolbarProps>(
	({className, variant = "default", orientation = "horizontal", fullWidth = false, ...rest}, ref) => {
		const vertical = orientation === "vertical";
		return (
			<div
				ref={ref}
				role="toolbar"
				aria-orientation={orientation}
				className={cn(
					"wwc:items-center wwc:gap-1",
					vertical ? "wwc:w-12 wwc:flex-col" : "wwc:h-12",
					fullWidth ? (vertical ? "wwc:flex wwc:h-full" : "wwc:flex wwc:w-full") : "wwc:inline-flex",
					variant === "default" &&
						(vertical
							? "wwc:rounded-lg wwc:border wwc:bg-card wwc:py-2"
							: "wwc:rounded-lg wwc:border wwc:bg-card wwc:px-2"),
					className,
				)}
				{...rest}
			/>
		);
	},
);
Toolbar.displayName = "Toolbar";

/**
 * Primitive action button for a toolbar. A ghost `Button` preset with built-in accessible
 * labelling (`label` + optional `shortcut`) and a pressed/active state. Pass an icon (and/or
 * text) as children. The single building block every toolbar control is made of.
 */
export interface ToolbarButtonProps extends Omit<ButtonProps, "aria-label"> {
	/** Accessible label. Required for icon-only buttons; folded into `aria-label`. */
	label?: string;
	/** Keyboard shortcut hint, appended to the accessible label (e.g. "V" -> "Select tool (V)"). */
	shortcut?: string;
	/** Toggled/selected state. Reflected as `aria-pressed` and a muted background. */
	active?: boolean;
}

const ToolbarButton = React.forwardRef<HTMLButtonElement, ToolbarButtonProps>(
	({className, label, shortcut, active, variant = "ghost", size = "sm", icon, type = "button", ...rest}, ref) => (
		<Button
			ref={ref}
			type={type}
			variant={variant}
			size={size}
			icon={icon}
			aria-label={label ? (shortcut ? `${label} (${shortcut})` : label) : undefined}
			aria-pressed={active === undefined ? undefined : active}
			className={cn(active && "wwc:bg-muted wwc:hover:bg-muted", className)}
			{...rest}
		/>
	),
);
ToolbarButton.displayName = "ToolbarButton";

/**
 * Divider between toolbar groups. Defaults to a vertical rule (for a horizontal toolbar); pass
 * `orientation="horizontal"` for a rule across a vertical toolbar.
 */
const ToolbarSeparator = React.forwardRef<
	React.ElementRef<typeof Separator>,
	Omit<React.ComponentPropsWithoutRef<typeof Separator>, "orientation"> & {
		orientation?: "horizontal" | "vertical";
	}
>(({className, orientation = "vertical", ...rest}, ref) => (
	<Separator
		ref={ref}
		orientation={orientation}
		className={cn(orientation === "vertical" ? "wwc:mx-1 wwc:h-6" : "wwc:my-1 wwc:w-6", className)}
		{...rest}
	/>
));
ToolbarSeparator.displayName = "ToolbarSeparator";

/**
 * A group of related toolbar items. Use `grow` for the flexible left/right sections of a
 * full-width toolbar and `align` to justify the group's contents.
 */
export interface ToolbarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Justify content within the group. */
	align?: "start" | "center" | "end";
	/** Take up the remaining space (and allow truncation of children). */
	grow?: boolean;
}

const ToolbarGroup = React.forwardRef<HTMLDivElement, ToolbarGroupProps>(
	({className, align, grow = false, ...rest}, ref) => (
		<div
			ref={ref}
			className={cn(
				"wwc:flex wwc:items-center wwc:gap-0.5",
				grow && "wwc:min-w-0 wwc:flex-1",
				align === "start" && "wwc:justify-start",
				align === "center" && "wwc:justify-center",
				align === "end" && "wwc:justify-end",
				className,
			)}
			{...rest}
		/>
	),
);
ToolbarGroup.displayName = "ToolbarGroup";

/** A single option in a ToolbarMenuButton dropdown. */
export interface ToolbarMenuOption<T extends string = string> {
	/** Stable id passed to `onSelect` and matched against `value`. */
	id: T;
	/** Visible label in the dropdown. */
	label: string;
	/** Leading icon node (e.g. `<Square className="h-4 w-4" />`). */
	icon?: React.ReactNode;
	/** Optional keyboard-shortcut hint shown on the right of the row. */
	shortcut?: string;
	/** Disable this option. */
	disabled?: boolean;
}

/**
 * A toolbar button that opens a dropdown menu of options. Generic and reusable:
 * - As a **single-select picker** (pass `value`): the selected option's icon shows on the
 *   trigger and that row is highlighted (e.g. the shape/line/pin pickers in DrawingActions).
 * - As a **plain action menu** (omit `value`, pass `triggerIcon`): every option just fires
 *   `onSelect` (e.g. an overflow / "more actions" menu).
 */
export interface ToolbarMenuButtonProps<T extends string = string> {
	/** Options shown in the dropdown. */
	options: ToolbarMenuOption<T>[];
	/** Currently selected option id. When set, its icon shows on the trigger and the row is highlighted. */
	value?: T;
	/** Called with the chosen option id. */
	onSelect?: (id: T) => void;
	/** Accessible label for the trigger button. */
	label?: string;
	/** Pressed/active state of the trigger. */
	active?: boolean;
	/** Override the trigger's leading icon (defaults to the selected option's icon). */
	triggerIcon?: React.ReactNode;
	/** Dropdown alignment relative to the trigger. */
	align?: "start" | "center" | "end";
	/** Disable the whole control. */
	disabled?: boolean;
	/** Class for the trigger button. */
	className?: string;
	/** Class for the dropdown content. */
	menuClassName?: string;
}

function ToolbarMenuButton<T extends string = string>({
	options,
	value,
	onSelect,
	label,
	active,
	triggerIcon,
	align = "start",
	disabled,
	className,
	menuClassName,
}: ToolbarMenuButtonProps<T>) {
	const selected = value !== undefined ? options.find((o) => o.id === value) : undefined;
	const leadingIcon = triggerIcon ?? selected?.icon ?? options[0]?.icon;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<ToolbarButton
					active={active}
					label={label}
					disabled={disabled}
					className={cn("wwc:gap-0.5 wwc:pl-2 wwc:pr-1", className)}
				>
					{leadingIcon}
					<ChevronDown className="wwc:!h-3 wwc:!w-3 wwc:text-muted-foreground" />
				</ToolbarButton>
			</DropdownMenuTrigger>
			<DropdownMenuContent align={align} className={cn("wwc:min-w-[180px]", menuClassName)}>
				{options.map((opt) => (
					<DropdownMenuItem
						key={opt.id}
						disabled={opt.disabled}
						onSelect={() => onSelect?.(opt.id)}
						className={cn(opt.id === value && "wwc:bg-accent wwc:text-accent-foreground")}
					>
						{opt.icon && <span className="wwc:mr-2 wwc:flex wwc:items-center">{opt.icon}</span>}
						<span>{opt.label}</span>
						{opt.shortcut && (
							<span className="wwc:ml-auto wwc:pl-4 wwc:text-xs wwc:text-muted-foreground">{opt.shortcut}</span>
						)}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
ToolbarMenuButton.displayName = "ToolbarMenuButton";

export {Toolbar, ToolbarButton, ToolbarSeparator, ToolbarGroup, ToolbarMenuButton};
