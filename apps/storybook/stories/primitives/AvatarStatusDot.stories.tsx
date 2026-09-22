import type {Meta, StoryObj} from "storybook/internal/types";

import {Avatar, AvatarFallback, AvatarImage} from "@corensystem/core-ui/avatar";
import {AvatarStatusDot} from "@corensystem/core-ui/avatar-status-dot";

const meta = {
	title: "Components/Primitives/AvatarStatusDot",
	component: AvatarStatusDot,
	tags: ["autodocs"],
} satisfies Meta<typeof AvatarStatusDot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<div className="wwc:relative wwc:inline-block">
			<Avatar>
				<AvatarImage src="https://github.com/shadcn.png" alt="User" />
				<AvatarFallback>CN</AvatarFallback>
			</Avatar>
			<AvatarStatusDot variant="online" />
		</div>
	),
};

export const AllStatuses: Story = {
	render: () => (
		<div className="wwc:flex wwc:items-center wwc:gap-6">
			<div className="wwc:flex wwc:flex-col wwc:items-center wwc:gap-2">
				<div className="wwc:relative wwc:inline-block">
					<Avatar>
						<AvatarImage src="https://github.com/shadcn.png" alt="User" />
						<AvatarFallback>CN</AvatarFallback>
					</Avatar>
					<AvatarStatusDot variant="online" />
				</div>
				<span className="wwc:text-xs">Online</span>
			</div>
			<div className="wwc:flex wwc:flex-col wwc:items-center wwc:gap-2">
				<div className="wwc:relative wwc:inline-block">
					<Avatar>
						<AvatarFallback>AB</AvatarFallback>
					</Avatar>
					<AvatarStatusDot variant="away" />
				</div>
				<span className="wwc:text-xs">Away</span>
			</div>
			<div className="wwc:flex wwc:flex-col wwc:items-center wwc:gap-2">
				<div className="wwc:relative wwc:inline-block">
					<Avatar>
						<AvatarFallback>CD</AvatarFallback>
					</Avatar>
					<AvatarStatusDot variant="busy" />
				</div>
				<span className="wwc:text-xs">Busy</span>
			</div>
			<div className="wwc:flex wwc:flex-col wwc:items-center wwc:gap-2">
				<div className="wwc:relative wwc:inline-block">
					<Avatar>
						<AvatarFallback>EF</AvatarFallback>
					</Avatar>
					<AvatarStatusDot variant="dnd" />
				</div>
				<span className="wwc:text-xs">DND</span>
			</div>
			<div className="wwc:flex wwc:flex-col wwc:items-center wwc:gap-2">
				<div className="wwc:relative wwc:inline-block">
					<Avatar>
						<AvatarFallback>GH</AvatarFallback>
					</Avatar>
					<AvatarStatusDot variant="offline" />
				</div>
				<span className="wwc:text-xs">Offline</span>
			</div>
		</div>
	),
};

export const DifferentSizes: Story = {
	render: () => (
		<div className="wwc:flex wwc:items-end wwc:gap-4">
			<div className="wwc:relative wwc:inline-block">
				<Avatar size="xs">
					<AvatarFallback>XS</AvatarFallback>
				</Avatar>
				<AvatarStatusDot variant="online" avatarSize="xs" />
			</div>
			<div className="wwc:relative wwc:inline-block">
				<Avatar size="sm">
					<AvatarFallback>SM</AvatarFallback>
				</Avatar>
				<AvatarStatusDot variant="online" avatarSize="sm" />
			</div>
			<div className="wwc:relative wwc:inline-block">
				<Avatar size="md">
					<AvatarFallback>MD</AvatarFallback>
				</Avatar>
				<AvatarStatusDot variant="online" avatarSize="md" />
			</div>
			<div className="wwc:relative wwc:inline-block">
				<Avatar size="lg">
					<AvatarFallback>LG</AvatarFallback>
				</Avatar>
				<AvatarStatusDot variant="online" avatarSize="lg" />
			</div>
			<div className="wwc:relative wwc:inline-block">
				<Avatar size="xl">
					<AvatarFallback>XL</AvatarFallback>
				</Avatar>
				<AvatarStatusDot variant="online" avatarSize="xl" />
			</div>
		</div>
	),
};

export const Positions: Story = {
	render: () => (
		<div className="wwc:flex wwc:items-center wwc:gap-6">
			<div className="wwc:flex wwc:flex-col wwc:items-center wwc:gap-2">
				<div className="wwc:relative wwc:inline-block">
					<Avatar size="lg">
						<AvatarFallback>BR</AvatarFallback>
					</Avatar>
					<AvatarStatusDot variant="online" avatarSize="lg" position="bottom-right" />
				</div>
				<span className="wwc:text-xs">Bottom Right</span>
			</div>
			<div className="wwc:flex wwc:flex-col wwc:items-center wwc:gap-2">
				<div className="wwc:relative wwc:inline-block">
					<Avatar size="lg">
						<AvatarFallback>BL</AvatarFallback>
					</Avatar>
					<AvatarStatusDot variant="online" avatarSize="lg" position="bottom-left" />
				</div>
				<span className="wwc:text-xs">Bottom Left</span>
			</div>
			<div className="wwc:flex wwc:flex-col wwc:items-center wwc:gap-2">
				<div className="wwc:relative wwc:inline-block">
					<Avatar size="lg">
						<AvatarFallback>TR</AvatarFallback>
					</Avatar>
					<AvatarStatusDot variant="online" avatarSize="lg" position="top-right" />
				</div>
				<span className="wwc:text-xs">Top Right</span>
			</div>
			<div className="wwc:flex wwc:flex-col wwc:items-center wwc:gap-2">
				<div className="wwc:relative wwc:inline-block">
					<Avatar size="lg">
						<AvatarFallback>TL</AvatarFallback>
					</Avatar>
					<AvatarStatusDot variant="online" avatarSize="lg" position="top-left" />
				</div>
				<span className="wwc:text-xs">Top Left</span>
			</div>
		</div>
	),
};

export const WithPulse: Story = {
	render: () => (
		<div className="wwc:flex wwc:items-center wwc:gap-4">
			<div className="wwc:relative wwc:inline-block">
				<Avatar size="lg">
					<AvatarImage src="https://github.com/shadcn.png" alt="User" />
					<AvatarFallback>CN</AvatarFallback>
				</Avatar>
				<AvatarStatusDot variant="online" avatarSize="lg" pulse />
			</div>
			<span className="wwc:text-sm">Currently active</span>
		</div>
	),
};
