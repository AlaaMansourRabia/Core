/**
 * Basic prompt input for chat/AI interfaces.
 */
import {PromptInput} from "@corensystem/coren-ui/prompt-input";

export function Default() {
	return (
		<PromptInput
			placeholder="Type a message..."
			onSubmit={(value) => console.log("Submitted:", value)}
		/>
	);
}
