/**
 * Avoid low contrast content.
 */
import {Overlay, OverlayContent} from "@corensystem/coren-ui/overlay";
import {Button} from "@corensystem/coren-ui/button";
import {useState} from "react";

export function ContrastDont() {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button onClick={() => setOpen(true)}>Open</Button>
			<Overlay open={open} onClose={() => setOpen(false)} opacity={0.3}>
				<OverlayContent>
					<p className="wwc:text-gray-400">Hard to read text</p>
				</OverlayContent>
			</Overlay>
		</>
	);
}
