import {useState} from "react";

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {WalkthroughModal} from "@/components/ui/walkthrough-modal";

export function WalkthroughModalPage() {
	const [open, setOpen] = useState(false);

	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Walkthrough Modal</h1>
					<CopyButton
						value="Walkthrough Modal"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2 wwc:max-w-2xl">
					The capture walkthrough: a large, edge-to-edge{" "}
					<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">Map Compare Layout</code> (with the session
					timeline) shown in a dialog. Opened from a capture point to compare that capture against another session. The
					header is a single compact title; the map fills the dialog flush to every edge.
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Open the walkthrough</CardTitle>
						<CopyButton
							value="Walkthrough Modal - Open"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Launch the modal, then activate a compare mode (side-by-side or swipe) and scrub the two dates from the
						session timeline at the bottom.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button type="button" onClick={() => setOpen(true)}>
						Open walkthrough
					</Button>
				</CardContent>
			</Card>

			<WalkthroughModal open={open} onOpenChange={setOpen} title="Capture 2 of 17 · Ground Floor · 10:05" />
		</div>
	);
}
