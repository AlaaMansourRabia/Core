import type {DrawingToolId, LineKind, PinKind, ShapeKind} from "@core/core-ui/drawing-actions";
import type {PanelImperativeHandle} from "react-resizable-panels";

import {Maximize2, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen} from "lucide-react";
import {useRef, useState} from "react";

import {Button} from "@/components/ui/button";
import {CanvasToolbar, type CanvasToolbarBlueprint} from "@/components/ui/canvas-toolbar";
import {CopyButton} from "@/components/ui/copy-button";
import {FullscreenExitButton} from "@/components/ui/fullscreen-exit-button";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";

const exampleBlueprints: CanvasToolbarBlueprint[] = [
	{id: "ground", name: "Retail_1__Ground_Floor.svg"},
	{id: "mezzanine", name: "Retail_1__Mezzanine.svg"},
	{id: "roof", name: "Retail_1__Roof.svg"},
];

export function DesignCanvasExamplePage() {
	const leftRef = useRef<PanelImperativeHandle>(null);
	const rightRef = useRef<PanelImperativeHandle>(null);
	const [leftCollapsed, setLeftCollapsed] = useState(false);
	const [rightCollapsed, setRightCollapsed] = useState(false);

	const toggleLeft = () => {
		if (leftCollapsed) leftRef.current?.expand();
		else leftRef.current?.collapse();
	};
	const toggleRight = () => {
		if (rightCollapsed) rightRef.current?.expand();
		else rightRef.current?.collapse();
	};

	// Independent state for the Example section
	const exLeftRef = useRef<PanelImperativeHandle>(null);
	const exRightRef = useRef<PanelImperativeHandle>(null);
	const [exLeftCollapsed, setExLeftCollapsed] = useState(false);
	const [exRightCollapsed, setExRightCollapsed] = useState(false);
	const [activeBlueprintId, setActiveBlueprintId] = useState(exampleBlueprints[0].id);
	const [exActiveTool, setExActiveTool] = useState<DrawingToolId>("select");
	const [exShapeKind, setExShapeKind] = useState<ShapeKind>("rectangle");
	const [exLineKind, setExLineKind] = useState<LineKind>("line");
	const [exPinKind, setExPinKind] = useState<PinKind>("pin");
	const [exZoomLevel, setExZoomLevel] = useState(1);

	const exToggleLeft = () => {
		if (exLeftCollapsed) exLeftRef.current?.expand();
		else exLeftRef.current?.collapse();
	};
	const exToggleRight = () => {
		if (exRightCollapsed) exRightRef.current?.expand();
		else exRightRef.current?.collapse();
	};

	const [genericFullscreen, setGenericFullscreen] = useState(false);
	const [exampleFullscreen, setExampleFullscreen] = useState(false);
	const fullscreen = genericFullscreen || exampleFullscreen;

	return (
		<div
			className={fullscreen ? "wwc:fixed wwc:inset-0 wwc:z-50 wwc:bg-background wwc:overflow-y-auto" : "wwc:space-y-12"}
		>
			{!fullscreen && (
				<div className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-4">
					<div>
						<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
							<h1 className="wwc:text-3xl wwc:font-bold">Design Canvas</h1>
							<CopyButton
								value="Design Canvas"
								className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
							/>
						</div>
						<p className="wwc:text-muted-foreground wwc:mt-2">
							Top toolbar over a Flexible Content #2 split (three resizable panels). Panels A and C can be collapsed
							from the toolbar or by dragging their handle past the minimum size. Panel B is a canvas surface with a
							floating toolbar pinned to the bottom-center.
						</p>
					</div>
					<Button variant="outline" size="sm" onClick={() => setGenericFullscreen(true)}>
						<Maximize2 /> Fullscreen
					</Button>
				</div>
			)}

			{!exampleFullscreen && (
				<div
					className={`wwc:flex wwc:flex-col wwc:overflow-hidden ${
						genericFullscreen ? "wwc:h-screen" : "wwc:h-[760px] wwc:rounded-xl wwc:border"
					}`}
				>
					{/* Top toolbar */}
					<header className="wwc:flex wwc:h-12 wwc:flex-shrink-0 wwc:items-center wwc:gap-3 wwc:border-b wwc:bg-background wwc:px-4">
						<Button
							variant="ghost"
							icon
							className="wwc:h-7 wwc:w-7"
							onClick={toggleLeft}
							aria-label={leftCollapsed ? "Expand left panel" : "Collapse left panel"}
						>
							{leftCollapsed ? (
								<PanelLeftOpen className="wwc:h-4 wwc:w-4" />
							) : (
								<PanelLeftClose className="wwc:h-4 wwc:w-4" />
							)}
						</Button>
						<h3 className="wwc:text-sm wwc:font-semibold">Top toolbar</h3>
						<p className="wwc:text-sm wwc:text-muted-foreground">Full-width row above the split.</p>
						<div className="wwc:ml-auto" />
						<Button
							variant="ghost"
							icon
							className="wwc:h-7 wwc:w-7"
							onClick={toggleRight}
							aria-label={rightCollapsed ? "Expand right panel" : "Collapse right panel"}
						>
							{rightCollapsed ? (
								<PanelRightOpen className="wwc:h-4 wwc:w-4" />
							) : (
								<PanelRightClose className="wwc:h-4 wwc:w-4" />
							)}
						</Button>
					</header>

					{/* Flexible Content #2 — 3-panel split */}
					<ResizablePanelGroup orientation="horizontal" className="wwc:flex-1">
						<ResizablePanel
							panelRef={leftRef}
							defaultSize={20}
							minSize={"15%"}
							collapsible
							collapsedSize={0}
							onResize={(size) => setLeftCollapsed(size.asPercentage === 0)}
						>
							<div className="wwc:h-full wwc:bg-background wwc:p-4">
								<h3 className="wwc:mb-3 wwc:text-sm wwc:font-semibold">Panel A</h3>
								<p className="wwc:text-sm wwc:text-muted-foreground">
									Left panel. Resize by dragging the handle, or collapse from the toolbar.
								</p>
							</div>
						</ResizablePanel>

						<ResizableHandle withHandle />

						{/* Panel B — Canvas */}
						<ResizablePanel defaultSize={60} minSize={"30%"}>
							<div
								className="wwc:relative wwc:h-full wwc:overflow-hidden wwc:bg-muted/40"
								style={{
									backgroundImage: "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.08) 1px, transparent 0)",
									backgroundSize: "16px 16px",
								}}
							>
								<div className="wwc:p-4">
									<h3 className="wwc:mb-3 wwc:text-sm wwc:font-semibold">Panel B — Canvas</h3>
									<p className="wwc:text-sm wwc:text-muted-foreground">
										Canvas surface. The floating toolbar below sits inside this panel.
									</p>
								</div>

								{/* Floating toolbar */}
								<div className="wwc:absolute wwc:bottom-5 wwc:left-1/2 wwc:flex wwc:-translate-x-1/2 wwc:items-center wwc:gap-3 wwc:rounded-xl wwc:border wwc:bg-background wwc:px-4 wwc:py-2 wwc:shadow-lg">
									<h3 className="wwc:text-sm wwc:font-semibold">Floating toolbar</h3>
									<p className="wwc:text-sm wwc:text-muted-foreground">Pinned to the bottom-center of Panel B.</p>
								</div>
							</div>
						</ResizablePanel>

						<ResizableHandle withHandle />

						<ResizablePanel
							panelRef={rightRef}
							defaultSize={20}
							minSize={"15%"}
							collapsible
							collapsedSize={0}
							onResize={(size) => setRightCollapsed(size.asPercentage === 0)}
						>
							<div className="wwc:h-full wwc:bg-background wwc:p-4">
								<h3 className="wwc:mb-3 wwc:text-sm wwc:font-semibold">Panel C</h3>
								<p className="wwc:text-sm wwc:text-muted-foreground">
									Right panel. Resize by dragging the handle, or collapse from the toolbar.
								</p>
							</div>
						</ResizablePanel>
					</ResizablePanelGroup>
				</div>
			)}

			{!genericFullscreen && !fullscreen && (
				<div className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-4">
					<div>
						<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
							<h2 className="wwc:text-2xl wwc:font-bold">Example</h2>
							<CopyButton
								value="Design Canvas - Example"
								className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
							/>
						</div>
						<p className="wwc:text-muted-foreground wwc:mt-2">
							Same Flexible Content #2 split, but the generic top toolbar is replaced with{" "}
							<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">CanvasToolbar</code> — Blueprint Selector
							· Drawing Actions · Zoom Tools.
						</p>
					</div>
					<Button variant="outline" size="sm" onClick={() => setExampleFullscreen(true)}>
						<Maximize2 /> Fullscreen
					</Button>
				</div>
			)}

			{!genericFullscreen && (
				<div
					className={`wwc:flex wwc:flex-col wwc:overflow-hidden ${exampleFullscreen ? "wwc:h-screen" : "wwc:h-[760px] wwc:rounded-xl wwc:border"}`}
				>
					<CanvasToolbar
						blueprints={exampleBlueprints}
						activeBlueprintId={activeBlueprintId}
						onBlueprintChange={setActiveBlueprintId}
						drawingActions={{
							activeTool: exActiveTool,
							onActiveToolChange: setExActiveTool,
							shapeKind: exShapeKind,
							onShapeKindChange: setExShapeKind,
							lineKind: exLineKind,
							onLineKindChange: setExLineKind,
							pinKind: exPinKind,
							onPinKindChange: setExPinKind,
						}}
						zoomTools={{
							zoomLevel: exZoomLevel,
							minZoom: 0.25,
							maxZoom: 4,
							onZoomIn: () => setExZoomLevel((z) => Math.min(4, z + 0.25)),
							onZoomOut: () => setExZoomLevel((z) => Math.max(0.25, z - 0.25)),
							onFit: () => setExZoomLevel(1),
						}}
						className="wwc:shrink-0 wwc:rounded-none wwc:border-0 wwc:border-b"
					/>

					{/* Flexible Content #2 — 3-panel split (panels A/B/C from base example, unchanged for now) */}
					<ResizablePanelGroup orientation="horizontal" className="wwc:flex-1">
						<ResizablePanel
							panelRef={exLeftRef}
							defaultSize={20}
							minSize={"15%"}
							collapsible
							collapsedSize={0}
							onResize={(size) => setExLeftCollapsed(size.asPercentage === 0)}
						>
							<div className="wwc:h-full wwc:bg-background wwc:p-4">
								<div className="wwc:mb-3 wwc:flex wwc:items-center wwc:justify-between">
									<h3 className="wwc:text-sm wwc:font-semibold">Panel A</h3>
									<Button
										variant="ghost"
										icon
										className="wwc:h-7 wwc:w-7"
										onClick={exToggleLeft}
										aria-label="Collapse left panel"
									>
										<PanelLeftClose className="wwc:h-4 wwc:w-4" />
									</Button>
								</div>
								<p className="wwc:text-sm wwc:text-muted-foreground">Left panel.</p>
							</div>
						</ResizablePanel>

						<ResizableHandle withHandle />

						<ResizablePanel defaultSize={60} minSize={"30%"}>
							<div
								className="wwc:relative wwc:h-full wwc:overflow-hidden wwc:bg-muted/40"
								style={{
									backgroundImage: "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.08) 1px, transparent 0)",
									backgroundSize: "16px 16px",
								}}
							>
								<div className="wwc:flex wwc:items-center wwc:justify-between wwc:p-4">
									{exLeftCollapsed ? (
										<Button
											variant="ghost"
											icon
											className="wwc:h-7 wwc:w-7"
											onClick={exToggleLeft}
											aria-label="Expand left panel"
										>
											<PanelLeftOpen className="wwc:h-4 wwc:w-4" />
										</Button>
									) : (
										<div className="wwc:h-7 wwc:w-7" />
									)}
									<h3 className="wwc:text-sm wwc:font-semibold">Panel B — Canvas</h3>
									{exRightCollapsed ? (
										<Button
											variant="ghost"
											icon
											className="wwc:h-7 wwc:w-7"
											onClick={exToggleRight}
											aria-label="Expand right panel"
										>
											<PanelRightOpen className="wwc:h-4 wwc:w-4" />
										</Button>
									) : (
										<div className="wwc:h-7 wwc:w-7" />
									)}
								</div>
							</div>
						</ResizablePanel>

						<ResizableHandle withHandle />

						<ResizablePanel
							panelRef={exRightRef}
							defaultSize={20}
							minSize={"15%"}
							collapsible
							collapsedSize={0}
							onResize={(size) => setExRightCollapsed(size.asPercentage === 0)}
						>
							<div className="wwc:h-full wwc:bg-background wwc:p-4">
								<div className="wwc:mb-3 wwc:flex wwc:items-center wwc:justify-between">
									<Button
										variant="ghost"
										icon
										className="wwc:h-7 wwc:w-7"
										onClick={exToggleRight}
										aria-label="Collapse right panel"
									>
										<PanelRightClose className="wwc:h-4 wwc:w-4" />
									</Button>
									<h3 className="wwc:text-sm wwc:font-semibold">Panel C</h3>
								</div>
								<p className="wwc:text-sm wwc:text-muted-foreground">Right panel.</p>
							</div>
						</ResizablePanel>
					</ResizablePanelGroup>
				</div>
			)}
			{fullscreen && (
				<FullscreenExitButton
					onExit={() => {
						setGenericFullscreen(false);
						setExampleFullscreen(false);
					}}
				/>
			)}
		</div>
	);
}
