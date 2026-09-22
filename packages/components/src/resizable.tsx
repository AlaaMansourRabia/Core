import {cn} from "@corensystem/core-utils";
import {GripVertical} from "lucide-react";
import {Group, Panel, Separator} from "react-resizable-panels";

/** Resizable panel groups for building split-pane layouts. */
const ResizablePanelGroup = ({className, ...props}: React.ComponentProps<typeof Group>) => (
	<Group
		className={cn("wwc:flex wwc:h-full wwc:w-full wwc:data-[panel-group-direction=vertical]:flex-col", className)}
		{...props}
	/>
);

const ResizablePanel = Panel;

const ResizableHandle = ({
	withHandle,
	className,
	...props
}: React.ComponentProps<typeof Separator> & {
	withHandle?: boolean;
}) => (
	<Separator
		className={cn(
			"wwc:relative wwc:flex wwc:w-px wwc:items-center wwc:justify-center wwc:bg-border wwc:after:absolute wwc:after:inset-y-0 wwc:after:left-1/2 wwc:after:w-1 wwc:after:-translate-x-1/2 wwc:focus-visible:outline-none wwc:focus-visible:ring-1 wwc:focus-visible:ring-ring wwc:focus-visible:ring-offset-1 wwc:data-[panel-group-direction=vertical]:h-px wwc:data-[panel-group-direction=vertical]:w-full wwc:data-[panel-group-direction=vertical]:after:left-0 wwc:data-[panel-group-direction=vertical]:after:h-1 wwc:data-[panel-group-direction=vertical]:after:w-full wwc:data-[panel-group-direction=vertical]:after:-translate-y-1/2 wwc:data-[panel-group-direction=vertical]:after:translate-x-0 wwc:[&[data-panel-group-direction=vertical]>div]:rotate-90",
			className,
		)}
		{...props}
	>
		{withHandle && (
			<div className="wwc:z-10 wwc:flex wwc:h-4 wwc:w-3 wwc:items-center wwc:justify-center wwc:rounded-sm wwc:border wwc:bg-border">
				<GripVertical className="wwc:h-2.5 wwc:w-2.5" />
			</div>
		)}
	</Separator>
);

export {ResizablePanelGroup, ResizablePanel, ResizableHandle};
