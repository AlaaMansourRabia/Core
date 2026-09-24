import {WC3_ACTION_TYPES} from "@corensystem/coren-ui/pages/wc3-ontology-data";
import * as React from "react";

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {RunActionDialog} from "@/components/ui/run-action-dialog";

const ACTION = WC3_ACTION_TYPES[0] ?? null;

function Example({viewer = false}: {viewer?: boolean}) {
	const [open, setOpen] = React.useState(false);
	return (
		<>
			<Button variant={viewer ? "outline" : "default"} onClick={() => setOpen(true)}>
				{viewer ? "Run as a viewer" : "Run action"}
			</Button>
			<RunActionDialog
				open={open}
				onOpenChange={setOpen}
				actionType={ACTION}
				{...(viewer ? {actingUser: {name: "Site Viewer", groups: []}} : {})}
			/>
		</>
	);
}

export function RunActionDialogPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">RunActionDialog</h1>
					<CopyButton
						value="RunActionDialog"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Execute a typed ontology action, gated on the acting user's groups.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Default</CardTitle>
					<CardDescription>
						The parameter form is generated from the action type. Static defaults apply on open;
						<code> fromObjectProperty</code> defaults refill when their source parameter changes.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Example />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Not permitted</CardTitle>
					<CardDescription>
						The run is gated on the acting user's groups rather than trusted — the form is reachable, the run is not.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Example viewer />
				</CardContent>
			</Card>
		</div>
	);
}
