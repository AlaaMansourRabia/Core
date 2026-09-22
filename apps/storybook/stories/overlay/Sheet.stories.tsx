import type {Meta, StoryObj} from "storybook/internal/types";

import {Button} from "@corensystem/core-ui/button";
import {Input} from "@corensystem/core-ui/input";
import {Label} from "@corensystem/core-ui/label";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@corensystem/core-ui/sheet";

// NOTE: triggers are shown closed (deterministic snapshots). Open a Sheet in the live Storybook to
// see the slide-in panel; the content JSX is visible in the autodocs source for each story.
const meta = {
	title: "Components/Overlay/Sheet",
	component: Sheet,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"A panel that slides in from a screen edge for contextual work *beside* the page, keeping the main content " +
					"visible behind it. **When to use:** edit filters, view details, a side form — work that benefits from page " +
					"context. **When NOT to use:** a focused, blocking task or a confirmation → `Dialog` (centered modal) or " +
					"`AlertDialog`; a touch/mobile bottom panel → `Drawer`. Related: `Dialog`, `AlertDialog`, `Drawer`, `Popover`.",
			},
		},
	},
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<Sheet>
			<SheetTrigger asChild>
				<Button variant="outline">Open Sheet</Button>
			</SheetTrigger>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>Sheet Title</SheetTitle>
					<SheetDescription>This is a sheet that slides in from the right side of the screen.</SheetDescription>
				</SheetHeader>
				<div className="wwc:py-4">
					<p className="wwc:text-sm wwc:text-muted-foreground">Sheet body content goes here.</p>
				</div>
				<SheetFooter>
					<SheetClose asChild>
						<Button variant="outline">Cancel</Button>
					</SheetClose>
					<Button>Save</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	),
};

export const SideRight: Story = {
	render: () => (
		<Sheet>
			<SheetTrigger asChild>
				<Button variant="outline">Open Right</Button>
			</SheetTrigger>
			<SheetContent side="right">
				<SheetHeader>
					<SheetTitle>Right Sheet</SheetTitle>
					<SheetDescription>This sheet slides in from the right.</SheetDescription>
				</SheetHeader>
			</SheetContent>
		</Sheet>
	),
};

export const SideLeft: Story = {
	render: () => (
		<Sheet>
			<SheetTrigger asChild>
				<Button variant="outline">Open Left</Button>
			</SheetTrigger>
			<SheetContent side="left">
				<SheetHeader>
					<SheetTitle>Left Sheet</SheetTitle>
					<SheetDescription>This sheet slides in from the left.</SheetDescription>
				</SheetHeader>
			</SheetContent>
		</Sheet>
	),
};

export const SideTop: Story = {
	render: () => (
		<Sheet>
			<SheetTrigger asChild>
				<Button variant="outline">Open Top</Button>
			</SheetTrigger>
			<SheetContent side="top">
				<SheetHeader>
					<SheetTitle>Top Sheet</SheetTitle>
					<SheetDescription>This sheet slides in from the top.</SheetDescription>
				</SheetHeader>
			</SheetContent>
		</Sheet>
	),
};

export const SideBottom: Story = {
	render: () => (
		<Sheet>
			<SheetTrigger asChild>
				<Button variant="outline">Open Bottom</Button>
			</SheetTrigger>
			<SheetContent side="bottom">
				<SheetHeader>
					<SheetTitle>Bottom Sheet</SheetTitle>
					<SheetDescription>This sheet slides in from the bottom.</SheetDescription>
				</SheetHeader>
			</SheetContent>
		</Sheet>
	),
};

export const AllSides: Story = {
	render: () => (
		<div className="wwc:flex wwc:flex-wrap wwc:gap-3">
			<Sheet>
				<SheetTrigger asChild>
					<Button variant="outline">Top</Button>
				</SheetTrigger>
				<SheetContent side="top">
					<SheetHeader>
						<SheetTitle>Top</SheetTitle>
						<SheetDescription>Slides from the top.</SheetDescription>
					</SheetHeader>
				</SheetContent>
			</Sheet>
			<Sheet>
				<SheetTrigger asChild>
					<Button variant="outline">Right</Button>
				</SheetTrigger>
				<SheetContent side="right">
					<SheetHeader>
						<SheetTitle>Right</SheetTitle>
						<SheetDescription>Slides from the right.</SheetDescription>
					</SheetHeader>
				</SheetContent>
			</Sheet>
			<Sheet>
				<SheetTrigger asChild>
					<Button variant="outline">Bottom</Button>
				</SheetTrigger>
				<SheetContent side="bottom">
					<SheetHeader>
						<SheetTitle>Bottom</SheetTitle>
						<SheetDescription>Slides from the bottom.</SheetDescription>
					</SheetHeader>
				</SheetContent>
			</Sheet>
			<Sheet>
				<SheetTrigger asChild>
					<Button variant="outline">Left</Button>
				</SheetTrigger>
				<SheetContent side="left">
					<SheetHeader>
						<SheetTitle>Left</SheetTitle>
						<SheetDescription>Slides from the left.</SheetDescription>
					</SheetHeader>
				</SheetContent>
			</Sheet>
		</div>
	),
};

export const FormInSheet: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"The canonical Sheet use: edit something in a side panel without leaving the page. Header + body form + a " +
					"footer with Cancel (`SheetClose`) and a primary action. Open it in the live Storybook to interact.",
			},
		},
	},
	render: () => (
		<Sheet>
			<SheetTrigger asChild>
				<Button variant="outline">Edit filters</Button>
			</SheetTrigger>
			<SheetContent side="right">
				<SheetHeader>
					<SheetTitle>Filters</SheetTitle>
					<SheetDescription>Refine the worker list. The page stays visible behind this panel.</SheetDescription>
				</SheetHeader>
				<div className="wwc:flex wwc:flex-col wwc:gap-3 wwc:py-4">
					<div className="wwc:flex wwc:flex-col wwc:gap-1.5">
						<Label htmlFor="f-name">Name</Label>
						<Input id="f-name" placeholder="Search name" />
					</div>
					<div className="wwc:flex wwc:flex-col wwc:gap-1.5">
						<Label htmlFor="f-site">Site</Label>
						<Input id="f-site" placeholder="Site" />
					</div>
				</div>
				<SheetFooter>
					<SheetClose asChild>
						<Button variant="outline">Cancel</Button>
					</SheetClose>
					<Button>Apply</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	),
};

export const SheetVsDialog: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"**Decision.** Sheet = edge panel that keeps page context (browse/edit beside the work). Dialog = centered " +
					"modal that interrupts for a focused, blocking task. If the user should still see the page, use a Sheet; if they " +
					"must finish or dismiss before continuing, use a Dialog.",
			},
		},
	},
	render: () => (
		<div className="wwc:flex wwc:flex-col wwc:gap-2 wwc:text-sm">
			<Sheet>
				<SheetTrigger asChild>
					<Button variant="outline">Open as Sheet (keeps context)</Button>
				</SheetTrigger>
				<SheetContent side="right">
					<SheetHeader>
						<SheetTitle>Side panel</SheetTitle>
						<SheetDescription>Page is still visible behind — good for editing beside the work.</SheetDescription>
					</SheetHeader>
				</SheetContent>
			</Sheet>
			<p className="wwc:text-muted-foreground">
				For a blocking, focused task or a confirmation, use <code>Dialog</code>/<code>AlertDialog</code> instead.
			</p>
		</div>
	),
};

export const CustomComposition: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"`SheetContent` no longer hardcodes its portal, scrim and close button. `overlayProps` restyles the scrim — " +
					"here it starts below a mock app topbar rather than at `inset-0` — and `showCloseButton={false}` suppresses the " +
					"built-in close for a panel whose own header already carries one. `overlay={null}` renders no scrim at all, and " +
					"`portalProps` retargets where the sheet mounts.",
			},
		},
	},
	render: () => (
		<div className="wwc:flex wwc:flex-col wwc:gap-2 wwc:text-sm">
			<Sheet>
				<SheetTrigger asChild>
					<Button variant="outline">Scrim below the topbar, own close button</Button>
				</SheetTrigger>
				<SheetContent side="right" overlayProps={{className: "wwc:top-14"}} showCloseButton={false}>
					<SheetHeader className="wwc:flex-row wwc:items-center wwc:justify-between">
						<SheetTitle>Worker profile</SheetTitle>
						<SheetClose asChild>
							<Button variant="ghost" size="sm">
								Done
							</Button>
						</SheetClose>
					</SheetHeader>
					<SheetDescription>The panel's own header owns the close action, so the built-in one is off.</SheetDescription>
				</SheetContent>
			</Sheet>
			<Sheet>
				<SheetTrigger asChild>
					<Button variant="outline">No scrim — page stays usable behind</Button>
				</SheetTrigger>
				<SheetContent side="right" overlay={null}>
					<SheetHeader>
						<SheetTitle>Filters</SheetTitle>
						<SheetDescription>
							Nothing dims behind this panel; the list stays readable while filtering.
						</SheetDescription>
					</SheetHeader>
				</SheetContent>
			</Sheet>
		</div>
	),
};
