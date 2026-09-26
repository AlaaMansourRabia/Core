/**
 * Avoid placing copy button far from the content.
 */
import {Code} from "@corensystem/coren-ui/code";
import {CopyButton} from "@corensystem/coren-ui/copy-button";

export function PlacementDont() {
	const code = "API_KEY=abc123";
	return (
		<div className="wwc:flex wwc:items-center wwc:justify-between wwc:w-[300px]">
			<Code>{code}</Code>
			<CopyButton value={code} />
		</div>
	);
}
