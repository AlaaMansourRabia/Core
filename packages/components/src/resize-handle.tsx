import {cn} from "@core/core-utils";
import {GripVertical, GripHorizontal} from "lucide-react";
import * as React from "react";

export interface ResizeHandleProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Orientation of the resize handle */
	orientation?: "horizontal" | "vertical";
	/** Show grip icon */
	showGrip?: boolean;
	/** Whether resizing is currently active */
	isResizing?: boolean;
	/** Callback when resize starts */
	onResizeStart?: (e: React.MouseEvent | React.TouchEvent) => void;
	/** Callback when resize ends */
	onResizeEnd?: () => void;
}

/** Draggable handle for resizing panels or containers. */
const ResizeHandle = React.forwardRef<HTMLDivElement, ResizeHandleProps>(
	(
		{className, orientation = "vertical", showGrip = true, isResizing = false, onResizeStart, onResizeEnd, ...props},
		ref,
	) => {
		const GripIcon = orientation === "vertical" ? GripVertical : GripHorizontal;

		const handleMouseDown = (e: React.MouseEvent) => {
			e.preventDefault();
			onResizeStart?.(e);

			const handleMouseUp = () => {
				onResizeEnd?.();
				document.removeEventListener("mouseup", handleMouseUp);
			};
			document.addEventListener("mouseup", handleMouseUp);
		};

		const handleTouchStart = (e: React.TouchEvent) => {
			onResizeStart?.(e);

			const handleTouchEnd = () => {
				onResizeEnd?.();
				document.removeEventListener("touchend", handleTouchEnd);
			};
			document.addEventListener("touchend", handleTouchEnd);
		};

		return (
			<div
				ref={ref}
				role="separator"
				aria-orientation={orientation}
				tabIndex={0}
				onMouseDown={handleMouseDown}
				onTouchStart={handleTouchStart}
				className={cn(
					"wwc:relative wwc:flex wwc:items-center wwc:justify-center wwc:transition-colors",
					"wwc:focus-visible:outline-none wwc:focus-visible:ring-1 wwc:focus-visible:ring-ring",
					orientation === "vertical"
						? "wwc:w-2 wwc:cursor-col-resize hover:wwc:bg-accent"
						: "wwc:h-2 wwc:cursor-row-resize hover:wwc:bg-accent",
					isResizing && "wwc:bg-accent",
					className,
				)}
				{...props}
			>
				{showGrip && (
					<div
						className={cn(
							"wwc:z-10 wwc:flex wwc:items-center wwc:justify-center wwc:rounded-sm wwc:border wwc:border-border wwc:bg-background",
							orientation === "vertical" ? "wwc:h-6 wwc:w-3" : "wwc:h-3 wwc:w-6",
						)}
					>
						<GripIcon className="wwc:h-3 wwc:w-3 wwc:text-muted-foreground" />
					</div>
				)}
				<div
					className={cn(
						"wwc:absolute wwc:bg-border",
						orientation === "vertical"
							? "wwc:h-full wwc:w-px wwc:left-1/2 wwc:-translate-x-1/2"
							: "wwc:w-full wwc:h-px wwc:top-1/2 wwc:-translate-y-1/2",
					)}
				/>
			</div>
		);
	},
);
ResizeHandle.displayName = "ResizeHandle";

export {ResizeHandle};
