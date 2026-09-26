import {Button} from "@corensystem/coren-ui/button";
/**
 * Default canvas header for design tools.
 */
import {CanvasHeader, CanvasHeaderTitle, CanvasHeaderActions} from "@corensystem/coren-ui/canvas-header";

export function Default() {
	return (
		<CanvasHeader>
			<CanvasHeaderTitle>Untitled Design</CanvasHeaderTitle>
			<CanvasHeaderActions>
				<Button variant="outline" size="sm">
					Share
				</Button>
				<Button size="sm">Export</Button>
			</CanvasHeaderActions>
		</CanvasHeader>
	);
}
