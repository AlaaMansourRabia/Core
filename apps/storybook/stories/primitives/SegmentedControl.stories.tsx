import type {Meta, StoryObj} from "storybook/internal/types";

import {SegmentedControl} from "@corensystem/coren-ui/segmented-control";
import {Grid, List, LayoutGrid} from "lucide-react";
import {useState} from "react";

const meta = {
	title: "Components/Primitives/SegmentedControl",
	component: SegmentedControl,
	tags: ["autodocs"],
} satisfies Meta<typeof meta>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => {
		const [value, setValue] = useState("option1");
		return (
			<SegmentedControl
				value={value}
				onChange={setValue}
				options={[
					{value: "option1", label: "Option 1"},
					{value: "option2", label: "Option 2"},
					{value: "option3", label: "Option 3"},
				]}
			/>
		);
	},
};

export const WithIcons: Story = {
	render: () => {
		const [value, setValue] = useState("grid");
		return (
			<SegmentedControl
				value={value}
				onChange={setValue}
				options={[
					{
						value: "grid",
						label: (
							<span className="wwc:flex wwc:items-center wwc:gap-1.5">
								<LayoutGrid className="wwc:h-4 wwc:w-4" />
								Grid
							</span>
						),
					},
					{
						value: "list",
						label: (
							<span className="wwc:flex wwc:items-center wwc:gap-1.5">
								<List className="wwc:h-4 wwc:w-4" />
								List
							</span>
						),
					},
				]}
			/>
		);
	},
};

export const IconsOnly: Story = {
	render: () => {
		const [value, setValue] = useState("grid");
		return (
			<SegmentedControl
				value={value}
				onChange={setValue}
				options={[
					{value: "grid", label: <LayoutGrid className="wwc:h-4 wwc:w-4" />},
					{value: "list", label: <List className="wwc:h-4 wwc:w-4" />},
					{value: "table", label: <Grid className="wwc:h-4 wwc:w-4" />},
				]}
			/>
		);
	},
};

export const Sizes: Story = {
	render: () => {
		const [value, setValue] = useState("option1");
		return (
			<div className="wwc:space-y-4">
				<SegmentedControl
					size="sm"
					value={value}
					onChange={setValue}
					options={[
						{value: "option1", label: "Small"},
						{value: "option2", label: "Size"},
					]}
				/>
				<SegmentedControl
					size="md"
					value={value}
					onChange={setValue}
					options={[
						{value: "option1", label: "Medium"},
						{value: "option2", label: "Size"},
					]}
				/>
				<SegmentedControl
					size="lg"
					value={value}
					onChange={setValue}
					options={[
						{value: "option1", label: "Large"},
						{value: "option2", label: "Size"},
					]}
				/>
			</div>
		);
	},
};

export const WithDisabled: Story = {
	render: () => {
		const [value, setValue] = useState("option1");
		return (
			<SegmentedControl
				value={value}
				onChange={setValue}
				options={[
					{value: "option1", label: "Enabled"},
					{value: "option2", label: "Disabled", disabled: true},
					{value: "option3", label: "Enabled"},
				]}
			/>
		);
	},
};
