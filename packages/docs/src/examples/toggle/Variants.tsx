/**
 * Toggle button variants.
 */
import {Toggle} from "@corensystem/coren-ui/toggle";
import {Italic} from "lucide-react";

export function Variants() {
	return (
		<div className="wwc:flex wwc:gap-3">
			<Toggle variant="default" aria-label="Default">
				<Italic className="wwc:size-4" />
			</Toggle>
			<Toggle variant="outline" aria-label="Outline">
				<Italic className="wwc:size-4" />
			</Toggle>
		</div>
	);
}
