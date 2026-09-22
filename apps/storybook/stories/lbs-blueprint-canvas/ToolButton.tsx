import type {ReactNode} from "react";

import {Tooltip, TooltipContent, TooltipTrigger} from "@core/core-ui/tooltip";
import {cn} from "@core/core-utils";

import {BLUEPRINT_TOOL_BUTTON_SIZE_CLASS} from "./constants";

type ToolButtonProps = {
	label: string;
	active: boolean;
	disabled?: boolean;
	icon: ReactNode;
	onClick: () => void;
};

export function ToolButton({label, active, disabled = false, icon, onClick}: ToolButtonProps) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<button
					type="button"
					aria-label={label}
					onClick={onClick}
					disabled={disabled}
					className={cn(
						"flex items-center justify-center rounded-md border border-border text-muted-foreground",
						BLUEPRINT_TOOL_BUTTON_SIZE_CLASS,
						disabled && "cursor-not-allowed opacity-50",
						active && "bg-primary text-primary-foreground",
					)}
				>
					{icon}
				</button>
			</TooltipTrigger>
			<TooltipContent>{label}</TooltipContent>
		</Tooltip>
	);
}
