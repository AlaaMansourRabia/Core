import {Button} from "@corensystem/coren-ui/button";
/**
 * Basic overlay backdrop.
 */
import {Overlay} from "@corensystem/coren-ui/overlay";
import {useState} from "react";

export function Default() {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button onClick={() => setOpen(true)}>Show Overlay</Button>
			<Overlay open={open} onClose={() => setOpen(false)} />
		</>
	);
}
