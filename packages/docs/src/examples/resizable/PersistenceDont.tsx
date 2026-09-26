/**
 * Avoid resetting layout on every page load.
 */
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@corensystem/coren-ui/resizable";

export function PersistenceDont() {
	return (
		<ResizablePanelGroup
			direction="horizontal"
			className="wwc:min-h-48 wwc:max-w-md wwc:rounded-lg wwc:border"
			// No autoSaveId - layout resets each time
		>
			<ResizablePanel defaultSize={30}>
				<div className="wwc:flex wwc:h-full wwc:flex-col wwc:items-center wwc:justify-center wwc:p-4">
					<span className="wwc:font-semibold">Sidebar</span>
					<span className="wwc:text-xs wwc:text-muted-foreground">Resets on reload</span>
				</div>
			</ResizablePanel>
			<ResizableHandle />
			<ResizablePanel defaultSize={70}>
				<div className="wwc:flex wwc:h-full wwc:items-center wwc:justify-center wwc:p-4">
					<span className="wwc:font-semibold">Content</span>
				</div>
			</ResizablePanel>
		</ResizablePanelGroup>
	);
}
