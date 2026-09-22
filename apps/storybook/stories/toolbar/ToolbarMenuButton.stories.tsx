import type {Meta, StoryObj} from "storybook/internal/types";

import {Toolbar, ToolbarMenuButton, type ToolbarMenuOption, ToolbarSeparator} from "@corensystem/core-ui/toolbar";
import {Circle, Copy, Download, Hexagon, MoreHorizontal, Share2, Slash, Spline, Square, Trash2} from "lucide-react";
import {useState} from "react";

type ShapeId = "rectangle" | "ellipse" | "polygon";

const SHAPE_OPTIONS: ToolbarMenuOption<ShapeId>[] = [
	{id: "rectangle", label: "Rectangle", icon: <Square className="wwc:h-4 wwc:w-4" />, shortcut: "R"},
	{id: "ellipse", label: "Ellipse", icon: <Circle className="wwc:h-4 wwc:w-4" />, shortcut: "E"},
	{id: "polygon", label: "Polygon", icon: <Hexagon className="wwc:h-4 wwc:w-4" />, shortcut: "Y"},
];

const LINE_OPTIONS: ToolbarMenuOption[] = [
	{id: "line", label: "Line", icon: <Slash className="wwc:h-4 wwc:w-4" />, shortcut: "L"},
	{id: "polyline", label: "Polyline", icon: <Spline className="wwc:h-4 wwc:w-4" />, shortcut: "Shift+L"},
];

const ACTION_OPTIONS: ToolbarMenuOption[] = [
	{id: "duplicate", label: "Duplicate", icon: <Copy className="wwc:h-4 wwc:w-4" />, shortcut: "⌘D"},
	{id: "export", label: "Export", icon: <Download className="wwc:h-4 wwc:w-4" />},
	{id: "share", label: "Share", icon: <Share2 className="wwc:h-4 wwc:w-4" />},
	{id: "delete", label: "Delete", icon: <Trash2 className="wwc:h-4 wwc:w-4" />, disabled: true},
];

const meta = {
	title: "Components/Navigation/Toolbar Menu Button",
	component: ToolbarMenuButton,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"A toolbar button that opens a dropdown of options. Drive it with a `value` to use it as a single-select picker (the selected option's icon shows on the trigger), or omit `value` and pass a `triggerIcon` to use it as a plain action menu. Extracted from the shape / line / pin pickers in `DrawingActions`.",
			},
		},
	},
} satisfies Meta<typeof ToolbarMenuButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleSelect: Story = {
	render: () => {
		function Demo() {
			const [shape, setShape] = useState<ShapeId>("rectangle");
			const [line, setLine] = useState("line");
			return (
				<Toolbar>
					<ToolbarMenuButton options={SHAPE_OPTIONS} value={shape} onSelect={setShape} label="Shape tool" active />
					<ToolbarSeparator />
					<ToolbarMenuButton options={LINE_OPTIONS} value={line} onSelect={setLine} label="Line tool" />
				</Toolbar>
			);
		}
		return <Demo />;
	},
	parameters: {
		docs: {
			description: {
				story:
					"Pass `value` and `onSelect`. The trigger shows the selected option's icon; the active row is highlighted.",
			},
		},
	},
};

export const ActionMenu: Story = {
	render: () => {
		function Demo() {
			const [lastAction, setLastAction] = useState("—");
			return (
				<div className="wwc:space-y-2">
					<Toolbar>
						<ToolbarMenuButton
							options={ACTION_OPTIONS}
							onSelect={setLastAction}
							label="More actions"
							triggerIcon={<MoreHorizontal className="wwc:h-4 wwc:w-4" />}
							align="end"
						/>
					</Toolbar>
					<p className="wwc:font-mono wwc:text-xs wwc:text-muted-foreground">last action: {lastAction}</p>
				</div>
			);
		}
		return <Demo />;
	},
	parameters: {
		docs: {
			description: {
				story:
					'Omit `value` and pass a `triggerIcon` for an overflow / "more actions" menu. Options can be `disabled`.',
			},
		},
	},
};
