import type {Meta, StoryObj} from "storybook/internal/types";

import {ResizeHandle} from "@corensystem/coren-ui/resize-handle";
import {useState} from "react";

const meta = {
	title: "Components/Primitives/ResizeHandle",
	component: ResizeHandle,
	tags: ["autodocs"],
} satisfies Meta<typeof ResizeHandle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Vertical: Story = {
	render: () => {
		const [width, setWidth] = useState(200);
		const [isResizing, setIsResizing] = useState(false);

		return (
			<div className="wwc:flex wwc:h-[300px] wwc:border wwc:rounded-lg wwc:overflow-hidden">
				<div className="wwc:bg-muted/50 wwc:p-4" style={{width}}>
					<p className="wwc:text-sm">Left panel ({width}px)</p>
				</div>
				<ResizeHandle
					orientation="vertical"
					isResizing={isResizing}
					onResizeStart={(e) => {
						setIsResizing(true);
						const startX = "clientX" in e ? e.clientX : e.touches[0].clientX;
						const startWidth = width;

						const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
							const currentX = "clientX" in moveEvent ? moveEvent.clientX : moveEvent.touches[0].clientX;
							const newWidth = Math.max(100, Math.min(400, startWidth + (currentX - startX)));
							setWidth(newWidth);
						};

						const handleUp = () => {
							setIsResizing(false);
							document.removeEventListener("mousemove", handleMove);
							document.removeEventListener("mouseup", handleUp);
							document.removeEventListener("touchmove", handleMove);
							document.removeEventListener("touchend", handleUp);
						};

						document.addEventListener("mousemove", handleMove);
						document.addEventListener("mouseup", handleUp);
						document.addEventListener("touchmove", handleMove);
						document.addEventListener("touchend", handleUp);
					}}
					onResizeEnd={() => setIsResizing(false)}
				/>
				<div className="wwc:flex-1 wwc:bg-background wwc:p-4">
					<p className="wwc:text-sm">Right panel (flexible)</p>
				</div>
			</div>
		);
	},
};

export const Horizontal: Story = {
	render: () => {
		const [height, setHeight] = useState(150);
		const [isResizing, setIsResizing] = useState(false);

		return (
			<div className="wwc:flex wwc:flex-col wwc:h-[400px] wwc:border wwc:rounded-lg wwc:overflow-hidden">
				<div className="wwc:bg-muted/50 wwc:p-4" style={{height}}>
					<p className="wwc:text-sm">Top panel ({height}px)</p>
				</div>
				<ResizeHandle
					orientation="horizontal"
					isResizing={isResizing}
					onResizeStart={(e) => {
						setIsResizing(true);
						const startY = "clientY" in e ? e.clientY : e.touches[0].clientY;
						const startHeight = height;

						const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
							const currentY = "clientY" in moveEvent ? moveEvent.clientY : moveEvent.touches[0].clientY;
							const newHeight = Math.max(50, Math.min(300, startHeight + (currentY - startY)));
							setHeight(newHeight);
						};

						const handleUp = () => {
							setIsResizing(false);
							document.removeEventListener("mousemove", handleMove);
							document.removeEventListener("mouseup", handleUp);
						};

						document.addEventListener("mousemove", handleMove);
						document.addEventListener("mouseup", handleUp);
					}}
					onResizeEnd={() => setIsResizing(false)}
				/>
				<div className="wwc:flex-1 wwc:bg-background wwc:p-4">
					<p className="wwc:text-sm">Bottom panel (flexible)</p>
				</div>
			</div>
		);
	},
};

export const WithoutGrip: Story = {
	render: () => (
		<div className="wwc:flex wwc:h-[200px] wwc:border wwc:rounded-lg wwc:overflow-hidden">
			<div className="wwc:w-1/2 wwc:bg-muted/50 wwc:p-4">
				<p className="wwc:text-sm">Left</p>
			</div>
			<ResizeHandle orientation="vertical" showGrip={false} />
			<div className="wwc:w-1/2 wwc:bg-background wwc:p-4">
				<p className="wwc:text-sm">Right</p>
			</div>
		</div>
	),
};
