import type {BottomSheetSwitcherSheet} from "@core/core-ui/bottom-sheet-switcher";
import type {Meta, StoryObj} from "storybook/internal/types";

import {BottomSheetSwitcher} from "@core/core-ui/bottom-sheet-switcher";
import {Button} from "@core/core-ui/button";
import {Menu} from "lucide-react";
import {useState} from "react";

const meta = {
	title: "Components/Primitives/BottomSheetSwitcher",
	component: BottomSheetSwitcher,
	tags: ["autodocs"],
} satisfies Meta<typeof BottomSheetSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

const sheets: BottomSheetSwitcherSheet[] = [
	{
		id: "home",
		title: "Home",
		content: (
			<div className="wwc:space-y-4">
				<h3 className="wwc:font-semibold">Welcome Home</h3>
				<p className="wwc:text-muted-foreground">This is the home panel content.</p>
				<div className="wwc:grid wwc:grid-cols-2 wwc:gap-2">
					<div className="wwc:p-4 wwc:bg-muted wwc:rounded-lg">Widget 1</div>
					<div className="wwc:p-4 wwc:bg-muted wwc:rounded-lg">Widget 2</div>
				</div>
			</div>
		),
	},
	{
		id: "profile",
		title: "Profile",
		content: (
			<div className="wwc:space-y-4">
				<h3 className="wwc:font-semibold">Your Profile</h3>
				<div className="wwc:flex wwc:items-center wwc:gap-4">
					<div className="wwc:h-16 wwc:w-16 wwc:rounded-full wwc:bg-muted" />
					<div>
						<div className="wwc:font-medium">John Doe</div>
						<div className="wwc:text-sm wwc:text-muted-foreground">john@example.com</div>
					</div>
				</div>
			</div>
		),
	},
	{
		id: "settings",
		title: "Settings",
		content: (
			<div className="wwc:space-y-4">
				<h3 className="wwc:font-semibold">Settings</h3>
				<div className="wwc:space-y-2">
					<div className="wwc:flex wwc:items-center wwc:justify-between wwc:p-3 wwc:bg-muted wwc:rounded-lg">
						<span>Dark Mode</span>
						<span className="wwc:text-muted-foreground">Off</span>
					</div>
					<div className="wwc:flex wwc:items-center wwc:justify-between wwc:p-3 wwc:bg-muted wwc:rounded-lg">
						<span>Notifications</span>
						<span className="wwc:text-muted-foreground">On</span>
					</div>
				</div>
			</div>
		),
	},
];

export const Default: Story = {
	render: () => {
		const [open, setOpen] = useState(false);
		const [activeSheetId, setActiveSheetId] = useState("home");
		return (
			<div>
				<Button onClick={() => setOpen(true)}>
					<Menu className="wwc:h-4 wwc:w-4 wwc:mr-2" />
					Open Switcher
				</Button>
				<BottomSheetSwitcher
					open={open}
					onClose={() => setOpen(false)}
					sheets={sheets}
					activeSheetId={activeSheetId}
					onSheetChange={setActiveSheetId}
				/>
			</div>
		);
	},
};

export const WithDescription: Story = {
	render: () => {
		const [open, setOpen] = useState(false);
		const [activeSheetId, setActiveSheetId] = useState("info");
		const sheetsWithDesc: BottomSheetSwitcherSheet[] = [
			{
				id: "info",
				title: "Information",
				description: "General information about the app",
				content: <p className="wwc:text-muted-foreground">Some informational content here.</p>,
			},
			{
				id: "help",
				title: "Help",
				description: "Get help and support",
				content: <p className="wwc:text-muted-foreground">Help and support content here.</p>,
			},
		];
		return (
			<div>
				<Button onClick={() => setOpen(true)}>Open With Descriptions</Button>
				<BottomSheetSwitcher
					open={open}
					onClose={() => setOpen(false)}
					sheets={sheetsWithDesc}
					activeSheetId={activeSheetId}
					onSheetChange={setActiveSheetId}
				/>
			</div>
		);
	},
};

export const TwoSheets: Story = {
	render: () => {
		const [open, setOpen] = useState(false);
		const [activeSheetId, setActiveSheetId] = useState("menu");
		const twoSheets: BottomSheetSwitcherSheet[] = [
			{
				id: "menu",
				title: "Menu",
				content: (
					<div>
						<h3 className="wwc:font-semibold wwc:mb-4">Menu</h3>
						<div className="wwc:space-y-2">
							{["Item 1", "Item 2", "Item 3"].map((item) => (
								<div key={item} className="wwc:p-3 wwc:border wwc:rounded-lg">
									{item}
								</div>
							))}
						</div>
					</div>
				),
			},
			{
				id: "filters",
				title: "Filters",
				content: (
					<div>
						<h3 className="wwc:font-semibold wwc:mb-4">Filters</h3>
						<div className="wwc:space-y-3">
							<label className="wwc:flex wwc:items-center wwc:gap-2">
								<input type="checkbox" /> Option A
							</label>
							<label className="wwc:flex wwc:items-center wwc:gap-2">
								<input type="checkbox" /> Option B
							</label>
						</div>
					</div>
				),
			},
		];
		return (
			<div>
				<Button onClick={() => setOpen(true)}>Open Two-Panel Switcher</Button>
				<BottomSheetSwitcher
					open={open}
					onClose={() => setOpen(false)}
					sheets={twoSheets}
					activeSheetId={activeSheetId}
					onSheetChange={setActiveSheetId}
				/>
			</div>
		);
	},
};

export const HalfHeight: Story = {
	render: () => {
		const [open, setOpen] = useState(false);
		return (
			<div>
				<Button onClick={() => setOpen(true)}>Open Half Height</Button>
				<BottomSheetSwitcher open={open} onClose={() => setOpen(false)} sheets={sheets} height="half" />
			</div>
		);
	},
};
