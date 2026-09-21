import type {Meta, StoryObj} from "storybook/internal/types";

import {Toolbar, ToolbarButton, ToolbarSeparator} from "@wakecap/core-ui/toolbar";
import {ToolbarColorPicker} from "@wakecap/core-ui/toolbar-color-picker";
import {Baseline, PaintBucket, PencilLine} from "lucide-react";
import {useState} from "react";

const meta = {
	title: "Components/Navigation/Toolbar Color Picker",
	component: ToolbarColorPicker,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					'A PowerPoint-style color control for a toolbar: a `ToolbarButton` trigger that previews the current color and opens a `Popover` of grouped swatches, a **No fill** option (value `""`), a Recent row that fills as custom colors are picked, an OS color picker via **More colors…**, and an eyedropper (native `EyeDropper` API, Chromium only). Controlled/uncontrolled `value`; `preview` (`"bar"` | `"swatch"`) and `compact` change the trigger and popover.',
			},
		},
	},
} satisfies Meta<typeof ToolbarColorPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OnAToolbar: Story = {
	render: () => {
		function Demo() {
			const [text, setText] = useState("#111827");
			const [fill, setFill] = useState("#2563EB");
			const [outline, setOutline] = useState("#7C3AED");
			return (
				<Toolbar>
					<ToolbarButton icon label="Bold" className="wwc:font-semibold">
						B
					</ToolbarButton>
					<ToolbarSeparator />
					<ToolbarColorPicker
						label="Text color"
						icon={<Baseline className="wwc:h-4 wwc:w-4" />}
						value={text}
						onValueChange={setText}
					/>
					<ToolbarColorPicker
						label="Fill color"
						icon={<PaintBucket className="wwc:h-4 wwc:w-4" />}
						value={fill}
						onValueChange={setFill}
					/>
					<ToolbarColorPicker
						label="Shape outline"
						icon={<PencilLine className="wwc:h-4 wwc:w-4" />}
						noColorLabel="No outline"
						value={outline}
						onValueChange={setOutline}
					/>
				</Toolbar>
			);
		}
		return <Demo />;
	},
	parameters: {
		docs: {
			description: {
				story:
					'Pass an `icon` to show the current color as a bar beneath it (default `preview="bar"`, PowerPoint style).',
			},
		},
	},
};

export const SwatchPreview: Story = {
	render: () => {
		function Demo() {
			const [color, setColor] = useState("#FFC000");
			return (
				<Toolbar>
					<ToolbarColorPicker
						label="Fill color"
						icon={<PaintBucket className="wwc:h-4 wwc:w-4" />}
						preview="swatch"
						value={color}
						onValueChange={setColor}
					/>
				</Toolbar>
			);
		}
		return <Demo />;
	},
	parameters: {
		docs: {
			description: {
				story: '`preview="swatch"` shows a square swatch to the right of the `icon` instead of a bar beneath it.',
			},
		},
	},
};

export const SwatchTrigger: Story = {
	render: () => {
		function Demo() {
			const [color, setColor] = useState("#00B050");
			return (
				<Toolbar>
					<ToolbarColorPicker label="Color" value={color} onValueChange={setColor} align="start" />
				</Toolbar>
			);
		}
		return <Demo />;
	},
	parameters: {
		docs: {
			description: {
				story: "Without an `icon`, the trigger is a plain swatch of the current color.",
			},
		},
	},
};

export const Compact: Story = {
	render: () => {
		function Demo() {
			const [color, setColor] = useState("#FF0000");
			return (
				<Toolbar>
					<ToolbarColorPicker label="Color" compact value={color} onValueChange={setColor} />
				</Toolbar>
			);
		}
		return <Demo />;
	},
	parameters: {
		docs: {
			description: {
				story:
					"`compact` drops all labels and text — the popover is just the swatch grid. No-fill is the first swatch and the OS picker / eyedropper are the trailing swatches.",
			},
		},
	},
};
