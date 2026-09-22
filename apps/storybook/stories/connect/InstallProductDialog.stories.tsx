import type {Meta, StoryObj} from "storybook/internal/types";

import {Button} from "@core/core-ui/button";
import {InstallProductDialog, computeInstallPlan} from "@core/core-ui/pages/install-product-dialog";
import {WC3_INSTALLS} from "@core/core-ui/pages/wc3-lineage-data";
import {WC3_PRODUCTS} from "@core/core-ui/pages/wc3-product-data";
import {WC3_PERSONAS} from "@core/core-ui/pages/wc3-product-shared";
import {useState} from "react";

const ADMIN = WC3_PERSONAS[0];
const VIEWER = WC3_PERSONAS[WC3_PERSONAS.length - 1] ?? ADMIN;

/**
 * Pick the demo products through the real planner rather than by guessing, and judge them against
 * **Prod** — the environment the dialog actually opens on. Checking a different environment than the
 * one on screen is how a caption drifts away from its demo.
 */
const CLEAN =
	WC3_PRODUCTS.find((p) => computeInstallPlan(p, "Prod", ADMIN, WC3_INSTALLS).blockers.length === 0) ?? WC3_PRODUCTS[0];
const BLOCKED =
	WC3_PRODUCTS.find((p) => computeInstallPlan(p, "Prod", VIEWER, WC3_INSTALLS).blockers.length > 0) ?? WC3_PRODUCTS[0];

const meta = {
	title: "Widgets/Connect/Install Product Dialog",
	component: InstallProductDialog,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"Four-step governed install: Draft → Plan → Release evidence → Apply, over a planner that resolves adds, object and name collisions, and six blocker codes (`permission`, `dependency`, `linked`, `installed`, `readiness`, `noop`) before anything is written. Two things are deliberate and easy to mistake for bugs. **Blockers never stop navigation** — you can plan, fill evidence and reach Apply with refusals visible; the block is enforced exactly once, when Apply is pressed, and only the *first* blocker is toasted. The flow is a review surface, not a gate. And the dialog **mutates nothing**: `onApply` hands the host the install record an apply would have written, and the host decides whether to keep it.",
			},
		},
	},
} satisfies Meta<typeof InstallProductDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A product that genuinely plans without blockers for the admin persona, picked via computeInstallPlan. */
export const Default: Story = {
	render: () => {
		const [open, setOpen] = useState(false);
		const [applied, setApplied] = useState<string | null>(null);
		return (
			<div className="wwc:space-y-3 wwc:text-center">
				<Button onClick={() => setOpen(true)}>Install {CLEAN.displayName}</Button>
				{applied ? <p className="wwc:text-xs wwc:text-muted-foreground">Host received: {applied}</p> : null}
				<InstallProductDialog
					open={open}
					onOpenChange={setOpen}
					product={CLEAN}
					mode="install"
					installs={WC3_INSTALLS}
					persona={ADMIN}
					onApply={(record) => setApplied(record.id)}
				/>
			</div>
		);
	},
};

/**
 * A product that genuinely raises blockers for a lesser persona against Prod. Note that you can still
 * reach Apply — blockers never stop navigation; the refusal lands there, once.
 */
export const Blocked: Story = {
	render: () => {
		const [open, setOpen] = useState(false);
		return (
			<>
				<Button variant="outline" onClick={() => setOpen(true)}>
					Install as a viewer
				</Button>
				<InstallProductDialog
					open={open}
					onOpenChange={setOpen}
					product={BLOCKED}
					mode="install"
					installs={WC3_INSTALLS}
					persona={VIEWER}
					onApply={() => {}}
				/>
			</>
		);
	},
};
