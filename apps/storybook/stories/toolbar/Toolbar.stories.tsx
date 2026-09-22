import type {Meta, StoryObj} from "storybook/internal/types";

import {Toolbar, ToolbarButton, ToolbarGroup, ToolbarSeparator} from "@corensystem/core-ui/toolbar";
import {Hand, MousePointer2, Redo2, Square, Type, Undo2} from "lucide-react";
import {useState} from "react";

const meta = {
	title: "Components/Navigation/Toolbar",
	component: Toolbar,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					'The shared toolbar shell (`role="toolbar"`, h-12) behind ZoomTools, DrawingActions, and CanvasToolbar. Compose it from `ToolbarButton`, `ToolbarSeparator`, and `ToolbarGroup`. Use `variant="bare"` when nesting inside another toolbar and `fullWidth` to stretch and justify groups across the available width.',
			},
		},
	},
} satisfies Meta<typeof Toolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<Toolbar>
			<ToolbarButton icon label="Select">
				<MousePointer2 className="wwc:h-4 wwc:w-4" />
			</ToolbarButton>
			<ToolbarButton icon label="Pan">
				<Hand className="wwc:h-4 wwc:w-4" />
			</ToolbarButton>
			<ToolbarSeparator />
			<ToolbarButton icon label="Undo" shortcut="Cmd+Z">
				<Undo2 className="wwc:h-4 wwc:w-4" />
			</ToolbarButton>
			<ToolbarButton icon label="Redo" shortcut="Cmd+Shift+Z">
				<Redo2 className="wwc:h-4 wwc:w-4" />
			</ToolbarButton>
		</Toolbar>
	),
};

export const ActiveState: Story = {
	render: () => {
		function Demo() {
			const [tool, setTool] = useState<"select" | "rect" | "text">("select");

			return (
				<Toolbar>
					<ToolbarButton icon label="Select" active={tool === "select"} onClick={() => setTool("select")}>
						<MousePointer2 className="wwc:h-4 wwc:w-4" />
					</ToolbarButton>
					<ToolbarButton icon label="Rectangle" active={tool === "rect"} onClick={() => setTool("rect")}>
						<Square className="wwc:h-4 wwc:w-4" />
					</ToolbarButton>
					<ToolbarButton icon label="Text" active={tool === "text"} onClick={() => setTool("text")}>
						<Type className="wwc:h-4 wwc:w-4" />
					</ToolbarButton>
				</Toolbar>
			);
		}
		return <Demo />;
	},
	parameters: {
		docs: {
			description: {
				story:
					"The pressed tool is tracked in state and reflected via `active` (which sets `aria-pressed` and a muted background).",
			},
		},
	},
};

export const Groups: Story = {
	render: () => (
		<Toolbar fullWidth>
			<ToolbarGroup align="start" grow>
				<ToolbarButton icon label="Select">
					<MousePointer2 className="wwc:h-4 wwc:w-4" />
				</ToolbarButton>
				<ToolbarButton icon label="Pan">
					<Hand className="wwc:h-4 wwc:w-4" />
				</ToolbarButton>
			</ToolbarGroup>
			<ToolbarGroup align="center">
				<ToolbarButton>Untitled board</ToolbarButton>
			</ToolbarGroup>
			<ToolbarGroup align="end" grow>
				<ToolbarButton icon label="Undo">
					<Undo2 className="wwc:h-4 wwc:w-4" />
				</ToolbarButton>
				<ToolbarButton icon label="Redo">
					<Redo2 className="wwc:h-4 wwc:w-4" />
				</ToolbarButton>
			</ToolbarGroup>
		</Toolbar>
	),
	parameters: {
		docs: {
			description: {
				story:
					"A `fullWidth` toolbar with three `ToolbarGroup`s: a growing start group, a centered title, and a growing end group.",
			},
		},
	},
};

export const Bare: Story = {
	render: () => (
		<div className="wwc:inline-flex wwc:items-center wwc:rounded-lg wwc:border wwc:bg-background wwc:px-2">
			<span className="wwc:px-2 wwc:text-xs wwc:text-muted-foreground">Host toolbar</span>
			<Toolbar variant="bare">
				<ToolbarButton icon label="Select">
					<MousePointer2 className="wwc:h-4 wwc:w-4" />
				</ToolbarButton>
				<ToolbarButton icon label="Rectangle">
					<Square className="wwc:h-4 wwc:w-4" />
				</ToolbarButton>
			</Toolbar>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: '`variant="bare"` drops the border/background so a nested toolbar inherits the host toolbar\'s chrome.',
			},
		},
	},
};
