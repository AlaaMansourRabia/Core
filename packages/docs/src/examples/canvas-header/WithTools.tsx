/**
 * Canvas header with tool buttons.
 */
import {CanvasHeader, CanvasHeaderTitle, CanvasHeaderTools} from "@corensystem/coren-ui/canvas-header";
import {Button} from "@corensystem/coren-ui/button";
import {MousePointer2, Square, Circle, Type} from "lucide-react";

export function WithTools() {
	return (
		<CanvasHeader>
			<CanvasHeaderTitle>Design Canvas</CanvasHeaderTitle>
			<CanvasHeaderTools>
				<Button variant="ghost" size="icon"><MousePointer2 className="wwc:h-4 wwc:w-4" /></Button>
				<Button variant="ghost" size="icon"><Square className="wwc:h-4 wwc:w-4" /></Button>
				<Button variant="ghost" size="icon"><Circle className="wwc:h-4 wwc:w-4" /></Button>
				<Button variant="ghost" size="icon"><Type className="wwc:h-4 wwc:w-4" /></Button>
			</CanvasHeaderTools>
		</CanvasHeader>
	);
}
