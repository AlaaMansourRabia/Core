import type {Meta, StoryObj} from "storybook/internal/types";

import {Banner} from "@corensystem/coren-ui/banner";
import {Button} from "@corensystem/coren-ui/button";
import {ButtonGroup, ButtonGroupItem} from "@corensystem/coren-ui/button-group";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@corensystem/coren-ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@corensystem/coren-ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@corensystem/coren-ui/dropdown-menu";
import {Input} from "@corensystem/coren-ui/input";
import {Label} from "@corensystem/coren-ui/label";
import {
	Bold,
	ChevronDown,
	Copy,
	Download,
	Filter,
	Grid3x3,
	Italic,
	LayoutList,
	Map,
	MoreHorizontal,
	Pencil,
	Plus,
	Trash2,
	Underline,
} from "lucide-react";
import * as React from "react";
import {expect, fn, userEvent, within} from "storybook/test";

const meta = {
	title: "Components/Primitives/Button",
	component: Button,
	tags: ["autodocs"],
	argTypes: {
		variant: {
			control: "select",
			options: ["default", "secondary", "destructive", "outline", "ghost", "link"],
		},
		size: {
			control: "select",
			options: ["default", "sm", "lg"],
		},
		icon: {control: "boolean"},
		loading: {control: "boolean"},
		disabled: {control: "boolean"},
	},
	args: {
		children: "Button",
		variant: "default",
		size: "default",
		icon: false,
		loading: false,
		disabled: false,
	},
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Secondary: Story = {
	args: {variant: "secondary"},
};

export const Destructive: Story = {
	args: {variant: "destructive"},
};

export const Outline: Story = {
	args: {variant: "outline"},
};

export const Ghost: Story = {
	args: {variant: "ghost"},
};

export const Link: Story = {
	args: {variant: "link"},
};

export const Small: Story = {
	args: {size: "sm", children: "Small"},
};

export const Large: Story = {
	args: {size: "lg", children: "Large"},
};

export const Loading: Story = {
	args: {loading: true, children: "Saving..."},
};

export const Disabled: Story = {
	args: {disabled: true},
};

export const AllVariants: Story = {
	render: () => (
		<div className="wwc:flex wwc:flex-wrap wwc:gap-3">
			<Button variant="default">Default</Button>
			<Button variant="secondary">Secondary</Button>
			<Button variant="destructive">Destructive</Button>
			<Button variant="outline">Outline</Button>
			<Button variant="ghost">Ghost</Button>
			<Button variant="link">Link</Button>
		</div>
	),
};

export const AllSizes: Story = {
	render: () => (
		<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-3">
			<Button size="sm">Small</Button>
			<Button size="default">Default</Button>
			<Button size="lg">Large</Button>
		</div>
	),
};

export const ClickInteraction: Story = {
	args: {
		onClick: fn(),
		children: "Click me",
	},
	play: async ({canvasElement, args}) => {
		const canvas = within(canvasElement);
		const button = canvas.getByRole("button", {name: /click me/i});

		await userEvent.click(button);
		await expect(args.onClick).toHaveBeenCalledTimes(1);

		await userEvent.click(button);
		await expect(args.onClick).toHaveBeenCalledTimes(2);
	},
};

export const KeyboardInteraction: Story = {
	args: {
		onClick: fn(),
		children: "Press Enter",
	},
	play: async ({canvasElement, args}) => {
		const canvas = within(canvasElement);
		const button = canvas.getByRole("button", {name: /press enter/i});

		await button.focus();
		await userEvent.keyboard("{Enter}");
		await expect(args.onClick).toHaveBeenCalledTimes(1);

		await userEvent.keyboard(" ");
		await expect(args.onClick).toHaveBeenCalledTimes(2);
	},
};

export const DisabledInteraction: Story = {
	args: {
		onClick: fn(),
		disabled: true,
		children: "Disabled",
	},
	play: async ({canvasElement, args}) => {
		const canvas = within(canvasElement);
		const button = canvas.getByRole("button", {name: /disabled/i});

		await expect(button).toBeDisabled();
		await expect(button).toHaveStyle("pointer-events: none");
		await expect(args.onClick).not.toHaveBeenCalled();
	},
};

/* ─────────────────────────────────────────────────────────────────────────────
 * Usage examples — each renders the same composition under both themes
 * side-by-side. The right panel is locally scoped with `.dark`, so the
 * comparison works regardless of the global Storybook theme toggle.
 * ──────────────────────────────────────────────────────────────────────────── */

// Tailwind v4 resolves `--wwc-color-*` eagerly on `:root` from their underlying
// `--X` tokens. When we toggle a local `.dark` wrapper, the underlying `--X`
// flip but the already-resolved `--wwc-color-*` keep their `:root` (light)
// values via inheritance. Re-binding them on the wrapper forces re-resolution
// against the wrapper's own (dark) `--X` tokens.
const THEME_TOKEN_REBINDS = {
	"--wwc-color-background": "var(--background)",
	"--wwc-color-foreground": "var(--foreground)",
	"--wwc-color-card": "var(--card)",
	"--wwc-color-card-foreground": "var(--card-foreground)",
	"--wwc-color-popover": "var(--popover)",
	"--wwc-color-popover-foreground": "var(--popover-foreground)",
	"--wwc-color-primary": "var(--primary)",
	"--wwc-color-primary-foreground": "var(--primary-foreground)",
	"--wwc-color-secondary": "var(--secondary)",
	"--wwc-color-secondary-foreground": "var(--secondary-foreground)",
	"--wwc-color-muted": "var(--muted)",
	"--wwc-color-muted-foreground": "var(--muted-foreground)",
	"--wwc-color-accent": "var(--accent)",
	"--wwc-color-accent-foreground": "var(--accent-foreground)",
	"--wwc-color-destructive": "var(--destructive)",
	"--wwc-color-destructive-foreground": "var(--destructive-foreground)",
	"--wwc-color-border": "var(--border)",
	"--wwc-color-input": "var(--input)",
	"--wwc-color-ring": "var(--ring)",
	"--wwc-color-chart-1": "var(--chart-1)",
	"--wwc-color-chart-2": "var(--chart-2)",
	"--wwc-color-chart-3": "var(--chart-3)",
	"--wwc-color-chart-4": "var(--chart-4)",
	"--wwc-color-chart-5": "var(--chart-5)",
	"--wwc-color-sidebar": "var(--sidebar)",
	"--wwc-color-sidebar-foreground": "var(--sidebar-foreground)",
	"--wwc-color-sidebar-accent": "var(--sidebar-accent)",
	"--wwc-color-sidebar-accent-foreground": "var(--sidebar-accent-foreground)",
} as React.CSSProperties;

function ThemePair({label, children}: {label: string; children: React.ReactNode}) {
	return (
		<div className="wwc:space-y-3">
			<p className="wwc:text-sm wwc:font-medium wwc:text-muted-foreground">{label}</p>
			<div className="wwc:grid wwc:grid-cols-1 wwc:gap-4 wwc:md:grid-cols-2">
				<div
					className="wwc:rounded-lg wwc:border wwc:border-border wwc:bg-background wwc:p-6 wwc:text-foreground"
					style={THEME_TOKEN_REBINDS}
				>
					<p className="wwc:mb-4 wwc:text-xs wwc:uppercase wwc:tracking-wide wwc:text-muted-foreground">Light</p>
					{children}
				</div>
				<div
					className="dark wwc:rounded-lg wwc:border wwc:border-border wwc:bg-background wwc:p-6 wwc:text-foreground"
					style={THEME_TOKEN_REBINDS}
				>
					<p className="wwc:mb-4 wwc:text-xs wwc:uppercase wwc:tracking-wide wwc:text-muted-foreground">Dark</p>
					{children}
				</div>
			</div>
		</div>
	);
}

function MockDialogSurface({children}: {children: React.ReactNode}) {
	return (
		<div className="wwc:rounded-lg wwc:border wwc:border-border wwc:bg-card wwc:p-5 wwc:text-card-foreground wwc:shadow-md">
			{children}
		</div>
	);
}

export const Example_DialogFooter: Story = {
	name: "Example / Dialog footer",
	parameters: {controls: {disable: true}},
	render: () => (
		<ThemePair label="1. Dialog footer — confirm + cancel">
			<MockDialogSurface>
				<h3 className="wwc:text-base wwc:font-semibold">Save changes?</h3>
				<p className="wwc:mt-1 wwc:text-sm wwc:text-muted-foreground">
					Your edits will be applied to the live document.
				</p>
				<div className="wwc:mt-5 wwc:flex wwc:justify-end wwc:gap-2">
					<Button variant="ghost">Cancel</Button>
					<Button variant="default">Save changes</Button>
				</div>
			</MockDialogSurface>
		</ThemePair>
	),
};

export const Example_DestructiveDialog: Story = {
	name: "Example / Destructive dialog",
	parameters: {controls: {disable: true}},
	render: () => (
		<ThemePair label="2. Destructive confirmation">
			<MockDialogSurface>
				<h3 className="wwc:text-base wwc:font-semibold">Delete project?</h3>
				<p className="wwc:mt-1 wwc:text-sm wwc:text-muted-foreground">This action is permanent and cannot be undone.</p>
				<div className="wwc:mt-5 wwc:flex wwc:justify-end wwc:gap-2">
					<Button variant="ghost">Cancel</Button>
					<Button variant="destructive">
						<Trash2 />
						Delete project
					</Button>
				</div>
			</MockDialogSurface>
		</ThemePair>
	),
};

export const Example_PageHeaderToolbar: Story = {
	name: "Example / Page header toolbar (42px)",
	parameters: {controls: {disable: true}},
	render: () => (
		<ThemePair label="3. Page header — Add / Export ▾ / Filter (42px row)">
			<div
				className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-3 wwc:border-b wwc:border-border wwc:px-4"
				style={{height: 42}}
			>
				<h2 className="wwc:text-sm wwc:font-semibold">Workers</h2>
				<div className="wwc:flex wwc:items-center wwc:gap-2">
					<Button size="sm" variant="default">
						<Plus />
						Add new
					</Button>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button size="sm" variant="outline">
								<Download />
								Export
								<ChevronDown />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem>Export as CSV</DropdownMenuItem>
							<DropdownMenuItem>Export as XLSX</DropdownMenuItem>
							<DropdownMenuItem>Export as PDF</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
					<Button size="sm" icon variant="outline" aria-label="Filter">
						<Filter />
					</Button>
				</div>
			</div>
		</ThemePair>
	),
};

export const Example_TableRowActions: Story = {
	name: "Example / Table row actions",
	parameters: {controls: {disable: true}},
	render: () => (
		<ThemePair label="4. Data table row actions">
			<div className="wwc:divide-y wwc:divide-border wwc:rounded-md wwc:border wwc:border-border">
				{["Crane A1 inspection", "Site 4 perimeter scan", "Forklift 12 maintenance"].map((row) => (
					<div key={row} className="wwc:flex wwc:items-center wwc:justify-between wwc:px-4 wwc:py-3">
						<span className="wwc:text-sm">{row}</span>
						<div className="wwc:flex wwc:items-center wwc:gap-1">
							<Button size="sm" icon variant="ghost" aria-label="Edit">
								<Pencil />
							</Button>
							<Button size="sm" icon variant="ghost" aria-label="Duplicate">
								<Copy />
							</Button>
							<Button size="sm" icon variant="ghost" aria-label="More">
								<MoreHorizontal />
							</Button>
						</div>
					</div>
				))}
			</div>
		</ThemePair>
	),
};

export const Example_FormSubmitRow: Story = {
	name: "Example / Form submit row",
	parameters: {controls: {disable: true}},
	render: () => (
		<ThemePair label="5. Form submit row — primary + loading + cancel">
			<form
				className="wwc:space-y-4"
				onSubmit={(e) => {
					e.preventDefault();
				}}
			>
				<div className="wwc:space-y-2">
					<Label htmlFor="ex-name">Full name</Label>
					<Input id="ex-name" placeholder="Jane Doe" />
				</div>
				<div className="wwc:flex wwc:justify-end wwc:gap-2 wwc:pt-2">
					<Button variant="ghost" type="button">
						Cancel
					</Button>
					<Button variant="default" type="submit" loading>
						Saving…
					</Button>
				</div>
			</form>
		</ThemePair>
	),
};

export const Example_EmptyStateCTA: Story = {
	name: "Example / Empty state CTA",
	parameters: {controls: {disable: true}},
	render: () => (
		<ThemePair label="6. Empty state — single primary CTA">
			<div className="wwc:flex wwc:flex-col wwc:items-center wwc:justify-center wwc:gap-3 wwc:rounded-md wwc:border wwc:border-dashed wwc:border-border wwc:py-10 wwc:text-center">
				<h3 className="wwc:text-base wwc:font-semibold">No reports yet</h3>
				<p className="wwc:max-w-xs wwc:text-sm wwc:text-muted-foreground">
					Generate your first weekly summary to start tracking safety metrics.
				</p>
				<Button size="sm">
					<Plus />
					Create first report
				</Button>
			</div>
		</ThemePair>
	),
};

export const Example_CardFooter: Story = {
	name: "Example / Card footer",
	parameters: {controls: {disable: true}},
	render: () => (
		<ThemePair label="7. Card footer — secondary + primary">
			<Card>
				<CardHeader>
					<CardTitle>Invite a teammate</CardTitle>
					<CardDescription>They'll be added with view-only access.</CardDescription>
				</CardHeader>
				<CardContent>
					<Input placeholder="teammate@company.com" />
				</CardContent>
				<CardFooter className="wwc:justify-end wwc:gap-2">
					<Button variant="ghost">Skip</Button>
					<Button>Send invite</Button>
				</CardFooter>
			</Card>
		</ThemePair>
	),
};

export const Example_InlineLinkActions: Story = {
	name: "Example / Inline link actions",
	parameters: {controls: {disable: true}},
	render: () => (
		<ThemePair label="8. Inline link-style action">
			<div className="wwc:space-y-2">
				<Label htmlFor="ex-pw">Password</Label>
				<Input id="ex-pw" type="password" placeholder="••••••••" />
				<div className="wwc:flex wwc:items-center wwc:justify-between wwc:text-sm">
					<span className="wwc:text-muted-foreground">Trouble signing in?</span>
					<Button variant="link" size="sm">
						Forgot password?
					</Button>
				</div>
			</div>
		</ThemePair>
	),
};

export const Example_IconOnlyToolbarGroup: Story = {
	name: "Example / Icon-only toolbar (group)",
	parameters: {controls: {disable: true}},
	render: () => (
		<ThemePair label="9. Icon-only toolbar — formatting group">
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<ButtonGroup>
					<ButtonGroupItem aria-label="Bold">
						<Bold className="wwc:size-4" />
					</ButtonGroupItem>
					<ButtonGroupItem aria-label="Italic">
						<Italic className="wwc:size-4" />
					</ButtonGroupItem>
					<ButtonGroupItem aria-label="Underline">
						<Underline className="wwc:size-4" />
					</ButtonGroupItem>
				</ButtonGroup>
			</div>
		</ThemePair>
	),
};

export const Example_SegmentedViewSwitcher: Story = {
	name: "Example / Segmented view switcher",
	parameters: {controls: {disable: true}},
	render: () => (
		<ThemePair label="10. Segmented view switcher — List / Grid / Map">
			<ButtonGroup>
				<ButtonGroupItem>
					<LayoutList className="wwc:size-4" />
					List
				</ButtonGroupItem>
				<ButtonGroupItem>
					<Grid3x3 className="wwc:size-4" />
					Grid
				</ButtonGroupItem>
				<ButtonGroupItem>
					<Map className="wwc:size-4" />
					Map
				</ButtonGroupItem>
			</ButtonGroup>
		</ThemePair>
	),
};

const STATE_VARIANTS = ["default", "secondary", "destructive", "outline", "ghost", "link"] as const;

export const Example_StateMatrix: Story = {
	name: "Example / Loading & disabled matrix",
	parameters: {controls: {disable: true}},
	render: () => (
		<ThemePair label="11. State matrix — idle / loading / disabled per variant">
			<div className="wwc:grid wwc:grid-cols-[auto_1fr_1fr_1fr] wwc:items-center wwc:gap-3 wwc:text-sm">
				<span />
				<span className="wwc:text-xs wwc:uppercase wwc:tracking-wide wwc:text-muted-foreground">Idle</span>
				<span className="wwc:text-xs wwc:uppercase wwc:tracking-wide wwc:text-muted-foreground">Loading</span>
				<span className="wwc:text-xs wwc:uppercase wwc:tracking-wide wwc:text-muted-foreground">Disabled</span>
				{STATE_VARIANTS.map((variant) => (
					<React.Fragment key={variant}>
						<span className="wwc:text-xs wwc:capitalize wwc:text-muted-foreground">{variant}</span>
						<Button variant={variant}>Action</Button>
						<Button variant={variant} loading>
							Saving
						</Button>
						<Button variant={variant} disabled>
							Action
						</Button>
					</React.Fragment>
				))}
			</div>
		</ThemePair>
	),
};

export const Example_WithIcons: Story = {
	name: "Example / Leading & trailing icons",
	parameters: {controls: {disable: true}},
	render: () => (
		<ThemePair label="12. Leading and trailing icons">
			<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-3">
				<Button>
					<Plus />
					New item
				</Button>
				<Button variant="secondary">
					<Download />
					Download
				</Button>
				<Button variant="outline">
					Export
					<ChevronDown />
				</Button>
			</div>
		</ThemePair>
	),
};

export const Example_SheetFooter: Story = {
	name: "Example / Sheet / Drawer footer",
	parameters: {controls: {disable: true}},
	render: () => (
		<ThemePair label="13. Side sheet footer">
			<div className="wwc:flex wwc:h-64 wwc:flex-col wwc:rounded-md wwc:border wwc:border-border">
				<div className="wwc:border-b wwc:border-border wwc:px-4 wwc:py-3">
					<h3 className="wwc:text-sm wwc:font-semibold">Edit assignment</h3>
				</div>
				<div className="wwc:flex-1 wwc:px-4 wwc:py-3 wwc:text-sm wwc:text-muted-foreground">Sheet body content…</div>
				<div className="wwc:flex wwc:justify-end wwc:gap-2 wwc:border-t wwc:border-border wwc:px-4 wwc:py-3">
					<Button variant="ghost">Cancel</Button>
					<Button>Apply changes</Button>
				</div>
			</div>
		</ThemePair>
	),
};

export const Example_BannerAction: Story = {
	name: "Example / Banner action",
	parameters: {controls: {disable: true}},
	render: () => (
		<ThemePair label="14. Banner action — info + warning">
			<div className="wwc:space-y-3">
				<Banner
					variant="info"
					title="A new dashboard is available"
					description="Open the redesigned safety overview to see new charts."
					action={{label: "Try it", onClick: () => {}}}
				/>
				<Banner
					variant="warning"
					title="Billing details need attention"
					description="Update your payment method to avoid service interruption."
					action={{label: "Update now", onClick: () => {}}}
				/>
			</div>
		</ThemePair>
	),
};

// Interactive Dialog example — wires Button to the real Dialog component
export const Example_DialogInteractive: Story = {
	name: "Example / Dialog (interactive)",
	parameters: {controls: {disable: true}},
	render: () => (
		<div className="wwc:flex wwc:gap-3">
			<Dialog>
				<DialogTrigger asChild>
					<Button variant="outline">Open dialog</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Save changes?</DialogTitle>
						<DialogDescription>Your edits will be applied to the live document.</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="ghost">Cancel</Button>
						<Button>Save changes</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	),
};
