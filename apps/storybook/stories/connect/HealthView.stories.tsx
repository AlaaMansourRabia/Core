import type {Meta, StoryObj} from "storybook/internal/types";

import {HealthView} from "@core/core-ui/pages/health-view";

const meta = {
	title: "Widgets/Connect/Health View",
	component: HealthView,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"Grouped rule findings over the shared ontology, each carrying the element it points at so the panel can jump the user to the thing that needs repairing rather than describing it. A finding with no single target is attributed to the ontology itself, which keeps every row actionable. The rule engine, `runOntologyLint`, is exported alongside it for a host that wants the findings without the surface.",
			},
		},
	},
} satisfies Meta<typeof HealthView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<div className="wwc:h-screen wwc:overflow-auto">
			<HealthView />
		</div>
	),
};
