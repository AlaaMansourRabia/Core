import {Button} from "@corensystem/coren-ui/button";
/**
 * Overlay with loading spinner.
 */
import {Overlay, OverlayContent} from "@corensystem/coren-ui/overlay";
import {Spinner} from "@corensystem/coren-ui/spinner";
import {useState} from "react";

export function Loading() {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button onClick={() => setOpen(true)}>Show Loading</Button>
			<Overlay open={open}>
				<OverlayContent>
					<div className="wwc:flex wwc:flex-col wwc:items-center wwc:gap-4">
						<Spinner size="lg" />
						<p className="wwc:text-white">Loading...</p>
					</div>
				</OverlayContent>
			</Overlay>
		</>
	);
}
