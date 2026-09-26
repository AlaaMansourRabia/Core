/**
 * Avoid panels that can be resized to unusable sizes.
 */
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@corensystem/coren-ui/resizable";

export function MinSizeDont() {
	return (
		<ResizablePanelGroup
			direction="horizontal"
			className="wwc:min-h-48 wwc:max-w-md wwc:rounded-lg wwc:border"
		>
			<ResizablePanel defaultSize={30}>
				{/* No minSize - can be collapsed to nothing */}
				<div className="wwc:flex wwc:h-full wwc:flex-col wwc:items-center wwc:justify-center wwc:p-4 wwc:overflow-hidden">
					<span className="wwc:font-semibold">Sidebar</span>
					<span className="wwc:text-xs wwc:text-muted-foreground">no min</span>
				</div>
			</ResizablePanel>
			<ResizableHandle />
			<ResizablePanel defaultSize={70}>
				<div className="wwc:flex wwc:h-full wwc:flex-col wwc:items-center wwc:justify-center wwc:p-4">
					<span className="wwc:font-semibold">Content</span>
					<span className="wwc:text-xs wwc:text-muted-foreground">no min</span>
				</div>
			</ResizablePanel>
		</ResizablePanelGroup>
	);
}
