/**
 * Avoid cluttered headers with too many actions.
 */
import {CanvasHeader, CanvasHeaderTitle, CanvasHeaderActions} from "@corensystem/coren-ui/canvas-header";
import {Button} from "@corensystem/coren-ui/button";

export function LayoutDont() {
	return (
		<CanvasHeader>
			<CanvasHeaderTitle>Project</CanvasHeaderTitle>
			<CanvasHeaderActions>
				<Button size="sm">Save</Button>
				<Button size="sm">Export</Button>
				<Button size="sm">Share</Button>
				<Button size="sm">Print</Button>
				<Button size="sm">Settings</Button>
				<Button size="sm">Help</Button>
			</CanvasHeaderActions>
		</CanvasHeader>
	);
}
