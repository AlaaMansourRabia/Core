import {cn} from "@core/core-utils";
import {Check, ChevronsUpDown, Plus, Search} from "lucide-react";
import * as React from "react";

import {Avatar, AvatarFallback} from "../avatar";
import {Badge} from "../badge";
import {Button} from "../button";
import {MOCK_ORGANIZATIONS, getProjectsByOrg} from "../data/mock-data";
import {Input} from "../input";
import {Popover, PopoverContent, PopoverTrigger} from "../popover";
import {ScrollArea} from "../scroll-area";
import {Separator} from "../separator";
import type {Organization, Project} from "../types";

interface OrgProjectSwitcherProps {
	selectedOrg: Organization | null;
	selectedProject: Project | null;
	onSelectOrg: (org: Organization) => void;
	onSelectProject: (project: Project | null) => void;
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

/** Organization and project switcher with a two-column popover layout. */
export function OrgProjectSwitcher({
	selectedOrg,
	selectedProject,
	onSelectOrg,
	onSelectProject,
}: OrgProjectSwitcherProps) {
	const [open, setOpen] = React.useState(false);
	const [orgSearch, setOrgSearch] = React.useState("");
	const [projectSearch, setProjectSearch] = React.useState("");

	const projects = selectedOrg ? getProjectsByOrg(selectedOrg.id) : [];

	const filteredOrgs = MOCK_ORGANIZATIONS.filter((org) => org.name.toLowerCase().includes(orgSearch.toLowerCase()));

	const filteredProjects = projects.filter((project) =>
		project.name.toLowerCase().includes(projectSearch.toLowerCase()),
	);

	const handleOrgSelect = (org: Organization) => {
		onSelectOrg(org);
		// Clear project selection to return to org-level view
		onSelectProject(null);
		setOpen(false);
		setOrgSearch("");
		setProjectSearch("");
	};

	const handleProjectSelect = (project: Project) => {
		onSelectProject(project);
		setOpen(false);
		setOrgSearch("");
		setProjectSearch("");
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					role="combobox"
					aria-expanded={open}
					aria-label="Select organization and project"
					className="wwc:h-8 wwc:gap-2 wwc:px-2 wwc:font-normal"
				>
					{selectedOrg && (
						<>
							<Avatar className="wwc:h-5 wwc:w-5">
								<AvatarFallback
									className={cn(
										"wwc:text-[10px] wwc:font-medium wwc:text-foreground",
										getAvatarColor(selectedOrg.name),
									)}
								>
									{getInitials(selectedOrg.name)}
								</AvatarFallback>
							</Avatar>
							<span className="wwc:hidden wwc:font-medium wwc:lg:inline">{selectedOrg.name}</span>
							{selectedOrg.plan !== "free" && (
								<Badge variant="secondary" className="wwc:hidden wwc:h-5 wwc:px-1.5 wwc:text-[10px] wwc:xl:inline-flex">
									{selectedOrg.plan === "pro" ? "Pro" : "Enterprise"}
								</Badge>
							)}
						</>
					)}
					<ChevronsUpDown className="wwc:h-3.5 wwc:w-3.5 wwc:shrink-0 wwc:opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="wwc:w-[500px] wwc:p-0" align="start">
				<div className="wwc:flex">
					{/* Organizations Column */}
					<div className="wwc:w-1/2 wwc:border-r">
						<div className="wwc:p-2">
							<div className="wwc:relative">
								<Search className="wwc:absolute wwc:left-2.5 wwc:top-1/2 wwc:h-3.5 wwc:w-3.5 wwc:-translate-y-1/2 wwc:text-muted-foreground" />
								<Input
									placeholder="Find Organization..."
									value={orgSearch}
									onChange={(e) => setOrgSearch(e.target.value)}
									className="wwc:h-8 wwc:pl-8 wwc:text-sm"
								/>
							</div>
						</div>
						<Separator />
						<div className="wwc:p-1">
							<p className="wwc:px-2 wwc:py-1.5 wwc:text-xs wwc:font-medium wwc:text-muted-foreground">Organizations</p>
							<ScrollArea className="wwc:h-[200px]">
								{filteredOrgs.map((org) => (
									<button
										key={org.id}
										onClick={() => handleOrgSelect(org)}
										className={cn(
											"wwc:flex wwc:w-full wwc:items-center wwc:gap-2 wwc:rounded-sm wwc:px-2 wwc:py-1.5 wwc:text-sm wwc:outline-none wwc:hover:bg-accent",
											selectedOrg?.id === org.id && "wwc:bg-accent",
										)}
									>
										<Avatar className="wwc:h-5 wwc:w-5">
											<AvatarFallback
												className={cn("wwc:text-[10px] wwc:font-medium wwc:text-foreground", getAvatarColor(org.name))}
											>
												{getInitials(org.name)}
											</AvatarFallback>
										</Avatar>
										<span className="wwc:flex-1 wwc:truncate wwc:text-left">{org.name}</span>
										{selectedOrg?.id === org.id && <Check className="wwc:h-4 wwc:w-4 wwc:text-primary" />}
									</button>
								))}
								{filteredOrgs.length === 0 && (
									<p className="wwc:px-2 wwc:py-4 wwc:text-center wwc:text-sm wwc:text-muted-foreground">
										No organizations found.
									</p>
								)}
							</ScrollArea>
						</div>
						<Separator />
						<div className="wwc:p-1">
							<button className="wwc:flex wwc:w-full wwc:items-center wwc:gap-2 wwc:rounded-sm wwc:px-2 wwc:py-1.5 wwc:text-sm wwc:text-muted-foreground wwc:outline-none wwc:hover:bg-accent wwc:hover:text-foreground">
								<Plus className="wwc:h-4 wwc:w-4" />
								Create Organization
							</button>
						</div>
					</div>

					{/* Projects Column */}
					<div className="wwc:w-1/2">
						<div className="wwc:p-2">
							<div className="wwc:relative">
								<Search className="wwc:absolute wwc:left-2.5 wwc:top-1/2 wwc:h-3.5 wwc:w-3.5 wwc:-translate-y-1/2 wwc:text-muted-foreground" />
								<Input
									placeholder="Find Project..."
									value={projectSearch}
									onChange={(e) => setProjectSearch(e.target.value)}
									className="wwc:h-8 wwc:pl-8 wwc:text-sm"
								/>
							</div>
						</div>
						<Separator />
						<div className="wwc:p-1">
							<p className="wwc:px-2 wwc:py-1.5 wwc:text-xs wwc:font-medium wwc:text-muted-foreground">Projects</p>
							<ScrollArea className="wwc:h-[200px]">
								{filteredProjects.map((project) => (
									<button
										key={project.id}
										onClick={() => handleProjectSelect(project)}
										className={cn(
											"wwc:flex wwc:w-full wwc:items-center wwc:gap-2 wwc:rounded-sm wwc:px-2 wwc:py-1.5 wwc:text-sm wwc:outline-none wwc:hover:bg-accent",
											selectedProject?.id === project.id && "wwc:bg-accent",
										)}
									>
										<Avatar className="wwc:h-5 wwc:w-5">
											<AvatarFallback className={cn("wwc:text-[10px] wwc:font-medium", getAvatarColor(project.name))}>
												{getInitials(project.name)}
											</AvatarFallback>
										</Avatar>
										<span className="wwc:flex-1 wwc:truncate wwc:text-left">{project.name}</span>
										{selectedProject?.id === project.id && <Check className="wwc:h-4 wwc:w-4 wwc:text-primary" />}
									</button>
								))}
								{filteredProjects.length === 0 && (
									<p className="wwc:px-2 wwc:py-4 wwc:text-center wwc:text-sm wwc:text-muted-foreground">
										{selectedOrg ? "No projects found." : "Select an organization first."}
									</p>
								)}
							</ScrollArea>
						</div>
						<Separator />
						<div className="wwc:p-1">
							<button className="wwc:flex wwc:w-full wwc:items-center wwc:gap-2 wwc:rounded-sm wwc:px-2 wwc:py-1.5 wwc:text-sm wwc:text-muted-foreground wwc:outline-none wwc:hover:bg-accent wwc:hover:text-foreground">
								<Plus className="wwc:h-4 wwc:w-4" />
								Create Project
							</button>
						</div>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
