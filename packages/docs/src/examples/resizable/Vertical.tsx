/**
 * Vertical resizable panels.
 */
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@corensystem/coren-ui/resizable";

export function Vertical() {
	return (
		<ResizablePanelGroup
			direction="vertical"
			className="wwc:min-h-64 wwc:max-w-md wwc:rounded-lg wwc:border"
		>
			<ResizablePanel defaultSize={25}>
				<div className="wwc:flex wwc:h-full wwc:items-center wwc:justify-center wwc:p-6">
					<span className="wwc:font-semibold">Header</span>
				</div>
			</ResizablePanel>
			<ResizableHandle />
			<ResizablePanel defaultSize={75}>
				<div className="wwc:flex wwc:h-full wwc:items-center wwc:justify-center wwc:p-6">
					<span className="wwc:font-semibold">Content</span>
				</div>
			</ResizablePanel>
		</ResizablePanelGroup>
	);
}
