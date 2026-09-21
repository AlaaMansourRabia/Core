import {Maximize2} from "lucide-react";
import {useState, useRef} from "react";

import {Button} from "@/components/ui/button";
import {CopyButton} from "@/components/ui/copy-button";
import {FullscreenExitButton} from "@/components/ui/fullscreen-exit-button";
import {CoreAppSidebar} from "@/components/ui/navigation/core-app-sidebar";
import {CoreAppTopBar} from "@/components/ui/navigation/core-app-top-bar";

type SidebarMode = "collapsed" | "peek" | "pinned";

const PROJECTS = [
	"Fadhili GIP PKG 1",
	"ISSD_BI-10-13202",
	"Jafurah-JFGP-PKG-03",
	"Jafurah-Phase 2",
	"Jazan Refinery-Boiler Pkg.",
	"JC3C4",
	"Riyas",
	"Shaybah DPCU",
	"Sinopec",
	"SITP",
	"SRU_Yanbu_Refinery",
	"Turaif",
];

export function AppLayoutPage() {
	const [activeLabel, setActiveLabel] = useState("Overview");
	const [sidebarMode, setSidebarMode] = useState<SidebarMode>("pinned");
	const [selectedProject, setSelectedProject] = useState("All Projects");

	const viewLevel = selectedProject === "All Projects" ? "org" : "project";
	const [fullscreen, setFullscreen] = useState(false);
	const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	function startHide() {
		hideTimer.current = setTimeout(() => setSidebarMode("collapsed"), 300);
	}
	function cancelHide() {
		if (hideTimer.current) clearTimeout(hideTimer.current);
	}
	function showPeek() {
		cancelHide();
		setSidebarMode((m) => (m === "collapsed" ? "peek" : m));
	}

	function handleNavigate(label: string, keepOpen?: boolean, parentLabel?: string) {
		setActiveLabel(parentLabel ? `${parentLabel} / ${label}` : label);
		if (!keepOpen) setSidebarMode((m) => (m === "peek" ? "collapsed" : m));
	}

	const isPinned = sidebarMode === "pinned";

	return (
		<div
			className={fullscreen ? "wwc:fixed wwc:inset-0 wwc:z-50 wwc:bg-background wwc:overflow-y-auto" : "wwc:space-y-8"}
		>
			{!fullscreen && (
				<div className="wwc:flex wwc:items-center wwc:justify-between">
					<div>
						<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
							<h1 className="wwc:text-3xl wwc:font-bold">App Layout</h1>
							<CopyButton
								value="App Layout"
								className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
							/>
						</div>
						<p className="wwc:text-muted-foreground wwc:mt-2">
							A full-featured application layout with sidebar navigation, project switcher, and top bar.
						</p>
					</div>
					<Button variant="outline" size="sm" onClick={() => setFullscreen(true)}>
						<Maximize2 /> Fullscreen
					</Button>
				</div>
			)}

			{/* Layout example */}
			<div
				className={`wwc:overflow-hidden wwc:flex wwc:shadow-sm wwc:bg-background wwc:relative ${fullscreen ? "wwc:h-screen" : "wwc:border wwc:rounded-xl wwc:h-[700px]"}`}
			>
				{/* Spacer — pushes content when pinned */}
				<div
					className={`wwc:transition-[width] wwc:duration-200 wwc:ease-in-out wwc:flex-shrink-0 ${isPinned ? "wwc:w-[260px]" : "wwc:w-0"}`}
				/>

				{/* Single sidebar instance — absolute when peek/collapsed, in-flow spacer above handles push */}
				<div
					className={`wwc:absolute wwc:left-0 wwc:top-0 wwc:h-full wwc:w-[260px] wwc:z-20 wwc:transition-transform wwc:duration-200 wwc:ease-in-out ${
						sidebarMode === "collapsed" ? "wwc:-translate-x-full" : "wwc:translate-x-0"
					} ${sidebarMode === "peek" ? "wwc:shadow-[2px_0_12px_rgba(0,0,0,0.06)]" : ""}`}
					onMouseEnter={sidebarMode === "peek" ? cancelHide : undefined}
					onMouseLeave={sidebarMode === "peek" ? startHide : undefined}
				>
					<CoreAppSidebar
						onNavigate={handleNavigate}
						seamless
						viewLevel={viewLevel}
						onPin={!isPinned ? () => setSidebarMode("pinned") : undefined}
					/>
				</div>

				{/* Main area */}
				<div className={`wwc:flex-1 wwc:flex wwc:flex-col wwc:min-w-0 ${isPinned ? "wwc:border-l" : ""}`}>
					{/* Top bar */}
					<CoreAppTopBar
						activeLabel={activeLabel}
						selectedProject={selectedProject}
						projects={PROJECTS}
						isPinned={isPinned}
						onSelectProject={setSelectedProject}
						onToggleSidebar={() => setSidebarMode(isPinned ? "collapsed" : sidebarMode === "peek" ? "pinned" : "peek")}
						onHoverSidebar={() => {
							cancelHide();
							showPeek();
						}}
					/>

					{/* Content area */}
					<div className="wwc:flex-1 wwc:bg-muted/30 wwc:flex wwc:items-center wwc:justify-center">
						<p className="wwc:text-[13px] wwc:text-muted-foreground/70">Content for "{activeLabel}"</p>
					</div>
				</div>
			</div>
			{fullscreen && <FullscreenExitButton onExit={() => setFullscreen(false)} />}
		</div>
	);
}
