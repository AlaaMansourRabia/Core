/**
 * Set minimum panel sizes to prevent content from being hidden.
 */
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@corensystem/coren-ui/resizable";

export function MinSizeDo() {
	return (
		<ResizablePanelGroup
			direction="horizontal"
			className="wwc:min-h-48 wwc:max-w-md wwc:rounded-lg wwc:border"
		>
			<ResizablePanel defaultSize={30} minSize={20}>
				<div className="wwc:flex wwc:h-full wwc:flex-col wwc:items-center wwc:justify-center wwc:p-4">
					<span className="wwc:font-semibold">Sidebar</span>
					<span className="wwc:text-xs wwc:text-muted-foreground">min 20%</span>
				</div>
			</ResizablePanel>
			<ResizableHandle withHandle />
			<ResizablePanel defaultSize={70} minSize={40}>
				<div className="wwc:flex wwc:h-full wwc:flex-col wwc:items-center wwc:justify-center wwc:p-4">
					<span className="wwc:font-semibold">Content</span>
					<span className="wwc:text-xs wwc:text-muted-foreground">min 40%</span>
				</div>
			</ResizablePanel>
		</ResizablePanelGroup>
	);
}
