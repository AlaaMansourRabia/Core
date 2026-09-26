/**
 * Toggle button sizes.
 */
import {Toggle} from "@corensystem/coren-ui/toggle";
import {Underline} from "lucide-react";

export function Sizes() {
	return (
		<div className="wwc:flex wwc:items-center wwc:gap-3">
			<Toggle size="sm" aria-label="Small">
				<Underline className="wwc:size-3" />
			</Toggle>
			<Toggle size="default" aria-label="Default">
				<Underline className="wwc:size-4" />
			</Toggle>
			<Toggle size="lg" aria-label="Large">
				<Underline className="wwc:size-5" />
			</Toggle>
		</div>
	);
}
