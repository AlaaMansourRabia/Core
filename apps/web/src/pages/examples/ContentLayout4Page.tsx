import {GripHorizontal, Maximize2} from "lucide-react";
import {useCallback, useRef, useState} from "react";

import {Button} from "@/components/ui/button";
import {FullscreenExitButton} from "@/components/ui/fullscreen-exit-button";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";

function VerticalTripleSplit({
	topContent,
	middleContent,
	bottomContent,
	defaultTopPercent = 40,
	defaultMiddlePercent = 30,
}: {
	topContent: React.ReactNode;
	middleContent: React.ReactNode;
	bottomContent: React.ReactNode;
	defaultTopPercent?: number;
	defaultMiddlePercent?: number;
}) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [topPercent, setTopPercent] = useState(defaultTopPercent);
	const [middlePercent, setMiddlePercent] = useState(defaultMiddlePercent);
	const draggingHandle = useRef<"top" | "bottom" | null>(null);

	const onMouseDown = useCallback(
		(handle: "top" | "bottom") => {
			draggingHandle.current = handle;
			document.body.style.cursor = "row-resize";
			document.body.style.userSelect = "none";

			const onMouseMove = (e: MouseEvent) => {
				if (!draggingHandle.current || !containerRef.current) return;
				const rect = containerRef.current.getBoundingClientRect();
				const y = ((e.clientY - rect.top) / rect.height) * 100;
				const minSection = 15;

				if (draggingHandle.current === "top") {
					// Top handle: moves boundary between top and middle
					// Bottom handle stays fixed, so middle shrinks/grows inversely
					const bottomHandlePos = topPercent + middlePercent;
					const newTop = Math.min(bottomHandlePos - minSection, Math.max(minSection, y));
					const newMiddle = bottomHandlePos - newTop;
					setTopPercent(newTop);
					setMiddlePercent(newMiddle);
				} else {
					// Bottom handle: moves boundary between middle and bottom
					// Top handle stays fixed, so only middle and bottom change
					const newBottomEdge = Math.min(100 - minSection, Math.max(topPercent + minSection, y));
					setMiddlePercent(newBottomEdge - topPercent);
				}
			};

			const onMouseUp = () => {
				draggingHandle.current = null;
				document.body.style.cursor = "";
				document.body.style.userSelect = "";
				document.removeEventListener("mousemove", onMouseMove);
				document.removeEventListener("mouseup", onMouseUp);
			};

			document.addEventListener("mousemove", onMouseMove);
			document.addEventListener("mouseup", onMouseUp);
		},
		[topPercent, middlePercent],
	);

	const bottomPercent = 100 - topPercent - middlePercent;

	return (
		<div ref={containerRef} className="wwc:h-full wwc:flex wwc:flex-col">
			<div style={{height: `${topPercent}%`}} className="wwc:overflow-auto">
				{topContent}
			</div>
			<div
				className="wwc:flex wwc:items-center wwc:justify-center wwc:bg-border wwc:cursor-row-resize wwc:hover:bg-muted-foreground/20 wwc:transition-colors wwc:flex-shrink-0"
				style={{height: "1px"}}
				onMouseDown={() => onMouseDown("top")}
			>
				<div className="wwc:absolute wwc:z-10 wwc:flex wwc:h-3 wwc:w-5 wwc:items-center wwc:justify-center wwc:rounded-sm wwc:border wwc:bg-border">
					<GripHorizontal className="wwc:h-2.5 wwc:w-2.5" />
				</div>
			</div>
			<div style={{height: `${middlePercent}%`}} className="wwc:overflow-auto">
				{middleContent}
			</div>
			<div
				className="wwc:flex wwc:items-center wwc:justify-center wwc:bg-border wwc:cursor-row-resize wwc:hover:bg-muted-foreground/20 wwc:transition-colors wwc:flex-shrink-0"
				style={{height: "1px"}}
				onMouseDown={() => onMouseDown("bottom")}
			>
				<div className="wwc:absolute wwc:z-10 wwc:flex wwc:h-3 wwc:w-5 wwc:items-center wwc:justify-center wwc:rounded-sm wwc:border wwc:bg-border">
					<GripHorizontal className="wwc:h-2.5 wwc:w-2.5" />
				</div>
			</div>
			<div style={{height: `${bottomPercent}%`}} className="wwc:overflow-auto">
				{bottomContent}
			</div>
		</div>
	);
}

export function ContentLayout4Page() {
	const [fullscreen, setFullscreen] = useState(false);

	return (
		<div
			className={fullscreen ? "wwc:fixed wwc:inset-0 wwc:z-50 wwc:bg-background wwc:overflow-y-auto" : "wwc:space-y-8"}
		>
			{!fullscreen && (
				<div className="wwc:flex wwc:items-center wwc:justify-between">
					<div>
						<h1 className="wwc:text-3xl wwc:font-bold">Flexible Content #4</h1>
						<p className="wwc:text-muted-foreground wwc:mt-2">
							Three vertical panels with the middle panel split into three horizontal sections.
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
							<p className="wwc:text-sm wwc:text-muted-foreground">Left content area.</p>
						</div>
					</ResizablePanel>

					<ResizableHandle withHandle />

					<ResizablePanel defaultSize={50} minSize={"30%"}>
						<VerticalTripleSplit
							defaultTopPercent={35}
							defaultMiddlePercent={35}
							topContent={
								<div className="wwc:h-full wwc:p-4 wwc:bg-background">
									<h3 className="wwc:text-sm wwc:font-semibold wwc:mb-3">Panel B — Top</h3>
									<p className="wwc:text-sm wwc:text-muted-foreground">Upper content area.</p>
								</div>
							}
							middleContent={
								<div className="wwc:h-full wwc:p-4 wwc:bg-background">
									<h3 className="wwc:text-sm wwc:font-semibold wwc:mb-3">Panel B — Middle</h3>
									<p className="wwc:text-sm wwc:text-muted-foreground">Middle content area.</p>
								</div>
							}
							bottomContent={
								<div className="wwc:h-full wwc:p-4 wwc:bg-background">
									<h3 className="wwc:text-sm wwc:font-semibold wwc:mb-3">Panel B — Bottom</h3>
									<p className="wwc:text-sm wwc:text-muted-foreground">Lower content area.</p>
								</div>
							}
						/>
					</ResizablePanel>

					<ResizableHandle withHandle />

					<ResizablePanel defaultSize={25} minSize={"15%"}>
						<div className="wwc:h-full wwc:p-4 wwc:bg-background">
							<h3 className="wwc:text-sm wwc:font-semibold wwc:mb-3">Panel C</h3>
							<p className="wwc:text-sm wwc:text-muted-foreground">Right content area.</p>
						</div>
					</ResizablePanel>
				</ResizablePanelGroup>
			</div>
			{fullscreen && <FullscreenExitButton onExit={() => setFullscreen(false)} />}
		</div>
	);
}
