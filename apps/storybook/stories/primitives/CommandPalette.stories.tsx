import type {Meta, StoryObj} from "storybook/internal/types";
import {useState} from "react";

import {CommandPalette, CommandPaletteTrigger, CommandPaletteGroup} from "@core/core-ui/command-palette";
import {Button} from "@core/core-ui/button";
import {Home, Settings, User, FileText, Search, Moon, Sun, LogOut} from "lucide-react";

const meta = {
	title: "Components/Primitives/CommandPalette",
	component: CommandPalette,
	tags: ["autodocs"],
} satisfies Meta<typeof CommandPalette>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleGroups: CommandPaletteGroup[] = [
	{
		heading: "Suggestions",
		items: [
			{id: "home", label: "Go to Home", icon: <Home className="wwc:h-4 wwc:w-4" />, shortcut: ["⌘", "H"]},
			{id: "search", label: "Search...", icon: <Search className="wwc:h-4 wwc:w-4" />, shortcut: ["⌘", "K"]},
		],
	},
	{
		heading: "Settings",
		items: [
			{id: "profile", label: "Profile Settings", icon: <User className="wwc:h-4 wwc:w-4" />, description: "Manage your profile"},
			{id: "preferences", label: "Preferences", icon: <Settings className="wwc:h-4 wwc:w-4" />, description: "App preferences"},
			{id: "theme-dark", label: "Dark Mode", icon: <Moon className="wwc:h-4 wwc:w-4" />},
			{id: "theme-light", label: "Light Mode", icon: <Sun className="wwc:h-4 wwc:w-4" />},
		],
	},
	{
		heading: "Account",
		items: [
			{id: "logout", label: "Log Out", icon: <LogOut className="wwc:h-4 wwc:w-4" />, shortcut: ["⌘", "Q"]},
		],
	},
];

export const Default: Story = {
	render: () => {
		const [open, setOpen] = useState(false);
		return (
			<div>
				<Button onClick={() => setOpen(true)}>Open Command Palette</Button>
				<CommandPalette
					open={open}
					onOpenChange={setOpen}
					groups={sampleGroups}
					onSelect={(item) => console.log("Selected:", item.id)}
				/>
			</div>
		);
	},
};

export const WithTrigger: Story = {
	render: () => {
		const [open, setOpen] = useState(false);
		return (
			<div>
				<CommandPaletteTrigger onClick={() => setOpen(true)}>
					Search commands...
				</CommandPaletteTrigger>
				<CommandPalette open={open} onOpenChange={setOpen} groups={sampleGroups} />
			</div>
		);
	},
};

export const CustomPlaceholder: Story = {
	render: () => {
		const [open, setOpen] = useState(false);
		return (
			<div>
				<Button onClick={() => setOpen(true)}>Open Palette</Button>
				<CommandPalette
					open={open}
					onOpenChange={setOpen}
					groups={sampleGroups}
					placeholder="What would you like to do?"
					emptyMessage="No commands match your search."
				/>
			</div>
		);
	},
};

export const SimpleCommands: Story = {
	render: () => {
		const [open, setOpen] = useState(false);
		const simpleGroups: CommandPaletteGroup[] = [
			{
				items: [
					{id: "new", label: "New File", shortcut: ["⌘", "N"]},
					{id: "open", label: "Open File", shortcut: ["⌘", "O"]},
					{id: "save", label: "Save", shortcut: ["⌘", "S"]},
					{id: "close", label: "Close", shortcut: ["⌘", "W"]},
				],
			},
		];
		return (
			<div>
				<Button onClick={() => setOpen(true)}>File Commands</Button>
				<CommandPalette open={open} onOpenChange={setOpen} groups={simpleGroups} placeholder="File actions..." />
			</div>
		);
	},
};

export const WithDisabled: Story = {
	render: () => {
		const [open, setOpen] = useState(false);
		const groupsWithDisabled: CommandPaletteGroup[] = [
			{
				items: [
					{id: "active", label: "Active Command"},
					{id: "disabled", label: "Disabled Command", disabled: true},
					{id: "another", label: "Another Command"},
				],
			},
		];
		return (
			<div>
				<Button onClick={() => setOpen(true)}>Open</Button>
				<CommandPalette open={open} onOpenChange={setOpen} groups={groupsWithDisabled} />
			</div>
		);
	},
};
