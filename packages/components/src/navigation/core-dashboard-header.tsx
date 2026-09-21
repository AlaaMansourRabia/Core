import {cn} from "@wakecap/core-utils";
import {Bell, Check, ChevronRight, ChevronsUpDown, LayoutGrid, MessageSquare, Search} from "lucide-react";
import * as React from "react";

import {Avatar, AvatarFallback} from "../avatar";
import {Button} from "../button";
import {getProjectsByOrg} from "../data/mock-data";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../dropdown-menu";
import {Input} from "../input";
import {Popover, PopoverContent, PopoverTrigger} from "../popover";
import {ScrollArea} from "../scroll-area";
import {Separator} from "../separator";
import {HoverTooltip, TooltipProvider} from "../tooltip";
import type {OrgTab, Organization, Project, ProjectTab} from "../types";
import {ContextTabs} from "./core-context-tabs";
import {OrgProjectSwitcher} from "./core-org-project-switcher";

export interface CoreDashboardHeaderProps {
	selectedOrg: Organization | null;
	selectedProject: Project | null;
	activeOrgTab: OrgTab;
	activeProjectTab: ProjectTab;
	isProjectLevel: boolean;
	onSelectOrg: (org: Organization) => void;
	onSelectProject: (project: Project | null) => void;
	onOrgTabChange: (tab: OrgTab) => void;
	onProjectTabChange: (tab: ProjectTab) => void;
	onLogout?: () => void;
}

function getInitials(name: string): string {
	return name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

function getAvatarColor(name: string): string {
	const colors = ["wwc:bg-chart-1", "wwc:bg-chart-2", "wwc:bg-chart-3", "wwc:bg-chart-4", "wwc:bg-chart-5"];
	const index = name.charCodeAt(0) % colors.length;
	return colors[index];
}

/** Full dashboard header with organization/project switcher, search, and notifications. */
export function DashboardHeader({
	selectedOrg,
	selectedProject,
	activeOrgTab,
	activeProjectTab,
	isProjectLevel,
	onSelectOrg,
	onSelectProject,
	onOrgTabChange,
	onProjectTabChange,
	onLogout,
}: CoreDashboardHeaderProps) {
	const [projectSwitcherOpen, setProjectSwitcherOpen] = React.useState(false);

	const projects = selectedOrg ? getProjectsByOrg(selectedOrg.id) : [];

	const handleProjectSelect = (project: Project) => {
		onSelectProject(project);
		setProjectSwitcherOpen(false);
	};

	return (
		<TooltipProvider>
			<header
				data-wakecore-artifact="core-dashboard-header"
				data-wakecore-surface-owner="artifact"
				data-wakecore-responsive-header
				className="wwc:sticky wwc:top-0 wwc:z-50 wwc:w-full wwc:border-b wwc:bg-card"
			>
				{/* Top bar */}
				<div className="wwc:flex wwc:h-12 wwc:min-w-0 wwc:items-center wwc:gap-2 wwc:overflow-hidden wwc:px-4">
					{/* Logo */}
					<button
						aria-label="Open application menu"
						className="wwc:flex wwc:h-8 wwc:w-8 wwc:items-center wwc:justify-center wwc:rounded-md wwc:hover:bg-accent"
					>
						<LayoutGrid className="wwc:h-5 wwc:w-5" />
					</button>

					<Separator orientation="vertical" className="wwc:mx-1 wwc:h-6" />

					{/* Org/Project Switcher */}
					<OrgProjectSwitcher
						selectedOrg={selectedOrg}
						selectedProject={selectedProject}
						onSelectOrg={onSelectOrg}
						onSelectProject={onSelectProject}
					/>

					{/* Project Switcher (when project selected) */}
					{selectedProject && (
						<>
							<ChevronRight className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
							<Popover open={projectSwitcherOpen} onOpenChange={setProjectSwitcherOpen}>
								<PopoverTrigger asChild>
									<Button
										variant="ghost"
										role="combobox"
										aria-expanded={projectSwitcherOpen}
										aria-label="Switch project"
										className="wwc:h-8 wwc:gap-2 wwc:px-2 wwc:font-normal"
									>
										<Avatar className="wwc:h-5 wwc:w-5">
											<AvatarFallback
												className={cn("wwc:text-xs wwc:font-medium", getAvatarColor(selectedProject.name))}
											>
												{getInitials(selectedProject.name)}
											</AvatarFallback>
										</Avatar>
										<span className="wwc:hidden wwc:font-medium wwc:xl:inline">{selectedProject.name}</span>
										<ChevronsUpDown className="wwc:h-3.5 wwc:w-3.5 wwc:shrink-0 wwc:opacity-50" />
									</Button>
								</PopoverTrigger>
								<PopoverContent className="wwc:w-[250px] wwc:p-0" align="start">
									<div className="wwc:p-1">
										<p className="wwc:px-2 wwc:py-1.5 wwc:text-xs wwc:font-medium wwc:text-muted-foreground">
											Switch Project
										</p>
										<ScrollArea className="wwc:h-[200px]">
											{projects.map((project) => (
												<button
													key={project.id}
													onClick={() => handleProjectSelect(project)}
													className={cn(
														"wwc:flex wwc:w-full wwc:items-center wwc:gap-2 wwc:rounded-sm wwc:px-2 wwc:py-1.5 wwc:text-sm wwc:outline-none wwc:hover:bg-accent",
														selectedProject?.id === project.id && "wwc:bg-accent",
													)}
												>
													<Avatar className="wwc:h-5 wwc:w-5">
														<AvatarFallback className={cn("wwc:text-xs wwc:font-medium", getAvatarColor(project.name))}>
															{getInitials(project.name)}
														</AvatarFallback>
													</Avatar>
													<span className="wwc:flex-1 wwc:truncate wwc:text-left">{project.name}</span>
													{selectedProject?.id === project.id && <Check className="wwc:h-4 wwc:w-4 wwc:text-primary" />}
												</button>
											))}
										</ScrollArea>
									</div>
								</PopoverContent>
							</Popover>
						</>
					)}

					{/* Spacer */}
					<div className="wwc:flex-1" />

					{/* Search */}
					<div className="wwc:relative wwc:hidden wwc:w-64 wwc:lg:block">
						<Search className="wwc:absolute wwc:left-2.5 wwc:top-1/2 wwc:h-4 wwc:w-4 wwc:-translate-y-1/2 wwc:text-muted-foreground" />
						<Input placeholder="Search..." className="wwc:h-8 wwc:pl-8 wwc:pr-12 wwc:text-sm" />
						<kbd className="wwc:pointer-events-none wwc:absolute wwc:right-2 wwc:top-1/2 wwc:-translate-y-1/2 wwc:rounded wwc:border wwc:bg-muted wwc:px-1.5 wwc:text-[10px] wwc:font-medium wwc:text-muted-foreground">
							⌘K
						</kbd>
					</div>
					<Button variant="ghost" icon aria-label="Search" className="wwc:lg:hidden">
						<Search className="wwc:h-4 wwc:w-4" />
					</Button>

					<Separator orientation="vertical" className="wwc:mx-2 wwc:hidden wwc:h-6 wwc:lg:block" />

					{/* Actions */}
					<HoverTooltip content="Send feedback">
						<Button variant="ghost" size="sm" className="wwc:gap-1.5">
							<MessageSquare className="wwc:h-4 wwc:w-4" />
							<span className="wwc:hidden wwc:text-sm wwc:xl:inline">Feedback</span>
						</Button>
					</HoverTooltip>

					<HoverTooltip content="Notifications">
						<Button variant="ghost" icon aria-label="Notifications">
							<Bell className="wwc:h-4 wwc:w-4" />
						</Button>
					</HoverTooltip>

					{/* User Menu */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" aria-label="Open user menu" className="wwc:h-8 wwc:w-8 wwc:rounded-full wwc:p-0">
								<Avatar className="wwc:h-7 wwc:w-7">
									<AvatarFallback className="wwc:bg-primary wwc:text-primary-foreground wwc:text-xs">AR</AvatarFallback>
								</Avatar>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="wwc:w-56">
							<DropdownMenuLabel>
								<div className="wwc:flex wwc:flex-col wwc:space-y-1">
									<p className="wwc:text-sm wwc:font-medium">Alaa Rabia</p>
									<p className="wwc:text-xs wwc:text-muted-foreground">alaa@wakecap.com</p>
								</div>
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem>Profile</DropdownMenuItem>
							<DropdownMenuItem>Account Settings</DropdownMenuItem>
							<DropdownMenuItem>Organization Settings</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem>Documentation</DropdownMenuItem>
							<DropdownMenuItem>Support</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem className="wwc:text-destructive" onClick={onLogout}>
								Log out
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				{/* Tabs bar */}
				<div className="wwc:overflow-x-auto wwc:px-4 wwc:py-2">
					<ContextTabs
						isProjectLevel={isProjectLevel}
						activeOrgTab={activeOrgTab}
						activeProjectTab={activeProjectTab}
						onOrgTabChange={onOrgTabChange}
						onProjectTabChange={onProjectTabChange}
					/>
				</div>
			</header>
		</TooltipProvider>
	);
}

/** Catalog-aligned export name; DashboardHeader remains available for backwards compatibility. */
export const CoreDashboardHeader = DashboardHeader;
