import type {Meta, StoryObj} from "storybook/internal/types";

import {ProgressDetails} from "@core/core-ui/pages/core-progress-details";

import manifest from "../../../../manifests/progress-details.template.json";
import {TemplateDocsPage} from "../_docs/TemplateDocsPage";

// A period-based progress-details workspace over a WBS: a three-bar header (tabs + week/period
// selector; period status + approval counters + actions; search + sort + filter), a searchable WBS
// Navigator sidebar, and a content list that drills zone → category → division → task → object. The
// Default story renders the real page; the docs page shows the template manifest contract.
const meta = {
	title: "Templates/Progress Details",
	component: ProgressDetails,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			page: () => (
				<TemplateDocsPage
					manifest={manifest}
					family={
						<>
							Canonical: <code>core-progress-details</code>. A period-based WBS earned-value drill-down composing{" "}
							<strong>ViewTabBar</strong> (segmented toolbar, with its built-in WeekSelector) +{" "}
							<strong>CanvasNavigator</strong> + <strong>Breadcrumb</strong> + <strong>ProgressListItem</strong> (rows)
							+ <strong>OperationsDrawer</strong>. No variants/instances.
						</>
					}
				/>
			),
			description: {
				component:
					"A period-based progress-details workspace: a three-bar header (tabs + week/period selector; period status + approval counters + actions; search + sort + filter), a searchable WBS Navigator sidebar, and a content list that drills zone → category → division → task → object. Rows are `ProgressListItem`; clicking an object opens the Operations Drawer. Canonical: `core-progress-details`.",
			},
		},
	},
} satisfies Meta<typeof ProgressDetails>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<div className="wwc:h-screen">
			<ProgressDetails />
		</div>
	),
};
