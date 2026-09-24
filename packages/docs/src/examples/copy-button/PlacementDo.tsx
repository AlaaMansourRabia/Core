/**
 * Place copy button near the content being copied.
 */
import {Code} from "@corensystem/coren-ui/code";
import {CopyButton} from "@corensystem/coren-ui/copy-button";

export function PlacementDo() {
	const code = "API_KEY=abc123";
	return (
		<div className="wwc:flex wwc:items-center wwc:gap-2">
			<Code>{code}</Code>
			<CopyButton value={code} />
		</div>
	);
}
