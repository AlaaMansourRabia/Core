import type {Meta, StoryObj} from "storybook/internal/types";

import {Button} from "@corensystem/coren-ui/button";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@corensystem/coren-ui/hover-card";

const meta = {
	title: "Components/Overlay/HoverCard",
	component: HoverCard,
	tags: ["autodocs"],
} satisfies Meta<typeof HoverCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<HoverCard>
			<HoverCardTrigger asChild>
				<Button variant="link">@core</Button>
			</HoverCardTrigger>
			<HoverCardContent>
				<div className="wwc:flex wwc:justify-between wwc:space-x-4">
					<div className="wwc:space-y-1">
						<h4 className="wwc:text-sm wwc:font-semibold">@core</h4>
						<p className="wwc:text-sm">Core Technologies - Smart construction safety solutions.</p>
						<div className="wwc:flex wwc:items-center wwc:pt-2">
							<span className="wwc:text-xs wwc:text-muted-foreground">Joined December 2021</span>
						</div>
					</div>
				</div>
			</HoverCardContent>
		</HoverCard>
	),
};

export const WithAvatar: Story = {
	render: () => (
		<HoverCard>
			<HoverCardTrigger asChild>
				<Button variant="link">John Doe</Button>
			</HoverCardTrigger>
			<HoverCardContent>
				<div className="wwc:flex wwc:space-x-4">
					<div className="wwc:flex wwc:h-10 wwc:w-10 wwc:items-center wwc:justify-center wwc:rounded-full wwc:bg-muted wwc:text-sm wwc:font-medium">
						JD
					</div>
					<div className="wwc:space-y-1">
						<h4 className="wwc:text-sm wwc:font-semibold">John Doe</h4>
						<p className="wwc:text-sm wwc:text-muted-foreground">Software Engineer at Core</p>
						<div className="wwc:flex wwc:items-center wwc:gap-2 wwc:pt-2">
							<span className="wwc:text-xs wwc:text-muted-foreground">12 projects</span>
							<span className="wwc:text-xs wwc:text-muted-foreground">48 contributions</span>
						</div>
					</div>
				</div>
			</HoverCardContent>
		</HoverCard>
	),
};

export const AlignCenter: Story = {
	render: () => (
		<HoverCard>
			<HoverCardTrigger asChild>
				<Button variant="link">Center Aligned</Button>
			</HoverCardTrigger>
			<HoverCardContent align="center">
				<p className="wwc:text-sm wwc:text-muted-foreground">This hover card is center-aligned with its trigger.</p>
			</HoverCardContent>
		</HoverCard>
	),
};

export const AlignEnd: Story = {
	render: () => (
		<HoverCard>
			<HoverCardTrigger asChild>
				<Button variant="link">End Aligned</Button>
			</HoverCardTrigger>
			<HoverCardContent align="end">
				<p className="wwc:text-sm wwc:text-muted-foreground">This hover card is end-aligned with its trigger.</p>
			</HoverCardContent>
		</HoverCard>
	),
};
