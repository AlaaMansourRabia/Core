import type {Meta, StoryObj} from "storybook/internal/types";

import {BrowserTabs, type BrowserTabItem} from "@wakecap/core-ui/browser-tabs";
import {Activity, BarChart3, FileText, Folder, Settings} from "lucide-react";
import {useState} from "react";

const meta = {
	title: "Components/Layout/BrowserTabs",
	component: BrowserTabs,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Browser-style tab strip with concave (inverted) bottom corners that flow seamlessly into the content panel placed below. Supports controlled and uncontrolled active tab, closeable tabs, icons, and a trailing slot. Concave corners are rendered with masked `bg-background` squares so they work cross-browser (Chrome / Firefox / Safari) and respect dark mode.",
			},
		},
	},
} satisfies Meta<typeof BrowserTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseTabs: BrowserTabItem[] = [
	{id: "dashboard", label: "Dashboard"},
	{id: "analytics", label: "Analytics"},
	{id: "files", label: "Files"},
	{id: "reports", label: "Reports"},
];

const ContentPanel = ({children}: {children: React.ReactNode}) => (
	<div className="wwc:rounded-b-lg wwc:border wwc:border-t-0 wwc:border-border wwc:bg-background wwc:p-6 wwc:text-sm">
		{children}
	</div>
);

export const Default: Story = {
	render: () => (
		<div className="wwc:w-[640px]">
			<BrowserTabs tabs={baseTabs} className="wwc:rounded-t-lg" />
			<ContentPanel>
				<p className="wwc:text-muted-foreground">
					The active tab and this content panel form a single connected surface — note the seamless concave corners.
				</p>
			</ContentPanel>
		</div>
	),
};

export const Closeable: Story = {
	render: () => {
		function CloseableDemo() {
			const [tabs, setTabs] = useState<BrowserTabItem[]>([
				{id: "dashboard", label: "Dashboard"},
				{id: "analytics", label: "Analytics"},
				{id: "files", label: "Files"},
				{id: "reports", label: "Reports"},
			]);
			const [activeId, setActiveId] = useState<string | undefined>("dashboard");

			const handleClose = (id: string) => {
				setTabs((prev) => {
					const idx = prev.findIndex((t) => t.id === id);
					const next = prev.filter((t) => t.id !== id);
					if (activeId === id) {
						const fallback = next[Math.max(0, idx - 1)];
						setActiveId(fallback?.id);
					}
					return next;
				});
			};

			return (
				<div className="wwc:w-[640px]">
					<BrowserTabs
						tabs={tabs}
						activeId={activeId}
						onActiveChange={setActiveId}
						onTabClose={handleClose}
						closeable
						className="wwc:rounded-t-lg"
					/>
					<ContentPanel>
						{tabs.length === 0 ? (
							<p className="wwc:text-muted-foreground">No tabs open.</p>
						) : (
							<p className="wwc:text-muted-foreground">Click the × on a tab to close it.</p>
						)}
					</ContentPanel>
				</div>
			);
		}
		return <CloseableDemo />;
	},
};

export const WithIcons: Story = {
	render: () => {
		const tabs: BrowserTabItem[] = [
			{id: "dashboard", label: "Dashboard", icon: <BarChart3 className="wwc:h-3.5 wwc:w-3.5" />},
			{id: "analytics", label: "Analytics", icon: <Activity className="wwc:h-3.5 wwc:w-3.5" />},
			{id: "files", label: "Files", icon: <Folder className="wwc:h-3.5 wwc:w-3.5" />},
			{id: "reports", label: "Reports", icon: <FileText className="wwc:h-3.5 wwc:w-3.5" />},
			{id: "settings", label: "Settings", icon: <Settings className="wwc:h-3.5 wwc:w-3.5" />, disabled: true},
		];
		return (
			<div className="wwc:w-[720px]">
				<BrowserTabs tabs={tabs} className="wwc:rounded-t-lg" />
				<ContentPanel>
					<p className="wwc:text-muted-foreground">Tabs with leading icons. The Settings tab is disabled.</p>
				</ContentPanel>
			</div>
		);
	},
};

export const Controlled: Story = {
	render: () => {
		function ControlledDemo() {
			const [activeId, setActiveId] = useState("analytics");
			const tabs: BrowserTabItem[] = [
				{id: "dashboard", label: "Dashboard", icon: <BarChart3 className="wwc:h-3.5 wwc:w-3.5" />},
				{id: "analytics", label: "Analytics", icon: <Activity className="wwc:h-3.5 wwc:w-3.5" />},
				{id: "files", label: "Files", icon: <Folder className="wwc:h-3.5 wwc:w-3.5" />},
			];
			const labels: Record<string, string> = {
				dashboard: "Overview of KPIs and recent activity.",
				analytics: "Detailed metrics, trends, and breakdowns over time.",
				files: "Browse and manage project documents and assets.",
			};
			return (
				<div className="wwc:flex wwc:w-[640px] wwc:flex-col wwc:gap-3">
					<div className="wwc:flex wwc:gap-2">
						{tabs.map((t) => (
							<button
								key={t.id}
								type="button"
								onClick={() => setActiveId(t.id)}
								className="wwc:rounded wwc:border wwc:border-border wwc:px-2 wwc:py-1 wwc:text-xs"
							>
								Activate {t.label}
							</button>
						))}
					</div>
					<div>
						<BrowserTabs tabs={tabs} activeId={activeId} onActiveChange={setActiveId} className="wwc:rounded-t-lg" />
						<ContentPanel>
							<p className="wwc:text-muted-foreground">{labels[activeId]}</p>
						</ContentPanel>
					</div>
					<p className="wwc:text-xs wwc:text-muted-foreground">Active id: {activeId}</p>
				</div>
			);
		}
		return <ControlledDemo />;
	},
};
