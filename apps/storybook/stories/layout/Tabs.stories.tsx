import type {Meta, StoryObj} from "storybook/internal/types";

import {Tabs, TabsContent, TabsDropdownTrigger, TabsList, TabsTrigger} from "@wakecap/core-ui/tabs";
import {Activity, Code, FileText, LifeBuoy, ListChecks, Map, Package, Sparkles} from "lucide-react";
import {useState} from "react";
import {expect, userEvent, within} from "storybook/test";

const meta = {
	title: "Components/Layout/Tabs",
	component: Tabs,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Tabbed navigation with composable sub-components: Tabs, TabsList, TabsTrigger, and TabsContent. TabsTrigger supports display variants: text, icon, and icon-text.",
			},
		},
	},
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<Tabs defaultValue="account" className="wwc:w-[400px]">
			<TabsList>
				<TabsTrigger value="account">Account</TabsTrigger>
				<TabsTrigger value="password">Password</TabsTrigger>
			</TabsList>
			<TabsContent value="account">
				<p className="wwc:text-sm wwc:text-muted-foreground">Manage your account settings and preferences.</p>
			</TabsContent>
			<TabsContent value="password">
				<p className="wwc:text-sm wwc:text-muted-foreground">Change your password and security settings.</p>
			</TabsContent>
		</Tabs>
	),
};

export const ThreeTabs: Story = {
	render: () => (
		<Tabs defaultValue="overview" className="wwc:w-[500px]">
			<TabsList>
				<TabsTrigger value="overview">Overview</TabsTrigger>
				<TabsTrigger value="analytics">Analytics</TabsTrigger>
				<TabsTrigger value="reports">Reports</TabsTrigger>
			</TabsList>
			<TabsContent value="overview">
				<p className="wwc:text-sm wwc:text-muted-foreground">High-level summary of your project.</p>
			</TabsContent>
			<TabsContent value="analytics">
				<p className="wwc:text-sm wwc:text-muted-foreground">Detailed analytics and metrics.</p>
			</TabsContent>
			<TabsContent value="reports">
				<p className="wwc:text-sm wwc:text-muted-foreground">Generated reports and exports.</p>
			</TabsContent>
		</Tabs>
	),
};

export const DisplayText: Story = {
	render: () => (
		<Tabs defaultValue="tab1" className="wwc:w-[400px]">
			<TabsList>
				<TabsTrigger value="tab1" display="text">
					Text Only
				</TabsTrigger>
				<TabsTrigger value="tab2" display="text">
					Another Tab
				</TabsTrigger>
			</TabsList>
			<TabsContent value="tab1">
				<p className="wwc:text-sm wwc:text-muted-foreground">Content for text display variant.</p>
			</TabsContent>
			<TabsContent value="tab2">
				<p className="wwc:text-sm wwc:text-muted-foreground">Another tab content.</p>
			</TabsContent>
		</Tabs>
	),
};

export const DisplayIcon: Story = {
	render: () => (
		<Tabs defaultValue="tab1" className="wwc:w-[400px]">
			<TabsList>
				<TabsTrigger value="tab1" display="icon">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
						<polyline points="9 22 9 12 15 12 15 22" />
					</svg>
				</TabsTrigger>
				<TabsTrigger value="tab2" display="icon">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<circle cx="12" cy="12" r="3" />
						<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
					</svg>
				</TabsTrigger>
			</TabsList>
			<TabsContent value="tab1">
				<p className="wwc:text-sm wwc:text-muted-foreground">Home tab content.</p>
			</TabsContent>
			<TabsContent value="tab2">
				<p className="wwc:text-sm wwc:text-muted-foreground">Settings tab content.</p>
			</TabsContent>
		</Tabs>
	),
};

export const DisplayIconText: Story = {
	render: () => (
		<Tabs defaultValue="tab1" className="wwc:w-[400px]">
			<TabsList>
				<TabsTrigger value="tab1" display="icon-text">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
						<polyline points="9 22 9 12 15 12 15 22" />
					</svg>
					Home
				</TabsTrigger>
				<TabsTrigger value="tab2" display="icon-text">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<circle cx="12" cy="12" r="3" />
						<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
					</svg>
					Settings
				</TabsTrigger>
			</TabsList>
			<TabsContent value="tab1">
				<p className="wwc:text-sm wwc:text-muted-foreground">Home tab with icon and text.</p>
			</TabsContent>
			<TabsContent value="tab2">
				<p className="wwc:text-sm wwc:text-muted-foreground">Settings tab with icon and text.</p>
			</TabsContent>
		</Tabs>
	),
};

export const DisabledTab: Story = {
	render: () => (
		<Tabs defaultValue="active" className="wwc:w-[400px]">
			<TabsList>
				<TabsTrigger value="active">Active</TabsTrigger>
				<TabsTrigger value="disabled" disabled>
					Disabled
				</TabsTrigger>
				<TabsTrigger value="another">Another</TabsTrigger>
			</TabsList>
			<TabsContent value="active">
				<p className="wwc:text-sm wwc:text-muted-foreground">This tab is active.</p>
			</TabsContent>
			<TabsContent value="another">
				<p className="wwc:text-sm wwc:text-muted-foreground">This tab is also available.</p>
			</TabsContent>
		</Tabs>
	),
};

export const SwitchInteraction: Story = {
	render: () => (
		<Tabs defaultValue="first" className="wwc:w-[400px]">
			<TabsList>
				<TabsTrigger value="first">First</TabsTrigger>
				<TabsTrigger value="second">Second</TabsTrigger>
			</TabsList>
			<TabsContent value="first">
				<p>First tab content</p>
			</TabsContent>
			<TabsContent value="second">
				<p>Second tab content</p>
			</TabsContent>
		</Tabs>
	),
	play: async ({canvasElement}) => {
		const canvas = within(canvasElement);

		await expect(canvas.getByText("First tab content")).toBeVisible();

		const secondTab = canvas.getByRole("tab", {name: /second/i});
		await userEvent.click(secondTab);

		await expect(canvas.getByText("Second tab content")).toBeVisible();
	},
};

export const Underline: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Underline variant: text-only triggers with a full-width bottom strip and a thick underline on the active tab. Set `variant="underline"` on the root `Tabs`.',
			},
		},
	},
	render: () => (
		<Tabs variant="underline" defaultValue="all" className="wwc:w-[640px]">
			<TabsList>
				<TabsTrigger value="all">All integrations</TabsTrigger>
				<TabsTrigger value="support">Support</TabsTrigger>
				<TabsTrigger value="codebase">Codebase</TabsTrigger>
				<TabsTrigger value="product">Product</TabsTrigger>
			</TabsList>
			<TabsContent value="all">
				<p className="wwc:text-sm wwc:text-muted-foreground">Browse every available integration.</p>
			</TabsContent>
			<TabsContent value="support">
				<p className="wwc:text-sm wwc:text-muted-foreground">Helpdesk and ticketing tools.</p>
			</TabsContent>
			<TabsContent value="codebase">
				<p className="wwc:text-sm wwc:text-muted-foreground">Source control, code search, CI.</p>
			</TabsContent>
			<TabsContent value="product">
				<p className="wwc:text-sm wwc:text-muted-foreground">Roadmapping and analytics tools.</p>
			</TabsContent>
		</Tabs>
	),
};

const PROGRESS_ITEMS = [
	{value: "progress", label: "Progress"},
	{value: "work-done", label: "Work done"},
	{value: "variance", label: "Variance"},
];

const REPORTS_ITEMS = [
	{value: "milestone", label: "Milestone report"},
	{value: "weekly", label: "Weekly summary"},
	{value: "trade-breakdown", label: "Trade breakdown"},
];

function CaptureHeaderTabs() {
	const [tab, setTab] = useState("site");
	const [progressSub, setProgressSub] = useState("progress");
	const [reportsSub, setReportsSub] = useState("milestone");

	return (
		<div className="wwc:w-[720px] wwc:border-b wwc:border-border wwc:bg-card wwc:px-3">
			<Tabs variant="underline" value={tab} onValueChange={setTab}>
				<TabsList>
					<TabsTrigger value="site" display="icon-text">
						<Map className="wwc:size-3.5" />
						Site
					</TabsTrigger>
					<TabsTrigger value="progress-details" display="icon-text">
						<Activity className="wwc:size-3.5" />
						Progress Details
					</TabsTrigger>
					<TabsDropdownTrigger
						value="progress-work-done"
						items={PROGRESS_ITEMS}
						activeItem={progressSub}
						onSelect={(value) => {
							setTab("progress-work-done");
							setProgressSub(value);
						}}
					>
						<ListChecks className="wwc:size-3.5" />
						Progress work done
					</TabsDropdownTrigger>
					<TabsDropdownTrigger
						value="reports"
						items={REPORTS_ITEMS}
						activeItem={reportsSub}
						onSelect={(value) => {
							setTab("reports");
							setReportsSub(value);
						}}
					>
						<FileText className="wwc:size-3.5" />
						Reports
					</TabsDropdownTrigger>
				</TabsList>
			</Tabs>
		</div>
	);
}

export const DropdownTab: Story = {
	parameters: {
		controls: {disable: true},
		docs: {
			description: {
				story:
					"`TabsDropdownTrigger` is a tab that opens a dropdown of sub-views. Clicking it activates the tab (like any `TabsTrigger`) and opens the menu; selecting a sub-item fires `onSelect`. It inherits the surrounding `underline` variant, so it sits flush next to plain triggers. This recreates the Capture app header, where **Progress work done** and **Reports** are dropdown tabs.",
			},
		},
	},
	render: () => <CaptureHeaderTabs />,
};

const SIZE_TRIGGERS = (
	<>
		<TabsTrigger value="all">All integrations</TabsTrigger>
		<TabsTrigger value="support">Support</TabsTrigger>
		<TabsTrigger value="codebase">Codebase</TabsTrigger>
		<TabsTrigger value="product">Product</TabsTrigger>
	</>
);

export const UnderlineSizes: Story = {
	parameters: {
		docs: {
			description: {
				story: 'Underline variant in three sizes (`size="sm" | "md" | "lg"`).',
			},
		},
	},
	render: () => (
		<div className="wwc:flex wwc:flex-col wwc:gap-10 wwc:w-[640px]">
			<div className="wwc:flex wwc:flex-col wwc:gap-2">
				<span className="wwc:text-xs wwc:font-medium wwc:text-muted-foreground">Small</span>
				<Tabs variant="underline" size="sm" defaultValue="all">
					<TabsList>{SIZE_TRIGGERS}</TabsList>
				</Tabs>
			</div>
			<div className="wwc:flex wwc:flex-col wwc:gap-2">
				<span className="wwc:text-xs wwc:font-medium wwc:text-muted-foreground">Medium (default)</span>
				<Tabs variant="underline" size="md" defaultValue="all">
					<TabsList>{SIZE_TRIGGERS}</TabsList>
				</Tabs>
			</div>
			<div className="wwc:flex wwc:flex-col wwc:gap-2">
				<span className="wwc:text-xs wwc:font-medium wwc:text-muted-foreground">Large</span>
				<Tabs variant="underline" size="lg" defaultValue="all">
					<TabsList>{SIZE_TRIGGERS}</TabsList>
				</Tabs>
			</div>
		</div>
	),
};

const DEFAULT_TRIGGERS = (
	<>
		<TabsTrigger value="account">Account</TabsTrigger>
		<TabsTrigger value="password">Password</TabsTrigger>
		<TabsTrigger value="settings">Settings</TabsTrigger>
	</>
);

export const UnderlineWithIcons: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Underline variant with a leading icon on each trigger. Use `display="icon-text"` and place the icon as the first child.',
			},
		},
	},
	render: () => (
		<Tabs variant="underline" defaultValue="all" className="wwc:w-[640px]">
			<TabsList>
				<TabsTrigger value="all" display="icon-text">
					<Sparkles className="wwc:h-4 wwc:w-4" />
					All integrations
				</TabsTrigger>
				<TabsTrigger value="support" display="icon-text">
					<LifeBuoy className="wwc:h-4 wwc:w-4" />
					Support
				</TabsTrigger>
				<TabsTrigger value="codebase" display="icon-text">
					<Code className="wwc:h-4 wwc:w-4" />
					Codebase
				</TabsTrigger>
				<TabsTrigger value="product" display="icon-text">
					<Package className="wwc:h-4 wwc:w-4" />
					Product
				</TabsTrigger>
			</TabsList>
			<TabsContent value="all">
				<p className="wwc:text-sm wwc:text-muted-foreground">Browse every available integration.</p>
			</TabsContent>
			<TabsContent value="support">
				<p className="wwc:text-sm wwc:text-muted-foreground">Helpdesk and ticketing tools.</p>
			</TabsContent>
			<TabsContent value="codebase">
				<p className="wwc:text-sm wwc:text-muted-foreground">Source control, code search, CI.</p>
			</TabsContent>
			<TabsContent value="product">
				<p className="wwc:text-sm wwc:text-muted-foreground">Roadmapping and analytics tools.</p>
			</TabsContent>
		</Tabs>
	),
};

export const DefaultSizes: Story = {
	parameters: {
		docs: {
			description: {
				story: 'Default rounded variant in three sizes (`size="sm" | "md" | "lg"`).',
			},
		},
	},
	render: () => (
		<div className="wwc:flex wwc:flex-col wwc:gap-6">
			<div className="wwc:flex wwc:flex-col wwc:gap-2">
				<span className="wwc:text-xs wwc:font-medium wwc:text-muted-foreground">Small</span>
				<Tabs size="sm" defaultValue="account">
					<TabsList>{DEFAULT_TRIGGERS}</TabsList>
				</Tabs>
			</div>
			<div className="wwc:flex wwc:flex-col wwc:gap-2">
				<span className="wwc:text-xs wwc:font-medium wwc:text-muted-foreground">Medium (default)</span>
				<Tabs size="md" defaultValue="account">
					<TabsList>{DEFAULT_TRIGGERS}</TabsList>
				</Tabs>
			</div>
			<div className="wwc:flex wwc:flex-col wwc:gap-2">
				<span className="wwc:text-xs wwc:font-medium wwc:text-muted-foreground">Large</span>
				<Tabs size="lg" defaultValue="account">
					<TabsList>{DEFAULT_TRIGGERS}</TabsList>
				</Tabs>
			</div>
		</div>
	),
};
