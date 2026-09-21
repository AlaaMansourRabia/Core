import {Activity, BarChart3, FileText, Folder, Settings} from "lucide-react";
import {useState} from "react";

import {type BrowserTabItem, BrowserTabs} from "@/components/ui/browser-tabs";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";

const baseTabs: BrowserTabItem[] = [
	{id: "dashboard", label: "Dashboard"},
	{id: "analytics", label: "Analytics"},
	{id: "files", label: "Files"},
	{id: "reports", label: "Reports"},
];

function ContentPanel({children}: {children: React.ReactNode}) {
	return (
		<div className="wwc:rounded-b-lg wwc:border wwc:border-t-0 wwc:border-border wwc:bg-background wwc:p-6 wwc:text-sm">
			{children}
		</div>
	);
}

function CloseableExample() {
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
		<div className="wwc:w-full wwc:max-w-[640px]">
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

function ControlledExample() {
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
		<div className="wwc:flex wwc:w-full wwc:max-w-[640px] wwc:flex-col wwc:gap-3">
			<div className="wwc:flex wwc:flex-wrap wwc:gap-2">
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

export function BrowserTabsPage() {
	const iconTabs: BrowserTabItem[] = [
		{id: "dashboard", label: "Dashboard", icon: <BarChart3 className="wwc:h-3.5 wwc:w-3.5" />},
		{id: "analytics", label: "Analytics", icon: <Activity className="wwc:h-3.5 wwc:w-3.5" />},
		{id: "files", label: "Files", icon: <Folder className="wwc:h-3.5 wwc:w-3.5" />},
		{id: "reports", label: "Reports", icon: <FileText className="wwc:h-3.5 wwc:w-3.5" />},
		{id: "settings", label: "Settings", icon: <Settings className="wwc:h-3.5 wwc:w-3.5" />, disabled: true},
	];

	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Browser Tabs</h1>
					<CopyButton
						value="Browser Tabs"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Browser-style tab strip with concave (inverted) bottom corners that flow seamlessly into the content panel
					placed below.
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Default</CardTitle>
						<CopyButton
							value="Browser Tabs - Default"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>The active tab and content panel form a single connected surface.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:w-full wwc:max-w-[640px]">
						<BrowserTabs tabs={baseTabs} className="wwc:rounded-t-lg" />
						<ContentPanel>
							<p className="wwc:text-muted-foreground">Note the seamless concave corners.</p>
						</ContentPanel>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Closeable</CardTitle>
						<CopyButton
							value="Browser Tabs - Closeable"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Tabs with close affordance. Controlled with onTabClose.</CardDescription>
				</CardHeader>
				<CardContent>
					<CloseableExample />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>With Icons</CardTitle>
						<CopyButton
							value="Browser Tabs - With Icons"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Tabs with leading icons. The Settings tab is disabled.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:w-full wwc:max-w-[720px]">
						<BrowserTabs tabs={iconTabs} className="wwc:rounded-t-lg" />
						<ContentPanel>
							<p className="wwc:text-muted-foreground">Tabs with leading icons.</p>
						</ContentPanel>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Controlled</CardTitle>
						<CopyButton
							value="Browser Tabs - Controlled"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Drive the active tab from outside the component.</CardDescription>
				</CardHeader>
				<CardContent>
					<ControlledExample />
				</CardContent>
			</Card>
		</div>
	);
}
