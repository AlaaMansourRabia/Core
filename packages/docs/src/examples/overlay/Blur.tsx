import {Button} from "@corensystem/coren-ui/button";
/**
 * Overlay with blur effect.
 */
import {Overlay} from "@corensystem/coren-ui/overlay";
import {useState} from "react";

export function Blur() {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button onClick={() => setOpen(true)}>Show Blur Overlay</Button>
			<Overlay open={open} onClose={() => setOpen(false)} blur />
		</>
	);
}
