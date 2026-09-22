import type {CanvasFile} from "@corensystem/core-ui/canvas-file-picker";
import type {Meta, StoryObj} from "storybook/internal/types";

import {CanvasFilePicker} from "@corensystem/core-ui/canvas-file-picker";
import {useState} from "react";

const meta = {
	title: "Widgets/Canvas/Canvas File Picker",
	component: CanvasFilePicker,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"File / blueprint picker for a canvas toolbar. Renders as a Select by default, or a searchable Combobox when `searchable` is set. Long file names are middle-truncated so the trailing chars (e.g. the extension) stay visible.",
			},
		},
	},
} satisfies Meta<typeof CanvasFilePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

const files: CanvasFile[] = [
	{id: "ground", name: "Retail_1__Ground_Floor.svg"},
	{id: "mezzanine", name: "Retail_1__Mezzanine.svg"},
	{id: "roof", name: "Retail_1__Roof.svg"},
	{id: "tower-l1", name: "Office_Tower__Level_1.svg"},
	{id: "tower-l2", name: "Office_Tower__Level_2.svg"},
];

export const Default: Story = {
	render: () => {
		function Demo() {
			const [activeFileId, setActiveFileId] = useState(files[0].id);
			return <CanvasFilePicker files={files} activeFileId={activeFileId} onFileChange={setActiveFileId} />;
		}
		return <Demo />;
	},
	parameters: {
		docs: {
			description: {
				story: "Default Select mode. The active file id is controlled via state.",
			},
		},
	},
};

export const Searchable: Story = {
	render: () => {
		function Demo() {
			const [activeFileId, setActiveFileId] = useState(files[0].id);
			return (
				<CanvasFilePicker
					files={files}
					activeFileId={activeFileId}
					onFileChange={setActiveFileId}
					searchable
					searchPlaceholder="Search blueprints..."
				/>
			);
		}
		return <Demo />;
	},
	parameters: {
		docs: {
			description: {
				story: "Set `searchable` to render a Combobox with a search input — useful once the file count grows.",
			},
		},
	},
};
