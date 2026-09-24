/**
 * Avoid no feedback during processing.
 */
import {PromptInput} from "@corensystem/coren-ui/prompt-input";

export function FeedbackDont() {
	return (
		<PromptInput
			placeholder="Ask a question..."
			disabled
			/* No indication that processing is happening */
		/>
	);
}
