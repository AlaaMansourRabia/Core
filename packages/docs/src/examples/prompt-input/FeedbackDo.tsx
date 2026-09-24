/**
 * Show loading state during processing.
 */
import {PromptInput} from "@corensystem/coren-ui/prompt-input";

export function FeedbackDo() {
	return (
		<PromptInput
			placeholder="Ask a question..."
			loading
			loadingText="Thinking..."
		/>
	);
}
