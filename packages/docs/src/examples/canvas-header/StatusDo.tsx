/**
 * Show clear save status.
 */
import {CanvasHeader, CanvasHeaderTitle, CanvasHeaderStatus} from "@corensystem/coren-ui/canvas-header";

export function StatusDo() {
	return (
		<CanvasHeader>
			<CanvasHeaderTitle>Document</CanvasHeaderTitle>
			<CanvasHeaderStatus status="saving">Saving...</CanvasHeaderStatus>
		</CanvasHeader>
	);
}
