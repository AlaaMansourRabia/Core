import type {Meta, StoryObj} from "storybook/internal/types";

import {FileInput} from "@corensystem/coren-ui/file-input";
import {useState} from "react";

const meta = {
	title: "Components/Primitives/FileInput",
	component: FileInput,
	tags: ["autodocs"],
} satisfies Meta<typeof meta>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => {
		const [files, setFiles] = useState<File[]>([]);
		return <FileInput onChange={setFiles} />;
	},
};

export const Multiple: Story = {
	render: () => {
		const [files, setFiles] = useState<File[]>([]);
		return <FileInput onChange={setFiles} multiple />;
	},
};

export const WithMaxSize: Story = {
	render: () => {
		const [files, setFiles] = useState<File[]>([]);
		return <FileInput onChange={setFiles} maxSize={1024 * 1024 * 5} multiple />;
	},
};

export const ImageOnly: Story = {
	render: () => {
		const [files, setFiles] = useState<File[]>([]);
		return <FileInput onChange={setFiles} accept="image/*" multiple />;
	},
};

export const NoPreview: Story = {
	render: () => {
		const [files, setFiles] = useState<File[]>([]);
		return <FileInput onChange={setFiles} showPreview={false} />;
	},
};
