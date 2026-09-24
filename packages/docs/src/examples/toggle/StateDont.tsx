/**
 * Avoid toggles that look the same in both states.
 */
import {Toggle} from "@corensystem/coren-ui/toggle";
import {Circle} from "lucide-react";

export function StateDont() {
	return (
		<div className="wwc:flex wwc:gap-3">
			<Toggle aria-label="Option" pressed={false}>
				<Circle className="wwc:size-4" />
			</Toggle>
			<Toggle aria-label="Option" pressed>
				<Circle className="wwc:size-4" />
			</Toggle>
		</div>
	);
}
