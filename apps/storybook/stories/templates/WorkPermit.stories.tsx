import type {Meta, StoryObj} from "storybook/internal/types";

import {WorkPermit} from "@corensystem/core-ui/pages/core-work-permit";

import manifest from "../../../../manifests/work-permit.template.json";
import {TemplateDocsPage} from "../_docs/TemplateDocsPage";

// Work Permit — the permit-management scaffold: the same shell as Workforce (CoreAppSidebar +
// CoreAppTopBar with a single "Work Permits" entry) and a route header carrying six tabs —
// Dashboard, Work Permits, Templates, Map, AI Agent (badged SOON) and Settings. Every tab body is a
// placeholder for now.
const meta = {
	title: "Templates/Work Permit",
	component: WorkPermit,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			page: () => (
				<TemplateDocsPage
					manifest={manifest}
					family={
						<>
							Canonical: <code>work-permit</code>. A work permit app shell — CoreAppSidebar + CoreAppTopBar with a
							single "Work Permits" entry and a description-less route header: title, five tabs (Dashboard, Work
							Permits, Templates, Map, AI Agent) and a Settings gear on the far right. The shell, the nav and the TAB
							SET are the decisions this template makes. <strong>Templates</strong> is built out — the versioned
							template register: All / Draft / Published / Archived status tabs carrying their own counts, and a
							searchable, filterable table with row selection and bulk delete, built to the same shape as the Workforce
							Crews list. There is no KPI row: its four numbers were the four tab badges, said twice.{" "}
							<strong>New Template</strong> — and any row in it — opens the authoring page: <code>StateMachine</code> in
							its <code>work-permit</code> variant, whose own shell supplies the Back button. Every other tab body is
							deliberately a placeholder naming what belongs in it, so the scaffold reads as a plan rather than as
							something broken. One divergence from Workforce, deliberate: AI Agent carries a <code>SOON</code> badge
							instead of being disabled, so the tab still opens and says what is coming rather than refusing to respond.
							Authoring one permit's state machine is a different surface — that is <code>StateMachine</code> in its{" "}
							<code>work-permit</code> variant.
						</>
					}
				/>
			),
			description: {
				component:
					"The work permit scaffold. It owns its own app shell (single sidebar entry + top bar with the project " +
					"switcher) and a description-less PageContentHeader with five tabs — Dashboard, Work Permits, " +
					"Templates, Map and AI Agent (badged SOON) — plus a Settings gear on the far right, where Safety Manager " +
					"and Workforce both put theirs. Templates is live: the versioned template register, with All / Draft / " +
					"Published / Archived status tabs and a searchable table. The rest are placeholders. The active tab and " +
					"the selected project persist across reloads, so a refresh lands where you left off.",
			},
		},
	},
} satisfies Meta<typeof WorkPermit>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<div className="wwc:h-screen wwc:w-full">
			<WorkPermit />
		</div>
	),
};
