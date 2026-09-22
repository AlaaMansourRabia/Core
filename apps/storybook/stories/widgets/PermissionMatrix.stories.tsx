import type {Meta, StoryObj} from "storybook/internal/types";

import {PermissionMatrix, type PermissionMatrixCategory} from "@corensystem/core-ui/permission-matrix";
import {useState} from "react";

const categories: PermissionMatrixCategory[] = [
	{
		id: "complaints",
		label: "Complaints",
		groups: [
			{
				id: "complaints.translation",
				label: "translation.baseline.with-a-long-scope-name",
				permissions: [
					{id: "complaints.translation.import", label: "translation.baseline:import-with-a-long-permission-name"},
					{id: "complaints.translation.view", label: "translation.baseline:view"},
				],
			},
			{
				id: "complaints.main",
				label: "Complaints",
				permissions: [
					{id: "complaints.create", label: "Create"},
					{id: "complaints.export", label: "Export"},
					{id: "complaints.manage", label: "Manage"},
					{id: "complaints.view", label: "View"},
				],
			},
		],
	},
	{
		id: "compliance",
		label: "Compliance",
		groups: [
			{
				id: "compliance.main",
				label: "Compliance",
				permissions: [
					{id: "compliance.create", label: "Create"},
					{id: "compliance.manage", label: "Manage"},
					{id: "compliance.view", label: "View"},
				],
			},
		],
	},
	{
		id: "crew",
		label: "Crew Management",
		groups: [
			{
				id: "crew.main",
				label: "Crew Management",
				permissions: [
					{id: "crew.create", label: "Create"},
					{id: "crew.export", label: "Export"},
					{id: "crew.manage", label: "Manage"},
					{id: "crew.view", label: "View"},
				],
			},
		],
	},
	{
		id: "network",
		label: "Network Administration With A Very Long Category Name",
		groups: [
			{
				id: "network.main",
				label: "Network Administration",
				permissions: [
					{id: "network.manage", label: "Manage"},
					{id: "network.view", label: "View"},
				],
			},
		],
	},
];

const initialValue = {
	"complaints.translation.view": true,
	"complaints.view": true,
	"compliance.view": true,
	"crew.view": true,
};

const meta = {
	title: "Widgets/Admin/Permission Matrix",
	component: PermissionMatrix,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Reusable three-level role-permission chooser. Categories, groups, and leaf actions share equivalent tracks; parent checkboxes cascade atomically and show indeterminate state. Long labels truncate with their full value available as a title, while narrow containers scroll the complete matrix instead of deforming individual columns.",
			},
		},
	},
	args: {
		categories,
	},
} satisfies Meta<typeof PermissionMatrix>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: (args) => {
		const [value, setValue] = useState<Record<string, boolean>>(initialValue);
		return <PermissionMatrix {...args} value={value} onValueChange={setValue} />;
	},
};

export const NarrowContainer: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"At a narrow width the widget retains the same three equal column tracks and gives the matrix one horizontal scroll owner.",
			},
		},
	},
	render: (args) => {
		const [value, setValue] = useState<Record<string, boolean>>(initialValue);
		return (
			<div className="wwc:w-[24rem] wwc:max-w-full">
				<PermissionMatrix {...args} value={value} onValueChange={setValue} />
			</div>
		);
	},
};

export const ReadOnly: Story = {
	args: {
		value: initialValue,
		readOnly: true,
	},
};
