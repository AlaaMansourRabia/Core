import type {Meta, StoryObj} from "storybook/internal/types";

import {LineageImpactView} from "@corensystem/coren-ui/pages/lineage-impact-view";

const meta = {
	title: "Widgets/Connect/Lineage Impact View",
	component: LineageImpactView,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"What-if blast radius: given a change to one ontology element, the pipelines, processes and actions it would reach. A dependency list names the neighbours; this walks all three downstream registries and reports what a change actually touches — the thing you want in front of you before a delete.",
			},
		},
	},
} satisfies Meta<typeof LineageImpactView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<div className="wwc:h-screen wwc:overflow-auto">
			<LineageImpactView />
		</div>
	),
};

/** Deep-linked to one object type, the way a routed `/lineage/impact/<id>` lands. */
export const DeepLinked: Story = {
	render: () => (
		<div className="wwc:h-screen wwc:overflow-auto">
			<LineageImpactView objectTypeId="ot_permit" />
		</div>
	),
};
