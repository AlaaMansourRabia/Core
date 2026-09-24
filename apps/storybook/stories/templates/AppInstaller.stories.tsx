import type {Meta, StoryObj} from "storybook/internal/types";

import {AppInstaller} from "@corensystem/coren-ui/pages/core-app-installer";

import manifest from "../../../../manifests/app-installer.template.json";
import {TemplateDocsPage} from "../_docs/TemplateDocsPage";

// App Installer — the marketplace scaffold, built on the same bones as Workforce: CoreAppSidebar +
// CoreAppTopBar. Its sidebar carries no app entries, so the only icon is the shared "Marketplace" plus
// (added to CoreAppSidebar for every app shell). The content is a browsable, installable app catalog.
// Core Connect V1 pairs this end-user portal with WC3 Workspace as the admin portal.
const meta = {
	title: "Templates/Core Connect/V1/AppInstaller",
	component: AppInstaller,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			page: () => (
				<TemplateDocsPage
					manifest={manifest}
					family={
						<>
							Core Connect V1, end-user portal. Connect V1 is a two-portal product: this is where an end user lands and
							installs apps from the marketplace, and <code>WC3 Workspace</code> is the admin portal where an admin
							manages everything. Canonical: <code>app-installer</code>. A marketplace app shell — CoreAppSidebar +
							CoreAppTopBar with a single "Home" entry plus the shared "App Store" plus below it. Everyone lands on
							Home: a welcome hero (greeting + Browse App Store CTA) while nothing is installed, an app launcher once
							apps exist. The App Store surface has two tabs (App Store / Installed Apps), scrollable category pills,
							search with match highlighting, and a grid of app cards with a Details dialog and Install / Uninstall
							actions. The App Store plus is a new shared affordance on <code>CoreAppSidebar</code>, pinned under the
							app nav in every template built on this shell.
						</>
					}
				/>
			),
			description: {
				component:
					"The end-user portal of Core Connect V1 — where an end user lands and installs apps from the " +
					"marketplace, paired with WC3 Workspace as the admin portal. The marketplace scaffold. It owns its own app shell and lands on a Home surface — a welcome hero " +
					"(greeting + Browse App Store CTA) while nothing is installed, an app launcher once apps exist — plus an " +
					"App Store surface with two tabs (App Store / Installed Apps), scrollable category pills, search with match " +
					"highlighting, and a grid of app cards each with a Details dialog and Install / Uninstall actions. Its " +
					"sidebar has a single Home entry and the shared App Store plus that CoreAppSidebar now pins under the apps " +
					"for every shell-based template.",
			},
		},
	},
} satisfies Meta<typeof AppInstaller>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<div className="wwc:h-screen wwc:w-full">
			<AppInstaller />
		</div>
	),
};
