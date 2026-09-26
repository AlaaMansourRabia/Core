import {Button} from "@corensystem/coren-ui/button";
/**
 * Prompt input with action buttons.
 */
import {PromptInput, PromptInputActions} from "@corensystem/coren-ui/prompt-input";
import {Paperclip, Mic} from "lucide-react";

export function WithActions() {
	return (
		<PromptInput placeholder="Ask anything...">
			<PromptInputActions>
				<Button variant="ghost" size="icon">
					<Paperclip className="wwc:h-4 wwc:w-4" />
				</Button>
				<Button variant="ghost" size="icon">
					<Mic className="wwc:h-4 wwc:w-4" />
				</Button>
			</PromptInputActions>
		</PromptInput>
	);
}
