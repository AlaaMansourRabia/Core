import {Button} from "@corensystem/coren-ui/button";
/**
 * Ensure content is readable.
 */
import {Overlay, OverlayContent} from "@corensystem/coren-ui/overlay";
import {useState} from "react";

export function ContrastDo() {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button onClick={() => setOpen(true)}>Open</Button>
			<Overlay open={open} onClose={() => setOpen(false)}>
				<OverlayContent>
					<div className="wwc:bg-background wwc:p-4 wwc:rounded">
						<p className="wwc:text-foreground">High contrast content</p>
					</div>
				</OverlayContent>
			</Overlay>
		</>
	);
}
