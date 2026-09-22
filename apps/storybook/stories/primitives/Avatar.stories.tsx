import type {Meta, StoryObj} from "storybook/internal/types";

import {Avatar, AvatarFallback, AvatarGroup, AvatarImage} from "@core/core-ui/avatar";
import {AvatarStatusDot} from "@core/core-ui/avatar-status-dot";

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

export const Sizes: Story = {
	render: () => (
		<div className="wwc:flex wwc:items-end wwc:gap-4">
			<Avatar size="xs">
				<AvatarFallback>XS</AvatarFallback>
			</Avatar>
			<Avatar size="sm">
				<AvatarFallback>SM</AvatarFallback>
			</Avatar>
			<Avatar size="md">
				<AvatarFallback>MD</AvatarFallback>
			</Avatar>
			<Avatar size="lg">
				<AvatarFallback>LG</AvatarFallback>
			</Avatar>
			<Avatar size="xl">
				<AvatarFallback>XL</AvatarFallback>
			</Avatar>
			<Avatar size="2xl">
				<AvatarFallback>2XL</AvatarFallback>
			</Avatar>
			<Avatar size="3xl">
				<AvatarFallback>3XL</AvatarFallback>
			</Avatar>
		</div>
	),
};

export const Shapes: Story = {
	render: () => (
		<div className="wwc:flex wwc:items-center wwc:gap-4">
			<div className="wwc:flex wwc:flex-col wwc:items-center wwc:gap-2">
				<Avatar shape="circle" size="lg">
					<AvatarImage src="https://github.com/shadcn.png" alt="User" />
					<AvatarFallback>CN</AvatarFallback>
				</Avatar>
				<span className="wwc:text-xs">Circle</span>
			</div>
			<div className="wwc:flex wwc:flex-col wwc:items-center wwc:gap-2">
				<Avatar shape="square" size="lg">
					<AvatarImage src="https://github.com/shadcn.png" alt="User" />
					<AvatarFallback>CN</AvatarFallback>
				</Avatar>
				<span className="wwc:text-xs">Square</span>
			</div>
			<div className="wwc:flex wwc:flex-col wwc:items-center wwc:gap-2">
				<Avatar shape="rounded" size="lg">
					<AvatarImage src="https://github.com/shadcn.png" alt="User" />
					<AvatarFallback>CN</AvatarFallback>
				</Avatar>
				<span className="wwc:text-xs">Rounded</span>
			</div>
		</div>
	),
};

export const WithStatusDot: Story = {
	render: () => (
		<div className="wwc:flex wwc:items-center wwc:gap-6">
			<div className="wwc:relative wwc:inline-block">
				<Avatar>
					<AvatarImage src="https://github.com/shadcn.png" alt="User" />
					<AvatarFallback>CN</AvatarFallback>
				</Avatar>
				<AvatarStatusDot variant="online" />
			</div>
			<div className="wwc:relative wwc:inline-block">
				<Avatar>
					<AvatarFallback>AB</AvatarFallback>
				</Avatar>
				<AvatarStatusDot variant="away" />
			</div>
			<div className="wwc:relative wwc:inline-block">
				<Avatar>
					<AvatarFallback>CD</AvatarFallback>
				</Avatar>
				<AvatarStatusDot variant="busy" />
			</div>
			<div className="wwc:relative wwc:inline-block">
				<Avatar>
					<AvatarFallback>EF</AvatarFallback>
				</Avatar>
				<AvatarStatusDot variant="dnd" />
			</div>
			<div className="wwc:relative wwc:inline-block">
				<Avatar>
					<AvatarFallback>GH</AvatarFallback>
				</Avatar>
				<AvatarStatusDot variant="offline" />
			</div>
		</div>
	),
};

export const Group: Story = {
	render: () => (
		<AvatarGroup max={4}>
			<Avatar>
				<AvatarImage src="https://github.com/shadcn.png" alt="User 1" />
				<AvatarFallback>U1</AvatarFallback>
			</Avatar>
			<Avatar>
				<AvatarFallback>U2</AvatarFallback>
			</Avatar>
			<Avatar>
				<AvatarFallback>U3</AvatarFallback>
			</Avatar>
			<Avatar>
				<AvatarFallback>U4</AvatarFallback>
			</Avatar>
			<Avatar>
				<AvatarFallback>U5</AvatarFallback>
			</Avatar>
			<Avatar>
				<AvatarFallback>U6</AvatarFallback>
			</Avatar>
		</AvatarGroup>
	),
};

export const GroupWithTotal: Story = {
	render: () => (
		<AvatarGroup max={3} total={25}>
			<Avatar>
				<AvatarImage src="https://github.com/shadcn.png" alt="User 1" />
				<AvatarFallback>U1</AvatarFallback>
			</Avatar>
			<Avatar>
				<AvatarFallback>U2</AvatarFallback>
			</Avatar>
			<Avatar>
				<AvatarFallback>U3</AvatarFallback>
			</Avatar>
		</AvatarGroup>
	),
};

export const GroupSizes: Story = {
	render: () => (
		<div className="wwc:space-y-4">
			<AvatarGroup max={4}>
				<Avatar size="sm">
					<AvatarFallback>A</AvatarFallback>
				</Avatar>
				<Avatar size="sm">
					<AvatarFallback>B</AvatarFallback>
				</Avatar>
				<Avatar size="sm">
					<AvatarFallback>C</AvatarFallback>
				</Avatar>
				<Avatar size="sm">
					<AvatarFallback>D</AvatarFallback>
				</Avatar>
				<Avatar size="sm">
					<AvatarFallback>E</AvatarFallback>
				</Avatar>
			</AvatarGroup>
			<AvatarGroup max={4}>
				<Avatar size="lg">
					<AvatarFallback>A</AvatarFallback>
				</Avatar>
				<Avatar size="lg">
					<AvatarFallback>B</AvatarFallback>
				</Avatar>
				<Avatar size="lg">
					<AvatarFallback>C</AvatarFallback>
				</Avatar>
				<Avatar size="lg">
					<AvatarFallback>D</AvatarFallback>
				</Avatar>
				<Avatar size="lg">
					<AvatarFallback>E</AvatarFallback>
				</Avatar>
			</AvatarGroup>
		</div>
	),
};
