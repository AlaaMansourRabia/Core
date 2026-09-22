import type {Meta, StoryObj} from "storybook/internal/types";

import {ButtonGroup, ButtonGroupItem} from "@corensystem/core-ui/button-group";

const meta = {
	title: "Components/Primitives/ButtonGroup",
	component: ButtonGroup,
	tags: ["autodocs"],
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<ButtonGroup>
			<ButtonGroupItem>Left</ButtonGroupItem>
			<ButtonGroupItem>Center</ButtonGroupItem>
			<ButtonGroupItem>Right</ButtonGroupItem>
		</ButtonGroup>
	),
};

export const TwoButtons: Story = {
	render: () => (
		<ButtonGroup>
			<ButtonGroupItem>Previous</ButtonGroupItem>
			<ButtonGroupItem>Next</ButtonGroupItem>
		</ButtonGroup>
	),
};

export const WithDisabledItem: Story = {
	render: () => (
		<ButtonGroup>
			<ButtonGroupItem>Edit</ButtonGroupItem>
			<ButtonGroupItem disabled>Delete</ButtonGroupItem>
			<ButtonGroupItem>Share</ButtonGroupItem>
		</ButtonGroup>
	),
};

export const ManyButtons: Story = {
	render: () => (
		<ButtonGroup>
			<ButtonGroupItem>1</ButtonGroupItem>
			<ButtonGroupItem>2</ButtonGroupItem>
			<ButtonGroupItem>3</ButtonGroupItem>
			<ButtonGroupItem>4</ButtonGroupItem>
			<ButtonGroupItem>5</ButtonGroupItem>
		</ButtonGroup>
	),
};

export const NavigationExample: Story = {
	render: () => (
		<div className="wwc:space-y-4">
			<p className="wwc:text-sm wwc:text-muted-foreground">Pagination</p>
			<ButtonGroup>
				<ButtonGroupItem>Prev</ButtonGroupItem>
				<ButtonGroupItem>1</ButtonGroupItem>
				<ButtonGroupItem>2</ButtonGroupItem>
				<ButtonGroupItem>3</ButtonGroupItem>
				<ButtonGroupItem>Next</ButtonGroupItem>
			</ButtonGroup>
		</div>
	),
};
