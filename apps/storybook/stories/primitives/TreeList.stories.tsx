import type {Meta, StoryObj} from "storybook/internal/types";

import {TreeList, TreeListItem} from "@core/core-ui/tree-list";
import {Folder, File, FileText, Image} from "lucide-react";
import {useState} from "react";

const meta = {
	title: "Components/Primitives/TreeList",
	component: TreeList,
	tags: ["autodocs"],
} satisfies Meta<typeof TreeList>;

export default meta;
type Story = StoryObj<typeof meta>;

const fileTreeItems: TreeListItem[] = [
	{
		id: "src",
		label: "src",
		icon: <Folder className="wwc:h-4 wwc:w-4 wwc:text-blue-500" />,
		children: [
			{
				id: "components",
				label: "components",
				icon: <Folder className="wwc:h-4 wwc:w-4 wwc:text-blue-500" />,
				children: [
					{id: "button", label: "Button.tsx", icon: <FileText className="wwc:h-4 wwc:w-4 wwc:text-blue-400" />},
					{id: "input", label: "Input.tsx", icon: <FileText className="wwc:h-4 wwc:w-4 wwc:text-blue-400" />},
					{id: "card", label: "Card.tsx", icon: <FileText className="wwc:h-4 wwc:w-4 wwc:text-blue-400" />},
				],
			},
			{
				id: "utils",
				label: "utils",
				icon: <Folder className="wwc:h-4 wwc:w-4 wwc:text-blue-500" />,
				children: [
					{id: "helpers", label: "helpers.ts", icon: <FileText className="wwc:h-4 wwc:w-4 wwc:text-yellow-500" />},
					{id: "constants", label: "constants.ts", icon: <FileText className="wwc:h-4 wwc:w-4 wwc:text-yellow-500" />},
				],
			},
			{id: "index", label: "index.ts", icon: <FileText className="wwc:h-4 wwc:w-4 wwc:text-yellow-500" />},
		],
	},
	{
		id: "public",
		label: "public",
		icon: <Folder className="wwc:h-4 wwc:w-4 wwc:text-blue-500" />,
		children: [
			{id: "logo", label: "logo.svg", icon: <Image className="wwc:h-4 wwc:w-4 wwc:text-green-500" />},
			{id: "favicon", label: "favicon.ico", icon: <Image className="wwc:h-4 wwc:w-4 wwc:text-green-500" />},
		],
	},
	{id: "package", label: "package.json", icon: <File className="wwc:h-4 wwc:w-4 wwc:text-orange-500" />},
	{id: "readme", label: "README.md", icon: <FileText className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />},
];

export const Default: Story = {
	render: () => {
		const [selectedId, setSelectedId] = useState<string | undefined>();
		return (
			<div className="wwc:w-64 wwc:border wwc:rounded-lg wwc:p-2">
				<TreeList
					items={fileTreeItems}
					selectedId={selectedId}
					onSelect={(id) => setSelectedId(id)}
					defaultExpandedIds={["src"]}
				/>
			</div>
		);
	},
};

export const AllExpanded: Story = {
	render: () => {
		const [selectedId, setSelectedId] = useState<string | undefined>();
		return (
			<div className="wwc:w-64 wwc:border wwc:rounded-lg wwc:p-2">
				<TreeList
					items={fileTreeItems}
					selectedId={selectedId}
					onSelect={(id) => setSelectedId(id)}
					defaultExpandedIds={["src", "components", "utils", "public"]}
				/>
			</div>
		);
	},
};

export const WithLines: Story = {
	render: () => {
		const [selectedId, setSelectedId] = useState<string | undefined>();
		return (
			<div className="wwc:w-64 wwc:border wwc:rounded-lg wwc:p-2">
				<TreeList
					items={fileTreeItems}
					selectedId={selectedId}
					onSelect={(id) => setSelectedId(id)}
					defaultExpandedIds={["src", "components"]}
					showLines
				/>
			</div>
		);
	},
};

export const SimpleList: Story = {
	render: () => {
		const simpleItems: TreeListItem[] = [
			{
				id: "animals",
				label: "Animals",
				children: [
					{id: "dog", label: "Dog"},
					{id: "cat", label: "Cat"},
					{
						id: "bird",
						label: "Birds",
						children: [
							{id: "eagle", label: "Eagle"},
							{id: "sparrow", label: "Sparrow"},
						],
					},
				],
			},
			{
				id: "plants",
				label: "Plants",
				children: [
					{id: "tree", label: "Tree"},
					{id: "flower", label: "Flower"},
				],
			},
		];

		const [selectedId, setSelectedId] = useState<string | undefined>();
		return (
			<div className="wwc:w-48 wwc:border wwc:rounded-lg wwc:p-2">
				<TreeList items={simpleItems} selectedId={selectedId} onSelect={(id) => setSelectedId(id)} />
			</div>
		);
	},
};

export const WithDisabled: Story = {
	render: () => {
		const itemsWithDisabled: TreeListItem[] = [
			{id: "active1", label: "Active Item 1"},
			{id: "disabled1", label: "Disabled Item", disabled: true},
			{id: "active2", label: "Active Item 2"},
		];

		const [selectedId, setSelectedId] = useState<string | undefined>();
		return (
			<div className="wwc:w-48 wwc:border wwc:rounded-lg wwc:p-2">
				<TreeList items={itemsWithDisabled} selectedId={selectedId} onSelect={(id) => setSelectedId(id)} />
			</div>
		);
	},
};
