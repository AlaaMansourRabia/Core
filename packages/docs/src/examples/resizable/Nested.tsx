/**
 * Nested resizable panel groups.
 */
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@corensystem/coren-ui/resizable";

export function Nested() {
	return (
		<ResizablePanelGroup
			direction="horizontal"
			className="wwc:min-h-64 wwc:max-w-lg wwc:rounded-lg wwc:border"
		>
			<ResizablePanel defaultSize={25}>
				<div className="wwc:flex wwc:h-full wwc:items-center wwc:justify-center wwc:p-4">
					<span className="wwc:font-semibold">Sidebar</span>
				</div>
			</ResizablePanel>
			<ResizableHandle />
			<ResizablePanel defaultSize={75}>
				<ResizablePanelGroup direction="vertical">
					<ResizablePanel defaultSize={60}>
						<div className="wwc:flex wwc:h-full wwc:items-center wwc:justify-center wwc:p-4">
							<span className="wwc:font-semibold">Main</span>
						</div>
					</ResizablePanel>
					<ResizableHandle />
					<ResizablePanel defaultSize={40}>
						<div className="wwc:flex wwc:h-full wwc:items-center wwc:justify-center wwc:p-4">
							<span className="wwc:font-semibold">Console</span>
						</div>
					</ResizablePanel>
				</ResizablePanelGroup>
			</ResizablePanel>
		</ResizablePanelGroup>
	);
}
