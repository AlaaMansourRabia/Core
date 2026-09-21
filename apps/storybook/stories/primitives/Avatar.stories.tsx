import type {Meta, StoryObj} from "storybook/internal/types";

import {Avatar, AvatarFallback, AvatarImage} from "@wakecap/core-ui/avatar";

const meta = {
	title: "Components/Primitives/Avatar",
	component: Avatar,
	tags: ["autodocs"],
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<Avatar>
			<AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
			<AvatarFallback>CN</AvatarFallback>
		</Avatar>
	),
};

export const WithFallback: Story = {
	render: () => (
		<Avatar>
			<AvatarImage src="/broken-image.jpg" alt="User" />
			<AvatarFallback>JD</AvatarFallback>
		</Avatar>
	),
};

export const FallbackOnly: Story = {
	render: () => (
		<Avatar>
			<AvatarFallback>WC</AvatarFallback>
		</Avatar>
	),
};

export const CustomSize: Story = {
	render: () => (
		<div className="wwc:flex wwc:items-center wwc:gap-4">
			<Avatar className="wwc:h-6 wwc:w-6">
				<AvatarFallback className="wwc:text-xs">S</AvatarFallback>
			</Avatar>
			<Avatar>
				<AvatarFallback>M</AvatarFallback>
			</Avatar>
			<Avatar className="wwc:h-14 wwc:w-14">
				<AvatarFallback className="wwc:text-lg">L</AvatarFallback>
			</Avatar>
			<Avatar className="wwc:h-20 wwc:w-20">
				<AvatarFallback className="wwc:text-2xl">XL</AvatarFallback>
			</Avatar>
		</div>
	),
};

export const AvatarGroup: Story = {
	render: () => (
		<div className="wwc:flex wwc:-space-x-3">
			<Avatar className="wwc:border-2 wwc:border-background">
				<AvatarFallback>A</AvatarFallback>
			</Avatar>
			<Avatar className="wwc:border-2 wwc:border-background">
				<AvatarFallback>B</AvatarFallback>
			</Avatar>
			<Avatar className="wwc:border-2 wwc:border-background">
				<AvatarFallback>C</AvatarFallback>
			</Avatar>
			<Avatar className="wwc:border-2 wwc:border-background">
				<AvatarFallback>+3</AvatarFallback>
			</Avatar>
		</div>
	),
};
