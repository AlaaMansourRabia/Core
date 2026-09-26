/**
 * Avoid hidden submit interactions.
 */
import {PromptInput} from "@corensystem/coren-ui/prompt-input";

export function SubmitDont() {
	return (
		<PromptInput
			placeholder="Type a message..."
			/* No visible submit button, only Enter key */
		/>
	);
}
