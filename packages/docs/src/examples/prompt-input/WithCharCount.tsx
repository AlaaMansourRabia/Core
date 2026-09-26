/**
 * Prompt input with character limit.
 */
import {PromptInput} from "@corensystem/coren-ui/prompt-input";

export function WithCharCount() {
	return <PromptInput placeholder="Type your message..." maxLength={500} showCharCount />;
}
