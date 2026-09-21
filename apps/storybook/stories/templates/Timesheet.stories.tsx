import type {Meta, StoryObj} from "storybook/internal/types";

import {VerifyTimeCommandCenter} from "@core/core-ui/pages/core-verifytime-command-center";

import manifest from "../../../../manifests/timesheet.template.json";
import {TemplateDocsPage} from "../_docs/TemplateDocsPage";

// Keep the legacy template render explicit while matching the catalog id's normalized component name.
function VerifytimeCommandCenter() {
	return <VerifyTimeCommandCenter />;
}

// Agentic-first Timesheet workforce time-verification screen: an operational briefing,
// severity-ranked "Needs Attention" queues, AI recommendations, a natural-language workspace, investigation
// case sheets, and a demoted worker-records evidence table. The Default story is the live preview; the docs
// page shows the template manifest contract.
const meta = {
	title: "Templates/Timesheet",
	component: VerifyTimeCommandCenter,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			page: () => (
				<TemplateDocsPage
					manifest={manifest}
					family={
						<>
							Canonical: <code>timesheet</code>. A page-level workforce time-verification command center — briefing +
							operational queues + AI recommendations + NL workspace + investigation sheets + evidence table. No
							variants/instances.
						</>
					}
				/>
			),
			description: {
				component:
					"Turns a 25,000-row time-verification table into an operations command center: what happened today, what needs attention first, why, and the recommended action — with the detailed worker table kept as a secondary evidence layer.",
			},
		},
	},
} satisfies Meta<typeof VerifyTimeCommandCenter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => <VerifytimeCommandCenter />,
};
