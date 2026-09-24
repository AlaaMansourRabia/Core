/**
 * Trap focus within overlay.
 */
import {Overlay, OverlayContent} from "@corensystem/coren-ui/overlay";
import {Button} from "@corensystem/coren-ui/button";
import {useState} from "react";

export function FocusDo() {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button onClick={() => setOpen(true)}>Open</Button>
			<Overlay open={open} onClose={() => setOpen(false)} trapFocus>
				<OverlayContent>
					<div className="wwc:bg-background wwc:p-4 wwc:rounded wwc:space-y-2">
						<Button>Action 1</Button>
						<Button>Action 2</Button>
						<Button onClick={() => setOpen(false)}>Close</Button>
					</div>
				</OverlayContent>
			</Overlay>
		</>
	);
}
