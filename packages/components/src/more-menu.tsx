import {MoreHorizontal, MoreVertical} from "lucide-react";
import * as React from "react";

import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "./dropdown-menu";
import {IconButton} from "./icon-button";

export interface MoreMenuOption {
	label: React.ReactNode;
	value: string;
	disabled?: boolean;
	onSelect?: () => void;
}

export interface MoreMenuProps {
	/** Menu options */
	options: MoreMenuOption[];
	/** Orientation of the more icon */
	orientation?: "horizontal" | "vertical";
	/** Callback when option is selected */
	onSelect?: (value: string) => void;
	/** Tooltip text */
	tooltip?: string;
	/** Side to open the menu */
	side?: "top" | "right" | "bottom" | "left";
	/** Alignment */
	align?: "start" | "center" | "end";
}

/** A three-dot menu button that opens a dropdown with options. */
const MoreMenu = React.forwardRef<HTMLButtonElement, MoreMenuProps>(
	({options, orientation = "horizontal", onSelect, tooltip = "More options", side = "bottom", align = "end"}, ref) => {
		const Icon = orientation === "horizontal" ? MoreHorizontal : MoreVertical;

		return (
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<IconButton ref={ref} variant="ghost" tooltip={tooltip}>
						<Icon />
					</IconButton>
				</DropdownMenuTrigger>
				<DropdownMenuContent side={side} align={align}>
					{options.map((option) => (
						<DropdownMenuItem
							key={option.value}
							disabled={option.disabled}
							onSelect={() => {
								option.onSelect?.();
								onSelect?.(option.value);
							}}
						>
							{option.label}
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
		);
	},
);
MoreMenu.displayName = "MoreMenu";

export {MoreMenu};
