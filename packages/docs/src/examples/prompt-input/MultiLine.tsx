/**
 * Expandable multi-line prompt input.
 */
import {PromptInput} from "@corensystem/coren-ui/prompt-input";

export function MultiLine() {
	return (
		<PromptInput
			placeholder="Enter your prompt (Shift+Enter for new line)..."
			multiLine
			maxRows={5}
		/>
	);
}
