import {Maximize2, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen} from "lucide-react";
import {useState} from "react";

import {Button} from "@/components/ui/button";
import {FullscreenExitButton} from "@/components/ui/fullscreen-exit-button";

export function FixedContent2Page() {
	const [fullscreen, setFullscreen] = useState(false);
	const [leftOpen, setLeftOpen] = useState(true);
	const [rightOpen, setRightOpen] = useState(true);

	return (
		<div
			className={fullscreen ? "wwc:fixed wwc:inset-0 wwc:z-50 wwc:bg-background wwc:overflow-y-auto" : "wwc:space-y-8"}
		>
			{!fullscreen && (
				<div className="wwc:flex wwc:items-center wwc:justify-between">
					<div>
						<h1 className="wwc:text-3xl wwc:font-bold">Fixed Content #2</h1>
						<p className="wwc:text-muted-foreground wwc:mt-2">
							Three fixed panels with collapsible left and right push panels.
						</p>
					</div>
					<Button variant="outline" size="sm" onClick={() => setFullscreen(true)}>
						<Maximize2 /> Fullscreen
					</Button>
				</div>
			)}

			<div
				className={`wwc:overflow-hidden wwc:flex ${fullscreen ? "wwc:h-screen" : "wwc:border wwc:rounded-xl wwc:h-[600px]"}`}
			>
				{/* Left Panel */}
				<div
					className={`wwc:border-r wwc:bg-background wwc:flex-shrink-0 wwc:transition-[width] wwc:duration-200 wwc:ease-in-out wwc:overflow-hidden ${leftOpen ? "wwc:w-1/4" : "wwc:w-0 wwc:border-r-0"}`}
				>
					<div className="wwc:h-full wwc:p-4 wwc:min-w-[200px]">
						<div className="wwc:flex wwc:items-center wwc:justify-between wwc:mb-3">
							<h3 className="wwc:text-sm wwc:font-semibold">Panel A</h3>
							<Button variant="ghost" icon className="wwc:h-7 wwc:w-7" onClick={() => setLeftOpen(false)}>
								<PanelLeftClose className="wwc:h-4 wwc:w-4" />
							</Button>
						</div>
						<p className="wwc:text-sm wwc:text-muted-foreground">Left content area.</p>
					</div>
				</div>

				{/* Middle Panel */}
				<div className="wwc:flex-1 wwc:flex wwc:flex-col wwc:bg-background wwc:min-w-0">
					<div className="wwc:flex wwc:items-center wwc:gap-2 wwc:p-4 wwc:pb-0">
						{!leftOpen && (
							<Button
								variant="ghost"
								icon
								className="wwc:h-7 wwc:w-7 wwc:flex-shrink-0"
								onClick={() => setLeftOpen(true)}
							>
								<PanelLeftOpen className="wwc:h-4 wwc:w-4" />
							</Button>
						)}
						<h3 className="wwc:text-sm wwc:font-semibold">Panel B</h3>
						<div className="wwc:flex-1" />
						{!rightOpen && (
							<Button
								variant="ghost"
								icon
								className="wwc:h-7 wwc:w-7 wwc:flex-shrink-0"
								onClick={() => setRightOpen(true)}
							>
								<PanelRightOpen className="wwc:h-4 wwc:w-4" />
							</Button>
						)}
					</div>
					<div className="wwc:p-4 wwc:pt-3">
						<p className="wwc:text-sm wwc:text-muted-foreground">
							Main content area. Content pushes when side panels open or close.
						</p>
					</div>
				</div>

				{/* Right Panel */}
				<div
					className={`wwc:border-l wwc:bg-background wwc:flex-shrink-0 wwc:transition-[width] wwc:duration-200 wwc:ease-in-out wwc:overflow-hidden ${rightOpen ? "wwc:w-1/4" : "wwc:w-0 wwc:border-l-0"}`}
				>
					<div className="wwc:h-full wwc:p-4 wwc:min-w-[200px]">
						<div className="wwc:flex wwc:items-center wwc:justify-between wwc:mb-3">
							<h3 className="wwc:text-sm wwc:font-semibold">Panel C</h3>
							<Button variant="ghost" icon className="wwc:h-7 wwc:w-7" onClick={() => setRightOpen(false)}>
								<PanelRightClose className="wwc:h-4 wwc:w-4" />
							</Button>
						</div>
						<p className="wwc:text-sm wwc:text-muted-foreground">Right content area.</p>
					</div>
				</div>
			</div>
			{fullscreen && <FullscreenExitButton onExit={() => setFullscreen(false)} />}
		</div>
	);
}
