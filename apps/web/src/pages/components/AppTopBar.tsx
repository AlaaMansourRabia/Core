import {
	Check,
	ChevronRight,
	ChevronsUpDown,
	MoreHorizontal,
	PanelRightOpen,
	PanelLeftOpen,
	Search,
	Smile,
} from "lucide-react";
import {useState} from "react";

import {Button} from "@/components/ui/button";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {Input} from "@/components/ui/input";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {ScrollArea} from "@/components/ui/scroll-area";

interface AppTopBarProps {
	activeLabel: string;
	selectedProject: string;
	projects: string[];
	isPinned: boolean;
	onSelectProject: (project: string) => void;
	onToggleSidebar: () => void;
	onHoverSidebar?: () => void;
	rightContent?: React.ReactNode;
}

export function AppTopBar({
	activeLabel,
	selectedProject,
	projects,
	isPinned,
	onSelectProject,
	onToggleSidebar,
	onHoverSidebar,
	rightContent,
}: AppTopBarProps) {
	const [projectOpen, setProjectOpen] = useState(false);
	const [projectSearch, setProjectSearch] = useState("");

	const filteredProjects = projects.filter(
		(p) => projectSearch === "" || p.toLowerCase().includes(projectSearch.toLowerCase()),
	);

	return (
		<div className="wwc:h-11 wwc:border-b wwc:border-border wwc:flex wwc:items-center wwc:px-4 wwc:flex-shrink-0 wwc:relative">
			<div className="wwc:flex wwc:items-center wwc:gap-1">
				<Button
					variant="ghost"
					icon
					onClick={onToggleSidebar}
					onMouseEnter={onHoverSidebar}
					className="wwc:h-7 wwc:w-7 wwc:text-muted-foreground wwc:hover:text-foreground"
				>
					{isPinned ? <PanelRightOpen className="wwc:h-4 wwc:w-4" /> : <PanelLeftOpen className="wwc:h-4 wwc:w-4" />}
				</Button>

				<Popover
					open={projectOpen}
					onOpenChange={(open) => {
						setProjectOpen(open);
						if (!open) setProjectSearch("");
					}}
				>
					<PopoverTrigger asChild>
						<Button
							variant="ghost"
							className={`wwc:h-7 wwc:px-2 wwc:gap-1.5 wwc:text-[13px] wwc:font-medium ${projectOpen ? "wwc:bg-accent wwc:text-accent-foreground" : "wwc:text-foreground/70"}`}
						>
							{selectedProject}
							<ChevronsUpDown className="wwc:h-3.5 wwc:w-3.5 wwc:text-muted-foreground" />
						</Button>
					</PopoverTrigger>
					<PopoverContent align="start" className="wwc:w-[300px] wwc:p-0 wwc:rounded-xl">
						<div className="wwc:px-3 wwc:pt-3 wwc:pb-2 wwc:border-b wwc:border-border wwc:flex-shrink-0">
							<div className="wwc:flex wwc:items-center wwc:gap-2">
								<Search className="wwc:h-3.5 wwc:w-3.5 wwc:text-muted-foreground wwc:flex-shrink-0" />
								<Input
									autoFocus
									value={projectSearch}
									onChange={(e) => setProjectSearch(e.target.value)}
									placeholder="Find Project..."
									className="wwc:h-8 wwc:text-[13px] wwc:border-0 wwc:shadow-none wwc:focus-visible:ring-0 wwc:px-0"
								/>
								<Button
									variant="outline"
									size="sm"
									onClick={() => {
										setProjectOpen(false);
										setProjectSearch("");
									}}
									className="wwc:h-6 wwc:px-1.5 wwc:text-[11px] wwc:text-muted-foreground"
								>
									Esc
								</Button>
							</div>
						</div>
						<ScrollArea className="wwc:max-h-[280px]">
							<div className="wwc:px-3 wwc:py-2 wwc:space-y-0.5">
								{filteredProjects.length === 0 ? (
									<p className="wwc:text-[13px] wwc:text-muted-foreground wwc:text-center wwc:py-4">
										No projects found
									</p>
								) : (
									filteredProjects.map((p) => (
										<button
											key={p}
											type="button"
											onClick={() => {
												onSelectProject(p);
												setProjectOpen(false);
												setProjectSearch("");
											}}
											className={`wwc:w-full wwc:flex wwc:items-center wwc:gap-3 wwc:px-3 wwc:py-2.5 wwc:rounded-lg wwc:transition-colors ${selectedProject === p ? "wwc:bg-accent" : "wwc:hover:bg-accent"}`}
										>
											<span className="wwc:flex-1 wwc:text-left wwc:text-[13px] wwc:font-medium wwc:text-foreground wwc:truncate wwc:min-w-0">
												{p}
											</span>
											{selectedProject === p && (
												<Check className="wwc:h-4 wwc:w-4 wwc:text-foreground wwc:flex-shrink-0" />
											)}
										</button>
									))
								)}
							</div>
						</ScrollArea>
					</PopoverContent>
				</Popover>
			</div>

			<span className="wwc:absolute wwc:left-1/2 wwc:-translate-x-1/2 wwc:flex wwc:items-center wwc:gap-1 wwc:text-[13px] wwc:font-medium wwc:pointer-events-none">
				{activeLabel.includes(" / ") ? (
					activeLabel.split(" / ").map((part, i, arr) => (
						<span key={part} className="wwc:flex wwc:items-center wwc:gap-1">
							{i > 0 && <ChevronRight className="wwc:h-3 wwc:w-3 wwc:text-muted-foreground" />}
							<span className={i < arr.length - 1 ? "wwc:text-muted-foreground" : "wwc:text-foreground"}>{part}</span>
						</span>
					))
				) : (
					<span className="wwc:text-foreground">{activeLabel}</span>
				)}
			</span>

			{rightContent ?? (
				<div className="wwc:ml-auto">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" icon className="wwc:h-7 wwc:w-7 wwc:text-muted-foreground">
								<MoreHorizontal className="wwc:h-4 wwc:w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="wwc:w-[220px] wwc:rounded-xl">
							<DropdownMenuItem className="wwc:flex wwc:items-center wwc:justify-between wwc:py-3">
								<span className="wwc:text-[13px]">Give Feedback</span>
								<Smile className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			)}
		</div>
	);
}
