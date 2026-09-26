/**
 * Make resize handles clearly visible and accessible.
 */
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@corensystem/coren-ui/resizable";

export function HandleDo() {
	return (
		<ResizablePanelGroup
			direction="horizontal"
			className="wwc:min-h-48 wwc:max-w-md wwc:rounded-lg wwc:border"
		>
			<ResizablePanel defaultSize={50}>
				<div className="wwc:flex wwc:h-full wwc:items-center wwc:justify-center wwc:p-6">
					<span className="wwc:font-semibold">Panel A</span>
				</div>
			</ResizablePanel>
			<ResizableHandle withHandle />
			<ResizablePanel defaultSize={50}>
				<div className="wwc:flex wwc:h-full wwc:items-center wwc:justify-center wwc:p-6">
					<span className="wwc:font-semibold">Panel B</span>
				</div>
			</ResizablePanel>
		</ResizablePanelGroup>
	);
}
