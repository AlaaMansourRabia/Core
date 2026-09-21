import {
	ClipboardList,
	FileText,
	HardHat,
	LayoutGrid,
	Map,
	Plus,
	Settings,
	ShieldAlert,
	Sparkles,
	Users,
} from "lucide-react";
import {useRef, useState} from "react";

import {Empty} from "../empty";
import {FloatingAssistant} from "../floating-assistant";
import {CoreAppSidebar, type SidebarNavGroup} from "../navigation/core-app-sidebar";
import {CoreAppTopBar} from "../navigation/core-app-top-bar";
import {PageContentHeader} from "../page-content-header";
import type {PromptAttachment} from "../prompt-input";
import type {Message} from "../types/chat";
import {usePersistentState} from "../use-persistent-state";
import type {ViewTabItem} from "../view-tab-bar";
import {PermitTemplatesView} from "./work-permit-templates";

// Work Permit — the permit-management template scaffold. Same shell as Workforce
// (CoreAppSidebar + CoreAppTopBar + PageContentHeader) with a single "Work Permits" sidebar entry
// and a route header carrying five tabs — Dashboard, Work Permits, Templates, Map, AI Agent — plus a
// Settings gear on the far right.
//
// Templates is the one tab with a real surface: PermitTemplatesView (work-permit-templates.tsx), the
// versioned template register, built to the same shape as the Workforce Crews list. Every OTHER tab
// body is still a placeholder naming what belongs in it, so the scaffold reads as a plan rather than
// as something broken.
//
// Settings is the far-right icon ACTION, not a sixth tab, which is where Safety Manager and Workforce
// both put it. The tabs are the permit WORK — where a permit is, what it looks like on the map, what
// the register holds — and configuration is not one of those; sitting in the row it made the strip
// read as six peers when it is five and a lever. It still opens as a full body, exactly as the tabs
// do, so nothing about the surface itself changed.

// Items the assistant's "Add context" picker offers — demo data, like the sessions below.
const PERMIT_CONTEXT = [
	{
		id: "ctx-open-permits",
		label: "Open permits — Uptown Tower",
		description: "42 active, 6 expiring",
		icon: <ClipboardList className="wwc:h-3.5 wwc:w-3.5" />,
	},
	{
		id: "ctx-hot-work-template",
		label: "Hot Work Permit v4",
		description: "Published template",
		icon: <FileText className="wwc:h-3.5 wwc:w-3.5" />,
	},
	{
		id: "ctx-isolation-register",
		label: "Isolation register",
		description: "Electrical + mechanical locks",
		icon: <ShieldAlert className="wwc:h-3.5 wwc:w-3.5" />,
	},
	{
		id: "ctx-signed-on",
		label: "Workers signed on today",
		description: "318 across 27 permits",
		icon: <Users className="wwc:h-3.5 wwc:w-3.5" />,
	},
	{
		id: "ctx-competency",
		label: "Competency matrix",
		description: "Confined-space entrants",
		icon: <HardHat className="wwc:h-3.5 wwc:w-3.5" />,
	},
];

// Past assistant conversations — demo data, like everything else this template renders.
const PERMIT_SESSIONS = [
	{id: "wp-s1", name: "Hot work near Tank 3", preview: "Two permits awaiting approval", updatedAt: "1h ago"},
	{id: "wp-s2", name: "Confined-space template v3", preview: "Gas-test step added", updatedAt: "Yesterday"},
	{id: "wp-s3", name: "Expiring permits — Uptown", preview: "6 expire before Friday", updatedAt: "Tue"},
];

type WorkPermitTabId = "dashboard" | "work-permits" | "templates" | "map" | "ai-agent" | "settings";

const NAV_GROUPS: SidebarNavGroup[] = [{items: [{id: "work-permits", label: "Work Permits", icon: ClipboardList}]}];

// Projects for the top-bar switcher (sample fixtures). Shares the `wc3.project` key with the other
// templates, so switching project in one and opening another keeps the same selection.
const PROJECTS = ["Uptown Tower", "Marina Heights", "Riyadh Metro — Line 3", "NEOM Site 4", "Jeddah Waterfront"];

const TABS: ViewTabItem<WorkPermitTabId>[] = [
	{id: "dashboard", label: "Dashboard", icon: LayoutGrid},
	{id: "work-permits", label: "Work Permits", icon: ClipboardList},
	{id: "templates", label: "Templates", icon: FileText},
	{id: "map", label: "Map", icon: Map},
	// The badge is the tab's own affordance rather than a disabled state: the tab still opens and
	// says what is coming, which is more use than a control that refuses to respond.
	{id: "ai-agent", label: "AI Agent", icon: Sparkles, badge: "SOON"},
];

const TAB_PLACEHOLDER: Record<WorkPermitTabId, {title: string; description: string; icon: React.ReactNode}> = {
	dashboard: {
		title: "Dashboard",
		description: "Permit volumes, approval turnaround and what is currently blocking work will appear here.",
		icon: <LayoutGrid className="wwc:h-6 wwc:w-6" />,
	},
	"work-permits": {
		title: "Work Permits",
		description: "The permit register — every permit, its state and who holds it — will appear here.",
		icon: <ClipboardList className="wwc:h-6 wwc:w-6" />,
	},
	templates: {
		title: "Templates",
		description: "Reusable permit definitions — the form, the workflow and the rules each permit type carries.",
		icon: <FileText className="wwc:h-6 wwc:w-6" />,
	},
	map: {
		title: "Map",
		description: "Permits placed on the site map, so a zone shows what is authorised inside it.",
		icon: <Map className="wwc:h-6 wwc:w-6" />,
	},
	"ai-agent": {
		title: "AI Agent",
		description: "Coming soon — an assistant that drafts permits, checks them against the rules and chases approvals.",
		icon: <Sparkles className="wwc:h-6 wwc:w-6" />,
	},
	settings: {
		title: "Settings",
		description: "Permit types, approval chains, validity windows and notification rules will appear here.",
		icon: <Settings className="wwc:h-6 wwc:w-6" />,
	},
};

// Settings is not in TABS, so the breadcrumb has to name it from the placeholder rather than the tab
// row. Everything else resolves out of TABS as before.
const tabLabel = (id: WorkPermitTabId) => TABS.find((tab) => tab.id === id)?.label ?? TAB_PLACEHOLDER[id].title;

/**
 * Work Permit template scaffold. Renders its own app shell and a route header whose five tabs —
 * Dashboard, Work Permits, Templates, Map, AI Agent — plus a far-right Settings gear all open
 * placeholders for now.
 *
 * @deprecated Preview/demo prototype — renders built-in sample data and mock handlers. Not a
 * supported production import: compose your page from the widgets this template uses, wired to your
 * own data (see the CoreWorkPermit template docs in Storybook). Slated for removal from the public
 * API in a future major.
 */
export function WorkPermit() {
	// Persisted so a reload keeps the same tab and selected project — same wiring as Workforce.
	const [activeTab, setActiveTab] = usePersistentState<WorkPermitTabId>("wc3.work-permit.tab", "dashboard");
	const [project, setProject] = usePersistentState<string>("wc3.project", PROJECTS[0]);
	// Mobile navigation drawer — the top-bar hamburger opens the sidebar as a left sheet.
	const [navOpen, setNavOpen] = useState(false);

	const placeholder = TAB_PLACEHOLDER[activeTab];

	// Floating permit assistant. Canned replies, like the rest of this preview template.
	const [chatOpen, setChatOpen] = useState(false);
	const [messages, setMessages] = useState<Message[]>([]);
	const [chatLoading, setChatLoading] = useState(false);
	// Untitled until the conversation names it; editable by hand in the meantime.
	const [sessionName, setSessionName] = useState("");
	const [activeSessionId, setActiveSessionId] = useState<string | undefined>(undefined);
	const msgId = useRef(0);
	const nextId = () => `m${(msgId.current += 1)}`;

	// `attachments` is the second argument of onSendMessage — carry it onto the user message, or the
	// composer clears and what was attached is lost.
	const handleAssistantSend = async (content: string, attachments?: PromptAttachment[]) => {
		setMessages((prev) => [
			...prev,
			{
				id: nextId(),
				role: "user",
				type: "text",
				content,
				timestamp: new Date(),
				attachments: attachments && attachments.length > 0 ? attachments : undefined,
			},
		]);
		setChatLoading(true);
		await new Promise((r) => setTimeout(r, 550));
		setMessages((prev) => [
			...prev,
			{
				id: nextId(),
				role: "assistant",
				type: "text",
				content: `You asked: “${content}”. This template ships canned replies — wire onSendMessage to your permit backend for real answers.`,
				timestamp: new Date(),
			},
		]);
		setChatLoading(false);
	};

	return (
		<div className="wwc:flex wwc:h-full wwc:min-h-0 wwc:bg-background wwc:text-foreground">
			<CoreAppSidebar
				viewLevel="org"
				orgGroups={NAV_GROUPS}
				activeItemId="work-permits"
				showSearch={false}
				showNotifications={false}
				mobileOpen={navOpen}
				onMobileOpenChange={setNavOpen}
			/>

			<div className="wwc:relative wwc:flex wwc:min-w-0 wwc:flex-1 wwc:flex-col">
				<CoreAppTopBar
					activeLabel={`Work Permits / ${tabLabel(activeTab)}`}
					showProjectSwitcher
					projects={PROJECTS}
					selectedProject={project}
					onSelectProject={setProject}
					showNotifications
					notificationCount={3}
					onMenuClick={() => setNavOpen(true)}
				/>

				{/*
				 * The assistant docks inside the content area, so the shell chrome (sidebar, top bar) stays put
				 * and only the permit surface narrows when the panel opens.
				 */}
				<main className="wwc:relative wwc:flex wwc:min-h-0 wwc:flex-1 wwc:flex-col wwc:overflow-hidden">
					<FloatingAssistant
						open={chatOpen}
						onOpenChange={setChatOpen}
						messages={messages}
						onMessagesChange={setMessages}
						onSendMessage={handleAssistantSend}
						isLoading={chatLoading}
						triggerLabel="Open permit assistant"
						availableContext={PERMIT_CONTEXT}
						onUploadFile={(files) => console.log("permit assistant upload", files)}
						contextNote={`Using this page as context — Work Permits / ${tabLabel(activeTab)}`}
						sessionName={sessionName}
						onSessionNameChange={setSessionName}
						sessionNamePlaceholder="New chat"
						headerActions={[
							{
								id: "new-chat",
								label: "New chat",
								icon: <Plus />,
								onSelect: () => {
									setMessages([]);
									setChatLoading(false);
									setSessionName("");
									setActiveSessionId(undefined);
								},
							},
						]}
						sessions={PERMIT_SESSIONS}
						activeSessionId={activeSessionId}
						onSelectSession={(id) => {
							setActiveSessionId(id);
							setSessionName(PERMIT_SESSIONS.find((x) => x.id === id)?.name ?? "");
						}}
						title="Permit assistant"
						subtitle="Ask about permit status, templates, approvals, or who is on site under a permit."
						placeholder="Ask about permits…"
						suggestedPrompts={[
							"Which permits expire today?",
							"Show hot-work permits awaiting approval",
							"What changed in the confined-space template?",
							"Who is signed on under permit WP-1042?",
						]}
					>
						<div className="wwc:flex wwc:h-full wwc:min-h-0 wwc:flex-col">
							<PageContentHeader
								variant="navigation"
								title="Work Permits"
								tabs={TABS}
								activeTab={activeTab}
								onTabChange={(tab) => setActiveTab(tab as WorkPermitTabId)}
								// Far right, as an icon, the way Safety Manager and Workforce both carry theirs. While it
								// is open no tab is active — "settings" is not one of them — which is the honest state:
								// the gear took you off the tab row rather than to another stop on it.
								actions={[
									{
										id: "settings",
										label: "Settings",
										icon: <Settings className="wwc:h-4 wwc:w-4" />,
										presentation: "icon",
										priority: "persistent",
										onSelect: () => setActiveTab("settings"),
									},
								]}
							/>

							{activeTab === "templates" ? (
								<PermitTemplatesView />
							) : (
								<div className="wwc:min-h-0 wwc:flex-1 wwc:overflow-auto">
									<div className="wwc:mx-auto wwc:w-full wwc:max-w-[1200px] wwc:p-6">
										<div className="wwc:flex wwc:min-h-[320px] wwc:items-center wwc:justify-center">
											<Empty icon={placeholder.icon} title={placeholder.title} description={placeholder.description} />
										</div>
									</div>
								</div>
							)}
						</div>
					</FloatingAssistant>
				</main>
			</div>
		</div>
	);
}
