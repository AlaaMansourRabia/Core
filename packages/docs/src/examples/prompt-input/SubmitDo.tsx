/**
 * Clear submit affordance.
 */
import {PromptInput} from "@corensystem/coren-ui/prompt-input";

export function SubmitDo() {
	return (
		<PromptInput
			placeholder="Type a message..."
			showSubmitButton
			submitLabel="Send"
		/>
	);
}
