/**
 * Avoid ambiguous status indicators.
 */
import {CanvasHeader, CanvasHeaderTitle} from "@corensystem/coren-ui/canvas-header";

export function StatusDont() {
	return (
		<CanvasHeader>
			<CanvasHeaderTitle>Document *</CanvasHeaderTitle>
		</CanvasHeader>
	);
}
