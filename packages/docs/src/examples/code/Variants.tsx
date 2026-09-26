/**
 * Code variants: default and outline.
 */
import {Code} from "@corensystem/coren-ui/code";

export function Variants() {
	return (
		<div className="wwc:flex wwc:items-center wwc:gap-4">
			<Code variant="default">default</Code>
			<Code variant="outline">outline</Code>
		</div>
	);
}
