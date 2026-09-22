import type {Meta, StoryObj} from "storybook/internal/types";

import {StatusDot} from "@core/core-ui/status-dot";

const meta = {
	title: "Components/Primitives/StatusDot",
	component: StatusDot,
	tags: ["autodocs"],
} satisfies Meta<typeof StatusDot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => <StatusDot />,
};

export const Variants: Story = {
	render: () => (
		<div className="wwc:flex wwc:items-center wwc:gap-4">
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<StatusDot variant="success" />
				<span className="wwc:text-sm">Success</span>
			</div>
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<StatusDot variant="warning" />
				<span className="wwc:text-sm">Warning</span>
			</div>
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<StatusDot variant="error" />
				<span className="wwc:text-sm">Error</span>
			</div>
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<StatusDot variant="info" />
				<span className="wwc:text-sm">Info</span>
			</div>
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<StatusDot variant="neutral" />
				<span className="wwc:text-sm">Neutral</span>
			</div>
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<StatusDot variant="offline" />
				<span className="wwc:text-sm">Offline</span>
			</div>
		</div>
	),
};

export const Sizes: Story = {
	render: () => (
		<div className="wwc:flex wwc:items-center wwc:gap-4">
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<StatusDot variant="success" size="xs" />
				<span className="wwc:text-sm">XS</span>
			</div>
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<StatusDot variant="success" size="sm" />
				<span className="wwc:text-sm">SM</span>
			</div>
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<StatusDot variant="success" size="md" />
				<span className="wwc:text-sm">MD</span>
			</div>
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<StatusDot variant="success" size="lg" />
				<span className="wwc:text-sm">LG</span>
			</div>
		</div>
	),
};

export const Shapes: Story = {
	render: () => (
		<div className="wwc:flex wwc:flex-col wwc:gap-4">
			<p className="wwc:text-sm wwc:text-muted-foreground">Shapes provide accessibility - status is not conveyed by color alone (WCAG 1.4.1)</p>
			<div className="wwc:flex wwc:items-center wwc:gap-6">
				<div className="wwc:flex wwc:items-center wwc:gap-2">
					<StatusDot variant="success" shape="filled" size="lg" />
					<span className="wwc:text-sm">Filled (Online)</span>
				</div>
				<div className="wwc:flex wwc:items-center wwc:gap-2">
					<StatusDot variant="neutral" shape="ring" size="lg" />
					<span className="wwc:text-sm">Ring (Offline)</span>
				</div>
				<div className="wwc:flex wwc:items-center wwc:gap-2">
					<StatusDot variant="error" shape="minus" size="lg" />
					<span className="wwc:text-sm">Minus (DND)</span>
				</div>
			</div>
		</div>
	),
};

export const WithPulse: Story = {
	render: () => (
		<div className="wwc:flex wwc:items-center wwc:gap-4">
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<StatusDot variant="success" pulse />
				<span className="wwc:text-sm">Live/Active</span>
			</div>
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<StatusDot variant="error" pulse />
				<span className="wwc:text-sm">Alert</span>
			</div>
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<StatusDot variant="info" pulse />
				<span className="wwc:text-sm">Processing</span>
			</div>
		</div>
	),
};

export const InlineWithText: Story = {
	render: () => (
		<div className="wwc:space-y-2">
			<p className="wwc:text-sm wwc:flex wwc:items-center wwc:gap-2">
				<StatusDot variant="success" size="sm" /> Server is running
			</p>
			<p className="wwc:text-sm wwc:flex wwc:items-center wwc:gap-2">
				<StatusDot variant="warning" size="sm" /> High memory usage
			</p>
			<p className="wwc:text-sm wwc:flex wwc:items-center wwc:gap-2">
				<StatusDot variant="error" size="sm" /> Connection failed
			</p>
		</div>
	),
};
