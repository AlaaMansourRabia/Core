/**
 * Overlay with centered content.
 */
import {Overlay, OverlayContent} from "@corensystem/coren-ui/overlay";
import {Button} from "@corensystem/coren-ui/button";
import {useState} from "react";

export function WithContent() {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button onClick={() => setOpen(true)}>Show Overlay</Button>
			<Overlay open={open} onClose={() => setOpen(false)}>
				<OverlayContent>
					<div className="wwc:bg-background wwc:p-6 wwc:rounded-lg">
						<h2 className="wwc:text-lg wwc:font-semibold">Overlay Content</h2>
						<p className="wwc:text-muted-foreground">This content appears over the overlay.</p>
						<Button className="wwc:mt-4" onClick={() => setOpen(false)}>Close</Button>
					</div>
				</OverlayContent>
			</Overlay>
		</>
	);
}
