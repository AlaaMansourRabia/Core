/**
 * Persist panel sizes across sessions.
 */
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@corensystem/coren-ui/resizable";

export function PersistenceDo() {
	return (
		<ResizablePanelGroup
			direction="horizontal"
			className="wwc:min-h-48 wwc:max-w-md wwc:rounded-lg wwc:border"
			autoSaveId="example-layout"
		>
			<ResizablePanel defaultSize={30} minSize={15}>
				<div className="wwc:flex wwc:h-full wwc:flex-col wwc:items-center wwc:justify-center wwc:p-4">
					<span className="wwc:font-semibold">Sidebar</span>
					<span className="wwc:text-xs wwc:text-muted-foreground">Sizes saved</span>
				</div>
			</ResizablePanel>
			<ResizableHandle withHandle />
			<ResizablePanel defaultSize={70} minSize={30}>
				<div className="wwc:flex wwc:h-full wwc:items-center wwc:justify-center wwc:p-4">
					<span className="wwc:font-semibold">Content</span>
				</div>
			</ResizablePanel>
		</ResizablePanelGroup>
	);
}
