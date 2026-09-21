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
import {useState} from "react";
import {Link} from "react-router-dom";
import {toast} from "sonner";

import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {PageContentHeader, type PageContentHeaderAction} from "@/components/ui/page-content-header";
import type {ViewTabItem} from "@/components/ui/view-tab-bar";

type NavigationTab = "runs" | "threads" | "evaluators" | "automations" | "insights";
const NAVIGATION_TABS: readonly ViewTabItem<NavigationTab>[] = [
	{id: "runs", label: "Runs"},
	{id: "threads", label: "Threads"},
	{id: "evaluators", label: "Evaluators"},
	{id: "automations", label: "Automations"},
	{id: "insights", label: "Insights", icon: Sparkles},
];

const notify = (label: string) => () => toast.success(`${label} selected`);

export function PageContentHeaderPage() {
	const [activeTab, setActiveTab] = useState<NavigationTab>("runs");
	const navigationActions: PageContentHeaderAction[] = [
		{id: "settings", label: "Settings", icon: <Settings />, onSelect: notify("Settings"), presentation: "icon"},
		{id: "retention", label: "Retention · 14d", onSelect: notify("Retention")},
		{id: "dashboard", label: "Dashboard", icon: <LayoutDashboard />, onSelect: notify("Dashboard")},
		{
			id: "notifications",
			label: "Notifications",
			icon: <Bell />,
			onSelect: notify("Notifications"),
			presentation: "icon",
		},
		{id: "new", label: "New", icon: <Plus />, onSelect: notify("New"), priority: "primary"},
	];

	return (
		<div className="wwc:space-y-8" data-wakecore-region="page-content-header-showcase">
			<div className="wwc:flex wwc:items-start wwc:justify-between wwc:gap-4">
				<div>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<h1 className="wwc:text-3xl wwc:font-bold">Page Content Header</h1>
						<CopyButton
							value="Page Content Header"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<p className="wwc:mt-2 wwc:max-w-3xl wwc:text-muted-foreground">
						A responsive route-content widget for identity, peer navigation, status, action priority, overflow, and
						split-primary workflows. Every visible control is a WakeCore artifact.
					</p>
				</div>
				<Button variant="outline" size="sm" asChild>
					<Link to="/components/view-tab-bar" data-wakecore-route-link>
						View tab primitive
					</Link>
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Navigation</CardTitle>
					<CardDescription>
						Entity identity, peer destinations, contextual actions, and one dominant creation action.
					</CardDescription>
				</CardHeader>
				<CardContent className="wwc:p-0">
					<PageContentHeader
						variant="navigation"
						instrumentationId="navigation-header"
						headingLevel={2}
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
						onTabChange={(tab) => {
							setActiveTab(tab as NavigationTab);
							toast.success(`${tab} view selected`);
						}}
						actions={navigationActions}
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Entity actions</CardTitle>
					<CardDescription>
						Identity and status stay readable while secondary controls collapse into overflow.
					</CardDescription>
				</CardHeader>
				<CardContent className="wwc:p-0">
					<PageContentHeader
						variant="entity-actions"
						instrumentationId="entity-header"
						headingLevel={2}
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
							{id: "permissions", label: "Permissions", icon: <Users />, onSelect: notify("Permissions")},
							{id: "fork", label: "Fork", icon: <GitFork />, onSelect: notify("Fork")},
							{
								id: "playground",
								label: "Playground",
								icon: <PlayCircle />,
								onSelect: notify("Playground"),
								priority: "primary",
							},
							{id: "duplicate", label: "Duplicate", onSelect: notify("Duplicate"), priority: "overflow"},
							{id: "archive", label: "Archive", onSelect: notify("Archive"), priority: "overflow"},
						]}
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Title and workflow actions</CardTitle>
					<CardDescription>
						Comfortable title hierarchy with supporting controls and a WakeCore split-primary action.
					</CardDescription>
				</CardHeader>
				<CardContent className="wwc:p-0">
					<PageContentHeader
						variant="title-actions"
						instrumentationId="title-header"
						headingLevel={2}
						title="Playground"
						description="Iterate on and test prompts."
						actions={[
							{
								id: "document",
								label: "Open document",
								icon: <FileText />,
								onSelect: notify("Document"),
								presentation: "icon",
							},
							{id: "evaluation", label: "Set up Evaluation", onSelect: notify("Evaluation")},
							{id: "reset", label: "Reset", icon: <RefreshCw />, onSelect: notify("Reset"), presentation: "icon"},
							{
								id: "credentials",
								label: "Credentials",
								icon: <KeyRound />,
								onSelect: notify("Credentials"),
								presentation: "icon",
							},
						]}
						splitAction={{
							id: "start",
							label: "Start",
							icon: <PlayCircle />,
							onSelect: notify("Start"),
							options: [
								{id: "start-new", label: "Start new run", icon: <Plus />, onSelect: notify("Start new run")},
								{
									id: "start-template",
									label: "Start from template",
									icon: <BotMessageSquare />,
									onSelect: notify("Start from template"),
								},
							],
						}}
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Responsive priority</CardTitle>
					<CardDescription>
						A constrained preview demonstrates mobile navigation and accessible action overflow.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:max-w-[720px] wwc:overflow-hidden wwc:rounded-lg wwc:border">
						<PageContentHeader
							variant="navigation"
							instrumentationId="responsive-header"
							headingLevel={2}
							title="North District"
							status={<Badge>Live</Badge>}
							tabs={NAVIGATION_TABS}
							activeTab={activeTab}
							onTabChange={(tab) => setActiveTab(tab as NavigationTab)}
							actions={navigationActions}
						/>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
