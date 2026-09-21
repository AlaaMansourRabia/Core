import {cn} from "@core/core-utils";
import {ChevronDown, MoreHorizontal} from "lucide-react";
import * as React from "react";

import {Button} from "./button";
import {ButtonGroup} from "./button-group";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "./dropdown-menu";
import {HoverTooltip, TooltipProvider} from "./tooltip";
import {ViewTabBar, type ViewTabItem} from "./view-tab-bar";

export type PageContentHeaderVariant = "navigation" | "entity-actions" | "title-actions";
export type PageContentHeaderActionPriority = "primary" | "secondary" | "overflow" | "persistent";
export type PageContentHeaderDensity = "compact" | "comfortable";

export interface PageContentHeaderAction {
	id: string;
	label: string;
	icon?: React.ReactNode;
	onSelect: () => void;
	priority?: PageContentHeaderActionPriority;
	presentation?: "label" | "icon";
	disabled?: boolean;
	tone?: "default" | "destructive";
}

export interface PageContentHeaderSplitAction extends Omit<PageContentHeaderAction, "priority" | "presentation"> {
	options: Array<Omit<PageContentHeaderAction, "priority" | "presentation">>;
}

export interface PageContentHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
	variant?: PageContentHeaderVariant;
	title: React.ReactNode;
	description?: React.ReactNode;
	meta?: React.ReactNode;
	status?: React.ReactNode;
	avatar?: React.ReactNode;
	tabs?: readonly ViewTabItem<string>[];
	activeTab?: string;
	onTabChange?: (tab: string) => void;
	actions?: PageContentHeaderAction[];
	splitAction?: PageContentHeaderSplitAction;
	density?: PageContentHeaderDensity;
	headingLevel?: 1 | 2 | 3;
	menuLabel?: string;
	instrumentationId?: string;
}

function HeaderActionButton({action, instrumentationId}: {action: PageContentHeaderAction; instrumentationId: string}) {
	const iconOnly = action.presentation === "icon";
	const button = (
		<Button
			type="button"
			variant={action.tone === "destructive" ? "destructive" : action.priority === "primary" ? "default" : "outline"}
			size="sm"
			icon={iconOnly}
			onClick={action.onSelect}
			disabled={action.disabled}
			aria-label={action.label}
			data-core-affordance-purpose={`${instrumentationId}-${action.id}`}
			data-core-interaction={`${instrumentationId}-${action.id}`}
			className={cn(!iconOnly && "wwc:gap-1.5")}
		>
			{action.icon}
			{iconOnly ? null : action.label}
		</Button>
	);

	if (!iconOnly) return button;
	return <HoverTooltip content={action.label}>{button}</HoverTooltip>;
}

function HeaderActions({
	actions,
	splitAction,
	menuLabel,
	instrumentationId,
}: {
	actions: PageContentHeaderAction[];
	splitAction?: PageContentHeaderSplitAction;
	menuLabel: string;
	instrumentationId: string;
}) {
	const primary = actions.filter((action) => action.priority === "primary");
	const persistent = actions.filter((action) => action.priority === "persistent");
	const secondary = actions.filter((action) => action.priority == null || action.priority === "secondary");
	const explicitOverflow = actions.filter((action) => action.priority === "overflow");
	const responsiveOverflow = [...secondary, ...explicitOverflow];

	return (
		<TooltipProvider delayDuration={200}>
			<div className="wwc:flex wwc:items-center wwc:gap-1.5">
				{secondary.map((action) => (
					<div key={action.id} className="wwc:hidden wwc:@3xl:block">
						<HeaderActionButton action={action} instrumentationId={instrumentationId} />
					</div>
				))}
				{/* Persistent actions never collapse into the overflow menu — they stay visible at every width. */}
				{persistent.map((action) => (
					<HeaderActionButton key={action.id} action={action} instrumentationId={instrumentationId} />
				))}
				{primary.map((action) => (
					<HeaderActionButton key={action.id} action={action} instrumentationId={instrumentationId} />
				))}
				{splitAction ? (
					<ButtonGroup role="group" aria-label={`${splitAction.label} actions`} className="wwc:gap-0">
						<Button
							type="button"
							size="sm"
							variant={splitAction.tone === "destructive" ? "destructive" : "default"}
							onClick={splitAction.onSelect}
							disabled={splitAction.disabled}
							data-core-affordance-purpose={`${instrumentationId}-${splitAction.id}`}
							data-core-interaction={`${instrumentationId}-${splitAction.id}`}
							className="wwc:gap-1.5 wwc:rounded-r-none"
						>
							{splitAction.icon}
							{splitAction.label}
						</Button>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									type="button"
									size="sm"
									icon
									variant={splitAction.tone === "destructive" ? "destructive" : "default"}
									aria-label={`${splitAction.label} options`}
									data-core-affordance-purpose={`${instrumentationId}-${splitAction.id}-options`}
									data-core-interaction={`${instrumentationId}-${splitAction.id}-options`}
									className="wwc:rounded-l-none wwc:border-l wwc:border-primary-foreground/20"
								>
									<ChevronDown />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								{splitAction.options.map((option) => (
									<DropdownMenuItem
										key={option.id}
										onSelect={option.onSelect}
										disabled={option.disabled}
										data-core-interaction={`${instrumentationId}-${option.id}`}
										className="wwc:gap-2"
									>
										{option.icon}
										{option.label}
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>
					</ButtonGroup>
				) : null}
				{responsiveOverflow.length ? (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								type="button"
								variant="outline"
								icon
								aria-label={menuLabel}
								data-core-affordance-purpose={`${instrumentationId}-overflow`}
								data-core-interaction={`${instrumentationId}-overflow`}
								className={cn(explicitOverflow.length === 0 && "wwc:@3xl:hidden")}
							>
								<MoreHorizontal />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							{responsiveOverflow.map((action) => (
								<DropdownMenuItem
									key={action.id}
									onSelect={action.onSelect}
									disabled={action.disabled}
									data-core-interaction={`${instrumentationId}-${action.id}-overflow`}
									className={cn("wwc:gap-2", action.tone === "destructive" && "wwc:text-destructive")}
								>
									{action.icon}
									{action.label}
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
				) : null}
			</div>
		</TooltipProvider>
	);
}

/**
 * Route-content header for entity identity, peer navigation, and workflow actions.
 * All controls and states are composed from Core artifacts.
 */
export const PageContentHeader = React.forwardRef<HTMLDivElement, PageContentHeaderProps>(
	(
		{
			variant = "title-actions",
			title,
			description,
			meta,
			status,
			avatar,
			tabs,
			activeTab,
			onTabChange,
			actions = [],
			splitAction,
			density = variant === "title-actions" ? "comfortable" : "compact",
			headingLevel = 1,
			menuLabel = "More actions",
			instrumentationId = "page-content-header",
			className,
			...props
		},
		ref,
	) => {
		const hasTabs = variant === "navigation" && tabs && activeTab && onTabChange;
		const compact = density === "compact";
		const Heading = headingLevel === 1 ? "h1" : headingLevel === 2 ? "h2" : "h3";
		const navigation = hasTabs ? (
			<div
				data-core-region="page-content-header-navigation"
				data-core-navigation-purpose="peer-section-navigation"
				data-core-navigation-relationship="peer"
				className="wwc:hidden wwc:min-w-0 wwc:@2xl:flex"
			>
				{/* Labels collapse to icon-only as the header narrows (below @5xl); the row itself drops to a
				    second row below @2xl. Tabs never scroll and never fold into an overflow menu. */}
				<ViewTabBar fill labels="responsive" tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />
			</div>
		) : null;

		return (
			<div
				ref={ref}
				data-core-artifact="page-content-header"
				data-core-density={density}
				data-core-instance={instrumentationId}
				data-core-surface-owner="artifact"
				data-core-region="page-content-header"
				className={cn("wwc:@container wwc:w-full wwc:min-w-0", className)}
				{...props}
			>
				<header
					data-core-responsive-header
					className={cn(
						"wwc:flex wwc:w-full wwc:min-w-0 wwc:justify-between wwc:overflow-hidden wwc:bg-card",
						hasTabs ? "wwc:items-stretch" : "wwc:items-center",
						compact ? "wwc:min-h-12 wwc:gap-2 wwc:px-3" : "wwc:min-h-16 wwc:gap-3 wwc:px-4",
						hasTabs ? "wwc:py-0" : compact ? "wwc:py-2" : "wwc:py-3",
						hasTabs ? "wwc:border-b-0 wwc:@2xl:border-b" : "wwc:border-b",
					)}
				>
					<div
						data-core-responsive-group="identity"
						data-core-responsive-priority="1"
						data-core-responsive-atomic
						className="wwc:flex wwc:min-w-0 wwc:flex-1 wwc:items-center wwc:gap-3"
					>
						{avatar ? <div className="wwc:shrink-0">{avatar}</div> : null}
						<div className={cn("wwc:min-w-0", !hasTabs && "wwc:flex-1")}>
							<div className="wwc:flex wwc:min-w-0 wwc:items-center wwc:gap-2">
								{/*
								 * The title's size is pinned and IMPORTANT, and both halves of that are deliberate.
								 *
								 * Pinned: it steps DOWN as the header narrows rather than holding a desktop size in a
								 * phone-width column. `title-actions` runs 24px only once the header has the width to
								 * carry it, 20px at @md and 18px below that; `comfortable` steps 16 → 14. Sizes read
								 * off the header's own @container, not the viewport, because a header inside a
								 * 380px panel on a 27" screen is narrow whatever the window says.
								 *
								 * Important: this is a semantic <h1>, and a heading is the one element consumer
								 * stylesheets reliably restyle. Our utilities live in `@layer utilities`, and ANY
								 * unlayered rule in a host app — `h1 { font-size: 2.5rem }` — beats a layered one no
								 * matter how specific it is. Without the `!` a host's own heading scale silently
								 * inflates this header, which is the bug that sent us here. `styles.tw4.css` ships no
								 * reset by design, so we cannot lean on preflight to have zeroed it either.
								 */}
								<Heading
									className={cn(
										"wwc:m-0! wwc:truncate wwc:font-semibold!",
										variant === "title-actions"
											? "wwc:text-lg! wwc:tracking-tight wwc:@md:text-xl! wwc:@2xl:text-2xl!"
											: compact
												? "wwc:text-sm!"
												: "wwc:text-sm! wwc:@md:text-base!",
									)}
								>
									{title}
								</Heading>
								{status ? <div className="wwc:flex wwc:shrink-0 wwc:items-center wwc:gap-1">{status}</div> : null}
							</div>
							{description ? (
								<div
									className={cn(
										"wwc:truncate wwc:text-muted-foreground",
										variant === "title-actions" ? "wwc:mt-1 wwc:text-sm" : "wwc:text-xs",
									)}
								>
									{description}
								</div>
							) : null}
							{meta ? <div className="wwc:truncate wwc:text-xs wwc:text-muted-foreground">{meta}</div> : null}
						</div>
						{navigation ? <div className="wwc:flex wwc:shrink-0 wwc:self-stretch">{navigation}</div> : null}
					</div>
					<div
						data-core-responsive-group="actions"
						data-core-responsive-priority="2"
						data-core-responsive-atomic
						className="wwc:flex wwc:shrink-0 wwc:items-center wwc:gap-1"
					>
						<HeaderActions
							actions={actions}
							splitAction={splitAction}
							menuLabel={menuLabel}
							instrumentationId={instrumentationId}
						/>
					</div>
				</header>
				{hasTabs ? (
					<div
						data-core-region="page-content-header-navigation-mobile"
						data-core-navigation-purpose="peer-section-navigation"
						data-core-navigation-relationship="peer"
						className="wwc:border-b wwc:bg-card wwc:px-3 wwc:@2xl:hidden"
					>
						{/* Second row (mobile): icon-only tabs that wrap instead of scrolling. */}
						<ViewTabBar wrap labels="hide" tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />
					</div>
				) : null}
			</div>
		);
	},
);
PageContentHeader.displayName = "PageContentHeader";
