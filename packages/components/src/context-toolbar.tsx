import {cn} from "@corensystem/coren-utils";
import {MoreHorizontal} from "lucide-react";
import * as React from "react";

import {Button} from "./button";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "./dropdown-menu";

export interface ContextToolbarAction {
	id: string;
	label: string;
	icon?: React.ReactNode;
	onSelect: () => void;
	disabled?: boolean;
}

export interface ContextToolbarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
	leadingIcon?: React.ReactNode;
	title: React.ReactNode;
	status?: React.ReactNode;
	actions?: ContextToolbarAction[];
	maxVisibleActions?: number;
	density?: "compact" | "comfortable";
	menuLabel?: string;
}

/** Compact context bar that keeps icon/title and status/action groups vertically centered and atomic. */
export const ContextToolbar = React.forwardRef<HTMLDivElement, ContextToolbarProps>(
	(
		{
			leadingIcon,
			title,
			status,
			actions = [],
			maxVisibleActions = 2,
			density = "compact",
			menuLabel = "More actions",
			className,
			...props
		},
		ref,
	) => {
		const visibleActions = actions.slice(0, maxVisibleActions);
		const overflowActions = actions.slice(maxVisibleActions);
		return (
			<div
				ref={ref}
				data-core-artifact="context-toolbar"
				data-core-surface-owner="artifact"
				data-core-responsive-header
				className={cn(
					"wwc:flex wwc:w-full wwc:min-w-0 wwc:items-center wwc:justify-between wwc:overflow-hidden wwc:border-b wwc:bg-card",
					density === "compact"
						? "wwc:min-h-10 wwc:gap-2 wwc:px-3 wwc:py-1.5"
						: "wwc:min-h-12 wwc:gap-3 wwc:px-4 wwc:py-2",
					className,
				)}
				{...props}
			>
				<div
					data-core-responsive-group="context-title"
					data-core-responsive-priority="1"
					data-core-responsive-atomic
					className="wwc:flex wwc:min-w-0 wwc:flex-1 wwc:items-center wwc:gap-2"
				>
					{leadingIcon ? <span className="wwc:flex wwc:shrink-0 wwc:items-center">{leadingIcon}</span> : null}
					<span className="wwc:truncate wwc:text-sm wwc:font-medium">{title}</span>
				</div>
				<div
					data-core-responsive-group="context-actions"
					data-core-responsive-priority="2"
					data-core-responsive-atomic
					className="wwc:flex wwc:shrink-0 wwc:items-center wwc:gap-1.5"
				>
					{status ? <div className="wwc:flex wwc:items-center wwc:gap-1.5">{status}</div> : null}
					{visibleActions.map((action) => (
						<Button
							key={action.id}
							type="button"
							variant="ghost"
							size="sm"
							onClick={action.onSelect}
							disabled={action.disabled}
							aria-label={action.label}
							data-core-affordance-purpose={action.id}
							className="wwc:gap-1.5"
						>
							{action.icon}
							<span className={cn(action.icon && "wwc:hidden wwc:md:inline")}>{action.label}</span>
						</Button>
					))}
					{overflowActions.length ? (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button type="button" variant="ghost" icon aria-label={menuLabel}>
									<MoreHorizontal />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								{overflowActions.map((action) => (
									<DropdownMenuItem
										key={action.id}
										onSelect={action.onSelect}
										disabled={action.disabled}
										className="wwc:gap-2"
									>
										{action.icon}
										{action.label}
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>
					) : null}
				</div>
			</div>
		);
	},
);
ContextToolbar.displayName = "ContextToolbar";
