/**
 * Allow dismissing overlay.
 */
import {Overlay, OverlayContent} from "@corensystem/coren-ui/overlay";
import {Button} from "@corensystem/coren-ui/button";
import {useState} from "react";

export function DismissDo() {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button onClick={() => setOpen(true)}>Open</Button>
			<Overlay open={open} onClose={() => setOpen(false)} closeOnClick>
				<OverlayContent>
					<p className="wwc:text-white">Click outside to dismiss</p>
				</OverlayContent>
			</Overlay>
		</>
	);
}
