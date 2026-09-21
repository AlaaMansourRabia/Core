import {
	Bell,
	Check,
	ChevronRight,
	ChevronsUpDown,
	FileText,
	HelpCircle,
	LayoutGrid,
	LogOut,
	MessageSquare,
	Plus,
	Search,
	Settings,
	User,
} from "lucide-react";
import * as React from "react";

import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Input} from "@/components/ui/input";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Separator} from "@/components/ui/separator";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {cn} from "@/lib/utils";

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

// Sample data
interface Organization {
	id: string;
	name: string;
	plan: "free" | "pro" | "enterprise";
}

interface Project {
	id: string;
	orgId: string;
	name: string;
}

const organizations: Organization[] = [
	{id: "1", name: "Core Construction", plan: "enterprise"},
	{id: "2", name: "BuildRight Inc", plan: "pro"},
	{id: "3", name: "Metro Developers", plan: "free"},
];

const projects: Project[] = [
	{id: "1", orgId: "1", name: "Downtown Tower"},
	{id: "2", orgId: "1", name: "Harbor Bridge"},
	{id: "3", orgId: "1", name: "Tech Park Campus"},
	{id: "4", orgId: "2", name: "Riverside Mall"},
	{id: "5", orgId: "2", name: "Central Station"},
	{id: "6", orgId: "3", name: "Green Valley Homes"},
];

function getProjectsByOrg(orgId: string): Project[] {
	return projects.filter((p) => p.orgId === orgId);
}

export function TopNavigationDemo() {
	const [selectedOrg, setSelectedOrg] = React.useState<Organization>(organizations[0]);
	const [selectedProject, setSelectedProject] = React.useState<Project | null>(null);
	const [switcherOpen, setSwitcherOpen] = React.useState(false);
	const [orgSearch, setOrgSearch] = React.useState("");
	const [projectSearch, setProjectSearch] = React.useState("");

	const orgProjects = getProjectsByOrg(selectedOrg.id);

	const filteredOrgs = organizations.filter((org) => org.name.toLowerCase().includes(orgSearch.toLowerCase()));

	const filteredProjects = orgProjects.filter((project) =>
		project.name.toLowerCase().includes(projectSearch.toLowerCase()),
	);

	const handleOrgSelect = (org: Organization) => {
		setSelectedOrg(org);
		setSelectedProject(null); // Clear project when switching org
		setSwitcherOpen(false);
		setOrgSearch("");
		setProjectSearch("");
	};

	const handleProjectSelect = (project: Project) => {
		setSelectedProject(project);
		setSwitcherOpen(false);
		setOrgSearch("");
		setProjectSearch("");
	};

	return (
		<div className="wwc:space-y-8">
			<div>
				<h1 className="wwc:text-3xl wwc:font-bold">Top Navigation</h1>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					A top navigation bar with logo, org/project switcher, search, notifications, and user menu.
				</p>
			</div>

			{/* Full Top Navigation */}
			<div>
				<h2 className="wwc:text-xl wwc:font-semibold wwc:mb-4">Full Navigation Bar</h2>
				<p className="wwc:text-muted-foreground wwc:mb-4">
					Complete top navigation with two-column org/project switcher.
				</p>
				<div className="wwc:border wwc:rounded-lg wwc:overflow-hidden">
					<TooltipProvider>
						<header className="wwc:w-full wwc:border-b wwc:bg-background">
							<div className="wwc:flex wwc:h-12 wwc:items-center wwc:gap-2 wwc:px-4">
								{/* Logo */}
								<button className="wwc:flex wwc:h-8 wwc:w-8 wwc:items-center wwc:justify-center wwc:rounded-md wwc:hover:bg-accent">
									<LayoutGrid className="wwc:h-5 wwc:w-5" />
								</button>

								<Separator orientation="vertical" className="wwc:mx-1 wwc:h-6" />

								{/* Org/Project Switcher - Two Column Design */}
								<Popover open={switcherOpen} onOpenChange={setSwitcherOpen}>
									<PopoverTrigger asChild>
										<Button
											variant="ghost"
											role="combobox"
											aria-expanded={switcherOpen}
											aria-label="Select organization and project"
											className="wwc:h-8 wwc:gap-2 wwc:px-2 wwc:font-normal"
										>
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
											<span className="wwc:font-medium">{selectedOrg.name}</span>
											{selectedOrg.plan !== "free" && (
												<Badge variant="secondary" className="wwc:h-5 wwc:px-1.5 wwc:text-[10px]">
													{selectedOrg.plan === "pro" ? "Pro" : "Enterprise"}
												</Badge>
											)}
											{selectedProject && (
												<>
													<ChevronRight className="wwc:h-3.5 wwc:w-3.5 wwc:text-muted-foreground" />
													<span className="wwc:font-medium">{selectedProject.name}</span>
												</>
											)}
											<ChevronsUpDown className="wwc:ml-1 wwc:h-3.5 wwc:w-3.5 wwc:shrink-0 wwc:opacity-50" />
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
													<p className="wwc:px-2 wwc:py-1.5 wwc:text-xs wwc:font-medium wwc:text-muted-foreground">
														Organizations
													</p>
													<ScrollArea className="wwc:h-[200px]">
														{filteredOrgs.map((org) => (
															<button
																key={org.id}
																onClick={() => handleOrgSelect(org)}
																className={cn(
																	"wwc:flex wwc:w-full wwc:items-center wwc:gap-2 wwc:rounded-sm wwc:px-2 wwc:py-1.5 wwc:text-sm wwc:outline-none wwc:hover:bg-accent",
																	selectedOrg.id === org.id && "wwc:bg-accent",
																)}
															>
																<Avatar className="wwc:h-5 wwc:w-5">
																	<AvatarFallback
																		className={cn(
																			"wwc:text-[10px] wwc:font-medium wwc:text-foreground",
																			getAvatarColor(org.name),
																		)}
																	>
																		{getInitials(org.name)}
																	</AvatarFallback>
																</Avatar>
																<span className="wwc:flex-1 wwc:truncate wwc:text-left">{org.name}</span>
																{selectedOrg.id === org.id && <Check className="wwc:h-4 wwc:w-4 wwc:text-primary" />}
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
													<p className="wwc:px-2 wwc:py-1.5 wwc:text-xs wwc:font-medium wwc:text-muted-foreground">
														Projects
													</p>
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
																	<AvatarFallback
																		className={cn("wwc:text-[10px] wwc:font-medium", getAvatarColor(project.name))}
																	>
																		{getInitials(project.name)}
																	</AvatarFallback>
																</Avatar>
																<span className="wwc:flex-1 wwc:truncate wwc:text-left">{project.name}</span>
																{selectedProject?.id === project.id && (
																	<Check className="wwc:h-4 wwc:w-4 wwc:text-primary" />
																)}
															</button>
														))}
														{filteredProjects.length === 0 && (
															<p className="wwc:px-2 wwc:py-4 wwc:text-center wwc:text-sm wwc:text-muted-foreground">
																No projects found.
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

								{/* Spacer */}
								<div className="wwc:flex-1" />

								{/* Search */}
								<div className="wwc:relative wwc:w-64">
									<Search className="wwc:absolute wwc:left-2.5 wwc:top-1/2 wwc:h-4 wwc:w-4 wwc:-translate-y-1/2 wwc:text-muted-foreground" />
									<Input placeholder="Search..." className="wwc:h-8 wwc:pl-8 wwc:pr-12 wwc:text-sm" />
									<kbd className="wwc:pointer-events-none wwc:absolute wwc:right-2 wwc:top-1/2 wwc:-translate-y-1/2 wwc:rounded wwc:border wwc:bg-muted wwc:px-1.5 wwc:text-[10px] wwc:font-medium wwc:text-muted-foreground">
										⌘K
									</kbd>
								</div>

								<Separator orientation="vertical" className="wwc:mx-2 wwc:h-6" />

								{/* Actions */}
								<Tooltip>
									<TooltipTrigger asChild>
										<Button variant="ghost" size="sm" className="wwc:gap-1.5">
											<MessageSquare className="wwc:h-4 wwc:w-4" />
											<span className="wwc:text-sm">Feedback</span>
										</Button>
									</TooltipTrigger>
									<TooltipContent>Send feedback</TooltipContent>
								</Tooltip>

								<Tooltip>
									<TooltipTrigger asChild>
										<Button variant="ghost" icon className="wwc:h-8 wwc:w-8 wwc:relative">
											<Bell className="wwc:h-4 wwc:w-4" />
											<span className="wwc:absolute wwc:-top-0.5 wwc:-right-0.5 wwc:h-4 wwc:w-4 wwc:rounded-full wwc:bg-destructive wwc:text-[10px] wwc:font-medium wwc:text-destructive-foreground wwc:flex wwc:items-center wwc:justify-center">
												3
											</span>
										</Button>
									</TooltipTrigger>
									<TooltipContent>Notifications</TooltipContent>
								</Tooltip>

								{/* User Menu */}
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" className="wwc:h-8 wwc:w-8 wwc:rounded-full wwc:p-0">
											<Avatar className="wwc:h-7 wwc:w-7">
												<AvatarFallback className="wwc:bg-primary wwc:text-primary-foreground wwc:text-xs">
													AR
												</AvatarFallback>
											</Avatar>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end" className="wwc:w-56">
										<DropdownMenuLabel>
											<div className="wwc:flex wwc:flex-col wwc:space-y-1">
												<p className="wwc:text-sm wwc:font-medium">Alaa Rabia</p>
												<p className="wwc:text-xs wwc:text-muted-foreground">alaa@core.com</p>
											</div>
										</DropdownMenuLabel>
										<DropdownMenuSeparator />
										<DropdownMenuItem>
											<User className="wwc:mr-2 wwc:h-4 wwc:w-4" />
											Profile
										</DropdownMenuItem>
										<DropdownMenuItem>
											<Settings className="wwc:mr-2 wwc:h-4 wwc:w-4" />
											Settings
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem>
											<FileText className="wwc:mr-2 wwc:h-4 wwc:w-4" />
											Documentation
										</DropdownMenuItem>
										<DropdownMenuItem>
											<HelpCircle className="wwc:mr-2 wwc:h-4 wwc:w-4" />
											Support
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem className="wwc:text-destructive">
											<LogOut className="wwc:mr-2 wwc:h-4 wwc:w-4" />
											Log out
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</header>
					</TooltipProvider>
				</div>

				<div className="wwc:mt-4 wwc:flex wwc:gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => setSelectedProject(selectedProject ? null : orgProjects[0] || null)}
					>
						{selectedProject ? "Clear Project Selection" : "Select First Project"}
					</Button>
				</div>
			</div>
		</div>
	);
}
