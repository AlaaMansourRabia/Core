import type {OutlineItem} from "@corensystem/coren-ui/outline";
import type {Meta, StoryObj} from "storybook/internal/types";

import {Outline} from "@corensystem/coren-ui/outline";
import {useState} from "react";

const meta = {
	title: "Components/Primitives/Outline",
	component: Outline,
	tags: ["autodocs"],
} satisfies Meta<typeof Outline>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleItems: OutlineItem[] = [
	{id: "intro", label: "Introduction", level: 1},
	{id: "getting-started", label: "Getting Started", level: 1},
	{
		id: "installation",
		label: "Installation",
		level: 2,
		children: [
			{id: "npm", label: "Using npm", level: 3},
			{id: "yarn", label: "Using yarn", level: 3},
		],
	},
	{id: "configuration", label: "Configuration", level: 2},
	{id: "components", label: "Components", level: 1},
	{id: "button", label: "Button", level: 2},
	{id: "input", label: "Input", level: 2},
	{id: "api", label: "API Reference", level: 1},
];

export const Default: Story = {
	render: () => {
		const [activeId, setActiveId] = useState("intro");
		return (
			<div className="wwc:w-64 wwc:border wwc:rounded-lg wwc:p-2">
				<Outline items={sampleItems} activeId={activeId} onItemClick={setActiveId} />
			</div>
		);
	},
};

export const WithLines: Story = {
	render: () => {
		const [activeId, setActiveId] = useState("installation");
		return (
			<div className="wwc:w-64 wwc:border wwc:rounded-lg wwc:p-2">
				<Outline items={sampleItems} activeId={activeId} onItemClick={setActiveId} showLines />
			</div>
		);
	},
};

export const MaxLevel: Story = {
	render: () => {
		const [activeId, setActiveId] = useState("intro");
		return (
			<div className="wwc:w-64 wwc:border wwc:rounded-lg wwc:p-2">
				<Outline items={sampleItems} activeId={activeId} onItemClick={setActiveId} maxLevel={2} />
				<p className="wwc:text-xs wwc:text-muted-foreground wwc:mt-2 wwc:px-2">Max level: 2 (hides level 3)</p>
			</div>
		);
	},
};

export const CustomIndent: Story = {
	render: () => {
		const [activeId, setActiveId] = useState("intro");
		return (
			<div className="wwc:w-64 wwc:border wwc:rounded-lg wwc:p-2">
				<Outline items={sampleItems} activeId={activeId} onItemClick={setActiveId} indentSize={24} />
			</div>
		);
	},
};
