import type {Meta, StoryObj} from "storybook/internal/types";

import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
	CommandShortcut,
} from "@corensystem/coren-ui/command";
import {Calculator, Calendar, CreditCard, Settings, Smile, User} from "lucide-react";

const meta = {
	title: "Components/Navigation/Command",
	component: Command,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"A command palette / search interface built on cmdk. Supports groups, keyboard navigation, search filtering, and keyboard shortcuts.",
			},
		},
	},
} satisfies Meta<typeof Command>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<Command className="wwc:rounded-lg wwc:border wwc:shadow-md wwc:md:min-w-[450px]">
			<CommandInput placeholder="Type a command or search..." />
			<CommandList>
				<CommandEmpty>No results found.</CommandEmpty>
				<CommandGroup heading="Suggestions">
					<CommandItem>Calendar</CommandItem>
					<CommandItem>Search Workers</CommandItem>
					<CommandItem>Dashboard</CommandItem>
				</CommandGroup>
				<CommandSeparator />
				<CommandGroup heading="Settings">
					<CommandItem>Profile</CommandItem>
					<CommandItem>Billing</CommandItem>
					<CommandItem>Notifications</CommandItem>
				</CommandGroup>
			</CommandList>
		</Command>
	),
};

export const WithShortcuts: Story = {
	render: () => (
		<Command className="wwc:rounded-lg wwc:border wwc:shadow-md wwc:md:min-w-[450px]">
			<CommandInput placeholder="Type a command or search..." />
			<CommandList>
				<CommandEmpty>No results found.</CommandEmpty>
				<CommandGroup heading="Actions">
					<CommandItem>
						New Project
						<CommandShortcut>Ctrl+N</CommandShortcut>
					</CommandItem>
					<CommandItem>
						Search
						<CommandShortcut>Ctrl+K</CommandShortcut>
					</CommandItem>
					<CommandItem>
						Settings
						<CommandShortcut>Ctrl+,</CommandShortcut>
					</CommandItem>
				</CommandGroup>
			</CommandList>
		</Command>
	),
};

export const MultipleGroups: Story = {
	render: () => (
		<Command className="wwc:rounded-lg wwc:border wwc:shadow-md wwc:md:min-w-[450px]">
			<CommandInput placeholder="Search..." />
			<CommandList>
				<CommandEmpty>No results found.</CommandEmpty>
				<CommandGroup heading="Recent">
					<CommandItem>Site Alpha Dashboard</CommandItem>
					<CommandItem>Worker Report Q4</CommandItem>
				</CommandGroup>
				<CommandSeparator />
				<CommandGroup heading="Projects">
					<CommandItem>Site Alpha</CommandItem>
					<CommandItem>Site Beta</CommandItem>
					<CommandItem>Site Gamma</CommandItem>
				</CommandGroup>
				<CommandSeparator />
				<CommandGroup heading="Navigation">
					<CommandItem>
						Home
						<CommandShortcut>Ctrl+H</CommandShortcut>
					</CommandItem>
					<CommandItem>
						Settings
						<CommandShortcut>Ctrl+S</CommandShortcut>
					</CommandItem>
				</CommandGroup>
			</CommandList>
		</Command>
	),
};

export const WithIcons: Story = {
	render: () => (
		<Command className="wwc:rounded-lg wwc:border wwc:shadow-md wwc:md:min-w-[450px]">
			<CommandInput placeholder="Type a command or search..." />
			<CommandList>
				<CommandEmpty>No results found.</CommandEmpty>
				<CommandGroup heading="Suggestions">
					<CommandItem>
						<Calendar className="wwc:mr-2 wwc:h-4 wwc:w-4" />
						<span>Calendar</span>
					</CommandItem>
					<CommandItem>
						<Smile className="wwc:mr-2 wwc:h-4 wwc:w-4" />
						<span>Search Emoji</span>
					</CommandItem>
					<CommandItem>
						<Calculator className="wwc:mr-2 wwc:h-4 wwc:w-4" />
						<span>Calculator</span>
					</CommandItem>
				</CommandGroup>
				<CommandSeparator />
				<CommandGroup heading="Settings">
					<CommandItem>
						<User className="wwc:mr-2 wwc:h-4 wwc:w-4" />
						<span>Profile</span>
						<CommandShortcut>⌘P</CommandShortcut>
					</CommandItem>
					<CommandItem>
						<CreditCard className="wwc:mr-2 wwc:h-4 wwc:w-4" />
						<span>Billing</span>
						<CommandShortcut>⌘B</CommandShortcut>
					</CommandItem>
					<CommandItem>
						<Settings className="wwc:mr-2 wwc:h-4 wwc:w-4" />
						<span>Settings</span>
						<CommandShortcut>⌘S</CommandShortcut>
					</CommandItem>
				</CommandGroup>
			</CommandList>
		</Command>
	),
};

export const EmptyState: Story = {
	render: () => (
		<Command className="wwc:rounded-lg wwc:border wwc:shadow-md wwc:md:min-w-[450px]">
			<CommandInput placeholder="Search..." value="xyz123" />
			<CommandList>
				<CommandEmpty>No results found.</CommandEmpty>
			</CommandList>
		</Command>
	),
};
