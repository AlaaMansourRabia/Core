/**
 * Use clear, action-oriented labels that describe what happens.
 */
import {Button} from "@corensystem/coren-ui/button";
import {Trash2} from "lucide-react";

export function LabelDo() {
	return (
		<div className="wwc:flex wwc:gap-3">
			<Button variant="destructive">
				<Trash2 className="wwc:size-4" />
				Delete Project
			</Button>
		</div>
	);
}
