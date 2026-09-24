import type {Meta, StoryObj} from "storybook/internal/types";

import {CoreConnect} from "@corensystem/coren-ui/pages/core-core-connect";

import manifest from "../../../../manifests/core-connect.template.json";
import {TemplateDocsPage} from "../_docs/TemplateDocsPage";

// Core Connect V2 — the V1 pair (WC3 Workspace + AppInstaller) merged into one app. One sidebar:
// installed apps, divider, admin perspectives, divider, Marketplace.
const meta = {
	title: "Templates/Core Connect/V2/Core Connect",
	component: CoreConnect,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			page: () => (
				<TemplateDocsPage
					manifest={manifest}
					family={
						<>
							Core Connect V2, unified portal. Where V1 split Connect into an admin portal (<code>wc3-workspace</code>)
							and an end-user portal (<code>app-installer</code>), V2 collapses both into one app. Canonical:{" "}
							<code>core-connect</code>. A single CoreAppSidebar, branded "Core Connect", stacks Home with the installed
							apps directly beneath it, then the admin perspectives under a "Studio" label, then a pinned Marketplace
							entry — with every divider falling out of CoreAppSidebar's own group separators, expanded and collapsed
							alike. Home is always present and behaves like the standalone installer's: an install CTA while nothing is
							installed, an app launcher once apps exist, which is why no divider splits it from the apps below.
							Installing an app from the Marketplace adds it to the apps section without leaving the app. Implemented as{" "}
							<code>CoreWC3Workspace</code> with <code>withMarketplace</code> set, so V1 and V2 share one implementation
							and cannot drift.
						</>
					}
				/>
			),
			description: {
				component:
					"Core Connect V2 — the admin workspace and the app marketplace as one app. The sidebar stacks Home " +
					"with the installed apps directly beneath it, a divider, the admin perspectives under a Studio label (each " +
					"with its own tabs), a divider, then Marketplace — and the dividers survive collapsing the sidebar to its rail. " +
					"You land on Home: a Browse CTA while nothing is installed, an app launcher once apps exist. Open " +
					"Marketplace, install an app, and it appears in the apps section immediately; clicking it opens that app's " +
					"workspace in the same shell. The apps section and its divider only appear once you install something.",
			},
		},
	},
} satisfies Meta<typeof CoreConnect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<div className="wwc:h-screen wwc:w-full">
			<CoreConnect />
		</div>
	),
};
