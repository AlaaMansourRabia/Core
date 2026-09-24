/**
 * Use clear visual feedback for toggle states.
 */
import {Toggle} from "@corensystem/coren-ui/toggle";
import {Bookmark} from "lucide-react";

export function StateDo() {
	return (
		<div className="wwc:flex wwc:gap-3">
			<Toggle aria-label="Bookmark" pressed={false}>
				<Bookmark className="wwc:size-4" />
			</Toggle>
			<Toggle aria-label="Bookmark" pressed>
				<Bookmark className="wwc:size-4 wwc:fill-current" />
			</Toggle>
		</div>
	);
}
