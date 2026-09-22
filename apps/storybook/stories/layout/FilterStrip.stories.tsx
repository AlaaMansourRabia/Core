import type {Meta, StoryObj} from "storybook/internal/types";

import {CoreFilterStrip} from "@corensystem/core-ui/navigation/core-filter-strip";

const meta = {
	title: "Widgets/Navigation/FilterStrip",
	component: CoreFilterStrip,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Horizontal filter strip with variant-specific controls. Supports date range, project, zone, trade, and status filters with active filter pills and clear-all functionality.",
			},
		},
	},
} satisfies Meta<typeof CoreFilterStrip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Performance: Story = {
	render: () => <CoreFilterStrip variant="performance" />,
};

export const Workforce: Story = {
	render: () => <CoreFilterStrip variant="workforce" />,
};

export const RealityCapture: Story = {
	render: () => <CoreFilterStrip variant="reality-capture" />,
};

export const PerformanceSmall: Story = {
	render: () => <CoreFilterStrip variant="performance" size="sm" />,
};

export const WorkforceSmall: Story = {
	render: () => <CoreFilterStrip variant="workforce" size="sm" />,
};

export const RealityCaptureSmall: Story = {
	render: () => <CoreFilterStrip variant="reality-capture" size="sm" />,
};
