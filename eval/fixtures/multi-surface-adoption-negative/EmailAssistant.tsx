import {ArrowLeft, Button, CoreAiChat, PromptInput} from "@corensystem/core-ui";

export function EmailAssistant() {
	return (
		<main data-core-region="email-assistant">
			<Button onClick={() => window.location.assign("/")}>
				<ArrowLeft /> Back
			</Button>
			<CoreAiChat />
			<PromptInput placeholder="Ask your agent to update itself" />
		</main>
	);
}
