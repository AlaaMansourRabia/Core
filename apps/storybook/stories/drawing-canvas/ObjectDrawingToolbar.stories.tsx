import type {Meta, StoryObj} from "storybook/internal/types";

import {ObjectDrawingToolbar} from "@wakecap/core-ui/object-drawing-toolbar";

const meta = {
	title: "Widgets/Canvas/Object Drawing Toolbar",
	component: ObjectDrawingToolbar,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"A single-line horizontal toolbar for a 2D canvas drawing tool, composed entirely from WakeCore components: a mode pill and drawing-tool group (`ToolbarButton`), fill/stroke color pickers (`ToolbarColorPicker`), an opacity `Slider`, a 90°-snap toggle, and unlink / import actions — separated by `ToolbarSeparator`s.",
			},
		},
	},
} satisfies Meta<typeof ObjectDrawingToolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
