import type {Meta, StoryObj} from "storybook/internal/types";

import {
	Menubar,
	MenubarCheckboxItem,
	MenubarContent,
	MenubarGroup,
	MenubarItem,
	MenubarLabel,
	MenubarMenu,
	MenubarRadioGroup,
	MenubarRadioItem,
	MenubarSeparator,
	MenubarShortcut,
	MenubarSub,
	MenubarSubContent,
	MenubarSubTrigger,
	MenubarTrigger,
} from "@wakecap/core-ui/menubar";
import {useState} from "react";

const meta = {
	title: "Components/Overlay/Menubar",
	component: Menubar,
	tags: ["autodocs"],
} satisfies Meta<typeof Menubar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<Menubar>
			<MenubarMenu>
				<MenubarTrigger>File</MenubarTrigger>
				<MenubarContent>
					<MenubarItem>
						New Tab
						<MenubarShortcut>Ctrl+T</MenubarShortcut>
					</MenubarItem>
					<MenubarItem>
						New Window
						<MenubarShortcut>Ctrl+N</MenubarShortcut>
					</MenubarItem>
					<MenubarItem disabled>New Incognito Window</MenubarItem>
					<MenubarSeparator />
					<MenubarSub>
						<MenubarSubTrigger>Share</MenubarSubTrigger>
						<MenubarSubContent>
							<MenubarItem>Email Link</MenubarItem>
							<MenubarItem>Messages</MenubarItem>
							<MenubarItem>Notes</MenubarItem>
						</MenubarSubContent>
					</MenubarSub>
					<MenubarSeparator />
					<MenubarItem>
						Print
						<MenubarShortcut>Ctrl+P</MenubarShortcut>
					</MenubarItem>
				</MenubarContent>
			</MenubarMenu>
			<MenubarMenu>
				<MenubarTrigger>Edit</MenubarTrigger>
				<MenubarContent>
					<MenubarItem>
						Undo
						<MenubarShortcut>Ctrl+Z</MenubarShortcut>
					</MenubarItem>
					<MenubarItem>
						Redo
						<MenubarShortcut>Ctrl+Y</MenubarShortcut>
					</MenubarItem>
					<MenubarSeparator />
					<MenubarItem>
						Cut
						<MenubarShortcut>Ctrl+X</MenubarShortcut>
					</MenubarItem>
					<MenubarItem>
						Copy
						<MenubarShortcut>Ctrl+C</MenubarShortcut>
					</MenubarItem>
					<MenubarItem>
						Paste
						<MenubarShortcut>Ctrl+V</MenubarShortcut>
					</MenubarItem>
				</MenubarContent>
			</MenubarMenu>
			<MenubarMenu>
				<MenubarTrigger>View</MenubarTrigger>
				<MenubarContent>
					<MenubarItem>
						Zoom In
						<MenubarShortcut>Ctrl++</MenubarShortcut>
					</MenubarItem>
					<MenubarItem>
						Zoom Out
						<MenubarShortcut>Ctrl+-</MenubarShortcut>
					</MenubarItem>
					<MenubarSeparator />
					<MenubarItem>Toggle Fullscreen</MenubarItem>
				</MenubarContent>
			</MenubarMenu>
		</Menubar>
	),
};

export const WithCheckboxItems: Story = {
	render: function CheckboxStory() {
		const [showStatusBar, setShowStatusBar] = useState(true);
		const [showActivityBar, setShowActivityBar] = useState(false);
		const [showPanel, setShowPanel] = useState(true);

		return (
			<Menubar>
				<MenubarMenu>
					<MenubarTrigger>View</MenubarTrigger>
					<MenubarContent>
						<MenubarLabel>Panels</MenubarLabel>
						<MenubarSeparator />
						<MenubarCheckboxItem checked={showStatusBar} onCheckedChange={setShowStatusBar}>
							Status Bar
						</MenubarCheckboxItem>
						<MenubarCheckboxItem checked={showActivityBar} onCheckedChange={setShowActivityBar}>
							Activity Bar
						</MenubarCheckboxItem>
						<MenubarCheckboxItem checked={showPanel} onCheckedChange={setShowPanel}>
							Panel
						</MenubarCheckboxItem>
					</MenubarContent>
				</MenubarMenu>
			</Menubar>
		);
	},
};

export const WithRadioItems: Story = {
	render: function RadioStory() {
		const [theme, setTheme] = useState("system");

		return (
			<Menubar>
				<MenubarMenu>
					<MenubarTrigger>Preferences</MenubarTrigger>
					<MenubarContent>
						<MenubarLabel>Theme</MenubarLabel>
						<MenubarSeparator />
						<MenubarRadioGroup value={theme} onValueChange={setTheme}>
							<MenubarRadioItem value="light">Light</MenubarRadioItem>
							<MenubarRadioItem value="dark">Dark</MenubarRadioItem>
							<MenubarRadioItem value="system">System</MenubarRadioItem>
						</MenubarRadioGroup>
					</MenubarContent>
				</MenubarMenu>
			</Menubar>
		);
	},
};

export const FullExample: Story = {
	render: function FullExampleStory() {
		const [showBookmarks, setShowBookmarks] = useState(true);
		const [showFullUrls, setShowFullUrls] = useState(false);
		const [profile, setProfile] = useState("benoit");

		return (
			<Menubar>
				<MenubarMenu>
					<MenubarTrigger>File</MenubarTrigger>
					<MenubarContent>
						<MenubarItem>
							New Tab
							<MenubarShortcut>Ctrl+T</MenubarShortcut>
						</MenubarItem>
						<MenubarItem>
							New Window
							<MenubarShortcut>Ctrl+N</MenubarShortcut>
						</MenubarItem>
						<MenubarSeparator />
						<MenubarSub>
							<MenubarSubTrigger>Share</MenubarSubTrigger>
							<MenubarSubContent>
								<MenubarItem>Email Link</MenubarItem>
								<MenubarItem>Messages</MenubarItem>
							</MenubarSubContent>
						</MenubarSub>
						<MenubarSeparator />
						<MenubarItem>
							Print
							<MenubarShortcut>Ctrl+P</MenubarShortcut>
						</MenubarItem>
					</MenubarContent>
				</MenubarMenu>
				<MenubarMenu>
					<MenubarTrigger>View</MenubarTrigger>
					<MenubarContent>
						<MenubarCheckboxItem checked={showBookmarks} onCheckedChange={setShowBookmarks}>
							Show Bookmarks
						</MenubarCheckboxItem>
						<MenubarCheckboxItem checked={showFullUrls} onCheckedChange={setShowFullUrls}>
							Show Full URLs
						</MenubarCheckboxItem>
					</MenubarContent>
				</MenubarMenu>
				<MenubarMenu>
					<MenubarTrigger>Profiles</MenubarTrigger>
					<MenubarContent>
						<MenubarRadioGroup value={profile} onValueChange={setProfile}>
							<MenubarRadioItem value="andy">Andy</MenubarRadioItem>
							<MenubarRadioItem value="benoit">Benoit</MenubarRadioItem>
							<MenubarRadioItem value="luis">Luis</MenubarRadioItem>
						</MenubarRadioGroup>
						<MenubarSeparator />
						<MenubarItem inset>Edit Profiles...</MenubarItem>
					</MenubarContent>
				</MenubarMenu>
			</Menubar>
		);
	},
};
