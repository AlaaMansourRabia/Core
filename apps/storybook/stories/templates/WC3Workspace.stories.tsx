import type {Meta, StoryObj} from "storybook/internal/types";

import {WC3Workspace} from "@wakecap/core-ui/pages/core-wc3-workspace";

import manifest from "../../../../manifests/wc3-workspace.template.json";
import {TemplateDocsPage} from "../_docs/TemplateDocsPage";

// The unified-workspace prototype as a skeleton: CoreAppSidebar + CoreAppTopBar, one sidebar item per
// perspective, and a top-tab surface (Settings last) inside each one.
// WakeCap Connect V1 pairs this admin portal with AppInstaller as the end-user portal.
const meta = {
	title: "Templates/WakeCap Connect/V1/WC3 Workspace",
	component: WC3Workspace,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			page: () => (
				<TemplateDocsPage
					manifest={manifest}
					family={
						<>
							WakeCap Connect V1, admin portal. Connect V1 is a two-portal product: this workspace is where an admin
							manages everything, and <code>AppInstaller</code> is where an end user lands and installs apps from the
							marketplace. Canonical: <code>wc3-workspace</code>. A skeleton app shell — CoreAppSidebar + CoreAppTopBar
							with the ten perspectives of the ontology-manager unified-workspace prototype: Command Center, Analysis,
							Twin, Schedule, Workforce, Processes, Pipelines, Products, Lineage, Ontology. Each is a Default view
							(PageContentHeader tabs) plus a Settings sub-surface, like Workforce and Clinic. No variants/instances.
						</>
					}
				/>
			),
			description: {
				component:
					"The admin portal of WakeCap Connect V1 — the side where an admin manages everything, paired with " +
					"AppInstaller as the end-user portal. A structural skeleton of the WC3 unified workspace. The sidebar is the prototype's perspective rail; " +
					"selecting a perspective opens a Default view whose sections are top tabs, with a Settings action in the " +
					"header opening a SideMenu sub-surface. Every tab body is an Empty placeholder — this template defines the " +
					"shape, not the content.",
			},
		},
	},
} satisfies Meta<typeof WC3Workspace>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<div className="wwc:h-screen wwc:w-full">
			<WC3Workspace />
		</div>
	),
};
