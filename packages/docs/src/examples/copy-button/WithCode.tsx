/**
 * Copy button paired with a code block.
 */
import {Code} from "@corensystem/coren-ui/code";
import {CopyButton} from "@corensystem/coren-ui/copy-button";

export function WithCode() {
	const code = "npm install @corensystem/coren-ui";
	return (
		<div className="wwc:flex wwc:items-center wwc:gap-2 wwc:rounded-md wwc:bg-muted wwc:px-3 wwc:py-2">
			<Code className="wwc:bg-transparent">{code}</Code>
			<CopyButton value={code} />
		</div>
	);
}
