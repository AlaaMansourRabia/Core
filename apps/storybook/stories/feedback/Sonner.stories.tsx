import type {Meta, StoryObj} from "storybook/internal/types";

import {Alert, AlertDescription, AlertTitle} from "@corensystem/core-ui/alert";
import {Button} from "@corensystem/core-ui/button";
import {Toaster, toast} from "@corensystem/core-ui/sonner";

// NOTE: toasts are transient and triggered by interaction, so a static Chromatic snapshot shows the
// TRIGGER, not a floating toast (toasts animate + auto-dismiss — deliberately not snapshotted). Click
// a button in the live Storybook to see the toast.
const meta = {
	title: "Components/Feedback/Sonner",
	component: Toaster,
	tags: ["autodocs"],
	decorators: [
		(Story) => (
			<>
				<Story />
				<Toaster />
			</>
		),
	],
	parameters: {
		docs: {
			description: {
				component:
					"Transient toast notifications (success/error/info/warning) that float in a corner and auto-dismiss. " +
					"**When to use:** brief, non-blocking confirmation of an action that should NOT take permanent page space " +
					'("Settings saved", "Invite sent"). **When NOT to use:** persistent/contextual messages that belong in the ' +
					"page — use `Alert` (inline) or `Banner` (page/section). **Wiring:** mount a single `<Toaster/>` at the app " +
					"root and call `toast()` — both from `@corensystem/core-ui/sonner`. Related: `Alert`, `Banner`, `Toast` (lower-level).",
			},
		},
	},
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ToastTypes: Story = {
	parameters: {
		docs: {description: {story: "The toast variants. Click to fire — each floats in and auto-dismisses."}},
	},
	render: () => (
		<div className="wwc:flex wwc:gap-2 wwc:flex-wrap">
			<Button
				variant="outline"
				onClick={() => toast("Event has been created", {description: "Sunday, December 03, 2023 at 9:00 AM"})}
			>
				Default
			</Button>
			<Button variant="outline" onClick={() => toast.success("Settings saved")}>
				Success
			</Button>
			<Button variant="outline" onClick={() => toast.error("Could not save changes")}>
				Error
			</Button>
			<Button variant="outline" onClick={() => toast.warning("Your session expires in 5 minutes")}>
				Warning
			</Button>
			<Button variant="outline" onClick={() => toast.info("A new version is available")}>
				Info
			</Button>
		</div>
	),
};

export const WithAction: Story = {
	parameters: {
		docs: {description: {story: "A toast with an action (e.g. Undo). Keep actions optional and reversible."}},
	},
	render: () => (
		<Button
			variant="outline"
			onClick={() =>
				toast("Event has been created", {
					description: "Sunday, December 03, 2023 at 9:00 AM",
					action: {label: "Undo", onClick: () => {}},
				})
			}
		>
			Show toast with action
		</Button>
	),
};

export const ToasterSetup: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"**Required wiring.** Mount exactly one `<Toaster/>` near the app root; trigger toasts from anywhere with " +
					"`toast()`. Both come from `@corensystem/core-ui/sonner`. In these stories a decorator mounts the `<Toaster/>` for you.",
			},
		},
	},
	render: () => (
		<div className="wwc:flex wwc:flex-col wwc:gap-3 wwc:max-w-md">
			<pre className="wwc:text-[12px] wwc:bg-muted wwc:rounded-md wwc:p-3 wwc:overflow-x-auto">
				{`// app root (once)
import { Toaster } from "@corensystem/core-ui/sonner";
<Toaster />

// anywhere
import { toast } from "@corensystem/core-ui/sonner";
toast.success("Settings saved");`}
			</pre>
			<Button variant="outline" onClick={() => toast.success("Settings saved")}>
				Fire a toast (Toaster is mounted by the decorator)
			</Button>
		</div>
	),
};

export const CommonMistake: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"**Avoid: mixing toast systems.** `toast()` from `@corensystem/core-ui/sonner` is rendered only by the Sonner " +
					"`<Toaster/>` from the *same* package. Mounting the lower-level Radix `Toaster` (from `@corensystem/core-ui/toaster`) " +
					"while calling Sonner's `toast()` — or forgetting the `<Toaster/>` entirely — means nothing appears. One Sonner " +
					"`<Toaster/>`, one `toast()` import, same package.",
			},
		},
	},
	render: () => (
		<div className="wwc:flex wwc:flex-col wwc:gap-2 wwc:max-w-md wwc:text-sm">
			<p className="wwc:text-destructive">✗ Sonner toast() + the Radix Toaster, or no Toaster → nothing renders.</p>
			<p className="wwc:text-foreground">✓ Sonner toast() + Sonner &lt;Toaster/&gt; (same package).</p>
		</div>
	),
};

export const WhenToUseVsAlert: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"**Decision:** transient + non-blocking → Sonner (left, click to fire). Persistent + contextual, stays on the " +
					"page → `Alert` (right). If the user must be able to re-read it later, it is not a toast.",
			},
		},
	},
	render: () => (
		<div className="wwc:flex wwc:gap-6 wwc:items-start wwc:flex-wrap">
			<div className="wwc:flex wwc:flex-col wwc:gap-2">
				<span className="wwc:text-xs wwc:text-muted-foreground">Transient → Sonner</span>
				<Button variant="outline" onClick={() => toast.success("Settings saved")}>
					Save settings
				</Button>
			</div>
			<div className="wwc:flex wwc:flex-col wwc:gap-2 wwc:max-w-sm">
				<span className="wwc:text-xs wwc:text-muted-foreground">Persistent → Alert</span>
				<Alert>
					<AlertTitle>Verification required</AlertTitle>
					<AlertDescription>Confirm your email to enable exports. This stays until resolved.</AlertDescription>
				</Alert>
			</div>
		</div>
	),
};
