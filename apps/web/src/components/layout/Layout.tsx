import {Github, History, Moon, PanelLeftClose, PanelLeftOpen, Sun} from "lucide-react";
import {useState} from "react";
import {Link, Outlet, useLocation} from "react-router-dom";

import {Button} from "@/components/ui/button";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";

import {PageNavigation} from "./PageNavigation";
import {CatalogSidebar} from "./Sidebar";

interface LayoutProps {
	darkMode: boolean;
	onToggleDarkMode: () => void;
	// When rendered inside the Core Hub shell (native mount, App.tsx), the hub's top bar already
	// carries the GitHub link + theme toggle — hide this app's own so they aren't duplicated. Also true
	// in a legacy iframe embed (window.self !== window.top).
	embedded?: boolean;
}

// True when running inside an iframe. The hub owns theming there, so hide this app's own chrome.
const IS_IFRAME = typeof window !== "undefined" && window.self !== window.top;

export function Layout({darkMode, onToggleDarkMode, embedded}: LayoutProps) {
	const isEmbedded = embedded || IS_IFRAME;
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	// Full app-shell templates (e.g. Admin Panel) own their own sidebar/top bar and manage their own
	// internal scrolling — render them full-bleed and height-constrained instead of inside the padded
	// docs container, so their `h-full` resolves and sticky/floating elements pin correctly.
	const isFullBleed = useLocation().pathname.startsWith("/templates/");

	return (
		<TooltipProvider>
			<div
				data-core-shell="designers-hub"
				data-core-density="comfortable"
				data-core-brand="core"
				data-core-provider-owner="designers-hub-root"
				className="wwc:flex wwc:h-dvh wwc:overflow-hidden"
			>
				<CatalogSidebar collapsed={sidebarCollapsed} />
				<div className="wwc:flex wwc:flex-1 wwc:flex-col wwc:overflow-hidden wwc:transition-all wwc:duration-300 wwc:ease-in-out">
					{/* Top Nav Bar */}
					<header
						data-core-top-bar="designers-hub-top-bar"
						data-core-artifact="designers-hub-top-bar"
						data-core-density="comfortable"
						className="wwc:flex wwc:h-14 wwc:items-center wwc:justify-between wwc:border-b wwc:bg-background wwc:px-4"
					>
						<div className="wwc:flex wwc:items-center wwc:gap-3">
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="ghost"
										icon
										onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
										aria-label={sidebarCollapsed ? "Expand catalog sidebar" : "Collapse catalog sidebar"}
										className="wwc:h-8 wwc:w-8"
									>
										{sidebarCollapsed ? (
											<PanelLeftOpen className="wwc:h-4 wwc:w-4" />
										) : (
											<PanelLeftClose className="wwc:h-4 wwc:w-4" />
										)}
									</Button>
								</TooltipTrigger>
								<TooltipContent>{sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}</TooltipContent>
							</Tooltip>
							{sidebarCollapsed && (
								<button
									type="button"
									onClick={() => setSidebarCollapsed(false)}
									className="wwc:text-sm wwc:font-medium wwc:text-muted-foreground wwc:hover:text-foreground"
								>
									Menu
								</button>
							)}
						</div>
						<div className="wwc:flex wwc:items-center wwc:gap-1">
							{/* When embedded in the Hub, this lives in the Hub's top nav instead (avoid duplication). */}
							{!isEmbedded && (
								<Button variant="outline" size="sm" asChild className="wwc:h-8 wwc:rounded-full">
									<a href="https://github.com/core/Core" target="_blank" rel="noopener noreferrer">
										<Github />
										Core
									</a>
								</Button>
							)}
							<Tooltip>
								<TooltipTrigger asChild>
									<Button variant="ghost" icon asChild className="wwc:h-8 wwc:w-8">
										<Link to="/changelog" aria-label="Open changelog">
											<History className="wwc:h-4 wwc:w-4" />
										</Link>
									</Button>
								</TooltipTrigger>
								<TooltipContent>Changelog</TooltipContent>
							</Tooltip>
							{!isEmbedded && (
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="ghost"
											icon
											onClick={onToggleDarkMode}
											aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
											className="wwc:h-8 wwc:w-8"
										>
											{darkMode ? <Sun className="wwc:h-4 wwc:w-4" /> : <Moon className="wwc:h-4 wwc:w-4" />}
										</Button>
									</TooltipTrigger>
									<TooltipContent>{darkMode ? "Light mode" : "Dark mode"}</TooltipContent>
								</Tooltip>
							)}
						</div>
					</header>
					{/* Main Content */}
					{isFullBleed ? (
						<main data-core-content-scroll className="wwc:min-h-0 wwc:flex-1 wwc:overflow-hidden">
							<Outlet />
						</main>
					) : (
						<main data-core-content-scroll className="wwc:min-h-0 wwc:flex-1 wwc:overflow-auto">
							<div className="wwc:container wwc:max-w-6xl wwc:py-8 wwc:px-8 wwc:mx-auto">
								<Outlet />
								<PageNavigation />
							</div>
						</main>
					)}
				</div>
			</div>
		</TooltipProvider>
	);
}
