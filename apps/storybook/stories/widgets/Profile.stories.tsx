import type {Meta, StoryObj} from "storybook/internal/types";

import {Badge} from "@core/core-ui/badge";
import {Button} from "@core/core-ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@core/core-ui/dropdown-menu";
import {Separator} from "@core/core-ui/separator";
import {WorkerProfile, type WorkerProfileTabId} from "@core/core-ui/worker-profile";
import {Controls, Description, Primary, Stories, Subtitle, Title} from "@storybook/addon-docs/blocks";
import {Ellipsis, Plus, RefreshCw, Smartphone, Trash2} from "lucide-react";
import {useState} from "react";

import workerProfileManifest from "../../../../manifests/worker-profile.widget.json";
import {ComponentKnowledge} from "../_docs/ComponentKnowledge";
import {WidgetManifestPanel} from "../_docs/WidgetManifestPanel";

function WorkerProfileDocsPage() {
	return (
		<>
			<Title />
			<Subtitle />
			<Description />
			<ComponentKnowledge />
			<WidgetManifestPanel manifest={workerProfileManifest} />
			<Primary />
			<Controls />
			<Stories />
		</>
	);
}

const meta = {
	// Extracted from the PushPanel "Profile View Pattern" story (see manifests/worker-profile.widget.json).
	title: "Widgets/Profile",
	component: WorkerProfile,
	render: (args) => <WorkerProfile {...args} />,
	tags: ["autodocs"],
	parameters: {
		docs: {
			page: WorkerProfileDocsPage,
			description: {
				component:
					"A worker's record as seven icon tabs — General, Certificates, Compliance, Trainings, Device, Crew, Visits — over grouped " +
					"label/value rows, under an optional identity region. Supply only the tabs you have data for; the rest fall back " +
					"to their empty state. Panel chrome (header, close, footer) belongs to the caller, so it drops into a PushPanel, " +
					"Sheet, or Dialog.",
			},
		},
	},
	decorators: [
		(Story) => (
			<div className="wwc:flex wwc:h-[520px] wwc:w-[360px] wwc:flex-col wwc:overflow-hidden wwc:rounded-lg wwc:border wwc:bg-card">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof WorkerProfile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		general: [
			{
				id: "identity",
				fields: [
					{label: "Name", value: "John Doe"},
					{label: "Code", value: "123423"},
					{label: "Company", value: "Aramco"},
					{label: "Trade", value: "Electrician"},
					{
						label: "Mobilization",
						value: (
							<Badge variant="default" className="wwc:h-5 wwc:text-xs">
								Mobilized
							</Badge>
						),
					},
					{label: "Role", value: "Supervisor"},
					{label: "Department", value: "Support & maintenance"},
				],
			},
			{
				id: "personal",
				fields: [
					{label: "Blood Type", value: "AB+"},
					{label: "Phone Number", value: "+966 566 549 213"},
					{label: "Nationality", value: "Indian"},
					{label: "Email", value: <span className="wwc:text-xs">john.doe@example.com</span>},
				],
			},
		],
		certificates: [
			{id: "c-1", title: "Foam Work Excellence", expiryDate: "12 Oct, 2027", status: "Valid"},
			{id: "c-2", title: "Confined Space Entry", expiryDate: "03 Feb, 2027", status: "Expires Soon"},
			{id: "c-3", title: "Working at Height", expiryDate: "18 Jun, 2025", status: "Expired"},
		],
		compliance: {
			score: {value: 4, total: 4},
			items: [
				{
					id: "background-check",
					title: "Background Check",
					status: "Not set",
					options: ["Pass", "Fail", "Pending"],
					document: {name: "pplid-53429-cert-image.png", attached: false},
					uploadable: true,
				},
				{
					id: "sst-card",
					title: "SST Card",
					status: (
						<Badge variant="successSoft" className="wwc:h-5 wwc:text-xs">
							Valid
						</Badge>
					),
					document: {name: "pplid-53429-cert-technip-energies.png", attached: false},
					fields: [{label: "Expires", value: "21 Oct 26"}],
					uploadable: true,
				},
				{
					id: "apex-id-badge",
					title: "Apex ID Badge",
					status: "Not set",
					options: ["Issued", "Denied", "Returned", "Not Required"],
					document: {name: "pplid-53429-cert-scrnli_1gpyqbbqlorfu7.png", attached: false},
					uploadable: true,
				},
				{
					id: "core-asset",
					title: "Core Asset",
					auto: true,
					status: (
						<Badge variant="successSoft" className="wwc:h-5 wwc:text-xs">
							Linked
						</Badge>
					),
					fields: [{label: "Assigned", value: "Yes · I5"}],
				},
				{
					id: "active-on-site",
					title: "Active on Site",
					auto: true,
					status: (
						<Badge variant="infoSoft" className="wwc:h-5 wwc:text-xs">
							Not on Site
						</Badge>
					),
					note: "Derived from the worker's on-site activity — not manually editable.",
				},
				{
					id: "release-tracking",
					title: "Release Tracking",
					fields: [{label: "Release Date", value: "—"}],
				},
			],
		},
		device: [
			{label: "Device ID", value: "H9435"},
			{label: "Battery Voltage", value: "3.01 V"},
		],
	},
};

/** Only the General tab has data — every other tab shows its empty state. */
export const SparseRecord: Story = {
	args: {
		general: [
			{
				fields: [
					{label: "Name", value: "ABALLA IBRAHIM"},
					{label: "Code", value: "2406901534"},
					{label: "Company", value: "TR-AIC"},
					{label: "Trade", value: "Direct-MECHANIC"},
				],
			},
		],
	},
};

/** Opened straight onto the Compliance tab — score, per-check status, choices, and documents. */
export const ComplianceFirst: Story = {
	args: {
		defaultTab: "compliance",
		compliance: {
			score: {value: 3, total: 4},
			items: [
				{
					id: "background-check",
					title: "Background Check",
					status: "Not set",
					options: ["Pass", "Fail", "Pending"],
					document: {name: "pplid-53429-cert-image.png", attached: false},
					uploadable: true,
				},
				{
					id: "sst-card",
					title: "SST Card",
					status: (
						<Badge variant="successSoft" className="wwc:h-5 wwc:text-xs">
							Valid
						</Badge>
					),
					document: {name: "pplid-53429-cert-technip-energies.png", attached: false},
					fields: [{label: "Expires", value: "21 Oct 26"}],
					uploadable: true,
				},
				{
					id: "core-asset",
					title: "Core Asset",
					auto: true,
					status: (
						<Badge variant="successSoft" className="wwc:h-5 wwc:text-xs">
							Linked
						</Badge>
					),
					fields: [{label: "Assigned", value: "Yes · I5"}],
				},
				{
					id: "active-on-site",
					title: "Active on Site",
					auto: true,
					status: (
						<Badge variant="infoSoft" className="wwc:h-5 wwc:text-xs">
							Not on Site
						</Badge>
					),
					note: "Derived from the worker's on-site activity — not manually editable.",
				},
			],
		},
	},
};

/** Opened straight onto the Certificates tab. */
export const CertificatesFirst: Story = {
	args: {
		defaultTab: "certificates",
		certificates: [
			{id: "c-1", title: "Rigging Level III", expiryDate: "22 Nov, 2026", status: "Valid"},
			{id: "c-2", title: "First Aid", expiryDate: "09 Jan, 2027", status: "Expires Soon"},
		],
	},
};

/**
 * The identity region above the tabs — worker photo, name, a subtitle line, and a slot for the
 * worker-level "⋯" menu. Omit `identity` and the widget renders the body only, exactly as before.
 */
export const WithIdentity: Story = {
	args: {
		identity: {
			photoUrl: "https://i.pravatar.cc/96?img=12",
			name: "John Doe",
			subtitle: (
				<span className="wwc:flex wwc:items-center wwc:gap-1.5">
					123423 · Aramco · Electrician
					<Badge variant="successSoft" className="wwc:h-4 wwc:text-[10px]">
						Mobilized
					</Badge>
				</span>
			),
			actions: (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="sm" icon aria-label="Worker actions">
							<Ellipsis />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem>Edit worker</DropdownMenuItem>
						<DropdownMenuItem>Replace photo</DropdownMenuItem>
						<DropdownMenuItem>Download worker card</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem className="wwc:text-destructive">Demobilize</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			),
		},
		general: [
			{
				fields: [
					{label: "Code", value: "123423"},
					{label: "Company", value: "Aramco"},
					{label: "Trade", value: "Electrician"},
					{label: "Role", value: "Supervisor"},
				],
			},
		],
	},
};

/** No photo on record — the avatar falls back to the worker's initials. */
export const IdentityWithoutPhoto: Story = {
	args: {
		identity: {name: "Aballa Ibrahim", subtitle: "2406901534 · TR-AIC · Direct-MECHANIC"},
		general: [{fields: [{label: "Blood Type", value: "AB+"}]}],
	},
};

/**
 * The Certificates tab hosting an "Add certificate" action, over records that carry a type,
 * an issue date, and a link to the attached document.
 */
export const CertificatesWithActions: Story = {
	args: {
		defaultTab: "certificates",
		certificatesActions: (
			<Button variant="outline" size="sm">
				<Plus />
				Add certificate
			</Button>
		),
		certificates: [
			{
				id: "c-1",
				title: "Working at Height — Level II",
				type: "Height Safety",
				issueDate: "18 Jun, 2025",
				expiryDate: "18 Jun, 2027",
				status: "Valid",
				document: {name: "hse-1188-height.pdf", url: "https://example.com/hse-1188-height.pdf"},
			},
			{
				id: "c-2",
				title: "Confined Space Entry",
				type: "Permit to Work",
				issueDate: "03 Feb, 2025",
				expiryDate: "03 Feb, 2027",
				status: "Expires Soon",
				document: {name: "hse-1204-confined.pdf"},
			},
			{id: "c-3", title: "Foam Work Excellence", expiryDate: "12 Oct, 2024", status: "Expired"},
		],
	},
};

/** The Device tab hosting assign / change / unassign controls at the tab level. */
export const DeviceWithActions: Story = {
	args: {
		defaultTab: "device",
		device: [
			{label: "Device ID", value: "H9435"},
			{label: "Battery Voltage", value: "3.01 V"},
			{label: "Firmware", value: "2.14.0"},
		],
		deviceActions: (
			<>
				<Button variant="outline" size="sm">
					<RefreshCw />
					Change
				</Button>
				<Button variant="ghost" size="sm">
					<Trash2 />
					Unassign
				</Button>
			</>
		),
	},
};

/** No device on record — the tab shows its empty state with the assign action still available. */
export const DeviceUnassigned: Story = {
	args: {
		defaultTab: "device",
		deviceActions: (
			<Button variant="outline" size="sm">
				<Smartphone />
				Assign device
			</Button>
		),
	},
};

/**
 * `compliance` also accepts a `ReactNode`, like crew/trainings/visits — for hosts that own their
 * compliance UI and keep the compliance data layer in the app.
 */
export const HostOwnedCompliance: Story = {
	args: {
		defaultTab: "compliance",
		compliance: (
			<div className="wwc:space-y-3">
				<div className="wwc:rounded-md wwc:border wwc:p-3">
					<p className="wwc:text-sm wwc:font-semibold">Site induction</p>
					<p className="wwc:text-xs wwc:text-muted-foreground">Completed 14 Mar, 2026 · Verified by HSE</p>
				</div>
				<Separator />
				<div className="wwc:rounded-md wwc:border wwc:p-3">
					<p className="wwc:text-sm wwc:font-semibold">Medical fitness</p>
					<p className="wwc:text-xs wwc:text-muted-foreground">Expires 02 Sep, 2026</p>
				</div>
			</div>
		),
	},
};

/** Driven from outside with `tab` + `onTabChange` — the host decides which tab is open. */
export const ControlledTabs: Story = {
	args: {},
	render: (args) => {
		const [tab, setTab] = useState<WorkerProfileTabId>("device");

		return (
			<>
				<div className="wwc:flex wwc:shrink-0 wwc:gap-2 wwc:border-b wwc:p-3">
					{(["general", "certificates", "device"] as const).map((id) => (
						<Button key={id} variant={tab === id ? "default" : "outline"} size="sm" onClick={() => setTab(id)}>
							{id}
						</Button>
					))}
				</div>
				<WorkerProfile
					{...args}
					tab={tab}
					onTabChange={setTab}
					general={[{fields: [{label: "Name", value: "John Doe"}]}]}
					certificates={[{id: "c-1", title: "Rigging Level III", expiryDate: "22 Nov, 2026", status: "Valid"}]}
					device={[{label: "Device ID", value: "H9435"}]}
				/>
			</>
		);
	},
};

/**
 * A tab-gated fetch in flight. Without `tabStates` the tab would show "No certificates found." while
 * the request is still running — an empty record and a pending one would look identical.
 */
export const TabLoading: Story = {
	args: {
		defaultTab: "certificates",
		tabStates: {certificates: {status: "loading"}},
	},
};

/** A failed fetch, stated as a failure rather than as "no data", with the host's retry attached. */
export const TabError: Story = {
	args: {
		defaultTab: "certificates",
		tabStates: {certificates: {status: "error", onRetry: () => {}}},
	},
};

/**
 * The whole lazy-tab journey the product runs: Certificates fetches when the tab is first opened,
 * fails, and recovers on Retry. Only the named tab is affected — General stays on its own data.
 */
export const LazyTabFetch: Story = {
	args: {},
	render: (args) => {
		const [state, setState] = useState<"idle" | "loading" | "error" | "loaded">("idle");

		// Stand-in for the host's fetch: fails the first time, succeeds on retry.
		const load = (succeed: boolean) => {
			setState("loading");
			setTimeout(() => setState(succeed ? "loaded" : "error"), 900);
		};

		return (
			<WorkerProfile
				{...args}
				tab="certificates"
				onTabChange={() => {}}
				general={[{fields: [{label: "Name", value: "Aballa Ibrahim"}]}]}
				certificates={
					state === "loaded"
						? [{id: "c-1", title: "Rigging Level III", expiryDate: "22 Nov, 2026", status: "Valid"}]
						: undefined
				}
				certificatesActions={
					<Button variant="outline" size="sm" onClick={() => load(false)}>
						Open tab
					</Button>
				}
				tabStates={
					state === "loading"
						? {certificates: {status: "loading"}}
						: state === "error"
							? {certificates: {status: "error", onRetry: () => load(true)}}
							: undefined
				}
			/>
		);
	},
};

/**
 * The widget's own text is overridable, so a host that does not run in English can translate the
 * strings it does not supply itself — tab names, empty and error wording, Retry, and the loading
 * announcement. Anything left out of `text` keeps its English default.
 */
export const LocalizedText: Story = {
	args: {
		defaultTab: "certificates",
		text: {
			retry: "إعادة المحاولة",
			loading: "جارٍ التحميل…",
			tabs: {
				general: {label: "عام", empty: "لا توجد تفاصيل عامة."},
				certificates: {label: "الشهادات", empty: "لا توجد شهادات.", error: "تعذر تحميل الشهادات."},
				compliance: {label: "الامتثال", empty: "لا يوجد سجل امتثال."},
				trainings: {label: "التدريبات", empty: "لا توجد سجلات تدريب."},
				device: {label: "الجهاز", empty: "لا يوجد جهاز مخصص."},
				crew: {label: "الطاقم", empty: "لا يوجد تعيين طاقم."},
				visits: {label: "الزيارات", empty: "لا توجد سجلات زيارة."},
			},
		},
	},
};

/** The same wording on a failed fetch — the error text and the Retry action are both the host's. */
export const LocalizedTabError: Story = {
	args: {
		defaultTab: "certificates",
		tabStates: {certificates: {status: "error", onRetry: () => {}}},
		text: {
			retry: "إعادة المحاولة",
			tabs: {certificates: {label: "الشهادات", error: "تعذر تحميل الشهادات."}},
		},
	},
};

/**
 * Certificate files behind the host's auth. With `onCertificateDocumentClick` the document renders
 * as a button and the host runs its own authenticated fetch-and-download — a bare `href` would open
 * to a 401. The handler wins over `url`, and works for a record that has no public URL at all.
 */
export const CertificateDocumentDownload: Story = {
	args: {
		defaultTab: "certificates",
		onCertificateDocumentClick: (certificate) => window.alert(`Host downloads ${certificate.document?.name}`),
		certificates: [
			{
				id: "c-1",
				title: "Working at Height — Level II",
				type: "Height Safety",
				issueDate: "18 Jun, 2025",
				expiryDate: "18 Jun, 2027",
				status: "Valid",
				document: {name: "hse-1188-height.pdf"},
			},
			{
				id: "c-2",
				title: "Confined Space Entry",
				expiryDate: "03 Feb, 2027",
				status: "Expires Soon",
				document: {name: "hse-1204-confined.pdf"},
			},
		],
	},
};

/**
 * Per-record actions. `certificatesActions` puts "Add certificate" in the tab header; `actions` on a
 * certificate puts edit / delete on that record's own block, beside the rows they act on.
 */
export const CertificateRowActions: Story = {
	args: {
		defaultTab: "certificates",
		certificatesActions: (
			<Button variant="outline" size="sm">
				<Plus />
				Add certificate
			</Button>
		),
		certificates: [
			{
				id: "c-1",
				title: "Rigging Level III",
				type: "Lifting",
				expiryDate: "22 Nov, 2026",
				status: "Valid",
				actions: (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="sm" icon aria-label="Certificate actions">
								<Ellipsis />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem>Edit certificate</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem className="wwc:text-destructive">Delete certificate</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				),
			},
			{
				id: "c-2",
				title: "First Aid",
				expiryDate: "09 Jan, 2027",
				status: "Expires Soon",
				actions: (
					<Button variant="ghost" size="sm" icon aria-label="Delete First Aid">
						<Trash2 />
					</Button>
				),
			},
			// A record the host cannot act on yet renders exactly as it always did.
			{id: "c-3", title: "Foam Work Excellence", expiryDate: "12 Oct, 2024", status: "Expired"},
		],
	},
};

/**
 * Compliance decisions the host owns. `onOptionChange` reports the verdict and `onUploadDocument` the
 * upload intent; the widget holds no state, so a check's segment moves only once the host writes the new
 * value back into `selectedOption`. `loading` locks a check while its save is in flight — without it a
 * controlled check looks dead between the click and the answer. `footer` carries the batched commit.
 */
export const ComplianceDecisions: Story = {
	render: () => {
		function Host() {
			const [verdict, setVerdict] = useState<Record<string, string>>({"background-check": "Pending"});
			const [saving, setSaving] = useState<string | null>(null);
			const [saved, setSaved] = useState<string | null>(null);

			const decide = (id: string) => (option: string) => {
				setSaving(id);
				// Stands in for the host's own write; the segment does not move until it lands.
				setTimeout(() => {
					setVerdict((current) => ({...current, [id]: option}));
					setSaving(null);
				}, 600);
			};

			const check = (id: string, title: string) => ({
				id,
				title,
				options: ["Pass", "Fail", "Pending"],
				selectedOption: verdict[id],
				loading: saving === id,
				onOptionChange: decide(id),
				uploadable: true,
				onUploadDocument: () => setSaved(`Picker opened for ${title}`),
			});

			return (
				<div className="wwc:h-[560px] wwc:w-[420px] wwc:border">
					<WorkerProfile
						defaultTab="compliance"
						compliance={{
							score: {value: 2, total: 3},
							items: [check("background-check", "Background Check"), check("sst-card", "SST Card")],
							footer: (
								<div className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-3">
									<span className="wwc:text-xs wwc:text-muted-foreground">{saved ?? "No pending changes"}</span>
									<Button size="sm" onClick={() => setSaved("Compliance saved")}>
										Save compliance
									</Button>
								</div>
							),
						}}
					/>
				</div>
			);
		}
		return <Host />;
	},
};
