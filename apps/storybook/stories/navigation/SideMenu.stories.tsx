import type {Meta, StoryObj} from "storybook/internal/types";

import {SideMenu, type SideMenuGroup} from "@corensystem/coren-ui/side-menu";
import {
	Bell,
	ClipboardCheck,
	Globe,
	HardHat,
	Link2,
	MessagesSquare,
	Puzzle,
	ShieldCheck,
	SlidersHorizontal,
	Users,
} from "lucide-react";
import {useState} from "react";

const meta = {
	title: "Widgets/Navigation/Side Menu",
	component: SideMenu,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"Vertical navigation panel for a content-area sub-surface (settings, integrations, filters). Owns its own " +
					"header (optional back button + icon + title), optional search, and grouped items with an active state. Use " +
					"CoreAppSidebar for the app shell — SideMenu is the left column of a content region.",
			},
		},
	},
} satisfies Meta<typeof SideMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

const INTEGRATION_GROUPS: SideMenuGroup[] = [
	{
		items: [
			{id: "all", label: "All", icon: Puzzle},
			{id: "connected", label: "Connected", icon: Link2},
		],
	},
	{
		label: "Categories",
		items: [
			{id: "productivity", label: "Productivity"},
			{id: "developer", label: "Developer"},
			{id: "communication", label: "Communication"},
			{id: "data", label: "Data"},
			{id: "research", label: "Research"},
		],
	},
	{
		label: "Apps",
		items: [
			{id: "slack-teams", label: "Slack & Teams", icon: MessagesSquare},
			{id: "arcade", label: "Arcade", icon: Globe},
		],
	},
];

const SETTINGS_GROUPS: SideMenuGroup[] = [
	{
		items: [
			{id: "general", label: "General", icon: SlidersHorizontal},
			{id: "notifications", label: "Notifications", icon: Bell},
		],
	},
	{
		label: "Workspace",
		items: [
			{id: "members", label: "Members", icon: Users},
			{id: "roles", label: "Roles & Permissions", icon: ShieldCheck},
			{id: "integrations", label: "Integrations", icon: Puzzle},
		],
	},
	{
		label: "Safety",
		items: [
			{id: "observation-types", label: "Observation Types", icon: HardHat},
			{id: "checklists", label: "Checklists", icon: ClipboardCheck},
			{id: "escalations", label: "Escalations", icon: Globe},
		],
	},
];

// Reference layout: a titled panel with an icon, search, and grouped items (some iconless).
export const Integrations: Story = {
	render: () => {
		const [active, setActive] = useState("all");
		return (
			<div className="wwc:h-screen wwc:w-full wwc:bg-background">
				<SideMenu
					title="Integrations"
					icon={<Puzzle className="wwc:h-5 wwc:w-5" />}
					groups={INTEGRATION_GROUPS}
					activeItemId={active}
					onItemSelect={setActive}
				/>
			</div>
		);
	},
};

// Settings sub-surface: a back button returns to the owning module.
export const SettingsWithBack: Story = {
	render: () => {
		const [active, setActive] = useState("general");
		return (
			<div className="wwc:h-screen wwc:w-full wwc:bg-background">
				<SideMenu
					title="Settings"
					onBack={() => {}}
					backLabel="Back"
					groups={SETTINGS_GROUPS}
					activeItemId={active}
					onItemSelect={setActive}
				/>
			</div>
		);
	},
};
