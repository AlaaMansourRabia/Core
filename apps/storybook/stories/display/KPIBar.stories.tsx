import type {Meta, StoryObj} from "storybook/internal/types";

import {Controls, Description, Primary, Stories, Subtitle, Title} from "@storybook/addon-docs/blocks";
import {KPIBar} from "@core/core-ui/kpi-bar";
import {AlertTriangle, Users} from "lucide-react";

import kpiBarManifest from "../../../../manifests/kpi-bar.widget.json";
import {ComponentKnowledge} from "../_docs/ComponentKnowledge";
import {WidgetManifestPanel} from "../_docs/WidgetManifestPanel";

function KPIBarDocsPage() {
	return (
		<>
			<Title />
			<Subtitle />
			<Description />
			<ComponentKnowledge />
			<WidgetManifestPanel manifest={kpiBarManifest} />
			<Primary />
			<Controls />
			<Stories />
		</>
	);
}

const meta = {
	// Promoted from the inline KPIStrip in core-org-overview (see manifests/kpi-bar.widget.json).
	title: "Widgets/Analytics/KPIBar",
	component: KPIBar,
	tags: ["autodocs"],
	parameters: {
		docs: {
			page: KPIBarDocsPage,
			description: {
				component:
					"A compact one-line stat bar of headline metrics (value + label, optional leading icon or status dot), border-separated into groups — the thin strip above a dashboard's main content.",
			},
		},
		layout: "fullscreen",
	},
} satisfies Meta<typeof KPIBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		groups: [
			[{value: 12, label: "Projects"}],
			[
				{value: 8, label: "On Track", dot: "success", hideLabelBelow: "sm"},
				{value: 3, label: "At Risk", dot: "warning", hideLabelBelow: "sm"},
				{value: 1, label: "Critical", dot: "danger", hideLabelBelow: "sm"},
			],
			[{value: "1,240", label: "on-site today", icon: Users, hideLabelBelow: "md"}],
			[{value: 2, label: "alerts (24h)", icon: AlertTriangle, tone: "danger", hideLabelBelow: "md"}],
		],
	},
};

export const NoAlerts: Story = {
	args: {
		groups: [
			[{value: 9, label: "Projects"}],
			[
				{value: 9, label: "On Track", dot: "success", hideLabelBelow: "sm"},
				{value: 0, label: "At Risk", dot: "warning", hideLabelBelow: "sm"},
				{value: 0, label: "Critical", dot: "danger", hideLabelBelow: "sm"},
			],
			[{value: "980", label: "on-site today", icon: Users, hideLabelBelow: "md"}],
			[{value: 0, label: "alerts (24h)", icon: AlertTriangle, hideLabelBelow: "md"}],
		],
	},
};
