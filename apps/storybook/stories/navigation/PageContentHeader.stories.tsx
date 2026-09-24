import type {ViewTabItem} from "@corensystem/coren-ui/view-tab-bar";
import type {Meta, StoryObj} from "storybook/internal/types";

import {Avatar, AvatarFallback} from "@corensystem/coren-ui/avatar";
import {Badge} from "@corensystem/coren-ui/badge";
import {PageContentHeader, type PageContentHeaderAction} from "@corensystem/coren-ui/page-content-header";
import {
	Bell,
	BotMessageSquare,
	FileText,
	GitFork,
	KeyRound,
	LayoutDashboard,
	Link2,
	Lock,
	PlayCircle,
	Plus,
	RefreshCw,
	Settings,
	Sparkles,
	Users,
} from "lucide-react";
import {type ReactNode, useState} from "react";

const meta = {
	title: "Widgets/Navigation/Page Content Header",
	component: PageContentHeader,
	tags: ["autodocs"],
	excludeStories: ["coreInventory"],
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"Responsive route-content header composed from Core ViewTabBar, Button, ButtonGroup, DropdownMenu, Tooltip, Avatar, and Badge artifacts.",
			},
		},
	},
} satisfies Meta<typeof PageContentHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const coreInventory = {
	templates: [],
	widgets: [],
	components: ["Avatar", "Badge", "Button", "ButtonGroup", "DropdownMenu", "Tooltip", "ViewTabBar"],
	tokens: ["color.background.surface"],
};

type NavigationTab = "runs" | "threads" | "evaluators" | "automations" | "insights";
const NAVIGATION_TABS: readonly ViewTabItem<NavigationTab>[] = [
	{id: "runs", label: "Runs"},
	{id: "threads", label: "Threads"},
	{id: "evaluators", label: "Evaluators"},
	{id: "automations", label: "Automations"},
	{id: "insights", label: "Insights", icon: Sparkles},
];

function StorySurface({children}: {children: ReactNode}) {
	return (
		<div
			data-core-shell="storybook-component-evaluation"
			data-core-density="comfortable"
			data-core-brand="core"
			data-core-provider-owner="storybook-preview"
			className="wwc:h-dvh wwc:overflow-hidden"
		>
			<main data-core-content-scroll className="wwc:h-full wwc:min-h-0 wwc:overflow-auto">
				{children}
			</main>
		</div>
	);
}

function NavigationHeaderExample({width}: {width?: number}) {
	const [activeTab, setActiveTab] = useState<NavigationTab>("runs");
	const actions: PageContentHeaderAction[] = [
		{id: "settings", label: "Settings", icon: <Settings />, onSelect: () => undefined, presentation: "icon"},
		{id: "retention", label: "Retention · 14d", onSelect: () => undefined},
		{id: "dashboard", label: "Dashboard", icon: <LayoutDashboard />, onSelect: () => undefined},
		{id: "notifications", label: "Notifications", icon: <Bell />, onSelect: () => undefined, presentation: "icon"},
		{id: "new", label: "New", icon: <Plus />, onSelect: () => undefined, priority: "primary"},
	];

	return (
		<div style={width ? {width, maxWidth: "100%"} : undefined}>
			<PageContentHeader
				variant="navigation"
				title="ASMobbin"
				avatar={
					<Avatar>
						<AvatarFallback>AM</AvatarFallback>
					</Avatar>
				}
				status={
					<Badge variant="secondary" className="wwc:gap-1">
						ID <Link2 />
					</Badge>
				}
				tabs={NAVIGATION_TABS}
				activeTab={activeTab}
				onTabChange={setActiveTab}
				actions={actions}
			/>
		</div>
	);
}

export const Navigation: Story = {
	render: () => (
		<StorySurface>
			<NavigationHeaderExample />
		</StorySurface>
	),
};

export const EntityActions: Story = {
	render: () => (
		<StorySurface>
			<PageContentHeader
				variant="entity-actions"
				title="uiux_consultant"
				avatar={
					<Avatar>
						<AvatarFallback>UI</AvatarFallback>
					</Avatar>
				}
				status={
					<Badge variant="secondary" className="wwc:gap-1">
						<Lock /> Private
					</Badge>
				}
				actions={[
					{id: "permissions", label: "Permissions", icon: <Users />, onSelect: () => undefined},
					{id: "fork", label: "Fork", icon: <GitFork />, onSelect: () => undefined},
					{id: "playground", label: "Playground", icon: <PlayCircle />, onSelect: () => undefined, priority: "primary"},
					{id: "duplicate", label: "Duplicate", onSelect: () => undefined, priority: "overflow"},
					{id: "archive", label: "Archive", onSelect: () => undefined, priority: "overflow"},
				]}
			/>
		</StorySurface>
	),
};

export const TitleActions: Story = {
	render: () => (
		<StorySurface>
			<PageContentHeader
				variant="title-actions"
				title="Playground"
				description="Iterate on and test prompts."
				actions={[
					{id: "document", label: "Open document", icon: <FileText />, onSelect: () => undefined, presentation: "icon"},
					{id: "evaluation", label: "Set up Evaluation", onSelect: () => undefined},
					{id: "reset", label: "Reset", icon: <RefreshCw />, onSelect: () => undefined, presentation: "icon"},
					{
						id: "credentials",
						label: "Credentials",
						icon: <KeyRound />,
						onSelect: () => undefined,
						presentation: "icon",
					},
				]}
				splitAction={{
					id: "start",
					label: "Start",
					icon: <PlayCircle />,
					onSelect: () => undefined,
					options: [
						{id: "start-new", label: "Start new run", icon: <Plus />, onSelect: () => undefined},
						{id: "start-template", label: "Start from template", icon: <BotMessageSquare />, onSelect: () => undefined},
					],
				}}
			/>
		</StorySurface>
	),
};

export const CompactResponsive: Story = {
	render: () => (
		<StorySurface>
			<NavigationHeaderExample width={720} />
		</StorySurface>
	),
};
