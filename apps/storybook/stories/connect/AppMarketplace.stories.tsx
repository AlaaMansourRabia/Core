import type {Meta, StoryObj} from "storybook/internal/types";

import {Badge} from "@core/core-ui/badge";
import {Button} from "@core/core-ui/button";
import {Card} from "@core/core-ui/card";
import {APP_LIFECYCLE_STAGES, APPS, AppDetailsDialog, useAppInstallation} from "@core/core-ui/pages/app-marketplace";

const meta = {
	title: "Widgets/Connect/App Marketplace",
	tags: ["autodocs"],
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"The install lifecycle four Connect templates already share: browse, inspect, install, uninstall — and the installed-apps navigation group derived from it. The point is that the group is *derived* rather than declared twice: install an app below and it appears on the right; uninstall the last app in a stage and the stage disappears. An installed app that has not been opened yet carries a `new` marker until it is. Which lifecycle stage an app belongs to (Design / Plan / Capture / Pay) is provisional nav metadata, not behaviour.",
			},
		},
	},
} satisfies Meta<Record<string, never>>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Install and uninstall on the left; the derived group updates on the right. */
export const Default: Story = {
	render: () => {
		const install = useAppInstallation({initialInstalled: [APPS[0]?.id ?? ""]});
		return (
			<div className="wwc:grid wwc:gap-6 wwc:lg:grid-cols-[1fr_18rem]">
				<div className="wwc:space-y-2">
					{APPS.slice(0, 6).map((app) => {
						const installed = install.isInstalled(app.id);
						return (
							<Card key={app.id} className="wwc:flex wwc:items-center wwc:gap-3 wwc:p-3">
								<div className="wwc:min-w-0 wwc:flex-1">
									<h3 className="wwc:text-sm wwc:font-medium">{app.name}</h3>
									<p className="wwc:line-clamp-1 wwc:text-xs wwc:text-muted-foreground">{app.blurb}</p>
								</div>
								<Button size="sm" variant="ghost" onClick={() => install.setDetailsApp(app)}>
									Details
								</Button>
								<Button
									size="sm"
									variant={installed ? "outline" : "default"}
									onClick={() => install.toggleInstall(app)}
								>
									{installed ? "Uninstall" : "Install"}
								</Button>
							</Card>
						);
					})}
				</div>

				<div className="wwc:space-y-3">
					<h3 className="wwc:text-xs wwc:font-semibold wwc:tracking-wide wwc:text-muted-foreground wwc:uppercase">
						Derived nav group
					</h3>
					{install.installedApps.length === 0 ? (
						<p className="wwc:text-xs wwc:text-muted-foreground">Nothing installed — the group disappears.</p>
					) : (
						<ul className="wwc:space-y-1 wwc:text-sm">
							{install.installedApps.map((app) => (
								<li key={app.id} className="wwc:flex wwc:items-center wwc:gap-2">
									{app.name}
									{install.newIds.has(app.id) ? (
										<Badge variant="secondary" className="wwc:text-[10px]">
											new
										</Badge>
									) : null}
								</li>
							))}
						</ul>
					)}
					<p className="wwc:text-xs wwc:text-muted-foreground">Lifecycle stages: {APP_LIFECYCLE_STAGES.join(" · ")}</p>
				</div>

				<AppDetailsDialog
					app={install.detailsApp}
					installed={install.detailsApp ? install.isInstalled(install.detailsApp.id) : false}
					installing={install.detailsApp ? install.installingIds.has(install.detailsApp.id) : false}
					onOpenChange={(open) => {
						if (!open) install.setDetailsApp(null);
					}}
					onToggle={() => install.detailsApp && install.toggleInstall(install.detailsApp)}
				/>
			</div>
		);
	},
};
