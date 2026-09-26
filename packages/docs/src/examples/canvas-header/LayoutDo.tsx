/**
 * Keep header actions organized by frequency.
 */
import {CanvasHeader, CanvasHeaderTitle, CanvasHeaderActions} from "@corensystem/coren-ui/canvas-header";
import {Button} from "@corensystem/coren-ui/button";

export function LayoutDo() {
	return (
		<CanvasHeader>
			<CanvasHeaderTitle>Project</CanvasHeaderTitle>
			<CanvasHeaderActions>
				<Button size="sm">Save</Button>
				<Button variant="outline" size="sm">Export</Button>
			</CanvasHeaderActions>
		</CanvasHeader>
	);
}
