import type {
	ProductPackageDependency,
	ProductPackageEvidence,
	ProductPackageInstallReceipt,
	ProductPackageOutput,
	ProductPackagePermission,
} from "@core/core-ui/product-package-detail";
import type {Meta, StoryObj} from "storybook/internal/types";

import {CoreAppTopBar} from "@core/core-ui/navigation/core-app-top-bar";
import {ProductPackageDetail} from "@core/core-ui/product-package-detail";
import {Controls, Description, Primary, Stories, Subtitle, Title} from "@storybook/addon-docs/blocks";
import {useState} from "react";

import productPackageManifest from "../../../../manifests/product-package-detail.widget.json";
import {ComponentKnowledge} from "../_docs/ComponentKnowledge";
import {WidgetManifestPanel} from "../_docs/WidgetManifestPanel";

function ProductPackageDocsPage() {
	return (
		<>
			<Title />
			<Subtitle />
			<Description />
			<ComponentKnowledge />
			<WidgetManifestPanel manifest={productPackageManifest} />
			<Primary />
			<Controls />
			<Stories />
		</>
	);
}

const PACKAGE = {
	id: "attendance",
	name: "Attendance",
	apiName: "core.attendance",
	version: "2.1.0",
	description: "Shift attendance derived from badge reads, with an hourly projection for the site dashboard.",
	publisher: "Core Platform",
	kind: "Data product",
	channel: "Released",
	publishedAt: "02 Sep, 2026",
	details: [
		{label: "Runtime", value: "Lakehouse · hourly"},
		{label: "Support", value: "platform@core.com"},
	],
};

const DEPENDENCIES: ProductPackageDependency[] = [
	{id: "d1", name: "Workforce core", version: "1.4.0", status: "satisfied"},
	{id: "d2", name: "Badge reads", version: "0.9.0", status: "will-install", note: "Added by this install"},
	{id: "d3", name: "Shift calendar", version: "3.0.0", status: "missing", note: "Not present in this project"},
];

const OUTPUTS: ProductPackageOutput[] = [
	{id: "o1", name: "Attendance", kind: "Object type", action: "add"},
	{id: "o2", name: "attendance_hourly", kind: "Projection", action: "add"},
	{id: "o3", name: "Workforce summary", kind: "App route", action: "replace", note: "Existing route is rewired"},
];

const EVIDENCE: ProductPackageEvidence[] = [
	{id: "e1", label: "Source envelope", count: 3, status: "verified"},
	{id: "e2", label: "Read model", count: 4, status: "verified"},
	{id: "e3", label: "Rollback", count: 1, status: "pending"},
	{id: "e4", label: "Real data", status: "missing"},
];

const ADMIN_PERMISSIONS: ProductPackagePermission[] = [
	{id: "p1", label: "Install · Prod", granted: true, roles: ["Platform admin"]},
	{id: "p2", label: "Bind resource", granted: true, roles: ["Platform admin", "Data engineer"]},
	{id: "p3", label: "View OSDK scopes", granted: true},
];

const VIEWER_PERMISSIONS: ProductPackagePermission[] = [
	{id: "p1", label: "Install · Prod", granted: false, roles: ["Platform admin"]},
	{id: "p2", label: "Bind resource", granted: false, roles: ["Platform admin", "Data engineer"]},
	{id: "p3", label: "View OSDK scopes", granted: true},
];

const TARGET = {projectId: "riyadh-metro", projectName: "Riyadh Metro", environment: "Prod"};

const meta = {
	title: "Widgets/Connect/Product Package Detail",
	component: ProductPackageDetail,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			page: ProductPackageDocsPage,
			description: {
				component:
					"A product package as a **route-injectable** surface: identity, version, dependencies, outputs, permission gates, " +
					"evidence and install state, over a governed install — a plan, a confirmation, and a receipt. It owns no shell and " +
					"no router, so it mounts inside a workspace slot or a page whose sidebar and top bar already exist. " +
					"Authorisation is the host's answer, not the widget's: pass `canInstall` and a `denialReason`, and the **only** " +
					"thing that changes is the install action — every section stays readable, because a viewer still has to be able " +
					"to read them.",
			},
		},
	},
	decorators: [
		(Story) => (
			<div className="wwc:min-h-[720px] wwc:bg-background">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof ProductPackageDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The install-authorized persona. Every gate is met, so the action is live: it opens the plan —
 * version change, what the install writes, any unmet dependency — and only then writes anything.
 */
export const InstallAuthorized: Story = {
	args: {
		package: PACKAGE,
		dependencies: DEPENDENCIES,
		outputs: OUTPUTS,
		permissions: ADMIN_PERMISSIONS,
		evidence: EVIDENCE,
		target: TARGET,
		actor: {id: "u-1", name: "Aballa Ibrahim", role: "Platform admin"},
		installState: {status: "not-installed"},
	},
};

/**
 * The view-only persona. The refusal is stated under the action rather than left to a greyed button,
 * and the package's details are exactly as readable as they are for an admin.
 */
export const ViewOnly: Story = {
	args: {
		...InstallAuthorized.args,
		permissions: VIEWER_PERMISSIONS,
		actor: {id: "u-2", name: "Sara Al-Otaibi", role: "Project viewer"},
		canInstall: false,
		denialReason: "Install · Prod requires the Platform admin role. Ask a platform admin to install this package.",
	},
};

/** An older version is installed, so the action names the upgrade rather than repeating "Install". */
export const UpgradeAvailable: Story = {
	args: {
		...InstallAuthorized.args,
		installState: {status: "outdated", version: "1.9.0", installedAt: "14 Jun, 2026", installedBy: "A. Ibrahim"},
	},
};

/** Blockers from the host's planner: listed on the page and on the plan, and the confirm stays shut. */
export const Blocked: Story = {
	args: {
		...InstallAuthorized.args,
		blockers: [
			{code: "readiness", message: "Release evidence is incomplete — Real data refs are missing."},
			{code: "dependency", message: "Shift calendar 3.0.0 is not present in Riyadh Metro."},
		],
	},
};

/** The whole governed journey: plan, confirm, and the receipt the host records. */
export const GovernedInstallWithReceipt: Story = {
	args: InstallAuthorized.args,
	render: (args) => {
		const [receipt, setReceipt] = useState<ProductPackageInstallReceipt | null>(null);

		return (
			<>
				<ProductPackageDetail
					{...args}
					installState={receipt ? {status: "installed", version: receipt.version} : {status: "not-installed"}}
					// Stand-in for the host's apply — the widget shows its pending state until this settles.
					onInstall={() => new Promise((resolve) => setTimeout(resolve, 700))}
					onInstalled={setReceipt}
				/>
				{receipt ? (
					<pre className="wwc:mx-4 wwc:mb-4 wwc:overflow-auto wwc:rounded-md wwc:border wwc:bg-muted/40 wwc:p-3 wwc:text-xs">
						{JSON.stringify(receipt, null, 2)}
					</pre>
				) : null}
			</>
		);
	},
};

/**
 * Injected into a page whose shell already exists. The widget contributes no sidebar, no top bar and
 * no navigation — which is what lets it sit inside a WC3 workspace route unchanged.
 */
export const InsideAnExistingShell: Story = {
	args: InstallAuthorized.args,
	render: (args) => (
		<div className="wwc:flex wwc:h-[720px] wwc:flex-col wwc:overflow-hidden">
			<CoreAppTopBar
				activeLabel="Products"
				selectedProject="Riyadh Metro"
				projects={["Riyadh Metro", "Fadhili GIP PKG 1"]}
				onSelectProject={() => {}}
			/>
			<div className="wwc:min-h-0 wwc:flex-1 wwc:overflow-auto">
				<ProductPackageDetail {...args} />
			</div>
		</div>
	),
};
