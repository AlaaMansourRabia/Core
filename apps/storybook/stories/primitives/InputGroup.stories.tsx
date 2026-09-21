import type {Meta, StoryObj} from "storybook/internal/types";

import {Input} from "@wakecap/core-ui/input";
import {InputGroup, InputGroupText} from "@wakecap/core-ui/input-group";

const meta = {
	title: "Components/Primitives/InputGroup",
	component: InputGroup,
	tags: ["autodocs"],
} satisfies Meta<typeof InputGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<InputGroup>
			<InputGroupText>@</InputGroupText>
			<Input placeholder="Username" className="wwc:rounded-l-none wwc:rounded-r-md" />
		</InputGroup>
	),
};

export const WithSuffix: Story = {
	render: () => (
		<InputGroup>
			<Input placeholder="Amount" className="wwc:rounded-l-md wwc:rounded-r-none" />
			<InputGroupText>.00</InputGroupText>
		</InputGroup>
	),
};

export const WithPrefixAndSuffix: Story = {
	render: () => (
		<InputGroup>
			<InputGroupText>$</InputGroupText>
			<Input placeholder="0.00" className="wwc:rounded-none" />
			<InputGroupText>USD</InputGroupText>
		</InputGroup>
	),
};

export const WithUrl: Story = {
	render: () => (
		<InputGroup>
			<InputGroupText>https://</InputGroupText>
			<Input placeholder="example.com" className="wwc:rounded-l-none wwc:rounded-r-md" />
		</InputGroup>
	),
};
