import type {Meta, StoryObj} from "storybook/internal/types";

import {SafetyManager} from "@corensystem/core-ui/pages/core-safety-manager";

import manifest from "../../../../manifests/safety-manager.template.json";
import {TemplateDocsPage} from "../_docs/TemplateDocsPage";

// Safety Manager — the observation-manager scaffold: CoreAppSidebar + CoreAppTopBar with a single
// "Safety Manager" entry, and a route header (PageContentHeader) carrying three placeholder tabs.
// The Default story is the live preview; the docs page shows the manifest.
const meta = {
	title: "Templates/Safety Manager",
	component: SafetyManager,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			page: () => (
				<TemplateDocsPage
					manifest={manifest}
					family={
						<>
							Canonical: <code>safety-manager</code>. An observation-manager app shell — CoreAppSidebar + CoreAppTopBar
							with a single "Safety Manager" entry and a description-less route header: title, three tabs (Analytics,
							List View, Map View), and a Settings action. Tab bodies are placeholders for now.
						</>
					}
				/>
			),
			description: {
				component:
					"The observation-manager scaffold. It owns its own app shell (single sidebar entry + top bar) and a " +
					"description-less PageContentHeader with three placeholder tabs — Analytics, List View, and Map View — plus " +
					"a Settings action, ready for the real safety surfaces to fill in.",
			},
		},
	},
} satisfies Meta<typeof SafetyManager>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<div className="wwc:h-screen wwc:w-full">
			<SafetyManager />
		</div>
	),
};
