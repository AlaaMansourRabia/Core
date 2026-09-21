import {Maximize2} from "lucide-react";
import {useState} from "react";

import {Button} from "@/components/ui/button";
import {FullscreenExitButton} from "@/components/ui/fullscreen-exit-button";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";

export function ContentLayout2Page() {
	const [fullscreen, setFullscreen] = useState(false);

	return (
		<div
			className={fullscreen ? "wwc:fixed wwc:inset-0 wwc:z-50 wwc:bg-background wwc:overflow-y-auto" : "wwc:space-y-8"}
		>
			{!fullscreen && (
				<div className="wwc:flex wwc:items-center wwc:justify-between">
					<div>
						<h1 className="wwc:text-3xl wwc:font-bold">Flexible Content #2</h1>
						<p className="wwc:text-muted-foreground wwc:mt-2">
							Three content panels separated by resizable handles. Drag the handles to adjust panel widths.
						</p>
					</div>
					<Button variant="outline" size="sm" onClick={() => setFullscreen(true)}>
						<Maximize2 /> Fullscreen
					</Button>
				</div>
			)}

			<div className={`wwc:overflow-hidden ${fullscreen ? "wwc:h-screen" : "wwc:border wwc:rounded-xl wwc:h-[600px]"}`}>
				<ResizablePanelGroup orientation="horizontal" className="wwc:h-full">
					<ResizablePanel defaultSize={25} minSize={"15%"}>
						<div className="wwc:h-full wwc:p-4 wwc:bg-background">
							<h3 className="wwc:text-sm wwc:font-semibold wwc:mb-3">Panel A</h3>
							<p className="wwc:text-sm wwc:text-muted-foreground">
								Left content area. Resize by dragging the handle to the right.
							</p>
						</div>
					</ResizablePanel>

					<ResizableHandle withHandle />

					<ResizablePanel defaultSize={50} minSize={"30%"}>
						<div className="wwc:h-full wwc:p-4 wwc:bg-background">
							<h3 className="wwc:text-sm wwc:font-semibold wwc:mb-3">Panel B</h3>
							<p className="wwc:text-sm wwc:text-muted-foreground">
								Main content area. Drag the handles on either side to resize.
							</p>
						</div>
					</ResizablePanel>

					<ResizableHandle withHandle />

					<ResizablePanel defaultSize={25} minSize={"15%"}>
						<div className="wwc:h-full wwc:p-4 wwc:bg-background">
							<h3 className="wwc:text-sm wwc:font-semibold wwc:mb-3">Panel C</h3>
							<p className="wwc:text-sm wwc:text-muted-foreground">Right content area for additional information.</p>
						</div>
					</ResizablePanel>
				</ResizablePanelGroup>
			</div>
			{fullscreen && <FullscreenExitButton onExit={() => setFullscreen(false)} />}
		</div>
	);
}
