import type {Meta, StoryObj} from "storybook/internal/types";

import {
	DrawingActions,
	type DrawingToolId,
	type LineKind,
	type PinKind,
	type ShapeKind,
} from "@wakecap/core-ui/drawing-actions";
import {useState} from "react";

const meta = {
	title: "Widgets/Canvas/Drawing Actions",
	component: DrawingActions,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Drawing toolbar for the canvas: Select / Shape / Line / Pin tool groups + Undo / Redo. Tools with sub-tools (Shape, Line, Pin) open a DropdownMenu showing the available kinds. Selecting a kind activates that tool group and remembers the choice.",
			},
		},
	},
} satisfies Meta<typeof DrawingActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ShapeActive: Story = {
	args: {activeTool: "shape", shapeKind: "ellipse"},
};

export const Controlled: Story = {
	render: () => {
		function Demo() {
			const [activeTool, setActiveTool] = useState<DrawingToolId>("select");
			const [shapeKind, setShapeKind] = useState<ShapeKind>("rectangle");
			const [lineKind, setLineKind] = useState<LineKind>("line");
			const [pinKind, setPinKind] = useState<PinKind>("pin");
			const [history, setHistory] = useState<string[]>([]);

			return (
				<div className="wwc:flex wwc:flex-col wwc:gap-4">
					<DrawingActions
						activeTool={activeTool}
						onActiveToolChange={setActiveTool}
						shapeKind={shapeKind}
						onShapeKindChange={setShapeKind}
						lineKind={lineKind}
						onLineKindChange={setLineKind}
						pinKind={pinKind}
						onPinKindChange={setPinKind}
						onUndo={() => setHistory((prev) => [...prev, "undo"])}
						onRedo={() => setHistory((prev) => [...prev, "redo"])}
					/>
					<div className="wwc:rounded-md wwc:border wwc:bg-muted/30 wwc:p-3 wwc:font-mono wwc:text-xs wwc:text-muted-foreground">
						<div>activeTool: {JSON.stringify(activeTool)}</div>
						<div>shapeKind: {JSON.stringify(shapeKind)}</div>
						<div>lineKind: {JSON.stringify(lineKind)}</div>
						<div>pinKind: {JSON.stringify(pinKind)}</div>
						<div>history: [{history.slice(-5).join(", ")}]</div>
					</div>
				</div>
			);
		}
		return <Demo />;
	},
};

export const DisabledHistory: Story = {
	args: {canUndo: false, canRedo: false},
	parameters: {
		docs: {
			description: {
				story: "When `canUndo` / `canRedo` are false, the history buttons render disabled.",
			},
		},
	},
};
