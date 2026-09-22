import type {Meta, StoryObj} from "storybook/internal/types";

import {Button} from "@corensystem/core-ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuPortal,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@corensystem/core-ui/dropdown-menu";
import {
	Cloud,
	CreditCard,
	Github,
	Keyboard,
	LifeBuoy,
	LogOut,
	Plus,
	Settings,
	User,
	UserPlus,
	Users,
} from "lucide-react";
import {useState} from "react";
import {expect, screen, userEvent, waitFor, within} from "storybook/test";

const meta = {
	title: "Components/Overlay/DropdownMenu",
	component: DropdownMenu,
	tags: ["autodocs"],
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline">Open Menu</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="wwc:w-56">
				<DropdownMenuLabel>My Account</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem>
						Profile
						<DropdownMenuShortcut>Ctrl+P</DropdownMenuShortcut>
					</DropdownMenuItem>
					<DropdownMenuItem>
						Settings
						<DropdownMenuShortcut>Ctrl+S</DropdownMenuShortcut>
					</DropdownMenuItem>
					<DropdownMenuItem>
						Keyboard shortcuts
						<DropdownMenuShortcut>Ctrl+K</DropdownMenuShortcut>
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem>Log out</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	),
};

export const WithSubmenus: Story = {
	render: () => (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline">Options</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="wwc:w-56">
				<DropdownMenuLabel>Actions</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem>New File</DropdownMenuItem>
					<DropdownMenuItem>New Window</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuSub>
					<DropdownMenuSubTrigger>Share</DropdownMenuSubTrigger>
					<DropdownMenuPortal>
						<DropdownMenuSubContent>
							<DropdownMenuItem>Email</DropdownMenuItem>
							<DropdownMenuItem>Message</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem>Copy Link</DropdownMenuItem>
						</DropdownMenuSubContent>
					</DropdownMenuPortal>
				</DropdownMenuSub>
				<DropdownMenuSeparator />
				<DropdownMenuItem>Delete</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	),
};

export const WithCheckboxItems: Story = {
	render: function CheckboxStory() {
		const [showStatusBar, setShowStatusBar] = useState(true);
		const [showActivityBar, setShowActivityBar] = useState(false);
		const [showPanel, setShowPanel] = useState(false);

		return (
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline">View</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="wwc:w-56">
					<DropdownMenuLabel>Appearance</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuCheckboxItem checked={showStatusBar} onCheckedChange={setShowStatusBar}>
						Status Bar
					</DropdownMenuCheckboxItem>
					<DropdownMenuCheckboxItem checked={showActivityBar} onCheckedChange={setShowActivityBar}>
						Activity Bar
					</DropdownMenuCheckboxItem>
					<DropdownMenuCheckboxItem checked={showPanel} onCheckedChange={setShowPanel}>
						Panel
					</DropdownMenuCheckboxItem>
				</DropdownMenuContent>
			</DropdownMenu>
		);
	},
};

export const WithRadioItems: Story = {
	render: function RadioStory() {
		const [position, setPosition] = useState("bottom");

		return (
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline">Panel Position</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="wwc:w-56">
					<DropdownMenuLabel>Panel Position</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
						<DropdownMenuRadioItem value="top">Top</DropdownMenuRadioItem>
						<DropdownMenuRadioItem value="bottom">Bottom</DropdownMenuRadioItem>
						<DropdownMenuRadioItem value="right">Right</DropdownMenuRadioItem>
					</DropdownMenuRadioGroup>
				</DropdownMenuContent>
			</DropdownMenu>
		);
	},
};

export const WithDisabledItems: Story = {
	render: () => (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline">Edit</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="wwc:w-56">
				<DropdownMenuItem>Cut</DropdownMenuItem>
				<DropdownMenuItem>Copy</DropdownMenuItem>
				<DropdownMenuItem>Paste</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem disabled>Undo</DropdownMenuItem>
				<DropdownMenuItem disabled>Redo</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	),
};

export const WithIconsAndGroups: Story = {
	render: () => (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline">Open Menu</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="wwc:w-56">
				<DropdownMenuLabel>My Account</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem>
						<User className="wwc:mr-2 wwc:h-4 wwc:w-4" />
						<span>Profile</span>
						<DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
					</DropdownMenuItem>
					<DropdownMenuItem>
						<CreditCard className="wwc:mr-2 wwc:h-4 wwc:w-4" />
						<span>Billing</span>
						<DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
					</DropdownMenuItem>
					<DropdownMenuItem>
						<Settings className="wwc:mr-2 wwc:h-4 wwc:w-4" />
						<span>Settings</span>
						<DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
					</DropdownMenuItem>
					<DropdownMenuItem>
						<Keyboard className="wwc:mr-2 wwc:h-4 wwc:w-4" />
						<span>Keyboard shortcuts</span>
						<DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem>
						<Users className="wwc:mr-2 wwc:h-4 wwc:w-4" />
						<span>Team</span>
					</DropdownMenuItem>
					<DropdownMenuItem>
						<UserPlus className="wwc:mr-2 wwc:h-4 wwc:w-4" />
						<span>Invite users</span>
					</DropdownMenuItem>
					<DropdownMenuItem>
						<Plus className="wwc:mr-2 wwc:h-4 wwc:w-4" />
						<span>New Team</span>
						<DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem>
					<Github className="wwc:mr-2 wwc:h-4 wwc:w-4" />
					<span>GitHub</span>
				</DropdownMenuItem>
				<DropdownMenuItem>
					<LifeBuoy className="wwc:mr-2 wwc:h-4 wwc:w-4" />
					<span>Support</span>
				</DropdownMenuItem>
				<DropdownMenuItem disabled>
					<Cloud className="wwc:mr-2 wwc:h-4 wwc:w-4" />
					<span>API</span>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem>
					<LogOut className="wwc:mr-2 wwc:h-4 wwc:w-4" />
					<span>Log out</span>
					<DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	),
};

export const ClickItemInteraction: Story = {
	render: () => (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline">Actions</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="wwc:w-56">
				<DropdownMenuItem>Copy</DropdownMenuItem>
				<DropdownMenuItem>Paste</DropdownMenuItem>
				<DropdownMenuItem>Delete</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	),
	play: async ({canvasElement}) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole("button", {name: /actions/i});

		await userEvent.click(trigger);

		const menuItem = await screen.findByRole("menuitem", {name: /paste/i});
		await waitFor(() => expect(menuItem).toBeVisible());
		await userEvent.click(menuItem);
	},
};
