import type {Meta, StoryObj} from "storybook/internal/types";

import {Clinic} from "@corensystem/coren-ui/pages/core-clinic";

import manifest from "../../../../manifests/clinic.template.json";
import {TemplateDocsPage} from "../_docs/TemplateDocsPage";

// Clinic — the occupational-health scaffold, built on the same bones as Safety Manager:
// CoreAppSidebar + CoreAppTopBar with a single "Clinic" entry, and a route header carrying
// two placeholder tabs plus a Settings action. The Default story is the live preview; the
// docs page shows the manifest.
const meta = {
	title: "Templates/Clinic",
	component: Clinic,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			page: () => (
				<TemplateDocsPage
					manifest={manifest}
					family={
						<>
							Canonical: <code>clinic</code>. An occupational-health app shell — CoreAppSidebar + CoreAppTopBar with a
							single "Clinic" entry and a description-less route header: title, two tabs (Overview, Worker Fitness), and
							a Settings action. Tab bodies are placeholders; Settings › General is live.
						</>
					}
				/>
			),
			description: {
				component:
					"The occupational-health scaffold. It owns its own app shell (single sidebar entry + top bar) and a " +
					"description-less PageContentHeader with two placeholder tabs — Overview and Worker Fitness — plus a " +
					"Settings action that opens a SideMenu sub-surface. Settings › General renders real toggle rows with the " +
					"shared FormActionBar save/discard bar.",
			},
		},
	},
} satisfies Meta<typeof Clinic>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<div className="wwc:h-screen wwc:w-full">
			<Clinic />
		</div>
	),
};
