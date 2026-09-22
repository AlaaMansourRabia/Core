import {cn} from "@corensystem/core-utils";
import * as React from "react";

export interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Header content (fixed at top) */
	header?: React.ReactNode;
	/** Sidebar content (fixed at side) */
	sidebar?: React.ReactNode;
	/** Footer content (fixed at bottom) */
	footer?: React.ReactNode;
	/** Sidebar position */
	sidebarPosition?: "left" | "right";
	/** Sidebar width */
	sidebarWidth?: string;
	/** Whether sidebar is collapsible */
	sidebarCollapsible?: boolean;
	/** Whether sidebar is currently collapsed */
	sidebarCollapsed?: boolean;
	/** Callback when sidebar collapse state changes */
	onSidebarCollapse?: (collapsed: boolean) => void;
	/** Collapsed sidebar width */
	sidebarCollapsedWidth?: string;
}

/** Application shell layout with header, sidebar, main content, and footer. */
const AppShell = React.forwardRef<HTMLDivElement, AppShellProps>(
	(
		{
			className,
			header,
			sidebar,
			footer,
			sidebarPosition = "left",
			sidebarWidth = "256px",
			sidebarCollapsible = false,
			sidebarCollapsed = false,
			onSidebarCollapse,
			sidebarCollapsedWidth = "64px",
			children,
			...props
		},
		ref,
	) => {
		const currentSidebarWidth = sidebarCollapsed ? sidebarCollapsedWidth : sidebarWidth;

		return (
			<div ref={ref} className={cn("wwc:flex wwc:min-h-screen wwc:flex-col wwc:bg-background", className)} {...props}>
				{header && (
					<header className="wwc:sticky wwc:top-0 wwc:z-50 wwc:w-full wwc:border-b wwc:border-border wwc:bg-background/95 wwc:backdrop-blur wwc:supports-[backdrop-filter]:bg-background/60">
						{header}
					</header>
				)}

				<div className="wwc:flex wwc:flex-1">
					{sidebar && sidebarPosition === "left" && (
						<aside
							className="wwc:sticky wwc:top-14 wwc:z-30 wwc:h-[calc(100vh-3.5rem)] wwc:shrink-0 wwc:border-r wwc:border-border wwc:bg-background wwc:transition-[width] wwc:duration-200"
							style={{width: currentSidebarWidth}}
						>
							{sidebar}
						</aside>
					)}

					<main className="wwc:flex-1 wwc:overflow-auto">{children}</main>

					{sidebar && sidebarPosition === "right" && (
						<aside
							className="wwc:sticky wwc:top-14 wwc:z-30 wwc:h-[calc(100vh-3.5rem)] wwc:shrink-0 wwc:border-l wwc:border-border wwc:bg-background wwc:transition-[width] wwc:duration-200"
							style={{width: currentSidebarWidth}}
						>
							{sidebar}
						</aside>
					)}
				</div>

				{footer && <footer className="wwc:border-t wwc:border-border wwc:bg-background">{footer}</footer>}
			</div>
		);
	},
);
AppShell.displayName = "AppShell";

export interface AppShellHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

/** Header component for AppShell. */
const AppShellHeader = React.forwardRef<HTMLDivElement, AppShellHeaderProps>(({className, children, ...props}, ref) => (
	<div ref={ref} className={cn("wwc:flex wwc:h-14 wwc:items-center wwc:px-4 wwc:gap-4", className)} {...props}>
		{children}
	</div>
));
AppShellHeader.displayName = "AppShellHeader";

export interface AppShellSidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

/** Sidebar component for AppShell. */
const AppShellSidebar = React.forwardRef<HTMLDivElement, AppShellSidebarProps>(
	({className, children, ...props}, ref) => (
		<div ref={ref} className={cn("wwc:flex wwc:h-full wwc:flex-col wwc:overflow-y-auto wwc:p-4", className)} {...props}>
			{children}
		</div>
	),
);
AppShellSidebar.displayName = "AppShellSidebar";

export interface AppShellMainProps extends React.HTMLAttributes<HTMLDivElement> {}

/** Main content area for AppShell. */
const AppShellMain = React.forwardRef<HTMLDivElement, AppShellMainProps>(({className, children, ...props}, ref) => (
	<div ref={ref} className={cn("wwc:flex-1 wwc:p-6", className)} {...props}>
		{children}
	</div>
));
AppShellMain.displayName = "AppShellMain";

export interface AppShellFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

/** Footer component for AppShell. */
const AppShellFooter = React.forwardRef<HTMLDivElement, AppShellFooterProps>(({className, children, ...props}, ref) => (
	<div ref={ref} className={cn("wwc:flex wwc:h-14 wwc:items-center wwc:px-4", className)} {...props}>
		{children}
	</div>
));
AppShellFooter.displayName = "AppShellFooter";

export {AppShell, AppShellHeader, AppShellSidebar, AppShellMain, AppShellFooter};
