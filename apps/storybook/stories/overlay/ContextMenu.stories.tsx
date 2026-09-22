import type {Meta, StoryObj} from "storybook/internal/types";

import {
	ContextMenu,
	ContextMenuCheckboxItem,
	ContextMenuContent,
	ContextMenuGroup,
	ContextMenuItem,
	ContextMenuLabel,
	ContextMenuPortal,
	ContextMenuRadioGroup,
	ContextMenuRadioItem,
	ContextMenuSeparator,
	ContextMenuShortcut,
	ContextMenuSub,
	ContextMenuSubContent,
	ContextMenuSubTrigger,
	ContextMenuTrigger,
} from "@corensystem/core-ui/context-menu";
import {useState} from "react";

const meta = {
	title: "Components/Overlay/ContextMenu",
	component: ContextMenu,
	tags: ["autodocs"],
} satisfies Meta<typeof ContextMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<ContextMenu>
			<ContextMenuTrigger className="wwc:flex wwc:h-[150px] wwc:w-[300px] wwc:items-center wwc:justify-center wwc:rounded-md wwc:border wwc:border-dashed wwc:text-sm">
				Right click here
			</ContextMenuTrigger>
			<ContextMenuContent className="wwc:w-64">
				<ContextMenuItem>
					Back
					<ContextMenuShortcut>Alt+Left</ContextMenuShortcut>
				</ContextMenuItem>
				<ContextMenuItem>
					Forward
					<ContextMenuShortcut>Alt+Right</ContextMenuShortcut>
				</ContextMenuItem>
				<ContextMenuItem>
					Reload
					<ContextMenuShortcut>Ctrl+R</ContextMenuShortcut>
				</ContextMenuItem>
				<ContextMenuSeparator />
				<ContextMenuItem>Save As...</ContextMenuItem>
				<ContextMenuItem>Print</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	),
};

export const WithSubmenus: Story = {
	render: () => (
		<ContextMenu>
			<ContextMenuTrigger className="wwc:flex wwc:h-[150px] wwc:w-[300px] wwc:items-center wwc:justify-center wwc:rounded-md wwc:border wwc:border-dashed wwc:text-sm">
				Right click here
			</ContextMenuTrigger>
			<ContextMenuContent className="wwc:w-64">
				<ContextMenuItem>Cut</ContextMenuItem>
				<ContextMenuItem>Copy</ContextMenuItem>
				<ContextMenuItem>Paste</ContextMenuItem>
				<ContextMenuSeparator />
				<ContextMenuSub>
					<ContextMenuSubTrigger>More Tools</ContextMenuSubTrigger>
					<ContextMenuPortal>
						<ContextMenuSubContent className="wwc:w-48">
							<ContextMenuItem>Save Page As...</ContextMenuItem>
							<ContextMenuItem>Create Shortcut...</ContextMenuItem>
							<ContextMenuItem>Name Window...</ContextMenuItem>
							<ContextMenuSeparator />
							<ContextMenuItem>Developer Tools</ContextMenuItem>
						</ContextMenuSubContent>
					</ContextMenuPortal>
				</ContextMenuSub>
				<ContextMenuSeparator />
				<ContextMenuItem>Inspect</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	),
};

export const WithCheckboxItems: Story = {
	render: function CheckboxStory() {
		const [showBookmarks, setShowBookmarks] = useState(true);
		const [showFullUrls, setShowFullUrls] = useState(false);

		return (
			<ContextMenu>
				<ContextMenuTrigger className="wwc:flex wwc:h-[150px] wwc:w-[300px] wwc:items-center wwc:justify-center wwc:rounded-md wwc:border wwc:border-dashed wwc:text-sm">
					Right click here
				</ContextMenuTrigger>
				<ContextMenuContent className="wwc:w-64">
					<ContextMenuLabel>Settings</ContextMenuLabel>
					<ContextMenuSeparator />
					<ContextMenuCheckboxItem checked={showBookmarks} onCheckedChange={setShowBookmarks}>
						Show Bookmarks Bar
					</ContextMenuCheckboxItem>
					<ContextMenuCheckboxItem checked={showFullUrls} onCheckedChange={setShowFullUrls}>
						Show Full URLs
					</ContextMenuCheckboxItem>
				</ContextMenuContent>
			</ContextMenu>
		);
	},
};

export const WithRadioItems: Story = {
	render: function RadioStory() {
		const [person, setPerson] = useState("pedro");

		return (
			<ContextMenu>
				<ContextMenuTrigger className="wwc:flex wwc:h-[150px] wwc:w-[300px] wwc:items-center wwc:justify-center wwc:rounded-md wwc:border wwc:border-dashed wwc:text-sm">
					Right click here
				</ContextMenuTrigger>
				<ContextMenuContent className="wwc:w-64">
					<ContextMenuLabel inset>Assign to</ContextMenuLabel>
					<ContextMenuSeparator />
					<ContextMenuRadioGroup value={person} onValueChange={setPerson}>
						<ContextMenuRadioItem value="pedro">Pedro</ContextMenuRadioItem>
						<ContextMenuRadioItem value="colm">Colm</ContextMenuRadioItem>
						<ContextMenuRadioItem value="james">James</ContextMenuRadioItem>
					</ContextMenuRadioGroup>
				</ContextMenuContent>
			</ContextMenu>
		);
	},
};

export const WithGroups: Story = {
	render: () => (
		<ContextMenu>
			<ContextMenuTrigger className="wwc:flex wwc:h-[150px] wwc:w-[300px] wwc:items-center wwc:justify-center wwc:rounded-md wwc:border wwc:border-dashed wwc:text-sm">
				Right click here
			</ContextMenuTrigger>
			<ContextMenuContent className="wwc:w-64">
				<ContextMenuLabel>File</ContextMenuLabel>
				<ContextMenuGroup>
					<ContextMenuItem>New Tab</ContextMenuItem>
					<ContextMenuItem>New Window</ContextMenuItem>
					<ContextMenuItem>New Incognito Window</ContextMenuItem>
				</ContextMenuGroup>
				<ContextMenuSeparator />
				<ContextMenuLabel>Edit</ContextMenuLabel>
				<ContextMenuGroup>
					<ContextMenuItem>Undo</ContextMenuItem>
					<ContextMenuItem>Redo</ContextMenuItem>
				</ContextMenuGroup>
			</ContextMenuContent>
		</ContextMenu>
	),
};
