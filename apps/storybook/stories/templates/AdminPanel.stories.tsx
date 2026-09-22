import type {Meta, StoryObj} from "storybook/internal/types";

import {AdminPanel} from "@core/core-ui/pages/core-admin-panel";

import manifest from "../../../../manifests/admin-panel.template.json";
import {TemplateDocsPage} from "../_docs/TemplateDocsPage";

// A full app-shell admin template: CoreAppSidebar + CoreAppTopBar around three sidebar sections —
// Projects, Permissions, and Users. The Default story is the live preview; the docs page shows the manifest.
const meta = {
	title: "Templates/Admin Panel",
	component: AdminPanel,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			page: () => (
				<TemplateDocsPage
					manifest={manifest}
					family={
						<>
							Canonical: <code>admin-panel</code>. A page-level admin shell — CoreAppSidebar + CoreAppTopBar with three
							sidebar sections (Projects, Permissions, Users). No variants/instances.
						</>
					}
				/>
			),
			description: {
				component:
					"An admin/settings template that owns its own app shell. The left sidebar switches between Projects (a " +
					"projects table), Permissions (role cards + a role×permission matrix), and Users (a users table with bulk " +
					"actions).",
			},
		},
	},
} satisfies Meta<typeof AdminPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<div className="wwc:h-screen wwc:w-full">
			<AdminPanel />
		</div>
	),
};
