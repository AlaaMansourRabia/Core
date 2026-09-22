import {APP_LIFECYCLE_STAGES, APPS, AppDetailsDialog, useAppInstallation} from "@/components/ui/app-marketplace";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";

function Example() {
	const install = useAppInstallation({initialInstalled: [APPS[0]?.id ?? ""]});
	return (
		<div className="wwc:grid wwc:gap-6 wwc:lg:grid-cols-[1fr_16rem]">
			<div className="wwc:space-y-2">
				{APPS.slice(0, 5).map((app) => {
					const installed = install.isInstalled(app.id);
					return (
						<Card key={app.id} className="wwc:flex wwc:items-center wwc:gap-3 wwc:p-3">
							<div className="wwc:min-w-0 wwc:flex-1">
								<h3 className="wwc:text-sm wwc:font-medium">{app.name}</h3>
								<p className="wwc:text-muted-foreground wwc:line-clamp-1 wwc:text-xs">{app.blurb}</p>
							</div>
							<Button size="sm" variant="ghost" onClick={() => install.setDetailsApp(app)}>
								Details
							</Button>
							<Button size="sm" variant={installed ? "outline" : "default"} onClick={() => install.toggleInstall(app)}>
								{installed ? "Uninstall" : "Install"}
							</Button>
						</Card>
					);
				})}
			</div>

			<div className="wwc:space-y-3">
				<h3 className="wwc:text-muted-foreground wwc:text-xs wwc:font-semibold wwc:tracking-wide wwc:uppercase">
					Derived nav group
				</h3>
				{install.installedApps.length === 0 ? (
					<p className="wwc:text-muted-foreground wwc:text-xs">Nothing installed — the group disappears.</p>
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
				<p className="wwc:text-muted-foreground wwc:text-xs">Lifecycle stages: {APP_LIFECYCLE_STAGES.join(" · ")}</p>
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
}

export function AppMarketplacePage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">AppMarketplace</h1>
					<CopyButton
						value="AppMarketplace"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Browse, inspect, install and uninstall apps — and the installed-apps navigation group derived from it.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Default</CardTitle>
					<CardDescription>
						The group on the right is <em>derived</em>, never declared twice. Install an app and it appears; uninstall
						the last app in a stage and the stage disappears.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Example />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Four templates already share it</CardTitle>
					<CardDescription>
						<code>core-app-installer</code>, <code>core-core-connect</code>,<code> core-core-connect-v3</code> and{" "}
						<code>core-wc3-workspace</code> all import this module. It had earned widget tier by use long before it was
						given one.
					</CardDescription>
				</CardHeader>
			</Card>
		</div>
	);
}
