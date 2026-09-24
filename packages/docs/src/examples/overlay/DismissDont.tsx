/**
 * Avoid trapping users without escape.
 */
import {Overlay, OverlayContent} from "@corensystem/coren-ui/overlay";
import {Button} from "@corensystem/coren-ui/button";
import {useState} from "react";

export function DismissDont() {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button onClick={() => setOpen(true)}>Open</Button>
			<Overlay open={open} closeOnClick={false} closeOnEscape={false}>
				<OverlayContent>
					<p className="wwc:text-white">No way to close this!</p>
				</OverlayContent>
			</Overlay>
		</>
	);
}
