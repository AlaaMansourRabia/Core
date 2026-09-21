import {WC3_INSTALLS} from "@wakecap/core-ui/pages/wc3-lineage-data";
import {WC3_PRODUCTS} from "@wakecap/core-ui/pages/wc3-product-data";
import {WC3_PERSONAS} from "@wakecap/core-ui/pages/wc3-product-shared";
import * as React from "react";

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {InstallProductDialog, computeInstallPlan} from "@/components/ui/install-product-dialog";

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

function Example({blocked = false}: {blocked?: boolean}) {
	const [open, setOpen] = React.useState(false);
	const [applied, setApplied] = React.useState<string | null>(null);
	const product = blocked ? BLOCKED : CLEAN;
	return (
		<div className="wwc:space-y-3">
			<Button variant={blocked ? "outline" : "default"} onClick={() => setOpen(true)}>
				{blocked ? "Install as a viewer" : `Install ${product.displayName}`}
			</Button>
			{applied ? <p className="wwc:text-muted-foreground wwc:text-xs">Host received: {applied}</p> : null}
			<InstallProductDialog
				open={open}
				onOpenChange={setOpen}
				product={product}
				mode="install"
				installs={WC3_INSTALLS}
				persona={blocked ? VIEWER : ADMIN}
				onApply={(record) => setApplied(record.id)}
			/>
		</div>
	);
}

export function InstallProductDialogPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">InstallProductDialog</h1>
					<CopyButton
						value="InstallProductDialog"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Four-step governed install over a planner that resolves collisions and blockers before anything is written.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Default</CardTitle>
					<CardDescription>
						A product that genuinely plans without blockers for the admin persona — picked through
						<code> computeInstallPlan</code> rather than guessed, so the caption cannot drift from the demo.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Example />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Blocked</CardTitle>
					<CardDescription>
						A product that genuinely raises blockers for a lesser persona against Prod. You can still reach Apply —
						blockers never stop navigation; the refusal lands there, once, and only the first blocker is toasted. The
						flow is a review surface, not a gate.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Example blocked />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>It mutates nothing</CardTitle>
					<CardDescription>
						<code>onApply</code> hands the host the install record an apply would have written. The host decides whether
						to keep it.
					</CardDescription>
				</CardHeader>
			</Card>
		</div>
	);
}
